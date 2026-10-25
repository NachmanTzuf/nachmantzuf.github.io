import sys, urllib.request, ssl, re
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

# Let's search on harpsicleharps.com or harpcenter.com
urls = [
    "https://www.harpsicleharps.com/faq",
    "https://www.harpsicleharps.com/how-to-tune",
    "https://www.harpsicleharps.com/blog/2019/3/13/how-to-tune-a-harp"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        print("Success:", url)
        text = re.sub('<[^<]+?>', ' ', html)
        for s in re.split(r'\. |\n', text):
            if any(w in s.lower() for w in ['tuning', 'tune', 'c major', 'eb', 'bb', 'f major', 'flat']):
                if 20 < len(s.strip()) < 200:
                    print("  *", s.strip())
    except Exception as e:
        print("Error:", url, e)
