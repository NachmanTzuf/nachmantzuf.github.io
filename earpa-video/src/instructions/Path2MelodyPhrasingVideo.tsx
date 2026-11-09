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
import timelineData from './timeline_path2.json';

const THEME: InstructionTheme = {
  primary: '#0284c7', // Arctic Sky Blue
  primaryGlow: 'rgba(2, 132, 199, 0.45)',
  accent: '#7dd3fc',
  bgGradient: 'radial-gradient(circle at 50% 25%, #0c4a6e 0%, #082f49 45%, #02131e 100%)',
  trackLabel: 'PATH 2 · MELODIC SEQUENCE',
};

export const Path2MelodyPhrasingVideo: React.FC = () => {
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
  let title = 'MELODIC PHRASING CONTOUR';
  let subtitle = 'Hear melodic curves and shapes rather than isolated single pitches.';

  if (activeBeatIndex === 1) {
    category = '02 · REAL GAMEPLAY : PHRASES';
    title = 'PHRASE AUDIATION';
    subtitle = 'Cadence, two-note melodic motif demonstration, and sequential reply.';
  } else if (activeBeatIndex === 2) {
    category = '03 · REAL GAMEPLAY : RESOLUTION';
    title = 'TONIC RESOLUTION';
    subtitle = 'Anchoring melodies through gravitational resolution to tonic C.';
  } else if (activeBeatIndex === 3) {
    category = '04 · TRAINING DRILL';
    title = 'SILENT AUDIATION DRILL';
    subtitle = 'Hear the full phrase internally before your fingers strike the harp strings.';
  } else if (activeBeatIndex === 4) {
    category = '05 · SESSION MASTERY';
    title = 'TRADITIONAL SESSION MASTERY';
    subtitle = 'Pick up reels and jigs on the fly without looking at sheet music.';
  }

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      {/* Master Broadcast Audio V5 */}
      <Audio src={staticFile('audio/instructions/path2_melodic_sequence_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={activeBeatIndex}
        totalBeats={5}
        localFrame={localFrame}
      >
        {/* ===================================================================
            BEAT 0: Dynamic Intro & Phrasing Concept (0.0s - 12.0s / Frames 0 - 360)
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
                    backgroundColor: 'rgba(8, 47, 73, 0.90)',
                    border: '1.5px solid #0284c7',
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

            {/* Phase 2: Glacial Fjord Roadmap (3.0s - 6.5s) */}
            {frame >= 90 && frame < 195 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: interpolate(frame, [90, 105, 185, 195], [0, 1, 1, 0]),
                }}
              >
                <Img
                  src={staticFile('textures/real/live_app/app_screen_glacial_roadmap.png')}
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
                    backgroundColor: 'rgba(2, 132, 199, 0.4)',
                    border: '3px solid #0284c7',
                    boxShadow: '0 0 30px #0284c7',
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
                    backgroundColor: 'rgba(8, 47, 73, 0.90)',
                    border: '1.5px solid #0284c7',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  PATH 2 · GLACIAL FJORD ROADMAP
                </div>
              </div>
            )}

            {/* Phase 3: Liquid-Glass Phrasing Concept (6.5s - 12.0s) */}
            {frame >= 195 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: interpolate(frame, [195, 210], [0, 1]),
                }}
              >
                <Img
                  src={staticFile('textures/real/live_app/app_screen_melody_sanctuary.png')}
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
                    backgroundColor: 'rgba(8, 47, 73, 0.94)',
                    border: `2px solid ${THEME.accent}`,
                    boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    zIndex: 30,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                    MELODIC AUDIATION PRINCIPLE
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                    FOLLOW THE CONTOUR
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4 }}>
                    Music flows in phrases. Hear the curve of the motif, holding the shape in memory before striking the strings.
                  </div>
                  <div
                    style={{
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#7dd3fc' }}>E4 (3)</span>
                    <span style={{ fontSize: 16, color: '#ffffff' }}>→</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fef08a' }}>D4 (2)</span>
                    <span style={{ fontSize: 16, color: '#ffffff' }}>→</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#34d399' }}>C4 (1)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            BEAT 1: Real In-Game Gameplay: Two-Note Motif (12.0s - 34.5s)
            Real recording with actual harp, cadence, melodic prompt, reply!
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path2_gameplay_two_phrases.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 2: Real In-Game Gameplay: Fundamental Tonic Catch (34.5s - 56.5s)
            Real recording: phrase resolution to tonic C + "Brilliant Catch! 1"
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path2_clip2_phrase_tonic.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 3: Training Drill: Silent Audiation (56.5s - 75.0s)
            Card: hum or sing internally before touching a string
           =================================================================== */}
        {activeBeatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_melody_sanctuary.png')}
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
                backgroundColor: 'rgba(8, 47, 73, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                zIndex: 30,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', textAlign: 'center' }}>
                THE AUDIATION PROTOCOL
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4, textAlign: 'center' }}>
                Sing or hum the phrase silently in your mind before plucking. This connects auditory imagination directly to string coordinates.
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
                LISTEN · AUDIATE · PLAY
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 4: Session Mastery & Real-Life Value (75.0s - 90.0s)
            Celtic session fluency, picking up reels and jigs on the fly
           =================================================================== */}
        {activeBeatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_glacial_roadmap.png')}
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
                backgroundColor: 'rgba(8, 47, 73, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 40px ${THEME.primaryGlow}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                zIndex: 30,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', textAlign: 'center' }}>
                REAL WORLD CELTIC SESSIONS
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4, textAlign: 'center' }}>
                Learn tunes by ear in real time. Join pub sessions, reels, and airs effortlessly without relying on sheet music.
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
                JOIN THE SESSION WITH CONFIDENCE
              </div>
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
