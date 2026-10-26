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
import { Harp3DCanvas, PluckEvent } from '../earpa/Harp3DCanvas';

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
    startFrame: 215,
    endFrame: 245,
    img: 'textures/real/app_screen_pluck_guess.png',
    badge: 'LIVE 3D HARP • REAL STRING PLUCKS',
    accent: '#ef4444',
  },
  {
    startFrame: 245,
    endFrame: 275,
    img: 'textures/real/app_screen_resolution_walk.png',
    badge: 'MAGNETIC GRAVITY • 4 → 3 → 2 → 1',
    accent: '#38bdf8',
  },
  {
    startFrame: 275,
    endFrame: 305,
    img: 'textures/real/app_screen_melody_studio.png',
    badge: 'NEW MELODY STUDIO • BY-EAR PHRASING',
    accent: '#34d399',
  },
  {
    startFrame: 305,
    endFrame: 335,
    img: 'textures/real/app_screen_journey_analytics.png',
    badge: 'POLARIZED JOURNEY • MASTERY METRICS',
    accent: '#a855f7',
  },
  {
    startFrame: 335,
    endFrame: 365,
    img: 'textures/real/app_screen_camac_levers.png',
    badge: 'CAMAC SHARPING LEVERS • MODAL SHIFTS',
    accent: '#f59e0b',
  },
  {
    startFrame: 365,
    endFrame: 400,
    img: 'textures/real/app_screen_coastal_roadmap.png',
    badge: '220+ GUIDED LEVELS • 10 MIN A DAY',
    accent: '#10b981',
  },
];

