from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import numpy as np

orig = Image.open('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792323887781_85b1b263.jpg').convert('RGB')
w, h = orig.size

arr = np.array(orig).astype(float)
gray_img = orig.convert('L')
gray_arr = np.array(gray_img).astype(float)

# Box blur using PIL for local background estimate
blur_gray_img = gray_img.filter(ImageFilter.BoxBlur(5))
blur_gray_arr = np.array(blur_gray_img).astype(float)

# Carved lines are darker than their local neighborhood
diff = blur_gray_arr - gray_arr

# Filter to where runes exist:
# Arch keystone & upper arch: y between 40 and 260, x between 150 and 560
# Left pillar: y between 100 and 580, x between 160 and 280
# Right pillar: y between 250 and 650, x between 480 and 571
mask = np.zeros((h, w), dtype=float)

sub_r = arr[..., 0]
sub_g = arr[..., 1]
sub_b = arr[..., 2]
# Exclude green moss
is_moss = (sub_g > sub_r * 1.08) & (sub_g > 55)

# Carved crevice detection
is_crevice = (diff > 8) & (~is_moss) & (gray_arr > 30) & (gray_arr < 170)

# Region bounds
in_arch = (
    ((np.arange(h)[:, None] >= 45) & (np.arange(h)[:, None] <= 260) & (np.arange(w)[None, :] >= 150) & (np.arange(w)[None, :] <= 560)) |
    ((np.arange(h)[:, None] >= 100) & (np.arange(h)[:, None] <= 580) & (np.arange(w)[None, :] >= 160) & (np.arange(w)[None, :] <= 280)) |
    ((np.arange(h)[:, None] >= 250) & (np.arange(h)[:, None] <= 650) & (np.arange(w)[None, :] >= 480) & (np.arange(w)[None, :] <= 570))
)

valid_runes = is_crevice & in_arch
mask[valid_runes] = np.clip(diff[valid_runes] / 30.0, 0, 1)

# Blur the mask to create a soft subtle halo
mask_img = Image.fromarray((mask * 255).astype(np.uint8))
halo = mask_img.filter(ImageFilter.GaussianBlur(radius=2))
halo_arr = np.array(halo).astype(float) / 255.0

# Core glow (sharper inside the incisions)
core = mask_img.filter(ImageFilter.GaussianBlur(radius=0.8))
core_arr = np.array(core).astype(float) / 255.0

# Subtle warm magical amber-gold glow (R: 255, G: 215, B: 120)
glow_color = np.array([255.0, 215.0, 120.0])
core_color = np.array([255.0, 245.0, 190.0])

glow_layer = (halo_arr[..., None] * glow_color * 0.45) + (core_arr[..., None] * core_color * 0.40)

final_arr = np.clip(arr + glow_layer, 0, 255).astype(np.uint8)
final_img = Image.fromarray(final_arr)
final_img.save('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/test_glow.jpg', quality=95)
print("Saved test_glow.jpg successfully!")
