import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

def check_domain(url):
    print("Trying:", url)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, context=ctx, timeout=8).read().decode('utf-8', errors='ignore')
        print("Success! Length:", len(html))
        # Look for tuning mentions
        for m in re.finditer(r'(?:tuning|tuned in|key of)[^.]{10,150}\.', html, re.I):
            print("  Found:", m.group(0).strip())
    except Exception as e:
        print("Error:", e)

check_domain("https://www.harpspectrum.org/folk/tuning.shtml")
check_domain("https://www.harpspectrum.org/folk/index.shtml")
check_domain("https://harpspectrum.org/")
