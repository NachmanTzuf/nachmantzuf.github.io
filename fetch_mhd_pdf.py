import sys, urllib.request, ssl, re

sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

url = "https://www.myharpsdelight.com/support-files/celtic-harp-tunings.pdf"
try:
    req = urllib.request.Request(url, headers=headers)
    data = urllib.request.urlopen(req, context=ctx, timeout=10).read()
    print("PDF downloaded, size:", len(data))
    with open("celtic-harp-tunings.pdf", "wb") as f:
        f.write(data)
except Exception as e:
    print("Error:", e)

url2 = "https://www.myharpsdelight.com/celtic-harp-tunings.html"
try:
    req2 = urllib.request.Request(url2, headers=headers)
    html = urllib.request.urlopen(req2, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    print("HTML length:", len(html))
    text = re.sub(r'<[^>]+>', ' ', html)
    for p in re.findall(r'[^.\n]+[.\n]', text):
        p = p.strip()
        if any(w in p.lower() for w in ['tuning', 'keys', 'sharp', 'flat', 'eb', 'tune in', 'tuned in']):
            if len(p) > 25:
                print(">>", p[:120])
except Exception as e:
    print("Error html:", e)
