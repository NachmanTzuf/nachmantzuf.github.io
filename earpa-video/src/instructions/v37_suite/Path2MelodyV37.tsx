import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import timeline from '../../../public/audio/instructions/timeline_path2_v37.json';
import { HeroHarpStage, SuiteFontLoader } from './FontsAndTheme';
import { MelodyContourStage } from './FuturisticConceptStages';
import {
  GameplayRoundEvent,
  LiveGameplayPhoneStage,
  PhoneCalloutStage,
} from './InteractivePhoneStage';

export const PATH2_V37_TOTAL_FRAMES = timeline.totalFrames;

export const Path2MelodyV37: React.FC = () => {
  const s = timeline.scenes;

  const introDur = s.introEnd - s.introStart;
  const conceptDur = s.conceptEnd - s.conceptStart;
  const mapDur = s.mapEnd - s.mapStart;
  const ingameDur = s.ingameEnd - s.ingameStart;
  const insightsDur = s.insightsEnd - s.insightsStart;
  const outroDur = timeline.totalFrames - s.outroStart;

  const tapSplitInMap = Math.max(30, s.mapTapPlay - s.mapStart - 16);

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
    decideStartFrame: r.decideStartFrame - s.ingameStart,
    keyTaps: r.keyTaps.map((kt) => ({
      ...kt,
      tapFrame: kt.tapFrame - s.ingameStart,
    })),
    slotNotes: r.slotNotes.map((sn) => ({
      ...sn,
      revealFrame: sn.revealFrame - s.ingameStart,
    })),
    lockInBanner: r.lockInBanner,
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
  const r1LastTap = r1.keyTaps[r1.keyTaps.length - 1].tapFrame;
  const r2LastTap = r2.keyTaps[r2.keyTaps.length - 1].tapFrame;

  const gameplayCaptions = [
    {
      startFrame: 0,
      endFrame: r1.mysteryPluckFrames[0],
      topTag: 'ROUND 1 · LISTEN',
      topTitle: 'Home Chords & 3-Note Melody',
      bottomCoach: 'Listen to the home chords, then hear three steady notes play.',
    },
    {
      startFrame: r1.mysteryPluckFrames[0],
      endFrame: r1.decideStartFrame ?? r1LastTap,
      topTag: 'STEP 1 · THINK',
      topTitle: 'Hum Home C · Picture the Shape',
      bottomCoach: 'Pause to remember how the melody starts at C and climbs upward.',
    },
    {
      startFrame: r1.decideStartFrame ?? r1LastTap,
      endFrame: r1.verdictFrame,
      topTag: 'STEP 2 · DECIDE & LOCK IN',
      topTitle: 'Tap C · E · G to Lock Sequence',
      bottomCoach: 'Each tap fills a slot in order; after the third note, your answer locks in.',
    },
    {
      startFrame: r1.verdictFrame,
      endFrame: r2.roundStartFrame,
      topTag: 'STEP 3 · APP CONFIRMS RIGHT',
      topTitle: 'Right Sequence · Listen Back',
      bottomCoach: 'The app checks all three notes, confirms you are right, and replays them.',
    },
    {
      startFrame: r2.roundStartFrame,
      endFrame: r2.mysteryPluckFrames[0],
      topTag: 'ROUND 2 · LISTEN',
      topTitle: 'Same Home Chords & Speed',
      bottomCoach: 'Listen for the same steady pace before the second three-note tune.',
    },
    {
      startFrame: r2.mysteryPluckFrames[0],
      endFrame: r2.decideStartFrame ?? r2LastTap,
      topTag: 'STEP 1 · THINK',
      topTitle: 'Trace Starting High & Stepping Down',
      bottomCoach: 'Hum home C — feel this shape start higher and walk back home.',
    },
    {
      startFrame: r2.decideStartFrame ?? r2LastTap,
      endFrame: r2.verdictFrame,
      topTag: 'STEP 2 · DECIDE & LOCK IN',
      topTitle: 'Lock In Your Guess · C · G · E',
      bottomCoach: 'Watch what happens once you tap three notes in order and lock them in.',
    },
    {
      startFrame: r2.verdictFrame,
      endFrame: ingameDur + 30,
      topTag: 'STEP 3 · APP CONFIRMS WRONG',
      topTitle: 'Wrong Sequence · Real: G · E · C',
      bottomCoach: 'The app shows your wrong guess immediately and replays the real tune.',
    },
  ];

  return (
    <SuiteFontLoader>
      <Audio src={staticFile('audio/instructions/path2_motion_v37.mp3')} />

      <Sequence from={s.introStart} durationInFrames={introDur}>
        <HeroHarpStage
          theme="melody"
          titleLine1="Melodic Memory"
          titleLine2="Living Phrases"
          subtitle="Move from single tones to whole musical contours inside tonal gravity."
          pluckEvents={[
            { stringNum: 1, startFrame: 6 },
            { stringNum: 3, startFrame: 13 },
            { stringNum: 5, startFrame: 20 },
            { stringNum: 8, startFrame: 27 },
          ]}
          totalSceneFrames={introDur}
        />
      </Sequence>

      <Sequence from={s.conceptStart} durationInFrames={conceptDur}>
        <MelodyContourStage
          totalFrames={conceptDur}
          noteFrames={s.conceptNotes.map((f) => f - s.conceptStart)}
        />
      </Sequence>

      <Sequence from={s.mapStart} durationInFrames={mapDur}>
        <PhoneCalloutStage
          theme="melody"
          textureSrc="textures/v37/p2_map_04.png"
          totalFrames={mapDur}
          beats={[
            {
              startFrame: 0,
              endFrame: tapSplitInMap,
              headerTag: 'MELODY TRAIL MAP',
              headerTitle: 'Check Tempo & Phrase Length',
              bottomCaption: 'See allowed scale degrees, rounds, and exact BPM before playing.',
              calloutBadge: 'P2-04 · 3 Notes · 60 BPM',
              targetX: 0.65,
              targetY: 0.535,
              highlightBox: { x: 0.445, y: 0.478, w: 0.42, h: 0.108 },
              badgeSide: 'top-left',
            },
            {
              startFrame: tapSplitInMap,
              endFrame: mapDur,
              headerTag: 'ENTER IN-GAME',
              headerTitle: 'Launch Sequence Training',
              bottomCaption: 'Tap Play level to hear the live three-note phrase.',
              calloutBadge: 'Tap Play level →',
              targetX: 0.645,
              targetY: 0.628,
              highlightBox: { x: 0.425, y: 0.598, w: 0.44, h: 0.058 },
              tapPulseFrame: s.mapTapPlay - s.mapStart,
              badgeSide: 'bottom-left',
            },
          ]}
        />
      </Sequence>

      <Sequence from={s.ingameStart} durationInFrames={ingameDur}>
        <LiveGameplayPhoneStage
          theme="melody"
          textureSrc="textures/v37/p2_ingame.png"
          totalFrames={ingameDur}
          levelCode="P2-04 · Seq Intro 4: Three-Note Triad"
          rounds={ingameRounds}
          captions={gameplayCaptions}
        />
      </Sequence>

      <Sequence from={s.insightsStart} durationInFrames={insightsDur}>
        <PhoneCalloutStage
          theme="melody"
          textureSrc="textures/v37/p2_insights.png"
          totalFrames={insightsDur}
          beats={[
            {
              startFrame: 0,
              endFrame: Math.round(insightsDur * 0.5),
              headerTag: 'PHRASE ANALYTICS',
              headerTitle: 'Review Score & Speed',
              bottomCaption: 'Track total completed melodies and response cadence.',
              calloutBadge: '14 / 15 Score & 1.4s Pace',
              targetX: 0.63,
              targetY: 0.30,
              highlightBox: { x: 0.28, y: 0.24, w: 0.44, h: 0.23 },
              badgeSide: 'top-right',
            },
            {
              startFrame: Math.round(insightsDur * 0.5),
              endFrame: insightsDur,
              headerTag: 'TARGETED PHRASING',
              headerTitle: 'Spot Weakest Intervals',
              bottomCaption: 'Identify which scale degree lags behind inside sequences.',
              calloutBadge: 'Next Practice · G (5)',
              targetX: 0.5,
              targetY: 0.63,
              highlightBox: { x: 0.16, y: 0.58, w: 0.68, h: 0.11 },
              badgeSide: 'bottom-left',
            },
          ]}
        />
      </Sequence>

      <Sequence from={s.outroStart} durationInFrames={outroDur}>
        <HeroHarpStage
          theme="melody"
          kicker="EARPA · MELODIC MEMORY"
          titleLine1="Anchor The Start."
          titleLine2="Hear The Whole Line."
          subtitle="Track every contour upward and downward through gravity."
          startTheta={0.42}
          pluckEvents={[{ stringNum: 1, startFrame: Math.max(5, outroDur - 65) }, { stringNum: 5, startFrame: Math.max(8, outroDur - 62) }, { stringNum: 8, startFrame: Math.max(12, outroDur - 58) }]}
          totalSceneFrames={outroDur}
          fadeOutAtEndFrames={16}
        />
      </Sequence>
    </SuiteFontLoader>
  );
};
