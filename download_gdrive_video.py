import requests
import re
import os

file_id = '1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER'
dest = r'C:\Users\Hp\Desktop\ARPA levels and harp mechanism\user_gameplay_recording.mp4'

session = requests.Session()
URL = "https://drive.google.com/uc?export=download"

response = session.get(URL, params={'id': file_id}, stream=True)

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value
    # Check text for confirm token
    match = re.search(r'confirm=([0-9A-Za-z_]+)', response.text)
    if match:
        return match.group(1)
    return None

token = get_confirm_token(response)
print("Confirm token:", token)

if token:
    params = {'id': file_id, 'confirm': token}
    response = session.get(URL, params=params, stream=True)

# Also check for direct download form
if 'download' in response.headers.get('Content-Disposition', '') or response.headers.get('Content-Type', '').startswith('video') or response.headers.get('Content-Type', '').startswith('application/octet-stream'):
    print("Direct stream detected! Downloading...")
    with open(dest, "wb") as f:
        for chunk in response.iter_content(chunk_size=32768):
            if chunk:
                f.write(chunk)
    print(f"Downloaded successfully: {os.path.getsize(dest)} bytes")
else:
    # Try parsing form action in response text
    print("Searching for form action...")
    action = re.search(r'action="([^"]+)"', response.text)
    if action:
        form_url = action.group(1)
        print("Form action URL:", form_url)
        # Parse inputs
        inputs = re.findall(r'<input[^>]+name="([^"]+)"[^>]+value="([^"]+)"', response.text)
        form_data = {k: v for k, v in inputs}
        print("Form inputs:", form_data)
        resp2 = session.post(form_url, data=form_data, stream=True)
        with open(dest, "wb") as f:
            for chunk in resp2.iter_content(chunk_size=32768):
                if chunk:
                    f.write(chunk)
        print(f"Downloaded via form: {os.path.getsize(dest)} bytes")
