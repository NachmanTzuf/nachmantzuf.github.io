import numpy as np
from PIL import Image, ImageDraw, ImageFilter

orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size

# We want to create a clean Irish sanctuary backdrop where:
# 1. The ancient arch with glowing runes, the Cliffs of Moher, and the ocean stack remain 100% pristine and untouched.
# 2. In the center lower area (where the 3D pedestal will rise), the background has a natural bed of green clover, mossy turf, and soft morning mist.
# 3. This ensures that when Three.js renders the 3D Celtic Stone Altar in front, it rises seamlessly out of the turf with ZERO double-altar clipping or clashing!

backdrop = orig.copy()

# Sample the lush green grass from left (x: 10..110, y: 550..750) and right (x: 460..560, y: 550..750)
grass_left = orig.crop((15, 540, 115, 750))
grass_right = orig.crop((460, 540, 560, 750))

# Sample the bottom clover and wet soil (y: 860..1020)
clover_bottom = orig.crop((20, 860, 550, 1020))

# Create a turf fill patch for the altar area (x: 80..490, y: 560..860)
turf_patch = Image.new('RGBA', (410, 300), (0, 0, 0, 0))

# Paste tiled grass and clover with soft feathering
gl_resized = grass_left.resize((210, 300), Image.Resampling.LANCZOS)
gr_resized = grass_right.resize((210, 300), Image.Resampling.LANCZOS)
turf_patch.paste(gl_resized, (0, 0))
turf_patch.paste(gr_resized, (200, 0))

# Add soft misty morning haze across the turf patch matching the coastal fog
mist = Image.new('RGBA', (410, 300), (145, 165, 155, 140))
turf_patch.paste(mist, (0, 0), mist)

# Create an organic feather mask for blending
mask = Image.new('L', (410, 300), 0)
d_mask = ImageDraw.Draw(mask)
d_mask.ellipse((20, 20, 390, 280), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(radius=18))

backdrop.paste(turf_patch, (80, 560), mask)

# Save test clean backdrop
out_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/test_clean_backdrop.jpg'
backdrop.convert('RGB').save(out_path, quality=95)
print('Clean backdrop saved:', out_path)
