import os
from PIL import Image, ImageFilter, ImageOps

def create_app_icon():
    bg_path = 'public/images/coastal_cliff_pathway.jpg'
    harp_path = 'public/models/preview_full_harp.png'
    
    bg = Image.open(bg_path).convert('RGBA')
    harp = Image.open(harp_path).convert('RGBA')
    
    # 1. Create a 1024x1024 master canvas
    size = 1024
    
    # Crop bg center square
    w, h = bg.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    bg_square = bg.crop((left, top, left + min_dim, top + min_dim)).resize((size, size), Image.Resampling.LANCZOS)
    
    # Darken slightly with a dark emerald vignette overlay
    overlay = Image.new('RGBA', (size, size), (10, 20, 16, 90))
    master = Image.alpha_composite(bg_square, overlay)
    
    # Trim empty transparent pixels from harp
    bbox = harp.getbbox()
    if bbox:
        harp_cropped = harp.crop(bbox)
    else:
        harp_cropped = harp
        
    # Scale harp to fit prominently inside the icon (approx 85% of height)
    target_h = int(size * 0.86)
    aspect = harp_cropped.width / harp_cropped.height
    target_w = int(target_h * aspect)
    harp_scaled = harp_cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Create soft contact shadow
    shadow_mask = harp_scaled.split()[3]
    shadow = Image.new('RGBA', harp_scaled.size, (0, 0, 0, 180))
    shadow.putalpha(shadow_mask)
    shadow_blurred = shadow.filter(ImageFilter.GaussianBlur(16))
    
    # Center harp on master
    pos_x = (size - target_w) // 2
    pos_y = (size - target_h) // 2 + 15
    
    master.paste(shadow_blurred, (pos_x, pos_y + 12), shadow_blurred)
    master.paste(harp_scaled, (pos_x, pos_y), harp_scaled)
    
    # Maskable version has extra safe padding (approx 72% height)
    maskable_target_h = int(size * 0.72)
    maskable_target_w = int(maskable_target_h * aspect)
    harp_maskable = harp_cropped.resize((maskable_target_w, maskable_target_h), Image.Resampling.LANCZOS)
    
    maskable_shadow = Image.new('RGBA', harp_maskable.size, (0, 0, 0, 180))
    maskable_shadow.putalpha(harp_maskable.split()[3])
    maskable_shadow_blurred = maskable_shadow.filter(ImageFilter.GaussianBlur(14))
    
    master_maskable = Image.alpha_composite(bg_square, overlay)
    m_pos_x = (size - maskable_target_w) // 2
    m_pos_y = (size - maskable_target_h) // 2 + 10
    master_maskable.paste(maskable_shadow_blurred, (m_pos_x, m_pos_y + 10), maskable_shadow_blurred)
    master_maskable.paste(harp_maskable, (m_pos_x, m_pos_y), harp_maskable)
    
    # Targets to export
    icons_dir = 'public/images/icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # Convert RGBA to RGB for standard app icons if needed, or keep PNG RGBA
    master.resize((512, 512), Image.Resampling.LANCZOS).convert('RGB').save(os.path.join(icons_dir, 'earpa_icon_512.png'), 'PNG')
    master.resize((192, 192), Image.Resampling.LANCZOS).convert('RGB').save(os.path.join(icons_dir, 'earpa_icon_192.png'), 'PNG')
    master.resize((180, 180), Image.Resampling.LANCZOS).convert('RGB').save(os.path.join(icons_dir, 'apple_touch_icon.png'), 'PNG')
    master.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, 'favicon.png'), 'PNG')
    master.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(icons_dir, 'earpa_logo_3d.png'), 'PNG')
    
    master_maskable.resize((512, 512), Image.Resampling.LANCZOS).convert('RGB').save(os.path.join(icons_dir, 'earpa_icon_maskable_512.png'), 'PNG')
    master_maskable.resize((192, 192), Image.Resampling.LANCZOS).convert('RGB').save(os.path.join(icons_dir, 'earpa_icon_maskable_192.png'), 'PNG')
    
    print('Successfully generated 3D Celtic harp app icons!')

if __name__ == '__main__':
    create_app_icon()
