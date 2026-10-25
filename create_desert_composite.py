import cv2
import numpy as np

# Load images
green = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png')
desert = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394234719_8eeb6a09.jpg')
h, w = green.shape[:2]

# Resize desert to exact same size
desert_res = cv2.resize(desert, (w, h), interpolation=cv2.INTER_LANCZOS4)

# 1. Color Grading the Green stone and foliage to Navajo Red Sandstone
# Convert green image to float in range [0, 1]
g_float = green.astype(np.float32) / 255.0

# Split channels (BGR)
B, G, R = g_float[:, :, 0], g_float[:, :, 1], g_float[:, :, 2]

# Compute luminance / grayscale
gray = 0.299 * R + 0.587 * G + 0.114 * B

# Green mask (where green foliage / moss dominates)
# In foliage, G > R and G > B
is_green = (G > B * 1.1) & (G > R * 0.95)
green_intensity = np.clip((G - np.maximum(R, B) * 0.9) * 3.0, 0.0, 1.0)

# Stone mask (low saturation, mid-range gray)
# Stone in green has subtle green/grey tones

# Build Navajo Red Sandstone color ramp based on luminance:
# Highlights: warm golden terracotta (R=0.95, G=0.65, B=0.35)
# Midtones: rich burnt sienna / red rock (R=0.75, G=0.35, B=0.18)
# Shadows: deep dark umber / desert varnish (R=0.35, G=0.12, B=0.06)

sandstone_R = np.clip(gray * 1.35 + 0.05, 0.0, 1.0)
sandstone_G = np.clip(gray * 0.65 - 0.02, 0.0, 1.0)
sandstone_B = np.clip(gray * 0.35 - 0.04, 0.0, 1.0)

# For green foliage areas, map them to weathered sagebrush / desert sand / golden ochre:
foliage_sand_R = np.clip(gray * 1.25 + 0.15, 0.0, 1.0)
foliage_sand_G = np.clip(gray * 0.85 + 0.05, 0.0, 1.0)
foliage_sand_B = np.clip(gray * 0.45, 0.0, 1.0)

# Blend stone and foliage textures
blended_R = (1.0 - green_intensity) * sandstone_R + green_intensity * foliage_sand_R
blended_G = (1.0 - green_intensity) * sandstone_G + green_intensity * foliage_sand_G
blended_B = (1.0 - green_intensity) * sandstone_B + green_intensity * foliage_sand_B

desert_architecture = np.stack([blended_B, blended_G, blended_R], axis=2)
desert_architecture = np.clip(desert_architecture * 255.0, 0, 255).astype(np.uint8)

# 2. Extract background window from green image
# In green, the landscape window is between the left pillar and right pillar
# and above the midground grass (y < 730)
# We can use grabcut or guided color segmentation
window_mask = np.zeros((h, w), dtype=np.float32)

# Coordinates of the open sky/ocean in green:
# x from 240 to 490, y from 220 to 680
# and left sky: x from 0 to 80, y from 0 to 450
for y in range(h):
    for x in range(w):
        # Center window
        if 230 <= x <= 500 and 210 <= y <= 720:
            # Check if this pixel is sky/ocean (bluish grey or distant cliff)
            b_val, g_val, r_val = green[y, x]
            # Arch stone has higher texture contrast; sky/distant ocean is smoother
            if (b_val > 100 and g_val > 110 and r_val > 90) or (y > 450 and y < 650 and x > 380):
                window_mask[y, x] = 1.0
        # Left sky
        if x <= 75 and y <= 450:
            b_val, g_val, r_val = green[y, x]
            if b_val > 110 and g_val > 120 and r_val > 100:
                window_mask[y, x] = 1.0

# Smooth the window mask edges
window_mask = cv2.GaussianBlur(window_mask, (15, 15), 0)
window_mask_3c = np.stack([window_mask]*3, axis=2)

# 3. Composite Desert Background into the window
# Take background from desert_res (the canyon panorama)
desert_bg = desert_res.copy()

# Blend
composite = (desert_bg.astype(np.float32) * window_mask_3c + 
             desert_architecture.astype(np.float32) * (1.0 - window_mask_3c))
composite = np.clip(composite, 0, 255).astype(np.uint8)

# Save intermediate test
cv2.imwrite(r'C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\desert_composite_v1.jpg', composite)
print('Composite V1 created!')
