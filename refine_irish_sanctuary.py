"""
Refined Irish Celtic Sanctuary Background Generator
Adjusts the user's uploaded master artwork:
1. Scales and shifts the ancient stone arch further back so the entire arch keystone and all archaic runes are 100% visible below the roadmap HUD card (below y=420 in 1080x1920).
2. Repositions the round stone pedestal lower in the frame and makes the circular disc slightly more compact, centering it directly beneath the 3D harp's rotating feet.
3. Adds multiple golden morning sunbeams streaming through the arch directly onto the center of the stone circle and extending across to the bottom of the screen.
"""

import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

def refine_sanctuary():
    width, height = 1080, 1920
    src_path = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/.user_uploaded/media_1792320687206_928b5173.jpg'
    im_raw = Image.open(src_path).convert('RGB')
    rw, rh = im_raw.size

    # 1. Scale down the arch and landscape so it sits further back into the background
    # Scale factor 0.82 allows the full arch to fit below the top roadmap HUD card
    scale_factor = 0.84
    new_w = int(width * scale_factor)
    new_h = int(height * scale_factor)

    im_scaled = im_raw.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 2. Composite onto full 1080x1920 canvas
    # The arch will be placed lower so the top of the arch is at y ~ 380 (below the roadmap card at y=410)
    canvas = Image.new('RGB', (width, height), (16, 26, 18))

    # Fill sky/mist extension at the top with matching moody Irish clouds
    top_sky_crop = im_raw.crop((0, 0, rw, int(rh * 0.22))).resize((width, 420), Image.Resampling.LANCZOS)
    canvas.paste(top_sky_crop, (0, 0))

    # Paste the scaled archway centered horizontally, with arch top at y = 370
    paste_x = (width - new_w) // 2
    paste_y = int(height * 0.14) # Arch top around y ~ 370

    canvas.paste(im_scaled, (paste_x, paste_y))

    # 3. Enhance Lower Stone Pedestal: Center the round stone plinth directly under the harp
    # Crop the stone pedestal from the original high-res image and position it closer to the bottom
    # In original: pedestal is at bottom 40% (x: 10% to 90%, y: 55% to 95%)
    ped_crop = im_raw.crop((int(rw * 0.08), int(rh * 0.56), int(rw * 0.92), int(rh * 0.96)))
    # Resize pedestal slightly more compact (width ~ 780px instead of 920px)
    target_ped_w = 780
    target_ped_h = int(target_ped_w * (ped_crop.height / ped_crop.width))
    ped_resized = ped_crop.resize((target_ped_w, target_ped_h), Image.Resampling.LANCZOS)

    # Feather the pedestal edges with alpha mask so it blends seamlessly onto the ground
    mask = Image.new('L', (target_ped_w, target_ped_h), 255)
    mask_draw = ImageDraw.Draw(mask)
    # Feather top and sides
    for i in range(25):
        alpha = int(255 * (i / 25.0))
        mask_draw.rectangle([i, i, target_ped_w - i, target_ped_h - i], outline=alpha)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=8))

    # Paste the compact pedestal centered horizontally at y = 1080 (feet of harp hover at y ~ 1160)
    ped_x = (width - target_ped_w) // 2
    ped_y = 1120
    canvas.paste(ped_resized, (ped_x, ped_y), mask)

    # 4. Add Multiple Golden Morning Sunbeams streaming through the arch onto the stone circle
    rays_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    rays_draw = ImageDraw.Draw(rays_overlay)

    # Sun origin behind the right side of the arch (x ~ 820, y ~ 640)
    sun_x = 820
    sun_y = 620

    # Multiple distinct sunbeams:
    # A few targeting the center of the stone circle (cx ~ 540, cy ~ 1240)
    # A few extending further down to the end of the screen
    beam_targets = [
        # (target_x, target_y, beam_width, alpha, color)
        (540, 1240, 70, 48, (255, 250, 225)),  # Direct strike on center of stone circle!
        (510, 1260, 45, 55, (255, 255, 235)),  # Bright core on stone surface
        (480, 1280, 55, 38, (254, 245, 210)),  # Left edge of stone
        (580, 1230, 40, 42, (255, 248, 220)),  # Right edge of stone
        (380, 1850, 95, 32, (255, 248, 215)),  # Extending to lower-left screen edge
        (660, 1880, 85, 30, (254, 242, 205)),  # Extending to lower-right screen edge
        (540, 1900, 110, 26, (255, 252, 228)), # Extending to bottom-center screen edge
        (260, 1720, 75, 22, (254, 245, 210)),  # Broad atmospheric side ray
    ]

    for tx, ty, bw, alpha, col in beam_targets:
        angle = math.atan2(ty - sun_y, tx - sun_x)
        perp_x = -math.sin(angle) * bw * 0.5
        perp_y = math.cos(angle) * bw * 0.5

        # Polygon from near sun origin to target base
        p1 = (sun_x, sun_y)
        p2 = (tx + perp_x, ty + perp_y)
        p3 = (tx - perp_x, ty - perp_y)

        rays_draw.polygon([p1, p2, p3], fill=(col[0], col[1], col[2], alpha))

    # Soft Gaussian blur for realistic atmospheric volume
    rays_overlay = rays_overlay.filter(ImageFilter.GaussianBlur(radius=14))
    canvas = Image.alpha_composite(canvas.convert('RGBA'), rays_overlay)

    # 5. Subtle Edge Vignette
    y_grid, x_grid = np.mgrid[0:height, 0:width]
    cx, cy = width * 0.50, height * 0.52
    dist_map = np.sqrt(((x_grid - cx) / (width * 0.55)) ** 2 + ((y_grid - cy) / (height * 0.58)) ** 2)

    vig_arr = np.zeros((height, width, 4), dtype=np.uint8)
    vig_alpha = np.clip((dist_map - 0.50) * 165.0, 0, 125).astype(np.uint8)
    vig_arr[:, :, 0] = 10
    vig_arr[:, :, 1] = 16
    vig_arr[:, :, 2] = 12
    vig_arr[:, :, 3] = vig_alpha

    vig_overlay = Image.fromarray(vig_arr, mode='RGBA')
    final_img = Image.alpha_composite(canvas, vig_overlay).convert('RGB')

    # Save to both public and dist
    final_img.save('public/images/irish_celtic_sanctuary.jpg', quality=95)
    final_img.save('dist/images/irish_celtic_sanctuary.jpg', quality=95)
    print("Successfully generated and saved refined irish_celtic_sanctuary.jpg!")

if __name__ == '__main__':
    refine_sanctuary()
