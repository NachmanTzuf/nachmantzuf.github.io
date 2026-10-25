import sys, urllib.request, urllib.parse, ssl, json
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def wiki_search(q):
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(q)}&format=json&srlimit=10"
    req = urllib.request.Request(url, headers={'User-Agent': 'HarpScholar/1.0'})
    try:
        data = json.loads(urllib.request.urlopen(req, context=ctx).read().decode('utf-8'))
        print(f"=== WIKI: {q} ===")
        for res in data['query']['search']:
            print(res['title'])
            snippet = res['snippet'].replace('<span class="searchmatch">', '').replace('</span>', '')
            print("  ", snippet)
    except Exception as e:
        print(e)

wiki_search("lever harp tuning")
wiki_search("Celtic harp sharping lever")
wiki_search("folk harp tuning")
