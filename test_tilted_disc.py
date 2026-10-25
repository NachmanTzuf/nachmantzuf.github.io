from PIL import Image, ImageFilter, ImageDraw
import numpy as np

src_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg'
src = Image.open(src_path).convert('RGBA')
w, h = src.size # 571 x 1024

# Let's inspect the shifted image base where arch is lowered and sky is seamless
bg_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/test_shifted_photo.jpg'
base = Image.open(bg_path).convert('RGBA')

# In base, the pedestal top rim is currently at y = 710, bottom clover at 1024.
# We want:
# 1. "Move the harp pedestal even closer, a tiny bit closer"
#    -> Shift pedestal down by another 25px so its top disc sits around y = 740,
#       bringing the pedestal closer into the foreground!
# 2. "tilt it in a way that it's even more tilted, so I fully see the entire circle and it looks more 3D.
#    The harp that is centered on the up-mass is directly over the center of the circle pedestal.
#    We need to make sure that the circle pedestal is fully visible because it's a little bit tilted towards us
#    and you can see very clearly where the center of it is."

# Let's craft an open, fully visible tilted circular stone altar disc:
# Target disc dimensions: Width = 340px, Height = 145px (open 3D ellipse, 25.5 deg tilt)
disc_w = 340
disc_h = 145

# Extract authentic limestone texture from the pedestal top in src:
stone_patch = src.crop((120, 585, 460, 640)) # 340 x 55
# Resample vertically to disc_h using perspective mapping
stone_disc = stone_patch.resize((disc_w, disc_h), Image.Resampling.LANCZOS)

# Create an elliptical mask for the top circular stone plate:
disc_mask = Image.new('L', (disc_w, disc_h), 0)
d_draw = ImageDraw.Draw(disc_mask)
d_draw.ellipse([2, 2, disc_w - 3, disc_h - 3], fill=255)

# Add moss rim along the perimeter of the ellipse:
# In the original, the rim has deep emerald moss
moss_rim = Image.new('RGBA', (disc_w, disc_h), (0, 0, 0, 0))
m_draw = ImageDraw.Draw(moss_rim)
m_draw.ellipse([2, 2, disc_w - 3, disc_h - 3], outline=(68, 92, 42, 220), width=6)
m_draw.ellipse([4, 4, disc_w - 5, disc_h - 5], outline=(95, 128, 56, 180), width=4)
moss_rim = moss_rim.filter(ImageFilter.GaussianBlur(1.5))

stone_disc = Image.alpha_composite(stone_disc, moss_rim)

# Feather the outer edge of the ellipse mask slightly for photorealistic blending
disc_mask_feathered = disc_mask.filter(ImageFilter.GaussianBlur(2.0))

# Now let's extract the lower drum / pedestal body with ivy from src:
# In src, pedestal body is x: [110, 480], y: [635, 1024]
drum_crop = src.crop((100, 630, 485, 1024))
dw, dh = drum_crop.size

# Scale drum to match disc_w (340px):
drum_scale = disc_w / float(dw) # ~0.88
scaled_dw = disc_w
scaled_dh = int(dh * drum_scale)
scaled_drum = drum_crop.resize((scaled_dw, scaled_dh), Image.Resampling.LANCZOS)

# Position of the tilted 3D pedestal:
# Centered horizontally: x = (w - disc_w) // 2 = (571 - 340) // 2 = 115
ped_x = (w - disc_w) // 2
# Top circular plate sits at y = 735.
# Center of the circular top ellipse is at x = ped_x + disc_w // 2 = 285.5 (EXACT CENTER OF SCREEN!)
# and y = 735 + disc_h // 2 = 735 + 72 = 807.
top_y = 735
drum_y = top_y + (disc_h // 2) - 10 # drum starts halfway down the ellipse so the back rim is visible!

# Create complete composite:
final_comp = base.copy()

# Sample grass to clean background behind lowered pedestal
grass_fill = base.crop((ped_x - 20, 660, ped_x + disc_w + 20, 735)).resize((disc_w + 40, 50), Image.Resampling.LANCZOS)
final_comp.paste(grass_fill, (ped_x - 20, 715))

# 1. Paste the drum (vertical ivy-covered stone wall)
drum_mask = Image.new('L', (scaled_dw, scaled_dh), 255)
dr_draw = ImageDraw.Draw(drum_mask)
for i in range(12):
    dr_draw.line([(i, 0), (i, scaled_dh)], fill=int(255 * (i / 12.0)))
    dr_draw.line([(scaled_dw - 1 - i, 0), (scaled_dw - 1 - i, scaled_dh)], fill=int(255 * (i / 12.0)))
drum_mask = drum_mask.filter(ImageFilter.GaussianBlur(1.5))

final_comp.paste(scaled_drum, (ped_x, drum_y), drum_mask)

# 2. Paste the tilted, fully visible circular stone top plate
final_comp.paste(stone_disc, (ped_x, top_y), disc_mask_feathered)

# Save result
out_file = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/sanctuary_tilted_full_circle.jpg'
final_comp.convert('RGB').save(out_file, quality=95)
print("Saved sanctuary_tilted_full_circle.jpg successfully!")
