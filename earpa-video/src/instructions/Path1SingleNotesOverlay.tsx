import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import timelineData from './timeline_path1_walkthrough.json';

export const Path1SingleNotesOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentSec = frame / fps;
  let activeBeatIndex = 0;
  for (let i = 0; i < timelineData.length; i++) {
    if (currentSec >= timelineData[i].start) {
      activeBeatIndex = timelineData[i].beat;
    }
  }

  const beatMeta = timelineData[activeBeatIndex] || timelineData[0];
  const beatStartFrame = Math.round(beatMeta.start * fps);
  const localFrame = Math.max(0, frame - beatStartFrame);

  // Smooth entrance springs for badges
  const badgeSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 160 },
  });

  // Beat 0 Law Card entrance and exit
  const lawCardEnter = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  const lawCardExit = interpolate(
    frame,
    [410, 445],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lawCardOpacity = lawCardEnter * lawCardExit;
  const lawCardScale = interpolate(lawCardEnter, [0, 1], [0.92, 1.0]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent', overflow: 'hidden' }}>
      {/* ===================================================================
          BEAT 0 OVERLAY: Alain Benbassat Tonal Gravitation Law Card
          (Frames 15 to 445 = 0.5s to 14.8s) Matching user uploaded photo
         =================================================================== */}
      {activeBeatIndex === 0 && lawCardOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 680,
            left: 120,
            right: 120,
            opacity: lawCardOpacity,
            transform: `scale(${lawCardScale})`,
            background: 'linear-gradient(135deg, rgba(6, 40, 28, 0.94) 0%, rgba(2, 22, 15, 0.97) 100%)',
            backdropFilter: 'blur(24px)',
            borderRadius: 24,
            border: '1.5px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(16, 185, 129, 0.25)',
            padding: '28px 32px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 2,
                color: '#34d399',
                textTransform: 'uppercase',
              }}
            >
              ALAIN BENBASSAT LAW
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: '#ffffff',
                textTransform: 'uppercase',
                opacity: 0.85,
              }}
            >
              TONAL GRAVITATION
            </div>
          </div>

          {/* Row 1: Note F -> Pull Down */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px 18px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5 }}>
                NOTE F → PULL DOWN
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 3 }}>
                Subdominant ache falling through E, D to C
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#38bdf8',
                fontWeight: 900,
                padding: '4px 10px',
                background: 'rgba(56, 189, 248, 0.15)',
                borderRadius: 8,
              }}
            >
              ↓
            </div>
          </div>

          {/* Row 2: Note C : Tonic Anchor (Highlighted Home Base) */}
          <div
            style={{
              background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)',
              borderRadius: 14,
              border: '1.5px solid rgba(52, 211, 153, 0.8)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              padding: '16px 18px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: 0.5 }}>
                NOTE C : TONIC ANCHOR
              </div>
              <div style={{ fontSize: 14, color: '#a7f3d0', marginTop: 3, fontWeight: 500 }}>
                Home base of perfect acoustic resolution
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                color: '#fbbf24',
                fontWeight: 900,
                padding: '4px 10px',
                background: 'rgba(251, 191, 36, 0.2)',
                borderRadius: 8,
              }}
            >
              ★
            </div>
          </div>

          {/* Row 3: Note B -> Snap Up */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5 }}>
                NOTE B → SNAP UP
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 3 }}>
                Leading tone magnetic snap to C5
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#f97316',
                fontWeight: 900,
                padding: '4px 10px',
                background: 'rgba(249, 115, 22, 0.15)',
                borderRadius: 8,
              }}
            >
              ↑
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          BEATS 1 to 10: Minimalist Floating HUD Capsule Badge (Top Center)
         =================================================================== */}
      {activeBeatIndex > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 145,
            left: '50%',
            transform: `translateX(-50%) scale(${interpolate(badgeSpring, [0, 1], [0.92, 1.0])})`,
            opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
            background: 'linear-gradient(135deg, rgba(6, 36, 25, 0.94) 0%, rgba(2, 20, 14, 0.96) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: '1.5px solid rgba(52, 211, 153, 0.55)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.65), 0 0 20px rgba(16, 185, 129, 0.25)',
            padding: '8px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {/* Glowing Indicator Dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#34d399',
              boxShadow: '0 0 8px #34d399',
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 1.0,
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {beatMeta.badge}
          </div>
        </div>
      )}

      {/* ===================================================================
          BOTTOM SUBTITLE BAR: High Contrast Translucent Capsule
         =================================================================== */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 110,
          right: 110,
          background: 'rgba(3, 16, 10, 0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(52, 211, 153, 0.3)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          padding: '18px 28px',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#f8fafc',
            lineHeight: 1.45,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: 0.3,
          }}
        >
          {beatMeta.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
