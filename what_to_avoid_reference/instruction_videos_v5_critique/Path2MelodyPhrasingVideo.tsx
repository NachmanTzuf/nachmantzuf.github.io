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
import { Harp3DCanvas, PluckEvent } from '../earpa/Harp3DCanvas';
import timelineData from './timeline_path2.json';

const THEME: InstructionTheme = {
  primary: '#0284c7', // Arctic Cyan
  primaryGlow: 'rgba(2, 132, 199, 0.45)',
  accent: '#38bdf8',
  bgGradient: 'radial-gradient(circle at 50% 25%, #075985 0%, #082f49 45%, #02131d 100%)',
  trackLabel: 'PATH 2 · MELODIC PHRASING',
};

const NOTE_TO_STRING: Record<string, number> = {
  C4: 1,
  D4: 2,
  E4: 3,
  F4: 4,
  G4: 5,
  A4: 6,
  B4: 7,
  C5: 8,
};

export const Path2MelodyPhrasingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active beat from dynamic timeline JSON
  const currentSec = frame / fps;
  let activeBeatIndex = 0;
  for (let i = 0; i < timelineData.length; i++) {
    if (currentSec >= timelineData[i].start) {
      activeBeatIndex = timelineData[i].beat;
    }
  }

  const beatMeta = timelineData[activeBeatIndex] || timelineData[0];
  const beatStartFrame = Math.round(beatMeta.start * fps);
  const localFrame = Math.max(0, frame - beatStartFrame);

  let category = '01 · CORE METHODOLOGY';
  let title = 'MELODIC CONTOUR';
  let subtitle = 'Music is built from connected phrases. Train your brain to recognize melodic contour in real time.';

  if (activeBeatIndex === 1) {
    category = '02 · ROADMAP ENTRY';
    title = 'LEVEL 1 : TWO-NOTE PHRASE';
    subtitle = 'Enter the Glacial Fjord roadmap to begin melodic contour training.';
  } else if (activeBeatIndex === 2) {
    category = '03 · LEVEL 1 GAMEPLAY';
    title = 'THE E → C MOTIF';
    subtitle = 'Note E leaps sweet and warm, then drops home to tonic C. Pluck E, then C in sequence.';
  } else if (activeBeatIndex === 3) {
    category = '04 · ADVANCING TO LEVEL 5';
    title = 'THE C → G → E ARC';
    subtitle = 'Advance to three-note phrases: solid root C, bright fifth G, and sweet third E.';
  } else if (activeBeatIndex === 4) {
    category = '05 · MASTERY BLUEPRINT';
    title = 'THE AUDIATION DRILL';
    subtitle = 'Sing the phrase silently in your mind before plucking to unlock complete melodic fluency.';
  }

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  // Pluck events for Beat 2 (Level 1: E4 -> C4)
  const s3Meta: any = timelineData[2];
  const beat2PluckEvents: PluckEvent[] = [];
  const phraseStartF = Math.round((s3Meta?.phrase_start || 29.5) * fps);
  beat2PluckEvents.push({ stringNum: 3, startFrame: phraseStartF, amplitude: 0.022 }); // E4
  beat2PluckEvents.push({ stringNum: 1, startFrame: phraseStartF + 25, amplitude: 0.024 }); // C4

  // User replay plucks
  const userReplayF = Math.round((s3Meta?.user_replay || 41.5) * fps);
  beat2PluckEvents.push({ stringNum: 3, startFrame: userReplayF, amplitude: 0.022 });
  beat2PluckEvents.push({ stringNum: 1, startFrame: userReplayF + 22, amplitude: 0.024 });

  const beat2ActiveNotes: string[] = [];
  if (frame >= userReplayF && frame < userReplayF + 20) {
    beat2ActiveNotes.push('E');
  }
  if (frame >= userReplayF + 20 && frame < userReplayF + 44) {
    beat2ActiveNotes.push('C');
  }

  // Pluck events for Beat 3 (Level 5: C4 -> G4 -> E4)
  const s4Meta: any = timelineData[3];
  const beat3PluckEvents: PluckEvent[] = [];
  const motif5F = Math.round((s4Meta?.phrase_start || 57.5) * fps);
  beat3PluckEvents.push({ stringNum: 1, startFrame: motif5F, amplitude: 0.022 }); // C4
  beat3PluckEvents.push({ stringNum: 5, startFrame: motif5F + 22, amplitude: 0.022 }); // G4
  beat3PluckEvents.push({ stringNum: 3, startFrame: motif5F + 45, amplitude: 0.024 }); // E4

  const beat3ActiveNotes: string[] = [];
  if (frame >= motif5F && frame < motif5F + 20) {
    beat3ActiveNotes.push('C');
  } else if (frame >= motif5F + 20 && frame < motif5F + 42) {
    beat3ActiveNotes.push('G');
  } else if (frame >= motif5F + 42 && frame < motif5F + 68) {
    beat3ActiveNotes.push('E');
  }

  return (
    <AbsoluteFill>
      {/* Master Audio (V4): Broadcast narration + warm acoustic Sitka spruce Celtic harp */}
      <Audio src={staticFile('audio/instructions/path2_melody_phrasing_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={activeBeatIndex}
        totalBeats={5}
        localFrame={localFrame}
      >
        {/* ===================================================================
            BEAT 0: Melodic Contour & Phrase Recognition (0.0s - ~19.0s)
           =================================================================== */}
        {activeBeatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_melody_sanctuary.png')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Melodic Contour Waveform Card */}
            <div
              style={{
                position: 'absolute',
                top: '42%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '88%',
                padding: '24px',
                borderRadius: 24,
                backgroundColor: 'rgba(8, 47, 73, 0.92)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                zIndex: 30,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                  PHRASE RECOGNITION
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>CONTOUR DYNAMICS</span>
              </div>

              {/* Dynamic Waveform Graph */}
              <div
                style={{
                  height: 120,
                  borderRadius: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  border: '1.5px solid rgba(255, 255, 255, 0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* SVG Curve */}
                <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <path
                    d="M 20 70 Q 75 20, 150 50 T 280 30"
                    fill="none"
                    stroke={THEME.accent}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="70" r="5" fill="#ffffff" />
                  <circle cx="150" cy="50" r="5" fill="#ffffff" />
                  <circle cx="280" cy="30" r="5" fill="#ffffff" />
                </svg>
              </div>

              <div style={{ fontSize: 13, color: '#e0f2fe', lineHeight: 1.4, textAlign: 'center' }}>
                Listen for shapes and harmonic colors, not isolated intervals.
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 1: Glacial Fjord Roadmap Pre-Roll (~19.0s - ~25.0s)
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_glacial_roadmap.png')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Level 1 Node Pulsing Ring */}
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

            {/* Level 1 Entry Banner */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                padding: '14px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(12, 74, 110, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent }}>ENTERING LEVEL 1</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                2-NOTE MELODIC MOTIF
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 2: Level 1 In-Game Play: Two-Note Motif E -> C (~25.0s - ~48.0s)
            THE REAL 3D CELTIC HARP IS FULLY VISIBLE & CENTERED!
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Absolute Arena Background */}
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 655,
                height: 1420,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <Harp3DCanvas
                width={655}
                height={1420}
                theta={-0.95}
                phi={1.34}
                radius={2.40}
                targetX={0}
                targetY={0.590}
                targetZ={0}
                fov={34}
                harpScale={0.938}
                leverEvents={[]}
                pluckEvents={beat2PluckEvents}
              />
            </div>

            {/* Top Prompt Header */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                padding: '12px 18px',
                borderRadius: 20,
                backgroundColor: 'rgba(8, 47, 73, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
                textAlign: 'center',
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent }}>LEVEL 1 · 2-NOTE MOTIF</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                HEAR THE CONTOUR : E → C
              </div>
            </div>

            {/* LetterButtonBar */}
            <LetterButtonBar
              activeNotes={beat2ActiveNotes}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 3: Level 5 In-Game Play: Three-Note Phrase C -> G -> E (~48.0s - ~77.0s)
            Real 3D Harp Plucking Strings 1 (C4), 5 (G4), 3 (E4)!
           =================================================================== */}
        {activeBeatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 655,
                height: 1420,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <Harp3DCanvas
                width={655}
                height={1420}
                theta={-0.95}
                phi={1.34}
                radius={2.40}
                targetX={0}
                targetY={0.590}
                targetZ={0}
                fov={34}
                harpScale={0.938}
                leverEvents={[]}
                pluckEvents={beat3PluckEvents}
              />
            </div>

            {/* Top Prompt Header */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                padding: '12px 18px',
                borderRadius: 20,
                backgroundColor: 'rgba(8, 47, 73, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
                textAlign: 'center',
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent }}>LEVEL 5 · 3-NOTE PHRASE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                CONTOUR ARC : C → G → E
              </div>
            </div>

            {/* LetterButtonBar */}
            <LetterButtonBar
              activeNotes={beat3ActiveNotes}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 4: Audiation Drill & How to Improve (~77.0s - 100.0s)
           =================================================================== */}
        {activeBeatIndex === 4 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#021a29',
              opacity: enterSpring,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 24,
              gap: 16,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                padding: '14px 20px',
                borderRadius: 18,
                backgroundColor: 'rgba(12, 74, 110, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                MASTERY BLUEPRINT
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                THE AUDIATION DRILL
              </div>
            </div>

            {/* Step 1 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(8, 47, 73, 0.90)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: THEME.primary,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>SING SILENTLY BEFORE PLUCKING</div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Audiate each note in your mind's ear before touching the screen.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(8, 47, 73, 0.90)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: THEME.primary,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>TRACE THE PHRASE CONTOUR</div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Feel the shape of the phrase as an unbroken musical gesture.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(8, 47, 73, 0.90)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: THEME.primary,
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>HOLD TONIC C AS YOUR ANCHOR</div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Keep the home center active in memory to unlock complete fluency.
                </div>
              </div>
            </div>

            {/* CTA Pill */}
            <div
              style={{
                marginTop: 6,
                padding: '14px',
                borderRadius: 14,
                backgroundColor: 'rgba(2, 132, 199, 0.95)',
                border: `2px solid ${THEME.accent}`,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 16,
                textAlign: 'center',
                boxShadow: `0 0 25px ${THEME.primaryGlow}`,
              }}
            >
              Unlock Melodic Phrasing Fluency
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
