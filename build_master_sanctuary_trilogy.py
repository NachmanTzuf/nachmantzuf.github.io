import cv2
import numpy as np
import os

def create_master_trilogy():
    print("=== STARTING MASTER SANCTUARY TRILOGY COMPOSITING ===")
    
    # 1. Load Ground Truth Green Reference
    green_ref_path = r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\.user_uploaded\media_1792394213508_4b9b84c9.png'
    if not os.path.exists(green_ref_path):
        green_ref_path = r'C:\Users\Hp\Pictures\EARPA ui potos\image.png_20261019091136.jpg'
        
    green_raw = cv2.imread(green_ref_path)
    h_std, w_std = 1024, 571
    h_2k, w_2k = 2752, 1536
    
    # Ensure standard dimensions
    if green_raw.shape[:2] != (h_std, w_std):
        green_raw = cv2.resize(green_raw, (w_std, h_std), interpolation=cv2.INTER_LANCZOS4)
        
    # Inpaint top status bar black letterbox (y=0..24)
    black_mask = np.zeros((h_std, w_std), dtype=np.uint8)
    black_mask[green_raw.mean(axis=2) < 5] = 255
    kernel = np.ones((3, 3), np.uint8)
    black_mask = cv2.dilate(black_mask, kernel, iterations=2)
    green_clean = cv2.inpaint(green_raw, black_mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
    
    # 2. Extract Precise Foreground & Window Segmentations
    fg_mask_path = r'c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\fg_mask.png'
    if os.path.exists(fg_mask_path):
        fg_mask_std = cv2.imread(fg_mask_path, 0).astype(float) / 255.0
    else:
        # Fallback GrabCut
        gc_mask = np.zeros((h_std, w_std), dtype=np.uint8)
        gc_mask[760:, :] = cv2.GC_FGD
        gc_mask[250:600, 270:460] = cv2.GC_BGD
        gc_mask[0:80, :] = cv2.GC_BGD
        gc_mask[0:350, 0:60] = cv2.GC_BGD
        arch_box = np.zeros((h_std, w_std), dtype=bool)
        arch_box[80:760, :] = True
        arch_box[220:680, 250:480] = False
        arch_box[0:350, 0:70] = False
        gc_mask[arch_box & (gc_mask == 0)] = cv2.GC_PR_FGD
        gc_mask[~arch_box & (gc_mask == 0)] = cv2.GC_PR_BGD
        bgdModel = np.zeros((1, 65), np.float64)
        fgdModel = np.zeros((1, 65), np.float64)
        cv2.grabCut(green_clean, gc_mask, None, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_MASK)
        fg_mask_std = np.where((gc_mask == 1) | (gc_mask == 3), 1.0, 0.0).astype(float)
        fg_mask_std[760:, :] = 1.0

    # Refine window opening (where fg_mask is 0 and y < 740)
    window_raw = np.where((fg_mask_std < 0.5) & (np.arange(h_std)[:, None] < 740), 1.0, 0.0)
    # Optical feathering (3px Gaussian)
    window_std = cv2.GaussianBlur(window_raw, (7, 7), 1.2)
    window_3c_std = np.stack([window_std]*3, axis=2)

    # 3. Load High Resolution 2K Environmental Backdrops
    pictures_dir = r'C:\Users\Hp\Pictures\EARPA ui potos'
    p_arctic_2k = os.path.join(pictures_dir, 'Stone_altar_in_arctic_fjord_2K_20261019091142.jpg')
    p_desert_2k = os.path.join(pictures_dir, 'Stone_altar_in_desert_canyon_2K_20261019091130.jpg')
    
    # Read via np.fromfile to safely handle Windows unicode paths
    data_a = np.fromfile(p_arctic_2k, dtype=np.uint8)
    arctic_bg_2k = cv2.imdecode(data_a, cv2.IMREAD_COLOR)
    arctic_bg_std = cv2.resize(arctic_bg_2k, (w_std, h_std), interpolation=cv2.INTER_AREA)

    data_d = np.fromfile(p_desert_2k, dtype=np.uint8)
    desert_bg_2k = cv2.imdecode(data_d, cv2.IMREAD_COLOR)
    desert_bg_std = cv2.resize(desert_bg_2k, (w_std, h_std), interpolation=cv2.INTER_AREA)

    # 4. Extract Structural Features from Master Green Plate
    g_float = green_clean.astype(float) / 255.0
    B, G, R = g_float[:, :, 0], g_float[:, :, 1], g_float[:, :, 2]
    gray = 0.299 * R + 0.587 * G + 0.114 * B

    # Foliage mask (moss, clover in seams)
    hsv = cv2.cvtColor(green_clean, cv2.COLOR_BGR2HSV)
    is_green = (hsv[:, :, 0] >= 22) & (hsv[:, :, 0] <= 88) & (hsv[:, :, 1] >= 20)
    foliage = np.clip((hsv[:, :, 1].astype(float) / 90.0) * is_green.astype(float), 0.0, 1.0)
    foliage = cv2.GaussianBlur(foliage, (5, 5), 0)

    # Upward-facing surfaces for atmospheric settling (snow / sand)
    sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    upward = np.clip(-sobel_y / 0.18, 0.0, 1.0) * fg_mask_std
    rim_accent = np.zeros((h_std, w_std), dtype=float)
    rim_accent[760:805, :] = 1.0
    upward_rim = np.clip(upward * 1.4 + rim_accent * 0.35, 0.0, 1.0) * fg_mask_std

    # High pass texture detail extraction from rock
    gray_blur = cv2.GaussianBlur(gray, (9, 9), 0)
    rock_grain = np.clip((gray - gray_blur) * 1.5 + 0.5, 0.0, 1.0)

    # Ancient Carved Petroglyphs / Ogham Runes on the arch
    blur_local = cv2.boxFilter(gray, -1, (7, 7))
    diff_crevice = cv2.subtract(blur_local, gray)
    arch_zone = np.zeros((h_std, w_std), dtype=bool)
    arch_zone[50:260, 160:550] = True
    arch_zone[120:620, 150:260] = True
    arch_zone[220:680, 480:571] = True
    arch_zone = arch_zone & (fg_mask_std > 0.8)

    diff_sub = np.clip((diff_crevice - 0.02) * 8.0, 0, 1) * arch_zone
    rune_core = cv2.GaussianBlur(diff_sub, (3, 3), 0.8)
    rune_halo = cv2.GaussianBlur(diff_sub, (15, 15), 3.0)

    # Soft Light blend function
    def soft_light(base, blend):
        cond = blend < 0.5
        res = np.empty_like(base)
        res[cond] = 2.0 * base[cond] * blend[cond] + (base[cond]**2) * (1.0 - 2.0 * blend[cond])
        res[~cond] = 2.0 * base[~cond] * (1.0 - blend[~cond]) + np.sqrt(np.maximum(base[~cond], 0)) * (2.0 * blend[~cond] - 1.0)
        return res

    # ==========================================
    # BUILD REALM 1: GREEN CELTIC SANCTUARY
    # ==========================================
    print("Compositing Realm 1: Green Celtic Coastal Sanctuary...")
    # Subtle emerald rune luminescence
    g_halo = np.stack([rune_halo * 0.65, rune_halo * 0.95, rune_halo * 0.35], axis=2)
    g_core = np.stack([rune_core * 0.75, rune_core * 1.0, rune_core * 0.70], axis=2)
    green_final_std = np.clip((g_float + g_halo * 0.40 + g_core * 0.50) * 255.0, 0, 255).astype(np.uint8)

    # ==========================================
    # BUILD REALM 2: ARCTIC FROZEN SANCTUARY
    # ==========================================
    print("Compositing Realm 2: Arctic Frozen Sanctuary...")
    # Base slate frost stone material
    arc_stone_B = np.clip(gray * 1.06 + 0.07, 0.0, 1.0)
    arc_stone_G = np.clip(gray * 0.99 + 0.04, 0.0, 1.0)
    arc_stone_R = np.clip(gray * 0.93 + 0.01, 0.0, 1.0)

    # Snow & rime ice accumulation
    arc_snow_B = np.clip(gray * 0.62 + 0.40, 0.0, 1.0)
    arc_snow_G = np.clip(gray * 0.60 + 0.38, 0.0, 1.0)
    arc_snow_R = np.clip(gray * 0.56 + 0.35, 0.0, 1.0)

    snow_weight = np.clip(upward_rim * 0.88 + foliage * 0.96, 0.0, 1.0)

    arc_arch_B = (1.0 - snow_weight) * arc_stone_B + snow_weight * arc_snow_B
    arc_arch_G = (1.0 - snow_weight) * arc_stone_G + snow_weight * arc_snow_G
    arc_arch_R = (1.0 - snow_weight) * arc_stone_R + snow_weight * arc_snow_R

    # Enhance rock surface grain
    arc_arch_B = soft_light(arc_arch_B, rock_grain)
    arc_arch_G = soft_light(arc_arch_G, rock_grain)
    arc_arch_R = soft_light(arc_arch_R, rock_grain)

    arc_architecture = np.stack([arc_arch_B, arc_arch_G, arc_arch_R], axis=2)

    # Glacial cyan luminescent runes (#38bdf8: BGR=[248, 189, 56])
    arc_halo = np.stack([rune_halo * 0.97, rune_halo * 0.74, rune_halo * 0.22], axis=2)
    arc_core = np.stack([rune_core * 1.0, rune_core * 0.95, rune_core * 0.70], axis=2)
    arc_arch_with_glow = np.clip(arc_architecture + arc_halo * 0.65 + arc_core * 0.75, 0.0, 1.0)

    # Composite with Arctic background through window and outer edges
    arctic_bg_float = arctic_bg_std.astype(float) / 255.0
    arctic_final_std = (arctic_bg_float * window_3c_std + 
                        arc_arch_with_glow * (1.0 - window_3c_std))
    arctic_final_std = np.clip(arctic_final_std * 255.0, 0, 255).astype(np.uint8)

    # ==========================================
    # BUILD REALM 3: DESERT CANYON SANCTUARY
    # ==========================================
    print("Compositing Realm 3: Desert Canyon Sanctuary...")
    # Navajo red sandstone material
    des_stone_R = np.clip(gray * 1.36 + 0.09, 0.0, 1.0)
    des_stone_G = np.clip(gray * 0.66 - 0.01, 0.0, 1.0)
    des_stone_B = np.clip(gray * 0.35 - 0.03, 0.0, 1.0)

    # Fine golden sand in crevices and foliage seams
    des_sand_R = np.clip(gray * 1.28 + 0.16, 0.0, 1.0)
    des_sand_G = np.clip(gray * 0.88 + 0.06, 0.0, 1.0)
    des_sand_B = np.clip(gray * 0.44 + 0.01, 0.0, 1.0)

    sand_weight = np.clip(upward_rim * 0.68 + foliage * 0.88, 0.0, 1.0)

    des_arch_R = (1.0 - sand_weight) * des_stone_R + sand_weight * des_sand_R
    des_arch_G = (1.0 - sand_weight) * des_stone_G + sand_weight * des_sand_G
    des_arch_B = (1.0 - sand_weight) * des_stone_B + sand_weight * des_sand_B

    # Enhance rock surface grain
    des_arch_R = soft_light(des_arch_R, rock_grain)
    des_arch_G = soft_light(des_arch_G, rock_grain)
    des_arch_B = soft_light(des_arch_B, rock_grain)

    des_architecture = np.stack([des_arch_B, des_arch_G, des_arch_R], axis=2)

    # Molten amber luminescent runes (#f59e0b: BGR=[11, 158, 245])
    des_halo = np.stack([rune_halo * 0.04, rune_halo * 0.62, rune_halo * 0.96], axis=2)
    des_core = np.stack([rune_core * 0.55, rune_core * 0.90, rune_core * 1.0], axis=2)
    des_arch_with_glow = np.clip(des_architecture + des_halo * 0.70 + des_core * 0.80, 0.0, 1.0)

    # Composite with Desert background through window and outer edges
    desert_bg_float = desert_bg_std.astype(float) / 255.0
    desert_final_std = (desert_bg_float * window_3c_std + 
                        des_arch_with_glow * (1.0 - window_3c_std))
    desert_final_std = np.clip(desert_final_std * 255.0, 0, 255).astype(np.uint8)

    # ==========================================
    # BUILD 2K RETINA VERSIONS (1536 x 2752)
    # ==========================================
    print("Generating 2K Retina master files (1536 x 2752)...")
    green_final_2k = cv2.resize(green_final_std, (w_2k, h_2k), interpolation=cv2.INTER_LANCZOS4)
    arctic_final_2k = cv2.resize(arctic_final_std, (w_2k, h_2k), interpolation=cv2.INTER_LANCZOS4)
    desert_final_2k = cv2.resize(desert_final_std, (w_2k, h_2k), interpolation=cv2.INTER_LANCZOS4)

    # Sharpen 2K slightly with subtle unsharp mask
    for img_2k in [green_final_2k, arctic_final_2k, desert_final_2k]:
        blur_2k = cv2.GaussianBlur(img_2k, (0, 0), 1.5)
        cv2.addWeighted(img_2k, 1.25, blur_2k, -0.25, 0, img_2k)

    # ==========================================
    # SAVE DELIVERABLES TO TARGET FOLDERS
    # ==========================================
    out_folders = [
        r'C:\Users\Hp\Desktop\ARPA levels and harp mechanism',
        r'C:\Users\Hp\Pictures\EARPA ui potos',
        r'c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio'
    ]

    file_dict = {
        'EARPA_01_Green_Celtic_Sanctuary.png': green_final_std,
        'EARPA_02_Arctic_Frozen_Sanctuary.png': arctic_final_std,
        'EARPA_03_Desert_Canyon_Sanctuary.png': desert_final_std,
        'EARPA_01_Green_Celtic_Sanctuary_2K.png': green_final_2k,
        'EARPA_02_Arctic_Frozen_Sanctuary_2K.png': arctic_final_2k,
        'EARPA_03_Desert_Canyon_Sanctuary_2K.png': desert_final_2k
    }

    for folder in out_folders:
        os.makedirs(folder, exist_ok=True)
        for fname, img_data in file_dict.items():
            out_path = os.path.join(folder, fname)
            # Use imencode + tofile for Windows Unicode safety
            is_success, buffer = cv2.imencode('.png', img_data)
            if is_success:
                with open(out_path, 'wb') as f:
                    f.write(buffer)
            print(f"Exported: {out_path} ({img_data.shape[1]}x{img_data.shape[0]})")

    print("\n=== ALL DELIVERABLES EXPORTED SUCCESSFULLY ===")

if __name__ == '__main__':
    create_master_trilogy()
