import os, json, base64, sqlite3, shutil, ctypes
from ctypes import wintypes
import requests
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class DATA_BLOB(ctypes.Structure):
    _fields_ = [
        ('cbData', wintypes.DWORD),
        ('pbData', ctypes.POINTER(ctypes.c_byte))
    ]

def decrypt_dpapi(encrypted_data):
    p_data_in = DATA_BLOB(len(encrypted_data), ctypes.cast(ctypes.create_string_buffer(encrypted_data), ctypes.POINTER(ctypes.c_byte)))
    p_data_out = DATA_BLOB()
    if ctypes.windll.crypt32.CryptUnprotectData(ctypes.byref(p_data_in), None, None, None, None, 0, ctypes.byref(p_data_out)):
        return ctypes.string_at(p_data_out.pbData, p_data_out.cbData)
    return None

def get_edge_master_key():
    local_state_path = r'C:\Users\Hp\AppData\Local\Microsoft\Edge\User Data\Local State'
    with open(local_state_path, 'r', encoding='utf-8') as f:
        local_state = json.load(f)
    encrypted_key = base64.b64decode(local_state['os_crypt']['encrypted_key'])
    encrypted_key = encrypted_key[5:] # strip DPAPI prefix
    return decrypt_dpapi(encrypted_key)

def decrypt_cookie_val(encrypted_val, master_key):
    if not encrypted_val: return ''
    if encrypted_val.startswith(b'v10') or encrypted_val.startswith(b'v11'):
        nonce = encrypted_val[3:15]
        ciphertext = encrypted_val[15:]
        aesgcm = AESGCM(master_key)
        return aesgcm.decrypt(nonce, ciphertext, None).decode('utf-8', errors='ignore')
    return decrypt_dpapi(encrypted_val).decode('utf-8', errors='ignore')

master_key = get_edge_master_key()
print('Edge master key decrypted:', master_key is not None)

cookie_path = r'C:\Users\Hp\AppData\Local\Microsoft\Edge\User Data\Default\Network\Cookies'
conn = sqlite3.connect(f'file:{cookie_path}?mode=ro', uri=True)
cursor = conn.cursor()
cursor.execute("SELECT host_key, name, encrypted_value FROM cookies WHERE host_key LIKE '%google.com%';")
cookies_dict = {}
for host_key, name, enc_val in cursor.fetchall():
    try:
        val = decrypt_cookie_val(enc_val, master_key)
        if val:
            cookies_dict[name] = val
    except Exception as e:
        pass
conn.close()
print(f'Decrypted {len(cookies_dict)} Google cookies from Edge!')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
}
s = requests.Session()
s.headers.update(headers)
s.cookies.update(cookies_dict)

file_id = '1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER'
url = f'https://drive.google.com/uc?export=download&id={file_id}'
r = s.get(url, allow_redirects=True, stream=True)
print('GET Status:', r.status_code, r.headers.get('content-type'), r.headers.get('content-length'))

if 'text/html' in r.headers.get('content-type', ''):
    html = r.text
    import re
    m = re.search(r'confirm=([^&"\'\s]+)', html)
    if m:
        confirm = m.group(1)
        print('Got confirm code:', confirm)
        r = s.get(f'https://drive.google.com/uc?export=download&confirm={confirm}&id={file_id}', stream=True)
        print('Confirmed GET Status:', r.status_code, r.headers.get('content-type'), r.headers.get('content-length'))
    elif 'accounts.google.com' in html:
        print('Redirected to Google login. Inspecting cookies:')
        print(cookies_dict.keys())

out_file = 'extracted_user_gameplay_recording.mp4'
with open(out_file, 'wb') as f:
    for chunk in r.iter_content(chunk_size=1024*1024):
        if chunk:
            f.write(chunk)

sz = os.path.getsize(out_file)
print('Downloaded file size:', sz, 'bytes')
if sz > 1000000:
    print('SUCCESS! Valid video downloaded!')
    shutil.copy2(out_file, r'C:\Users\Hp\Desktop\ARPA levels and harp mechanism\user_gameplay_recording.mp4')
    print('Copied to desktop fallback path.')
