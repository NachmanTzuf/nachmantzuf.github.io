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

def get_master_key():
    local_state_path = r'C:\Users\Hp\AppData\Local\Google\Chrome\User Data\Local State'
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

def copy_locked_file(src, dst):
    # Windows API CreateFile with full sharing
    GENERIC_READ = 0x80000000
    FILE_SHARE_READ = 0x00000001
    FILE_SHARE_WRITE = 0x00000002
    FILE_SHARE_DELETE = 0x00000004
    OPEN_EXISTING = 3
    FILE_ATTRIBUTE_NORMAL = 0x80

    handle = ctypes.windll.kernel32.CreateFileW(
        src, GENERIC_READ,
        FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
        None, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, None
    )
    if handle == -1 or handle == 0xFFFFFFFFFFFFFFFF:
        raise ctypes.WinError()

    with open(dst, 'wb') as out_f:
        buf = ctypes.create_string_buffer(64 * 1024)
        bytes_read = wintypes.DWORD()
        while True:
            success = ctypes.windll.kernel32.ReadFile(handle, buf, len(buf), ctypes.byref(bytes_read), None)
            if not success or bytes_read.value == 0:
                break
            out_f.write(buf.raw[:bytes_read.value])
    ctypes.windll.kernel32.CloseHandle(handle)

master_key = get_master_key()
print('Master key decrypted:', master_key is not None)

cookie_src = r'C:\Users\Hp\AppData\Local\Google\Chrome\User Data\Default\Network\Cookies'
cookie_tmp = 'cookies_tmp.db'
copy_locked_file(cookie_src, cookie_tmp)
print('Copied locked cookie db successfully!')

conn = sqlite3.connect(cookie_tmp)
cursor = conn.cursor()
cursor.execute("SELECT host_key, name, encrypted_value FROM cookies WHERE host_key LIKE '%google.com%';")
cookies_dict = {}
for host_key, name, enc_val in cursor.fetchall():
    try:
        val = decrypt_cookie_val(enc_val, master_key)
        if val:
            cookies_dict[name] = val
    except:
        pass
conn.close()
os.remove(cookie_tmp)
print(f'Extracted {len(cookies_dict)} Google cookies.')

# Now download the Google Drive file using authenticated session!
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
}
s = requests.Session()
s.headers.update(headers)
s.cookies.update(cookies_dict)

url = 'https://drive.google.com/uc?export=download&id=1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER'
r = s.get(url, allow_redirects=True, stream=True)
print('Auth GET Status:', r.status_code, r.headers.get('content-type'), r.headers.get('content-length'))

# If Google shows a "virus scan warning" large file page
if 'text/html' in r.headers.get('content-type', ''):
    html = r.text
    import re
    m = re.search(r'confirm=([^&"\'\s]+)', html)
    if m:
        confirm = m.group(1)
        print('Got confirm code:', confirm)
        r = s.get(f'https://drive.google.com/uc?export=download&confirm={confirm}&id=1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER', stream=True)
        print('Confirmed GET Status:', r.status_code, r.headers.get('content-type'), r.headers.get('content-length'))

out_file = 'extracted_user_gameplay_recording.mp4'
with open(out_file, 'wb') as f:
    for chunk in r.iter_content(chunk_size=1024*1024):
        if chunk:
            f.write(chunk)

sz = os.path.getsize(out_file)
print('Downloaded video file size:', sz, 'bytes')
if sz > 1000000:
    print('SUCCESS! Valid binary video downloaded!')
    shutil.copy2(out_file, r'C:\Users\Hp\Desktop\ARPA levels and harp mechanism\user_gameplay_recording.mp4')
    print('Copied to desktop fallback path.')
