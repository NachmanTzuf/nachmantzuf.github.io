import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load pristine original sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size # 571 x 1024

# Let's inspect:
# 1. Background landscape (sky, distant ocean, Cliffs of Moher)
# In orig:
# Left pillar: x=125..230
# Arch keystone: x=340..430, y=55..120
# Right pillar: x=500..571 (cropped at right edge)
# Pedestal: x=60..510 (center cx = 285), y=565..870

# Goals:
# A. Arch:
#    - "a little bit down and a little bit bigger"
#    - "center of the arch is exactly in the center of the circle"
#    - Scale arch by 1.08x
#    - Shift arch so its central axis is at cx = 285.5
#    - Shift arch down by 25px so keystone top is at y = 80
# B. Pedestal:
#    - "appearance of the pedestal completely... randomly cracked on the top with crawling vines and stuff"
#    - ZERO synthetic geometric circles!
#    - "it should be much closer to me" -> scale up by 1.25x in the foreground!
#    - "hovering exactly over the center, 100% exact over the center, because now it's hovering in front of it"
#    - Position the pedestal forward so its circular top center lands exactly at the vertical line and base of the floating harp!

# Let's build the composition canvas
comp = Image.new('RGBA', (w, h), (0, 0, 0, 255))

# Foundation: The landscape
comp.paste(orig, (0, 0))

# 1. Clean the sky at the top so shifting the arch down has clean, pristine sky above it
# Sample the smooth Irish morning sky with sunbeam from y: 0..45
top_sky = orig.crop((0, 0, w, 45)).resize((w, 90), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(radius=2))
comp.paste(top_sky, (0, 0))
# Fill between y=45..85 across the arch area
keystone_sky = orig.crop((10, 5, 200, 45)).resize((260, 40), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(radius=3))
comp.paste(keystone_sky, (290, 45))

# 2. Extract and reposition the Arch:
# Arch crop from orig: x=120..571, y=45..580
arch_crop = orig.crop((120, 45, 571, 580))
aw, ah = arch_crop.size

# Scale by 1.08x
new_aw = int(aw * 1.08)
new_ah = int(ah * 1.08)
arch_scaled = arch_crop.resize((new_aw, new_ah), Image.Resampling.LANCZOS)

# Shift arch left so its opening center aligns with screen center (x = 285.5)
# In arch_crop (aw=451), opening center is at x ≈ 250.
# In arch_scaled (new_aw=487), opening center is at x ≈ 270.
# To place opening center at screen x = 285.5:
# arch_x = 285.5 - 270 = 15!
# Shift down by 28px: arch_y = 45 + 28 = 73
arch_x = 28
arch_y = 73

# Create soft alpha mask for arch
arch_mask = Image.new('L', (new_aw, new_ah), 255)
d_am = ImageDraw.Draw(arch_mask)
# Feather outer left edge so it blends into the left hill
for x in range(25):
    alpha = int(255 * (x / 25.0))
    for y in range(new_ah):
        arch_mask.putpixel((x, y), min(arch_mask.getpixel((x, y)), alpha))

# Feather bottom of pillars into the hills
for y in range(new_ah - 35, new_ah):
    alpha = int(255 * ((new_ah - y) / 35.0))
    for x in range(new_aw):
        arch_mask.putpixel((x, y), min(arch_mask.getpixel((x, y)), alpha))

arch_mask = arch_mask.filter(ImageFilter.GaussianBlur(radius=3))

comp.paste(arch_scaled, (arch_x, arch_y), arch_mask)

# 3. Extract the AUTHENTIC Pedestal with its original random cracks and crawling vines!
# In orig: x=50..525, y=565..1024
ped_orig = orig.crop((50, 565, 525, 1024))
pw, ph = ped_orig.size

# Scale up by 1.25x so it is much closer to the viewer in the foreground!
new_pw = int(pw * 1.25) # ~593px
new_ph = int(ph * 1.25) # ~573px
ped_scaled = ped_orig.resize((new_pw, new_ph), Image.Resampling.LANCZOS)

# Create soft feather mask for the pedestal perimeter
ped_mask = Image.new('L', (new_pw, new_ph), 255)
d_pm = ImageDraw.Draw(ped_mask)

# Top edge feathering (soft 18px fade along the top rim so it blends into background hills)
for y in range(18):
    alpha = int(255 * (y / 18.0))
    d_pm.line([(0, y), (new_pw, y)], fill=alpha)

# Left and right soft edge feather
for x in range(25):
    alpha = int(255 * (x / 25.0))
    for y in range(new_ph):
        cur = ped_mask.getpixel((x, y))
        ped_mask.putpixel((x, y), min(cur, alpha))

for x in range(new_pw - 25, new_pw):
    alpha = int(255 * ((new_pw - x) / 25.0))
    for y in range(new_ph):
        cur = ped_mask.getpixel((x, y))
        ped_mask.putpixel((x, y), min(cur, alpha))

ped_mask = ped_mask.filter(ImageFilter.GaussianBlur(radius=3))

# Center the pedestal horizontally at x = 285.5 (exact screen center!)
ped_x = int((w - new_pw) / 2.0)
# Position forward: top rim at y = 560
ped_y = 560

comp.paste(ped_scaled, (ped_x, ped_y), ped_mask)

# Save master image to brain, public, and dist
out_brain = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/perfect_celtic_sanctuary.jpg'
out_public = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/irish_celtic_sanctuary.jpg'
out_dist = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/dist/images/irish_celtic_sanctuary.jpg'

final_rgb = comp.convert('RGB')
final_rgb.save(out_brain, quality=96)
final_rgb.save(out_public, quality=96)
final_rgb.save(out_dist, quality=96)
print('Perfect Celtic sanctuary saved successfully!')
