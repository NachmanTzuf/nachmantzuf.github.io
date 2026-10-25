import os
import math
from PIL import Image, ImageDraw, ImageFilter

icons_dir = os.path.join(os.path.dirname(__file__), 'public', 'images', 'icons')
os.makedirs(icons_dir, exist_ok=True)

def draw_celtic_harp_icon(size, is_maskable=False):
    # High resolution rendering with 4x supersampling
    scale = 4
    canvas_size = size * scale
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx = canvas_size / 2.0
    cy = canvas_size / 2.0

    # Background: deep dark Celtic slate
    bg_color = (13, 17, 26, 255) # #0d111a
    if is_maskable:
        # Full bleed square for maskable icons
        draw.rectangle([0, 0, canvas_size, canvas_size], fill=bg_color)
        content_radius = canvas_size * 0.38
    else:
        # Rounded squircle for standard icons
        corner_r = canvas_size * 0.22
        draw.rounded_rectangle([0, 0, canvas_size, canvas_size], radius=corner_r, fill=bg_color)
        content_radius = canvas_size * 0.42

    # Subtle inner radiant glow
    glow_color = (32, 42, 58, 255)
    draw.ellipse([cx - content_radius * 1.1, cy - content_radius * 1.1,
                  cx + content_radius * 1.1, cy + content_radius * 1.1],
                 fill=glow_color)

    # Concentric ancient Celtic gold border ring
    gold_ring = (200, 157, 88, 240) # #c89d58
    ring_thick = max(4, int(canvas_size * 0.024))
    draw.ellipse([cx - content_radius, cy - content_radius,
                  cx + content_radius, cy + content_radius],
                 outline=gold_ring, width=ring_thick)

    # Inner hairline ring
    inner_ring_thick = max(2, int(canvas_size * 0.008))
    draw.ellipse([cx - content_radius * 0.94, cy - content_radius * 0.94,
                  cx + content_radius * 0.94, cy + content_radius * 0.94],
                 outline=(160, 122, 60, 180), width=inner_ring_thick)

    # Stylized Celtic Harp
    # Pillar left, Neck top curving to right, Soundbox diagonal right to bottom left
    gold_bright = (235, 196, 122, 255) # #ebc47a
    gold_dark = (175, 132, 65, 255)
    amber_glow = (245, 218, 158, 255)

    # Coordinates relative to center and content_radius
    # Forepillar curve (left)
    pillar_top = (cx - content_radius * 0.38, cy - content_radius * 0.58)
    pillar_mid = (cx - content_radius * 0.52, cy + content_radius * 0.05)
    pillar_base = (cx - content_radius * 0.35, cy + content_radius * 0.65)

    # Soundbox (right / diagonal)
    box_top = (cx + content_radius * 0.45, cy - content_radius * 0.25)
    box_base = (cx - content_radius * 0.15, cy + content_radius * 0.68)

    # Neck (harmonic curve from pillar top to box top)
    neck_mid = (cx + content_radius * 0.05, cy - content_radius * 0.62)

    # Draw soundbox body
    box_poly = [
        box_top,
        (cx + content_radius * 0.52, cy - content_radius * 0.20),
        (cx - content_radius * 0.08, cy + content_radius * 0.72),
        box_base,
        (cx - content_radius * 0.25, cy + content_radius * 0.62)
    ]
    draw.polygon(box_poly, fill=gold_dark, outline=gold_bright)

    # Draw Forepillar
    pillar_width = max(6, int(canvas_size * 0.045))
    pillar_points = []
    steps = 24
    for i in range(steps + 1):
        t = i / float(steps)
        # Quadratic bezier
        px = (1-t)**2 * pillar_top[0] + 2*(1-t)*t * pillar_mid[0] + t**2 * pillar_base[0]
        py = (1-t)**2 * pillar_top[1] + 2*(1-t)*t * pillar_mid[1] + t**2 * pillar_base[1]
        pillar_points.append((px, py))
    draw.line(pillar_points, fill=gold_bright, width=pillar_width, joint="curve")

    # Draw Harmonic Neck
    neck_width = max(6, int(canvas_size * 0.05))
    neck_points = []
    for i in range(steps + 1):
        t = i / float(steps)
        # Quadratic bezier
        nx = (1-t)**2 * pillar_top[0] + 2*(1-t)*t * neck_mid[0] + t**2 * box_top[0]
        ny = (1-t)**2 * pillar_top[1] + 2*(1-t)*t * neck_mid[1] + t**2 * box_top[1]
        neck_points.append((nx, ny))
    draw.line(neck_points, fill=gold_bright, width=neck_width, joint="curve")

    # Draw Crown Finial
    crown_r = max(6, int(canvas_size * 0.04))
    draw.ellipse([pillar_top[0] - crown_r, pillar_top[1] - crown_r,
                  pillar_top[0] + crown_r, pillar_top[1] + crown_r],
                 fill=amber_glow, outline=gold_bright, width=max(2, int(scale)))

    # Draw Harp Strings (5 visible resonant strings)
    num_strings = 5
    for s in range(num_strings):
        st = (s + 0.5) / float(num_strings)
        # Point on neck
        sx1 = (1-st)**2 * pillar_top[0] + 2*(1-st)*st * neck_mid[0] + st**2 * box_top[0]
        sy1 = (1-st)**2 * pillar_top[1] + 2*(1-st)*st * neck_mid[1] + st**2 * box_top[1] + neck_width * 0.4
        # Point on soundboard
        sx2 = (1-st) * box_base[0] + st * box_top[0]
        sy2 = (1-st) * box_base[1] + st * box_top[1]

        # Red string for C (string 0), Blue for F (string 3), Gold for others
        if s == 0:
            string_color = (235, 75, 75, 230) # Red C
        elif s == 3:
            string_color = (55, 160, 240, 230) # Blue F
        else:
            string_color = (245, 225, 175, 200) # Gold

        sw = max(2, int(canvas_size * 0.007))
        draw.line([(sx1, sy1), (sx2, sy2)], fill=string_color, width=sw)

    # Downscale with high quality Lanczos antialiasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Generate all required icon assets
