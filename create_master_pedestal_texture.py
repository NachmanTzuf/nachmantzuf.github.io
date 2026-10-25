import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load original clean sanctuary photo
orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg').convert('RGBA')

# 1. Master Top Disc Texture (1024 x 1024)
# Extract granite patch from central megalithic block
altar = orig.crop((70, 560, 500, 880)).convert('RGBA')
# Granite block without ivy: x=140..280, y=60..200 inside altar crop
granite = altar.crop((140, 60, 280, 200)).convert('RGBA')
gw, gh = granite.size

# We will create an organic, seamless 1024x1024 granite base
# by multi-scale blending of granite at different scales and rotations (no 4-way mirroring!)
base = Image.new('RGBA', (1024, 1024))
# Layer 1: Scaled granite
l1 = granite.resize((1024, 1024), Image.Resampling.LANCZOS)
# Layer 2: Rotated 45 degrees, cropped and resized
l2 = granite.rotate(45, expand=True).resize((1024, 1024), Image.Resampling.LANCZOS)
# Layer 3: Rotated 120 degrees
l3 = granite.rotate(120, expand=True).resize((1024, 1024), Image.Resampling.LANCZOS)

# Blend layers
blend1 = Image.blend(l1, l2, 0.42)
top_stone = Image.blend(blend1, l3, 0.35)

# Adjust tone to match the weathered Irish Atlantic limestone (#6b7670)
arr = np.array(top_stone, dtype=np.float32)
mean_c = np.mean(arr[:, :, :3], axis=2, keepdims=True)
arr[:, :, 0] = arr[:, :, 0] * 0.65 + mean_c[:, :, 0] * 0.35
arr[:, :, 1] = arr[:, :, 1] * 0.70 + mean_c[:, :, 0] * 0.30 + 4 # subtle moss hint
arr[:, :, 2] = arr[:, :, 2] * 0.65 + mean_c[:, :, 0] * 0.35
arr = np.clip(arr, 0, 255)
top_stone = Image.fromarray(np.uint8(arr))

# Draw ancient carved Celtic concentric rings
# In ancient Celtic megaliths (Newgrange, Knowth, Tara), rings are carved with a chisel:
# They have organic irregularity, soft width variation (5-8px), deep shadow on north/west, and light sun catch on south/east.
cx, cy = 512, 512
draw = ImageDraw.Draw(top_stone)

rings_config = [
    (115, 6),
    (230, 8),
    (345, 9),
    (450, 10),
]

for r_mean, width in rings_config:
    # Draw slightly wavy chiseled groove by computing points with organic jitter
    pts_shadow = []
    pts_sun = []
    for a in range(0, 360, 3):
        rad = math.radians(a)
        # 2% organic wobble in radius
        jitter = 3.5 * math.sin(rad * 5.0) + 2.0 * math.cos(rad * 9.0)
        r_actual = r_mean + jitter
        px = cx + math.cos(rad) * r_actual
        py = cy + math.sin(rad) * r_actual
        if 110 <= a <= 290:
            pts_shadow.append((px, py))
        else:
            pts_sun.append((px, py))

    # Shadow groove (north/west facing)
    for p in pts_shadow:
        draw.ellipse((p[0] - width/2, p[1] - width/2, p[0] + width/2, p[1] + width/2), fill=(18, 24, 20, 210))
    # Sunlit groove edge (south/east facing)
    for p in pts_sun:
        draw.ellipse((p[0] - width/2, p[1] - width/2, p[0] + width/2, p[1] + width/2), fill=(24, 30, 26, 170))
        # Specular lip on inner edge
        draw.ellipse((p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 2), fill=(190, 205, 195, 130))

