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
import {
  FONT_DISPLAY,
  FONT_NUM,
  FONT_SANS,
  PATH_THEMES,
  PathThemeKey,
  SanctuaryBackdrop,
} from './FontsAndTheme';

/** Verified empirical normalized coordinates across 1179x2556 CDP captures */
export const HARP_STRING_COORDS: Record<
  number,
  { x1: number; y1: number; x2: number; y2: number }
> = {
  1: { x1: 0.2776, y1: 0.145, x2: 0.4443, y2: 0.715 },
  2: { x1: 0.347, y1: 0.162, x2: 0.4841, y2: 0.668 },
  3: { x1: 0.4114, y1: 0.18, x2: 0.5206, y2: 0.622 },
  4: { x1: 0.4701, y1: 0.198, x2: 0.5583, y2: 0.576 },
  5: { x1: 0.5356, y1: 0.22, x2: 0.5978, y2: 0.526 },
  6: { x1: 0.5962, y1: 0.242, x2: 0.6369, y2: 0.478 },
  7: { x1: 0.6547, y1: 0.266, x2: 0.6755, y2: 0.43 },
  8: { x1: 0.7105, y1: 0.288, x2: 0.7145, y2: 0.384 },
};

export interface StringPluckSpec {
  stringNum: number; // 1..8
  startFrame: number; // relative to stage start
  durationFrames?: number;
  color?: string;
}

export interface KeyTapSpec {
  keyIndex: number; // 0..7 (C D E F G A B C)
  tapFrame: number;
  isCorrect?: boolean;
  label?: string;
}

export interface GameplayRoundEvent {
  roundNumber: number;
  roundStartFrame: number;
  cadenceChordFrames: [number, number, number, number]; // relative to scene start
  mysteryPluckFrames: number[]; // single: [f], melody: [f1, f2, f3]
  mysteryStrings: number[]; // e.g. [4] or [1,3,5]
  humCueStartFrame?: number;
  humCueEndFrame?: number;
  keyTaps: KeyTapSpec[];
  verdictFrame: number;
  verdictCorrect: boolean;
  verdictTitle: string;
  verdictDetail: string;
  walkPlucks: { stringNum: number; frame: number; noteLabel: string }[];
  // Optional Path 2 note slot labels synced with keyTaps
  slotNotes?: { note: string; revealFrame: number }[];
}

export interface LeverRoundEvent {
  scaleName: string;
  roundLabel: string; // e.g. "Level 1 · 2 / 3"
  roundStartFrame: number;
  // Target initial & user-flipped states per string 1..8 (true = UP)
  initialLevers: boolean[];
  leverFlips: { stringNum: number; flipFrame: number; targetUp: boolean }[];
  confirmTapFrame: number;
  verdictCorrect: boolean;
  verdictHeadline: string;
  verdictSubline: string;
  walkNotes: { stringNum: number; frame: number; noteLabel: string; pitchGlowColor?: string }[];
}

interface PhoneCalloutBeat {
  startFrame: number;
  endFrame: number;
  headerTag: string;
  headerTitle: string;
  bottomCaption: string;
  calloutBadge?: string;
  // Normalized 0..1 inside phone image
  targetX?: number;
  targetY?: number;
  highlightBox?: { x: number; y: number; w: number; h: number };
  tapPulseFrame?: number;
  badgeSide?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top';
}

/**
 * Large Titanium Smartphone Bezel Showcase for Trail Map / Home / Session Insights / Circle
 * with strictly ONE focal callout highlight + curved vector pointer at any instant.
 */
