import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CalloutArrowProps {
  /** Frame when arrow + badge enter */
  startFrame: number;
  /** Frame when arrow + badge exit */
  endFrame: number;
  /** Top-left coordinate of the callout label card (1080x1920 stage) */
  boxX: number;
  boxY: number;
  boxWidth?: number;
  /** Start point of curved arrow on the card edge */
  fromX: number;
  fromY: number;
  /** Target point inside/on the centerpiece element */
  toX: number;
  toY: number;
  /** Control curve bend in Y (positive pulls curve downward, negative upward) */
  curveBendY?: number;
  kicker: string;
  title: string;
  detail?: string;
  accent?: string;
  align?: 'left' | 'right';
}

export const CalloutArrow: React.FC<CalloutArrowProps> = ({
  startFrame,
  endFrame,
  boxX,
  boxY,
  boxWidth = 372,
  fromX,
  fromY,
  toX,
  toY,
  curveBendY = -60,
  kicker,
  title,
  detail,
  accent = '#34d399',
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localF = frame - startFrame;
  const enter = spring({
    frame: localF,
    fps,
    config: { damping: 20, stiffness: 150 },
  });
  const exit = interpolate(frame, [endFrame - 12, endFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = enter * exit;

  const drawProgress = interpolate(localF, [4, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cx = (fromX + toX) * 0.5;
  const cy = (fromY + toY) * 0.5 + curveBendY;
  const pathLen = 650;
  const dashOffset = pathLen * (1 - drawProgress);

  // Tangent direction at destination end point for crisp arrowhead rotation
  const angleRad = Math.atan2(toY - cy, toX - cx);
  const angleDeg = (angleRad * 180) / Math.PI;

  // Soft beacon pulse once arrow arrives
  const pulsePhase = Math.max(0, localF - 20);
  const beaconScale = 1 + 0.35 * Math.sin(pulsePhase * 0.14);
  const slideY = interpolate(enter, [0, 1], [18, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
      }}
    >
      {/* Curved Leader SVG */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Subtle dark halo for guaranteed legibility over any texture */}
        <path
          d={`M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`}
          fill="none"
          stroke="rgba(3, 12, 8, 0.85)"
          strokeWidth={11}
          strokeLinecap="round"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
        />
        {/* Primary luminous leader line */}
        <path
          d={`M ${fromX} ${fromY} Q ${cx} ${cy} ${toX} ${toY}`}
          fill="none"
          stroke={accent}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
        />
        {/* Arrowhead chevron + target dot beacon */}
        {drawProgress > 0.72 && (
          <g
            transform={`translate(${toX}, ${toY}) rotate(${angleDeg})`}
            opacity={interpolate(drawProgress, [0.72, 1], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}
          >
            <polygon
              points="-22,-12 4,0 -22,12 -15,0"
              fill={accent}
              stroke="rgba(3,12,8,0.8)"
              strokeWidth={2}
            />
          </g>
        )}
        {drawProgress > 0.85 && (
          <g transform={`translate(${toX}, ${toY})`}>
            <circle
              r={16 * beaconScale}
              fill="none"
              stroke={accent}
              strokeWidth={2.5}
              opacity={0.45}
            />
            <circle r={6} fill="#fef3c7" stroke={accent} strokeWidth={2.5} />
          </g>
        )}
      </svg>

      {/* Editorial Callout Card (Negative space anchor, never blocks screen) */}
      <div
        style={{
          position: 'absolute',
          left: boxX,
          top: boxY,
          width: boxWidth,
          transform: `translateY(${slideY}px)`,
          padding: '22px 26px',
          borderRadius: 22,
          background:
            'linear-gradient(155deg, rgba(8, 29, 21, 0.94) 0%, rgba(4, 13, 10, 0.96) 100%)',
          border: `1.5px solid ${accent}66`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.55), 0 0 28px ${accent}22`,
          textAlign: align,
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3.2,
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 8,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#f8fafc',
            letterSpacing: -0.4,
            marginBottom: detail ? 10 : 0,
          }}
        >
          {title}
        </div>
        {detail && (
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 31,
              fontWeight: 500,
              lineHeight: 1.32,
              color: 'rgba(226, 232, 240, 0.90)',
            }}
          >
            {detail}
          </div>
        )}
      </div>
    </div>
  );
};
