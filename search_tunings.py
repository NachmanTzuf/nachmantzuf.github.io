import urllib.request
import urllib.parse
import re

headers = {'User-Agent': 'Mozilla/5.0'}

queries = [
    'lever harp common tunings C Eb',
    'dusty strings harp tuning Eb C Bb',
    'sylvia woods harp tunings Eb C',
    'lever harp tuning three flats two flats'
]

for q in queries:
    url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(q)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html)
            print(f"=== Query: {q} ===")
            for s in snippets[:3]:
                clean = re.sub(r'<[^<]+?>', '', s)
                print("Snippet:", clean.strip())
    except Exception as e:
        print("Error for", q, e)
