import sys, urllib.request, json
sys.stdout.reconfigure(encoding='utf-8')

for page in ["Lever_harp", "Celtic_harp", "Harp"]:
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles={page}&explaintext=1&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'HarpResearch/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data['query']['pages']
            for pid, pdata in pages.items():
                print(f"=== {pdata.get('title')} ===")
                text = pdata.get('extract', '')
                for line in text.split('\n'):
                    if any(k in line.lower() for k in ['lever', 'tuning', 'flat', 'sharp', 'e-flat', 'e flat', 'b-flat', 'b flat']):
                        print(line[:120])
    except Exception as e:
        print(e)
