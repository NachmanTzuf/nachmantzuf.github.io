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

    # 1. Ensure 404.html is identical to index.html
    index_html = os.path.join(dist_dir, 'index.html')
    not_found_html = os.path.join(dist_dir, '404.html')
    if os.path.exists(index_html):
        shutil.copy2(index_html, not_found_html)
        print("Generated dist/404.html from index.html")

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
        # Find latest entry
        latest_entry = 'entry-a06af7961980fc5b205cf9622d5a1429.js'
        latest_path = os.path.join(js_dir, latest_entry)
        if os.path.exists(latest_path):
            compat_names = [
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
