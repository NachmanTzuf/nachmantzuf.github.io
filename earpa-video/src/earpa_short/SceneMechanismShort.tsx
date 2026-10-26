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

// Scene 3 runs from global frame 660 to 930 (270 frames: local 0..270)
const MECHANISM_PLUCKS: PluckEvent[] = [
  // I Chord Cadence (local frame 15 = global 675)
  { stringNum: 1, startFrame: 15, amplitude: 0.022 },
  { stringNum: 3, startFrame: 17, amplitude: 0.018 },
  { stringNum: 5, startFrame: 19, amplitude: 0.018 },
  { stringNum: 8, startFrame: 21, amplitude: 0.021 },
  // IV Chord (local frame 45 = global 705)
  { stringNum: 4, startFrame: 45, amplitude: 0.023 },
  { stringNum: 6, startFrame: 47, amplitude: 0.019 },
  { stringNum: 8, startFrame: 49, amplitude: 0.020 },
  // V Chord (local frame 75 = global 735)
  { stringNum: 2, startFrame: 75, amplitude: 0.020 },
  { stringNum: 5, startFrame: 77, amplitude: 0.021 },
  { stringNum: 7, startFrame: 79, amplitude: 0.022 },
  // I Chord Tonic Anchor (local frame 105 = global 765)
  { stringNum: 1, startFrame: 105, amplitude: 0.024 },
  { stringNum: 3, startFrame: 107, amplitude: 0.019 },
  { stringNum: 5, startFrame: 109, amplitude: 0.019 },
  { stringNum: 8, startFrame: 111, amplitude: 0.024 },
  // Mystery Note F4 (local frame 140 = global 800)
  { stringNum: 4, startFrame: 140, amplitude: 0.025 },
  // Stepwise Gravity Resolution Walk: 4 -> 3 -> 2 -> 1 (local frames 170, 190, 210, 230)
  { stringNum: 4, startFrame: 170, amplitude: 0.023 },
  { stringNum: 3, startFrame: 190, amplitude: 0.022 },
  { stringNum: 2, startFrame: 210, amplitude: 0.022 },
  { stringNum: 1, startFrame: 230, amplitude: 0.026 },
  { stringNum: 8, startFrame: 230, amplitude: 0.024 },
];

const CADENCE_STEPS = [
  { roman: 'I', label: 'TONIC HOME', chord: 'C Maj', trigger: 15, color: '#ef4444' },
  { roman: 'IV', label: 'SUBDOMINANT', chord: 'F Maj', trigger: 45, color: '#38bdf8' },
  { roman: 'V', label: 'DOMINANT PULL', chord: 'G Maj', trigger: 75, color: '#fbbf24' },
  { roman: 'I', label: 'ANCHOR LOCKED', chord: 'C Maj', trigger: 105, color: '#10b981' },
];

