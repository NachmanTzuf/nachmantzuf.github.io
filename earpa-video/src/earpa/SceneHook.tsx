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
import { Harp3DCanvas, PluckEvent } from './Harp3DCanvas';

const HOOK_PLUCKS: PluckEvent[] = [
  // Live human-played Celtic harp solo run (0.0s to 2.4s)
  { stringNum: 5, startFrame: 0, amplitude: 0.026 },  // G4 opening breath
  { stringNum: 8, startFrame: 10, amplitude: 0.028 }, // C5 Red
  { stringNum: 8, startFrame: 18, amplitude: 0.025 }, // D5
  { stringNum: 8, startFrame: 26, amplitude: 0.027 }, // E5
  { stringNum: 8, startFrame: 38, amplitude: 0.030 }, // G5 High shimmer peak
  { stringNum: 8, startFrame: 48, amplitude: 0.024 }, // E5
  { stringNum: 8, startFrame: 56, amplitude: 0.023 }, // D5
  { stringNum: 8, startFrame: 64, amplitude: 0.026 }, // C5
  // Grand Resonant Celtic Rolled Chord (frame 66-74)
  { stringNum: 1, startFrame: 66, amplitude: 0.025 }, // C3 / C4 Red
  { stringNum: 2, startFrame: 68, amplitude: 0.022 }, // G3 / D4
  { stringNum: 3, startFrame: 69, amplitude: 0.024 }, // E4
  { stringNum: 5, startFrame: 71, amplitude: 0.025 }, // G4
  { stringNum: 8, startFrame: 73, amplitude: 0.028 }, // C5 Red
  // Subtle countermelody continuing under voiceover
  { stringNum: 3, startFrame: 82, amplitude: 0.018 },  // E4
  { stringNum: 5, startFrame: 98, amplitude: 0.019 },  // G4
  { stringNum: 6, startFrame: 114, amplitude: 0.018 }, // A4
  { stringNum: 8, startFrame: 130, amplitude: 0.020 }, // C5
  { stringNum: 8, startFrame: 146, amplitude: 0.020 }, // E5
  { stringNum: 8, startFrame: 162, amplitude: 0.018 }, // D5
  { stringNum: 8, startFrame: 178, amplitude: 0.019 }, // C5
  { stringNum: 6, startFrame: 194, amplitude: 0.017 }, // A4
  { stringNum: 5, startFrame: 210, amplitude: 0.018 }, // G4
  { stringNum: 3, startFrame: 226, amplitude: 0.017 }, // E4
  { stringNum: 4, startFrame: 242, amplitude: 0.018 }, // F4 Cyan
  { stringNum: 5, startFrame: 258, amplitude: 0.019 }, // G4
  { stringNum: 2, startFrame: 274, amplitude: 0.018 }, // D4
  { stringNum: 1, startFrame: 286, amplitude: 0.022 }, // C4 Red
];

const LINE_1 = "You've always wanted to play by ear, and improvise solos that just feel right and flow naturally out of your instrument.";
const LINE_2 = "Truth is, that's not magic... it's a trained ear.";
const LINE_3_PREFIX = "You practice every day, but when did you train your ears ";
const LINE_3_ACCENT = "DELIBERATELY?";

