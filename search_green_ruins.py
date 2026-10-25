import urllib.request
import json

queries = [
    '"Hubert Robert" ruins arch',
    '"Hubert Robert" temple garden',
    '"Giovanni Paolo Panini" ruins arch',
    'Roman arch overgrown vines',
    'Roman ruins greenery garden'
]

for q in queries:
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(q)}&srnamespace=6&format=json&srlimit=8"
    req = urllib.request.Request(url, headers={'User-Agent': 'EarpaMobileApp/1.0'})
    try:
        data = json.loads(urllib.request.urlopen(req).read())
        print(f"=== Query: {q} ===")
        for item in data['query']['search']:
            title = item['title']
            if any(ext in title.lower() for ext in ['.jpg', '.jpeg', '.png']):
                print("  ", title)
    except Exception as e:
        print("Error:", e)
