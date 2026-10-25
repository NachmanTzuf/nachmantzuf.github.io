import sqlite3
db = r'C:\Users\Hp\AppData\Local\Google\DriveFS\root_preference_sqlite.db'
conn = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
print('Tables:', c.fetchall())
for tbl in ['roots', 'mount_points', 'preferences', 'root_preferences']:
    try:
        c.execute(f"SELECT * FROM {tbl};")
        print(tbl, c.fetchall())
    except Exception as e:
        print(tbl, e)
conn.close()
