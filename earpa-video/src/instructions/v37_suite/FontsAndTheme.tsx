import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Img,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Harp3DCanvas, PluckEvent, LeverFlipEvent } from '../../earpa/Harp3DCanvas';

export type PathThemeKey = 'single' | 'melody' | 'levers';

export interface PathThemePalette {
  key: PathThemeKey;
  bgImage: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  badgeText: string;
  bgGradient: string;
  vignetteTint: string;
}

export const PATH_THEMES: Record<PathThemeKey, PathThemePalette> = {
  single: {
    key: 'single',
    bgImage: 'images/ingame_bg_single.jpg',
    accent: '#34d399',
    accentSoft: '#a7f3d0',
    accentGlow: 'rgba(52, 211, 153, 0.34)',
    badgeText: 'PATH I · SINGLE NOTES',
    bgGradient: 'radial-gradient(circle at 50% 42%, rgba(16, 62, 48, 0.62) 0%, rgba(5, 16, 13, 0.94) 68%, #020806 100%)',
    vignetteTint: 'rgba(4, 15, 12, 0.56)',
  },
  melody: {
    key: 'melody',
    bgImage: 'images/ingame_bg_melody.jpg',
    accent: '#38bdf8',
    accentSoft: '#bae6fd',
    accentGlow: 'rgba(56, 189, 248, 0.36)',
    badgeText: 'PATH II · MELODIC MEMORY',
    bgGradient: 'radial-gradient(circle at 50% 42%, rgba(14, 52, 82, 0.62) 0%, rgba(4, 14, 24, 0.94) 68%, #02070d 100%)',
    vignetteTint: 'rgba(4, 12, 22, 0.56)',
  },
  levers: {
    key: 'levers',
    bgImage: 'images/ingame_bg_levers.jpg',
    accent: '#f5b841',
    accentSoft: '#fde68a',
    accentGlow: 'rgba(245, 184, 65, 0.34)',
    badgeText: 'PATH III · CAMAC LEVERS',
    bgGradient: 'radial-gradient(circle at 50% 42%, rgba(76, 48, 16, 0.58) 0%, rgba(16, 11, 6, 0.95) 68%, #070503 100%)',
    vignetteTint: 'rgba(14, 10, 5, 0.56)',
  },
};

export const FONT_DISPLAY = '"EarpaCinzel", Georgia, serif';
export const FONT_SANS = '"EarpaJakarta", system-ui, sans-serif';
export const FONT_NUM = '"EarpaMontserrat", system-ui, sans-serif';

let fontsLoadedOnce = false;

