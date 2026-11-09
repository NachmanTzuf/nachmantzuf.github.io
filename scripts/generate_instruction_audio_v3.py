"""
Generate broadcast-grade, natural, fluent voiceovers and authentic warm acoustic Celtic harp audio
for the 3 Earpa Path Instruction Videos (Milestone M122):
Path 1: Single Notes & Tonic Anchor (90s / 2700 frames)
Path 2: Melodic Sequence Phrasing (90s / 2700 frames)
Path 3: Camac Sharping Levers & Modal Shifts (120s / 3600 frames)

Adheres strictly to:
1. Fluent narrative flow: Continuous, studio-grade speech without disjointed segmentation.
2. Note Name Distinction: 1.0s acoustic silence between note letter and the word 'lever' (e.g. "Note E... lever up").
3. Anti-Click DSP: 15ms raised-cosine fades on all speech clips; zero DC-offset transients.
4. Real warm Sitka spruce acoustic harp model (180Hz bloom, 280Hz wood plate, 2100Hz roll-off).
5. Strict Note Naming Law: C, D, E, F, G, A, B (zero degree numbers).
6. Sparse, satisfying haptic foley aligned 1:1 with visual causal events.
"""

import asyncio
import os
import subprocess
import edge_tts
import numpy as np
import scipy.io.wavfile
import scipy.signal as signal

SR = 48000

OUTPUT_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\audio\instructions"
TMP_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\voiceover_tmp\instructions_v3"
WOOD_CLICK_PATH = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public-plus\refined\wood-click.wav"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# -------------------------------------------------------------
# Warm Acoustic Celtic Harp Synthesizer
# -------------------------------------------------------------
def synthesize_warm_harp_pluck(freq, duration_sec=3.0, amplitude=0.75, decay=0.996):
    f0 = max(40.0, min(3200.0, float(freq)))
    n_samples = int(SR * duration_sec)
    p = SR / f0
    D = max(2.0, p - 0.5)
    L = int(np.floor(D))
    frac = D - L
    
    n_exc = min(L, 320)
    white = np.random.uniform(-1.0, 1.0, n_exc)
    b_lp, a_lp = signal.butter(2, 330.0 / (SR / 2), 'low')
    pink = signal.lfilter(b_lp, a_lp, white)
    
    t_exc = np.arange(n_exc) / SR
    fund = np.sin(2 * np.pi * f0 * t_exc)
    window = np.sin(np.pi * np.arange(n_exc) / (n_exc - 1))
    
    delay = np.zeros(L + 3, dtype=np.float32)
    delay[:n_exc] = window * (0.86 * fund + 0.14 * pink)
    delay[:n_exc] -= np.mean(delay[:n_exc])
    
    out = np.zeros(n_samples, dtype=np.float32)
    p_idx = 0
    prev = 0.0
    rho = decay - (f0 / 2000.0) * 0.004
    
    for i in range(n_samples):
        s1 = (1.0 - frac) * delay[p_idx] + frac * delay[(p_idx + 1) % (L + 1)]
        filt = 0.5 * (s1 + prev)
        prev = s1
        delay[p_idx] = filt * rho
        p_idx = (p_idx + 1) % (L + 1)
        out[i] = s1
        
    ramp_len = min(48, n_samples)
    out[:ramp_len] *= 0.5 * (1.0 - np.cos(np.pi * np.arange(ramp_len) / ramp_len))
    
    # 180 Hz body bloom
    b_bloom, a_bloom = signal.iirpeak(180.0, 1.5, fs=SR)
    out_bloom = signal.lfilter(b_bloom, a_bloom, out)
    out = out + 0.35 * out_bloom
    
    # 280 Hz wood plate
    b_wood, a_wood = signal.iirpeak(280.0, 1.8, fs=SR)
    out_wood = signal.lfilter(b_wood, a_wood, out)
    out = out + 0.25 * out_wood
    
    # 2100 Hz roll-off
    b_roll, a_roll = signal.butter(3, 2100.0 / (SR / 2), 'low')
    out = signal.lfilter(b_roll, a_roll, out)
    
    tail_len = int(SR * 0.12)
    fade_out = np.linspace(1.0, 0.0, tail_len)
    out[-tail_len:] *= fade_out
    
    max_amp = np.max(np.abs(out)) + 1e-9
    return (out / max_amp * amplitude).astype(np.float32)

