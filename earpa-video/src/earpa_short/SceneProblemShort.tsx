import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Harp3DCanvas, PluckEvent } from '../earpa/Harp3DCanvas';

// Fast 3D harp transition sweep at the very end of Scene 2 (frames 228-260)
const TRANSITION_PLUCKS: PluckEvent[] = [
  { stringNum: 1, startFrame: 232, amplitude: 0.024 },
  { stringNum: 4, startFrame: 238, amplitude: 0.022 },
  { stringNum: 8, startFrame: 245, amplitude: 0.026 },
];

export const SceneProblemShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (Frames 0-125): Empirical Research & Facial Recognition Analogy
  // Phase 2 (Frames 125-228): The 3-Step Game Loop Preview (Cadence -> Mystery Note -> Gravity Resolution)
  // Phase 3 (Frames 228-260): High-Energy 3D Harp Transition Whip

  const isPhase1 = frame < 130;
  const isPhase2 = frame >= 120 && frame < 232;
  const isPhase3 = frame >= 228;

  // Phase 1 Exit / Phase 2 Entrance Spring
  const phaseTransition = spring({
    frame: frame - 120,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Paper card kinematics
  const paperScale = interpolate(phaseTransition, [0, 1], [1, 0.85]);
  const paperOpacity = interpolate(phaseTransition, [0, 0.8, 1], [1, 0.2, 0]);
  const paperTranslateY = interpolate(phaseTransition, [0, 1], [0, -80]);

  // Game Loop phone showcase kinematics
  const loopScale = interpolate(phaseTransition, [0, 1], [0.85, 1.0]);
  const loopOpacity = interpolate(phaseTransition, [0, 0.2, 1], [0, 0.5, 1]);
  const loopTranslateY = interpolate(phaseTransition, [0, 1], [80, 0]);

  // Rolling counter metrics during Phase 1
  const recallMultiplier = (
    interpolate(frame, [25, 95], [1.0, 3.4], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  ).toFixed(1);

  // Active step in the 3-step loop during Phase 2
  const activeStep = frame < 155 ? 1 : frame < 195 ? 2 : 3;

  // Step 3 Gravity Orb animation (4 -> 3 -> 2 -> 1)
  const orbProgress = interpolate(frame, [195, 230], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 3 Harp Transition Whip kinematics
  const harpWhipSpring = spring({
    frame: frame - 228,
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const harpScale = interpolate(harpWhipSpring, [0, 0.5, 1], [0.35, 0.88, 0.92]);
  const harpTranslateX = interpolate(harpWhipSpring, [0, 1], [1100, 0]);
  const harpOpacity = interpolate(harpWhipSpring, [0, 0.15, 1], [0, 1, 1]);
  const theta = interpolate(frame, [228, 260], [-1.2, 0.65]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Rich Emerald & Cyan Sanctuary Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 38%, rgba(16, 185, 129, 0.24) 0%, rgba(56, 189, 248, 0.14) 40%, rgba(7, 11, 18, 0.98) 78%)',
        }}
      />

      {/* 2. TOP HUD: Minimalist Progress Strip */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 54,
          right: 54,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 25,
        }}
      >
        <div
          style={{
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.16)',
            border: '1px solid rgba(16, 185, 129, 0.55)',
            color: '#34d399',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          02 // THE ALAIN BENBASSAT METHOD
        </div>

        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: '#fbbf24',
            letterSpacing: 1.4,
            fontWeight: 800,
          }}
        >
          10 MIN A DAY • EFFORTLESS JAMMING
        </div>
      </div>

      {/* 3. PHASE 1: FULL-SCREEN EMPIRICAL RESEARCH STAGE (Frames 0 to 125) */}
      {isPhase1 && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            right: 54,
            top: 136,
            height: 1420,
            borderRadius: 36,
            padding: '40px 44px',
            background: 'rgba(13, 20, 33, 0.94)',
            border: '2px solid rgba(16, 185, 129, 0.55)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.75), 0 0 35px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 10,
            opacity: paperOpacity,
            transform: `translateY(${paperTranslateY}px) scale(${paperScale})`,
            pointerEvents: 'none',
          }}
        >
          <div>
            {/* Header Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 14,
                  color: '#34d399',
                  letterSpacing: 1.8,
                  fontWeight: 900,
                }}
              >
                EMPIRICAL COGNITIVE RESEARCH • ALAIN BENBASSAT (1992)
              </div>
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1.5px solid #34d399',
                  color: '#ffffff',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1.2,
                }}
              >
                PEER-REVIEWED
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: -0.5,
                lineHeight: 1.25,
                marginBottom: 22,
              }}
            >
              The Functional Ear Training Architecture
            </div>

            {/* Core Premise */}
            <div
              style={{
                fontSize: 22,
                color: '#cbd5e1',
                lineHeight: 1.55,
                fontWeight: 400,
                marginBottom: 28,
              }}
            >
              Traditional interval training forces musicians to count isolated half-steps between two disconnected notes.
              In real music, <strong style={{ color: '#38bdf8' }}>nobody counts intervals</strong>.
              Your ear perceives every note as a <strong style={{ color: '#34d399' }}>magnetic gravity pull</strong> relative to the tonal center.
            </div>

            {/* Core Facial Recognition Analogy Callout */}
            <div
              style={{
                padding: '28px 32px',
                borderRadius: 24,
                background: 'rgba(56, 189, 248, 0.10)',
                border: '2px solid rgba(56, 189, 248, 0.45)',
                boxShadow: '0 12px 35px rgba(56, 189, 248, 0.15)',
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 14,
                  color: '#38bdf8',
                  fontWeight: 900,
                  letterSpacing: 1.8,
                  marginBottom: 12,
                }}
              >
                ★ THE FACIAL RECOGNITION ANALOGY
              </div>
              <div style={{ fontSize: 21, color: '#f8fafc', lineHeight: 1.55, fontWeight: 500 }}>
                You don&apos;t recognize a loved one&apos;s face by measuring the millimeters between their eyes.
                You recognize them instantly by their unique facial expression relative to the whole face.
                Earpa trains your brain to recognize notes the exact same way.
              </div>
            </div>
          </div>

          {/* 3 Key Proof Points */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div
              style={{
                padding: '20px 18px',
                borderRadius: 20,
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid rgba(16, 185, 129, 0.55)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#34d399',
                }}
              >
                10 MIN
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>
                Daily Gravity Drill
              </div>
            </div>

            <div
              style={{
                padding: '20px 18px',
                borderRadius: 20,
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1.5px solid rgba(56, 189, 248, 0.55)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#38bdf8',
                }}
              >
                {recallMultiplier}x
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>
                Faster Recall
              </div>
            </div>

            <div
              style={{
                padding: '20px 18px',
                borderRadius: 20,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid rgba(245, 158, 11, 0.55)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#fbbf24',
                }}
              >
                ZERO
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>
                Sheet Music
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PHASE 2: FULL-SCREEN LIVE 3-STEP GAME LOOP STAGE (Frames 120 to 228) */}
      {isPhase2 && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            right: 54,
            top: 136,
            height: 1420,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 12,
            opacity: loopOpacity,
            transform: `translateY(${loopTranslateY}px) scale(${loopScale})`,
            pointerEvents: 'none',
          }}
        >
          {/* 3 Steps Kinetic Header Bar */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 28,
              background: 'rgba(13, 20, 33, 0.94)',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  color: '#38bdf8',
                  letterSpacing: 1.6,
                  fontWeight: 900,
                }}
              >
                HOW IT WORKS • THE 3-STEP GAME LOOP
              </div>
              <div
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                STEP {activeStep} OF 3
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                {
                  step: '1',
                  title: 'CADENCE',
                  desc: 'Ground the Ear',
                  active: activeStep === 1,
                  color: '#ef4444',
                },
                {
                  step: '2',
                  title: 'MYSTERY NOTE',
                  desc: 'Feel Tension',
                  active: activeStep === 2,
                  color: '#fbbf24',
                },
                {
                  step: '3',
                  title: 'RESOLUTION',
                  desc: 'Walk Home',
                  active: activeStep === 3,
                  color: '#10b981',
                },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 16,
                    background: s.active ? `${s.color}28` : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${s.active ? s.color : 'rgba(255,255,255,0.08)'}`,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 900,
                      fontSize: 16,
                      color: s.color,
                    }}
                  >
                    {s.step}. {s.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 3, fontWeight: 600 }}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sleek Real iPhone 15 Pro Titanium Frame (Single Phone, No Inception) */}
          <div
            style={{
              width: 720,
              height: 1200,
              margin: '14px auto 0 auto',
              borderRadius: 48,
              padding: 8,
              background: 'linear-gradient(145deg, #334155 0%, #1e293b 45%, #0f172a 100%)',
              border: '2px solid rgba(56, 189, 248, 0.75)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 45px rgba(56, 189, 248, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Phone Dynamic Island */}
            <div
              style={{
                width: 140,
                height: 26,
                borderRadius: 20,
                background: '#020617',
                margin: '4px auto 6px auto',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e293b' }} />
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#1e293b' }} />
            </div>

            {/* Pure Screen Content: Edge-to-Edge 786x1704 Native App Display */}
            <div
              style={{
                flex: 1,
                borderRadius: 40,
                overflow: 'hidden',
                background: '#030712',
                position: 'relative',
              }}
            >
              <Img
                src={staticFile(
                  activeStep === 1
                    ? 'textures/real/app_screen_pluck_guess.png'
                    : activeStep === 2
                    ? 'textures/real/app_screen_single_note.png'
                    : 'textures/real/app_screen_resolution_walk.png'
                )}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Animated Gravity Well Indicator in Step 3 */}
              {activeStep === 3 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    left: 20,
                    right: 20,
                    padding: '16px 20px',
                    borderRadius: 18,
                    background: 'rgba(13, 20, 33, 0.96)',
                    border: '2px solid #10b981',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 12px 35px rgba(16, 185, 129, 0.55)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🧲</span>
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 14,
                        color: '#34d399',
                        fontWeight: 900,
                      }}
                    >
                      TONAL GRAVITY: 4 → 3 → 2 → 1 (RESOLVED)
                    </span>
                  </div>
                  <div
                    style={{
                      width: 140,
                      height: 10,
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.15)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${orbProgress * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. PHASE 3: 3D HARP ENERGETIC TRANSITION SWEEP (Frames 228 to 260) */}
      {isPhase3 && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            top: 360,
            width: 972,
            height: 1200,
            transform: `translateX(${harpTranslateX}px)`,
            opacity: harpOpacity,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          <Harp3DCanvas
            width={972}
            height={1200}
            theta={theta}
            phi={1.32}
            radius={2.25}
            targetY={0.48}
            fov={34}
            pluckEvents={TRANSITION_PLUCKS}
            harpScale={Math.max(0.08, harpScale)}
            tiltX={0.04}
            tiltZ={-0.04}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
