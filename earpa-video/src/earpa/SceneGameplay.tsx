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
import { Harp3DCanvas, LeverFlipEvent, PluckEvent } from './Harp3DCanvas';

// Scene 4 runs from global frame 765 to 1065 (300 frames: 0..300)
const GAMEPLAY_PLUCKS: PluckEvent[] = [
  // Path 1: Single Notes & Dyads (local 20, 35)
  { stringNum: 1, startFrame: 20, amplitude: 0.021 },
  { stringNum: 5, startFrame: 35, amplitude: 0.021 },
  // Path 2: Melodic Reel (local 78..127)
  { stringNum: 1, startFrame: 78, amplitude: 0.020 },
  { stringNum: 2, startFrame: 85, amplitude: 0.020 },
  { stringNum: 3, startFrame: 92, amplitude: 0.020 },
  { stringNum: 5, startFrame: 99, amplitude: 0.022 },
  { stringNum: 6, startFrame: 106, amplitude: 0.022 },
  { stringNum: 5, startFrame: 113, amplitude: 0.020 },
  { stringNum: 3, startFrame: 120, amplitude: 0.020 },
  { stringNum: 8, startFrame: 127, amplitude: 0.024 },
  // Path 3: Lever Modulations (local 145..183)
  { stringNum: 3, startFrame: 145, amplitude: 0.020 },
  { stringNum: 3, startFrame: 158, amplitude: 0.024 },
  { stringNum: 4, startFrame: 170, amplitude: 0.020 },
  { stringNum: 4, startFrame: 183, amplitude: 0.025 },
];

const GAMEPLAY_LEVERS: LeverFlipEvent[] = [
  { leverNum: 3, flipFrame: 155 }, // E-flat -> E natural
  { leverNum: 4, flipFrame: 180 }, // F -> F sharp (Blue band lever!)
  { leverNum: 6, flipFrame: 195 }, // A-flat -> A natural
  { leverNum: 7, flipFrame: 210 }, // B-flat -> B natural
];

const PATH_CARDS = [
  {
    id: '01',
    title: 'SINGLE NOTE & DYADS',
    badge: '68 BALANCED LEVELS',
    sanctuary: 'Green Celtic Coastal Sanctuary',
    desc: 'Master individual scale degrees & harmonic intervals with 90% mastery gates.',
    tabImg: 'textures/real/verified_tab_single_green_phone.png',
    mapImg: 'textures/real/verified_realm_coastal_roadmap_phone.png',
    accent: '#10b981',
    enterFrame: 8,
  },
  {
    id: '02',
    title: 'MELODIC SEQUENCES',
    badge: '150+ BALANCED LEVELS',
    sanctuary: 'Glacial Arctic Fjord Sanctuary',
    desc: 'Play back 2, 3, and 4-note Celtic motifs, arpeggios, and fast melodic reels by ear.',
    tabImg: 'textures/real/verified_tab_melody_blue_phone.png',
    mapImg: 'textures/real/verified_realm_arctic_roadmap_phone.png',
    accent: '#38bdf8',
    enterFrame: 65,
  },
  {
    id: '03',
    title: 'LEVER & MODAL MODULATIONS',
    badge: 'E♭ • C • B♭ LUTHIER TUNINGS',
    sanctuary: 'Sandstone Canyon Sanctuary',
    desc: 'Flip real 3D Camac sharping levers to shift modes and hear half-step modulations.',
    tabImg: 'textures/real/verified_tab_levers_orange_phone.png',
    mapImg: 'textures/real/verified_realm_canyon_roadmap_phone.png',
    accent: '#f59e0b',
    enterFrame: 135,
  },
];

