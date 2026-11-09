import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface InstructionTheme {
  primary: string;       // e.g. '#10b981'
  primaryGlow: string;   // e.g. 'rgba(16, 185, 129, 0.45)'
  accent: string;        // e.g. '#34d399'
  bgGradient: string;    // radial gradient string
  trackLabel: string;    // e.g. 'PATH 1 · SINGLE NOTES'
}

interface Props {
  theme: InstructionTheme;
  category: string;
  title: string;
  subtitle: string;
  beatIndex: number;
  totalBeats: number;
  localFrame?: number;
  children: React.ReactNode;
}

export const InstructionLayout: React.FC<Props> = ({
  theme,
  category,
  title,
  subtitle,
  beatIndex,
  totalBeats,
  localFrame = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Smooth entrance for title text at the start of each beat
  const titleSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  // Calculate phone geometry for 100% unclipped visibility
  // Screen is 1080 x 1920
  // Top header ends at ~340px
  // Phone height = 1420px, width = 655px (aspect ratio 393/852 = 0.4612)
  // Left = (1080 - 655) / 2 = 212.5px
  // Top = 360px -> Bottom = 1780px. Leaves 140px clean negative space at bottom!
  const phoneWidth = 655;
  const phoneHeight = 1420;
  const phoneLeft = (1080 - phoneWidth) / 2;
  const phoneTop = 360;

  // Background light sweep
  const sweepX = -800 + ((frame * 7) % 2800);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060a09',
        background: theme.bgGradient,
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 1. Subtle High-Tech Laser Grid Background */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }}
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke={theme.primary} strokeWidth="0.75" />
            <circle cx="80" cy="0" r="1.5" fill={theme.primary} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* 2. Diagonal Laser Streak */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: sweepX,
          width: 1200,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
          transform: 'rotate(-32deg)',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* 3. Upper Kinetic Header (Negative Space Buffer Above Phone) */}
      <div
        style={{
          position: 'absolute',
          top: 52,
          left: 80,
          right: 80,
          height: 270,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          zIndex: 10,
        }}
      >
        {/* Category Pill / Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            alignSelf: 'flex-start',
            padding: '6px 18px',
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.primary}`,
            boxShadow: `0 0 16px ${theme.primaryGlow}`,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: theme.primary,
              boxShadow: `0 0 8px ${theme.primary}`,
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
              color: theme.accent,
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>
        </div>

        {/* Hero Title (Bold 800) */}
        <div
          style={{
            fontSize: 66,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#ffffff',
            transform: `translateY(${(1 - titleSpring) * 16}px)`,
            opacity: titleSpring,
            textShadow: '0 4px 24px rgba(0,0,0,0.8)',
          }}
        >
          {title}
        </div>

        {/* Explanatory Subtext */}
        <div
          style={{
            marginTop: 10,
            fontSize: 23,
            fontWeight: 500,
            lineHeight: 1.35,
            color: '#cbd5e1',
            letterSpacing: '0.01em',
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* 4. Centerpiece: Unclipped Titanium Mobile Phone Device */}
      <div
        style={{
          position: 'absolute',
          left: phoneLeft,
          top: phoneTop,
          width: phoneWidth,
          height: phoneHeight,
          borderRadius: 54,
          padding: 10,
          background: 'linear-gradient(135deg, #71717a 0%, #27272a 35%, #52525b 70%, #18181b 100%)',
          boxShadow: `0 35px 90px rgba(0,0,0,0.85), 0 0 40px ${theme.primaryGlow}`,
          border: '1.5px solid rgba(255,255,255,0.22)',
          zIndex: 5,
        }}
      >
        {/* Inner Phone Screen Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 44,
            overflow: 'hidden',
            backgroundColor: '#090d16',
          }}
        >
          {/* Dynamic Island Cutout */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140,
              height: 34,
              borderRadius: 20,
              backgroundColor: '#000000',
              zIndex: 50,
              boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px',
            }}
          >
            {/* Audio Wave Indicator */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: 8 + 12 * Math.sin((frame + i * 4) * 0.25) * h,
                    borderRadius: 2,
                    backgroundColor: theme.primary,
                  }}
                />
              ))}
            </div>
            {/* Camera Dot */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
              }}
            />
          </div>

          {/* Actual Screen Content */}
          {children}

          {/* Bottom Home Indicator Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 150,
              height: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              zIndex: 50,
            }}
          />
        </div>
      </div>

      {/* 5. Bottom Timeline / Beat Stepper */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 90,
          right: 90,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 10,
        }}
      >
        {/* Beat Progress Indicators */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {Array.from({ length: totalBeats }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                backgroundColor:
                  i === beatIndex
                    ? theme.primary
                    : i < beatIndex
                    ? theme.accent
                    : 'rgba(255, 255, 255, 0.15)',
                boxShadow: i === beatIndex ? `0 0 10px ${theme.primary}` : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Brand & Timing Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 2,
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          <span>EARPA · ALAIN BENBASSAT METHOD</span>
          <span>
            {Math.floor(frame / 30)}s / {Math.floor(durationInFrames / 30)}s
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
