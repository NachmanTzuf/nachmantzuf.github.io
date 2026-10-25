import sys
sys.stdout.reconfigure(encoding='utf-8')

# Try using pypdf, pypdf2, pdfminer or basic pdf stream extractor
try:
    import pypdf
    reader = pypdf.PdfReader("dusty_using_sharping_levers.pdf")
    print("Num pages:", len(reader.pages))
    for i, p in enumerate(reader.pages):
        print(f"=== PAGE {i+1} ===")
        print(p.extract_text())
except Exception as e:
    print("pypdf error:", e)
    # Fallback to pure python regex stream extraction
    import re, zlib
    with open("dusty_using_sharping_levers.pdf", "rb") as f:
        content = f.read()
    streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', content, re.DOTALL)
    for s in streams:
        try:
            decomp = zlib.decompress(s)
            text_chunks = re.findall(rb'\((.*?)\)[\r\n\s]*Tj', decomp)
            if text_chunks:
                print("Extracted:", b' '.join(text_chunks).decode('latin1', errors='ignore')[:300])
        except:
            pass
