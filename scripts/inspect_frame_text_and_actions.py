import os
import cv2
import numpy as np

OUT_DIR = r"earpa-video\out\gameplay_inspection"

# Let's inspect v1 and v2 frames by saving cropped UI regions and computing differences
def analyze_frames():
    files = sorted([f for f in os.listdir(OUT_DIR) if f.endswith('.png')])
    for f in files:
        img_path = os.path.join(OUT_DIR, f)
        img = cv2.imread(img_path)
        h, w, _ = img.shape
        
        # Check top header text area
        header_crop = img[int(h*0.02):int(h*0.14), :]
        # Check mid area
        mid_crop = img[int(h*0.15):int(h*0.75), :]
        # Check bottom area
        btn_crop = img[int(h*0.75):int(h*0.95), :]
        
        # Detect if "Level", "Stage", "Round", "Confirm" or modal is present
        # Save crops with labels
        crop_name = f.replace('.png', '_header.png')
        cv2.imwrite(os.path.join(OUT_DIR, crop_name), header_crop)
        btn_name = f.replace('.png', '_buttons.png')
        cv2.imwrite(os.path.join(OUT_DIR, btn_name), btn_crop)

analyze_frames()
print("Header and button crops saved.")
