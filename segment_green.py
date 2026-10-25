import cv2
import numpy as np

green = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png')
h, w = green.shape[:2]

# Convert to HSV and Lab
hsv = cv2.cvtColor(green, cv2.COLOR_BGR2HSV)
lab = cv2.cvtColor(green, cv2.COLOR_BGR2LAB)

# Green foliage detection:
# In HSV, Green is Hue 35 to 85, Saturation > 30
lower_green = np.array([25, 30, 20])
upper_green = np.array([85, 255, 255])
green_foliage_mask = cv2.inRange(hsv, lower_green, upper_green)

# Glowing runes detection:
# Runes are bright yellow/gold/orange with high value and specific hue
lower_rune = np.array([12, 100, 180])
upper_rune = np.array([30, 255, 255])
rune_mask = cv2.inRange(hsv, lower_rune, upper_rune)

# Sky and distant ocean detection:
# Low saturation, high value, bluish/grey
# Or in Lab: a is around 128 (neutral), b is below 128 (slightly blue)
sky_ocean_mask = ((hsv[:, :, 1] < 45) & (hsv[:, :, 2] > 110) & (green[:, :, 0] > green[:, :, 2])).astype(np.uint8) * 255
# Only above y=760
sky_ocean_mask[740:, :] = 0

print("Foliage pixels:", np.sum(green_foliage_mask > 0))
print("Rune pixels:", np.sum(rune_mask > 0))
print("Sky/ocean pixels:", np.sum(sky_ocean_mask > 0))

cv2.imwrite(r'C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\mask_foliage.png', green_foliage_mask)
cv2.imwrite(r'C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\mask_sky.png', sky_ocean_mask)
