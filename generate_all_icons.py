import os
from PIL import Image, ImageOps

BRAIN_DIR = "C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95"
master_path = f"{BRAIN_DIR}/master_icon_composite_1024.png"
public_icons_dir = "public/images/icons"
dist_icons_dir = "dist/images/icons"

os.makedirs(public_icons_dir, exist_ok=True)
os.makedirs(dist_icons_dir, exist_ok=True)

master_img = Image.open(master_path).convert("RGBA")

# 1. Standard Icons
standard_targets = {
    "earpa_icon_512.png": 512,
    "earpa_icon_192.png": 192,
    "apple_touch_icon.png": 180,
    "earpa_logo_3d.png": 512,
    "favicon.png": 64,
}

for filename, size in standard_targets.items():
    resized = master_img.resize((size, size), Image.Resampling.LANCZOS)
    pub_p = os.path.join(public_icons_dir, filename)
    dist_p = os.path.join(dist_icons_dir, filename)
    resized.save(pub_p, "PNG")
    resized.save(dist_p, "PNG")
    print(f"Generated standard icon {filename} ({size}x{size})")

# 2. Favicon ICO (multi-size: 16, 32, 48)
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_imgs = [master_img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
ico_imgs[0].save("public/favicon.ico", format="ICO", sizes=ico_sizes)
ico_imgs[0].save("dist/favicon.ico", format="ICO", sizes=ico_sizes)
print("Generated multi-resolution favicon.ico")

# 3. Maskable Icons (Android Adaptive Icon Safe Zone)
# Android circle mask diameter is 80% (radius 40% = ~205px in 512x512).
# We take the continuous coastal background and paste the transparent harp at 78% scale
# so the harp sits comfortably inside the 80% safe zone with ZERO inner square or seam!
bg_path = "public/images/coastal_cliff_pathway.jpg"
bg_img = Image.open(bg_path).convert("RGB")
bg_crop = bg_img.crop((0, 180, 571, 180 + 571)).resize((1024, 1024), Image.Resampling.LANCZOS)
maskable_master = bg_crop.convert("RGBA")

# Load transparent harp cutout
harp_img = Image.open(f"{BRAIN_DIR}/harp_transparent_1024.png").convert("RGBA")
bbox = harp_img.getbbox()
harp_cutout = harp_img.crop(bbox)
hw, hh = harp_cutout.size

# Target height 680px (66% of frame, well within 80% circle safe zone)
m_scale = 680.0 / float(hh)
m_w = int(hw * m_scale)
m_h = int(680)
m_scaled_harp = harp_cutout.resize((m_w, m_h), Image.Resampling.LANCZOS)

# Soft shadow on ground
shadow_w = int(m_w * 0.70)
shadow_h = int(shadow_w * 0.28)
shadow_layer = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
from PIL import ImageDraw, ImageFilter
draw = ImageDraw.Draw(shadow_layer)
m_x = (1024 - m_w) // 2
m_y = (1024 - m_h) // 2 + 10
sx0 = (1024 - shadow_w) // 2 + 8
sy0 = m_y + m_h - int(shadow_h * 0.75)
draw.ellipse((sx0, sy0, sx0 + shadow_w, sy0 + shadow_h), fill=(10, 15, 22, 110))
shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(14))
maskable_master.paste(shadow_layer, (0, 0), shadow_layer)

# Paste scaled harp
maskable_master.paste(m_scaled_harp, (m_x, m_y), m_scaled_harp)

maskable_targets = {
    "earpa_icon_maskable_512.png": 512,
    "earpa_icon_maskable_192.png": 192,
}

for filename, size in maskable_targets.items():
    resized = maskable_master.resize((size, size), Image.Resampling.LANCZOS)
    pub_p = os.path.join(public_icons_dir, filename)
    dist_p = os.path.join(dist_icons_dir, filename)
    resized.save(pub_p, "PNG")
    resized.save(dist_p, "PNG")
    print(f"Generated maskable icon {filename} ({size}x{size})")

print("All icon assets generated successfully!")
