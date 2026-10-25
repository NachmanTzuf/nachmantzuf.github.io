import urllib.request, ssl, sys
sys.stdout.reconfigure(encoding='utf-8')
ctx = ssl._create_unverified_context()

url = "https://cdn.prod.website-files.com/60be912aa3964ce01e0271d8/619848c7daa75444eb42705a_Using%20Sharping%20Levers.pdf"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
data = urllib.request.urlopen(req, context=ctx).read()
print("Downloaded size:", len(data))
with open("dusty_using_sharping_levers.pdf", "wb") as f:
    f.write(data)
