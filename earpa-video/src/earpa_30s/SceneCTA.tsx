import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance spring
  const logoSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });

  // Text slam spring
  const textSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 140 },
  });

  // Badge entrance
  const badgeSpring = spring({
    frame: frame - 75,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 110 },
  });

  // Radiant aura pulse
  const auraPulse = Math.sin(frame * 0.1) * 0.2 + 0.8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070a08',
        overflow: 'hidden',
        perspective: '1200px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/voiceover/scene_5_cta.mp3')} />
      <Audio src={staticFile('audio/impact-cine.mp3')} volume={0.6} />
      {frame >= 70 && <Audio src={staticFile('audio/sparkle.mp3')} volume={0.5} />}

      {/* Deep Obsidian Backdrop with Subtle Sanctuary Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.25,
          filter: 'blur(8px)',
          transform: `scale(${interpolate(frame, [0, 192], [1.0, 1.1])})`,
        }}
      >
        <Img
          src={staticFile('textures/EARPA_01_Green_Celtic_Sanctuary.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Radiant Golden Glow in Center */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '700px',
          height: '700px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)',
          opacity: auraPulse,
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Center Column */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {/* Floating 3D Harp Emblem */}
        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: 'rgba(20, 28, 22, 0.85)',
            border: '3px solid rgba(212, 175, 55, 0.8)',
            boxShadow:
              '0 0 50px rgba(212, 175, 55, 0.4), inset 0 0 30px rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
            transform: `scale(${interpolate(logoSpring, [0, 1], [0.5, 1])}) rotateY(${interpolate(
              frame,
              [0, 192],
              [-15, 15]
            )}deg)`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <Img
            src={staticFile('textures/v9_3_full_harp_lever_side.png')}
            style={{ width: '85%', height: '85%', objectFit: 'contain' }}
          />
        </div>

        {/* Master Headline: Stop Hesitating. */}
        <div
          style={{
            opacity: interpolate(textSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(textSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: '20px',
              textTransform: 'uppercase',
              letterSpacing: '6px',
              color: '#d4af37',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            The Gateway To Effortless Improvisation
          </div>
          <h1
            style={{
              fontSize: '84px',
              fontWeight: 900,
              letterSpacing: '12px',
              color: '#ffffff',
              margin: '0 0 16px 0',
              textShadow: '0 0 40px rgba(212, 175, 55, 0.5), 0 4px 20px rgba(0,0,0,0.9)',
            }}
          >
            EARPA
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#e2e8f0',
              fontWeight: 600,
              margin: '0 auto 36px auto',
              maxWidth: '820px',
              lineHeight: 1.35,
            }}
          >
            Stop guessing. Unlock true confidence and start improvising freely by ear.
          </p>
        </div>

        {/* CTA Badges & URL Lockup */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(badgeSpring, [0, 1], [0.9, 1])})`,
          }}
        >
          <div
            style={{
              padding: '18px 48px',
              borderRadius: '50px',
              background:
                'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#0f172a',
              fontSize: '28px',
              fontWeight: 900,
              letterSpacing: '2px',
              boxShadow: '0 10px 40px rgba(234, 179, 8, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            earpa.app
          </div>

          <div
            style={{
              fontSize: '16px',
              color: '#94a3b8',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Available on iOS · Android · Web PWA · Free Beta
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
