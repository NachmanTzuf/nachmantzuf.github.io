import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { InstructionLayout, InstructionTheme } from './InstructionLayout';
import { LetterButtonBar } from './LetterButtonBar';

const THEME: InstructionTheme = {
  primary: '#10b981',
  primaryGlow: 'rgba(16, 185, 129, 0.45)',
  accent: '#34d399',
  bgGradient: 'radial-gradient(ellipse at 50% 38%, #092c20 0%, #061511 45%, #020605 100%)',
  trackLabel: 'PATH 1 · SINGLE NOTES',
};

const BEATS = [
  {
    from: 0,
    to: 315,
    category: 'PATH 1 · SINGLE NOTES',
    title: 'THE TONIC ANCHOR',
    subtitle: 'Functional Ear Training · The Alain Benbassat Method',
  },
  {
    from: 315,
    to: 675,
    category: 'GROUNDING THE EAR',
    title: 'CADENCE IN C MAJOR',
    subtitle: 'I · IV · V · I Establishes C as Your Home Center',
  },
  {
    from: 675,
    to: 1095,
    category: 'LEVEL 1 · FIRST ROUND',
    title: 'HEAR MYSTERY NOTE G',
    subtitle: 'Bright, Open Stability of Note G · Pluck G to Confirm',
  },
  {
    from: 1095,
    to: 1485,
    category: 'LEVEL 1 · SECOND ROUND',
    title: 'HOMEDOWN RESOLUTION',
    subtitle: 'F Resolves Down Through E and D to Tonic C',
  },
  {
    from: 1485,
    to: 1800,
    category: 'PATH MASTERY',
    title: 'DAILY REFLEX TRAINING',
    subtitle: 'Hum Tonic C · 76 Levels on Coastal Trail',
  },
];

export const Path1SingleNotesVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active beat
  const beatIndex = Math.max(0, BEATS.findIndex((b) => frame >= b.from && frame < b.to));
  const currentBeat = BEATS[beatIndex];
  const localFrame = frame - currentBeat.from;

  // Screen transition opacity
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      {/* 1. Synchronized Broadcast Master Audio */}
      <Audio src={staticFile('audio/instructions/path1_single_notes_master.mp3')} />

      {/* 2. Structured Layout */}
      <InstructionLayout
        theme={THEME}
        category={currentBeat.category}
        title={currentBeat.title}
        subtitle={currentBeat.subtitle}
        beatIndex={beatIndex}
        totalBeats={BEATS.length}
        localFrame={localFrame}
      >
        {/* BEAT 1: Sanctuary Overview & Tonal Gravity Concept */}
        {beatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_single_home.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Tonal Gravity Magnetic Waves Pulsing Inward to C */}
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 320,
                height: 320,
                borderRadius: '50%',
                border: `2px solid ${THEME.primary}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}, inset 0 0 30px ${THEME.primaryGlow}`,
                opacity: 0.4 + 0.3 * Math.sin(frame * 0.1),
                pointerEvents: 'none',
              }}
            />
            {/* Center Anchor Note C Pill */}
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '12px 28px',
                borderRadius: 24,
                backgroundColor: 'rgba(6, 78, 59, 0.9)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 25px ${THEME.primary}`,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 26,
                letterSpacing: 2,
                textAlign: 'center',
              }}
            >
              TONIC ANCHOR: C
            </div>
          </div>
        )}

        {/* BEAT 2: Cadence I - IV - V - I in C Major */}
        {beatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Illuminated Cadence Bar Overlays */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 18,
                right: 18,
                height: 54,
                display: 'flex',
                gap: 8,
              }}
            >
              {[
                { chord: 'I : C Maj', active: frame >= 375 },
                { chord: 'IV : F Maj', active: frame >= 405 },
                { chord: 'V : G Maj', active: frame >= 435 },
                { chord: 'I : C Maj', active: frame >= 465 },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: c.active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                    border: `1.5px solid ${c.active ? THEME.primary : 'rgba(255,255,255,0.2)'}`,
                    boxShadow: c.active ? `0 0 16px ${THEME.primary}` : 'none',
                    color: c.active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {c.chord}
                </div>
              ))}
            </div>

            {/* Letter Note Buttons C D E F G A B C */}
            <LetterButtonBar
              activeNotes={frame >= 465 ? ['C'] : []}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 3: Level 1 Walkthrough · Mystery Note G Sounds & Plucked */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Note String G Highlights */}
            {frame >= 855 && (
              <div
                style={{
                  position: 'absolute',
                  top: '35%',
                  left: '58%',
                  width: 6,
                  height: 310,
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 24px #38bdf8',
                  borderRadius: 3,
                }}
              />
            )}

            {/* Pluck Event at frame 960 */}
            {frame >= 960 && (
              <div
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '16px 32px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(6, 78, 59, 0.95)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 35px ${THEME.primary}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 44, fontWeight: 800, color: '#ffffff' }}>PLUCK: G</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: THEME.accent }}>
                  +10 SHARDS · PERFECT MATCH
                </div>
              </div>
            )}

            {/* Letter Note Buttons C D E F G A B C */}
            <LetterButtonBar
              activeNotes={frame >= 960 ? ['G'] : []}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 4: Level 1 Round 2 · Mystery Note F & Homeward Resolution Walk */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_resolution.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Stepwise Resolution Pathway: F -> E -> D -> C */}
            <div
              style={{
                position: 'absolute',
                bottom: 96,
                left: 20,
                right: 20,
                padding: '14px 18px',
                borderRadius: 22,
                backgroundColor: 'rgba(2, 44, 34, 0.94)',
                border: `1.5px solid ${THEME.accent}`,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {[
                { note: 'F', active: frame >= 1290, desc: 'Tension 4th' },
                { note: 'E', active: frame >= 1320, desc: 'Sweet 3rd' },
                { note: 'D', active: frame >= 1350, desc: 'Passing 2nd' },
                { note: 'C', active: frame >= 1380, desc: 'Home Root' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      fontWeight: 800,
                      backgroundColor: step.active ? THEME.primary : 'rgba(255,255,255,0.1)',
                      color: step.active ? '#ffffff' : 'rgba(255,255,255,0.4)',
                      border: `2px solid ${step.active ? THEME.accent : 'transparent'}`,
                      boxShadow: step.active ? `0 0 16px ${THEME.primary}` : 'none',
                    }}
                  >
                    {step.note}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#cbd5e1' }}>
                    {step.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* Letter Note Buttons C D E F G A B C */}
            <LetterButtonBar
              activeNotes={
                frame >= 1380
                  ? ['C']
                  : frame >= 1350
                  ? ['D']
                  : frame >= 1320
                  ? ['E']
                  : frame >= 1245
                  ? ['F']
                  : []
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 5: Coastal Trail Map (Levels 1 to 76) & Final Call to Action */}
        {beatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_coastal_roadmap.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Glowing Milestone Card Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 80,
                left: 30,
                right: 30,
                padding: '20px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(6, 78, 59, 0.92)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>76</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>LEVELS</div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>94%</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>ACCURACY</div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>5 MIN</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>DAILY</div>
              </div>
            </div>

            {/* Bottom Floating Action Button */}
            <div
              style={{
                position: 'absolute',
                bottom: 80,
                left: 40,
                right: 40,
                padding: '18px 0',
                borderRadius: 28,
                backgroundColor: THEME.primary,
                boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 2,
                color: '#ffffff',
              }}
            >
              ▷ START COASTAL RIDGE
            </div>
          </div>
        )}
      </InstructionLayout>
    </AbsoluteFill>
  );
};
