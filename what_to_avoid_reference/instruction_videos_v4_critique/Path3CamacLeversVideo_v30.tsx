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
import { Harp3DCanvas } from '../earpa/Harp3DCanvas';

const THEME: InstructionTheme = {
  primary: '#fbbf24', // Sandstone Amber
  primaryGlow: 'rgba(251, 191, 36, 0.45)',
  accent: '#f59e0b',
  bgGradient: 'radial-gradient(circle at 50% 25%, #78350f 0%, #301705 45%, #180902 100%)',
  trackLabel: 'PATH 3 · CAMAC LEVERS',
};

const FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const LEVER_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

export const Path3CamacLeversVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // -------------------------------------------------------------------------
  // 7 Beat Progression (Total: 3600 frames = 120.0s @ 30fps)
  // -------------------------------------------------------------------------
  let beatIndex = 0;
  let beatStart = 0;
  let category = '01 · HARP ARCHITECTURE';
  let title = 'CELTIC SHARPING LEVERS';
  let subtitle = 'Physical Camac levers raise strings by one semitone, unlocking every key.';

  if (frame >= 3240) {
    beatIndex = 6;
    beatStart = 3240;
    category = '07 · MASTERY BLUEPRINT';
    title = 'HOW TO IMPROVE & MASTER';
    subtitle = 'Three essential principles for navigating all 76 levels with effortless confidence.';
  } else if (frame >= 2640) {
    beatIndex = 5;
    beatStart = 2640;
    category = '06 · MODAL PROGRESSION';
    title = 'LEVEL 6 : D DORIAN';
    subtitle = 'Same C Major levers, but centering on note D as home with automated scale walk.';
  } else if (frame >= 2280) {
    beatIndex = 4;
    beatStart = 2280;
    category = '05 · IN-GAME STEP 4';
    title = 'RESULT VERIFICATION';
    subtitle = 'Instant feedback: every lever matched, or highlights missed strings to adjust.';
  } else if (frame >= 1620) {
    beatIndex = 3;
    beatStart = 1620;
    category = '04 · IN-GAME STEP 3';
    title = 'CONFIRM & AUTOMATED SCALE WALK';
    subtitle = 'The app automatically walks the entirety of G Major from start to finish: G to G.';
  } else if (frame >= 1020) {
    beatIndex = 2;
    beatStart = 1020;
    category = '03 · IN-GAME STEP 2';
    title = 'BIG HARP ARENA : SET LEVERS';
    subtitle = 'Flip levers by direct 3D touch on the harp or tap the letter buttons below.';
  } else if (frame >= 480) {
    beatIndex = 1;
    beatStart = 480;
    category = '02 · IN-GAME STEP 1';
    title = 'LEARN THE SCALE : CIRCLE OF FIFTHS';
    subtitle = 'Before playing, the app teaches the scale and shows which levers to raise.';
  }

  const localFrame = frame - beatStart;
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      {/* Master Audio: Natural unhurried TTS + Warm Spruce Harp Cadence + Real Wood Foley */}
      <Audio src={staticFile('audio/instructions/path3_camac_levers_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={beatIndex}
        totalBeats={7}
        localFrame={localFrame}
      >
        {/* ===================================================================
            BEAT 0: Celtic Lever Foundation (0s - 16s / frames 0 - 480)
            No false string counts! Most commonly tuned to Eb Major.
           =================================================================== */}
        {beatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_levers_sanctuary.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Dynamic Switching Badges */}
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '16px 32px',
                borderRadius: 24,
                backgroundColor: 'rgba(80, 36, 12, 0.95)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 2,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {frame < 200
                ? 'CELTIC HARP SHARPING LEVERS'
                : frame < 360
                ? 'MOST COMMONLY TUNED TO E♭ MAJOR'
                : '1 LEVER = +1 SEMITONE · CIRCLE OF FIFTHS'}
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 1: In-Game Step 1 - Circle of Fifths (16s - 34s / frames 480 - 1020)
            Shows the exact in-game screen teaching the scale and lever groups!
           =================================================================== */}
        {beatIndex === 1 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#2c2217',
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
                top: 50,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '14px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(60, 30, 10, 0.85)',
                border: `1.5px solid ${THEME.accent}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
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
                margin: '80px 0 30px',
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
                  backgroundColor: 'rgba(30, 20, 10, 0.90)',
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
              <div style={{ fontSize: 14, fontWeight: 800, color: THEME.accent }}>
                REQUIRED LEVER ADJUSTMENT: RAISE NOTE F
              </div>
              {/* 8 Lever Mini-Rack */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {LEVER_LETTERS.map((l, i) => {
                  const isF = l === 'F';
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        backgroundColor: isF ? 'rgba(251, 191, 36, 0.35)' : 'rgba(20, 15, 10, 0.85)',
                        border: `1.5px solid ${isF ? '#fbbf24' : '#57534e'}`,
                        textAlign: 'center',
                        boxShadow: isF ? '0 0 12px #fbbf24' : 'none',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: isF ? '#fbbf24' : l === 'C' ? '#ef4444' : '#d6d3d1',
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
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

            {/* Button */}
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
            BEAT 2: In-Game Step 2 - Big Harp Arena & Lever Controls (34s - 54s / frames 1020 - 1620)
            Harp size EXACTLY MATCHES Single & Melody (customScale 0.938, targetY 0.590)!
            Lever buttons ALWAYS directly visible! F lever flips UP.
           =================================================================== */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Arena Background */}
            <Img
              src={staticFile('textures/real/canyon_desert_pathway.jpg')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp: EXACT scale (0.938) & targetY (0.590) as Single & Melody */}
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
              leverEvents={[
                {
                  leverNum: 4, // String F / Lever 4
                  flipFrame: 465, // frame 1485 absolute (49.5s)
                },
              ]}
              pluckEvents={[
                {
                  stringNum: 4, // F#4
                  startFrame: 546, // frame 1566 absolute (52.2s)
                  amplitude: 0.022,
                },
              ]}
            />

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

            {/* Interactive Control Callout (Voice: by touch or by buttons) */}
            <div
              style={{
                position: 'absolute',
                top: '44%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '12px 24px',
                borderRadius: 20,
                backgroundColor: 'rgba(20, 15, 10, 0.92)',
                border: '2px solid #fbbf24',
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.45)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: 1,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                zIndex: 40,
              }}
            >
              {frame < 1485
                ? 'TOUCH 3D LEVER DIRECTLY OR USE BUTTONS'
                : 'NOTE F LEVER ENGAGED → F♯ (+1 SEMITONE)'}
            </div>

            {/* Bottom Controls (Matching the updated LeverTrainingScreen.tsx!) */}
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
                  const isUp = isF && frame >= 1485;
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
            BEAT 3: In-Game Step 3 - Confirm & Automated Full Scale Walk (54s - 76s / frames 1620 - 2280)
            App automatically walks G Major from tonic G up to octave G (G to G)!
           =================================================================== */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/canyon_desert_pathway.jpg')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp: Lever F engaged UP, plucking each note of G Major! */}
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
              pluckEvents={[
                { stringNum: 5, startFrame: 276, amplitude: 0.024 }, // G4 (frame 1896 = 63.2s)
                { stringNum: 6, startFrame: 292, amplitude: 0.024 }, // A4 (frame 1912 = 63.7s)
                { stringNum: 7, startFrame: 307, amplitude: 0.024 }, // B4 (frame 1927 = 64.2s)
                { stringNum: 8, startFrame: 323, amplitude: 0.024 }, // C5 (frame 1943 = 64.8s)
                { stringNum: 2, startFrame: 339, amplitude: 0.024 }, // D5 (frame 1959 = 65.3s)
                { stringNum: 3, startFrame: 354, amplitude: 0.024 }, // E5 (frame 1974 = 65.8s)
                { stringNum: 4, startFrame: 370, amplitude: 0.024 }, // F#5 (frame 1990 = 66.3s)
                { stringNum: 5, startFrame: 386, amplitude: 0.024 }, // G5 (frame 2006 = 66.9s)
              ]}
            />

            {/* Top Prompt Card */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '14px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(30, 20, 10, 0.90)',
                border: `2px solid ${THEME.accent}`,
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 1.5 }}>
                AUTOMATED SCALE WALK · TONIC G TO OCTAVE G
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fef3c7', marginTop: 4 }}>
                Listening to the full scale: start to finish
              </div>
            </div>

            {/* Prominent Callout Banner */}
            <div
              style={{
                position: 'absolute',
                top: '44%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '14px 28px',
                borderRadius: 22,
                backgroundColor: 'rgba(40, 25, 10, 0.95)',
                border: `2px solid ${THEME.primary}`,
                boxShadow: `0 0 35px ${THEME.primary}`,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: 1.5,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                zIndex: 40,
              }}
            >
              FULL OCTAVE WALK: G → G (NOT C TO C)
            </div>

            {/* 8 Note Scale Walkdown Indicators (Matching In-Game Check Walk!) */}
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 18,
                right: 18,
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
                zIndex: 40,
              }}
            >
              {[
                { note: 'G', midi: 'G4', frameStart: 1896 },
                { note: 'A', midi: 'A4', frameStart: 1912 },
                { note: 'B', midi: 'B4', frameStart: 1927 },
                { note: 'C', midi: 'C5', frameStart: 1943 },
                { note: 'D', midi: 'D5', frameStart: 1959 },
                { note: 'E', midi: 'E5', frameStart: 1974 },
                { note: 'F♯', midi: 'F#5', frameStart: 1990 },
                { note: 'G', midi: 'G5', frameStart: 2006 },
              ].map((step, idx) => {
                const isActive = frame >= step.frameStart && frame < step.frameStart + 24;
                const isPast = frame >= step.frameStart + 24;

                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: 54,
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive
                        ? 'rgba(251, 191, 36, 0.40)'
                        : isPast
                        ? 'rgba(34, 197, 94, 0.25)'
                        : 'rgba(20, 15, 10, 0.85)',
                      border: `2px solid ${
                        isActive ? '#fbbf24' : isPast ? '#22c55e' : '#57534e'
                      }`,
                      boxShadow: isActive ? '0 0 20px #fbbf24' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: isActive ? '#fbbf24' : isPast ? '#4ade80' : '#d6d3d1',
                      }}
                    >
                      {step.note}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: isActive ? '#fef3c7' : isPast ? '#86efac' : '#78716c',
                        marginTop: 2,
                      }}
                    >
                      {idx === 0 ? 'Tonic' : idx === 7 ? 'Octave' : `${idx + 1}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 4: In-Game Step 4 - Result Verification (76s - 88s / frames 2280 - 2640)
            Shows the exact in-game screen: Correct! Every lever in place.
           =================================================================== */}
        {beatIndex === 4 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#241c14',
              opacity: enterSpring,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            {/* Main Result Card */}
            <div
              style={{
                width: '100%',
                padding: '28px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(40, 25, 10, 0.95)',
                border: '2px solid #22c55e',
                boxShadow: '0 0 35px rgba(34, 197, 94, 0.35)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 900, color: '#4ade80', letterSpacing: 1 }}>
                ✓ Correct
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fef3c7' }}>
                Every lever is in place · G Major matched
              </div>

              {/* Score Metric */}
              <div
                style={{
                  padding: '12px 28px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#4ade80',
                }}
              >
                1 / 5 Rounds Matched
              </div>

              {/* Scale Note Row */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }}>
                {['G', 'A', 'B', 'C', 'D', 'E', 'F♯', 'G'].map((n, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      backgroundColor: 'rgba(34, 197, 94, 0.20)',
                      border: '1px solid #22c55e',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Guidance Callout */}
            <div
              style={{
                marginTop: 24,
                width: '100%',
                padding: '16px 20px',
                borderRadius: 18,
                backgroundColor: 'rgba(30, 20, 10, 0.90)',
                border: '1.5px solid #fbbf24',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>
                IF ANY LEVER IS MISSED
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#edddc0', marginTop: 4 }}>
                The app highlights the exact string so you can adjust immediately.
              </div>
            </div>

            {/* Next Scale Button */}
            <div
              style={{
                marginTop: 20,
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                backgroundColor: 'rgba(54, 53, 35, 0.95)',
                border: '1.5px solid #c5a872',
                textAlign: 'center',
                fontSize: 17,
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              Next scale →
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 5: Modal Progression - D Dorian (88s - 108s / frames 2640 - 3240)
            App walks the complete D Dorian scale start to finish (D to D)!
           =================================================================== */}
        {beatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/canyon_desert_pathway.jpg')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 3D Big Celtic Harp: D Dorian plucking in sequence! */}
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
              pluckEvents={[
                { stringNum: 2, startFrame: 450, amplitude: 0.024 }, // D4 (frame 3090 = 103.0s)
                { stringNum: 3, startFrame: 466, amplitude: 0.024 }, // E4 (frame 3106 = 103.5s)
                { stringNum: 4, startFrame: 481, amplitude: 0.024 }, // F4 (frame 3121 = 104.0s)
                { stringNum: 5, startFrame: 497, amplitude: 0.024 }, // G4 (frame 3137 = 104.5s)
                { stringNum: 6, startFrame: 513, amplitude: 0.024 }, // A4 (frame 3153 = 105.1s)
                { stringNum: 7, startFrame: 528, amplitude: 0.024 }, // B4 (frame 3168 = 105.6s)
                { stringNum: 8, startFrame: 544, amplitude: 0.024 }, // C5 (frame 3184 = 106.1s)
                { stringNum: 2, startFrame: 560, amplitude: 0.024 }, // D5 (frame 3200 = 106.6s)
              ]}
            />

            {/* Top Modal Header */}
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 20,
                right: 20,
                textAlign: 'center',
                padding: '14px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(30, 20, 10, 0.90)',
                border: `2px solid ${THEME.accent}`,
                zIndex: 40,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 1.5 }}>
                ADVANCED MODAL SHIFTS · LEVEL 6
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fef3c7', marginTop: 4 }}>
                D Dorian · Same C Major Levers, Home Note D
              </div>
            </div>

            {/* Modal Callout */}
            <div
              style={{
                position: 'absolute',
                top: '44%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '14px 28px',
                borderRadius: 22,
                backgroundColor: 'rgba(40, 25, 10, 0.95)',
                border: `2px solid ${THEME.primary}`,
                boxShadow: `0 0 35px ${THEME.primary}`,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: 1.5,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                zIndex: 40,
              }}
            >
              AUTOMATED D DORIAN WALK: D → D
            </div>

            {/* 8 Note Scale Row */}
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 18,
                right: 18,
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
                zIndex: 40,
              }}
            >
              {['D', 'E', 'F', 'G', 'A', 'B', 'C', 'D'].map((n, i) => {
                const stepFrame = 3090 + i * 16;
                const isActive = frame >= stepFrame && frame < stepFrame + 24;
                const isPast = frame >= stepFrame + 24;

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 54,
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive
                        ? 'rgba(251, 191, 36, 0.40)'
                        : isPast
                        ? 'rgba(56, 189, 248, 0.25)'
                        : 'rgba(20, 15, 10, 0.85)',
                      border: `2px solid ${
                        isActive ? '#fbbf24' : isPast ? '#38bdf8' : '#57534e'
                      }`,
                      boxShadow: isActive ? '0 0 20px #fbbf24' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: isActive ? '#fbbf24' : isPast ? '#7dd3fc' : '#d6d3d1',
                      }}
                    >
                      {n}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: isActive ? '#fef3c7' : isPast ? '#bae6fd' : '#78716c',
                        marginTop: 2,
                      }}
                    >
                      {i === 0 ? 'Home' : i === 5 ? 'Natural B' : `${i + 1}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 6: How to Play & How to Improve (108s - 120s / frames 3240 - 3600)
            Focused on gameplay mastery and rapid ear improvement!
           =================================================================== */}
        {beatIndex === 6 && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#201812',
              opacity: enterSpring,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              gap: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
              THREE RULES FOR LEVER MASTERY
            </div>

            {/* Rule 1: Circle Order */}
            <div
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(40, 25, 15, 0.95)',
                border: '1.5px solid #fbbf24',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.25)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>
                RULE 1 · CLOCKWISE CIRCLE ORDER
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fef3c7', marginTop: 4 }}>
                Raise sharps in order: F → C → G → D → A → E → B
              </div>
            </div>

            {/* Rule 2: Octave Rule */}
            <div
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(40, 25, 15, 0.95)',
                border: '1.5px solid #fbbf24',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.25)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>
                RULE 2 · THE OCTAVE RULE
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fef3c7', marginTop: 4 }}>
                Strings sharing a letter (like C4 and C5) must flip together.
              </div>
            </div>

            {/* Rule 3: Audiation */}
            <div
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(40, 25, 15, 0.95)',
                border: '1.5px solid #fbbf24',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.25)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>
                RULE 3 · AUDIATE BEFORE CONFIRMING
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fef3c7', marginTop: 4 }}>
                Hear the raised pitch in your mind before tapping confirm.
              </div>
            </div>

            {/* Final CTA Banner */}
            <div
              style={{
                marginTop: 10,
                width: '100%',
                padding: '16px',
                borderRadius: 18,
                backgroundColor: 'rgba(80, 50, 15, 0.95)',
                border: '2px solid #fbbf24',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.40)',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                76 CANYON LEVELS · MASTER EVERY KEY & MODE
              </div>
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
