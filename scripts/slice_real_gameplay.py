import os
import subprocess
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

DIR_USER = r"C:\Users\Hp\Pictures\EARPA ui potos"
OUT_DIR = r"earpa-video\public\videos\gameplay_real"
os.makedirs(OUT_DIR, exist_ok=True)

v1_source = os.path.join(DIR_USER, "WhatsApp Video 2026-11-09 at 8.34.40 PM.mp4")
v2_source = os.path.join(DIR_USER, "WhatsApp Video 2026-11-09 at 8.36.32 PM.mp4")

# Slices definition: (source_file, start_sec, duration_sec, out_filename)
slices = [
    # Path 1: Single Notes
    (v2_source, 0.5, 11.0, "path1_clip1_note6.mp4"),
    (v2_source, 11.8, 11.0, "path1_clip2_note5.mp4"),
    (v2_source, 34.0, 11.0, "path1_clip3_note4.mp4"),
    (v2_source, 70.0, 11.5, "path1_clip4_note7.mp4"),
    (v2_source, 0.5, 22.3, "path1_gameplay_full_r1_r2.mp4"),
    
    # Path 2: Melodic Phrasing
    (v2_source, 34.0, 21.5, "path2_gameplay_two_phrases.mp4"),
    (v2_source, 45.5, 10.5, "path2_clip2_phrase_tonic.mp4"),
    
    # Path 3: Camac Levers
    (v1_source, 0.5, 23.0, "path3_clip1_tutorial.mp4"),
    (v1_source, 35.0, 19.0, "path3_clip2_circle_fifths.mp4"),
    (v1_source, 74.5, 20.5, "path3_clip3_gameplay_walk.mp4"),
    (v1_source, 74.5, 33.0, "path3_gameplay_full_walks.mp4"),
]

for src, start_s, dur_s, fname in slices:
    out_path = os.path.join(OUT_DIR, fname)
    print(f"Encoding {fname}: start={start_s}s, dur={dur_s}s...")
    
    # ffmpeg slice command:
    # Scale cleanly to 1080x1920 keeping aspect ratio with pad, 30fps, faststart
    vf = "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,fps=30"
    
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start_s),
        "-i", src,
        "-t", str(dur_s),
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "48000",
        "-movflags", "+faststart",
        out_path
    ]
    
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"Error encoding {fname}: {res.stderr[:200]}")
    else:
        size_kb = os.path.getsize(out_path) / 1024
        print(f"SUCCESS: {fname} ({size_kb:.1f} KB)")

print("\nAll gameplay video slices generated successfully!")
