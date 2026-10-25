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

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 100 },
  });

  // Punch spring for "YOU ARE STILL GUESSING" at frame 50
  const punchSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 10, mass: 0.4, stiffness: 160 },
  });

  // Flow killer punch at frame 105
  const flowSpring = spring({
    frame: frame - 100,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 130 },
  });

  // 3D camera pan & tilt
  const rotX = interpolate(frame, [0, 190], [10, -4]);
  const rotY = interpolate(frame, [0, 190], [-12, 10]);
  const zoom = interpolate(frame, [0, 190], [1.0, 1.15]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0c0d12',
        overflow: 'hidden',
        perspective: '1400px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/voiceover/scene_2_problem.mp3')} />
      <Audio src={staticFile('audio/riser-cine.mp3')} volume={0.35} />
      {frame >= 45 && (
        <Audio src={staticFile('audio/whoosh-quick.mp3')} volume={0.4} />
      )}

      {/* Dynamic Background with dark Arctic Fjord mood */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformOrigin: 'center center',
          filter: 'brightness(0.35) saturate(0.8)',
        }}
      >
        <Img
          src={staticFile('textures/EARPA_02_Arctic_Frozen_Sanctuary.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Grid Overlay with Vignette */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(20, 25, 40, 0.2) 0%, rgba(8, 10, 16, 0.9) 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Container with 3D perspective */}
      <div
        style={{
          position: 'absolute',
          inset: '80px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          opacity: interpolate(enterSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enterSpring, [0, 1], [40, 0])}px)`,
        }}
      >
        {/* Left Card: The Hesitation Trap */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px',
            borderRadius: '24px',
            backgroundColor: 'rgba(18, 22, 32, 0.75)',
            border: '1px solid rgba(220, 100, 80, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(220, 80, 60, 0.15)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ff6b6b',
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ff6b6b',
                boxShadow: '0 0 10px #ff6b6b',
              }}
            />
            The Illusion of Accuracy
          </div>

          <h2
            style={{
              fontSize: '44px',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#e2e8f0',
              margin: '0 0 20px 0',
            }}
          >
            Even hitting the right notes...
          </h2>

          {/* Punch Box: "YOU ARE STILL GUESSING" */}
          {frame >= 40 && (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.6)',
                transform: `scale(${interpolate(punchSpring, [0, 1], [0.9, 1])})`,
                opacity: interpolate(punchSpring, [0, 1], [0, 1]),
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: '#ff4d4d',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                You are still guessing.
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#cbd5e1',
                  marginTop: '8px',
                  lineHeight: 1.4,
                }}
              >
                Like stumbling around words, finding notes by accident is not true fluency.
              </div>
            </div>
          )}

          {/* Flow Killer Banner at Frame 100 */}
          {frame >= 95 && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderLeft: '4px solid #f59e0b',
                transform: `translateX(${interpolate(flowSpring, [0, 1], [-30, 0])}px)`,
                opacity: interpolate(flowSpring, [0, 1], [0, 1]),
              }}
            >
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#fbbf24',
                }}
              >
                "That subtle hesitation kills your musical flow."
              </div>
            </div>
          )}
        </div>

        {/* Right Side: 3D Visual Proof Cards & Wavering Audio Graph */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Screenshot Card with Hesitant Pluck indicators */}
          <div
            style={{
              width: '100%',
              height: '420px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              transform: `rotateY(${interpolate(frame, [0, 190], [12, -8])}deg) rotateX(${interpolate(
                frame,
                [0, 190],
                [-6, 6]
              )}deg)`,
              transformStyle: 'preserve-3d',
              position: 'relative',
            }}
          >
            <Img
              src={staticFile('textures/user_screenshot_grid.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Wavering Uncertainty Pulse Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(10,15,25,0.9) 0%, transparent 60%)',
              }}
            />

            {/* Floating Hesitation Meter */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                padding: '16px 20px',
                borderRadius: '14px',
                backgroundColor: 'rgba(15, 20, 30, 0.85)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase' }}>
                  Auditory Certainty Gate
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#f87171' }}>
                  Hesitant • Guessing State
                </div>
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(239, 68, 68, 0.25)',
                  color: '#fca5a5',
                  fontWeight: 800,
                  fontSize: '16px',
                }}
              >
                98% Acc / 0% Flow
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
