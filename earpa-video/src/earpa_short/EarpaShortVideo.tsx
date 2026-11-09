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
import { KineticHeroText } from './KineticHeroText';
import { TIMING } from '../earpa/timing';

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

  return (
    <AbsoluteFill style={{ backgroundColor: '#05080f' }}>
      {/* Master 45-Second Extended Solo & Balanced Semiotic Foley Soundtrack */}
      <Audio src={staticFile('audio/earpa_master_v5_foley.mp3')} volume={1} />

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

      {/* Scene 3: The Alain Benbassat Method & Tonal Gravity (660 - 930) */}
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

      {/* 5 High-Impact Kinetic Typography Moments (Hero Word Hierarchy) */}
      {/* Beat 1 (Hook): Play By Ear */}
      <KineticHeroText
        startFrame={120}
        endFrame={215}
        prefix="you always wanted to"
        hero="PLAY BY EAR"
        accentColor="#fbbf24"
        top={48}
      />

      {/* Beat 2 (Problem): Feel The Pull */}
      <KineticHeroText
        startFrame={435}
        endFrame={535}
        prefix="stop counting isolated notes"
        hero="FEEL THE PULL"
        suffix="of every note."
        accentColor="#10b981"
        top={48}
      />

      {/* Beat 3 (Mechanism): Grounded By Cadence */}
      <KineticHeroText
        startFrame={710}
        endFrame={815}
        prefix="first, a chord progression"
        hero="GROUNDS YOUR EAR"
        accentColor="#38bdf8"
        top={48}
      />

      {/* Beat 4 (Curriculum): 220+ Levels */}
      <KineticHeroText
        startFrame={950}
        endFrame={1060}
        prefix="explore three guided paths"
        hero="220+ LEVELS"
        suffix="with tactile 3d levers."
        accentColor="#f59e0b"
        top={48}
      />

      {/* Beat 5 (Action): Earpa.app */}
      <KineticHeroText
        startFrame={1190}
        endFrame={1345}
        prefix="speak through your instrument"
        hero="EARPA.APP"
        heroColor="#fbbf24"
        accentColor="#fbbf24"
        top={48}
      />
    </AbsoluteFill>
  );
};
