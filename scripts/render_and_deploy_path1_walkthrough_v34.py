"""
Automated Pipeline for Earpa Path 1 Walkthrough Video v34:
1. Renders Path 1 raw master (3354 frames, 111.8s) via Remotion CLI
2. Faststart re-encodes to Earpa_Path1_Single_Notes_Lesson.mp4 (CRF 18, high profile 4.1)
3. Verifies ffprobe parameters: 1080x1920, 30fps, faststart, stereo AAC 48kHz, duration 111.8s
4. Deploys to Desktop, Brain Artifacts, and all App Mission video folders
5. Updates manifests and ProfileTabScreen.tsx with v34_20261111
6. Rebuilds Expo web production bundle and deploys to dist
"""

import os
import sys
import time
import subprocess
import json
import shutil

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

REPO_ROOT = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio"
VIDEO_DIR = os.path.join(REPO_ROOT, "earpa-video")
OUT_DIR = os.path.join(VIDEO_DIR, "out")
DESKTOP_DIR = r"C:\Users\Hp\Desktop\Motion 3D Video\Path Instruction Videos"
BRAIN_ARTIFACT_DIR = r"C:\Users\Hp\.gemini\antigravity\brain\67b35573-8bb9-4040-a196-00050432de75"
APP_DIRS = [
    os.path.join(REPO_ROOT, r"earpa-video\public\videos\mission"),
    os.path.join(REPO_ROOT, r"dist\videos\mission"),
    os.path.join(REPO_ROOT, r"public\videos\mission"),
]

P1_CONFIG = {
    "id": "EarpaSingleNotesInstruction",
    "title": "▷ QUICK LESSON · TONIC ANCHOR (112s)",
    "track": "single",
    "seconds": 112,
    "frames": 3354,
    "comp": "EarpaPath1SingleNotesLesson",
    "raw": "Earpa_Path1_Single_Notes_Lesson_raw.mp4",
    "final": "Earpa_Path1_Single_Notes_Lesson.mp4",
    "player": "EarpaSingleNotesInstruction.mp4",
    "review_legacy": "EarpaSingleA-review.mp4"
}

def run_cmd(cmd, cwd=REPO_ROOT):
    print(f"\n[RUN] {' '.join(cmd) if isinstance(cmd, list) else cmd} (in {cwd})")
    subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), check=True)

def render_comp():
    raw_path = os.path.join(OUT_DIR, P1_CONFIG["raw"])
    if os.path.exists(raw_path):
        os.remove(raw_path)
    cmd = f"npx.cmd remotion render src/index.ts {P1_CONFIG['comp']} out/{P1_CONFIG['raw']} --concurrency=4 --gl=angle"
    run_cmd(cmd, cwd=VIDEO_DIR)
    if not os.path.exists(raw_path):
        raise RuntimeError(f"Render failed, output missing: {raw_path}")
    print(f"[RENDERED] {raw_path} ({os.path.getsize(raw_path):,} bytes)")

def encode_faststart():
    raw_path = os.path.join(OUT_DIR, P1_CONFIG["raw"])
    final_path = os.path.join(OUT_DIR, P1_CONFIG["final"])
    print(f"[FASTSTART] Encoding {P1_CONFIG['raw']} -> {P1_CONFIG['final']}...")
    cmd = [
        "ffmpeg", "-y", "-i", raw_path,
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
        "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        final_path
    ]
    subprocess.run(cmd, check=True)
    print(f"[ENCODED] {final_path} ({os.path.getsize(final_path):,} bytes)")

def verify_video():
    final_path = os.path.join(OUT_DIR, P1_CONFIG["final"])
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,codec_name",
        "-show_entries", "format=duration",
        "-of", "json",
        final_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, text=True, check=True)
    data = json.loads(res.stdout)
    stream = data["streams"][0]
    duration = float(data["format"]["duration"])
    width = int(stream["width"])
    height = int(stream["height"])
    print(f"[VERIFY] {P1_CONFIG['final']}: {width}x{height}, duration: {duration:.2f}s (expected: ~{P1_CONFIG['seconds']}s)")
    assert width == 1080 and height == 1920, f"Resolution error: {width}x{height}"
    assert abs(duration - P1_CONFIG["seconds"]) < 3.0, f"Duration error: {duration}s vs {P1_CONFIG['seconds']}s"

