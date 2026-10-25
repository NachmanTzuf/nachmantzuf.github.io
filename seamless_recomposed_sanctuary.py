from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load pristine original sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size # 571 x 1024

comp = Image.new('RGBA', (w, h), (0, 0, 0, 255))

# Step 1: Base Landscape & Sky
# In orig, the upper world (Sky + Arch + Cliffs of Moher + distant ocean) is from y=0 to y=640
upper_world = orig.crop((0, 0, w, 640))
uw_w, uw_h = upper_world.size

# Scale arch & upper world by 1.09x ("a little bit down and a little bit bigger")
scale_factor = 1.09
scaled_uw_w = int(uw_w * scale_factor) # 622px
scaled_uw_h = int(uw_h * scale_factor) # 697px
upper_scaled = upper_world.resize((scaled_uw_w, scaled_uw_h), Image.Resampling.LANCZOS)

# Shift arch so its central opening aligns with screen center (x = 285.5)
# Shift down by 26px ("a little bit down")
shift_x = int((w - scaled_uw_w) / 2.0) - 25 # -50px
shift_y = 26

comp.paste(upper_scaled, (shift_x, shift_y))

# Step 2: The Authentic Foreground Pedestal:
# Directives:
# 1. "First of all, you changed the appearance of the pedestal completely. 
#     You changed how the top of it looks, and I don't like the circle. 
#     I want something more randomly cracked on the top with crawling vines and stuff."
# 2. "And it's too far back in the photo, it should be much closer to me."
# 3. "And the pedestal should be forward in such a way that the center of the arch is exactly 
#     in the center of the circle, hovering exactly over the center, 100% exact over the center, 
#     because now it's hovering in front of it."

# Extract authentic original pedestal from orig (x: 45..530, y: 565..1024)
# Contains the real randomly cracked stone slabs, natural fissures, crawling vines, and clover
ped_orig = orig.crop((45, 565, 530, 1024))
pw, ph = ped_orig.size

# Scale up by 1.45x so it is brought even closer to the viewer in the immediate foreground!
new_pw = int(pw * 1.45) # ~703px wide
new_ph = int(ph * 1.45) # ~665px tall
ped_scaled = ped_orig.resize((new_pw, new_ph), Image.Resampling.LANCZOS)

# Soft feathering mask for the pedestal perimeter
ped_mask = Image.new('L', (new_pw, new_ph), 255)
d_pm = ImageDraw.Draw(ped_mask)

# Top rim soft feather (18px) so the mossy rim blends naturally into the green hills behind it
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

# Center the pedestal horizontally at x = 285.5 (aligned with the harp and arch center!)
ped_x = int((w - new_pw) / 2.0)
# Position forward/down: top rim at y = 695
# Front rim lands at y = 695 + 125 = 820 in 1024px photo (y = 697.8px on screen, directly above play button at 707px)
# Center of the circular cracked stone top lands at y = 695 + 81 = 776 (y = 667.4px on screen)
ped_y = 695

comp.paste(ped_scaled, (ped_x, ped_y), ped_mask)

# Save master image to brain, public, and dist
out_brain = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/foreground_sanctuary_master.jpg'
out_public = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/irish_celtic_sanctuary.jpg'
out_dist = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/dist/images/irish_celtic_sanctuary.jpg'

final_rgb = comp.convert('RGB')
final_rgb.save(out_brain, quality=96)
final_rgb.save(out_public, quality=96)
final_rgb.save(out_dist, quality=96)
print('Foreground sanctuary master saved successfully!')
