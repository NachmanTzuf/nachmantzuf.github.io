import os
import subprocess
import cv2
import numpy as np

DIR_PATH = r"C:\Users\Hp\Pictures\EARPA ui potos"
OUT_ANALYSIS = r"earpa-video\out\gameplay_analysis"
os.makedirs(OUT_ANALYSIS, exist_ok=True)

videos = [
    "WhatsApp Video 2026-11-09 at 8.34.40 PM.mp4",
    "WhatsApp Video 2026-11-09 at 8.36.32 PM.mp4"
]

for v in videos:
    v_path = os.path.join(DIR_PATH, v)
    cap = cv2.VideoCapture(v_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    print(f"\n==========================================")
    print(f"Analyzing {v}")
    print(f"Total Frames: {total_frames}, FPS: {fps:.2f}, Duration: {duration:.2f}s")
    
    # Extract frames every 3 seconds to see the timeline
    sub_dir = os.path.join(OUT_ANALYSIS, v.replace('.mp4', '').replace(' ', '_').replace(':', '-'))
    os.makedirs(sub_dir, exist_ok=True)
    
    step_sec = 2.5
    sec = 0.0
    extracted = []
    while sec < duration:
        frame_idx = int(sec * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break
        # Save thumbnail
        thumb_name = f"frame_{int(sec):03d}s.jpg"
        thumb_path = os.path.join(sub_dir, thumb_name)
        # resize to 270x585 for quick contact review
        thumb = cv2.resize(frame, (270, 585))
        cv2.imwrite(thumb_path, thumb)
        extracted.append((sec, thumb_name))
        sec += step_sec
    cap.release()
    print(f"Extracted {len(extracted)} frames to {sub_dir}")
