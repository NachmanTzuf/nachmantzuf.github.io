import sqlite3

db = r'C:\Users\Hp\AppData\Local\Google\DriveFS\104858100792321423587\metadata_sqlite_db'
conn = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [t[0] for t in c.fetchall()]

for tbl in tables:
    try:
        c.execute(f"SELECT * FROM {tbl};")
        for row in c.fetchall():
            if 259 in row or 771 in row or 772 in row:
                print(f"[{tbl}]", row)
    except:
        pass
conn.close()
