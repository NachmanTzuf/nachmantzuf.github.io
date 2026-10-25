"""
Earpa Ancient Roman Sanctuary Artwork Generator V2
Composites Hubert Robert's Roman Triumphal Archway and Ninfa Overgrown Ruins:
- Authentic Roman arch with Corinthian columns on the left
- Classical pine trees, green ivy and climbing vines
- Monumental ancient stone foundation platform in foreground/center
- Chiseled Roman numerals 'I • II • III • IV • V • VI • VII • VIII' carved into the arch stone frieze
- Fragmented, dappled early morning sunbeams filtering from the upper right
- Rich botanical emerald greens contrasting with the warm wooden harp
- Soft dark perimeter vignette
"""

import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont

def generate_artwork_v2():
    width, height = 1080, 1920

    # 1. Base Masterpiece: hubert_arc_triomphe.jpg (2728 x 3412)
    base_src = Image.open('public/images/hubert_arc_triomphe.jpg').convert('RGB')
    bw, bh = base_src.size

    # Crop to 9:16 portrait: capture the arch on the left, sky in the center, trees on the right, stone platform at bottom
    target_aspect = 9.0 / 16.0
    crop_w = int(bh * target_aspect) # 3412 * 9/16 = 1919
    # Center horizontally to balance the arch on the left and trees on right
    crop_x1 = int((bw - crop_w) * 0.42)
    crop_x2 = crop_x1 + crop_w
    base_cropped = base_src.crop((crop_x1, 0, crop_x2, bh)).resize((width, height), Image.Resampling.LANCZOS)

    # 2. Extract Ultra-Res Green Ivy & Climbing Vines from Ninfa (5472 x 3648)
    ninfa_src = Image.open('public/images/ninfa_2985.jpg').convert('RGB')
    nw, nh = ninfa_src.size
    # Crop the overgrown stone section with rich ivy and bright leaves
    ninfa_crop = ninfa_src.crop((int(nw * 0.10), int(nh * 0.20), int(nw * 0.70), int(nh * 0.88)))
    ninfa_resized = ninfa_crop.resize((width, height), Image.Resampling.LANCZOS)

    base_arr = np.array(base_cropped, dtype=np.float32)
    ninfa_arr = np.array(ninfa_resized, dtype=np.float32)

    # 3. Botanical Color Grade: Shift Stone to Weathered Olive-Grey & Boost Emerald Foliage
    # Boost green tones in foliage, prevent monochromatic warm yellow
    r = base_arr[:, :, 0]
    g = base_arr[:, :, 1]
    b = base_arr[:, :, 2]

    # Detect foliage and dark regions to enrich green saturation
    greenness = np.clip((g * 1.35 - r * 0.9 - b * 0.4) / 60.0, 0, 1)

    # Graded base: cool down stone red by 12%, enhance green by 18%, lift blue by 6%
    r_graded = np.clip(r * 0.88 + b * 0.08, 0, 255)
    g_graded = np.clip(g * 1.14 + greenness * 35.0, 0, 255)
    b_graded = np.clip(b * 1.06 + g * 0.05, 0, 255)

    base_graded_arr = np.stack([r_graded, g_graded, b_graded], axis=2)

    # 4. Foliage Overlay from Ninfa: Blend climbing ivy onto arch masonry, wall, and sides
    # Ninfa foliage mask
    n_r = ninfa_arr[:, :, 0]
    n_g = ninfa_arr[:, :, 1]
    n_b = ninfa_arr[:, :, 2]
    ivy_mask = np.clip((n_g * 1.5 - n_r * 0.8 - n_b * 0.5) / 80.0, 0, 1)

    # Spatial distribution: heavy on the top left arch, bottom corners, and right foliage
    y_grid, x_grid = np.mgrid[0:height, 0:width]
    # Keep center space slightly clearer for the 3D harp
    center_x_dist = np.abs(x_grid - width * 0.50) / (width * 0.50)
    center_y_dist = np.abs(y_grid - height * 0.52) / (height * 0.50)
    perimeter_weight = np.clip((center_x_dist ** 1.3 + center_y_dist ** 1.3) * 0.9, 0.15, 1.0)

    final_ivy_weight = (ivy_mask * perimeter_weight * 0.65)[:, :, np.newaxis]
    blended_arr = (1.0 - final_ivy_weight) * base_graded_arr + final_ivy_weight * ninfa_arr
    blended_img = Image.fromarray(np.clip(blended_arr, 0, 255).astype(np.uint8))

    # 5. Inscribe Authentic Carved Roman Numerals on the Arch Stone Frieze
    # The arch entablature runs across the stone block above the arch on the left
    draw = ImageDraw.Draw(blended_img)
    try:
        font_numerals = ImageFont.truetype('C:\\Windows\\Fonts\\times.ttf', 32)
        font_sub = ImageFont.truetype('C:\\Windows\\Fonts\\times.ttf', 18)
    except:
        font_numerals = ImageFont.load_default()
        font_sub = font_numerals

    numerals_text = "I  •  II  •  III  •  IV  •  V  •  VI  •  VII  •  VIII"
    sub_text = "SANCTUARIUM HARMONIAE ROMANAE"

    # Coordinates on the arch frieze stone block (approx x=55, y=560)
    fx, fy = 55, 545

    # Authentic Chisel Carving Effect:
    # 1. Deep chiseled groove (top/left shadow)
    draw.text((fx - 1, fy - 1), numerals_text, font=font_numerals, fill=(22, 18, 14, 230))
    draw.text((fx, fy - 2), numerals_text, font=font_numerals, fill=(16, 12, 10, 240))
    # 2. Sunlight bevel highlight (bottom/right edge)
    draw.text((fx + 1, fy + 1), numerals_text, font=font_numerals, fill=(225, 218, 195, 180))
    # 3. Weathered ancient bronze/stone fill
    draw.text((fx, fy), numerals_text, font=font_numerals, fill=(48, 40, 32, 215))

    # Subtitle inscription below
    draw.text((fx + 30, fy + 38), sub_text, font=font_sub, fill=(35, 28, 22, 180))
    draw.text((fx + 31, fy + 39), sub_text, font=font_sub, fill=(210, 200, 180, 120))

    # 6. Fragmented, Dappled Early Morning Sunlight Rays (Streaming from upper right)
    rays_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    rays_draw = ImageDraw.Draw(rays_overlay)

    # Origin at upper right in morning sky above the trees
    sun_ox = width + 60
    sun_oy = -40

    # Delicate, fragmented sunlight shafts
    sun_beams = [
        (-58, 4.5, 32, (255, 250, 230)),
        (-51, 3.2, 45, (255, 252, 240)),
        (-45, 5.5, 28, (254, 242, 210)),
        (-39, 3.8, 38, (255, 248, 225)),
        (-33, 4.8, 26, (255, 250, 235)),
        (-27, 3.0, 20, (254, 244, 215)),
    ]

    for angle, spread, alpha, col in sun_beams:
        r1 = math.radians(180 + angle - spread * 0.5)
        r2 = math.radians(180 + angle + spread * 0.5)
        dist_len = 2500

        p1 = (sun_ox, sun_oy)
        p2 = (sun_ox + dist_len * math.cos(r1), sun_oy + dist_len * math.sin(r1))
        p3 = (sun_ox + dist_len * math.cos(r2), sun_oy + dist_len * math.sin(r2))

        rays_draw.polygon([p1, p2, p3], fill=(col[0], col[1], col[2], alpha))

    # Soft Gaussian blur for realistic atmospheric diffusion
    rays_overlay = rays_overlay.filter(ImageFilter.GaussianBlur(radius=16))
    blended_img = Image.alpha_composite(blended_img.convert('RGBA'), rays_overlay)

    # 7. Subtle Perimeter Vignette & Radial Focus
    vig_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    vig_arr = np.zeros((height, width, 4), dtype=np.uint8)

    cx, cy = width * 0.50, height * 0.53
    r_dist = np.sqrt(((x_grid - cx) / (width * 0.54)) ** 2 + ((y_grid - cy) / (height * 0.56)) ** 2)
    # Smooth darkening starting outside the central harp zone
    vignette_alpha = np.clip((r_dist - 0.50) * 160.0, 0, 130).astype(np.uint8)

    # Cool dark forest-slate tone (0x0b, 0x11, 0x0e)
    vig_arr[:, :, 0] = 11
    vig_arr[:, :, 1] = 17
    vig_arr[:, :, 2] = 14
    vig_arr[:, :, 3] = vignette_alpha

    vig_overlay = Image.fromarray(vig_arr, mode='RGBA')
    final_img = Image.alpha_composite(blended_img, vig_overlay).convert('RGB')

    # Save to public and dist
    final_img.save('public/images/roman_sanctuary_cinematic.jpg', quality=95)
    final_img.save('dist/images/roman_sanctuary_cinematic.jpg', quality=95)
    print("Successfully generated and saved roman_sanctuary_cinematic.jpg V2 (1080x1920)!")

if __name__ == '__main__':
    generate_artwork_v2()
