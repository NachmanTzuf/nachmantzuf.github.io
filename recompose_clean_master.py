import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load pristine original sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size # 571 x 1024

comp = Image.new('RGBA', (w, h), (0, 0, 0, 255))

# Step 1: Clean Sky Background Foundation
# Fill the top area (y: 0..120) with seamless misty sky extended from y: 0..50
sky_strip = orig.crop((0, 0, w, 50))
sky_extended = sky_strip.resize((w, 120), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(radius=2))
comp.paste(sky_extended, (0, 0))

# Paste the rest of the landscape (hills, ocean, Cliffs of Moher) below y = 50
landscape = orig.crop((0, 50, w, h))
comp.paste(landscape, (0, 50))

# Clean inpaint over the old arch keystone at (x: 230..340, y: 50..85) so there is zero ghosting
old_keystone_patch = sky_strip.crop((230, 10, 340, 45)).resize((110, 35), Image.Resampling.LANCZOS)
comp.paste(old_keystone_patch, (230, 50))

# Step 2: The Arch: "a little bit down and a little bit bigger"
# Extract complete arch with pillars (x: 120..571, y: 50..580)
# In orig:
# Left pillar starts at x = 125
# Right pillar terminates at x = 571
# Keystone top is at y = 55
arch_crop = orig.crop((120, 50, 571, 580))
aw, ah = arch_crop.size

# Scale up by 1.07x (7% bigger)
new_aw = int(aw * 1.07)
new_ah = int(ah * 1.07)
arch_scaled = arch_crop.resize((new_aw, new_ah), Image.Resampling.LANCZOS)

# Create precise alpha mask for arch
# Background inside and outside the arch is sky/mist, pillars are solid stone
# We create a soft mask around the outer bounds
arch_mask = Image.new('L', (new_aw, new_ah), 255)
d_am = ImageDraw.Draw(arch_mask)
# Feather the bottom of the pillars into the green hill
for y in range(new_ah - 35, new_ah):
    alpha = int(255 * ((new_ah - y) / 35.0))
    d_am.line([(0, y), (new_aw, y)], fill=alpha)
arch_mask = arch_mask.filter(ImageFilter.GaussianBlur(radius=3))

# Position the arch:
# Shift down by 24px so keystone top moves from y=55 to y=79 (leaving clean sky above!)
# Center horizontally
arch_x = int(120 - (new_aw - aw) * 0.5)
arch_y = 50 + 24

comp.paste(arch_scaled, (arch_x, arch_y), arch_mask)

# Step 3: The Authentic Pedestal:
# "First of all, you changed the appearance of the pedestal completely. 
# You changed how the top of it looks, and I don't like the circle. 
# I want something more randomly cracked on the top with crawling vines and stuff. 
# And it's too far back in the photo, it should be much closer to me... 
# And the pedestal should be forward in such a way that the center of the arch is exactly 
# in the center of the circle, hovering exactly over the center, 100% exact over the center, 
# because now it's hovering in front of it."

# Extract the authentic original pedestal from orig (x: 40..535, y: 565..1024)
ped_orig = orig.crop((40, 565, 535, 1024))
pw, ph = ped_orig.size # 495 x 459

# Scale up by 1.22x so it is much closer to the viewer in the foreground!
new_pw = int(pw * 1.22) # ~604px
new_ph = int(ph * 1.22) # ~560px
ped_scaled = ped_orig.resize((new_pw, new_ph), Image.Resampling.LANCZOS)

# Soft feathering mask for the pedestal perimeter
ped_mask = Image.new('L', (new_pw, new_ph), 255)
d_pm = ImageDraw.Draw(ped_mask)

# Top rim soft feather (16px) so the mossy rim blends naturally into the background hill and pillar bases
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

# Center the pedestal horizontally at x = 285.5
ped_x = int((w - new_pw) / 2.0)
# Position forward: top of pedestal at y = 565
ped_y = 565

comp.paste(ped_scaled, (ped_x, ped_y), ped_mask)

# Save master image to brain, public, and dist
out_brain = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/recomposed_clean_sanctuary.jpg'
out_public = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/irish_celtic_sanctuary.jpg'
out_dist = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/dist/images/irish_celtic_sanctuary.jpg'

final_rgb = comp.convert('RGB')
final_rgb.save(out_brain, quality=96)
final_rgb.save(out_public, quality=96)
final_rgb.save(out_dist, quality=96)
print('Master sanctuary successfully recomposed and saved to brain, public, and dist!')
