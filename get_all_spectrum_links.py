import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

html = urllib.request.urlopen('https://www.harpspectrum.org/folk/index.shtml', context=ctx).read().decode('utf-8', errors='ignore')
for href in re.findall(r'href=["\']([^"\']+)["\']', html):
    print(href)
