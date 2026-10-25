import cv2
import numpy as np

green = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png')
h, w = green.shape[:2]

# Create a clean binary mask for the central opening
# The central opening is bounded by:
# Top: inner curve of the arch
# Left: inner edge of left pillar
# Right: inner edge of right pillar
# Bottom: ground plateau behind the altar (around y = 730-740)

# Let's inspect rows from y=200 to y=720:
# For each row, the opening is between left_edge(y) and right_edge(y)
window_mask = np.zeros((h, w), dtype=np.uint8)

for y in range(215, 730):
    # Find left stone edge: moving from center x=350 to the left
    # The stone has distinct color from sky/cliffs
    left_x = 240
    for x in range(350, 150, -1):
        # In the sky/cliff, color is relatively smooth or high blue/green
        # Stone edge has darker luminance or sharp texture
        b, g, r = green[y, x]
        # Stone on left pillar has dark greenish/grey tones: r < 70, b < 70 or sharp drop
        if x < 265 and (r < 75 or g < 80 or (r < 90 and b < 80)):
            left_x = x
            break
            
    # Find right stone edge: moving from center x=350 to the right
    right_x = 535
    for x in range(350, 560):
        b, g, r = green[y, x]
        # Right pillar stone starts when r < 120 and b < 120
        if x > 480 and (r < 120 and b < 120):
            right_x = x
            break
            
    # For upper arch rows (y < 350), the top curve restricts left and right
    window_mask[y, left_x:right_x] = 255

# Fill any small holes and smooth
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
window_mask = cv2.morphologyEx(window_mask, cv2.MORPH_CLOSE, kernel)

# Blur the mask edges for photorealistic seamless blending
window_mask_blur = cv2.GaussianBlur(window_mask.astype(np.float32) / 255.0, (9, 9), 0)

cv2.imwrite(r'C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\window_mask_refined.png', (window_mask_blur * 255).astype(np.uint8))
print("Window mask refined successfully!")
