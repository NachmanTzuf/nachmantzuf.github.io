import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import timeline from '../../../public/audio/instructions/timeline_path3_v37.json';
import { HeroHarpStage, SuiteFontLoader } from './FontsAndTheme';
import { LeversConceptStage } from './FuturisticConceptStages';
import {
  LeverRoundEvent,
  LiveLeverPhoneStage,
  PhoneCalloutStage,
} from './InteractivePhoneStage';

export const PATH3_V37_TOTAL_FRAMES = timeline.totalFrames;

export const Path3LeversV37: React.FC = () => {
  const s = timeline.scenes;

  const introDur = s.introEnd - s.introStart;
  const conceptDur = s.conceptEnd - s.conceptStart;
  const circleDur = s.circleEnd - s.circleStart;
  const ingameDur = s.ingameEnd - s.ingameStart;
  const completeDur = s.completeEnd - s.completeStart;
  const outroDur = timeline.totalFrames - s.outroStart;

  const tapSplitInCircle = Math.max(30, s.circleTapFrame - s.circleStart - 16);

  const leverRounds: LeverRoundEvent[] = timeline.rounds.map((r) => ({
    scaleName: r.scaleName,
    roundLabel: r.roundLabel,
    roundStartFrame: r.roundStartFrame - s.ingameStart,
    initialLevers: r.initialLevers,
    leverFlips: r.leverFlips.map((fl) => ({
      ...fl,
      flipFrame: fl.flipFrame - s.ingameStart,
    })),
    confirmTapFrame: r.confirmTapFrame - s.ingameStart,
    verdictCorrect: r.verdictCorrect,
    verdictHeadline: r.verdictHeadline,
    verdictSubline: r.verdictSubline,
    walkNotes: r.walkNotes.map((wn) => ({
      ...wn,
      frame: wn.frame - s.ingameStart,
    })),
  }));

  const r1 = leverRounds[0];
  const r2 = leverRounds[1];

  const captions = [
    {
      startFrame: 0,
      endFrame: r1.confirmTapFrame,
      topTag: 'ROUND 1 · F MAJOR (1 FLAT)',
      topTitle: 'Raise Levers A & E Up',
      bottomCoach: 'Touch strings on the neck OR use bottom tiles to lift A and E.',
    },
    {
      startFrame: r1.confirmTapFrame,
      endFrame: r2.roundStartFrame,
      topTag: 'CONFIRM & FULL SCALE WALK · 550ms/NOTE',
      topTitle: 'Correct · Complete F Major Scale',
      bottomCoach: 'The app checks all eight levers, then walks F to F start to finish.',
    },
    {
      startFrame: r2.roundStartFrame,
      endFrame: r2.confirmTapFrame,
      topTag: 'ROUND 2 · G MAJOR (1 SHARP)',
      topTitle: 'Test & Verify Your Tuning',
      bottomCoach: 'Notice what happens if you raise F but leave B down by mistake.',
    },
    {
      startFrame: r2.confirmTapFrame,
      endFrame: ingameDur + 30,
      topTag: 'INSTANT DIAGNOSIS & SCALE AUDIT',
      topTitle: 'Not Quite · Flagged Missing B',
      bottomCoach: 'Mismatched levers glow right away as the true G major scale plays through.',
    },
  ];

  return (
    <SuiteFontLoader>
      <Audio src={staticFile('audio/instructions/path3_motion_v37.mp3')} />

      <Sequence from={s.introStart} durationInFrames={introDur}>
        <HeroHarpStage
          theme="levers"
          titleLine1="Camac Levers"
          titleLine2="Key Shifting Mastery"
          subtitle="Master sharpening levers and retune cleanly across any major scale."
          pluckEvents={[
            { stringNum: 1, startFrame: 6 },
            { stringNum: 3, startFrame: 13 },
            { stringNum: 5, startFrame: 21 },
            { stringNum: 8, startFrame: 29 },
          ]}
          leverEvents={[
            { leverNum: 6, flipFrame: 24 },
            { leverNum: 3, flipFrame: 42 },
          ]}
          totalSceneFrames={introDur}
        />
      </Sequence>

      <Sequence from={s.conceptStart} durationInFrames={conceptDur}>
        <LeversConceptStage
          totalFrames={conceptDur}
          leverFlipFrame={s.conceptLeverFrame - s.conceptStart}
        />
      </Sequence>

      <Sequence from={s.circleStart} durationInFrames={circleDur}>
        <PhoneCalloutStage
          theme="levers"
          textureSrc="textures/v37/p3_circle.png"
          totalFrames={circleDur}
          beats={[
            {
              startFrame: 0,
              endFrame: tapSplitInCircle,
              headerTag: 'INTERACTIVE TEACHING SCREEN',
              headerTitle: 'Circle of Fifths Guide',
              bottomCaption: 'Preview lever states live around all twelve keys before practicing.',
              calloutBadge: 'Clockwise · A E B F C G D',
              targetX: 0.5,
              targetY: 0.37,
              highlightBox: { x: 0.14, y: 0.20, w: 0.72, h: 0.33 },
              badgeSide: 'bottom-left',
            },
            {
              startFrame: tapSplitInCircle,
              endFrame: circleDur,
              headerTag: 'ENTER PRACTICE BOARD',
              headerTitle: 'Start Live Lever Challenges',
              bottomCaption: 'Advance into hands-on key setup drills.',
              calloutBadge: 'Continue to practice →',
              targetX: 0.5,
              targetY: 0.875,
              highlightBox: { x: 0.08, y: 0.835, w: 0.84, h: 0.075 },
              tapPulseFrame: s.circleTapFrame - s.circleStart,
              badgeSide: 'top-right',
            },
          ]}
        />
      </Sequence>

      <Sequence from={s.ingameStart} durationInFrames={ingameDur}>
        <LiveLeverPhoneStage
          textureSrc="textures/v37/p3_ingame.png"
          totalFrames={ingameDur}
          rounds={leverRounds}
          captions={captions}
        />
      </Sequence>

      <Sequence from={s.completeStart} durationInFrames={completeDur}>
        <PhoneCalloutStage
          theme="levers"
          textureSrc="textures/v37/p3_complete.png"
          totalFrames={completeDur}
          beats={[
            {
              startFrame: 0,
              endFrame: completeDur,
              headerTag: 'LEVEL COMPLETE DEBRIEF',
              headerTitle: 'Verify Matched Scales',
              bottomCaption: 'Track completed key shifts before unlocking higher-sharp and flat stages.',
              calloutBadge: 'Score & Start-to-Finish Audit',
              targetX: 0.5,
              targetY: 0.34,
              highlightBox: { x: 0.16, y: 0.22, w: 0.68, h: 0.21 },
              badgeSide: 'bottom-right',
            },
          ]}
        />
      </Sequence>

      <Sequence from={s.outroStart} durationInFrames={outroDur}>
        <HeroHarpStage
          theme="levers"
          kicker="EARPA · CAMAC LEVER MASTERY"
          titleLine1="Shift Keys"
          titleLine2="With Precision."
          subtitle="Remember A · E · B · F · C · G · D — every key clicks cleanly into place."
          startTheta={0.44}
          leverEvents={[
            { leverNum: 6, flipFrame: 12 },
            { leverNum: 3, flipFrame: 22 },
            { leverNum: 7, flipFrame: 32 },
          ]}
          pluckEvents={[{ stringNum: 1, startFrame: Math.max(5, outroDur - 65) }, { stringNum: 5, startFrame: Math.max(8, outroDur - 62) }, { stringNum: 8, startFrame: Math.max(12, outroDur - 58) }]}
          totalSceneFrames={outroDur}
          fadeOutAtEndFrames={16}
        />
      </Sequence>
    </SuiteFontLoader>
  );
};
