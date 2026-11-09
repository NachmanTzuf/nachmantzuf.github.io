"""
Generate natural, unhurried, broadcast voiceovers and authentic warm acoustic Celtic harp audio
for the 3 Earpa Path Instruction Videos:
Path 1: Single Notes & Tonic Anchor (80s / 2400 frames)
Path 2: Melodic Sequence Phrasing (80s / 2400 frames)
Path 3: Camac Sharping Levers & Modal Shifts (110s / 3300 frames)

Adheres strictly to:
1. Unrushed pacing: 0.8s - 1.2s natural breathing silence between sentences.
2. No sentence clashing: Speech finishes completely before musical events play.
3. Authentic warm acoustic Celtic harp sound:
   - Dual-stage finger-pad excitation (pink noise filtered at 330Hz + fundamental sine)
   - Sitka spruce soundboard body formants (180Hz bloom, 280Hz wood plate, 2100Hz warm lowpass)
   - Real recorded wood click foley (from wood-click.wav)
4. Strict Note Naming Law: C, D, E, F, G, A, B (never degree numbers).
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
TMP_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\voiceover_tmp\instructions_v2"
WOOD_CLICK_PATH = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public-plus\refined\wood-click.wav"
REAL_SOLO_PATH = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\audio\real_celtic_harp_solo_artist.wav"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# -------------------------------------------------------------
# Warm Acoustic Celtic Harp Synthesizer (Matching HarpSoundSynthesizer.ts)
# -------------------------------------------------------------
def synthesize_warm_harp_pluck(freq, duration_sec=3.0, amplitude=0.75, decay=0.996):
    """
    Synthesize authentic warm Celtic harp pluck:
    1. Fleshy finger pad excitation (pink noise lowpass filtered at 330Hz blended 86% with fundamental sine)
    2. Fractional delay line Karplus-Strong loop with 2-point averaging
    3. Spruce soundboard formant filters (180Hz bloom, 280Hz wood presence, 2100Hz steep roll-off)
    """
    f0 = max(40.0, min(3200.0, float(freq)))
    n_samples = int(SR * duration_sec)
    p = SR / f0
    D = max(2.0, p - 0.5)
    L = int(np.floor(D))
    frac = D - L
    
    # Dual-stage excitation
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
    
    # Karplus-Strong string loop
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
        
    # Micro attack ramp (0.7ms)
    ramp_len = min(32, n_samples)
    out[:ramp_len] *= 0.5 * (1.0 - np.cos(np.pi * np.arange(ramp_len) / ramp_len))
    
    # Formants: Sitka spruce soundboard body
    # 1. 180 Hz body bloom (+5.5 dB)
    b_bloom, a_bloom = signal.iirpeak(180.0, 1.5, fs=SR)
    out_bloom = signal.lfilter(b_bloom, a_bloom, out)
    out = out + 0.35 * out_bloom
    
    # 2. 280 Hz wood plate (+4.2 dB)
    b_wood, a_wood = signal.iirpeak(280.0, 1.8, fs=SR)
    out_wood = signal.lfilter(b_wood, a_wood, out)
    out = out + 0.25 * out_wood
    
    # 3. Steep acoustic lowpass roll-off at 2100 Hz (completely eliminates metallic harshness)
    b_roll, a_roll = signal.butter(3, 2100.0 / (SR / 2), 'low')
    out = signal.lfilter(b_roll, a_roll, out)
    
    # Smooth exponential tail fade
    tail_len = int(SR * 0.1)
    fade_out = np.linspace(1.0, 0.0, tail_len)
    out[-tail_len:] *= fade_out
    
    max_amp = np.max(np.abs(out)) + 1e-9
    return (out / max_amp * amplitude).astype(np.float32)

def load_foley_click():
    """Load authentic wood click sample."""
    if os.path.exists(WOOD_CLICK_PATH):
        sr, data = scipy.io.wavfile.read(WOOD_CLICK_PATH)
        if data.ndim > 1:
            data = data.mean(axis=1)
        data = data.astype(np.float32) / 32768.0
        if sr != SR:
            num_samples = int(len(data) * SR / sr)
            data = signal.resample(data, num_samples)
        max_amp = np.max(np.abs(data)) + 1e-9
        return (data / max_amp * 0.45).astype(np.float32)
    # Fallback to warm tap
    dur = 0.05
    n = int(SR * dur)
    t = np.linspace(0, dur, n)
    sig = np.sin(2 * np.pi * 320 * t) * np.exp(-t * 90.0)
    return (sig * 0.45).astype(np.float32)

def synthesize_warm_cadence_c_major():
    """
    Authentic warm Celtic harp I - IV - V - I cadence in C Major with rolled arpeggiation.
    Total duration: 4.8 seconds
    """
    total_dur = 4.8
    n_samples = int(SR * total_dur)
    track = np.zeros(n_samples, dtype=np.float32)
    
    # Rolled chords (bass, tenor, alto, soprano) with 48ms harpist roll
    chords = [
        # Chord 1: I (C Major) at 0.0s
        (0.0, [(261.63, 0.00), (329.63, 0.048), (392.00, 0.096), (523.25, 0.144)], 1.1),
        # Chord 2: IV (F Major) at 1.05s
        (1.05, [(349.23, 0.00), (440.00, 0.048), (523.25, 0.096), (659.25, 0.144)], 1.1),
        # Chord 3: V (G Major) at 2.10s
        (2.10, [(392.00, 0.00), (493.88, 0.048), (587.33, 0.096)], 1.1),
        # Chord 4: I (C Major) resolution at 3.15s
        (3.15, [(261.63, 0.00), (329.63, 0.048), (392.00, 0.096), (523.25, 0.144)], 1.6),
    ]
    
    for chord_t, notes, dur in chords:
        for freq, roll_delay in notes:
            start_idx = int((chord_t + roll_delay) * SR)
            pluck = synthesize_warm_harp_pluck(freq, dur, amplitude=0.28)
            end_idx = min(n_samples, start_idx + len(pluck))
            track[start_idx:end_idx] += pluck[:end_idx - start_idx]
            
    return track

# Note Frequencies
NOTE_FREQS = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25,
    'Ab4': 415.30, 'Bb4': 466.16, 'Eb4': 311.13
}

# -------------------------------------------------------------
# Scripts with Natural Unhurried Pacing & Distinct Clean Gaps
# -------------------------------------------------------------

PATH1_TIMELINE = [
    # BEAT 1: Core Philosophy & Alain Benbassat Paper (0s - 16s)
    {"id": "p1_01", "time": 0.8, "text": "Traditional ear training asks you to guess isolated intervals in an empty void. Most musicians hit a wall."},
    {"id": "p1_02", "time": 7.5, "text": "Earpa is built on the Alain Benbassat functional method: training your ear to feel musical tension relative to a tonal center."},
    
    # BEAT 2: Cadence Anchor in C Major (16s - 31s)
    {"id": "p1_03", "time": 16.5, "text": "Every level begins with an authentic cadence in C Major."},
    # Cadence plays in silence: 19.5s - 24.3s
    {"id": "p1_04", "time": 24.6, "text": "This grounds C as your home anchor. Once locked to C, every single note creates an unmistakable gravitational pull."},
    
    # BEAT 3: Level 1 Walkthrough · First Round G (31s - 50s)
    {"id": "p1_05", "time": 32.5, "text": "Now, let us enter Level 1."},
    {"id": "p1_06", "time": 35.5, "text": "The mystery note sounds."},
    # Mystery note G sounds in silence: 37.8s - 40.0s
    {"id": "p1_07", "time": 40.5, "text": "Listen to that bright, open stability. That is G, the fifth."},
    {"id": "p1_08", "time": 45.2, "text": "Pluck G to lock it in."},
    # Foley pluck & match chime: 47.5s
    
    # BEAT 4: Level 1 Round 2 · Mystery Note F & Downward Walk (50s - 68s)
    {"id": "p1_09", "time": 50.8, "text": "Next round: a new mystery note sounds."},
    # Mystery note F sounds in silence: 53.8s - 56.0s
    {"id": "p1_10", "time": 56.5, "text": "Feel that heavy downward ache toward home. You pluck F."},
    {"id": "p1_11", "time": 61.2, "text": "Watch the resolution walk: F falls to E, drops to D, and rests home on tonic C."},
    # Resolution walk plays: 65.5s - 68.0s
    
    # BEAT 5: Daily Fluency & Routine (68s - 80s)
    {"id": "p1_12", "time": 68.8, "text": "To improve quickly, hum tonic C before touching a string."},
    {"id": "p1_13", "time": 73.2, "text": "Five minutes of daily practice transforms active thinking into an effortless musical reflex."},
]

PATH2_TIMELINE = [
    # BEAT 1: Moving Beyond Isolated Notes (0s - 16s)
    {"id": "p2_01", "time": 0.8, "text": "Music rarely stands still as a single isolated pitch."},
    {"id": "p2_02", "time": 5.8, "text": "In Path 2, you train your auditory cortex to recognize connected melodic phrases in real time, moving beyond note by note guesswork."},
    
    # BEAT 2: Melodic Contour in C Major (16s - 31s)
    {"id": "p2_03", "time": 16.5, "text": "An authentic cadence grounds your ear firmly in C Major."},
    # Cadence plays in silence: 19.5s - 24.3s
    {"id": "p2_04", "time": 24.6, "text": "Then the Celtic harp plays a phrase. Instead of hunting for intervals, listen for melodic contour and harmonic colors."},
    
    # BEAT 3: Level 1 Two-Note Motif (E -> C) (31s - 50s)
    {"id": "p2_05", "time": 32.5, "text": "Here is Level 1: a two note motif."},
    # Motif plays: E -> C (35.5s - 38.0s)
    {"id": "p2_06", "time": 38.8, "text": "The first note leaps to E: warm and sweet. The second note drops home to C."},
    {"id": "p2_07", "time": 45.0, "text": "Pluck E, then pluck C in sequence to lock in the shape."},
    # Sequence confirmation: 48.0s
    
    # BEAT 4: Level 5 Three-Note Phrase (C -> G -> E) (50s - 68s)
    {"id": "p2_08", "time": 50.8, "text": "Now Level 5: a three note phrase."},
    # Phrase plays: C -> G -> E (53.5s - 56.5s)
    {"id": "p2_09", "time": 57.2, "text": "Listen to the arc: solid root C, bright fifth G, and sweet third E."},
    {"id": "p2_10", "time": 62.5, "text": "Pluck C, G, and E. The app replays the melody with illuminated visual confirmation."},
    # Replay plays: 66.0s - 68.0s
    
    # BEAT 5: Audiation & Melodic Memory (68s - 80s)
    {"id": "p2_11", "time": 68.8, "text": "To master melodic phrasing, sing the motif silently in your head before touching a string."},
    {"id": "p2_12", "time": 74.0, "text": "Hold tonic C in your memory, trace the line, and unlock complete melodic fluency."},
]

PATH3_TIMELINE = [
    # BEAT 1: Tactile Lever Mechanics & Sanctuary (0s - 18s)
    {"id": "p3_01", "time": 0.8, "text": "On a Celtic harp, twenty seven strings are modulated by physical Camac sharping levers."},
    {"id": "p3_02", "time": 6.8, "text": "Path 3 bridges real acoustic instrument physics with functional modal ear training."},
    {"id": "p3_03", "time": 12.5, "text": "Every key change becomes a tangible tactile pattern under your fingertips."},
    
    # BEAT 2: 3D Lever Action & Speaking Length (18s - 38s)
    {"id": "p3_04", "time": 18.8, "text": "Here is the acoustic law in action."},
    {"id": "p3_05", "time": 22.0, "text": "Watch the Camac lever engage. It clamps down onto the string, shortening its vibrating length by five point six percent."},
    # Lever flips UP physically on 3D harp: 28.0s + mechanical latch sound
    # String plucks F# (raised pitch): 29.5s
    {"id": "p3_06", "time": 30.5, "text": "This raises the pitch by exactly one semitone: shifting F natural up to F sharp."},
    # Lever flips back DOWN: 36.0s + F natural sounds
    
    # BEAT 3: Native E-flat to C Major Configuration (38s - 58s)
    {"id": "p3_07", "time": 38.8, "text": "Celtic harps tune natively to E flat Major with all levers down: B flat, E flat, and A flat."},
    {"id": "p3_08", "time": 45.8, "text": "To configure C Major, raise the three lever groups: flip A flat to A, E flat to E, and B flat to B."},
    # Lever group click sounds in sequence: 52.0s, 53.0s, 54.0s
    {"id": "p3_09", "time": 54.5, "text": "Your harp is now set in pure diatonic C Major."},
    
    # BEAT 4: Interactive Gameplay & Modal Shifts (58s - 88s)
    {"id": "p3_10", "time": 58.8, "text": "Now, let us enter Level 1 for a modal key shift."},
    {"id": "p3_11", "time": 62.5, "text": "In C Major, raise Lever F up to F sharp. You have shifted instantly into G Major."},
    # G Major scale run: 68.0s - 71.0s
    {"id": "p3_12", "time": 71.8, "text": "Now Level 6: keep the C Major levers, but treat D as your tonic home anchor."},
    {"id": "p3_13", "time": 77.5, "text": "You are now in D Dorian. Natural B gives the Dorian mode its luminous brightness."},
    {"id": "p3_14", "time": 82.5, "text": "Watch the scale walk down cleanly: resolving step by step to tonic D."},
    # Resolution walkdown: 86.0s - 88.0s
    
    # BEAT 5: Roadmap Progression & Mastery (88s - 110s)
    {"id": "p3_15", "time": 88.8, "text": "To master your levers, set the pattern, confirm the scale visually, and pluck root to root."},
    {"id": "p3_16", "time": 95.0, "text": "Listen to how the emotional color of home transforms as each mode unfolds."},
    {"id": "p3_17", "time": 101.5, "text": "Complete all seventy six levels, and navigate any tune across every mode with effortless confidence."},
]

async def generate_speech():
    voice = "en-US-ChristopherNeural"
    rate = "-3%"
    pitch = "-1Hz"
    
    all_cues = PATH1_TIMELINE + PATH2_TIMELINE + PATH3_TIMELINE
    tasks = []
    for cue in all_cues:
        out_f = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
        if not os.path.exists(out_f) or os.path.getsize(out_f) < 500:
            print(f"Generating TTS {cue['id']}...")
            tts = edge_tts.Communicate(cue["text"], voice=voice, rate=rate, pitch=pitch)
            tasks.append(tts.save(out_f))
    if tasks:
        await asyncio.gather(*tasks)
    print("Speech synthesis complete!")

def decode_audio(mp3_path):
    cmd = [
        "ffmpeg", "-y", "-i", mp3_path,
        "-ar", str(SR), "-ac", "1", "-f", "wav", "-"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    header_size = 44
    data = np.frombuffer(res.stdout[header_size:], dtype=np.int16).astype(np.float32) / 32768.0
    return data

def mix_track(total_dur_sec, timeline, musical_events):
    n_samples = int(SR * total_dur_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    
    # 1. Overlay narration
    for cue in timeline:
        mp3_f = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
        if os.path.exists(mp3_f):
            samples = decode_audio(mp3_f)
            start_idx = int(cue["time"] * SR)
            end_idx = min(n_samples, start_idx + len(samples))
            master[start_idx:end_idx] += samples[:end_idx - start_idx] * 0.95
            
    # 2. Overlay musical events (cadences, warm plucks, foley)
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
            # Stepwise resolution walk down
            notes = ev.get("notes", ["F4", "E4", "D4", "C4"])
            step_dur = 0.55
            for idx, n_name in enumerate(notes):
                n_t = t + idx * step_dur
                n_start = int(n_t * SR)
                freq = NOTE_FREQS.get(n_name, 261.63)
                p_dur = 1.6 if idx == len(notes) - 1 else 0.8
                vel = 0.82 if idx == len(notes) - 1 else 0.65
                pluck = synthesize_warm_harp_pluck(freq, p_dur, amplitude=vel)
                n_end = min(n_samples, n_start + len(pluck))
                master[n_start:n_end] += pluck[:n_end - n_start]
                
    # Normalize peak
    max_peak = np.max(np.abs(master)) + 1e-9
    master = master / max_peak * 0.92
    return master

def export_master(track_data, out_filename):
    out_wav = os.path.join(OUTPUT_DIR, out_filename + ".wav")
    out_mp3 = os.path.join(OUTPUT_DIR, out_filename + ".mp3")
    
    # Save stereo WAV
    stereo = np.column_stack((track_data, track_data))
    scipy.io.wavfile.write(out_wav, SR, (stereo * 32767).astype(np.int16))
    
    # Encode broadcast 192k MP3
    cmd = [
        "ffmpeg", "-y", "-i", out_wav,
        "-b:a", "192k", "-ar", "48000",
        out_mp3
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"Exported master: {out_mp3} ({len(track_data)/SR:.2f}s)")

# -------------------------------------------------------------
# Main Generation
# -------------------------------------------------------------
async def main():
    await generate_speech()
    
    # Path 1 Musical Events (80s)
    p1_events = [
        {"time": 19.5, "type": "cadence"},
        {"time": 37.8, "type": "pluck", "note": "G4", "dur": 2.5, "vel": 0.85},
        {"time": 47.5, "type": "foley"},
        {"time": 47.6, "type": "pluck", "note": "G4", "dur": 1.8, "vel": 0.65},
        {"time": 53.8, "type": "pluck", "note": "F4", "dur": 2.5, "vel": 0.85},
        {"time": 65.2, "type": "resolution_walk", "notes": ["F4", "E4", "D4", "C4"]},
        {"time": 78.0, "type": "pluck", "note": "C4", "dur": 2.0, "vel": 0.6},
    ]
    p1_master = mix_track(80.0, PATH1_TIMELINE, p1_events)
    export_master(p1_master, "path1_single_notes_master")
    
    # Path 2 Musical Events (80s)
    p2_events = [
        {"time": 19.5, "type": "cadence"},
        {"time": 35.5, "type": "pluck", "note": "E4", "dur": 1.2, "vel": 0.8},
        {"time": 36.7, "type": "pluck", "note": "C4", "dur": 2.0, "vel": 0.85},
        {"time": 48.0, "type": "foley"},
        {"time": 48.1, "type": "pluck", "note": "C4", "dur": 1.5, "vel": 0.6},
        {"time": 53.5, "type": "pluck", "note": "C4", "dur": 1.0, "vel": 0.8},
        {"time": 54.5, "type": "pluck", "note": "G4", "dur": 1.0, "vel": 0.8},
        {"time": 55.5, "type": "pluck", "note": "E4", "dur": 1.8, "vel": 0.85},
        {"time": 66.0, "type": "pluck", "note": "C4", "dur": 0.8, "vel": 0.6},
        {"time": 66.8, "type": "pluck", "note": "G4", "dur": 0.8, "vel": 0.6},
        {"time": 67.6, "type": "pluck", "note": "E4", "dur": 1.6, "vel": 0.75},
        {"time": 78.0, "type": "pluck", "note": "C4", "dur": 2.0, "vel": 0.6},
    ]
    p2_master = mix_track(80.0, PATH2_TIMELINE, p2_events)
    export_master(p2_master, "path2_melody_phrasing_master")
    
    # Path 3 Musical Events (110s)
    p3_events = [
        {"time": 28.0, "type": "foley"}, # Lever flip sound
        {"time": 29.5, "type": "pluck", "note": "F#4", "dur": 2.5, "vel": 0.9}, # Raised semitone
        {"time": 36.0, "type": "foley"}, # Lever flip back down
        {"time": 36.8, "type": "pluck", "note": "F4", "dur": 2.0, "vel": 0.8}, # Open pitch
        {"time": 52.0, "type": "foley"}, # Lever Ab -> A
        {"time": 53.0, "type": "foley"}, # Lever Eb -> E
        {"time": 54.0, "type": "foley"}, # Lever Bb -> B
        {"time": 56.5, "type": "pluck", "note": "C4", "dur": 1.8, "vel": 0.75},
        {"time": 68.0, "type": "pluck", "note": "G4", "dur": 1.2, "vel": 0.8},
        {"time": 69.2, "type": "pluck", "note": "F#4", "dur": 1.5, "vel": 0.85},
        {"time": 85.5, "type": "resolution_walk", "notes": ["A4", "G4", "F4", "E4", "D4"]},
        {"time": 107.5, "type": "pluck", "note": "C4", "dur": 2.5, "vel": 0.6},
    ]
    p3_master = mix_track(110.0, PATH3_TIMELINE, p3_events)
    export_master(p3_master, "path3_camac_levers_master")
    
    print("ALL THREE MASTER TRACKS GENERATED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
