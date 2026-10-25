import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    ("public/images/hubert_grotte.jpg", "https://upload.wikimedia.org/wikipedia/commons/a/a6/Bemberg_Fondation_Toulouse_-_Bergers_sous_une_grotte_-_Hubert_ROBERT_Inv.1114_198x104.jpg"),
    ("public/images/hubert_cave.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/5c/Hubert_Robert_-_The_Mouth_of_a_Cave.jpg")
]

for filename, u in urls:
    print(f"Downloading {filename}...")
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req) as resp, open(filename, 'wb') as f:
        f.write(resp.read())
    print(f"Saved {filename} ({os.path.getsize(filename)} bytes)")
