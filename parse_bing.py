import sys, urllib.request, urllib.parse, re
sys.stdout.reconfigure(encoding='utf-8')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = 'https://www.bing.com/search?q=' + urllib.parse.quote('lever harp tuning Eb major C major')
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

for m in re.finditer(r'<h2[^>]*>(.*?)</h2>', html):
    print("H2:", re.sub('<[^<]+?>', '', m.group(1)))

count = 0
for m in re.finditer(r'(?:tuning|tunings|lever|harp)[^.?!]{10,200}[.?!]', html, re.IGNORECASE):
    s = re.sub('<[^<]+?>', '', m.group(0))
    if any(k in s.lower() for k in ['e flat', 'eb', 'b flat', 'bb', 'key of c', 'major']):
        print("MATCH:", s.strip())
        print()
        count += 1
        if count > 15:
            break
