import os
import cv2
import numpy as np

DIR_ANALYSIS = r"earpa-video\out\gameplay_analysis"
V1_DIR = os.path.join(DIR_ANALYSIS, "WhatsApp_Video_2026-11-09_at_8.34.40_PM")
V2_DIR = os.path.join(DIR_ANALYSIS, "WhatsApp_Video_2026-11-09_at_8.36.32_PM")

def find_details_in_frames(folder_path):
    print(f"\n==========================================")
    print(f"Detailed inspection of frames in {folder_path}")
    files = sorted([f for f in os.listdir(folder_path) if f.startswith('frame_') and f.endswith('.jpg')])
    for f in files:
        sec = int(f.replace('frame_', '').replace('s.jpg', ''))
        img = cv2.imread(os.path.join(folder_path, f))
        h, w, _ = img.shape
        
        # Crop header badge/text area (y: 20 to 80, x: 20 to w-20)
        badge_crop = img[int(h*0.04):int(h*0.12), int(w*0.05):int(w*0.95)]
        
        # Crop prompt area (y: 12% to 22%)
        prompt_crop = img[int(h*0.12):int(h*0.22), int(w*0.05):int(w*0.95)]
        
        # Crop button bar area (y: 80% to 92%)
        btn_crop = img[int(h*0.82):int(h*0.92), int(w*0.05):int(w*0.95)]
        
        # Mean luminance and color
        avg_badge = np.mean(badge_crop)
        avg_prompt = np.mean(prompt_crop)
        avg_btn = np.mean(btn_crop, axis=(0,1))
        
        # Check if feedback card is showing (success green or red or glowing banner)
        feedback_crop = img[int(h*0.35):int(h*0.65), int(w*0.1):int(w*0.9)]
        avg_feedback = np.mean(feedback_crop, axis=(0,1))
        
        print(f"[{sec:03d}s] BadgeLum:{avg_badge:.1f} PromptLum:{avg_prompt:.1f} BtnColor:{avg_btn.astype(int)} CenterColor:{avg_feedback.astype(int)}")

find_details_in_frames(V1_DIR)
