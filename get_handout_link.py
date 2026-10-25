import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

url = "https://manufacturing.dustystrings.com/harps/maintenance-troubleshooting"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

for m in re.finditer(r'<a href="([^"]+)">([^<]*Using Sharping Levers[^<]*)</a>', html, re.I):
    print("Found handout link:", m.group(1))

# Also print all pdf links
for m in re.finditer(r'href="([^"]+\.pdf)"', html, re.I):
    print("PDF link:", m.group(1))
