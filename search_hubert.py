import urllib.request, json, urllib.parse

headers = {'User-Agent': 'MobileAppStudioDude/1.0 (contact@example.com)'}

titles = [
    'File:Hubert Robert - A Colonnade in Ruins.jpg',
    'File:Bemberg Fondation Toulouse - Bergers sous une grotte - Hubert ROBERT Inv.1114 198x104.jpg',
    'File:Hubert Robert - The Mouth of a Cave.jpg',
    'File:Hubert robert orateur et autres personnages dans des ruines romaines063438).jpg'
]

for t in titles:
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&titles={urllib.parse.quote(t)}&prop=imageinfo&iiprop=url|size'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        pages = data.get('query', {}).get('pages', {})
        for pid, p in pages.items():
            ii = p.get('imageinfo', [{}])[0]
            print(f"{t}: {ii.get('width')}x{ii.get('height')} -> {ii.get('url')}")
