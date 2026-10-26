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
import { Harp3DCanvas, PluckEvent } from './Harp3DCanvas';

// Fast 3D harp transition sweep at the very end of Scene 2 (frames 230-260)
const TRANSITION_PLUCKS: PluckEvent[] = [
  { stringNum: 1, startFrame: 232, amplitude: 0.024 },
  { stringNum: 4, startFrame: 238, amplitude: 0.022 },
  { stringNum: 8, startFrame: 245, amplitude: 0.026 },
];

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3D Harp is 0% visible during main body (0-230). Sweeps through dynamically at frames 230-260!
  const isTransitionWhip = frame >= 228;
  const transitionProgress = spring({
    frame: frame - 228,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const harpScale = interpolate(transitionProgress, [0, 0.5, 1], [0.35, 0.72, 0.76]);
  const harpTranslateX = interpolate(transitionProgress, [0, 1], [1100, 0]);
  const harpOpacity = interpolate(transitionProgress, [0, 0.15, 1], [0, 1, 1]);

  // Dynamic Camera coordinates during the fast transition sweep
  const theta = interpolate(frame, [228, 260], [-1.2, 0.6]);
  const phi = 1.32;
  const radius = 2.30;
  const tiltX = 0.04;
  const tiltZ = -0.04;

  // Rolling counter metrics
  const recallMultiplier = (
    interpolate(frame, [45, 130], [1.0, 3.4], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  ).toFixed(1);

  // Active step in the 3-step loop preview on the right stage
  const activeStep = frame < 85 ? 1 : frame < 165 ? 2 : 3;

  // Step 3 Gravity Orb animation (4 -> 3 -> 2 -> 1)
  const orbProgress = interpolate(frame, [165, 235], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Rich Emerald & Cyan Sanctuary Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 48%, rgba(16, 185, 129, 0.20) 0%, rgba(56, 189, 248, 0.12) 42%, rgba(7, 11, 18, 0.98) 80%)',
        }}
      />

      {/* Top Editorial Header Strip */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 72,
          right: 72,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
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
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          02 // THE ALAIN BENBASSAT METHOD • EFFORTLESS JAMMING
        </div>

        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            color: '#fbbf24',
            letterSpacing: 1.5,
            fontWeight: 800,
          }}
        >
          FROM INNER HEARING TO INSTANT IMPROVISATION • 10 MIN A DAY
        </div>
      </div>

      {/* LEFT STAGE: 2.5D Animated Scientific Paper & Method Callout */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 112,
          width: 820,
          height: 860,
          borderRadius: 26,
          padding: '30px 34px',
          background: 'rgba(13, 20, 33, 0.92)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 8,
          transform: 'perspective(1100px) rotateY(4deg) rotateX(2deg)',
        }}
      >
        <div>
          {/* Paper Header */}
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
                fontWeight: 800,
                color: '#34d399',
                letterSpacing: 1.8,
              }}
            >
              EMPIRICAL COGNITIVE ACOUSTICS • BENBASSAT METHOD
            </div>
            <div
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                background: 'rgba(212, 175, 55, 0.18)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                color: '#fbbf24',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              PEER-REVIEWED FOUNDATION
            </div>
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.22,
              letterSpacing: -0.6,
            }}
          >
            Relative Pitch & Tonal Gravity: The Bridge to Instant Improvisation
          </div>

          {/* Glowing Animated Highlight Marker Callout */}
          <div
            style={{
              marginTop: 18,
              padding: '18px 22px',
              borderRadius: 16,
              background: 'rgba(7, 13, 22, 0.85)',
              borderLeft: '4px solid #10b981',
              boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.1)',
            }}
          >
            <div
              style={{
                fontSize: 18,
                lineHeight: 1.48,
                color: '#e2e8f0',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(90deg, rgba(16,185,129,0.35) 0%, rgba(56,189,248,0.25) 100%)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                Training scale degrees inside a harmonic cadence
              </span>{' '}
              rewires the brain to feel each note&apos;s magnetic pull toward the tonic anchor (Do)—unlocking
              effortless jamming with any musician without sheet music.
            </div>
          </div>
        </div>

        {/* 3 Animated Metric Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 18,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 32,
                fontWeight: 900,
                color: '#34d399',
              }}
            >
              10 MIN
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>
              Daily Tonal Gravity Drill
            </div>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderRadius: 18,
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 32,
                fontWeight: 900,
                color: '#38bdf8',
              }}
            >
              {recallMultiplier}x
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>
              Faster Recall vs Intervals
            </div>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderRadius: 18,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 32,
                fontWeight: 900,
                color: '#fbbf24',
              }}
            >
              ZERO
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>
              Paper or Sheet Music
            </div>
          </div>
        </div>

        {/* Real Liquid-Glass Debrief Modal Proof Thumbnail */}
        <div
          style={{
            height: 200,
            borderRadius: 18,
            padding: 8,
            background: 'rgba(7, 11, 18, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <Img
            src={staticFile('textures/real/verified_modern_liquid_glass_debrief.png')}
            style={{
              width: 140,
              height: '100%',
              objectFit: 'contain',
              borderRadius: 12,
            }}
          />
          <div style={{ flex: 1, paddingRight: 10 }}>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                color: '#fbbf24',
                fontWeight: 800,
                letterSpacing: 1.2,
              }}
            >
              REAL SESSION MASTERY PROOF
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
              90% Mastery Gates Across 220+ Levels
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, lineHeight: 1.35 }}>
              Track precision down to every scale degree before advancing to the next biome.
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT STAGE: Immediate 3-Step Core Loop Visual Preview */}
      <div
        style={{
          position: 'absolute',
          right: 72,
          top: 112,
          width: 920,
          height: 860,
          borderRadius: 26,
          padding: '30px 34px',
          background: 'rgba(11, 17, 29, 0.92)',
          border: '1px solid rgba(56, 189, 248, 0.45)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 8,
          transform: 'perspective(1100px) rotateY(-4deg) rotateX(2deg)',
        }}
      >
        <div>
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
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: 1.8,
              }}
            >
              THE 3-STEP GAME LOOP // HOW IT WORKS
            </div>
            <div
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.16)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                color: '#38bdf8',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              ACTIVE STEP: 0{activeStep} / 03
            </div>
          </div>

          {/* 3 Step Pipeline Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                step: '01',
                title: 'HEAR THE CADENCE (I – IV – V – I)',
                desc: 'Grounds your inner ear in the tonic center so notes never float in a vacuum.',
                accent: '#ef4444',
                isActive: activeStep === 1,
              },
              {
                step: '02',
                title: 'HEAR THE MYSTERY NOTE',
                desc: 'A note plays. You immediately recognize its emotional gravity and color.',
                accent: '#fbbf24',
                isActive: activeStep === 2,
              },
              {
                step: '03',
                title: 'FEEL THE MAGNETIC RESOLUTION WALK',
                desc: 'Note 4 (Fa) gravitates 4 → 3 → 2 → 1 straight home into the Tonic (Do).',
                accent: '#10b981',
                isActive: activeStep === 3,
              },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  padding: '14px 18px',
                  borderRadius: 16,
                  background: s.isActive ? `${s.accent}24` : 'rgba(7, 12, 21, 0.75)',
                  border: `2px solid ${s.isActive ? s.accent : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  transform: s.isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: s.isActive ? `0 12px 30px ${s.accent}33` : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: s.accent,
                    color: '#070b12',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 900,
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#ffffff' }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Visual Showcase Area (Dynamic image swapping between Step 2 & Step 3) */}
        <div
          style={{
            height: 420,
            borderRadius: 20,
            padding: 12,
            background: 'rgba(7, 11, 18, 0.88)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile(
              activeStep <= 2
                ? 'textures/real/verified_ingame_guessed_note_walk.png'
                : 'textures/real/verified_resolution_walk_active.png'
            )}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: 14,
            }}
          />

          {/* Animated Golden Magnetic Vector Target in Step 3 */}
          {activeStep === 3 && (
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                right: 24,
                padding: '12px 18px',
                borderRadius: 14,
                background: 'rgba(13, 20, 33, 0.94)',
                border: '1px solid #10b981',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.45)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>🧲</span>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    color: '#34d399',
                    fontWeight: 800,
                  }}
                >
                  TONAL GRAVITY WELL: 4 → 3 → 2 → 1 (RESOLVED TO TONIC)
                </span>
              </div>
              <div
                style={{
                  width: 140,
                  height: 8,
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

      {/* 3D HARP ENERGETIC TRANSITION SWEEP (Frames 228 to 260) */}
      {isTransitionWhip && (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 20,
            width: 840,
            height: 980,
            transform: `translateX(${harpTranslateX}px)`,
            opacity: harpOpacity,
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <Harp3DCanvas
            width={840}
            height={980}
            theta={theta}
            phi={phi}
            radius={radius}
            targetY={0.48}
            fov={34}
            pluckEvents={TRANSITION_PLUCKS}
            harpScale={harpScale}
            tiltX={tiltX}
            tiltZ={tiltZ}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
