import os
import subprocess

BASE_DIR = r"C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323"
SVG_DIR = os.path.join(BASE_DIR, "assets", "svg")
PREVIEW_DIR = os.path.join(BASE_DIR, "assets", "previews")
os.makedirs(PREVIEW_DIR, exist_ok=True)

from build_picker_html import CATEGORIES

EDGE_EXE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def render_category(cat):
    cat_id = cat["id"]
    out_png = os.path.join(PREVIEW_DIR, f"{cat_id}_preview.png")
    temp_html = os.path.join(PREVIEW_DIR, f"{cat_id}_temp.html")
    
    cards_html = []
    for idx, opt in enumerate(cat["options"], 1):
        svg_path = os.path.join(SVG_DIR, opt["svg_file"])
        with open(svg_path, "r", encoding="utf-8") as f:
            svg_data = f.read()
        cards_html.append(f'''
        <div style="background:#141b26; border:1.5px solid #233144; border-radius:14px; padding:18px; width:310px; display:flex; flex-direction:column; align-items:center; text-align:center;">
          <div style="align-self:flex-start; font-size:11px; font-weight:700; color:#d4af37; background:rgba(212,175,55,0.15); padding:3px 10px; border-radius:8px; border:1px solid rgba(212,175,55,0.3);">Option {idx}</div>
          <div style="width:140px; height:140px; margin:10px 0 15px 0;">{svg_data}</div>
          <h3 style="color:#ffffff; font-size:16px; margin:0 0 6px 0; font-family:sans-serif;">{opt["name"]}</h3>
          <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.4; font-family:sans-serif;">{opt["lore"]}</p>
        </div>
        ''')
    
    html = f'''<!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="background:#0b0f17; margin:0; padding:20px; box-sizing:border-box; width:1020px; font-family:sans-serif;">
      <div style="margin-bottom:12px; border-left:4px solid #d4af37; padding-left:12px; display:flex; justify-content:space-between; align-items:center;">
        <h2 style="color:#fdf0cd; margin:0; font-size:19px;">{cat["title"]}</h2>
        <span style="color:#94a3b8; font-size:12px; background:#192231; padding:4px 10px; border-radius:8px;">Currently: {cat["current"]}</span>
      </div>
      <div style="display:flex; gap:16px; justify-content:space-between;">
        {"".join(cards_html)}
      </div>
    </body>
    </html>'''
    
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html)
        
    cmd = [
        EDGE_EXE,
        "--headless=new",
        f"--screenshot={out_png}",
        "--window-size=1020,400",
        f"file:///{temp_html.replace(os.sep, '/')}"
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)
    print(f"Rendered {out_png}")

for cat in CATEGORIES:
    render_category(cat)

print("All category previews rendered successfully!")