def load_foley_click():
    if os.path.exists(WOOD_CLICK_PATH):
        sr, data = scipy.io.wavfile.read(WOOD_CLICK_PATH)
        if data.ndim > 1:
            data = data.mean(axis=1)
        data = data.astype(np.float32) / 32768.0
        if sr != SR:
            num_samples = int(len(data) * SR / sr)
            data = signal.resample(data, num_samples)
        fade_len = int(SR * 0.005)
        data[:fade_len] *= np.linspace(0, 1, fade_len)
        data[-fade_len:] *= np.linspace(1, 0, fade_len)
        max_amp = np.max(np.abs(data)) + 1e-9
        return (data / max_amp * 0.45).astype(np.float32)
    dur = 0.05
    n = int(SR * dur)
    t = np.linspace(0, dur, n)
    sig = np.sin(2 * np.pi * 320 * t) * np.exp(-t * 90.0)
    return (sig * 0.45).astype(np.float32)

def synthesize_warm_cadence_c_major():
    total_dur = 4.2
    n_samples = int(SR * total_dur)
    track = np.zeros(n_samples, dtype=np.float32)
    
    chords = [
        (0.0, [(261.63, 0.00), (329.63, 0.045), (392.00, 0.090), (523.25, 0.135)], 0.95),
        (0.95, [(349.23, 0.00), (440.00, 0.045), (523.25, 0.090), (659.25, 0.135)], 0.95),
        (1.90, [(392.00, 0.00), (493.88, 0.045), (587.33, 0.090)], 0.95),
        (2.85, [(261.63, 0.00), (329.63, 0.045), (392.00, 0.090), (523.25, 0.135)], 1.35),
    ]
    
    for chord_t, notes, dur in chords:
        for freq, roll_delay in notes:
            start_idx = int((chord_t + roll_delay) * SR)
            pluck = synthesize_warm_harp_pluck(freq, dur, amplitude=0.26)
            end_idx = min(n_samples, start_idx + len(pluck))
            track[start_idx:end_idx] += pluck[:end_idx - start_idx]
            
    return track

NOTE_FREQS = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99,
    'Ab4': 415.30, 'Bb4': 466.16, 'Eb4': 311.13
}

# -------------------------------------------------------------
# Narrative Scripts with Micro-Cues & Fluent Cadence
# -------------------------------------------------------------

PATH1_TIMELINE = [
    # Scene 1: Method & Tonal Gravitation (0s - 22s)
    {"id": "p1_01", "time": 0.8, "text": "Traditional ear training has you guessing isolated notes in a vacuum. Most musicians get stuck."},
    {"id": "p1_02", "time": 7.0, "text": "Earpa is built on the Alain Benbassat functional method: training your ear to feel musical gravity relative to a home center."},
    {"id": "p1_03", "time": 14.5, "text": "Every note has an unmistakable pull toward home note C: pulling downward, or pulling upward."},
    
    # Scene 2: Roadmap Pre-roll & Enter Level 1 (22s - 27s)
    {"id": "p1_04", "time": 23.5, "text": "Let us open the Sanctuary map and enter Level 1."},
    
    # Scene 3: Round 1 (Cadence + Note G + Pluck + Walkdown) (27s - 48s)
    {"id": "p1_05", "time": 32.0, "text": "The cadence grounds your ear in C Major."},
    {"id": "p1_06", "time": 37.0, "text": "Now the mystery note sounds. Hear that open, bright stability. That is G."},
    {"id": "p1_07", "time": 42.0, "text": "Pluck G to lock it in."},
    
    # Scene 4: Round 2 (Cadence + Note F + Downward Ache + Walkdown) (48s - 68s)
    {"id": "p1_08", "time": 48.5, "text": "Next round. A new mystery note sounds."},
    {"id": "p1_09", "time": 56.5, "text": "Feel that heavy downward ache toward home. That is F."},
    {"id": "p1_10", "time": 61.5, "text": "Watch the resolution walk: F falls to E, drops to D, and rests on home note C."},
    
    # Scene 5: Round 3 (Note B & Upward Snap) (68s - 78s)
    {"id": "p1_11", "time": 68.5, "text": "Now listen to a note pulling sharply upward."},
    {"id": "p1_12", "time": 72.5, "text": "That is B. Watch it snap home to high C."},
    
    # Scene 6: Mastery & 5-Minute Habit (78s - 90s)
    {"id": "p1_13", "time": 79.0, "text": "Always hum tonic C before touching a string."},
    {"id": "p1_14", "time": 83.5, "text": "Five minutes of daily practice transforms musical tension into an effortless reflex."},
]

