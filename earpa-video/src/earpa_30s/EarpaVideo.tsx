import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SceneHook } from './SceneHook';
import { SceneProblem } from './SceneProblem';
import { SceneMechanism } from './SceneMechanism';
import { SceneGameplay } from './SceneGameplay';
import { SceneCTA } from './SceneCTA';
import { TIMING } from './timing';

export const EarpaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a08' }}>
      {/* Scene 1: The Musician's Blind Spot Hook */}
      <Sequence
        from={TIMING.scene1.from}
        durationInFrames={TIMING.scene1.durationInFrames}
        name="Scene 1: The Hook"
      >
        <SceneHook />
      </Sequence>

      {/* Scene 2: The Hesitation Trap */}
      <Sequence
        from={TIMING.scene2.from}
        durationInFrames={TIMING.scene2.durationInFrames}
        name="Scene 2: The Hesitation Trap"
      >
        <SceneProblem />
      </Sequence>

      {/* Scene 3: The Alain Benbassat Tonal Gravity Engine */}
      <Sequence
        from={TIMING.scene3.from}
        durationInFrames={TIMING.scene3.durationInFrames}
        name="Scene 3: Tonal Gravity Mechanism"
      >
        <SceneMechanism />
      </Sequence>

      {/* Scene 4: 10 Minutes A Day Gameplay & Proof */}
      <Sequence
        from={TIMING.scene4.from}
        durationInFrames={TIMING.scene4.durationInFrames}
        name="Scene 4: Gameplay Proof"
      >
        <SceneGameplay />
      </Sequence>

      {/* Scene 5: CTA & Improvisation Gateway */}
      <Sequence
        from={TIMING.scene5.from}
        durationInFrames={TIMING.scene5.durationInFrames}
        name="Scene 5: Brand CTA"
      >
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