sizes = [
    ('earpa_icon_192.png', 192, False),
    ('earpa_icon_512.png', 512, False),
    ('earpa_icon_maskable_192.png', 192, True),
    ('earpa_icon_maskable_512.png', 512, True),
    ('apple_touch_icon.png', 180, False),
    ('favicon.png', 32, False),
]

for filename, sz, maskable in sizes:
    filepath = os.path.join(icons_dir, filename)
    icon_img = draw_celtic_harp_icon(sz, maskable)
    icon_img.save(filepath, 'PNG', optimize=True)
    print(f"Generated {filename} ({sz}x{sz}, maskable={maskable})")

# Master SVG
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="112" fill="#0d111a"/>
  <circle cx="256" cy="256" r="215" fill="#202a3a"/>
  <circle cx="256" cy="256" r="215" fill="none" stroke="#c89d58" stroke-width="12"/>
  <circle cx="256" cy="256" r="202" fill="none" stroke="#a07a3c" stroke-width="4"/>
  <polygon points="352,202 368,212 239,410 224,402" fill="#af8441" stroke="#ebc47a" stroke-width="3"/>
  <path d="M 174 132 Q 144 266 180 395" fill="none" stroke="#ebc47a" stroke-width="22" stroke-linecap="round"/>
  <path d="M 174 132 Q 266 123 352 202" fill="none" stroke="#ebc47a" stroke-width="24" stroke-linecap="round"/>
  <circle cx="174" cy="132" r="18" fill="#f5da9e" stroke="#ebc47a" stroke-width="4"/>
  <line x1="202" y1="148" x2="232" y2="398" stroke="#eb4b4b" stroke-width="4"/>
  <line x1="235" y1="156" x2="260" y2="352" stroke="#f5e1af" stroke-width="4"/>
  <line x1="270" y1="168" x2="290" y2="305" stroke="#f5e1af" stroke-width="4"/>
  <line x1="305" y1="184" x2="320" y2="258" stroke="#37a0f0" stroke-width="4"/>
  <line x1="336" y1="202" x2="348" y2="218" stroke="#f5e1af" stroke-width="4"/>
</svg>'''

svg_path = os.path.join(icons_dir, 'earpa_logo.svg')
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)
print(f"Generated earpa_logo.svg")
