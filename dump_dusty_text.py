import sys, re, zlib
sys.stdout.reconfigure(encoding='utf-8')

with open("dusty_using_sharping_levers.pdf", "rb") as f:
    content = f.read()

streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', content, re.DOTALL)
full_text = []
for s in streams:
    try:
        decomp = zlib.decompress(s)
        # Find Tj and TJ operators
        # TJ format: [ (text) 12 (text) ... ] TJ
        # Tj format: (text) Tj
        for match in re.finditer(rb'\[(.*?)\]\s*TJ', decomp, re.DOTALL):
            items = re.findall(rb'\((.*?)\)', match.group(1))
            full_text.append(b''.join(items).decode('latin1', errors='ignore'))
        for match in re.finditer(rb'\((.*?)\)\s*Tj', decomp):
            full_text.append(match.group(1).decode('latin1', errors='ignore'))
    except:
        pass

all_text = " ".join(full_text)
print("Total length:", len(all_text))
print("\n--- SAMPLE ---\n")
print(all_text[:4000])
