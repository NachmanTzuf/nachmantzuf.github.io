import sys, urllib.request, urllib.parse, ssl, re
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def search_mojeek(q):
    url = f"https://www.mojeek.com/search?q={urllib.parse.quote(q)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        matches = re.findall(r'<a class="ob"[^>]*>(.*?)</a>.*?<p class="s">(.*?)</p>', html, re.DOTALL)
        print(f"=== MOJEEK: {q} ===")
        for t, s in matches[:4]:
            print("Title:", re.sub('<[^<]+?>', '', t))
            print("Snippet:", re.sub('<[^<]+?>', '', s))
            print()
    except Exception as e:
        print("Mojeek error:", e)

search_mojeek("lever harp tunings Eb C")
search_mojeek("lever harp tuned in Bb")
search_mojeek("lever harp tuned in F")
