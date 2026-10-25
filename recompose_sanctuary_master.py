import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load pristine original sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size # 571 x 1024

# Canvas for new master composition
comp = Image.new('RGBA', (w, h), (0, 0, 0, 255))

# 1. Base Landscape Layer (Sky, distant ocean, Cliffs of Moher, green rolling hills)
# Copy original as foundation
comp.paste(orig, (0, 0))

# 2. The Arch: "a little bit down and a little bit bigger"
# Extract arch from orig (x: 100..571, y: 40..580)
arch_crop = orig.crop((100, 40, 571, 580))
arch_w, arch_h = arch_crop.size

# Scale up by 1.08x (8% bigger per user mandate)
new_arch_w = int(arch_w * 1.08)
new_arch_h = int(arch_h * 1.08)
arch_scaled = arch_crop.resize((new_arch_w, new_arch_h), Image.Resampling.LANCZOS)

# Create soft alpha mask for arch so its edges blend naturally into the sky and distant hills
arch_mask = Image.new('L', (new_arch_w, new_arch_h), 255)
# Feather the bottom of the pillars so they seat into the hills
d_am = ImageDraw.Draw(arch_mask)
for y in range(new_arch_h - 40, new_arch_h):
    alpha = int(255 * ((new_arch_h - y) / 40.0))
    d_am.line([(0, y), (new_arch_w, y)], fill=alpha)
arch_mask = arch_mask.filter(ImageFilter.GaussianBlur(radius=3))

# Position arch: shifted down by 26px and centered
arch_paste_x = int(100 - (new_arch_w - arch_w) * 0.5)
arch_paste_y = 40 + 26 # 26px down per user mandate

comp.paste(arch_scaled, (arch_paste_x, arch_paste_y), arch_mask)

# 3. Clean grass/mist blend across the midground (y: 530..660) so the background under the arch is clean
mid_grass = orig.crop((10, 520, 560, 600)).filter(ImageFilter.GaussianBlur(radius=4))
# Gentle horizontal blend across center
comp.paste(mid_grass, (10, 540))

# 4. The Authentic Pedestal:
# User mandate: "First of all, you changed the appearance of the pedestal completely. 
# You changed how the top of it looks, and I don't like the circle. 
# I want something more randomly cracked on the top with crawling vines and stuff. 
# And it's too far back in the photo, it should be much closer to me... 
# And the pedestal should be forward in such a way that the center of the arch is exactly 
# in the center of the circle, hovering exactly over the center, 100% exact over the center, 
# because now it's hovering in front of it."

# Extract the AUTHENTIC ORIGINAL pedestal from orig (x: 40..530, y: 565..1024)
# This original crop has the real randomly cracked stone slabs, natural crevices, 
# crawling ivy vines, and four-leaf clovers!
ped_orig = orig.crop((40, 565, 530, 1024)).convert('RGBA')
pw, ph = ped_orig.size # 490 x 459

# Scale up by 1.22x so it is much closer to the viewer in the foreground!
ped_w = int(pw * 1.22) # ~598px wide
ped_h = int(ph * 1.22) # ~560px tall
ped_scaled = ped_orig.resize((ped_w, ped_h), Image.Resampling.LANCZOS)

# Create feathered mask for the pedestal
ped_mask = Image.new('L', (ped_w, ped_h), 255)
d_pm = ImageDraw.Draw(ped_mask)

# Top edge feathering: soft 14px fade along the top rim so it blends with background mist
for y in range(14):
    alpha = int(255 * (y / 14.0))
    d_pm.line([(0, y), (ped_w, y)], fill=alpha)

# Left and right soft edge feathering
for x in range(20):
    alpha = int(255 * (x / 20.0))
    for y in range(ped_h):
        cur = ped_mask.getpixel((x, y))
        ped_mask.putpixel((x, y), min(cur, alpha))

for x in range(ped_w - 20, ped_w):
    alpha = int(255 * ((ped_w - x) / 20.0))
    for y in range(ped_h):
        cur = ped_mask.getpixel((x, y))
        ped_mask.putpixel((x, y), min(cur, alpha))

ped_mask = ped_mask.filter(ImageFilter.GaussianBlur(radius=3))

# Position the pedestal:
# Center horizontally at x = 285.5 (screen center)
# Move forward/down so the top surface of the pedestal is positioned directly where the harp hovers!
# In ped_scaled:
# The top circular surface is at y: 15..100 inside ped_scaled
# We want the top circular surface center to be at y ≈ 620 in the final image
ped_paste_x = int((w - ped_w) / 2.0)
ped_paste_y = 570 # Places the top surface of the pedestal at y ≈ 615..630

comp.paste(ped_scaled, (ped_paste_x, ped_paste_y), ped_mask)

# Save test image
out_test = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/test_recomposed_sanctuary.jpg'
comp.convert('RGB').save(out_test, quality=96)
print('Recomposed sanctuary saved to:', out_test)
