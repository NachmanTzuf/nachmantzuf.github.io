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
  { roman: 'I', label: 'TONIC HOME', chord: 'C Major', trigger: 15, color: '#ef4444' },
  { roman: 'IV', label: 'SUBDOMINANT', chord: 'F Major', trigger: 45, color: '#38bdf8' },
  { roman: 'V', label: 'DOMINANT PULL', chord: 'G Major', trigger: 75, color: '#fbbf24' },
  { roman: 'I', label: 'ANCHOR LOCKED', chord: 'C Major', trigger: 105, color: '#10b981' },
];

export const SceneMechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic 3D Harp Entrance Choreography:
  // Harp pops in dynamically with a 3D spring zoom at frame 10 right as Cadence starts!
  const harpPopIn = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.85 },
  });

  const theta = interpolate(frame, [0, 135, 270], [-1.35, 0.88, 2.25]);
  const phi = interpolate(frame, [0, 90, 180, 270], [1.45, 1.18, 1.42, 1.32]);
  const radius = interpolate(harpPopIn, [0, 1], [3.2, 2.28]);
  const tiltX = interpolate(frame, [0, 135, 270], [0.07, -0.07, 0.05]);
  const tiltZ = interpolate(frame, [0, 135, 270], [-0.06, 0.06, -0.04]);

  // Smooth vertical scroll inside Left Card through Polarized Journey tab sequence (0px to -420px)
  const journeyScrollY = interpolate(frame, [30, 240], [0, -420], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating New Melody Card Pop-in at local frame 95
  const melodyCardPop = spring({
    frame: frame - 95,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Stepwise resolution active step (4 -> 3 -> 2 -> 1)
  const activeResolutionStep =
    frame >= 230 ? 1 : frame >= 210 ? 2 : frame >= 190 ? 3 : frame >= 140 ? 4 : null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060a11',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Ambient Sanctuary Gold & Cyan Tonal Gravity Field */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.22) 0%, rgba(56, 189, 248, 0.12) 38%, rgba(6, 10, 17, 0.98) 78%)',
        }}
      />

      {/* Top Cadence Bar */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 64,
          right: 64,
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
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.55)',
            color: '#fbbf24',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          03 // TONAL GRAVITY ENGINE • ALAIN BENBASSAT CADENCE & RESOLUTION
        </div>

        {/* 4 Cadence Progression Badges */}
        <div style={{ display: 'flex', gap: 12 }}>
          {CADENCE_STEPS.map((c, idx) => {
            const isTriggered = frame >= c.trigger;
            const isCurrent =
              frame >= c.trigger &&
              (idx === CADENCE_STEPS.length - 1 ? frame < 125 : frame < CADENCE_STEPS[idx + 1].trigger);
            return (
              <div
                key={c.roman}
                style={{
                  padding: '6px 16px',
                  borderRadius: 10,
                  background: isCurrent ? `${c.color}33` : isTriggered ? 'rgba(30,41,59,0.8)' : 'rgba(15,23,42,0.6)',
                  border: `1.5px solid ${isCurrent ? c.color : isTriggered ? `${c.color}88` : 'rgba(255,255,255,0.1)'}`,
                  color: isTriggered ? '#ffffff' : '#64748b',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{c.roman}</span>
                <span style={{ fontSize: 11, color: isTriggered ? c.color : '#64748b' }}>{c.chord}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER HERO: Free-Floating V9.3 3D Celtic Harp with Dynamic Pop-In */}
      <div
        style={{
          position: 'absolute',
          left: 480,
          top: 30,
          width: 960,
          height: 980,
          transform: `scale(${Math.max(0.08, harpPopIn)})`,
          opacity: Math.max(0, harpPopIn),
          zIndex: 4,
        }}
      >
        <Harp3DCanvas
          width={960}
          height={980}
          theta={theta}
          phi={phi}
          radius={radius}
          targetY={0.48}
          fov={34}
          pluckEvents={MECHANISM_PLUCKS}
          harpScale={0.73}
          tiltX={tiltX}
          tiltZ={tiltZ}
        />
      </div>

      {/* LEFT CARD: Larger Scrolling Polarized Journey Tab + Floating New Melody Card */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          top: 108,
          width: 560,
          height: 850,
          borderRadius: 26,
          background: 'rgba(13, 20, 33, 0.92)',
          border: '1px solid rgba(168, 85, 247, 0.45)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
          overflow: 'hidden',
          zIndex: 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 20,
        }}
      >
        {/* Card Header */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                fontWeight: 800,
                color: '#c084fc',
                letterSpacing: 1.6,
              }}
            >
              POLARIZED JOURNEY & ANALYTICS
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                background: 'rgba(168, 85, 247, 0.18)',
                border: '1px solid #c084fc',
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              REAL-TIME SCROLL
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff' }}>
            Internalize the Emotional Color of Every Note
          </div>
        </div>

        {/* Scrolling Viewport Container (Polarized Journey Tab -> Profile Dashboard -> Insights) */}
        <div
          style={{
            position: 'relative',
            height: 520,
            borderRadius: 18,
            background: 'rgba(7, 11, 18, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
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
              padding: 12,
            }}
          >
            {/* 1. Polarized Sunglasses Journey Tab */}
            <div style={{ height: 280, display: 'flex', justifyContent: 'center' }}>
              <Img
                src={staticFile('textures/real/verified_journey_sunglasses_tab.png')}
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
            </div>
            {/* 2. Harper Profile Dashboard */}
            <div style={{ height: 280, display: 'flex', justifyContent: 'center' }}>
              <Img
                src={staticFile('textures/real/accounts_profile_dashboard_verified.png')}
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
            </div>
            {/* 3. Session Insights & Radar Modal */}
            <div style={{ height: 280, display: 'flex', justifyContent: 'center' }}>
              <Img
                src={staticFile('textures/real/accounts_session_insights_modal_verified.png')}
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
            </div>
          </div>
        </div>

        {/* Footer info pill */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          <span>DARK OBSIDIAN THEME</span>
          <span style={{ color: '#c084fc', fontWeight: 800 }}>★ DEGREE RADAR ACTIVE</span>
        </div>

        {/* Overlapping Floating New Melody Card (Pops in at local frame 95) */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: -16,
            width: 250,
            height: 200,
            borderRadius: 18,
            padding: 8,
            background: 'rgba(11, 19, 33, 0.96)',
            border: '2px solid #38bdf8',
            boxShadow: '0 16px 45px rgba(56, 189, 248, 0.45)',
            transform: `scale(${melodyCardPop}) rotate(-4deg)`,
            opacity: melodyCardPop,
            zIndex: 12,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: 1.2,
            }}
          >
            NEW • MELODY SEQUENCE CARD
          </div>
          <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Img
              src={staticFile('textures/real/verified_melody_tab_standalone_card.png')}
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT CARD: Eye-Captivating Magnetic Resolution Walk (4 -> 3 -> 2 -> 1) */}
      <div
        style={{
          position: 'absolute',
          right: 44,
          top: 108,
          width: 560,
          height: 850,
          borderRadius: 26,
          background: 'rgba(13, 20, 33, 0.92)',
          border: '1px solid rgba(56, 189, 248, 0.48)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
          overflow: 'hidden',
          zIndex: 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 20,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: 1.6,
              }}
            >
              MAGNETIC TONAL GRAVITY WELL
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.18)',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              STEPWISE RESOLUTION
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff' }}>
            Note 4 (Fa) Gravitates 4 → 3 → 2 → 1 to Tonic Home
          </div>
        </div>

        {/* Top Live Visual Preview (Crossfade Low Down / Active Resolution Walk) */}
        <div
          style={{
            height: 380,
            borderRadius: 18,
            background: 'rgba(7, 11, 18, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile(
              frame < 180
                ? 'textures/real/verified_closest_resolution_low_down.png'
                : 'textures/real/verified_resolution_walk_active.png'
            )}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
          />
        </div>

        {/* Concentric Gravity Target Step Visualizer (4 -> 3 -> 2 -> 1) */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 18,
            background: 'rgba(7, 11, 18, 0.92)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              fontWeight: 800,
              color: '#34d399',
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>GRAVITY STEP SEQUENCE</span>
            <span>{activeResolutionStep ? `ACTIVE: DEGREE ${activeResolutionStep}` : 'WAITING FOR NOTE'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { deg: 4, name: 'Fa', color: '#38bdf8', label: 'Tension Note' },
              { deg: 3, name: 'Mi', color: '#fbbf24', label: 'Step Down' },
              { deg: 2, name: 'Re', color: '#fbbf24', label: 'Step Down' },
              { deg: 1, name: 'Do', color: '#ef4444', label: '⚓ Tonic Home' },
            ].map((st) => {
              const isNow = activeResolutionStep === st.deg;
              return (
                <div
                  key={st.deg}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 12,
                    textAlign: 'center',
                    background: isNow ? `${st.color}33` : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isNow ? st.color : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: isNow ? `0 0 20px ${st.color}66` : 'none',
                    transform: isNow ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 22,
                      fontWeight: 900,
                      color: isNow ? '#ffffff' : st.color,
                    }}
                  >
                    {st.deg}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                    {st.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{st.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info pill */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          <span>ALAIN BENBASSAT FUNCTIONAL METHOD</span>
          <span style={{ color: '#38bdf8', fontWeight: 800 }}>MAGNETIC SNAP LOCKED</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
