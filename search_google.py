import urllib.request
import urllib.parse
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
}

def query_google(q):
    url = f"https://www.google.com/search?q={urllib.parse.quote(q)}&hl=en"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Extract search result text
            print(f"=== GOOGLE: {q} ===")
            # Look for snippets in Google search results
            matches = re.findall(r'<div[^>]+class="[^"]*VwiC3b[^"]*"[^>]*>(.*?)</div>', html)
            if not matches:
                # alternative fallback regex for snippets
                matches = re.findall(r'<div style="-webkit-line-clamp:2[^>]*>(.*?)</div>', html)
            for m in matches[:5]:
                clean = re.sub(r'<[^<]+?>', '', m)
                print("->", clean)
    except Exception as e:
        print("Error:", e)

query_google("three common tunings for lever harp")
query_google("tuning lever harp in C, Eb or")
query_google("lever harp tuned in Eb, C, or Bb")
query_google("Sylvia woods lever harp tuning keys")
