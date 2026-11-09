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

// Scene 3 runs from global frame 660 to 930 (270 frames: local 0..270)
// Voiceover:
// "First, a chord progression grounds your ear.
//  Then you hear a note, and feel its magnetic pull home...
//  while tracking your mastery inside the new Journey and Melody cards."

export const SceneMechanismShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0 to 110): Cadence Grounds the Ear in Live In-Game Arena
  // Phase 2 (110 to 180): Magnetic Gravity & Resolution to DO (Degree 1)
  // Phase 3 (180 to 270): Real Journey & Mastery Analytics Tracking Cards

  const isPhase1 = frame < 110;
  const isPhase2 = frame >= 110 && frame < 180;
  const isPhase3 = frame >= 180;

  // Phone Entrance Spring
  const phoneEnter = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });

  // Smooth 3D tilt transitions between stages
  const screenFlip1 = spring({
    frame: frame - 110,
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const screenFlip2 = spring({
    frame: frame - 180,
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const screenFlip3 = spring({
    frame: frame - 225,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const phoneRotateY =
    interpolate(phoneEnter, [0, 1], [-10, 0]) +
    interpolate(screenFlip1, [0, 0.5, 1], [0, 8, 0]) +
    interpolate(screenFlip2, [0, 0.5, 1], [0, -8, 0]) +
    interpolate(screenFlip3, [0, 0.5, 1], [0, 6, 0]);

  const phoneScale = interpolate(phoneEnter, [0, 1], [0.88, 1.0]);
  const phoneOpacity = interpolate(phoneEnter, [0, 1], [0, 1]);

  // Gentle continuous floating drift
  const floatY = Math.sin(frame * 0.04) * 6;

  // Current screen image inside PhoneFrame
  const currentScreen = isPhase1
    ? 'textures/real/live_app/app_screen_ingame_playing.png'
    : isPhase2
    ? 'textures/real/live_app/app_screen_ingame_resolution.png'
    : frame < 225
    ? 'plus/melody-results.png'
    : 'textures/real/live_app/app_screen_journey_updated.png';

  // Floating Badge Springs
  const badge1Spring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  const badge2Spring = spring({
    frame: frame - 118,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  const badge3Spring = spring({
    frame: frame - 188,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060a11',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Ambient Volumetric Atmospheric Aura */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isPhase1
            ? 'radial-gradient(circle at 50% 36%, rgba(212, 175, 55, 0.22) 0%, rgba(56, 189, 248, 0.12) 42%, rgba(6, 10, 17, 0.98) 78%)'
            : isPhase2
            ? 'radial-gradient(circle at 50% 36%, rgba(16, 185, 129, 0.24) 0%, rgba(56, 189, 248, 0.14) 42%, rgba(6, 10, 17, 0.98) 78%)'
            : 'radial-gradient(circle at 50% 36%, rgba(168, 85, 247, 0.22) 0%, rgba(212, 175, 55, 0.12) 42%, rgba(6, 10, 17, 0.98) 78%)',
          transition: 'background 0.4s ease',
        }}
      />

      {/* Harmonic Concentric Wave Rings */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }}
      >
        <circle
          cx={540}
          cy={960}
          r={420 + Math.sin(frame * 0.05) * 16}
          fill="none"
          stroke={isPhase1 ? '#fbbf24' : isPhase2 ? '#10b981' : '#c084fc'}
          strokeWidth={1.5}
        />
        <circle
          cx={540}
          cy={960}
          r={520 + Math.cos(frame * 0.05) * 16}
          fill="none"
          stroke={isPhase1 ? '#38bdf8' : isPhase2 ? '#34d399' : '#a855f7'}
          strokeWidth={1.2}
          strokeDasharray="8 8"
        />
      </svg>



      {/* 3. HERO CENTERPIECE: Gorgeous Titanium Phone Displaying Real App Arena */}
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
        <PhoneFrame
          width={650}
          accent={isPhase1 ? '#fbbf24' : isPhase2 ? '#10b981' : '#c084fc'}
        >
          <Img
            src={staticFile(currentScreen)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </PhoneFrame>
      </div>

      {/* 4. COMPLEMENTARY MINIMALIST FLOATING CHIPS (Flanking the phone, zero overlap!) */}
      {/* Chip Phase 1: Cadence Lock (Left) */}
      {isPhase1 && (
        <div
          style={{
            position: 'absolute',
            left: 48,
            top: 560,
            zIndex: 20,
            transform: `scale(${badge1Spring}) translateX(${interpolate(
              badge1Spring,
              [0, 1],
              [-40, 0]
            )}px)`,
            opacity: badge1Spring,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '14px 22px',
              borderRadius: 20,
              background: 'rgba(10, 16, 26, 0.92)',
              border: '1.5px solid rgba(212, 175, 55, 0.65)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 24px rgba(212, 175, 55, 0.35)',
              backdropFilter: 'blur(20px)',
              maxWidth: 240,
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 900,
                color: '#fbbf24',
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              ★ CADENCE LOCK
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
              Tonal Center Established
            </div>
          </div>
        </div>
      )}

      {/* Chip Phase 2: Gravity Pull to Tonic DO (Right) */}
      {isPhase2 && (
        <div
          style={{
            position: 'absolute',
            right: 48,
            top: 640,
            zIndex: 20,
            transform: `scale(${badge2Spring}) translateX(${interpolate(
              badge2Spring,
              [0, 1],
              [40, 0]
            )}px)`,
            opacity: badge2Spring,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '14px 22px',
              borderRadius: 20,
              background: 'rgba(10, 16, 26, 0.92)',
              border: '1.5px solid rgba(16, 185, 129, 0.65)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 24px rgba(16, 185, 129, 0.35)',
              backdropFilter: 'blur(20px)',
              maxWidth: 240,
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 900,
                color: '#34d399',
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              ★ MAGNETIC GRAVITY
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
              Stepwise Resolution to DO
            </div>
          </div>
        </div>
      )}

      {/* Chip Phase 3: Journey & Mastery Analytics (Left) */}
      {isPhase3 && (
        <div
          style={{
            position: 'absolute',
            left: 48,
            top: 560,
            zIndex: 20,
            transform: `scale(${badge3Spring}) translateX(${interpolate(
              badge3Spring,
              [0, 1],
              [-40, 0]
            )}px)`,
            opacity: badge3Spring,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '14px 22px',
              borderRadius: 20,
              background: 'rgba(10, 16, 26, 0.92)',
              border: '1.5px solid rgba(168, 85, 247, 0.65)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 24px rgba(168, 85, 247, 0.35)',
              backdropFilter: 'blur(20px)',
              maxWidth: 240,
            }}
          >
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 900,
                color: '#c084fc',
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              ★ REAL PROGRESSION
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
              Every Degree Mapped & Measured
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
