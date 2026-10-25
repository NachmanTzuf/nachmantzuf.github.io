import cv2
import numpy as np

green = cv2.imread(r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png')
h, w = green.shape[:2]

# Let's inspect along rows y=300, 400, 500, 600, 700:
# Where is the stone of the left pillar vs the background?
# In green, stone has high texture and dark grooves.
# Let's inspect x coordinates across the left pillar at y=500:
for x in range(160, 270, 5):
    print(f'y=500 x={x}: {green[500, x]}')

print("\nRight pillar at y=500:")
for x in range(470, 550, 5):
    print(f'y=500 x={x}: {green[500, x]}')
