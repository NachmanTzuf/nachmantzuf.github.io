import cv2
import numpy as np

# Load the Green image (our geometric reference)
green = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png')
desert = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394234719_8eeb6a09.jpg')
h, w = green.shape[:2]

# Let's create an accurate alpha mask for the stone arch and altar in the Green image
# In the green image, the background (sky, sea, distant cliffs) is distinguished from foreground stone:
# Let's inspect the foreground stone vs background:
# 1. Altar: y >= 755 is 100% foreground stone!
# 2. Arch pillars:
#    - Far left monolith: x in [0, 240], y in [260, 720]
#    - Left pillar: x in [180, 260], y in [260, 720]
#    - Keystone / arch curve: y in [80, 450], curve connecting left pillar to right pillar
#    - Right pillar: x in [480, 571], y in [180, 720]

# Let's use GrabCut with an initialized bounding box and trimap:
# 0 = definitely background, 1 = definitely foreground, 2 = probable background, 3 = probable foreground
gc_mask = np.zeros((h, w), dtype=np.uint8)

# Definitely background: central sky/sea area
# Around x in [260, 460], y in [250, 600]
gc_mask[250:600, 270:460] = cv2.GC_BGD
# Far left upper sky: x in [0, 60], y in [0, 350]
gc_mask[0:350, 0:60] = cv2.GC_BGD
# Upper center sky: y in [0, 80]
gc_mask[0:80, :] = cv2.GC_BGD

# Definitely foreground:
# Altar: y >= 760
gc_mask[760:, :] = cv2.GC_FGD
# Pillar cores:
gc_mask[320:680, 180:235] = cv2.GC_FGD
gc_mask[320:680, 500:560] = cv2.GC_FGD
gc_mask[100:190, 320:450] = cv2.GC_FGD # keystone

# Probable foreground for the rest of the arch region:
arch_box = np.zeros((h, w), dtype=bool)
# rough arch area
arch_box[80:760, :] = True
arch_box[220:680, 250:480] = False # inside window
arch_box[0:350, 0:70] = False # left sky
gc_mask[arch_box & (gc_mask == 0)] = cv2.GC_PR_FGD
gc_mask[~arch_box & (gc_mask == 0)] = cv2.GC_PR_BGD

bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)

print("Running GrabCut segmentation...")
cv2.grabCut(green, gc_mask, None, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_MASK)

# Foreground is where mask is 1 or 3
fg_mask = np.where((gc_mask == 1) | (gc_mask == 3), 1.0, 0.0).astype(np.float32)

# Ensure altar is 100% foreground
fg_mask[760:, :] = 1.0

# Smooth the matte
fg_mask_smooth = cv2.GaussianBlur(fg_mask, (5, 5), 0)

cv2.imwrite(r'C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\fg_mask.png', (fg_mask_smooth * 255).astype(np.uint8))
print("GrabCut matte generated successfully!")