# Clear Celtic Center Focal Medallion (Mandate: "you can see very clearly where the center of it is")
# Concentric ancient boss with gold-granite center
# Outer carved circle
draw.ellipse((cx - 32, cy - 32, cx + 32, cy + 32), fill=(22, 28, 24, 240), outline=(180, 195, 185, 230), width=4)
# Inner ring
draw.ellipse((cx - 18, cy - 18, cx + 18, cy + 18), fill=(42, 50, 44, 255), outline=(16, 22, 18, 255), width=3)
# Central raised stone boss
draw.ellipse((cx - 9, cy - 9, cx + 9, cy + 9), fill=(195, 210, 200, 255), outline=(22, 28, 24, 255), width=2)
draw.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=(14, 18, 15, 255))

# Radiating natural stone fractures
for angle in [22, 68, 112, 158, 202, 248, 292, 338]:
    rad = math.radians(angle)
    # Organic jagged line
    cur_x = cx + math.cos(rad) * 38
    cur_y = cy + math.sin(rad) * 38
    steps = 14
    step_len = (460.0 - 38.0) / steps
    for s in range(steps):
        next_x = cur_x + math.cos(rad) * step_len + (np.random.rand() - 0.5) * 5.0
        next_y = cur_y + math.sin(rad) * step_len + (np.random.rand() - 0.5) * 5.0
        draw.line([(cur_x, cur_y), (next_x, next_y)], fill=(18, 24, 20, 190), width=3)
        draw.line([(cur_x + 1, cur_y + 1), (next_x + 1, next_y + 1)], fill=(175, 190, 180, 80), width=1)
        cur_x, cur_y = next_x, next_y

# Velvet emerald moss growing from perimeter into the outer ring
moss_mask = Image.new('L', (1024, 1024), 0)
d_moss = ImageDraw.Draw(moss_mask)
for a in range(0, 360):
    rad = math.radians(a)
    # Organic moss penetration depth
    depth = 460 + 25 * math.sin(rad * 7) + 18 * math.cos(rad * 13)
    x = cx + math.cos(rad) * depth
    y = cy + math.sin(rad) * depth
    d_moss.ellipse((x - 30, y - 30, x + 30, y + 30), fill=220)
moss_mask = moss_mask.filter(ImageFilter.GaussianBlur(radius=10))

moss_color = Image.new('RGBA', (1024, 1024), (54, 80, 38, 230))
top_stone.paste(moss_color, (0, 0), moss_mask)

# Save master top diffuse texture
top_out = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/pedestal_top_master.png'
top_stone.save(top_out)
print('Master top texture saved:', top_out)

# Normal map for 3D light response
gray = top_stone.convert('L')
g_arr = np.array(gray, dtype=np.float32)
gx = np.zeros_like(g_arr)
gy = np.zeros_like(g_arr)
gx[:, 1:-1] = (g_arr[:, 2:] - g_arr[:, :-2]) * 0.5
gy[1:-1, :] = (g_arr[2:, :] - g_arr[:-2, :]) * 0.5

strength = 2.2
nz = np.ones_like(g_arr) * (255.0 / strength)
length = np.sqrt(gx**2 + gy**2 + nz**2)
nx = (gx / length) * 127.5 + 127.5
ny = (gy / length) * 127.5 + 127.5
nz = (nz / length) * 127.5 + 127.5

normal_arr = np.stack([nx, ny, nz], axis=2).astype(np.uint8)
normal_img = Image.fromarray(normal_arr)
normal_out = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/pedestal_top_master_normal.png'
normal_img.save(normal_out)
print('Master top normal map saved:', normal_out)

# 2. Master Side Mantle Texture (1024 x 512)
# Use the real photo's stone altar blocks with ivy and clovers
side_raw = altar.crop((20, 35, 410, 310)).convert('RGBA')
side_scaled = side_raw.resize((1024, 512), Image.Resampling.LANCZOS)

# Feather bottom edge into dark earth so it blends cleanly
side_draw = ImageDraw.Draw(side_scaled)
for y in range(430, 512):
    alpha = int(255 * ((y - 430) / 82.0) * 0.45)
    side_draw.line([(0, y), (1024, y)], fill=(12, 16, 13, alpha))

side_out = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/images/pedestal_side_master.png'
side_scaled.save(side_out)
print('Master side texture saved:', side_out)
