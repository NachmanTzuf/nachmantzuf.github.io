import React from 'react';
import { Composition } from 'remotion';
import { EarpaVideo } from './earpa/EarpaVideo';
import { TIMING } from './earpa/timing';
import { EarpaVideo as EarpaVideo30s } from './earpa_30s/EarpaVideo';
import { TIMING as TIMING_30S } from './earpa_30s/timing';
import { EarpaShortVideo } from './earpa_short/EarpaShortVideo';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="EarpaPromo"
        component={EarpaVideo}
        durationInFrames={TIMING.totalFrames}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EarpaShort"
        component={EarpaShortVideo}
        durationInFrames={TIMING.totalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EarpaPromo30s"
        component={EarpaVideo30s}
        durationInFrames={TIMING_30S.totalFrames}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
