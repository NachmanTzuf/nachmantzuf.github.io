import sqlite3

p = r'C:\Users\Hp\AppData\Local\Microsoft\Edge\User Data\Default\Network\Cookies'
conn = sqlite3.connect(f'file:{p}?mode=ro', uri=True)
c = conn.cursor()
c.execute("SELECT host_key, name FROM cookies WHERE host_key LIKE '%google%';")
cookies = c.fetchall()
print('Google cookies in Edge:', len(cookies))
for host, name in cookies:
    print(' ', host, name)
conn.close()
