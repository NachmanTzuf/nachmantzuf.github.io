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

export const SceneMechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });

  // Cadence chord badges entrance
  const c1 = spring({ frame: frame - 15, fps, config: { damping: 12, mass: 0.4 } });
  const c2 = spring({ frame: frame - 35, fps, config: { damping: 12, mass: 0.4 } });
  const c3 = spring({ frame: frame - 55, fps, config: { damping: 12, mass: 0.4 } });
  const c4 = spring({ frame: frame - 75, fps, config: { damping: 12, mass: 0.4 } });

  // 3D camera pan around the harp
  const harpRotY = interpolate(frame, [0, 212], [-20, 15]);
  const harpRotX = interpolate(frame, [0, 212], [8, -4]);
  const harpZoom = interpolate(frame, [0, 212], [1.0, 1.2]);

  // Gravitational pull beam oscillation
  const gravityPulse = Math.sin(frame * 0.15) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07100b',
        overflow: 'hidden',
        perspective: '1400px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/voiceover/scene_3_mechanism.mp3')} />
      <Audio src={staticFile('audio/sparkle.mp3')} volume={0.4} />

      {/* Background: Ancient Celtic Sanctuary with Volumetric Sunlight */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          transform: `scale(${interpolate(frame, [0, 212], [1.05, 1.18])})`,
          filter: 'brightness(0.65) contrast(1.1)',
        }}
      >
        <Img
          src={staticFile('textures/EARPA_01_Green_Celtic_Sanctuary.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Volumetric Diagonal Light Beam */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '80%',
          height: '140%',
          background:
            'linear-gradient(135deg, rgba(255, 230, 160, 0.28) 0%, rgba(255, 215, 100, 0.08) 45%, transparent 75%)',
          pointerEvents: 'none',
          transform: 'rotate(-12deg)',
          filter: 'blur(30px)',
        }}
      />

      {/* Left Column: Pedagogical Engine & Alain Benbassat Tonal Gravity */}
      <div
        style={{
          position: 'absolute',
          left: '100px',
          top: '120px',
          width: '760px',
          zIndex: 10,
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enterSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            color: '#4ade80',
            fontSize: '18px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '16px',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
          }}
        >
          The Architectural Breakthrough
        </div>

        <h1
          style={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            margin: '0 0 16px 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          EARPA Changes That.
        </h1>

        <div
          style={{
            fontSize: '26px',
            color: '#fef08a',
            fontWeight: 600,
            marginBottom: '28px',
            lineHeight: 1.4,
          }}
        >
          Grounded in the <span style={{ color: '#ffd700', textDecoration: 'underline' }}>Alain Benbassat Method</span>
        </div>

        {/* 4-Chord Grounding Cadence Badges */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#94a3b8',
              marginBottom: '12px',
              fontWeight: 700,
            }}
          >
            Grounding Cadence (Tonal Center Anchor)
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            {[
              { label: 'I Tonic', chord: 'C Major', spring: c1, color: '#38bdf8' },
              { label: 'IV Subdominant', chord: 'F Major', spring: c2, color: '#a78bfa' },
              { label: 'V Dominant', chord: 'G Major', spring: c3, color: '#fb923c' },
              { label: 'I Home Anchor', chord: 'C Tonic', spring: c4, color: '#4ade80' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: `2px solid ${item.color}`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 16px ${item.color}33`,
                  transform: `scale(${interpolate(item.spring, [0, 1], [0.8, 1])})`,
                  opacity: interpolate(item.spring, [0, 1], [0, 1]),
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: item.color }}>
                  {item.chord}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gravitational Resolution Vector Box */}
        <div
          style={{
            padding: '20px 28px',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, rgba(20, 45, 35, 0.85) 0%, rgba(10, 25, 20, 0.95) 100%)',
            border: '2px solid rgba(74, 222, 128, 0.5)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(74, 222, 128, 0.2)',
          }}
        >
          <div style={{ fontSize: '15px', color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>
            Tonal Gravity: Every Note Pulls Home
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#ffffff',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span>4 (Fa) → 3 (Mi) → 1 (Do)</span>
            <span style={{ color: '#4ade80', transform: `translateY(${gravityPulse}px)` }}>
              ↓ Home
            </span>
            <span>7 (Ti) → 8 (Do)</span>
          </div>
        </div>
      </div>

      {/* Right Column: 3D Celtic Harp on Exhibition Plinth */}
      <div
        style={{
          position: 'absolute',
          right: '6%',
          top: '10%',
          width: '600px',
          height: '840px',
          transform: `scale(${harpZoom}) rotateY(${harpRotY}deg) rotateX(${harpRotX}deg)`,
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
        }}
      >
        <Img
          src={staticFile('textures/v9_3_full_harp_lever_side.png')}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Orbiting Golden Energy Particles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 45% 55%, rgba(212, 175, 55, 0.25) 0%, transparent 60%)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
