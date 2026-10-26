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
import { Harp3DCanvas, LeverFlipEvent, PluckEvent } from '../earpa/Harp3DCanvas';

// Scene 4 runs from global frame 930 to 1165 (235 frames: local 0..235)
const GAMEPLAY_PLUCKS: PluckEvent[] = [
  // Fast melodic arpeggio showing fluid finger memory
  { stringNum: 1, startFrame: 20, amplitude: 0.024 },
  { stringNum: 3, startFrame: 28, amplitude: 0.021 },
  { stringNum: 5, startFrame: 36, amplitude: 0.022 },
  { stringNum: 8, startFrame: 44, amplitude: 0.026 },
  // Second modal run showing sharped note
  { stringNum: 4, startFrame: 175, amplitude: 0.025 },
  { stringNum: 6, startFrame: 185, amplitude: 0.021 },
  { stringNum: 8, startFrame: 195, amplitude: 0.024 },
  { stringNum: 1, startFrame: 210, amplitude: 0.026 },
];

const GAMEPLAY_LEVERS: LeverFlipEvent[] = [
  // Camac Lever 3 (E3) flips up (+1.75 rad) at local frame 170 with mechanical click
  { leverNum: 3, flipFrame: 170 },
  // Camac Lever 4 (F4) flips up (+1.75 rad) at local frame 200 with mechanical click
  { leverNum: 4, flipFrame: 200 },
];