const CAROUSEL_CARDS = [
  {
    startFrame: 68,
    endFrame: 120,
    img: 'textures/real/verified_physical_string_pluck_guess.png',
    badge: 'LIVE 3D HARP • REAL-TIME STRING PLUCK',
    accent: '#ef4444',
  },
  {
    startFrame: 120,
    endFrame: 172,
    img: 'textures/real/verified_resolution_walk_active.png',
    badge: 'MAGNETIC GRAVITY WALK • 4 → 3 → 2 → 1',
    accent: '#38bdf8',
  },
  {
    startFrame: 172,
    endFrame: 224,
    img: 'textures/real/verified_melody_tab_standalone_card.png',
    badge: 'NEW MELODY STUDIO • BY-EAR PHRASING',
    accent: '#34d399',
  },
  {
    startFrame: 224,
    endFrame: 276,
    img: 'textures/real/verified_journey_sunglasses_tab.png',
    badge: 'POLARIZED JOURNEY • MASTERY ANALYTICS',
    accent: '#a855f7',
  },
  {
    startFrame: 276,
    endFrame: 328,
    img: 'textures/real/verified_levers_tab_standalone_card.png',
    badge: 'CAMAC SHARPING LEVERS • MODAL SHIFTS',
    accent: '#f59e0b',
  },
  {
    startFrame: 328,
    endFrame: 400,
    img: 'textures/real/verified_realm_coastal_roadmap_phone.png',
    badge: '220+ GUIDED LEVELS • 10 MIN A DAY',
    accent: '#10b981',
  },
];

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic 3D Harp Choreography (Come, Pop, and Go!)
  // Hero centerpiece for solo (0-190), swoops/flies out in 3D depth around 220, pops back at transition whip (380-400)
  const harpFlyOut = spring({
    frame: frame - 215,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.9 },
  });
  const harpReEnter = spring({
    frame: frame - 378,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Calculate 3D harp transform & visibility
  const harpScale = interpolate(harpFlyOut, [0, 1], [0.73, 0.42]) * (1 - harpFlyOut * 0.9 + harpReEnter * 0.9);
  const harpTranslateX = interpolate(harpFlyOut, [0, 1], [0, 680]) - interpolate(harpReEnter, [0, 1], [0, 680]);
  const harpTranslateZ = interpolate(harpFlyOut, [0, 1], [0, -600]);
  const harpOpacity = interpolate(harpFlyOut, [0, 0.85, 1], [1, 0.4, 0]) + interpolate(harpReEnter, [0, 1], [0, 1]);

  const rushIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 75, mass: 0.9 },
  });
  const radius = interpolate(rushIn, [0, 1], [2.85, 2.26]);
  const theta = interpolate(frame, [0, 200, 400], [-0.60, 0.88, 1.70]);
  const phi = interpolate(frame, [0, 200, 400], [1.46, 1.20, 1.36]);
  const tiltX = interpolate(frame, [0, 200, 400], [0.07, -0.06, 0.05]);
  const tiltZ = interpolate(frame, [0, 200, 400], [-0.06, 0.06, -0.04]);

  // Conversational Typewriter Line reveals
  const chars1 = Math.floor(
    interpolate(frame, [72, 185], [0, LINE_1.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const chars2 = Math.floor(
    interpolate(frame, [195, 255], [0, LINE_2.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const chars3 = Math.floor(
    interpolate(frame, [265, 330], [0, LINE_3_PREFIX.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const accentScale = spring({
    frame: frame - 330,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // Current active carousel card index
  const activeCardIndex = Math.min(
    CAROUSEL_CARDS.length - 1,
    Math.max(
      0,
      CAROUSEL_CARDS.findIndex((c) => frame >= c.startFrame && frame < c.endFrame)
    )
  );
  const activeCard = CAROUSEL_CARDS[activeCardIndex];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Ambient Sanctuary Stage Lighting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 72% 46%, rgba(212, 175, 55, 0.22) 0%, rgba(16, 185, 129, 0.10) 36%, rgba(7, 11, 18, 0.98) 78%)',
        }}
      />

      {/* Volumetric Diagonal Sunbeam */}
      <div
        style={{
          position: 'absolute',
          top: -180,
          right: -120,
          width: 1100,
          height: 900,
          background:
            'linear-gradient(215deg, rgba(255, 240, 200, 0.18) 0%, rgba(212, 175, 55, 0.06) 45%, transparent 75%)',
          transform: 'rotate(-18deg)',
          pointerEvents: 'none',
        }}
      />

      {/* Architectural Blueprint Grid */}
      <svg
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0, opacity: 0.28, pointerEvents: 'none' }}
      >
        <defs>
          <pattern id="hookGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="rgba(212,175,55,0.16)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#hookGrid)" />
        <circle
          cx={1360}
          cy={520}
          r={340}
          fill="none"
          stroke="rgba(212, 175, 55, 0.35)"
          strokeWidth={1.5}
          strokeDasharray="8 8"
        />
      </svg>

      {/* 3. RIGHT HERO STAGE: Dynamic Free-Floating V9.3 3D Celtic Harp (Pops In, Swoops Out) */}
      <div
        style={{
          position: 'absolute',
          right: -40,
          top: 0,
          width: 1120,
          height: 1020,
          transform: `translateX(${harpTranslateX}px) translateZ(${harpTranslateZ}px)`,
          opacity: harpOpacity,
          transition: 'opacity 0.2s ease',
          pointerEvents: harpOpacity <= 0.05 ? 'none' : 'auto',
          zIndex: 5,
        }}
      >
        <Harp3DCanvas
          width={1120}
          height={1020}
          theta={theta}
          phi={phi}
          radius={radius}
          targetY={0.48}
          fov={34}
          pluckEvents={HOOK_PLUCKS}
          harpScale={harpScale}
          tiltX={tiltX}
          tiltZ={tiltZ}
        />
      </div>

      {/* Live 3D String Telemetry Floating Badge */}
      <div
        style={{
          position: 'absolute',
          right: 84,
          top: 96,
          padding: '10px 18px',
          borderRadius: 12,
          background: 'rgba(12, 18, 28, 0.85)',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          color: '#f8fafc',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13,
          letterSpacing: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          zIndex: 10,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: frame < 72 ? '#fbbf24' : frame >= 220 ? '#38bdf8' : '#34d399',
            boxShadow: `0 0 12px ${frame < 72 ? '#fbbf24' : frame >= 220 ? '#38bdf8' : '#34d399'}`,
          }}
        />
        <span>{frame < 72 ? '♫ LIVE CELTIC HARP SOLO' : 'EARPA // DELIBERATE EAR CONDITIONING'}</span>
      </div>

      {/* 4. LEFT STAGE: Typewriter Header + High-Energy 6-Card 3D Perspective Carousel */}
      <div
        style={{
          position: 'absolute',
          left: 76,
          top: 72,
          width: 920,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          zIndex: 12,
        }}
      >
        {/* Top Tag Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 12,
            padding: '7px 18px',
            borderRadius: 999,
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            color: '#fbbf24',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          <span>{frame < 72 ? '♫ LIVE ARTIST IMPROVISATION' : '01 // DELIBERATE EAR TRAINING'}</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span style={{ color: '#34d399' }}>PLAY BY EAR & IMPROVISE</span>
        </div>

        {/* Dynamic Typewriter Editorial Card */}
        <div
          style={{
            padding: '24px 28px',
            borderRadius: 20,
            background: 'rgba(15, 23, 36, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          }}
        >
          {/* Line 1 */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#f8fafc',
              letterSpacing: -0.5,
              minHeight: frame < 195 ? 80 : 'auto',
            }}
          >
            {LINE_1.slice(0, chars1)}
            {frame < 195 && (
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 30,
                  marginLeft: 6,
                  background: '#fbbf24',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>

          {/* Line 2 */}
          {frame >= 195 && (
            <div
              style={{
                marginTop: 12,
                fontSize: 28,
                fontWeight: 800,
                color: '#38bdf8',
                lineHeight: 1.2,
              }}
            >
              {LINE_2.slice(0, chars2)}
            </div>
          )}

          {/* Line 3 with DELIBERATELY Accent */}
          {frame >= 265 && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#ffffff',
              }}
            >
              <span>{LINE_3_PREFIX.slice(0, chars3)}</span>
              {frame >= 330 && (
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: 10,
                    padding: '4px 16px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#070b12',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 900,
                    letterSpacing: 1.5,
                    transform: `scale(${accentScale})`,
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.45)',
                  }}
                >
                  {LINE_3_ACCENT}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 6-CARD 3D PERSPECTIVE CAROUSEL + FLOATING TELEMETRY HUD (Frame 68 onwards) */}
        {frame >= 68 && (
          <div
            style={{
              position: 'relative',
              width: 920,
              height: 480,
              display: 'flex',
              gap: 20,
              perspective: 1200,
            }}
          >
            {/* Active 3D Phone Showcase with Smooth Spring Transitions */}
            <div
              style={{
                width: 290,
                height: 480,
                borderRadius: 24,
                padding: 10,
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                border: `2px solid ${activeCard.accent}`,
                boxShadow: `0 24px 60px ${activeCard.accent}33, 0 16px 32px rgba(0,0,0,0.6)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                transform: 'rotateY(6deg) rotateX(2deg)',
              }}
            >
              <div
                style={{
                  height: 410,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'rgba(7, 11, 18, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Img
                  src={staticFile(activeCard.img)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: 14,
                  }}
                />
              </div>

              {/* Active Card Pill */}
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: `${activeCard.accent}22`,
                  border: `1px solid ${activeCard.accent}`,
                  color: '#ffffff',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  fontWeight: 800,
                  textAlign: 'center',
                  letterSpacing: 1.2,
                }}
              >
                CARD {activeCardIndex + 1} OF 6 • 10 MIN/DAY
              </div>
            </div>

            {/* Companion Telemetry HUD & Frequency Resonance Radar */}
            <div
              style={{
                flex: 1,
                borderRadius: 24,
                padding: '24px 28px',
                background: 'rgba(13, 20, 33, 0.90)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      fontWeight: 800,
                      color: activeCard.accent,
                      letterSpacing: 1.6,
                    }}
                  >
                    FEATURE TELEMETRY
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.16)',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      color: '#34d399',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    LIVE SCREEN
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 23,
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1.25,
                  }}
                >
                  {activeCard.badge}
                </div>
              </div>

              {/* 32-Bar Acoustic Resonance Meter */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    color: '#94a3b8',
                    marginBottom: 8,
                  }}
                >
                  <span>SITKA SPRUCE CAVITY SPECTRUM</span>
                  <span style={{ color: '#fbbf24' }}>44.1 kHz REAL-TIME</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 5,
                    height: 110,
                  }}
                >
                  {Array.from({ length: 32 }).map((_, i) => {
                    const wave1 = Math.sin(frame * 0.22 + i * 0.42) * 0.5 + 0.5;
                    const wave2 = Math.cos(frame * 0.14 - i * 0.28) * 0.5 + 0.5;
                    const h = 16 + (wave1 * 0.65 + wave2 * 0.35) * 85;
                    const isRed = i === 3 || i === 27;
                    const isBlue = i === 13;
                    const barColor = isRed
                      ? '#ef4444'
                      : isBlue
                      ? '#38bdf8'
                      : i % 2 === 0
                      ? activeCard.accent
                      : '#34d399';
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: h,
                          borderRadius: 3,
                          background: barColor,
                          opacity: 0.92,
                          boxShadow: isRed || isBlue ? `0 0 8px ${barColor}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Carousel Navigation Indicators */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  {CAROUSEL_CARDS.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === activeCardIndex ? 28 : 10,
                        height: 8,
                        borderRadius: 999,
                        background: i === activeCardIndex ? activeCard.accent : 'rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    color: '#cbd5e1',
                    fontWeight: 700,
                  }}
                >
                  STEP {activeCardIndex + 1} OF 6
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
