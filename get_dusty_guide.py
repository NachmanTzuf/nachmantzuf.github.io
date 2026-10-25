import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

for path in ['/harps/about-harps/beginners-guide', '/faq']:
    url = "https://manufacturing.dustystrings.com" + path
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        print(f"=== {url} ===")
        text = re.sub('<[^<]+?>', ' ', html)
        for sentence in re.split(r'\. |\n', text):
            sentence = sentence.strip()
            if any(k in sentence.lower() for k in ['tuning', 'tune', 'lever', 'eb', 'sharp', 'flat', 'keys', 'key of']):
                if 20 < len(sentence) < 250:
                    print("->", sentence)
    except Exception as e:
        print(e)
