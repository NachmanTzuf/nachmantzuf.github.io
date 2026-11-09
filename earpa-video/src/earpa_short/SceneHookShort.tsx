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
import { PhoneFrame } from './PhoneFrame';

const HOOK_PLUCKS: PluckEvent[] = [
  // Real live Celtic harp solo played by artist on stage (0.0s to 2.4s)
  { stringNum: 3, startFrame: 1, amplitude: 0.026 },   // E4
  { stringNum: 4, startFrame: 15, amplitude: 0.025 },  // F4 Cyan
  { stringNum: 5, startFrame: 21, amplitude: 0.027 },  // G4
  { stringNum: 8, startFrame: 49, amplitude: 0.030 },  // C5 Red
  { stringNum: 6, startFrame: 54, amplitude: 0.024 },  // A4
  { stringNum: 5, startFrame: 56, amplitude: 0.023 },  // G4
  { stringNum: 4, startFrame: 59, amplitude: 0.026 },  // F4 Cyan
  { stringNum: 3, startFrame: 64, amplitude: 0.025 },  // E4
  { stringNum: 2, startFrame: 67, amplitude: 0.024 },  // D4
  // Resonant Celtic Rolled Chord (frames 71-74)
  { stringNum: 1, startFrame: 71, amplitude: 0.028 },  // C4 Red
  { stringNum: 3, startFrame: 72, amplitude: 0.025 },  // E4
  { stringNum: 5, startFrame: 73, amplitude: 0.026 },  // G4
  { stringNum: 8, startFrame: 74, amplitude: 0.030 },  // C5 Red
  // Natural acoustic resonance continuing under voiceover
  { stringNum: 6, startFrame: 81, amplitude: 0.020 },
  { stringNum: 8, startFrame: 94, amplitude: 0.022 },
  { stringNum: 5, startFrame: 112, amplitude: 0.019 },
  { stringNum: 4, startFrame: 119, amplitude: 0.020 },
  { stringNum: 3, startFrame: 126, amplitude: 0.019 },
  { stringNum: 2, startFrame: 133, amplitude: 0.018 },
  { stringNum: 1, startFrame: 140, amplitude: 0.022 },
  { stringNum: 5, startFrame: 149, amplitude: 0.019 },
  { stringNum: 6, startFrame: 157, amplitude: 0.020 },
  { stringNum: 8, startFrame: 163, amplitude: 0.022 },
  { stringNum: 7, startFrame: 172, amplitude: 0.019 },
];

export const SceneHookShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0 to 180, 6.0s): Hero 3D Celtic harp in center stage (live solo)
  // Phase 2 (180 to 285, 3.5s): Phone stage lands with Single Note Sanctuary
  // Phase 3 (285 to 400, 3.8s): Snappy 3D flip to live In-Game playing arena
  const isPhoneStageActive = frame >= 175 && frame < 380;
  const isArenaActive = frame >= 285;

  const harpFlyOut = spring({
    frame: frame - 180,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.9 },
  });
  const harpReEnter = spring({
    frame: frame - 375,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const baseScaleVal = interpolate(harpFlyOut, [0, 1], [0.82, 0.42]) * (1 - harpFlyOut * 0.92 + harpReEnter * 0.92);
  const harpScale = Math.max(0.08, baseScaleVal);
  const harpOpacity = interpolate(harpFlyOut, [0, 0.85, 1], [1, 0.25, 0]) + interpolate(harpReEnter, [0, 1], [0, 1]);

  const rushIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 75, mass: 0.9 },
  });
  const radius = interpolate(rushIn, [0, 1], [2.85, 2.45]);
  const theta = interpolate(frame, [0, 200, 400], [-0.55, 0.85, 1.70]);
  const phi = interpolate(frame, [0, 200, 400], [1.42, 1.22, 1.35]);
  const tiltX = interpolate(frame, [0, 200, 400], [0.06, -0.05, 0.04]);
  const tiltZ = interpolate(frame, [0, 200, 400], [-0.05, 0.05, -0.03]);

  // Phone Entrance Spring
  const phoneEntranceSpring = spring({
    frame: frame - 180,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Snappy Flip to Arena at Frame 285
  const arenaFlipSpring = spring({
    frame: frame - 285,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  const phoneExitSpring = spring({
    frame: frame - 372,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const phoneRotateY =
    interpolate(phoneEntranceSpring, [0, 1], [-12, 0]) +
    interpolate(arenaFlipSpring, [0, 0.5, 1], [0, 10, 0]);

  const phoneScale =
    interpolate(phoneEntranceSpring, [0, 1], [0.85, 1.0]) *
    interpolate(phoneExitSpring, [0, 1], [1, 0.85]);

  const phoneOpacity =
    interpolate(phoneEntranceSpring, [0, 1], [0, 1]) *
    interpolate(phoneExitSpring, [0, 1], [1, 0]);

  // Subtle natural float
  const floatY = Math.sin(frame * 0.04) * 6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Full-Bleed Warm Sanctuary Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.26) 0%, rgba(56, 189, 248, 0.14) 38%, rgba(7, 11, 18, 0.98) 75%)',
        }}
      />

      {/* Subtle Celtic Golden Portal Rings */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }}
      >
        <circle
          cx={540}
          cy={940}
          r={430}
          fill="none"
          stroke="rgba(212, 175, 55, 0.45)"
          strokeWidth={1.5}
        />
        <circle
          cx={540}
          cy={940}
          r={530}
          fill="none"
          stroke="rgba(56, 189, 248, 0.25)"
          strokeWidth={1}
          strokeDasharray="8 8"
        />
      </svg>

      {/* 2. CENTERPIECE: 3D Celtic Harp (Frames 0 to 185) */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 140,
          width: 972,
          height: 1540,
          transform: `scale(${harpScale})`,
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
          targetY={0.46}
          fov={34}
          pluckEvents={HOOK_PLUCKS}
          harpScale={0.78}
          tiltX={tiltX}
          tiltZ={tiltZ}
        />
      </div>

      {/* 3. HERO PHONE CENTERPIECE (Frames 180 to 380) */}
      {isPhoneStageActive && (
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
          <PhoneFrame width={650} accent={isArenaActive ? '#38bdf8' : '#10b981'}>
            <Img
              src={staticFile(
                isArenaActive
                  ? 'textures/real/live_app/app_screen_ingame_playing.png'
                  : 'plus/home-single.png'
              )}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </PhoneFrame>
        </div>
      )}
    </AbsoluteFill>
  );
};
