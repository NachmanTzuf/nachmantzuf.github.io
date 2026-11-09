import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { InstructionLayout, InstructionTheme } from './InstructionLayout';
import timelineData from './timeline_path3.json';

const THEME: InstructionTheme = {
  primary: '#d97706', // Sandstone Amber
  primaryGlow: 'rgba(217, 119, 6, 0.45)',
  accent: '#fbbf24',
  bgGradient: 'radial-gradient(circle at 50% 25%, #78350f 0%, #451a03 45%, #180902 100%)',
  trackLabel: 'PATH 3 · CAMAC LEVERS',
};

export const Path3CamacLeversVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentSec = frame / fps;
  let activeBeatIndex = 0;
  for (let i = 0; i < timelineData.length; i++) {
    if (currentSec >= timelineData[i].start) {
      activeBeatIndex = timelineData[i].beat;
    }
  }

  const beatMeta = timelineData[activeBeatIndex] || timelineData[0];
  const beatStartFrame = Math.round(beatMeta.start * fps);
  const localFrame = Math.max(0, frame - beatStartFrame);

  let category = '01 · CORE METHODOLOGY';
  let title = 'CAMAC LEVER HARPING';
  let subtitle = 'Mechanical and harmonic mastery for instant key changes across the Circle of Fifths.';

  if (activeBeatIndex === 1) {
    category = '02 · INTERACTIVE TUTORIAL';
    title = 'E-FLAT MAJOR FOUNDATION';
    subtitle = 'Every lever down sets Eb Major. Raising a lever engages the bridge pin for +1 semitone.';
  } else if (activeBeatIndex === 2) {
    category = '03 · SCALE DISCOVERY';
    title = 'CIRCLE OF FIFTHS DIAL';
    subtitle = 'Explore target scales and active lever indicator arrays before entering gameplay.';
  } else if (activeBeatIndex === 3) {
    category = '04 · LIVE GAMEPLAY';
    title = 'B-FLAT MAJOR : FULL SCALE WALK';
    subtitle = 'Prompt challenges Bb Major, raise lever A, confirm, and hear automated 8-note scale walk.';
  } else if (activeBeatIndex === 4) {
    category = '05 · ADVANCED MODES';
    title = 'MODAL SCALES & SHIFTS';
    subtitle = 'Seamlessly shift between C Major, G Major, and D Dorian with instant audiation.';
  } else if (activeBeatIndex === 5) {
    category = '06 · STAGE MASTERY';
    title = 'CONFIDENT LIVE PERFORMANCE';
    subtitle = 'Switch keys on stage with intuitive muscle memory and zero performance hesitation.';
  }

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      {/* Master Broadcast Audio V5 */}
      <Audio src={staticFile('audio/instructions/path3_camac_levers_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={activeBeatIndex}
        totalBeats={6}
        localFrame={localFrame}
      >
        {/* ===================================================================
            BEAT 0: Dynamic Intro & Lore (0.0s - 12.0s / Frames 0 - 360)
            Transitions smoothly every 3 seconds to eliminate the 17s freeze!
           =================================================================== */}
        {activeBeatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Phase 1: App Journey & Profile Dashboard (0.0s - 3.0s) */}
            {frame < 90 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: interpolate(frame, [0, 15, 80, 90], [0, 1, 1, 0]),
                }}
              >
                <Img
                  src={staticFile('textures/real/live_app/app_screen_journey_updated.png')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 40,
                    left: 20,
                    right: 20,
                    padding: '12px 18px',
                    borderRadius: 16,
                    backgroundColor: 'rgba(69, 26, 3, 0.90)',
                    border: '1.5px solid #d97706',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  EARPA JOURNEY DASHBOARD
                </div>
              </div>
            )}

            {/* Phase 2: Sandstone Canyon Roadmap (3.0s - 6.5s) */}
            {frame >= 90 && frame < 195 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: interpolate(frame, [90, 105, 185, 195], [0, 1, 1, 0]),
                }}
              >
                <Img
                  src={staticFile('textures/real/live_app/app_screen_canyon_roadmap.png')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '45%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(217, 119, 6, 0.4)',
                    border: '3px solid #d97706',
                    boxShadow: '0 0 30px #d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>1</span>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 40,
                    left: 20,
                    right: 20,
                    padding: '12px 18px',
                    borderRadius: 16,
                    backgroundColor: 'rgba(69, 26, 3, 0.90)',
                    border: '1.5px solid #d97706',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  PATH 3 · DESERT CANYON ROADMAP
                </div>
              </div>
            )}

            {/* Phase 3: Entering Arena (6.5s - 12.0s) */}
            {frame >= 195 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: interpolate(frame, [195, 210], [0, 1]),
                }}
              >
                <Img
                  src={staticFile('textures/real/live_app/app_screen_levers_sanctuary.png')}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '46%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    padding: '24px',
                    borderRadius: 24,
                    backgroundColor: 'rgba(69, 26, 3, 0.94)',
                    border: `2px solid ${THEME.accent}`,
                    boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    zIndex: 30,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                    CELTIC HARP FOUNDATION
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                    OPEN E-FLAT MAJOR
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4 }}>
                    Celtic harps are most commonly tuned to E flat Major with all levers down. Raising levers physically clamps strings by 5.6% speaking length, raising pitch by one semitone.
                  </div>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 14,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>ALL LEVERS DOWN</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>Eb MAJOR</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            BEAT 1: Real Interactive Lever Tutorial (12.0s - 36.0s)
            Real recording: Harp at rest Eb Major + raising lever A (+1 semitone)!
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_clip1_tutorial.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 2: Real App Circle of Fifths Scale Learning (36.0s - 58.0s)
            Real recording: Circle of Fifths dial, lever indicators, confirm!
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_clip2_circle_fifths.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 3: Real In-Game Lever Setting & Automated Full Scale Walk (58.0s - 93.0s)
            Real recording: Bb Major prompt, tap A UP (turns gold), confirm,
            and automatic 8-note full scale walk from Bb to Bb!
           =================================================================== */}
        {activeBeatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_clip3_gameplay_walk.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 4: Advanced Modal Scales & Shifts (93.0s - 118.0s)
            Real recording: advancing through roadmap and further scale walks
           =================================================================== */}
        {activeBeatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_gameplay_full_walks.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 5: Stage Mastery & Real-Life Confidence (118.0s - 135.0s)
            Switch keys on stage with intuitive muscle memory
           =================================================================== */}
        {activeBeatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_levers_sanctuary.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '88%',
                padding: '24px',
                borderRadius: 24,
                backgroundColor: 'rgba(69, 26, 3, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                zIndex: 30,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', textAlign: 'center' }}>
                EFFORTLESS STAGE FREEDOM
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4, textAlign: 'center' }}>
                Mastering levers inside Earpa eliminates stage fright. In live performances, you will switch keys effortlessly with muscle memory, knowing your Celtic harp is perfectly configured.
              </div>
              <div
                style={{
                  alignSelf: 'center',
                  padding: '10px 24px',
                  borderRadius: 20,
                  backgroundColor: THEME.primary,
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 800,
                  boxShadow: `0 0 20px ${THEME.primaryGlow}`,
                }}
              >
                TOTAL HARMONIC CONFIDENCE
              </div>
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