export const PhoneCalloutStage: React.FC<{
  theme: PathThemeKey;
  textureSrc: string;
  totalFrames: number;
  beats: PhoneCalloutBeat[];
  phoneWidth?: number;
  phoneTop?: number;
}> = ({
  theme,
  textureSrc,
  totalFrames,
  beats,
  phoneWidth = 668,
  phoneTop = 248,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = PATH_THEMES[theme];

  const phoneHeight = Math.round(phoneWidth * (852 / 393)); // exact 393:852 aspect (1448px @ 668w)
  const phoneLeft = Math.round((1080 - phoneWidth) / 2);

  const stageIn = spring({ frame, fps, config: { damping: 24, stiffness: 90 } });
  const stageOut = interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(stageIn, stageOut);

  const activeBeat =
    beats.find((b) => frame >= b.startFrame && frame < b.endFrame) ||
    beats[beats.length - 1];
  const localBeatFrame = Math.max(0, frame - activeBeat.startFrame);
  const beatSpring = spring({
    frame: localBeatFrame,
    fps,
    config: { damping: 20, stiffness: 105 },
  });

  // Compute callout arrow anchor if present
  const hasTarget = activeBeat.targetX !== undefined && activeBeat.targetY !== undefined;
  const targetAbsX = phoneLeft + (activeBeat.targetX ?? 0.5) * phoneWidth;
  const targetAbsY = phoneTop + (activeBeat.targetY ?? 0.5) * phoneHeight;

  let badgeAbsX = 540;
  let badgeAbsY = Math.max(220, targetAbsY - 190);
  if (activeBeat.badgeSide === 'top-left') {
    badgeAbsX = 240;
    badgeAbsY = Math.max(255, targetAbsY - 140);
  } else if (activeBeat.badgeSide === 'top-right') {
    badgeAbsX = 840;
    badgeAbsY = Math.max(255, targetAbsY - 140);
  } else if (activeBeat.badgeSide === 'bottom-left') {
    badgeAbsX = 250;
    badgeAbsY = Math.min(1680, targetAbsY + 145);
  } else if (activeBeat.badgeSide === 'bottom-right') {
    badgeAbsX = 830;
    badgeAbsY = Math.min(1680, targetAbsY + 145);
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <SanctuaryBackdrop theme={theme} blurPx={18} photoOpacity={0.26} ringOpacity={0.14} />

      {/* Top Editorial Header */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 64,
          right: 64,
          textAlign: 'center',
          zIndex: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.26em',
            color: palette.accentSoft,
            marginBottom: 8,
          }}
        >
          {activeBeat.headerTag}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 48,
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.1,
          }}
        >
          {activeBeat.headerTitle}
        </div>
      </div>

      {/* Large Metallic Smartphone Bezel */}
      <div
        style={{
          position: 'absolute',
          left: phoneLeft,
          top: phoneTop,
          width: phoneWidth,
          height: phoneHeight,
          borderRadius: 56,
          padding: 12,
          background: 'linear-gradient(145deg, #2d3748 0%, #0f172a 55%, #1e293b 100%)',
          boxShadow: `0 42px 110px rgba(0,0,0,0.78), 0 0 0 1.5px rgba(255,255,255,0.18), 0 0 60px ${palette.accentGlow}`,
          transform: `scale(${interpolate(stageIn, [0, 1], [0.95, 1])})`,
          zIndex: 4,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 46,
            overflow: 'hidden',
            backgroundColor: '#050a0c',
          }}
        >
          <Img
            src={staticFile(textureSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Subtle Spot Focus Box on Single Highlight Element */}
          {activeBeat.highlightBox && (
            <div
              style={{
                position: 'absolute',
                left: `${activeBeat.highlightBox.x * 100}%`,
                top: `${activeBeat.highlightBox.y * 100}%`,
                width: `${activeBeat.highlightBox.w * 100}%`,
                height: `${activeBeat.highlightBox.h * 100}%`,
                borderRadius: 20,
                border: `2.5px solid ${palette.accent}`,
                boxShadow: `0 0 28px ${palette.accentGlow}, 0 0 0 2000px rgba(2, 6, 10, ${beatSpring * 0.42})`,
                opacity: beatSpring,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Crisp Finger Tap Ripple (e.g. pressing Play level) */}
          {activeBeat.tapPulseFrame !== undefined &&
            frame >= activeBeat.tapPulseFrame &&
            frame <= activeBeat.tapPulseFrame + 28 &&
            hasTarget && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(activeBeat.targetX ?? 0.5) * 100}%`,
                  top: `${(activeBeat.targetY ?? 0.5) * 100}%`,
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  border: `3px solid ${palette.accentSoft}`,
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  transform: `translate(-50%, -50%) scale(${interpolate(
                    frame - activeBeat.tapPulseFrame,
                    [0, 24],
                    [0.5, 1.85],
                    { extrapolateRight: 'clamp' }
                  )})`,
                  opacity: interpolate(
                    frame - activeBeat.tapPulseFrame,
                    [0, 24],
                    [0.95, 0],
                    { extrapolateRight: 'clamp' }
                  ),
                  pointerEvents: 'none',
                }}
              />
            )}
        </div>
      </div>

      {/* Curved Vector Callout Arrow + Label Pill */}
      {hasTarget && activeBeat.calloutBadge && (
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 1080 1920"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9, opacity: beatSpring }}
        >
          <path
            d={`M ${badgeAbsX} ${badgeAbsY} Q ${(badgeAbsX + targetAbsX) * 0.5} ${badgeAbsY} ${targetAbsX} ${targetAbsY}`}
            fill="none"
            stroke={palette.accentSoft}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeDasharray="6 6"
          />
          <circle cx={targetAbsX} cy={targetAbsY} r="9" fill={palette.accent} stroke="#fff" strokeWidth="2.5" />
        </svg>
      )}
      {hasTarget && activeBeat.calloutBadge && (
        <div
          style={{
            position: 'absolute',
            left: badgeAbsX,
            top: badgeAbsY,
            transform: `translate(-50%, -50%) scale(${interpolate(beatSpring, [0, 1], [0.9, 1])})`,
            padding: '12px 24px',
            borderRadius: 999,
            background: 'rgba(8, 16, 20, 0.94)',
            border: `1.5px solid ${palette.accent}`,
            boxShadow: `0 14px 34px rgba(0,0,0,0.65), 0 0 24px ${palette.accentGlow}`,
            fontFamily: FONT_SANS,
            fontSize: 22,
            fontWeight: 700,
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            zIndex: 10,
            opacity: beatSpring,
          }}
        >
          {activeBeat.calloutBadge}
        </div>
      )}

      {/* Clean Bottom Caption Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 72,
          right: 72,
          textAlign: 'center',
          zIndex: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 27,
            fontWeight: 500,
            color: 'rgba(241,245,249,0.92)',
            lineHeight: 1.38,
            textShadow: '0 4px 18px rgba(0,0,0,0.8)',
          }}
        >
          {activeBeat.bottomCaption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

interface PhaseHudCaption {
  startFrame: number;
  endFrame: number;
  topTag: string;
  topTitle: string;
  bottomCoach: string;
}

/**
 * Large Live Gameplay Stage (710px wide phone) supporting Path 1 & Path 2
 * with exact real-time cadence chords, hum-C pause indicator, subtle string filaments,
 * authentic frosted Verdict pills, and accurate walkdown/replay animations.
 */
export const LiveGameplayPhoneStage: React.FC<{
  theme: 'single' | 'melody';
  textureSrc: string;
  totalFrames: number;
  levelCode: string; // e.g. 'P1-12 · C Major - Full Octave' or 'P2-04 · Seq Intro 4: Three-Note Triad'
  rounds: GameplayRoundEvent[];
  captions: PhaseHudCaption[];
}> = ({ theme, textureSrc, totalFrames, levelCode, rounds, captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = PATH_THEMES[theme];

  const phoneWidth = 710;
  const phoneHeight = Math.round(phoneWidth * (852 / 393)); // 1539px
  const phoneLeft = Math.round((1080 - phoneWidth) / 2); // 185px
  const phoneTop = 205;

  const entry = spring({ frame, fps, config: { damping: 24, stiffness: 92 } });
  const exit = interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Active round calculation
  let activeRound = rounds[0];
  for (const r of rounds) {
    if (frame >= r.roundStartFrame) activeRound = r;
  }

  const activeCaption =
    captions.find((c) => frame >= c.startFrame && frame < c.endFrame) ||
    captions[captions.length - 1];

  // Collect active subtle string filaments across cadence, mystery, and walkdown
  const plucks: StringPluckSpec[] = [];
  for (const r of rounds) {
    // Cadence I-IV-V-I triads
    const c1 = r.cadenceChordFrames[0];
    const c2 = r.cadenceChordFrames[1];
    const c3 = r.cadenceChordFrames[2];
    const c4 = r.cadenceChordFrames[3];
    // Chord I: C-E-G
    [1, 3, 5].forEach((s) => plucks.push({ stringNum: s, startFrame: c1, durationFrames: 24, color: '#fde68a' }));
    // Chord IV: F-A-C
    [4, 6, 8].forEach((s) => plucks.push({ stringNum: s, startFrame: c2, durationFrames: 24, color: '#fde68a' }));
    // Chord V: G-B
    [5, 7].forEach((s) => plucks.push({ stringNum: s, startFrame: c3, durationFrames: 24, color: '#fde68a' }));
    // Chord I resolve: C-E-G
    [1, 3, 5].forEach((s) => plucks.push({ stringNum: s, startFrame: c4, durationFrames: 34, color: '#fde68a' }));

    // Mystery note(s)
    r.mysteryPluckFrames.forEach((pf, idx) => {
      const sNum = r.mysteryStrings[idx] ?? r.mysteryStrings[0];
      plucks.push({
        stringNum: sNum,
        startFrame: pf,
        durationFrames: 42,
        color: palette.accentSoft,
      });
    });

    // Walkdown / Melody Replay notes
    r.walkPlucks.forEach((wp) => {
      plucks.push({
        stringNum: wp.stringNum,
        startFrame: wp.frame,
        durationFrames: 32,
        color: r.verdictCorrect ? '#6ee7b7' : '#fbbf24',
      });
    });
  }

  // Determine cadence step indicator (0..3) if currently inside activeRound cadence
  let activeChordIdx = -1;
  activeRound.cadenceChordFrames.forEach((cf, idx) => {
    const chordEnd = idx < 3 ? activeRound.cadenceChordFrames[idx + 1] : cf + 48;
    if (frame >= cf && frame < chordEnd) activeChordIdx = idx;
  });

  // Determine status bar text inside phone
  const afterMystery = frame >= activeRound.mysteryPluckFrames[activeRound.mysteryPluckFrames.length - 1];
  const afterVerdict = frame >= activeRound.verdictFrame;
  const inWalk =
    activeRound.walkPlucks.length > 0 && frame >= activeRound.walkPlucks[0].frame - 4;

  let currentWalkLabel = '';
  if (inWalk) {
    const activeSteps = activeRound.walkPlucks.filter((w) => frame >= w.frame);
    if (activeSteps.length > 0) {
      currentWalkLabel = activeSteps.map((w) => w.noteLabel).join('  ·  ');
    }
  }

  let promptPillText = 'Your turn · pluck a string or choose a note';
  let promptBorderColor = 'rgba(52, 211, 153, 0.45)';
  if (activeChordIdx >= 0) {
    const chordNames = ['I (C)', 'IV (F)', 'V (G)', 'I (C)'];
    promptPillText = `Cadence · ${chordNames[activeChordIdx]} · Lock in Home`;
    promptBorderColor = 'rgba(251, 191, 36, 0.55)';
  } else if (
    !afterMystery &&
    theme === 'melody' &&
    frame >= activeRound.mysteryPluckFrames[0] - 2
  ) {
    promptPillText = 'Listen · Follow the 3-note melody shape';
    promptBorderColor = 'rgba(56, 189, 248, 0.55)';
  } else if (afterMystery && !afterVerdict) {
    promptPillText =
      theme === 'single'
        ? 'Hear the gravity · Hum tonic C gently'
        : 'Tap the 3 notes in order';
    promptBorderColor = 'rgba(253, 230, 138, 0.55)';
  } else if (afterVerdict && inWalk && currentWalkLabel) {
    promptPillText =
      theme === 'single'
        ? `Resolving to C · ${currentWalkLabel}`
        : `Listening back · ${currentWalkLabel}`;
    promptBorderColor = activeRound.verdictCorrect
      ? 'rgba(52, 211, 153, 0.65)'
      : 'rgba(251, 191, 36, 0.65)';
  }

  const showHumC =
    activeRound.humCueStartFrame !== undefined &&
    activeRound.humCueEndFrame !== undefined &&
    frame >= activeRound.humCueStartFrame &&
    frame <= activeRound.humCueEndFrame;

  // Next round transition check to clear verdict smoothly before next round cadence
  const nextRound = rounds.find((r) => r.roundNumber === activeRound.roundNumber + 1);
  const verdictVisible =
    afterVerdict && (!nextRound || frame < nextRound.roundStartFrame - 4);

  return (
    <AbsoluteFill style={{ opacity: Math.min(entry, exit) }}>
      <SanctuaryBackdrop theme={theme} blurPx={18} photoOpacity={0.28} ringOpacity={0.12} />

      {/* Top Editorial Scene Header */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 56,
          right: 56,
          textAlign: 'center',
          zIndex: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.26em',
            color: palette.accentSoft,
            marginBottom: 8,
          }}
        >
          {activeCaption.topTag}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 48,
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.08,
          }}
        >
          {activeCaption.topTitle}
        </div>
      </div>

      {/* LARGE In-Game Phone Frame (710px wide) */}
      <div
        style={{
          position: 'absolute',
          left: phoneLeft,
          top: phoneTop,
          width: phoneWidth,
          height: phoneHeight,
          borderRadius: 58,
          padding: 12,
          background: 'linear-gradient(145deg, #2d3748 0%, #0f172a 55%, #1e293b 100%)',
          boxShadow: `0 44px 115px rgba(0,0,0,0.8), 0 0 0 1.5px rgba(255,255,255,0.2), 0 0 65px ${palette.accentGlow}`,
          zIndex: 4,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 48,
            overflow: 'hidden',
            backgroundColor: '#040a0c',
          }}
        >
          <Img
            src={staticFile(textureSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Top Round Progress Pill Replacement (100% opaque to eliminate underlying text bleed) */}
          <div
            style={{
              position: 'absolute',
              left: '30.5%',
              top: '1.6%',
              width: '39%',
              height: '5.3%',
              borderRadius: 20,
              backgroundColor: '#131d29',
              border: '1px solid rgba(148, 163, 184, 0.34)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px 8px',
            }}
          >
            <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '94%' }}>
              {levelCode}
            </div>
            <div style={{ fontFamily: FONT_NUM, fontSize: 15.5, fontWeight: 700, color: '#f8fafc', marginTop: 1 }}>
              Round {activeRound.roundNumber} / 15
            </div>
          </div>

          {/* SUBTLE Harmonic String Filaments SVG */}
          <svg
            width={phoneWidth - 24}
            height={phoneHeight - 24}
            viewBox={`0 0 ${phoneWidth - 24} ${phoneHeight - 24}`}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}
          >
            {plucks.map((p, idx) => {
              const dur = p.durationFrames ?? 34;
              if (frame < p.startFrame || frame > p.startFrame + dur) return null;
              const dt = frame - p.startFrame;
              const env = Math.pow(Math.max(0, 1 - dt / dur), 1.45);
              const sCoord = HARP_STRING_COORDS[p.stringNum];
              if (!sCoord) return null;

              const iw = phoneWidth - 24;
              const ih = phoneHeight - 24;
              const x1 = sCoord.x1 * iw;
              const y1 = sCoord.y1 * ih;
              const x2 = sCoord.x2 * iw;
              const y2 = sCoord.y2 * ih;

              const mx = (x1 + x2) * 0.5;
              const my = (y1 + y2) * 0.5;
              const vibAmp = Math.sin(dt * 1.45) * 4.5 * env;
              const cx = mx + vibAmp;

              const strokeCol = p.color || '#fde68a';
              return (
                <g key={`pluck-${idx}-${p.stringNum}-${p.startFrame}`}>
                  {/* Subtle soft halo */}
                  <path
                    d={`M ${x1} ${y1} Q ${cx} ${my} ${x2} ${y2}`}
                    fill="none"
                    stroke={strokeCol}
                    strokeWidth="7.5"
                    strokeLinecap="round"
                    opacity={0.28 * env}
                  />
                  {/* Crisp delicate warm/emerald string filament */}
                  <path
                    d={`M ${x1} ${y1} Q ${cx} ${my} ${x2} ${y2}`}
                    fill="none"
                    stroke={strokeCol}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    opacity={0.82 * env}
                  />
                  {/* Subtle pluck flare at mid string on initial impact */}
                  {dt <= 14 && (
                    <circle
                      cx={cx}
                      cy={my}
                      r={interpolate(dt, [0, 14], [4, 15])}
                      fill="none"
                      stroke={strokeCol}
                      strokeWidth="1.6"
                      opacity={interpolate(dt, [0, 14], [0.7, 0])}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Subtle Humming Tonic C Cue Ring over Keyboard Key C */}
          {showHumC && (
            <div
              style={{
                position: 'absolute',
                left: '3.2%',
                top: '91.4%',
                width: '10.6%',
                height: '5.8%',
                borderRadius: 12,
                border: '2px solid #fde68a',
                boxShadow: '0 0 18px rgba(253, 230, 138, 0.55)',
                backgroundColor: 'rgba(253, 230, 138, 0.14)',
                opacity: 0.65 + 0.35 * Math.sin(frame * 0.25),
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
          )}

          {/* Path 2 Note 1 / Note 2 / Note 3 Answer Slot Chips Overlay */}
          {theme === 'melody' && activeRound.slotNotes && (
            <div
              style={{
                position: 'absolute',
                left: '26%',
                top: '87.4%',
                width: '48%',
                height: '3.0%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                zIndex: 5,
              }}
            >
              {[0, 1, 2].map((slotIdx) => {
                const sn = activeRound.slotNotes?.[slotIdx];
                const filled = sn && frame >= sn.revealFrame;
                return (
                  <div
                    key={slotIdx}
                    style={{
                      flex: 1,
                      height: '100%',
                      borderRadius: 999,
                      background: filled ? '#0d3654' : '#121926',
                      border: filled
                        ? '1.5px solid #38bdf8'
                        : '1px solid rgba(148, 163, 184, 0.34)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: FONT_DISPLAY,
                      fontSize: filled ? 17 : 13,
                      fontWeight: 700,
                      color: filled ? '#e0f2fe' : '#64748b',
                    }}
                  >
                    {filled ? sn.note : `Note ${slotIdx + 1}`}
                  </div>
                );
              })}
            </div>
          )}

          {/* Key Touch Press Highlight over Keyboard C..C */}
          {activeRound.keyTaps.map((kt, idx) => {
            if (frame < kt.tapFrame || frame > kt.tapFrame + 48) return null;
            const leftPct = 3.2 + kt.keyIndex * 11.95;
            const col = kt.isCorrect === false ? '#f59e0b' : palette.accent;
            const fade = interpolate(
              frame - kt.tapFrame,
              [0, 6, 36, 48],
              [0.3, 1, 0.95, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            return (
              <div
                key={`kt-${activeRound.roundNumber}-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: '91.5%',
                  width: '10.6%',
                  height: '5.7%',
                  borderRadius: 12,
                  background:
                    kt.isCorrect === false
                      ? 'rgba(245, 158, 11, 0.34)'
                      : 'rgba(52, 211, 153, 0.30)',
                  border: `2.5px solid ${col}`,
                  boxShadow: `0 0 20px ${col}`,
                  opacity: fade,
                  pointerEvents: 'none',
                  zIndex: 6,
                }}
              />
            );
          })}

          {/* Dynamic Prompt Pill Mask (100% opaque matching native UI) */}
          <div
            style={{
              position: 'absolute',
              left: '15.5%',
              top: theme === 'single' ? '86.8%' : '83.3%',
              width: '69%',
              height: '3.9%',
              borderRadius: 999,
              backgroundColor: '#0e1722',
              border: `1.2px solid ${promptBorderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 6,
            }}
          >
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 14.5,
                fontWeight: 600,
                color: '#e2e8f0',
                letterSpacing: '0.01em',
              }}
            >
              {promptPillText}
            </div>
          </div>

          {/* Authentic Native-Style Verdict Toast Pill (Appears ONLY AFTER User Guess!) */}
          {verdictVisible && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: theme === 'single' ? '77.5%' : '74.5%',
                transform: `translate(-50%, -50%) scale(${spring({
                  frame: frame - activeRound.verdictFrame,
                  fps,
                  config: { damping: 18, stiffness: 135 },
                })})`,
                minWidth: '58%',
                padding: '14px 26px',
                borderRadius: 24,
                background: activeRound.verdictCorrect
                  ? 'rgba(6, 40, 32, 0.92)'
                  : 'rgba(54, 24, 16, 0.92)',
                border: activeRound.verdictCorrect
                  ? '1.8px solid rgba(52, 211, 153, 0.85)'
                  : '1.8px solid rgba(251, 191, 36, 0.88)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                textAlign: 'center',
                zIndex: 9,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 28,
                  fontWeight: 700,
                  color: activeRound.verdictCorrect ? '#6ee7b7' : '#fde68a',
                }}
              >
                {activeRound.verdictTitle}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 17,
                  fontWeight: 600,
                  color: '#f8fafc',
                  marginTop: 2,
                }}
              >
                {activeRound.verdictDetail}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Concise Lower Coaching Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: 68,
          right: 68,
          textAlign: 'center',
          zIndex: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 27,
            fontWeight: 500,
            color: 'rgba(241,245,249,0.92)',
            lineHeight: 1.38,
            textShadow: '0 4px 18px rgba(0,0,0,0.8)',
          }}
        >
          {activeCaption.bottomCoach}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Large Live Gameplay Stage specifically for Path 3 Levers (LeverTrainingScreen)
 * showing neck levers rotating up/down, bottom C..C2 tile updates, Confirm scale tap,
 * Clear Feedback banner, and 8-note start-to-finish scale walk at real 550ms/note speed!
 */
export const LiveLeverPhoneStage: React.FC<{
  textureSrc: string;
  totalFrames: number;
  rounds: LeverRoundEvent[];
  captions: PhaseHudCaption[];
}> = ({ textureSrc, totalFrames, rounds, captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = PATH_THEMES.levers;

  const phoneWidth = 710;
  const phoneHeight = Math.round(phoneWidth * (852 / 393)); // 1539px
  const phoneLeft = Math.round((1080 - phoneWidth) / 2);
  const phoneTop = 205;

  const entry = spring({ frame, fps, config: { damping: 24, stiffness: 92 } });
  const exit = interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let activeRound = rounds[0];
  for (const r of rounds) {
    if (frame >= r.roundStartFrame) activeRound = r;
  }

  const activeCaption =
    captions.find((c) => frame >= c.startFrame && frame < c.endFrame) ||
    captions[captions.length - 1];

  // Current up/down state for strings 1..8
  const leverStateUp = activeRound.initialLevers.map((initVal, idx) => {
    const stringNum = idx + 1;
    let cur = initVal;
    for (const fl of activeRound.leverFlips) {
      if (fl.stringNum === stringNum && frame >= fl.flipFrame) {
        cur = fl.targetUp;
      }
    }
    return cur;
  });

  const tilesLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C²'];
  const afterConfirm = frame >= activeRound.confirmTapFrame + 6;
  const walkIdx = activeRound.walkNotes.findIndex((w, i) => {
    const nextF = activeRound.walkNotes[i + 1]?.frame ?? w.frame + 18;
    return frame >= w.frame && frame < nextF;
  });

  return (
    <AbsoluteFill style={{ opacity: Math.min(entry, exit) }}>
      <SanctuaryBackdrop theme="levers" blurPx={18} photoOpacity={0.28} ringOpacity={0.14} />

      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 56,
          right: 56,
          textAlign: 'center',
          zIndex: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_NUM,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.26em',
            color: palette.accentSoft,
            marginBottom: 8,
          }}
        >
          {activeCaption.topTag}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 700, color: '#f8fafc', lineHeight: 1.08 }}>
          {activeCaption.topTitle}
        </div>
      </div>

      {/* LARGE Live Levers Phone */}
      <div
        style={{
          position: 'absolute',
          left: phoneLeft,
          top: phoneTop,
          width: phoneWidth,
          height: phoneHeight,
          borderRadius: 58,
          padding: 12,
          background: 'linear-gradient(145deg, #2d3748 0%, #0f172a 55%, #1e293b 100%)',
          boxShadow: `0 44px 115px rgba(0,0,0,0.8), 0 0 0 1.5px rgba(255,255,255,0.2), 0 0 65px ${palette.accentGlow}`,
          zIndex: 4,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 48,
            overflow: 'hidden',
            backgroundColor: '#0c0804',
          }}
        >
          <Img
            src={staticFile(textureSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Header Top-Right Round Label (100% opaque matching canyon dusk sky y=0.035..0.050) */}
          <div
            style={{
              position: 'absolute',
              right: '3.0%',
              top: '2.9%',
              minWidth: '30%',
              height: '2.9%',
              padding: '0 14px',
              borderRadius: 10,
              backgroundColor: '#563e2d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontFamily: FONT_SANS,
              fontSize: 16.5,
              color: '#f5efe6',
            }}
          >
            {activeRound.roundLabel}
          </div>

          {/* Target Scale Prompt Header Override (covers 0.078..0.128 cleanly above subtitle!) */}
          <div
            style={{
              position: 'absolute',
              left: '28%',
              top: '7.8%',
              width: '44%',
              height: '4.9%',
              borderRadius: 14,
              backgroundColor: '#523b2c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: '#fde68a' }}>
              {activeRound.scaleName}
            </div>
          </div>

          {/* Mechanical Lever Visual Badges on Neck + Subtle Scale-Walk Filaments */}
          <svg
            width={phoneWidth - 24}
            height={phoneHeight - 24}
            viewBox={`0 0 ${phoneWidth - 24} ${phoneHeight - 24}`}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}
          >
            {/* Dynamic Lever Neck Indicators (visualizes engaged ↑ vs open ↓ state right on the harp neck) */}
            {leverStateUp.map((isUp, idx) => {
              const sc = HARP_STRING_COORDS[idx + 1];
              const iw = phoneWidth - 24;
              const ih = phoneHeight - 24;
              const px = sc.x1 * iw;
              const py = (sc.y1 + 0.017) * ih;
              const recentlyFlipped = activeRound.leverFlips.some(
                (f) => f.stringNum === idx + 1 && frame >= f.flipFrame && frame <= f.flipFrame + 24
              );
              return (
                <g key={`lev-neck-${idx}`}>
                  <circle
                    cx={px}
                    cy={py}
                    r={recentlyFlipped ? 13 : 8}
                    fill={isUp ? 'rgba(245, 184, 65, 0.9)' : 'rgba(20, 26, 34, 0.72)'}
                    stroke={isUp ? '#fef3c7' : 'rgba(148,163,184,0.65)'}
                    strokeWidth={recentlyFlipped ? 2.5 : 1.5}
                  />
                </g>
              );
            })}

            {/* Subtle String Illuminations during Scale Walkdown */}
            {activeRound.walkNotes.map((wn, idx) => {
              if (frame < wn.frame || frame > wn.frame + 26) return null;
              const dt = frame - wn.frame;
              const env = Math.pow(Math.max(0, 1 - dt / 26), 1.35);
              const sc = HARP_STRING_COORDS[wn.stringNum];
              const iw = phoneWidth - 24;
              const ih = phoneHeight - 24;
              const x1 = sc.x1 * iw;
              const y1 = sc.y1 * ih;
              const x2 = sc.x2 * iw;
              const y2 = sc.y2 * ih;
              const col = wn.pitchGlowColor || '#fde68a';
              return (
                <g key={`lev-walk-${idx}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="7" strokeLinecap="round" opacity={0.28 * env} />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="2.8" strokeLinecap="round" opacity={0.86 * env} />
                </g>
              );
            })}
          </svg>

          {/* Bottom 8 Lever Toggle Tiles C..C2 (100% opaque to prevent double glyph bleed) */}
          <div
            style={{
              position: 'absolute',
              left: '2.7%',
              top: '83.0%',
              width: '94.6%',
              height: '6.5%',
              display: 'flex',
              gap: 6,
              zIndex: 5,
            }}
          >
            {tilesLabels.map((lbl, idx) => {
              const isUp = leverStateUp[idx];
              const isWalkActive = walkIdx === idx;
              return (
                <div
                  key={lbl}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    backgroundColor: isWalkActive
                      ? '#133a2c'
                      : isUp
                      ? '#3b2a10'
                      : '#13171b',
                    border: isWalkActive
                      ? '2.2px solid #34d399'
                      : isUp
                      ? '1.6px solid #f5b841'
                      : '1.2px solid rgba(255,255,255,0.22)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 18,
                      fontWeight: 700,
                      color: isUp ? '#fde68a' : '#f1f5f9',
                      lineHeight: 1.05,
                    }}
                  >
                    {lbl}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_NUM,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: isUp ? '#f5b841' : '#94a3b8',
                      marginTop: 2,
                    }}
                  >
                    {isUp ? '↑ UP' : '↓ DN'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Scale Button Press Pulse */}
          {frame >= activeRound.confirmTapFrame - 4 && frame <= activeRound.confirmTapFrame + 16 && (
            <div
              style={{
                position: 'absolute',
                left: '3.2%',
                top: '90.4%',
                width: '93.6%',
                height: '6.6%',
                borderRadius: 18,
                border: '2.5px solid #fde68a',
                background: 'rgba(245, 184, 65, 0.22)',
                zIndex: 6,
              }}
            />
          )}

          {/* Genuine LeverTrainingScreen Feedback + 8-Note Walk Progress Overlay */}
          {afterConfirm && (
            <div
              style={{
                position: 'absolute',
                left: '6%',
                top: '57%',
                width: '88%',
                padding: '18px 22px',
                borderRadius: 24,
                background: 'rgba(14, 18, 16, 0.94)',
                border: activeRound.verdictCorrect
                  ? '1.8px solid rgba(52, 211, 153, 0.78)'
                  : '1.8px solid rgba(245, 184, 65, 0.85)',
                boxShadow: '0 22px 54px rgba(0,0,0,0.72)',
                textAlign: 'center',
                zIndex: 9,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 30,
                  fontWeight: 700,
                  color: activeRound.verdictCorrect ? '#6ee7b7' : '#fde68a',
                }}
              >
                {activeRound.verdictHeadline}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 16.5,
                  color: '#e2e8f0',
                  marginTop: 4,
                  marginBottom: 14,
                }}
              >
                {activeRound.verdictSubline}
              </div>

              {/* 8 Sequential Scale Notes Start-to-Finish (matching real app!) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                {activeRound.walkNotes.map((wn, idx) => {
                  const isLit = walkIdx === idx;
                  const done = frame >= wn.frame;
                  return (
                    <div
                      key={`walk-pill-${idx}`}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 8,
                        background: isLit
                          ? 'rgba(245, 184, 65, 0.28)'
                          : done
                          ? 'rgba(255,255,255,0.08)'
                          : 'transparent',
                        borderBottom: isLit
                          ? '2.5px solid #fde68a'
                          : done
                          ? '2px solid #94a3b8'
                          : '2px solid rgba(255,255,255,0.16)',
                        fontFamily: FONT_SANS,
                        fontSize: 14,
                        fontWeight: isLit ? 700 : 500,
                        color: isLit ? '#fef3c7' : done ? '#f1f5f9' : '#64748b',
                      }}
                    >
                      {wn.noteLabel}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Coaching Text */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: 68,
          right: 68,
          textAlign: 'center',
          zIndex: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 27,
            fontWeight: 500,
            color: 'rgba(241,245,249,0.92)',
            lineHeight: 1.38,
            textShadow: '0 4px 18px rgba(0,0,0,0.8)',
          }}
        >
          {activeCaption.bottomCoach}
        </div>
      </div>
    </AbsoluteFill>
  );
};
