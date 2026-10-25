import urllib.request, json, urllib.parse

headers = {'User-Agent': 'MobileAppStudioDude/1.0 (contact@example.com)'}

queries = [
    'Giovanni Paolo Panini ruins',
    'Hubert Robert temple ruins',
    'Roman ruins arch sunlight painting',
]

for q in queries:
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch={urllib.parse.quote(q)}&srnamespace=6&srlimit=8'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        print(f"=== {q} ===")
        for item in data.get('query', {}).get('search', []):
            print(item['title'])
