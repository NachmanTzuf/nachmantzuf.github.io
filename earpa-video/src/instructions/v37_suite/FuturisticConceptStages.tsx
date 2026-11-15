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
 * Expanded intuitive non-technical demonstration:
 * 1) Tuned to Eb Major with all levers down
 * 2) Flipping a lever tightens string to raise pitch one step higher
 * 3) Clockwise Circle of Fifths adds 1 lever per step in order: A -> E -> B -> F -> C -> G -> D
 */
export const LeversConceptStage: React.FC<{
  totalFrames: number;
  leverFlipFrame?: number;
  conceptOrderFrame?: number;
  circleStepFrames?: number[];
}> = ({
  totalFrames,
  leverFlipFrame = 42,
  conceptOrderFrame = 180,
  circleStepFrames = [240, 295, 360, 420, 475],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = PATH_THEMES.levers;

  const entry = spring({ frame, fps, config: { damping: 22, stiffness: 86 } });
  const exit = interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fifthsKeys = [
    { k: 'C', label: 'C', flats: '3 Levers Up · A, E, B', orderCount: 3 },
    { k: 'G', label: 'G', flats: '4 Levers Up · A, E, B, F', orderCount: 4 },
    { k: 'D', label: 'D', flats: '5 Levers Up · A..C', orderCount: 5 },
    { k: 'A', label: 'A', flats: '6 Levers Up · A..G', orderCount: 6 },
    { k: 'E', label: 'E', flats: '7 Levers Up · All Up', orderCount: 7 },
    { k: 'B', label: 'B', flats: '5# Key', orderCount: 7 },
    { k: 'F#', label: 'F♯', flats: '6# Key', orderCount: 7 },
    { k: 'Db', label: 'D♭', flats: '5♭ Key', orderCount: 0 },
    { k: 'Ab', label: 'A♭', flats: '4♭ Key', orderCount: 0 },
    { k: 'Eb', label: 'E♭', flats: 'All Levers Down (Home)', orderCount: 0 },
    { k: 'Bb', label: 'B♭', flats: '1 Lever Up · A', orderCount: 1 },
    { k: 'F', label: 'F', flats: '2 Levers Up · A, E', orderCount: 2 },
  ];

  // Progress cleanly in sync with synthesized audio timestamps
  const [fEb, fBb, fF, fC, fG] = [
    circleStepFrames[0] ?? 240,
    circleStepFrames[1] ?? 300,
    circleStepFrames[2] ?? 370,
    circleStepFrames[3] ?? 430,
    circleStepFrames[4] ?? 485,
  ];
  const stepIdx =
    frame < fBb ? 9 : frame < fF ? 10 : frame < fC ? 11 : frame < fG ? 0 : 1;
  const activeKey = fifthsKeys[stepIdx];
  const raisedOrder = ['A', 'E', 'B', 'F', 'C', 'G', 'D'];
  const orderRailShown = frame >= conceptOrderFrame - 12;
  const activeUpCount = frame < fBb ? 0 : activeKey.orderCount;

  const macroLevers: LeverFlipEvent[] = [
    { leverNum: 1, flipFrame: leverFlipFrame },
    { leverNum: 3, flipFrame: leverFlipFrame + 30 },
  ];
  const macroPlucks: PluckEvent[] = [
    { stringNum: 1, startFrame: leverFlipFrame + 5 },
    { stringNum: 3, startFrame: leverFlipFrame + 35 },
  ];

  let bottomRuleText = 'Most Celtic harps sit in E♭ major when every lever is flipped down.';
  if (frame >= leverFlipFrame - 6 && frame < conceptOrderFrame - 6) {
    bottomRuleText = 'Flipping a lever up raises that string’s note one step higher.';
  } else if (frame >= conceptOrderFrame - 6 && frame < fEb - 8) {
    bottomRuleText = 'Think of the Circle of Fifths like a clock: step clockwise to add one lever.';
  } else if (frame >= fEb - 8) {
    bottomRuleText = 'Always raise levers in one memorable order: A · E · B · F · C · G · D.';
  }

  return (
    <AbsoluteFill style={{ opacity: Math.min(entry, exit) }}>
      <SanctuaryBackdrop theme="levers" blurPx={16} photoOpacity={0.34} ringOpacity={0.2} />

      <div
        style={{
          position: 'absolute',
          top: 76,
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
            letterSpacing: '0.26em',
            color: theme.accentSoft,
            marginBottom: 10,
          }}
        >
          HOW LEVERS CHANGE KEYS
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700, color: '#f8fafc' }}>
          Circle of Fifths & Levers
        </div>
      </div>

      {/* Upper Half: Macro Close-up of Camac Levers with seamless CSS alpha mask */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 175,
          width: 1080,
          height: 620,
          zIndex: 2,
          overflow: 'hidden',
          maskImage: 'linear-gradient(180deg, #000 0%, #000 62%, transparent 94%)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 62%, transparent 94%)',
        }}
      >
        <Harp3DCanvas
          width={1080}
          height={620}
          theta={-0.30 + frame * 0.004}
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

      {/* Lower Half: Illuminated Circle of Fifths Clock Dial */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 810,
          width: 650,
          height: 650,
          transform: 'translateX(-50%)',
          zIndex: 4,
        }}
      >
        <svg width="650" height="650" viewBox="0 0 650 650">
          <circle cx="325" cy="325" r="258" fill="rgba(16, 12, 8, 0.58)" stroke="rgba(245, 184, 65, 0.28)" strokeWidth="2" />
          <circle cx="325" cy="325" r="204" fill="none" stroke="rgba(253, 230, 138, 0.14)" strokeWidth="1.2" strokeDasharray="6 14" />

          {/* Clockwise Progression Arc from Eb (idx 9) to Active Step */}
          {frame >= fBb && (
            <path
              d="M 103 325 A 222 222 0 0 1 436 133"
              fill="none"
              stroke="rgba(251, 191, 36, 0.5)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}

          {fifthsKeys.map((item, idx) => {
            const angle = ((idx * 30 - 90) * Math.PI) / 180;
            const cx = 325 + 238 * Math.cos(angle);
            const cy = 325 + 238 * Math.sin(angle);
            const isActive = idx === stepIdx;
            const isVisited =
              (idx === 9 && frame >= fEb) ||
              (idx === 10 && frame >= fBb) ||
              (idx === 11 && frame >= fF) ||
              (idx === 0 && frame >= fC) ||
              (idx === 1 && frame >= fG);
            return (
              <g key={item.k}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 39 : 28}
                  fill={
                    isActive
                      ? 'rgba(245, 184, 65, 0.96)'
                      : isVisited
                      ? 'rgba(72, 52, 18, 0.92)'
                      : 'rgba(26, 21, 14, 0.90)'
                  }
                  stroke={isActive ? '#fef3c7' : isVisited ? '#f59e0b' : 'rgba(245, 184, 65, 0.38)'}
                  strokeWidth={isActive ? 2.8 : 1.4}
                />
                <text
                  x={cx}
                  y={cy + 7}
                  textAnchor="middle"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: isActive ? 25 : 18,
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
            width: 310,
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 66, fontWeight: 700, color: '#fef3c7', lineHeight: 1 }}>
            {activeKey.label}
          </div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 16, fontWeight: 700, letterSpacing: '0.14em', color: '#fbbf24', marginTop: 10 }}>
            MAJOR KEY
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 600, color: '#f8fafc', marginTop: 6 }}>
            {activeKey.flats}
          </div>
        </div>
      </div>

      {/* Cumulative Clockwise Lever Order Strip (A · E · B · F · C · G · D) */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          bottom: 205,
          opacity: orderRailShown ? 1 : 0.35,
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'rgba(253, 230, 138, 0.78)',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          CLOCKWISE LEVER ORDER · EACH STEP RAISES THE NEXT
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          {raisedOrder.map((ltr, i) => {
            const lit = i < activeUpCount;
            return (
              <div
                key={ltr}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 16,
                  background: lit ? 'rgba(245, 184, 65, 0.24)' : 'rgba(18, 14, 10, 0.78)',
                  border: lit ? '1.8px solid #fbbf24' : '1.2px solid rgba(255,255,255,0.16)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: lit ? '#fef3c7' : '#94a3b8' }}>
                  {ltr}
                </div>
                <div style={{ fontFamily: FONT_NUM, fontSize: 11, fontWeight: 700, color: lit ? '#fbbf24' : '#64748b', marginTop: 3 }}>
                  {lit ? '↑ UP' : '↓ DN'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Plain-English Rule */}
      <div
        style={{
          position: 'absolute',
          bottom: 72,
          left: 84,
          right: 84,
          textAlign: 'center',
          zIndex: 5,
        }}
      >
        <div style={{ fontFamily: FONT_SANS, fontSize: 27, fontWeight: 500, color: 'rgba(241,245,249,0.94)', lineHeight: 1.4 }}>
          {bottomRuleText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
