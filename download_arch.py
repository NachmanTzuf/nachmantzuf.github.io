import urllib.request

headers = {'User-Agent': 'EarpaMobileApp/1.0 (https://earpa.app)'}

# Download Arc de Triomphe en ruines
url1 = 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Hubert_Robert_-_Arc_de_triomphe_en_ruines_avec_joueurs_de_cartes_-_1780_-_Lyon.jpg'
print("Downloading url1...")
req1 = urllib.request.Request(url1, headers=headers)
with urllib.request.urlopen(req1) as resp, open('public/images/hubert_arc_triomphe.jpg', 'wb') as f:
    f.write(resp.read())
print("Saved public/images/hubert_arc_triomphe.jpg")
