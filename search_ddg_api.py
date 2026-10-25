import urllib.request
import urllib.parse
import ssl
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_ddg_api(query):
    # Using DuckDuckGo instant answer API or lite
    url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(query)}&format=json"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            import json
            data = json.loads(resp.read().decode('utf-8'))
            print(f"=== DDG API: {query} ===")
            print("Abstract:", data.get('AbstractText', 'None'))
            for r in data.get('RelatedTopics', [])[:3]:
                if 'Text' in r:
                    print("Related:", r['Text'])
    except Exception as e:
        print("Error:", e)

search_ddg_api("lever harp")
search_ddg_api("celtic harp tuning")