export const SuiteFontLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(fontsLoadedOnce);
  const [handle] = useState(() => (fontsLoadedOnce ? null : delayRender('Loading Earpa V37 typography')));

  useEffect(() => {
    if (fontsLoadedOnce) return;
    let cancelled = false;
    (async () => {
      try {
        const specs: [string, string, string][] = [
          ['EarpaCinzel', 'fonts/Cinzel.ttf', '400 800'],
          ['EarpaJakarta', 'fonts/PlusJakartaSans-Variable.ttf', '300 800'],
          ['EarpaMontserrat', 'fonts/Montserrat-Variable.ttf', '400 800'],
        ];
        await Promise.all(
          specs.map(async ([family, relPath, weight]) => {
            const ff = new FontFace(family, `url(${staticFile(relPath)})`, { weight });
            const loaded = await ff.load();
            (document.fonts as unknown as Set<FontFace>).add(loaded);
          })
        );
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font load warning:', e);
      } finally {
        fontsLoadedOnce = true;
        if (!cancelled) {
          setReady(true);
          if (handle !== null) continueRender(handle);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return (
    <AbsoluteFill style={{ opacity: ready ? 1 : 0.999 }}>
      {children}
    </AbsoluteFill>
  );
};

/** Atmospheric Studio Sanctuary Backdrop matching path realm without dark void monotony */
export const SanctuaryBackdrop: React.FC<{
  theme: PathThemeKey;
  blurPx?: number;
  photoOpacity?: number;
  ringOpacity?: number;
}> = ({ theme, blurPx = 12, photoOpacity = 0.42, ringOpacity = 0.22 }) => {
  const frame = useCurrentFrame();
  const palette = PATH_THEMES[theme];
  const panY = interpolate(frame, [0, 2400], [0, -32], { extrapolateRight: 'clamp' });
  const rotDeg = frame * 0.085;
  const revRotDeg = -frame * 0.055;

  return (
    <AbsoluteFill style={{ backgroundColor: '#030807', overflow: 'hidden' }}>
      <Img
        src={staticFile(palette.bgImage)}
        style={{
          position: 'absolute',
          inset: -60,
          width: 'calc(100% + 120px)',
          height: 'calc(100% + 120px)',
          objectFit: 'cover',
          opacity: photoOpacity,
          filter: `blur(${blurPx}px) saturate(1.12) brightness(0.76)`,
          transform: `translateY(${panY}px) scale(1.06)`,
        }}
      />
      <AbsoluteFill style={{ background: palette.bgGradient }} />

      {/* Subtle architectural concentric compass rings */}
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: ringOpacity }}
      >
        <g transform={`translate(540, 880) rotate(${rotDeg})`}>
          <circle
            r="430"
            fill="none"
            stroke={palette.accent}
            strokeWidth="1.2"
            strokeDasharray="6 18"
            opacity="0.55"
          />
          <circle r="335" fill="none" stroke="#ffffff" strokeWidth="0.9" opacity="0.22" />
        </g>
        <g transform={`translate(540, 880) rotate(${revRotDeg})`}>
          <circle
            r="525"
            fill="none"
            stroke={palette.accentSoft}
            strokeWidth="1.1"
            strokeDasharray="24 44"
            opacity="0.3"
          />
        </g>
      </svg>

      {/* Top/Bottom cinema vignette */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(2,6,8,0.86) 0%, rgba(2,6,8,0.12) 22%, rgba(2,6,8,0.08) 76%, rgba(2,6,8,0.88) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Clean Museum-Turntable 3D Celtic Harp (ZERO jittery tilt wobble!) */
export const HeroHarpStage: React.FC<{
  theme: PathThemeKey;
  titleLine1: string;
  titleLine2: string;
  kicker?: string;
  subtitle?: string;
  pluckEvents?: PluckEvent[];
  leverEvents?: LeverFlipEvent[];
  startTheta?: number;
  spinSpeed?: number;
  harpRadius?: number;
  harpScale?: number;
  targetY?: number;
  fadeOutAtEndFrames?: number;
  totalSceneFrames?: number;
}> = ({
  theme,
  titleLine1,
  titleLine2,
  kicker,
  subtitle,
  pluckEvents = [],
  leverEvents = [],
  startTheta = -0.35,
  spinSpeed = 0.0135,
  harpRadius = 2.48,
  harpScale = 0.78,
  targetY = 0.44,
  fadeOutAtEndFrames = 14,
  totalSceneFrames = 195,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = PATH_THEMES[theme];

  const fadeIn = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });
  const fadeOut =
    totalSceneFrames > fadeOutAtEndFrames
      ? interpolate(
          frame,
          [totalSceneFrames - fadeOutAtEndFrames, totalSceneFrames],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 1;
  const masterOpacity = Math.min(fadeIn, fadeOut);

  const kickerY = interpolate(fadeIn, [0, 1], [18, 0]);
  const titleY = interpolate(spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 20, stiffness: 88 } }), [0, 1], [28, 0]);

  return (
    <AbsoluteFill style={{ opacity: masterOpacity }}>
      {/* Center studio aura */}
      <SanctuaryBackdrop theme={theme} blurPx={6} photoOpacity={0.82} ringOpacity={0.32} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 74% 64% at 50% 48%, rgba(255,255,255,0.03) 0%, rgba(2,6,8,0.52) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '56%',
          width: 780,
          height: 780,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accentGlow} 0%, rgba(0,0,0,0) 68%)`,
          filter: 'blur(36px)',
          pointerEvents: 'none',
        }}
      />

      {/* Editorial Header */}
      <div
        style={{
          position: 'absolute',
          top: 98,
          left: 72,
          right: 72,
          textAlign: 'center',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            transform: `translateY(${kickerY}px)`,
            fontFamily: FONT_NUM,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: palette.accentSoft,
            padding: '10px 26px',
            borderRadius: 999,
            border: `1px solid ${palette.accentGlow}`,
            background: 'rgba(8, 16, 18, 0.62)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {kicker || palette.badgeText}
        </div>

        <div
          style={{
            transform: `translateY(${titleY}px)`,
            fontFamily: FONT_DISPLAY,
            fontSize: 66,
            lineHeight: 1.09,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: '#f8fafc',
            textShadow: '0 8px 34px rgba(0,0,0,0.65)',
          }}
        >
          <div>{titleLine1}</div>
          <div style={{ color: palette.accentSoft }}>{titleLine2}</div>
        </div>
      </div>

      {/* Smooth Continuous Turntable 3D Harp */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 250,
          width: 1080,
          height: 1320,
          zIndex: 2,
        }}
      >
        <Harp3DCanvas
          width={1080}
          height={1320}
          theta={startTheta + frame * spinSpeed}
          phi={1.33}
          radius={harpRadius}
          targetY={targetY}
          harpScale={harpScale}
          steadyTurntable
          pluckEvents={pluckEvents}
          leverEvents={leverEvents}
        />
      </div>

      {/* Clean Bottom Editorial Subtitle */}
      {subtitle && (
        <div
          style={{
            position: 'absolute',
            bottom: 108,
            left: 84,
            right: 84,
            textAlign: 'center',
            zIndex: 4,
          }}
        >
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 1.42,
              color: 'rgba(241, 245, 249, 0.92)',
              letterSpacing: '0.01em',
              textShadow: '0 4px 20px rgba(0,0,0,0.75)',
            }}
          >
            {subtitle}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
