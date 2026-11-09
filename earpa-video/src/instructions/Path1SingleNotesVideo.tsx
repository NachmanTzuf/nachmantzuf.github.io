import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { InstructionLayout, InstructionTheme } from './InstructionLayout';
import { LetterButtonBar } from './LetterButtonBar';
import { AlainBenbassatPaperCard } from './AlainBenbassatPaperCard';

const THEME: InstructionTheme = {
  primary: '#10b981',
  primaryGlow: 'rgba(16, 185, 129, 0.45)',
  accent: '#34d399',
  bgGradient: 'radial-gradient(circle at 50% 25%, #064e3b 0%, #061f18 45%, #030a08 100%)',
  trackLabel: 'PATH 1 · SINGLE NOTES',
};

// 90 seconds at 30 fps = 2700 frames
export const Path1SingleNotesVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6 Distinct Pedagogical Beats (Dynamic Pacing, Zero Static Frames)
  // Beat 0: 0 - 645 (0s - 21.5s) -> Alain Benbassat Paper Card & Tonal Gravity Schema
  // Beat 1: 645 - 810 (21.5s - 27.0s) -> Coastal Roadmap Pre-Roll & Level 1 Entry (2s before speech)
  // Beat 2: 810 - 1440 (27.0s - 48.0s) -> Round 1: Cadence, Mystery G, Pluck & Resolution Walk
  // Beat 3: 1440 - 2040 (48.0s - 68.0s) -> Round 2: Mystery F, Downward Ache & Walkdown
  // Beat 4: 2040 - 2340 (68.0s - 78.0s) -> Round 3: Mystery B & Upward Snap to High C
  // Beat 5: 2340 - 2700 (78.0s - 90.0s) -> Coastal Roadmap & 5-Minute Daily Habit

  let beatIndex = 0;
  let beatStart = 0;
  let category = '01 · COGNITIVE METHOD';
  let title = 'TONAL GRAVITY';
  let subtitle = 'Why isolated interval guessing fails and functional gravity succeeds.';

  if (frame >= 2340) {
    beatIndex = 5;
    beatStart = 2340;
    category = '06 · DAILY FLUENCY';
    title = '5-MINUTE ROUTINE';
    subtitle = 'Hum tonic C before plucking to build permanent reflex recognition.';
  } else if (frame >= 2040) {
    beatIndex = 4;
    beatStart = 2040;
    category = '05 · UPWARD SNAP';
    title = 'NOTE B · LEADING TONE';
    subtitle = 'Hear the sharp upward magnetic snap: leading tone B snaps home to high C.';
  } else if (frame >= 1440) {
    beatIndex = 3;
    beatStart = 1440;
    category = '04 · DOWNWARD ACHE';
    title = 'NOTE F · RESOLUTION';
    subtitle = 'Feel the heavy downward ache: F resolves through E and D down to C.';
  } else if (frame >= 810) {
    beatIndex = 2;
    beatStart = 810;
    category = '03 · LEVEL 1 PLAY';
    title = 'CADENCE & NOTE G';
    subtitle = 'Cadence grounds tonic C. Pluck G and watch the stepwise resolution walk.';
  } else if (frame >= 645) {
    beatIndex = 1;
    beatStart = 645;
    category = '02 · REALM ROADMAP';
    title = 'COASTAL RIDGE MAP';
    subtitle = 'Opening Level 1 on the Sanctuary trail with tactile haptic response.';
  }

  const localFrame = frame - beatStart;
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      {/* Authentic Master Audio: Edge-TTS + Warm Spruce Harp Cadence + Wood Foley */}
      <Audio src={staticFile('audio/instructions/path1_single_notes_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={beatIndex}
        totalBeats={6}
        localFrame={localFrame}
      >
        {/* BEAT 0: Core Philosophy, Paper Card & Tonal Gravity Schema (0s - 21.5s / frames 0 - 645) */}
        {beatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_single_home.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Sub-phase A: Problem Intro (0s - 7.0s / frames 0 - 210) */}
            {frame < 210 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '14px 28px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(6, 78, 59, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primary}`,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                FUNCTIONAL METHOD · 220+ LEVELS
              </div>
            )}

            {/* Sub-phase B: Alain Benbassat Paper Card (7.0s - 14.5s / frames 210 - 435) */}
            {frame >= 210 && frame < 435 && (
              <AlainBenbassatPaperCard
                themeColor={THEME.primary}
                themeGlow={THEME.primaryGlow}
                accentColor={THEME.accent}
                localFrame={frame - 210}
              />
            )}

            {/* Sub-phase C: Dynamic Tonal Gravity Schema (14.5s - 21.5s / frames 435 - 645) */}
            {frame >= 435 && (
              <div
                style={{
                  position: 'absolute',
                  top: '22%',
                  left: 20,
                  right: 20,
                  padding: '24px 22px',
                  borderRadius: 28,
                  backgroundColor: 'rgba(6, 78, 59, 0.96)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  zIndex: 30,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                    ALAIN BENBASSAT LAW
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    TONAL GRAVITATION
                  </span>
                </div>

                {/* Visual Pull Vectors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Pull Downward: Note F */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 16,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff' }}>NOTE F → PULL DOWN</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: THEME.accent }}>
                        Subdominant ache falling through E, D to C
                      </div>
                    </div>
                    <span style={{ fontSize: 26, color: '#38bdf8', fontWeight: 900 }}>↓</span>
                  </div>

                  {/* Tonic Anchor: Center C */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 16,
                      backgroundColor: 'rgba(16, 185, 129, 0.35)',
                      border: `2px solid ${THEME.primary}`,
                      boxShadow: `0 0 20px ${THEME.primary}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>TONIC HOME CENTER (C)</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>
                        Zero tension · Complete physical rest
                      </div>
                    </div>
                    <span style={{ fontSize: 22, color: '#ffffff', fontWeight: 900 }}>●</span>
                  </div>

                  {/* Pull Upward: Note B */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 16,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff' }}>NOTE B → SNAP UPWARD</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: THEME.accent }}>
                        Leading tone magnetic snap up to high C
                      </div>
                    </div>
                    <span style={{ fontSize: 26, color: '#fbbf24', fontWeight: 900 }}>↑</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BEAT 1: Coastal Ridge Roadmap Pre-Roll & Level 1 Entry (21.5s - 27.0s / frames 645 - 810) */}
        {beatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_coastal_roadmap.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Level 1 Node Pulsing Ring & Tap Ripple at 24.5s (f735) */}
            <div
              style={{
                position: 'absolute',
                top: '83.5%',
                left: '41.5%',
                transform: 'translate(-50%, -50%)',
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: `3px solid ${THEME.primary}`,
                boxShadow: `0 0 30px ${THEME.primary}`,
                pointerEvents: 'none',
              }}
            />

            {/* Expanding Tap Ripple at f735 */}
            {frame >= 735 && (
              <div
                style={{
                  position: 'absolute',
                  top: '83.5%',
                  left: '41.5%',
                  transform: 'translate(-50%, -50%)',
                  width: 60 + (frame - 735) * 6,
                  height: 60 + (frame - 735) * 6,
                  borderRadius: '50%',
                  border: `2px solid ${THEME.accent}`,
                  opacity: Math.max(0, 1 - (frame - 735) / 30),
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Level 1 Entry Banner */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 20,
                right: 20,
                padding: '16px 20px',
                borderRadius: 22,
                backgroundColor: 'rgba(6, 78, 59, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>ENTERING LEVEL 1</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                THE TONIC ANCHOR : HOME NOTE C
              </div>
            </div>
          </div>
        )}

        {/* BEAT 2: Round 1 In-Game Gameplay: Cadence, Mystery G, Pluck & Resolution Walk (27.0s - 48.0s / frames 810 - 1440) */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Cadence Chord Progression Cards (27.5s - 35.0s / frames 825 - 1050) */}
            {frame < 1050 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 18,
                  right: 18,
                  height: 54,
                  display: 'flex',
                  gap: 8,
                }}
              >
                {[
                  { chord: 'I : C Maj', active: frame >= 825 },
                  { chord: 'IV : F Maj', active: frame >= 854 },
                  { chord: 'V : G Maj', active: frame >= 882 },
                  { chord: 'I : C Maj', active: frame >= 910 },
                ].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                      backgroundColor: c.active ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 0, 0, 0.4)',
                      border: `1.5px solid ${c.active ? THEME.primary : 'rgba(255,255,255,0.2)'}`,
                      boxShadow: c.active ? `0 0 16px ${THEME.primary}` : 'none',
                      color: c.active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {c.chord}
                  </div>
                ))}
              </div>
            )}

            {/* Mystery Note Sounds Banner (35.5s - 41.5s / frames 1065 - 1245) */}
            {frame >= 1065 && frame < 1245 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
                  padding: '14px 20px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(6, 78, 59, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>MYSTERY NOTE SOUNDING</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                  HEAR THE OPEN, BRIGHT STABILITY
                </div>
              </div>
            )}

            {/* Pluck G Confirmation Card (41.5s - 44.0s / frames 1245 - 1320) */}
            {frame >= 1245 && frame < 1320 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '16px 32px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(6, 78, 59, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 44, fontWeight: 900, color: '#ffffff' }}>PLUCK: G</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.accent }}>
                  +10 SHARDS · 5TH DEGREE LOCKED
                </div>
              </div>
            )}

            {/* Stepwise Resolution Walkdown Card (44.0s - 48.0s / frames 1320 - 1440) */}
            {frame >= 1320 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 16,
                  right: 16,
                  padding: '16px 18px',
                  borderRadius: 22,
                  backgroundColor: 'rgba(6, 78, 59, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                {[
                  { note: 'G', deg: '5th', active: frame >= 1320 },
                  { note: 'F', deg: '4th', active: frame >= 1335 },
                  { note: 'E', deg: '3rd', active: frame >= 1350 },
                  { note: 'D', deg: '2nd', active: frame >= 1365 },
                  { note: 'C', deg: 'Home', active: frame >= 1380 },
                ].map((step, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: step.active ? '#ffffff' : 'rgba(255,255,255,0.3)',
                        textShadow: step.active ? `0 0 12px ${THEME.primary}` : 'none',
                      }}
                    >
                      {step.note}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: step.active ? THEME.accent : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {step.deg}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Native Pad Glow Overlay */}
            <LetterButtonBar
              activeNotes={
                frame >= 1380
                  ? ['C']
                  : frame >= 1320
                  ? ['G']
                  : frame >= 1245
                  ? ['G']
                  : frame >= 910 && frame < 1050
                  ? ['C']
                  : []
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 3: Round 2 In-Game Gameplay: Mystery F & Downward Resolution Walk (48.0s - 68.0s / frames 1440 - 2040) */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={
                frame >= 1905
                  ? staticFile('textures/real/live_app/app_screen_ingame_resolution.png')
                  : staticFile('textures/real/live_app/app_screen_ingame_playing.png')
              }
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Re-grounding Cadence Banner (48.5s - 54.5s / frames 1455 - 1635) */}
            {frame < 1635 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
                  padding: '14px 20px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(6, 78, 59, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>ROUND 2 CADENCE</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                  RE-GROUNDING EAR IN C MAJOR
                </div>
              </div>
            )}

            {/* Mystery Note F Sounds Card (55.0s - 61.5s / frames 1650 - 1845) */}
            {frame >= 1650 && frame < 1845 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '18px 32px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(6, 78, 59, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 40, fontWeight: 900, color: '#ffffff' }}>FEEL THE ACHE</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.accent }}>
                  HEAVY DOWNWARD PULL TOWARD HOME
                </div>
              </div>
            )}

            {/* Pluck F at 61.5s (f1845) */}
            {frame >= 1845 && frame < 1905 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '16px 32px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(6, 78, 59, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 44, fontWeight: 900, color: '#ffffff' }}>PLUCK: F</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.accent }}>
                  DOWNWARD TENSION IDENTIFIED
                </div>
              </div>
            )}

            {/* Stepwise Resolution Walkdown (63.5s - 68.0s / frames 1905 - 2040) */}
            {frame >= 1905 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
                  padding: '16px 20px',
                  borderRadius: 22,
                  backgroundColor: 'rgba(6, 78, 59, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                {[
                  { note: 'F', deg: 'Ache', active: frame >= 1905 },
                  { note: 'E', deg: 'Fall', active: frame >= 1920 },
                  { note: 'D', deg: 'Drop', active: frame >= 1935 },
                  { note: 'C', deg: 'Home', active: frame >= 1950 },
                ].map((step, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: step.active ? '#ffffff' : 'rgba(255,255,255,0.3)',
                        textShadow: step.active ? `0 0 12px ${THEME.primary}` : 'none',
                      }}
                    >
                      {step.note}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: step.active ? THEME.accent : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {step.deg}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Native Pad Highlights */}
            <LetterButtonBar
              activeNotes={
                frame >= 1950
                  ? ['C']
                  : frame >= 1905
                  ? ['F']
                  : frame >= 1845
                  ? ['F']
                  : []
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 4: Round 3 In-Game Gameplay: Mystery Note B & Upward Snap (68.0s - 78.0s / frames 2040 - 2340) */}
        {beatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Note B Upward Gravity Card */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 20,
                right: 20,
                padding: '16px 20px',
                borderRadius: 22,
                backgroundColor: 'rgba(6, 78, 59, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>LEADING TONE TENSION</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                  NOTE B → SNAP TO HIGH C
                </div>
              </div>
              <span style={{ fontSize: 24, fontWeight: 900, color: THEME.primary }}>↑</span>
            </div>

            {/* Central Pluck & Snap Visualizer */}
            {frame >= 2130 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '18px 32px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(6, 78, 59, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 40, fontWeight: 900, color: '#ffffff' }}>
                  {frame >= 2268 ? 'MAGNETIC SNAP: C' : 'NOTE B : LEADING TONE'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.accent }}>
                  {frame >= 2268 ? 'RESOLVED TO TONIC OCTAVE' : 'MAXIMUM UPWARD GRAVITATIONAL PULL'}
                </div>
              </div>
            )}

            {/* Native Pad Highlights */}
            <LetterButtonBar
              activeNotes={frame >= 2268 ? ['C'] : frame >= 2130 ? ['B'] : []}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 5: Coastal Ridge Sanctuary Roadmap & 5-Minute Routine (78.0s - 90.0s / frames 2340 - 2700) */}
        {beatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_coastal_roadmap.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Progress Badge */}
            <div
              style={{
                position: 'absolute',
                top: 80,
                left: 30,
                right: 30,
                padding: '18px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(6, 78, 59, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>70</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>LEVELS</div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>5 MIN</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>DAILY DISCIPLINE</div>
              </div>
            </div>

            {/* Bottom Call to Action Button */}
            <div
              style={{
                position: 'absolute',
                bottom: 80,
                left: 40,
                right: 40,
                padding: '18px 0',
                borderRadius: 28,
                backgroundColor: THEME.primary,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 2,
                color: '#000000',
              }}
            >
              ▷ START COASTAL RIDGE
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
