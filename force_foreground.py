from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import numpy as np

src_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg'
src = Image.open(src_path).convert('RGBA')
w, h = src.size # 571 x 1024

# Let's extract the stone pedestal cleanly with its ivy
# In src:
# Flat circular top: x: [140, 460], y: [585, 640]
# Drum / wall with ivy: x: [110, 490], y: [635, 880]
# Bottom clover / ground: x: [50, 520], y: [880, 1024]
ped_crop = src.crop((50, 580, 520, 1024))
pw, ph = ped_crop.size

# User directive:
# "force it to move this closer? And also, it needs to get a bit smaller as it moves closer
# because automatically it will look bigger if it's closer. So, to save the exact dimensions
# that it looks even though it's moving closer, I need to force it to move it closer."

# The original pedestal was 470px wide (82% of screen width).
# If we scale it down to ~0.72x, its width becomes 470 * 0.72 = 338px (approx 59% of screen width).
# Or scale 0.65x -> width 305px (approx 53% of screen width).
ped_scale = 0.68
compact_pw = int(pw * ped_scale)
compact_ph = int(ph * ped_scale)
compact_ped = ped_crop.resize((compact_pw, compact_ph), Image.Resampling.LANCZOS)

# Create an elliptical feather mask for the pedestal so it sits into the grass naturally
ped_mask = Image.new('L', (compact_pw, compact_ph), 255)
p_draw = ImageDraw.Draw(ped_mask)
# Top edge feathering
for i in range(20):
    alpha = int(255 * (i / 20.0))
    p_draw.line([(0, i), (compact_pw, i)], fill=alpha)
# Left and right side feathering
for i in range(18):
    alpha = int(255 * (i / 18.0))
    p_draw.line([(i, 0), (i, compact_ph)], fill=min(alpha, 255))
    p_draw.line([(compact_pw - 1 - i, 0), (compact_pw - 1 - i, compact_ph)], fill=min(alpha, 255))

# Now let's construct the background plate (arch, landscape, and meadow):
# Target canvas 571 x 1024
canvas = Image.new('RGBA', (w, h), (0, 0, 0, 255))

# Arch & landscape scale: 0.84 to push arch into background and reveal right side
arch_scale = 0.84
sc_w = int(w * arch_scale)
sc_h = int(h * arch_scale)
sc_scene = src.resize((sc_w, sc_h), Image.Resampling.LANCZOS)

# Offset to position arch keystone at y = 175 (clear of top HUD card)
# and shifted slightly left (x = 25) so right pillar has breathing room on the right
arch_x = 25
arch_y = 135

# 1. Fill top sky: sample from top clouds
top_sky = src.crop((0, 0, w, 60)).resize((w, arch_y + 40), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(12))
canvas.paste(top_sky, (0, 0))

# 2. Fill right extension:
right_edge = src.crop((w - 100, 0, w, h)).resize((120, sc_h), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(6))
canvas.paste(right_edge, (w - 120, arch_y))

# 3. Fill left extension:
left_edge = src.crop((0, 0, 80, h)).resize((80, sc_h), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(6))
canvas.paste(left_edge, (0, arch_y))

# 4. Paste the scaled scene with feathered borders
scene_mask = Image.new('L', (sc_w, sc_h), 255)
s_draw = ImageDraw.Draw(scene_mask)
for i in range(30):
    s_draw.line([(0, i), (sc_w, i)], fill=int(255 * (i / 30.0)))
for i in range(20):
    s_draw.line([(sc_w - 1 - i, 0), (sc_w - 1 - i, sc_h)], fill=int(255 * (i / 20.0)))
    s_draw.line([(i, 0), (i, sc_h)], fill=int(255 * (i / 20.0)))

canvas.paste(sc_scene, (arch_x, arch_y), scene_mask)

# 5. Inpaint the middle ground where the old scaled pedestal is:
# Old pedestal in scaled scene sits around x: [100, 390], y: [arch_y + 490, arch_y + 700]
# That is y = 625 to 835.
# Let's synthesize the green meadow using patches from the grass and subtle low-lying morning mist
meadow_patch = src.crop((20, 600, 140, 750)).resize((sc_w - 100, 180), Image.Resampling.LANCZOS)
meadow_patch = meadow_patch.filter(ImageFilter.GaussianBlur(8))

# Blend meadow patch with a soft mask
m_mask = Image.new('L', (meadow_patch.width, meadow_patch.height), 0)
mm_draw = ImageDraw.Draw(m_mask)
for y_i in range(meadow_patch.height):
    # smooth bell curve
    val = int(230 * np.sin(y_i / float(meadow_patch.height) * np.pi))
    mm_draw.line([(0, y_i), (meadow_patch.width, y_i)], fill=val)

canvas.paste(meadow_patch, (50, arch_y + 440), m_mask)

# Add atmospheric morning mist curling between the arch and the foreground
mist_layer = Image.new('RGBA', (w, h), (210, 222, 212, 0))
mist_draw = ImageDraw.Draw(mist_layer)
for my in range(arch_y + 420, arch_y + 580):
    alpha = int(115 * np.sin((my - (arch_y + 420)) / 160.0 * np.pi))
    mist_draw.line([(0, my), (w, my)], fill=(205, 220, 210, alpha))
mist_layer = mist_layer.filter(ImageFilter.GaussianBlur(15))
canvas = Image.alpha_composite(canvas, mist_layer)

# 6. Now place the compact stone pedestal in the FOREGROUND (closer to viewer / lower down):
# Position: centered horizontally, top flat surface at y = 720
fg_ped_x = (w - compact_pw) // 2
fg_ped_y = 715

# Bottom ground blending:
# Take the bottom clover from original and paste at the very bottom
bottom_clover = src.crop((0, h - 160, w, h))
canvas.paste(bottom_clover, (0, h - 160))

# Paste the compact pedestal in the foreground
canvas.paste(compact_ped, (fg_ped_x, fg_ped_y), ped_mask)

# Save result to inspect
out_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/sanctuary_forced_foreground.jpg'
canvas.convert('RGB').save(out_path, quality=95)
print("Saved sanctuary_forced_foreground.jpg successfully!")
