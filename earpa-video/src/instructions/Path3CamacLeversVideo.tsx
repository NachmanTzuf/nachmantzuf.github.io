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
import { Harp3DCanvas, LeverFlipEvent, PluckEvent } from '../earpa/Harp3DCanvas';
import timelineData from './timeline_path3.json';

const THEME: InstructionTheme = {
  primary: '#fbbf24', // Sandstone Amber
  primaryGlow: 'rgba(251, 191, 36, 0.45)',
  accent: '#f59e0b',
  bgGradient: 'radial-gradient(circle at 50% 25%, #78350f 0%, #301705 45%, #180902 100%)',
  trackLabel: 'PATH 3 · CAMAC LEVERS',
};

const FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const LEVER_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

// Map note name to 1-indexed string number on Celtic harp
const NOTE_TO_STRING: Record<string, number> = {
  C4: 1,
  D4: 2,
  E4: 3,
  F4: 4,
  'F#4': 4,
  G4: 5,
  A4: 6,
  B4: 7,
  C5: 8,
  D5: 2,
  E5: 3,
  'F#5': 4,
  G5: 5,
};

export const Path3CamacLeversVideo: React.FC = () => {
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

  let category = '01 · HARP ARCHITECTURE';
  let title = 'CELTIC SHARPING LEVERS';
  let subtitle = 'Physical Camac levers raise strings by one semitone, unlocking every key.';

  if (activeBeatIndex === 1) {
    category = '02 · IN-GAME STEP 1';
    title = 'LEARN THE SCALE : CIRCLE OF FIFTHS';
    subtitle = 'Before playing, the app teaches the scale and shows which levers to raise.';
  } else if (activeBeatIndex === 2) {
    category = '03 · IN-GAME STEP 2';
    title = 'BIG HARP ARENA : SET LEVERS';
    subtitle = 'Flip levers by direct 3D touch on the harp or tap the letter buttons below.';
  } else if (activeBeatIndex === 3) {
    category = '04 · IN-GAME STEP 3';
    title = 'CONFIRM & AUTOMATED SCALE WALK';
    subtitle = 'The app automatically walks the entirety of G Major from start to finish: G to G.';
  } else if (activeBeatIndex === 4) {
    category = '05 · IN-GAME STEP 4';
    title = 'RESULT VERIFICATION';
    subtitle = 'Instant feedback: every lever matched, or highlights missed strings to adjust.';
  } else if (activeBeatIndex === 5) {
    category = '06 · MODAL PROGRESSION';
    title = 'LEVEL 6 : D DORIAN';
    subtitle = 'Same C Major levers, but centering on note D as home with automated scale walk.';
  } else if (activeBeatIndex === 6) {
    category = '07 · MASTERY BLUEPRINT';
    title = 'HOW TO IMPROVE & MASTER';
    subtitle = 'Three essential principles for navigating all 76 levels with effortless confidence.';
  }

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  // Lever and Pluck events for Beat 2 (Arena & Set Levers)
  // timelineData[2]: f_up_time, lever_down_time, lever_up_again_time
  const s3Meta: any = timelineData[2];
  const fUpFrame = Math.round((s3Meta?.f_up_time || 57.13) * fps);
  const fDownFrame = Math.round((s3Meta?.lever_down_time || 64.94) * fps);
  const fUpAgainFrame = Math.round((s3Meta?.lever_up_again_time || 66.54) * fps);

  // Determine Lever 4 state at current frame
  let isLever4Up = false;
  if (frame >= fUpAgainFrame) {
    isLever4Up = true;
  } else if (frame >= fDownFrame) {
    isLever4Up = false;
  } else if (frame >= fUpFrame) {
    isLever4Up = true;
  }

  const beat2LeverEvents: LeverFlipEvent[] = [
    { leverNum: 4, flipFrame: fUpFrame, unflipFrame: fDownFrame },
    { leverNum: 4, flipFrame: fUpAgainFrame },
  ];

  const beat2PluckEvents: PluckEvent[] = [
    {
      stringNum: 4, // F#4 confirmation pluck
      startFrame: Math.round((s3Meta?.f_up_time + 0.6 || 57.73) * fps),
      amplitude: 0.022,
    },
  ];

  // Scale Walk Pluck Events for Beat 3 (G Major walk: G4 -> G5)
  const s4Meta: any = timelineData[3];
  const beat3PluckEvents: PluckEvent[] = (s4Meta?.notes || []).map((n: any) => ({
    stringNum: NOTE_TO_STRING[n.note] || 5,
    startFrame: n.frame,
    amplitude: 0.021,
  }));

  // Scale Walk Pluck Events for Beat 5 (D Dorian walk: D4 -> D5)
  const s6Meta: any = timelineData[5];
  const beat5PluckEvents: PluckEvent[] = (s6Meta?.notes || []).map((n: any) => ({
    stringNum: NOTE_TO_STRING[n.note] || 2,
    startFrame: n.frame,
    amplitude: 0.021,
  }));

  return (
    <AbsoluteFill>
      {/* Master Audio (V4): Broadcast narration + warm acoustic Sitka spruce Celtic harp */}
      <Audio src={staticFile('audio/instructions/path3_camac_levers_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={activeBeatIndex}
        totalBeats={7}
        localFrame={localFrame}
      >
        {/* ===================================================================
            BEAT 0: Celtic Lever Foundation (0.0s - ~19.5s)
            Real Celtic Harp Lore: Most commonly tuned to Eb Major. Zero string claims.
           =================================================================== */}
        {activeBeatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_levers_sanctuary.png')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Elegant Header Tag */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                padding: '14px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(50, 25, 10, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
                textAlign: 'center',
                zIndex: 20,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                CELTIC HARP FOUNDATION
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fef3c7', marginTop: 4 }}>
                MOST COMMONLY TUNED TO E♭ MAJOR
              </div>
            </div>

            {/* Bottom Principle Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 20,
                right: 20,
                padding: '16px 24px',
                borderRadius: 20,
                backgroundColor: 'rgba(25, 15, 8, 0.92)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
                zIndex: 20,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: 1 }}>
                1 LEVER ENGAGED = +1 SEMITONE
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#d6d3d1', marginTop: 4 }}>
                Unlocks every scale and mode across the Circle of Fifths
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 1: In-Game Step 1 - Circle of Fifths & Scale Discovery (~19.5s - ~43.0s)
            Shows the exact in-game screen teaching the scale and lever groups!
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#261c12',
              opacity: enterSpring,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            {/* Top In-Game Card Header */}
            <div
              style={{
                position: 'absolute',
                top: 45,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '14px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(60, 30, 10, 0.88)',
                border: `1.5px solid ${THEME.accent}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                INTERACTIVE LEVER METHOD · LEARN THE SCALE
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fef3c7', marginTop: 4 }}>
                G MAJOR · 1 SHARP (F♯)
              </div>
            </div>

            {/* Circle of Fifths Dial (Matching MechanicalFifths in the app) */}
            <div
              style={{
                position: 'relative',
                width: 320,
                height: 320,
                margin: '70px 0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Outer Circular Dotted Guide */}
              <div
                style={{
                  position: 'absolute',
                  inset: 15,
                  borderRadius: '50%',
                  border: '3px dotted #9c8050',
                  boxShadow: '0 0 25px rgba(251, 191, 36, 0.25)',
                }}
              />

              {/* 12 Keys around the Circle */}
              {FIFTHS.map((key, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const isSelected = key === 'G';
                const isC = key === 'C';
                const x = 140 + 120 * Math.cos(angle);
                const y = 140 + 120 * Math.sin(angle);

                return (
                  <div
                    key={key}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? '#fbbf24'
                        : isC
                        ? 'rgba(255, 255, 255, 0.18)'
                        : 'rgba(40, 50, 40, 0.85)',
                      border: `2px solid ${isSelected ? '#fef3c7' : isC ? '#fbbf24' : '#606458'}`,
                      boxShadow: isSelected ? '0 0 20px #fbbf24' : 'none',
                      color: isSelected ? '#1c1917' : '#f5f5f4',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {key}
                  </div>
                );
              })}

              {/* Center Display */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 20px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(30, 20, 10, 0.92)',
                  border: '1px solid #9c8050',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fef3c7' }}>G Major</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#d3c09a', marginTop: 2 }}>
                  1 step clockwise = 1 sharp
                </div>
              </div>
            </div>

            {/* Lever Configuration Guidance Box */}
            <div
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(60, 30, 10, 0.90)',
                border: `2px solid ${THEME.accent}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>
                REQUIRED LEVER ADJUSTMENT: RAISE NOTE F
              </div>
              {/* 8 Lever Mini-Rack */}
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', width: '100%' }}>
                {LEVER_LETTERS.map((l, i) => {
                  const isF = l === 'F';
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 10,
                        backgroundColor: isF ? 'rgba(251, 191, 36, 0.35)' : 'rgba(20, 15, 10, 0.85)',
                        border: `1.5px solid ${isF ? '#fbbf24' : '#57534e'}`,
                        textAlign: 'center',
                        boxShadow: isF ? '0 0 12px #fbbf24' : 'none',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: isF ? '#fbbf24' : l === 'C' ? '#ef4444' : '#d6d3d1',
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: isF ? '#fbbf24' : '#78716c',
                          marginTop: 2,
                        }}
                      >
                        {isF ? '↑ UP' : '↓ DN'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Begin Level Button */}
            <div
              style={{
                marginTop: 18,
                padding: '14px 28px',
                borderRadius: 16,
                backgroundColor: 'rgba(80, 50, 20, 0.95)',
                border: '2px solid #fbbf24',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: 1,
              }}
            >
              Begin 5-Round Level →
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 2: In-Game Step 2 - Big Harp Arena & Lever Controls (~43.0s - ~70.0s)
            THE HARP IS 100% VISIBLE, CENTERED, AND BEAUTIFULLY UNCLIPPED!
            Demonstrates Lever F flipping UP, then DOWN, then back UP!
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Absolute Arena Background */}
            <Img
              src={staticFile('textures/real/canyon_desert_pathway.jpg')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp: FIXED ABSOLUTELY AT (0, 0) WITH ZERO BLOCK CLIPPING */}
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
                leverEvents={beat2LeverEvents}
                pluckEvents={beat2PluckEvents}
              />
            </div>

            {/* Top In-Game Header */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                left: 18,
                right: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 40,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: '#edddc0' }}>‹ Home</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#edddc0' }}>Level 1 · 1 / 5</span>
            </div>

            {/* In-Game Challenge Prompt */}
            <div
              style={{
                position: 'absolute',
                top: 75,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '12px 18px',
                borderRadius: 20,
                backgroundColor: 'rgba(30, 20, 10, 0.88)',
                border: `1.5px solid ${THEME.accent}`,
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fef3c7' }}>G Major</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#edddc0', marginTop: 2 }}>
                Set levers on the harp or tap buttons below
              </div>
            </div>

            {/* Dynamic Subtle Indicator (Upper-Right, NEVER blocking the harp!) */}
            <div
              style={{
                position: 'absolute',
                top: 145,
                right: 18,
                padding: '8px 16px',
                borderRadius: 14,
                backgroundColor: 'rgba(20, 15, 10, 0.90)',
                border: `1.5px solid ${isLever4Up ? '#fbbf24' : '#78716c'}`,
                boxShadow: isLever4Up ? '0 0 15px rgba(251, 191, 36, 0.4)' : 'none',
                color: isLever4Up ? '#fbbf24' : '#d6d3d1',
                fontSize: 12,
                fontWeight: 800,
                zIndex: 40,
              }}
            >
              {isLever4Up ? 'LEVER F : ↑ UP (F♯)' : 'LEVER F : ↓ DN (F♮)'}
            </div>

            {/* Bottom Controls: Always-Visible 8 Letter Buttons */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 14,
                right: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                zIndex: 40,
              }}
            >
              {/* Show Circle of Fifths chip */}
              <div
                style={{
                  alignSelf: 'center',
                  padding: '6px 14px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(24, 20, 14, 0.85)',
                  border: '1px solid #786e58',
                  color: '#cdbd9e',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Show Circle of Fifths
              </div>

              {/* 8 Always-Visible Lever Buttons */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {LEVER_LETTERS.map((l, i) => {
                  const isF = l === 'F';
                  const isUp = isF ? isLever4Up : false;
                  const isRed = l === 'C';
                  const isBlue = l === 'F';
                  const borderCol = isUp
                    ? '#fbbf24'
                    : isRed
                    ? '#ef4444'
                    : isBlue
                    ? '#38bdf8'
                    : '#786e58';
                  const textCol = isUp
                    ? '#fbbf24'
                    : isRed
                    ? '#fca5a5'
                    : isBlue
                    ? '#93c5fd'
                    : '#edddc0';

                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 10,
                        backgroundColor: isUp
                          ? 'rgba(251, 191, 36, 0.35)'
                          : 'rgba(32, 26, 18, 0.92)',
                        border: `1.5px solid ${borderCol}`,
                        boxShadow: isUp ? '0 0 15px #fbbf24' : 'none',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 800, color: textCol }}>
                        {l}
                        {i === 7 ? '²' : ''}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isUp ? '#fbbf24' : '#9ca3af',
                          marginTop: 2,
                        }}
                      >
                        {isUp ? '↑ UP' : '↓ DN'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirm Scale Button */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(54, 53, 35, 0.95)',
                  border: '1.5px solid #c5a872',
                  textAlign: 'center',
                  fontSize: 17,
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(197, 168, 114, 0.35)',
                }}
              >
                Confirm scale →
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 3: In-Game Step 3 - Confirm & Automated Full Scale Walk (~70.0s - ~96.0s)
            App automatically walks G Major from tonic G up to octave G (G to G)!
           =================================================================== */}
        {activeBeatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/canyon_desert_pathway.jpg')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp: Lever F engaged UP, plucking each note of G Major! */}
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
                leverEvents={[{ leverNum: 4, flipFrame: 0 }]}
                pluckEvents={beat3PluckEvents}
              />
            </div>

            {/* Top In-Game Header */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                left: 18,
                right: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 40,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: '#edddc0' }}>‹ Home</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#edddc0' }}>Level 1 · 1 / 5</span>
            </div>

            {/* Active Scale Walk Header Card */}
            <div
              style={{
                position: 'absolute',
                top: 75,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '12px 18px',
                borderRadius: 20,
                backgroundColor: 'rgba(30, 20, 10, 0.92)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 25px ${THEME.primaryGlow}`,
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 1 }}>
                AUTOMATED SCALE RESOLUTION WALK
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fef3c7', marginTop: 2 }}>
                G MAJOR · TONIC G4 → OCTAVE G5
              </div>
            </div>

            {/* Bottom 8-Note Scale Walk Progression Bar (Matching LeverTrainingScreen.tsx!) */}
            <div
              style={{
                position: 'absolute',
                bottom: 30,
                left: 14,
                right: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                zIndex: 40,
              }}
            >
              <div style={{ textAlign: 'center', fontSize: 12, color: '#d6d3d1', fontWeight: 600 }}>
                Listen to the correct scale · start to finish
              </div>

              {/* 8 Scale Pills */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {['G', 'A', 'B', 'C', 'D', 'E', 'F♯', 'G'].map((noteName, i) => {
                  const noteEvent = s4Meta?.notes?.[i];
                  const noteFrame = noteEvent?.frame || 999999;
                  const isCurrentNote = frame >= noteFrame && frame < noteFrame + 16;
                  const isPastNote = frame >= noteFrame + 16;

                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 10,
                        backgroundColor: isCurrentNote
                          ? '#fbbf24'
                          : isPastNote
                          ? 'rgba(251, 191, 36, 0.25)'
                          : 'rgba(30, 20, 10, 0.88)',
                        border: `1.5px solid ${
                          isCurrentNote ? '#fef3c7' : isPastNote ? '#fbbf24' : '#605848'
                        }`,
                        boxShadow: isCurrentNote ? '0 0 20px #fbbf24' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCurrentNote ? '#1c1917' : isPastNote ? '#fef3c7' : '#a8a29e',
                        fontWeight: 900,
                        fontSize: 15,
                        transform: isCurrentNote ? 'scale(1.08)' : 'scale(1.0)',
                      }}
                    >
                      {noteName}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 4: In-Game Step 4 - Result Verification (~96.0s - ~108.0s)
            Shows the exact result screen with "Correct", "Every lever is in place."
           =================================================================== */}
        {activeBeatIndex === 4 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#261c12',
              opacity: enterSpring,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            {/* Top Tag */}
            <div
              style={{
                position: 'absolute',
                top: 45,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '12px 18px',
                borderRadius: 20,
                backgroundColor: 'rgba(60, 30, 10, 0.85)',
                border: `1.5px solid ${THEME.accent}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>IN-GAME VERIFICATION</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fef3c7', marginTop: 2 }}>
                G MAJOR · 1 SHARP (F♯)
              </div>
            </div>

            {/* Big Success Result Card (Matching LeverTrainingScreen result modal!) */}
            <div
              style={{
                width: '100%',
                padding: '32px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(40, 25, 12, 0.95)',
                border: '2px solid #a3e635',
                boxShadow: '0 0 40px rgba(163, 230, 53, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 44, fontWeight: 900, color: '#a3e635' }}>Correct</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fef3c7' }}>
                Every lever is in place.
              </div>
              <div style={{ fontSize: 14, color: '#d6d3d1', textAlign: 'center', lineHeight: 1.4 }}>
                8 of 8 levers matched · G Major verified from start to finish
              </div>

              {/* 8 Matched Pills */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', width: '100%', marginTop: 8 }}>
                {LEVER_LETTERS.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      backgroundColor: 'rgba(163, 230, 53, 0.25)',
                      border: '1.5px solid #a3e635',
                      textAlign: 'center',
                      color: '#a3e635',
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    <div>{l}</div>
                    <div style={{ fontSize: 10, marginTop: 2 }}>✓</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Scale Button */}
            <div
              style={{
                marginTop: 24,
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: 'rgba(80, 50, 20, 0.95)',
                border: '2px solid #fbbf24',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 18,
                textAlign: 'center',
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.4)',
              }}
            >
              Next scale →
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 5: Modal Progression - Level 6: D Dorian (~108.0s - ~131.0s)
            Real in-game Level 6 arena, full D Dorian scale walk: D4 to D5!
           =================================================================== */}
        {activeBeatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/canyon_desert_pathway.jpg')}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp: All natural C Major levers down, plucking complete D Dorian scale! */}
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
                pluckEvents={beat5PluckEvents}
              />
            </div>

            {/* Top In-Game Header */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                left: 18,
                right: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 40,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: '#edddc0' }}>‹ Home</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#edddc0' }}>Level 6 · 1 / 5</span>
            </div>

            {/* Active Modal Header Card */}
            <div
              style={{
                position: 'absolute',
                top: 75,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '12px 18px',
                borderRadius: 20,
                backgroundColor: 'rgba(30, 20, 10, 0.92)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 25px ${THEME.primaryGlow}`,
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 1 }}>
                MODAL HARMONY · NATURAL LEVERS
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fef3c7', marginTop: 2 }}>
                D DORIAN · TONIC D4 → OCTAVE D5
              </div>
            </div>

            {/* Bottom 8-Note Scale Walk Progression Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 30,
                left: 14,
                right: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                zIndex: 40,
              }}
            >
              <div style={{ textAlign: 'center', fontSize: 12, color: '#d6d3d1', fontWeight: 600 }}>
                Listen to the modal scale · D4 to D5 start to finish
              </div>

              {/* 8 Scale Pills */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                {['D', 'E', 'F', 'G', 'A', 'B', 'C', 'D'].map((noteName, i) => {
                  const noteEvent = s6Meta?.notes?.[i];
                  const noteFrame = noteEvent?.frame || 999999;
                  const isCurrentNote = frame >= noteFrame && frame < noteFrame + 16;
                  const isPastNote = frame >= noteFrame + 16;

                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 10,
                        backgroundColor: isCurrentNote
                          ? '#fbbf24'
                          : isPastNote
                          ? 'rgba(251, 191, 36, 0.25)'
                          : 'rgba(30, 20, 10, 0.88)',
                        border: `1.5px solid ${
                          isCurrentNote ? '#fef3c7' : isPastNote ? '#fbbf24' : '#605848'
                        }`,
                        boxShadow: isCurrentNote ? '0 0 20px #fbbf24' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCurrentNote ? '#1c1917' : isPastNote ? '#fef3c7' : '#a8a29e',
                        fontWeight: 900,
                        fontSize: 15,
                        transform: isCurrentNote ? 'scale(1.08)' : 'scale(1.0)',
                      }}
                    >
                      {noteName}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 6: How to Play & How to Improve (~131.0s - 150.0s)
            The 3 Essential Mastery Rules!
           =================================================================== */}
        {activeBeatIndex === 6 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#1c150e',
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
                padding: '12px 18px',
                borderRadius: 18,
                backgroundColor: 'rgba(50, 25, 10, 0.90)',
                border: `1.5px solid ${THEME.accent}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                MASTERY BLUEPRINT
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fef3c7', marginTop: 2 }}>
                THREE ESSENTIAL PRINCIPLES
              </div>
            </div>

            {/* Rule 1 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(35, 22, 12, 0.92)',
                border: '1px solid #786e58',
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
                  backgroundColor: '#fbbf24',
                  color: '#1c1917',
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
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                  CIRCLE OF FIFTHS ORDER
                </div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Sharps enter clockwise in strict sequence: F, C, G, D, A, E, B.
                </div>
              </div>
            </div>

            {/* Rule 2 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(35, 22, 12, 0.92)',
                border: '1px solid #786e58',
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
                  backgroundColor: '#fbbf24',
                  color: '#1c1917',
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
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                  TWO C STRINGS · OCTAVE RULE
                </div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  When key changes affect C, always flip both C4 (string 1) and C5 (string 8).
                </div>
              </div>
            </div>

            {/* Rule 3 */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(35, 22, 12, 0.92)',
                border: '1px solid #786e58',
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
                  backgroundColor: '#fbbf24',
                  color: '#1c1917',
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
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff' }}>
                  AUDIATE BEFORE YOU CONFIRM
                </div>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginTop: 2 }}>
                  Hear the raised semitone in your mind before tapping confirm.
                </div>
              </div>
            </div>

            {/* Closing Brand Pill */}
            <div
              style={{
                marginTop: 6,
                padding: '14px',
                borderRadius: 14,
                backgroundColor: 'rgba(80, 50, 20, 0.95)',
                border: '2px solid #fbbf24',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 16,
                textAlign: 'center',
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.35)',
              }}
            >
              Master All 76 Levels with Confidence
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
