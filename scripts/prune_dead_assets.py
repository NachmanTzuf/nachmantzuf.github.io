import os
import shutil

print("--- SURGICAL PRUNING OF DEAD ASSETS ---")

# 1. Unused images in public/images and dist/images
unused_images = [
    'desert_roadmap_cinematic.jpg', 'hubert_001.jpg', 'hubert_arches_in_ruins.jpg',
    'hubert_arc_triomphe.jpg', 'hubert_cave.jpg', 'hubert_colisee.jpg', 'hubert_grotte.jpg',
    'hubert_grotte_small.jpg', 'hubert_old_temple.jpg', 'hubert_temple_diana.jpg',
    'ninfa_2983.jpg', 'ninfa_2985.jpg', 'palmyra_4.jpg', 'palmyra_temple_bel_5.jpg',
    'pedestal_guides.jpg', 'pedestal_side_master.png', 'pedestal_side_texture.png',
    'pedestal_top_master.png', 'pedestal_top_master_normal.png', 'pedestal_top_normal.png',
    'pedestal_top_realistic.png', 'pedestal_top_texture.png', 'roman_sanctuary_cinematic.jpg',
    'temple_crop_A.jpg', 'temple_crop_B.jpg', 'test_ninfa_crop1.jpg', 'test_ninfa_crop2.jpg',
    'thumb_hubert_001.jpg', 'thumb_hubert_arches_in_ruins.jpg', 'thumb_hubert_arc_triomphe.jpg',
    'thumb_hubert_old_temple.jpg', 'thumb_ninfa_2983.jpg', 'thumb_ninfa_2985.jpg',
    'wadi_rum_landscape.jpg', 'wadi_rum_rocks.jpg'
]

freed_bytes = 0
for d in ['public/images', 'dist/images']:
    if os.path.exists(d):
        for img in unused_images:
            p = os.path.join(d, img)
            if os.path.exists(p):
                sz = os.path.getsize(p)
                freed_bytes += sz
                os.remove(p)
                print(f"Removed unused image: {p} ({sz/1024/1024:.2f} MB)")

# 2. Duplicate review mp4s
review_vids = [
    'EarpaLeverMasterclass-review.mp4',
    'EarpaMelodyA-review.mp4',
    'EarpaSingleA-review.mp4'
]
for d in ['public/videos/mission', 'dist/videos/mission']:
    if os.path.exists(d):
        for v in review_vids:
            p = os.path.join(d, v)
            if os.path.exists(p):
                sz = os.path.getsize(p)
                freed_bytes += sz
                os.remove(p)
                print(f"Removed duplicate video: {p} ({sz/1024/1024:.2f} MB)")

# 3. Clean historical test html in dist
for h in ['watch-archive.html', 'watch-library.html']:
    for d in ['public', 'dist']:
        p = os.path.join(d, h)
        if os.path.exists(p):
            os.remove(p)
            print(f"Removed test html: {p}")

# 4. Clean old entry bundle copies in dist/_expo/static/js/web
js_dir = 'dist/_expo/static/js/web'
keep_entries = {
    'entry-7a2b01d13edc746e82b1ff17c9d6e171.js', # current v32
    'entry-f0660f1d82bfa3ee76997e99ae70f69c.js', # previous v31
}
if os.path.exists(js_dir):
    for f in os.listdir(js_dir):
        if f.startswith('entry-') and f.endswith('.js') and f not in keep_entries:
            p = os.path.join(js_dir, f)
            sz = os.path.getsize(p)
            freed_bytes += sz
            os.remove(p)
            print(f"Removed old bundle copy: {f} ({sz/1024/1024:.2f} MB)")

print(f"\n--- PRUNING SUMMARY ---")
print(f"Total space freed: {freed_bytes / 1024 / 1024:.2f} MB")

dist_total = sum(os.path.getsize(os.path.join(root, f)) for root, _, files in os.walk('dist') for f in files)
print(f"New dist size: {dist_total / 1024 / 1024:.2f} MB (was 184.33 MB)")
