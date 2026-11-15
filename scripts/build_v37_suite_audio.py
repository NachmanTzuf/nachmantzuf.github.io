"""
Earpa V38 Suite Audio & Frame-Exact Timeline Generator
Produces:
  1. earpa-video/public/audio/instructions/path1_motion_v37.mp3 + timeline_path1_v37.json
  2. earpa-video/public/audio/instructions/path2_motion_v37.mp3 + timeline_path2_v37.json
  3. earpa-video/public/audio/instructions/path3_motion_v37.mp3 + timeline_path3_v37.json

Enforces real live app timings from InGamePlayScreen.tsx & LeverTrainingScreen.tsx:
  - Cadence I -> IV -> V -> I: [0.00, 0.95, 1.90, 2.85] -> hold 1.60s = 4.45s + 0.24s gap = 4.69s to mystery onset
  - Distinct, intuitive Thinking -> Deciding -> Locking In -> App Confirming -> Walkdown phases
  - Zero technical jargon; plain intuitive guidance; generous 1.85s Lock-In check pause before confirmation
  - Expanded Circle of Fifths + Camac lever step-by-step walkthrough in Path 3
  - Walkdown speed: Single Notes = 0.95s/step; Melody 60 BPM = 1.00s/note; Levers scale walk = 0.55s/note
"""

import asyncio
import json
import os
import subprocess
import edge_tts
import numpy as np
import scipy.io.wavfile as wav
import scipy.signal as signal

SR = 44100
FPS = 30
VOICE = "en-US-ChristopherNeural"
RATE = "-6%"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AUDIO_OUT_DIR = os.path.join(ROOT_DIR, "earpa-video", "public", "audio", "instructions")
SOLO_HARP_WAV = os.path.join(ROOT_DIR, "earpa-video", "public", "audio", "real_celtic_harp_solo_artist.wav")
CACHE_DIR = os.path.join(AUDIO_OUT_DIR, "_v38_tts_cache")

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
                cur_rate = RATE if attempt < 4 else "-5%"
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

    att = min(int(0.005 * SR), n_samples)
    out[:att] *= np.linspace(0.0, 1.0, att)
    rel = min(int(0.09 * SR), n_samples)
    out[-rel:] *= np.linspace(1.0, 0.0, rel)

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
    dur = 0.08 if not is_confirm else 0.14
    n = int(dur * SR)
    t = np.linspace(0.0, dur, n, endpoint=False)
    env = np.exp(-t * (55.0 if not is_confirm else 34.0))
    wave = (np.sin(2.0 * np.pi * pitch_hz * t) * 0.65 + np.sin(2.0 * np.pi * pitch_hz * 1.5 * t) * 0.25) * env * 0.30
    return np.stack([wave, wave], axis=1).astype(np.float32)


def synth_lever_click(up: bool = True) -> np.ndarray:
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
    [48, 60, 64, 67],  # I  (+2.85s -> end 4.45s + 0.24s gap = 4.69s mystery onset)
]
CAD_OFFSETS = [0.00, 0.95, 1.90, 2.85]
CAD_DURS = [1.05, 1.05, 1.05, 1.65]
PRE_MYSTERY_ONSET = 4.69


def build_cadence(master: np.ndarray, start_sec: float, gain: float = 0.92):
    for ci, ch in enumerate(CADENCE_C_MAJOR):
        mix_stereo(master, synth_rolled_chord(ch, CAD_DURS[ci], 0.34), start_sec + CAD_OFFSETS[ci], gain)
    return [fr(start_sec + off) for off in CAD_OFFSETS]


