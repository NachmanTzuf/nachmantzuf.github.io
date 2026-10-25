import os
from PIL import Image, ImageOps

BRAIN_DIR = "C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95"
master_path = f"{BRAIN_DIR}/verified_master_square_logo.png"
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
# We take the full tri-realm image and crop a slightly wider square centered around the harp
# so the entire harp and archway remain 100% visible inside any circle/squircle mask!
full_bg_path = f"{BRAIN_DIR}/verified_master_loading_bg.png"
full_img = Image.open(full_bg_path).convert("RGBA")

# Wider vertical crop from y=180 to y=880 (700px height), resized to 1024x1024
# Safe zone is inner 80%, meaning the harp occupies ~65% of the frame
maskable_square = full_img.crop((0, 180, 571, 180 + 571)).resize((1024, 1024), Image.Resampling.LANCZOS)

maskable_targets = {
    "earpa_icon_maskable_512.png": 512,
    "earpa_icon_maskable_192.png": 192,
}

for filename, size in maskable_targets.items():
    resized = maskable_square.resize((size, size), Image.Resampling.LANCZOS)
    pub_p = os.path.join(public_icons_dir, filename)
    dist_p = os.path.join(dist_icons_dir, filename)
    resized.save(pub_p, "PNG")
    resized.save(dist_p, "PNG")
    print(f"Generated maskable icon {filename} ({size}x{size})")

print("All icon assets generated successfully!")

