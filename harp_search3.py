import sys, urllib.request, urllib.parse, ssl, re

sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def ddg_search(query):
    print(f"\n==================== SEARCH: {query} ====================")
    data = urllib.parse.urlencode({'q': query}).encode('utf-8')
    req = urllib.request.Request(
        'https://lite.duckduckgo.com/lite/',
        data=data,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    )
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        # print snippet texts
        snippets = re.findall(r'<td[^>]+class=[\'"]result-snippet[\'"][^>]*>(.*?)</td>', html, re.DOTALL)
        for i, s in enumerate(snippets[:6]):
            clean = re.sub(r'<[^<]+?>', '', s).strip()
            print(f"[{i+1}] {clean}\n")
    except Exception as e:
        print("Error:", e)

ddg_search("Dusty Strings harp tuning Eb C Bb")
ddg_search("lever harp tuned in C or Eb or Bb")
ddg_search("Sylvia Woods harp tuning chart lever positions")
ddg_search("harp tuning three flats two flats one flat")
