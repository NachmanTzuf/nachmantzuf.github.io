import urllib.request
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

searches = [
    'filetype:bitmap "Wadi Rum" desert landscape',
    'filetype:bitmap "sand dunes" desert aerial',
    'filetype:bitmap "Dune 45" Sossusvlei desert',
]

for s in searches:
    print(f"=== Search: {s} ===")
    encoded = urllib.parse.quote(s)
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={encoded}&srnamespace=6&format=json"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for item in data.get('query', {}).get('search', [])[:4]:
                title = item['title']
                # get url
                u_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url|size&format=json"
                req2 = urllib.request.Request(u_url, headers=headers)
                with urllib.request.urlopen(req2) as resp2:
                    d2 = json.loads(resp2.read().decode('utf-8'))
                    page = list(d2.get('query', {}).get('pages', {}).values())[0]
                    ii = page.get('imageinfo', [{}])[0]
                    print(f"  {title} | {ii.get('width')}x{ii.get('height')} | {ii.get('url')}")
    except Exception as e:
        print("Error:", e)
