"""
Earpa Ultra-Realistic Roman Ruins Sanctuary Artwork Generator
Synthesizes the master background image from high-resolution (5.4K) photography of ancient Roman ruins (Giardino di Ninfa):
- Authentic Roman arched stone portal opening to outdoor greenery
- Lush green vegetation, climbing ivy vines, and ancient weathered fieldstone
- Carved Roman numerals ('I • II • III • IV • V • VI • VII • VIII') chiselled into the arch keystone & frieze
- Subtle dark cinematic vignette gradient for contrast separation against the honey-cherry wood harp
- Soft, fragmented early morning sunlight beams filtering from the upper right
"""

import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont

def generate_artwork_ninfa():
    width, height = 1080, 1920

    # 1. Load high-res 5.4K Ninfa photograph
    ninfa_src = Image.open('public/images/ninfa_2983.jpg').convert('RGB')
    nw, nh = ninfa_src.size

    # Crop 9:16 portrait: Framing the ancient stone wall, arch portal, and meadow
    pw = int(nh * (9.0 / 16.0)) # 2052px
    # Align so the Roman arched portal is in the center-lower zone where the pedestal rests
    crop_x1 = int(nw * 0.27)
    crop_x2 = crop_x1 + pw
    base_cropped = ninfa_src.crop((crop_x1, 0, crop_x2, nh)).resize((width, height), Image.Resampling.LANCZOS)

    # 2. Color Grading & Botanical Enrichment
    # Balance colors: increase green saturation slightly, cool down excessive yellow in stone highlights
    base_arr = np.array(base_cropped, dtype=np.float32)

    r = base_arr[:, :, 0]
    g = base_arr[:, :, 1]
    b = base_arr[:, :, 2]

    # Detect green foliage to enrich depth
    foliage_mask = np.clip((g * 1.3 - r * 0.9 - b * 0.4) / 50.0, 0, 1)

    r_graded = np.clip(r * 0.92 + b * 0.05, 0, 255)
    g_graded = np.clip(g * 1.08 + foliage_mask * 20.0, 0, 255)
    b_graded = np.clip(b * 1.04 + g * 0.04, 0, 255)

    graded_arr = np.stack([r_graded, g_graded, b_graded], axis=2).astype(np.uint8)
    graded_img = Image.fromarray(graded_arr)

    # 3. Inscribe Carved Roman Numerals ('I • II • III • IV • V • VI • VII • VIII')
    # Place on the arch stones and horizontal travertine band above the portal
    # The arch in this crop is located around x=580..740, y=1150..1500
    # Let's place the Roman numerals on the prominent stone band above the arch at y ~ 780 to 860
    draw = ImageDraw.Draw(graded_img)
    try:
        font_main = ImageFont.truetype('C:\\Windows\\Fonts\\times.ttf', 36)
        font_arch = ImageFont.truetype('C:\\Windows\\Fonts\\times.ttf', 26)
    except:
        font_main = ImageFont.load_default()
        font_arch = font_main

    numerals_text = "I  •  II  •  III  •  IV  •  V  •  VI  •  VII  •  VIII"

    # Position on the prominent stone band above the arch at y ~ 540 (visible above harp crown)
    tx, ty = 140, 540

    # Chisel Carving Effect:
    # Top/left deep groove shadow
    draw.text((tx - 1, ty - 1), numerals_text, font=font_main, fill=(24, 22, 18, 220))
    draw.text((tx, ty - 2), numerals_text, font=font_main, fill=(18, 16, 12, 230))
    # Bottom/right sunlit travertine edge highlight
    draw.text((tx + 1, ty + 1), numerals_text, font=font_main, fill=(225, 218, 195, 175))
    # Carved stone interior
    draw.text((tx, ty), numerals_text, font=font_main, fill=(55, 48, 38, 205))

    # Also inscribe Roman arch keystone degrees around the arched portal
    arch_inscription = "TEMPLUM  •  OCTAVA  •  ROMA"
    draw.text((545, 1120), arch_inscription, font=font_arch, fill=(35, 30, 24, 180))
    draw.text((546, 1121), arch_inscription, font=font_arch, fill=(215, 208, 185, 130))

    # 4. Fragmented, Dappled Early Morning Sunlight Rays (Streaming from upper right)
    rays_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    rays_draw = ImageDraw.Draw(rays_overlay)

    # Sun origin in upper right morning sky (x=1150, y=-50)
    sun_x, sun_y = width + 70, -50

    # 7 fragmented, delicate sunbeams of varying width and intensity
    beams = [
        # (angle_deg, spread_deg, alpha, color)
        (-64, 4.2, 28, (255, 252, 235)),
        (-57, 3.0, 36, (255, 255, 242)),
        (-50, 5.2, 24, (254, 244, 215)),
        (-43, 3.4, 32, (255, 250, 230)),
        (-36, 4.5, 22, (255, 252, 238)),
        (-30, 2.8, 18, (254, 246, 220)),
        (-24, 4.0, 14, (255, 250, 230)),
    ]

    for angle, spread, alpha, col in beams:
        r1 = math.radians(180 + angle - spread * 0.5)
        r2 = math.radians(180 + angle + spread * 0.5)
        length = 2600

        p1 = (sun_x, sun_y)
        p2 = (sun_x + length * math.cos(r1), sun_y + length * math.sin(r1))
        p3 = (sun_x + length * math.cos(r2), sun_y + length * math.sin(r2))

        rays_draw.polygon([p1, p2, p3], fill=(col[0], col[1], col[2], alpha))

    # Feather sunbeams for natural soft diffusion
    rays_overlay = rays_overlay.filter(ImageFilter.GaussianBlur(radius=18))
    graded_img = Image.alpha_composite(graded_img.convert('RGBA'), rays_overlay)

    # 5. Subtle Dark Vignette & Radial Focus
    # Keeps center bright and edges gently darker so the warm harp pops
    y_grid, x_grid = np.mgrid[0:height, 0:width]
    cx, cy = width * 0.50, height * 0.52
    dist_map = np.sqrt(((x_grid - cx) / (width * 0.56)) ** 2 + ((y_grid - cy) / (height * 0.58)) ** 2)

    vig_arr = np.zeros((height, width, 4), dtype=np.uint8)
    # Darkening only begins outside r=0.48, reaching gentle alpha 125 at extreme borders
    vig_alpha = np.clip((dist_map - 0.48) * 170.0, 0, 125).astype(np.uint8)

    vig_arr[:, :, 0] = 12
    vig_arr[:, :, 1] = 16
    vig_arr[:, :, 2] = 14
    vig_arr[:, :, 3] = vig_alpha

    vig_img = Image.fromarray(vig_arr, mode='RGBA')
    final_img = Image.alpha_composite(graded_img, vig_img).convert('RGB')

    # Save to public and dist
    final_img.save('public/images/roman_sanctuary_cinematic.jpg', quality=95)
    final_img.save('dist/images/roman_sanctuary_cinematic.jpg', quality=95)
    print("Successfully generated and saved roman_sanctuary_cinematic.jpg (Ninfa Roman Ruins)!")

if __name__ == '__main__':
    generate_artwork_ninfa()
