import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    "https://harpcolumn.com/forums/topic/tuning-in-eb-vs-c/",
    "https://www.harpcolumn.com/lever-harp-basics/",
    "https://www.harpcenter.com/category/tuning-harps",
    "https://www.harpcenter.com/page/harp-tuning-charts"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            print("Status:", resp.status, "for", url)
            html = resp.read().decode('utf-8', errors='ignore')
            print("Length:", len(html))
    except Exception as e:
        print("Error for", url, ":", e)
