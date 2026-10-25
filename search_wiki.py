import sys
import urllib.request
import json

sys.stdout.reconfigure(encoding='utf-8')

url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=celtic+harp+tuning+Eb+major+or+C+major&format=json"
req = urllib.request.Request(url, headers={'User-Agent': 'HarpResearch/1.0'})
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        for item in data['query']['search']:
            print("TITLE:", item['title'])
            print("SNIPPET:", item['snippet'])
            print()
except Exception as e:
    print(e)
