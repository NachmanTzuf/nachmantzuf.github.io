import requests
import re
import os

url = 'https://drive.google.com/uc?export=download&id=1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER'
s = requests.Session()
r = s.get(url, allow_redirects=True)
print('Response 1:', r.status_code, r.headers.get('content-type'), len(r.content))

# Check if direct binary
if 'video' in r.headers.get('content-type', '') or len(r.content) > 1000000:
    with open('Screen_recording_20261019_115512.mp4', 'wb') as f:
        f.write(r.content)
    print('SUCCESS! Downloaded direct binary MP4, size:', len(r.content))
else:
    # Look for confirm token
    m = re.search(r'confirm=([^&"\'\s]+)', r.text)
    if m:
        confirm = m.group(1)
        print('Found confirm token:', confirm)
        r2 = s.get(f'https://drive.google.com/uc?export=download&confirm={confirm}&id=1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER')
        print('Response 2:', r2.status_code, r2.headers.get('content-type'), len(r2.content))
        if len(r2.content) > 1000000:
            with open('Screen_recording_20261019_115512.mp4', 'wb') as f:
                f.write(r2.content)
            print('SUCCESS! Downloaded binary MP4 with confirm token, size:', len(r2.content))
    else:
        print('No confirm token found. Response text snippet:')
        print(r.text[:500])
