"""
Generate professional broadcast voiceover and authentic Karplus-Strong physical harp audio
for the 3 Earpa Path Instruction Videos:
Path 1: Single Notes & Tonic Anchor (60s / 1800 frames)
Path 2: Melodic Sequence Phrasing (60s / 1800 frames)
Path 3: Camac Sharping Levers & Modal Shifts (90s / 2700 frames)

Adheres strictly to the Note Naming Law: C, D, E, F, G, A, B (never degree numbers).
"""

import asyncio
import os
import subprocess
import edge_tts
import numpy as np
import scipy.io.wavfile

SR = 48000

# Base output paths
OUTPUT_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\public\audio\instructions"
TMP_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\voiceover_tmp\instructions"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# -------------------------------------------------------------
# Karplus-Strong Acoustic Celtic Harp Synthesizer
# -------------------------------------------------------------
def synthesize_harp_pluck(freq, duration_sec, amplitude=0.7, decay=0.993, brightness=0.5):
    """
    Physical plucked string model (Karplus-Strong) tuned for Celtic nylon/gut harp.
    """
    period = int(round(SR / freq))
    n_samples = int(SR * duration_sec)
    
    # Noise burst excitation
    rng = np.random.RandomState(int(freq * 100) % 10000)
    noise = rng.uniform(-1.0, 1.0, period)
    # Smooth initial excitation for nylon warmth
    noise = np.convolve(noise, [0.2, 0.6, 0.2], mode='same')
    
    buf = np.zeros(n_samples, dtype=np.float32)
    ring_buf = noise.copy()
    
    # Karplus-Strong loop with averaging filter
    idx = 0
    prev = 0.0
    for i in range(n_samples):
        val = ring_buf[idx]
        buf[i] = val
        # Lowpass filter in feedback loop
        filtered = brightness * val + (1.0 - brightness) * prev
        ring_buf[idx] = filtered * decay
        prev = val
        idx = (idx + 1) % period
        
    # Soundboard body resonance impulse (Sitka spruce simulation)
    # Add gentle body warmth around 180 Hz and 340 Hz
    t = np.linspace(0, duration_sec, n_samples)
    body = 0.12 * np.sin(2 * np.pi * 185 * t) * np.exp(-t * 6.0) + \
           0.08 * np.sin(2 * np.pi * 340 * t) * np.exp(-t * 8.0)
    
    combined = buf + body * np.max(buf)
    # Normalize and envelope fadeout
    fade_len = int(SR * 0.05)
    fade_out = np.linspace(1.0, 0.0, fade_len)
    combined[-fade_len:] *= fade_out
    
    max_amp = np.max(np.abs(combined)) + 1e-9
    return (combined / max_amp * amplitude).astype(np.float32)

def synthesize_foley_click(click_type="wood"):
    """Synthesize high-tech tactile clicks/detents."""
    dur = 0.06
    n = int(SR * dur)
    t = np.linspace(0, dur, n)
    if click_type == "wood":
        signal = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 80.0)
    elif click_type == "glass":
        signal = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120.0) + 0.3 * np.sin(2 * np.pi * 4800 * t) * np.exp(-t * 160.0)
    elif click_type == "silicone":
        signal = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 40.0)
    elif click_type == "lever":
        # Metallic latch sound
        sig1 = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90.0)
        sig2 = np.zeros(n)
        offset = int(SR * 0.015)
        sig2[offset:] = np.sin(2 * np.pi * 920 * t[:-offset]) * np.exp(-t[:-offset] * 70.0)
        signal = sig1 + 0.8 * sig2
    else:
        signal = np.sin(2 * np.pi * 440 * t) * np.exp(-t * 50.0)
    
    max_amp = np.max(np.abs(signal)) + 1e-9
    return (signal / max_amp * 0.35).astype(np.float32)

