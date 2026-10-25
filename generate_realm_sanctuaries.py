import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

def create_arctic_sanctuary():
    base = Image.open('public/images/irish_celtic_sanctuary.jpg').convert('RGB')
    arr = np.array(base, dtype=np.float32)
    
    # Runes mask (warm yellow-orange glowing pixels)
    rune_mask = (arr[:, :, 0] > 175) & (arr[:, :, 1] > 140) & (arr[:, :, 0] > arr[:, :, 2] + 35)
    
    # Green flora / moss mask
    green_mask = (arr[:, :, 1] > arr[:, :, 0] - 5) & (arr[:, :, 1] > arr[:, :, 2] + 8) & (~rune_mask)
    
    out = arr.copy()
    
    # 1. Transform Green Vegetation & Hills to Snow / Frosted Tundra
    # Calculate luminance of the vegetation
    veg_lum = arr[green_mask, 0] * 0.299 + arr[green_mask, 1] * 0.587 + arr[green_mask, 2] * 0.114
    # Turn vegetation into bright, pristine blue-white snow and rime frost
    out[green_mask, 0] = np.clip(veg_lum * 0.95 + 40.0, 0, 255)
    out[green_mask, 1] = np.clip(veg_lum * 1.05 + 55.0, 0, 255)
    out[green_mask, 2] = np.clip(veg_lum * 1.25 + 80.0, 0, 255)
    
    # 2. Cool Blue Slate Stone Tint for Arch & Pedestal
    stone_mask = (~green_mask) & (~rune_mask)
    # Attenuate red, slightly boost green, strongly boost blue
    out[stone_mask, 0] = np.clip(out[stone_mask, 0] * 0.82 + 5.0, 0, 255)
    out[stone_mask, 1] = np.clip(out[stone_mask, 1] * 0.92 + 15.0, 0, 255)
    out[stone_mask, 2] = np.clip(out[stone_mask, 2] * 1.18 + 32.0, 0, 255)
    
    # 3. Sky & Atmosphere Color Grade: Polar Winter Overcast
    # For upper sky (y < 350)
    for y in range(350):
        factor = (350 - y) / 350.0 * 0.25
        out[y, :, 0] = np.clip(out[y, :, 0] * (1.0 - factor * 0.4), 0, 255)
        out[y, :, 2] = np.clip(out[y, :, 2] * (1.0 + factor * 0.3) + factor * 20.0, 0, 255)
        
    # 4. Ocean & Sea Stack: Frozen Glacial Water
    # Lower ocean area around y: 480..650, x: 200..450
    ocean_mask = np.zeros((1024, 571), dtype=bool)
    for y in range(480, 650):
        for x in range(200, 480):
            if arr[y, x, 2] > 90 and arr[y, x, 0] < 120 and not green_mask[y, x] and not rune_mask[y, x]:
                ocean_mask[y, x] = True
    out[ocean_mask, 0] = np.clip(out[ocean_mask, 0] * 0.65 + 10.0, 0, 255)
    out[ocean_mask, 1] = np.clip(out[ocean_mask, 1] * 1.10 + 25.0, 0, 255)
    out[ocean_mask, 2] = np.clip(out[ocean_mask, 2] * 1.35 + 45.0, 0, 255) # Deep glacial cyan

    # 5. Glowing Runes: Radiant Electric Glacial Cyan (#38bdf8 / #7dd3fc)
    rune_lum = arr[rune_mask, 0] * 0.3 + arr[rune_mask, 1] * 0.59 + arr[rune_mask, 2] * 0.11
    out[rune_mask, 0] = np.clip(rune_lum * 0.40 + 35, 0, 255)
    out[rune_mask, 1] = np.clip(rune_lum * 0.95 + 60, 0, 255)
    out[rune_mask, 2] = np.clip(rune_lum * 1.20 + 95, 0, 255)

    # Rune Bloom Effect
    rune_img = Image.fromarray((rune_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=6))
    rune_bloom = np.array(rune_img, dtype=np.float32) / 255.0
    out[:, :, 0] += rune_bloom * 40.0
    out[:, :, 1] += rune_bloom * 125.0
    out[:, :, 2] += rune_bloom * 200.0
    out = np.clip(out, 0, 255)

    res = Image.fromarray(out.astype(np.uint8))
    res = ImageEnhance.Contrast(res).enhance(1.06)
    res = ImageEnhance.Color(res).enhance(1.12)
    return res

