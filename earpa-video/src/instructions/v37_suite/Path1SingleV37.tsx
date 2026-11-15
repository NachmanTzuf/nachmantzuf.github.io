import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import timeline from '../../../public/audio/instructions/timeline_path1_v37.json';
import { HeroHarpStage, SuiteFontLoader } from './FontsAndTheme';
import { SymmetricalGravityField } from './FuturisticConceptStages';
import {
  GameplayRoundEvent,
  LiveGameplayPhoneStage,
  PhoneCalloutStage,
} from './InteractivePhoneStage';

export const PATH1_V37_TOTAL_FRAMES = timeline.totalFrames;

export const Path1SingleV37: React.FC = () => {
  const s = timeline.scenes;

  const introDur = s.introEnd - s.introStart;
  const conceptDur = s.conceptEnd - s.conceptStart;
  const mapDur = s.mapEnd - s.mapStart;
  const ingameDur = s.ingameEnd - s.ingameStart;
  const insightsDur = s.insightsEnd - s.insightsStart;
  const outroDur = timeline.totalFrames - s.outroStart;

  const tapSplitInMap = Math.max(30, s.mapTapPlay - s.mapStart - 18);

  // Convert global timeline frames to LiveGameplayPhoneStage local frames
  const ingameRounds: GameplayRoundEvent[] = timeline.rounds.map((r) => ({
    roundNumber: r.roundNumber,
    roundStartFrame: r.roundStartFrame - s.ingameStart,
    cadenceChordFrames: r.cadenceChordFrames.map((f) => f - s.ingameStart) as [
      number,
      number,
      number,
      number
    ],
    mysteryPluckFrames: r.mysteryPluckFrames.map((f) => f - s.ingameStart),
    mysteryStrings: r.mysteryStrings,
    humCueStartFrame: r.humCueStartFrame - s.ingameStart,
    humCueEndFrame: r.humCueEndFrame - s.ingameStart,
    keyTaps: r.keyTaps.map((kt) => ({
      ...kt,
      tapFrame: kt.tapFrame - s.ingameStart,
    })),
    verdictFrame: r.verdictFrame - s.ingameStart,
    verdictCorrect: r.verdictCorrect,
    verdictTitle: r.verdictTitle,
    verdictDetail: r.verdictDetail,
    walkPlucks: r.walkPlucks.map((wp) => ({
      ...wp,
      frame: wp.frame - s.ingameStart,
    })),
  }));

  const r1 = ingameRounds[0];
  const r2 = ingameRounds[1];

  const gameplayCaptions = [
    {
      startFrame: 0,
      endFrame: r1.mysteryPluckFrames[0],
      topTag: 'ROUND 1 · LIVE IN-APP PACE',
      topTitle: 'Anchor Cadence (I · IV · V · I)',
      bottomCoach: 'Listen to four grounding chords establishing home key C major.',
    },
    {
      startFrame: r1.mysteryPluckFrames[0],
      endFrame: r1.verdictFrame,
      topTag: 'THINKING WINDOW · FEEL PULL',
      topTitle: 'Pause & Hum Home C',
      bottomCoach: 'Hum low C gently — does the note settle downward or rise upward?',
    },
    {
      startFrame: r1.verdictFrame,
      endFrame: r2.roundStartFrame,
      topTag: 'VERDICT & WALKDOWN · 950ms/STEP',
      topTitle: 'Spot On! · F Resolves Down',
      bottomCoach: 'Clear confirmation first — then hear F step down through E and D to C.',
    },
    {
      startFrame: r2.roundStartFrame,
      endFrame: r2.mysteryPluckFrames[0],
      topTag: 'ROUND 2 · IDENTICAL TIMING',
      topTitle: 'Same Anchor Cadence',
      bottomCoach: 'Exact same harmonic speed before the second mystery pitch.',
    },
    {
      startFrame: r2.mysteryPluckFrames[0],
      endFrame: r2.verdictFrame,
      topTag: 'THINKING WINDOW · HUM HOME C',
      topTitle: 'Listen for Upward Urge',
      bottomCoach: 'Hum low C again — feel the bright upward pull toward high C.',
    },
    {
      startFrame: r2.verdictFrame,
      endFrame: ingameDur + 30,
      topTag: 'RECOVERY WALK · RECALIBRATE',
      topTitle: 'Actual Note: B Resolves Up',
      bottomCoach: 'Wrong guess is corrected gently — then B pulls straight up to high C.',
    },
  ];

  const insightsSplit = Math.max(40, s.insightsSplitFrame - s.insightsStart);

  return (
    <SuiteFontLoader>
      <Audio src={staticFile('audio/instructions/path1_motion_v37.mp3')} />

      {/* 1. Concise Intro Hero Harp */}
      <Sequence from={s.introStart} durationInFrames={introDur}>
        <HeroHarpStage
          theme="single"
          titleLine1="Single Notes"
          titleLine2="Tonal Gravity"
          subtitle="Hear every scale pitch through magnetic pull toward home C."
          pluckEvents={[
            { stringNum: 1, startFrame: 5 },
            { stringNum: 3, startFrame: 12 },
            { stringNum: 5, startFrame: 19 },
            { stringNum: 8, startFrame: 26 },
          ]}
          totalSceneFrames={introDur}
        />
      </Sequence>

      {/* 2. Futuristic Minimal Symmetrical Gravity Field */}
      <Sequence from={s.conceptStart} durationInFrames={conceptDur}>
        <SymmetricalGravityField
          totalFrames={conceptDur}
          lowerFocusStart={s.gravLowFrame - s.conceptStart}
          upperFocusStart={s.gravHighFrame - s.conceptStart}
          lawRevealStart={s.gravHighFrame - s.conceptStart + 55}
        />
      </Sequence>

      {/* 3. Large Phone Trail Map -> Play Launch */}
      <Sequence from={s.mapStart} durationInFrames={mapDur}>
        <PhoneCalloutStage
          theme="single"
          textureSrc="textures/v37/p1_map_12.png"
          totalFrames={mapDur}
          beats={[
            {
              startFrame: 0,
              endFrame: tapSplitInMap,
              headerTag: 'TRAIL MAP NAVIGATION',
              headerTitle: 'Select Any Octave Challenge',
              bottomCaption: 'Inspect active notes, rounds, and tempo directly on the floating card.',
              calloutBadge: 'Level P1-12 · Full Octave',
              targetX: 0.415,
              targetY: 0.50,
              highlightBox: { x: 0.20, y: 0.44, w: 0.432, h: 0.118 },
              badgeSide: 'top-left',
            },
            {
              startFrame: tapSplitInMap,
              endFrame: mapDur,
              headerTag: 'ENTER IN-GAME',
              headerTitle: 'Press Play to Begin',
              bottomCaption: 'Launch straight into live listening practice.',
              calloutBadge: 'Tap Play level →',
              targetX: 0.415,
              targetY: 0.60,
              highlightBox: { x: 0.20, y: 0.574, w: 0.432, h: 0.056 },
              tapPulseFrame: s.mapTapPlay - s.mapStart,
              badgeSide: 'bottom-left',
            },
          ]}
        />
      </Sequence>

      {/* 4. Large Live In-Game Real-Time Walkthrough */}
      <Sequence from={s.ingameStart} durationInFrames={ingameDur}>
        <LiveGameplayPhoneStage
          theme="single"
          textureSrc="textures/v37/p1_ingame.png"
          totalFrames={ingameDur}
          levelCode="P1-12 · C Major - Full Octave"
          rounds={ingameRounds}
          captions={gameplayCaptions}
        />
      </Sequence>

      {/* 5. Genuine End-of-Session Metrics & Next Practice Focus */}
      <Sequence from={s.insightsStart} durationInFrames={insightsDur}>
        <PhoneCalloutStage
          theme="single"
          textureSrc="textures/v37/p1_insights.png"
          totalFrames={insightsDur}
          beats={[
            {
              startFrame: 0,
              endFrame: insightsSplit,
              headerTag: 'SESSION METRICS DEBRIEF',
              headerTitle: 'Track Accuracy & Speed',
              bottomCaption: 'Review total score out of 15 and per-round consistency.',
              calloutBadge: '14 / 15 Score Ring',
              targetX: 0.63,
              targetY: 0.30,
              highlightBox: { x: 0.28, y: 0.24, w: 0.44, h: 0.23 },
              badgeSide: 'top-right',
            },
            {
              startFrame: insightsSplit,
              endFrame: insightsDur,
              headerTag: 'TARGETED MASTERY',
              headerTitle: 'Read Your Weakest Degree',
              bottomCaption: 'Target your weakest degree next to lock in stubborn intervals.',
              calloutBadge: 'Next Practice · B (7)',
              targetX: 0.5,
              targetY: 0.63,
              highlightBox: { x: 0.16, y: 0.58, w: 0.68, h: 0.11 },
              badgeSide: 'bottom-left',
            },
          ]}
        />
      </Sequence>

      {/* 6. Smooth Inspirational Outro Harp */}
      <Sequence from={s.outroStart} durationInFrames={outroDur}>
        <HeroHarpStage
          theme="single"
          kicker="EARPA · SINGLE NOTES MASTERY"
          titleLine1="Trust Gravity."
          titleLine2="Open Your Ear."
          subtitle="Hum home C quietly — every note finds its natural direction."
          startTheta={0.45}
          pluckEvents={[{ stringNum: 1, startFrame: Math.max(5, outroDur - 65) }, { stringNum: 5, startFrame: Math.max(8, outroDur - 62) }, { stringNum: 8, startFrame: Math.max(12, outroDur - 58) }]}
          totalSceneFrames={outroDur}
          fadeOutAtEndFrames={16}
        />
      </Sequence>
    </SuiteFontLoader>
  );
};
