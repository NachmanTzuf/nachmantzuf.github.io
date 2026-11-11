import asyncio
import edge_tts
import json
import os
import subprocess
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

VOICE = "en-US-ChristopherNeural"
RATE = "-5%"
OUT_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\audio\instructions"
TMP_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\out\v35_audio_tmp"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# 11 scenes calibrated for calm, slow, unhurried cadence at rate="-5%"
# Total trimmed duration: 111.816s
SECTIONS = [
    {
        "id": "scene_01_intro_spinning_harp",
        "title": "DALCROZE & TONAL GRAVITATION",
        "subtitle": "Functional Ear Training Architecture",
        "badge": "DALCROZE & TONAL GRAVITATION · FUNCTIONAL AUDIATION",
        "target_start": 0.8,
        "text": "Welcome to Earpa. Rooted in the Dalcroze and Alain Benbassat methods, we train your ear through tonal gravitation: feeling each note gravitate toward the tonic root."
    },
    {
        "id": "scene_02_map_navigation",
        "title": "SINGLE NOTE PATH",
        "subtitle": "Progressive Coastal Trail",
        "badge": "SINGLE NOTE PATH · PROGRESSIVE TRAIL",
        "target_start": 15.2,
        "text": "Entering the Single Note Path."
    },
    {
        "id": "scene_03_level_11",
        "title": "LEVEL 11 · UPPER TETRACHORD",
        "subtitle": "Active Note Range & Rounds",
        "badge": "LEVEL 11 · UPPER TETRACHORD (DEGREES 5-8)",
        "target_start": 18.6,
        "text": "Level 11: upper tetrachord green, 20 rounds."
    },
    {
        "id": "scene_04_level_12",
        "title": "LEVEL 12 · FULL OCTAVE",
        "subtitle": "Complete Diatonic Range",
        "badge": "LEVEL 12 · FULL OCTAVE ACTIVE (DEGREES 1-8)",
        "target_start": 23.5,
        "text": "Level 12: all eight scale degrees active."
    },
    {
        "id": "scene_05_round_01",
        "title": "ROUND 1 · NOTE F",
        "subtitle": "Cadence, Humming, & Downward Pull",
        "badge": "ROUND 1 · NOTE F · DOWNWARD GRAVITATIONAL PULL",
        "target_start": 27.8,
        "text": "Round 1. Hum root C. Note F pulls down: crystal clear! The walkdown anchors its key center."
    },
    {
        "id": "scene_06_round_02",
        "title": "ROUND 2 · NOTE E",
        "subtitle": "Major 3rd Stepwise Resolution",
        "badge": "ROUND 2 · NOTE E · MAJOR 3RD RESOLUTION",
        "target_start": 40.0,
        "text": "Round 2. Re-anchor. Degree three is Note E: True Note! Hear it resolve down to C."
    },
    {
        "id": "scene_07_round_03",
        "title": "ROUND 3 · NOTE G",
        "subtitle": "Mistake Recovery & Ear Recalibration",
        "badge": "ROUND 3 · NOTE G · 5TH DEGREE RECALIBRATION",
        "target_start": 51.8,
        "text": "Round 3. A reflex drifts to D, but target is G. The walkdown instantly recalibrates your ear."
    },
    {
        "id": "scene_08_round_04",
        "title": "ROUND 4 · NOTE B",
        "subtitle": "Leading Tone Magnetic Upward Snap",
        "badge": "ROUND 4 · NOTE B · LEADING TONE MAGNETIC SNAP",
        "target_start": 63.8,
        "text": "Round 4. High tension aching up: leading tone B! Pure resonance: snap straight up to high C."
    },
    {
        "id": "scene_09_round_05",
        "title": "ROUND 5 · NOTE A",
        "subtitle": "Submediant Full Scale Walkdown",
        "badge": "ROUND 5 · NOTE A · 6TH DEGREE WALKDOWN",
        "target_start": 74.8,
        "text": "Round 5. Floating sixth degree: Note A. Golden tone! The app walks all six steps down to C."
    },
    {
        "id": "scene_10_round_06",
        "title": "ROUND 6 · DEGREE DISCRIMINATION",
        "subtitle": "Adjacent Degrees Precision",
        "badge": "ROUND 6 · DEGREE DISCRIMINATION",
        "target_start": 85.8,
        "text": "Round 6 tests adjacent degrees. Close tensions train razor-sharp ear recognition."
    },
    {
        "id": "scene_11_outro",
        "title": "DAILY PRACTICE · 10 MIN / DAY",
        "subtitle": "Endless Progressive Levels",
        "badge": "DAILY PRACTICE · 10 MINUTES A DAY · ENDLESS MASTERY",
        "target_start": 96.0,
        "text": "Back on the roadmap, just ten minutes a day transforms your ear. With endless levels across single notes, melodic phrases, and levers, you rewire your musical intuition."
    }
]

def get_audio_duration(file_path):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json",
        file_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, text=True, check=True)
    return float(json.loads(res.stdout)["format"]["duration"])

async def synthesize_all():
    timeline = []
    print(f"\n--- SYNTHESIZING VOICE SEGMENTS ({VOICE} at rate={RATE}) ---")
    
    for i, s in enumerate(SECTIONS):
        raw_mp3 = os.path.join(TMP_DIR, f"{s['id']}.mp3")
        comm = edge_tts.Communicate(s["text"], VOICE, rate=RATE)
        await comm.save(raw_mp3)
        dur = get_audio_duration(raw_mp3)
        print(f"[{i+1}/{len(SECTIONS)}] {s['id']}: dur={dur:.2f}s (start={s['target_start']}s)")
        
        timeline.append({
            "beat": i,
            "id": s["id"],
            "title": s["title"],
            "subtitle": s["subtitle"],
            "badge": s["badge"],
            "start": s["target_start"],
            "duration": dur,
            "end": s["target_start"] + dur,
            "text": s["text"],
            "file": raw_mp3
        })
        
    return timeline

def assemble_master_audio(timeline):
    print("\n--- ASSEMBLING MASTER AUDIO WITH IN-GAME SOUND ---")
    video_trimmed = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\videos\walkthrough\user_walkthrough_trimmed.mp4"
    master_mp3 = os.path.join(OUT_DIR, "path1_walkthrough_master.mp3")
    
    inputs = ["-i", video_trimmed]
    filter_complex = []
    
    # In-game audio volume: duck to 0.45
    filter_complex.append("[0:a]volume=0.45[ingame];")
    mix_sources = ["[ingame]"]
    
    for idx, item in enumerate(timeline, start=1):
        inputs.extend(["-i", item["file"]])
        delay_ms = int(round(item["start"] * 1000))
        filter_complex.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},volume=1.0[vo_{idx}];")
        mix_sources.append(f"[vo_{idx}]")
        
    mix_str = "".join(mix_sources)
    filter_complex.append(f"{mix_str}amix=inputs={len(mix_sources)}:duration=first:dropout_transition=2[outa]")
    
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", "".join(filter_complex),
        "-map", "[outa]",
        "-c:a", "libmp3lame", "-b:a", "256k", "-ar", "48000",
        master_mp3
    ]
    
    subprocess.run(cmd, check=True)
    print(f"[ASSEMBLED] Master audio: {master_mp3} ({os.path.getsize(master_mp3):,} bytes)")
    
    # Save timeline JSON for Remotion
    json_path = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\src\instructions\timeline_path1_walkthrough.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)
    print(f"[TIMELINE JSON] Saved: {json_path}")

if __name__ == "__main__":
    tl = asyncio.run(synthesize_all())
    assemble_master_audio(tl)
