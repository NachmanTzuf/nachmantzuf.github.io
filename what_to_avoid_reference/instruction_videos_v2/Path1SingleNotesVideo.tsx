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
import { LetterButtonBar } from './LetterButtonBar';
import { AlainBenbassatPaperCard } from './AlainBenbassatPaperCard';

const THEME: InstructionTheme = {
  primary: '#10b981',
  primaryGlow: 'rgba(16, 185, 129, 0.45)',
  accent: '#34d399',
  bgGradient: 'radial-gradient(circle at 50% 25%, #064e3b 0%, #061f18 45%, #030a08 100%)',
  trackLabel: 'PATH 1 · SINGLE NOTES',
};

// 80 seconds at 30 fps = 2400 frames
export const Path1SingleNotesVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 5 Distinct Pedagogical Beats
  // Beat 1: 0 - 480 (0s - 16s) -> Alain Benbassat Paper Card & Method
  // Beat 2: 480 - 930 (16s - 31s) -> Cadence Grounding in C Major
  // Beat 3: 930 - 1500 (31s - 50s) -> Level 1 First Round (Mystery G)
  // Beat 4: 1500 - 2040 (50s - 68s) -> Level 1 Round 2 (F & Downward Walk)
  // Beat 5: 2040 - 2400 (68s - 80s) -> Daily Routine & Coastal Roadmap

  let beatIndex = 0;
  let beatStart = 0;
  let category = '01 · COGNITIVE METHOD';
  let title = 'TONAL GRAVITY';
  let subtitle = 'Why isolated interval guessing fails and tonal gravity succeeds.';

  if (frame >= 2040) {
    beatIndex = 4;
    beatStart = 2040;
    category = '05 · DAILY FLUENCY';
    title = '5-MINUTE ROUTINE';
    subtitle = 'Hum tonic C before plucking to build permanent reflex recognition.';
  } else if (frame >= 1500) {
    beatIndex = 3;
    beatStart = 1500;
    category = '04 · RESOLUTION WALK';
    title = 'HOMEWARD PULL';
    subtitle = 'Feel the heavy downward ache: F resolves to E, D, and rests on C.';
  } else if (frame >= 930) {
    beatIndex = 2;
    beatStart = 930;
    category = '03 · LEVEL 1 PLAY';
    title = 'FIRST PLUCK';
    subtitle = 'The mystery note rings open and bright. Pluck G to lock it in.';
  } else if (frame >= 480) {
    beatIndex = 1;
    beatStart = 480;
    category = '02 · TONIC ANCHOR';
    title = 'CADENCE IN C';
    subtitle = 'Every level begins with an authentic cadence establishing C as home.';
  }

  const localFrame = frame - beatStart;
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  return (
    <AbsoluteFill>
      {/* Authentic Master Audio: Edge-TTS + Warm Spruce Harp Cadence + Wood Foley */}
      <Audio src={staticFile('audio/instructions/path1_single_notes_master.mp3')} volume={1.0} />

      <InstructionLayout
        theme={THEME}
        category={category}
        title={title}
        subtitle={subtitle}
        beatIndex={beatIndex}
        totalBeats={5}
        localFrame={localFrame}
      >
        {/* BEAT 1: Core Philosophy & Alain Benbassat Paper Card */}
        {beatIndex === 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_single_home.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Dynamic Intro Tag before Paper Card */}
            {frame < 210 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '12px 26px',
                  borderRadius: 24,
                  backgroundColor: 'rgba(6, 78, 59, 0.92)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 25px ${THEME.primary}`,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                COGNITIVE METHOD · 220+ LEVELS
              </div>
            )}

            {/* Alain Benbassat Liquid Glass Paper Card (7s - 16s / frames 210 - 480) */}
            {frame >= 210 && (
              <AlainBenbassatPaperCard
                themeColor={THEME.primary}
                themeGlow={THEME.primaryGlow}
                accentColor={THEME.accent}
                localFrame={frame - 210}
              />
            )}
          </div>
        )}

        {/* BEAT 2: Authentic Cadence in C Major */}
        {beatIndex === 1 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_single_home.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Cadence Chord Sequence Progression Cards */}
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
                { chord: 'I : C Maj', active: frame >= 585 },
                { chord: 'IV : F Maj', active: frame >= 617 },
                { chord: 'V : G Maj', active: frame >= 648 },
                { chord: 'I : C Maj', active: frame >= 680 },
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

            {/* Glowing highlight on native tonic C pad only */}
            <LetterButtonBar
              activeNotes={frame >= 680 ? ['C'] : []}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 3: Level 1 Walkthrough · First Round (Mystery G) */}
        {beatIndex === 2 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_ingame_playing.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* ZERO blue vertical lines beside the harp! Clean, authentic gameplay. */}

            {/* Pluck Event Confirmation Card at 47.5s (frame 1425) */}
            {frame >= 1425 && (
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

            {/* Native Pad G Glow Overlay */}
            <LetterButtonBar
              activeNotes={frame >= 1425 ? ['G'] : []}
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 4: Level 1 Round 2 · Mystery Note F & Downward Resolution Walk */}
        {beatIndex === 3 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={
                frame >= 1836
                  ? staticFile('textures/real/live_app/app_screen_ingame_resolution.png')
                  : staticFile('textures/real/live_app/app_screen_ingame_playing.png')
              }
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Pluck F Card at 56.5s (frame 1695) */}
            {frame >= 1695 && frame < 1836 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46%',
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
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 40, fontWeight: 800, color: '#ffffff' }}>PLUCK: F</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.accent }}>
                  DOWNWARD TENSION IDENTIFIED
                </div>
              </div>
            )}

            {/* Stepwise Resolution Walkdown Card (61.2s to 68s / frames 1836 - 2040) */}
            {frame >= 1836 && (
              <div
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 20,
                  right: 20,
                  padding: '16px 20px',
                  borderRadius: 22,
                  backgroundColor: 'rgba(6, 78, 59, 0.94)',
                  border: `2px solid ${THEME.accent}`,
                  boxShadow: `0 0 30px ${THEME.primaryGlow}`,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                {[
                  { note: 'F', deg: 'Ache', active: frame >= 1956 },
                  { note: 'E', deg: 'Fall', active: frame >= 1972 },
                  { note: 'D', deg: 'Drop', active: frame >= 1988 },
                  { note: 'C', deg: 'Home', active: frame >= 2004 },
                ].map((step, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: step.active ? '#ffffff' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {step.note}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: step.active ? THEME.accent : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {step.deg}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Native Pad Highlights */}
            <LetterButtonBar
              activeNotes={
                frame >= 2004
                  ? ['C']
                  : frame >= 1956
                  ? ['F']
                  : frame >= 1695
                  ? ['F']
                  : []
              }
              themeColor={THEME.primary}
              themeGlow={THEME.primaryGlow}
            />
          </div>
        )}

        {/* BEAT 5: Daily Routine & Coastal Ridge Roadmap */}
        {beatIndex === 4 && (
          <div style={{ position: 'relative', width: '100%', height: '100%', opacity: enterSpring }}>
            <Img
              src={staticFile('textures/real/live_app/app_screen_coastal_roadmap.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Progress Badge */}
            <div
              style={{
                position: 'absolute',
                top: 80,
                left: 30,
                right: 30,
                padding: '18px 24px',
                borderRadius: 24,
                backgroundColor: 'rgba(6, 78, 59, 0.94)',
                border: `2px solid ${THEME.accent}`,
                boxShadow: `0 0 35px ${THEME.primaryGlow}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>70</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>LEVELS</div>
              </div>
              <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>5 MIN</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.accent }}>DAILY DISCIPLINE</div>
              </div>
            </div>

            {/* Bottom Call to Action Button */}
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
                color: '#000000',
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
