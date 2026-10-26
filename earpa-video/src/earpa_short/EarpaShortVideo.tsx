import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { SceneHookShort } from './SceneHookShort';
import { SceneProblemShort } from './SceneProblemShort';
import { SceneMechanismShort } from './SceneMechanismShort';
import { SceneGameplayShort } from './SceneGameplayShort';
import { SceneCTAShort } from './SceneCTAShort';
import { TIMING } from '../earpa/timing';

const SUBTITLES: Array<{ from: number; to: number; tag: string; text: string }> = [
  {
    from: 0,
    to: 70,
    tag: 'LIVE SOLO',
    text: '♫ Celtic harp improvisation with deep acoustic resonance...',
  },
  {
    from: 72,
    to: 200,
    tag: 'HOOK // 01',
    text: "You've always wanted to play by ear, and improvise solos that just feel right and flow naturally out of your instrument.",
  },
  {
    from: 200,
    to: 265,
    tag: 'TRUTH',
    text: "Truth is, that's not magic... it's a trained ear.",
  },
  {
    from: 265,
    to: 375,
    tag: 'DELIBERATE PRACTICE',
    text: 'You practice every day, but when did you train your ears... deliberately?',
  },
  {
    from: 404,
    to: 625,
    tag: 'BENBASSAT METHOD',
    text: 'Built on the proven Alain Benbassat method, Earpa trains you to feel where every note wants to resolve... so you can jam with anyone on the spot, in just ten minutes a day.',
  },
  {
    from: 664,
    to: 895,
    tag: 'TONAL GRAVITY',
    text: 'First, a chord progression grounds your ear. Then you hear a note, and feel its magnetic pull home... while tracking your mastery inside the new Journey and Melody cards.',
  },
  {
    from: 934,
    to: 1148,
    tag: '3 GUIDED PATHS',
    text: 'Master three guided paths across over two hundred levels... with real 3D levers.',
  },
  {
    from: 1172,
    to: 1285,
    tag: 'EARPA.APP',
    text: 'Stop guessing notes. Speak through your instrument... with Earpa.',
  },
];

const CUT_FRAMES = [400, 660, 930, 1165];

export const EarpaShortVideo: React.FC = () => {
  const frame = useCurrentFrame();

  let flashOpacity = 0;
  for (const cut of CUT_FRAMES) {
    const dist = Math.abs(frame - cut);
    if (dist <= 4) {
      flashOpacity = Math.max(flashOpacity, interpolate(dist, [0, 4], [0.35, 0]));
    }
  }

  const activeSub = SUBTITLES.find((s) => frame >= s.from && frame <= s.to);

  return (
    <AbsoluteFill style={{ backgroundColor: '#05080f' }}>
      {/* Master 45-Second Synchronized Acoustic Harp, ASMR Haptics & Relaxed Human Voiceover Track */}
      <Audio src={staticFile('audio/earpa_master_30s.mp3')} volume={1} />

      {/* Scene 1: The Hook (0 - 400) */}
      <Sequence
        from={TIMING.scene1.from}
        durationInFrames={TIMING.scene1.durationInFrames}
        name="Scene 1: The Hook"
      >
        <SceneHookShort />
      </Sequence>

      {/* Scene 2: The Alain Benbassat Method & Jamming Freedom (400 - 660) */}
      <Sequence
        from={TIMING.scene2.from}
        durationInFrames={TIMING.scene2.durationInFrames}
        name="Scene 2: Problem & Science"
      >
        <SceneProblemShort />
      </Sequence>

      {/* Scene 3: The Alain Benbassat Method (660 - 930) */}
      <Sequence
        from={TIMING.scene3.from}
        durationInFrames={TIMING.scene3.durationInFrames}
        name="Scene 3: Mechanism"
      >
        <SceneMechanismShort />
      </Sequence>

      {/* Scene 4: Gameplay Curriculum & Tactile 3D Levers (930 - 1165) */}
      <Sequence
        from={TIMING.scene4.from}
        durationInFrames={TIMING.scene4.durationInFrames}
        name="Scene 4: Gameplay & Levers"
      >
        <SceneGameplayShort />
      </Sequence>

      {/* Scene 5: Finale & Conversion Action (1165 - 1350) */}
      <Sequence
        from={TIMING.scene5.from}
        durationInFrames={TIMING.scene5.durationInFrames}
        name="Scene 5: Conversion Finale"
      >
        <SceneCTAShort />
      </Sequence>

      {/* Global Cut Transition Flash */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: '#fbbf24',
            opacity: flashOpacity,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Global Floating Mobile Subtitle Bar (Bottom Safe Zone) */}
      {activeSub && (
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 48,
            right: 48,
            padding: '12px 20px',
            borderRadius: 18,
            background: 'rgba(5, 8, 15, 0.96)',
            border: '1.5px solid rgba(212, 175, 55, 0.55)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.85), 0 0 20px rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 99,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              background: 'rgba(212, 175, 55, 0.2)',
              border: '1px solid #fbbf24',
              color: '#fbbf24',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            {activeSub.tag}
          </div>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#f8fafc',
              lineHeight: 1.3,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {activeSub.text}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
