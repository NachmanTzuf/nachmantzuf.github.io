import cv2
import numpy as np
from PIL import Image

green = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png')
desert = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394234719_8eeb6a09.jpg')
h, w = green.shape[:2]

# Let's inspect the background opening through the arch
# In green, the arch opening is approximately bounded by:
# Left pillar inner edge: around x=235-245
# Arch inner top: around y=220-230
# Right pillar inner edge: around x=480-500
# Midground plateau: around y=680-720

# Let's create an accurate mask of the background window
# We can find the background by checking color and position
# In green, the sky and ocean have high blue/grey component and low red
b_mask = np.zeros((h, w), dtype=np.uint8)

# The window area:
# y between 210 and 690, x between 220 and 520
# Let's inspect the edge of the stone arch
stone_mask = np.zeros((h, w), dtype=np.uint8)

# Altar mask: y >= 760
altar_mask = np.zeros((h, w), dtype=np.uint8)
altar_mask[760:, :] = 255

print("Mask testing script ready.")
