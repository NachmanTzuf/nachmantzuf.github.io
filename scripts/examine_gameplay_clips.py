import os
import subprocess
import cv2
import numpy as np

DIR_PATH = r"C:\Users\Hp\Pictures\EARPA ui potos"
OUT_DIR = r"earpa-video\out\gameplay_inspection"
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Extract audio from both videos
for v_name in ["WhatsApp Video 2026-11-09 at 8.34.40 PM.mp4", "WhatsApp Video 2026-11-09 at 8.36.32 PM.mp4"]:
    v_path = os.path.join(DIR_PATH, v_name)
    wav_name = v_name.replace('.mp4', '.wav').replace(' ', '_').replace(':', '-')
    wav_path = os.path.join(OUT_DIR, wav_name)
    if not os.path.exists(wav_path):
        cmd = ['ffmpeg', '-y', '-i', v_path, '-vn', '-ar', '48000', '-ac', '2', wav_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Extracted audio: {wav_path}")

# 2. Extract full-res frames at key points to inspect what each scene is
v1_path = os.path.join(DIR_PATH, "WhatsApp Video 2026-11-09 at 8.34.40 PM.mp4")
v2_path = os.path.join(DIR_PATH, "WhatsApp Video 2026-11-09 at 8.36.32 PM.mp4")

# Sample timestamps for Video 1:
# 2s, 10s, 20s, 25s, 30s, 32s, 42s, 45s, 50s, 55s, 65s, 75s, 80s, 90s, 100s
cap1 = cv2.VideoCapture(v1_path)
fps1 = cap1.get(cv2.CAP_PROP_FPS) or 30.0
for s in [2, 10, 18, 21, 25, 28, 32, 38, 43, 46, 51, 56, 73, 78, 88, 98]:
    cap1.set(cv2.CAP_PROP_POS_FRAMES, int(s * fps1))
    ret, frame = cap1.read()
    if ret:
        cv2.imwrite(os.path.join(OUT_DIR, f"v1_frame_{s:03d}s.png"), frame)

cap1.release()

# Sample timestamps for Video 2:
cap2 = cv2.VideoCapture(v2_path)
fps2 = cap2.get(cv2.CAP_PROP_FPS) or 30.0
for s in [2, 8, 11, 15, 21, 26, 31, 36, 41, 46, 51, 61, 66, 71, 81, 91, 101]:
    cap2.set(cv2.CAP_PROP_POS_FRAMES, int(s * fps2))
    ret, frame = cap2.read()
    if ret:
        cv2.imwrite(os.path.join(OUT_DIR, f"v2_frame_{s:03d}s.png"), frame)

cap2.release()
print("Saved inspection frames to", OUT_DIR)
