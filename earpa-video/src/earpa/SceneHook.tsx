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

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for headline 1
  const title1Spring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });

  // Entrance spring for headline 2 (punch in at frame 60)
  const title2Spring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 140 },
  });

  // 3D background zoom and tilt
  const bgScale = interpolate(frame, [0, 161], [1.05, 1.25], {
    extrapolateRight: 'clamp',
  });
  const bgTiltY = interpolate(frame, [0, 161], [-4, 6], {
    extrapolateRight: 'clamp',
  });
  const bgTiltX = interpolate(frame, [0, 161], [6, -2], {
    extrapolateRight: 'clamp',
  });

  // Acoustic shockwave rings
  const ringScale1 = interpolate((frame + 15) % 50, [0, 50], [0.6, 2.4]);
  const ringOpacity1 = interpolate((frame + 15) % 50, [0, 50], [0.8, 0]);

  const ringScale2 = interpolate((frame + 40) % 50, [0, 50], [0.6, 2.4]);
  const ringOpacity2 = interpolate((frame + 40) % 50, [0, 50], [0.8, 0]);

  // Frequency spectrum bars animation
  const bars = [42, 68, 85, 110, 95, 130, 88, 70, 55, 90, 115, 75];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0f0d',
        overflow: 'hidden',
        perspective: '1200px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/voiceover/scene_1_hook.mp3')} />
      <Audio src={staticFile('audio/impact-cine.mp3')} volume={0.5} />
      {frame >= 55 && (
        <Audio src={staticFile('audio/whoosh-fast.mp3')} volume={0.4} />
      )}

      {/* 3D Background with Celtic Sanctuary Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          transform: `scale(${bgScale}) rotateX(${bgTiltX}deg) rotateY(${bgTiltY}deg)`,
          transformOrigin: 'center center',
          filter: 'brightness(0.55) contrast(1.15)',
        }}
      >
        <Img
          src={staticFile('textures/EARPA_01_Green_Celtic_Sanctuary.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Radial Vignette & Glow */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(20, 45, 30, 0.4) 0%, rgba(5, 10, 8, 0.85) 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dynamic Floating Harp Model / Screenshot Card */}
      <div
        style={{
          position: 'absolute',
          right: '8%',
          top: '15%',
          width: '520px',
          height: '760px',
          transform: `translateY(${interpolate(frame, [0, 161], [30, -30])}px) rotateY(${interpolate(
            frame,
            [0, 161],
            [-18, -6]
          )}deg) rotateX(${interpolate(frame, [0, 161], [10, 2])}deg)`,
          transformStyle: 'preserve-3d',
          borderRadius: 24,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 175, 55, 0.25)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          overflow: 'hidden',
          backgroundColor: 'rgba(15, 25, 20, 0.65)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Img
          src={staticFile('textures/v9_3_full_harp_lever_side.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: 'scale(1.08)',
          }}
        />

        {/* Pulsing Acoustic Rings radiating from strings */}
        <div
          style={{
            position: 'absolute',
            top: '46%',
            left: '42%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px solid rgba(212, 175, 55, 0.8)',
            transform: `translate(-50%, -50%) scale(${ringScale1})`,
            opacity: ringOpacity1,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '46%',
            left: '42%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px solid rgba(75, 200, 160, 0.7)',
            transform: `translate(-50%, -50%) scale(${ringScale2})`,
            opacity: ringOpacity2,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Kinetic Headline 1: "You practice for hours every week." */}
      <div
        style={{
          position: 'absolute',
          left: '100px',
          top: '260px',
          maxWidth: '820px',
          opacity: interpolate(title1Spring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(title1Spring, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: '20px',
            textTransform: 'uppercase',
            letterSpacing: '5px',
            color: '#d4af37',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#d4af37',
              boxShadow: '0 0 12px #d4af37',
            }}
          />
          The Musician's Blind Spot
        </div>
        <h1
          style={{
            fontSize: '56px',
            lineHeight: 1.15,
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            textShadow: '0 4px 24px rgba(0,0,0,0.8)',
          }}
        >
          You practice your instrument for hours every week.
        </h1>
      </div>

      {/* Kinetic Headline 2 (Punch-in at Frame 55): "When did you last train your ears deliberately?" */}
      {frame >= 50 && (
        <div
          style={{
            position: 'absolute',
            left: '100px',
            top: '460px',
            maxWidth: '840px',
            opacity: interpolate(title2Spring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(title2Spring, [0, 1], [0.85, 1])}) translateY(${interpolate(
              title2Spring,
              [0, 1],
              [30, 0]
            )}px)`,
          }}
        >
          <div
            style={{
              padding: '24px 32px',
              borderRadius: '20px',
              background:
                'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(15, 35, 25, 0.75) 100%)',
              border: '2px solid rgba(212, 175, 55, 0.65)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(212, 175, 55, 0.3)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <h2
              style={{
                fontSize: '46px',
                lineHeight: 1.2,
                fontWeight: 800,
                color: '#fff8db',
                margin: 0,
                textShadow: '0 2px 20px rgba(0,0,0,0.8)',
              }}
            >
              When did you last train your ears{' '}
              <span style={{ color: '#ffd700', textDecoration: 'underline' }}>
                deliberately?
              </span>
            </h2>
          </div>
        </div>
      )}

      {/* Live Audio Frequency Spectrum Graphic */}
      <div
        style={{
          position: 'absolute',
          left: '100px',
          bottom: '80px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          height: '60px',
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp' }),
        }}
      >
        {bars.map((baseH, i) => {
          const wave = Math.sin((frame + i * 8) * 0.25) * 22;
          const height = Math.max(12, baseH * 0.4 + wave);
          return (
            <div
              key={i}
              style={{
                width: '8px',
                height: `${height}px`,
                borderRadius: '4px',
                backgroundColor: i % 2 === 0 ? '#d4af37' : '#4bc8a0',
                boxShadow: `0 0 10px ${i % 2 === 0 ? '#d4af37' : '#4bc8a0'}`,
              }}
            />
          );
        })}
        <span
          style={{
            marginLeft: '14px',
            fontSize: '14px',
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Raw Auditory Perception
        </span>
      </div>
    </AbsoluteFill>
  );
};
