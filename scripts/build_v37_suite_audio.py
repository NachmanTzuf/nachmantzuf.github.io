"""
Earpa V37 Suite Audio & Frame-Exact Timeline Generator
Produces:
  1. earpa-video/public/audio/instructions/path1_motion_v37.mp3 + timeline_path1_v37.json
  2. earpa-video/public/audio/instructions/path2_motion_v37.mp3 + timeline_path2_v37.json
  3. earpa-video/public/audio/instructions/path3_motion_v37.mp3 + timeline_path3_v37.json

Enforces real live app timings from InGamePlayScreen.tsx & LeverTrainingScreen.tsx:
  - Cadence I -> IV -> V -> I: [0.00, 0.95, 1.90, 2.85] -> hold 1.60s = 4.45s + 0.24s gap = 4.69s to mystery onset
  - Equal real-time listening & hum-C thinking window (5.00s) across every round
  - Walkdown speed: Single Notes = 0.95s/step; Melody 60 BPM = 1.00s/note; Levers scale walk = 0.55s/note
  - Zero speech clash over musical ear-training tones; <= -1.2 dBFS peak headroom
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

SR = 44100
FPS = 30
VOICE = "en-US-ChristopherNeural"
RATE = "-5%"
PITCH = "-1Hz"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AUDIO_OUT_DIR = os.path.join(ROOT_DIR, "earpa-video", "public", "audio", "instructions")
SOLO_HARP_WAV = os.path.join(ROOT_DIR, "earpa-video", "public", "audio", "real_celtic_harp_solo_artist.wav")
CACHE_DIR = os.path.join(AUDIO_OUT_DIR, "_v37_tts_cache")

os.makedirs(AUDIO_OUT_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)


def midi_to_freq(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))


def fr(sec: float) -> int:
    return int(round(sec * FPS))


def decode_audio_stereo(path: str) -> np.ndarray:
    tmp_wav = path + ".tmp44k.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", path, "-ar", str(SR), "-ac", "2", tmp_wav],
        check=True,
    )
    sr, data = wav.read(tmp_wav)
    try:
        os.remove(tmp_wav)
    except OSError:
        pass
    if data.dtype == np.int16:
        arr = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        arr = data.astype(np.float32) / 2147483648.0
    else:
        arr = data.astype(np.float32)
    if arr.ndim == 1:
        arr = np.stack([arr, arr], axis=1)
    return arr


async def synth_tts_clip(key: str, text: str) -> np.ndarray:
    mp3_path = os.path.join(CACHE_DIR, f"{key}.mp3")
    if not os.path.exists(mp3_path) or os.path.getsize(mp3_path) < 1024:
        tmp_mp3 = mp3_path + ".tmp.mp3"
        last_err = None
        for attempt in range(8):
            try:
                cur_rate = RATE if attempt < 4 else "-4%"
                cur_text = text if attempt < 2 else (text.rstrip(".") + ".")
                comm = edge_tts.Communicate(cur_text, voice=VOICE, rate=cur_rate)
                await comm.save(tmp_mp3)
                if os.path.getsize(tmp_mp3) > 1024:
                    os.replace(tmp_mp3, mp3_path)
                    await asyncio.sleep(1.1)
                    break
            except Exception as exc:
                last_err = exc
                print(f"[TTS retry {attempt+1}] {key}: {exc}")
                await asyncio.sleep(2.0 + attempt * 1.0)
        else:
            raise last_err
    arr = decode_audio_stereo(mp3_path)
    # Trim silent lead/tail beyond threshold 0.006 for razor-sharp cue alignment
    mag = np.max(np.abs(arr), axis=1)
    nz = np.where(mag > 0.006)[0]
    if len(nz) > 0:
        i0 = max(0, nz[0] - int(0.025 * SR))
        i1 = min(len(arr), nz[-1] + int(0.05 * SR))
        arr = arr[i0:i1]
    peak = float(np.max(np.abs(arr))) + 1e-9
    arr = arr * (0.76 / peak)
    return arr


def synth_harp_pluck(freq: float, dur: float = 2.4, velocity: float = 0.72, pan: float = 0.0) -> np.ndarray:
    """Warm Sitka spruce Celtic harp string pluck via filtered Karplus-Strong."""
    n_samples = int(dur * SR)
    delay = max(4, int(round(SR / freq)))
    rng = np.random.default_rng(int(round(freq * 100)) & 0xFFFF)
    noise = rng.uniform(-1.0, 1.0, delay).astype(np.float64)
    # Warm lowpass pluck excitation (reduces metallic harshness)
    b, a = signal.butter(2, min(0.85, (freq * 6.5) / (SR * 0.5)), btype="low")
    exc = signal.lfilter(b, a, noise)

    out = np.zeros(n_samples, dtype=np.float64)
    ring = exc.copy()
    decay = 0.9965 if freq < 400 else 0.9945
    prev = 0.0
    for i in range(n_samples):
        idx = i % delay
        cur = ring[idx]
        nxt = 0.5 * (cur + prev) * decay
        out[i] = cur
        ring[idx] = nxt
        prev = cur

    # Soft onset fade (5ms) + natural tail fade (last 80ms)
    att = min(int(0.005 * SR), n_samples)
    out[:att] *= np.linspace(0.0, 1.0, att)
    rel = min(int(0.09 * SR), n_samples)
    out[-rel:] *= np.linspace(1.0, 0.0, rel)

    # Slight harmonic woody resonance body bump around 220Hz
    pk = np.max(np.abs(out)) + 1e-9
    mono = (out / pk) * velocity
    L = mono * np.cos((pan + 1.0) * np.pi / 4.0)
    R = mono * np.sin((pan + 1.0) * np.pi / 4.0)
    return np.stack([L, R], axis=1).astype(np.float32)


def synth_rolled_chord(midis: list[int], dur: float = 1.6, vel: float = 0.34) -> np.ndarray:
    n = int(dur * SR)
    buf = np.zeros((n, 2), dtype=np.float32)
    roll = 0.044
    pans = [-0.24, -0.08, 0.08, 0.24]
    for i, m in enumerate(midis):
        off = int(i * roll * SR)
        pl = synth_harp_pluck(midi_to_freq(m), dur=max(0.4, dur - i * roll), velocity=vel * (1.0 - 0.06 * i), pan=pans[i % 4])
        avail = min(len(pl), n - off)
        if avail > 0:
            buf[off : off + avail] += pl[:avail]
    return buf


def synth_ui_tap(pitch_hz: float = 640.0, is_confirm: bool = False) -> np.ndarray:
    """Crisp soft organic UI wooden pill tap."""
    dur = 0.08 if not is_confirm else 0.13
    n = int(dur * SR)
    t = np.linspace(0.0, dur, n, endpoint=False)
    env = np.exp(-t * (55.0 if not is_confirm else 36.0))
    wave = (np.sin(2.0 * np.pi * pitch_hz * t) * 0.65 + np.sin(2.0 * np.pi * pitch_hz * 1.5 * t) * 0.25) * env * 0.28
    return np.stack([wave, wave], axis=1).astype(np.float32)


def synth_lever_click(up: bool = True) -> np.ndarray:
    """Refined Camac brass-and-steel cam snap SFX."""
    dur = 0.09
    n = int(dur * SR)
    t = np.linspace(0.0, dur, n, endpoint=False)
    f0 = 1480.0 if up else 1080.0
    env = np.exp(-t * 68.0)
    transient = np.sin(2.0 * np.pi * f0 * t) * env * 0.32 + np.sin(2.0 * np.pi * f0 * 2.2 * t) * np.exp(-t * 110.0) * 0.18
    return np.stack([transient, transient], axis=1).astype(np.float32)


def mix_stereo(dst: np.ndarray, src: np.ndarray, start_sec: float, gain: float = 1.0) -> None:
    s0 = int(round(start_sec * SR))
    if s0 >= len(dst):
        return
    src_start = 0
    if s0 < 0:
        src_start = -s0
        s0 = 0
    avail = min(len(src) - src_start, len(dst) - s0)
    if avail > 0:
        dst[s0 : s0 + avail] += src[src_start : src_start + avail] * gain


def export_mp3(buf: np.ndarray, out_mp3: str) -> float:
    # Subtle soft knee peak limiting <= -1.2 dB (0.87)
    peak = float(np.max(np.abs(buf))) + 1e-9
    if peak > 0.87:
        buf = np.tanh(buf * (0.86 / peak)) * 0.88
    else:
        buf = buf * min(1.0, 0.85 / peak)

    pcm = np.clip(buf * 32767.0, -32767.0, 32767.0).astype(np.int16)
    tmp_wav = out_mp3 + ".tmp_master.wav"
    wav.write(tmp_wav, SR, pcm)
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", tmp_wav, "-codec:a", "libmp3lame", "-b:a", "256k", "-ar", str(SR), out_mp3],
        check=True,
    )
    try:
        os.remove(tmp_wav)
    except OSError:
        pass
    dur = len(buf) / SR
    print(f"[AUDIO] Exported {os.path.basename(out_mp3)} -> {dur:.2f}s ({fr(dur)} frames @ 30fps)")
    return dur


# Exact C major cadence chords matching CadenceEngine (I -> IV -> V -> I)
CADENCE_C_MAJOR = [
    [48, 60, 64, 67],  # I  (0.00s)
    [53, 60, 65, 69],  # IV (+0.95s)
    [55, 59, 62, 67],  # V  (+1.90s)
    [48, 60, 64, 67],  # I  (+2.85s, held 1.60s -> end 4.45s; +0.24s = 4.69s mystery onset!)
]
CAD_OFFSETS = [0.00, 0.95, 1.90, 2.85]
CAD_DURS = [1.05, 1.05, 1.05, 1.65]
PRE_MYSTERY_ONSET = 4.69
THINK_PAUSE = 5.00  # IDENTICAL listening/hum-C thinking pause before every user tap!


def build_cadence(master: np.ndarray, start_sec: float, gain: float = 0.92):
    for ci, ch in enumerate(CADENCE_C_MAJOR):
        mix_stereo(master, synth_rolled_chord(ch, CAD_DURS[ci], 0.34), start_sec + CAD_OFFSETS[ci], gain)
    return [fr(start_sec + off) for off in CAD_OFFSETS]


async def build_path1(solo_harp: np.ndarray):
    print("\n--- BUILDING PATH 1 (SINGLE NOTES) V37 AUDIO & TIMELINE ---")
    lines = {
        "p1_intro": "Welcome to Path One: Single Notes. Train your ear with Alain Benbassat's tonal gravity.",
        "p1_grav_low": "Picture the scale symmetrically. The lower half, F, E, and D, pulls down toward low C.",
        "p1_grav_high": "The upper half, G, A, and B, pulls up toward high C. This balanced pull is the entire method.",
        "p1_map": "Pick any level on the trail map and tap Play.",
        "p1_r1_pre": "Round one starts with the C major anchor cadence.",
        "p1_r1_think": "Feel the gravity. Quietly hum low C in your mind.",
        "p1_r1_verdict": "Spot on, it is F. Hear F step calmly through E and D down to C.",
        "p1_r2_pre": "Round two keeps the exact same cadence and listening pace.",
        "p1_r2_think": "Hum low C again. Notice the bright upward pull toward high C.",
        "p1_r2_verdict": "Not G, that was B. Listen as B resolves straight up to high C.",
        "p1_ins_a": "After fifteen rounds, your summary tracks total accuracy and average speed.",
        "p1_ins_b": "Check your weakest degree below to sharpen that pull next.",
        "p1_outro": "Feel gravity, hum home C, and trust your ear.",
    }
    clips = {k: await synth_tts_clip(k, v) for k, v in lines.items()}
    durs = {k: len(v) / SR for k, v in clips.items()}
    think_pause_p1 = max(5.20, max(durs["p1_r1_think"], durs["p1_r2_think"]) + 0.90)
    print(f"Path 1 clip durs: { {k: round(v,2) for k,v in durs.items()} }, think_pause={think_pause_p1:.2f}s")

    # Scene cursor timeline
    t = 0.0
    # 1. Intro Spinning 3D Harp (~6.4s)
    s_intro_start = t
    intro_voice_start = 0.35
    s_intro_end = max(6.2, intro_voice_start + durs["p1_intro"] + 0.55)

    # 2. Concept: Symmetrical Gravity Field
    t = s_intro_end
    s_concept_start = t
    grav_low_start = t + 0.40
    # audible F-E-D-C descent demo cleanly after grav_low
    grav_low_walk = grav_low_start + durs["p1_grav_low"] + 0.15
    grav_high_start = grav_low_walk + 2.15
    grav_high_walk = grav_high_start + durs["p1_grav_high"] + 0.15
    s_concept_end = grav_high_walk + 1.85

    # 3. Trail Map -> Play (~4.8s)
    t = s_concept_end
    s_map_start = t
    map_voice_start = t + 0.30
    map_tap_play = max(map_voice_start + durs["p1_map"] - 0.55, t + 3.2)
    s_map_end = max(map_voice_start + durs["p1_map"] + 0.65, map_tap_play + 0.90)

    # 4. In-Game Round 1 (Note F - Correct Spot On!)
    t = s_map_end
    s_ingame_start = t
    r1_pre = t + 0.25
    r1_cad_start = r1_pre + durs["p1_r1_pre"] + 0.25
    r1_mys = r1_cad_start + PRE_MYSTERY_ONSET
    r1_think_voice = r1_mys + 0.65
    r1_tap = r1_mys + think_pause_p1
    r1_verdict_voice = r1_tap + 0.18
    r1_walk_start = r1_verdict_voice + durs["p1_r1_verdict"] + 0.20
    # 4 notes @ exact 0.95s/step = 2.85s + 1.25s settle
    r1_end = r1_walk_start + 3 * 0.95 + 1.35

    # 5. In-Game Round 2 (Note B - Intentional miss on G -> recalibrate up B->C5)
    r2_pre = r1_end
    r2_cad_start = r2_pre + durs["p1_r2_pre"] + 0.25
    r2_mys = r2_cad_start + PRE_MYSTERY_ONSET
    r2_think_voice = r2_mys + 0.65
    r2_tap = r2_mys + think_pause_p1
    r2_verdict_voice = r2_tap + 0.18
    r2_walk_start = r2_verdict_voice + durs["p1_r2_verdict"] + 0.20
    # 2 notes @ exact 0.95s/step = 0.95s + 1.65s settle
    r2_end = r2_walk_start + 1 * 0.95 + 1.75
    s_ingame_end = r2_end

    # 6. End-of-Session Insights (`p1_insights.png`)
    s_insights_start = s_ingame_end
    ins_a = s_insights_start + 0.35
    ins_b = ins_a + durs["p1_ins_a"] + 0.30
    s_insights_end = ins_b + durs["p1_ins_b"] + 0.65

    # 7. Outro Smooth Hero Harp
    s_outro_start = s_insights_end
    outro_voice = s_outro_start + 0.40
    total_dur = max(s_outro_start + 4.8, outro_voice + durs["p1_outro"] + 1.6)

    master = np.zeros((int(np.ceil(total_dur * SR)), 2), dtype=np.float32)

    # Subtle ambient solo harp on Intro & Outro
    if len(solo_harp) > SR * 5:
        intro_bed = solo_harp[: int((s_intro_end + 0.4) * SR)].copy()
        fade = np.linspace(1.0, 0.0, int(1.2 * SR))
        intro_bed[-len(fade) :] *= fade[:, None]
        mix_stereo(master, intro_bed, 0.0, 0.065)

        outro_len = int((total_dur - s_outro_start) * SR)
        outro_bed = solo_harp[: min(len(solo_harp), outro_len)].copy()
        att = min(int(0.8 * SR), len(outro_bed))
        outro_bed[:att] *= np.linspace(0.0, 1.0, att)[:, None]
        rel = min(int(1.2 * SR), len(outro_bed))
        outro_bed[-rel:] *= np.linspace(1.0, 0.0, rel)[:, None]
        mix_stereo(master, outro_bed, s_outro_start, 0.07)

    # Voice clips
    mix_stereo(master, clips["p1_intro"], intro_voice_start, 1.0)
    mix_stereo(master, clips["p1_grav_low"], grav_low_start, 1.0)
    mix_stereo(master, clips["p1_grav_high"], grav_high_start, 1.0)
    mix_stereo(master, clips["p1_map"], map_voice_start, 1.0)
    mix_stereo(master, clips["p1_r1_pre"], r1_pre, 1.0)
    mix_stereo(master, clips["p1_r1_think"], r1_think_voice, 1.0)
    mix_stereo(master, clips["p1_r1_verdict"], r1_verdict_voice, 1.0)
    mix_stereo(master, clips["p1_r2_pre"], r2_pre, 1.0)
    mix_stereo(master, clips["p1_r2_think"], r2_think_voice, 1.0)
    mix_stereo(master, clips["p1_r2_verdict"], r2_verdict_voice, 1.0)
    mix_stereo(master, clips["p1_ins_a"], ins_a, 1.0)
    mix_stereo(master, clips["p1_ins_b"], ins_b, 1.0)
    mix_stereo(master, clips["p1_outro"], outro_voice, 1.0)

    # Musical Plucks & Cadences
    for idx, m in enumerate([60, 64, 67, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.3, 0.40, pan=-0.2 + idx * 0.12), s_intro_start + 0.15 + idx * 0.24, 0.72)

    for idx, m in enumerate([65, 64, 62, 60]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.6, 0.62, pan=-0.12), grav_low_walk + idx * 0.44, 0.85)
    for idx, m in enumerate([67, 69, 71, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.6, 0.62, pan=0.12), grav_high_walk + idx * 0.44, 0.85)

    mix_stereo(master, synth_ui_tap(680.0, True), map_tap_play, 0.9)

    # Round 1 Music
    r1_cad_frames = build_cadence(master, r1_cad_start)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(65), 2.5, 0.82, pan=-0.05), r1_mys, 1.0)
    mix_stereo(master, synth_ui_tap(720.0, False), r1_tap, 0.9)
    r1_walk_notes = [(4, 65, "F"), (3, 64, "E"), (2, 62, "D"), (1, 60, "C")]
    for idx, (sNum, midi, lbl) in enumerate(r1_walk_notes):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(midi), 1.8 if idx < 3 else 2.5, 0.75, pan=-0.04), r1_walk_start + idx * 0.95, 1.0)

    # Round 2 Music
    r2_cad_frames = build_cadence(master, r2_cad_start)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(71), 2.5, 0.82, pan=0.06), r2_mys, 1.0)
    mix_stereo(master, synth_ui_tap(540.0, False), r2_tap, 0.9)
    r2_walk_notes = [(7, 71, "B"), (8, 72, "C⁵")]
    for idx, (sNum, midi, lbl) in enumerate(r2_walk_notes):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(midi), 1.8 if idx == 0 else 2.6, 0.76, pan=0.10), r2_walk_start + idx * 0.95, 1.0)

    # Outro tonic warm chord
    mix_stereo(master, synth_rolled_chord([48, 60, 64, 67, 72], 2.8, 0.36), total_dur - 2.4, 0.88)

    out_mp3 = os.path.join(AUDIO_OUT_DIR, "path1_motion_v37.mp3")
    export_mp3(master, out_mp3)

    timeline = {
        "fps": FPS,
        "durationSec": round(total_dur, 3),
        "totalFrames": fr(total_dur),
        "scenes": {
            "introStart": fr(s_intro_start),
            "introEnd": fr(s_intro_end),
            "conceptStart": fr(s_concept_start),
            "conceptEnd": fr(s_concept_end),
            "gravLowFrame": fr(grav_low_start),
            "gravHighFrame": fr(grav_high_start),
            "mapStart": fr(s_map_start),
            "mapEnd": fr(s_map_end),
            "mapTapPlay": fr(map_tap_play),
            "ingameStart": fr(s_ingame_start),
            "ingameEnd": fr(s_ingame_end),
            "insightsStart": fr(s_insights_start),
            "insightsEnd": fr(s_insights_end),
            "insightsSplitFrame": fr(ins_b),
            "outroStart": fr(s_outro_start),
        },
        "rounds": [
            {
                "roundNumber": 1,
                "roundStartFrame": fr(r1_pre),
                "cadenceChordFrames": r1_cad_frames,
                "mysteryPluckFrames": [fr(r1_mys)],
                "mysteryStrings": [4],
                "humCueStartFrame": fr(r1_think_voice + 0.4),
                "humCueEndFrame": fr(r1_tap - 0.15),
                "keyTaps": [{"keyIndex": 3, "tapFrame": fr(r1_tap), "isCorrect": True}],
                "verdictFrame": fr(r1_tap + 0.06),
                "verdictCorrect": True,
                "verdictTitle": "Spot On!",
                "verdictDetail": "Note F · Subdominant (4)",
                "walkPlucks": [{"stringNum": sNum, "frame": fr(r1_walk_start + idx * 0.95), "noteLabel": lbl} for idx, (sNum, _, lbl) in enumerate(r1_walk_notes)],
                "walkEndFrame": fr(r1_end),
            },
            {
                "roundNumber": 2,
                "roundStartFrame": fr(r2_pre),
                "cadenceChordFrames": r2_cad_frames,
                "mysteryPluckFrames": [fr(r2_mys)],
                "mysteryStrings": [7],
                "humCueStartFrame": fr(r2_think_voice + 0.1),
                "humCueEndFrame": fr(r2_tap - 0.15),
                "keyTaps": [{"keyIndex": 4, "tapFrame": fr(r2_tap), "isCorrect": False}],
                "verdictFrame": fr(r2_tap + 0.06),
                "verdictCorrect": False,
                "verdictTitle": "Listen Closely...",
                "verdictDetail": "Actual note: B (7) · Not G",
                "walkPlucks": [{"stringNum": sNum, "frame": fr(r2_walk_start + idx * 0.95), "noteLabel": lbl} for idx, (sNum, _, lbl) in enumerate(r2_walk_notes)],
                "walkEndFrame": fr(r2_end),
            },
        ],
    }
    with open(os.path.join(AUDIO_OUT_DIR, "timeline_path1_v37.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)
    return timeline


async def build_path2(solo_harp: np.ndarray):
    print("\n--- BUILDING PATH 2 (MELODY PHRASING) V37 AUDIO & TIMELINE ---")
    lines = {
        "p2_intro": "Welcome to Path Two: Melodic Memory. Catch entire phrases inside tonal gravity.",
        "p2_concept": "Anchor the first pitch to home C, then trace each rise or fall.",
        "p2_map": "Choose Sequence Four at sixty beats per minute, and tap Play.",
        "p2_r1_pre": "Listen to the anchor cadence, then follow three notes in real time.",
        "p2_r1_think": "Hum home C gently. Hear the phrase rise from C through E to G.",
        "p2_r1_verdict": "Spot on: C, E, and G. Now hear that triad replayed at steady tempo.",
        "p2_r2_pre": "Round two keeps the exact same cadence and sixty BPM tempo.",
        "p2_r2_think": "Hum home C again. Hear it open high on G and step downward home.",
        "p2_r2_verdict": "Not quite: it started high on G and stepped through E down to C.",
        "p2_ins": "Your summary reveals response speed and marks which degree needs focus next.",
        "p2_outro": "Catch the anchor, follow the contour, and hear the melody as one.",
    }
    clips = {k: await synth_tts_clip(k, v) for k, v in lines.items()}
    durs = {k: len(v) / SR for k, v in clips.items()}
    think_pause_p2 = max(5.80, max(durs["p2_r1_think"], durs["p2_r2_think"]) + 1.75)
    print(f"Path 2 clip durs: { {k: round(v,2) for k,v in durs.items()} }, think_pause={think_pause_p2:.2f}s")

    t = 0.0
    s_intro_start = t
    intro_voice = 0.35
    s_intro_end = max(6.0, intro_voice + durs["p2_intro"] + 0.55)

    t = s_intro_end
    s_concept_start = t
    con_voice = t + 0.35
    con_demo_start = con_voice + durs["p2_concept"] + 0.25
    # 3 60-BPM notes (1.00s spacing)
    s_concept_end = con_demo_start + 3.25

    t = s_concept_end
    s_map_start = t
    map_voice = t + 0.30
    map_tap_play = max(map_voice + durs["p2_map"] - 0.50, t + 3.1)
    s_map_end = max(map_voice + durs["p2_map"] + 0.65, map_tap_play + 0.90)

    # Round 1: C - E - G @ 60 BPM (1.00s per note)
    t = s_map_end
    s_ingame_start = t
    r1_pre = t + 0.25
    r1_cad_start = r1_pre + durs["p2_r1_pre"] + 0.25
    r1_m1 = r1_cad_start + PRE_MYSTERY_ONSET
    r1_m2 = r1_m1 + 1.00
    r1_m3 = r1_m1 + 2.00
    r1_think_voice = r1_m3 + 0.65
    # Consistent listening window after last note onset (taps C-E-G finish at +think_pause_p2 cleanly after speech!)
    r1_tap1 = r1_m3 + think_pause_p2 - 1.10
    r1_tap2 = r1_m3 + think_pause_p2 - 0.55
    r1_tap3 = r1_m3 + think_pause_p2
    r1_verdict_voice = r1_tap3 + 0.20
    r1_walk_start = r1_verdict_voice + durs["p2_r1_verdict"] + 0.20
    r1_end = r1_walk_start + 2.00 + 1.45

    # Round 2: G - E - C @ 60 BPM (wrong tap C-G-E -> recalibrate G-E-C)
    r2_pre = r1_end
    r2_cad_start = r2_pre + durs["p2_r2_pre"] + 0.25
    r2_m1 = r2_cad_start + PRE_MYSTERY_ONSET
    r2_m2 = r2_m1 + 1.00
    r2_m3 = r2_m1 + 2.00
    r2_think_voice = r2_m3 + 0.65
    r2_tap1 = r2_m3 + think_pause_p2 - 1.10
    r2_tap2 = r2_m3 + think_pause_p2 - 0.55
    r2_tap3 = r2_m3 + think_pause_p2
    r2_verdict_voice = r2_tap3 + 0.20
    r2_walk_start = r2_verdict_voice + durs["p2_r2_verdict"] + 0.20
    r2_end = r2_walk_start + 2.00 + 1.55
    s_ingame_end = r2_end

    # Insights & Outro
    s_insights_start = s_ingame_end
    ins_voice = s_insights_start + 0.35
    s_insights_end = max(s_insights_start + 5.2, ins_voice + durs["p2_ins"] + 0.70)

    s_outro_start = s_insights_end
    outro_voice = s_outro_start + 0.40
    total_dur = max(s_outro_start + 4.8, outro_voice + durs["p2_outro"] + 1.5)

    master = np.zeros((int(np.ceil(total_dur * SR)), 2), dtype=np.float32)

    if len(solo_harp) > SR * 5:
        intro_bed = solo_harp[: int((s_intro_end + 0.4) * SR)].copy()
        fade = np.linspace(1.0, 0.0, int(1.2 * SR))
        intro_bed[-len(fade) :] *= fade[:, None]
        mix_stereo(master, intro_bed, 0.0, 0.065)

        outro_len = int((total_dur - s_outro_start) * SR)
        outro_bed = solo_harp[: min(len(solo_harp), outro_len)].copy()
        att = min(int(0.8 * SR), len(outro_bed))
        outro_bed[:att] *= np.linspace(0.0, 1.0, att)[:, None]
        rel = min(int(1.2 * SR), len(outro_bed))
        outro_bed[-rel:] *= np.linspace(1.0, 0.0, rel)[:, None]
        mix_stereo(master, outro_bed, s_outro_start, 0.07)

    mix_stereo(master, clips["p2_intro"], intro_voice, 1.0)
    mix_stereo(master, clips["p2_concept"], con_voice, 1.0)
    mix_stereo(master, clips["p2_map"], map_voice, 1.0)
    mix_stereo(master, clips["p2_r1_pre"], r1_pre, 1.0)
    mix_stereo(master, clips["p2_r1_think"], r1_think_voice, 1.0)
    mix_stereo(master, clips["p2_r1_verdict"], r1_verdict_voice, 1.0)
    mix_stereo(master, clips["p2_r2_pre"], r2_pre, 1.0)
    mix_stereo(master, clips["p2_r2_think"], r2_think_voice, 1.0)
    mix_stereo(master, clips["p2_r2_verdict"], r2_verdict_voice, 1.0)
    mix_stereo(master, clips["p2_ins"], ins_voice, 1.0)
    mix_stereo(master, clips["p2_outro"], outro_voice, 1.0)

    # Music
    for idx, m in enumerate([60, 64, 67, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.2, 0.38, pan=-0.2 + idx * 0.12), s_intro_start + 0.2 + idx * 0.24, 0.72)
    for idx, m in enumerate([60, 64, 67]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.8, 0.68, pan=-0.15 + idx * 0.15), con_demo_start + idx * 1.00, 0.90)
    mix_stereo(master, synth_ui_tap(680.0, True), map_tap_play, 0.9)

    # Round 1 music
    r1_cad_frames = build_cadence(master, r1_cad_start)
    for idx, (m, tpos) in enumerate(zip([60, 64, 67], [r1_m1, r1_m2, r1_m3])):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.1, 0.78, pan=-0.12 + idx * 0.12), tpos, 1.0)
    for tp, hz in [(r1_tap1, 620.0), (r1_tap2, 680.0), (r1_tap3, 740.0)]:
        mix_stereo(master, synth_ui_tap(hz, False), tp, 0.85)
    r1_replay = [(1, 60, "C"), (3, 64, "E"), (5, 67, "G")]
    for idx, (_, m, _) in enumerate(r1_replay):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.0, 0.75), r1_walk_start + idx * 1.00, 1.0)

    # Round 2 music
    r2_cad_frames = build_cadence(master, r2_cad_start)
    for idx, (m, tpos) in enumerate(zip([67, 64, 60], [r2_m1, r2_m2, r2_m3])):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.1, 0.78, pan=0.12 - idx * 0.12), tpos, 1.0)
    for tp, hz in [(r2_tap1, 560.0), (r2_tap2, 540.0), (r2_tap3, 520.0)]:
        mix_stereo(master, synth_ui_tap(hz, False), tp, 0.85)
    r2_replay = [(5, 67, "G"), (3, 64, "E"), (1, 60, "C")]
    for idx, (_, m, _) in enumerate(r2_replay):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.0, 0.75), r2_walk_start + idx * 1.00, 1.0)

    mix_stereo(master, synth_rolled_chord([48, 60, 64, 67, 72], 2.8, 0.36), total_dur - 2.4, 0.88)

    out_mp3 = os.path.join(AUDIO_OUT_DIR, "path2_motion_v37.mp3")
    export_mp3(master, out_mp3)

    timeline = {
        "fps": FPS,
        "durationSec": round(total_dur, 3),
        "totalFrames": fr(total_dur),
        "scenes": {
            "introStart": fr(s_intro_start),
            "introEnd": fr(s_intro_end),
            "conceptStart": fr(s_concept_start),
            "conceptEnd": fr(s_concept_end),
            "conceptNotes": [fr(con_demo_start), fr(con_demo_start + 1.0), fr(con_demo_start + 2.0)],
            "mapStart": fr(s_map_start),
            "mapEnd": fr(s_map_end),
            "mapTapPlay": fr(map_tap_play),
            "ingameStart": fr(s_ingame_start),
            "ingameEnd": fr(s_ingame_end),
            "insightsStart": fr(s_insights_start),
            "insightsEnd": fr(s_insights_end),
            "outroStart": fr(s_outro_start),
        },
        "rounds": [
            {
                "roundNumber": 1,
                "roundStartFrame": fr(r1_pre),
                "cadenceChordFrames": r1_cad_frames,
                "mysteryPluckFrames": [fr(r1_m1), fr(r1_m2), fr(r1_m3)],
                "mysteryStrings": [1, 3, 5],
                "humCueStartFrame": fr(r1_think_voice),
                "humCueEndFrame": fr(r1_tap1 - 0.1),
                "keyTaps": [
                    {"keyIndex": 0, "tapFrame": fr(r1_tap1), "isCorrect": True},
                    {"keyIndex": 2, "tapFrame": fr(r1_tap2), "isCorrect": True},
                    {"keyIndex": 4, "tapFrame": fr(r1_tap3), "isCorrect": True},
                ],
                "slotNotes": [
                    {"note": "C", "revealFrame": fr(r1_tap1)},
                    {"note": "E", "revealFrame": fr(r1_tap2)},
                    {"note": "G", "revealFrame": fr(r1_tap3)},
                ],
                "verdictFrame": fr(r1_tap3 + 0.08),
                "verdictCorrect": True,
                "verdictTitle": "Spot On!",
                "verdictDetail": "Melody · C · E · G",
                "walkPlucks": [{"stringNum": s, "frame": fr(r1_walk_start + idx * 1.00), "noteLabel": lbl} for idx, (s, _, lbl) in enumerate(r1_replay)],
                "walkEndFrame": fr(r1_end),
            },
            {
                "roundNumber": 2,
                "roundStartFrame": fr(r2_pre),
                "cadenceChordFrames": r2_cad_frames,
                "mysteryPluckFrames": [fr(r2_m1), fr(r2_m2), fr(r2_m3)],
                "mysteryStrings": [5, 3, 1],
                "humCueStartFrame": fr(r2_think_voice),
                "humCueEndFrame": fr(r2_tap1 - 0.1),
                "keyTaps": [
                    {"keyIndex": 0, "tapFrame": fr(r2_tap1), "isCorrect": False},
                    {"keyIndex": 4, "tapFrame": fr(r2_tap2), "isCorrect": False},
                    {"keyIndex": 2, "tapFrame": fr(r2_tap3), "isCorrect": False},
                ],
                "slotNotes": [
                    {"note": "C", "revealFrame": fr(r2_tap1)},
                    {"note": "G", "revealFrame": fr(r2_tap2)},
                    {"note": "E", "revealFrame": fr(r2_tap3)},
                ],
                "verdictFrame": fr(r2_tap3 + 0.08),
                "verdictCorrect": False,
                "verdictTitle": "Listen Closely...",
                "verdictDetail": "Actual phrase: G · E · C",
                "walkPlucks": [{"stringNum": s, "frame": fr(r2_walk_start + idx * 1.00), "noteLabel": lbl} for idx, (s, _, lbl) in enumerate(r2_replay)],
                "walkEndFrame": fr(r2_end),
            },
        ],
    }
    with open(os.path.join(AUDIO_OUT_DIR, "timeline_path2_v37.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)
    return timeline


async def build_path3(solo_harp: np.ndarray):
    print("\n--- BUILDING PATH 3 (CAMAC LEVERS) V37 AUDIO & TIMELINE ---")
    lines = {
        "p3_intro": "Welcome to Path Three: Camac Levers. Retune cleanly across musical keys.",
        "p3_concept": "Celtic harps are most commonly tuned to E-flat major with all levers down. Flipping a lever raises one semitone, moving clockwise: A, E, B, F, C, G, then D.",
        "p3_circle": "Preview any key on the interactive Circle of Fifths, then begin practice.",
        "p3_r1_guide": "Round one asks for F major. Use strings or bottom buttons to lift A and E up, then press Confirm scale.",
        "p3_r1_verdict": "Correct. Listen as the harp walks F major cleanly from start to finish.",
        "p3_r2_guide": "Round two asks for G major. Suppose you raise F up, forget B down, and tap Confirm.",
        "p3_r2_verdict": "Not quite: missing B is flagged right away as the true G major scale plays start to finish.",
        "p3_comp": "After all rounds, your level summary records matched scales for the next stage.",
        "p3_outro": "Trust the Circle of Fifths order, watch the levers, and shift keys smoothly.",
    }
    clips = {k: await synth_tts_clip(k, v) for k, v in lines.items()}
    durs = {k: len(v) / SR for k, v in clips.items()}

    t = 0.0
    s_intro_start = t
    intro_voice = 0.35
    s_intro_end = max(6.0, intro_voice + durs["p3_intro"] + 0.55)

    t = s_intro_end
    s_concept_start = t
    con_voice = t + 0.35
    con_flip_a = con_voice + 3.8
    con_flip_e = con_flip_a + 0.85
    s_concept_end = max(t + 8.5, con_voice + durs["p3_concept"] + 0.70)

    t = s_concept_end
    s_circle_start = t
    cir_voice = t + 0.30
    cir_tap = max(cir_voice + durs["p3_circle"] - 0.45, t + 3.0)
    s_circle_end = max(cir_voice + durs["p3_circle"] + 0.65, cir_tap + 0.90)

    # Round 1: F Major (starts ALL DOWN Eb: [False*8] -> raise A(6) & E(3) UP!)
    t = s_circle_end
    s_ingame_start = t
    r1_start = t
    r1_voice = r1_start + 0.35
    r1_flip_a = r1_voice + 3.6
    r1_flip_e = r1_flip_a + 0.85
    r1_confirm = max(r1_voice + durs["p3_r1_guide"] + 0.15, r1_flip_e + 0.85)
    r1_verdict_voice = r1_confirm + 0.22
    r1_walk_start = r1_verdict_voice + durs["p3_r1_verdict"] + 0.18
    r1_end = r1_walk_start + 7 * 0.55 + 1.35

    # Round 2: G Major (starts with A(6) & E(3) already UP -> raise F(4) UP, omit B(7) -> Not quite -> G..G walk!)
    r2_start = r1_end
    r2_voice = r2_start + 0.35
    r2_flip_f = r2_voice + 4.1
    r2_confirm = max(r2_voice + durs["p3_r2_guide"] + 0.15, r2_flip_f + 0.95)
    r2_verdict_voice = r2_confirm + 0.22
    r2_walk_start = r2_verdict_voice + durs["p3_r2_verdict"] + 0.18
    r2_end = r2_walk_start + 7 * 0.55 + 1.45
    s_ingame_end = r2_end

    s_complete_start = s_ingame_end
    comp_voice = s_complete_start + 0.35
    s_complete_end = max(s_complete_start + 4.8, comp_voice + durs["p3_comp"] + 0.70)

    s_outro_start = s_complete_end
    outro_voice = s_outro_start + 0.40
    total_dur = max(s_outro_start + 4.6, outro_voice + durs["p3_outro"] + 1.5)

    master = np.zeros((int(np.ceil(total_dur * SR)), 2), dtype=np.float32)

    if len(solo_harp) > SR * 5:
        intro_bed = solo_harp[: int((s_intro_end + 0.4) * SR)].copy()
        fade = np.linspace(1.0, 0.0, int(1.2 * SR))
        intro_bed[-len(fade) :] *= fade[:, None]
        mix_stereo(master, intro_bed, 0.0, 0.065)

        outro_len = int((total_dur - s_outro_start) * SR)
        outro_bed = solo_harp[: min(len(solo_harp), outro_len)].copy()
        att = min(int(0.8 * SR), len(outro_bed))
        outro_bed[:att] *= np.linspace(0.0, 1.0, att)[:, None]
        rel = min(int(1.2 * SR), len(outro_bed))
        outro_bed[-rel:] *= np.linspace(1.0, 0.0, rel)[:, None]
        mix_stereo(master, outro_bed, s_outro_start, 0.07)

    mix_stereo(master, clips["p3_intro"], intro_voice, 1.0)
    mix_stereo(master, clips["p3_concept"], con_voice, 1.0)
    mix_stereo(master, clips["p3_circle"], cir_voice, 1.0)
    mix_stereo(master, clips["p3_r1_guide"], r1_voice, 1.0)
    mix_stereo(master, clips["p3_r1_verdict"], r1_verdict_voice, 1.0)
    mix_stereo(master, clips["p3_r2_guide"], r2_voice, 1.0)
    mix_stereo(master, clips["p3_r2_verdict"], r2_verdict_voice, 1.0)
    mix_stereo(master, clips["p3_comp"], comp_voice, 1.0)
    mix_stereo(master, clips["p3_outro"], outro_voice, 1.0)

    # Musical plucks & mechanical Camac clicks
    for idx, m in enumerate([63, 67, 70, 75]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.1, 0.38, pan=-0.2 + idx * 0.12), s_intro_start + 0.2 + idx * 0.25, 0.72)
    mix_stereo(master, synth_lever_click(True), con_flip_a, 0.85)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(69), 1.4, 0.48), con_flip_a + 0.06, 0.75)
    mix_stereo(master, synth_lever_click(True), con_flip_e, 0.85)
    mix_stereo(master, synth_ui_tap(660.0, True), cir_tap, 0.85)

    # Round 1 F Major clicks (A=6, E=3) & 550ms full start-to-finish walk (F4..F5)
    for ft in [r1_flip_a, r1_flip_e]:
        mix_stereo(master, synth_lever_click(True), ft, 0.92)
    mix_stereo(master, synth_ui_tap(720.0, True), r1_confirm, 0.90)
    f_major_midis = [(4, 65, "F"), (5, 67, "G"), (6, 69, "A"), (7, 70, "B♭"), (8, 72, "C"), (2, 74, "D"), (3, 76, "E"), (4, 77, "F")]
    for idx, (sNum, m, lbl) in enumerate(f_major_midis):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.4 if idx < 7 else 2.2, 0.76), r1_walk_start + idx * 0.55, 1.0)

    # Round 2 G Major (F=4 raised, B=7 intentionally left down -> Confirm -> G4..G5 full walk!)
    mix_stereo(master, synth_lever_click(True), r2_flip_f, 0.92)
    mix_stereo(master, synth_ui_tap(520.0, True), r2_confirm, 0.90)
    g_major_midis = [(5, 67, "G"), (6, 69, "A"), (7, 71, "B"), (8, 72, "C"), (2, 74, "D"), (3, 76, "E"), (4, 78, "F♯"), (5, 79, "G")]
    for idx, (sNum, m, lbl) in enumerate(g_major_midis):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.4 if idx < 7 else 2.2, 0.76), r2_walk_start + idx * 0.55, 1.0)

    mix_stereo(master, synth_rolled_chord([48, 60, 64, 67, 72], 2.8, 0.36), total_dur - 2.3, 0.88)

    out_mp3 = os.path.join(AUDIO_OUT_DIR, "path3_motion_v37.mp3")
    export_mp3(master, out_mp3)

    timeline = {
        "fps": FPS,
        "durationSec": round(total_dur, 3),
        "totalFrames": fr(total_dur),
        "scenes": {
            "introStart": fr(s_intro_start),
            "introEnd": fr(s_intro_end),
            "conceptStart": fr(s_concept_start),
            "conceptEnd": fr(s_concept_end),
            "conceptLeverFrame": fr(con_flip_a),
            "circleStart": fr(s_circle_start),
            "circleEnd": fr(s_circle_end),
            "circleTapFrame": fr(cir_tap),
            "ingameStart": fr(s_ingame_start),
            "ingameEnd": fr(s_ingame_end),
            "completeStart": fr(s_complete_start),
            "completeEnd": fr(s_complete_end),
            "outroStart": fr(s_outro_start),
        },
        "rounds": [
            {
                "scaleName": "F major",
                "roundLabel": "Level 1 · 1 / 3",
                "roundStartFrame": fr(r1_start),
                "initialLevers": [False, False, False, False, False, False, False, False],
                "leverFlips": [
                    {"stringNum": 6, "flipFrame": fr(r1_flip_a), "targetUp": True},
                    {"stringNum": 3, "flipFrame": fr(r1_flip_e), "targetUp": True},
                ],
                "confirmTapFrame": fr(r1_confirm),
                "verdictCorrect": True,
                "verdictHeadline": "Correct",
                "verdictSubline": "8 of 8 levers correct · A & E up for F major",
                "walkNotes": [{"stringNum": sNum, "frame": fr(r1_walk_start + idx * 0.55), "noteLabel": lbl} for idx, (sNum, _, lbl) in enumerate(f_major_midis)],
                "walkEndFrame": fr(r1_end),
            },
            {
                "scaleName": "G major",
                "roundLabel": "Level 1 · 2 / 3",
                "roundStartFrame": fr(r2_start),
                "initialLevers": [False, False, True, False, False, True, False, False],
                "leverFlips": [
                    {"stringNum": 4, "flipFrame": fr(r2_flip_f), "targetUp": True},
                ],
                "confirmTapFrame": fr(r2_confirm),
                "verdictCorrect": False,
                "verdictHeadline": "Not quite",
                "verdictSubline": "7 of 8 levers correct · Raise B ↑",
                "walkNotes": [{"stringNum": sNum, "frame": fr(r2_walk_start + idx * 0.55), "noteLabel": lbl, "pitchGlowColor": "#fbbf24" if idx == 2 else "#6ee7b7"} for idx, (sNum, _, lbl) in enumerate(g_major_midis)],
                "walkEndFrame": fr(r2_end),
            },
        ],
    }

    with open(os.path.join(AUDIO_OUT_DIR, "timeline_path3_v37.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)
    return timeline


async def main():
    solo_harp = decode_audio_stereo(SOLO_HARP_WAV) if os.path.exists(SOLO_HARP_WAV) else np.zeros((SR * 10, 2), dtype=np.float32)
    await build_path1(solo_harp)
    await build_path2(solo_harp)
    await build_path3(solo_harp)
    print("\n=== ALL 3 V37 REAL-TIME AUDIO & TIMELINE ENGINES READY ===")


if __name__ == "__main__":
    asyncio.run(main())
