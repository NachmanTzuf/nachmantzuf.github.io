import sqlite3

db = r'C:\Users\Hp\AppData\Local\Google\DriveFS\104858100792321423587\metadata_sqlite_db'
conn = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
c = conn.cursor()
c.execute("SELECT * FROM stable_ids WHERE cloud_id='1zvhqQwIXeeeloeQxIk_DxVWJcq0mk4ER';")
print('stable_ids:', c.fetchall())
conn.close()
