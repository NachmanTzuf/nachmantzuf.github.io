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
      {/* Master Broadcast Audio V6.2: 100% zero-overlap sequential audio + ducked in-game sound */}
      <Audio src={staticFile('audio/instructions/path1_single_notes_master.mp3')} volume={1.0} />

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
            BEAT 0: Path 1 Celtic Coastal Sanctuary & Alain Benbassat Law Card
            (0.0s - 23.24s) Matching user uploaded media_1794301773498_991cd841.jpg
           =================================================================== */}
        {activeBeatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Sanctuary Background */}
            <Img
              src={staticFile('textures/EARPA_01_Green_Celtic_Sanctuary_2K.png')}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* 3D Realistic Celtic Harp gently spinning on the stone pedestal */}
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
                theta={Math.sin(frame * 0.015) * 0.35 + 0.18}
                phi={1.38}
                radius={2.35}
                targetY={0.42}
                harpScale={0.72}
              />
            </div>

            {/* Floating Glass Alain Benbassat Law Overlay Card (Matching user uploaded screenshot) */}
            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                opacity: enterSpring,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                  ALAIN BENBASSAT LAW
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>TONAL GRAVITATION</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Note F Pull Down */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff' }}>NOTE F → PULL DOWN</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: THEME.accent }}>
                      Subdominant ache falling through E, D to C
                    </div>
                  </div>
                  <span style={{ fontSize: 26, color: '#38bdf8', fontWeight: 900 }}>↓</span>
                </div>

                {/* Note C Tonic Anchor (Highlighted) */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    backgroundColor: 'rgba(16, 185, 129, 0.40)',
                    border: `2px solid ${THEME.primary}`,
                    boxShadow: `0 0 24px ${THEME.primary}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>NOTE C : TONIC ANCHOR</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#6ee7b7' }}>
                      Home base of perfect resolution
                    </div>
                  </div>
                  <span style={{ fontSize: 28, color: '#ffffff' }}>★</span>
                </div>

                {/* Note B Snap Up */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff' }}>NOTE B → SNAP UP</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: THEME.accent }}>
                      Leading tone magnetic snap to C5
                    </div>
                  </div>
                  <span style={{ fontSize: 26, color: '#f59e0b', fontWeight: 900 }}>↑</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            BEAT 1: Real In-Game Gameplay: Round 1 (Note A / 6) (23.24s - 35.87s)
            Real sliced recording: Status bar cropped out, cadence, pluck, True Harper!
           =================================================================== */}
        {activeBeatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_r1_note6_correct.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 2: Real In-Game Gameplay: Round 2 (Note G / 5) (35.87s - 49.69s)
            Real recording: Status bar cropped, cadence, note G, "Perfection! 5"
           =================================================================== */}
        {activeBeatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_r2_note5_correct.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 3: Real In-Game Gameplay: Round 3 Mistake & Recovery (49.69s - 63.16s)
            Real recording: User clicks wrong note -> Red overtone warning modal!
           =================================================================== */}
        {activeBeatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_r3_mistake_recovery.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 4: Real In-Game Gameplay: Round 7 Note B Golden Ear (63.16s - 75.36s)
            Real recording: Leading tone B -> "Golden Ear! 7" upward snap
           =================================================================== */}
        {activeBeatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Video
              src={staticFile('videos/gameplay_real/path1_r7_note7_golden_ear.mp4')}
              volume={0}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ===================================================================
            BEAT 5: Progression & Real-Life Value (75.36s - 89.36s)
            Daily habit, level mastery, playing Celtic tunes by ear on stage
           =================================================================== */}
        {activeBeatIndex === 5 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/EARPA_01_Green_Celtic_Sanctuary_2K.png')}
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
                theta={Math.sin(frame * 0.02) * 0.4 + 0.2}
                phi={1.38}
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
                Train ten minutes a day to lock in tonal gravitation. Hear Celtic melodies naturally before your fingers strike the harp strings on stage.
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
