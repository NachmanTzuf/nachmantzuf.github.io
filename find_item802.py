import os, sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')

db = r'C:\Users\Hp\AppData\Local\Google\DriveFS\104858100792321423587\mirror_metadata_sqlite.db'
conn = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = c.fetchall()
print('Tables in mirror_metadata_sqlite.db:', [t[0] for t in tables])

for (tbl,) in tables:
    try:
        c.execute(f"PRAGMA table_info({tbl});")
        cols = [col[1] for col in c.fetchall()]
        # search for 802 or 1zvhq
        c.execute(f"SELECT * FROM {tbl};")
        rows = c.fetchall()
        for r in rows:
            if 802 in r or '1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER' in str(r):
                print(f"[{tbl}]", dict(zip(cols, r)))
    except Exception as e:
        pass
conn.close()

# Also check other databases in 104858100792321423587
base = r'C:\Users\Hp\AppData\Local\Google\DriveFS\104858100792321423587'
for f in os.listdir(base):
    if f.endswith('.db') and f != 'mirror_metadata_sqlite.db':
        try:
            conn2 = sqlite3.connect(f'file:{os.path.join(base, f)}?mode=ro', uri=True)
            c2 = conn2.cursor()
            c2.execute("SELECT name FROM sqlite_master WHERE type='table';")
            t2 = c2.fetchall()
            for (tbl,) in t2:
                c2.execute(f"SELECT * FROM {tbl};")
                for r in c2.fetchall():
                    if '1zvhq' in str(r) or '802' in str(r):
                        print(f"[{f} -> {tbl}]", str(r)[:200])
            conn2.close()
        except:
            pass
