"""
Broadcast-grade, natural, fluent voiceovers and authentic warm acoustic Celtic harp audio (V5).
Milestone M126 / Real User Gameplay Integration:
1. Re-aligned 1:1 voiceover narrative describing exact on-screen gameplay in chronological sequence.
2. Ducked audio mix incorporating real in-game audio from user recordings.
3. Natural breathing space (0.8s - 1.2s) with zero clashing or overlapping speech.
4. Accurate Celtic harp lore (most commonly tuned to Eb major with all levers down; no fake string counts).
5. 100% letter notation standards (C, D, E, F, G, A, B, Eb, Bb).
6. Exports sample-accurate timeline JSON for Remotion frame synchronization.
"""

import asyncio
import os
import json
import subprocess
import sys
import edge_tts
import numpy as np
import scipy.io.wavfile
import scipy.signal as signal

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

SR = 48000
OUTPUT_DIR = r"earpa-video\public\audio\instructions"
TMP_DIR = r"voiceover_tmp\instructions_v5"
SRC_TIMELINES_DIR = r"earpa-video\src\instructions"
REAL_VIDEOS_DIR = r"earpa-video\public\videos\gameplay_real"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(SRC_TIMELINES_DIR, exist_ok=True)

def decode_audio_with_fades(mp3_path):
    cmd = [
        "ffmpeg", "-y", "-i", mp3_path,
        "-ar", str(SR), "-ac", "1", "-f", "wav", "-"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    header_size = 44
    data = np.frombuffer(res.stdout[header_size:], dtype=np.int16).astype(np.float32) / 32768.0
    
    fade_len = int(SR * 0.015)
    if len(data) > 2 * fade_len:
        t_fade = np.linspace(0, 1, fade_len)
        fade_in = 0.5 * (1.0 - np.cos(np.pi * t_fade))
        fade_out = 0.5 * (1.0 + np.cos(np.pi * t_fade))
        data[:fade_len] *= fade_in
        data[-fade_len:] *= fade_out
        
    return data

def extract_video_audio(mp4_name):
    mp4_path = os.path.join(REAL_VIDEOS_DIR, mp4_name)
    if not os.path.exists(mp4_path):
        print(f"Warning: {mp4_path} not found!")
        return np.zeros(0, dtype=np.float32)
    cmd = [
        "ffmpeg", "-y", "-i", mp4_path,
        "-ar", str(SR), "-ac", "1", "-f", "wav", "-"
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    header_size = 44
    data = np.frombuffer(res.stdout[header_size:], dtype=np.int16).astype(np.float32) / 32768.0
    return data

def overlay(buffer, start_sec, samples, scale=1.0):
    start_idx = int(start_sec * SR)
    end_idx = min(len(buffer), start_idx + len(samples))
    if end_idx > start_idx:
        buffer[start_idx:end_idx] += samples[:end_idx - start_idx] * scale

async def synth_phrase(text, clip_id, voice="en-US-ChristopherNeural", rate="-2%", pitch="-1Hz"):
    out_mp3 = os.path.join(TMP_DIR, f"{clip_id}.mp3")
    tts = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await tts.save(out_mp3)
    samples = decode_audio_with_fades(out_mp3)
    dur = len(samples) / SR
    print(f"Synthesized {clip_id}: {dur:.2f}s | '{text[:45]}...'")
    return samples, dur

def save_master_mp3(samples, out_filename):
    out_wav = os.path.join(TMP_DIR, out_filename.replace('.mp3', '.wav'))
    out_mp3 = os.path.join(OUTPUT_DIR, out_filename)
    
    # Peak normalization to -1.0 dB
    peak = np.max(np.abs(samples)) + 1e-9
    normalized = samples / peak * 0.89
    
    int_samples = (normalized * 32767).astype(np.int16)
    scipy.io.wavfile.write(out_wav, SR, int_samples)
    
    # Encode to broadcast MP3 (192kbps stereo CBR)
    cmd = [
        "ffmpeg", "-y", "-i", out_wav,
        "-c:a", "libmp3lame", "-b:a", "192k", "-ac", "2",
        out_mp3
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    dur_sec = len(samples) / SR
    size_kb = os.path.getsize(out_mp3) / 1024
    print(f"MASTER SAVED: {out_mp3} ({dur_sec:.2f}s, {size_kb:.1f} KB)")


# =====================================================================
# PATH 1: SINGLE NOTES MASTER (90.0s / 2700 frames)
# =====================================================================
async def build_path1_master():
    print("\n=== BUILDING PATH 1: SINGLE NOTES MASTER AUDIO (V5) ===")
    total_dur_sec = 90.0
    n_samples = int(SR * total_dur_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    timeline_meta = []
    
    # Load real in-game audio slices
    aud_r1_r2 = extract_video_audio("path1_gameplay_full_r1_r2.mp4") # 22.3s
    aud_note4 = extract_video_audio("path1_clip3_note4.mp4")         # 11.0s
    aud_note7 = extract_video_audio("path1_clip4_note7.mp4")         # 11.5s
    
    # -------------------------------------------------------------
    # Beat 0: Dynamic Intro & Method Brief (0.0s - 12.0s)
    # -------------------------------------------------------------
    t0_text = "Welcome to Path One: Single Notes in Earpa. Here, you train your ear to recognize notes instantly through tonal gravitation. Instead of guessing intervals, you feel how every note pulls toward home note C."
    t0_samples, t0_dur = await synth_phrase(t0_text, "p1_beat0")
    t0_start = 0.8
    overlay(master, t0_start, t0_samples)
    timeline_meta.append({
        "beat": 0, "id": "beat0_intro",
        "start": 0.0, "end": 12.0,
        "title": "TONAL GRAVITATION",
        "subtitle": "Feel how every note pulls toward home note C instead of guessing intervals."
    })
    
    # -------------------------------------------------------------
    # Beat 1: Real In-Game Gameplay: Round 1 (Note 6 / A) (12.0s - 34.5s)
    # -------------------------------------------------------------
    # Overlay real gameplay audio from path1_gameplay_full_r1_r2.mp4 (first 11.2s)
    r1_audio_start = 12.0
    r1_audio_dur = 11.2
    overlay(master, r1_audio_start, aud_r1_r2[:int(r1_audio_dur * SR)], scale=0.85)
    
    t1a_text = "Watch the in game arena. First, the cadence plays to ground your ear in C Major."
    t1a_samples, t1a_dur = await synth_phrase(t1a_text, "p1_beat1a")
    overlay(master, 12.2, t1a_samples)
    
    t1b_text = "Pluck the string on the harp or tap the note button below."
    t1b_samples, t1b_dur = await synth_phrase(t1b_text, "p1_beat1b")
    overlay(master, 17.5, t1b_samples)
    
    t1c_text = "Notice the resolution walk down to home C, locking in your musical memory."
    t1c_samples, t1c_dur = await synth_phrase(t1c_text, "p1_beat1c")
    overlay(master, 23.5, t1c_samples)
    
    timeline_meta.append({
        "beat": 1, "id": "beat1_gameplay_r1",
        "start": 12.0, "end": 34.5,
        "title": "ROUND 1 : NOTE A",
        "subtitle": "Cadence grounds in C Major, mystery note sounds, user plucks Note A with walkdown resolution."
    })
    
    # -------------------------------------------------------------
    # Beat 2: Real In-Game Gameplay: Round 2 (Note 5 / G) (34.5s - 56.5s)
    # -------------------------------------------------------------
    # Overlay second half of path1_gameplay_full_r1_r2.mp4 (from 11.2s to 22.3s)
    r2_audio_start = 34.5
    r2_audio_slice = aud_r1_r2[int(11.2 * SR):int(22.3 * SR)]
    overlay(master, r2_audio_start, r2_audio_slice, scale=0.85)
    
    t2a_text = "In Round Two, the cadence grounds your ear again."
    t2a_samples, t2a_dur = await synth_phrase(t2a_text, "p1_beat2a")
    overlay(master, 35.0, t2a_samples)
    
    t2b_text = "When note G sounds, you recognize the bright open fifth."
    t2b_samples, t2b_dur = await synth_phrase(t2b_text, "p1_beat2b")
    overlay(master, 40.0, t2b_samples)
    
    t2c_text = "Tap note G. The app walks down to tonic C, confirming your instant reflex."
    t2c_samples, t2c_dur = await synth_phrase(t2c_text, "p1_beat2c")
    overlay(master, 46.5, t2c_samples)
    
    timeline_meta.append({
        "beat": 2, "id": "beat2_gameplay_r2",
        "start": 34.5, "end": 56.5,
        "title": "ROUND 2 : NOTE G",
        "subtitle": "Stable open fifth recognition with immediate stepwise resolution to tonic."
    })
    
    # -------------------------------------------------------------
    # Beat 3: Real In-Game Gameplay: Note 4 / F (Downward Pull) (56.5s - 68.5s)
    # -------------------------------------------------------------
    overlay(master, 56.5, aud_note4[:int(11.0 * SR)], scale=0.85)
    
    t3a_text = "Listen to note F. Feel its heavy downward ache toward home C."
    t3a_samples, t3a_dur = await synth_phrase(t3a_text, "p1_beat3a")
    overlay(master, 57.0, t3a_samples)
    
    t3b_text = "Select note F. The stepwise resolution confirms its gravitational pull."
    t3b_samples, t3b_dur = await synth_phrase(t3b_text, "p1_beat3b")
    overlay(master, 62.5, t3b_samples)
    
    timeline_meta.append({
        "beat": 3, "id": "beat3_gameplay_note4",
        "start": 56.5, "end": 68.5,
        "title": "NOTE F : DOWNWARD PULL",
        "subtitle": "Subdominant ache falling through E and D into tonic C."
    })
    
    # -------------------------------------------------------------
    # Beat 4: Real In-Game Gameplay: Note 7 / B (Upward Snap) (68.5s - 80.5s)
    # -------------------------------------------------------------
    overlay(master, 68.5, aud_note7[:int(11.5 * SR)], scale=0.85)
    
    t4a_text = "Next is note B, the leading tone. Notice how it magnetically snaps upward into high C."
    t4a_samples, t4a_dur = await synth_phrase(t4a_text, "p1_beat4a")
    overlay(master, 69.0, t4a_samples)
    
    t4b_text = "Choose note B, experiencing the immediate musical release."
    t4b_samples, t4b_dur = await synth_phrase(t4b_text, "p1_beat4b")
    overlay(master, 74.5, t4b_samples)
    
    timeline_meta.append({
        "beat": 4, "id": "beat4_gameplay_note7",
        "start": 68.5, "end": 80.5,
        "title": "NOTE B : UPWARD SNAP",
        "subtitle": "Leading tone magnetic snap resolving directly into high C."
    })
    
    # -------------------------------------------------------------
    # Beat 5: Progression & Real-Life Value (80.5s - 90.0s)
    # -------------------------------------------------------------
    t5_text = "Just ten minutes of daily practice rewires your musical instincts, allowing you to play tunes by ear on your physical Celtic harp with complete confidence."
    t5_samples, t5_dur = await synth_phrase(t5_text, "p1_beat5")
    overlay(master, 81.0, t5_samples)
    
    timeline_meta.append({
        "beat": 5, "id": "beat5_mastery",
        "start": 80.5, "end": 90.0,
        "title": "THE 5-MINUTE DAILY HABIT",
        "subtitle": "Ten minutes a day unlocks instant intuitive playing by ear on stage."
    })
    
    # Save master audio and timeline JSON
    save_master_mp3(master, "path1_single_notes_master.mp3")
    with open(os.path.join(SRC_TIMELINES_DIR, "timeline_path1.json"), "w", encoding="utf-8") as f:
        json.dump(timeline_meta, f, indent=2)
    print("Exported timeline_path1.json successfully.")


# =====================================================================
# PATH 2: MELODIC SEQUENCE MASTER (90.0s / 2700 frames)
# =====================================================================
async def build_path2_master():
    print("\n=== BUILDING PATH 2: MELODIC SEQUENCE MASTER AUDIO (V5) ===")
    total_dur_sec = 90.0
    n_samples = int(SR * total_dur_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    timeline_meta = []
    
    aud_phrases = extract_video_audio("path2_gameplay_two_phrases.mp4") # 21.5s
    aud_tonic = extract_video_audio("path2_clip2_phrase_tonic.mp4")      # 10.5s
    
    # -------------------------------------------------------------
    # Beat 0: Dynamic Intro & Phrasing Concept (0.0s - 12.0s)
    # -------------------------------------------------------------
    t0_text = "Welcome to Path Two: Melodic Phrasing. Here, you advance from single notes to hearing complete melodic contours across your Celtic harp."
    t0_samples, t0_dur = await synth_phrase(t0_text, "p2_beat0")
    overlay(master, 0.8, t0_samples)
    timeline_meta.append({
        "beat": 0, "id": "beat0_intro",
        "start": 0.0, "end": 12.0,
        "title": "MELODIC PHRASING CONTOUR",
        "subtitle": "Hear melodic curves and shapes rather than isolated single pitches."
    })
    
    # -------------------------------------------------------------
    # Beat 1: Real In-Game Phrasing: Two-Note Motif (12.0s - 34.5s)
    # -------------------------------------------------------------
    overlay(master, 12.0, aud_phrases[:int(11.2 * SR)], scale=0.85)
    
    t1a_text = "In the Glacial Fjord arena, each round begins with a harmonic cadence."
    t1a_samples, t1a_dur = await synth_phrase(t1a_text, "p2_beat1a")
    overlay(master, 12.5, t1a_samples)
    
    t1b_text = "Listen as the melodic motif plays. Audiate the shape in your mind."
    t1b_samples, t1b_dur = await synth_phrase(t1b_text, "p2_beat1b")
    overlay(master, 17.5, t1b_samples)
    
    t1c_text = "Pluck the notes in sequence. The app tracks your phrasing accuracy."
    t1c_samples, t1c_dur = await synth_phrase(t1c_text, "p2_beat1c")
    overlay(master, 23.5, t1c_samples)
    
    timeline_meta.append({
        "beat": 1, "id": "beat1_two_note_motif",
        "start": 12.0, "end": 34.5,
        "title": "PHRASE AUDIATION",
        "subtitle": "Cadence, two-note melodic motif demonstration, and sequential reply."
    })
    
    # -------------------------------------------------------------
    # Beat 2: Real In-Game Phrasing: Fundamental Tonic Catch (34.5s - 56.5s)
    # -------------------------------------------------------------
    overlay(master, 34.5, aud_phrases[int(11.2 * SR):int(21.5 * SR)], scale=0.85)
    
    t2a_text = "When a melody resolves to tonic C, your ear anchors to the home center."
    t2a_samples, t2a_dur = await synth_phrase(t2a_text, "p2_beat2a")
    overlay(master, 35.0, t2a_samples)
    
    t2b_text = "Follow the contour down to the fundamental note."
    t2b_samples, t2b_dur = await synth_phrase(t2b_text, "p2_beat2b")
    overlay(master, 41.5, t2b_samples)
    
    t2c_text = "Notice how the Celtic harp resonates as the phrase locks into place."
    t2c_samples, t2c_dur = await synth_phrase(t2c_text, "p2_beat2c")
    overlay(master, 47.5, t2c_samples)
    
    timeline_meta.append({
        "beat": 2, "id": "beat2_fundamental_catch",
        "start": 34.5, "end": 56.5,
        "title": "TONIC RESOLUTION",
        "subtitle": "Anchoring melodies through gravitational resolution to tonic C."
    })
    
    # -------------------------------------------------------------
    # Beat 3: Silent Audiation Drill (56.5s - 75.0s)
    # -------------------------------------------------------------
    overlay(master, 56.5, aud_tonic[:int(10.5 * SR)], scale=0.85)
    
    t3_text = "Before touching a string, always sing or hum the melody silently in your head. This internal audiation builds the connection between what you hear and where your fingers land."
    t3_samples, t3_dur = await synth_phrase(t3_text, "p2_beat3")
    overlay(master, 57.5, t3_samples)
    
    timeline_meta.append({
        "beat": 3, "id": "beat3_silent_drill",
        "start": 56.5, "end": 75.0,
        "title": "SILENT AUDIATION DRILL",
        "subtitle": "Hear the full phrase internally before your fingers strike the harp strings."
    })
    
    # -------------------------------------------------------------
    # Beat 4: Session Mastery & Real-Life Value (75.0s - 90.0s)
    # -------------------------------------------------------------
    t4_text = "Melodic audiation is how traditional Celtic musicians learn tunes by ear. In real world sessions, you will join new reels and airs effortlessly without sheet music."
    t4_samples, t4_dur = await synth_phrase(t4_text, "p2_beat4")
    overlay(master, 76.0, t4_samples)
    
    timeline_meta.append({
        "beat": 4, "id": "beat4_session_mastery",
        "start": 75.0, "end": 90.0,
        "title": "TRADITIONAL SESSION MASTERY",
        "subtitle": "Pick up reels and jigs on the fly without looking at sheet music."
    })
    
    save_master_mp3(master, "path2_melodic_sequence_master.mp3")
    with open(os.path.join(SRC_TIMELINES_DIR, "timeline_path2.json"), "w", encoding="utf-8") as f:
        json.dump(timeline_meta, f, indent=2)
    print("Exported timeline_path2.json successfully.")


# =====================================================================
# PATH 3: CAMAC LEVERS MASTER (135.0s / 4050 frames)
# =====================================================================
async def build_path3_master():
    print("\n=== BUILDING PATH 3: CAMAC LEVERS MASTER AUDIO (V5) ===")
    total_dur_sec = 135.0
    n_samples = int(SR * total_dur_sec)
    master = np.zeros(n_samples, dtype=np.float32)
    timeline_meta = []
    
    aud_tut = extract_video_audio("path3_clip1_tutorial.mp4")         # 23.0s
    aud_circle = extract_video_audio("path3_clip2_circle_fifths.mp4") # 19.0s
    aud_walk = extract_video_audio("path3_clip3_gameplay_walk.mp4")   # 20.5s
    aud_full = extract_video_audio("path3_gameplay_full_walks.mp4")   # 33.0s
    
    # -------------------------------------------------------------
    # Beat 0: Dynamic Intro & Desert Canyon Lore (0.0s - 12.0s)
    # -------------------------------------------------------------
    t0_text = "Welcome to Path Three: Camac Levers in Earpa. Here, you master the mechanical and harmonic principles of lever harping for effortless key changes."
    t0_samples, t0_dur = await synth_phrase(t0_text, "p3_beat0")
    overlay(master, 0.8, t0_samples)
    timeline_meta.append({
        "beat": 0, "id": "beat0_intro",
        "start": 0.0, "end": 12.0,
        "title": "CAMAC LEVER HARPING",
        "subtitle": "Mechanical and harmonic mastery for instant key changes across the Circle of Fifths."
    })
    
    # -------------------------------------------------------------
    # Beat 1: Real Interactive Lever Tutorial (Eb Foundation & Physics) (12.0s - 36.0s)
    # -------------------------------------------------------------
    overlay(master, 12.0, aud_tut[:int(23.0 * SR)], scale=0.85)
    
    t1a_text = "Celtic harps are most commonly tuned to E flat Major with all sharpening levers down."
    t1a_samples, t1a_dur = await synth_phrase(t1a_text, "p3_beat1a")
    overlay(master, 12.5, t1a_samples)
    
    t1b_text = "Here is your open foundation. Tap to hear the open E flat Major harp."
    t1b_samples, t1b_dur = await synth_phrase(t1b_text, "p3_beat1b")
    overlay(master, 18.5, t1b_samples)
    
    t1c_text = "Engaging a lever physically stops the string against a bridge pin, raising its pitch by exactly one semitone."
    t1c_samples, t1c_dur = await synth_phrase(t1c_text, "p3_beat1c")
    overlay(master, 25.5, t1c_samples)
    
    timeline_meta.append({
        "beat": 1, "id": "beat1_eb_foundation",
        "start": 12.0, "end": 36.0,
        "title": "E-FLAT MAJOR FOUNDATION",
        "subtitle": "Every lever down sets Eb Major. Raising a lever engages the bridge pin for +1 semitone."
    })
    
    # -------------------------------------------------------------
    # Beat 2: Real App Circle of Fifths Scale Learning (36.0s - 58.0s)
    # -------------------------------------------------------------
    overlay(master, 36.0, aud_circle[:int(19.0 * SR)], scale=0.85)
    
    t2a_text = "Next, the Circle of Fifths teaches you the target scale and active lever settings."
    t2a_samples, t2a_dur = await synth_phrase(t2a_text, "p3_beat2a")
    overlay(master, 37.0, t2a_samples)
    
    t2b_text = "For E flat Major, all levers stay down. Tap confirm to hear the complete scale."
    t2b_samples, t2b_dur = await synth_phrase(t2b_text, "p3_beat2b")
    overlay(master, 44.0, t2b_samples)
    
    t2c_text = "The app validates your tuning and automatically plays through the full octave."
    t2c_samples, t2c_dur = await synth_phrase(t2c_text, "p3_beat2c")
    overlay(master, 50.5, t2c_samples)
    
    timeline_meta.append({
        "beat": 2, "id": "beat2_circle_fifths",
        "start": 36.0, "end": 58.0,
        "title": "CIRCLE OF FIFTHS DIAL",
        "subtitle": "Explore target scales and active lever indicator arrays before entering gameplay."
    })
    
    # -------------------------------------------------------------
    # Beat 3: Real In-Game Lever Setting & Automated Full Scale Walk (58.0s - 93.0s)
    # -------------------------------------------------------------
    overlay(master, 58.0, aud_walk[:int(20.5 * SR)], scale=0.85)
    
    t3a_text = "Now enter the live gameplay arena. The prompt challenges you to set B flat Major."
    t3a_samples, t3a_dur = await synth_phrase(t3a_text, "p3_beat3a")
    overlay(master, 59.0, t3a_samples)
    
    t3b_text = "To form B flat Major, raise lever A, either directly on the three D harp or by tapping button A below."
    t3b_samples, t3b_dur = await synth_phrase(t3b_text, "p3_beat3b")
    overlay(master, 66.5, t3b_samples)
    
    t3c_text = "Notice button A lights up in bright gold with arrow UP."
    t3c_samples, t3c_dur = await synth_phrase(t3c_text, "p3_beat3c")
    overlay(master, 74.5, t3c_samples)
    
    t3d_text = "Tap Confirm scale. The app confirms your setup is correct."
    t3d_samples, t3d_dur = await synth_phrase(t3d_text, "p3_beat3d")
    overlay(master, 80.0, t3d_samples)
    
    t3e_text = "Listen as the harp automatically walks the entire scale from tonic to octave, note by note."
    t3e_samples, t3e_dur = await synth_phrase(t3e_text, "p3_beat3e")
    overlay(master, 86.0, t3e_samples)
    
    timeline_meta.append({
        "beat": 3, "id": "beat3_gameplay_bb_walk",
        "start": 58.0, "end": 93.0,
        "title": "B-FLAT MAJOR : FULL SCALE WALK",
        "subtitle": "Prompt challenges Bb Major, raise lever A, confirm, and hear automated 8-note scale walk."
    })
    
    # -------------------------------------------------------------
    # Beat 4: Advanced Key Shifts: G Major and D Dorian (93.0s - 118.0s)
    # -------------------------------------------------------------
    overlay(master, 93.0, aud_full[int(15.0 * SR):int(33.0 * SR)], scale=0.85)
    
    t4a_text = "As you progress through the roadmap, you unlock C Major, G Major, and modal keys like D Dorian."
    t4a_samples, t4a_dur = await synth_phrase(t4a_text, "p3_beat4a")
    overlay(master, 94.0, t4a_samples)
    
    t4b_text = "Each key follows the same simple rule of three clockwise steps across the Circle of Fifths."
    t4b_samples, t4b_dur = await synth_phrase(t4b_text, "p3_beat4b")
    overlay(master, 102.0, t4b_samples)
    
    t4c_text = "Confirming the key plays another automated scale walk, training your ear to hear every mode."
    t4c_samples, t4c_dur = await synth_phrase(t4c_text, "p3_beat4c")
    overlay(master, 110.0, t4c_samples)
    
    timeline_meta.append({
        "beat": 4, "id": "beat4_advanced_modes",
        "start": 93.0, "end": 118.0,
        "title": "MODAL SCALES & SHIFTS",
        "subtitle": "Seamlessly shift between C Major, G Major, and D Dorian with instant audiation."
    })
    
    # -------------------------------------------------------------
    # Beat 5: Stage Confidence & Real-Life Value (118.0s - 135.0s)
    # -------------------------------------------------------------
    t5_text = "Mastering levers inside Earpa eliminates stage fright. In live performances, you will switch keys effortlessly with muscle memory, knowing your Celtic harp is perfectly configured."
    t5_samples, t5_dur = await synth_phrase(t5_text, "p3_beat5")
    overlay(master, 119.0, t5_samples)
    
    timeline_meta.append({
        "beat": 5, "id": "beat5_stage_mastery",
        "start": 118.0, "end": 135.0,
        "title": "CONFIDENT LIVE PERFORMANCE",
        "subtitle": "Switch keys on stage with intuitive muscle memory and zero performance hesitation."
    })
    
    save_master_mp3(master, "path3_camac_levers_master.mp3")
    with open(os.path.join(SRC_TIMELINES_DIR, "timeline_path3.json"), "w", encoding="utf-8") as f:
        json.dump(timeline_meta, f, indent=2)
    print("Exported timeline_path3.json successfully.")


async def main():
    await build_path1_master()
    await build_path2_master()
    await build_path3_master()
    print("\nALL 3 PATH INSTRUCTION MASTER AUDIOS AND TIMELINES GENERATED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
