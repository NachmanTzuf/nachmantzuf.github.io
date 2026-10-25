from PIL import Image, ImageFilter, ImageDraw
import numpy as np

# Load current image
img_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/sanctuary_compact_foreground.jpg'
img = Image.open(img_path).convert('RGBA')
w, h = img.size # 571 x 1024

# Let's inspect the pedestal:
# In sanctuary_compact_foreground.jpg:
# Pedestal is centered around x = 285.5.
# Top surface is y: [710, 755].
# The user wants:
# 1. "Move the round thingy that the harp is rotating above also a little bit down"
# 2. "we don't see the full circle, so in some sort of a way, tilt it just a tiny bit so it will be clearly in the middle."
# 3. "The harp rotation should be exactly in the middle of the picture and in the middle of the round statue."

# Let's shift the pedestal down by 25px:
# Currently top rim is at y = 710. Moving it down 25px places top rim at y = 735.
# And let's open up the perspective of the circular stone plate!
# If we stretch the top surface vertically by 1.35x (from y = 710 to 765),
# it transforms the shallow oval into an open, clearly visible stone circle disc!

# Crop the stone top plate:
# Top plate in sanctuary_compact_foreground.jpg is roughly x: [110, 460], y: [710, 765]
plate_crop = img.crop((100, 710, 470, 775))
pw, ph = plate_crop.size

# Stretch vertically by 1.3x to tilt the circle open towards the camera
tilted_ph = int(ph * 1.32)
tilted_top = plate_crop.resize((pw, tilted_ph), Image.Resampling.LANCZOS)

# Create an alpha mask that smoothly feathers the rim
top_mask = Image.new('L', (pw, tilted_ph), 255)
tm_draw = ImageDraw.Draw(top_mask)
for i in range(15):
    tm_draw.line([(0, i), (pw, i)], fill=int(255 * (i / 15.0)))
    tm_draw.line([(0, tilted_ph - 1 - i), (pw, tilted_ph - 1 - i)], fill=int(255 * (i / 15.0)))
for i in range(12):
    val = int(255 * (i / 12.0))
    tm_draw.line([(i, 0), (i, tilted_ph)], fill=val)
    tm_draw.line([(pw - 1 - i, 0), (pw - 1 - i, tilted_ph)], fill=val)

top_mask = top_mask.filter(ImageFilter.GaussianBlur(2))

# Now, let's take the entire pedestal (including body and ivy) and shift it DOWN by 25px:
ped_whole = img.crop((80, 705, 490, 1024))
p_w, p_h = ped_whole.size

# New canvas
result = img.copy()

# Sample the green grass above the pedestal (y = 650 to 715) to fill the 25px gap
grass_sample = img.crop((80, 650, 490, 715)).resize((p_w, 35), Image.Resampling.LANCZOS)
result.paste(grass_sample, (80, 705))

# Paste the whole pedestal shifted down by 25px (top rim now at y = 735)
ped_mask_whole = Image.new('L', (p_w, p_h), 255)
pm_draw = ImageDraw.Draw(ped_mask_whole)
for i in range(18):
    pm_draw.line([(0, i), (p_w, i)], fill=int(255 * (i / 18.0)))
ped_mask_whole = ped_mask_whole.filter(ImageFilter.GaussianBlur(2))

result.paste(ped_whole, (80, 730), ped_mask_whole)

# Now paste the tilted, open top plate onto the top of the lowered pedestal:
# Position of the open circle top plate:
# Centered at x = 285.5, y = 726
top_x = (w - pw) // 2
top_y = 724

result.paste(tilted_top, (top_x, top_y), top_mask)

# Save result
output_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/sanctuary_tilted_lowered.jpg'
result.convert('RGB').save(output_path, quality=95)
print("Saved sanctuary_tilted_lowered.jpg successfully!")
