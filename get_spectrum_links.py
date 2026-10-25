import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

url = "https://www.harpspectrum.org/folk/index.shtml"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
matches = re.findall(r'<a href="([^"]+)">(.*?)</a>', html)
for link, text in matches:
    if any(k in text.lower() or k in link.lower() for k in ['tune', 'tuning', 'lever', 'key', 'theory']):
        print(link, "-->", text)
