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

export const SceneCTAShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic 3D Harp Burst-In Choreography from depth!
  const harpBurstIn = spring({
    frame: frame - 2,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });



  const bottomActionEnter = spring({
    frame: frame - 32,
    fps,
    config: { damping: 15, stiffness: 130 },
  });

  // 3D Harp sweeps through space from depth
  const theta = interpolate(frame, [0, 90, 185], [-0.55, 0.95, 1.65]);
  const phi = interpolate(frame, [0, 90, 185], [1.44, 1.25, 1.35]);
  const radius = interpolate(harpBurstIn, [0, 1], [2.9, 2.22]);
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
      {/* 1. Golden Sanctuary Finale Aura */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 36%, rgba(212, 175, 55, 0.32) 0%, rgba(16, 185, 129, 0.16) 38%, rgba(5, 8, 15, 0.98) 78%)',
        }}
      />

      {/* Rotating Sacred Geometry Rings */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0, opacity: 0.32, pointerEvents: 'none' }}
      >
        <g transform={`translate(540, 840) rotate(${frame * 0.25})`}>
          <circle
            cx={0}
            cy={0}
            r={420}
            fill="none"
            stroke="rgba(212, 175, 55, 0.45)"
            strokeWidth={1.5}
          />
          <circle
            cx={0}
            cy={0}
            r={500}
            fill="none"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth={1}
            strokeDasharray="8 8"
          />
        </g>
      </svg>



      {/* 3. CENTER HERO STAGE: 3D Harp Burst-In from Depth + Phone Flanks */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          right: 54,
          top: 380,
          height: 860,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        {/* Left Flank Phone */}
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 140,
            width: 190,
            height: 390,
            borderRadius: 24,
            padding: 4,
            background: 'linear-gradient(145deg, #334155 0%, #1e293b 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.75)',
            transform: `rotate(-10deg) scale(${Math.max(0.08, harpBurstIn)})`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(16, 185, 129, 0.3)',
            zIndex: 4,
            opacity: harpBurstIn,
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile('plus/home-single.png')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }}
          />
        </div>

        {/* Right Flank Phone */}
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: 140,
            width: 190,
            height: 390,
            borderRadius: 24,
            padding: 4,
            background: 'linear-gradient(145deg, #334155 0%, #1e293b 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.75)',
            transform: `rotate(10deg) scale(${Math.max(0.08, harpBurstIn)})`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(56, 189, 248, 0.3)',
            zIndex: 4,
            opacity: harpBurstIn,
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile('plus/map-single.png')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }}
          />
        </div>

        {/* Center Live 3D Celtic Harp (100% Unclipped & Majestic) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 1050,
            zIndex: 8,
            transform: `scale(${Math.max(0.08, harpBurstIn)})`,
            opacity: Math.max(0, harpBurstIn),
          }}
        >
          <Harp3DCanvas
            width={972}
            height={1050}
            theta={theta}
            phi={phi}
            radius={2.50}
            targetY={0.46}
            fov={34}
            pluckEvents={CTA_PLUCKS}
            harpScale={0.78}
            tiltX={tiltX}
            tiltZ={tiltZ}
          />
        </div>
      </div>

      {/* 4. LOWER UNIFIED STAGE: Liquid Glass Dock + Acoustic Visualizer + Value Badge */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          right: 54,
          bottom: 125,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          transform: `translateY(${interpolate(bottomActionEnter, [0, 1], [60, 0])}px)`,
          opacity: bottomActionEnter,
          zIndex: 20,
        }}
      >
        {/* Navigation Dock Preview */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 24,
            background: 'rgba(10, 16, 26, 0.92)',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212, 175, 55, 0.2)',
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              fontWeight: 800,
              color: '#fbbf24',
              letterSpacing: 1.8,
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            SANCTUARY DOCK • 4 INTERACTIVE REALMS
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 10,
              padding: 6,
              borderRadius: 16,
              background: 'rgba(5, 8, 15, 0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {[
              { id: 0, tag: '01', label: 'Single', color: '#10b981' },
              { id: 1, tag: '02', label: 'Melody', color: '#38bdf8' },
              { id: 2, tag: '03', label: 'Levers', color: '#f59e0b' },
              { id: 3, tag: '04', label: 'Journey', color: '#a855f7' },
            ].map((tab) => {
              const isActive = activeDockTab === tab.id;
              return (
                <div
                  key={tab.id}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 12,
                    background: isActive ? `${tab.color}25` : 'transparent',
                    border: `1.5px solid ${isActive ? tab.color : 'transparent'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 14,
                      fontWeight: 900,
                      color: tab.color,
                    }}
                  >
                    {tab.tag}
                  </span>
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      fontWeight: 800,
                      color: isActive ? '#ffffff' : '#64748b',
                    }}
                  >
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 32-Bar Golden Acoustic Visualizer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            height: 38,
            padding: '0 8px',
          }}
        >
          {Array.from({ length: 32 }).map((_, barIdx) => {
            const freq = 0.09 * (barIdx + 1);
            const isRinging = frame < 120;
            const amp = isRinging ? Math.max(0, 1 - (frame - 30) / 110) : 0.05;
            const barHeight = Math.min(
              34,
              Math.max(
                4,
                (Math.sin(frame * freq + barIdx * 0.45) * 0.5 + 0.5) * 28 * amp + 4
              )
            );
            return (
              <div
                key={barIdx}
                style={{
                  flex: 1,
                  height: barHeight,
                  borderRadius: 3,
                  background:
                    barIdx % 4 === 0
                      ? '#fbbf24'
                      : barIdx % 2 === 0
                      ? '#38bdf8'
                      : 'rgba(255,255,255,0.3)',
                  boxShadow:
                    barIdx % 4 === 0
                      ? '0 0 8px rgba(251, 191, 36, 0.45)'
                      : barIdx % 2 === 0
                      ? '0 0 8px rgba(56, 189, 248, 0.35)'
                      : 'none',
                  transition: 'height 0.08s ease',
                }}
              />
            );
          })}
        </div>

        {/* High-Converting Low-Price Value Badge */}
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 16,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1.5px solid rgba(16, 185, 129, 0.65)',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              fontWeight: 900,
              color: '#34d399',
              letterSpacing: 1.4,
            }}
          >
            ✨ FULL UNLIMITED ACCESS • LESS THAN A COFFEE • iOS, ANDROID & WEB
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
