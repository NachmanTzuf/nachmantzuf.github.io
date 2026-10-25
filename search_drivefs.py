import os, sqlite3, sys

sys.stdout.reconfigure(encoding='utf-8')
p = r'C:\Users\Hp\AppData\Local\Google\DriveFS'
for root, dirs, files in os.walk(p):
    for f in files:
        if f.endswith('.db') and not f.endswith('-wal') and not f.endswith('-shm'):
            db_path = os.path.join(root, f)
            try:
                conn = sqlite3.connect(f'file:{db_path}?mode=ro', uri=True)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                for (tbl,) in tables:
                    try:
                        cursor.execute(f"SELECT * FROM {tbl};")
                        rows = cursor.fetchall()
                        for r in rows:
                            row_str = str(r)
                            if '1zvhq' in row_str or '115512' in row_str or 'Air training' in row_str or 'user_gameplay' in row_str:
                                print('MATCH in', db_path, tbl, row_str[:300])
                    except:
                        pass
                conn.close()
            except Exception as e:
                pass
print('Search complete.')