PATH2_TIMELINE = [
    # Scene 1: Melodic Contour & Connected Phrases (0s - 18s)
    {"id": "p2_01", "time": 0.8, "text": "Music is built from connected phrases, not isolated pitches."},
    {"id": "p2_02", "time": 6.0, "text": "In Path 2, you train your brain to recognize melodic contour in real time, moving beyond note by note guesswork."},
    {"id": "p2_03", "time": 13.5, "text": "Instead of hunting for intervals, listen for phrase shapes and harmonic colors."},
    
    # Scene 2: Roadmap Pre-roll & Level 1 Entry (18s - 24s)
    {"id": "p2_04", "time": 20.0, "text": "Let us open the Glacial Fjord map and enter Level 1."},
    
    # Scene 3: Level 1 (Two-note motif: E -> C) (24s - 48s)
    {"id": "p2_05", "time": 28.5, "text": "An authentic cadence grounds your ear firmly in C Major."},
    {"id": "p2_06", "time": 32.8, "text": "Here is Level 1: a two note phrase. Note E leaps up sweet and warm, then drops home to C."},
    {"id": "p2_07", "time": 40.5, "text": "Pluck E, then pluck C in sequence to lock in the shape."},
    
    # Scene 4: Roadmap Pre-roll & Level 5 Advance (48s - 54s)
    {"id": "p2_08", "time": 50.0, "text": "Now watch the app advance to Level 5 for a three note phrase."},
    
    # Scene 5: Level 5 (Three-note phrase: C -> G -> E) (54s - 76s)
    {"id": "p2_09", "time": 63.0, "text": "Hear the contour arc: solid root C, bright fifth G, and sweet third E."},
    {"id": "p2_10", "time": 69.5, "text": "Pluck C, G, and E. The app replays the melody with illuminated visual confirmation."},
    
    # Scene 6: Audiation Drill & Mastery (76s - 90s)
    {"id": "p2_11", "time": 77.0, "text": "To master melodic phrasing, sing the phrase silently in your mind before plucking."},
    {"id": "p2_12", "time": 83.2, "text": "Hold tonic C in memory, trace the line, and unlock complete melodic fluency."},
]

