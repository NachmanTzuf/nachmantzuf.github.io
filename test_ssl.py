import urllib.request
import ssl
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error {url}: {e}")
        return None

# Let's search Wikipedia API or harp sites
search_url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=%22lever+harp%22+tuning+%22Eb%22&format=json"
html = fetch(search_url)
print("Wiki response length:", len(html) if html else 0)
if html:
    import json
    data = json.loads(html)
    for res in data['query']['search']:
        print("Title:", res['title'])
        print("Snippet:", res['snippet'])
