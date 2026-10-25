import os
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance

BRAIN_DIR = "C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95"
bg_path = "public/images/tri_realm_sanctuary.jpg"
harp_path = f"{BRAIN_DIR}/harp_transparent_1024.png"

bg = Image.open(bg_path).convert("RGBA")
harp = Image.open(harp_path).convert("RGBA")

# Extract tight bounding box of harp
bbox = harp.getbbox()
harp_cutout = harp.crop(bbox)
hw, hh = harp_cutout.size
print(f"Harp cutout size: {hw}x{hh}")

bg_w, bg_h = bg.size # 571 x 1024

# Desired harp size and position mapped directly from user home screen screenshot:
# Crown at y=314, feet at y=811, height=497px
target_h = 497
scale = target_h / float(hh)
target_w = int(hw * scale)

scaled_harp = harp_cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Position: feet at y=811 on pedestal surface, left edge at x=145
feet_y = 811
harp_x = 145
harp_y = feet_y - target_h # 314

print(f"Positioning harp at ({harp_x}, {harp_y}), size {target_w}x{target_h}, feet at y={feet_y}")

# Realistic soft contact shadow on stone altar
shadow_layer = Image.new("RGBA", (bg_w, bg_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(shadow_layer)
shadow_w = int(target_w * 0.72)
shadow_h = int(shadow_w * 0.26)
sx0 = harp_x + int(target_w * 0.16)
sy0 = feet_y - int(shadow_h * 0.55)
draw.ellipse((sx0, sy0, sx0 + shadow_w, sy0 + shadow_h), fill=(10, 16, 12, 160))
shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(10))

# Composite full portrait loading background
full_composite = bg.copy()
full_composite.paste(shadow_layer, (0, 0), shadow_layer)
full_composite.paste(scaled_harp, (harp_x, harp_y), scaled_harp)

# Save full portrait loading background
full_composite_rgb = full_composite.convert("RGB")
out_full_path = "public/images/earpa_master_loading_bg.jpg"
full_composite_rgb.save(out_full_path, "JPEG", quality=96)
full_composite_rgb.save("dist/images/earpa_master_loading_bg.jpg", "JPEG", quality=96)
full_composite.save(f"{BRAIN_DIR}/verified_master_loading_bg.png", "PNG")
print(f"Saved full loading background: {out_full_path}")

# =========================================================================
# SQUARE LOGO / ICON CROP
# crop_y0 = 240 gives comfortable breathing room above the crown and below the pedestal
# =========================================================================
crop_y0 = 240
square_crop = full_composite.crop((0, crop_y0, 571, crop_y0 + 571))
square_1024 = square_crop.resize((1024, 1024), Image.Resampling.LANCZOS)

out_square_path = f"{BRAIN_DIR}/verified_master_square_logo.png"
square_1024.save(out_square_path, "PNG")
print(f"Saved square logo candidate: {out_square_path}")
