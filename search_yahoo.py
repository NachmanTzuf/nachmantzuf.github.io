import sys, urllib.request, urllib.parse, ssl, re
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def yahoo_search(q):
    url = f"https://search.yahoo.com/search?p={urllib.parse.quote(q)}"
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    )
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
        # snippets in .compText
        snippets = re.findall(r'<div class="compText[^>]*>(.*?)</div>', html, re.DOTALL)
        titles = re.findall(r'<h3 class="title[^>]*>(.*?)</h3>', html, re.DOTALL)
        print(f"=== YAHOO: {q} ===")
        for i in range(min(len(titles), len(snippets), 5)):
            t = re.sub('<[^<]+?>', '', titles[i]).strip()
            s = re.sub('<[^<]+?>', '', snippets[i]).strip()
            print(f"[{i+1}] {t}")
            print(f"    {s}\n")
    except Exception as e:
        print("Yahoo error:", e)

yahoo_search("three common lever harp tunings")
yahoo_search("lever harp tunings Eb C Bb")
yahoo_search("lever harp tuning in key of C, Eb, or")
