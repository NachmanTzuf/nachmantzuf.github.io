import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

url = "https://manufacturing.dustystrings.com/faq"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

for m in re.finditer(r'<a href="([^"]+)">([^<]*maintenance[^<]*)</a>', html, re.I):
    print("Found:", m.group(1), "-->", m.group(2))

# Also search for any link with "sharping" or "lever" or "tuning"
for m in re.finditer(r'<a href="([^"]+)">([^<]*(?:sharping|lever|tuning)[^<]*)</a>', html, re.I):
    print("Found lever/tune link:", m.group(1), "-->", m.group(2))