async def build_path1(solo_harp: np.ndarray):
    print("\n--- BUILDING PATH 1 (SINGLE NOTES) V38 AUDIO & TIMELINE ---")
    lines = {
        "p1_intro": "Welcome to Path One: Single Notes. Learn to hear any note by feeling how it pulls toward home C.",
        "p1_grav_low": "Picture the scale split cleanly in two. F, E, and D sit in the lower half and pull gently down to low C.",
        "p1_grav_high": "G, A, and B sit in the upper half and pull bright and high toward upper C. That balanced pull is the whole method.",
        "p1_map": "Choose any level on the map, then press Play to start listening.",
        "p1_r1_pre": "Round one begins by playing the home chords, followed by one mystery note.",
        "p1_r1_think": "Take a quiet second to think. Hum low C in your mind and notice which way the note leans.",
        "p1_r1_decide": "Once you decide, tap F to lock in your answer.",
        "p1_r1_verdict": "The app checks your choice right away: spot on, it is F. Now listen as F steps down to home C.",
        "p1_r2_pre": "Round two uses the exact same chords and pace.",
        "p1_r2_think": "Think again and hum home C. Feel whether this new pitch pulls down or reaches upward.",
        "p1_r2_decide": "Watch what happens if you decide on G and tap to lock it in.",
        "p1_r2_verdict": "The app confirms straight away: wrong note, that was B. It shows the real note, then walks B straight up to high C.",
        "p1_ins_a": "After fifteen rounds, your summary shows how many you got right and your average response time.",
        "p1_ins_b": "Check your weakest note at the bottom so you know what to practice next.",
        "p1_outro": "Pause, hum home C, lock in your answer, and trust your ear.",
    }
    clips = {k: await synth_tts_clip(f"v38_{k}", v) for k, v in lines.items()}
    durs = {k: len(v) / SR for k, v in clips.items()}

    t = 0.0
    s_intro_start = t
    intro_voice_start = 0.35
    s_intro_end = max(6.4, intro_voice_start + durs["p1_intro"] + 0.55)

    t = s_intro_end
    s_concept_start = t
    grav_low_start = t + 0.40
    grav_low_walk = grav_low_start + durs["p1_grav_low"] + 0.15
    grav_high_start = grav_low_walk + 2.15
    grav_high_walk = grav_high_start + durs["p1_grav_high"] + 0.15
    s_concept_end = grav_high_walk + 1.85

    t = s_concept_end
    s_map_start = t
    map_voice_start = t + 0.30
    map_tap_play = max(map_voice_start + durs["p1_map"] - 0.55, t + 3.2)
    s_map_end = max(map_voice_start + durs["p1_map"] + 0.65, map_tap_play + 0.90)

    # Round 1: Think -> Decide -> Lock-In (1.85s check beat!) -> App Confirmation -> Walkdown
    t = s_map_end
    s_ingame_start = t
    r1_pre = t + 0.25
    r1_cad_start = r1_pre + durs["p1_r1_pre"] + 0.25
    r1_mys = r1_cad_start + PRE_MYSTERY_ONSET
    r1_think_voice = r1_mys + 0.65
    r1_think_silent_end = r1_think_voice + durs["p1_r1_think"] + 1.15
    r1_decide_voice = r1_think_silent_end
    r1_tap = r1_decide_voice + durs["p1_r1_decide"] - 0.10
    r1_lockin_dur = 1.85  # Crystal clear "LOCKED IN · Checking..." pause before verdict!
    r1_verdict_frame = r1_tap + r1_lockin_dur
    r1_verdict_voice = r1_verdict_frame + 0.15
    r1_walk_start = r1_verdict_voice + durs["p1_r1_verdict"] + 0.20
    r1_end = r1_walk_start + 3 * 0.95 + 1.35

    # Round 2: B - Intentional wrong guess G -> Lock-In -> Clear Wrong Confirmation -> B->C5
    r2_pre = r1_end
    r2_cad_start = r2_pre + durs["p1_r2_pre"] + 0.25
    r2_mys = r2_cad_start + PRE_MYSTERY_ONSET
    r2_think_voice = r2_mys + 0.65
    r2_think_silent_end = r2_think_voice + durs["p1_r2_think"] + 1.15
    r2_decide_voice = r2_think_silent_end
    r2_tap = r2_decide_voice + durs["p1_r2_decide"] - 0.10
    r2_lockin_dur = 1.85
    r2_verdict_frame = r2_tap + r2_lockin_dur
    r2_verdict_voice = r2_verdict_frame + 0.15
    r2_walk_start = r2_verdict_voice + durs["p1_r2_verdict"] + 0.20
    r2_end = r2_walk_start + 1 * 0.95 + 1.75
    s_ingame_end = r2_end

    s_insights_start = s_ingame_end
    ins_a = s_insights_start + 0.35
    ins_b = ins_a + durs["p1_ins_a"] + 0.30
    s_insights_end = ins_b + durs["p1_ins_b"] + 0.65

    s_outro_start = s_insights_end
    outro_voice = s_outro_start + 0.40
    total_dur = max(s_outro_start + 4.8, outro_voice + durs["p1_outro"] + 1.6)

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

    for cname, tstart in [
        ("p1_intro", intro_voice_start),
        ("p1_grav_low", grav_low_start),
        ("p1_grav_high", grav_high_start),
        ("p1_map", map_voice_start),
        ("p1_r1_pre", r1_pre),
        ("p1_r1_think", r1_think_voice),
        ("p1_r1_decide", r1_decide_voice),
        ("p1_r1_verdict", r1_verdict_voice),
        ("p1_r2_pre", r2_pre),
        ("p1_r2_think", r2_think_voice),
        ("p1_r2_decide", r2_decide_voice),
        ("p1_r2_verdict", r2_verdict_voice),
        ("p1_ins_a", ins_a),
        ("p1_ins_b", ins_b),
        ("p1_outro", outro_voice),
    ]:
        mix_stereo(master, clips[cname], tstart, 1.0)

    for idx, m in enumerate([60, 64, 67, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.3, 0.40, pan=-0.2 + idx * 0.12), s_intro_start + 0.15 + idx * 0.24, 0.72)

    for idx, m in enumerate([65, 64, 62, 60]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.6, 0.62, pan=-0.12), grav_low_walk + idx * 0.44, 0.85)
    for idx, m in enumerate([67, 69, 71, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.6, 0.62, pan=0.12), grav_high_walk + idx * 0.44, 0.85)

    mix_stereo(master, synth_ui_tap(680.0, True), map_tap_play, 0.9)

    r1_cad_frames = build_cadence(master, r1_cad_start)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(65), 2.5, 0.82, pan=-0.05), r1_mys, 1.0)
    mix_stereo(master, synth_ui_tap(720.0, True), r1_tap, 0.95)
    r1_walk_notes = [(4, 65, "F"), (3, 64, "E"), (2, 62, "D"), (1, 60, "C")]
    for idx, (_, midi, _) in enumerate(r1_walk_notes):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(midi), 1.8 if idx < 3 else 2.5, 0.75, pan=-0.04), r1_walk_start + idx * 0.95, 1.0)

    r2_cad_frames = build_cadence(master, r2_cad_start)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(71), 2.5, 0.82, pan=0.06), r2_mys, 1.0)
    mix_stereo(master, synth_ui_tap(540.0, True), r2_tap, 0.95)
    r2_walk_notes = [(7, 71, "B"), (8, 72, "C⁵")]
    for idx, (_, midi, _) in enumerate(r2_walk_notes):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(midi), 1.8 if idx == 0 else 2.6, 0.76, pan=0.10), r2_walk_start + idx * 0.95, 1.0)

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
                "humCueEndFrame": fr(r1_decide_voice - 0.1),
                "decideStartFrame": fr(r1_decide_voice),
                "keyTaps": [{"keyIndex": 3, "tapFrame": fr(r1_tap), "isCorrect": True, "label": "F"}],
                "lockInBanner": "LOCKED IN · YOUR GUESS: F",
                "verdictFrame": fr(r1_verdict_frame),
                "verdictCorrect": True,
                "verdictTitle": "Right Answer!",
                "verdictDetail": "Your guess F matches · Note F",
                "walkPlucks": [{"stringNum": sNum, "frame": fr(r1_walk_start + idx * 0.95), "noteLabel": lbl} for idx, (sNum, _, lbl) in enumerate(r1_walk_notes)],
                "walkEndFrame": fr(r1_end),
            },
            {
                "roundNumber": 2,
                "roundStartFrame": fr(r2_pre),
                "cadenceChordFrames": r2_cad_frames,
                "mysteryPluckFrames": [fr(r2_mys)],
                "mysteryStrings": [7],
                "humCueStartFrame": fr(r2_think_voice + 0.2),
                "humCueEndFrame": fr(r2_decide_voice - 0.1),
                "decideStartFrame": fr(r2_decide_voice),
                "keyTaps": [{"keyIndex": 4, "tapFrame": fr(r2_tap), "isCorrect": False, "label": "G"}],
                "lockInBanner": "LOCKED IN · YOUR GUESS: G",
                "verdictFrame": fr(r2_verdict_frame),
                "verdictCorrect": False,
                "verdictTitle": "Wrong Note",
                "verdictDetail": "You guessed G · Actual note: B",
                "actualKeyIndex": 6,
                "walkPlucks": [{"stringNum": sNum, "frame": fr(r2_walk_start + idx * 0.95), "noteLabel": lbl} for idx, (sNum, _, lbl) in enumerate(r2_walk_notes)],
                "walkEndFrame": fr(r2_end),
            },
        ],
    }
    with open(os.path.join(AUDIO_OUT_DIR, "timeline_path1_v37.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)
    return timeline


async def build_path2(solo_harp: np.ndarray):
    print("\n--- BUILDING PATH 2 (MELODY PHRASING) V38 AUDIO & TIMELINE ---")
    lines = {
        "p2_intro": "Welcome to Path Two: Melodic Memory. Catch short tunes as one connected shape.",
        "p2_concept": "First anchor the starting note to home C, then follow whether the melody steps up or down.",
        "p2_map": "Pick Sequence Four on the map, then tap Play to begin.",
        "p2_r1_pre": "Round one plays the home chords, followed by a three-note melody.",
        "p2_r1_think": "Pause and hum home C. Hear the melody climb cleanly from the bottom upward.",
        "p2_r1_decide": "Now tap the three notes in order—C, E, then G—to lock in your choice.",
        "p2_r1_verdict": "The app checks your three notes and confirms you got it right. Hear the melody back in steady time.",
        "p2_r2_pre": "Round two keeps the exact same speed and chords.",
        "p2_r2_think": "Think and hum home C again. Notice this tune starts higher and walks back down.",
        "p2_r2_decide": "Watch what happens if you decide on C, G, E and lock in those three taps.",
        "p2_r2_verdict": "The app tells you right away that guess is wrong—it really played G, E, C. Now listen to the true tune.",
        "p2_ins": "Your end summary tracks your score, response speed, and which note tripped you up most.",
        "p2_outro": "Hear the shape, tap it in order, lock it in, and build melodic memory.",
    }
    clips = {k: await synth_tts_clip(f"v38_{k}", v) for k, v in lines.items()}
    durs = {k: len(v) / SR for k, v in clips.items()}

    t = 0.0
    s_intro_start = t
    intro_voice = 0.35
    s_intro_end = max(6.2, intro_voice + durs["p2_intro"] + 0.55)

    t = s_intro_end
    s_concept_start = t
    con_voice = t + 0.35
    con_demo_start = con_voice + durs["p2_concept"] + 0.25
    s_concept_end = con_demo_start + 3.25

    t = s_concept_end
    s_map_start = t
    map_voice = t + 0.30
    map_tap_play = max(map_voice + durs["p2_map"] - 0.50, t + 3.1)
    s_map_end = max(map_voice + durs["p2_map"] + 0.65, map_tap_play + 0.90)

    # Round 1: C - E - G @ 60 BPM -> Think -> Decide & tap C, E, G -> 1.85s Lock-In check -> Right Verdict -> Replay
    t = s_map_end
    s_ingame_start = t
    r1_pre = t + 0.25
    r1_cad_start = r1_pre + durs["p2_r1_pre"] + 0.25
    r1_m1 = r1_cad_start + PRE_MYSTERY_ONSET
    r1_m2 = r1_m1 + 1.00
    r1_m3 = r1_m1 + 2.00
    r1_think_voice = r1_m3 + 0.65
    r1_think_silent_end = r1_think_voice + durs["p2_r1_think"] + 1.15
    r1_decide_voice = r1_think_silent_end
    dec1_dur = durs["p2_r1_decide"]
    r1_tap1 = r1_decide_voice + max(1.0, dec1_dur * 0.42)
    r1_tap2 = r1_tap1 + 0.78
    r1_tap3 = max(r1_tap2 + 0.78, r1_decide_voice + dec1_dur - 0.05)
    r1_verdict_frame = r1_tap3 + 1.85
    r1_verdict_voice = r1_verdict_frame + 0.15
    r1_walk_start = r1_verdict_voice + durs["p2_r1_verdict"] + 0.20
    r1_end = r1_walk_start + 2.00 + 1.45

    # Round 2: G - E - C -> Think -> Decide wrong C-G-E -> 1.85s Lock-In check -> Wrong Verdict -> Replay G-E-C
    r2_pre = r1_end
    r2_cad_start = r2_pre + durs["p2_r2_pre"] + 0.25
    r2_m1 = r2_cad_start + PRE_MYSTERY_ONSET
    r2_m2 = r2_m1 + 1.00
    r2_m3 = r2_m1 + 2.00
    r2_think_voice = r2_m3 + 0.65
    r2_think_silent_end = r2_think_voice + durs["p2_r2_think"] + 1.15
    r2_decide_voice = r2_think_silent_end
    dec2_dur = durs["p2_r2_decide"]
    r2_tap1 = r2_decide_voice + max(1.0, dec2_dur * 0.42)
    r2_tap2 = r2_tap1 + 0.78
    r2_tap3 = max(r2_tap2 + 0.78, r2_decide_voice + dec2_dur - 0.05)
    r2_verdict_frame = r2_tap3 + 1.85
    r2_verdict_voice = r2_verdict_frame + 0.15
    r2_walk_start = r2_verdict_voice + durs["p2_r2_verdict"] + 0.20
    r2_end = r2_walk_start + 2.00 + 1.55
    s_ingame_end = r2_end

    s_insights_start = s_ingame_end
    ins_voice = s_insights_start + 0.35
    s_insights_end = max(s_insights_start + 5.4, ins_voice + durs["p2_ins"] + 0.70)

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

    for cname, tstart in [
        ("p2_intro", intro_voice),
        ("p2_concept", con_voice),
        ("p2_map", map_voice),
        ("p2_r1_pre", r1_pre),
        ("p2_r1_think", r1_think_voice),
        ("p2_r1_decide", r1_decide_voice),
        ("p2_r1_verdict", r1_verdict_voice),
        ("p2_r2_pre", r2_pre),
        ("p2_r2_think", r2_think_voice),
        ("p2_r2_decide", r2_decide_voice),
        ("p2_r2_verdict", r2_verdict_voice),
        ("p2_ins", ins_voice),
        ("p2_outro", outro_voice),
    ]:
        mix_stereo(master, clips[cname], tstart, 1.0)

    for idx, m in enumerate([60, 64, 67, 72]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.2, 0.38, pan=-0.2 + idx * 0.12), s_intro_start + 0.2 + idx * 0.24, 0.72)
    for idx, m in enumerate([60, 64, 67]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.8, 0.68, pan=-0.15 + idx * 0.15), con_demo_start + idx * 1.00, 0.90)
    mix_stereo(master, synth_ui_tap(680.0, True), map_tap_play, 0.9)

    r1_cad_frames = build_cadence(master, r1_cad_start)
    for idx, (m, tpos) in enumerate(zip([60, 64, 67], [r1_m1, r1_m2, r1_m3])):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.1, 0.78, pan=-0.12 + idx * 0.12), tpos, 1.0)
    for tp, hz, conf in [(r1_tap1, 620.0, False), (r1_tap2, 680.0, False), (r1_tap3, 740.0, True)]:
        mix_stereo(master, synth_ui_tap(hz, conf), tp, 0.92)
    r1_replay = [(1, 60, "C"), (3, 64, "E"), (5, 67, "G")]
    for idx, (_, m, _) in enumerate(r1_replay):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.0, 0.75), r1_walk_start + idx * 1.00, 1.0)

    r2_cad_frames = build_cadence(master, r2_cad_start)
    for idx, (m, tpos) in enumerate(zip([67, 64, 60], [r2_m1, r2_m2, r2_m3])):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.1, 0.78, pan=0.12 - idx * 0.12), tpos, 1.0)
    for tp, hz, conf in [(r2_tap1, 560.0, False), (r2_tap2, 540.0, False), (r2_tap3, 520.0, True)]:
        mix_stereo(master, synth_ui_tap(hz, conf), tp, 0.92)
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
                "humCueStartFrame": fr(r1_think_voice + 0.2),
                "humCueEndFrame": fr(r1_decide_voice - 0.1),
                "decideStartFrame": fr(r1_decide_voice),
                "keyTaps": [
                    {"keyIndex": 0, "tapFrame": fr(r1_tap1), "isCorrect": True, "label": "C"},
                    {"keyIndex": 2, "tapFrame": fr(r1_tap2), "isCorrect": True, "label": "E"},
                    {"keyIndex": 4, "tapFrame": fr(r1_tap3), "isCorrect": True, "label": "G"},
                ],
                "slotNotes": [
                    {"note": "C", "revealFrame": fr(r1_tap1)},
                    {"note": "E", "revealFrame": fr(r1_tap2)},
                    {"note": "G", "revealFrame": fr(r1_tap3)},
                ],
                "lockInBanner": "LOCKED IN · C · E · G",
                "verdictFrame": fr(r1_verdict_frame),
                "verdictCorrect": True,
                "verdictTitle": "Right Answer!",
                "verdictDetail": "Your sequence C · E · G matches",
                "walkPlucks": [{"stringNum": s, "frame": fr(r1_walk_start + idx * 1.00), "noteLabel": lbl} for idx, (s, _, lbl) in enumerate(r1_replay)],
                "walkEndFrame": fr(r1_end),
            },
            {
                "roundNumber": 2,
                "roundStartFrame": fr(r2_pre),
                "cadenceChordFrames": r2_cad_frames,
                "mysteryPluckFrames": [fr(r2_m1), fr(r2_m2), fr(r2_m3)],
                "mysteryStrings": [5, 3, 1],
                "humCueStartFrame": fr(r2_think_voice + 0.2),
                "humCueEndFrame": fr(r2_decide_voice - 0.1),
                "decideStartFrame": fr(r2_decide_voice),
                "keyTaps": [
                    {"keyIndex": 0, "tapFrame": fr(r2_tap1), "isCorrect": False, "label": "C"},
                    {"keyIndex": 4, "tapFrame": fr(r2_tap2), "isCorrect": False, "label": "G"},
                    {"keyIndex": 2, "tapFrame": fr(r2_tap3), "isCorrect": False, "label": "E"},
                ],
                "slotNotes": [
                    {"note": "C", "revealFrame": fr(r2_tap1)},
                    {"note": "G", "revealFrame": fr(r2_tap2)},
                    {"note": "E", "revealFrame": fr(r2_tap3)},
                ],
                "lockInBanner": "LOCKED IN · C · G · E",
                "verdictFrame": fr(r2_verdict_frame),
                "verdictCorrect": False,
                "verdictTitle": "Wrong Sequence",
                "verdictDetail": "You guessed C · G · E · Real: G · E · C",
                "walkPlucks": [{"stringNum": s, "frame": fr(r2_walk_start + idx * 1.00), "noteLabel": lbl} for idx, (s, _, lbl) in enumerate(r2_replay)],
                "walkEndFrame": fr(r2_end),
            },
        ],
    }
    with open(os.path.join(AUDIO_OUT_DIR, "timeline_path2_v37.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)
    return timeline


async def build_path3(solo_harp: np.ndarray):
    print("\n--- BUILDING PATH 3 (CAMAC LEVERS) V38 AUDIO & TIMELINE ---")
    lines = {
        "p3_intro": "Welcome to Path Three: Camac Levers. Learn how levers move your harp smoothly from one major key to another.",
        "p3_con_tuning": "Start with one simple rule. Celtic harps are most commonly tuned to E-flat major when every lever is flipped down.",
        "p3_con_raise": "Flicking a lever up gently tightens that string, raising its note one notch higher.",
        "p3_con_order": "To know which levers to lift for any key, read the Circle of Fifths like a clock. Every clockwise step adds one more lever up in the exact order: A, E, B, F, C, G, then D.",
        "p3_con_step1": "Watch it build. Start at E-flat with zero levers up. Step clockwise to B-flat, and lift lever A.",
        "p3_con_step2": "Step one more to F major, and add lever E.",
        "p3_con_step3": "Step to C major and add B, then G major and add F. Keep stepping around the clock in that exact order.",
        "p3_circle": "In the app's Circle Guide, tap any key around the wheel to preview its levers before you practice, then press Continue.",
        "p3_r1_think": "Round one asks for F major. Pause and count two clockwise steps from E-flat: A and E need to go up.",
        "p3_r1_decide": "Now decide your setup by tapping A and E up on the harp strings or bottom buttons.",
        "p3_r1_lockin": "Once both levers look right, press Confirm scale to lock in your choice.",
        "p3_r1_verdict": "The app checks all eight levers and confirms you got it right, then plays F major cleanly start to finish.",
        "p3_r2_think": "Round two asks for G major, which needs four levers raised: A, E, B, and F.",
        "p3_r2_decide": "Suppose you raise F, forget to raise B, and press Confirm scale to lock it in.",
        "p3_r2_verdict": "The app tells you right away that setup is wrong and highlights the missed B lever while playing the true G major scale.",
        "p3_comp": "When all rounds finish, your completion card shows every matched scale so you are ready for harder keys.",
        "p3_outro": "Follow the Circle of Fifths, set your levers, lock them in with Confirm, and shift keys smoothly.",
    }
    clips = {k: await synth_tts_clip(f"v38_{k}", v) for k, v in lines.items()}
    durs = {k: len(v) / SR for k, v in clips.items()}

    t = 0.0
    s_intro_start = t
    intro_voice = 0.35
    s_intro_end = max(6.4, intro_voice + durs["p3_intro"] + 0.55)

    # Expanded Concept: Tuning -> Lever Mechanic -> Circle Order -> Step-by-Step Eb -> Bb -> F -> C -> G
    t = s_intro_end
    s_concept_start = t
    c_tuning = t + 0.35
    c_raise = c_tuning + durs["p3_con_tuning"] + 0.45
    con_flip_1 = c_raise + 1.4
    con_flip_3 = con_flip_1 + 1.0
    c_order = max(c_raise + durs["p3_con_raise"], con_flip_3 + 0.9) + 0.45
    c_step1 = c_order + durs["p3_con_order"] + 0.45
    step_eb_frame = c_step1 + 0.8
    step_bb_frame = c_step1 + max(2.6, durs["p3_con_step1"] - 0.5)
    c_step2 = c_step1 + durs["p3_con_step1"] + 0.55
    step_f_frame = c_step2 + max(1.4, durs["p3_con_step2"] - 0.4)
    c_step3 = c_step2 + durs["p3_con_step2"] + 0.55
    step_c_frame = c_step3 + 0.8
    step_g_frame = c_step3 + 2.35
    s_concept_end = c_step3 + durs["p3_con_step3"] + 0.90

    t = s_concept_end
    s_circle_start = t
    cir_voice = t + 0.30
    cir_tap = max(cir_voice + durs["p3_circle"] - 0.50, t + 4.5)
    s_circle_end = max(cir_voice + durs["p3_circle"] + 0.65, cir_tap + 0.90)

    # Round 1: F Major -> Think -> Flip A & E -> Tap Confirm to Lock In -> 1.85s Checking beat -> Confirmed Right + Walk
    t = s_circle_end
    s_ingame_start = t
    r1_start = t
    r1_think_voice = r1_start + 0.35
    r1_think_end = r1_think_voice + durs["p3_r1_think"] + 0.85
    r1_decide_voice = r1_think_end
    r1_flip_a = r1_decide_voice + 1.7
    r1_flip_e = r1_flip_a + 1.15
    r1_lockin_voice = max(r1_decide_voice + durs["p3_r1_decide"], r1_flip_e + 0.45) + 0.30
    r1_confirm = r1_lockin_voice + durs["p3_r1_lockin"] - 0.15
    r1_verdict_frame = r1_confirm + 1.85
    r1_verdict_voice = r1_verdict_frame + 0.15
    r1_walk_start = r1_verdict_voice + durs["p3_r1_verdict"] + 0.20
    r1_end = r1_walk_start + 7 * 0.55 + 1.35

    # Round 2: G Major -> Think -> Flip F, skip B -> Tap Confirm to Lock In -> 1.85s Checking beat -> Wrong + Walk
    r2_start = r1_end
    r2_think_voice = r2_start + 0.35
    r2_think_end = r2_think_voice + durs["p3_r2_think"] + 0.65
    r2_decide_voice = r2_think_end
    r2_flip_f = r2_decide_voice + 1.65
    r2_confirm = r2_decide_voice + durs["p3_r2_decide"] - 0.10
    r2_verdict_frame = r2_confirm + 1.85
    r2_verdict_voice = r2_verdict_frame + 0.15
    r2_walk_start = r2_verdict_voice + durs["p3_r2_verdict"] + 0.20
    r2_end = r2_walk_start + 7 * 0.55 + 1.45
    s_ingame_end = r2_end

    s_complete_start = s_ingame_end
    comp_voice = s_complete_start + 0.35
    s_complete_end = max(s_complete_start + 5.2, comp_voice + durs["p3_comp"] + 0.70)

    s_outro_start = s_complete_end
    outro_voice = s_outro_start + 0.40
    total_dur = max(s_outro_start + 4.8, outro_voice + durs["p3_outro"] + 1.5)

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

    for cname, tstart in [
        ("p3_intro", intro_voice),
        ("p3_con_tuning", c_tuning),
        ("p3_con_raise", c_raise),
        ("p3_con_order", c_order),
        ("p3_con_step1", c_step1),
        ("p3_con_step2", c_step2),
        ("p3_con_step3", c_step3),
        ("p3_circle", cir_voice),
        ("p3_r1_think", r1_think_voice),
        ("p3_r1_decide", r1_decide_voice),
        ("p3_r1_lockin", r1_lockin_voice),
        ("p3_r1_verdict", r1_verdict_voice),
        ("p3_r2_think", r2_think_voice),
        ("p3_r2_decide", r2_decide_voice),
        ("p3_r2_verdict", r2_verdict_voice),
        ("p3_comp", comp_voice),
        ("p3_outro", outro_voice),
    ]:
        mix_stereo(master, clips[cname], tstart, 1.0)

    for idx, m in enumerate([63, 67, 70, 75]):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 2.1, 0.38, pan=-0.2 + idx * 0.12), s_intro_start + 0.2 + idx * 0.25, 0.72)

    # Concept mechanical clicks + soft step chimes
    mix_stereo(master, synth_lever_click(True), con_flip_1, 0.85)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(60), 1.4, 0.45), con_flip_1 + 0.07, 0.72)
    mix_stereo(master, synth_lever_click(True), con_flip_3, 0.85)
    mix_stereo(master, synth_harp_pluck(midi_to_freq(64), 1.4, 0.45), con_flip_3 + 0.07, 0.72)

    for st_sec, midi in [(step_bb_frame, 70), (step_f_frame, 65), (step_c_frame, 72), (step_g_frame, 67)]:
        mix_stereo(master, synth_lever_click(True), st_sec, 0.80)
        mix_stereo(master, synth_harp_pluck(midi_to_freq(midi), 1.2, 0.42), st_sec + 0.05, 0.70)

    mix_stereo(master, synth_ui_tap(660.0, True), cir_tap, 0.90)

    for ft in [r1_flip_a, r1_flip_e]:
        mix_stereo(master, synth_lever_click(True), ft, 0.95)
    mix_stereo(master, synth_ui_tap(720.0, True), r1_confirm, 0.95)
    f_major_midis = [(4, 65, "F"), (5, 67, "G"), (6, 69, "A"), (7, 70, "B♭"), (8, 72, "C"), (2, 74, "D"), (3, 76, "E"), (4, 77, "F")]
    for idx, (_, m, _) in enumerate(f_major_midis):
        mix_stereo(master, synth_harp_pluck(midi_to_freq(m), 1.4 if idx < 7 else 2.2, 0.76), r1_walk_start + idx * 0.55, 1.0)

    mix_stereo(master, synth_lever_click(True), r2_flip_f, 0.95)
    mix_stereo(master, synth_ui_tap(520.0, True), r2_confirm, 0.95)
    g_major_midis = [(5, 67, "G"), (6, 69, "A"), (7, 71, "B"), (8, 72, "C"), (2, 74, "D"), (3, 76, "E"), (4, 78, "F♯"), (5, 79, "G")]
    for idx, (_, m, _) in enumerate(g_major_midis):
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
            "conceptLeverFrame": fr(con_flip_1),
            "conceptOrderFrame": fr(c_order),
            "circleStepFrames": [fr(step_eb_frame), fr(step_bb_frame), fr(step_f_frame), fr(step_c_frame), fr(step_g_frame)],
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
                "decideStartFrame": fr(r1_decide_voice),
                "lockInPromptFrame": fr(r1_lockin_voice),
                "initialLevers": [False, False, False, False, False, False, False, False],
                "leverFlips": [
                    {"stringNum": 6, "flipFrame": fr(r1_flip_a), "targetUp": True},
                    {"stringNum": 3, "flipFrame": fr(r1_flip_e), "targetUp": True},
                ],
                "confirmTapFrame": fr(r1_confirm),
                "verdictFrame": fr(r1_verdict_frame),
                "verdictCorrect": True,
                "verdictHeadline": "Right Setup!",
                "verdictSubline": "All 8 levers correct · A & E up for F major",
                "walkNotes": [{"stringNum": sNum, "frame": fr(r1_walk_start + idx * 0.55), "noteLabel": lbl} for idx, (sNum, _, lbl) in enumerate(f_major_midis)],
                "walkEndFrame": fr(r1_end),
            },
            {
                "scaleName": "G major",
                "roundLabel": "Level 1 · 2 / 3",
                "roundStartFrame": fr(r2_start),
                "decideStartFrame": fr(r2_decide_voice),
                "lockInPromptFrame": fr(r2_flip_f + 0.5),
                "initialLevers": [False, False, True, False, False, True, False, False],
                "leverFlips": [
                    {"stringNum": 4, "flipFrame": fr(r2_flip_f), "targetUp": True},
                ],
                "skippedStringNum": 7,
                "confirmTapFrame": fr(r2_confirm),
                "verdictFrame": fr(r2_verdict_frame),
                "verdictCorrect": False,
                "verdictHeadline": "Wrong Setup",
                "verdictSubline": "You raised F but missed B ↑ · Highlighted below",
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
    print("\n=== ALL 3 V38 REAL-TIME AUDIO & TIMELINE ENGINES READY ===")


if __name__ == "__main__":
    asyncio.run(main())
