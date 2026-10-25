import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
os.makedirs("public/images", exist_ok=True)

urls = [
    ("public/images/palmyra_temple_bel_5.jpg", "https://upload.wikimedia.org/wikipedia/commons/8/81/Temple_of_Bel%2C_Palmyra%2C_Syria_-_5.jpg"),
    ("public/images/palmyra_4.jpg", "https://upload.wikimedia.org/wikipedia/commons/a/a8/Palmyra%2C_Syria_-_4.jpg"),
]

for filename, u in urls:
    print(f"Downloading {filename}...")
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req) as resp, open(filename, 'wb') as f:
        f.write(resp.read())
    print(f"Saved {filename} ({os.path.getsize(filename)} bytes)")
