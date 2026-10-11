"""Encode exact offline frames and mux the soundtrack at the same edit origin."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs/show/recordings/pit-proof"
capture = json.loads((OUT / "capture.json").read_text())
if capture["errors"]:
    raise RuntimeError("Capture contains errors: " + repr(capture["errors"]))
assert capture["fps"] == 25 and capture["frameCount"] == 1000
assert capture["frameCount"] / capture["fps"] == capture["duration"] == 40
for frame in range(capture["frameCount"]):
    assert (OUT / "frames" / f"{frame:04d}.jpg").is_file(), f"Missing frame {frame}"
outputs = []
for name, width, height, crf in [("the-rope-1080p.mp4",1920,1080,18),("the-rope-720p.mp4",1280,720,21)]:
    destination = OUT / name
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-framerate", "25", "-start_number", "0", "-i", capture["frames"],
        "-i", str(OUT / "audio/mix.wav"), "-map", "0:v:0", "-map", "1:a:0", "-t", "40",
        "-vf", f"scale={width}:{height},fps=25", "-c:v", "libx264", "-preset", "fast", "-crf", str(crf),
        "-pix_fmt", "yuv420p", "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart", str(destination)
    ],check=True)
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate", "-of", "json", str(destination)
    ]))
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(destination), "-f", "null", "-"],check=True)
    streams = probe["streams"]
    assert any(s["codec_type"] == "video" and s["width"] == width and s["height"] == height for s in streams)
    assert any(s["codec_type"] == "audio" and s["sample_rate"] == "48000" for s in streams)
    assert abs(float(probe["format"]["duration"]) - 40) < .1
    data = destination.read_bytes()
    assert 0 < data.find(b"moov") < data.find(b"mdat")
    outputs.append({"file":str(destination),"probe":probe,"full_decode":True,"faststart":True})
report = {"frame_origin":0,"fps":25,"frame_count":1000,"outputs":outputs}
(OUT/"delivery.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps(report,indent=2))
