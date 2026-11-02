import os
import subprocess
import numpy as np
import scipy.io.wavfile as wav
import scipy.signal as signal
import soundfile as sf

SR = 44100
DURATION_SEC = 45.0
TOTAL_SAMPLES = int(SR * DURATION_SEC)

BASE_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video"
AUDIO_DIR = os.path.join(BASE_DIR, "public", "audio")
VO_DIR = os.path.join(AUDIO_DIR, "voiceover")

# 1. PHYSICAL ACOUSTIC CELTIC HARP MODEL (NATURAL SITKA SPRUCE & NYLON STRINGS)
def synth_harp_pluck(freq: float, dur: float = 3.2, velocity: float = 0.75, pan: float = 0.0) -> np.ndarray:
    """
    Physically modeled acoustic Celtic harp:
    - Fleshy thumb/finger contact impulse with natural gut/nylon elasticity
    - Sitka spruce soundboard dual cavity acoustics (170Hz & 280Hz)
    - Natural wooden decay, zero synthetic square buzz, zero sub-bass mud
    """
    n_samples = int(SR * dur)
    delay_len = max(2, int(round(SR / freq)))
    
    # Smooth Hann impulse mimicking fleshy finger release
    impulse = np.hanning(delay_len) * 2.2
    rng = np.random.default_rng(int(freq * 137) % 100000)
    noise = rng.uniform(-0.08, 0.08, delay_len)
    buf = (0.90 * impulse + 0.10 * noise).astype(np.float64)
    buf -= np.mean(buf)
    
    out = np.zeros(n_samples, dtype=np.float64)
    ptr = 0
    decay = 0.9978 if freq < 350 else 0.9960
    
    for i in range(n_samples):
        out[i] = buf[ptr]
        nxt = (ptr + 1) % delay_len
        nxt2 = (ptr + 2) % delay_len
        buf[ptr] = decay * (0.28 * buf[ptr] + 0.44 * buf[nxt] + 0.28 * buf[nxt2])
        ptr = nxt
        
    t = np.arange(n_samples) / SR
    env = np.exp(-t * (1.5 if freq < 400 else 2.2))
    attack = np.minimum(1.0, t / 0.008)
    
    # Pure acoustic partials (natural harmonic distribution of Celtic harp string)
    fundamental = np.sin(2 * np.pi * freq * t) * np.exp(-t * 1.2) * 0.45
    second_harm = np.sin(2 * np.pi * (freq * 2.0) * t) * np.exp(-t * 2.4) * 0.14
    third_harm = np.sin(2 * np.pi * (freq * 3.0) * t) * np.exp(-t * 4.0) * 0.04
    
    mono = (out * 0.48 + fundamental + second_harm + third_harm) * attack * env * velocity
    
    # Sitka spruce soundboard dual-mode cavity resonance (170Hz & 280Hz)
    b1, a1 = signal.butter(2, [160.0 / (SR / 2.0), 320.0 / (SR / 2.0)], btype='bandpass')
    body_res = signal.lfilter(b1, a1, mono) * 0.24
    mono = mono + body_res
    
    # Gentle stereo acoustic room spread
    left_gain = np.cos((pan + 1.0) * np.pi / 4.0)
    right_gain = np.sin((pan + 1.0) * np.pi / 4.0)
    left = mono * left_gain
    right = mono * right_gain
    
    # Early acoustic room reflections (14ms & 22ms delays)
    d1 = int(SR * 0.014)
    d2 = int(SR * 0.022)
    left += np.pad(right[:-d1], (d1, 0)) * 0.10
    right += np.pad(left[:-d2], (d2, 0)) * 0.10
    
    return np.column_stack([left, right])

