import sys, urllib.request, ssl, re
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def check_url(url):
    print("Fetching:", url)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        content = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
        # print text
        text = re.sub('<[^<]+?>', ' ', content)
        for line in text.split('\n'):
            line = line.strip()
            if any(k in line.lower() for k in ['tuning', 'keys', 'major', 'flat', 'sharp', 'baseline', 'b-flat', 'b flat', 'f major']):
                if len(line) > 20:
                    print("-", line[:120])
    except Exception as e:
        print("Error:", e)

check_url("https://www.myharpsdelight.com/lever-harp-tunings.html")
