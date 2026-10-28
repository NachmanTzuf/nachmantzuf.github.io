import {MotionSuite} from './mission/MotionSuite';
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
      <Composition id="EarpaV7" component={MotionSuite} durationInFrames={1350} fps={30} width={1920} height={1080} defaultProps={{suiteId:"EarpaV7"}} />
      <Composition id="EarpaV8" component={MotionSuite} durationInFrames={1350} fps={30} width={1920} height={1080} defaultProps={{suiteId:"EarpaV8"}} />
      <Composition id="EarpaV9" component={MotionSuite} durationInFrames={1350} fps={30} width={1920} height={1080} defaultProps={{suiteId:"EarpaV9"}} />
      <Composition id="EarpaShort1" component={MotionSuite} durationInFrames={1350} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaShort1"}} />
      <Composition id="EarpaShort2" component={MotionSuite} durationInFrames={1350} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaShort2"}} />
      <Composition id="EarpaShort3" component={MotionSuite} durationInFrames={1350} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaShort3"}} />
      <Composition id="EarpaShort4" component={MotionSuite} durationInFrames={1350} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaShort4"}} />
      <Composition id="EarpaShort5" component={MotionSuite} durationInFrames={1350} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaShort5"}} />
      <Composition id="EarpaSingleA" component={MotionSuite} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaSingleA"}} />
      <Composition id="EarpaSingleB" component={MotionSuite} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaSingleB"}} />
      <Composition id="EarpaMelodyA" component={MotionSuite} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaMelodyA"}} />
      <Composition id="EarpaMelodyB" component={MotionSuite} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaMelodyB"}} />
      <Composition id="EarpaLeversA" component={MotionSuite} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaLeversA"}} />
      <Composition id="EarpaLeversB" component={MotionSuite} durationInFrames={600} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaLeversB"}} />
      <Composition id="EarpaLeverMasterclass" component={MotionSuite} durationInFrames={2700} fps={30} width={1080} height={1920} defaultProps={{suiteId:"EarpaLeverMasterclass"}} />
    </>
  );
};
