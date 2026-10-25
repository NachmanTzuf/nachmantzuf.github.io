import urllib.request
import json

# Search Wikimedia Commons API for high quality Roman desert ruins
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=roman%20ruins%20desert%20temple%20palmyra%20monumental&gsrlimit=12&prop=imageinfo&iiprop=url|size&format=json"

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        pages = data.get('query', {}).get('pages', {})
        for pid, page in pages.items():
            title = page.get('title')
            ii = page.get('imageinfo', [{}])[0]
            img_url = ii.get('url')
            width = ii.get('width')
            height = ii.get('height')
            print(f"Title: {title} | Size: {width}x{height} | URL: {img_url}")
except Exception as e:
    print("Error:", e)
