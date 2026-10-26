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

// Scene 5 runs from global frame 1165 to 1350 (185 frames: local 0..185)
const CTA_PLUCKS: PluckEvent[] = [
  // Radiant 8-string Celtic glissando across the harp
  { stringNum: 1, startFrame: 5, amplitude: 0.025 },
  { stringNum: 2, startFrame: 9, amplitude: 0.020 },
  { stringNum: 3, startFrame: 13, amplitude: 0.021 },
  { stringNum: 4, startFrame: 17, amplitude: 0.024 },
  { stringNum: 5, startFrame: 21, amplitude: 0.022 },
  { stringNum: 6, startFrame: 25, amplitude: 0.022 },
  { stringNum: 7, startFrame: 29, amplitude: 0.023 },
  { stringNum: 8, startFrame: 33, amplitude: 0.027 },
  // Final resonant tonic chord lock at local frame 100
  { stringNum: 1, startFrame: 100, amplitude: 0.026 },
  { stringNum: 5, startFrame: 102, amplitude: 0.022 },
  { stringNum: 8, startFrame: 104, amplitude: 0.026 },
];

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic 3D Harp Burst-In Choreography from depth!
  const harpBurstIn = spring({
    frame: frame - 2,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });

  const crestScale = spring({
    frame: frame - 12,
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  const urlEnter = spring({
    frame: frame - 32,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const bottomActionEnter = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 130 },
  });

  // 3D Harp sweeps through space from depth
  const theta = interpolate(frame, [0, 90, 185], [-0.55, 0.95, 1.65]);
  const phi = interpolate(frame, [0, 90, 185], [1.44, 1.25, 1.35]);
  const radius = interpolate(harpBurstIn, [0, 1], [3.1, 2.26]);
  const tiltX = interpolate(frame, [0, 90, 185], [0.06, -0.05, 0.03]);
  const tiltZ = interpolate(frame, [0, 90, 185], [-0.05, 0.05, -0.03]);

  // Bottom dock active tab sweep (Home -> Melody -> Levers -> Journey)
  const activeDockTab = frame < 45 ? 0 : frame < 90 ? 1 : frame < 135 ? 2 : 3;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#05080f',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Golden Sanctuary Finale Aura */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 65% 48%, rgba(212, 175, 55, 0.28) 0%, rgba(16, 185, 129, 0.14) 38%, rgba(5, 8, 15, 0.98) 78%)',
        }}
      />

      {/* Rotating Sacred Geometry Rings */}
      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, opacity: 0.32, pointerEvents: 'none' }}
      >
        <g transform={`translate(1320, 500) rotate(${frame * 0.25})`}>
          <circle
            cx={0}
            cy={0}
            r={380}
            fill="none"
            stroke="rgba(212, 175, 55, 0.45)"
            strokeWidth={1.5}
            strokeDasharray="12 10"
          />
          <circle
            cx={0}
            cy={0}
            r={290}
            fill="none"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth={1.2}
          />
        </g>
      </svg>

      {/* RIGHT HERO STAGE: Dynamic 3D Celtic Harp Burst-In + Fanned Uncropped Screens */}
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 20,
          width: 960,
          height: 980,
          zIndex: 5,
        }}
      >
        {/* Left & Right Fanned Uncropped App Cards Behind 3D Harp */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: 150,
            width: 240,
            height: 480,
            borderRadius: 22,
            padding: 6,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            transform: `rotate(-11deg) scale(${harpBurstIn})`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
            zIndex: 2,
          }}
        >
          <Img
            src={staticFile('textures/real/verified_tab_single_green_phone.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 16 }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            right: 30,
            top: 150,
            width: 240,
            height: 480,
            borderRadius: 22,
            padding: 6,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            transform: `rotate(11deg) scale(${harpBurstIn})`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
            zIndex: 2,
          }}
        >
          <Img
            src={staticFile('textures/real/verified_realm_coastal_roadmap_phone.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 16 }}
          />
        </div>

        {/* Center Live 3D Celtic Harp */}
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: 0,
            width: 740,
            height: 940,
            zIndex: 6,
            transform: `scale(${Math.max(0.08, harpBurstIn)})`,
            opacity: Math.max(0, harpBurstIn),
          }}
        >
          <Harp3DCanvas
            width={740}
            height={940}
            theta={theta}
            phi={phi}
            radius={radius}
            targetY={0.48}
            fov={34}
            pluckEvents={CTA_PLUCKS}
            harpScale={0.73}
            tiltX={tiltX}
            tiltZ={tiltZ}
          />
        </div>
      </div>

      {/* LEFT STAGE: Brand Crest Lockup + Spoken Message + CTA + Dynamic Bottom Action */}
      <div
        style={{
          position: 'absolute',
          left: 84,
          top: 80,
          width: 860,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          zIndex: 10,
        }}
      >
        {/* Crest + Wordmark Lockup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            transform: `scale(${crestScale})`,
            transformOrigin: 'left center',
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 26,
              padding: 6,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.4), rgba(15,23,42,0.95))',
              border: '2px solid #fbbf24',
              boxShadow: '0 18px 45px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Img
              src={staticFile('textures/real/earpa_logo_3d.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 20,
              }}
            />
          </div>

          <div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 14,
                fontWeight: 800,
                color: '#34d399',
                letterSpacing: 3,
              }}
            >
              THE GATEWAY TO IMPROVISATION
            </div>
            <div
              style={{
                fontSize: 78,
                fontWeight: 900,
                letterSpacing: 6,
                color: '#ffffff',
                lineHeight: 1.0,
                marginTop: 4,
                textShadow: '0 8px 32px rgba(212, 175, 55, 0.45)',
              }}
            >
              EARPA
            </div>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            lineHeight: 1.18,
            color: '#f8fafc',
            letterSpacing: -0.8,
          }}
        >
          Stop guessing notes.
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #fbbf24 0%, #34d399 55%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Speak through your instrument.
          </span>
        </div>

        {/* Feature summary pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            '✓ Alain Benbassat Tonal Gravity',
            '✓ 3 Paths • 220+ Levels',
            '✓ Real 3D Camac Levers',
            '✓ 10 Minutes a Day',
          ].map((feat) => (
            <div
              key={feat}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#e2e8f0',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {feat}
            </div>
          ))}
        </div>

        {/* Primary CTA Button + Low-Price Value Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            transform: `translateY(${interpolate(urlEnter, [0, 1], [35, 0])}px)`,
            opacity: urlEnter,
          }}
        >
          <div
            style={{
              padding: '18px 38px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#05080f',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 1.5,
              boxShadow: '0 16px 45px rgba(245, 158, 11, 0.5)',
            }}
          >
            EARPA.APP →
          </div>

          {/* High-Converting Low-Price Value Badge */}
          <div
            style={{
              padding: '12px 20px',
              borderRadius: 14,
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.55)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12,
                fontWeight: 900,
                color: '#34d399',
                letterSpacing: 1.2,
              }}
            >
              ✨ FULL UNLIMITED ACCESS • LESS THAN A CUP OF COFFEE
            </div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                color: '#94a3b8',
                fontWeight: 700,
              }}
            >
              AVAILABLE ON iOS • ANDROID • WEB SANCTUARY PWA
            </div>
          </div>
        </div>

        {/* DYNAMIC BOTTOM-SCREEN ACTION (Floating 3D Navigation Dock + 32-Bar Acoustic Resonance Waveform) */}
        <div
          style={{
            marginTop: 10,
            padding: '18px 22px',
            borderRadius: 20,
            background: 'rgba(11, 18, 30, 0.90)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 18px 45px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            transform: `translateY(${interpolate(bottomActionEnter, [0, 1], [40, 0])}px)`,
            opacity: bottomActionEnter,
          }}
        >
          {/* Live 3D Liquid-Glass Bottom Navigation Dock Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {[
              { id: 0, icon: '🏛️', name: 'Home' },
              { id: 1, icon: '🎶', name: 'Melody' },
              { id: 2, icon: '⚙️', name: 'Levers' },
              { id: 3, icon: '🕶️', name: 'Journey' },
            ].map((tab) => {
              const isActive = activeDockTab === tab.id;
              return (
                <div
                  key={tab.name}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: isActive ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${isActive ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: isActive ? '0 0 16px rgba(245, 158, 11, 0.4)' : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              );
            })}
          </div>

          {/* 32-Bar Golden Acoustic Waveform (Decays smoothly during final ring-out) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 42 }}>
            {Array.from({ length: 32 }).map((_, i) => {
              const ringoutDecay = interpolate(frame, [105, 180], [1.0, 0.08], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const wave = (Math.sin(frame * 0.25 + i * 0.4) * 0.5 + 0.5) * ringoutDecay;
              const h = 8 + wave * 30;
              return (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: h,
                    borderRadius: 999,
                    background: i % 2 === 0 ? '#fbbf24' : '#34d399',
                    opacity: 0.85,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
