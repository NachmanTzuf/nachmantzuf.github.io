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

const THEME: InstructionTheme = {
  primary: '#38bdf8',
  primaryGlow: 'rgba(56, 189, 248, 0.45)',
  accent: '#7dd3fc',
  bgGradient: 'radial-gradient(circle at 50% 25%, #0c4a6e 0%, #082f49 45%, #030d17 100%)',
  trackLabel: 'PATH 2 · MELODY PHRASING',
};

// 90 seconds at 30 fps = 2700 frames
export const Path2MelodyPhrasingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6 Distinct Pedagogical Beats (Dynamic Pacing, Zero Static Frames)
  // Beat 0: 0 - 540 (0s - 18.0s) -> Melodic Contour Introduction & Kinetic Waveform
  // Beat 1: 540 - 720 (18.0s - 24.0s) -> Glacial Fjord Roadmap Pre-Roll & Level 1 Entry (2s before speech)
  // Beat 2: 720 - 1440 (24.0s - 48.0s) -> Level 1 In-Game Play: Cadence & 2-Note Motif (E -> C)
  // Beat 3: 1440 - 1620 (48.0s - 54.0s) -> Glacial Fjord Roadmap Pre-Roll & Level 5 Advance (2s before speech)
  // Beat 4: 1620 - 2280 (54.0s - 76.0s) -> Level 5 In-Game Play: 3-Note Phrase (C -> G -> E) & Contour Arc
  // Beat 5: 2280 - 2700 (76.0s - 90.0s) -> Audiation Drill & Glacial Fjord Roadmap

  let beatIndex = 0;
  let beatStart = 0;
  let category = '01 · MELODIC MEMORY';
  let title = 'CONNECTED PHRASES';
  let subtitle = 'Moving beyond isolated notes into flowing melodic contours.';

  if (frame >= 2280) {
    beatIndex = 5;
    beatStart = 2280;
    category = '06 · AUDIATION DRILL';
    title = 'SING BEFORE PLUCKING';
    subtitle = 'Hold tonic C in memory, trace the line, and unlock fluent phrasing.';
  } else if (frame >= 1620) {
    beatIndex = 4;
    beatStart = 1620;
    category = '05 · LEVEL 5 IN-GAME';
    title = '3-NOTE CONTOUR ARC';
    subtitle = 'Hear the phrase: solid root C, bright fifth G, and sweet resolving third E.';
  } else if (frame >= 1440) {
    beatIndex = 3;
    beatStart = 1440;
    category = '04 · ROADMAP ADVANCE';
    title = 'ADVANCE TO LEVEL 5';
    subtitle = 'Expanding phrase capacity from 2-note motifs to 3-note melodic arcs.';
  } else if (frame >= 720) {
    beatIndex = 2;
    beatStart = 720;
    category = '03 · LEVEL 1 IN-GAME';
    title = '2-NOTE SEQUENCE';
    subtitle = 'Leap to sweet E, then drop home to C. Pluck in sequence to lock the shape.';
  } else if (frame >= 540) {
    beatIndex = 1;
    beatStart = 540;
    category = '02 · REALM ROADMAP';
    title = 'GLACIAL FJORD MAP';
    subtitle = 'Opening Level 1 on the Fjord trail with tactile haptic response.';
  }

  const localFrame = frame - beatStart;
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      {/* Master Audio: Natural unhurried TTS + Warm Spruce Harp Cadence + Wood Foley */}
      <Audio src={staticFile('audio/instructions/path2_melody_phrasing_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={beatIndex}
        totalBeats={6}
        localFrame={localFrame}
      >
        {/* BEAT 0: Glacial Fjord Sanctuary & Contour Overview (0s - 18.0s / frames 0 - 540) */}
        {beatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_melody_sanctuary.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Sub-phase A: Intro Tag (0s - 6.0s / frames 0 - 180) */}
            {frame < 180 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '14px 28px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(12, 74, 110, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primary}`,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                MELODIC PHRASING · 74 LEVELS
              </div>
            )}

            {/* Sub-phase B: Melodic Contour Kinetic Waveform Card (6.0s - 13.5s / frames 180 - 405) */}
            {frame >= 180 && frame < 405 && (
              <div
                style={{
                  position: 'absolute',
                  top: '22%',
                  left: 20,
                  right: 20,
                  padding: '24px 22px',
                  borderRadius: 28,
                  backgroundColor: 'rgba(12, 74, 110, 0.96)',
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
                    AUDITORY ARCHITECTURE
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    REAL-TIME CONTOUR
                  </span>
                </div>

                {/* Animated Sine Contour Wave */}
                <div
                  style={{
                    height: 100,
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderRadius: 18,
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <svg width="100%" height="80" viewBox="0 0 400 80">
                    <path
                      d={`M 10 40 Q 100 ${10 + Math.sin(frame * 0.1) * 20}, 200 40 T 390 40`}
                      fill="none"
                      stroke={THEME.primary}
                      strokeWidth="4"
                    />
                    <circle cx="100" cy={30 + Math.sin(frame * 0.1) * 15} r="6" fill="#ffffff" />
                    <circle cx="200" cy="40" r="6" fill={THEME.accent} />
                    <circle cx="300" cy={50 - Math.sin(frame * 0.1) * 15} r="6" fill="#ffffff" />
                  </svg>
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', textAlign: 'center' }}>
                  Recognize phrase direction, leap distance, and tonal gravity instantly.
                </div>
              </div>
            )}

            {/* Sub-phase C: Phrase Shapes & Harmonic Colors (13.5s - 18.0s / frames 405 - 540) */}
            {frame >= 405 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '16px 30px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(12, 74, 110, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff' }}>PHRASE CONTOURS</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: THEME.accent, marginTop: 4 }}>
                  LISTEN FOR HARMONIC SHAPES & COLORS
                </div>
              </div>
            )}
          </div>
        )}

        {/* BEAT 1: Glacial Fjord Roadmap Pre-Roll & Level 1 Entry (18.0s - 24.0s / frames 540 - 720) */}
        {beatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_arctic_roadmap.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Level 1 Node Pulsing Ring & Tap Ripple at 20.5s (f615) */}
            <div
              style={{
                position: 'absolute',
                top: '87.5%',
                left: '35.8%',
                transform: 'translate(-50%, -50%)',
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: `3px solid ${THEME.primary}`,
                boxShadow: `0 0 30px ${THEME.primary}`,
                pointerEvents: 'none',
              }}
            />

            {/* Expanding Tap Ripple at f615 */}
            {frame >= 615 && (
              <div
                style={{
                  position: 'absolute',
                  top: '87.5%',
                  left: '35.8%',
                  transform: 'translate(-50%, -50%)',
                  width: 60 + (frame - 615) * 6,
                  height: 60 + (frame - 615) * 6,
                  borderRadius: '50%',
                  border: `2px solid ${THEME.accent}`,
                  opacity: Math.max(0, 1 - (frame - 615) / 30),
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
                backgroundColor: 'rgba(12, 74, 110, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>ENTERING LEVEL 1</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                2-NOTE MELODIC MOTIF
              </div>
            </div>
          </div>
        )}

        {/* BEAT 2: Level 1 In-Game Play: Cadence & 2-Note Motif E -> C (24.0s - 48.0s / frames 720 - 1440) */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Cadence Banner (24.0s - 31.0s / frames 720 - 930) */}
            {frame < 930 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
                  padding: '16px 20px',
                  borderRadius: 22,
                  backgroundColor: 'rgba(12, 74, 110, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>CADENCE GROUNDING</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                    Tonal Anchor: C Major
                  </div>
                </div>
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(56, 189, 248, 0.25)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  LISTEN TO SHAPE
                </div>
              </div>
            )}

            {/* Note Badges: E then C (31.0s - 42.0s / frames 930 - 1260) */}
            {frame >= 930 && frame < 1260 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    padding: '16px 28px',
                    borderRadius: 22,
                    backgroundColor: frame >= 1155 ? THEME.primary : 'rgba(12, 74, 110, 0.75)',
                    border: `2px solid ${THEME.accent}`,
                    boxShadow: frame >= 1155 ? `0 0 25px ${THEME.primary}` : 'none',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: 32,
                    textAlign: 'center',
                  }}
                >
                  1. NOTE E
                </div>
                <div
                  style={{
                    padding: '16px 28px',
                    borderRadius: 22,
                    backgroundColor: frame >= 1185 ? THEME.primary : 'rgba(12, 74, 110, 0.75)',
                    border: `2px solid ${THEME.accent}`,
                    boxShadow: frame >= 1185 ? `0 0 25px ${THEME.primary}` : 'none',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: 32,
                    textAlign: 'center',
                  }}
                >
                  2. NOTE C
                </div>
              </div>
            )}

            {/* Match Locked Replay Card (42.0s - 48.0s / frames 1260 - 1440) */}
            {frame >= 1260 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 96,
                  left: 30,
                  right: 30,
                  padding: '18px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(8, 47, 73, 0.96)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#ffffff',
                }}
              >
                ✓ PHRASE MATCH: NOTE E → NOTE C LOCKED
              </div>
            )}

            {/* Native Pad Glow Overlay */}
            <LetterButtonBar
              activeNotes={
                frame >= 1290
                  ? ['C']
                  : frame >= 1260
                  ? ['E']
                  : frame >= 1185
                  ? ['C']
                  : frame >= 1155
                  ? ['E']
                  : frame >= 735 && frame < 930
                  ? ['C']
                  : []
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 3: Glacial Fjord Roadmap Pre-Roll & Level 5 Advance (48.0s - 54.0s / frames 1440 - 1620) */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_arctic_roadmap.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Level 5 Node Pulsing Ring & Tap Ripple at 50.5s (f1515) */}
            <div
              style={{
                position: 'absolute',
                top: '52%',
                left: '58%',
                transform: 'translate(-50%, -50%)',
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: `3px solid ${THEME.primary}`,
                boxShadow: `0 0 30px ${THEME.primary}`,
                pointerEvents: 'none',
              }}
            />

            {/* Expanding Tap Ripple at f1515 */}
            {frame >= 1515 && (
              <div
                style={{
                  position: 'absolute',
                  top: '52%',
                  left: '58%',
                  transform: 'translate(-50%, -50%)',
                  width: 60 + (frame - 1515) * 6,
                  height: 60 + (frame - 1515) * 6,
                  borderRadius: '50%',
                  border: `2px solid ${THEME.accent}`,
                  opacity: Math.max(0, 1 - (frame - 1515) / 30),
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Level 5 Advance Banner */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 20,
                right: 20,
                padding: '16px 20px',
                borderRadius: 22,
                backgroundColor: 'rgba(12, 74, 110, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>ADVANCING TO LEVEL 5</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                3-NOTE CONTOUR ARC
              </div>
            </div>
          </div>
        )}

        {/* BEAT 4: Level 5 In-Game Play: 3-Note Phrase C -> G -> E & Contour Arc (54.0s - 76.0s / frames 1620 - 2280) */}
        {beatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Contour Arc Sequence Card (54.0s - 76.0s / frames 1620 - 2280) */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 20,
                right: 20,
                padding: '16px 20px',
                borderRadius: 22,
                backgroundColor: 'rgba(8, 47, 73, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              {[
                { n: 'C', desc: 'Root Home', active: frame >= 1785 },
                { n: 'G', desc: 'Bright 5th', active: frame >= 1815 },
                { n: 'E', desc: 'Sweet 3rd', active: frame >= 1845 },
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      margin: '0 auto 6px',
                      backgroundColor: item.active ? THEME.primary : 'rgba(255,255,255,0.08)',
                      border: `2px solid ${item.active ? '#ffffff' : 'rgba(255,255,255,0.2)'}`,
                      boxShadow: item.active ? `0 0 20px ${THEME.primary}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 900,
                      color: item.active ? '#000000' : '#ffffff',
                    }}
                  >
                    {item.n}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Pluck Confirmation at 68s (f2040) */}
            {frame >= 2040 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '18px 32px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(8, 47, 73, 0.96)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff' }}>CONTOUR ARC VERIFIED</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.accent }}>
                  C → G → E PHRASE LOCKED IN
                </div>
              </div>
            )}

            {/* Native Pad Highlights */}
            <LetterButtonBar
              activeNotes={
                frame >= 2070
                  ? ['E']
                  : frame >= 2055
                  ? ['G']
                  : frame >= 2040
                  ? ['C']
                  : frame >= 1845
                  ? ['E']
                  : frame >= 1815
                  ? ['G']
                  : frame >= 1785
                  ? ['C']
                  : []
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 5: Audiation Drill & Glacial Fjord Roadmap (76.0s - 90.0s / frames 2280 - 2700) */}
        {beatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_arctic_roadmap.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Stats Badge */}
            <div
              style={{
                position: 'absolute',
                top: 80,
                left: 30,
                right: 30,
                padding: '18px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(12, 74, 110, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>74</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>LEVELS</div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>CONTOUR</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>FLUENCY</div>
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
              ▷ START GLACIAL FJORD
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
