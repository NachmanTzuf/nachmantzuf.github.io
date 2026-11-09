import os
import cv2
import numpy as np

DIR_PATH = r"C:\Users\Hp\Pictures\EARPA ui potos"
OUT_DIR = r"earpa-video\out\gameplay_inspection"

# Let's inspect video 1 every second from 0s to 24s (Single Notes)
v1 = cv2.VideoCapture(os.path.join(DIR_PATH, "WhatsApp Video 2026-11-09 at 8.34.40 PM.mp4"))
fps1 = v1.get(cv2.CAP_PROP_FPS) or 30.0

print("\n--- VIDEO 1: SINGLE NOTES (0s - 24s) ---")
for s in range(0, 24):
    v1.set(cv2.CAP_PROP_POS_FRAMES, int(s * fps1))
    ret, frame = v1.read()
    if ret:
        cv2.imwrite(os.path.join(OUT_DIR, f"single_sec_{s:02d}.jpg"), frame)

# Let's inspect video 1 every second from 24s to 75s (Levers)
print("\n--- VIDEO 1: LEVERS (24s - 75s) ---")
for s in range(24, 75, 2):
    v1.set(cv2.CAP_PROP_POS_FRAMES, int(s * fps1))
    ret, frame = v1.read()
    if ret:
        cv2.imwrite(os.path.join(OUT_DIR, f"levers_sec_{s:02d}.jpg"), frame)

v1.release()

# Let's inspect video 2 every second from 0s to 35s (Melody)
v2 = cv2.VideoCapture(os.path.join(DIR_PATH, "WhatsApp Video 2026-11-09 at 8.36.32 PM.mp4"))
fps2 = v2.get(cv2.CAP_PROP_FPS) or 30.0

print("\n--- VIDEO 2: MELODY (0s - 35s) ---")
for s in range(0, 35, 2):
    v2.set(cv2.CAP_PROP_POS_FRAMES, int(s * fps2))
    ret, frame = v2.read()
    if ret:
        cv2.imwrite(os.path.join(OUT_DIR, f"melody_sec_{s:02d}.jpg"), frame)

v2.release()
print("Saved granular inspection images.")
