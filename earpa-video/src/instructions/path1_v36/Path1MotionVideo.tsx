import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import timelineData from './timeline_path1_v36.json';
import { Harp3DCanvas, PluckEvent } from '../../earpa/Harp3DCanvas';
import { PhoneFrame } from '../../earpa_short/PhoneFrame';
import { KineticHeroText } from '../../earpa_short/KineticHeroText';
import { CalloutArrow } from './CalloutArrow';
import { GravitySchemaStage } from './GravitySchemaStage';
import { FeedbackState, SimulatedInGamePhone } from './SimulatedInGamePhone';

const f = (sec: number) => Math.round(sec * 30);

const HERO_SPREAD_SHADE =
  'radial-gradient(ellipse at 50% 44%, rgba(16, 185, 129, 0.14) 0%, rgba(6, 20, 15, 0.94) 56%, #020705 100%)';

export const Path1MotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scenes } = timelineData;

  const b1 = scenes.beat1_hero;
  const b2 = scenes.beat2_law;
  const b3 = scenes.beat3_sanctuary;
  const b4 = scenes.beat4_levels;
  const b5 = scenes.beat5_round1_f;
  const b6 = scenes.beat6_round2_g;
  const b7 = scenes.beat7_round3_b;
  const b8 = scenes.beat8_outro;

  // =========================================================================
  // BEAT 1 & BEAT 8B: 3D CELTIC HARP HERO STAGE (Centerpiece Alone!)
  // =========================================================================
  const isBeat1 = frame < f(b1.end) + 8;
  const isBeat8Hero = frame >= f(b8.heroBack) - 8;

  const heroBeat1Opacity = isBeat1
    ? interpolate(frame, [f(b1.end) - 10, f(b1.end) + 6], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const heroBeat8Opacity = isBeat8Hero
    ? interpolate(frame, [f(b8.heroBack) - 6, f(b8.heroBack) + 12], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const heroPluckEvents: PluckEvent[] = [
    // Beat 1 opening C-E-G-C arpeggio (calibrated 0.024 amplitude)
    { stringNum: 1, startFrame: f(b1.start + 0.15), amplitude: 0.024 },
    { stringNum: 3, startFrame: f(b1.start + 0.37), amplitude: 0.022 },
    { stringNum: 5, startFrame: f(b1.start + 0.59), amplitude: 0.023 },
    { stringNum: 8, startFrame: f(b1.start + 0.81), amplitude: 0.026 },
    // Beat 8 closing gentle glissando C4 -> C5
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((s, idx) => ({
      stringNum: s,
      startFrame: f(b8.end - 2.3 + idx * 0.13),
      amplitude: 0.024,
    })),
  ];

  // =========================================================================
  // PAUSED SCREENSHOT & IN-GAME PHONE CONTAINER GEOMETRY
  // Beats 3, 4, 8a: Left-anchored phone (left: 48, top: 410, width: 560) for flanking callouts
  // Beats 5, 6, 7: Centered phone (left: 224, top: 295, width: 616) for full focus gameplay
  // =========================================================================
  const phoneStartFrame = f(b3.start);
  const phoneEndFrame = f(b8.heroBack) + 8;
  const inPhoneStage = frame >= phoneStartFrame && frame <= phoneEndFrame;

  const inGameplay = frame >= f(b5.start) && frame < f(b8.start);

  const phoneSlideSpring = inGameplay
    ? spring({
        frame: frame - f(b5.start),
        fps,
        config: { damping: 22, stiffness: 110 },
      })
    : frame >= f(b8.start)
    ? 1 -
      spring({
        frame: frame - f(b8.start),
        fps,
        config: { damping: 22, stiffness: 110 },
      })
    : 0;

  const phoneEnterOpacity = spring({
    frame: Math.max(0, frame - phoneStartFrame),
    fps,
    config: { damping: 22, stiffness: 130 },
  });
  const phoneExitOpacity = interpolate(
    frame,
    [f(b8.heroBack) - 10, f(b8.heroBack) + 6],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const phoneLeft = interpolate(phoneSlideSpring, [0, 1], [48, 224]);
  const phoneTop = interpolate(phoneSlideSpring, [0, 1], [410, 295]);
  const phoneWidth = interpolate(phoneSlideSpring, [0, 1], [560, 616]);

  // =========================================================================
  // GAMEPLAY STATE COMPUTATION (BEATS 5, 6, 7 — STRICT GRAVITY BEFORE REVEAL)
  // =========================================================================
  const computeGameplayProps = () => {
    // BEAT 5: Round 1 (Note F, correct tap, F -> E -> D -> C walkdown)
    if (frame >= f(b5.start) && frame < f(b6.start)) {
      const cadStart = f(b5.cadStart);
      const stimF = f(b5.stimF);
      const tapF = f(b5.tapF);
      const revF = f(b5.revealF);
      const walkStart = f(b5.walkStart);

      // Cadence 1..4 / 4 (chords spaced 0.66s = ~19.8f)
      let statusText = 'C Major • Get Ready';
      let statusAccent = '#94a3b8';
      let cadencePulse = 0;

      if (frame >= cadStart && frame < stimF) {
        const chordIdx = Math.min(3, Math.floor((frame - cadStart) / 19.8));
        statusText = `Listen • ${chordIdx + 1} / 4`;
        statusAccent = '#34d399';
        const localChordF = (frame - cadStart) % 19.8;
        cadencePulse = Math.max(0, 1 - localChordF / 16);
      } else if (frame >= stimF && frame < tapF) {
        statusText =
          frame < stimF + 28
            ? 'Listening to mystery note...'
            : 'Your turn • choose a note';
        statusAccent = frame < stimF + 28 ? '#fcd34d' : '#34d399';
      } else if (frame >= tapF && frame < revF) {
        // STRICT RULE: Gravity explanation holds cleanly BEFORE feedback verdict reveals
        statusText = 'Selected F • Feeling Tonal Gravity...';
        statusAccent = '#6ee7b7';
      } else if (frame >= revF && frame < walkStart) {
        statusText = 'Verdict • Crystal Clear!';
        statusAccent = '#22c55e';
      } else if (frame >= walkStart) {
        const stepIdx = Math.min(3, Math.floor((frame - walkStart) / 16.8));
        const trail = ['F', 'E', 'D', 'C'].slice(0, stepIdx + 1).join(' → ');
        statusText = `Homeward • ${trail}`;
        statusAccent = '#34d399';
      }

      const tappedKeyIdx = frame >= tapF && frame < walkStart ? 3 : null; // F
      let activeStringNum: number | null = null;
      let activeStringAge = 0;
      let walkKeyIdx: number | null = null;
      if (frame >= walkStart) {
        const stepIdx = Math.min(3, Math.floor((frame - walkStart) / 16.8));
        const strMap = [4, 3, 2, 1];
        const keyMap = [3, 2, 1, 0];
        activeStringNum = strMap[stepIdx];
        walkKeyIdx = keyMap[stepIdx];
        activeStringAge = (frame - walkStart) - stepIdx * 16.8;
      }

      let feedback: FeedbackState | null = null;
      if (frame >= revF && frame < walkStart + 10) {
        const inOp = interpolate(frame, [revF, revF + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const outOp = interpolate(frame, [walkStart - 6, walkStart + 8], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        feedback = {
          correct: true,
          title: 'Crystal Clear!',
          note: 'F',
          insight: 'Subdominant F leans down gently through E and D to rest on home C.',
          opacity: inOp * outOp,
        };
      }

      return {
        roundNum: 1 as const,
        statusText,
        statusAccent,
        tappedKeyIdx,
        tappedKeyAge: Math.max(0, frame - tapF),
        tappedKeyColor: '#34d399',
        walkKeyIdx,
        activeStringNum,
        activeStringAge,
        activeStringColor: '#34d399',
        cadenceChordActive: cadencePulse,
        feedback,
      };
    }

    // BEAT 6: Round 2 (Target G, Mistaken tap D -> Gravity Contrast -> Subtle Drift G -> G->A->B->C5 walk)
    if (frame >= f(b6.start) && frame < f(b7.start)) {
      const cadStart = f(b6.cadStart);
      const stimG = f(b6.stimG);
      const tapD = f(b6.tapD);
      const revG = f(b6.revealG);
      const walkStart = f(b6.walkStart);

      let statusText = 'Round 2 • Listening...';
      let statusAccent = '#94a3b8';
      let cadencePulse = 0;

      if (frame >= cadStart && frame < stimG) {
        const chordIdx = Math.min(3, Math.floor((frame - cadStart) / 16.8));
        statusText = `Listen • ${chordIdx + 1} / 4`;
        statusAccent = '#34d399';
        const localChordF = (frame - cadStart) % 16.8;
        cadencePulse = Math.max(0, 1 - localChordF / 14);
      } else if (frame >= stimG && frame < tapD) {
        statusText =
          frame < stimG + 24
            ? 'Listening to mystery note...'
            : 'Your turn • choose a note';
        statusAccent = frame < stimG + 24 ? '#fcd34d' : '#34d399';
      } else if (frame >= tapD && frame < revG) {
        statusText = 'Selected D • Compare Tonal Stability...';
        statusAccent = '#fbbf24';
      } else if (frame >= revG && frame < walkStart) {
        statusText = 'Clarifying • True Note was G';
        statusAccent = '#f87171';
      } else if (frame >= walkStart) {
        const stepIdx = Math.min(3, Math.floor((frame - walkStart) / 16.8));
        const trail = ['G', 'A', 'B', 'C'].slice(0, stepIdx + 1).join(' → ');
        statusText = `Recalibrating • ${trail}`;
        statusAccent = '#fbbf24';
      }

      const tappedKeyIdx = frame >= tapD && frame < walkStart ? 1 : null; // D
      let activeStringNum: number | null = null;
      let activeStringAge = 0;
      let walkKeyIdx: number | null = null;
      if (frame >= walkStart) {
        const stepIdx = Math.min(3, Math.floor((frame - walkStart) / 16.8));
        const strMap = [5, 6, 7, 8]; // G4 -> A4 -> B4 -> C5 (closest octave resolution)
        const keyMap = [4, 5, 6, 7];
        activeStringNum = strMap[stepIdx];
        walkKeyIdx = keyMap[stepIdx];
        activeStringAge = (frame - walkStart) - stepIdx * 16.8;
      }

      let feedback: FeedbackState | null = null;
      if (frame >= revG && frame < walkStart + 10) {
        const inOp = interpolate(frame, [revG, revG + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const outOp = interpolate(frame, [walkStart - 6, walkStart + 8], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        feedback = {
          correct: false,
          title: 'A Subtle Drift...',
          note: 'G',
          insight: 'Dominant fifth G shines open above supertonic D, walking smoothly up to high C.',
          opacity: inOp * outOp,
        };
      }

      return {
        roundNum: 2 as const,
        statusText,
        statusAccent,
        tappedKeyIdx,
        tappedKeyAge: Math.max(0, frame - tapD),
        tappedKeyColor: frame >= revG ? '#ef4444' : '#fbbf24',
        walkKeyIdx,
        activeStringNum,
        activeStringAge,
        activeStringColor: '#fbbf24',
        cadenceChordActive: cadencePulse,
        feedback,
      };
    }

    // BEAT 7: Round 3 Contrast (Leading Tone B -> Snap up B -> C5)
    const cadStart = f(b7.cadStart);
    const stimB = f(b7.stimB);
    const tapB = f(b7.tapB);
    const revB = f(b7.revealB);
    const walkStart = f(b7.walkStart);

    let statusText = 'Round 3 • Ready';
    let statusAccent = '#34d399';
    let cadencePulse = 0;

    if (frame >= cadStart && frame < stimB) {
      const chordIdx = Math.min(2, Math.floor((frame - cadStart) / 15.6));
      statusText = `Anchor • ${chordIdx + 1} / 3`;
      statusAccent = '#34d399';
      cadencePulse = 0.7;
    } else if (frame >= stimB && frame < tapB) {
      statusText = 'Listening to mystery note...';
      statusAccent = '#fcd34d';
    } else if (frame >= tapB && frame < revB) {
      statusText = 'Selected B • Half Step Pull Upward...';
      statusAccent = '#fde047';
    } else if (frame >= revB && frame < walkStart) {
      statusText = 'Pure Resonance • B';
      statusAccent = '#22c55e';
    } else if (frame >= walkStart) {
      const stepIdx = Math.min(1, Math.floor((frame - walkStart) / 15.6));
      statusText = stepIdx === 0 ? 'Resolving • B' : 'Home Arrival • B → C';
      statusAccent = '#34d399';
    }

    let activeStringNum: number | null = null;
    let activeStringAge = 0;
    let walkKeyIdx: number | null = null;
    if (frame >= walkStart) {
      const stepIdx = Math.min(1, Math.floor((frame - walkStart) / 15.6));
      activeStringNum = stepIdx === 0 ? 7 : 8;
      walkKeyIdx = stepIdx === 0 ? 6 : 7;
      activeStringAge = (frame - walkStart) - stepIdx * 15.6;
    }

    let feedback: FeedbackState | null = null;
    if (frame >= revB && frame < walkStart + 10) {
      const inOp = interpolate(frame, [revB, revB + 8], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const outOp = interpolate(frame, [walkStart - 6, walkStart + 8], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      feedback = {
        correct: true,
        title: 'Pure Resonance!',
        note: 'B',
        insight: 'Leading tone B releases instantaneously one half step upward into tonic C.',
        opacity: inOp * outOp,
      };
    }

    return {
      roundNum: 3 as const,
      statusText,
      statusAccent,
      tappedKeyIdx: frame >= tapB && frame < walkStart ? 6 : null,
      tappedKeyAge: Math.max(0, frame - tapB),
      tappedKeyColor: '#fbbf24',
      walkKeyIdx,
      activeStringNum,
      activeStringAge,
      activeStringColor: '#34d399',
      cadenceChordActive: cadencePulse,
      feedback,
    };
  };

  // =========================================================================
  // TOP HEADER CONFIG PER ACTIVE BEAT (Clean Single Focus Title!)
  // =========================================================================
  const renderTopTitle = () => {
    if (frame >= f(b3.start) && frame < f(b4.start)) {
      return (
        <KineticHeroText
          prefix="SANCTUARY HUB"
          hero="BEGIN ANYWHERE"
          suffix="Tap Trail Map or Press Play directly"
          accentColor="#34d399"
          heroColor="#f6efdc"
          startFrame={f(b3.start)}
          endFrame={f(b4.start)}
          top={58}
        />
      );
    }
    if (frame >= f(b4.start) && frame < f(b4.p12Switch)) {
      return (
        <KineticHeroText
          prefix="CURRICULUM MAP"
          hero="LEVEL 11 PREVIEW"
          suffix="Upper half active across twenty rounds"
          accentColor="#34d399"
          heroColor="#f6efdc"
          startFrame={f(b4.start)}
          endFrame={f(b4.p12Switch)}
          top={58}
        />
      );
    }
    if (frame >= f(b4.p12Switch) && frame < f(b5.start)) {
      return (
        <KineticHeroText
          prefix="CURRICULUM MAP"
          hero="LEVEL 12 OCTAVE"
          suffix="All eight C major strings illuminated"
          accentColor="#fbbf24"
          heroColor="#f6efdc"
          startFrame={f(b4.p12Switch)}
          endFrame={f(b5.start)}
          top={58}
        />
      );
    }
    if (frame >= f(b5.start) && frame < f(b5.gravBefore)) {
      return (
        <KineticHeroText
          prefix="ROUND 1 : IN GAME"
          hero="CADENCE & LISTEN"
          suffix="Four opening chords anchor C major"
          accentColor="#34d399"
          heroColor="#f6efdc"
          startFrame={f(b5.start)}
          endFrame={f(b5.gravBefore)}
          top={48}
        />
      );
    }
    if (frame >= f(b5.gravBefore) && frame < f(b5.revealF)) {
      return (
        <KineticHeroText
          prefix="BEFORE THE VERDICT"
          hero="FEEL THE GRAVITY"
          suffix="F pulls downward step by step to C"
          accentColor="#6ee7b7"
          heroColor="#f6efdc"
          startFrame={f(b5.gravBefore)}
          endFrame={f(b5.revealF)}
          top={48}
        />
      );
    }
    if (frame >= f(b5.revealF) && frame < f(b6.start)) {
      return (
        <KineticHeroText
          prefix="VERDICT & WALK"
          hero="F RESOLVES HOME"
          suffix="F to E to D to C seals memory"
          accentColor="#22c55e"
          heroColor="#f6efdc"
          startFrame={f(b5.revealF)}
          endFrame={f(b6.start)}
          top={48}
        />
      );
    }
    if (frame >= f(b6.start) && frame < f(b6.gravBefore)) {
      return (
        <KineticHeroText
          prefix="ROUND 2 : CORRECTION"
          hero="WHEN YOU MISS"
          suffix="Mistakes accelerate ear calibration"
          accentColor="#fbbf24"
          heroColor="#f6efdc"
          startFrame={f(b6.start)}
          endFrame={f(b6.gravBefore)}
          top={48}
        />
      );
    }
    if (frame >= f(b6.gravBefore) && frame < f(b6.revealG)) {
      return (
        <KineticHeroText
          prefix="BEFORE THE VERDICT"
          hero="HEAR THE FIFTH"
          suffix="Dominant G rings brighter than D"
          accentColor="#fbbf24"
          heroColor="#f6efdc"
          startFrame={f(b6.gravBefore)}
          endFrame={f(b6.revealG)}
          top={48}
        />
      );
    }
    if (frame >= f(b6.revealG) && frame < f(b7.start)) {
      return (
        <KineticHeroText
          prefix="SUBTLE DRIFT"
          hero="UPWARD TO HIGH C"
          suffix="G steps cleanly through A and B to C"
          accentColor="#fbbf24"
          heroColor="#f6efdc"
          startFrame={f(b6.revealG)}
          endFrame={f(b7.start)}
          top={48}
        />
      );
    }
    if (frame >= f(b7.start) && frame < f(b8.start)) {
      return (
        <KineticHeroText
          prefix="ROUND 3 : LEADING TONE"
          hero="HALF STEP SNAP"
          suffix="B pulls magnetically up into home C"
          accentColor="#fde047"
          heroColor="#f6efdc"
          startFrame={f(b7.start)}
          endFrame={f(b8.start)}
          top={48}
        />
      );
    }
    if (frame >= f(b8.start) && frame < f(b8.heroBack)) {
      return (
        <KineticHeroText
          prefix="PROGRESSIVE PATH"
          hero="10 MINUTES DAILY"
          suffix="Diatonic to minor and chromatic mastery"
          accentColor="#34d399"
          heroColor="#f6efdc"
          startFrame={f(b8.start)}
          endFrame={f(b8.heroBack)}
          top={58}
        />
      );
    }
    return null;
  };

  // =========================================================================
  // LOWER STAGE GRAVITY / CONTEXT PILL DURING IN-GAME PLAY (NEVER OVERLAPS PHONE)
  // =========================================================================
  const renderLowerGameplayCallout = () => {
    let pillTitle = '';
    let pillAccent = '#34d399';
    let pillBody = '';

    if (frame >= f(b5.cadStart) && frame < f(b5.tapF)) {
      pillTitle = 'LISTEN FIRST • ZERO VISUAL HINTS';
      pillAccent = '#fcd34d';
      pillBody = 'Strings stay dark so your ear recognizes tone purely by sound';
    } else if (frame >= f(b5.tapF) && frame < f(b5.revealF)) {
      pillTitle = 'GRAVITY BEFORE VERDICT : SUBDOMINANT F';
      pillAccent = '#6ee7b7';
      pillBody = 'F (Degree 4) leans downward ↓ through E and D toward C';
    } else if (frame >= f(b5.walkStart) && frame < f(b6.start)) {
      pillTitle = 'RESOLUTION WALK : F → E → D → C';
      pillAccent = '#22c55e';
      pillBody = 'Every string lights as the harp traces the gravity path home';
    } else if (frame >= f(b6.gravBefore) && frame < f(b6.revealG)) {
      pillTitle = 'GRAVITY CHECK : D (STEP 2) VS G (FIFTH)';
      pillAccent = '#fbbf24';
      pillBody = 'Feel the open stability before the red drift banner reveals';
    } else if (frame >= f(b6.walkStart) && frame < f(b7.start)) {
      pillTitle = 'RECALIBRATION : G → A → B → C';
      pillAccent = '#fbbf24';
      pillBody = 'High scale degrees (5, 6, 7) resolve upward to upper tonic C';
    } else if (frame >= f(b7.gravBefore) && frame < f(b7.walkStart + 45)) {
      pillTitle = 'LEADING TONE SNAP : B ↑ C';
      pillAccent = '#fde047';
      pillBody = 'Just one semitone below tonic C • maximum upward pull';
    }

    if (!pillTitle) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: 74,
          right: 74,
          bottom: 64,
          padding: '22px 30px',
          borderRadius: 24,
          background: 'rgba(6, 20, 15, 0.92)',
          border: `1.5px solid ${pillAccent}66`,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3,
            color: pillAccent,
            marginBottom: 8,
          }}
        >
          {pillTitle}
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 32,
            lineHeight: 1.3,
            color: '#f8fafc',
          }}
        >
          {pillBody}
        </div>
      </div>
    );
  };

  // =========================================================================
  // RENDER SCENE PIPELINE (ONE UNMISTAKABLE CENTERPIECE PER MOMENT)
  // =========================================================================
  const gameplayProps = inGameplay ? computeGameplayProps() : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#020705', overflow: 'hidden' }}>
      {/* Master 48kHz Acoustic Celtic Harp + Slow Calibrated Voiceover */}
      <Audio src={staticFile('audio/instructions/path1_motion_v36.mp3')} volume={1.0} />

      {/* Unified Deep Studio Backdrop (Calm continuous room tone) */}
      <AbsoluteFill style={{ background: HERO_SPREAD_SHADE }} />

      {/* ===================================================================
          BEAT 1: HERO 3D CELTIC HARP (Centered Alone)
      ==================================================================== */}
      {isBeat1 && heroBeat1Opacity > 0.01 && (
        <AbsoluteFill style={{ opacity: heroBeat1Opacity }}>
          <KineticHeroText
            prefix="PATH 1"
            hero="SINGLE NOTES"
            suffix="Earpa Celtic Relative Pitch"
            accentColor="#34d399"
            heroColor="#f6efdc"
            startFrame={f(b1.start)}
            endFrame={f(b1.end)}
            top={68}
          />
          <div style={{ position: 'absolute', left: 54, top: 290 }}>
            <Harp3DCanvas
              width={972}
              height={1540}
              theta={interpolate(frame, [f(b1.start), f(b1.end)], [-0.55, -0.18])}
              phi={interpolate(frame, [f(b1.start), f(b1.end)], [1.42, 1.32])}
              radius={interpolate(frame, [f(b1.start), f(b1.start) + 45], [2.85, 2.40], {
                extrapolateRight: 'clamp',
              })}
              targetY={0.46}
              fov={34}
              harpScale={0.80}
              showPlinth={true}
              floatY={Math.sin(frame * 0.05) * 0.015}
              pluckEvents={heroPluckEvents}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* ===================================================================
          BEAT 2: TONAL GRAVITATION DIAGRAM (Dalcroze & Alain Benbassat)
      ==================================================================== */}
      <GravitySchemaStage
        startFrame={f(b2.start)}
        endFrame={f(b2.end)}
        fWalkStartFrame={f(b2.fWalkStart)}
        bWalkStartFrame={f(b2.bWalkStart)}
      />

      {/* ===================================================================
          BEATS 3–8A: TITANIUM PHONE CENTERPIECE + PAUSED CALLOUTS & GAMEPLAY
      ==================================================================== */}
      {inPhoneStage && (
        <AbsoluteFill style={{ opacity: phoneEnterOpacity * phoneExitOpacity }}>
          {renderTopTitle()}

          <div
            style={{
              position: 'absolute',
              left: phoneLeft,
              top: phoneTop,
            }}
          >
            <PhoneFrame
              width={phoneWidth}
              accent={frame >= f(b6.start) && frame < f(b7.start) ? '#fbbf24' : '#34d399'}
            >
              {/* BEAT 3: Sanctuary Home Screenshot */}
              {frame < f(b4.start) && (
                <Img
                  src={staticFile('textures/path1_v36/home_sanctuary.png')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* BEAT 4A: Trail Map P1-11 Screenshot */}
              {frame >= f(b4.start) && frame < f(b4.p12Switch) && (
                <Img
                  src={staticFile('textures/path1_v36/roadmap_p1_11.png')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* BEAT 4B: Trail Map P1-12 Screenshot + Launch Highlight */}
              {frame >= f(b4.p12Switch) && frame < f(b5.start) && (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Img
                    src={staticFile('textures/path1_v36/roadmap_p1_12.png')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Golden tap glow on node 12 right as card opens */}
                  {frame < f(b4.p12Switch) + 22 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '70%',
                        top: '50.8%',
                        width: 68,
                        height: 68,
                        borderRadius: 999,
                        transform: 'translate(-50%, -50%)',
                        border: '4px solid #fde047',
                        opacity: interpolate(
                          frame - f(b4.p12Switch),
                          [0, 22],
                          [0.95, 0],
                          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        ),
                      }}
                    />
                  )}
                </div>
              )}

              {/* BEATS 5–7: Interactive Simulated In-Game Arena */}
              {inGameplay && gameplayProps && <SimulatedInGamePhone {...gameplayProps} />}

              {/* BEAT 8A: Coastal Progression Outro Screenshot */}
              {frame >= f(b8.start) && (
                <Img
                  src={staticFile('textures/path1_v36/roadmap_progression.png')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </PhoneFrame>
          </div>

          {/* =================================================================
              PAUSED SCREENSHOT CURVED POINTER ARROWS (NEVER CLASH WITH SCREEN!)
          ================================================================== */}
          {/* Beat 3 Callouts: TRAIL MAP & PRESS PLAY */}
          <CalloutArrow
            startFrame={f(b3.arrowTrail)}
            endFrame={f(b4.start) - 6}
            boxX={646}
            boxY={435}
            boxWidth={392}
            fromX={646}
            fromY={510}
            toX={564}
            toY={521}
            curveBendY={-32}
            kicker="STEP 1 : CURRICULUM"
            title="Trail Map"
            detail="Browse every unlocked scale level"
            accent="#34d399"
          />
          <CalloutArrow
            startFrame={f(b3.arrowPlay)}
            endFrame={f(b4.start) - 6}
            boxX={646}
            boxY={1315}
            boxWidth={392}
            fromX={646}
            fromY={1425}
            toX={502}
            toY={1460}
            curveBendY={28}
            kicker="STEP 2 : INSTANT PLAY"
            title="Press Play"
            detail="Launch your active round"
            accent="#fbbf24"
          />

          {/* Beat 4A Callouts: P1-11 Green 5-8 & 20 Rounds */}
          <CalloutArrow
            startFrame={f(b4.p11Start) + 8}
            endFrame={f(b4.p12Switch) - 4}
            boxX={646}
            boxY={880}
            boxWidth={392}
            fromX={646}
            fromY={975}
            toX={291}
            toY={1068}
            curveBendY={-80}
            kicker="LEVEL 11 MATRIX"
            title="Upper 5 to 8"
            detail="Only upper degrees glow bright green"
            accent="#34d399"
          />
          <CalloutArrow
            startFrame={f(b4.p11Start) + 65}
            endFrame={f(b4.p12Switch) - 4}
            boxX={646}
            boxY={1225}
            boxWidth={392}
            fromX={646}
            fromY={1325}
            toX={179}
            toY={1142}
            curveBendY={155}
            kicker="PACING"
            title="20 Rounds"
            detail="Steady repetition builds reflex"
            accent="#60a5fa"
          />

          {/* Beat 4B Callout: P1-12 Full Octave 1-8 */}
          <CalloutArrow
            startFrame={f(b4.p12Switch) + 8}
            endFrame={f(b5.start) - 6}
            boxX={646}
            boxY={935}
            boxWidth={392}
            fromX={646}
            fromY={1025}
            toX={381}
            toY={1032}
            curveBendY={-45}
            kicker="LEVEL 12 MATRIX"
            title="Full Octave"
            detail="All eight C major strings light up"
            accent="#fbbf24"
          />

          {/* Beat 8A Callout: 10 Minutes Daily */}
          <CalloutArrow
            startFrame={f(b8.start) + 8}
            endFrame={f(b8.heroBack) - 6}
            boxX={646}
            boxY={935}
            boxWidth={392}
            fromX={646}
            fromY={1020}
            toX={325}
            toY={1025}
            curveBendY={-35}
            kicker="ADAPTIVE PATH"
            title="10 Min / Day"
            detail="Major, minor, and chromatic mastery"
            accent="#34d399"
          />

          {/* Beats 5–7 Clean Lower Gravity Callout */}
          {inGameplay && renderLowerGameplayCallout()}
        </AbsoluteFill>
      )}

      {/* ===================================================================
          BEAT 8B: HERO 3D HARP CLOSING GLISSANDO (Centerpiece Alone!)
      ==================================================================== */}
      {isBeat8Hero && heroBeat8Opacity > 0.01 && (
        <AbsoluteFill style={{ opacity: heroBeat8Opacity }}>
          <KineticHeroText
            prefix="EARPA SANCTUARY"
            hero="FEEL HOME"
            suffix="Open Single Notes to Begin Today"
            accentColor="#fbbf24"
            heroColor="#fef3c7"
            startFrame={f(b8.heroBack)}
            endFrame={f(b8.end)}
            top={76}
          />
          <div style={{ position: 'absolute', left: 54, top: 290 }}>
            <Harp3DCanvas
              width={972}
              height={1540}
              theta={interpolate(frame, [f(b8.heroBack), f(b8.end)], [-0.58, -0.22])}
              phi={interpolate(frame, [f(b8.heroBack), f(b8.end)], [1.40, 1.30])}
              radius={2.38}
              targetY={0.46}
              fov={34}
              harpScale={0.80}
              showPlinth={true}
              floatY={Math.sin(frame * 0.05) * 0.015}
              pluckEvents={heroPluckEvents}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
