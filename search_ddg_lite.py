import urllib.request
import urllib.parse
import ssl
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

def search_lite(q):
    url = "https://lite.duckduckgo.com/lite/"
    data = urllib.parse.urlencode({'q': q}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            print(f"=== SEARCH: {q} ===")
            # Look for td.result-snippet
            snippets = re.findall(r'<td class="result-snippet">(.*?)</td>', html, re.DOTALL)
            links = re.findall(r'<a rel="nofollow" href="([^"]+)" class="result-link">(.*?)</a>', html, re.DOTALL)
            for i in range(min(len(snippets), 5)):
                title = re.sub('<[^<]+?>', '', links[i][1]) if i < len(links) else ""
                snip = re.sub('<[^<]+?>', '', snippets[i]).strip()
                print(f"[{i+1}] {title}")
                print(f"    {snip}")
                print()
    except Exception as e:
        print("Error:", e)

search_lite("lever harp standard tunings Eb C")
search_lite("common tunings for lever harp Sylvia Woods")
search_lite("lever harp tuning in key of C, Eb, or")