# 2. SATISFYING TACTILE LOW-CLICK SOUND ("CLICKING INTO PLACE")
def synth_satisfying_click(velocity: float = 0.55, is_lever: bool = False, pan: float = 0.0) -> np.ndarray:
    """
    Very clean, satisfying to ear, low noises, clicking into place:
    - Deep, warm wooden/mechanical switch body (280Hz - 420Hz)
    - Low tactile thud (140Hz)
    - Lowpass filtered at 1200Hz to eliminate ALL harsh high frequencies!
    - Zero screeching, zero vibration, zero harshness
    """
    dur = 0.060 if is_lever else 0.045
    n = int(SR * dur)
    t = np.arange(n) / SR
    
    # Primary warm body
    f_body = 320.0
    body = np.sin(2 * np.pi * f_body * t) * np.exp(-t * 160.0)
    
    # Low-end tactile weight / thud
    thud = np.sin(2 * np.pi * 140.0 * t) * np.exp(-t * 110.0) * 0.70
    
    # Subtle latch click
    latch = np.sin(2 * np.pi * 650.0 * t) * np.exp(-t * 260.0) * 0.35
    
    click = (body + thud + latch) * velocity
    
    if is_lever:
        # Second mechanical engagement (fret latch) 18ms later
        d_samples = int(SR * 0.018)
        second_click = np.zeros(n)
        if n > d_samples:
            t2 = t[:n - d_samples]
            second_click[d_samples:] = (
                np.sin(2 * np.pi * 260.0 * t2) * np.exp(-t2 * 140.0) * 0.75 +
                np.sin(2 * np.pi * 520.0 * t2) * np.exp(-t2 * 220.0) * 0.30
            ) * velocity * 0.85
        click += second_click
        
    # Strict lowpass filter at 1200Hz to guarantee zero harshness
    b, a = signal.butter(2, 1200.0 / (SR / 2.0), btype='lowpass')
    mono = signal.lfilter(b, a, click)
    
    left_gain = np.cos((pan + 1.0) * np.pi / 4.0)
    right_gain = np.sin((pan + 1.0) * np.pi / 4.0)
    return np.column_stack([mono * left_gain, mono * right_gain])

# 3. SOFT ACOUSTIC TRANSITION THUD (REPLACES HARSH EDM DROPS)
def synth_soft_thud(velocity: float = 0.35) -> np.ndarray:
    """
    Gentle, warm wooden acoustic tap on harp soundbox.
    Zero sub-bass rumble, zero drone.
    """
    dur = 0.30
    n = int(SR * dur)
    t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * 110.0 * t) * np.exp(-t * 22.0) * velocity
    b, a = signal.butter(2, 280.0 / (SR / 2.0), btype='lowpass')
    mono = signal.lfilter(b, a, thud)
    return np.column_stack([mono, mono])

def mix_into(master: np.ndarray, clip: np.ndarray, start_frame: float, fps: float = 30.0):
    start_idx = int((start_frame / fps) * SR)
    if start_idx >= len(master) or start_idx < 0:
        return
    end_idx = min(len(master), start_idx + len(clip))
    seg_len = end_idx - start_idx
    if seg_len > 0:
        master[start_idx:end_idx] += clip[:seg_len]

def load_wav_stereo(path: str, gain: float = 1.0) -> np.ndarray:
    data, sr = sf.read(path)
    data = data.astype(np.float64)
    if data.ndim == 1:
        data = np.column_stack([data, data])
    if sr != SR:
        n_target = int(len(data) * SR / sr)
        data = signal.resample(data, n_target)
    return data * gain