export const SceneGameplay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic multi-directional 3D camera sweep zooming into the gleaming silver/red/blue Camac levers
  const isLeverFocus = frame >= 135;
  const theta = interpolate(frame, [0, 135, 235], [-0.55, 1.08, 1.42]);
  const phi = interpolate(frame, [0, 135, 235], [1.44, 1.24, 1.34]);
  const radius = interpolate(frame, [0, 135, 185, 235], [2.42, 2.22, 1.88, 2.02]);
  const targetY = interpolate(frame, [0, 135, 185, 235], [0.46, 0.48, 0.56, 0.52]);
  const tiltX = interpolate(frame, [0, 135, 235], [-0.05, 0.06, -0.04]);
  const tiltZ = interpolate(frame, [0, 135, 235], [0.04, -0.05, 0.03]);

  // XP DigitRoll counter (320 -> 500 XP between frame 120 and 220)
  const xpValue = Math.round(
    interpolate(frame, [120, 220], [320, 500], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#060a12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Ambient Triptych Sanctuary Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 75% 45%, rgba(245, 158, 11, 0.22) 0%, rgba(56, 189, 248, 0.14) 42%, rgba(6, 10, 18, 0.98) 82%)',
        }}
      />

      {/* Top Header Strip */}
      <div
        style={{
          position: 'absolute',
          top: 42,
          left: 72,
          right: 72,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.55)',
            color: '#34d399',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          04 // 3 COMPLETE CURRICULUM PATHS • 220+ LEVELS • REAL 3D LEVERS
        </div>

        {/* Daily Habit & Rolling XP Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(245, 158, 11, 0.16)',
            border: '1px solid rgba(245, 158, 11, 0.55)',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 15,
            fontWeight: 800,
            color: '#fbbf24',
          }}
        >
          <span>⏱ 10 MINUTES A DAY</span>
          <span>•</span>
          <span style={{ color: '#ffffff' }}>STAGE 1 XP: {xpValue} / 500 XP</span>
        </div>
      </div>

      {/* LEFT & CENTER STAGE: 3-Column Triptych Deal of the 3 Real Uncropped Curriculum Paths */}
      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 112,
          width: 1160,
          height: 850,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          zIndex: 8,
        }}
      >
        {PATH_CARDS.map((card, idx) => {
          const dealSpring = spring({
            frame: frame - card.enterFrame,
            fps,
            config: { damping: 14, stiffness: 135, mass: 0.85 },
          });
          const isHighlighted =
            (idx === 0 && frame < 72) ||
            (idx === 1 && frame >= 72 && frame < 148) ||
            (idx === 2 && frame >= 148);

          // Toggle between Tab UI view and Winding Trail Roadmap view mid-scene so viewer sees BOTH uncropped!
          const showRoadmap = frame >= card.enterFrame + 38 && frame < card.enterFrame + 105;

          return (
            <div
              key={card.id}
              style={{
                borderRadius: 24,
                padding: '18px 18px',
                background: 'rgba(13, 20, 33, 0.92)',
                border: `2px solid ${
                  isHighlighted ? card.accent : 'rgba(255, 255, 255, 0.12)'
                }`,
                boxShadow: isHighlighted
                  ? `0 24px 60px ${card.accent}38`
                  : '0 18px 40px rgba(0,0,0,0.55)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transform: `translateY(${interpolate(dealSpring, [0, 1], [90, 0])}px) scale(${
                  isHighlighted ? 1.02 : 0.985
                })`,
                opacity: dealSpring,
              }}
            >
              {/* Card Header */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      fontWeight: 800,
                      color: card.accent,
                      letterSpacing: 1.4,
                    }}
                  >
                    PATH {card.id}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: `${card.accent}24`,
                      border: `1px solid ${card.accent}`,
                      color: '#ffffff',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 21,
                    fontWeight: 900,
                    color: '#f8fafc',
                    letterSpacing: -0.3,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#94a3b8',
                    marginTop: 4,
                    lineHeight: 1.35,
                  }}
                >
                  {card.desc}
                </div>
              </div>

              {/* Dual-Preview Uncropped Phone Showcase (Main Tab + Winding Trail Map) */}
              <div
                style={{
                  position: 'relative',
                  height: 560,
                  marginTop: 12,
                  borderRadius: 18,
                  background: 'rgba(7, 11, 18, 0.85)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Img
                  src={staticFile(showRoadmap ? card.mapImg : card.tabImg)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: 12,
                  }}
                />
                {/* Floating View Mode Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    right: 14,
                    padding: '5px 12px',
                    borderRadius: 8,
                    background: 'rgba(7, 11, 18, 0.88)',
                    border: `1px solid ${card.accent}`,
                    color: card.accent,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {showRoadmap ? '🗺 WINDING TRAIL MAP' : '📱 LIVE SANCTUARY UI'}
                </div>
              </div>

              {/* Footer Biome Label */}
              <div
                style={{
                  marginTop: 10,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  color: '#cbd5e1',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{card.sanctuary}</span>
                <span style={{ color: card.accent, fontWeight: 800 }}>★ 90% GATE</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT STAGE: Live 3D Celtic Harp with Real Camac Sharping Lever Flips (+1.75 rad) */}
      <div
        style={{
          position: 'absolute',
          right: 54,
          top: 112,
          width: 600,
          height: 850,
          borderRadius: 28,
          background: 'rgba(11, 17, 29, 0.88)',
          border: `2px solid ${
            isLeverFocus ? 'rgba(245, 158, 11, 0.7)' : 'rgba(212, 175, 55, 0.35)'
          }`,
          boxShadow: '0 26px 70px rgba(0,0,0,0.65)',
          overflow: 'hidden',
          zIndex: 7,
        }}
      >
        <Harp3DCanvas
          width={600}
          height={850}
          theta={theta}
          phi={phi}
          radius={radius}
          targetY={targetY}
          fov={33}
          pluckEvents={GAMEPLAY_PLUCKS}
          leverEvents={GAMEPLAY_LEVERS}
          harpScale={0.73}
          tiltX={tiltX}
          tiltZ={tiltZ}
        />

        {/* Top Overlay inside 3D Harp Stage */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 22,
            right: 22,
            padding: '12px 16px',
            borderRadius: 14,
            background: 'rgba(7, 11, 18, 0.84)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                color: '#fbbf24',
                fontWeight: 800,
                letterSpacing: 1.4,
              }}
            >
              LIVE 3D CAMAC LEVER KINEMATICS
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
              {frame >= 200
                ? 'Lever 4 (F → F♯) Engaged (+1.75 rad)'
                : frame >= 170
                ? 'Lever 3 (E♭ → E♮) Engaged (+1.75 rad)'
                : 'Open E♭ Major Luthier Base Tuning'}
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: isLeverFocus ? '#f59e0b' : 'rgba(255,255,255,0.1)',
              color: isLeverFocus ? '#070b12' : '#f8fafc',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {isLeverFocus ? 'LEVER SNAP UP' : '360° LIVE GLB'}
          </div>
        </div>

        {/* Bottom Customization & XP Bar Overlay inside 3D Stage */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 22,
            right: 22,
            padding: '14px 18px',
            borderRadius: 16,
            background: 'rgba(7, 11, 18, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              fontWeight: 800,
              color: '#38bdf8',
              marginBottom: 8,
            }}
          >
            <span>CUSTOM DEGREE DRILLS & OCTAVE RANGES</span>
            <span style={{ color: '#fbbf24' }}>{xpValue} / 500 XP</span>
          </div>
          <div
            style={{
              width: '100%',
              height: 10,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(xpValue / 500) * 100}%`,
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 50%, #fbbf24 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
