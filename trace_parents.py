import sqlite3

db = r'C:\Users\Hp\AppData\Local\Google\DriveFS\104858100792321423587\mirror_metadata_sqlite.db'
conn = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
c = conn.cursor()

curr = 802
chain = []
while True:
    c.execute('SELECT key, value FROM item_properties WHERE item_stable_id=?', (curr,))
    props = dict(c.fetchall())
    name = props.get('local-title', f'id_{curr}')
    chain.append((curr, name))
    c.execute('SELECT parent_stable_id FROM stable_parents WHERE item_stable_id=?', (curr,))
    p = c.fetchone()
    if not p:
        break
    curr = p[0]

print('PATH CHAIN (from file up to root):')
for item_id, name in chain:
    print(f"  [{item_id}] {name}")

conn.close()
