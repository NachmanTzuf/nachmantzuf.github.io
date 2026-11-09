import os
import cv2
import numpy as np

DIR_ANALYSIS = r"earpa-video\out\gameplay_analysis"

def analyze_video_frames(folder_name):
    f_path = os.path.join(DIR_ANALYSIS, folder_name)
    images = sorted([f for f in os.listdir(f_path) if f.startswith('frame_') and f.endswith('.jpg')])
    print(f"\n==============================================")
    print(f"ANALYSIS OF {folder_name} ({len(images)} frames):")
    
    for img_name in images:
        sec = int(img_name.replace('frame_', '').replace('s.jpg', ''))
        img = cv2.imread(os.path.join(f_path, img_name))
        h, w, _ = img.shape
        
        # Check header color (top 15%)
        header = img[0:int(h*0.15), :]
        avg_header = np.mean(header, axis=(0,1))
        
        # Check mid area (harp arena)
        mid = img[int(h*0.2):int(h*0.75), :]
        avg_mid = np.mean(mid, axis=(0,1))
        
        # Check bottom area (controls)
        bottom = img[int(h*0.75):, :]
        avg_bottom = np.mean(bottom, axis=(0,1))
        
        # Detect dominant background hue
        hsv_mid = cv2.cvtColor(mid, cv2.COLOR_BGR2HSV)
        h_channel = hsv_mid[:, :, 0]
        s_channel = hsv_mid[:, :, 1]
        v_channel = hsv_mid[:, :, 2]
        
        # Green (Coastal Ridge / Single note): H ~ 35-85
        green_mask = (h_channel >= 35) & (h_channel <= 85) & (s_channel > 40)
        green_pct = np.sum(green_mask) / (h_channel.size) * 100
        
        # Blue/Cyan (Glacial Fjord / Melody): H ~ 90-130
        blue_mask = (h_channel >= 90) & (h_channel <= 130) & (s_channel > 40)
        blue_pct = np.sum(blue_mask) / (h_channel.size) * 100
        
        # Orange/Amber/Brown (Canyon / Levers): H ~ 10-30
        orange_mask = (h_channel >= 10) & (h_channel <= 30) & (s_channel > 40)
        orange_pct = np.sum(orange_mask) / (h_channel.size) * 100
        
        # Check if roadmap vs in-game:
        # In-game has the wood harp in the center (wood is orange/brown with high saturation or strings)
        # Check if bottom has letter buttons or play button
        scene_type = "Unknown"
        if green_pct > 15:
            realm = "Green/Coastal (Single)"
        elif blue_pct > 15:
            realm = "Blue/Glacial (Melody)"
        elif orange_pct > 15:
            realm = "Orange/Canyon (Levers)"
        else:
            realm = f"Dark/Neutral (G:{green_pct:.1f}% B:{blue_pct:.1f}% O:{orange_pct:.1f}%)"
            
        print(f"[{sec:03d}s] {realm} | H-avg:{avg_header.astype(int)} M-avg:{avg_mid.astype(int)} B-avg:{avg_bottom.astype(int)}")

analyze_video_frames("WhatsApp_Video_2026-11-09_at_8.34.40_PM")
analyze_video_frames("WhatsApp_Video_2026-11-09_at_8.36.32_PM")
