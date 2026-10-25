import urllib.request, ssl, re, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

url = "https://manufacturing.dustystrings.com/harps/maintenance-troubleshooting"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
print("Length:", len(html))

# Look for sections related to tuning and levers
text = re.sub('<[^<]+?>', ' ', html)
for sentence in re.split(r'\. |\n', text):
    sentence = sentence.strip()
    if any(k in sentence.lower() for k in ['tune', 'tuning', 'eb', 'sharping lever', 'flats', 'key of']):
        if 20 < len(sentence) < 300:
            print(">>", sentence)
