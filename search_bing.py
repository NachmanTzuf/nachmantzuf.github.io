import urllib.request
import urllib.parse
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_bing(query):
    url = f"https://www.bing.com/search?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            # Extract text from search results
            matches = re.findall(r'<li class="b_algo">.*?<h2><a href="([^"]+)".*?>(.*?)</a></h2>.*?<p class="b_lineclamp[^>]*>(.*?)</p>', content, re.DOTALL)
            print(f"=== BING: {query} ===")
            for link, title, snippet in matches[:3]:
                clean_title = re.sub('<[^<]+?>', '', title)
                clean_snippet = re.sub('<[^<]+?>', '', snippet)
                print("Title:", clean_title)
                print("Snippet:", clean_snippet)
                print("Link:", link)
                print()
    except Exception as e:
        print("Error:", e)

search_bing("lever harp tunings Eb C common")
search_bing("most common tunings for Celtic lever harp")
search_bing("three common tunings lever harp Eb major C major")