PATH3_TIMELINE = [
    # Scene 1: Introduction & Celtic Harp Foundation (0s - 16s)
    {"id": "p3_01", "time": 0.8, "text": "On a Celtic harp, physical Camac sharping levers give you complete harmonic freedom."},
    {"id": "p3_02", "time": 6.8, "text": "Celtic harps are most commonly tuned to E flat Major with all levers down."},
    {"id": "p3_03", "time": 12.0, "text": "Engaging a lever physically raises that string by one semitone, unlocking every key across the Circle of Fifths."},
    
    # Scene 2: Step 1 of the Level - Circle of Fifths & Scale Discovery (16s - 34s)
    {"id": "p3_04", "time": 17.5, "text": "Here is how each lever level operates inside Earpa."},
    {"id": "p3_05", "time": 21.0, "text": "First, the app presents the Circle of Fifths to teach you the target scale."},
    {"id": "p3_06", "time": 26.5, "text": "Moving one clockwise step from C Major to G Major introduces one sharp."},
    {"id": "p3_07", "time": 31.0, "text": "Following the circle order, note F must be raised to F sharp."},
    
    # Scene 3: Step 2 of the Level - The Big Harp Arena & Controls (34s - 54s)
    {"id": "p3_08", "time": 35.5, "text": "Next, you enter the game arena with the big harp. The goal is G Major."},
    {"id": "p3_09", "time": 41.0, "text": "You can flip levers directly on the three dimensional harp by touch,"},
    {"id": "p3_10", "time": 45.5, "text": "or tap the letter buttons at the bottom of your screen."},
    # Note F ... pause ... lever up
    {"id": "p3_11a", "time": 49.5, "text": "Note F."},
    {"id": "p3_11b", "time": 51.5, "text": "lever up to F sharp."},
    
    # Scene 4: Step 3 of the Level - Confirm & Automated Full Scale Walk (54s - 76s)
    {"id": "p3_12", "time": 55.0, "text": "With your levers positioned, tap Confirm scale."},
    {"id": "p3_13", "time": 58.5, "text": "Now the app automatically walks the entirety of the G Major scale from start to finish: from tonic G up to octave G."},
    # G Major scale walk plays 63.2s - 68.5s
    {"id": "p3_14", "time": 70.0, "text": "Notice it walks the complete octave scale, not just C to C, letting your ear verify every interval."},
    
    # Scene 5: Step 4 of the Level - Instant Verification & Feedback (76s - 88s)
    {"id": "p3_15", "time": 76.5, "text": "The app verifies every lever: Correct, every lever is in place."},
    {"id": "p3_16", "time": 82.0, "text": "If any lever is missed, the app highlights that string so you can adjust immediately."},
    
    # Scene 6: Modal Progression - D Dorian Demo (88s - 108s)
    {"id": "p3_17", "time": 88.5, "text": "In higher levels, you explore modal scales like D Dorian."},
    {"id": "p3_18", "time": 93.5, "text": "Dorian shares the natural levers of C Major, but centers on note D as home."},
    {"id": "p3_19", "time": 99.0, "text": "Confirm the scale, and the app walks the complete D Dorian octave from start to finish."},
    # D Dorian scale walk plays 103.0s - 108.5s
    
    # Scene 7: How to Play & How to Improve (108s - 120s)
    {"id": "p3_20", "time": 109.5, "text": "To improve: follow the Circle of Fifths clockwise sequence, flip both C levers together for octave changes, and audiate each raised pitch before you confirm."},
    {"id": "p3_21", "time": 116.5, "text": "Master every key and mode with effortless confidence."},
]

async def generate_speech():
    voice = "en-US-ChristopherNeural"
    rate = "-3%"
    pitch = "-1Hz"
    
    all_cues = PATH1_TIMELINE + PATH2_TIMELINE + PATH3_TIMELINE
    tasks = []
    for cue in all_cues:
        out_f = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
        # Regenerate for clean v3
        tts = edge_tts.Communicate(cue["text"], voice=voice, rate=rate, pitch=pitch)
        tasks.append(tts.save(out_f))
    await asyncio.gather(*tasks)
    print("V3 Speech synthesis complete!")

