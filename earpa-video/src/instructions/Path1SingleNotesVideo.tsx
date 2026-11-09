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
import timelineData from './timeline_path1.json';

const THEME: InstructionTheme = {
  primary: '#10b981', // Emerald
  primaryGlow: 'rgba(16, 185, 129, 0.45)',
  accent: '#34d399',
  bgGradient: 'radial-gradient(circle at 50% 25%, #064e3b 0%, #022c22 45%, #01140e 100%)',
  trackLabel: 'PATH 1 · SINGLE NOTES',
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

export const Path1SingleNotesVideo: React.FC = () => {
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
  let title = 'TONAL GRAVITATION';
  let subtitle = 'Train your ear to feel musical pull toward a home center, rather than guessing in a vacuum.';

  if (activeBeatIndex === 1) {
    category = '02 · ROADMAP ENTRY';
    title = 'LEVEL 1 : THE TONIC ANCHOR';
    subtitle = 'Enter the Coastal Ridge Sanctuary to begin functional interval training.';
  } else if (activeBeatIndex === 2) {
    category = '03 · ROUND 1 : STABILITY';
    title = 'NOTE G : THE BRIGHT FIFTH';
    subtitle = 'Hear the cadence ground your ear in C Major, then identify the stable open fifth.';
  } else if (activeBeatIndex === 3) {
    category = '04 · ROUND 2 : DOWNWARD ACHE';
    title = 'NOTE F : DOWNWARD PULL';
    subtitle = 'Feel the heavy downward ache toward home C, verified by the stepwise resolution walk.';
  } else if (activeBeatIndex === 4) {
    category = '05 · ROUND 3 : UPWARD SNAP';
    title = 'NOTE B : LEADING TONE';
    subtitle = 'Experience the intense magnetic upward snap resolving directly into high C.';
  } else if (activeBeatIndex === 5) {
    category = '06 · MASTERY BLUEPRINT';
    title = 'THE 5-MINUTE DAILY HABIT';
    subtitle = 'Always hum tonic C before touching a string to build an effortless musical ear.';
  }

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  // Pluck events for Beat 2 (Round 1: Note G)
  const s3Meta: any = timelineData[2];
  const beat2PluckEvents: PluckEvent[] = [
    {
      stringNum: 5, // Mystery G4
      startFrame: Math.round((s3Meta?.mystery_pluck || 36.28) * fps),
      amplitude: 0.024,
    },
    {
      stringNum: 5, // User pluck G4
      startFrame: Math.round((s3Meta?.user_pluck || 47.44) * fps),
      amplitude: 0.022,
    },
  ];
  if (s3Meta?.notes) {
    s3Meta.notes.forEach((n: any) => {
      beat2PluckEvents.push({
        stringNum: NOTE_TO_STRING[n.note] || 5,
        startFrame: n.frame,
        amplitude: 0.020,
      });
    });
  }

  // Active notes for button bar during Beat 2
  const beat2ActiveNotes: string[] = [];
  const mysteryGFrame = Math.round((s3Meta?.mystery_pluck || 36.28) * fps);
  const userGFrame = Math.round((s3Meta?.user_pluck || 47.44) * fps);
  if (frame >= userGFrame && frame < userGFrame + 24) {
    beat2ActiveNotes.push('G');
  }
  if (s3Meta?.notes) {
    s3Meta.notes.forEach((n: any) => {
      if (frame >= n.frame && frame < n.frame + 15) {
        beat2ActiveNotes.push(n.note.replace(/[0-9]/g, ''));
      }
    });
  }

  // Pluck events for Beat 3 (Round 2: Note F)
  const s4Meta: any = timelineData[3];
  const beat3PluckEvents: PluckEvent[] = [
    {
      stringNum: 4, // Mystery F4 Blue
      startFrame: Math.round((s4Meta?.mystery_pluck || 56.74) * fps),
      amplitude: 0.024,
    },
    {
      stringNum: 4, // User pluck F4
      startFrame: Math.round((s4Meta?.user_pluck || 62.74) * fps),
      amplitude: 0.022,
    },
  ];
  if (s4Meta?.notes) {
    s4Meta.notes.forEach((n: any) => {
      beat3PluckEvents.push({
        stringNum: NOTE_TO_STRING[n.note] || 4,
        startFrame: n.frame,
        amplitude: 0.020,
      });
    });
  }

  const beat3ActiveNotes: string[] = [];
  const userFFrame = Math.round((s4Meta?.user_pluck || 62.74) * fps);
  if (frame >= userFFrame && frame < userFFrame + 24) {
    beat3ActiveNotes.push('F');
  }
  if (s4Meta?.notes) {
    s4Meta.notes.forEach((n: any) => {
      if (frame >= n.frame && frame < n.frame + 15) {
        beat3ActiveNotes.push(n.note.replace(/[0-9]/g, ''));
      }
    });
  }

  // Pluck events for Beat 4 (Round 3: Note B & Snap C5)
  const s5Meta: any = timelineData[4];
  const beat4PluckEvents: PluckEvent[] = [
    {
      stringNum: 7, // Mystery B4
      startFrame: Math.round((s5Meta?.mystery_pluck || 74.64) * fps),
      amplitude: 0.024,
    },
    {
      stringNum: 8, // Snap C5 Red
      startFrame: Math.round((s5Meta?.snap_c5 || 82.72) * fps),
      amplitude: 0.026,
    },
  ];

  return (
    <AbsoluteFill>
      {/* Master Audio (V4): Broadcast narration + warm acoustic Sitka spruce Celtic harp */}
      <Audio src={staticFile('audio/instructions/path1_single_notes_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={activeBeatIndex}
        totalBeats={6}
        localFrame={localFrame}
      >
        {/* ===================================================================
            BEAT 0: Core Alain Benbassat Methodology (0.0s - ~22.0s)
           =================================================================== */}
        {activeBeatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_single_sanctuary.png')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Liquid-Glass Tonal Gravitation Brief Card */}
            <div
              style={{
                position: 'absolute',
                top: '42%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '88%',
                padding: '24px',
                borderRadius: 24,
                backgroundColor: 'rgba(6, 44, 34, 0.92)',
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
                  ALAIN BENBASSAT LAW
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>TONAL GRAVITATION</span>
              </div>

              {/* Visual Pull Vectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Pull Downward */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff' }}>NOTE F → PULL DOWN</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: THEME.accent }}>
                      Subdominant ache falling through E, D to C
                    </div>
                  </div>
                  <span style={{ fontSize: 24, color: '#38bdf8', fontWeight: 900 }}>↓</span>
                </div>

                {/* Tonic Center */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(16, 185, 129, 0.35)',
                    border: `2px solid ${THEME.primary}`,
                    boxShadow: `0 0 20px ${THEME.primary}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff' }}>TONIC HOME CENTER (C)</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>
                      Complete rest · Zero tension
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: '#ffffff', fontWeight: 900 }}>●</span>
                </div>

                {/* Pull Upward */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff' }}>NOTE B → SNAP UPWARD</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: THEME.accent }}>
                      Leading tone magnetic snap up to high C
                    </div>
                  </div>
                  <span style={{ fontSize: 24, color: '#fbbf24', fontWeight: 900 }}>↑</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 1: Coastal Ridge Roadmap Pre-Roll (~22.0s - ~28.0s)
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_coastal_roadmap.png')}
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
                backgroundColor: 'rgba(6, 78, 59, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent }}>ENTERING LEVEL 1</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                THE TONIC ANCHOR : HOME NOTE C
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 2: Round 1 In-Game Play: Note G Stability & Resolution Walk (~28.0s - ~52.0s)
            THE REAL 3D CELTIC HARP IS FULLY VISIBLE & CENTERED!
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Absolute Arena Background */}
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp: Fixed Absolutely at (0, 0) */}
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
                backgroundColor: 'rgba(6, 44, 34, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
                textAlign: 'center',
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent }}>ROUND 1 · TONAL ANCHOR</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                IDENTIFY THE MYSTERY NOTE
              </div>
            </div>

            {/* LetterButtonBar: Always Accessible at Bottom */}
            <LetterButtonBar
              activeNotes={beat2ActiveNotes}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 3: Round 2 In-Game Play: Note F Downward Ache (~52.0s - ~74.0s)
            Real 3D Harp Plucking String 4 (F4 Blue) & Falling Resolution Walk!
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
                backgroundColor: 'rgba(6, 44, 34, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
                textAlign: 'center',
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent }}>ROUND 2 · DOWNWARD PULL</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                NOTE F → FALLING TO HOME C
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
            BEAT 4: Round 3 In-Game Play: Note B Upward Snap (~74.0s - ~85.0s)
           =================================================================== */}
        {activeBeatIndex === 4 && (
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
                pluckEvents={beat4PluckEvents}
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
                backgroundColor: 'rgba(6, 44, 34, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
                textAlign: 'center',
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent }}>ROUND 3 · UPWARD SNAP</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                NOTE B → SNAPPING UP TO C5
              </div>
            </div>

            {/* LetterButtonBar */}
            <LetterButtonBar
              activeNotes={frame >= Math.round((s5Meta?.snap_c5 || 82.72) * fps) ? ['C'] : ['B']}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 5: Mastery & 5-Minute Habit (~85.0s - 100.0s)
           =================================================================== */}
        {activeBeatIndex === 5 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#031f18',
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
                backgroundColor: 'rgba(6, 78, 59, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                MASTERY BLUEPRINT
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                THE 5-MINUTE DAILY HABIT
              </div>
            </div>

            {/* Step 1 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(4, 47, 36, 0.90)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
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
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>HUM TONIC HOME NOTE C</div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Always ground your vocal pitch center before touching a string.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(4, 47, 36, 0.90)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
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
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>FEEL TONAL GRAVITATION</div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Listen for the ache: is the note pulling downward, or snapping upward?
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(4, 47, 36, 0.90)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
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
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>RESOLVE STEPWISE TO TONIC</div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Verify your guess with the resolution walk to build instant reflex.
                </div>
              </div>
            </div>

            {/* CTA Pill */}
            <div
              style={{
                marginTop: 6,
                padding: '14px',
                borderRadius: 14,
                backgroundColor: 'rgba(16, 185, 129, 0.95)',
                border: `2px solid ${THEME.accent}`,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 16,
                textAlign: 'center',
                boxShadow: `0 0 25px ${THEME.primaryGlow}`,
              }}
            >
              Start 5 Minutes Daily Practice
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
