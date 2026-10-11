"""Local original score/SFX and a voice mix. No cloud music or asset downloads."""
import json
import subprocess
import wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs/show/recordings/pit-proof"
AUDIO = OUT / "audio"
RATE, DURATION = 48000, 40
edit = json.loads(subprocess.check_output([
    "node", "--input-type=module", "-e",
    "import {VOICES,DURATION} from './web/show/src/pit-edit.js'; console.log(JSON.stringify({voices:VOICES,duration:DURATION}));"
], cwd=ROOT))
assert edit["duration"] == DURATION


def write_wav(path, samples):
    with wave.open(str(path), "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes((np.clip(samples, -.98, .98) * 32767).astype("<i2").tobytes())


def add(track, at, samples, pan=0):
    start = round(at * RATE)
    size = min(len(samples), len(track) - start)
    if size <= 0:
        return
    track[start:start+size, 0] += samples[:size] * (1 - max(0, pan))
    track[start:start+size, 1] += samples[:size] * (1 + min(0, pan))


n = RATE * DURATION
t = np.arange(n) / RATE
rng = np.random.default_rng(25)
music = np.zeros((n, 2), np.float64)
sfx = np.zeros_like(music)
voices = np.zeros_like(music)
voice_metadata = []
for voice in edit["voices"]:
    name = voice["id"]
    stable = AUDIO / (name + ".mp3")
    pcm = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(stable), "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-"
    ])
    data = np.frombuffer(pcm, "<f4").astype(np.float64)
    assert abs(len(data) / RATE - voice["duration"]) < .04, f"Voice timing changed: {name}"
    # Equalize clip loudness by speech RMS, then cap peaks before summing.
    active = data[np.abs(data) > .012]
    rms = np.sqrt(np.mean(active**2)) if len(active) else .1
    data *= min(3, .14 / max(rms, .02))
    data = np.clip(data, -.65, .65)
    add(voices, voice["start"], data)
    voice_metadata.append({"id": name, "start": voice["start"], "duration": len(data) / RATE, "file": str(stable)})

# A restrained original tension pulse with a midrange notch left for speech.
for at in np.arange(.1, 26.4, .49):
    u = np.arange(round(.44 * RATE)) / RATE
    intensity = .04 + .025 * at / 26.4
    pulse = intensity * np.sin(2*np.pi*(55*u + 4*(1-np.exp(-u*20)))) * np.exp(-u*11)
    add(music, at, pulse)
drone = .018*(np.sin(2*np.pi*55*t)+.45*np.sin(2*np.pi*82.4*t))
drone *= np.minimum(1,t/1.5) * np.clip((26.4-t)/.5,0,1)
music[:, 0] += drone
music[:, 1] += drone
for at, freq in [(33.9,220),(35.2,196),(36.5,164.8),(37.6,146.8)]:
    u=np.arange(round(2.2*RATE))/RATE
    add(music,at,.032*np.sin(2*np.pi*freq*u)*np.minimum(1,u/.1)*np.exp(-u*1.4))

# Duck and spectrally reserve the bed under every spoken clip.
for meta in voice_metadata:
    first=max(0,round((meta["start"]-.08)*RATE))
    last=min(n,round((meta["start"]+meta["duration"]+.15)*RATE))
    music[first:last] *= .38
music[round(26.4*RATE):round(33.7*RATE)] = 0

# Water ambience: filtered noise, local splashes, foot contact and the final sub hit.
noise = rng.normal(0,1,n)
water = np.convolve(noise,np.ones(22)/22,mode="same")*.008
add(sfx,0,water,-.1)
for at in [.2,.7,1.3,1.8,2.4,2.9]:
    u=np.arange(round(.3*RATE))/RATE
    splash=np.convolve(rng.normal(0,1,len(u)),np.ones(8)/8,mode="same")*.065*np.exp(-u*16)
    add(sfx,at,splash,(-.2 if at<1.1 else .2))
for at in [28.75,29.1,29.45,29.8]:
    u=np.arange(round(.16*RATE))/RATE
    step=.047*np.sin(2*np.pi*95*u)*np.exp(-u*27)
    add(sfx,at,step,.35)
u=np.arange(round(1.4*RATE))/RATE
sinking=.055*np.sin(2*np.pi*(100*u-21*u*u))*np.exp(-u*2.5)
add(sfx,30.7,sinking)
for at in [31.35,31.9,32.5]:
    u=np.arange(round(.19*RATE))/RATE
    add(sfx,at,.025*np.sin(2*np.pi*(260*u+200*u*u))*np.exp(-u*19))
mix = voices + music + sfx
peak=float(np.max(np.abs(mix)))
if peak>.92:
    mix *= .92/peak
mix[-RATE:] *= np.linspace(1,0,RATE)[:,None]
write_wav(AUDIO/"music.wav",music)
write_wav(AUDIO/"sound-effects.wav",sfx)
write_wav(AUDIO/"voices.wav",voices)
write_wav(AUDIO/"mix.wav",mix)
manifest={"duration":DURATION,"rate":RATE,"voices":voice_metadata,"peak_before_final_normalization":peak,"peak_after_mix_limiting":float(np.max(np.abs(mix))),"music":"original locally synthesized tension score","effects":"original water, footsteps and sink sound design","music_silence":[26.4,33.7]}
(OUT/"audio-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
print(json.dumps(manifest,indent=2))
