from PIL import Image, ImageEnhance, ImageFilter
import os
import shutil

input_path = "public/images/wadi_rum_rocks.jpg"
output_path = "public/images/desert_roadmap_cinematic.jpg"

img = Image.open(input_path)
w, h = img.size

# Target mobile portrait aspect ratio for the roadmap modal (e.g. 786 x 1704)
target_aspect = 1704 / 786
target_w = int(h / target_aspect)
left = (w - target_w) // 2
cropped = img.crop((left, 0, left + target_w, h))

resized = cropped.resize((786, 1704), Image.Resampling.LANCZOS)

# Cinematic color grading: enhance warm desert ochre, slight vignette/darkening so waypoints pop
enhancer_color = ImageEnhance.Color(resized)
graded = enhancer_color.enhance(1.15)

enhancer_contrast = ImageEnhance.Contrast(graded)
graded = enhancer_contrast.enhance(1.10)

enhancer_bright = ImageEnhance.Brightness(graded)
graded = enhancer_bright.enhance(0.75) # slightly deeper tone so gold stars and road are ultra readable

graded.save(output_path, "JPEG", quality=90, optimize=True)
os.makedirs("dist/images", exist_ok=True)
shutil.copy(output_path, "dist/images/desert_roadmap_cinematic.jpg")
print(f"Prepared {output_path} successfully!")
