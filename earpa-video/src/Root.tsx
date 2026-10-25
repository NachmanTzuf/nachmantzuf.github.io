import React from 'react';
import { Composition } from 'remotion';
import { EarpaVideo } from './earpa/EarpaVideo';
import { TIMING } from './earpa/timing';

export const Root: React.FC = () => {
  return (
    <Composition
      id="EarpaPromo"
      component={EarpaVideo}
      durationInFrames={TIMING.totalFrames}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
