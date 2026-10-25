import glob, os
import av

total_frames = 0
results = []
for f in sorted(glob.glob('voiceover_tmp/*.mp3')):
    container = av.open(f)
    stream = container.streams.audio[0]
    duration_sec = float(stream.duration * stream.time_base)
    frames = int(round(duration_sec * 30))
    total_frames += frames
    results.append((os.path.basename(f), duration_sec, frames))

print("TIMING RESULTS:")
for name, sec, frames in results:
    print(f"{name}: {sec:.2f}s -> {frames} frames")
print(f"Total: {total_frames/30:.2f}s ({total_frames} frames)")
