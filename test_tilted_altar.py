import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load original pristine master sanctuary image
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')
w, h = orig.size # 571 x 1024

# Let's inspect the altar position in orig:
# Drum horizontal center: x = 285.5
# Altar drum left: ~85, right: ~485 (width ~400px)
# Original top rim: y=575 to y=635 (height only 60px)
# Altar drum bottom: y=860

# We want:
# 1. The top circular stone face to be tilted towards the viewer so it is a full, deep ellipse:
#    width = 370px (rx = 185px)
#    height = 170px (ry = 85px) -> tilt angle = asin(85/185) ≈ 27.4 degrees!
#    Center of top circular face: cx = 285.5, cy = 605
#    Top boundary of ellipse: cy - ry = 520
#    Bottom boundary of ellipse: cy + ry = 690
# 2. Inside the ellipse:
#    High-resolution authentic Irish granite stone texture extracted from the photo's stone facets,
#    with concentric carved Celtic stone rings, radiating ancient cracks, and a clear center point!
# 3. Perimeter of the ellipse:
#    Deep velvet emerald moss and climbing ivy tendrils wrapping seamlessly around the rim!
# 4. Front drum body:
#    The massive beveled megalithic stone blocks and cascading clover leaves from the original photo,
#    positioned from y = 660 to y = 880!

# Let's extract stone texture patches from the original photo's stone blocks
# Patch A: Clean cracked granite from the drum front (x: 200..370, y: 640..750)
stone_patch = orig.crop((200, 640, 370, 750)).convert('RGBA')

# Create the new composited image starting from orig
result = orig.copy()

# Step 1: Cleanly blend the background grass/mist behind the top of the altar (between y=490 and y=560)
# so the taller background behind the new tilted disc shows natural Irish coastal turf
bg_grass = orig.crop((60, 480, 510, 540)).filter(ImageFilter.GaussianBlur(radius=3))
result.paste(bg_grass, (60, 500))

# Step 2: Build the photorealistic tilted top disc (width 370, height 170)
disc_w = 380
disc_h = 176
rx = disc_w / 2.0
ry = disc_h / 2.0
cx = disc_w / 2.0
cy = disc_h / 2.0

disc_img = Image.new('RGBA', (disc_w, disc_h), (0, 0, 0, 0))

# Sample and tile the real photo stone texture seamlessly onto the disc
stone_tiled = stone_patch.resize((disc_w, disc_h), Image.Resampling.LANCZOS)

# Create ellipse alpha mask
mask = Image.new('L', (disc_w, disc_h), 0)
draw_mask = ImageDraw.Draw(mask)
draw_mask.ellipse((2, 2, disc_w - 3, disc_h - 3), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(radius=2))

# Apply mask to stone texture
disc_img.paste(stone_tiled, (0, 0), mask)

# Draw Celtic stone carved concentric rings and center marker onto the stone texture
disc_draw = ImageDraw.Draw(disc_img)

# Concentric carved groove rings (matching user mandate)
# Dark carved grooves with subtle sunlight specular rim
ring_radii = [0.22, 0.44, 0.68, 0.88]
for r_frac in ring_radii:
    r_x = rx * r_frac
    r_y = ry * r_frac
    # Dark groove
    disc_draw.ellipse(
        (cx - r_x, cy - r_y, cx + r_x, cy + r_y),
        outline=(25, 32, 28, 160),
        width=3
    )
    # Sunlight highlight on bottom lip of groove
    disc_draw.arc(
        (cx - r_x + 1, cy - r_y + 1, cx + r_x + 1, cy + r_y + 1),
        start=20,
        end=160,
        fill=(160, 175, 165, 120),
        width=1
    )

# Clear center point marker (user mandate: "you can see very clearly where the center of it is")
# Distinct Celtic sun medallion / carved center stone marker
disc_draw.ellipse(
    (cx - 8, cy - 4, cx + 8, cy + 4),
    fill=(22, 28, 24, 220),
    outline=(140, 155, 145, 180),
    width=1
)

# Radiating ancient stone fracture cracks
for angle_deg in [30, 75, 120, 165, 210, 255, 300, 345]:
    rad = math.radians(angle_deg)
    x1 = cx + math.cos(rad) * (rx * 0.12)
    y1 = cy + math.sin(rad) * (ry * 0.12)
    x2 = cx + math.cos(rad) * (rx * 0.94)
    y2 = cy + math.sin(rad) * (ry * 0.94)
    disc_draw.line([(x1, y1), (x2, y2)], fill=(28, 35, 30, 130), width=2)

# Outer velvet moss rim (emerald green matching photo clovers)
moss_rim_mask = Image.new('L', (disc_w, disc_h), 0)
moss_draw = ImageDraw.Draw(moss_rim_mask)
moss_draw.ellipse((6, 6, disc_w - 7, disc_h - 7), outline=220, width=14)
moss_rim_mask = moss_rim_mask.filter(ImageFilter.GaussianBlur(radius=3))

moss_color = Image.new('RGBA', (disc_w, disc_h), (48, 72, 32, 210))
disc_img.paste(moss_color, (0, 0), moss_rim_mask)

# Position the tilted disc on the result:
# Center of disc at x=285.5, y=595
disc_paste_x = int(285.5 - cx)
disc_paste_y = int(595 - cy)

# Composite disc onto result
result.paste(disc_img, (disc_paste_x, disc_paste_y), disc_img)

# Step 3: Layer the authentic front rim and drum stones with clover leaves from original photo
# Front rim of original altar from y=625 to y=880
front_rim = orig.crop((70, 625, 500, 880)).convert('RGBA')
# Soft mask for top edge of front rim to blend smoothly over the tilted disc front
fr_w, fr_h = front_rim.size
fr_mask = Image.new('L', (fr_w, fr_h), 255)
fr_draw = ImageDraw.Draw(fr_mask)
# Top 25px gradient fade
for y in range(25):
    alpha = int(255 * (y / 25.0))
    fr_draw.line([(0, y), (fr_w, y)], fill=alpha)

result.paste(front_rim, (70, 625), fr_mask)

# Save test result
out_test = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/test_tilted_altar.jpg'
result.convert('RGB').save(out_test, quality=95)
print('Test image saved:', out_test)
