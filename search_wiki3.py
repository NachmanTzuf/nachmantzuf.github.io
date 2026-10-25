import sys, urllib.request, ssl, json
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

headers = {'User-Agent': 'Mozilla/5.0'}

# Let's search Wikipedia API for exact phrases
for term in ['"tuned in Eb"', '"tuned in C"', '"tuned in Bb"', '"tuned in F"', 'lever harp tuning']:
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(term)}&srlimit=5&format=json"
    try:
        req = urllib.request.Request(url, headers=headers)
        res = json.loads(urllib.request.urlopen(req, context=ctx).read().decode('utf-8'))
        print(f"=== WIKI: {term} ===")
        for item in res['query']['search']:
            print("Title:", item['title'])
            print("Snippet:", item['snippet'].replace('<span class="searchmatch">', '').replace('</span>', ''))
            print()
    except Exception as e:
        print("Error:", e)