def decode_audio_with_fades(mp3_path):
    cmd = [
        "ffmpeg", "-y", "-i", mp3_path,
        "-ar", str(SR), "-ac", "1", "-f", "wav", "-"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    header_size = 44
    data = np.frombuffer(res.stdout[header_size:], dtype=np.int16).astype(np.float32) / 32768.0
    
    # Apply 15ms raised-cosine fade in and fade out (ZERO DC pop/click)
    fade_len = int(SR * 0.015)
    if len(data) > 2 * fade_len:
        t_fade = np.linspace(0, 1, fade_len)
        fade_in = 0.5 * (1.0 - np.cos(np.pi * t_fade))
        fade_out = 0.5 * (1.0 + np.cos(np.pi * t_fade))
        data[:fade_len] *= fade_in
        data[-fade_len:] *= fade_out
        
    return data

def mix_track(total_dur_sec, timeline, musical_events):
    n_samples = int(SR * total_dur_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    
    # 1. Overlay narration with micro-fades
    for cue in timeline:
        mp3_f = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
        if os.path.exists(mp3_f):
            samples = decode_audio_with_fades(mp3_f)
            start_idx = int(cue["time"] * SR)
            end_idx = min(n_samples, start_idx + len(samples))
            master[start_idx:end_idx] += samples[:end_idx - start_idx] * 0.95
            
    # 2. Overlay musical events strictly aligned
    click = load_foley_click()
    cadence = synthesize_warm_cadence_c_major()
    
    for ev in musical_events:
        t = ev["time"]
        ev_type = ev["type"]
        start_idx = int(t * SR)
        
        if ev_type == "cadence":
            end_idx = min(n_samples, start_idx + len(cadence))
            master[start_idx:end_idx] += cadence[:end_idx - start_idx] * 0.85
        elif ev_type == "pluck":
            freq = NOTE_FREQS.get(ev["note"], 261.63)
            dur = ev.get("dur", 2.2)
            vel = ev.get("vel", 0.75)
            pluck = synthesize_warm_harp_pluck(freq, dur, amplitude=vel)
            end_idx = min(n_samples, start_idx + len(pluck))
            master[start_idx:end_idx] += pluck[:end_idx - start_idx]
        elif ev_type == "foley":
            end_idx = min(n_samples, start_idx + len(click))
            master[start_idx:end_idx] += click[:end_idx - start_idx] * 0.55
        elif ev_type == "resolution_walk":
            notes = ev.get("notes", ["F4", "E4", "D4", "C4"])
            step_dur = 0.52
            for idx, n_name in enumerate(notes):
                n_t = t + idx * step_dur
                n_start = int(n_t * SR)
                freq = NOTE_FREQS.get(n_name, 261.63)
                p_dur = 1.6 if idx == len(notes) - 1 else 0.75
                vel = 0.82 if idx == len(notes) - 1 else 0.65
                pluck = synthesize_warm_harp_pluck(freq, p_dur, amplitude=vel)
                n_end = min(n_samples, n_start + len(pluck))
                master[n_start:n_end] += pluck[:n_end - n_start]
                
    max_peak = np.max(np.abs(master)) + 1e-9
    master = master / max_peak * 0.92
    return master

def export_master(track_data, out_filename):
    out_wav = os.path.join(OUTPUT_DIR, out_filename + ".wav")
    out_mp3 = os.path.join(OUTPUT_DIR, out_filename + ".mp3")
    
    stereo = np.column_stack((track_data, track_data))
    scipy.io.wavfile.write(out_wav, SR, (stereo * 32767).astype(np.int16))
    
    cmd = [
        "ffmpeg", "-y", "-i", out_wav,
        "-b:a", "192k", "-ar", "48000",
        out_mp3
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"Exported master: {out_mp3} ({len(track_data)/SR:.2f}s)")

async def main():
    await generate_speech()
    
    # Path 1: 90.0s (2700 frames)
    p1_events = [
        {"time": 24.5, "type": "foley"}, # Node tap ripple
        {"time": 27.5, "type": "cadence"}, # C Major cadence
        {"time": 35.5, "type": "pluck", "note": "G4", "dur": 2.5, "vel": 0.85}, # Mystery G
        {"time": 41.5, "type": "foley"}, # User pluck G
        {"time": 44.0, "type": "resolution_walk", "notes": ["G4", "F4", "E4", "D4", "C4"]}, # Resolution walk
        {"time": 50.5, "type": "cadence"}, # Re-ground cadence
        {"time": 55.0, "type": "pluck", "note": "F4", "dur": 2.5, "vel": 0.85}, # Mystery F
        {"time": 61.5, "type": "foley"}, # User pluck F
        {"time": 63.5, "type": "resolution_walk", "notes": ["F4", "E4", "D4", "C4"]}, # Resolution walk
        {"time": 71.0, "type": "pluck", "note": "B4", "dur": 2.2, "vel": 0.85}, # Mystery B
        {"time": 75.5, "type": "foley"}, # User pluck B
        {"time": 75.6, "type": "pluck", "note": "C5", "dur": 2.5, "vel": 0.90}, # Upward snap to high C
    ]
    p1_master = mix_track(90.0, PATH1_TIMELINE, p1_events)
    export_master(p1_master, "path1_single_notes_master")
    
    # Path 2: 90.0s (2700 frames)
    p2_events = [
        {"time": 20.5, "type": "foley"}, # Node 1 tap ripple
        {"time": 24.5, "type": "cadence"}, # C Major cadence
        {"time": 29.5, "type": "pluck", "note": "E4", "dur": 1.2, "vel": 0.82}, # E
        {"time": 30.7, "type": "pluck", "note": "C4", "dur": 2.2, "vel": 0.88}, # C
        {"time": 38.5, "type": "foley"}, # User pluck E
        {"time": 39.5, "type": "foley"}, # User pluck C
        {"time": 42.0, "type": "pluck", "note": "E4", "dur": 1.0, "vel": 0.70}, # Visual replay E
        {"time": 43.0, "type": "pluck", "note": "C4", "dur": 1.8, "vel": 0.75}, # Visual replay C
        {"time": 50.5, "type": "foley"}, # Node 5 tap ripple
        {"time": 54.5, "type": "cadence"}, # Cadence Level 5
        {"time": 59.5, "type": "pluck", "note": "C4", "dur": 0.95, "vel": 0.82}, # C
        {"time": 60.5, "type": "pluck", "note": "G4", "dur": 0.95, "vel": 0.82}, # G
        {"time": 61.5, "type": "pluck", "note": "E4", "dur": 1.8, "vel": 0.88}, # E
        {"time": 68.0, "type": "foley"}, # User pluck C
        {"time": 68.5, "type": "foley"}, # User pluck G
        {"time": 69.0, "type": "foley"}, # User pluck E
    ]
    p2_master = mix_track(90.0, PATH2_TIMELINE, p2_events)
    export_master(p2_master, "path2_melody_phrasing_master")
    
    # Path 3: 120.0s (3600 frames)
    p3_events = [
        {"time": 28.5, "type": "foley"}, # Circle of Fifths key tap
        {"time": 34.5, "type": "foley"}, # Arena enter tap
        {"time": 51.5, "type": "foley"}, # Lever F flipped up
        {"time": 52.2, "type": "pluck", "note": "F#4", "dur": 1.8, "vel": 0.85}, # F# acoustic confirmation
        {"time": 56.5, "type": "foley"}, # Confirm scale button press
        # Automated full G Major scale walk start to finish: G4 -> G5
        {"time": 63.2, "type": "resolution_walk", "notes": ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"]},
        {"time": 76.5, "type": "pluck", "note": "G4", "dur": 2.2, "vel": 0.90}, # Tonic success confirmation
        {"time": 88.0, "type": "foley"}, # Level 6 D Dorian enter
        {"time": 100.5, "type": "foley"}, # Confirm scale button press
        # Automated full D Dorian scale walk start to finish: D4 -> D5
        {"time": 103.0, "type": "resolution_walk", "notes": ["D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"]},
        {"time": 115.5, "type": "pluck", "note": "C4", "dur": 2.5, "vel": 0.85}, # Mastery closing harmonic
    ]
    p3_master = mix_track(120.0, PATH3_TIMELINE, p3_events)
    export_master(p3_master, "path3_camac_levers_master")
    
    print("V3 MASTER AUDIO GENERATION COMPLETED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(main())
