import sys, urllib.request, urllib.parse, ssl, re
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

data = urllib.parse.urlencode({'q': 'site:myharpsdelight.com tuning'}).encode('utf-8')
req = urllib.request.Request('https://lite.duckduckgo.com/lite/', data=data, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
for m in re.finditer(r'<a rel="nofollow" href="([^"]+)"[^>]*>(.*?)</a>', html):
    print(m.group(1), "-->", m.group(2)[:60])
