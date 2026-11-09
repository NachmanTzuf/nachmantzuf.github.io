import urllib.request
import json
import os
import subprocess

BASE_URL = "https://nachmantzuf.github.io"

def check_live_deployment():
    print("\n--- CHECKING LIVE DEPLOYMENT (v31) ---")
    
    # 1. Manifest
    manifest_url = f"{BASE_URL}/videos/mission/manifest.json?v=v31_20261109"
    try:
        req = urllib.request.Request(manifest_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[LIVE] Manifest HTTP {resp.status} OK:")
            for item in data:
                print(f"  - {item['id']}: {item['seconds']}s, {item['url']}")
            assert len(data) == 3, "Expected 3 manifest entries"
            assert data[0]['seconds'] == 100 and data[1]['seconds'] == 100 and data[2]['seconds'] == 150
            print("[PASS] Manifest verified with v31 entries and 100s/100s/150s durations!")
    except Exception as e:
        print(f"[FAIL] Manifest check failed: {e}")

    # 2. Service Worker
    sw_url = f"{BASE_URL}/sw.js?t=v31"
    try:
        req = urllib.request.Request(sw_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
            if 'earpa-pwa-v31' in content:
                print("[PASS] Live sw.js contains earpa-pwa-v31!")
            else:
                print(f"[WARN] Live sw.js does not yet have earpa-pwa-v31 (CDN propagation in progress)")
    except Exception as e:
        print(f"[FAIL] SW check failed: {e}")

    # 3. Video Range Requests (HTTP 206)
    videos = [
        "EarpaSingleNotesInstruction.mp4",
        "EarpaMelodyPhrasingInstruction.mp4",
        "EarpaCamacLeversInstruction.mp4"
    ]
    for v in videos:
        v_url = f"{BASE_URL}/videos/mission/{v}"
        try:
            req = urllib.request.Request(v_url, headers={'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-1024'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                print(f"[LIVE] {v}: HTTP {resp.status}, Content-Range: {resp.headers.get('Content-Range')}, Accept-Ranges: {resp.headers.get('Accept-Ranges')}")
        except Exception as e:
            print(f"[FAIL] {v} check failed: {e}")

    # 4. Desktop Files
    desktop_dir = r"C:\Users\Hp\Desktop\Motion 3D Video\Path Instruction Videos"
    print(f"\n--- CHECKING DESKTOP DIRECTORY ---")
    for f in ["Earpa_Path1_Single_Notes_Lesson.mp4", "Earpa_Path2_Melodic_Sequence_Lesson.mp4", "Earpa_Path3_Camac_Levers_Lesson.mp4", "WATCH_INSTRUCTION_VIDEOS.html"]:
        full = os.path.join(desktop_dir, f)
        if os.path.exists(full):
            print(f"  [OK] {f} ({os.path.getsize(full):,} bytes)")
        else:
            print(f"  [MISSING] {full}")

if __name__ == "__main__":
    check_live_deployment()
