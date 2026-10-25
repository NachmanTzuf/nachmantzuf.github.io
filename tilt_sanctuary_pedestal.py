import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load pristine original sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size # 571 x 1024

result = orig.copy()

# Step 1: Extract authentic cracked stone texture from the altar front blocks
stone_core = orig.crop((160, 640, 410, 780)).convert('RGBA')
# Resize stone core to cover the 390x120 ellipse
top_stone_fill = stone_core.resize((390, 120), Image.Resampling.LANCZOS)

# Create the top ellipse alpha mask
disc_mask = Image.new('L', (390, 120), 0)
d_mask = ImageDraw.Draw(disc_mask)
d_mask.ellipse((2, 2, 388, 118), fill=255)
disc_mask = disc_mask.filter(ImageFilter.GaussianBlur(radius=2))

# Composite stone texture into the expanded ellipse
tilted_disc = Image.new('RGBA', (390, 120), (0, 0, 0, 0))
tilted_disc.paste(top_stone_fill, (0, 0), disc_mask)

# Add subtle Celtic concentric carved rings and clear center marker onto the top stone
d_disc = ImageDraw.Draw(tilted_disc)
dcx, dcy = 195, 60
# Concentric grooves
for frac in [0.28, 0.54, 0.78]:
    erx = 190 * frac
    ery = 60 * frac
    # Dark groove
    d_disc.ellipse((dcx - erx, dcy - ery, dcx + erx, dcy + ery), outline=(22, 28, 24, 175), width=2)
    # Sunlight highlight lip (sun from upper right)
    d_disc.arc((dcx - erx + 1, dcy - ery + 1, dcx + erx + 1, dcy + ery + 1), start=20, end=160, fill=(185, 200, 190, 120), width=1)

# Clear center point marker (Mandate: "you can see very clearly where the center of it is")
d_disc.ellipse((dcx - 6, dcy - 3, dcx + 6, dcy + 3), fill=(18, 24, 20, 240), outline=(185, 200, 190, 220), width=1)
d_disc.ellipse((dcx - 2, dcy - 1, dcx + 2, dcy + 1), fill=(200, 215, 205, 255))

# Natural moss rim around the top perimeter
moss_mask = Image.new('L', (390, 120), 0)
d_moss = ImageDraw.Draw(moss_mask)
d_moss.ellipse((4, 4, 386, 116), outline=210, width=12)
moss_mask = moss_mask.filter(ImageFilter.GaussianBlur(radius=3))
moss_col = Image.new('RGBA', (390, 120), (48, 74, 34, 220))
tilted_disc.paste(moss_col, (0, 0), moss_mask)

# Paste the new tilted top disc at x = 90, y = 575
result.paste(tilted_disc, (90, 575), tilted_disc)

# Step 2: Extract the front drum stone blocks with ivy from original photo (y: 630 to 860)
front_drum = orig.crop((70, 630, 500, 860)).convert('RGBA')
fd_w, fd_h = front_drum.size

# Feather ALL 4 edges of the front drum with a smooth vignette mask so it blends 100% seamlessly
fd_mask = Image.new('L', (fd_w, fd_h), 255)
d_fd = ImageDraw.Draw(fd_mask)

# Top 20px fade
for y in range(20):
    alpha = int(255 * (y / 20.0))
    d_fd.line([(0, y), (fd_w, y)], fill=alpha)

# Bottom 30px fade
for y in range(fd_h - 30, fd_h):
    alpha = int(255 * ((fd_h - y) / 30.0))
    for x in range(fd_w):
        current = fd_mask.getpixel((x, y))
        fd_mask.putpixel((x, y), min(current, alpha))

# Left 25px fade
for x in range(25):
    alpha = int(255 * (x / 25.0))
    for y in range(fd_h):
        current = fd_mask.getpixel((x, y))
        fd_mask.putpixel((x, y), min(current, alpha))

# Right 25px fade
for x in range(fd_w - 25, fd_w):
    alpha = int(255 * ((fd_w - x) / 25.0))
    for y in range(fd_h):
        current = fd_mask.getpixel((x, y))
        fd_mask.putpixel((x, y), min(current, alpha))

fd_mask = fd_mask.filter(ImageFilter.GaussianBlur(radius=4))

# Paste front drum down by 55px (at x = 70, y = 685)
result.paste(front_drum, (70, 685), fd_mask)

# Save final images to brain, public, and dist
out_brain = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/tilted_sanctuary_master.jpg'
out_public = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/irish_celtic_sanctuary.jpg'
out_dist = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/dist/images/irish_celtic_sanctuary.jpg'

final_rgb = result.convert('RGB')
final_rgb.save(out_brain, quality=96)
final_rgb.save(out_public, quality=96)
final_rgb.save(out_dist, quality=96)

print('Tilted sanctuary master successfully generated and synced across brain, public, and dist!')
