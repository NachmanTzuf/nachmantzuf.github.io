import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0'}

# Let's search Wikipedia API with specific queries
queries = [
    "lever harp tuning Bb",
    "folk harp tuning Eb C",
    "harp lever positions Eb major",
    "harp tuning three flats two flats"
]

for q in queries:
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(q)}&utf8=&format=json"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as r:
            res = json.loads(r.read().decode('utf-8'))
            print(f"=== {q} ===")
            for item in res['query']['search'][:3]:
                print(item['title'], ":", item['snippet'].replace('<span class="searchmatch">', '').replace('</span>', ''))
    except Exception as e:
        print(e)
