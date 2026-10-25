"""
Pixel-perfect digital compositor:
Takes the exact geometry of the Green reference image (pedestal and arch),
and applies the Navajo desert color grade, rock texture, and Monument Valley background.
"""
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

green_path = r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png'
desert_path = r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394234719_8eeb6a09.jpg'

green = Image.open(green_path).convert('RGB')
desert = Image.open(desert_path).convert('RGB')
w, h = green.size

# Let's inspect color profile of desert stone:
# In desert, terracotta rock has RGB roughly: R=180-240, G=90-140, B=50-90 (high red, warm orange)
# In green, stone has RGB roughly: R=110-160, G=120-170, B=100-150 (neutral desaturated green/grey)

print("Green size:", green.size)
print("Desert size:", desert.size)
