import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Harp3DCanvas, PluckEvent, LeverFlipEvent } from '../earpa/Harp3DCanvas';
import { PhoneFrame } from '../earpa_short/PhoneFrame';
import { SoundWave3DCanvas } from '../components_3d/SoundWave3DCanvas';
import { Astrolabe3DCanvas } from '../components_3d/Astrolabe3DCanvas';
import { GravityOrbit3DCanvas } from '../components_3d/GravityOrbit3DCanvas';
import { ChladniResonanceCanvas } from '../components_3d/ChladniResonanceCanvas';

export type HeroMode =
  | 'balanced'
  | 'soundwaves'
  | 'anti_interval'
  | 'jam_panic'
  | 'astrolabe'
  | 'habit'
  | 'resonance'
  | 'facial'
  | 'bardic'
  | 'apex';

export type AppDepth = 'full' | 'medium' | 'minimal';

export interface VariantProps {
  id: string;
  heroMode: HeroMode;
  showAppDepth: AppDepth;
  themeColor: string;
  headlineBadge: string;
  tagline: string;
  audioFile: string;
}

const SOLO_PLUCKS: PluckEvent[] = [
  { stringNum: 1, startFrame: 1 },
  { stringNum: 4, startFrame: 15 },
  { stringNum: 5, startFrame: 21 },
  { stringNum: 8, startFrame: 49 },
  { stringNum: 6, startFrame: 54 },
  { stringNum: 3, startFrame: 59 },
  { stringNum: 2, startFrame: 64 },
  { stringNum: 1, startFrame: 67 },
];

