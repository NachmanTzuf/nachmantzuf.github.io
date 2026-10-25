import sys, urllib.request, urllib.parse, ssl, re

sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def ddg_search(query):
    print(f"\n==================== SEARCH: {query} ====================")
    data = urllib.parse.urlencode({'q': query}).encode('utf-8')
    req = urllib.request.Request(
        'https://lite.duckduckgo.com/lite/',
        data=data,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        titles = re.findall(r'<a[^>]+class=[\'"]result-link[\'"][^>]*>(.*?)</a>', html, re.DOTALL)
        snippets = re.findall(r'<td[^>]+class=[\'"]result-snippet[\'"][^>]*>(.*?)</td>', html, re.DOTALL)
        for i in range(min(len(titles), len(snippets), 6)):
            t = re.sub('<[^<]+?>', '', titles[i]).strip()
            s = re.sub('<[^<]+?>', '', snippets[i]).strip()
            print(f"[{i+1}] {t}")
            print(f"    {s}\n")
    except Exception as e:
        print("Error:", e)

ddg_search("lever harp tuning Bb vs Eb vs C")
ddg_search("standard tuning for lever harp three common")
ddg_search("lever harp tuned in C or Eb or F")
ddg_search("Sylvia Woods Teach Yourself to Play the Folk Harp tuning")
