import os
import re

paths = [
    'earpa-video/src/instructions/Path1SingleNotesVideo.tsx',
    'earpa-video/src/instructions/Path2MelodyPhrasingVideo.tsx',
    'earpa-video/src/instructions/Path3CamacLeversVideo.tsx'
]

for p in paths:
    print(f"\nChecking {p}:")
    with open(p, 'r', encoding='utf-8') as f:
        text = f.read()
    matches = re.findall(r"staticFile\(['\"]([^'\"]+)['\"]\)", text)
    for m in set(matches):
        full = os.path.join('earpa-video/public', m.replace('/', os.sep))
        exists = os.path.exists(full)
        print(f"  {m} -> {'EXISTS' if exists else 'MISSING: ' + full}")
