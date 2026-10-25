from PIL import Image, ImageEnhance, ImageFilter

input_path = "public/images/palmyra_temple_bel_5.jpg"
output_path = "public/images/roman_sanctuary_cinematic.jpg"

img = Image.open(input_path)
w, h = img.size
print(f"Original size: {w}x{h}")

# We want a portrait image with aspect ratio roughly 9:19.5 (mobile screen 393:852 = 1:2.168)
target_aspect = 852 / 393  # ~2.168
current_aspect = h / w

if current_aspect < target_aspect:
    # Need to crop width
    new_w = int(h / target_aspect)
    # Center crop width so the two columns frame the scene
    left = (w - new_w) // 2
    img_cropped = img.crop((left, 0, left + new_w, h))
else:
    # Need to crop height
    new_h = int(w * target_aspect)
    # Crop from bottom/top, prioritizing the temple and column bases
    top = int((h - new_h) * 0.35)
    img_cropped = img.crop((0, top, w, top + new_h))

# Resize to high quality retina mobile resolution 786 x 1704
final_img = img_cropped.resize((786, 1704), Image.Resampling.LANCZOS)

# Subtle cinematic color grading:
# 1. Warmth & Golden hour glow
# Slightly increase contrast and color saturation
enhancer_color = ImageEnhance.Color(final_img)
final_img = enhancer_color.enhance(1.08)

enhancer_contrast = ImageEnhance.Contrast(final_img)
final_img = enhancer_contrast.enhance(1.05)

# Save high quality JPEG
final_img.save(output_path, "JPEG", quality=92, optimize=True)
print(f"Saved {output_path} ({final_img.size})")

# Also copy to dist/images/ for the web server
import shutil
import os
os.makedirs("dist/images", exist_ok=True)
shutil.copy(output_path, "dist/images/roman_sanctuary_cinematic.jpg")
print("Copied to dist/images/roman_sanctuary_cinematic.jpg")
