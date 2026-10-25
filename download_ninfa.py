import urllib.request

headers = {'User-Agent': 'EarpaMobileApp/1.0 (https://earpa.app; earpa@app.io)'}

urls = [
    ('https://upload.wikimedia.org/wikipedia/commons/c/c1/Ruins_-_Giardino_di_Ninfa%2C_Italy_-_DSC02983.jpg', 'public/images/ninfa_2983.jpg'),
    ('https://upload.wikimedia.org/wikipedia/commons/b/b4/Ruins_-_Giardino_di_Ninfa%2C_Italy_-_DSC02985.jpg', 'public/images/ninfa_2985.jpg')
]

for url, target in urls:
    print(f"Downloading {url} to {target}...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response, open(target, 'wb') as out_file:
        out_file.write(response.read())
    print(f"Saved {target}")
