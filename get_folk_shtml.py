import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

html = urllib.request.urlopen('https://www.harpspectrum.org/folk/folk.shtml', context=ctx).read().decode('utf-8', errors='ignore')
for m in re.finditer(r'<a href="([^"]+)">(.*?)</a>', html):
    print(m.group(1), "-->", m.group(2))
