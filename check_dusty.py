import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

urls = [
    "https://manufacturing.dustystrings.com/harps/faqs-resources/harp-tuning-charts",
    "https://manufacturing.dustystrings.com/harps/faqs-resources/tuning-your-harp",
    "https://manufacturing.dustystrings.com/harps/faqs-resources",
    "https://dustystrings.com/pages/harp-faqs",
    "https://www.harpsicleharps.com/harp-tuning"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, context=ctx, timeout=5)
        print("Status", res.status, url)
        html = res.read().decode('utf-8', errors='ignore')
        for line in html.split('\n'):
            if any(k in line.lower() for k in ['tuning', 'tuned in', 'sharping lever', 'eb major', 'c major', 'bb major', 'f major']):
                clean = re.sub('<[^<]+?>', ' ', line).strip()
                if len(clean) > 20:
                    print("  >>", clean[:120])
    except Exception as e:
        print("Error", url, e)
