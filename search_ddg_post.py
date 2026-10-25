import sys, urllib.request, urllib.parse, ssl, re
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def ddg_html_post(query):
    url = "https://html.duckduckgo.com/html/"
    data = urllib.parse.urlencode({'q': query, 'b': ''}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://html.duckduckgo.com/'
        }
    )
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
        print(f"=== DDG HTML: {query} ===")
        # results in .result__snippet
        snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.DOTALL)
        titles = re.findall(r'<a class="result__url[^>]*>(.*?)</a>', html, re.DOTALL)
        for i in range(min(len(snippets), 5)):
            print(f"[{i+1}]", re.sub('<[^<]+?>', '', snippets[i]).strip())
            print()
    except Exception as e:
        print("Error:", e)

ddg_html_post("common lever harp tunings Eb C")
ddg_html_post("lever harp tuned in Bb")
ddg_html_post("lever harp tuned in F")
