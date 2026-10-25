import os
import math
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import numpy as np

BRAIN_DIR = "C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95"
bg_path = "public/images/tri_realm_sanctuary.jpg"
harp_path = f"{BRAIN_DIR}/cherry_balanced.png"

bg = Image.open(bg_path).convert("RGBA")
harp = Image.open(harp_path).convert("RGBA")

# Extract tight bounding box of harp
bbox = harp.getbbox()
harp_cutout = harp.crop(bbox)
hw, hh = harp_cutout.size
print(f"Cherry Brown Harp Cutout Size: {hw}x{hh}")

bg_w, bg_h = bg.size # 571 x 1024

# =========================================================================
# 1. FULL-BLEED LOADING BACKGROUND (571 x 1024)
# Natural, crisp, crystal-clear background with NO gradient / NO darkening!
# Cherry brown harp centered on mossy pedestal with flat floor grounding.
# =========================================================================
target_h = 472
scale = target_h / float(hh)
target_w = int(hw * scale)
scaled_harp = harp_cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)

harp_x = int((bg_w - target_w) / 2.0)
feet_y = 783 # Firmly planted on flat mossy stone surface
harp_y = feet_y - target_h

full_composite = bg.copy()

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
# 1B. JOURNEY TAB BACKGROUND (571 x 1024)
# Exact same loading screen image, but through a dark sunglasses lens with black gradient tint!
# All text and metrics on Journey page become vividly readable.
# =========================================================================
journey_bright = ImageEnhance.Brightness(full_composite).enhance(0.46)
journey_contrast = ImageEnhance.Contrast(journey_bright).enhance(1.20)
journey_color = ImageEnhance.Color(journey_contrast).enhance(1.10)

arr_j = np.array(journey_color, dtype=np.float32)
y_coords_j, x_coords_j = np.ogrid[:bg_h, :bg_w]
norm_y_j = y_coords_j / float(bg_h)
vert_factor_j = 1.0 - (0.35 * np.clip(1.0 - norm_y_j * 2.2, 0, 1) + 0.55 * np.clip((norm_y_j - 0.45) * 1.8, 0, 1))
cx_j, cy_j = bg_w / 2.0, bg_h / 2.0
max_d_j = math.sqrt(cx_j**2 + cy_j**2)
dist_j = np.sqrt((x_coords_j - cx_j)**2 + (y_coords_j - cy_j)**2) / max_d_j
radial_factor_j = 1.0 - 0.20 * (dist_j ** 1.8)
combined_factor_j = np.clip(vert_factor_j * radial_factor_j, 0.15, 1.0)

for ch in range(3):
    arr_j[:, :, ch] = arr_j[:, :, ch] * combined_factor_j

arr_j = np.clip(arr_j, 0, 255).astype(np.uint8)
journey_bg = Image.fromarray(arr_j, "RGBA")
journey_bg.convert("RGB").save("public/images/earpa_journey_bg.jpg", "JPEG", quality=96)
journey_bg.convert("RGB").save("dist/images/earpa_journey_bg.jpg", "JPEG", quality=96)
journey_bg.save(f"{BRAIN_DIR}/verified_master_journey_bg.png", "PNG")
print("Saved journey sunglasses background: public/images/earpa_journey_bg.jpg")

# =========================================================================
# 2. MASTER SQUARE APP LOGO / ICON (1024 x 1024)
# Background through sharp dark sunglasses lens (polarized dark & crisp)
# Cherry brown harp on top: fully bright, crisp, centered, zero darkening!
# =========================================================================
crop_y0 = 220
crop_h = 571
bg_square = bg.crop((0, crop_y0, 571, crop_y0 + crop_h)).resize((1024, 1024), Image.Resampling.LANCZOS)

# Optical sunglasses effect: dark, high contrast, razor-sharp details
enhancer_bright = ImageEnhance.Brightness(bg_square)
dark_lens = enhancer_bright.enhance(0.48)

enhancer_contrast = ImageEnhance.Contrast(dark_lens)
sharp_lens = enhancer_contrast.enhance(1.20)

enhancer_color = ImageEnhance.Color(sharp_lens)
vivid_lens = enhancer_color.enhance(1.10)

# Full-res smooth radial dark gradient falloff towards edges
y_coords, x_coords = np.ogrid[:1024, :1024]
cx, cy = 512, 512
max_dist = math.sqrt(512**2 + 512**2)
dist = np.sqrt((x_coords - cx)**2 + (y_coords - cy)**2) / max_dist
grad_factor = 1.0 - 0.28 * (dist ** 1.5)
grad_factor = np.clip(grad_factor, 0.0, 1.0)

arr = np.array(vivid_lens, dtype=np.float32)
for c in range(3):
    arr[:, :, c] = arr[:, :, c] * grad_factor
arr = np.clip(arr, 0, 255).astype(np.uint8)
sunglasses_bg = Image.fromarray(arr, "RGBA")

# Place Cherry Brown Harp on Top (Fully bright cherry wood, zero darkening!)
icon_target_h = 630
icon_scale = icon_target_h / float(hh)
icon_target_w = int(hw * icon_scale)
icon_harp = harp_cutout.resize((icon_target_w, icon_target_h), Image.Resampling.LANCZOS)

icon_harp_x = int((1024 - icon_target_w) / 2.0)
icon_harp_y = int((1024 - icon_target_h) / 2.0)
icon_feet_y = icon_harp_y + icon_target_h

# Contact shadow under the feet on the stone
icon_shadow = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
is_draw = ImageDraw.Draw(icon_shadow)
isw = int(icon_target_w * 0.82)
ish = int(isw * 0.22)
isx0 = int(512 - isw / 2.0)
isy0 = icon_feet_y - int(ish * 0.50)
is_draw.ellipse((isx0, isy0, isx0 + isw, isy0 + ish), fill=(4, 6, 8, 230))
icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(14))

sunglasses_bg.paste(icon_shadow, (0, 0), icon_shadow)
sunglasses_bg.paste(icon_harp, (icon_harp_x, icon_harp_y), icon_harp)

out_square_path = f"{BRAIN_DIR}/verified_master_square_logo.png"
sunglasses_bg.save(out_square_path, "PNG")
print(f"Saved sunglasses master square logo: {out_square_path} (centered at {icon_harp_x}, {icon_harp_y}, size {icon_target_w}x{icon_target_h})")