export const SceneMechanismShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0 to 115): 3D Harp Cadence Grounds the Ear
  // Phase 2 (110 to 185): Polarized Journey Tab & Floating Melody Studio Card
  // Phase 3 (180 to 270): Magnetic Resolution Walk (4 -> 3 -> 2 -> 1)

  const isPhase1 = frame < 118;
  const isPhase2 = frame >= 110 && frame < 188;
  const isPhase3 = frame >= 180;

  // Phase 1: 3D Harp Entrance & Cadence
  const harpPopIn = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.85 },
  });
  const harpExit = spring({
    frame: frame - 108,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const harpScale = interpolate(harpPopIn, [0, 1], [0.35, 0.82]) * interpolate(harpExit, [0, 1], [1, 0.75]);
  const harpOpacity = interpolate(harpPopIn, [0, 1], [0, 1]) * interpolate(harpExit, [0, 1], [1, 0]);
  const theta = interpolate(frame, [0, 135, 270], [-1.35, 0.88, 2.25]);
  const phi = interpolate(frame, [0, 90, 180, 270], [1.45, 1.18, 1.42, 1.32]);
  const radius = interpolate(harpPopIn, [0, 1], [2.9, 2.22]);

  // Phase 2: Polarized Journey & Melody Studio
  const journeyEnter = spring({
    frame: frame - 110,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const journeyExit = spring({
    frame: frame - 180,
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const journeyScale = interpolate(journeyEnter, [0, 1], [0.85, 1.0]) * interpolate(journeyExit, [0, 1], [1, 0.8]);
  const journeyOpacity = interpolate(journeyEnter, [0, 1], [0, 1]) * interpolate(journeyExit, [0, 1], [1, 0]);

  // Smooth vertical scroll through Journey dashboard
  const journeyScrollY = interpolate(frame, [115, 180], [0, -280], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating Melody Studio card pop-in
  const melodyCardPop = spring({
    frame: frame - 130,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Phase 3: Resolution Engine
  const resolutionEnter = spring({
    frame: frame - 180,
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const resolutionScale = interpolate(resolutionEnter, [0, 1], [0.88, 1.0]);
  const resolutionOpacity = interpolate(resolutionEnter, [0, 1], [0, 1]);

  const activeResolutionStep =
    frame >= 230 ? 1 : frame >= 210 ? 2 : frame >= 190 ? 3 : frame >= 180 ? 4 : null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060a11',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Ambient Sanctuary Gold & Cyan Tonal Gravity Field */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 36%, rgba(212, 175, 55, 0.26) 0%, rgba(56, 189, 248, 0.14) 40%, rgba(6, 10, 17, 0.98) 78%)',
        }}
      />

      {/* 2. TOP HUD: Cadence Progression Badges */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 54,
          right: 54,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          zIndex: 25,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              background: 'rgba(212, 175, 55, 0.16)',
              border: '1px solid rgba(212, 175, 55, 0.55)',
              color: '#fbbf24',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            03 // TONAL GRAVITY ENGINE
          </div>

          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              color: '#38bdf8',
              fontWeight: 800,
              letterSpacing: 1.2,
            }}
          >
            ALAIN BENBASSAT METHOD
          </div>
        </div>

        {/* 4 Cadence Progression Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          {CADENCE_STEPS.map((c, idx) => {
            const isTriggered = frame >= c.trigger;
            const isCurrent =
              frame >= c.trigger &&
              (idx === CADENCE_STEPS.length - 1 ? frame < 125 : frame < CADENCE_STEPS[idx + 1].trigger);
            return (
              <div
                key={c.roman}
                style={{
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: isCurrent ? `${c.color}35` : isTriggered ? 'rgba(30,41,59,0.85)' : 'rgba(15,23,42,0.6)',
                  border: `1.5px solid ${isCurrent ? c.color : isTriggered ? `${c.color}88` : 'rgba(255,255,255,0.1)'}`,
                  color: isTriggered ? '#ffffff' : '#64748b',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  boxShadow: isCurrent ? `0 0 16px ${c.color}55` : 'none',
                }}
              >
                <span style={{ fontSize: 14 }}>{c.roman}</span>
                <span style={{ fontSize: 11, color: isTriggered ? c.color : '#64748b' }}>{c.chord}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PHASE 1: FULL-SCREEN 3D HARP CADENCE STAGE (Frames 0 to 118) */}
      {isPhase1 && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            top: 140,
            width: 972,
            height: 1540,
            transform: `scale(${Math.max(0.08, harpScale)})`,
            opacity: harpOpacity,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <Harp3DCanvas
            width={972}
            height={1540}
            theta={theta}
            phi={phi}
            radius={radius}
            targetY={0.50}
            fov={34}
            pluckEvents={MECHANISM_PLUCKS}
            harpScale={0.82}
            tiltX={0.05}
            tiltZ={-0.05}
          />
        </div>
      )}

      {/* 4. PHASE 2: FULL-SCREEN POLARIZED JOURNEY & MELODY STUDIO STAGE (Frames 110 to 188) */}
      {isPhase2 && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            right: 54,
            top: 200,
            height: 1350,
            borderRadius: 36,
            background: 'rgba(13, 20, 33, 0.94)',
            border: '2px solid rgba(168, 85, 247, 0.55)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 35px rgba(168, 85, 247, 0.25)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 12,
            opacity: journeyOpacity,
            transform: `scale(${journeyScale})`,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 14,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#c084fc',
                  letterSpacing: 1.8,
                  marginBottom: 4,
                }}
              >
                POLARIZED JOURNEY • MASTERY ANALYTICS
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>
                Track Every Degree • Real Progression
              </div>
            </div>

            <div
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1.5px solid #a855f7',
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              TAB 04
            </div>
          </div>

          {/* Scrolling Dashboard Viewport */}
          <div
            style={{
              flex: 1,
              marginTop: 16,
              borderRadius: 24,
              overflow: 'hidden',
              position: 'relative',
              background: '#030712',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${journeyScrollY}px)`,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: 16,
              }}
            >
              <Img
                src={staticFile('textures/real/verified_journey_sunglasses_tab.png')}
                style={{ width: '100%', borderRadius: 16, objectFit: 'contain' }}
              />
              <Img
                src={staticFile('textures/real/accounts_profile_dashboard_verified.png')}
                style={{ width: '100%', borderRadius: 16, objectFit: 'contain' }}
              />
            </div>

            {/* Floating New Melody Studio Card Pop-In */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                right: 24,
                transform: `scale(${melodyCardPop}) translateY(${interpolate(
                  melodyCardPop,
                  [0, 1],
                  [50, 0]
                )}px)`,
                opacity: melodyCardPop,
                borderRadius: 24,
                background: 'rgba(10, 16, 26, 0.98)',
                border: '2px solid #34d399',
                boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 35px rgba(52, 211, 153, 0.45)',
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#34d399',
                  marginBottom: 8,
                  textAlign: 'center',
                  letterSpacing: 1.4,
                }}
              >
                ★ NEW MELODY STUDIO TAB • BY-EAR PHRASING
              </div>
              <Img
                src={staticFile('textures/real/verified_melody_tab_standalone_card.png')}
                style={{ width: '100%', height: 260, objectFit: 'contain', borderRadius: 14 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. PHASE 3: FULL-SCREEN MAGNETIC RESOLUTION ENGINE STAGE (Frames 180 to 270) */}
      {isPhase3 && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            right: 54,
            top: 200,
            height: 1350,
            borderRadius: 36,
            background: 'rgba(13, 20, 33, 0.95)',
            border: '2px solid rgba(16, 185, 129, 0.55)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 35px rgba(16, 185, 129, 0.25)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 15,
            opacity: resolutionOpacity,
            transform: `scale(${resolutionScale})`,
            pointerEvents: 'none',
          }}
        >
          {/* Header */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#34d399',
                  letterSpacing: 1.8,
                }}
              >
                RESOLUTION ENGINE • TONAL GRAVITY
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  color: '#ffffff',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                4 → 3 → 2 → 1
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', lineHeight: 1.25 }}>
              Feel the Pull Home • Tension Resolves to DO
            </div>
          </div>

          {/* 4 Stepwise Resolution Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, margin: '14px 0' }}>
            {[
              { num: 4, label: 'FA', sub: 'Tension', active: activeResolutionStep === 4, color: '#38bdf8' },
              { num: 3, label: 'MI', sub: 'Step Down', active: activeResolutionStep === 3, color: '#fbbf24' },
              { num: 2, label: 'RE', sub: 'Urgency', active: activeResolutionStep === 2, color: '#f97316' },
              { num: 1, label: 'DO', sub: 'RESOLVED', active: activeResolutionStep === 1, color: '#10b981' },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  padding: '14px 10px',
                  borderRadius: 16,
                  background: step.active ? `${step.color}35` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${step.active ? step.color : 'rgba(255,255,255,0.08)'}`,
                  textAlign: 'center',
                  transform: step.active ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: step.active ? `0 0 20px ${step.color}66` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 26,
                    fontWeight: 900,
                    color: step.active ? step.color : '#94a3b8',
                  }}
                >
                  {step.num}
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 11, color: step.active ? step.color : '#64748b', marginTop: 2, fontWeight: 700 }}>
                  {step.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Resolution Walk Active Demonstration Phone */}
          <div
            style={{
              flex: 1,
              borderRadius: 24,
              overflow: 'hidden',
              background: '#030712',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Img
              src={staticFile('textures/real/verified_resolution_walk_active.png')}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
