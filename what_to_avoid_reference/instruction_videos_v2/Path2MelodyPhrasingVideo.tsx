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

// 80 seconds at 30 fps = 2400 frames
export const Path2MelodyPhrasingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 5 Distinct Pedagogical Beats
  // Beat 1: 0 - 480 (0s - 16s) -> Melodic Contour Introduction
  // Beat 2: 480 - 930 (16s - 31s) -> Cadence Grounding in C Major
  // Beat 3: 930 - 1500 (31s - 50s) -> Level 1 Two-Note Motif (E -> C)
  // Beat 4: 1500 - 2040 (50s - 68s) -> Level 5 Three-Note Phrase (C -> G -> E)
  // Beat 5: 2040 - 2400 (68s - 80s) -> Audiation & Arctic Roadmap

  let beatIndex = 0;
  let beatStart = 0;
  let category = '01 · MELODIC MEMORY';
  let title = 'CONNECTED PHRASES';
  let subtitle = 'Moving beyond isolated notes into flowing melodic contours.';

  if (frame >= 2040) {
    beatIndex = 4;
    beatStart = 2040;
    category = '05 · AUDIATION DRILL';
    title = 'SING BEFORE PLUCKING';
    subtitle = 'Hold tonic C in memory, trace the line, and unlock fluent phrasing.';
  } else if (frame >= 1500) {
    beatIndex = 3;
    beatStart = 1500;
    category = '04 · 3-NOTE MOTIF';
    title = 'CONTOUR ARC';
    subtitle = 'Hear the shape: solid root C, bright fifth G, and resolving third E.';
  } else if (frame >= 930) {
    beatIndex = 2;
    beatStart = 930;
    category = '03 · LEVEL 1 PHRASING';
    title = '2-NOTE SEQUENCE';
    subtitle = 'Leap to sweet E, then drop home to C. Pluck in sequence.';
  } else if (frame >= 480) {
    beatIndex = 1;
    beatStart = 480;
    category = '02 · HARMONIC CENTER';
    title = 'CONTOUR IN C';
    subtitle = 'The cadence grounds your ear before the melodic phrase unfolds.';
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
        totalBeats={5}
        localFrame={localFrame}
      >
        {/* BEAT 1: Glacial Fjord Sanctuary & Contour Overview */}
        {beatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_melody_sanctuary.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Center Tag */}
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '12px 28px',
                borderRadius: 24,
                backgroundColor: 'rgba(12, 74, 110, 0.92)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 25px ${THEME.primary}`,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 2,
                textAlign: 'center',
              }}
            >
              MELODIC PHRASING · 74 LEVELS
            </div>
          </div>
        )}

        {/* BEAT 2: Grounding Cadence in C Major */}
        {beatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_melody_sanctuary.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Contour Visualizer Card */}
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
                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>
                  CADENCE ESTABLISHED
                </div>
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

            {/* Native Pad C Glow Overlay */}
            <LetterButtonBar
              activeNotes={frame >= 735 ? ['C'] : []}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 3: Level 1 Two-Note Motif (E -> C) */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* ZERO blue vertical lines beside the harp! Clean, authentic gameplay. */}

            {/* Note Badges: E then C */}
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
                  padding: '14px 26px',
                  borderRadius: 20,
                  backgroundColor: frame >= 1065 ? THEME.primary : 'rgba(12, 74, 110, 0.7)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: frame >= 1065 ? `0 0 25px ${THEME.primary}` : 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 32,
                  textAlign: 'center',
                }}
              >
                1. E
              </div>
              <div
                style={{
                  padding: '14px 26px',
                  borderRadius: 20,
                  backgroundColor: frame >= 1350 ? THEME.primary : 'rgba(12, 74, 110, 0.7)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: frame >= 1350 ? `0 0 25px ${THEME.primary}` : 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 32,
                  textAlign: 'center',
                }}
              >
                2. C
              </div>
            </div>

            {/* Match Locked Card */}
            {frame >= 1440 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 96,
                  left: 30,
                  right: 30,
                  padding: '16px',
                  borderRadius: 18,
                  backgroundColor: 'rgba(8, 47, 73, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                ✓ PHRASE MATCH: E → C LOCKED
              </div>
            )}

            {/* Native Pad Glow Overlay */}
            <LetterButtonBar
              activeNotes={frame >= 1350 ? ['E', 'C'] : frame >= 1065 ? ['E'] : []}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 4: Level 5 Three-Note Phrase (C -> G -> E) */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* ZERO blue vertical lines beside the harp! Clean, authentic gameplay. */}

            {/* Replay Sequence Card */}
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
                { n: 'C', desc: 'Root Home', active: frame >= 1605 },
                { n: 'G', desc: 'Bright 5th', active: frame >= 1635 },
                { n: 'E', desc: 'Sweet 3rd', active: frame >= 1665 },
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
                      fontWeight: 800,
                      color: item.active ? '#000000' : '#ffffff',
                    }}
                  >
                    {item.n}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Native Pad Highlights */}
            <LetterButtonBar
              activeNotes={
                frame >= 1665
                  ? ['C', 'G', 'E']
                  : frame >= 1635
                  ? ['C', 'G']
                  : frame >= 1605
                  ? ['C']
                  : []
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 5: Audiation Drill & Arctic Fjord Roadmap */}
        {beatIndex === 4 && (
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
