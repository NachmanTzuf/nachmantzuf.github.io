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

export const SceneGameplay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fast card deals
  // Card 1: 3D String Plucking (frame 0)
  const c1Spring = spring({ frame, fps, config: { damping: 13, mass: 0.5, stiffness: 140 } });
  // Card 2: Sharping Levers (frame 40)
  const c2Spring = spring({ frame: frame - 40, fps, config: { damping: 13, mass: 0.5, stiffness: 140 } });
  // Card 3: 68-Level Roadmap (frame 80)
  const c3Spring = spring({ frame: frame - 80, fps, config: { damping: 13, mass: 0.5, stiffness: 140 } });
  // Card 4: Live XP & Instant Verdict (frame 120)
  const c4Spring = spring({ frame: frame - 120, fps, config: { damping: 13, mass: 0.5, stiffness: 140 } });

  // Rotating positive verdict text
  const verdicts = [
    'SPOT ON!',
    'PURE RESONANCE!',
    'GOLDEN EAR!',
    'HARMONIC MATCH!',
    'FLAWLESS!',
  ];
  const verdictIndex = Math.min(verdicts.length - 1, Math.floor(frame / 40));
  const activeVerdict = verdicts[verdictIndex];

  // XP Counter animation
  const xpCounter = Math.min(
    500,
    Math.round(interpolate(frame, [120, 190], [320, 500], { extrapolateLeft: 'clamp' }))
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0c0f16',
        overflow: 'hidden',
        perspective: '1400px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <Audio src={staticFile('audio/voiceover/scene_4_gameplay.mp3')} />
      <Audio src={staticFile('audio/transition-snap.mp3')} volume={0.4} />
      {frame >= 40 && <Audio src={staticFile('audio/pop.mp3')} volume={0.5} />}
      {frame >= 80 && <Audio src={staticFile('audio/whoosh-fast.mp3')} volume={0.4} />}
      {frame >= 120 && <Audio src={staticFile('audio/sparkle.mp3')} volume={0.4} />}

      {/* Dynamic Background with Desert Canyon Sanctuary Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          transform: `scale(${interpolate(frame, [0, 197], [1.05, 1.2])})`,
          filter: 'brightness(0.4) saturate(1.1)',
        }}
      >
        <Img
          src={staticFile('textures/EARPA_03_Desert_Canyon_Sanctuary.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Top Banner: 10 MINUTES A DAY */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '100px',
          right: '100px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '18px',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              color: '#38bdf8',
              fontWeight: 800,
            }}
          >
            Deliberate Daily Micro-Habit
          </div>
          <h1
            style={{
              fontSize: '54px',
              fontWeight: 900,
              color: '#ffffff',
              margin: '4px 0 0 0',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            }}
          >
            Just 10 Minutes A Day.
          </h1>
        </div>

        {/* Live XP Counter Badge */}
        <div
          style={{
            padding: '16px 28px',
            borderRadius: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid #eab308',
            boxShadow: '0 0 30px rgba(234, 179, 8, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase' }}>
              Level Progression
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fef08a' }}>
              {xpCounter} <span style={{ fontSize: '18px', color: '#eab308' }}>/ 500 XP</span>
            </div>
          </div>
          <div
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.25)',
              color: '#4ade80',
              fontWeight: 800,
              fontSize: '15px',
            }}
          >
            {activeVerdict}
          </div>
        </div>
      </div>

      {/* 4 Fast-Paced Dealt Cards in 3D Perspective */}
      <div
        style={{
          position: 'absolute',
          top: '200px',
          left: '100px',
          right: '100px',
          bottom: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          zIndex: 10,
        }}
      >
        {/* Card 1: 3D String Plucking */}
        <div
          style={{
            borderRadius: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            transform: `translateY(${interpolate(c1Spring, [0, 1], [60, 0])}px) rotateY(${interpolate(
              c1Spring,
              [0, 1],
              [-15, 0]
            )}deg)`,
            opacity: interpolate(c1Spring, [0, 1], [0, 1]),
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
            <Img
              src={staticFile('textures/v9_3_crown_joint_closeup.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              PHYSICAL 3D
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Direct String Plucking
            </h3>
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
              Karplus-Strong acoustic physics mapped to real Celtic strings.
            </p>
          </div>
        </div>

        {/* Card 2: Sharping Levers */}
        <div
          style={{
            borderRadius: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            transform: `translateY(${interpolate(c2Spring, [0, 1], [60, 0])}px) rotateY(${interpolate(
              c2Spring,
              [0, 1],
              [-15, 0]
            )}deg)`,
            opacity: interpolate(c2Spring, [0, 1], [0, 1]),
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
            <Img
              src={staticFile('textures/v9_3_levers_silver_closeup.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#c084fc',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              AUTHENTIC LUTHERIE
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Sharping Levers
            </h3>
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
              Real tactile Camac lever flips with modal modulations.
            </p>
          </div>
        </div>

        {/* Card 3: 68-Level Trail Map */}
        <div
          style={{
            borderRadius: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            transform: `translateY(${interpolate(c3Spring, [0, 1], [60, 0])}px) rotateY(${interpolate(
              c3Spring,
              [0, 1],
              [-15, 0]
            )}deg)`,
            opacity: interpolate(c3Spring, [0, 1], [0, 1]),
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
            <Img
              src={staticFile('textures/user_screenshot_grid.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fde047',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              68 BALANCED LEVELS
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Winding Trail Map
            </h3>
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
              Two parallel tracks: single note foundations and melodic reels.
            </p>
          </div>
        </div>

        {/* Card 4: Instant Finger Memory */}
        <div
          style={{
            borderRadius: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            transform: `translateY(${interpolate(c4Spring, [0, 1], [60, 0])}px) rotateY(${interpolate(
              c4Spring,
              [0, 1],
              [-15, 0]
            )}deg)`,
            opacity: interpolate(c4Spring, [0, 1], [0, 1]),
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
            <Img
              src={staticFile('textures/EARPA_01_Green_Celtic_Sanctuary.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#4ade80',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              MUSICAL FLOW
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Instant Finger Memory
            </h3>
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
              Hear the note in your head and strike the exact string without hesitation.
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
