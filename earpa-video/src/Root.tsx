import {V5PulseVertical,MotionLesson} from './plus/MotionPlus';
import {RefinedMarketing,RefinedLesson} from './refined/Refined';
import {KineticAd,SingleTutorial,LeverMasterclass} from './kinetic/Kinetic';
import {MotionSuite} from './mission/MotionSuite';
import { Path1SingleNotesVideo } from './instructions/Path1SingleNotesVideo';
import { Path2MelodyPhrasingVideo } from './instructions/Path2MelodyPhrasingVideo';
import { Path3CamacLeversVideo } from './instructions/Path3CamacLeversVideo';
import React from 'react';
import { Composition } from 'remotion';
import { EarpaVideo } from './earpa/EarpaVideo';
import { TIMING } from './earpa/timing';
import { EarpaVideo as EarpaVideo30s } from './earpa_30s/EarpaVideo';
import { TIMING as TIMING_30S } from './earpa_30s/timing';
import { EarpaShortVideo } from './earpa_short/EarpaShortVideo';
import { ALL_10_VARIANTS } from './earpa_variants/variantConfigs';
import { VariantVideo } from './earpa_variants/VariantVideo';

export const Root: React.FC = () => {
  return (
    <>
      <Composition id="V5PulseVertical" component={V5PulseVertical} durationInFrames={1350} fps={30} width={1080} height={1920}/>
      <Composition id="SingleMotionPlus" component={MotionLesson} durationInFrames={1800} fps={30} width={1080} height={1920} defaultProps={{track:'single' as const}}/>
      <Composition id="MelodyMotionPlus" component={MotionLesson} durationInFrames={1800} fps={30} width={1080} height={1920} defaultProps={{track:'melody' as const}}/>
      <Composition id="LeverMotionPlus" component={MotionLesson} durationInFrames={2700} fps={30} width={1080} height={1920} defaultProps={{track:'levers' as const}}/>
      <Composition id="RefinedLandscape" component={RefinedMarketing} durationInFrames={1350} fps={30} width={1920} height={1080}/>
      <Composition id="RefinedVertical" component={RefinedMarketing} durationInFrames={1350} fps={30} width={1080} height={1920}/>
      <Composition id="SingleNoteFullMinute" component={RefinedLesson} durationInFrames={1800} fps={30} width={1080} height={1920} defaultProps={{track:'single' as const}}/>
      <Composition id="LeverRealMasterclass" component={RefinedLesson} durationInFrames={2700} fps={30} width={1080} height={1920} defaultProps={{track:'levers' as const}}/>
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
        id="EarpaV5Perfected"
        component={EarpaShortVideo}
        durationInFrames={TIMING.totalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
      {ALL_10_VARIANTS.map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={VariantVideo as any}
          durationInFrames={v.durationInFrames}
          fps={v.fps}
          width={1080}
          height={1920}
          defaultProps={v}
        />
      ))}
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
      <Composition id="KineticLandscape" component={KineticAd} durationInFrames={1350} fps={30} width={1920} height={1080}/>
      <Composition id="KineticVertical" component={KineticAd} durationInFrames={1350} fps={30} width={1080} height={1920}/>
      <Composition id="SingleNoteWalkthrough" component={SingleTutorial} durationInFrames={1200} fps={30} width={1080} height={1920}/>
      <Composition id="LeverMasterclassRebuilt" component={LeverMasterclass} durationInFrames={2700} fps={30} width={1080} height={1920}/>
      <Composition
        id="EarpaPath1SingleNotesLesson"
        component={Path1SingleNotesVideo}
        durationInFrames={2700}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EarpaPath2MelodicSequenceLesson"
        component={Path2MelodyPhrasingVideo}
        durationInFrames={2700}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EarpaPath3CamacLeversLesson"
        component={Path3CamacLeversVideo}
        durationInFrames={3600}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

