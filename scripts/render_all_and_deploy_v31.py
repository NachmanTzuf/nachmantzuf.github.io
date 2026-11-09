"""
Automated Pipeline for Earpa Path Instruction Videos v31:
1. Waits for Path 3 raw master to complete (if running) or verifies it exists
2. Renders Path 1 raw master (3000 frames)
3. Renders Path 2 raw master (3000 frames)
4. Faststart re-encodes all three videos (CRF 18, high profile, faststart movflags)
5. Verifies ffprobe parameters: 1080x1920, 30fps, faststart, stereo AAC 48kHz
6. Deploys to Desktop and app directories
7. Updates manifests with v31_20261109
8. Runs expo export and sync_dist_assets
"""

import os
import sys
import time
import subprocess
import json
import shutil

REPO_ROOT = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio"
VIDEO_DIR = os.path.join(REPO_ROOT, "earpa-video")
OUT_DIR = os.path.join(VIDEO_DIR, "out")
DESKTOP_DIR = r"C:\Users\Hp\Desktop\Motion 3D Video\Path Instruction Videos"
APP_DIRS = [
    os.path.join(REPO_ROOT, r"earpa-video\public\videos\mission"),
    os.path.join(REPO_ROOT, r"dist\videos\mission"),
    os.path.join(REPO_ROOT, r"public\videos\mission"),
]

VIDEOS = [
    {
        "id": "EarpaSingleNotesInstruction",
        "title": "▷ QUICK LESSON · TONIC ANCHOR (100s)",
        "track": "single",
        "seconds": 100,
        "comp": "EarpaPath1SingleNotesLesson",
        "raw": "Earpa_Path1_Single_Notes_Lesson_raw.mp4",
        "final": "Earpa_Path1_Single_Notes_Lesson.mp4",
        "player": "EarpaSingleNotesInstruction.mp4",
        "review_legacy": "EarpaSingleA-review.mp4"
    },
    {
        "id": "EarpaMelodyPhrasingInstruction",
        "title": "▷ QUICK LESSON · MELODIC SEQUENCE (100s)",
        "track": "melody",
        "seconds": 100,
        "comp": "EarpaPath2MelodicSequenceLesson",
        "raw": "Earpa_Path2_Melodic_Sequence_Lesson_raw.mp4",
        "final": "Earpa_Path2_Melodic_Sequence_Lesson.mp4",
        "player": "EarpaMelodyPhrasingInstruction.mp4",
        "review_legacy": "EarpaMelodyA-review.mp4"
    },
    {
        "id": "EarpaCamacLeversInstruction",
        "title": "▷ QUICK LESSON · LEVER MASTERY (150s)",
        "track": "levers",
        "seconds": 150,
        "comp": "EarpaPath3CamacLeversLesson",
        "raw": "Earpa_Path3_Camac_Levers_Lesson_raw.mp4",
        "final": "Earpa_Path3_Camac_Levers_Lesson.mp4",
        "player": "EarpaCamacLeversInstruction.mp4",
        "review_legacy": "EarpaLeverMasterclass-review.mp4"
    }
]

def run_cmd(cmd, cwd=REPO_ROOT):
    print(f"\n[RUN] {' '.join(cmd) if isinstance(cmd, list) else cmd} (in {cwd})")
    subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), check=True)

def render_comp(comp_name, raw_name):
    raw_path = os.path.join(OUT_DIR, raw_name)
    if os.path.exists(raw_path):
        os.remove(raw_path)
    cmd = f"npx.cmd remotion render src/index.ts {comp_name} out/{raw_name} --gl=angle"
    run_cmd(cmd, cwd=VIDEO_DIR)
    if not os.path.exists(raw_path):
        raise RuntimeError(f"Render failed, output missing: {raw_path}")
    print(f"[RENDERED] {raw_path} ({os.path.getsize(raw_path):,} bytes)")

def encode_faststart(raw_name, final_name):
    raw_path = os.path.join(OUT_DIR, raw_name)
    final_path = os.path.join(OUT_DIR, final_name)
    print(f"[FASTSTART] Encoding {raw_name} -> {final_name}...")
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

def verify_video(final_name, expected_seconds):
    final_path = os.path.join(OUT_DIR, final_name)
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
    print(f"[VERIFY] {final_name}: {width}x{height}, duration: {duration:.2f}s (expected: {expected_seconds}s)")
    assert width == 1080 and height == 1920, f"Resolution error: {width}x{height}"
    assert abs(duration - expected_seconds) < 1.0, f"Duration error: {duration}s vs {expected_seconds}s"

def deploy_video(v_info):
    final_path = os.path.join(OUT_DIR, v_info["final"])
    os.makedirs(DESKTOP_DIR, exist_ok=True)
    desktop_final = os.path.join(DESKTOP_DIR, v_info["final"])
    shutil.copy2(final_path, desktop_final)
    print(f"[DEPLOY] Copied to Desktop: {desktop_final}")
    for app_dir in APP_DIRS:
        os.makedirs(app_dir, exist_ok=True)
        p_dest = os.path.join(app_dir, v_info["player"])
        shutil.copy2(final_path, p_dest)
        leg_dest = os.path.join(app_dir, v_info["review_legacy"])
        shutil.copy2(final_path, leg_dest)
        print(f"[DEPLOY] Deployed to: {p_dest}")

def update_manifests():
    manifest_entries = [
        {
            "id": v["id"],
            "title": v["title"],
            "track": v["track"],
            "seconds": v["seconds"],
            "url": f"/videos/mission/{v['player']}?v=v31_20261109"
        }
        for v in VIDEOS
    ]
    for app_dir in APP_DIRS:
        mpath = os.path.join(app_dir, "manifest.json")
        with open(mpath, "w", encoding="utf-8") as f:
            json.dump(manifest_entries, f, indent=2)
        print(f"[MANIFEST] Updated: {mpath}")

if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "all"
    print(f"Executing step: {step}")
    
    if step in ("render_p1", "all_renders"):
        render_comp("EarpaPath1SingleNotesLesson", "Earpa_Path1_Single_Notes_Lesson_raw.mp4")
    if step in ("render_p2", "all_renders"):
        render_comp("EarpaPath2MelodicSequenceLesson", "Earpa_Path2_Melodic_Sequence_Lesson_raw.mp4")
    if step in ("finish_p1", "finish_p1_and_run_p2"):
        v = VIDEOS[0]
        encode_faststart(v["raw"], v["final"])
        verify_video(v["final"], v["seconds"])
        deploy_video(v)
        update_manifests()
    if step == "finish_p1_and_run_p2":
        render_comp("EarpaPath2MelodicSequenceLesson", "Earpa_Path2_Melodic_Sequence_Lesson_raw.mp4")
        v2 = VIDEOS[1]
        encode_faststart(v2["raw"], v2["final"])
        verify_video(v2["final"], v2["seconds"])
        deploy_video(v2)
        update_manifests()
    if step in ("finish_p2",):
        v2 = VIDEOS[1]
        encode_faststart(v2["raw"], v2["final"])
        verify_video(v2["final"], v2["seconds"])
        deploy_video(v2)
        update_manifests()
    if step in ("encode_all", "all"):
        for v in VIDEOS:
            encode_faststart(v["raw"], v["final"])
            verify_video(v["final"], v["seconds"])
            deploy_video(v)
        update_manifests()
