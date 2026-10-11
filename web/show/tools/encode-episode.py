"""Validate the offline capture, encode, and verify both complete video exports."""
import json
import hashlib
import subprocess
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(os.environ.get('LAST_THREE_OUTPUT', ROOT/'docs/show/recordings/episode-v1'))
(OUT/'delivery.json').unlink(missing_ok=True)
capture = json.loads((OUT/'capture.json').read_text())
audio = json.loads((OUT/'audio-manifest.json').read_text())
timing = (OUT/'timing.json').read_bytes()
assert timing == (ROOT/'web/show/assets/episode/timing.json').read_bytes(), 'Runtime/edit mismatch'
assert hashlib.sha256(timing).hexdigest() == audio['timing_hash'], 'Stale soundtrack timing'
assert capture['timingHash'] == audio['timing_hash'], 'Stale captured video timing'
for path in ['web/show/dist/episode.js', 'web/show/episode.html', 'web/show/assets/episode/motion.json'] + [f'web/show/assets/logos/{name}.svg' for name in ['claude','deepseek','glm','grok','gemini','kimi','qwen','gpt']]:
    assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest() == capture['visualInputs'][path], 'Stale visual capture: '+path
assert hashlib.sha256((OUT/'audio/mix.wav').read_bytes()).hexdigest() == audio['mix_hash'], 'Changed soundtrack'
assert not capture['errors'], capture['errors']
assert not capture['frameIssues'], capture['frameIssues']
assert not any(p['blockedHeads'] for p in capture['proof'])
assert len(capture['determinism']) == 7
assert capture['determinismType'] == 'exact-canvas-pixels-and-overlay-DOM'
assert sum(r['captured'] for r in capture['frameRanges']) == capture['frameCount']
next_frame = 0
for r in capture['frameRanges']:
    assert r['start'] == next_frame and r['end'] - r['start'] == r['captured'], 'Invalid frame range'
    next_frame = r['end']
assert next_frame == capture['frameCount']
assert capture['fps'] == 25
assert capture['frameCount'] == audio['frames']
duration = capture['frameCount']/capture['fps']
assert abs(duration-audio['duration']) < .0001
for i in range(capture['frameCount']):
    assert (OUT/'frames'/f'{i:05d}.jpg').is_file(), f'Missing frame {i}'
outputs = []
for width, height, crf in [(1920, 1080, 18), (1280, 720, 21)]:
    dst = OUT/f'last-three-episode-01-{height}p.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-y', '-framerate', '25', '-start_number', '0',
                    '-i', capture['frames'], '-i', str(OUT/'audio/mix.wav'),
                    '-map', '0:v:0', '-map', '1:a:0', '-t', str(duration),
                    '-vf', f'scale={width}:{height},fps=25', '-c:v', 'libx264', '-preset', 'fast',
                    '-crf', str(crf), '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9',
                    '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(dst)], check=True)
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate', '-of', 'json', str(dst)]))
    decode = subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(dst), '-f', 'null', '-'],
                            check=True, capture_output=True)
    assert not decode.stderr, decode.stderr.decode(errors='replace')
    assert any(s['codec_type']=='video' and s['width']==width and s['height']==height
               and s['r_frame_rate']=='25/1' for s in probe['streams'])
    assert any(s['codec_type']=='audio' and s['sample_rate']=='48000' for s in probe['streams'])
    assert abs(float(probe['format']['duration'])-duration) < .1
    data = dst.read_bytes()
    assert 0 < data.find(b'moov') < data.find(b'mdat')
    outputs.append({'file': str(dst), 'probe': probe, 'full_decode': decode.returncode==0 and not decode.stderr,
                    'faststart': True})
(OUT/'delivery.json').write_text(json.dumps({'duration': duration, 'frame_count': capture['frameCount'],
                                             'fps': 25, 'outputs': outputs}, indent=2)+'\n')
print(json.dumps({'duration': duration, 'outputs': [o['file'] for o in outputs]}))
