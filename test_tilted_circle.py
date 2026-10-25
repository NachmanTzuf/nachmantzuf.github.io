from PIL import Image, ImageFilter, ImageDraw
import numpy as np

src_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg'
src = Image.open(src_path).convert('RGBA')
w, h = src.size # 571 x 1024

# Let's inspect the stone texture from the pedestal top:
# In src, x: [140, 460], y: [585, 638]
# If we extract this cracked ancient limestone texture and reconstruct a fully open, tilted 3D circle:
top_strip = src.crop((120, 582, 480, 642))
print("Extracted top strip:", top_strip.size)
