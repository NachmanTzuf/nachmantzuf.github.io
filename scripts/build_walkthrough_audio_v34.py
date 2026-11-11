import asyncio
import edge_tts
import json
import os
import subprocess
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

VOICE = "en-US-ChristopherNeural"
OUT_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\audio\instructions"
TMP_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\out\v34_audio_tmp"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# 11 scenes mapped to exact video seconds (total trimmed duration: 111.816s)
# Each text calibrated for unhurried, natural human cadence (130-145 wpm) at normal rate
SECTIONS = [
    {
        "id": "scene_01_intro_spinning_harp",
        "title": "DALCROZE & TONAL GRAVITATION",
        "subtitle": "Functional Ear Training Architecture",
        "badge": "DALCROZE & TONAL GRAVITATION · FUNCTIONAL AUDIATION",
        "target_start": 0.5,
        "max_dur": 14.2,
        "rate": "+0%",
        "text": "Welcome to Earpa. Rooted in the Dalcroze and Alain Benbassat functional ear training methods, we train your ear through tonal gravitation. Feel each note gravitate toward the tonic root to develop instinctive, real time pitch recognition."
    },
    {
        "id": "scene_02_map_navigation",
        "title": "SINGLE NOTE PATH",
        "subtitle": "Progressive Coastal Trail",
        "badge": "SINGLE NOTE PATH · PROGRESSIVE TRAIL",
        "target_start": 15.2,
        "max_dur": 3.2,
        "rate": "+2%",
        "text": "Entering the Single Note Path, your progressive coastal journey begins."
    },
    {
        "id": "scene_03_level_11",
        "title": "LEVEL 11 · UPPER TETRACHORD",
        "subtitle": "Active Note Range & Rounds",
        "badge": "LEVEL 11 · UPPER TETRACHORD (DEGREES 5-8)",
        "target_start": 18.6,
        "max_dur": 4.8,
        "rate": "+0%",
        "text": "Level 11 displays your scale, 20 rounds, and the upper tetrachord illuminated in green."
    },
    {
        "id": "scene_04_level_12",
        "title": "LEVEL 12 · FULL OCTAVE",
        "subtitle": "Complete Diatonic Range",
        "badge": "LEVEL 12 · FULL OCTAVE ACTIVE (DEGREES 1-8)",
        "target_start": 23.5,
        "max_dur": 3.5,
        "rate": "+0%",
        "text": "Moving to Level 12, all eight scale degrees illuminate across the full octave."
    },
    {
        "id": "scene_05_round_01",
        "title": "ROUND 1 · NOTE F",
        "subtitle": "Cadence, Humming, & Downward Pull",
        "badge": "ROUND 1 · NOTE F · DOWNWARD GRAVITATIONAL PULL",
        "target_start": 27.2,
        "max_dur": 12.2,
        "rate": "+0%",
        "text": "Round 1 begins with a tonic cadence. Hum the root note. The mystery tone pulls down: Note F. Crystal clear F! The resolution walkdown to root C anchors its physical place in the key."
    },
    {
        "id": "scene_06_round_02",
        "title": "ROUND 2 · NOTE E",
        "subtitle": "Major 3rd Stepwise Resolution",
        "badge": "ROUND 2 · NOTE E · MAJOR 3RD RESOLUTION",
        "target_start": 39.8,
        "max_dur": 11.5,
        "rate": "+0%",
        "text": "Round 2. Re-anchor on the cadence. The stimulus note is warm and rested: degree three, Note E. True Note E! Listen as the walkdown resolves stepwise to root C."
    },
    {
        "id": "scene_07_round_03",
        "title": "ROUND 3 · NOTE G",
        "subtitle": "Mistake Recovery & Ear Recalibration",
        "badge": "ROUND 3 · NOTE G · 5TH DEGREE RECALIBRATION",
        "target_start": 51.6,
        "max_dur": 11.6,
        "rate": "+0%",
        "text": "Round 3. A quick reflex drifts toward D, but the target was G. Even on a miss, the app instantly walks down from G to C, recalibrating your ear."
    },
    {
        "id": "scene_08_round_04",
        "title": "ROUND 4 · NOTE B",
        "subtitle": "Leading Tone Magnetic Upward Snap",
        "badge": "ROUND 4 · NOTE B · LEADING TONE MAGNETIC SNAP",
        "target_start": 63.6,
        "max_dur": 10.6,
        "rate": "+0%",
        "text": "Round 4. Hear that intense tension aching upward? That is leading tone B. Pure Resonance B! Follow the magnetic snap resolving straight up into high C."
    },
    {
        "id": "scene_09_round_05",
        "title": "ROUND 5 · NOTE A",
        "subtitle": "Submediant Full Scale Walkdown",
        "badge": "ROUND 5 · NOTE A · 6TH DEGREE WALKDOWN",
        "target_start": 74.6,
        "max_dur": 10.6,
        "rate": "+0%",
        "text": "Round 5. The sixth degree sounds with an open floating quality: Note A. Golden Tone A! The app walks down the full six steps to root C."
    },
    {
        "id": "scene_10_round_06",
        "title": "ROUND 6 · DEGREE DISCRIMINATION",
        "subtitle": "Adjacent Degrees Precision",
        "badge": "ROUND 6 · DEGREE DISCRIMINATION",
        "target_start": 85.6,
        "max_dur": 9.8,
        "rate": "+0%",
        "text": "Round 6 tests adjacent degree precision. Discerning tight scale steps under performance pressure builds razor sharp acoustic intuition."
    },
    {
        "id": "scene_11_outro",
        "title": "DAILY PRACTICE · 10 MIN / DAY",
        "subtitle": "Endless Progressive Levels",
        "badge": "DAILY PRACTICE · 10 MINUTES A DAY · ENDLESS MASTERY",
        "target_start": 95.8,
        "max_dur": 15.6,
        "rate": "+0%",
        "text": "Back on the roadmap, ten focused minutes a day transforms your musicality. With endless progressive levels across single notes, melodic phrases, and lever modulations, you forge an unbreakable bridge between your ear and your strings."
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
    print("\n--- SYNTHESIZING VOICE SEGMENTS ---")
    
    for i, s in enumerate(SECTIONS):
        raw_mp3 = os.path.join(TMP_DIR, f"{s['id']}.mp3")
        rate = s.get("rate", "+0%")
        comm = edge_tts.Communicate(s["text"], VOICE, rate=rate)
        await comm.save(raw_mp3)
        
        dur = get_audio_duration(raw_mp3)
        print(f"[{i+1}/{len(SECTIONS)}] {s['id']}: dur={dur:.2f}s (target_start={s['target_start']}s, max_dur={s['max_dur']}s)")
        
        # If duration exceeds max_dur, speed up slightly
        if dur > s["max_dur"]:
            excess_ratio = dur / s["max_dur"]
            new_rate_pct = int(round((excess_ratio - 1.0) * 100)) + int(rate.replace("+","").replace("%",""))
            faster_rate = f"+{new_rate_pct}%"
            print(f"  -> Retrying with faster rate {faster_rate} to fit within {s['max_dur']}s...")
            comm = edge_tts.Communicate(s["text"], VOICE, rate=faster_rate)
            await comm.save(raw_mp3)
            dur = get_audio_duration(raw_mp3)
            print(f"  -> New duration: {dur:.2f}s")
            
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
    print("\n--- ASSEMBLING MASTER AUDIO WITH IN-GAME SOUND AND FOLEY ---")
    total_duration = 111.816
    
    # 1. Background in-game audio from user_walkthrough_trimmed.mp4
    video_trimmed = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\videos\walkthrough\user_walkthrough_trimmed.mp4"
    haptic_sfx = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\audio\transition-soft.mp3"
    
    master_wav = os.path.join(OUT_DIR, "path1_walkthrough_master.wav")
    master_mp3 = os.path.join(OUT_DIR, "path1_walkthrough_master.mp3")
    
    # Build complex filter:
    # Input 0: In-game audio from video
    # Inputs 1..N: Voice segments
    inputs = ["-i", video_trimmed]
    filter_complex = []
    
    # In-game audio volume: duck to 0.35 overall so plucks and cadences are heard clearly beneath voice,
    # with pristine clarity.
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
    
    # Also write timeline JSON for Remotion
    json_path = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\src\instructions\timeline_path1_walkthrough.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)
    print(f"[TIMELINE JSON] Saved: {json_path}")

if __name__ == "__main__":
    tl = asyncio.run(synthesize_all())
    assemble_master_audio(tl)
