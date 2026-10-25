import urllib.request
import urllib.parse
import json

queries = [
    "overgrown Roman arch ruins",
    "Roman ruins ivy vines",
    "ancient Roman arch garden",
    "ancient Roman ruins foliage",
    "Villa d'Este Roman ruins",
    "Ninfa garden Roman ruins",
    "Giardino di Ninfa ruins",
    "overgrown ancient arch"
]

results = []

for q in queries:
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(q)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|extmetadata&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'EarpaMobileApp/1.0'})
    try:
        data = json.loads(urllib.request.urlopen(req, timeout=10).read())
        pages = data.get('query', {}).get('pages', {})
        for pid, pdata in pages.items():
            title = pdata.get('title', '')
            ii = pdata.get('imageinfo', [{}])[0]
            img_url = ii.get('url', '')
            width = ii.get('width', 0)
            height = ii.get('height', 0)
            if width > 1200 and height > 1200 and any(ext in title.lower() for ext in ['.jpg', '.jpeg', '.png']):
                results.append({
                    'query': q,
                    'title': title,
                    'url': img_url,
                    'width': width,
                    'height': height
                })
    except Exception as e:
        print(f"Error searching {q}:", e)

print(f"Found {len(results)} high-res candidate photos:")
for r in results[:15]:
    print(f"- [{r['width']}x{r['height']}] {r['title']} -> {r['url']}")
