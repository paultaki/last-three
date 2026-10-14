"""Mix measured voices with an original local score, at the exact frame origin."""
import os
import json
import hashlib
import subprocess
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(os.environ.get('LAST_THREE_OUTPUT', ROOT / 'docs/show/recordings/episode-v1'))
AUDIO = OUT / 'audio'
edit = json.loads((OUT / 'timing.json').read_text())
RATE = 48000
frames = int(np.ceil(edit['duration'] * edit['fps']))
duration = frames / edit['fps']
n = round(duration * RATE)
rng = np.random.default_rng(20261009)
voices = np.zeros((n, 2), np.float32)
music = np.zeros_like(voices)
effects = np.zeros_like(voices)
metadata = []


def add(track, at, samples, pan=0):
    start = round(at * RATE)
    assert start >= 0
    size = min(len(samples), len(track) - start)
    if size > 0:
        track[start:start+size, 0] += samples[:size] * (1-max(0, pan))
        track[start:start+size, 1] += samples[:size] * (1+min(0, pan))


def tone(length, frequency, gain, decay):
    u = np.arange(round(length*RATE)) / RATE
    return (gain*np.sin(2*np.pi*frequency*u)*np.exp(-u*decay)).astype(np.float32)


def noise(length, gain, decay, smooth=10):
    u = np.arange(round(length*RATE)) / RATE
    return (np.convolve(rng.normal(0, 1, len(u)), np.ones(smooth)/smooth, 'same')
            * gain*np.exp(-u*decay)).astype(np.float32)


for b in edit['beats']:
    if not b.get('text'):
        continue
    source = AUDIO / (b['id']+'.mp3')
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-xerror', '-i', str(source),
                                   '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-'])
    raw_length = len(raw)/4/RATE
    assert abs(raw_length-b['rawDuration']) < .05, f"Changed source voice: {b['id']}"
    pcm = subprocess.check_output(['ffmpeg', '-v', 'error', '-xerror', '-i', str(source),
                                   '-af', f"atempo={b['voiceRate']}",
                                   '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-'])
    data = np.frombuffer(pcm, '<f4').copy()
    measured = len(data)/RATE
    assert abs(measured-b['voiceDuration']) < 1/RATE, f"Tempo drift: {b['id']}"
    # The timeline measures the complete processed PCM. Retain every sample.
    active = data[np.abs(data) > .012]
    rms = np.sqrt(np.mean(active**2)) if len(active) else .1
    gain = .115 if b['mode'] in ('thought', 'whisper') else .145
    data *= min(3, gain/max(rms, .02))
    data = np.clip(data, -.65, .65)
    fade = min(240, len(data)//2)
    data[:fade] *= np.linspace(0, 1, fade)
    data[-fade:] *= np.linspace(1, 0, fade)
    add(voices, b['voiceStart'], data)
    metadata.append({'id': b['id'], 'start': b['voiceStart'], 'end': b['voiceEnd'],
                     'source_seconds': raw_length, 'tempo': b['voiceRate'],
                     'decoded_seconds': measured, 'planned_seconds': b['voiceDuration']})

# Bass and sparse upper notes leave the dialogue's midrange clear.
for b in edit['beats']:
    length = b['end']-b['start']
    stage_gain = .045 if b['kind'] in ('action', 'death') else .029
    if not b.get('silence'):
        for at in np.arange(b['start'], b['end']-.12, .43):
            add(music, at, tone(min(.39, b['end']-at), 55, stage_gain, 12))
        u = np.arange(round(length*RATE))/RATE
        envelope = np.minimum(1, u/.12)*np.minimum(1, (length-u)/.15)
        bed = (.009*np.sin(2*np.pi*55*u)+.004*np.sin(2*np.pi*82.4*u))*envelope
        add(music, b['start'], bed.astype(np.float32))
    if b['id'].startswith(('climb-', 'bex-')) or b['id'] in ('pit-rule', 'unused-rope'):
        add(effects, b['start'], noise(length, .011, 0, 24), -.1)
    if b['kind'] == 'death' and b['id'] not in ('ash-death', 'eli-death'):
        add(effects, b['start']+.12, tone(.8, 48, .12, 4))
        add(effects, b['start']+.2, noise(.6, .11, 8, 5))
    if b['kind'] == 'action':
        add(effects, b['start']+.18, noise(.17, .055, 14, 4))
    if b['id'] == 'cole-death':
        add(effects, b['start']+.24, noise(.8, .1, 7, 2))
    if b['id'] == 'hana-dive':
        add(effects, b['end']-.45, tone(.6, 65, .12, 9))
    if b['id'] == 'shrink':
        add(effects, b['start']+b['voiceDuration']*.48, tone(.9, 72, .065, 3))
    if b['id'] == 'disc-open':
        add(effects, b['start']+.2, tone(.5, 90, .1, 8))
    if b['id'] == 'bex-sink':
        for at in np.arange(b['start']+.6, b['end'], .5):
            add(effects, at, noise(.3, .06, 7, 20))
    if b['id'] == 'winner':
        for i, freq in enumerate((146.8, 196, 220, 293.7)):
            add(music, b['start']+i*.35, tone(2.2, freq, .03, 1.5))

for v in metadata:
    first = max(0, round((v['start']-.06)*RATE))
    last = min(n, round((v['end']+.08)*RATE))
    music[first:last] *= .35
mix = voices+music+effects
peak = float(np.max(np.abs(mix)))
if peak > .92:
    mix *= .92/peak
mix[-RATE:] *= np.linspace(1, 0, RATE)[:, None]
for name, samples in [('voices', voices), ('music', music), ('effects', effects), ('mix', mix)]:
    with wave.open(str(AUDIO/(name+'.wav')), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(RATE)
        f.writeframes((np.clip(samples, -.98, .98)*32767).astype('<i2').tobytes())
report = {'duration': duration, 'fps': edit['fps'], 'frames': frames, 'sample_rate': RATE,
          'timing_hash': hashlib.sha256((OUT/'timing.json').read_bytes()).hexdigest(),
          'mix_hash': hashlib.sha256((AUDIO/'mix.wav').read_bytes()).hexdigest(),
          'voices': metadata, 'peak_before_limiting': peak, 'peak_after_limiting': float(np.max(np.abs(mix))),
          'score': 'Original local synthesis', 'silence_beats': [b['id'] for b in edit['beats'] if b.get('silence')]}
(OUT/'audio-manifest.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({'duration': duration, 'voices': len(metadata), 'peak': report['peak_after_limiting']}))
