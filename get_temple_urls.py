import urllib.request, json, urllib.parse

headers = {'User-Agent': 'MobileAppStudioDude/1.0 (contact@example.com)'}

titles = [
    'File:Hubert Robert - Interior of the Temple of Diana at Nîmes.jpg',
    'File:Hubert Robert - The Old Temple - 1900.382 - Art Institute of Chicago.jpg',
    'File:Giovanni Paolo Panini (1691-1765) - Roman Ruins with Figures - NG138 - National Gallery.jpg',
    'File:Hubert Robert - A Colonnade in Ruins.jpg'
]

for t in titles:
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&titles={urllib.parse.quote(t)}&prop=imageinfo&iiprop=url|size'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                ii = p.get('imageinfo', [{}])[0]
                print(f"{t}: {ii.get('width')}x{ii.get('height')} -> {ii.get('url')}")
    except Exception as e:
        print("Error:", e)
