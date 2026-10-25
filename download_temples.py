import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    ("public/images/hubert_old_temple.jpg", "https://upload.wikimedia.org/wikipedia/commons/8/8a/Hubert_Robert_-_The_Old_Temple_-_1900.382_-_Art_Institute_of_Chicago.jpg"),
    ("public/images/hubert_temple_diana.jpg", "https://upload.wikimedia.org/wikipedia/commons/c/c5/Hubert_Robert_-_Interior_of_the_Temple_of_Diana_at_N%C3%AEmes.jpg")
]

for filename, u in urls:
    print(f"Downloading {filename}...")
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req) as resp, open(filename, 'wb') as f:
        f.write(resp.read())
    print(f"Saved {filename} ({os.path.getsize(filename)} bytes)")
