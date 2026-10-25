import urllib.request
import urllib.parse
from html.parser import HTMLParser
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

class SnippetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_snippet = False
        self.current_snippet = []
        self.snippets = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'a' and 'result__snippet' in attrs_dict.get('class', ''):
            self.in_snippet = True
            self.current_snippet = []

    def handle_endtag(self, tag):
        if tag == 'a' and self.in_snippet:
            self.in_snippet = False
            self.snippets.append(' '.join(self.current_snippet).strip())

    def handle_data(self, data):
        if self.in_snippet:
            self.current_snippet.append(data.strip())

def search(q):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(q)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            parser = SnippetParser()
            parser.feed(html)
            print(f"=== Results for: {q} ===")
            for s in parser.snippets[:4]:
                print("-", s)
    except Exception as e:
        print("Error:", e)

search("lever harp tuning in Eb vs C vs")
search("three ways to tune a lever harp")
search("dusty strings tuning your harp Eb C")
search("lever harp tuning Bb major or Eb major or C major")
