import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    ("public/images/wadi_rum_rocks.jpg", "https://upload.wikimedia.org/wikipedia/commons/f/fc/Desert_landscape_with_rocks_in_the_middle_in_Wadi_Rum.jpg"),
    ("public/images/wadi_rum_landscape.jpg", "https://upload.wikimedia.org/wikipedia/commons/d/d8/Desert_landscape_in_Wadi_Rum.jpg")
]

for filename, u in urls:
    print(f"Downloading {filename}...")
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req) as resp, open(filename, 'wb') as f:
        f.write(resp.read())
    print(f"Saved {filename} ({os.path.getsize(filename)} bytes)")