export const SceneHookShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic 3D Harp Choreography (Come, Pop, and Go!)
  // Hero centerpiece for opening solo (0-215), swoops back into depth (215-240),
  // then phone stage takes command of the full center display.
  // Harp re-enters dynamically with an energetic whip (375-400) for scene transition.
  const harpFlyOut = spring({
    frame: frame - 215,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.9 },
  });
  const harpReEnter = spring({
    frame: frame - 375,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Calculate 3D harp transform & visibility (ensuring minimum scale 0.08 to prevent containerRect collapse)
  const baseScaleVal = interpolate(harpFlyOut, [0, 1], [0.82, 0.42]) * (1 - harpFlyOut * 0.92 + harpReEnter * 0.92);
  const harpScale = Math.max(0.08, baseScaleVal);
  const harpTranslateY = interpolate(harpFlyOut, [0, 1], [0, -100]);
  const harpTranslateZ = interpolate(harpFlyOut, [0, 1], [0, -600]);
  const harpOpacity = interpolate(harpFlyOut, [0, 0.85, 1], [1, 0.25, 0]) + interpolate(harpReEnter, [0, 1], [0, 1]);

  const rushIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 75, mass: 0.9 },
  });
  const radius = interpolate(rushIn, [0, 1], [2.85, 2.45]);
  const theta = interpolate(frame, [0, 200, 400], [-0.55, 0.85, 1.70]);
  const phi = interpolate(frame, [0, 200, 400], [1.42, 1.22, 1.35]);
  const tiltX = interpolate(frame, [0, 200, 400], [0.06, -0.05, 0.04]);
  const tiltZ = interpolate(frame, [0, 200, 400], [-0.05, 0.05, -0.03]);

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
  const chars3Prefix = Math.floor(
    interpolate(frame, [265, 335], [0, LINE_3_PREFIX.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const showAccent = frame >= 335;

  // Active Carousel Card in Phone Stage (frames 215 to 400)
  const isPhoneStageActive = frame >= 215 && frame < 380;
  const phoneEntranceSpring = spring({
    frame: frame - 215,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const phoneExitSpring = spring({
    frame: frame - 372,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const activeCardIndex = Math.max(
    0,
    CAROUSEL_CARDS.findIndex((c) => frame >= c.startFrame && frame < c.endFrame)
  );
  const currentCard = CAROUSEL_CARDS[activeCardIndex] || CAROUSEL_CARDS[0];

  const cardLocalFrame = Math.max(0, frame - currentCard.startFrame);
  const cardFlipSpring = spring({
    frame: cardLocalFrame,
    fps,
    config: { damping: 13, stiffness: 150 },
  });
  const phoneRotateY = interpolate(cardFlipSpring, [0, 1], [-14, 0]);
  const phoneScale = interpolate(phoneEntranceSpring, [0, 1], [0.82, 1.0]) * interpolate(phoneExitSpring, [0, 1], [1, 0.75]);
  const phoneOpacity = interpolate(phoneEntranceSpring, [0, 1], [0, 1]) * interpolate(phoneExitSpring, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070b12',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Full-Bleed Warm Sanctuary Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.26) 0%, rgba(56, 189, 248, 0.14) 38%, rgba(7, 11, 18, 0.98) 75%)',
        }}
      />

      {/* Subtle Celtic Golden Portal Rings */}
      <svg
        width={1080}
        height={1920}
        style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}
      >
        <circle
          cx={540}
          cy={880}
          r={420}
          fill="none"
          stroke="rgba(212, 175, 55, 0.45)"
          strokeWidth={1.5}
        />
        <circle
          cx={540}
          cy={880}
          r={510}
          fill="none"
          stroke="rgba(56, 189, 248, 0.25)"
          strokeWidth={1}
          strokeDasharray="8 8"
        />
      </svg>

      {/* 2. TOP HUD: Floating Minimalist Telemetry Bar */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 54,
          right: 54,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(212, 175, 55, 0.16)',
            border: '1px solid rgba(212, 175, 55, 0.55)',
            color: '#fbbf24',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          01 // THE HOOK
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 18px',
            borderRadius: 999,
            background: 'rgba(12, 18, 28, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            color: '#f8fafc',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.4,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: frame < 72 ? '#fbbf24' : frame >= 215 ? '#38bdf8' : '#34d399',
              boxShadow: `0 0 12px ${frame < 72 ? '#fbbf24' : frame >= 215 ? '#38bdf8' : '#34d399'}`,
            }}
          />
          <span>{frame < 72 ? '♫ LIVE CELTIC HARP SOLO' : 'EARPA // DELIBERATE PRACTICE'}</span>
        </div>
      </div>

      {/* 3. TYPEWRITER SCRIPT (Upper Center - Clean Flow) */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 54,
          right: 54,
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 20,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.3,
            textShadow: '0 2px 14px rgba(0,0,0,0.9)',
          }}
        >
          {LINE_1.slice(0, chars1)}
          {chars1 < LINE_1.length && frame >= 72 && (
            <span style={{ color: '#fbbf24', marginLeft: 2 }}>|</span>
          )}
        </div>

        {/* Line 2 */}
        {frame >= 190 && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#38bdf8',
              lineHeight: 1.3,
              textShadow: '0 2px 14px rgba(0,0,0,0.9)',
            }}
          >
            {LINE_2.slice(0, chars2)}
            {chars2 < LINE_2.length && <span style={{ color: '#38bdf8', marginLeft: 2 }}>|</span>}
          </div>
        )}

        {/* Line 3 with Accent */}
        {frame >= 265 && (
          <div
            style={{
              fontSize: 23,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.3,
              textShadow: '0 2px 14px rgba(0,0,0,0.9)',
            }}
          >
            <span>{LINE_3_PREFIX.slice(0, chars3Prefix)}</span>
            {showAccent && (
              <span
                style={{
                  color: '#fbbf24',
                  textDecoration: 'underline',
                  textDecorationColor: '#f59e0b',
                  textUnderlineOffset: '6px',
                  marginLeft: 6,
                  fontWeight: 900,
                }}
              >
                {LINE_3_ACCENT}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. MASTER UNIFIED CENTER STAGE: Free-Floating 3D Celtic Harp (Frames 0-215 & 375-400) */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 140,
          width: 972,
          height: 1540,
          transform: `translateY(${harpTranslateY}px) translateZ(${harpTranslateZ}px)`,
          opacity: harpOpacity,
          pointerEvents: harpOpacity <= 0.05 ? 'none' : 'auto',
          zIndex: 10,
        }}
      >
        <Harp3DCanvas
          width={972}
          height={1540}
          theta={theta}
          phi={phi}
          radius={radius}
          targetY={0.50}
          fov={34}
          pluckEvents={HOOK_PLUCKS}
          harpScale={harpScale}
          tiltX={tiltX}
          tiltZ={tiltZ}
        />
      </div>

      {/* 5. MASTER UNIFIED CENTER STAGE: Smartphone Device Showcase (Frames 215-380) */}
      {isPhoneStageActive && (
        <div
          style={{
            position: 'absolute',
            left: 180,
            width: 720,
            top: 275,
            height: 1410,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 15,
            opacity: phoneOpacity,
            transform: `perspective(1200px) rotateY(${phoneRotateY}deg) scale(${phoneScale})`,
            pointerEvents: 'none',
          }}
        >
          {/* Feature Badge Floating Above Phone */}
          <div
            style={{
              padding: '10px 24px',
              borderRadius: 999,
              background: 'rgba(10, 16, 26, 0.94)',
              border: `1.5px solid ${currentCard.accent}`,
              boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 24px ${currentCard.accent}55`,
              color: currentCard.accent,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 1.5,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              whiteSpace: 'nowrap',
            }}
          >
            <span>FEATURE {activeCardIndex + 1} OF 6</span>
            <span>•</span>
            <span>{currentCard.badge}</span>
          </div>

          {/* Sleek Real iPhone 15 Pro Titanium Frame (Single Phone, No Inception) */}
          <div
            style={{
              width: 720,
              height: 1380,
              borderRadius: 48,
              padding: 8,
              background: 'linear-gradient(145deg, #334155 0%, #1e293b 45%, #0f172a 100%)',
              border: `2px solid ${currentCard.accent}99`,
              boxShadow: `0 35px 90px rgba(0,0,0,0.9), 0 0 45px ${currentCard.accent}33`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Phone Dynamic Island */}
            <div
              style={{
                width: 140,
                height: 26,
                borderRadius: 20,
                background: '#020617',
                margin: '4px auto 6px auto',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e293b' }} />
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#1e293b' }} />
            </div>

            {/* Pure Screen Content: Edge-to-Edge 786x1704 Native App Display */}
            <div
              style={{
                flex: 1,
                borderRadius: 40,
                overflow: 'hidden',
                background: '#030712',
                position: 'relative',
              }}
            >
              <Img
                src={staticFile(currentCard.img)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. ACOUSTIC SOUND WAVES: Dynamic Luminous Spectrum (Resonant Solo Framing & Tactile Pulses) */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: frame < 215 ? 1380 : 1720,
          height: frame < 215 ? 75 : 36,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 5,
          zIndex: 25,
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {Array.from({ length: 36 }).map((_, barIdx) => {
          const barFreq = 0.08 * (barIdx + 1);
          const isPluckActive = HOOK_PLUCKS.some((p) => {
            const dt = frame - p.startFrame;
            return dt >= 0 && dt <= 32;
          });
          const baseAmp = isPluckActive ? (frame < 215 ? 1.0 : 0.45) : (frame < 215 ? 0.22 : 0.1);
          const maxHeight = frame < 215 ? 68 : 30;
          const barHeight = Math.min(
            maxHeight,
            Math.max(
              6,
              (Math.sin(frame * barFreq + barIdx * 0.38) * 0.5 + 0.5) * maxHeight * baseAmp + 6
            )
          );
          const isHighBar = barIdx % 3 === 0;
          const isMidBar = barIdx % 2 === 0;
          return (
            <div
              key={barIdx}
              style={{
                flex: 1,
                height: barHeight,
                borderRadius: 4,
                background: isHighBar
                  ? 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)'
                  : isMidBar
                  ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)'
                  : 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
                boxShadow: isHighBar
                  ? '0 0 12px rgba(251, 191, 36, 0.7)'
                  : isMidBar
                  ? '0 0 10px rgba(56, 189, 248, 0.6)'
                  : 'none',
                opacity: frame < 215 ? 0.95 : 0.65,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
