import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load original clean sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')

# Extract large non-mirrored stone block from the left megalithic pillar (x: 140..310, y: 460..700)
# This pillar stone has glorious natural Atlantic granite fissures, lichen, and moss!
pillar_stone = orig.crop((140, 460, 310, 700)).convert('RGBA')
pw, ph = pillar_stone.size

# We want a 1024x1024 top texture
# Resize pillar stone with high quality Lanczos to 1024x1024
top_base = pillar_stone.resize((1024, 1024), Image.Resampling.LANCZOS)

# Blend with a subtle second layer rotated 90 degrees at 35% opacity to break any directional bias
layer2 = top_base.rotate(90).convert('RGBA')
top_blended = Image.blend(top_base, layer2, 0.35)

# Adjust tone to match the pedestal drum (#525d56)
arr = np.array(top_blended, dtype=np.float32)
# Slightly desaturate and match green-grey granite
mean_lum = np.mean(arr[:, :, :3], axis=2, keepdims=True)
arr[:, :, :3] = arr[:, :, :3] * 0.7 + mean_lum * 0.3
arr[:, :, 1] = np.clip(arr[:, :, 1] * 1.05, 0, 255) # subtle mossy green hint
top_stone = Image.fromarray(np.uint8(arr))

# Now create an overlay for the ancient Celtic carved concentric rings and center marker
overlay = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay)
cx, cy = 512, 512

# 1. Concentric Celtic Rings:
# Rather than thin single lines, these are wide chiseled grooves (8px wide)
# with a dark shadow side (facing northwest) and a warm sunlight rim (facing southeast)
rings = [130, 245, 360, 455]
for r in rings:
    # Deep carved groove body
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(18, 24, 20, 190), width=8)
    # Sunlight highlight on the southern/eastern edge (sun is upper right)
    draw.arc((cx - r + 3, cy - r + 3, cx + r + 3, cy + r + 3), start=280, end=100, fill=(185, 200, 190, 150), width=4)

# 2. Distinct Center Focal Marker (Mandate: "you can see very clearly where the center of it is")
# Ancient Celtic Sun / Triskelion central carved medallion
# Outer ring
draw.ellipse((cx - 36, cy - 36, cx + 36, cy + 36), fill=(24, 30, 26, 220), outline=(185, 200, 190, 220), width=4)
# Middle ring
draw.ellipse((cx - 20, cy - 20, cx + 20, cy + 20), outline=(16, 22, 18, 240), width=3)
# Central raised golden-granite boss
draw.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=(180, 195, 185, 255), outline=(18, 24, 20, 255), width=2)
# Tiny center pip
draw.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=(12, 16, 14, 255))

# 3. Radiating ancient stone fractures
for angle in [20, 65, 110, 155, 200, 245, 290, 335]:
    rad = math.radians(angle)
    x1 = cx + math.cos(rad) * 42
    y1 = cy + math.sin(rad) * 42
    x2 = cx + math.cos(rad) * 485
    y2 = cy + math.sin(rad) * 485
    # Shadow line
    draw.line([(x1, y1), (x2, y2)], fill=(20, 26, 22, 160), width=4)
    # Highlight lip
    draw.line([(x1 + 1, y1 + 1), (x2 + 1, y2 + 1)], fill=(170, 185, 175, 90), width=2)

# 4. Organic Irish Velvet Moss Border around the perimeter
moss_mask = Image.new('L', (1024, 1024), 0)
m_draw = ImageDraw.Draw(moss_mask)
# Irregular moss edge with micro-variations
for a in range(0, 360, 2):
    rad = math.radians(a)
    r_moss = 475 + 18 * math.sin(a * 0.1) + 12 * math.cos(a * 0.25)
    x = cx + math.cos(rad) * r_moss
    y = cy + math.sin(rad) * r_moss
    m_draw.ellipse((x - 24, y - 24, x + 24, y + 24), fill=210)
moss_mask = moss_mask.filter(ImageFilter.GaussianBlur(radius=12))

# Moss color matching the photo clovers (#3c5826)
moss_color = Image.new('RGBA', (1024, 1024), (55, 82, 38, 230))
top_stone.paste(moss_color, (0, 0), moss_mask)

# Composite carvings onto stone
top_stone.paste(overlay, (0, 0), overlay)

# Save final diffuse texture
diffuse_path = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/pedestal_top_realistic.png'
top_stone.save(diffuse_path)
print('Realistic top diffuse texture saved:', diffuse_path)

# Also generate normal/bump map for true 3D lighting!
# Convert to grayscale for heightmap
gray = top_stone.convert('L')
g_arr = np.array(gray, dtype=np.float32)
# Sobel filter in numpy
gx = np.zeros_like(g_arr)
gy = np.zeros_like(g_arr)
gx[:, 1:-1] = (g_arr[:, 2:] - g_arr[:, :-2]) * 0.5
gy[1:-1, :] = (g_arr[2:, :] - g_arr[:-2, :]) * 0.5

# Normal vector (nx, ny, nz)
strength = 2.5
nz = np.ones_like(g_arr) * (255.0 / strength)
length = np.sqrt(gx**2 + gy**2 + nz**2)
nx = (gx / length) * 127.5 + 127.5
ny = (gy / length) * 127.5 + 127.5
nz = (nz / length) * 127.5 + 127.5

normal_arr = np.stack([nx, ny, nz], axis=2).astype(np.uint8)
normal_img = Image.fromarray(normal_arr)
normal_path = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/pedestal_top_normal.png'
normal_img.save(normal_path)
print('Realistic top normal map saved:', normal_path)
