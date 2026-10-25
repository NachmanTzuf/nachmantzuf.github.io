from PIL import Image, ImageEnhance, ImageFilter
import os
import shutil

img = Image.open("public/images/hubert_old_temple.jpg")
w, h = img.size
print(f"Original size: {w}x{h}")

target_w, target_h = 786, 1704
target_aspect = target_h / target_w # 2.1679

# Calculate crop width
crop_w = int(h / target_aspect)
print(f"Target crop width: {crop_w} for height {h}")

# Let's test two crops:
# Crop A: centered on the majestic arch and open sky
left_A = int((w - crop_w) * 0.35)
crop_A = img.crop((left_A, 0, left_A + crop_w, h)).resize((target_w, target_h), Image.Resampling.LANCZOS)

# Crop B: slightly more to the left so the grand column on the left frames the scene
left_B = int((w - crop_w) * 0.18)
crop_B = img.crop((left_B, 0, left_B + crop_w, h)).resize((target_w, target_h), Image.Resampling.LANCZOS)

# Apply rich cinematic grading to Crop A
enh_color = ImageEnhance.Color(crop_A)
graded_A = enh_color.enhance(1.15)
enh_contrast = ImageEnhance.Contrast(graded_A)
graded_A = enh_contrast.enhance(1.08)

# Apply rich cinematic grading to Crop B
enh_color = ImageEnhance.Color(crop_B)
graded_B = enh_color.enhance(1.15)
enh_contrast = ImageEnhance.Contrast(graded_B)
graded_B = enh_contrast.enhance(1.08)

graded_A.save("public/images/temple_crop_A.jpg", quality=92)
graded_B.save("public/images/temple_crop_B.jpg", quality=92)
print("Saved temple_crop_A.jpg and temple_crop_B.jpg")
