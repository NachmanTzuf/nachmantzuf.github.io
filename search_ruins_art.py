import urllib.request, json, urllib.parse, time

headers = {'User-Agent': 'MobileAppStudioDude/1.0 (contact@example.com)'}

terms = [
    'Hubert Robert colonnade',
    'Hubert Robert temple',
    'Panini Roman ruins'
]

for term in terms:
    print(f"=== Searching: {term} ===")
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch={urllib.parse.quote(term)}&srnamespace=6&srlimit=5'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            for item in data.get('query', {}).get('search', []):
                print(item['title'])
    except Exception as e:
        print("Error:", e)
    time.sleep(2)