export const SceneGameplayShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Active curriculum path (0: Single Notes, 1: Melody Sequences, 2: Sharping Levers)
  const activePath = frame < 75 ? 0 : frame < 155 ? 1 : 2;

  // Path 1 (0 to 75): Single Note Recognition Phone Showcase
  // Path 2 (75 to 155): Melody Sequence Phrases Phone Showcase
  // Path 3 (155 to 235): Cinematic Macro Zoom into 3D Harp Neck & Shiny Camac Levers Flipping!

  const isLeverStage = frame >= 155;

  // Lever focus spring zoom
  const leverFocusSpring = spring({
    frame: frame - 155,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const radius = interpolate(leverFocusSpring, [0, 1], [2.25, 1.45]);
  const targetY = interpolate(leverFocusSpring, [0, 1], [0.48, 0.62]);
  const theta = interpolate(leverFocusSpring, [0, 1], [0.65, 1.35]);
  const phi = interpolate(leverFocusSpring, [0, 1], [1.32, 1.25]);
  const tiltX = interpolate(leverFocusSpring, [0, 1], [0.03, 0.08]);
  const tiltZ = interpolate(leverFocusSpring, [0, 1], [-0.03, 0.02]);

  // Rolling XP progress counter (320 -> 480 XP)
  const xpValue = Math.floor(
    interpolate(frame, [15, 215], [320, 480], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Phone transition kinematics for Paths 1 and 2
  const phoneFlipSpring = spring({
    frame: frame >= 75 ? frame - 75 : frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const phoneRotateY = interpolate(phoneFlipSpring, [0, 1], [-16, 0]);

  const PATH_CONFIGS = [
    {
      id: 0,
      title: 'SINGLE NOTE RECOGNITION',
      subtitle: '68 Levels • 10-Minute Daily Anchor',
      accent: '#10b981',
      sanctuary: 'Emerald Coast Sanctuary',
      phoneImg: 'textures/real/verified_tab_single_green_phone.png',
    },
    {
      id: 1,
      title: 'MELODIC SEQUENCES & PHRASES',
      subtitle: '76 Levels • Real By-Ear Phrasing',
      accent: '#38bdf8',
      sanctuary: 'Glacial Fjord Sanctuary',
      phoneImg: 'textures/real/verified_tab_melody_blue_phone.png',
    },
    {
      id: 2,
      title: 'TACTILE CAMAC LEVERS & MODULATIONS',
      subtitle: '76 Levels • Modal Key Shifts',
      accent: '#f59e0b',
      sanctuary: 'Desert Sandstone Canyon',
      phoneImg: 'textures/real/verified_tab_levers_orange_phone.png',
    },
  ];

  const currentPath = PATH_CONFIGS[activePath];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Dynamic Background Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 36%, ${
            activePath === 0
              ? 'rgba(16, 185, 129, 0.25)'
              : activePath === 1
              ? 'rgba(56, 189, 248, 0.25)'
              : 'rgba(245, 158, 11, 0.28)'
          } 0%, rgba(7, 11, 18, 0.98) 75%)`,
          transition: 'background 0.3s ease',
        }}
      />

      {/* 2. TOP HUD: 3 Guided Paths Progress Strip */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 54,
          right: 54,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
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
            04 // THREE GUIDED PATHS • 220+ LEVELS
          </div>

          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              color: currentPath.accent,
              fontWeight: 800,
              letterSpacing: 1.2,
            }}
          >
            PATH {activePath + 1} OF 3
          </div>
        </div>

        {/* 3 Path Switcher Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {PATH_CONFIGS.map((p) => {
            const isSelected = activePath === p.id;
            return (
              <div
                key={p.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: isSelected ? `${p.accent}35` : 'rgba(15,23,42,0.6)',
                  border: `1.5px solid ${isSelected ? p.accent : 'rgba(255,255,255,0.1)'}`,
                  color: isSelected ? '#ffffff' : '#64748b',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: isSelected ? `0 0 16px ${p.accent}55` : 'none',
                }}
              >
                <span style={{ color: p.accent }}>0{p.id + 1}</span>
                <span>{p.title.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PATH 1 & 2: FULL-SCREEN SMARTPHONE DEVICE SHOWCASE (Frames 0 to 155) */}
      {!isLeverStage && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            right: 54,
            top: 180,
            height: 1370,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Path Header Badge */}
          <div
            style={{
              padding: '12px 28px',
              borderRadius: 999,
              background: 'rgba(10, 16, 26, 0.94)',
              border: `2px solid ${currentPath.accent}`,
              boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 24px ${currentPath.accent}55`,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 14,
                fontWeight: 900,
                color: currentPath.accent,
              }}
            >
              {currentPath.title}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>
              {currentPath.subtitle}
            </span>
          </div>

          {/* Unified Smartphone Showcase Frame */}
          <div
            style={{
              width: 620,
              height: 1140,
              borderRadius: 48,
              padding: 14,
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
              border: `2px solid ${currentPath.accent}88`,
              boxShadow: `0 30px 80px rgba(0,0,0,0.85), 0 0 40px ${currentPath.accent}33`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transform: `perspective(1200px) rotateY(${phoneRotateY}deg)`,
            }}
          >
            {/* Dynamic Island Notch */}
            <div
              style={{
                width: 150,
                height: 28,
                borderRadius: 20,
                background: '#020617',
                margin: '4px auto 12px auto',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e293b' }} />
              <div style={{ width: 44, height: 4, borderRadius: 2, background: '#1e293b' }} />
            </div>

            {/* Screen Content */}
            <div
              style={{
                flex: 1,
                borderRadius: 36,
                overflow: 'hidden',
                background: '#030712',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Img
                src={staticFile(currentPath.phoneImg)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Sanctuary Realm Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              color: '#f8fafc',
              fontWeight: 800,
            }}
          >
            <span>{currentPath.sanctuary}</span>
            <span style={{ color: currentPath.accent }}>★ 90% MASTERY GATE</span>
          </div>
        </div>
      )}

      {/* 4. PATH 3: CINEMATIC MACRO ZOOM INTO 3D HARP & SHINY CAMAC LEVERS (Frames 155 to 235) */}
      {isLeverStage && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            right: 54,
            top: 180,
            height: 1370,
            borderRadius: 36,
            background: 'rgba(11, 17, 29, 0.92)',
            border: '2px solid rgba(245, 158, 11, 0.7)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.85), 0 0 40px rgba(245, 158, 11, 0.35)',
            overflow: 'hidden',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {/* Top Lever Kinematics HUD */}
          <div
            style={{
              padding: '20px 24px',
              background: 'rgba(7, 11, 18, 0.92)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  color: '#fbbf24',
                  fontWeight: 900,
                  letterSpacing: 1.8,
                }}
              >
                LIVE 3D CAMAC SHARPING LEVER KINEMATICS
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                {frame >= 200
                  ? 'Lever 4 (F → F♯) Engaged (+1.75 rad)'
                  : frame >= 170
                  ? 'Lever 3 (E♭ → E♮) Engaged (+1.75 rad)'
                  : 'Open E♭ Major Base Tuning'}
              </div>
            </div>

            <div
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                background: '#f59e0b',
                color: '#070b12',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              LEVER SNAP
            </div>
          </div>

          {/* Full Macro Zoom 3D Harp Viewport */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Harp3DCanvas
              width={972}
              height={1080}
              theta={theta}
              phi={phi}
              radius={radius}
              targetY={targetY}
              fov={33}
              pluckEvents={GAMEPLAY_PLUCKS}
              leverEvents={GAMEPLAY_LEVERS}
              harpScale={0.88}
              tiltX={tiltX}
              tiltZ={tiltZ}
            />
          </div>

          {/* Bottom XP Progress Bar */}
          <div
            style={{
              padding: '18px 24px',
              background: 'rgba(7, 11, 18, 0.94)',
              borderTop: '1px solid rgba(56, 189, 248, 0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13,
                fontWeight: 900,
                color: '#38bdf8',
                marginBottom: 8,
              }}
            >
              <span>CUSTOM DEGREE DRILLS</span>
              <span style={{ color: '#fbbf24' }}>{xpValue} / 500 XP</span>
            </div>
            <div
              style={{
                width: '100%',
                height: 10,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.15)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(xpValue / 500) * 100}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 50%, #fbbf24 100%)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
