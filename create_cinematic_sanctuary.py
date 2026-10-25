from PIL import Image, ImageEnhance, ImageFilter
import os
import shutil

# Let's inspect hubert_cave.jpg
cave_path = "public/images/hubert_cave.jpg"
cave_img = Image.open(cave_path)
cw, ch = cave_img.size
print(f"Cave image size: {cw}x{ch}")

# Target mobile portrait resolution: 786 x 1704
target_w, target_h = 786, 1704
target_aspect = target_h / target_w # 2.1679

# Crop cave image to exact aspect ratio
cave_aspect = ch / cw
if cave_aspect > target_aspect:
    # Too tall: crop a bit from top/bottom
    new_h = int(cw * target_aspect)
    # Focus on the dramatic arch, sunlight, and foliage
    top = int((ch - new_h) * 0.15)
    cave_cropped = cave_img.crop((0, top, cw, top + new_h))
else:
    new_w = int(ch / target_aspect)
    left = (cw - new_w) // 2
    cave_cropped = cave_img.crop((left, 0, left + new_w, ch))

cave_resized = cave_cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Enhance the cinematic qualities:
# 1. Warm morning golden sunlight
enhancer_color = ImageEnhance.Color(cave_resized)
cave_enhanced = enhancer_color.enhance(1.12)

enhancer_contrast = ImageEnhance.Contrast(cave_enhanced)
cave_enhanced = enhancer_contrast.enhance(1.08)

# Save as public/images/roman_sanctuary_cinematic.jpg
output_path = "public/images/roman_sanctuary_cinematic.jpg"
cave_enhanced.save(output_path, "JPEG", quality=92, optimize=True)

os.makedirs("dist/images", exist_ok=True)
shutil.copy(output_path, "dist/images/roman_sanctuary_cinematic.jpg")
print(f"Saved {output_path} successfully ({cave_enhanced.size})")
