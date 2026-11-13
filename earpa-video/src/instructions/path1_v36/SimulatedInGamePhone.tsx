import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const STRING_COORDS: Record<number, { x1: number; y1: number; x2: number; y2: number; letter: string }> = {
  1: { x1: 0.285, y1: 0.140, x2: 0.440, y2: 0.722, letter: 'C' },
  2: { x1: 0.348, y1: 0.158, x2: 0.483, y2: 0.676, letter: 'D' },
  3: { x1: 0.411, y1: 0.175, x2: 0.524, y2: 0.630, letter: 'E' },
  4: { x1: 0.473, y1: 0.197, x2: 0.562, y2: 0.584, letter: 'F' },
  5: { x1: 0.538, y1: 0.223, x2: 0.599, y2: 0.538, letter: 'G' },
  6: { x1: 0.598, y1: 0.252, x2: 0.635, y2: 0.491, letter: 'A' },
  7: { x1: 0.656, y1: 0.281, x2: 0.670, y2: 0.443, letter: 'B' },
  8: { x1: 0.710, y1: 0.303, x2: 0.706, y2: 0.397, letter: 'C' },
};

export const KEY_CENTERS_X = [0.085, 0.204, 0.322, 0.441, 0.559, 0.678, 0.796, 0.915];
const KEY_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

export interface FeedbackState {
  correct: boolean;
  title: string;
  note: string;
  insight: string;
  opacity: number;
}

export interface SimulatedInGamePhoneProps {
  roundNum: 1 | 2 | 3;
  statusText: string;
  statusAccent?: string;
  /** Highlighted bottom key index 0..7 when tapped */
  tappedKeyIdx?: number | null;
  tappedKeyAge?: number;
  tappedKeyColor?: string;
  /** Lit bottom key during resolution walk (0..7) */
  walkKeyIdx?: number | null;
  /** Lit string 1..8 ONLY during resolution walk (zero answer leakage before!) */
  activeStringNum?: number | null;
  activeStringAge?: number;
  activeStringColor?: string;
  /** Subtle cadence pulse border around harp during I-IV-V-I chords */
  cadenceChordActive?: number; // 0..1 intensity
  /** Authentic frosted verdict card shown ONLY after gravity explanation */
  feedback?: FeedbackState | null;
}

