"""
EARPA PATH 1: SINGLE NOTES (PURE 3D MOTION + ANNOTATED PAUSE WALKTHROUGH V36)
Calibrated calm voiceover (Edge TTS ChristopherNeural @ rate -5%) + warm Sitka spruce
acoustic Celtic harp (CadenceEngine SATB voicing + ResolutionWalker 'closest' physics)
+ subtle tactile foley. Exports exact deterministic timeline JSON for Remotion.
"""

import asyncio
import json
import os
import subprocess
import sys
import edge_tts
import numpy as np
import scipy.io.wavfile as wav
import scipy.signal as signal

sys.stdout.reconfigure(encoding="utf-8")

SR = 48000
ROOT_DIR = r"c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio"
EARPA_AUDIO = os.path.join(ROOT_DIR, "earpa-video", "public", "audio")
OUT_AUDIO_DIR = os.path.join(EARPA_AUDIO, "instructions")
TMP_DIR = os.path.join(ROOT_DIR, "voiceover_tmp", "path1_v36_clean")
TIMELINE_OUT = os.path.join(
    ROOT_DIR, "earpa-video", "src", "instructions", "path1_v36", "timeline_path1_v36.json"
)

os.makedirs(OUT_AUDIO_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(os.path.dirname(TIMELINE_OUT), exist_ok=True)


def midi_to_freq(midi: int) -> float:
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def decode_audio_mono(path: str) -> np.ndarray:
    cmd = ["ffmpeg", "-y", "-i", path, "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    data = np.frombuffer(res.stdout, dtype=np.int16).astype(np.float64) / 32768.0
    fade = min(int(SR * 0.015), len(data) // 4)
    if fade > 2:
        data[:fade] *= 0.5 * (1.0 - np.cos(np.pi * np.linspace(0, 1, fade)))
        data[-fade:] *= 0.5 * (1.0 + np.cos(np.pi * np.linspace(0, 1, fade)))
    return data


def decode_audio_stereo(path: str) -> np.ndarray:
    cmd = ["ffmpeg", "-y", "-i", path, "-ar", str(SR), "-ac", "2", "-f", "s16le", "-"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    n_usable = (len(res.stdout) // 4) * 4
    data = np.frombuffer(res.stdout[:n_usable], dtype=np.int16).astype(np.float64) / 32768.0
    return data.reshape((-1, 2))


async def synth_tts(text: str, clip_id: str) -> tuple[np.ndarray, float]:
    mp3_path = os.path.join(TMP_DIR, f"{clip_id}.mp3")
    if not os.path.exists(mp3_path) or os.path.getsize(mp3_path) < 1000:
        tts = edge_tts.Communicate(
            text, voice="en-US-ChristopherNeural", rate="-5%", pitch="-1Hz"
        )
        await tts.save(mp3_path)
    samples = decode_audio_mono(mp3_path)
    dur = len(samples) / SR
    print(f"  [TTS] {clip_id:24s} {dur:5.2f}s | {text[:56]}")
    return samples, dur


def synth_harp_pluck(
    freq: float, dur: float = 2.6, velocity: float = 0.72, pan: float = 0.0
) -> np.ndarray:
    """Warm Sitka spruce Celtic lever harp string pluck (Karplus-Strong + body cavity)."""
    n = int(SR * dur)
    delay_len = max(2, int(round(SR / freq)))
    impulse = np.hanning(delay_len) * 2.1
    rng = np.random.default_rng(int(freq * 137) % 100000)
    noise = rng.uniform(-0.06, 0.06, delay_len)
    buf = (0.92 * impulse + 0.08 * noise).astype(np.float64)
    buf -= np.mean(buf)

    out = np.zeros(n, dtype=np.float64)
    ptr = 0
    decay = 0.9980 if freq < 350 else 0.9965
    for i in range(n):
        out[i] = buf[ptr]
        nxt = (ptr + 1) % delay_len
        nxt2 = (ptr + 2) % delay_len
        buf[ptr] = decay * (0.28 * buf[ptr] + 0.44 * buf[nxt] + 0.28 * buf[nxt2])
        ptr = nxt

    t = np.arange(n) / SR
    env = np.exp(-t * (1.35 if freq < 400 else 1.85))
    attack = np.minimum(1.0, t / 0.007)
    fund = np.sin(2 * np.pi * freq * t) * np.exp(-t * 1.15) * 0.48
    h2 = np.sin(2 * np.pi * (freq * 2.0) * t) * np.exp(-t * 2.3) * 0.14

    mono = (out * 0.46 + fund + h2) * attack * env * velocity
    b, a = signal.butter(2, [160.0 / (SR / 2.0), 340.0 / (SR / 2.0)], btype="bandpass")
    mono = mono + signal.lfilter(b, a, mono) * 0.22

    # Gentle tail fade to avoid click at buffer end
    fade_n = min(int(SR * 0.08), n // 4)
    if fade_n > 2:
        mono[-fade_n:] *= np.linspace(1.0, 0.0, fade_n)

    left = np.cos((pan + 1.0) * np.pi / 4.0)
    right = np.sin((pan + 1.0) * np.pi / 4.0)
    return np.column_stack([mono * left, mono * right])


def synth_rolled_chord(midi_notes: list[int], dur: float = 2.0, vel: float = 0.42) -> np.ndarray:
    """Finger-rolled SATB harp chord matching CadenceEngine (48ms arpeggio roll)."""
    total = int(SR * (dur + 0.5))
    buf = np.zeros((total, 2), dtype=np.float64)
    pans = [-0.25, -0.08, 0.08, 0.22]
    for i, m in enumerate(midi_notes):
        pluck = synth_harp_pluck(midi_to_freq(m), dur=dur, velocity=vel * (1.0 - i * 0.05), pan=pans[i % 4])
        idx = int(i * 0.045 * SR)
        seg = min(len(pluck), total - idx)
        buf[idx : idx + seg] += pluck[:seg]
    return buf


def sound_wood_tap(vol: float = 0.34, pan: float = 0.0) -> np.ndarray:
    """Gentle Sitka spruce fingertip tap for simulated key / UI selection."""
    n = int(SR * 0.048)
    t = np.arange(n) / SR
    click = (
        np.sin(2 * np.pi * 1760.0 * t) * np.exp(-t * 620.0) * 0.40
        + np.sin(2 * np.pi * 340.0 * t) * np.exp(-t * 210.0) * 0.65
        + np.sin(2 * np.pi * 145.0 * t) * np.exp(-t * 130.0) * 0.42
    ) * vol
    l = np.cos((pan + 1.0) * np.pi / 4.0)
    r = np.sin((pan + 1.0) * np.pi / 4.0)
    return np.column_stack([click * l, click * r])


def sound_glass_detent(vol: float = 0.26, pan: float = 0.0) -> np.ndarray:
    """Clean glassy chime tick for arrow / liquid-glass feedback reveal."""
    n = int(SR * 0.055)
    t = np.arange(n) / SR
    tone = (
        np.sin(2 * np.pi * 1980.0 * t) * 0.60
        + np.sin(2 * np.pi * 2970.0 * t) * 0.28
    ) * np.exp(-t * 140.0) * vol
    l = np.cos((pan + 1.0) * np.pi / 4.0)
    r = np.sin((pan + 1.0) * np.pi / 4.0)
    return np.column_stack([tone * l, tone * r])


def sound_soft_drift_tone(vol: float = 0.22) -> np.ndarray:
    """Warm muted wooden damping touch for Subtle Drift feedback reveal (never harsh buzzer)."""
    n = int(SR * 0.14)
    t = np.arange(n) / SR
    tone = (
        np.sin(2 * np.pi * 293.66 * t) * 0.55
        + np.sin(2 * np.pi * 146.83 * t) * 0.45
    ) * np.exp(-t * 28.0) * vol
    return np.column_stack([tone, tone])


def mix_stereo(master: np.ndarray, clip: np.ndarray, start_sec: float, gain: float = 1.0):
    s = int(round(start_sec * SR))
    if s < 0 or s >= len(master):
        return
    if clip.ndim == 1:
        clip_st = np.column_stack([clip, clip])
    else:
        clip_st = clip
    e = min(len(master), s + len(clip_st))
    if e > s:
        master[s:e] += clip_st[: e - s] * gain


async def main():
    print("\n=== SYNTHESIZING PATH 1 V36 CALM MOTION VOICEOVER & HARP AUDIO ===")

    phrases = {
        "b1_intro": "Welcome to Earpa, Path One: Single Notes. Here, you train your ear to recognize pitch by feeling musical gravity.",
        "b2_law_a": "Built on the Dalcroze method and the work of Alain Benbassat, every scale degree leans naturally toward one home center, tonic C.",
        "b2_law_b": "Subdominant F settles downward toward home, while leading tone B pulls upward.",
        "b3_home_a": "On the Single Notes home screen, tap Trail Map at the top to browse every level.",
        "b3_home_b": "Or press Play right below the harp to enter your current round.",
        "b4_map_11": "Inside the Trail Map, Level Eleven highlights degrees five through eight in green across twenty focused rounds.",
        "b4_map_12": "Level Twelve illuminates the full C major octave across all eight strings. Let us step inside.",
        "b5_r1_cad": "First, four chords anchor your ear in C major.",
        "b5_r1_guess": "Hear the mystery note, then tap F on the shelf below.",
        "b5_r1_grav": "Before the verdict appears, feel its gravity: note F rests a half step above E, wanting to walk gently down toward C.",
        "b5_r1_rev": "Only then does feedback reveal: Crystal Clear, F.",
        "b5_r1_walk_post": "The harp steps downward F, E, D, to C, locking that path in memory.",
        "b6_r2_intro": "Now watch what happens when you miss a tone.",
        "b6_r2_guess": "After the cadence and mystery note, suppose you choose D.",
        "b6_r2_grav": "Again, feel the contrast before seeing feedback: your ear sensed movement, yet dominant G shines open atop degree five.",
        "b6_r2_rev": "Now feedback clarifies it: A Subtle Drift, the note was G.",
        "b6_r2_post": "The harp walks G through A and B up to high C, recalibrating your ear on the spot.",
        "b7_r3_b": "Finally, feel leading tone B pulling tightly upward just one half step below C.",
        "b7_r3_rev": "Pure Resonance. One upward step settles cleanly home.",
        "b8_outro_map": "Ten calm minutes a day carries you seamlessly across diatonic, minor, and chromatic keys.",
        "b8_outro_end": "Step into Single Notes, and let your ear learn to feel home.",
    }

    vo = {}
    for k, txt in phrases.items():
        vo[k] = await synth_tts(txt, k)

    # Load subtle Mixkit atmospheric / real harp clips if available
    solo_harp_path = os.path.join(EARPA_AUDIO, "real_celtic_harp_solo_artist.wav")
    solo_harp = decode_audio_stereo(solo_harp_path) if os.path.exists(solo_harp_path) else np.zeros((SR * 10, 2))
    soft_trans_path = os.path.join(EARPA_AUDIO, "transition-soft.mp3")
    soft_trans = decode_audio_stereo(soft_trans_path) if os.path.exists(soft_trans_path) else np.zeros((0, 2))
    sparkle_path = os.path.join(EARPA_AUDIO, "sparkle.mp3")
    sparkle = decode_audio_stereo(sparkle_path) if os.path.exists(sparkle_path) else np.zeros((0, 2))

    # Build deterministic timeline cursor with comfortable natural breathing room
    events = []  # SFX / musical events for Remotion visual syncing
    scenes = {}  # Main scene & sub-beat boundaries
    cur = 0.0

    # =========================================================================
    # BEAT 1: HERO 3D CELTIC HARP INTRO
    # =========================================================================
    b1_start = cur
    cur += 0.65  # Gentle acoustic entrance breath
    b1_vo_start = cur
    cur += vo["b1_intro"][1]
    cur += 0.70  # Breath before transitioning to Gravitation Stage
    b1_end = cur
    scenes["beat1_hero"] = {"start": b1_start, "end": b1_end, "voStart": b1_vo_start}

    # =========================================================================
    # BEAT 2: DALCROZE & ALAIN BENBASSAT GRAVITATION DIAGRAM
    # =========================================================================
    b2_start = cur
    cur += 0.45
    b2_vo_a = cur
    cur += vo["b2_law_a"][1]
    cur += 0.35
    # Musical demonstration of F->E->D->C downward vs B->C5 upward!
    b2_f_walk_start = cur
    b2_b_walk_start = b2_f_walk_start + 2.15
    cur = b2_b_walk_start + 1.45
    b2_vo_b = cur
    cur += vo["b2_law_b"][1]
    cur += 0.75
    b2_end = cur
    scenes["beat2_law"] = {
        "start": b2_start,
        "end": b2_end,
        "voA": b2_vo_a,
        "fWalkStart": b2_f_walk_start,
        "bWalkStart": b2_b_walk_start,
        "voB": b2_vo_b,
    }

    # =========================================================================
    # BEAT 3: PAUSED ANNOTATED SANCTUARY HOME (Arrows -> TRAIL MAP & PRESS TO PLAY)
    # =========================================================================
    b3_start = cur
    cur += 0.55  # Phone magnetic slide-in
    b3_vo_a = cur
    b3_arrow_trail = b3_vo_a + 2.8  # Arrow points to TRAIL MAP >
    cur += vo["b3_home_a"][1]
    cur += 0.55
    b3_vo_b = cur
    b3_arrow_play = b3_vo_b + 1.6  # Arrow points to PRESS TO PLAY
    cur += vo["b3_home_b"][1]
    cur += 0.65
    b3_end = cur
    scenes["beat3_sanctuary"] = {
        "start": b3_start,
        "end": b3_end,
        "voA": b3_vo_a,
        "arrowTrail": b3_arrow_trail,
        "voB": b3_vo_b,
        "arrowPlay": b3_arrow_play,
    }

    # =========================================================================
    # BEAT 4: COASTAL TRAIL MAP — PAUSED P1-11 & P1-12 CALLOUTS
    # =========================================================================
    b4_start = cur
    cur += 0.45
    b4_p11_start = cur
    b4_vo_11 = cur
    cur += vo["b4_map_11"][1]
    cur += 0.55
    b4_p12_switch = cur  # Tap flash on node 12
    cur += 0.40
    b4_vo_12 = cur
    cur += vo["b4_map_12"][1]
    cur += 0.65
    b4_end = cur
    scenes["beat4_levels"] = {
        "start": b4_start,
        "end": b4_end,
        "p11Start": b4_p11_start,
        "vo11": b4_vo_11,
        "p12Switch": b4_p12_switch,
        "vo12": b4_vo_12,
    }

    # =========================================================================
    # BEAT 5: ROUND 1 INTERACTIVE DEMO (MYSTERY NOTE F — GRAVITY BEFORE VERDICT!)
    # =========================================================================
    b5_start = cur
    cur += 0.35
    b5_vo_cad = cur
    cur += vo["b5_r1_cad"][1] + 0.30
    b5_cad_start = cur
    # 4 cadence chords spaced 0.68s apart = 2.04s + 0.65s tail
    b5_stim_f = b5_cad_start + 2.85  # Mystery F4 sounds cleanly with dark strings
    cur = b5_stim_f + 1.15
    b5_vo_guess = cur
    b5_tap_f = b5_vo_guess + max(1.8, vo["b5_r1_guess"][1] - 0.5)
    cur += vo["b5_r1_guess"][1] + 0.30
    # CRITICAL: Explain gravity BEFORE feedback reveals!
    b5_grav_before = cur
    b5_vo_grav = cur
    cur += vo["b5_r1_grav"][1] + 0.60
    # REVEAL FEEDBACK NOW!
    b5_reveal_f = cur
    cur += 0.45
    b5_vo_rev = cur
    cur += vo["b5_r1_rev"][1] + 0.40
    # RESOLUTION WALK F4 -> E4 -> D4 -> C4 (0.56s per step)
    b5_walk_start = cur
    cur += 3 * 0.56 + 1.25  # pure acoustic walkdown
    b5_vo_walk_post = cur
    cur += vo["b5_r1_walk_post"][1] + 0.70
    b5_end = cur
    scenes["beat5_round1_f"] = {
        "start": b5_start,
        "end": b5_end,
        "voCad": b5_vo_cad,
        "cadStart": b5_cad_start,
        "stimF": b5_stim_f,
        "voGuess": b5_vo_guess,
        "tapF": b5_tap_f,
        "gravBefore": b5_grav_before,
        "voGrav": b5_vo_grav,
        "revealF": b5_reveal_f,
        "voRev": b5_vo_rev,
        "walkStart": b5_walk_start,
        "voWalkPost": b5_vo_walk_post,
    }

    # =========================================================================
    # BEAT 6: ROUND 2 MISTAKE & RECALIBRATION (TARGET G, GUESSED D — GRAVITY BEFORE VERDICT!)
    # =========================================================================
    b6_start = cur
    cur += 0.45
    b6_vo_intro = cur
    cur += vo["b6_r2_intro"][1] + 0.25
    b6_cad_start = cur
    b6_stim_g = b6_cad_start + 2.40  # Brisk cadence + clean G4 mystery pluck
    cur = b6_stim_g + 1.05
    b6_vo_guess = cur
    b6_tap_d = b6_vo_guess + max(1.3, vo["b6_r2_guess"][1] - 0.35)
    cur += vo["b6_r2_guess"][1] + 0.30
    # CRITICAL: Explain gravity/contrast BEFORE reveal!
    b6_grav_before = cur
    b6_vo_grav = cur
    cur += vo["b6_r2_grav"][1] + 0.55
    # REVEAL FEEDBACK NOW! ("A Subtle Drift... G")
    b6_reveal_g = cur
    cur += 0.45
    b6_vo_rev = cur
    cur += vo["b6_r2_rev"][1] + 0.35
    # RECALIBRATION WALK G4 -> A4 -> B4 -> C5 (per ResolutionWalker closest!)
    b6_walk_start = cur
    cur += 3 * 0.56 + 1.25
    b6_vo_post = cur
    cur += vo["b6_r2_post"][1] + 0.70
    b6_end = cur
    scenes["beat6_round2_g"] = {
        "start": b6_start,
        "end": b6_end,
        "voIntro": b6_vo_intro,
        "cadStart": b6_cad_start,
        "stimG": b6_stim_g,
        "voGuess": b6_vo_guess,
        "tapD": b6_tap_d,
        "gravBefore": b6_grav_before,
        "voGrav": b6_vo_grav,
        "revealG": b6_reveal_g,
        "voRev": b6_vo_rev,
        "walkStart": b6_walk_start,
        "voPost": b6_vo_post,
    }

    # =========================================================================
    # BEAT 7: LEADING TONE B CONTRAST (B -> C5 SNAP UP, GRAVITY BEFORE VERDICT!)
    # =========================================================================
    b7_start = cur
    cur += 0.40
    b7_cad_start = cur
    b7_stim_b = b7_cad_start + 1.75
    b7_tap_b = b7_stim_b + 0.85
    cur = b7_tap_b + 0.35
    b7_grav_before = cur
    b7_vo_b = cur
    cur += vo["b7_r3_b"][1] + 0.50
    b7_reveal_b = cur
    cur += 0.40
    b7_vo_rev = cur
    cur += vo["b7_r3_rev"][1] + 0.25
    b7_walk_start = cur  # B4 -> C5
    cur += 0.52 + 1.25
    b7_end = cur
    scenes["beat7_round3_b"] = {
        "start": b7_start,
        "end": b7_end,
        "cadStart": b7_cad_start,
        "stimB": b7_stim_b,
        "tapB": b7_tap_b,
        "gravBefore": b7_grav_before,
        "voB": b7_vo_b,
        "revealB": b7_reveal_b,
        "voRev": b7_vo_rev,
        "walkStart": b7_walk_start,
    }

    # =========================================================================
    # BEAT 8: ADAPTIVE MASTERY & HERO 3D HARP OUTRO
    # =========================================================================
    b8_start = cur
    cur += 0.45
    b8_vo_map = cur
    cur += vo["b8_outro_map"][1] + 0.55
    b8_hero_back = cur
    cur += 0.45
    b8_vo_end = cur
    cur += vo["b8_outro_end"][1] + 2.0
    total_dur = round(cur, 2)
    scenes["beat8_outro"] = {
        "start": b8_start,
        "end": total_dur,
        "voMap": b8_vo_map,
        "heroBack": b8_hero_back,
        "voEnd": b8_vo_end,
    }

    print(f"Total timeline duration: {total_dur:.2f}s ({int(round(total_dur * 30))} frames @ 30fps)")

    # =========================================================================
    # RENDER MASTER 48KHZ STEREO AUDIO BUFFER
    # =========================================================================
    n_samples = int(np.ceil(total_dur * SR))
    master = np.zeros((n_samples, 2), dtype=np.float64)

    # 1. Continuous Warm Acoustic Room Cavity Bed (zero dead silence!)
    t_all = np.arange(n_samples) / SR
    rng_bed = np.random.default_rng(77777)
    noise_bed = rng_bed.uniform(-0.008, 0.008, n_samples)
    b_bed, a_bed = signal.butter(2, [130.0 / (SR / 2.0), 650.0 / (SR / 2.0)], btype="bandpass")
    room_bed = signal.lfilter(b_bed, a_bed, noise_bed) * 0.35 + (
        np.sin(2 * np.pi * 130.81 * t_all) * 0.003 + np.sin(2 * np.pi * 196.0 * t_all) * 0.0018
    )
    master[:, 0] += room_bed
    master[:, 1] += room_bed

    # 2. Mix Voiceover Cleanly
    mix_stereo(master, vo["b1_intro"][0], b1_vo_start, 0.92)
    mix_stereo(master, vo["b2_law_a"][0], b2_vo_a, 0.92)
    mix_stereo(master, vo["b2_law_b"][0], b2_vo_b, 0.92)
    mix_stereo(master, vo["b3_home_a"][0], b3_vo_a, 0.92)
    mix_stereo(master, vo["b3_home_b"][0], b3_vo_b, 0.92)
    mix_stereo(master, vo["b4_map_11"][0], b4_vo_11, 0.92)
    mix_stereo(master, vo["b4_map_12"][0], b4_vo_12, 0.92)
    mix_stereo(master, vo["b5_r1_cad"][0], b5_vo_cad, 0.92)
    mix_stereo(master, vo["b5_r1_guess"][0], b5_vo_guess, 0.92)
    mix_stereo(master, vo["b5_r1_grav"][0], b5_vo_grav, 0.92)
    mix_stereo(master, vo["b5_r1_rev"][0], b5_vo_rev, 0.92)
    mix_stereo(master, vo["b5_r1_walk_post"][0], b5_vo_walk_post, 0.92)
    mix_stereo(master, vo["b6_r2_intro"][0], b6_vo_intro, 0.92)
    mix_stereo(master, vo["b6_r2_guess"][0], b6_vo_guess, 0.92)
    mix_stereo(master, vo["b6_r2_grav"][0], b6_vo_grav, 0.92)
    mix_stereo(master, vo["b6_r2_rev"][0], b6_vo_rev, 0.92)
    mix_stereo(master, vo["b6_r2_post"][0], b6_vo_post, 0.92)
    mix_stereo(master, vo["b7_r3_b"][0], b7_vo_b, 0.92)
    mix_stereo(master, vo["b7_r3_rev"][0], b7_vo_rev, 0.92)
    mix_stereo(master, vo["b8_outro_map"][0], b8_vo_map, 0.92)
    mix_stereo(master, vo["b8_outro_end"][0], b8_vo_end, 0.92)

    # 3. Musical Celtic Harp Solos & Pedagogical Events
    # Beat 1 warm real Celtic harp background + glowing C-E-G-C arpeggio
    if len(solo_harp) > SR * 5:
        seg = solo_harp[: int(min(len(solo_harp), (b1_end - b1_start + 1.0) * SR))].copy()
        fade_len = int(SR * 1.2)
        seg[-fade_len:, 0] *= np.linspace(1, 0, fade_len)
        seg[-fade_len:, 1] *= np.linspace(1, 0, fade_len)
        mix_stereo(master, seg, b1_start + 0.1, 0.16)

    # Delicate opening pluck sequence on Hero Harp (C4-E4-G4-C5)
    for idx, m in enumerate([60, 64, 67, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.4, 0.42, pan=-0.15 + idx * 0.1), b1_start + 0.15 + idx * 0.22, 0.85)

    # Beat 2 Gravitation audio demo: F4 -> E4 -> D4 -> C4 then B4 -> C5
    for idx, m in enumerate([65, 64, 62, 60]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.8 if idx < 3 else 2.5, 0.65, pan=-0.1), b2_f_walk_start + idx * 0.46, 0.95)
    for idx, m in enumerate([71, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.8 if idx == 0 else 2.6, 0.65, pan=0.15), b2_b_walk_start + idx * 0.46, 0.95)

    # Beat 5 Cadence (I - IV - V - I), Stimulus F4, Resolution Walk F4 -> E4 -> D4 -> C4
    cadence_chords = [
        [48, 67, 64, 72],  # I
        [53, 69, 65, 72],  # IV
        [55, 71, 65, 74],  # V
        [48, 67, 64, 72],  # I
    ]
    for ci, ch in enumerate(cadence_chords):
        mix_stereo(master, synth_rolled_chord(ch, 1.4 if ci < 3 else 1.9, 0.36), b5_cad_start + ci * 0.66, 1.0)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(65), 2.4, 0.78, pan=-0.05), b5_stim_f, 1.0)
    for idx, m in enumerate([65, 64, 62, 60]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.8 if idx < 3 else 2.6, 0.72, pan=-0.05), b5_walk_start + idx * 0.56, 1.0)

    # Beat 6 Cadence, Stimulus G4, Recalibration Walk G4 -> A4 -> B4 -> C5
    for ci, ch in enumerate(cadence_chords):
        mix_stereo(master, synth_rolled_chord(ch, 1.2 if ci < 3 else 1.7, 0.33), b6_cad_start + ci * 0.56, 1.0)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(67), 2.4, 0.78, pan=0.05), b6_stim_g, 1.0)
    for idx, m in enumerate([67, 69, 71, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.8 if idx < 3 else 2.6, 0.72, pan=0.08), b6_walk_start + idx * 0.56, 1.0)

    # Beat 7 Quick I - V - I anchor, Stimulus B4, Snap Walk B4 -> C5
    for ci, ch in enumerate([cadence_chords[0], cadence_chords[2], cadence_chords[3]]):
        mix_stereo(master, synth_rolled_chord(ch, 1.1 if ci < 2 else 1.5, 0.32), b7_cad_start + ci * 0.52, 1.0)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(71), 2.2, 0.76, pan=0.12), b7_stim_b, 1.0)
    for idx, m in enumerate([71, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.7 if idx == 0 else 2.6, 0.75, pan=0.14), b7_walk_start + idx * 0.52, 1.0)

    # Beat 8 Closing Glissando & Solo Harp shimmer
    if len(solo_harp) > SR * 6:
        outro_seg = solo_harp[: int(min(len(solo_harp), (total_dur - b8_hero_back + 0.5) * SR))].copy()
        fi = int(SR * 0.8)
        outro_seg[:fi, 0] *= np.linspace(0, 1, fi)
        outro_seg[:fi, 1] *= np.linspace(0, 1, fi)
        fo = int(SR * 1.5)
        outro_seg[-fo:, 0] *= np.linspace(1, 0, fo)
        outro_seg[-fo:, 1] *= np.linspace(1, 0, fo)
        mix_stereo(master, outro_seg, b8_hero_back, 0.22)
    for idx, m in enumerate([60, 62, 64, 65, 67, 69, 71, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.6, 0.38, pan=-0.3 + idx * 0.08), total_dur - 2.3 + idx * 0.13, 0.9)

    # 4. Crisp 1:1 Tactile Foley at visual cues (never noisy or clipped)
    if len(soft_trans) > 0:
        for t_tr in [b2_start, b3_start, b4_start, b5_start, b6_start, b7_start, b8_start, b8_hero_back]:
            mix_stereo(master, soft_trans, t_tr, 0.22)
    if len(sparkle) > 0:
        mix_stereo(master, sparkle, b5_reveal_f, 0.16)
        mix_stereo(master, sparkle, b7_reveal_b, 0.16)

    mix_stereo(master, sound_glass_detent(0.28), b3_arrow_trail, 1.0)
    mix_stereo(master, sound_glass_detent(0.28), b3_arrow_play, 1.0)
    mix_stereo(master, sound_wood_tap(0.36), b4_p12_switch, 1.0)
    mix_stereo(master, sound_wood_tap(0.42), b5_tap_f, 1.0)
    mix_stereo(master, sound_glass_detent(0.30), b5_reveal_f, 1.0)
    mix_stereo(master, sound_wood_tap(0.42), b6_tap_d, 1.0)
    mix_stereo(master, sound_soft_drift_tone(0.28), b6_reveal_g, 1.0)
    mix_stereo(master, sound_wood_tap(0.42), b7_tap_b, 1.0)
    mix_stereo(master, sound_glass_detent(0.30), b7_reveal_b, 1.0)

    # Peak normalize safely to -1.0 dBFS (0.89)
    peak = np.max(np.abs(master)) + 1e-9
    norm = (master / peak) * 0.89

    out_wav = os.path.join(TMP_DIR, "path1_motion_v36.wav")
    out_mp3 = os.path.join(OUT_AUDIO_DIR, "path1_motion_v36.mp3")
    wav.write(out_wav, SR, (norm * 32767.0).astype(np.int16))
    subprocess.run(
        ["ffmpeg", "-y", "-i", out_wav, "-c:a", "libmp3lame", "-b:a", "192k", "-ac", "2", out_mp3],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )

    timeline_payload = {
        "fps": 30,
        "totalDurationSec": total_dur,
        "totalFrames": int(round(total_dur * 30)),
        "scenes": scenes,
    }
    with open(TIMELINE_OUT, "w", encoding="utf-8") as f:
        json.dump(timeline_payload, f, indent=2)

    print(f"\n[DONE] Master audio: {out_mp3} ({total_dur:.2f}s)")
    print(f"[DONE] Timeline JSON: {TIMELINE_OUT}")


if __name__ == "__main__":
    asyncio.run(main())
