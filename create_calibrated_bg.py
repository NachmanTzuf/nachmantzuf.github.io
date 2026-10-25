from PIL import Image, ImageFilter
import numpy as np

src_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792325492069_f8d6a8c3.jpg'
src = Image.open(src_path).convert('RGB')
w, h = src.size # 571 x 1024

# Shift down by 150px
shift_y = 150

shifted = Image.new('RGB', (w, h), (0, 0, 0))
shifted.paste(src, (0, shift_y))

# Fill the top 150px with the matching overcast misty sky
top_sky = src.crop((0, 0, w, 55))
sky_ext = top_sky.resize((w, shift_y + 25), Image.Resampling.BILINEAR)
sky_ext_blurred = sky_ext.filter(ImageFilter.GaussianBlur(12))

shifted.paste(sky_ext_blurred, (0, 0))

# Smooth vertical feather blend at the seam
blend_zone = src.crop((0, 0, w, 40))
blend_mask = Image.new('L', (w, 40))
for y in range(40):
    blend_mask.paste(int(255 * (y / 40.0)), (0, y, w, y + 1))

shifted.paste(blend_zone, (0, shift_y), blend_mask)

# Save to public and dist
shifted.save('public/images/irish_celtic_sanctuary.jpg', quality=95)
shifted.save('dist/images/irish_celtic_sanctuary.jpg', quality=95)
shifted.save('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/irish_celtic_sanctuary_calibrated.jpg', quality=95)
print("Saved calibrated sanctuary image successfully!")
