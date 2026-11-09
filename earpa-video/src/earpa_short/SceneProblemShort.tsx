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

// Fast 3D harp transition sweep at the very end of Scene 2 (frames 228-260)
const TRANSITION_PLUCKS: PluckEvent[] = [
  { stringNum: 1, startFrame: 232, amplitude: 0.024 },
  { stringNum: 4, startFrame: 238, amplitude: 0.022 },
  { stringNum: 8, startFrame: 245, amplitude: 0.026 },
];

export const SceneProblemShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (Frames 0-135): Live Home Sanctuary on Sleek Phone
  // Phase 2 (Frames 135-228): Authentic Coastal Ridge Trail Map on Phone (10 Min Habit)
  // Phase 3 (Frames 228-260): High-End 3D Harp Transition Whip

  const isPhase1 = frame < 135;
  const isPhase2 = frame >= 135 && frame < 232;
  const isPhase3 = frame >= 225;

  // Phone entrance spring
  const phoneEntrance = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });

  // Transition between Home Sanctuary and Coastal Roadmap inside phone
  const screenFlipSpring = spring({
    frame: frame - 135,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const phoneRotateY =
    interpolate(phoneEntrance, [0, 1], [-12, 0]) +
    interpolate(screenFlipSpring, [0, 0.5, 1], [0, 10, 0]);

  const phoneScale = interpolate(phoneEntrance, [0, 1], [0.88, 1.0]);
  const phoneOpacity = interpolate(phoneEntrance, [0, 1], [0, 1]);

  // Phase 3 Harp Transition Whip kinematics (unclipped, majestic)
  const harpWhipSpring = spring({
    frame: frame - 228,
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const harpScale = interpolate(harpWhipSpring, [0, 0.5, 1], [0.35, 0.78, 0.82]);
  const harpTranslateX = interpolate(harpWhipSpring, [0, 1], [1100, 0]);
  const harpOpacity = interpolate(harpWhipSpring, [0, 0.15, 1], [0, 1, 1]);
  const theta = interpolate(frame, [228, 260], [-1.2, 0.65]);

  // Subtle continuous drift
  const floatY = Math.sin(frame * 0.04) * 6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Deep Soothing Emerald & Glacial Cyan Volumetric Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 38%, rgba(16, 185, 129, 0.22) 0%, rgba(56, 189, 248, 0.12) 42%, rgba(7, 11, 18, 0.98) 78%)',
        }}
      />

      {/* Harmonic Pulse Rings */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }}
      >
        <circle
          cx={540}
          cy={940}
          r={430 + Math.sin(frame * 0.05) * 15}
          fill="none"
          stroke="rgba(16, 185, 129, 0.4)"
          strokeWidth={1.5}
        />
        <circle
          cx={540}
          cy={940}
          r={530 + Math.cos(frame * 0.05) * 15}
          fill="none"
          stroke="rgba(56, 189, 248, 0.35)"
          strokeWidth={1.2}
          strokeDasharray="8 6"
        />
      </svg>

      {/* 2. HERO CENTERPIECE: Gorgeous Titanium Phone Displaying Genuine Live App */}
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
        <PhoneFrame width={650} accent={isPhase1 ? '#10b981' : '#38bdf8'}>
          <Img
            src={staticFile(
              isPhase1
                ? 'plus/home-single.png'
                : 'plus/map-single.png'
            )}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </PhoneFrame>
      </div>

      {/* 3. PHASE 3: 3D HARP TRANSITION WHIP (Frames 228-260) - 100% UNCLIPPED */}
      {isPhase3 && (
        <div
          style={{
            position: 'absolute',
            left: 54,
            top: 140,
            width: 972,
            height: 1540,
            transform: `translateX(${harpTranslateX}px)`,
            opacity: harpOpacity,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          <Harp3DCanvas
            width={972}
            height={1540}
            theta={theta}
            phi={1.34}
            radius={2.52}
            targetY={0.46}
            fov={34}
            pluckEvents={TRANSITION_PLUCKS}
            harpScale={harpScale}
            tiltX={0.04}
            tiltZ={-0.03}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
