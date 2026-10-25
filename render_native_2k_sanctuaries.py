import cv2
import numpy as np
import os
import shutil

def render_native_2k_and_replace():
    print("=================================================================")
    print("RENDERING NATIVE 2K HIGH RESOLUTION SANCTUARY IMAGES & REPLACING")
    print("=================================================================\n")

    pictures_dir = r'C:\Users\Hp\Pictures\EARPA ui potos'
    desktop_dir = r'C:\Users\Hp\Desktop\ARPA levels and harp mechanism'
    brain_dir = r'C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323'

    p_orig_arctic = os.path.join(pictures_dir, 'Stone_altar_in_arctic_fjord_2K_20261019091142.jpg')
    p_orig_desert = os.path.join(pictures_dir, 'Stone_altar_in_desert_canyon_2K_20261019091130.jpg')

    # 1. Back up original drifted files if not already backed up
    p_bak_arctic = os.path.join(pictures_dir, 'Stone_altar_in_arctic_fjord_2K_20261019091142.original_backup.jpg')
    p_bak_desert = os.path.join(pictures_dir, 'Stone_altar_in_desert_canyon_2K_20261019091130.original_backup.jpg')

    if not os.path.exists(p_bak_arctic) and os.path.exists(p_orig_arctic):
        shutil.copy2(p_orig_arctic, p_bak_arctic)
        print(f"Backup created: {p_bak_arctic}")

    if not os.path.exists(p_bak_desert) and os.path.exists(p_orig_desert):
        shutil.copy2(p_orig_desert, p_bak_desert)
        print(f"Backup created: {p_bak_desert}")

    # Use the backup (or original) as the raw 2K background panorama source
    source_arctic_path = p_bak_arctic if os.path.exists(p_bak_arctic) else p_orig_arctic
    source_desert_path = p_bak_desert if os.path.exists(p_bak_desert) else p_orig_desert

    data_a = np.fromfile(source_arctic_path, dtype=np.uint8)
    arctic_raw_2k = cv2.imdecode(data_a, cv2.IMREAD_COLOR)

    data_d = np.fromfile(source_desert_path, dtype=np.uint8)
    desert_raw_2k = cv2.imdecode(data_d, cv2.IMREAD_COLOR)

    h_2k, w_2k = 2752, 1536
    print(f"Loaded raw 2K background sources: Arctic={arctic_raw_2k.shape}, Desert={desert_raw_2k.shape}")

    # 2. Load and Upscale Master Green Architecture to 2K
    green_clean_path = r'c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\green_clean_plate.png'
    green_std = cv2.imread(green_clean_path)
    green_2k = cv2.resize(green_std, (w_2k, h_2k), interpolation=cv2.INTER_LANCZOS4)

    fg_mask_std = cv2.imread(r'c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\fg_mask.png', 0).astype(float) / 255.0
    fg_mask_2k = cv2.resize(fg_mask_std, (w_2k, h_2k), interpolation=cv2.INTER_LANCZOS4)

    # 3. Create High Resolution 2K Window Opening Mask
    # Altar boundary in 2K: 740 * 2752 / 1024 = 1988px
    altar_top_cutoff_2k = int(740 * h_2k / 1024)
    window_raw_2k = np.where((fg_mask_2k < 0.5) & (np.arange(h_2k)[:, None] < altar_top_cutoff_2k), 1.0, 0.0)
    # 2K Optical Gaussian feathering
    window_2k = cv2.GaussianBlur(window_raw_2k, (15, 15), 3.0)
    window_3c_2k = np.stack([window_2k]*3, axis=2)

    # 4. Extract 2K Structural Features
    g_float_2k = green_2k.astype(float) / 255.0
    B_2k, G_2k, R_2k = g_float_2k[:, :, 0], g_float_2k[:, :, 1], g_float_2k[:, :, 2]
    gray_2k = 0.299 * R_2k + 0.587 * G_2k + 0.114 * B_2k

    # Foliage mask in 2K
    hsv_2k = cv2.cvtColor(green_2k, cv2.COLOR_BGR2HSV)
    is_green_2k = (hsv_2k[:, :, 0] >= 22) & (hsv_2k[:, :, 0] <= 88) & (hsv_2k[:, :, 1] >= 20)
    foliage_2k = np.clip((hsv_2k[:, :, 1].astype(float) / 90.0) * is_green_2k.astype(float), 0.0, 1.0)
    foliage_2k = cv2.GaussianBlur(foliage_2k, (9, 9), 0)

    # Upward surfaces for 2K snow/sand settling
    sobel_y_2k = cv2.Sobel(gray_2k, cv2.CV_64F, 0, 1, ksize=5)
    upward_2k = np.clip(-sobel_y_2k / 0.18, 0.0, 1.0) * fg_mask_2k
    rim_accent_2k = np.zeros((h_2k, w_2k), dtype=float)
    rim_y_start = int(760 * h_2k / 1024)
    rim_y_end = int(805 * h_2k / 1024)
    rim_accent_2k[rim_y_start:rim_y_end, :] = 1.0
    upward_rim_2k = np.clip(upward_2k * 1.4 + rim_accent_2k * 0.35, 0.0, 1.0) * fg_mask_2k

    # 2K High Pass Rock Grain Extraction
    gray_blur_2k = cv2.GaussianBlur(gray_2k, (19, 19), 0)
    rock_grain_2k = np.clip((gray_2k - gray_blur_2k) * 1.6 + 0.5, 0.0, 1.0)

    # 2K Runes
    blur_local_2k = cv2.boxFilter(gray_2k, -1, (15, 15))
    diff_crevice_2k = cv2.subtract(blur_local_2k, gray_2k)

    arch_zone_2k = np.zeros((h_2k, w_2k), dtype=bool)
    arch_zone_2k[int(50*h_2k/1024):int(260*h_2k/1024), int(160*w_2k/571):int(550*w_2k/571)] = True
    arch_zone_2k[int(120*h_2k/1024):int(620*h_2k/1024), int(150*w_2k/571):int(260*w_2k/571)] = True
    arch_zone_2k[int(220*h_2k/1024):int(680*h_2k/1024), int(480*w_2k/571):w_2k] = True
    arch_zone_2k = arch_zone_2k & (fg_mask_2k > 0.8)

    diff_sub_2k = np.clip((diff_crevice_2k - 0.02) * 8.0, 0, 1) * arch_zone_2k
    rune_core_2k = cv2.GaussianBlur(diff_sub_2k, (7, 7), 1.8)
    rune_halo_2k = cv2.GaussianBlur(diff_sub_2k, (35, 35), 7.0)

    def soft_light_2k(base, blend):
        cond = blend < 0.5
        res = np.empty_like(base)
        res[cond] = 2.0 * base[cond] * blend[cond] + (base[cond]**2) * (1.0 - 2.0 * blend[cond])
        res[~cond] = 2.0 * base[~cond] * (1.0 - blend[~cond]) + np.sqrt(np.maximum(base[~cond], 0)) * (2.0 * blend[~cond] - 1.0)
        return res

    # ==========================================
    # BUILD NATIVE 2K ARCTIC SANCTUARY
    # ==========================================
    print("Rendering Native 2K Arctic Frozen Sanctuary...")
    arc_stone_B = np.clip(gray_2k * 1.06 + 0.07, 0.0, 1.0)
    arc_stone_G = np.clip(gray_2k * 0.99 + 0.04, 0.0, 1.0)
    arc_stone_R = np.clip(gray_2k * 0.93 + 0.01, 0.0, 1.0)

    arc_snow_B = np.clip(gray_2k * 0.62 + 0.40, 0.0, 1.0)
    arc_snow_G = np.clip(gray_2k * 0.60 + 0.38, 0.0, 1.0)
    arc_snow_R = np.clip(gray_2k * 0.56 + 0.35, 0.0, 1.0)

    snow_weight_2k = np.clip(upward_rim_2k * 0.88 + foliage_2k * 0.96, 0.0, 1.0)

    arc_arch_B = (1.0 - snow_weight_2k) * arc_stone_B + snow_weight_2k * arc_snow_B
    arc_arch_G = (1.0 - snow_weight_2k) * arc_stone_G + snow_weight_2k * arc_snow_G
    arc_arch_R = (1.0 - snow_weight_2k) * arc_stone_R + snow_weight_2k * arc_snow_R

    arc_arch_B = soft_light_2k(arc_arch_B, rock_grain_2k)
    arc_arch_G = soft_light_2k(arc_arch_G, rock_grain_2k)
    arc_arch_R = soft_light_2k(arc_arch_R, rock_grain_2k)

    arc_architecture_2k = np.stack([arc_arch_B, arc_arch_G, arc_arch_R], axis=2)

    # Glacial cyan glow (#38bdf8: BGR=[248, 189, 56])
    arc_halo_2k = np.stack([rune_halo_2k * 0.97, rune_halo_2k * 0.74, rune_halo_2k * 0.22], axis=2)
    arc_core_2k = np.stack([rune_core_2k * 1.0, rune_core_2k * 0.95, rune_core_2k * 0.70], axis=2)
    arc_arch_with_glow_2k = np.clip(arc_architecture_2k + arc_halo_2k * 0.65 + arc_core_2k * 0.75, 0.0, 1.0)

    # Composite directly with raw 2K Arctic background
    arctic_bg_float_2k = cv2.resize(arctic_raw_2k, (w_2k, h_2k), interpolation=cv2.INTER_LANCZOS4).astype(float) / 255.0
    arctic_final_2k = (arctic_bg_float_2k * window_3c_2k + 
                       arc_arch_with_glow_2k * (1.0 - window_3c_2k))
    arctic_final_2k = np.clip(arctic_final_2k * 255.0, 0, 255).astype(np.uint8)

    # Subtle 2K sharpening
    blur_arc = cv2.GaussianBlur(arctic_final_2k, (0, 0), 1.2)
    cv2.addWeighted(arctic_final_2k, 1.22, blur_arc, -0.22, 0, arctic_final_2k)

    # ==========================================
    # BUILD NATIVE 2K DESERT CANYON SANCTUARY
    # ==========================================
    print("Rendering Native 2K Desert Canyon Sanctuary...")
    des_stone_R = np.clip(gray_2k * 1.36 + 0.09, 0.0, 1.0)
    des_stone_G = np.clip(gray_2k * 0.66 - 0.01, 0.0, 1.0)
    des_stone_B = np.clip(gray_2k * 0.35 - 0.03, 0.0, 1.0)

    des_sand_R = np.clip(gray_2k * 1.28 + 0.16, 0.0, 1.0)
    des_sand_G = np.clip(gray_2k * 0.88 + 0.06, 0.0, 1.0)
    des_sand_B = np.clip(gray_2k * 0.44 + 0.01, 0.0, 1.0)

    sand_weight_2k = np.clip(upward_rim_2k * 0.68 + foliage_2k * 0.88, 0.0, 1.0)

    des_arch_R = (1.0 - sand_weight_2k) * des_stone_R + sand_weight_2k * des_sand_R
    des_arch_G = (1.0 - sand_weight_2k) * des_stone_G + sand_weight_2k * des_sand_G
    des_arch_B = (1.0 - sand_weight_2k) * des_stone_B + sand_weight_2k * des_sand_B

    des_arch_R = soft_light_2k(des_arch_R, rock_grain_2k)
    des_arch_G = soft_light_2k(des_arch_G, rock_grain_2k)
    des_arch_B = soft_light_2k(des_arch_B, rock_grain_2k)

    des_architecture_2k = np.stack([des_arch_B, des_arch_G, des_arch_R], axis=2)

    # Molten amber glow (#f59e0b: BGR=[11, 158, 245])
    des_halo_2k = np.stack([rune_halo_2k * 0.04, rune_halo_2k * 0.62, rune_halo_2k * 0.96], axis=2)
    des_core_2k = np.stack([rune_core_2k * 0.55, rune_core_2k * 0.90, rune_core_2k * 1.0], axis=2)
    des_arch_with_glow_2k = np.clip(des_architecture_2k + des_halo_2k * 0.70 + des_core_2k * 0.80, 0.0, 1.0)

    # Composite directly with raw 2K Desert background
    desert_bg_float_2k = cv2.resize(desert_raw_2k, (w_2k, h_2k), interpolation=cv2.INTER_LANCZOS4).astype(float) / 255.0
    desert_final_2k = (desert_bg_float_2k * window_3c_2k + 
                       des_arch_with_glow_2k * (1.0 - window_3c_2k))
    desert_final_2k = np.clip(desert_final_2k * 255.0, 0, 255).astype(np.uint8)

    # Subtle 2K sharpening
    blur_des = cv2.GaussianBlur(desert_final_2k, (0, 0), 1.2)
    cv2.addWeighted(desert_final_2k, 1.22, blur_des, -0.22, 0, desert_final_2k)

    # ==========================================
    # OVERWRITE & REPLACE IN PICTURES FOLDER
    # ==========================================
    print("\n--- Overwriting files in C:\\Users\\Hp\\Pictures\\EARPA ui potos ---")
    
    # 1. Overwrite original .jpg filenames with high-quality JPEG (quality=98)
    # Arctic JPG overwrite
    ok_a, buf_a = cv2.imencode('.jpg', arctic_final_2k, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
    if ok_a:
        with open(p_orig_arctic, 'wb') as f:
            f.write(buf_a)
        print(f"REPLACED: {p_orig_arctic} ({w_2k}x{h_2k}, {len(buf_a)/1024/1024:.2f} MB)")

    # Desert JPG overwrite
    ok_d, buf_d = cv2.imencode('.jpg', desert_final_2k, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
    if ok_d:
        with open(p_orig_desert, 'wb') as f:
            f.write(buf_d)
        print(f"REPLACED: {p_orig_desert} ({w_2k}x{h_2k}, {len(buf_d)/1024/1024:.2f} MB)")

    # 2. Also save lossless PNG 2K in Pictures folder
    p_png_arctic_pic = os.path.join(pictures_dir, 'EARPA_02_Arctic_Frozen_Sanctuary_2K.png')
    p_png_desert_pic = os.path.join(pictures_dir, 'EARPA_03_Desert_Canyon_Sanctuary_2K.png')
    
    ok_png_a, buf_png_a = cv2.imencode('.png', arctic_final_2k)
    with open(p_png_arctic_pic, 'wb') as f:
        f.write(buf_png_a)
    print(f"SAVED: {p_png_arctic_pic} ({w_2k}x{h_2k})")

    ok_png_d, buf_png_d = cv2.imencode('.png', desert_final_2k)
    with open(p_png_desert_pic, 'wb') as f:
        f.write(buf_png_d)
    print(f"SAVED: {p_png_desert_pic} ({w_2k}x{h_2k})")

    # ==========================================
    # COPY TO DESKTOP FOLDER
    # ==========================================
    print("\n--- Updating files in Desktop delivery folder ---")
    p_desk_arctic_jpg = os.path.join(desktop_dir, 'Stone_altar_in_arctic_fjord_2K_20261019091142.jpg')
    p_desk_desert_jpg = os.path.join(desktop_dir, 'Stone_altar_in_desert_canyon_2K_20261019091130.jpg')
    p_desk_arctic_png = os.path.join(desktop_dir, 'EARPA_02_Arctic_Frozen_Sanctuary_2K.png')
    p_desk_desert_png = os.path.join(desktop_dir, 'EARPA_03_Desert_Canyon_Sanctuary_2K.png')

    with open(p_desk_arctic_jpg, 'wb') as f:
        f.write(buf_a)
    with open(p_desk_desert_jpg, 'wb') as f:
        f.write(buf_d)
    with open(p_desk_arctic_png, 'wb') as f:
        f.write(buf_png_a)
    with open(p_desk_desert_png, 'wb') as f:
        f.write(buf_png_d)
    print("Desktop folder updated with replaced 2K files.")

    # ==========================================
    # COPY TO BRAIN ARTIFACT DIRECTORY FOR DIRECT DOWNLOAD
    # ==========================================
    print("\n--- Copying to brain artifact directory for direct user download ---")
    os.makedirs(brain_dir, exist_ok=True)
    p_brain_arctic = os.path.join(brain_dir, 'Stone_altar_in_arctic_fjord_2K.jpg')
    p_brain_desert = os.path.join(brain_dir, 'Stone_altar_in_desert_canyon_2K.jpg')
    with open(p_brain_arctic, 'wb') as f:
        f.write(buf_a)
    with open(p_brain_desert, 'wb') as f:
        f.write(buf_d)
    print(f"Copied to brain: {p_brain_arctic}")
    print(f"Copied to brain: {p_brain_desert}")

    print("\n=== NATIVE 2K RENDERING & FILE REPLACEMENT COMPLETE ===")

if __name__ == '__main__':
    render_native_2k_and_replace()
