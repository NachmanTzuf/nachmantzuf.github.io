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
import { Harp3DCanvas } from '../earpa/Harp3DCanvas';
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

  const category = `0${activeBeatIndex + 1} · ${beatMeta.title}`;
  const title = beatMeta.title;
  const subtitle = beatMeta.subtitle;

  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio/instructions/path3_camac_levers_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={activeBeatIndex}
        totalBeats={timelineData.length}
        localFrame={localFrame}
      >
        {/* ===================================================================
            BEAT 0: Sandstone Canyon Sanctuary with 3D Harp and Levers Overview
            (0.0s - 17.22s) Celtic harps most commonly tuned to Eb major.
           =================================================================== */}
        {activeBeatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Img
              src={staticFile('textures/EARPA_03_Desert_Canyon_Sanctuary_2K.png')}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Harp3DCanvas
                width={655}
                height={1420}
                theta={Math.sin(frame * 0.015) * 0.35 + 0.22}
                phi={1.36}
                radius={2.35}
                targetY={0.42}
                harpScale={0.72}
              />
            </div>

            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                opacity: enterSpring,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                CAMAC HARP MECHANICS
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>E-FLAT MAJOR FOUNDATION</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4 }}>
                Celtic lever harps are most commonly tuned to E flat major with all levers down. Raising a lever engages the bridge pin for +1 semitone.
              </div>
              <div
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fef08a' }}>ALL LEVERS DOWN</span>
                <span style={{ fontSize: 18, color: '#ffffff' }}>→</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#34d399' }}>E♭ MAJOR AT REST</span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 1: Real Cropped Video: Interactive Tutorial Cards (17.22s - 35.73s)
            Card 1/5 Eb foundation, Card 3/5 Circle of Fifths, Card 4/5 Raise A for Bb
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_tutorial_circle.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 2: Real Cropped Video: Level 1 Lever Play & Full Scale Walk (35.73s - 55.73s)
            Level 1 screen, levers buttons, Confirm Scale, app plays full 8-note scale!
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_level1_lever_and_walk.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 3: Real Cropped Video: Circle of Fifths Dial (55.73s - 70.69s)
            Level 2 Circle of Fifths dial showing Bb Major (2 flats, raise group A)
           =================================================================== */}
        {activeBeatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_circle_of_fifths_dial.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 4: Real Cropped Video: Level 2 Modulation & Confirmation (70.69s - 84.84s)
            Real lever setting (A UP yellow), Confirm Scale, Bb scale walkdown
           =================================================================== */}
        {activeBeatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path3_level2_lever_and_walk.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 5: Sandstone Canyon Sanctuary & Stage Mastery (84.84s - 95.64s)
           =================================================================== */}
        {activeBeatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/EARPA_03_Desert_Canyon_Sanctuary_2K.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Harp3DCanvas
                width={655}
                height={1420}
                theta={Math.sin(frame * 0.02) * 0.4 + 0.22}
                phi={1.36}
                radius={2.35}
                targetY={0.42}
                harpScale={0.72}
              />
            </div>

            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                STAGE MODULATION MASTERY
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4, textAlign: 'center' }}>
                Daily training with the Circle of Fifths builds instinctive lever reflexes. Modulate keys seamlessly during live concert performances with zero hesitation.
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
                MODULATE WITH CONFIDENCE
              </div>
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
