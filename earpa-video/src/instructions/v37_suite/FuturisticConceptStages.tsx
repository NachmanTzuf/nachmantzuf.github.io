import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  FONT_DISPLAY,
  FONT_NUM,
  FONT_SANS,
  PATH_THEMES,
  SanctuaryBackdrop,
} from './FontsAndTheme';
import { Harp3DCanvas, LeverFlipEvent, PluckEvent } from '../../earpa/Harp3DCanvas';

/**
 * Minimalistic Futuristic Symmetrical Tonal Gravity Field (Path 1).
 * Half the scale (G, A, B) pulls UP toward Upper C5.
 * Half the scale (F, E, D) pulls DOWN toward Lower C4.
 */
export const SymmetricalGravityField: React.FC<{
  totalFrames: number;
  lowerFocusStart?: number;
  upperFocusStart?: number;
  lawRevealStart?: number;
}> = ({
  totalFrames,
  lowerFocusStart = 35,
  upperFocusStart = 115,
  lawRevealStart = 180,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = PATH_THEMES.single;

  const entry = spring({ frame, fps, config: { damping: 22, stiffness: 86 } });
  const exit = interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(entry, exit);

  const lowerActivity = interpolate(
    frame,
    [lowerFocusStart - 10, lowerFocusStart + 12, upperFocusStart + 12, lawRevealStart],
    [0.65, 1.0, 0.72, 0.96],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const upperActivity = interpolate(
    frame,
    [upperFocusStart - 12, upperFocusStart + 12, lawRevealStart],
    [0.65, 1.0, 0.98],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const unityPulse = interpolate(
    frame,
    [lawRevealStart - 12, lawRevealStart + 16],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Mirrored vertical coordinates around y = 980 equator
  const EQUATOR_Y = 980;
  const UPPER_TONIC_Y = 395;
  const LOWER_TONIC_Y = 1565;

  const upperNotes = [
    { note: 'B', deg: '7', sub: 'Leading Tone · Snap Up', y: 555, x: 540, delay: 4 },
    { note: 'A', deg: '6', sub: 'Submediant · Upward Flow', y: 695, x: 375, delay: 8 },
    { note: 'G', deg: '5', sub: 'Dominant · Ascend to C⁵', y: 835, x: 705, delay: 12 },
  ];

  const lowerNotes = [
    { note: 'F', deg: '4', sub: 'Subdominant · Fall via E & D', y: 1125, x: 375, delay: 4 },
    { note: 'E', deg: '3', sub: 'Mediant · Step Down', y: 1265, x: 705, delay: 8 },
    { note: 'D', deg: '2', sub: 'Supertonic · Drop to C⁴', y: 1405, x: 540, delay: 12 },
  ];

  // Flowing particle positions ascending/descending symmetrically
  const flowPhase = (frame % 48) / 48;

  return (
    <AbsoluteFill style={{ opacity }}>
      <SanctuaryBackdrop theme="single" blurPx={18} photoOpacity={0.28} ringOpacity={0.14} />

      {/* Top Editorial Header */}
      <div
        style={{
          position: 'absolute',
          top: 84,
          left: 72,
          right: 72,
          textAlign: 'center',
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: theme.accentSoft,
            marginBottom: 10,
          }}
        >
          ALAIN BENBASSAT · THE ENTIRE METHOD
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 54,
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '0.02em',
          }}
        >
          Symmetrical Tonal Gravity
        </div>
      </div>

      {/* Futuristic Vector Field Overlay */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, zIndex: 2 }}
      >
        <defs>
          <radialGradient id="c5Halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.42)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
          </radialGradient>
          <radialGradient id="c4Halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(52, 211, 153, 0.42)" />
            <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
          </radialGradient>
          <linearGradient id="upStream" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.08)" />
            <stop offset="100%" stopColor="rgba(253, 224, 71, 0.92)" />
          </linearGradient>
          <linearGradient id="downStream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52, 211, 153, 0.08)" />
            <stop offset="100%" stopColor="rgba(110, 231, 183, 0.92)" />
          </linearGradient>
        </defs>

        {/* Central axis hairline */}
        <line
          x1="540"
          y1={UPPER_TONIC_Y + 60}
          x2="540"
          y2={LOWER_TONIC_Y - 60}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          strokeDasharray="4 10"
        />

        {/* Symmetrical Axis of Polarity Equator */}
        <line
          x1="110"
          y1={EQUATOR_Y}
          x2="970"
          y2={EQUATOR_Y}
          stroke={`rgba(255,255,255,${0.2 + unityPulse * 0.25})`}
          strokeWidth="1.5"
          strokeDasharray="10 14"
        />
        <circle cx="110" cy={EQUATOR_Y} r="4" fill="rgba(255,255,255,0.45)" />
        <circle cx="970" cy={EQUATOR_Y} r="4" fill="rgba(255,255,255,0.45)" />

        {/* Upper Horizon Halo & Curved Magnet Paths (G, A, B -> C5) */}
        <circle cx="540" cy={UPPER_TONIC_Y} r={140 + unityPulse * 24} fill="url(#c5Halo)" opacity={upperActivity} />
        {upperNotes.map((n) => {
          const ctrlX = n.x === 540 ? 540 : n.x < 540 ? 445 : 635;
          const ctrlY = (n.y + UPPER_TONIC_Y) * 0.5;
          const t = (flowPhase + n.delay * 0.05) % 1;
          const px = (1 - t) * (1 - t) * n.x + 2 * (1 - t) * t * ctrlX + t * t * 540;
          const py = (1 - t) * (1 - t) * (n.y - 44) + 2 * (1 - t) * t * ctrlY + t * t * (UPPER_TONIC_Y + 56);
          return (
            <g key={`up-arc-${n.note}`} opacity={upperActivity}>
              <path
                d={`M ${n.x} ${n.y - 44} Q ${ctrlX} ${ctrlY} 540 ${UPPER_TONIC_Y + 56}`}
                fill="none"
                stroke="url(#upStream)"
                strokeWidth={2.8}
              />
              {/* Upward chevron mid-path */}
              <path
                d={`M ${px - 8} ${py + 6} L ${px} ${py - 5} L ${px + 8} ${py + 6}`}
                fill="none"
                stroke="#fde68a"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Lower Horizon Halo & Curved Magnet Paths (F, E, D -> C4) */}
        <circle cx="540" cy={LOWER_TONIC_Y} r={140 + unityPulse * 24} fill="url(#c4Halo)" opacity={lowerActivity} />
        {lowerNotes.map((n) => {
          const ctrlX = n.x === 540 ? 540 : n.x < 540 ? 445 : 635;
          const ctrlY = (n.y + LOWER_TONIC_Y) * 0.5;
          const t = (flowPhase + n.delay * 0.05) % 1;
          const px = (1 - t) * (1 - t) * n.x + 2 * (1 - t) * t * ctrlX + t * t * 540;
          const py = (1 - t) * (1 - t) * (n.y + 44) + 2 * (1 - t) * t * ctrlY + t * t * (LOWER_TONIC_Y - 56);
          return (
            <g key={`dn-arc-${n.note}`} opacity={lowerActivity}>
              <path
                d={`M ${n.x} ${n.y + 44} Q ${ctrlX} ${ctrlY} 540 ${LOWER_TONIC_Y - 56}`}
                fill="none"
                stroke="url(#downStream)"
                strokeWidth={2.8}
              />
              {/* Downward chevron mid-path */}
              <path
                d={`M ${px - 8} ${py - 6} L ${px} ${py + 5} L ${px + 8} ${py - 6}`}
                fill="none"
                stroke="#6ee7b7"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>

      {/* Equator Split Callouts */}
      <div
        style={{
          position: 'absolute',
          top: EQUATOR_Y - 22,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 28px',
          borderRadius: 999,
          background: 'rgba(6, 14, 14, 0.92)',
          border: '1px solid rgba(255,255,255,0.22)',
          fontFamily: FONT_NUM,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: '#cbd5e1',
          zIndex: 5,
        }}
      >
        TONAL POLARITY EQUATOR
      </div>

      {/* Side Hemisphere Directional Labels (symmetrical) */}
      <div
        style={{
          position: 'absolute',
          top: 520,
          left: 68,
          opacity: upperActivity,
          zIndex: 4,
        }}
      >
        <div style={{ fontFamily: FONT_NUM, fontSize: 18, fontWeight: 700, letterSpacing: '0.18em', color: '#fde68a' }}>
          UPPER HALF ↑
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 23, color: 'rgba(241,245,249,0.78)', marginTop: 4 }}>
          G · A · B pull up
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1330,
          left: 68,
          opacity: lowerActivity,
          zIndex: 4,
        }}
      >
        <div style={{ fontFamily: FONT_NUM, fontSize: 18, fontWeight: 700, letterSpacing: '0.18em', color: '#6ee7b7' }}>
          LOWER HALF ↓
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 23, color: 'rgba(241,245,249,0.78)', marginTop: 4 }}>
          F · E · D pull down
        </div>
      </div>

      {/* Upper Tonic Hub C5 */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 62,
          top: UPPER_TONIC_Y - 62,
          width: 124,
          height: 124,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.28) 0%, rgba(16,14,8,0.92) 72%)',
          border: '2px solid rgba(251, 191, 36, 0.88)',
          boxShadow: '0 0 42px rgba(251,191,36,0.34)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          opacity: upperActivity,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, color: '#fef3c7', lineHeight: 1 }}>
          C⁵
        </div>
        <div style={{ fontFamily: FONT_NUM, fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', color: '#fbbf24', marginTop: 4 }}>
          HIGH HOME
        </div>
      </div>

      {/* Lower Tonic Hub C4 */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 62,
          top: LOWER_TONIC_Y - 62,
          width: 124,
          height: 124,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.28) 0%, rgba(8,18,16,0.92) 72%)',
          border: '2px solid rgba(52, 211, 153, 0.88)',
          boxShadow: '0 0 42px rgba(52,211,153,0.34)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          opacity: lowerActivity,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, color: '#d1fae5', lineHeight: 1 }}>
          C⁴
        </div>
        <div style={{ fontFamily: FONT_NUM, fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', color: '#34d399', marginTop: 4 }}>
          LOW HOME
        </div>
      </div>

      {/* Floating Symmetrical Scale Degree Orbs */}
      {upperNotes.map((n) => {
        const s = spring({ frame: Math.max(0, frame - n.delay), fps, config: { damping: 18, stiffness: 110 } });
        return (
          <div
            key={`orb-up-${n.note}`}
            style={{
              position: 'absolute',
              left: n.x - 46,
              top: n.y - 46,
              width: 92,
              height: 92,
              borderRadius: '50%',
              background: 'rgba(14, 16, 18, 0.86)',
              border: `1.8px solid rgba(251, 191, 36, ${0.4 + upperActivity * 0.52})`,
              boxShadow: `0 0 28px rgba(251, 191, 36, ${upperActivity * 0.25})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${s})`,
              opacity: upperActivity,
              zIndex: 5,
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: '#fef3c7', lineHeight: 1 }}>
              {n.note}
            </div>
            <div style={{ fontFamily: FONT_NUM, fontSize: 13, fontWeight: 700, color: '#fbbf24', marginTop: 2 }}>
              ↑ DEG {n.deg}
            </div>
          </div>
        );
      })}

      {lowerNotes.map((n) => {
        const s = spring({ frame: Math.max(0, frame - n.delay), fps, config: { damping: 18, stiffness: 110 } });
        return (
          <div
            key={`orb-dn-${n.note}`}
            style={{
              position: 'absolute',
              left: n.x - 46,
              top: n.y - 46,
              width: 92,
              height: 92,
              borderRadius: '50%',
              background: 'rgba(8, 18, 16, 0.86)',
              border: `1.8px solid rgba(52, 211, 153, ${0.4 + lowerActivity * 0.52})`,
              boxShadow: `0 0 28px rgba(52, 211, 153, ${lowerActivity * 0.25})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${s})`,
              opacity: lowerActivity,
              zIndex: 5,
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: '#ecfdf5', lineHeight: 1 }}>
              {n.note}
            </div>
            <div style={{ fontFamily: FONT_NUM, fontSize: 13, fontWeight: 700, color: '#34d399', marginTop: 2 }}>
              ↓ DEG {n.deg}
            </div>
          </div>
        );
      })}

      {/* Minimal Bottom Summary Takeaway (No Clunky Box) */}
      <div
        style={{
          position: 'absolute',
          bottom: 92,
          left: 84,
          right: 84,
          textAlign: 'center',
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 28,
            fontWeight: 500,
            color: 'rgba(241, 245, 249, 0.92)',
            lineHeight: 1.4,
          }}
        >
          Every scale note is governed by opposing pull toward home C.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Minimalistic Holographic Melody Contour Stage (Path 2).
 */
export const MelodyContourStage: React.FC<{
  totalFrames: number;
  noteFrames?: number[];
}> = ({ totalFrames, noteFrames = [42, 72, 102] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = PATH_THEMES.melody;

  const entry = spring({ frame, fps, config: { damping: 22, stiffness: 86 } });
  const exit = interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const nodes = [
    { note: 'C', deg: '1', label: 'ANCHOR', x: 240, y: 1180, color: '#bae6fd', trigger: noteFrames[0] },
    { note: 'E', deg: '3', label: 'SHAPE', x: 540, y: 940, color: '#7dd3fc', trigger: noteFrames[1] },
    { note: 'G', deg: '5', label: 'DIRECTION', x: 840, y: 740, color: '#38bdf8', trigger: noteFrames[2] },
  ];

  const drawProg = interpolate(frame, [16, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: Math.min(entry, exit) }}>
      <SanctuaryBackdrop theme="melody" blurPx={18} photoOpacity={0.3} ringOpacity={0.16} />

      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 72,
          right: 72,
          textAlign: 'center',
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: theme.accentSoft,
            marginBottom: 10,
          }}
        >
          PHRASING ARCHITECTURE
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 54, fontWeight: 700, color: '#f8fafc' }}>
          Hear One Living Shape
        </div>
      </div>

      {/* Minimal SVG Bezier Wave + Staff Hairlines */}
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        {[740, 880, 1020, 1180].map((yPos, i) => (
          <line
            key={i}
            x1="120"
            y1={yPos}
            x2="960"
            y2={yPos}
            stroke="rgba(186, 230, 253, 0.14)"
            strokeWidth="1.2"
          />
        ))}
        <path
          d="M 240 1180 C 370 1180, 410 940, 540 940 C 670 940, 710 740, 840 740"
          fill="none"
          stroke="rgba(56, 189, 248, 0.85)"
          strokeWidth="4.5"
          strokeDasharray="820"
          strokeDashoffset={(1 - drawProg) * 820}
          strokeLinecap="round"
        />
      </svg>

      {/* Luminous Pearl Nodes */}
      {nodes.map((n, idx) => {
        const hit = interpolate(frame, [n.trigger - 4, n.trigger + 8, n.trigger + 38], [0.45, 1.15, 0.9], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={n.note}
            style={{
              position: 'absolute',
              left: n.x - 64,
              top: n.y - 64,
              width: 128,
              height: 128,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56,189,248,0.26) 0%, rgba(4,14,24,0.94) 72%)',
              border: `2px solid ${n.color}`,
              boxShadow: `0 0 ${Math.round(hit * 42)}px rgba(56, 189, 248, ${0.25 + hit * 0.28})`,
              transform: `scale(${0.92 + hit * 0.08})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
            }}
          >
            <div style={{ fontFamily: FONT_NUM, fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', color: theme.accentSoft }}>
              NOTE {idx + 1}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, color: '#f8fafc', lineHeight: 1.05 }}>
              {n.note}
            </div>
            <div style={{ fontFamily: FONT_NUM, fontSize: 12, fontWeight: 700, color: n.color, letterSpacing: '0.14em' }}>
              {n.label}
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          bottom: 98,
          left: 84,
          right: 84,
          textAlign: 'center',
          zIndex: 4,
        }}
      >
        <div style={{ fontFamily: FONT_SANS, fontSize: 28, fontWeight: 500, color: 'rgba(241,245,249,0.92)', lineHeight: 1.42 }}>
          Anchor the first pitch to home C, then trace up or down by interval.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Minimalistic Mechanical Macro + Symmetrical Circle of Fifths Stage (Path 3).
 * Demonstrates "+1 semitone" lever mechanism & key signature order A->E->B->F->C->G->D.
 */
export const LeversConceptStage: React.FC<{
  totalFrames: number;
  leverFlipFrame?: number;
}> = ({ totalFrames, leverFlipFrame = 42 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = PATH_THEMES.levers;

  const entry = spring({ frame, fps, config: { damping: 22, stiffness: 86 } });
  const exit = interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fifthsKeys = [
    { k: 'C', label: 'C', flats: '0' },
    { k: 'G', label: 'G', flats: '1#' },
    { k: 'D', label: 'D', flats: '2#' },
    { k: 'A', label: 'A', flats: '3#' },
    { k: 'E', label: 'E', flats: '4#' },
    { k: 'B', label: 'B', flats: '5#' },
    { k: 'F#', label: 'F♯', flats: '6#' },
    { k: 'Db', label: 'D♭', flats: '5♭' },
    { k: 'Ab', label: 'A♭', flats: '4♭' },
    { k: 'Eb', label: 'E♭', flats: '3♭' },
    { k: 'Bb', label: 'B♭', flats: '2♭' },
    { k: 'F', label: 'F', flats: '1♭' },
  ];

  // Progress clockwise from Eb (idx 9) -> Bb (10) -> F (11) -> C (0)
  const stepIdx = frame < 85 ? 9 : frame < 140 ? 10 : frame < 190 ? 11 : 0;

  const macroLevers: LeverFlipEvent[] = [
    { leverNum: 1, flipFrame: leverFlipFrame },
    { leverNum: 3, flipFrame: leverFlipFrame + 18 },
    { leverNum: 6, flipFrame: leverFlipFrame + 36 },
  ];
  const macroPlucks: PluckEvent[] = [
    { stringNum: 1, startFrame: leverFlipFrame + 6 },
    { stringNum: 3, startFrame: leverFlipFrame + 24 },
  ];

  return (
    <AbsoluteFill style={{ opacity: Math.min(entry, exit) }}>
      <SanctuaryBackdrop theme="levers" blurPx={16} photoOpacity={0.34} ringOpacity={0.2} />

      <div
        style={{
          position: 'absolute',
          top: 86,
          left: 72,
          right: 72,
          textAlign: 'center',
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: theme.accentSoft,
            marginBottom: 10,
          }}
        >
          MECHANICS · +1 SEMITONE PER LEVER
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700, color: '#f8fafc' }}>
          Circle of Fifths & Levers
        </div>
      </div>

      {/* Upper Half: Macro Close-up of Camac Levers with pure alpha CSS gradient mask (ZERO box seam) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 190,
          width: 1080,
          height: 680,
          zIndex: 2,
          overflow: 'hidden',
          maskImage: 'linear-gradient(180deg, #000 0%, #000 62%, transparent 94%)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 62%, transparent 94%)',
        }}
      >
        <Harp3DCanvas
          width={1080}
          height={680}
          theta={-0.30 + frame * 0.0045}
          phi={1.28}
          radius={0.92}
          targetY={1.06}
          targetX={0.02}
          harpScale={0.86}
          steadyTurntable
          leverEvents={macroLevers}
          pluckEvents={macroPlucks}
        />
      </div>

      {/* Lower Half: Futuristic Illuminated Circle of Fifths Wheel */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 900,
          width: 660,
          height: 660,
          transform: 'translateX(-50%)',
          zIndex: 4,
        }}
      >
        <svg width="660" height="660" viewBox="0 0 660 660">
          <circle cx="330" cy="330" r="265" fill="rgba(16, 12, 8, 0.56)" stroke="rgba(245, 184, 65, 0.28)" strokeWidth="2" />
          <circle cx="330" cy="330" r="210" fill="none" stroke="rgba(253, 230, 138, 0.14)" strokeWidth="1.2" strokeDasharray="6 14" />

          {fifthsKeys.map((item, idx) => {
            const angle = ((idx * 30 - 90) * Math.PI) / 180;
            const cx = 330 + 245 * Math.cos(angle);
            const cy = 330 + 245 * Math.sin(angle);
            const isActive = idx === stepIdx;
            return (
              <g key={item.k}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 38 : 28}
                  fill={isActive ? 'rgba(245, 184, 65, 0.94)' : 'rgba(26, 21, 14, 0.92)'}
                  stroke={isActive ? '#fef3c7' : 'rgba(245, 184, 65, 0.42)'}
                  strokeWidth={isActive ? 2.6 : 1.4}
                />
                <text
                  x={cx}
                  y={cy + 7}
                  textAnchor="middle"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: isActive ? 24 : 18,
                    fontWeight: 700,
                    fill: isActive ? '#0c0904' : '#fde68a',
                  }}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Dial Readout */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 64, fontWeight: 700, color: '#fef3c7', lineHeight: 1 }}>
            {fifthsKeys[stepIdx].label}
          </div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color: '#fbbf24', marginTop: 8 }}>
            MAJOR · {fifthsKeys[stepIdx].flats}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 18, color: 'rgba(241,245,249,0.72)', marginTop: 6 }}>
            Raise order: A · E · B · F · C · G · D
          </div>
        </div>
      </div>

      {/* Bottom Clean Pedagogy Note */}
      <div
        style={{
          position: 'absolute',
          bottom: 92,
          left: 84,
          right: 84,
          textAlign: 'center',
          zIndex: 5,
        }}
      >
        <div style={{ fontFamily: FONT_SANS, fontSize: 27, fontWeight: 500, color: 'rgba(241,245,249,0.92)', lineHeight: 1.42 }}>
          Celtic harps are most commonly tuned to E♭ major with all levers down.
        </div>
      </div>
    </AbsoluteFill>
  );
};
