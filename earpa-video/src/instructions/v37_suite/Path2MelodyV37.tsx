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
    keyTaps: r.keyTaps.map((kt) => ({
      ...kt,
      tapFrame: kt.tapFrame - s.ingameStart,
    })),
    slotNotes: r.slotNotes.map((sn) => ({
      ...sn,
      revealFrame: sn.revealFrame - s.ingameStart,
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
      topTag: 'ROUND 1 · LIVE 60 BPM PACE',
      topTitle: 'Anchor Cadence (I · IV · V · I)',
      bottomCoach: 'Four harmonic chords lock tonic C before the three-note phrase.',
    },
    {
      startFrame: r1.mysteryPluckFrames[0],
      endFrame: r1.verdictFrame,
      topTag: 'MELODY & THINKING PAUSE',
      topTitle: 'Hum C · Catch All 3 Notes',
      bottomCoach: 'Hum home C quietly — recognize C opening upward through E and G.',
    },
    {
      startFrame: r1.verdictFrame,
      endFrame: r2.roundStartFrame,
      topTag: 'REPLAY @ 60 BPM · 1000ms/NOTE',
      topTitle: 'Spot On! · C · E · G',
      bottomCoach: 'After confirming, listen back to the clean ascending triad shape.',
    },
    {
      startFrame: r2.roundStartFrame,
      endFrame: r2.mysteryPluckFrames[0],
      topTag: 'ROUND 2 · IDENTICAL PACE',
      topTitle: 'Same Cadence & Tempo',
      bottomCoach: 'Identical grounding progression before the second phrase.',
    },
    {
      startFrame: r2.mysteryPluckFrames[0],
      endFrame: r2.verdictFrame,
      topTag: 'MELODY & THINKING PAUSE',
      topTitle: 'Trace Descending Direction',
      bottomCoach: 'Hum C — notice this phrase starts high on G and falls home.',
    },
    {
      startFrame: r2.verdictFrame,
      endFrame: ingameDur + 30,
      topTag: 'TRUE CONTOUR REPLAY',
      topTitle: 'Actual Phrase: G · E · C',
      bottomCoach: 'Wrong guesses show the real phrase immediately and replay it step by step.',
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
