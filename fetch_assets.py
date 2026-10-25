import os
import json
import urllib.request
import urllib.parse

ASSET_DIR = r"C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\assets"
os.makedirs(ASSET_DIR, exist_ok=True)

ITEMS_TO_FETCH = [
    # 1. Close Button
    {"id": "close_brigid_cross", "query": "File:Saint Brigid's cross.jpg", "name": "Saint Brigid's Cross"},
    {"id": "close_saltire_knot", "query": "Celtic knot cross svg", "name": "Celtic Saltire Knot"},
    {"id": "close_dara_knot", "query": "Dara knot svg", "name": "Dara Oak Knot"},

    # 2. Currency Shards
    {"id": "currency_gold_torc", "query": "Broighter Gold Torc", "name": "Ancient Gold Torc"},
    {"id": "currency_gold_lunula", "query": "Gold lunula Ireland", "name": "Celtic Gold Lunula"},
    {"id": "currency_ogham_stone", "query": "Ogham stone Ireland", "name": "Ogham Slate Stone"},

    # 3. Streak Flame
    {"id": "streak_brigid_flame", "query": "Brigid eternal flame Kildare", "name": "Brigid Eternal Flame"},
    {"id": "streak_taranis_wheel", "query": "Wheel of Taranis Celtic sun", "name": "Taranis Solar Wheel"},
    {"id": "streak_triquetra_fire", "query": "Triquetra symbol svg", "name": "Triquetra Fire Knot"},

    # 4. Stage Monument
    {"id": "monument_glendalough", "query": "Glendalough round tower Ireland", "name": "Irish Round Tower"},
    {"id": "monument_poulnabrone", "query": "Poulnabrone dolmen Burren", "name": "Poulnabrone Portal Dolmen"},
    {"id": "monument_newgrange", "query": "Newgrange entrance stone", "name": "Newgrange Megalithic Cairn"},

    # 5. Rating Stars
    {"id": "stars_shamrock", "query": "Trifolium dubium shamrock green", "name": "Emerald Shamrock"},
    {"id": "stars_triskele", "query": "Triskelion triple spiral Celtic", "name": "Newgrange Triskele"},
    {"id": "stars_shield_knot", "query": "Celtic shield knot svg", "name": "Celtic Shield Knot"},

    # 6. Roadmap Foliage
    {"id": "foliage_heather", "query": "Calluna vulgaris Connemara heather", "name": "Wild Purple Heather"},
    {"id": "foliage_hawthorn", "query": "Fairy tree hawthorn Ireland", "name": "Sacred Hawthorn Tree"},
    {"id": "foliage_fern", "query": "Pteridium aquilinum Ireland bracken fern", "name": "Irish Highland Fern"},

    # 7. Level Nodes
    {"id": "node_battersea_shield", "query": "Battersea Shield bronze Celtic", "name": "Celtic Bronze Shield Boss"},
    {"id": "node_sun_disc", "query": "Bronze age gold sun disc Ireland", "name": "Celtic Gold Sun Disc"},
    {"id": "node_carved_ogham", "query": "Dunloe Ogham stones", "name": "Carved Ogham Milestone"},

    # 8. Locked Node
    {"id": "lock_tara_brooch", "query": "Tara Brooch National Museum of Ireland", "name": "Tara Penannular Brooch Clasp"},
    {"id": "lock_interlaced_iron", "query": "Celtic interlaced knotwork bronze", "name": "Interlaced Binding Knot"},
    {"id": "lock_bound_stone", "query": "Standing stone Ireland Celtic cross", "name": "Celtic Bound Rune Stone"},

    # 9. Avatar Harper Badge
    {"id": "avatar_brian_boru", "query": "Brian Boru harp Trinity College", "name": "Brian Boru Trinity Harp"},
    {"id": "avatar_bodhran", "query": "Bodhran traditional Irish drum", "name": "Traditional Irish Bodhrán"},
    {"id": "avatar_crwth", "query": "Crwth Celtic lyre", "name": "Celtic Crwth Lyre"},

    # 10. Nav Home
    {"id": "nav_crannog", "query": "Crannog thatched roof Ireland", "name": "Celtic Thatched Crannóg"},
    {"id": "nav_beehive_hut", "query": "Skellig Michael clochan beehive hut", "name": "Skellig Beehive Hut (Clochán)"},
    {"id": "nav_stone_hearth", "query": "Ancient stone fire pit Ireland", "name": "Ancestral Celtic Hearth"},

    # 11. Nav Chords
    {"id": "nav_harp_strings", "query": "Celtic harp strings forepillar", "name": "Resonating Celtic Harp Strings"},
    {"id": "nav_triquetra_harmony", "query": "Triquetra knot illuminated", "name": "Trinity Harmonic Knot"},
    {"id": "nav_ogham_stave", "query": "Ogham inscription detail", "name": "Ogham Bardic Notation Stave"},

    # 12. Nav Levers
    {"id": "nav_camac_levers", "query": "Celtic harp sharping levers", "name": "Harp Semitone Sharping Levers"},
    {"id": "nav_tuning_key", "query": "Harp tuning key bronze", "name": "Bronze T-Bar Tuning Key"},
    {"id": "nav_tuning_pegs", "query": "Celtic harp pins bridge", "name": "Carved Wooden Tuning Pins"},

    # 13. Nav Journey
    {"id": "nav_solar_cross", "query": "Celtic sun cross symbol", "name": "Celtic Solar Cross Wheel"},
    {"id": "nav_triskele_spiral", "query": "Triple spiral triskele Celtic", "name": "Dynamic Voyage Triskele"},
    {"id": "nav_celtic_labyrinth", "query": "Celtic labyrinth stone carving", "name": "Celtic Pilgrim Labyrinth"},

    # 14. Play Button
    {"id": "play_lugh_spear", "query": "Celtic bronze spearhead spear of Lugh", "name": "Spearhead of Lugh"},
    {"id": "play_harp_quill", "query": "Bone plectrum quill instrument", "name": "Carved Bone Harp Quill"},
    {"id": "play_triquetra_arrow", "query": "Celtic arrow knotwork", "name": "Dynamic Triquetra Vector"}
]

