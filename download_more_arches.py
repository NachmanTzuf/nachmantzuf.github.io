import urllib.request

headers = {'User-Agent': 'EarpaMobileApp/1.0 (https://earpa.app)'}

urls = [
    ('https://upload.wikimedia.org/wikipedia/commons/b/b9/Hubert_Robert_-_Arches_in_Ruins.jpg', 'public/images/hubert_arches_in_ruins.jpg'),
    ('https://upload.wikimedia.org/wikipedia/commons/0/0c/Hubert_Robert-Colis%C3%A9e.jpg', 'public/images/hubert_colisee.jpg'),
    ('https://upload.wikimedia.org/wikipedia/commons/8/83/Hubert_Robert_001.jpg', 'public/images/hubert_001.jpg')
]

for url, target in urls:
    try:
        print(f"Downloading {target}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(target, 'wb') as f:
            f.write(resp.read())
        print(f"Saved {target}")
    except Exception as e:
        print(f"Error {target}:", e)
