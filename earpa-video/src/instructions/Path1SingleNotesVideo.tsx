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
import timelineData from './timeline_path1.json';

const THEME: InstructionTheme = {
  primary: '#10b981', // Emerald
  primaryGlow: 'rgba(16, 185, 129, 0.45)',
  accent: '#34d399',
  bgGradient: 'radial-gradient(circle at 50% 25%, #064e3b 0%, #022c22 45%, #01140e 100%)',
  trackLabel: 'PATH 1 · SINGLE NOTES',
};

export const Path1SingleNotesVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active beat from dynamic timeline JSON
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
  let title = 'TONAL GRAVITATION';
  let subtitle = 'Feel how every note pulls toward home note C instead of guessing intervals in a vacuum.';

  if (activeBeatIndex === 1) {
    category = '02 · REAL GAMEPLAY : ROUND 1';
    title = 'NOTE A : OPEN SIXTH';
    subtitle = 'Cadence grounds in C Major, mystery note sounds, pluck Note A with resolution walkdown.';
  } else if (activeBeatIndex === 2) {
    category = '03 · REAL GAMEPLAY : ROUND 2';
    title = 'NOTE G : THE BRIGHT FIFTH';
    subtitle = 'Hear the stable open fifth, tap note G, and watch the app walk down to home C.';
  } else if (activeBeatIndex === 3) {
    category = '04 · REAL GAMEPLAY : ROUND 3';
    title = 'NOTE F : DOWNWARD PULL';
    subtitle = 'Feel the heavy downward ache toward home C, verified by the stepwise resolution walk.';
  } else if (activeBeatIndex === 4) {
    category = '05 · REAL GAMEPLAY : ROUND 6';
    title = 'NOTE B : LEADING TONE';
    subtitle = 'Experience the intense magnetic upward snap resolving directly into high C.';
  } else if (activeBeatIndex === 5) {
    category = '06 · MASTERY BLUEPRINT';
    title = 'THE 5-MINUTE DAILY HABIT';
    subtitle = 'Ten minutes a day rewires your ear for effortless intuitive playing on stage.';
  }

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  // Intro transition cycling (Beat 0: 0.0s to 12.0s / 360 frames)
  // Sub-scenes:
  // 0 - 90 frames (0.0s - 3.0s): Screen 1 (Journey / Profile)
  // 90 - 195 frames (3.0s - 6.5s): Screen 2 (Coastal Ridge Sanctuary Roadmap with glowing node)
  // 195 - 360 frames (6.5s - 12.0s): Screen 3 (Liquid-Glass Alain Benbassat Law Brief)

  return (
    <AbsoluteFill>
      {/* Master Broadcast Audio V5: Integrated Edge TTS narration + ducked authentic in-game audio */}
      <Audio src={staticFile('audio/instructions/path1_single_notes_master.mp3')} volume={1.0} />

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
            BEAT 0: Dynamic Intro & Method Brief (0.0s - 12.0s / Frames 0 - 360)
            Smooth transitions every 3 seconds to eliminate the 17s freeze!
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
                    backgroundColor: 'rgba(6, 44, 34, 0.90)',
                    border: '1.5px solid #10b981',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                  }}
                >
                  EARPA JOURNEY DASHBOARD
                </div>
              </div>
            )}

            {/* Phase 2: Coastal Ridge Sanctuary Roadmap (3.0s - 6.5s) */}
            {frame >= 90 && frame < 195 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: interpolate(frame, [90, 105, 185, 195], [0, 1, 1, 0]),
                }}
              >
                <Img
                  src={staticFile('textures/real/live_app/app_screen_coastal_roadmap.png')}
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
                    backgroundColor: 'rgba(16, 185, 129, 0.4)',
                    border: '3px solid #10b981',
                    boxShadow: '0 0 30px #10b981',
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
                    backgroundColor: 'rgba(6, 44, 34, 0.90)',
                    border: '1.5px solid #10b981',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  PATH 1 · COASTAL SANCTUARY ROADMAP
                </div>
              </div>
            )}

            {/* Phase 3: Liquid-Glass Alain Benbassat Law Brief (6.5s - 12.0s) */}
            {frame >= 195 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: interpolate(frame, [195, 210], [0, 1]),
                }}
              >
                <Img
                  src={staticFile('textures/real/live_app/app_screen_single_sanctuary.png')}
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
                    backgroundColor: 'rgba(6, 44, 34, 0.94)',
                    border: `2px solid ${THEME.accent}`,
                    boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    zIndex: 30,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                      ALAIN BENBASSAT LAW
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>TONAL GRAVITATION</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 14,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff' }}>NOTE F → PULL DOWN</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: THEME.accent }}>
                          Subdominant ache falling through E, D to C
                        </div>
                      </div>
                      <span style={{ fontSize: 24, color: '#38bdf8', fontWeight: 900 }}>↓</span>
                    </div>

                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        backgroundColor: 'rgba(16, 185, 129, 0.35)',
                        border: `2px solid ${THEME.primary}`,
                        boxShadow: `0 0 20px ${THEME.primary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#ffffff' }}>NOTE C : TONIC ANCHOR</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>
                          Home base of perfect resolution
                        </div>
                      </div>
                      <span style={{ fontSize: 26, color: '#ffffff' }}>★</span>
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 14,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff' }}>NOTE B → SNAP UP</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: THEME.accent }}>
                          Leading tone magnetic snap to C5
                        </div>
                      </div>
                      <span style={{ fontSize: 24, color: '#f59e0b', fontWeight: 900 }}>↑</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            BEAT 1: Real In-Game Gameplay: Round 1 (Note A / 6) (12.0s - 34.5s)
            Shows actual recording with real 3D harp, cadence, pluck, feedback!
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_clip1_note6.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 2: Real In-Game Gameplay: Round 2 (Note G / 5) (34.5s - 56.5s)
            Real recording: Stable Open Fifth + walkdown to C + "Perfection! 5"
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_clip2_note5.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 3: Real In-Game Gameplay: Note 4 / F (56.5s - 68.5s)
            Real recording: Downward Ache + walkdown to C + "Pure Resonance! 4"
           =================================================================== */}
        {activeBeatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_clip3_note4.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 4: Real In-Game Gameplay: Note 7 / B (68.5s - 80.5s)
            Real recording: Leading Tone Upward Snap + "Golden Ear! 7"
           =================================================================== */}
        {activeBeatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_clip4_note7.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 5: Progression & Real-Life Value (80.5s - 90.0s)
            Daily 5-minute habit, level mastery, playing by ear on stage
           =================================================================== */}
        {activeBeatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_single_home.png')}
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
                backgroundColor: 'rgba(6, 44, 34, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                zIndex: 30,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', textAlign: 'center' }}>
                DAILY 5-MINUTE REFLEX
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4, textAlign: 'center' }}>
                Train 10 minutes a day to lock in tonal gravitation. Hear melodies naturally before your fingers strike the harp strings.
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
                PLAY BY EAR EFFORTLESSLY
              </div>
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
