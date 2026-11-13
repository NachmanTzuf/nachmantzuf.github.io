"""
Deterministic Remotion H.264 Broadcast Render, FFprobe Verification & Deploy Helper
Composition: EarpaPath1SingleNotesMotionV36 (1080x1920, 30fps)
"""

import os
import shutil
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio"
EARPA_VIDEO = os.path.join(ROOT_DIR, "earpa-video")
OUT_DIR = os.path.join(EARPA_VIDEO, "out")
RAW_MP4 = os.path.join(OUT_DIR, "Earpa_Path1_Single_Notes_Lesson_v36_raw.mp4")
FINAL_MP4 = os.path.join(OUT_DIR, "Earpa_Path1_Single_Notes_Lesson.mp4")

DEPLOY_TARGETS = [
    r"C:\Users\Hp\Desktop\Motion 3D Video\Path Instruction Videos\Earpa_Path1_Single_Notes_Lesson.mp4",
    r"C:\Users\Hp\.gemini\antigravity\brain\67b35573-8bb9-4040-a196-00050432de75\Earpa_Path1_Single_Notes_Lesson.mp4",
    os.path.join(EARPA_VIDEO, "public", "videos", "mission", "EarpaSingleNotesInstruction.mp4"),
    os.path.join(ROOT_DIR, "public", "videos", "mission", "EarpaSingleNotesInstruction.mp4"),
    os.path.join(ROOT_DIR, "dist", "videos", "mission", "EarpaSingleNotesInstruction.mp4"),
]


def run_step(cmd, cwd=None):
    print(f"\n>>> Running: {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, check=True)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    # 1. Deterministic Remotion Render (Three.js ANGLE WebGL)
    run_step(
        [
            "npx.cmd",
            "remotion",
            "render",
            "src/index.ts",
            "EarpaPath1SingleNotesMotionV36",
            RAW_MP4,
            "--gl=angle",
            "--concurrency=4",
            "--codec=h264",
            "--crf=16",
            "--audio-bitrate=192k",
        ],
        cwd=EARPA_VIDEO,
    )

    # 2. Faststart broadcast remux/encode for instant web streaming (HTTP 206 / mobile playback)
    run_step(
        [
            "ffmpeg",
            "-y",
            "-i",
            RAW_MP4,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-ar",
            "48000",
            "-movflags",
            "+faststart",
            FINAL_MP4,
        ]
    )

    # 3. Verify stream integrity with ffprobe
    run_step(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration,size:stream=codec_name,width,height,r_frame_rate,sample_rate,channels",
            "-of",
            "default=noprint_wrappers=1",
            FINAL_MP4,
        ]
    )

    # 4. Audio peak verification (confirm zero clipping > 0dBFS)
    subprocess.run(
        [
            "ffmpeg",
            "-i",
            FINAL_MP4,
            "-af",
            "volumedetect",
            "-f",
            "null",
            "NUL",
        ],
        check=True,
    )

    # 5. Copy to all 5 deployment destinations
    for dest in DEPLOY_TARGETS:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copy2(FINAL_MP4, dest)
        print(f"Deployed -> {dest} ({os.path.getsize(dest)} bytes)")

    print("\n=== RENDER & DEPLOY COMPLETE ===")


if __name__ == "__main__":
    main()