def synthesize_cadence_c_major():
    """
    Synthesize I - IV - V - I authentic cadence in C Major.
    Total duration: ~3.8 seconds
    """
    total_dur = 4.2
    n_samples = int(SR * total_dur)
    track = np.zeros(n_samples, dtype=np.float32)
    
    # Chord frequencies
    # I: C4 (261.63), E4 (329.63), G4 (392.00)
    # IV: F4 (349.23), A4 (440.00), C5 (523.25)
    # V: G4 (392.00), B4 (493.88), D5 (587.33)
    # I: C4 (261.63), E4 (329.63), G4 (392.00), C5 (523.25)
    
    chords = [
        (0.0, [261.63, 329.63, 392.00], 0.9),
        (0.85, [349.23, 440.00, 523.25], 0.9),
        (1.70, [392.00, 493.88, 587.33], 0.9),
        (2.55, [261.63, 329.63, 392.00, 523.25], 1.6),
    ]
    
    for start_t, freqs, dur in chords:
        start_idx = int(start_t * SR)
        for f in freqs:
            pluck = synthesize_harp_pluck(f, dur, amplitude=0.22)
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
# Script Definitions
# -------------------------------------------------------------
PATH1_SCRIPT = [
    {
        "id": "p1_b0",
        "start_sec": 0.5,
        "text": "Traditional ear training asks you to guess isolated intervals in a void. Earpa is built on the Alain Benbassat functional method: training your ear to feel musical tension relative to a tonal center."
    },
    {
        "id": "p1_b1",
        "start_sec": 10.5,
        "text": "Every level begins with an authentic cadence in C Major. This cadence establishes C as your home anchor. Once grounded, every single note has an unmistakable gravitational pull toward C."
    },
    {
        "id": "p1_b2",
        "start_sec": 22.5,
        "text": "Let us walk through Level 1. The cadence plays. Now the mystery note sounds. Listen closely: it rings open and bright. That is G, the fifth. Pluck G to lock it in. Immediate confirmation."
    },
    {
        "id": "p1_b3",
        "start_sec": 36.5,
        "text": "Next round: the mystery note sounds again. Feel that heavy downward ache. You pluck F. Watch the resolution walk: F resolves down through E, down through D, and locks home into C."
    },
    {
        "id": "p1_b4",
        "start_sec": 49.5,
        "text": "To improve quickly, hum the tonic note C before plucking. Feel the magnetic pull of B pulling up to C, or F falling to E. Five minutes of daily practice transforms your ear into a reflex."
    }
]

PATH2_SCRIPT = [
    {
        "id": "p2_b0",
        "start_sec": 0.5,
        "text": "Music rarely stands still as a single note. In Path 2, you train your brain to recognize connected melodic phrases in real time, moving beyond note by note guesswork."
    },
    {
        "id": "p2_b1",
        "start_sec": 10.5,
        "text": "The cadence grounds your ear in C Major. Then the Celtic harp plays a phrase of two, three, or four notes. Instead of hunting for intervals, listen for melodic contour and harmonic colors."
    },
    {
        "id": "p2_b2",
        "start_sec": 22.5,
        "text": "Here is Level 1. A two note motif sounds. First note leaps to E: warm and sweet. Second note drops home to C. Pluck E, then pluck C in sequence. Clean blue feedback confirms the shape."
    },
    {
        "id": "p2_b3",
        "start_sec": 36.5,
        "text": "Now Level 5: a three note phrase. Listen to the arc: C, then G, then E. You hear the solid root C, the bright fifth G, and the resolving third E. Pluck C, G, E. The app replays the melody with illuminated strings."
    },
    {
        "id": "p2_b4",
        "start_sec": 49.5,
        "text": "To master melodic phrasing, sing the motif in your head before touching a string. Hold tonic C in your memory, trace the line, and unlock complete melodic fluency."
    }
]