export const SimulatedInGamePhone: React.FC<SimulatedInGamePhoneProps> = ({
  roundNum,
  statusText,
  statusAccent = '#34d399',
  tappedKeyIdx = null,
  tappedKeyAge = 0,
  tappedKeyColor = '#34d399',
  walkKeyIdx = null,
  activeStringNum = null,
  activeStringAge = 0,
  activeStringColor = '#34d399',
  cadenceChordActive = 0,
  feedback = null,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const litString = activeStringNum ? STRING_COORDS[activeStringNum] : null;
  const tapSpring =
    tappedKeyIdx !== null
      ? spring({
          frame: Math.max(0, tappedKeyAge),
          fps,
          config: { damping: 14, stiffness: 210 },
        })
      : 0;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Crisp 3x Native Live App Base Texture */}
      <Img
        src={staticFile('textures/path1_v36/ingame_p1_12_clean.png')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Subtle warm ambient pulse glow on cadence chords (without highlighting any specific answer string!) */}
      {cadenceChordActive > 0.02 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 45%, rgba(251, 191, 36, ${
              cadenceChordActive * 0.14
            }) 0%, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top Header Pill Replacement showing accurate Round 1 / 2 / 3 */}
      <div
        style={{
          position: 'absolute',
          left: '31.5%',
          top: '2.1%',
          width: '37%',
          height: '4.9%',
          borderRadius: 16,
          backgroundColor: '#131d29',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 10px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10.5,
            color: 'rgba(203, 213, 225, 0.78)',
            letterSpacing: 0.2,
            marginBottom: 1,
          }}
        >
          Level 12 • Full Octave
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 15,
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: 3,
          }}
        >
          Round {roundNum} / 15
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((dot) => (
            <div
              key={dot}
              style={{
                width: dot === roundNum ? 7 : 5,
                height: dot === roundNum ? 7 : 5,
                borderRadius: 99,
                backgroundColor:
                  dot < roundNum
                    ? '#10b981'
                    : dot === roundNum
                    ? '#f8fafc'
                    : 'rgba(148, 163, 184, 0.35)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Luminous Vibrating String Overlay during Resolution Walk ONLY */}
      {litString && (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 2168"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {/* Outer diffused glow */}
          <line
            x1={litString.x1 * 1000}
            y1={litString.y1 * 2168}
            x2={litString.x2 * 1000}
            y2={litString.y2 * 2168}
            stroke={activeStringColor}
            strokeWidth={24}
            strokeOpacity={0.38}
            strokeLinecap="round"
          />
          {/* Vibrating string displacement harmonic */}
          <path
            d={`M ${litString.x1 * 1000} ${litString.y1 * 2168} Q ${
              ((litString.x1 + litString.x2) * 0.5) * 1000 +
              Math.sin(activeStringAge * 2.1) * 9 * Math.exp(-activeStringAge * 0.08)
            } ${((litString.y1 + litString.y2) * 0.5) * 2168} ${litString.x2 * 1000} ${
              litString.y2 * 2168
            }`}
            fill="none"
            stroke="#fef9c3"
            strokeWidth={7.5}
            strokeLinecap="round"
          />
          {/* Top Tuning Pin Star Sparkle */}
          <circle
            cx={litString.x1 * 1000}
            cy={litString.y1 * 2168}
            r={16}
            fill={activeStringColor}
            fillOpacity={0.55}
          />
        </svg>
      )}

      {/* Dynamic Bottom Status Pill (replaces clean region at y=87.4%..90.4%) */}
      <div
        style={{
          position: 'absolute',
          left: '14%',
          right: '14%',
          top: '87.4%',
          height: '3.2%',
          borderRadius: 999,
          backgroundColor: '#0c1821',
          border: `1.5px solid ${statusAccent}66`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: statusAccent,
            letterSpacing: 0.3,
          }}
        >
          {statusText}
        </span>
      </div>

      {/* Bottom Key Highlights / Simulated Tactile Tap Overlay */}
      {KEY_CENTERS_X.map((cx, idx) => {
        const isTapped = tappedKeyIdx === idx;
        const isWalkLit = walkKeyIdx === idx;
        if (!isTapped && !isWalkLit) return null;

        const color = isWalkLit ? activeStringColor : tappedKeyColor;
        const scale = isTapped
          ? interpolate(tapSpring, [0, 0.4, 1], [1, 0.91, 0.96])
          : 1.03;
        const rippleSize = isTapped ? 40 + tappedKeyAge * 4.5 : 0;
        const rippleOpacity = isTapped
          ? interpolate(tappedKeyAge, [0, 18], [0.75, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          : 0;

        return (
          <React.Fragment key={idx}>
            {isTapped && rippleOpacity > 0.01 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${cx * 100}%`,
                  top: '94.6%',
                  width: rippleSize,
                  height: rippleSize,
                  borderRadius: 999,
                  transform: 'translate(-50%, -50%)',
                  border: `3px solid ${color}`,
                  opacity: rippleOpacity,
                  pointerEvents: 'none',
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                left: `${(cx - 0.052) * 100}%`,
                top: '91.9%',
                width: '10.4%',
                height: '5.3%',
                borderRadius: 12,
                backgroundColor:
                  color === '#ef4444'
                    ? '#351010'
                    : color === '#fbbf24'
                    ? '#281d08'
                    : '#0c261b',
                border: `2.5px solid ${color}`,
                boxShadow: `0 0 22px ${color}88`,
                transform: `scale(${scale})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 23,
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                {KEY_LETTERS[idx]}
              </span>
            </div>
          </React.Fragment>
        );
      })}

      {/* Authentic Blurred Frosted Feedback Overlay (ONLY renders when feedback is passed!) */}
      {feedback && feedback.opacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(6, 12, 9, 0.50)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 36px',
            opacity: feedback.opacity,
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 44,
              fontWeight: 900,
              color: feedback.correct ? '#22c55e' : '#ef4444',
              letterSpacing: 1.1,
              textAlign: 'center',
              textShadow: '0 3px 14px rgba(0,0,0,0.85)',
              marginBottom: 22,
            }}
          >
            {feedback.title}
          </div>
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 96,
              fontWeight: 700,
              color: '#fef3c7',
              textShadow: '0 4px 20px rgba(254, 240, 138, 0.45)',
              marginBottom: 24,
            }}
          >
            {feedback.note}
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              lineHeight: 1.45,
              color: '#f8fafc',
              textAlign: 'center',
              fontStyle: 'italic',
              maxWidth: 480,
              textShadow: '0 2px 10px rgba(0,0,0,0.85)',
            }}
          >
            "{feedback.insight}"
          </div>
        </div>
      )}
    </div>
  );
};
