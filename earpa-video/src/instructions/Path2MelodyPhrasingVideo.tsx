import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { InstructionLayout, InstructionTheme } from './InstructionLayout';
import { Harp3DCanvas } from '../earpa/Harp3DCanvas';
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
      <Audio src={staticFile('audio/instructions/path2_melodic_sequence_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={activeBeatIndex}
        totalBeats={timelineData.length}
        localFrame={localFrame}
      >
        {/* Sanctuary Background: Arctic Glacial Sanctuary */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Img
            src={staticFile('textures/EARPA_02_Arctic_Frozen_Sanctuary_2K.png')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* 3D Realistic Celtic Harp Spinning on the Frozen Altar */}
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
              theta={Math.sin(frame * 0.018) * 0.4 + 0.15}
              phi={1.36}
              radius={2.35}
              targetY={0.42}
              harpScale={0.72}
            />
          </div>

          {/* BEAT 0: Melodic Phrasing Contour Card */}
          {activeBeatIndex === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                opacity: enterSpring,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                MELODIC AUDIATION PRINCIPLE
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>FOLLOW THE CONTOUR</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4 }}>
                Music flows in continuous phrases. Hear the curve of the melodic motif, holding the shape in memory before striking the strings.
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
                <span style={{ fontSize: 15, fontWeight: 700, color: '#7dd3fc' }}>E4 (3)</span>
                <span style={{ fontSize: 18, color: '#ffffff' }}>→</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fef08a' }}>D4 (2)</span>
                <span style={{ fontSize: 18, color: '#ffffff' }}>→</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#34d399' }}>C4 (1)</span>
              </div>
            </div>
          )}

          {/* BEAT 1: Phrase Audiation Arc */}
          {activeBeatIndex === 1 && (
            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                opacity: enterSpring,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                PHRASE CONTOUR DYNAMICS
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>INTERNALIZE MOTIFS</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4 }}>
                Stepwise melodic movement creates momentum that pulls directly toward the tonic root. Catch the whole gesture in a single mental image.
              </div>
              <div
                style={{
                  padding: '10px 18px',
                  borderRadius: 16,
                  backgroundColor: THEME.primary,
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 800,
                  textAlign: 'center',
                }}
              >
                TWO-NOTE MOTIF → FULL ARC
              </div>
            </div>
          )}

          {/* BEAT 2: Silent Audiation Drill */}
          {activeBeatIndex === 2 && (
            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                gap: 12,
                zIndex: 30,
                opacity: enterSpring,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                THE AUDIATION PROTOCOL
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '8px 12px', borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', fontSize: 13 }}>
                  <strong style={{ color: THEME.accent }}>1. LISTEN:</strong> Absorb phrase without touching strings
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', fontSize: 13 }}>
                  <strong style={{ color: '#fef08a' }}>2. AUDIATE:</strong> Sing or hum motif silently inside
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', color: '#ffffff', fontSize: 13 }}>
                  <strong style={{ color: '#34d399' }}>3. PLAY:</strong> Execute on harp in one fluid motion
                </div>
              </div>
            </div>
          )}

          {/* BEAT 3: Expanding Melodic Arcs */}
          {activeBeatIndex === 3 && (
            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                opacity: enterSpring,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.accent, letterSpacing: 2 }}>
                ORNAMENTATION & REEL SPEED
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>CELTIC ORNAMENT ARCS</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4 }}>
                Recognize traditional cuts, rolls, and triplets by their melodic arc contour rather than calculating discrete intervals.
              </div>
            </div>
          )}

          {/* BEAT 4: Celtic Session Readiness */}
          {activeBeatIndex === 4 && (
            <div
              style={{
                position: 'absolute',
                top: '48%',
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
                opacity: enterSpring,
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
          )}
        </div>
      </InstructionLayout>
    </AbsoluteFill>
  );
};
