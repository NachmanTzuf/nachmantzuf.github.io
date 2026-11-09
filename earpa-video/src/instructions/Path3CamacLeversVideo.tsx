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

// 120 seconds at 30 fps = 3600 frames
export const Path3CamacLeversVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6 Distinct Pedagogical Beats (Dynamic Pacing, Zero Static Frames)
  // Beat 0: 0 - 540 (0s - 18s) -> Sandstone Canyon Sanctuary & 27 Camac Levers
  // Beat 1: 540 - 1260 (18s - 42s) -> Dedicated 3D Macro Lever Close-Up & 5.6% Law
  // Beat 2: 1260 - 2040 (42s - 68s) -> Native E-flat to C Major Tuning (1.0s note pauses)
  // Beat 3: 2040 - 2820 (68s - 94s) -> Canyon Roadmap Pre-roll & Level 1 G Major In-Game
  // Beat 4: 2820 - 3300 (94s - 110s) -> Level 6 In-Game D Dorian & Scale Resolution Walkdown
  // Beat 5: 3300 - 3600 (110s - 120s) -> 76 Canyon Levels Modal Mastery & Summary

  let beatIndex = 0;
  let beatStart = 0;
  let category = '01 · ACOUSTIC HARP PHYSICS';
  let title = '27 CAMAC LEVERS';
  let subtitle = 'Physical mechanical levers modulating acoustic strings by 1 semitone.';

  if (frame >= 3300) {
    beatIndex = 5;
    beatStart = 3300;
    category = '06 · MODAL MASTERY';
    title = '76 CANYON LEVELS';
    subtitle = 'Set the pattern, check the scale, and navigate every mode with confidence.';
  } else if (frame >= 2820) {
    beatIndex = 4;
    beatStart = 2820;
    category = '05 · MODAL SHIFTS';
    title = 'LEVEL 6 : D DORIAN';
    subtitle = 'Anchor on D for luminous D Dorian with natural B and stepwise walkdown.';
  } else if (frame >= 2040) {
    beatIndex = 3;
    beatStart = 2040;
    category = '04 · IN-GAME GAMEPLAY';
    title = 'LEVEL 1 : G MAJOR';
    subtitle = 'Raise Lever F to F sharp to shift instantly from C Major into G Major.';
  } else if (frame >= 1260) {
    beatIndex = 2;
    beatStart = 1260;
    category = '03 · HARP TUNING';
    title = 'E-FLAT TO C MAJOR';
    subtitle = 'Raise the three lever groups: Note A, Note E, and Note B with 1-second focus.';
  } else if (frame >= 540) {
    beatIndex = 1;
    beatStart = 540;
    category = '02 · MACRO LEVER PHYSICS';
    title = '5.6% SHORTENING';
    subtitle = 'Watch the Camac lever engage: clamping the string raises its pitch by one semitone.';
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
        totalBeats={6}
        localFrame={localFrame}
      >
        {/* BEAT 0: Sandstone Canyon Sanctuary Overview (0s - 18s / frames 0 - 540) */}
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
              {frame < 210
                ? '27 CAMAC SHARPING LEVERS'
                : frame < 390
                ? 'ACOUSTIC PHYSICS · MODAL KEYS'
                : 'TACTILE FINGERTIP PATTERNS'}
            </div>
          </div>
        )}

        {/* BEAT 1: Dedicated 3D Macro Lever Close-Up Scene (18s - 42s / frames 540 - 1260) */}
        {beatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Dedicated Macro Angle targeting Lever 4 (Blue F) in exact visual center */}
            <Harp3DCanvas
              width={655}
              height={1420}
              theta={1.25 + Math.sin((frame - 540) * 0.02) * 0.03}
              phi={1.26}
              radius={0.44}
              targetX={0.038}
              targetY={0.94}
              targetZ={0.02}
              fov={30}
              harpScale={0.78}
              leverEvents={[
                {
                  leverNum: 4, // Lever F
                  flipFrame: 270, // frame 810 absolute (27.0s)
                  unflipFrame: 540, // frame 1080 absolute (36.0s)
                },
              ]}
              pluckEvents={[
                {
                  stringNum: 4, // F#4 string
                  startFrame: 315, // frame 855 absolute (28.5s)
                  amplitude: 0.024,
                },
                {
                  stringNum: 4, // F4 string
                  startFrame: 570, // frame 1110 absolute (37.0s)
                  amplitude: 0.020,
                },
              ]}
            />

            {/* Macro Viewfinder Overlays & Caliper Card */}
            <div
              style={{
                position: 'absolute',
                top: 60,
                left: 20,
                right: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 18px',
                borderRadius: 16,
                backgroundColor: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                ● MACRO LEVER OPTICS
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                LEVER 4 · STRING F
              </span>
            </div>

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
                  {frame >= 810 && frame < 1080 ? 'L × 0.944 (Shortened by 5.6%)' : 'L × 1.000 (Open Pitch)'}
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
                    width: frame >= 810 && frame < 1080 ? '94.4%' : '100%',
                    backgroundColor: THEME.primary,
                    boxShadow: `0 0 10px ${THEME.primary}`,
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#ffffff' }}>
                  {frame >= 810 && frame < 1080 ? 'RAISED: F♯ (+1 Semitone)' : 'OPEN: F Natural'}
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    backgroundColor: frame >= 810 && frame < 1080 ? THEME.primary : 'rgba(255,255,255,0.1)',
                    color: frame >= 810 && frame < 1080 ? '#000000' : '#ffffff',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {frame >= 810 && frame < 1080 ? 'LEVER UP' : 'LEVER DOWN'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BEAT 2: Native E-flat to C Major Tuning (42s - 68s / frames 1260 - 2040) */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/app_screen_camac_levers.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Native Tuning Banner before raising levers */}
            {frame < 1545 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
                  padding: '14px 20px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(69, 26, 3, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>NATIVE HARP TUNING</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  E♭ MAJOR · ALL LEVERS DOWN (3 FLATS)
                </div>
              </div>
            )}

            {/* Lever Groups Flipping Display with 1.0s Distinct Note Pauses */}
            {frame >= 1545 && (
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
                  { grp: 'NOTE A', state: frame >= 1590 ? 'LEVER UP' : 'SPOKEN NOTE', from: 'A♭ → A', active: frame >= 1545, engaged: frame >= 1590 },
                  { grp: 'NOTE E', state: frame >= 1710 ? 'LEVER UP' : 'SPOKEN NOTE', from: 'E♭ → E', active: frame >= 1665, engaged: frame >= 1710 },
                  { grp: 'NOTE B', state: frame >= 1830 ? 'LEVER UP' : 'SPOKEN NOTE', from: 'B♭ → B', active: frame >= 1785, engaged: frame >= 1830 },
                ].map((g, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: g.engaged ? THEME.primary : g.active ? '#ffffff' : 'rgba(255,255,255,0.4)',
                        textShadow: g.active ? `0 0 10px ${THEME.primary}` : 'none',
                      }}
                    >
                      {g.grp}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: g.engaged ? '#22c55e' : g.active ? THEME.accent : 'rgba(255,255,255,0.3)',
                        marginTop: 2,
                      }}
                    >
                      {g.state}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: g.engaged ? '#ffffff' : 'rgba(255,255,255,0.4)',
                        marginTop: 2,
                      }}
                    >
                      {g.from}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* C Major Scale Confirmation Banner */}
            {frame >= 1905 && (
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
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#ffffff',
                }}
              >
                C MAJOR SCALE READY: C · D · E · F · G · A · B
              </div>
            )}
          </div>
        )}

        {/* BEAT 3: Canyon Roadmap Pre-Roll & Level 1 G Major In-Game (68s - 94s / frames 2040 - 2820) */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* 68s - 72.5s (f2040 - f2175): Sandstone Canyon Roadmap Pre-Roll (2s before speech) */}
            {frame < 2175 ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Img
                  src={staticFile('textures/real/live_app/app_screen_canyon_roadmap.png')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Level 1 Node Pulsing Ring & Tap Ripple at 70.5s (f2115) */}
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

                {/* Expanding Tap Ripple at f2115 */}
                {frame >= 2115 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '87.5%',
                      left: '35.8%',
                      transform: 'translate(-50%, -50%)',
                      width: 60 + (frame - 2115) * 6,
                      height: 60 + (frame - 2115) * 6,
                      borderRadius: '50%',
                      border: `2px solid ${THEME.accent}`,
                      opacity: Math.max(0, 1 - (frame - 2115) / 30),
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Level 1 Entry Tag */}
                <div
                  style={{
                    position: 'absolute',
                    top: 72,
                    left: 24,
                    right: 24,
                    padding: '16px 20px',
                    borderRadius: 22,
                    backgroundColor: 'rgba(69, 26, 3, 0.94)',
                    border: `2px solid ${THEME.accent}`,
                    boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent }}>ENTERING LEVEL 1</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                    MODAL SHIFT: G MAJOR
                  </div>
                </div>
              </div>
            ) : (
              /* 72.5s - 94.0s (f2175 - f2820): In-Game Playing Experience */
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Img
                  src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Top Card: Level 1 Modal Shift */}
                <div
                  style={{
                    position: 'absolute',
                    top: 72,
                    left: 20,
                    right: 20,
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
                      {frame >= 2295 ? 'LEVER F UP → F♯ ACTIVE' : 'NOTE F · PREPARE LEVER UP'}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '6px 14px',
                      borderRadius: 12,
                      backgroundColor: frame >= 2295 ? '#22c55e' : THEME.primary,
                      color: frame >= 2295 ? '#ffffff' : '#000000',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {frame >= 2295 ? '1 SHARP LOCKED' : 'MODAL SHIFT'}
                  </span>
                </div>

                {/* In-Game Lever Flip Visual Confirmation */}
                {frame >= 2295 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '46%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      padding: '16px 28px',
                      borderRadius: 22,
                      backgroundColor: 'rgba(69, 26, 3, 0.95)',
                      border: `2px solid ${THEME.accent}`,
                      boxShadow: `0 0 35px ${THEME.primary}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff' }}>LEVER F → F♯</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: THEME.accent }}>
                      G MAJOR SCALE ENGAGED
                    </div>
                  </div>
                )}

                {/* Bottom Native Button Glow: F# active */}
                <LetterButtonBar
                  activeNotes={frame >= 2430 ? ['G'] : frame >= 2355 ? ['F'] : []}
                  themeColor={THEME.primary}
                  themeGlow={THEME.primaryGlow}
                />
              </div>
            )}
          </div>
        )}

        {/* BEAT 4: Level 6 In-Game D Dorian & Scale Resolution Walkdown (94s - 110s / frames 2820 - 3300) */}
        {beatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            {/* Display in-game screen until walkdown resolution at 104s (f3120), then resolution walk screen */}
            <Img
              src={
                frame >= 3120
                  ? staticFile('textures/real/live_app/app_screen_ingame_resolution.png')
                  : staticFile('textures/real/live_app/app_screen_ingame_playing.png')
              }
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Phase A: Level 6 D Dorian Mode (94s - 104s / frames 2820 - 3120) */}
            {frame < 3120 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
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
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                  Keep C Major levers · Anchor home center on Note D
                </div>
              </div>
            )}

            {/* Phase B: Live Resolution Walkdown Screen (104s - 110s / frames 3120 - 3300) */}
            {frame >= 3120 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 18,
                  right: 18,
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
                  { note: 'A', deg: '5th', active: frame >= 3150 },
                  { note: 'G', deg: '4th', active: frame >= 3165 },
                  { note: 'F', deg: 'b3rd', active: frame >= 3180 },
                  { note: 'E', deg: '2nd', active: frame >= 3195 },
                  { note: 'D', deg: 'Home', active: frame >= 3210 },
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

            {/* Bottom Native Letter Button Bar for Level 6 D Dorian */}
            <LetterButtonBar
              activeNotes={
                frame >= 3210
                  ? ['D']
                  : frame >= 3195
                  ? ['E']
                  : frame >= 3180
                  ? ['F']
                  : frame >= 3165
                  ? ['G']
                  : frame >= 3150
                  ? ['A']
                  : ['D']
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 5: 76 Canyon Levels Modal Mastery & Summary (110s - 120s / frames 3300 - 3600) */}
        {beatIndex === 5 && (
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
