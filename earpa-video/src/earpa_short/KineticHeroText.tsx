import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface KineticHeroTextProps {
  prefix?: string;
  hero: string;
  suffix?: string;
  accentColor?: string;
  heroColor?: string;
  startFrame: number;
  endFrame: number;
  top?: number;
  bottom?: number;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
}

export const KineticHeroText: React.FC<KineticHeroTextProps> = ({
  prefix,
  hero,
  suffix,
  accentColor = '#fbbf24',
  heroColor = '#ffffff',
  startFrame,
  endFrame,
  top = 48,
  bottom,
  align = 'center',
  maxWidth = 920,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  // Snappy physical spring entrance
  const enterSpring = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.8 },
  });

  // Smooth exit fade out
  const exitSpring = spring({
    frame: frame - (endFrame - 8),
    fps,
    config: { damping: 14, stiffness: 150 },
  });

  const scale = interpolate(enterSpring, [0, 1], [0.88, 1.0]) * interpolate(exitSpring, [0, 1], [1, 0.92]);
  const opacity = interpolate(enterSpring, [0, 1], [0, 1]) * interpolate(exitSpring, [0, 1], [1, 0]);
  const translateY = interpolate(enterSpring, [0, 1], [20, 0]) + interpolate(exitSpring, [0, 1], [0, -16]);

  const alignItems = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const textAlign = align;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: bottom === undefined ? top : undefined,
        bottom: bottom !== undefined ? bottom : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems,
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        paddingLeft: 48,
        paddingRight: 48,
      }}
    >
      <div
        style={{
          maxWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems,
          textAlign,
        }}
      >
        {/* 1. Prefix Line (Clean, modern, smaller sans) */}
        {prefix && (
          <div
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: 26,
              fontWeight: 600,
              color: '#cbd5e1',
              letterSpacing: 1.1,
              marginBottom: 3,
              textTransform: 'lowercase',
              textShadow: '0 2px 12px rgba(0,0,0,0.85)',
            }}
          >
            {prefix}
          </div>
        )}

        {/* 2. HERO PUNCH WORD (Massive, ultra-bold, tight tracking) */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: -2.2,
            lineHeight: 0.95,
            color: heroColor,
            textTransform: 'uppercase',
            textShadow: `0 4px 24px rgba(0,0,0,0.95), 0 0 32px ${accentColor}44`,
          }}
        >
          {hero}
        </div>

        {/* 3. Suffix Line (Clean, modern sans) */}
        {suffix && (
          <div
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: 24,
              fontWeight: 600,
              color: '#94a3b8',
              letterSpacing: 0.9,
              marginTop: 4,
              textShadow: '0 2px 12px rgba(0,0,0,0.85)',
            }}
          >
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};
