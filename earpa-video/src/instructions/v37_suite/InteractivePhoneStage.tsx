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
  decideStartFrame?: number;
  keyTaps: KeyTapSpec[];
  lockInBanner?: string;
  verdictFrame: number;
  verdictCorrect: boolean;
  verdictTitle: string;
  verdictDetail: string;
  actualKeyIndex?: number;
  walkPlucks: { stringNum: number; frame: number; noteLabel: string }[];
  // Optional Path 2 note slot labels synced with keyTaps
  slotNotes?: { note: string; revealFrame: number }[];
}

export interface LeverRoundEvent {
  scaleName: string;
  roundLabel: string; // e.g. "Level 1 · 2 / 3"
  roundStartFrame: number;
  decideStartFrame?: number;
  lockInPromptFrame?: number;
  // Target initial & user-flipped states per string 1..8 (true = UP)
  initialLevers: boolean[];
  leverFlips: { stringNum: number; flipFrame: number; targetUp: boolean }[];
  skippedStringNum?: number;
  confirmTapFrame: number;
  verdictFrame?: number;
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

/** Crisp visible fingertip cursor + ripple inside phone frame */
const TouchCursor: React.FC<{
  xPct: number;
  yPct: number;
  visible: boolean;
  pressed: boolean;
  accentColor: string;
}> = ({ xPct, yPct, visible, pressed, accentColor }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: `translate(-50%, -50%) scale(${pressed ? 0.84 : 1})`,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: pressed ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.22)',
        border: `2.5px solid ${pressed ? '#fde68a' : accentColor}`,
        boxShadow: `0 0 ${pressed ? 24 : 14}px rgba(255,255,255,0.55)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 12,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 8px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
};

/**
 * Large Live Gameplay Stage (710px wide phone) supporting Path 1 & Path 2
 * with exact real-time cadence chords, thinking hum-C window, visible cursor deciding & tapping,
 * dedicated 1.85s LOCKED IN evaluation card, clear Right/Wrong confirmation, and walkdown/replay.
 */
export const LiveGameplayPhoneStage: React.FC<{
  theme: 'single' | 'melody';
  textureSrc: string;
  totalFrames: number;
  levelCode: string;
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

  let activeRound = rounds[0];
  for (const r of rounds) {
    if (frame >= r.roundStartFrame) activeRound = r;
  }

  const activeCaption =
    captions.find((c) => frame >= c.startFrame && frame < c.endFrame) ||
    captions[captions.length - 1];

  const plucks: StringPluckSpec[] = [];
  for (const r of rounds) {
    const c1 = r.cadenceChordFrames[0];
    const c2 = r.cadenceChordFrames[1];
    const c3 = r.cadenceChordFrames[2];
    const c4 = r.cadenceChordFrames[3];
    [1, 3, 5].forEach((s) => plucks.push({ stringNum: s, startFrame: c1, durationFrames: 24, color: '#fde68a' }));
    [4, 6, 8].forEach((s) => plucks.push({ stringNum: s, startFrame: c2, durationFrames: 24, color: '#fde68a' }));
    [5, 7].forEach((s) => plucks.push({ stringNum: s, startFrame: c3, durationFrames: 24, color: '#fde68a' }));
    [1, 3, 5].forEach((s) => plucks.push({ stringNum: s, startFrame: c4, durationFrames: 34, color: '#fde68a' }));

    r.mysteryPluckFrames.forEach((pf, idx) => {
      const sNum = r.mysteryStrings[idx] ?? r.mysteryStrings[0];
      plucks.push({ stringNum: sNum, startFrame: pf, durationFrames: 42, color: palette.accentSoft });
    });

    r.walkPlucks.forEach((wp) => {
      plucks.push({
        stringNum: wp.stringNum,
        startFrame: wp.frame,
        durationFrames: 32,
        color: r.verdictCorrect ? '#6ee7b7' : '#fbbf24',
      });
    });
  }

  let activeChordIdx = -1;
  activeRound.cadenceChordFrames.forEach((cf, idx) => {
    const chordEnd = idx < 3 ? activeRound.cadenceChordFrames[idx + 1] : cf + 48;
    if (frame >= cf && frame < chordEnd) activeChordIdx = idx;
  });

  const lastMysteryFrame = activeRound.mysteryPluckFrames[activeRound.mysteryPluckFrames.length - 1];
  const lastTapFrame =
    activeRound.keyTaps[activeRound.keyTaps.length - 1]?.tapFrame ?? activeRound.verdictFrame - 45;
  const decideStart = activeRound.decideStartFrame ?? Math.max(lastMysteryFrame + 30, (activeRound.keyTaps[0]?.tapFrame ?? lastTapFrame) - 36);

  const afterMystery = frame >= lastMysteryFrame;
  const inDecidePhase = frame >= decideStart && frame < lastTapFrame + 4;
  const inLockInBeat = frame >= lastTapFrame && frame < activeRound.verdictFrame;
  const afterVerdict = frame >= activeRound.verdictFrame;
  const inWalk = activeRound.walkPlucks.length > 0 && frame >= activeRound.walkPlucks[0].frame - 4;

  let currentWalkLabel = '';
  if (inWalk) {
    const activeSteps = activeRound.walkPlucks.filter((w) => frame >= w.frame);
    if (activeSteps.length > 0) {
      currentWalkLabel = activeSteps.map((w) => w.noteLabel).join('  ·  ');
    }
  }

  let promptPillText = 'Listen to the home chords...';
  let promptBorderColor = 'rgba(52, 211, 153, 0.45)';
  if (activeChordIdx >= 0) {
    const chordNames = ['I (C)', 'IV (F)', 'V (G)', 'I (C)'];
    promptPillText = `Home Chords · ${chordNames[activeChordIdx]} · Settles to C`;
    promptBorderColor = 'rgba(251, 191, 36, 0.55)';
  } else if (!afterMystery && theme === 'melody' && frame >= activeRound.mysteryPluckFrames[0] - 2) {
    promptPillText = 'Listen · Catch all 3 melody notes';
    promptBorderColor = 'rgba(56, 189, 248, 0.55)';
  } else if (afterMystery && frame < decideStart) {
    promptPillText =
      theme === 'single'
        ? 'Think · Hum home C and feel the pull'
        : 'Think · Hum home C & picture the shape';
    promptBorderColor = 'rgba(253, 230, 138, 0.60)';
  } else if (inDecidePhase) {
    promptPillText =
      theme === 'single'
        ? 'Decide · Tap your chosen note to lock in'
        : 'Decide · Tap the 3 notes in order';
    promptBorderColor = '#fde68a';
  } else if (inLockInBeat) {
    promptPillText = 'Locked In · App checking your answer...';
    promptBorderColor = '#fde68a';
  } else if (afterVerdict && !inWalk) {
    promptPillText = activeRound.verdictCorrect
      ? 'Confirmed · Right Answer!'
      : 'Confirmed · Wrong Answer — See Actual Note';
    promptBorderColor = activeRound.verdictCorrect ? '#34d399' : '#f59e0b';
  } else if (afterVerdict && inWalk && currentWalkLabel) {
    promptPillText =
      theme === 'single'
        ? `Walking back to home C · ${currentWalkLabel}`
        : `Hearing true melody · ${currentWalkLabel}`;
    promptBorderColor = activeRound.verdictCorrect
      ? 'rgba(52, 211, 153, 0.72)'
      : 'rgba(251, 191, 36, 0.72)';
  }

  const showHumC =
    activeRound.humCueStartFrame !== undefined &&
    activeRound.humCueEndFrame !== undefined &&
    frame >= activeRound.humCueStartFrame &&
    frame <= activeRound.humCueEndFrame;

  const nextRound = rounds.find((r) => r.roundNumber === activeRound.roundNumber + 1);
  const verdictVisible = afterVerdict && (!nextRound || frame < nextRound.roundStartFrame - 4);
  const lockInVisible = inLockInBeat && (!nextRound || frame < nextRound.roundStartFrame - 4);

  // Animate TouchCursor gliding cleanly across keyTaps
  let cursorVisible = false;
  let cursorX = 50;
  let cursorY = 82;
  let cursorPressed = false;
  if (frame >= decideStart - 6 && frame <= lastTapFrame + 14) {
    cursorVisible = true;
    const taps = activeRound.keyTaps;
    if (taps.length === 1) {
      const targetX = 8.5 + taps[0].keyIndex * 11.95;
      const p = interpolate(frame, [decideStart - 4, taps[0].tapFrame - 6], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorX = interpolate(p, [0, 1], [50, targetX]);
      cursorY = interpolate(p, [0, 1], [78, 94.3]);
      cursorPressed = frame >= taps[0].tapFrame - 2 && frame <= taps[0].tapFrame + 8;
    } else if (taps.length > 1) {
      const kIdx0 = taps[0];
      const tx0 = 8.5 + kIdx0.keyIndex * 11.95;
      if (frame < kIdx0.tapFrame + 4) {
        const p = interpolate(frame, [decideStart - 4, kIdx0.tapFrame - 5], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        cursorX = interpolate(p, [0, 1], [50, tx0]);
        cursorY = interpolate(p, [0, 1], [78, 94.3]);
        cursorPressed = frame >= kIdx0.tapFrame - 2 && frame <= kIdx0.tapFrame + 4;
      } else {
        // Interpolate hop between sequential notes
        let segIdx = 0;
        for (let i = 1; i < taps.length; i++) {
          if (frame >= taps[i - 1].tapFrame + 4) segIdx = i;
        }
        const prevTap = taps[Math.max(0, segIdx - 1)];
        const curTap = taps[segIdx];
        const prevX = 8.5 + prevTap.keyIndex * 11.95;
        const curX = 8.5 + curTap.keyIndex * 11.95;
        const p = interpolate(frame, [prevTap.tapFrame + 5, curTap.tapFrame - 4], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        cursorX = interpolate(p, [0, 1], [prevX, curX]);
        cursorY = 94.3 - Math.sin(p * Math.PI) * 3.5;
        cursorPressed = frame >= curTap.tapFrame - 2 && frame <= curTap.tapFrame + 5;
      }
    }
  }

  return (
    <AbsoluteFill style={{ opacity: Math.min(entry, exit) }}>
      <SanctuaryBackdrop theme={theme} blurPx={18} photoOpacity={0.28} ringOpacity={0.12} />

      <div style={{ position: 'absolute', top: 48, left: 56, right: 56, textAlign: 'center', zIndex: 8 }}>
        <div style={{ fontFamily: FONT_NUM, fontSize: 18, fontWeight: 700, letterSpacing: '0.26em', color: palette.accentSoft, marginBottom: 8 }}>
          {activeCaption.topTag}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 700, color: '#f8fafc', lineHeight: 1.08 }}>
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
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', backgroundColor: '#040a0c' }}>
          <Img src={staticFile(textureSrc)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

          {/* Top Round Progress Pill Replacement (100% opaque) */}
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
                  <path d={`M ${x1} ${y1} Q ${cx} ${my} ${x2} ${y2}`} fill="none" stroke={strokeCol} strokeWidth="7.5" strokeLinecap="round" opacity={0.28 * env} />
                  <path d={`M ${x1} ${y1} Q ${cx} ${my} ${x2} ${y2}`} fill="none" stroke={strokeCol} strokeWidth="2.8" strokeLinecap="round" opacity={0.82 * env} />
                  {dt <= 14 && (
                    <circle cx={cx} cy={my} r={interpolate(dt, [0, 14], [4, 15])} fill="none" stroke={strokeCol} strokeWidth="1.6" opacity={interpolate(dt, [0, 14], [0.7, 0])} />
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
                left: '24%',
                top: '87.4%',
                width: '52%',
                height: '3.1%',
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
                const clearAtNext = nextRound && frame >= nextRound.roundStartFrame - 4;
                const showFill = filled && !clearAtNext;
                return (
                  <div
                    key={slotIdx}
                    style={{
                      flex: 1,
                      height: '100%',
                      borderRadius: 999,
                      background: showFill ? '#0d3654' : '#121926',
                      border: showFill ? '1.8px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.34)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: FONT_DISPLAY,
                      fontSize: showFill ? 17 : 13,
                      fontWeight: 700,
                      color: showFill ? '#e0f2fe' : '#64748b',
                    }}
                  >
                    {showFill ? sn.note : `Note ${slotIdx + 1}`}
                  </div>
                );
              })}
            </div>
          )}

          {/* Key Touch Press Highlight over Keyboard C..C (persists cleanly through Locked-In & Verdict!) */}
          {activeRound.keyTaps.map((kt, idx) => {
            const hideAt = nextRound ? nextRound.roundStartFrame - 4 : totalFrames;
            if (frame < kt.tapFrame || frame > Math.min(hideAt, activeRound.verdictFrame + 65)) return null;
            const leftPct = 3.2 + kt.keyIndex * 11.95;
            const isAfterV = frame >= activeRound.verdictFrame;
            const col = !isAfterV ? '#fde68a' : kt.isCorrect === false ? '#f59e0b' : '#34d399';
            const bg = !isAfterV
              ? 'rgba(253, 230, 138, 0.28)'
              : kt.isCorrect === false
              ? 'rgba(245, 158, 11, 0.34)'
              : 'rgba(52, 211, 153, 0.32)';
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
                  background: bg,
                  border: `2.5px solid ${col}`,
                  boxShadow: `0 0 22px ${col}`,
                  pointerEvents: 'none',
                  zIndex: 6,
                }}
              />
            );
          })}

          {/* On Wrong Guess in Path 1, highlight the ACTUAL right key in bright Emerald so comparison is unmistakable */}
          {afterVerdict && !activeRound.verdictCorrect && activeRound.actualKeyIndex !== undefined && (!nextRound || frame < nextRound.roundStartFrame - 4) && (
            <div
              style={{
                position: 'absolute',
                left: `${3.2 + activeRound.actualKeyIndex * 11.95}%`,
                top: '91.5%',
                width: '10.6%',
                height: '5.7%',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.26)',
                border: '2.5px solid #34d399',
                boxShadow: '0 0 24px rgba(52, 211, 153, 0.85)',
                pointerEvents: 'none',
                zIndex: 6,
              }}
            />
          )}

          {/* Smooth Animated Touch Finger Cursor */}
          <TouchCursor
            xPct={cursorX}
            yPct={cursorY}
            visible={cursorVisible}
            pressed={cursorPressed}
            accentColor={palette.accentSoft}
          />

          {/* Dynamic Prompt Pill Mask */}
          <div
            style={{
              position: 'absolute',
              left: '14%',
              top: theme === 'single' ? '86.8%' : '83.2%',
              width: '72%',
              height: '3.9%',
              borderRadius: 999,
              backgroundColor: '#0e1722',
              border: `1.5px solid ${promptBorderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 7,
            }}
          >
            <div style={{ fontFamily: FONT_SANS, fontSize: 14.5, fontWeight: 600, color: '#f8fafc', letterSpacing: '0.01em' }}>
              {promptPillText}
            </div>
          </div>

          {/* Dedicated LOCKED IN Card (Visible during 1.85s Decision Check Pause BEFORE Verdict!) */}
          {lockInVisible && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: theme === 'single' ? '77.5%' : '74.5%',
                transform: `translate(-50%, -50%) scale(${spring({
                  frame: frame - lastTapFrame,
                  fps,
                  config: { damping: 20, stiffness: 140 },
                })})`,
                minWidth: '62%',
                padding: '14px 26px',
                borderRadius: 24,
                background: 'rgba(12, 18, 28, 0.94)',
                border: '1.8px solid rgba(253, 230, 138, 0.85)',
                boxShadow: '0 16px 42px rgba(0,0,0,0.65), 0 0 28px rgba(253, 230, 138, 0.25)',
                textAlign: 'center',
                zIndex: 9,
              }}
            >
              <div style={{ fontFamily: FONT_NUM, fontSize: 14, fontWeight: 700, letterSpacing: '0.18em', color: '#fde68a' }}>
                {activeRound.lockInBanner || 'ANSWER LOCKED IN'}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 25, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                Checking your answer...
              </div>
            </div>
          )}

          {/* Clear Right / Wrong Confirmation Banner (Reveals cleanly AFTER Lock-In Pause!) */}
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
                minWidth: '62%',
                padding: '14px 26px',
                borderRadius: 24,
                background: activeRound.verdictCorrect ? 'rgba(6, 42, 32, 0.95)' : 'rgba(62, 22, 16, 0.95)',
                border: activeRound.verdictCorrect
                  ? '2px solid rgba(52, 211, 153, 0.9)'
                  : '2px solid rgba(251, 146, 60, 0.92)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
                textAlign: 'center',
                zIndex: 9,
              }}
            >
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 29, fontWeight: 700, color: activeRound.verdictCorrect ? '#6ee7b7' : '#fdba74' }}>
                {activeRound.verdictCorrect ? '✓ ' : '✕ '}
                {activeRound.verdictTitle}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 17, fontWeight: 600, color: '#f8fafc', marginTop: 3 }}>
                {activeRound.verdictDetail}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lower Coaching Strip */}
      <div style={{ position: 'absolute', bottom: 44, left: 68, right: 68, textAlign: 'center', zIndex: 8 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 27, fontWeight: 500, color: 'rgba(241,245,249,0.92)', lineHeight: 1.38, textShadow: '0 4px 18px rgba(0,0,0,0.8)' }}>
          {activeCaption.bottomCoach}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Large Live Gameplay Stage specifically for Path 3 Levers (LeverTrainingScreen)
 * showing clear Thinking -> Flipping Levers -> Pressing Confirm to Lock In -> 1.85s Checking beat ->
 * Clear Right/Wrong diagnosis -> 8-note start-to-finish scale walk @ 550ms/note.
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
  const verdictAt = activeRound.verdictFrame ?? activeRound.confirmTapFrame + 48;
  const decideStart = activeRound.decideStartFrame ?? activeRound.roundStartFrame + 95;
  const lockPromptAt = activeRound.lockInPromptFrame ?? activeRound.confirmTapFrame - 35;

  const inLockInBeat = frame >= activeRound.confirmTapFrame && frame < verdictAt;
  const afterVerdict = frame >= verdictAt;

  const walkIdx = activeRound.walkNotes.findIndex((w, i) => {
    const nextF = activeRound.walkNotes[i + 1]?.frame ?? w.frame + 18;
    return frame >= w.frame && frame < nextF;
  });

  // Animated TouchCursor path: visits each flipped tile in order, then glides down to Confirm scale!
  let cursorVisible = false;
  let cursorX = 50;
  let cursorY = 74;
  let cursorPressed = false;
  if (frame >= decideStart - 6 && frame <= activeRound.confirmTapFrame + 14) {
    cursorVisible = true;
    const waypoints = [
      ...activeRound.leverFlips.map((fl) => ({
        x: 8.5 + (fl.stringNum - 1) * 11.85,
        y: 86.2,
        f: fl.flipFrame,
      })),
      { x: 50, y: 93.7, f: activeRound.confirmTapFrame },
    ];
    if (frame < waypoints[0].f + 5) {
      const p = interpolate(frame, [decideStart - 4, waypoints[0].f - 5], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorX = interpolate(p, [0, 1], [50, waypoints[0].x]);
      cursorY = interpolate(p, [0, 1], [72, waypoints[0].y]);
      cursorPressed = frame >= waypoints[0].f - 2 && frame <= waypoints[0].f + 5;
    } else {
      let seg = 1;
      for (let i = 1; i < waypoints.length; i++) {
        if (frame >= waypoints[i - 1].f + 5) seg = i;
      }
      const prev = waypoints[seg - 1];
      const cur = waypoints[seg];
      const p = interpolate(frame, [prev.f + 5, cur.f - 5], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorX = interpolate(p, [0, 1], [prev.x, cur.x]);
      cursorY = interpolate(p, [0, 1], [prev.y, cur.y]);
      cursorPressed = frame >= cur.f - 2 && frame <= cur.f + 6;
    }
  }

  let leverPromptText = `Think · Count clockwise steps from E♭ for ${activeRound.scaleName}`;
  let leverPromptColor = 'rgba(253, 230, 138, 0.55)';
  if (frame >= decideStart && frame < lockPromptAt) {
    leverPromptText = 'Decide · Tap harp strings or tiles below to lift levers';
    leverPromptColor = '#fde68a';
  } else if (frame >= lockPromptAt && frame < activeRound.confirmTapFrame) {
    leverPromptText = 'Ready · Press Confirm scale ↓ to lock in your setup';
    leverPromptColor = '#fbbf24';
  } else if (inLockInBeat) {
    leverPromptText = 'Locked In · App checking all 8 levers...';
    leverPromptColor = '#fde68a';
  } else if (afterVerdict) {
    leverPromptText = activeRound.verdictCorrect
      ? 'Right Setup! · Walking full scale start to finish'
      : 'Wrong Setup · Missed lever glows amber below';
    leverPromptColor = activeRound.verdictCorrect ? '#34d399' : '#fb923c';
  }

  return (
    <AbsoluteFill style={{ opacity: Math.min(entry, exit) }}>
      <SanctuaryBackdrop theme="levers" blurPx={18} photoOpacity={0.28} ringOpacity={0.14} />

      <div style={{ position: 'absolute', top: 48, left: 56, right: 56, textAlign: 'center', zIndex: 8 }}>
        <div style={{ fontFamily: FONT_NUM, fontSize: 18, fontWeight: 700, letterSpacing: '0.26em', color: palette.accentSoft, marginBottom: 8 }}>
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
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', backgroundColor: '#0c0804' }}>
          <Img src={staticFile(textureSrc)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

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

          <svg
            width={phoneWidth - 24}
            height={phoneHeight - 24}
            viewBox={`0 0 ${phoneWidth - 24} ${phoneHeight - 24}`}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}
          >
            {leverStateUp.map((isUp, idx) => {
              const sc = HARP_STRING_COORDS[idx + 1];
              const iw = phoneWidth - 24;
              const ih = phoneHeight - 24;
              const px = sc.x1 * iw;
              const py = (sc.y1 + 0.017) * ih;
              const recentlyFlipped = activeRound.leverFlips.some(
                (f) => f.stringNum === idx + 1 && frame >= f.flipFrame && frame <= f.flipFrame + 24
              );
              const isMissedAfterVerdict = afterVerdict && activeRound.skippedStringNum === idx + 1;
              return (
                <g key={`lev-neck-${idx}`}>
                  <circle
                    cx={px}
                    cy={py}
                    r={isMissedAfterVerdict ? 14 : recentlyFlipped ? 13 : 8}
                    fill={
                      isMissedAfterVerdict
                        ? 'rgba(251, 146, 60, 0.95)'
                        : isUp
                        ? 'rgba(245, 184, 65, 0.9)'
                        : 'rgba(20, 26, 34, 0.72)'
                    }
                    stroke={isMissedAfterVerdict ? '#fff7ed' : isUp ? '#fef3c7' : 'rgba(148,163,184,0.65)'}
                    strokeWidth={isMissedAfterVerdict || recentlyFlipped ? 2.6 : 1.5}
                  />
                </g>
              );
            })}

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

          {/* Opaque Lever Step Status Mask cleanly covering "Show Circle of Fifths" */}
          <div
            style={{
              position: 'absolute',
              left: '14%',
              top: '76.6%',
              width: '72%',
              height: '5.3%',
              borderRadius: 999,
              backgroundColor: '#191410',
              border: `1.5px solid ${leverPromptColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 7,
            }}
          >
            <div style={{ fontFamily: FONT_SANS, fontSize: 14.5, fontWeight: 600, color: '#fef3c7' }}>
              {leverPromptText}
            </div>
          </div>

          {/* Bottom 8 Lever Toggle Tiles C..C2 */}
          <div style={{ position: 'absolute', left: '2.7%', top: '83.0%', width: '94.6%', height: '6.5%', display: 'flex', gap: 6, zIndex: 5 }}>
            {tilesLabels.map((lbl, idx) => {
              const isUp = leverStateUp[idx];
              const isWalkActive = walkIdx === idx;
              const isMissed = afterVerdict && activeRound.skippedStringNum === idx + 1;
              return (
                <div
                  key={lbl}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    backgroundColor: isMissed
                      ? '#5b2416'
                      : isWalkActive
                      ? '#133a2c'
                      : isUp
                      ? '#3b2a10'
                      : '#13171b',
                    border: isMissed
                      ? '2.4px solid #fb923c'
                      : isWalkActive
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
                  <div style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 700, color: isMissed ? '#fed7aa' : isUp ? '#fde68a' : '#f1f5f9', lineHeight: 1.05 }}>
                    {lbl}
                  </div>
                  <div style={{ fontFamily: FONT_NUM, fontSize: 11.5, fontWeight: 700, color: isMissed ? '#fb923c' : isUp ? '#f5b841' : '#94a3b8', marginTop: 2 }}>
                    {isMissed ? 'NEED ↑' : isUp ? '↑ UP' : '↓ DN'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Scale Button Highlight (Pre-tap ready cue + Lock-In pulse) */}
          {frame >= lockPromptAt && frame < verdictAt && (
            <div
              style={{
                position: 'absolute',
                left: '3.2%',
                top: '90.4%',
                width: '93.6%',
                height: '6.6%',
                borderRadius: 18,
                border: inLockInBeat ? '3px solid #fde68a' : '2px solid rgba(245, 184, 65, 0.72)',
                background: inLockInBeat ? 'rgba(245, 184, 65, 0.28)' : 'rgba(245, 184, 65, 0.10)',
                zIndex: 6,
              }}
            />
          )}

          {/* Smooth Animated Touch Finger Cursor */}
          <TouchCursor
            xPct={cursorX}
            yPct={cursorY}
            visible={cursorVisible}
            pressed={cursorPressed}
            accentColor={palette.accentSoft}
          />

          {/* LOCKED IN Card during 1.85s Check Beat */}
          {inLockInBeat && (
            <div
              style={{
                position: 'absolute',
                left: '6%',
                top: '57%',
                width: '88%',
                padding: '18px 22px',
                borderRadius: 24,
                background: 'rgba(18, 15, 11, 0.94)',
                border: '2px solid rgba(253, 230, 138, 0.88)',
                boxShadow: '0 22px 54px rgba(0,0,0,0.72)',
                textAlign: 'center',
                zIndex: 9,
              }}
            >
              <div style={{ fontFamily: FONT_NUM, fontSize: 15, fontWeight: 700, letterSpacing: '0.18em', color: '#fde68a' }}>
                CONFIRM PRESSED · SETUP LOCKED IN
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: '#f8fafc', marginTop: 6 }}>
                Checking all 8 levers...
              </div>
            </div>
          )}

          {/* Clear Right/Wrong Confirmation + 8-Note Walk Progress Overlay */}
          {afterVerdict && (
            <div
              style={{
                position: 'absolute',
                left: '6%',
                top: '57%',
                width: '88%',
                padding: '18px 22px',
                borderRadius: 24,
                background: activeRound.verdictCorrect ? 'rgba(8, 28, 22, 0.95)' : 'rgba(38, 18, 12, 0.95)',
                border: activeRound.verdictCorrect ? '2px solid rgba(52, 211, 153, 0.88)' : '2px solid rgba(251, 146, 60, 0.90)',
                boxShadow: '0 22px 54px rgba(0,0,0,0.72)',
                textAlign: 'center',
                zIndex: 9,
              }}
            >
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: activeRound.verdictCorrect ? '#6ee7b7' : '#fdba74' }}>
                {activeRound.verdictCorrect ? '✓ ' : '✕ '}
                {activeRound.verdictHeadline}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 16.5, color: '#f8fafc', marginTop: 4, marginBottom: 14 }}>
                {activeRound.verdictSubline}
              </div>

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
                        background: isLit ? 'rgba(245, 184, 65, 0.28)' : done ? 'rgba(255,255,255,0.08)' : 'transparent',
                        borderBottom: isLit ? '2.5px solid #fde68a' : done ? '2px solid #94a3b8' : '2px solid rgba(255,255,255,0.16)',
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

      <div style={{ position: 'absolute', bottom: 44, left: 68, right: 68, textAlign: 'center', zIndex: 8 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 27, fontWeight: 500, color: 'rgba(241,245,249,0.92)', lineHeight: 1.38, textShadow: '0 4px 18px rgba(0,0,0,0.8)' }}>
          {activeCaption.bottomCoach}
        </div>
      </div>
    </AbsoluteFill>
  );
};
