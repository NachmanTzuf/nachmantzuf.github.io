"""
Batch processor and verification script for Earpa Path Instruction Videos:
1. Re-encode raw Remotion masters to faststart web player MP4s
2. Verify with ffprobe: 1080x1920, 30fps, faststart, stereo AAC 48kHz
3. Copy to app public dirs and Desktop showcase
4. Update manifest.json across all targets
"""

import json
import os
import shutil
import subprocess

OUT_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\out"
DESKTOP_DIR = r"C:\Users\Hp\Desktop\Motion 3D Video\Path Instruction Videos"
APP_DIRS = [
    r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\videos\mission",
    r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\dist\videos\mission",
    r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\public\videos\mission",
]

VIDEOS = [
    {
        "id": "EarpaSingleNotesInstruction",
        "title": "How to Play: Single Notes & Tonic Anchor",
        "track": "single",
        "seconds": 90,
        "raw": "Earpa_Path1_Single_Notes_Lesson_raw.mp4",
        "final": "Earpa_Path1_Single_Notes_Lesson.mp4",
        "player": "EarpaSingleNotesInstruction.mp4",
        "review_legacy": "EarpaSingleA-review.mp4"
    },
    {
        "id": "EarpaMelodyPhrasingInstruction",
        "title": "How to Play: Melodic Phrasing & Contour",
        "track": "melody",
        "seconds": 90,
        "raw": "Earpa_Path2_Melodic_Sequence_Lesson_raw.mp4",
        "final": "Earpa_Path2_Melodic_Sequence_Lesson.mp4",
        "player": "EarpaMelodyPhrasingInstruction.mp4",
        "review_legacy": "EarpaMelodyA-review.mp4"
    },
    {
        "id": "EarpaCamacLeversInstruction",
        "title": "How to Play: Camac Sharping Levers & Modal Shifts",
        "track": "levers",
        "seconds": 120,
        "raw": "Earpa_Path3_Camac_Levers_Lesson_raw.mp4",
        "final": "Earpa_Path3_Camac_Levers_Lesson.mp4",
        "player": "EarpaCamacLeversInstruction.mp4",
        "review_legacy": "EarpaLeverMasterclass-review.mp4"
    }
]

def encode_faststart(raw_name, final_name):
    raw_path = os.path.join(OUT_DIR, raw_name)
    final_path = os.path.join(OUT_DIR, final_name)
    if not os.path.exists(raw_path):
        print(f"Raw file not found: {raw_path}")
        return False
        
    print(f"Encoding faststart for {final_name}...")
    cmd = [
        "ffmpeg", "-y", "-i", raw_path,
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
        "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        final_path
    ]
    subprocess.run(cmd, check=True)
    print(f"Faststart encoding complete: {final_path}")
    return True

def verify_video(final_name, expected_duration):
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
    print(f"Verification {final_name}: {width}x{height}, duration: {duration:.2f}s (expected: {expected_duration}s)")
    assert width == 1080 and height == 1920, f"Resolution mismatch: {width}x{height}"
    assert abs(duration - expected_duration) < 1.0, f"Duration mismatch: {duration}s vs {expected_duration}s"
    return True

def deploy_video(v_info):
    final_path = os.path.join(OUT_DIR, v_info["final"])
    if not os.path.exists(final_path):
        return
        
    os.makedirs(DESKTOP_DIR, exist_ok=True)
    # 1. Copy to Desktop
    desktop_final = os.path.join(DESKTOP_DIR, v_info["final"])
    shutil.copy2(final_path, desktop_final)
    print(f"Copied to Desktop: {desktop_final}")
    
    # 2. Copy to all app video directories (both as canonical player and legacy review fallback)
    for app_dir in APP_DIRS:
        os.makedirs(app_dir, exist_ok=True)
        # Player name
        p_dest = os.path.join(app_dir, v_info["player"])
        shutil.copy2(final_path, p_dest)
        # Also copy over legacy review name so existing modals immediately play new video
        leg_dest = os.path.join(app_dir, v_info["review_legacy"])
        shutil.copy2(final_path, leg_dest)
        print(f"Deployed to: {p_dest}")

def update_manifests():
    manifest_entries = [
        {
            "id": "EarpaSingleNotesInstruction",
            "title": "▷ QUICK LESSON · TONIC ANCHOR (90s)",
            "track": "single",
            "seconds": 90,
            "url": "/videos/mission/EarpaSingleNotesInstruction.mp4?v=v30_20261109"
        },
        {
            "id": "EarpaMelodyPhrasingInstruction",
            "title": "▷ QUICK LESSON · MELODIC SEQUENCE (90s)",
            "track": "melody",
            "seconds": 90,
            "url": "/videos/mission/EarpaMelodyPhrasingInstruction.mp4?v=v30_20261109"
        },
        {
            "id": "EarpaCamacLeversInstruction",
            "title": "▷ QUICK LESSON · LEVER MASTERY (120s)",
            "track": "levers",
            "seconds": 120,
            "url": "/videos/mission/EarpaCamacLeversInstruction.mp4?v=v30_20261109"
        }
    ]
    
    for app_dir in APP_DIRS:
        mpath = os.path.join(app_dir, "manifest.json")
        with open(mpath, "w", encoding="utf-8") as f:
            json.dump(manifest_entries, f, indent=2)
        print(f"Updated manifest: {mpath}")

if __name__ == "__main__":
    import sys
    action = sys.argv[1] if len(sys.argv) > 1 else "all"
    if action == "update_manifests":
        update_manifests()
    elif action.startswith("process_"):
        idx = int(action.split("_")[1])
        v = VIDEOS[idx]
        encode_faststart(v["raw"], v["final"])
        verify_video(v["final"], v["seconds"])
        deploy_video(v)
        update_manifests()
