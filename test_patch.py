from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import numpy as np

src_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg'
orig = Image.open(src_path).convert('RGBA')
w, h = orig.size

# Let's inspect the landscape inside the arch between y=400 and y=585
inner_landscape = orig.crop((270, 420, 480, 580))
print("Inner landscape size:", inner_landscape.size)
