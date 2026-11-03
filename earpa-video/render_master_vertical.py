import os
import shutil
import subprocess
import time

BASE_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video"
OUT_DIR = os.path.join(BASE_DIR, "out")
DIST_VIDEOS = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\dist\videos"
PUBLIC_VIDEOS = os.path.join(BASE_DIR, "public", "videos")
GOOD_VIDEOS = r"C:\Users\Hp\Documents\Antigravity second Brain\00_System\backups\earpa_video_master_archive\good_videos"
EARPA_VIDEOS = r"C:\Users\Hp\Documents\Antigravity second Brain\00_System\backups\earpa_video_master_archive\Earpa Videos"
BRAIN_DIR = r"C:\Users\Hp\.gemini\antigravity\brain\67b35573-8bb9-4040-a196-00050432de75"

for d in [OUT_DIR, DIST_VIDEOS, PUBLIC_VIDEOS, GOOD_VIDEOS, EARPA_VIDEOS, BRAIN_DIR]:
    os.makedirs(d, exist_ok=True)

master_output = os.path.join(OUT_DIR, "DO_LIKE_Earpa_Master_V5_Vertical_Short.mp4")
player_output = os.path.join(OUT_DIR, "DO_LIKE_Earpa_V5_Vertical_Phone_Player.mp4")

remotion_bin = os.path.join(BASE_DIR, "node_modules", ".bin", "remotion.cmd")

print("==================================================")
print("RENDERING EARPA V5 MASTER VERTICAL PROMO (1080x1920)")
print("Real Artist Celtic Harp Solo • ASMR Haptics • Edge-to-Edge Case")
print("==================================================")

start_time = time.time()

# 1. RENDER MASTER VIA REMOTION
cmd_render = [
    remotion_bin,
    "render",
    "src/index.ts",
    "EarpaShort",
    master_output,
    "--concurrency=4",
    "--gl=angle",
]
print("Running Remotion render command...")
res = subprocess.run(cmd_render, cwd=BASE_DIR)
if res.returncode != 0:
    raise RuntimeError(f"Remotion render failed with code {res.returncode}")

master_size = os.path.getsize(master_output)
print(f"Master render complete: {master_output} ({master_size} bytes)")

# 2. ENCODE FASTSTART WEB STREAMING COPY VIA FFMPEG
print("Encoding web streaming copy with faststart and pristine audio...")
cmd_ffmpeg = [
    "ffmpeg", "-y",
    "-i", master_output,
    "-c:v", "libx264",
    "-crf", "19",
    "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-c:a", "aac",
    "-b:a", "320k",
    player_output
]
subprocess.run(cmd_ffmpeg, check=True)
player_size = os.path.getsize(player_output)
print(f"Streaming player copy complete: {player_output} ({player_size} bytes)")

# 3. MULTI-VAULT SYNCHRONIZATION
sync_targets = [
    # Dist
    os.path.join(DIST_VIDEOS, "DO_LIKE_Earpa_Master_V5_Vertical_Short.mp4"),
    os.path.join(DIST_VIDEOS, "DO_LIKE_Earpa_V5_Vertical_Phone_Player.mp4"),
    os.path.join(DIST_VIDEOS, "earpa_v5_vertical_phone_player.mp4"),
    os.path.join(DIST_VIDEOS, "earpa_master_v5_vertical_short.mp4"),
    # Public
    os.path.join(PUBLIC_VIDEOS, "DO_LIKE_Earpa_Master_V5_Vertical_Short.mp4"),
    os.path.join(PUBLIC_VIDEOS, "DO_LIKE_Earpa_V5_Vertical_Phone_Player.mp4"),
    os.path.join(PUBLIC_VIDEOS, "earpa_v5_vertical_phone_player.mp4"),
    os.path.join(PUBLIC_VIDEOS, "earpa_master_v5_vertical_short.mp4"),
    # Second Brain good_videos
    os.path.join(GOOD_VIDEOS, "DO_LIKE_Earpa_Master_V5_Vertical_Short.mp4"),
    os.path.join(GOOD_VIDEOS, "DO_LIKE_Earpa_V5_Vertical_Phone_Player.mp4"),
    os.path.join(GOOD_VIDEOS, "earpa_v5_vertical_phone_player.mp4"),
    # Second Brain Earpa Videos
    os.path.join(EARPA_VIDEOS, "DO_LIKE_Earpa_Master_V5_Vertical_Short.mp4"),
    os.path.join(EARPA_VIDEOS, "DO_LIKE_Earpa_V5_Vertical_Phone_Player.mp4"),
    # Brain Artifact Directory
    os.path.join(BRAIN_DIR, "DO_LIKE_Earpa_Master_V5_Vertical_Short.mp4"),
    os.path.join(BRAIN_DIR, "DO_LIKE_Earpa_V5_Vertical_Phone_Player.mp4"),
    os.path.join(BRAIN_DIR, "earpa_v5_vertical_phone_player.mp4"),
]

for dest in sync_targets:
    src = player_output if ("phone_player" in dest or "player" in dest) else master_output
    if os.path.abspath(src) == os.path.abspath(dest):
        continue
    shutil.copy2(src, dest)
    print(f"Synced -> {dest}")

elapsed = time.time() - start_time
print(f"All processing and deployment completed in {elapsed:.1f} seconds!")