PATH3_SCRIPT = [
    {
        "id": "p3_b0",
        "start_sec": 0.5,
        "text": "On a Celtic lever harp, twenty seven strings are modulated by physical Camac sharping levers. Path 3 bridges tactile harp mechanics with functional modal ear training."
    },
    {
        "id": "p3_b1",
        "start_sec": 15.0,
        "text": "Here is the acoustic law. Engaging a Camac lever shortens the vibrating string by five point six percent, raising its pitch by exactly one semitone. Lever down is open pitch; lever up is raised pitch."
    },
    {
        "id": "p3_b2",
        "start_sec": 30.5,
        "text": "Celtic harps tune natively to E flat Major with all levers down: B flat, E flat, and A flat. To configure C Major, raise the three lever groups: raise A flat to A, E flat to E, and B flat to B. Every musical key becomes a physical pattern on your harp neck."
    },
    {
        "id": "p3_b3",
        "start_sec": 51.0,
        "text": "Let us walk through a key change in Level 1. In C Major, raise Lever F up. The string shifts from F to F sharp. Pluck the scale: you have shifted instantly into G Major. In Level 6, keep the C Major levers, but treat D as your tonic center: you are now playing in D Dorian, with natural B giving the Dorian mode its luminous brightness."
    },
    {
        "id": "p3_b4",
        "start_sec": 71.5,
        "text": "To master your levers, set the pattern, confirm the scale visually, and pluck root to root. Listen to how the emotional color of home transforms under your hands. Master all seventy six levels, and play any tune across every mode with confidence."
    }
]

# -------------------------------------------------------------
# Speech Synthesis (edge-tts)
# -------------------------------------------------------------
async def synthesize_all_voiceovers():
    voice = "en-US-ChristopherNeural"
    rate = "-2%"
    pitch = "-1Hz"
    
    tasks = []
    all_cues = [
        ("path1", PATH1_SCRIPT),
        ("path2", PATH2_SCRIPT),
        ("path3", PATH3_SCRIPT)
    ]
    
    for prefix, script in all_cues:
        for cue in script:
            out_file = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
            if not os.path.exists(out_file) or os.path.getsize(out_file) < 500:
                print(f"Synthesizing {cue['id']}: {cue['text'][:40]}...")
                tts = edge_tts.Communicate(cue["text"], voice=voice, rate=rate, pitch=pitch)
                tasks.append(tts.save(out_file))
                
    if tasks:
        await asyncio.gather(*tasks)
    print("Voiceover synthesis complete!")

def get_audio_samples(file_path):
    """Decode audio file to float32 numpy array at 48kHz using ffmpeg."""
    cmd = [
        "ffmpeg", "-y", "-i", file_path,
        "-f", "f32le", "-ac", "1", "-ar", str(SR),
        "-"
    ]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    out, _ = p.communicate()
    return np.frombuffer(out, dtype=np.float32)

