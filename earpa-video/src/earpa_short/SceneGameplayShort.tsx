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
import { PhoneFrame } from './PhoneFrame';

// Scene 4 runs from global frame 930 to 1165 (235 frames: local 0..235)
// Voiceover:
// "Explore three distinct guided paths across 220+ levels,
//  all the way to tactile Camac sharping levers."

export const SceneGameplayShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Active curriculum path (0: Single Notes, 1: Melody Sequences, 2: Sharping Levers)
  const activePath = frame < 75 ? 0 : frame < 155 ? 1 : 2;

  // Phone flip springs between the three distinct paths
  const phoneEnter = spring({
    frame: frame - 2,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });
  const phoneFlip2 = spring({
    frame: frame - 75,
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const phoneFlip3 = spring({
    frame: frame - 155,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const phoneRotateY =
    interpolate(phoneEnter, [0, 1], [-10, 0]) +
    interpolate(phoneFlip2, [0, 0.5, 1], [0, 10, 0]) +
    interpolate(phoneFlip3, [0, 0.5, 1], [0, -10, 0]);

  const phoneScale = interpolate(phoneEnter, [0, 1], [0.88, 1.0]);
  const phoneOpacity = interpolate(phoneEnter, [0, 1], [0, 1]);

  // Gentle floating drift
  const floatY = Math.sin(frame * 0.04) * 6;

  // 3 Verified Realm Trail Maps
  const PATH_CONFIGS = [
    {
      id: 0,
      pathNum: 'PATH 01',
      title: 'Single Note Relative Pitch',
      subtitle: '68 Levels • 10-Minute Daily Anchor',
      accent: '#10b981',
      phoneImg: 'plus/map-single.png', // Coastal Ridge Trail Map
      realmName: 'COASTAL RIDGE SANCTUARY',
    },
    {
      id: 1,
      pathNum: 'PATH 02',
      title: 'Melodic Sequence Phrasing',
      subtitle: '76 Levels • Real By-Ear Phrasing',
      accent: '#38bdf8',
      phoneImg: 'plus/map-arctic.png', // Glacial Fjord Trail Map
      realmName: 'GLACIAL FJORD REALM',
    },
    {
      id: 2,
      pathNum: 'PATH 03',
      title: 'Tactile Camac Sharping Levers',
      subtitle: '76 Levels • Modal Key Shifts',
      accent: '#f59e0b',
      phoneImg: 'plus/map-canyon.png', // Sandstone Canyon Trail Map
      realmName: 'SANDSTONE CANYON REALM',
    },
  ];

  const currentPath = PATH_CONFIGS[activePath];

  // Floating chip spring per path
  const chipSpring = spring({
    frame: frame - (activePath === 0 ? 8 : activePath === 1 ? 82 : 162),
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Dynamic Ambient Background Glow that smoothly shifts per path */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 36%, ${
            activePath === 0
              ? 'rgba(16, 185, 129, 0.22)'
              : activePath === 1
              ? 'rgba(56, 189, 248, 0.22)'
              : 'rgba(245, 158, 11, 0.24)'
          } 0%, rgba(7, 11, 18, 0.98) 75%)`,
          transition: 'background 0.35s ease',
        }}
      />

      {/* Subtle Harmonic Wave Rings */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0, opacity: 0.24, pointerEvents: 'none' }}
      >
        <circle
          cx={540}
          cy={960}
          r={440 + Math.sin(frame * 0.05) * 15}
          fill="none"
          stroke={currentPath.accent}
          strokeWidth={1.5}
        />
        <circle
          cx={540}
          cy={960}
          r={540 + Math.cos(frame * 0.05) * 15}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
          strokeDasharray="8 8"
        />
      </svg>



      {/* 3. HERO CENTERPIECE: Gorgeous Titanium Phone Displaying Genuine Trail Maps */}
      <div
        style={{
          position: 'absolute',
          left: 215,
          top: 240 + floatY,
          width: 650,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 15,
          opacity: phoneOpacity,
          transform: `perspective(1200px) rotateY(${phoneRotateY}deg) scale(${phoneScale})`,
          pointerEvents: 'none',
        }}
      >
        <PhoneFrame width={650} accent={currentPath.accent}>
          <Img
            src={staticFile(currentPath.phoneImg)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </PhoneFrame>
      </div>

      {/* 4. COMPLEMENTARY MINIMALIST FLOATING CHIP (Flanking phone with ample breathing room) */}
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 560,
          zIndex: 20,
          transform: `scale(${chipSpring}) translateX(${interpolate(
            chipSpring,
            [0, 1],
            [-40, 0]
          )}px)`,
          opacity: chipSpring,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            padding: '14px 22px',
            borderRadius: 20,
            background: 'rgba(10, 16, 26, 0.92)',
            border: `1.5px solid ${currentPath.accent}66`,
            boxShadow: `0 16px 40px rgba(0,0,0,0.85), 0 0 24px ${currentPath.accent}35`,
            backdropFilter: 'blur(20px)',
            maxWidth: 240,
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              fontWeight: 900,
              color: currentPath.accent,
              letterSpacing: 1.5,
              marginBottom: 4,
            }}
          >
            ★ {currentPath.pathNum}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: 6,
            }}
          >
            {currentPath.title}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#94a3b8',
              lineHeight: 1.3,
            }}
          >
            {currentPath.subtitle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
