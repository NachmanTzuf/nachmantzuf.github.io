"""
Earpa Ancient Roman Sanctuary Artwork Generator
Synthesizes a 1080x1920 cinematic background matching the user's exact specification:
- Open outdoor ancient Roman ruins sanctuary with lush green foliage, climbing ivy, and moss
- Semicircular Roman arch with carved Roman numerals ('I • II • III • IV • V • VI • VII • VIII')
- Chunky round stone foundation pedestal in the lower center
- Dappled fragmented morning sunbeams streaming from upper right
- Deep cool green/slate contrast against the warm honey-cherry wood Celtic harp
- Subtle dark perimeter vignette gradient
"""

import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont

def generate_artwork():
    width, height = 1080, 1920

    # 1. Base Classical Archway from hubert_001.jpg
    base_src = Image.open('public/images/hubert_001.jpg').convert('RGB')
    src_w, src_h = base_src.size

    # Crop to 9:16 portrait centering the majestic Roman arch on the left/center
    crop_w = int(src_h * (9 / 16))
    crop_x1 = max(0, int(src_w * 0.05))
    crop_x2 = crop_x1 + crop_w
    if crop_x2 > src_w:
        crop_x2 = src_w
        crop_x1 = crop_x2 - crop_w
        if crop_x1 < 0: crop_x1 = 0

    base_cropped = base_src.crop((crop_x1, 0, crop_x2, src_h)).resize((width, height), Image.Resampling.LANCZOS)

    # 2. Extract Rich Emerald Green Ivy & Vines from ninfa_2985.jpg
    ninfa_src = Image.open('public/images/ninfa_2985.jpg').convert('RGB')
    nw, nh = ninfa_src.size

    # Crop lush overgrown ruined wall with tree foliage
    ninfa_crop = ninfa_src.crop((int(nw * 0.12), int(nh * 0.25), int(nw * 0.65), int(nh * 0.85)))
    ninfa_resized = ninfa_crop.resize((width, height), Image.Resampling.LANCZOS)

    # 3. Botanical Color Grading: Cool Stone & Emerald Greenery (Eliminating monochromatic yellow/sand)
    # Convert base to numpy array for channel adjustment
    base_arr = np.array(base_cropped, dtype=np.float32)

    # Cool down the shadows, boost green channel in midtones/highlights, suppress excessive warm orange
    r = base_arr[:, :, 0]
    g = base_arr[:, :, 1]
    b = base_arr[:, :, 2]

    # Mask for foliage / stone: increase green saturation
    green_boost = np.clip(g * 1.18 - r * 0.15, 0, 255)
    # Slate/olive stone grading: shift sandy red towards ancient mossy travertine
    r_cool = np.clip(r * 0.86 + b * 0.08, 0, 255)
    b_cool = np.clip(b * 1.05 + g * 0.06, 0, 255)

    base_graded_arr = np.stack([r_cool, green_boost, b_cool], axis=2).astype(np.uint8)
    base_graded = Image.fromarray(base_graded_arr)

    # 4. Blend Overgrown Ivy & Foliage from Ninfa along the arch top, columns and corners
    ninfa_arr = np.array(ninfa_resized, dtype=np.float32)
    # Find green foliage mask in Ninfa (high green relative to red/blue)
    foliage_mask = np.clip((ninfa_arr[:, :, 1] * 1.5 - ninfa_arr[:, :, 0] * 0.8 - ninfa_arr[:, :, 2] * 0.5) / 100.0, 0, 1)
    foliage_mask = foliage_mask[:, :, np.newaxis]

    # Create spatial weight: heavier on top arch, left column, and background sides
    y_coords, x_coords = np.mgrid[0:height, 0:width]
    # Keep center space slightly cleaner for the harp, foliage dense on perimeter
    center_dist_x = np.abs(x_coords - width * 0.5) / (width * 0.5)
    center_dist_y = np.abs(y_coords - height * 0.52) / (height * 0.5)
    perimeter_weight = np.clip((center_dist_x ** 1.5 + center_dist_y ** 1.5) * 0.85, 0.25, 1.0)
    perimeter_weight = perimeter_weight[:, :, np.newaxis]

    combined_mask = foliage_mask * perimeter_weight * 0.75
    blended_arr = (1.0 - combined_mask) * base_graded_arr + combined_mask * ninfa_arr
    blended_img = Image.fromarray(np.clip(blended_arr, 0, 255).astype(np.uint8))

    # 5. Inscribe Carved Roman Numerals along the Arch Frieze
    # Arch curvature runs from upper-left (x ~ 140, y ~ 640) up through crown (x ~ 360, y ~ 420)
    draw = ImageDraw.Draw(blended_img)
    try:
        font = ImageFont.truetype('C:\\Windows\\Fonts\\times.ttf', 38)
        font_sub = ImageFont.truetype('C:\\Windows\\Fonts\\times.ttf', 24)
    except:
        font = ImageFont.load_default()
        font_sub = font

    # Horizontal classical frieze inscription banner above arch
    # 'I • II • III • IV • V • VI • VII • VIII'
    numerals_text = "I  •  II  •  III  •  IV  •  V  •  VI  •  VII  •  VIII"
    # Position on the entablature above the arch
    frieze_x = 110
    frieze_y = 445

    # Chisel Inscription Effect: Dark inner shadow (carved recess) + Bottom-right subtle sunlight highlight
    # Chisel dark shadow
    draw.text((frieze_x - 1, frieze_y - 1), numerals_text, font=font, fill=(28, 24, 18, 220))
    draw.text((frieze_x, frieze_y - 2), numerals_text, font=font, fill=(20, 16, 12, 230))
    # Chisel sun highlight on lower edge
    draw.text((frieze_x + 1, frieze_y + 1), numerals_text, font=font, fill=(215, 205, 180, 160))
    # Chisel core deep weathered bronze tone
    draw.text((frieze_x, frieze_y), numerals_text, font=font, fill=(58, 48, 36, 210))

    # Secondary arch keystones numerals
    sub_text = "TEMPLUM HARMONIAE  •  ANNO DOMINI"
    draw.text((frieze_x + 60, frieze_y + 44), sub_text, font=font_sub, fill=(45, 38, 30, 170))
    draw.text((frieze_x + 61, frieze_y + 45), sub_text, font=font_sub, fill=(195, 185, 165, 120))

    # 6. Center Chunky Round Stone Foundation Pedestal Altar (Perfect 3D Alignment)
    # Three.js plinth sits at screen center y ~ 1180 to 1340 in 1080x1920 space
    # Draw an ancient weathered Roman circular travertine pedestal platform into the stone ground
    pedestal_cx = int(width * 0.50)
    pedestal_cy = int(height * 0.68) # 1305px
    pedestal_rx = int(width * 0.44) # 475px wide
    pedestal_ry = int(height * 0.09) # 172px high perspective ellipse

    # Create overlay for the carved foundation pedestal
    ped_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    ped_draw = ImageDraw.Draw(ped_overlay)

    # Foundation Tier 1: Wide Ancient Stone Slab Base with Moss
    for r_offset in range(12, 0, -2):
        y_off = r_offset * 3
        # Weathered stone shading
        ped_draw.ellipse(
            [pedestal_cx - pedestal_rx - r_offset, pedestal_cy - pedestal_ry + y_off,
             pedestal_cx + pedestal_rx + r_offset, pedestal_cy + pedestal_ry + y_off],
            fill=(38, 44, 34, 180),
            outline=(52, 60, 46, 210),
            width=2
        )

    # Foundation Tier 2: Fluted Travertine Circular Pedestal Block
    ped_draw.ellipse(
        [pedestal_cx - pedestal_rx, pedestal_cy - pedestal_ry,
         pedestal_cx + pedestal_rx, pedestal_cy + pedestal_ry],
        fill=(74, 68, 56, 220),
        outline=(110, 102, 84, 240),
        width=3
    )

    # Inlaid Circular Roman Ring on Pedestal Face with ivy tendrils
    ped_draw.ellipse(
        [pedestal_cx - int(pedestal_rx * 0.85), pedestal_cy - int(pedestal_ry * 0.85),
         pedestal_cx + int(pedestal_rx * 0.85), pedestal_cy + int(pedestal_ry * 0.85)],
        outline=(168, 142, 78, 180),
        width=2
    )

    # Soften pedestal blend
    ped_overlay = ped_overlay.filter(ImageFilter.GaussianBlur(radius=2.5))
    blended_img = Image.alpha_composite(blended_img.convert('RGBA'), ped_overlay)

    # 7. Fragmented, Dappled Early Morning Sunlight Rays (Streaming from upper right)
    rays_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    rays_draw = ImageDraw.Draw(rays_overlay)

    # Sunlight origin at upper right (x ~ 1150, y ~ -80)
    origin_x = width + 80
    origin_y = -60

    # 7 fragmented, delicate sunbeams of varying width and intensity
    beams = [
        # (angle_deg, spread_deg, alpha, color)
        (-62, 5.5, 34, (255, 248, 220)),
        (-56, 3.8, 42, (255, 252, 235)),
        (-50, 6.2, 28, (254, 240, 190)),
        (-44, 4.2, 38, (255, 245, 210)),
        (-38, 5.0, 30, (255, 250, 225)),
        (-32, 3.5, 22, (254, 242, 200)),
        (-26, 4.8, 18, (255, 248, 215)),
    ]

    for angle, spread, alpha, col in beams:
        rad1 = math.radians(180 + angle - spread * 0.5)
        rad2 = math.radians(180 + angle + spread * 0.5)
        length = 2400

        p1 = (origin_x, origin_y)
        p2 = (origin_x + length * math.cos(rad1), origin_y + length * math.sin(rad1))
        p3 = (origin_x + length * math.cos(rad2), origin_y + length * math.sin(rad2))

        poly_color = (col[0], col[1], col[2], alpha)
        rays_draw.polygon([p1, p2, p3], fill=poly_color)

    # Feather the god-rays so they feel natural, soft, and fragmented
    rays_overlay = rays_overlay.filter(ImageFilter.GaussianBlur(radius=18))
    blended_img = Image.alpha_composite(blended_img, rays_overlay)

    # 8. Subtle Dark Vignette & Depth Gradient (Contrast isolation for honey-cherry harp)
    vignette = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    vig_arr = np.zeros((height, width, 4), dtype=np.uint8)

    # Radial gradient from harp center
    cx, cy = width * 0.50, height * 0.54
    dist = np.sqrt(((x_coords - cx) / (width * 0.55)) ** 2 + ((y_coords - cy) / (height * 0.58)) ** 2)
    # Center is completely transparent (alpha = 0), edges smoothly darken to alpha ~ 140
    alpha_grad = np.clip((dist - 0.55) * 190.0, 0, 140).astype(np.uint8)

    # Soft dark slate-emerald tone for vignette (0x0c, 0x12, 0x0f)
    vig_arr[:, :, 0] = 12
    vig_arr[:, :, 1] = 18
    vig_arr[:, :, 2] = 15
    vig_arr[:, :, 3] = alpha_grad

    vignette = Image.fromarray(vig_arr, mode='RGBA')
    final_img = Image.alpha_composite(blended_img, vignette).convert('RGB')

    # Output to both public and dist directories
    final_img.save('public/images/roman_sanctuary_cinematic.jpg', quality=95)
    final_img.save('dist/images/roman_sanctuary_cinematic.jpg', quality=95)
    print("Successfully generated and saved roman_sanctuary_cinematic.jpg (1080x1920)!")

if __name__ == '__main__':
    generate_artwork()
