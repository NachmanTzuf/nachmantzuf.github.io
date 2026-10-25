import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load pristine original sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size # 571 x 1024

# Step 1: Create a Clean Background Plate with NO arch pillars
# 1a. Clean Sky at the top (y: 0..110)
clean_plate = orig.copy()
sky_sample = orig.crop((20, 10, 220, 50)).resize((w, 100), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(radius=3))
clean_plate.paste(sky_sample, (0, 0))

# 1b. Inpaint over the old right pillar (x: 480..571, y: 100..600):
# Replace with the ocean, cliffs, and hills sampled from x: 370..480
ocean_patch = orig.crop((370, 150, 480, 580))
op_w, op_h = ocean_patch.size
# Flip horizontally so the coastline flows naturally to the right
ocean_ext = ocean_patch.transpose(Image.FLIP_LEFT_RIGHT).resize((110, 430), Image.Resampling.LANCZOS)
clean_plate.paste(ocean_ext, (470, 150))

# 1c. Inpaint over the old keystone area (x: 280..460, y: 40..110)
keystone_sky = orig.crop((10, 5, 200, 45)).resize((200, 70), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(radius=3))
clean_plate.paste(keystone_sky, (275, 45))

# Step 2: The Arch: "a little bit down and a little bit bigger"
# Extract the arch from orig (x: 120..571, y: 45..580)
arch_crop = orig.crop((120, 45, 571, 580))
aw, ah = arch_crop.size

# Scale by 1.08x
new_aw = int(aw * 1.08) # 487px
new_ah = int(ah * 1.08) # 577px
arch_scaled = arch_crop.resize((new_aw, new_ah), Image.Resampling.LANCZOS)

# We want the arch opening center to be at x = 285.5 (screen center)
# In arch_scaled, opening is centered around x = 250.
# So arch_x = 285.5 - 250 = 35!
# Shift down by 26px so keystone top moves from y=55 to y=81:
arch_x = 35
arch_y = 45 + 26 # 71

# Create smooth feather mask for arch
arch_mask = Image.new('L', (new_aw, new_ah), 255)
d_am = ImageDraw.Draw(arch_mask)
# Feather outer edges
for x in range(18):
    alpha = int(255 * (x / 18.0))
    for y in range(new_ah):
        arch_mask.putpixel((x, y), min(arch_mask.getpixel((x, y)), alpha))

for x in range(new_aw - 18, new_aw):
    alpha = int(255 * ((new_aw - x) / 18.0))
    for y in range(new_ah):
        arch_mask.putpixel((x, y), min(arch_mask.getpixel((x, y)), alpha))

# Feather bottom of pillars into hills
for y in range(new_ah - 35, new_ah):
    alpha = int(255 * ((new_ah - y) / 35.0))
    for x in range(new_aw):
        arch_mask.putpixel((x, y), min(arch_mask.getpixel((x, y)), alpha))

arch_mask = arch_mask.filter(ImageFilter.GaussianBlur(radius=3))

clean_plate.paste(arch_scaled, (arch_x, arch_y), arch_mask)

# Step 3: The Authentic Pedestal:
# "First of all, you changed the appearance of the pedestal completely. 
# You changed how the top of it looks, and I don't like the circle. 
# I want something more randomly cracked on the top with crawling vines and stuff. 
# And it's too far back in the photo, it should be much closer to me... 
# And the pedestal should be forward in such a way that the center of the arch is exactly 
# in the center of the circle, hovering exactly over the center, 100% exact over the center, 
# because now it's hovering in front of it."

# Extract authentic original pedestal from orig (x: 45..530, y: 565..1024)
ped_orig = orig.crop((45, 565, 530, 1024))
pw, ph = ped_orig.size

# Scale up by 1.25x so it is much closer to the viewer in the foreground!
new_pw = int(pw * 1.25) # ~606px
new_ph = int(ph * 1.25) # ~573px
ped_scaled = ped_orig.resize((new_pw, new_ph), Image.Resampling.LANCZOS)

# Create soft feather mask for pedestal
ped_mask = Image.new('L', (new_pw, new_ph), 255)
d_pm = ImageDraw.Draw(ped_mask)

# Top rim soft feather (16px)
for y in range(16):
    alpha = int(255 * (y / 16.0))
    d_pm.line([(0, y), (new_pw, y)], fill=alpha)

# Left and right soft edge feather
for x in range(24):
    alpha = int(255 * (x / 24.0))
    for y in range(new_ph):
        cur = ped_mask.getpixel((x, y))
        ped_mask.putpixel((x, y), min(cur, alpha))

for x in range(new_pw - 24, new_pw):
    alpha = int(255 * ((new_pw - x) / 24.0))
    for y in range(new_ph):
        cur = ped_mask.getpixel((x, y))
        ped_mask.putpixel((x, y), min(cur, alpha))

ped_mask = ped_mask.filter(ImageFilter.GaussianBlur(radius=3))

# Center the pedestal horizontally at x = 285.5 (aligned with the arch center!)
ped_x = int((w - new_pw) / 2.0)
# Position forward: top rim at y = 565
ped_y = 565

clean_plate.paste(ped_scaled, (ped_x, ped_y), ped_mask)

# Save master image to brain, public, and dist
out_brain = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/aligned_sanctuary_master.jpg'
out_public = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/irish_celtic_sanctuary.jpg'
out_dist = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/dist/images/irish_celtic_sanctuary.jpg'

final_rgb = clean_plate.convert('RGB')
final_rgb.save(out_brain, quality=96)
final_rgb.save(out_public, quality=96)
final_rgb.save(out_dist, quality=96)
print('Aligned sanctuary master saved successfully!')