export const VariantVideo: React.FC<VariantProps> = ({
  id,
  heroMode,
  showAppDepth,
  themeColor,
  headlineBadge,
  tagline,
  audioFile,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timing breakpoints
  const soloEnd = 72;
  const finaleStart = durationInFrames - 165;
  const midDuration = finaleStart - soloEnd;

  // Opening Solo Animations
  const soloHarpIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.9 },
  });
  const soloHarpScale = interpolate(soloHarpIn, [0, 1], [0.55, 0.78]);

  // Middle Stage Transition (frame soloEnd to finaleStart)
  const isMiddleActive = frame >= soloEnd && frame < finaleStart;
  const midFrame = Math.max(0, frame - soloEnd);
  const midProgress = midFrame / midDuration;

  // Finale Transition
  const isFinaleActive = frame >= finaleStart;
  const finaleFrame = Math.max(0, frame - finaleStart);
  const finaleSpring = spring({
    frame: finaleFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#05080f', overflow: 'hidden' }}>
      {/* Pristine Master Audio Track */}
      <Audio src={staticFile(`audio/${audioFile}`)} volume={1} />

      {/* Ambient Celestial Backdrop Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 35%, ${themeColor}1a 0%, rgba(5,8,15,0.98) 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top Persistent Status Bar */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 54,
          right: 54,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            padding: '8px 20px',
            borderRadius: 999,
            background: 'rgba(10, 16, 26, 0.85)',
            border: `1.5px solid ${themeColor}`,
            boxShadow: `0 4px 20px ${themeColor}33`,
            color: themeColor,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          {frame < soloEnd ? '♫ LIVE CELTIC HARP SOLO' : headlineBadge}
        </div>

        <div
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            background: 'rgba(10, 16, 26, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#94a3b8',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {frame < soloEnd ? 'Sitka Spruce Dual Cavity' : tagline}
        </div>
      </div>

      {/* 1. OPENING SOLO STAGE (Frames 0 to 72) */}
      {frame < soloEnd + 15 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: interpolate(frame, [soloEnd, soloEnd + 15], [1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            zIndex: 10,
          }}
        >
          {/* Centered 100% Unclipped 3D Celtic Harp */}
          <div
            style={{
              position: 'absolute',
              left: 54,
              top: 140,
              width: 972,
              height: 1540,
            }}
          >
            <Harp3DCanvas
              width={972}
              height={1540}
              theta={interpolate(frame, [0, 80], [-0.55, 0.35])}
              phi={1.34}
              radius={2.52}
              targetY={0.46}
              fov={34}
              harpScale={soloHarpScale}
              pluckEvents={SOLO_PLUCKS}
            />
          </div>

          {/* Flanking Acoustic Telemetry Chips */}
          <div
            style={{
              position: 'absolute',
              left: 54,
              bottom: 180,
              padding: '12px 20px',
              borderRadius: 16,
              background: 'rgba(10, 16, 26, 0.85)',
              border: '1.5px solid rgba(251, 191, 36, 0.45)',
              color: '#fbbf24',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontWeight: 800 }}>ACOUSTIC BODY</span>
            <span style={{ color: '#f8fafc', fontSize: 13 }}>Sitka Spruce Dual Cavity</span>
          </div>

          <div
            style={{
              position: 'absolute',
              right: 54,
              bottom: 180,
              padding: '12px 20px',
              borderRadius: 16,
              background: 'rgba(10, 16, 26, 0.85)',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              color: '#38bdf8',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              textAlign: 'right',
            }}
          >
            <span style={{ fontWeight: 800 }}>LIVE ARTIST SOLO</span>
            <span style={{ color: '#f8fafc', fontSize: 13 }}>Real Celtic Strings • 48 kHz</span>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC MIDDLE STAGE (Frames soloEnd to finaleStart) */}
      {isMiddleActive && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 15 }}>
          {/* A. Soundwaves Mode (V02) */}
          {heroMode === 'soundwaves' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SoundWave3DCanvas
                width={1000}
                height={1200}
                primaryColor={themeColor}
                secondaryColor="#38bdf8"
                intensity={1.0 + Math.sin(frame * 0.1) * 0.25}
              />
              {/* Sleek Floating Audio Physics Chips */}
              <div
                style={{
                  position: 'absolute',
                  top: 220,
                  display: 'flex',
                  gap: 16,
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: `1.5px solid ${themeColor}`,
                    color: themeColor,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  VOLUMETRIC STANDING WAVES
                </div>
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: '1.5px solid #38bdf8',
                    color: '#38bdf8',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  ACOUSTIC OVERTONES
                </div>
              </div>

              {/* Minimalist Phone Stage Transition (Brief Pluck Showcase) */}
              {midProgress > 0.55 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 280,
                    width: 650,
                    zIndex: 25,
                    transform: `scale(${interpolate(midProgress, [0.55, 0.75], [0.85, 1.0], {
                      extrapolateRight: 'clamp',
                    })})`,
                  }}
                >
                  <PhoneFrame width={650} accent={themeColor}>
                    <Img
                      src={staticFile('textures/real/app_screen_pluck_guess.png')}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </PhoneFrame>
                </div>
              )}
            </div>
          )}

          {/* B. Anti-Interval / Tonal Gravity Mode (V03) */}
          {heroMode === 'anti_interval' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GravityOrbit3DCanvas
                width={1000}
                height={1200}
                accent={themeColor}
                resolvingDegree={4}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 220,
                  display: 'flex',
                  gap: 16,
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: '1.5px solid #f43f5e',
                    color: '#f43f5e',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  INTERVAL COUNTING IS DEAD
                </div>
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: `1.5px solid ${themeColor}`,
                    color: themeColor,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  MAGNETIC PULL TO DO
                </div>
              </div>

              {midProgress > 0.50 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 280,
                    width: 650,
                    zIndex: 25,
                  }}
                >
                  <PhoneFrame width={650} accent={themeColor}>
                    <Img
                      src={staticFile('textures/real/app_screen_resolution_walk.png')}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </PhoneFrame>
                </div>
              )}
            </div>
          )}

          {/* C. Astrolabe & Levers Mode (V05) */}
          {heroMode === 'astrolabe' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Astrolabe3DCanvas
                width={1000}
                height={1200}
                accent={themeColor}
                leverEngagedCount={Math.floor(midProgress * 7)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 220,
                  display: 'flex',
                  gap: 16,
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: `1.5px solid ${themeColor}`,
                    color: themeColor,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  CIRCLE OF FIFTHS ASTROLABE
                </div>
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: '1.5px solid #38bdf8',
                    color: '#38bdf8',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  7 SHARPING LEVERS
                </div>
              </div>

              {midProgress > 0.55 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 280,
                    width: 650,
                    zIndex: 25,
                  }}
                >
                  <PhoneFrame width={650} accent={themeColor}>
                    <Img
                      src={staticFile('textures/real/app_screen_camac_levers.png')}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </PhoneFrame>
                </div>
              )}
            </div>
          )}

          {/* D. Acoustic Resonance Mode (V07) */}
          {heroMode === 'resonance' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChladniResonanceCanvas
                width={1000}
                height={1200}
                accent={themeColor}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 220,
                  display: 'flex',
                  gap: 16,
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: `1.5px solid ${themeColor}`,
                    color: themeColor,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  CHLADNI NODAL HARMONICS
                </div>
                <div
                  style={{
                    padding: '8px 22px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: '1.5px solid #fbbf24',
                    color: '#fbbf24',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  135 HZ HELMHOLTZ CAVITY
                </div>
              </div>

              {midProgress > 0.55 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 280,
                    width: 650,
                    zIndex: 25,
                  }}
                >
                  <PhoneFrame width={650} accent={themeColor}>
                    <Img
                      src={staticFile('textures/real/app_screen_melody_studio.png')}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </PhoneFrame>
                </div>
              )}
            </div>
          )}

          {/* E. Habit, Jam Panic, Facial, Bardic, Balanced & Apex Modes (V01, V04, V06, V08, V09, V10) */}
          {(heroMode === 'balanced' ||
            heroMode === 'apex' ||
            heroMode === 'habit' ||
            heroMode === 'jam_panic' ||
            heroMode === 'facial' ||
            heroMode === 'bardic') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Switching Phone Frame Carousel with Real App Screens */}
              <div
                style={{
                  position: 'absolute',
                  top: 235,
                  width: 650,
                  zIndex: 20,
                }}
              >
                <PhoneFrame width={650} accent={themeColor}>
                  <Img
                    src={staticFile(
                      heroMode === 'habit'
                        ? 'textures/real/app_screen_coastal_roadmap.png'
                        : heroMode === 'jam_panic'
                        ? 'textures/real/app_screen_resolution_walk.png'
                        : heroMode === 'facial'
                        ? 'textures/real/app_screen_pluck_guess.png'
                        : heroMode === 'bardic'
                        ? 'textures/real/app_screen_melody_studio.png'
                        : midProgress < 0.35
                        ? 'textures/real/app_screen_single_home.png'
                        : midProgress < 0.70
                        ? 'textures/real/app_screen_coastal_roadmap.png'
                        : 'textures/real/app_screen_camac_levers.png'
                    )}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </PhoneFrame>
              </div>

              {/* Floating Dynamic Chips */}
              <div
                style={{
                  position: 'absolute',
                  top: 175,
                  display: 'flex',
                  gap: 14,
                  zIndex: 25,
                }}
              >
                <div
                  style={{
                    padding: '8px 20px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: `1.5px solid ${themeColor}`,
                    color: themeColor,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {heroMode === 'habit'
                    ? '10 MIN / DAY'
                    : heroMode === 'jam_panic'
                    ? 'ZERO HESITATION'
                    : heroMode === 'facial'
                    ? 'FACIAL RECOGNITION EAR'
                    : heroMode === 'bardic'
                    ? 'ANCIENT BARDIC INTUITION'
                    : 'ALAIN BENBASSAT METHOD'}
                </div>
                <div
                  style={{
                    padding: '8px 20px',
                    borderRadius: 999,
                    background: 'rgba(10,16,26,0.92)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#f8fafc',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {heroMode === 'habit'
                    ? 'DAILY HARPER XP'
                    : heroMode === 'jam_panic'
                    ? 'TONAL GRAVITY'
                    : heroMode === 'facial'
                    ? 'INSTANT RECALL'
                    : heroMode === 'bardic'
                    ? '3 GUIDED REALMS'
                    : '220+ LEVELS'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. VERIFIED FINALE CREST STAGE (Last 165 Frames across ALL 10 Variants) */}
      {isFinaleActive && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: finaleSpring,
            zIndex: 35,
          }}
        >
          {/* Centered 100% Unclipped 3D Celtic Harp */}
          <div
            style={{
              position: 'absolute',
              left: 54,
              top: 240,
              width: 972,
              height: 1250,
            }}
          >
            <Harp3DCanvas
              width={972}
              height={1250}
              theta={interpolate(finaleFrame, [0, 160], [0.15, 0.75])}
              phi={1.34}
              radius={2.50}
              targetY={0.46}
              fov={34}
              harpScale={0.78}
            />
          </div>

          {/* Top Brand Crest & Call to Action */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <Img
                src={staticFile('textures/real/app_screen_single_home.png')}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  border: `2px solid ${themeColor}`,
                  boxShadow: `0 4px 18px ${themeColor}44`,
                  objectFit: 'cover',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    color: '#ffffff',
                    fontFamily: 'serif',
                    fontSize: 32,
                    fontWeight: 900,
                    letterSpacing: 4,
                  }}
                >
                  EARPA
                </span>
                <span
                  style={{
                    color: themeColor,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 2,
                  }}
                >
                  FUNCTIONAL EAR TRAINING
                </span>
              </div>
            </div>

            <span
              style={{
                color: '#f8fafc',
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 0.5,
                textShadow: '0 2px 14px rgba(0,0,0,0.8)',
              }}
            >
              Stop guessing notes. Speak through your instrument.
            </span>

            {/* Glowing Amber CTA Button */}
            <div
              style={{
                marginTop: 6,
                padding: '14px 44px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 2.5,
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.5)',
              }}
            >
              EARPA.APP →
            </div>
          </div>

          {/* Bottom Sanctuary Dock Navigation Tabs */}
          <div
            style={{
              position: 'absolute',
              bottom: 44,
              left: 54,
              right: 54,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                background: 'rgba(10, 16, 26, 0.94)',
                border: '1.5px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 20,
                padding: '14px 18px',
              }}
            >
              {[
                { num: '01', name: 'Single' },
                { num: '02', name: 'Melody' },
                { num: '03', name: 'Levers' },
                { num: '04', name: 'Journey' },
              ].map((tab, idx) => (
                <div
                  key={tab.num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    padding: '8px 0',
                    borderRadius: 12,
                    background: idx === 0 ? `${themeColor}22` : 'transparent',
                    border: idx === 0 ? `1px solid ${themeColor}` : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 11,
                      color: idx === 0 ? themeColor : '#64748b',
                      fontWeight: 800,
                    }}
                  >
                    {tab.num}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: idx === 0 ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {tab.name}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '10px 0',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid rgba(16, 185, 129, 0.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#34d399',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              ✦ FULL UNLIMITED ACCESS • LESS THAN A COFFEE • iOS, ANDROID & WEB
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