def build_soundtrack():
    print("Building Earpa Master V5 Satisfying Soundtrack...")
    print("Zero drone, zero high-pitched harshness, pure tactile low clicks & acoustic harp!")
    
    master = np.zeros((TOTAL_SAMPLES, 2), dtype=np.float64)
    
    NOTES = {
        "C2": 65.41, "G2": 98.00,
        "C3": 130.81, "F3": 174.61, "G3": 196.00, "A3": 220.00,
        "C4": 261.63, "D4": 293.66, "Eb4": 311.13, "E4": 329.63,
        "F4": 349.23, "F#4": 369.99, "G4": 392.00, "Ab4": 415.30,
        "A4": 440.00, "Bb4": 466.16, "B4": 493.88, "C5": 523.25,
        "D5": 587.33, "E5": 659.25, "G5": 783.99
    }
    
    # --- SCENE 1: CLEAN CELTIC HARP SOLO & TACTILE CLICKS (Frames 0 - 400 | 0.0s - 13.33s) ---
    # Phase A: Live solo in the clear (Frames 0 - 72 | 2.4s) with authentic human rubato micro-timing
    solo_intro = [
        ("G4", 0.0,   0.72, -0.15, 3.4),  # Opening breath
        ("C5", 10.2,  0.78,  0.10, 3.2),  # Sweet leap into tonic
        ("D5", 18.5,  0.74,  0.20, 3.0),
        ("E5", 26.8,  0.80,  0.00, 3.5),  # Rising warmth
        ("G5", 38.0,  0.85,  0.18, 3.8),  # Lyrical peak (tenuto)
        ("E5", 48.6,  0.70, -0.10, 3.0),  # Gentle descent
        ("D5", 56.4,  0.66,  0.15, 3.0),
        ("C5", 64.2,  0.74, -0.20, 3.4),
    ]
    for n_name, f_start, vel, pan, dur in solo_intro:
        mix_into(master, synth_harp_pluck(NOTES[n_name], dur, vel, pan), f_start)

    # Grand Rolled Celtic Tonic Chord (Frames 66 - 72) with human finger spread
    mix_into(master, synth_harp_pluck(NOTES["C3"], 4.5, 0.58, -0.25), 66.0)
    mix_into(master, synth_harp_pluck(NOTES["G3"], 4.2, 0.52,  0.20), 67.8)
    mix_into(master, synth_harp_pluck(NOTES["C4"], 4.0, 0.64, -0.10), 69.4)
    mix_into(master, synth_harp_pluck(NOTES["E4"], 3.8, 0.60,  0.15), 70.8)
    mix_into(master, synth_harp_pluck(NOTES["G4"], 3.8, 0.62,  0.25), 72.0)
    mix_into(master, synth_harp_pluck(NOTES["C5"], 4.2, 0.68,  0.00), 73.2)

    # NOTE: NO AMBIENT PAD DRONE! Zero drone!
    
    # Phase B: Subtle Celtic countermelody continuing under voiceover
    under_vo_melody = [
        ("E4", 82,  0.36, -0.10, 2.8),
        ("G4", 98,  0.38,  0.15, 2.8),
        ("A4", 114, 0.34, -0.20, 2.6),
        ("C5", 130, 0.40,  0.05, 3.0),
        ("E5", 146, 0.42,  0.18, 3.2),
        ("D5", 162, 0.36, -0.15, 2.8),
        ("C5", 178, 0.38,  0.10, 3.0),
        ("A4", 194, 0.34, -0.25, 2.6),
        ("G4", 210, 0.36,  0.20, 3.0),
        ("E4", 226, 0.32, -0.15, 2.8),
        ("F4", 242, 0.34,  0.10, 2.8),
        ("G4", 258, 0.38, -0.10, 3.2),
        ("D4", 274, 0.34,  0.15, 3.0),
        ("C4", 286, 0.42,  0.00, 3.8),
        ("C3", 286, 0.38, -0.20, 4.2),
    ]
    for n_name, f_start, vel, pan, dur in under_vo_melody:
        mix_into(master, synth_harp_pluck(NOTES[n_name], dur, vel, pan), f_start)

    # Satisfying low tactile clicks on Scene 1 phone feature transitions (Frames 215, 245, 275, 305, 335, 365)
    for flip_f in [215, 245, 275, 305, 335, 365]:
        mix_into(master, synth_satisfying_click(0.48, is_lever=False, pan=0.0), flip_f)

    # Scene 1 to Scene 2 Soft Wooden Thud at cut 398
    mix_into(master, synth_soft_thud(0.32), 398)

    # --- SCENE 2: THE ALAIN BENBASSAT METHOD & 3-STEP LOOP (Frames 400 - 660 | 13.33s - 22.0s) ---
    # Step 1: Cadence pulse at 415
    mix_into(master, synth_satisfying_click(0.40, is_lever=False, pan=-0.15), 415)
    # Step 2: Mystery note pulse at 490
    mix_into(master, synth_satisfying_click(0.42, is_lever=False, pan=0.15), 490)
    # Step 3: Magnetic gravity lock at 565
    flow_notes = [("C4", 565), ("E4", 573), ("G4", 581), ("C5", 589)]
    for n_name, f_start in flow_notes:
        mix_into(master, synth_harp_pluck(NOTES[n_name], 2.2, 0.60, 0.12), f_start)
    mix_into(master, synth_satisfying_click(0.50, is_lever=False, pan=0.0), 589)
    # Scene 2 whip transition thud at 630
    mix_into(master, synth_soft_thud(0.30), 630)

    # --- SCENE 3: TONAL GRAVITY ENGINE & POLARIZED JOURNEY (Frames 660 - 930 | 22.0s - 31.0s) ---
    mix_into(master, synth_soft_thud(0.35), 660)
    
    # Grounding Cadence: I (675) -> IV (705) -> V (735) -> I (765)
    for idx, n in enumerate(["C3", "C4", "E4", "G4", "C5"]):
        mix_into(master, synth_harp_pluck(NOTES[n], 2.0, 0.58, -0.25 + idx * 0.12), 675 + idx * 1.5)
    mix_into(master, synth_satisfying_click(0.42, is_lever=False, pan=-0.2), 675)

    for idx, n in enumerate(["F3", "C4", "F4", "A4", "C5"]):
        mix_into(master, synth_harp_pluck(NOTES[n], 2.0, 0.60, -0.25 + idx * 0.12), 705 + idx * 1.5)
    mix_into(master, synth_satisfying_click(0.42, is_lever=False, pan=-0.1), 705)

    for idx, n in enumerate(["G3", "D4", "G4", "B4", "D5"]):
        mix_into(master, synth_harp_pluck(NOTES[n], 2.0, 0.62, -0.25 + idx * 0.12), 735 + idx * 1.5)
    mix_into(master, synth_satisfying_click(0.42, is_lever=False, pan=0.1), 735)

    for idx, n in enumerate(["C3", "C4", "E4", "G4", "C5"]):
        mix_into(master, synth_harp_pluck(NOTES[n], 2.4, 0.68, -0.25 + idx * 0.12), 765 + idx * 1.5)
    mix_into(master, synth_satisfying_click(0.50, is_lever=False, pan=0.0), 765)
        
    # Mystery Note F4 at Frame 800 -> Stepwise Gravity Walk 4 -> 3 -> 2 -> 1
    mix_into(master, synth_harp_pluck(NOTES["F4"], 2.0, 0.78, -0.1), 800)
    walk = [("F4", 830), ("E4", 850), ("D4", 870), ("C4", 890)]
    for n_name, f_start in walk:
        mix_into(master, synth_harp_pluck(NOTES[n_name], 2.4, 0.75, 0.1), f_start)
        mix_into(master, synth_satisfying_click(0.45, is_lever=False, pan=0.0), f_start)
    mix_into(master, synth_harp_pluck(NOTES["C3"], 3.0, 0.70, 0.0), 890)

    # --- SCENE 4: 3 CURRICULUM PATHS & REAL 3D CAMAC LEVERS (Frames 930 - 1165 | 31.0s - 38.83s) ---
    mix_into(master, synth_soft_thud(0.32), 930)
    mix_into(master, synth_satisfying_click(0.45, is_lever=False, pan=-0.3), 945)
    mix_into(master, synth_harp_pluck(NOTES["C4"], 1.8, 0.62, -0.3), 950)
    mix_into(master, synth_harp_pluck(NOTES["G4"], 1.8, 0.64, -0.2), 965)
    
    # Path 2 Melodic Sequence (Frame 1000)
    mix_into(master, synth_satisfying_click(0.48, is_lever=False, pan=0.0), 1000)
    reel = [
        ("C4", 1008), ("D4", 1015), ("E4", 1022), ("G4", 1029),
        ("A4", 1036), ("G4", 1043), ("E4", 1050), ("C5", 1057)
    ]
    for n_name, f_start in reel:
        mix_into(master, synth_harp_pluck(NOTES[n_name], 1.6, 0.65, 0.0), f_start)
        
    # Path 3 Camac Lever Flips (USER HIGHLIGHTED!)
    # Clean satisfying double-click as lever snaps into place!
    mix_into(master, synth_satisfying_click(0.60, is_lever=True, pan=0.3), 1070)
    mix_into(master, synth_harp_pluck(NOTES["Eb4"], 1.4, 0.62, 0.35), 1075)
    mix_into(master, synth_satisfying_click(0.65, is_lever=True, pan=0.35), 1085)
    mix_into(master, synth_harp_pluck(NOTES["E4"], 2.0, 0.75, 0.35), 1088)
    
    mix_into(master, synth_satisfying_click(0.68, is_lever=True, pan=0.4), 1110)
    mix_into(master, synth_harp_pluck(NOTES["F4"], 1.4, 0.62, 0.40), 1100)
    mix_into(master, synth_harp_pluck(NOTES["F#4"], 2.0, 0.78, 0.40), 1113)

    # --- SCENE 5: FINALE & PURE HARP RING-OUT (Frames 1165 - 1350 | 38.83s - 45.0s) ---
    mix_into(master, synth_soft_thud(0.35), 1165)
    # Radiant 8-string Celtic glissando across the harp
    gliss = ["C3", "G3", "C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5"]
    for idx, n_name in enumerate(gliss):
        mix_into(master, synth_harp_pluck(NOTES[n_name], 4.5, 0.65, -0.40 + idx * 0.08), 1170 + idx * 4)
        
    # Final Resonant Tonic Chord at Frame 1265 (Rings out cleanly for 2.8 seconds!)
    for idx, n_name in enumerate(["C3", "C4", "G4", "C5", "E5"]):
        mix_into(master, synth_harp_pluck(NOTES[n_name], 3.8, 0.64, -0.2 + idx * 0.1), 1265 + idx * 2)

    # 2. VOICEOVER INTEGRATION (V6 Ultra-Realistic Studio Clips)
    VO_SCHEDULE = [
        ("vo_01_hook_v6.wav", 72),
        ("vo_02_problem_v6.wav", 404),
        ("vo_03_mechanism_v6.wav", 664),
        ("vo_04_gameplay_v6.wav", 934),
        ("vo_05_cta_v6.wav", 1172),
    ]

    vo_track = np.zeros_like(master)
    for fname, start_f in VO_SCHEDULE:
        fpath = os.path.join(VO_DIR, fname)
        if not os.path.exists(fpath):
            raise FileNotFoundError(f"Missing {fpath}")
        clip = load_wav_stereo(fpath, 1.15)
        dur_f = int(round((len(clip) / SR) * 30.0))
        end_f = start_f + dur_f
        print(f"VO {fname}: startFrame={start_f}, duration={len(clip)/SR:.2f}s ({dur_f} frames), endFrame={end_f}")
        mix_into(vo_track, clip, start_f)

    # Subtle acoustic ducking only when voice is actively speaking
    vo_env = np.abs(vo_track[:, 0]) + np.abs(vo_track[:, 1])
    win = int(SR * 0.08)
    kernel = np.ones(win) / win
    smooth_env = np.convolve(vo_env, kernel, mode="same")
    duck_gain = np.clip(1.0 - smooth_env * 0.38, 0.55, 1.0)
    
    final_mix = master * duck_gain[:, None] + vo_track
    
    peak = np.max(np.abs(final_mix))
    if peak > 0.95:
        final_mix = np.tanh(final_mix * 1.05) * 0.92
        
    master_wav_path = os.path.join(AUDIO_DIR, "earpa_master_v5_satisfying.wav")
    master_mp3_path = os.path.join(AUDIO_DIR, "earpa_master_v5_satisfying.mp3")
    wav.write(master_wav_path, SR, (final_mix * 32767).astype(np.int16))
    subprocess.run([
        "ffmpeg", "-y", "-i", master_wav_path,
        "-b:a", "320k", master_mp3_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"Successfully compiled pure satisfying soundtrack to {master_mp3_path}")

if __name__ == "__main__":
    build_soundtrack()
