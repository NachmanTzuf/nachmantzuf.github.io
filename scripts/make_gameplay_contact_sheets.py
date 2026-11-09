import os
import cv2
import numpy as np

DIR_ANALYSIS = r"earpa-video\out\gameplay_analysis"

for folder in os.listdir(DIR_ANALYSIS):
    f_path = os.path.join(DIR_ANALYSIS, folder)
    if not os.path.isdir(f_path):
        continue
    images = sorted([f for f in os.listdir(f_path) if f.endswith('.jpg')])
    if not images:
        continue
    
    # Grid of tiles: 6 columns
    cols = 6
    rows = (len(images) + cols - 1) // cols
    tile_w, tile_h = 160, 340
    
    sheet = np.zeros((rows * tile_h, cols * tile_w, 3), dtype=np.uint8)
    
    for idx, img_name in enumerate(images):
        r = idx // cols
        c = idx % cols
        img = cv2.imread(os.path.join(f_path, img_name))
        if img is None:
            continue
        resized = cv2.resize(img, (tile_w, tile_h))
        # Draw timestamp label
        label = img_name.replace("frame_", "").replace(".jpg", "")
        cv2.rectangle(resized, (0, 0), (tile_w, 24), (0, 0, 0), -1)
        cv2.putText(resized, label, (8, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv2.LINE_AA)
        
        sheet[r*tile_h:(r+1)*tile_h, c*tile_w:(c+1)*tile_w] = resized
        
    out_sheet = os.path.join(DIR_ANALYSIS, f"sheet_{folder}.jpg")
    cv2.imwrite(out_sheet, sheet)
    print(f"Created contact sheet: {out_sheet} ({sheet.shape[1]}x{sheet.shape[0]})")
