import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

try:
    req = urllib.request.Request("https://manufacturing.dustystrings.com/", headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
    print("Length:", len(html))
    for m in re.finditer(r'href=["\']([^"\']+)["\']', html):
        link = m.group(1)
        if any(k in link.lower() for k in ['harp', 'tune', 'tuning', 'faq', 'lever']):
            print("Link:", link)
except Exception as e:
    print(e)