def build_path1_audio():
    print("Building Path 1 Audio Master (60s)...")
    total_sec = 60.0
    n_samples = int(SR * total_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    
    # 1. Subtle warm ambient bed
    t = np.linspace(0, total_sec, n_samples)
    pad = 0.025 * np.sin(2 * np.pi * 130.81 * t) + 0.015 * np.sin(2 * np.pi * 196.00 * t)
    master += pad
    
    # 2. Add Voiceover segments
    for cue in PATH1_SCRIPT:
        fpath = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
        samples = get_audio_samples(fpath)
        start_idx = int(cue["start_sec"] * SR)
        end_idx = min(n_samples, start_idx + len(samples))
        master[start_idx:end_idx] += samples[:end_idx - start_idx] * 0.95
        
    # 3. Add Causal In-App Audio Events:
    # Beat 1 (12.0s): Authentic Cadence in C Major demonstration
    cadence = synthesize_cadence_c_major()
    c_start = int(12.5 * SR)
    master[c_start:c_start + len(cadence)] += cadence * 0.7
    
    # Beat 2 (24.0s): Level 1 Cadence
    c1_start = int(24.0 * SR)
    master[c1_start:c1_start + len(cadence)] += cadence * 0.6
    
    # Beat 2 (28.5s): Mystery Note G4 sounds
    g_start = int(28.5 * SR)
    pluck_g = synthesize_harp_pluck(NOTE_FREQS['G4'], 1.8, amplitude=0.6)
    master[g_start:g_start + len(pluck_g)] += pluck_g
    
    # Beat 2 (32.0s): Pluck G confirmation + glass detent
    confirm_start = int(32.0 * SR)
    pluck_g2 = synthesize_harp_pluck(NOTE_FREQS['G4'], 1.5, amplitude=0.7)
    detent = synthesize_foley_click("glass")
    master[confirm_start:confirm_start + len(pluck_g2)] += pluck_g2
    master[confirm_start:confirm_start + len(detent)] += detent
    
    # Beat 3 (38.0s): Mystery Note F4 sounds (downward tension)
    f_start = int(38.0 * SR)
    pluck_f = synthesize_harp_pluck(NOTE_FREQS['F4'], 1.6, amplitude=0.6)
    master[f_start:f_start + len(pluck_f)] += pluck_f
    
    # Beat 3 (41.5s): Pluck F choice + wood click
    f_choice = int(41.5 * SR)
    wood = synthesize_foley_click("wood")
    master[f_choice:f_choice + len(wood)] += wood
    
    # Beat 3 (43.0s): Homeward Resolution Walk: F4 -> E4 -> D4 -> C4
    walk_notes = ['F4', 'E4', 'D4', 'C4']
    for idx, n_name in enumerate(walk_notes):
        n_start = int((43.0 + idx * 0.75) * SR)
        p = synthesize_harp_pluck(NOTE_FREQS[n_name], 1.2, amplitude=0.55 if n_name != 'C4' else 0.75)
        master[n_start:n_start + len(p)] += p
        
    # Beat 4 (52.0s): High tension B4 pulling up to C5
    b_start = int(52.5 * SR)
    p_b = synthesize_harp_pluck(NOTE_FREQS['B4'], 0.9, amplitude=0.55)
    p_c5 = synthesize_harp_pluck(NOTE_FREQS['C5'], 1.8, amplitude=0.75)
    master[b_start:b_start + len(p_b)] += p_b
    master[b_start + int(0.75 * SR):b_start + int(0.75 * SR) + len(p_c5)] += p_c5
    
    # Master Normalization
    max_val = np.max(np.abs(master)) + 1e-9
    master = master / max_val * 0.92
    
    wav_path = os.path.join(OUTPUT_DIR, "path1_single_notes_master.wav")
    mp3_path = os.path.join(OUTPUT_DIR, "path1_single_notes_master.mp3")
    scipy.io.wavfile.write(wav_path, SR, (master * 32767).astype(np.int16))
    
    subprocess.run([
        "ffmpeg", "-y", "-i", wav_path,
        "-b:a", "192k", mp3_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Path 1 Audio Master ready: {mp3_path}")

def build_path2_audio():
    print("Building Path 2 Audio Master (60s)...")
    total_sec = 60.0
    n_samples = int(SR * total_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    
    # Subtle ambient pad
    t = np.linspace(0, total_sec, n_samples)
    pad = 0.022 * np.sin(2 * np.pi * 130.81 * t) + 0.015 * np.sin(2 * np.pi * 164.81 * t)
    master += pad
    
    # Voiceover segments
    for cue in PATH2_SCRIPT:
        fpath = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
        samples = get_audio_samples(fpath)
        start_idx = int(cue["start_sec"] * SR)
        end_idx = min(n_samples, start_idx + len(samples))
        master[start_idx:end_idx] += samples[:end_idx - start_idx] * 0.95
        
    # Causal Audio Events:
    # Beat 1 (13.0s): Cadence in C Major
    cadence = synthesize_cadence_c_major()
    c_start = int(13.0 * SR)
    master[c_start:c_start + len(cadence)] += cadence * 0.65
    
    # Beat 2 (24.5s): Two-note motif sounds: E4 -> C4
    e_start = int(24.5 * SR)
    p_e = synthesize_harp_pluck(NOTE_FREQS['E4'], 0.9, amplitude=0.55)
    p_c = synthesize_harp_pluck(NOTE_FREQS['C4'], 1.6, amplitude=0.65)
    master[e_start:e_start + len(p_e)] += p_e
    master[e_start + int(0.7 * SR):e_start + int(0.7 * SR) + len(p_c)] += p_c
    
    # Beat 2 (30.0s): Player plucks E4 then C4 + clicks
    click = synthesize_foley_click("glass")
    pl1 = int(30.0 * SR)
    pl2 = int(31.2 * SR)
    p_e2 = synthesize_harp_pluck(NOTE_FREQS['E4'], 1.0, amplitude=0.6)
    p_c2 = synthesize_harp_pluck(NOTE_FREQS['C4'], 1.8, amplitude=0.7)
    master[pl1:pl1 + len(p_e2)] += p_e2
    master[pl1:pl1 + len(click)] += click
    master[pl2:pl2 + len(p_c2)] += p_c2
    master[pl2:pl2 + len(click)] += click
    
    # Beat 3 (38.0s): Level 5 Three-note phrase: C4 -> G4 -> E4
    m3_start = int(38.0 * SR)
    m3_notes = ['C4', 'G4', 'E4']
    for idx, n_name in enumerate(m3_notes):
        st = m3_start + int(idx * 0.65 * SR)
        p = synthesize_harp_pluck(NOTE_FREQS[n_name], 1.2, amplitude=0.6)
        master[st:st + len(p)] += p
        
    # Beat 3 (43.5s): Player sequence answer + illuminated replay: C4 -> G4 -> E4
    rep_start = int(43.5 * SR)
    for idx, n_name in enumerate(m3_notes):
        st = rep_start + int(idx * 0.65 * SR)
        p = synthesize_harp_pluck(NOTE_FREQS[n_name], 1.4, amplitude=0.65)
        det = synthesize_foley_click("wood")
        master[st:st + len(p)] += p
        master[st:st + len(det)] += det
        
    # Master Normalization
    max_val = np.max(np.abs(master)) + 1e-9
    master = master / max_val * 0.92
    
    wav_path = os.path.join(OUTPUT_DIR, "path2_melody_phrasing_master.wav")
    mp3_path = os.path.join(OUTPUT_DIR, "path2_melody_phrasing_master.mp3")
    scipy.io.wavfile.write(wav_path, SR, (master * 32767).astype(np.int16))
    
    subprocess.run([
        "ffmpeg", "-y", "-i", wav_path,
        "-b:a", "192k", mp3_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Path 2 Audio Master ready: {mp3_path}")

def build_path3_audio():
    print("Building Path 3 Audio Master (90s)...")
    total_sec = 90.0
    n_samples = int(SR * total_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    
    # Subtle warm ambient pad
    t = np.linspace(0, total_sec, n_samples)
    pad = 0.025 * np.sin(2 * np.pi * 146.83 * t) + 0.015 * np.sin(2 * np.pi * 220.00 * t)
    master += pad
    
    # Voiceover segments
    for cue in PATH3_SCRIPT:
        fpath = os.path.join(TMP_DIR, f"{cue['id']}.mp3")
        samples = get_audio_samples(fpath)
        start_idx = int(cue["start_sec"] * SR)
        end_idx = min(n_samples, start_idx + len(samples))
        master[start_idx:end_idx] += samples[:end_idx - start_idx] * 0.95
        
    # Causal Audio Events:
    # Beat 1 (22.0s): Lever flip mechanical latch sound + semitone shift
    latch = synthesize_foley_click("lever")
    l1_start = int(22.0 * SR)
    master[l1_start:l1_start + len(latch)] += latch
    # Pluck open string (349 Hz - F4), then raised string (370 Hz - F#4)
    p_open = synthesize_harp_pluck(NOTE_FREQS['F4'], 1.2, amplitude=0.6)
    p_sharp = synthesize_harp_pluck(NOTE_FREQS['F#4'], 1.8, amplitude=0.65)
    master[l1_start + int(0.15 * SR):l1_start + int(0.15 * SR) + len(p_open)] += p_open
    
    l2_start = int(25.5 * SR)
    master[l2_start:l2_start + len(latch)] += latch
    master[l2_start + int(0.15 * SR):l2_start + int(0.15 * SR) + len(p_sharp)] += p_sharp
    
    # Beat 2 (38.0s): Flip A, E, B lever groups into C Major
    # 3 clicks + ascending C Major scale (C, D, E, F, G, A, B, C)
    for i in range(3):
        ck_start = int((38.0 + i * 0.6) * SR)
        master[ck_start:ck_start + len(latch)] += latch * 0.8
        
    c_scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
    sc_start = int(42.5 * SR)
    for idx, n_name in enumerate(c_scale):
        st = sc_start + int(idx * 0.45 * SR)
        p = synthesize_harp_pluck(NOTE_FREQS[n_name], 0.9, amplitude=0.45)
        master[st:st + len(p)] += p
        
    # Beat 3 (54.0s): Lever F flips up -> F# (Modulation to G Major)
    mod_start = int(54.0 * SR)
    master[mod_start:mod_start + len(latch)] += latch
    p_fsharp = synthesize_harp_pluck(NOTE_FREQS['F#4'], 1.5, amplitude=0.65)
    master[mod_start + int(0.2 * SR):mod_start + int(0.2 * SR) + len(p_fsharp)] += p_fsharp
    
    # G Major scale segment: G4, A4, B4, C5, D5
    g_scale = ['G4', 'A4', 'B4', 'C5', 'D5']
    g_start = int(58.0 * SR)
    for idx, n_name in enumerate(g_scale):
        st = g_start + int(idx * 0.4 * SR)
        p = synthesize_harp_pluck(NOTE_FREQS[n_name], 0.9, amplitude=0.5)
        master[st:st + len(p)] += p
        
    # Beat 3 (64.0s): D Dorian mode demonstration (D4, E4, F4, G4, A4, B4, C5, D5)
    dorian = ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5']
    d_start = int(64.5 * SR)
    for idx, n_name in enumerate(dorian):
        st = d_start + int(idx * 0.45 * SR)
        p = synthesize_harp_pluck(NOTE_FREQS[n_name], 1.1, amplitude=0.55 if n_name in ['D4', 'B4'] else 0.45)
        master[st:st + len(p)] += p
        
    # Beat 4 (80.0s): Final root-to-root chime
    final_start = int(82.0 * SR)
    p_final = synthesize_harp_pluck(NOTE_FREQS['C4'], 3.5, amplitude=0.8)
    master[final_start:final_start + len(p_final)] += p_final
    
    # Master Normalization
    max_val = np.max(np.abs(master)) + 1e-9
    master = master / max_val * 0.92
    
    wav_path = os.path.join(OUTPUT_DIR, "path3_camac_levers_master.wav")
    mp3_path = os.path.join(OUTPUT_DIR, "path3_camac_levers_master.mp3")
    scipy.io.wavfile.write(wav_path, SR, (master * 32767).astype(np.int16))
    
    subprocess.run([
        "ffmpeg", "-y", "-i", wav_path,
        "-b:a", "192k", mp3_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Path 3 Audio Master ready: {mp3_path}")

async def main():
    await synthesize_all_voiceovers()
    build_path1_audio()
    build_path2_audio()
    build_path3_audio()
    print("ALL THREE PATH AUDIO MASTERS GENERATED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
