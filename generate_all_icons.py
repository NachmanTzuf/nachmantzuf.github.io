import os
from PIL import Image

BRAIN_DIR = "C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95"
master_path = f"{BRAIN_DIR}/verified_master_square_logo.png"
public_icons_dir = "public/images/icons"
dist_icons_dir = "dist/images/icons"

os.makedirs(public_icons_dir, exist_ok=True)
os.makedirs(dist_icons_dir, exist_ok=True)

master_img = Image.open(master_path).convert("RGBA")

# 1. Standard App & Web Icons
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

# 2. Favicon ICO (multi-resolution: 16, 32, 48)
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_imgs = [master_img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
ico_imgs[0].save("public/favicon.ico", format="ICO", sizes=ico_sizes)
ico_imgs[0].save("dist/favicon.ico", format="ICO", sizes=ico_sizes)
print("Generated multi-resolution favicon.ico")

# 3. Android Adaptive Maskable Icons
# master_img has the harp centered at (512, 512) spanning 630px height,
# which guarantees 100% visibility inside Android's 66%-80% circle/squircle safe zones
maskable_targets = {
    "earpa_icon_maskable_512.png": 512,
    "earpa_icon_maskable_192.png": 192,
}

for filename, size in maskable_targets.items():
    resized = master_img.resize((size, size), Image.Resampling.LANCZOS)
    pub_p = os.path.join(public_icons_dir, filename)
    dist_p = os.path.join(dist_icons_dir, filename)
    resized.save(pub_p, "PNG")
    resized.save(dist_p, "PNG")
    print(f"Generated maskable icon {filename} ({size}x{size})")

print("All icon assets generated successfully!")