def create_desert_sanctuary():
    base = Image.open('public/images/irish_celtic_sanctuary.jpg').convert('RGB')
    arr = np.array(base, dtype=np.float32)
    
    # Runes mask
    rune_mask = (arr[:, :, 0] > 175) & (arr[:, :, 1] > 140) & (arr[:, :, 0] > arr[:, :, 2] + 35)
    
    # Green flora / moss mask
    green_mask = (arr[:, :, 1] > arr[:, :, 0] - 5) & (arr[:, :, 1] > arr[:, :, 2] + 8) & (~rune_mask)
    
    out = arr.copy()
    
    # 1. Transform Green Vegetation & Hills to Desert Sand Dunes & Terracotta Earth
    veg_lum = arr[green_mask, 0] * 0.299 + arr[green_mask, 1] * 0.587 + arr[green_mask, 2] * 0.114
    # Golden sand & warm terracotta
    out[green_mask, 0] = np.clip(veg_lum * 1.45 + 55.0, 0, 255)
    out[green_mask, 1] = np.clip(veg_lum * 0.98 + 25.0, 0, 255)
    out[green_mask, 2] = np.clip(veg_lum * 0.45 + 8.0, 0, 255)
    
    # 2. Navajo Red Sandstone & Warm Terracotta Tone for Arch & Pedestal
    stone_mask = (~green_mask) & (~rune_mask)
    out[stone_mask, 0] = np.clip(out[stone_mask, 0] * 1.28 + 26.0, 0, 255)
    out[stone_mask, 1] = np.clip(out[stone_mask, 1] * 0.94 + 8.0, 0, 255)
    out[stone_mask, 2] = np.clip(out[stone_mask, 2] * 0.68 - 10.0, 0, 255)
    
    # 3. Sky & Atmosphere: Warm Golden Desert Sunset Haze
    for y in range(500):
        factor = (500 - y) / 500.0 * 0.35
        out[y, :, 0] = np.clip(out[y, :, 0] * (1.0 + factor * 0.35) + factor * 30.0, 0, 255)
        out[y, :, 1] = np.clip(out[y, :, 1] * (1.0 + factor * 0.15) + factor * 15.0, 0, 255)
        out[y, :, 2] = np.clip(out[y, :, 2] * (1.0 - factor * 0.35), 0, 255)

    # 4. Ocean & Cliffs -> Red Rock Canyon Basin & Desert Mirage
    ocean_mask = np.zeros((1024, 571), dtype=bool)
    for y in range(480, 650):
        for x in range(200, 480):
            if arr[y, x, 2] > 90 and arr[y, x, 0] < 120 and not green_mask[y, x] and not rune_mask[y, x]:
                ocean_mask[y, x] = True
    out[ocean_mask, 0] = np.clip(out[ocean_mask, 0] * 1.40 + 45.0, 0, 255)
    out[ocean_mask, 1] = np.clip(out[ocean_mask, 1] * 0.95 + 20.0, 0, 255)
    out[ocean_mask, 2] = np.clip(out[ocean_mask, 2] * 0.50 + 5.0, 0, 255)

    # 5. Glowing Runes: Molten Fiery Amber & Sun Gold (#f59e0b / #fbbf24)
    rune_lum = arr[rune_mask, 0] * 0.3 + arr[rune_mask, 1] * 0.59 + arr[rune_mask, 2] * 0.11
    out[rune_mask, 0] = np.clip(rune_lum * 1.30 + 55, 0, 255)
    out[rune_mask, 1] = np.clip(rune_lum * 0.88 + 25, 0, 255)
    out[rune_mask, 2] = np.clip(rune_lum * 0.15 + 5, 0, 255)

    # Rune Bloom Effect
    rune_img = Image.fromarray((rune_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=6))
    rune_bloom = np.array(rune_img, dtype=np.float32) / 255.0
    out[:, :, 0] += rune_bloom * 220.0
    out[:, :, 1] += rune_bloom * 135.0
    out[:, :, 2] += rune_bloom * 15.0
    out = np.clip(out, 0, 255)

    res = Image.fromarray(out.astype(np.uint8))
    res = ImageEnhance.Contrast(res).enhance(1.08)
    res = ImageEnhance.Color(res).enhance(1.15)
    return res

if __name__ == '__main__':
    arctic = create_arctic_sanctuary()
    desert = create_desert_sanctuary()
    
    brain_dir = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95'
    arctic.save(f'{brain_dir}/melody_arctic_sanctuary_master.jpg', quality=96)
    desert.save(f'{brain_dir}/levers_desert_sanctuary_master.jpg', quality=96)
    
    arctic.save('public/images/arctic_celtic_sanctuary.jpg', quality=96)
    arctic.save('dist/images/arctic_celtic_sanctuary.jpg', quality=96)
    desert.save('public/images/desert_celtic_sanctuary.jpg', quality=96)
    desert.save('dist/images/desert_celtic_sanctuary.jpg', quality=96)
    
    print('Refined Arctic and Desert companion sanctuary images successfully!')
