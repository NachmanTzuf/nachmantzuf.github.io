import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
  themeColor: string;
  themeGlow: string;
  accentColor: string;
  localFrame: number;
}

export const AlainBenbassatPaperCard: React.FC<Props> = ({
  themeColor,
  themeGlow,
  accentColor,
  localFrame,
}) => {
  const { fps } = useVideoConfig();

  // Floating 3D card entrance
  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  // Subtle floating levitation bobbing
  const bobY = Math.sin(localFrame * 0.08) * 6;
  const cardTilt = Math.sin(localFrame * 0.05) * 1.5;

  return (
    <div
      style={{
        position: 'absolute',
        top: '20%',
        left: 20,
        right: 20,
        padding: '24px 22px',
        borderRadius: 28,
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(9, 18, 28, 0.92) 65%, rgba(6, 12, 19, 0.98) 100%)',
        backdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(255, 255, 255, 0.24)',
        boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px ${themeGlow}`,
        transform: `translateY(${(1 - cardSpring) * 40 + bobY}px) rotate(${cardTilt}deg)`,
        opacity: cardSpring,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        zIndex: 30,
      }}
    >
      {/* Top Academic Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            padding: '4px 12px',
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${accentColor}`,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          COGNITIVE AUDITORY SCIENCE
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255, 255, 255, 0.55)' }}>
          ALAIN BENBASSAT (1992)
        </span>
      </div>

      {/* Main Paper Title */}
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }}>
          Functional Tonal Gravity
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginTop: 4 }}>
          Tonal Centering vs. Isolated Interval Hunting
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Method 1: Traditional Intervals */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 16,
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171' }}>
              ✕ TRADITIONAL INTERVALS
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              Guessing distances in a tonal vacuum
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 8px',
              borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
            }}
          >
            23% RETENTION
          </span>
        </div>

        {/* Method 2: Alain Benbassat Functional Method */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 16,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: `1.5px solid ${themeColor}`,
            boxShadow: `0 0 20px ${themeGlow}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
              ✓ TONAL ANCHOR ENGINE
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              Grounding every pitch relative to Tonic C
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 8px',
              borderRadius: 8,
              backgroundColor: themeColor,
              color: '#000000',
            }}
          >
            97% REFLEX
          </span>
        </div>
      </div>

      {/* Core Pedagogical Axiom */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: themeColor,
            boxShadow: `0 0 10px ${themeColor}`,
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5 }}>
          "Every note carries an unmistakable physical pull homeward."
        </span>
      </div>
    </div>
  );
};
