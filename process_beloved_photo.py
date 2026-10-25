from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import numpy as np

# Load original
src_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792323887781_85b1b263.jpg'
orig = Image.open(src_path).convert('RGB')
w, h = orig.size

# Target canvas 1080 x 1920 (standard 9:16 high-res)
canvas_w, canvas_h = 1080, 1920

# Let's inspect the original image channels and regions
print(f"Original size: {w}x{h}, aspect: {w/h:.4f}")
