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
import { LetterButtonBar } from './LetterButtonBar';

const THEME: InstructionTheme = {
  primary: '#fbbf24',
  primaryGlow: 'rgba(251, 191, 36, 0.45)',
  accent: '#fde68a',
  bgGradient: 'radial-gradient(circle at 50% 25%, #78350f 0%, #451a03 45%, #180901 100%)',
  trackLabel: 'PATH 3 · CAMAC SHARPING LEVERS',
};

// 110 seconds at 30 fps = 3300 frames
export const Path3CamacLeversVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 5 Distinct Pedagogical Beats
  // Beat 1: 0 - 540 (0s - 18s) -> 27 Camac Sharping Levers & Sanctuary
  // Beat 2: 540 - 1140 (18s - 38s) -> 3D Harp Kinematic Lever Flip & 5.6% Law
  // Beat 3: 1140 - 1740 (38s - 58s) -> Native E-flat to C Major Configuration
  // Beat 4: 1740 - 2640 (58s - 88s) -> Interactive Modal Shifts & Resolution Walkdown
  // Beat 5: 2640 - 3300 (88s - 110s) -> Canyon Roadmap & Modal Mastery

  let beatIndex = 0;
  let beatStart = 0;
  let category = '01 · ACOUSTIC HARP PHYSICS';
  let title = '27 CAMAC LEVERS';
  let subtitle = 'Physical mechanical levers modulating acoustic strings by 1 semitone.';

  if (frame >= 2640) {
    beatIndex = 4;
    beatStart = 2640;
    category = '05 · MODAL MASTERY';
    title = '76 CANYON LEVELS';
    subtitle = 'Set the pattern, check the scale, and navigate every mode with confidence.';
  } else if (frame >= 1740) {
    beatIndex = 3;
    beatStart = 1740;
    category = '04 · MODAL SHIFTS';
    title = 'G MAJOR & D DORIAN';
    subtitle = 'Raise Lever F for G Major. Anchor on D for luminous D Dorian with natural B.';
  } else if (frame >= 1140) {
    beatIndex = 2;
    beatStart = 1140;
    category = '03 · HARP TUNING';
    title = 'E-FLAT TO C MAJOR';
    subtitle = 'Raise the three lever groups: A-flat to A, E-flat to E, and B-flat to B.';
  } else if (frame >= 540) {
    beatIndex = 1;
    beatStart = 540;
    category = '02 · SPEAKING LENGTH';
    title = '5.6% SHORTENING';
    subtitle = 'Watch the lever flip: clamping the string raises its pitch by one semitone.';
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
        totalBeats={5}
        localFrame={localFrame}
      >
        {/* BEAT 1: Sandstone Canyon Sanctuary Overview (0s - 18s / frames 0 - 540) */}
        {beatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_levers_sanctuary.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Dynamic Switching Badges (never a static frame) */}
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '14px 28px',
                borderRadius: 24,
                backgroundColor: 'rgba(120, 53, 15, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primary}`,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: 2,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {frame < 180
                ? '27 CAMAC SHARPING LEVERS'
                : frame < 360
                ? 'ACOUSTIC PHYSICS · MODAL KEYS'
                : 'TACTILE FINGERTIP PATTERNS'}
            </div>
          </div>
        )}

        {/* BEAT 2: 3D Real Celtic Harp Kinematic Lever Action (18s - 38s / frames 540 - 1140) */}
        {beatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* 3D Real Celtic Harp with Close-Up on Levers */}
            <Harp3DCanvas
              width={655}
              height={1420}
              theta={0.35 + Math.sin((frame - 540) * 0.03) * 0.12}
              phi={1.38}
              radius={1.38}
              targetY={0.52}
              targetX={0.0}
              targetZ={-0.05}
              fov={30}
              harpScale={0.78}
              leverEvents={[
                {
                  leverNum: 4, // Lever F
                  flipFrame: 300, // frame 840 absolute (28.0s)
                  unflipFrame: 540, // frame 1080 absolute (36.0s)
                },
              ]}
              pluckEvents={[
                {
                  stringNum: 4, // F#4 string
                  startFrame: 345, // frame 885 absolute (29.5s)
                  amplitude: 0.024,
                },
                {
                  stringNum: 4, // F4 string
                  startFrame: 564, // frame 1104 absolute (36.8s)
                  amplitude: 0.020,
                },
              ]}
            />

            {/* Interactive Caliper & Semitone Shift Card */}
            <div
              style={{
                position: 'absolute',
                bottom: 120,
                left: 24,
                right: 24,
                padding: '20px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(69, 26, 3, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: THEME.accent }}>
                  SPEAKING LENGTH
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                  {frame >= 840 && frame < 1080 ? 'L × 0.944 (Shortened by 5.6%)' : 'L × 1.000 (Open Pitch)'}
                </span>
              </div>

              {/* Progress Line */}
              <div
                style={{
                  height: 6,
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: frame >= 840 && frame < 1080 ? '94.4%' : '100%',
                    backgroundColor: THEME.primary,
                    boxShadow: `0 0 10px ${THEME.primary}`,
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#ffffff' }}>
                  {frame >= 840 && frame < 1080 ? 'RAISED: F♯ (+1 Semitone)' : 'OPEN: F Natural'}
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    backgroundColor: frame >= 840 && frame < 1080 ? THEME.primary : 'rgba(255,255,255,0.1)',
                    color: frame >= 840 && frame < 1080 ? '#000000' : '#ffffff',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {frame >= 840 && frame < 1080 ? 'LEVER UP' : 'LEVER DOWN'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BEAT 3: Native E-flat to C Major Configuration (38s - 58s / frames 1140 - 1740) */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Pure clean native mobile screenshot (ZERO desktop switcher chrome!) */}
            <Img
              src={staticFile('textures/real/app_screen_camac_levers.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Lever Groups Flipping Display */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 20,
                right: 20,
                padding: '16px 20px',
                borderRadius: 20,
                backgroundColor: 'rgba(69, 26, 3, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              {[
                { grp: 'A LEVER', from: 'A♭ → A', active: frame >= 1560 },
                { grp: 'E LEVER', from: 'E♭ → E', active: frame >= 1590 },
                { grp: 'B LEVER', from: 'B♭ → B', active: frame >= 1620 },
              ].map((g, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: g.active ? THEME.primary : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {g.grp}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: g.active ? '#ffffff' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {g.from}
                  </div>
                </div>
              ))}
            </div>

            {/* C Major Scale Confirmation */}
            {frame >= 1635 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 120,
                  left: 30,
                  right: 30,
                  padding: '16px',
                  borderRadius: 18,
                  backgroundColor: 'rgba(69, 26, 3, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  textAlign: 'center',
                  fontSize: 19,
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                C MAJOR SCALE READY: C · D · E · F · G · A · B
              </div>
            )}
          </div>
        )}

        {/* BEAT 4: Interactive Modal Shifts & Scale Resolution Walkdown (58s - 88s / frames 1740 - 2640) */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Display in-game camac levers screen, then switch dynamically to in-game resolution walkdown */}
            <Img
              src={
                frame >= 2475
                  ? staticFile('textures/real/live_app/app_screen_ingame_resolution.png')
                  : staticFile('textures/real/app_screen_camac_levers.png')
              }
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Phase A: Level 1 G Major Shift (58s - 71.8s / frames 1740 - 2154) */}
            {frame < 2154 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 24,
                  right: 24,
                  padding: '18px 22px',
                  borderRadius: 22,
                  backgroundColor: 'rgba(69, 26, 3, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>LEVEL 1 : G MAJOR</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: THEME.accent, marginTop: 4 }}>
                    1 SHARP · RAISE LEVER F → F♯
                  </div>
                </div>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 12,
                    backgroundColor: THEME.primary,
                    color: '#000000',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  MODAL SHIFT
                </span>
              </div>
            )}

            {/* Phase B: Level 6 D Dorian Mode (71.8s - 82.5s / frames 2154 - 2475) */}
            {frame >= 2154 && frame < 2475 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 24,
                  right: 24,
                  padding: '18px 22px',
                  borderRadius: 22,
                  backgroundColor: 'rgba(69, 26, 3, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>LEVEL 6 : D DORIAN</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: THEME.accent }}>ROOT D · NATURAL B</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  Luminous modal brightness on Celtic harp
                </div>
              </div>
            )}

            {/* Phase C: Live Resolution Walkdown Screen (82.5s - 88s / frames 2475 - 2640) */}
            {frame >= 2475 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
                  padding: '16px 20px',
                  borderRadius: 22,
                  backgroundColor: 'rgba(69, 26, 3, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                {[
                  { note: 'A', deg: '5th', active: frame >= 2565 },
                  { note: 'G', deg: '4th', active: frame >= 2580 },
                  { note: 'F', deg: 'b3rd', active: frame >= 2595 },
                  { note: 'E', deg: '2nd', active: frame >= 2610 },
                  { note: 'D', deg: 'Home', active: frame >= 2625 },
                ].map((step, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: step.active ? '#ffffff' : 'rgba(255,255,255,0.3)',
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
          </div>
        )}

        {/* BEAT 5: Canyon Roadmap Progression & Call to Action (88s - 110s / frames 2640 - 3300) */}
        {beatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_canyon_roadmap.png')}
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
                backgroundColor: 'rgba(120, 53, 15, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>76</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>LEVELS</div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>MODAL</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>MASTERY</div>
              </div>
            </div>

            {/* Bottom Button */}
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
              ▷ START SANDSTONE CANYON
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
