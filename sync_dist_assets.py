import os
import shutil
import hashlib

def get_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest().upper()

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, 'dist')
    public_dir = os.path.join(base_dir, 'public')

    if not os.path.exists(dist_dir):
        print("dist directory does not exist!")
        return

    # 1. Enhance index.html with PWA metadata and instant loading screen
    index_html = os.path.join(dist_dir, 'index.html')
    not_found_html = os.path.join(dist_dir, '404.html')
    if os.path.exists(index_html):
        with open(index_html, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add PWA head links if missing
        pwa_head = """    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" type="image/png" href="/images/icons/favicon.png" />
    <link rel="apple-touch-icon" href="/images/icons/apple_touch_icon.png" />
    <meta name="theme-color" content="#090d16" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  </head>"""
        if '<link rel="manifest"' not in content:
            content = content.replace('</head>', pwa_head)

        # Inject initial instant loader before </body>
        instant_loader = """  <!-- Instant Cold-Boot Loading Screen: Tri-Realm Background + Smooth Indicator Bar -->
  <div id="earpa-instant-loader" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#090d16 url('/images/earpa_master_loading_bg.jpg') center center / cover no-repeat;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:auto;transition:opacity 0.4s ease-out;">
    <div style="position:absolute;bottom:0;left:0;right:0;height:180px;background:linear-gradient(to top, rgba(5,10,16,0.85) 0%, rgba(5,10,16,0) 100%);pointer-events:none;"></div>
    <div style="position:relative;margin-bottom:64px;width:240px;max-width:75%;height:4.5px;background:rgba(15,23,42,0.65);border:1px solid rgba(255,255,255,0.18);border-radius:999px;overflow:hidden;backdrop-filter:blur(12px);box-shadow:0 4px 16px rgba(0,0,0,0.55);">
      <div id="earpa-instant-bar" style="height:100%;width:0%;border-radius:999px;background:linear-gradient(90deg, #d97706 0%, #fbbf24 50%, #38bdf8 100%);box-shadow:0 0 12px rgba(251,191,36,0.9), 0 0 24px rgba(56,189,248,0.6);animation:earpaProgressFill 2.0s cubic-bezier(0.16,1,0.3,1) forwards;"></div>
    </div>
  </div>
  <style>
    @keyframes earpaProgressFill {
      0% { width: 0%; }
      35% { width: 48%; }
      75% { width: 85%; }
      100% { width: 100%; }
    }
  </style>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      // Once React mounts its DOM inside #root, fade out the instant HTML loader
      var check = setInterval(function() {
        var root = document.getElementById('root');
        if (root && root.children.length > 0) {
          clearInterval(check);
          var loader = document.getElementById('earpa-instant-loader');
          if (loader) {
            loader.style.opacity = '0';
            setTimeout(function() { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 420);
          }
        }
      }, 80);
    });
  </script>
</body>"""
        if 'id="earpa-instant-loader"' not in content:
            content = content.replace('</body>', instant_loader)

        with open(index_html, 'w', encoding='utf-8') as f:
            f.write(content)
        shutil.copy2(index_html, not_found_html)
        print("Updated dist/index.html and generated dist/404.html with instant loading screen and PWA headers")

    # 2. Ensure .nojekyll exists
    nojekyll = os.path.join(dist_dir, '.nojekyll')
    with open(nojekyll, 'w') as f:
        f.write('')
    print("Created dist/.nojekyll")

    # 3. Copy public assets into dist
    if os.path.exists(public_dir):
        for item in os.listdir(public_dir):
            s = os.path.join(public_dir, item)
            d = os.path.join(dist_dir, item)
            if os.path.isdir(s):
                if os.path.exists(d):
                    shutil.rmtree(d)
                shutil.copytree(s, d)
                print(f"Copied directory public/{item} -> dist/{item}")
            else:
                shutil.copy2(s, d)
                print(f"Copied file public/{item} -> dist/{item}")

    # 4. Create compatibility bundle aliases in dist/_expo/static/js/web
    js_dir = os.path.join(dist_dir, '_expo', 'static', 'js', 'web')
    if os.path.exists(js_dir):
        entries = [f for f in os.listdir(js_dir) if f.startswith('entry-') and f.endswith('.js')]
        print("Found JS entries:", entries)
        latest_entry = 'entry-03da5b86f18fc9b21e8c5a2514d3f575.js'
        latest_path = os.path.join(js_dir, latest_entry)
        if os.path.exists(latest_path):
            compat_names = [
                'entry-591f221d562db681e981d133989945c4.js',
                'entry-5fffed3a26a629f68471eb69882fc2ac.js',
                'entry-63bc5b44169e6314d26378b2a3b84271.js',
                'entry-8d69bb973d5da92adcfe80a2740a1c6d.js',
                'entry-86005dad95ff916afb02c5c3ad3085ff.js',
                'entry-241dc2b474c7dc0ebd966e8cad672510.js',
                'entry-a06af7961980fc5b205cf9622d5a1429.js',
                'entry-85de23aecec6a4f3ae346b50bf4463fe.js',
                'entry-6c4df1355ef891d45fea586cbfabc9fd.js',
                'entry-15c957fb40a97aa35069b2daee361093.js',
                'entry-a49f2219870238787821c6d504e6b75f.js'
            ]
            for compat in compat_names:
                target = os.path.join(js_dir, compat)
                shutil.copy2(latest_path, target)
                print(f"Created bundle alias: {compat} -> {latest_entry}")

    # 5. Verify Celtic Harp GLB integrity
    glb_path = os.path.join(dist_dir, 'models', 'celtic_harp_8string.glb')
    if os.path.exists(glb_path):
        glb_hash = get_sha256(glb_path)
        print(f"Verified celtic_harp_8string.glb hash: {glb_hash}")
        expected_hash = "605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E"
        if glb_hash == expected_hash:
            print("PERFECT: GLB model hash matches master lock.")
        else:
            print(f"WARNING: GLB hash mismatch! Expected: {expected_hash}, got: {glb_hash}")

    print("Synchronization completed successfully.")

if __name__ == '__main__':
    main()
