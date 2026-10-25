import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load the authentic altar crop from the original photo
altar = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/altar_sample.png').convert('RGBA')
aw, ah = altar.size

# We will generate a master 1024x1024 texture for the Three.js 3D pedestal:
# Top face is UV mapped to the top circle (or we can use separate materials for top and side!)
# In Three.js: MeshStandardMaterial can be applied with multi-materials:
# [sideMaterial, topMaterial, bottomMaterial]!
# That is standard Three.js for CylinderGeometry:
# materials[0] = side mantle
# materials[1] = top disc
# materials[2] = bottom disc

# 1. Top Disc Texture (1024x1024):
# Extract high-detail stone from the top and front stone blocks of the photo
# Front central stone block in altar: x from 160 to 320, y from 80 to 240
stone_core = altar.crop((160, 80, 320, 240)).convert('RGBA')
# Resize with Lanczos to 1024x1024 with subtle seamless mirroring
sc_w, sc_h = stone_core.size
top_mat = Image.new('RGBA', (1024, 1024))
for ix in range(4):
    for iy in range(4):
        patch = stone_core.copy()
        if ix % 2 == 1:
            patch = patch.transpose(Image.FLIP_LEFT_RIGHT)
        if iy % 2 == 1:
            patch = patch.transpose(Image.FLIP_TOP_BOTTOM)
        patch = patch.resize((256, 256), Image.Resampling.LANCZOS)
        top_mat.paste(patch, (ix * 256, iy * 256))

# Apply subtle blur to blend tile seams
top_mat = top_mat.filter(ImageFilter.GaussianBlur(radius=1.5))

# Draw ancient Celtic carved concentric rings and center marker
draw_top = ImageDraw.Draw(top_mat)
cx, cy = 512, 512

# Carved concentric rings with 3D chiseled depth (dark shadow on upper-left, light specular on lower-right)
rings = [110, 220, 340, 440]
for r in rings:
    # Outer dark shadow groove
    draw_top.arc((cx - r, cy - r, cx + r, cy + r), start=135, end=315, fill=(18, 24, 20, 220), width=6)
    # Inner light sunlit catch lip
    draw_top.arc((cx - r + 2, cy - r + 2, cx + r + 2, cy + r + 2), start=315, end=135, fill=(180, 195, 185, 140), width=3)

# Clear Center Focal Medallion (User mandate: "you can see very clearly where the center of it is")
# Distinct ancient Celtic spiral / center stone node
draw_top.ellipse((cx - 28, cy - 28, cx + 28, cy + 28), fill=(22, 28, 24, 230), outline=(175, 190, 180, 200), width=3)
draw_top.ellipse((cx - 10, cy - 10, cx + 10, cy + 10), fill=(190, 205, 195, 240), outline=(22, 28, 24, 255), width=2)

# Radiating natural stone fractures
for deg in [25, 70, 115, 160, 205, 250, 295, 340]:
    rad = math.radians(deg)
    # Slight organic jitter
    x1 = cx + math.cos(rad) * 45
    y1 = cy + math.sin(rad) * 45
    x2 = cx + math.cos(rad) * 480
    y2 = cy + math.sin(rad) * 480
    draw_top.line([(x1, y1), (x2, y2)], fill=(22, 28, 24, 180), width=3)

# Velvet emerald moss perimeter matching the Irish clover tones (#3d5a28)
moss_mask = Image.new('L', (1024, 1024), 0)
d_moss = ImageDraw.Draw(moss_mask)
d_moss.ellipse((20, 20, 1004, 1004), outline=240, width=80)
moss_mask = moss_mask.filter(ImageFilter.GaussianBlur(radius=8))

moss_overlay = Image.new('RGBA', (1024, 1024), (52, 78, 36, 220))
top_mat.paste(moss_overlay, (0, 0), moss_mask)

# Save top face texture
top_out = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/pedestal_top_texture.png'
top_mat.save(top_out)
print('Pedestal top texture saved:', top_out)

# 2. Side Mantle Texture (1024x512):
# Extract the real stone drum blocks and climbing ivy from the photo
# Side blocks in altar: x: 20..450, y: 50..340
side_stone = altar.crop((20, 50, 450, 340)).convert('RGBA')
side_mat = side_stone.resize((1024, 512), Image.Resampling.LANCZOS)

# Subtle shadow gradient (matching sun direction: brighter on right x=700..1024, softer on left)
side_grad = Image.new('RGBA', (1024, 512))
sg_draw = ImageDraw.Draw(side_grad)
for x in range(1024):
    # Left side (x=0) slightly cooler/darker, right side (x=1024) warmer sunlight
    factor = 0.5 + 0.5 * math.sin((x / 1024.0) * math.pi)
    alpha = int(35 * (1.0 - factor))
    sg_draw.line([(x, 0), (x, 512)], fill=(12, 18, 14, alpha))

side_mat.paste(side_grad, (0, 0), side_grad)

side_out = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/pedestal_side_texture.png'
side_mat.save(side_out)
print('Pedestal side texture saved:', side_out)