def search_wikimedia(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=500&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "CelticAppDesignBot/1.0 (contact@antigravity.studio)"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            results = []
            for pid, pinfo in pages.items():
                title = pinfo.get('title', '')
                ii = pinfo.get('imageinfo', [{}])[0]
                img_url = ii.get('thumburl') or ii.get('url')
                if img_url:
                    results.append((title, img_url))
            return results
    except Exception as e:
        print(f"Error querying {query}: {e}")
        return []

def main():
    manifest = []
    print(f"Starting fetch for {len(ITEMS_TO_FETCH)} Celtic symbols...")
    for idx, item in enumerate(ITEMS_TO_FETCH, 1):
        filename = f"{item['id']}.jpg"
        target_path = os.path.join(ASSET_DIR, filename)
        if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
            print(f"[{idx}/{len(ITEMS_TO_FETCH)}] Already exists: {filename}")
            manifest.append({"id": item["id"], "name": item["name"], "file": filename, "path": target_path})
            continue

        results = search_wikimedia(item["query"])
        downloaded = False
        for title, img_url in results:
            try:
                img_req = urllib.request.Request(img_url, headers={"User-Agent": "CelticAppDesignBot/1.0 (contact@antigravity.studio)"})
                with urllib.request.urlopen(img_req, timeout=15) as img_resp:
                    content = img_resp.read()
                    if len(content) > 1000:
                        with open(target_path, "wb") as f:
                            f.write(content)
                        print(f"[{idx}/{len(ITEMS_TO_FETCH)}] Successfully downloaded: {filename} from {title} ({len(content)} bytes)")
                        manifest.append({"id": item["id"], "name": item["name"], "file": filename, "path": target_path})
                        downloaded = True
                        break
            except Exception as e:
                print(f"  Attempt failed for {img_url}: {e}")
                continue
        
        if not downloaded:
            print(f"[{idx}/{len(ITEMS_TO_FETCH)}] Failed to download for {item['name']}")

    with open(os.path.join(ASSET_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("Fetch process completed. Manifest written.")

if __name__ == "__main__":
    main()
