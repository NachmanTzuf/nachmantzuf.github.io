import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { KineticHeroText } from '../../earpa_short/KineticHeroText';

export interface GravitySchemaStageProps {
  startFrame: number;
  endFrame: number;
  fWalkStartFrame: number;
  bWalkStartFrame: number;
}

export const GravitySchemaStage: React.FC<GravitySchemaStageProps> = ({
  startFrame,
  endFrame,
  fWalkStartFrame,
  bWalkStartFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localF = frame - startFrame;
  const enter = spring({
    frame: localF,
    fps,
    config: { damping: 22, stiffness: 120 },
  });
  const exit = interpolate(frame, [endFrame - 14, endFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = enter * exit;

  // Step timings synced to audio: 0.46s = ~13.8 frames per note
  const fWalkLocal = frame - fWalkStartFrame;
  const bWalkLocal = frame - bWalkStartFrame;

  const activeFStep =
    fWalkLocal >= 0 && fWalkLocal < 60
      ? Math.min(3, Math.floor(fWalkLocal / 13.8))
      : -1;
  const activeBStep =
    bWalkLocal >= 0 && bWalkLocal < 46
      ? Math.min(1, Math.floor(bWalkLocal / 13.8))
      : -1;

  // Subtle geometric orbital rotation
  const ringRot = localF * 0.22;

  const tonicGlow =
    activeFStep === 3 || activeBStep === 1 ? 1.0 : 0.42 + 0.1 * Math.sin(localF * 0.08);

  const downSteps = [
    { note: 'F', sub: 'Degree 4', cx: 215, cy: 610 },
    { note: 'E', sub: 'Degree 3', cx: 318, cy: 760 },
    { note: 'D', sub: 'Degree 2', cx: 430, cy: 900 },
  ];

  const upNodeB = { note: 'B', sub: 'Leading Tone', cx: 790, cy: 1235 };

  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          'radial-gradient(circle at 50% 52%, rgba(16, 185, 129, 0.14) 0%, rgba(5, 19, 13, 0.96) 58%, #030806 100%)',
      }}
    >
      {/* Top 3-Tier Kinetic Typography */}
      <KineticHeroText
        prefix="MUSICAL PHYSICS"
        hero="TONAL GRAVITATION"
        suffix="Every scale degree leans home toward C"
        accentColor="#34d399"
        heroColor="#f6efdc"
        startFrame={startFrame}
        endFrame={endFrame}
        top={68}
      />

      {/* Dedicated Centerpiece Diagram (Zero clutter, 100% spatial breathing room) */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <radialGradient id="tonicSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity={0.95} />
            <stop offset="45%" stopColor="#10b981" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Orbital Gravitation Rings centered around (585, 1030) */}
        <g transform={`translate(585, 1030) rotate(${ringRot})`}>
          <circle
            r={380}
            fill="none"
            stroke="rgba(52, 211, 153, 0.16)"
            strokeWidth={2}
            strokeDasharray="10 14"
          />
          <circle
            r={260}
            fill="none"
            stroke="rgba(251, 191, 36, 0.22)"
            strokeWidth={2}
          />
        </g>

        {/* Downward Cascade Arc: F -> E -> D -> C */}
        <path
          d="M 215 610 Q 340 830 585 1030"
          fill="none"
          stroke={activeFStep >= 0 ? '#34d399' : 'rgba(52, 211, 153, 0.45)'}
          strokeWidth={activeFStep >= 0 ? 7 : 4}
          strokeDasharray="12 10"
        />

        {/* Upward Snap Arc: B -> C */}
        <path
          d="M 790 1235 Q 720 1110 585 1030"
          fill="none"
          stroke={activeBStep >= 0 ? '#fbbf24' : 'rgba(251, 191, 36, 0.50)'}
          strokeWidth={activeBStep >= 0 ? 7 : 4}
        />

        {/* Tonic Glow Aura */}
        <circle cx={585} cy={1030} r={190 * (0.9 + tonicGlow * 0.25)} fill="url(#tonicSun)" />

        {/* Central Tonic Sun Circle */}
        <circle
          cx={585}
          cy={1030}
          r={112}
          fill="#062217"
          stroke={tonicGlow > 0.7 ? '#fde68a' : '#34d399'}
          strokeWidth={tonicGlow > 0.7 ? 7 : 4.5}
        />
        <text
          x={585}
          y={1044}
          textAnchor="middle"
          fill="#fef3c7"
          fontSize={106}
          fontFamily="Georgia, Times New Roman, serif"
          fontWeight={700}
        >
          C
        </text>
        <text
          x={585}
          y={1094}
          textAnchor="middle"
          fill="#34d399"
          fontSize={18}
          fontFamily="Inter, sans-serif"
          fontWeight={800}
          letterSpacing={2.2}
        >
          HOME TONIC
        </text>

        {/* Downward Step Nodes: F -> E -> D */}
        {downSteps.map((st, idx) => {
          const isLit = activeFStep === idx;
          return (
            <g key={st.note} transform={`translate(${st.cx}, ${st.cy})`}>
              {isLit && (
                <circle r={72} fill="rgba(52, 211, 153, 0.28)" />
              )}
              <circle
                r={isLit ? 56 : 48}
                fill={isLit ? '#065f46' : '#082017'}
                stroke={isLit ? '#6ee7b7' : '#34d399'}
                strokeWidth={isLit ? 5 : 3}
              />
              <text
                y={14}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize={44}
                fontFamily="Georgia, serif"
                fontWeight={700}
              >
                {st.note}
              </text>
              <text
                x={-72}
                y={8}
                textAnchor="end"
                fill="#cbd5e1"
                fontSize={24}
                fontFamily="Inter, sans-serif"
                fontWeight={700}
                letterSpacing={1.2}
              >
                {st.sub}
              </text>
            </g>
          );
        })}

        {/* Downward Vector Label beside F */}
        <g transform="translate(205, 480)">
          <rect
            x={-135}
            y={-34}
            width={290}
            height={56}
            rx={14}
            fill="rgba(6, 30, 22, 0.9)"
            stroke="rgba(52, 211, 153, 0.55)"
            strokeWidth={1.5}
          />
          <text
            x={10}
            y={4}
            textAnchor="middle"
            fill="#6ee7b7"
            fontSize={28}
            fontFamily="Inter, sans-serif"
            fontWeight={800}
            letterSpacing={2}
          >
            PULLS DOWN ↓
          </text>
        </g>

        {/* Leading Tone B Node + Snap Up Label */}
        <g transform={`translate(${upNodeB.cx}, ${upNodeB.cy})`}>
          {activeBStep === 0 && (
            <circle r={82} fill="rgba(251, 191, 36, 0.30)" />
          )}
          <circle
            r={activeBStep === 0 ? 60 : 52}
            fill={activeBStep === 0 ? '#78350f' : '#1b1407'}
            stroke="#fbbf24"
            strokeWidth={activeBStep === 0 ? 5.5 : 3.5}
          />
          <text
            y={15}
            textAnchor="middle"
            fill="#fef3c7"
            fontSize={48}
            fontFamily="Georgia, serif"
            fontWeight={700}
          >
            B
          </text>
          <text
            y={86}
            textAnchor="middle"
            fill="#fcd34d"
            fontSize={26}
            fontFamily="Inter, sans-serif"
            fontWeight={700}
            letterSpacing={1.2}
          >
            SNAPS UP ↑
          </text>
        </g>
      </svg>

      {/* Bottom Method Attribution Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 110,
          right: 110,
          padding: '22px 32px',
          borderRadius: 24,
          background: 'rgba(6, 22, 16, 0.92)',
          border: '1.5px solid rgba(251, 191, 36, 0.35)',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 3.5,
            color: '#fbbf24',
            marginBottom: 6,
          }}
        >
          DALCROZE & ALAIN BENBASSAT
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 34,
            color: '#f8fafc',
          }}
        >
          Hear Pitch as Motion Toward Home
        </div>
      </div>
    </AbsoluteFill>
  );
};
