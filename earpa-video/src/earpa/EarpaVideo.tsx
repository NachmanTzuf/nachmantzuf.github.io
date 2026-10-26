import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { SceneHook } from './SceneHook';
import { SceneProblem } from './SceneProblem';
import { SceneMechanism } from './SceneMechanism';
import { SceneGameplay } from './SceneGameplay';
import { SceneCTA } from './SceneCTA';
import { TIMING } from './timing';

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

export const EarpaVideo: React.FC = () => {
  const frame = useCurrentFrame();

  let flashOpacity = 0;
  for (const cut of CUT_FRAMES) {
    const dist = Math.abs(frame - cut);
    if (dist <= 4) {
      flashOpacity = Math.max(flashOpacity, interpolate(dist, [0, 4], [0.32, 0]));
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
        <SceneHook />
      </Sequence>

      {/* Scene 2: The Alain Benbassat Method & Jamming Freedom (400 - 660) */}
      <Sequence
        from={TIMING.scene2.from}
        durationInFrames={TIMING.scene2.durationInFrames}
        name="Scene 2: The Method"
      >
        <SceneProblem />
      </Sequence>

      {/* Scene 3: How It Works — 3D Tonal Gravity Mechanism (660 - 930) */}
      <Sequence
        from={TIMING.scene3.from}
        durationInFrames={TIMING.scene3.durationInFrames}
        name="Scene 3: Tonal Gravity Mechanism"
      >
        <SceneMechanism />
      </Sequence>

      {/* Scene 4: Multi-Path Gameplay & Rapid Proof (930 - 1165) */}
      <Sequence
        from={TIMING.scene4.from}
        durationInFrames={TIMING.scene4.durationInFrames}
        name="Scene 4: Multi-Path Gameplay Proof"
      >
        <SceneGameplay />
      </Sequence>

      {/* Scene 5: The Improvisation Gateway CTA (1165 - 1350) */}
      <Sequence
        from={TIMING.scene5.from}
        durationInFrames={TIMING.scene5.durationInFrames}
        name="Scene 5: Brand CTA"
      >
        <SceneCTA />
      </Sequence>

      {/* Bottom Caption Telemetry Bar */}
      {activeSub && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 26px',
            borderRadius: 999,
            background: 'rgba(6, 10, 18, 0.90)',
            border: '1px solid rgba(212, 175, 55, 0.48)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 14px 40px rgba(0,0,0,0.65)',
            zIndex: 50,
          }}
        >
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 999,
              background: 'rgba(212, 175, 55, 0.2)',
              color: '#fbbf24',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
            }}
          >
            {activeSub.tag}
          </span>
          <span
            style={{
              color: '#f8fafc',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: -0.2,
            }}
          >
            {activeSub.text}
          </span>
        </div>
      )}

      {/* Scene Transition Flash Overlay */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.85) 0%, rgba(56, 189, 248, 0.4) 100%)',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 60,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