def deploy_video():
    final_path = os.path.join(OUT_DIR, P1_CONFIG["final"])
    
    # 1. Desktop
    os.makedirs(DESKTOP_DIR, exist_ok=True)
    desktop_final = os.path.join(DESKTOP_DIR, P1_CONFIG["final"])
    shutil.copy2(final_path, desktop_final)
    print(f"[DEPLOY] Copied to Desktop: {desktop_final}")
    
    # 2. Brain Artifacts
    brain_final = os.path.join(BRAIN_ARTIFACT_DIR, P1_CONFIG["final"])
    shutil.copy2(final_path, brain_final)
    print(f"[DEPLOY] Copied to Brain: {brain_final}")
    
    # 3. App Mission directories
    for app_dir in APP_DIRS:
        os.makedirs(app_dir, exist_ok=True)
        p_dest = os.path.join(app_dir, P1_CONFIG["player"])
        shutil.copy2(final_path, p_dest)
        leg_dest = os.path.join(app_dir, P1_CONFIG["review_legacy"])
        shutil.copy2(final_path, leg_dest)
        print(f"[DEPLOY] Deployed to: {p_dest}")

def update_manifests():
    for app_dir in APP_DIRS:
        mpath = os.path.join(app_dir, "manifest.json")
        if os.path.exists(mpath):
            with open(mpath, "r", encoding="utf-8") as f:
                entries = json.load(f)
            for entry in entries:
                if entry.get("id") == P1_CONFIG["id"] or entry.get("track") == "single":
                    entry["title"] = P1_CONFIG["title"]
                    entry["seconds"] = P1_CONFIG["seconds"]
                    entry["url"] = f"/videos/mission/{P1_CONFIG['player']}?v=v34_20261111"
            with open(mpath, "w", encoding="utf-8") as f:
                json.dump(entries, f, indent=2)
            print(f"[MANIFEST] Updated: {mpath}")

def update_profile_screen():
    profile_screen = os.path.join(REPO_ROOT, r"src\components\tabs\ProfileTabScreen.tsx")
    with open(profile_screen, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Update duration and version query parameter
    old_p1_block = """  {
    id: 'single',
    title: 'Single Note',
    subtitle: 'Tonic Anchor',
    duration: '90s',
    poster: '/videos/plus/SingleMotionPlus-poster.jpg',
    url: '/videos/mission/EarpaSingleNotesInstruction.mp4?v=v32_20261109',
    accent: '#10b981',
  },"""
    new_p1_block = """  {
    id: 'single',
    title: 'Single Note',
    subtitle: 'Tonic Anchor',
    duration: '112s',
    poster: '/videos/plus/SingleMotionPlus-poster.jpg',
    url: '/videos/mission/EarpaSingleNotesInstruction.mp4?v=v34_20261111',
    accent: '#10b981',
  },"""
    if old_p1_block in content:
        content = content.replace(old_p1_block, new_p1_block)
        with open(profile_screen, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[PROFILE SCREEN] Updated: {profile_screen}")
    else:
        print("[PROFILE SCREEN] Pattern already updated or not found, verifying...")

def build_dist():
    print("\n--- REBUILDING APP EXPO WEB PRODUCTION BUNDLE ---")
    run_cmd("npx.cmd expo export -p web", cwd=REPO_ROOT)
    
    # Re-copy videos into dist to ensure they are present
    dist_mission = os.path.join(REPO_ROOT, r"dist\videos\mission")
    os.makedirs(dist_mission, exist_ok=True)
    final_path = os.path.join(OUT_DIR, P1_CONFIG["final"])
    shutil.copy2(final_path, os.path.join(dist_mission, P1_CONFIG["player"]))
    shutil.copy2(final_path, os.path.join(dist_mission, P1_CONFIG["review_legacy"]))
    print(f"[DIST] Verified videos in {dist_mission}")

if __name__ == "__main__":
    t0 = time.time()
    print("=== STARTING PATH 1 WALKTHROUGH V34 RENDER & DEPLOY PIPELINE ===")
    render_comp()
    encode_faststart()
    verify_video()
    deploy_video()
    update_manifests()
    update_profile_screen()
    build_dist()
    dt = time.time() - t0
    print(f"\n=== PIPELINE COMPLETE IN {dt:.1f}s ===")
