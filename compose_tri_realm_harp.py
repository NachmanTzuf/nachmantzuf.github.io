import os
from PIL import Image, ImageFilter, ImageDraw

BRAIN_DIR = "C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95"
bg_path = "public/images/tri_realm_sanctuary.jpg"
harp_path = f"{BRAIN_DIR}/angle_th_neg_1_15.png"

bg = Image.open(bg_path).convert("RGBA")
harp = Image.open(harp_path).convert("RGBA")

# Extract tight bounding box of harp
bbox = harp.getbbox()
harp_cutout = harp.crop(bbox)
hw, hh = harp_cutout.size
print(f"Dark Walnut Harp Cutout Size: {hw}x{hh}")

bg_w, bg_h = bg.size # 571 x 1024

# =========================================================================
# 1. FULL-BLEED LOADING BACKGROUND (571 x 1024)
# =========================================================================
target_h = 472
scale = target_h / float(hh)
target_w = int(hw * scale)
scaled_harp = harp_cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Dead center horizontally:
harp_x = int((bg_w - target_w) / 2.0)
feet_y = 783 # Firmly planted on flat mossy stone surface
harp_y = feet_y - target_h

print(f"Loading Screen Harp: ({harp_x}, {harp_y}), {target_w}x{target_h}, feet at y={feet_y}")

full_composite = bg.copy()

# Contact shadow on flat mossy stone
shadow_layer = Image.new("RGBA", (bg_w, bg_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(shadow_layer)
sw = int(target_w * 0.80)
sh = int(sw * 0.22)
sx0 = int(bg_w / 2.0 - sw / 2.0) + 2
sy0 = feet_y - int(sh * 0.50)
draw.ellipse((sx0, sy0, sx0 + sw, sy0 + sh), fill=(8, 14, 10, 205))
shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(8))

full_composite.paste(shadow_layer, (0, 0), shadow_layer)
full_composite.paste(scaled_harp, (harp_x, harp_y), scaled_harp)

out_loading_public = "public/images/earpa_master_loading_bg.jpg"
out_loading_dist = "dist/images/earpa_master_loading_bg.jpg"
full_composite.convert("RGB").save(out_loading_public, "JPEG", quality=96)
full_composite.convert("RGB").save(out_loading_dist, "JPEG", quality=96)
full_composite.save(f"{BRAIN_DIR}/verified_master_loading_bg.png", "PNG")
print(f"Saved full loading background: {out_loading_public}")

# =========================================================================
# 2. MASTER SQUARE LOGO / ICON (1024 x 1024)
# Entire harp 100% visible, 100% centered inside Android adaptive safe zone!
# =========================================================================
crop_y0 = 220
crop_h = 571
bg_square = bg.crop((0, crop_y0, 571, crop_y0 + crop_h)).resize((1024, 1024), Image.Resampling.LANCZOS)

icon_target_h = 630
icon_scale = icon_target_h / float(hh)
icon_target_w = int(hw * icon_scale)
icon_harp = harp_cutout.resize((icon_target_w, icon_target_h), Image.Resampling.LANCZOS)

# EXACT 100% DEAD CENTER in the 1024x1024 square:
icon_harp_x = int((1024 - icon_target_w) / 2.0)
icon_harp_y = int((1024 - icon_target_h) / 2.0)
icon_feet_y = icon_harp_y + icon_target_h

square_composite = bg_square.copy()

# Contact shadow under the feet on the stone
icon_shadow = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
is_draw = ImageDraw.Draw(icon_shadow)
isw = int(icon_target_w * 0.82)
ish = int(isw * 0.22)
isx0 = int(512 - isw / 2.0)
isy0 = icon_feet_y - int(ish * 0.50)
is_draw.ellipse((isx0, isy0, isx0 + isw, isy0 + ish), fill=(8, 14, 10, 215))
icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(14))

square_composite.paste(icon_shadow, (0, 0), icon_shadow)
square_composite.paste(icon_harp, (icon_harp_x, icon_harp_y), icon_harp)

out_square_path = f"{BRAIN_DIR}/verified_master_square_logo.png"
square_composite.save(out_square_path, "PNG")
print(f"Saved master square logo: {out_square_path} (centered at {icon_harp_x}, {icon_harp_y}, size {icon_target_w}x{icon_target_h})")
