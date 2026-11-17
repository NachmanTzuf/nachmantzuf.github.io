import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MechanicalFifths } from './MechanicalFifths';
import {
  leverLessons,
  scaleNotes,
  solveLevers,
  signatureOf,
} from '../../services/curriculum/LeverLessonEngine';
import { Reveal } from '../common/Reveal';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import {
  TUNING_STRING_BASELINES,
  TuningMatrixEngine,
  PLAYABLE_MAJOR_KEYS,
  StringLetter,
} from '../../services/curriculum/TuningMatrixEngine';
import { CelticHarpCanvas, CelticHarpCanvasRef } from '../3d/CelticHarpCanvas';
import { ErrorBoundary } from '../common/ErrorBoundary';
import {
  UserAccountDatabase,
  SessionLogEntry,
} from '../../services/account/UserAccountDatabase';
import { SessionInsightsModal } from './SessionInsightsModal';
import { LevelDefinition } from '../../services/curriculum/curriculumData';

const orders = {
  Eb_Major_Native: 'AEBFCGD',
  C_Major_Native: 'FCGDAEB',
  Bb_Major_Native: 'EBFCGDA',
};
const letters = [...'CDEFGABC'] as StringLetter[];

export function LeverTrainingScreen({
  onBackToHome,
  initialStage,
}: {
  onBackToHome: () => void;
  initialStage?: number;
}) {
  const db = UserAccountDatabase.getInstance();
  const tuning = TuningMatrixEngine.getActiveTuning();
  const keys = PLAYABLE_MAJOR_KEYS[tuning];
  const lessons = leverLessons(tuning);
  const canvas = useRef<CelticHarpCanvasRef>(null);
  const synth = useRef(new HarpSoundSynthesizer('celtic_nylon'));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      synth.current.dispose();
    },
    []
  );

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const [playing, setPlaying] = useState(false);
  const [playingNote, setPlayingNote] = useState(-1);
  const [stage, setStage] = useState(
    Math.min(
      lessons.length - 1,
      initialStage ?? db.getActiveProfile().leverStage ?? 0
    )
  );
  // First 10 levels have 3 rounds inside a level; later levels have 5 rounds
  const totalRounds = stage < 10 ? 3 : 5;
  const [round, setRound] = useState(0);
  const [targetIndex, setTargetIndex] = useState(
    Math.min(
      lessons.length - 1,
      initialStage ?? db.getActiveProfile().leverStage ?? 0
    )
  );
  const [exploreKey, setExploreKey] = useState<string | null>(null);
  const [states, setStates] = useState<boolean[]>(Array(8).fill(false));
  const [submittedStates, setSubmittedStates] = useState<boolean[] | null>(null);

  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [sessionLog, setSessionLog] = useState<SessionLogEntry | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const locked = useRef(false);
  const started = useRef(Date.now());
  const sessionId = useRef(`levers_${Date.now()}`);

  const lesson = lessons[targetIndex];
  const target = lesson.root;
  const signature = signatureOf(lesson.parent);
  const config = solveLevers(tuning, target, lesson.mode)!;
  const notes = scaleNotes(target, lesson.mode);
  const up = [...orders[tuning]].filter((l) => config[l as StringLetter]);
  const pretty = (v: string) => v.replace(/b/g, '♭').replace(/#/g, '♯');

  const setLever = (i: number, value: boolean) => {
    if (locked.current) return;
    setStates((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
    canvas.current?.setLeverState(i + 1, value);
  };

  const check = () => {
    if (locked.current) return;
    locked.current = true;
    const correct = letters.every((l, i) => states[i] === !!config[l]);
    setResult(correct);
    setSubmittedStates([...states]);

    const correctStates = letters.map((l) => !!config[l]);
    correctStates.forEach((value, i) => canvas.current?.setLeverState(i + 1, value));
    setStates(correctStates);

    setPlaying(true);
    synth.current.initAudio();
    synth.current.unlockSynchronously();

    notes.forEach((note, i) =>
      later(() => {
        setPlayingNote(i);
        const visibleString = letters.findIndex(
          (l, j) =>
            TUNING_STRING_BASELINES[tuning][l].openMidi +
              config[l] +
              (j === 7 ? 12 : 0) ===
            note.midi
        );
        if (visibleString >= 0) canvas.current?.triggerLightStrike(visibleString + 1);
        synth.current.playPluck(
          440 * Math.pow(2, (note.midi - 69) / 12),
          1100,
          0.9
        );
      }, i * 520 + 180)
    );

    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);

    db.recordTrial({
      sessionId: sessionId.current,
      levelId: `lever_stage_${stage + 1}`,
      track: 'levers',
      tonicKey: lesson.title,
      stimulusDegree: up.join('') || 'all down',
      guessedDegree: letters.filter((_, i) => states[i]).join('') || 'all down',
      isCorrect: correct,
      latencyMs: Date.now() - started.current,
      roundIndex: round + 1,
    });

    const walkDurationMs = 8 * 520 + 600;
    later(() => {
      setPlaying(false);
      setPlayingNote(-1);
      if (round === totalRounds - 1) {
        const trials = db
          .getUserTrials(db.getActiveProfile().id)
          .filter((t) => t.sessionId === sessionId.current);
        const avgLat =
          trials.length > 0
            ? Math.round(
                trials.reduce((n, t) => n + t.latencyMs, 0) / trials.length
              )
            : 1200;
        const fastLat =
          trials.length > 0
            ? Math.min(...trials.map((t) => t.latencyMs))
            : 900;
        const sLog = db.recordSession({
          trialSessionId: sessionId.current,
          levelId: `lever_stage_${stage + 1}`,
          levelCode: `L${stage + 1}`,
          track: 'levers',
          durationSeconds: Math.max(
            1,
            Math.round(
              (Date.now() - Number(sessionId.current.split('_')[1])) / 1000
            )
          ),
          totalRounds,
          correctRounds: newScore,
          accuracyPct: Math.round((newScore / totalRounds) * 100),
          passed: newScore / totalRounds >= 0.8,
          averageLatencyMs: avgLat,
          fastestLatencyMs: fastLat,
        });
        db.updateActiveProfile({
          leverStage: Math.max(
            db.getActiveProfile().leverStage || 0,
            Math.min(lessons.length - 1, stage + 1)
          ),
        });
        setSessionLog(sLog);
        setShowVictoryModal(true);
      } else {
        // Automatically advance to next round after verdict & scale walk
        advanceRound();
      }
    }, walkDurationMs);
  };

  const advanceRound = () => {
    locked.current = false;
    const nextRound = round + 1;
    setRound(nextRound);
    const nextIndex = Math.max(
      0,
      stage - (nextRound % Math.min(stage + 1, 3))
    );
    setExploreKey(null);
    setTargetIndex(nextIndex);
    setResult(null);
    setSubmittedStates(null);
    started.current = Date.now();
  };

  const handleNextLevel = () => {
    const nextStage = Math.min(lessons.length - 1, stage + 1);
    locked.current = false;
    setStage(nextStage);
    setTargetIndex(nextStage);
    setRound(0);
    setScore(0);
    setResult(null);
    setSubmittedStates(null);
    setShowVictoryModal(false);
    setSessionLog(null);
    setPractice(false);
    sessionId.current = `levers_${Date.now()}`;
    started.current = Date.now();
  };

  const handleReplayLevel = () => {
    locked.current = false;
    setRound(0);
    setScore(0);
    setTargetIndex(stage);
    setResult(null);
    setSubmittedStates(null);
    setShowVictoryModal(false);
    setSessionLog(null);
    setPractice(true);
    sessionId.current = `levers_${Date.now()}`;
    started.current = Date.now();
  };

  const mismatch = letters
    .map((l, i) => ({ l, i, wanted: !!config[l] }))
    .filter((x) => (submittedStates ?? states)[x.i] !== x.wanted);

  const syntheticLevelDef: LevelDefinition = {
    id: `lever_stage_${stage + 1}`,
    code: `L${stage + 1}`,
    levelNumber: stage + 1,
    track: 'levers',
    title: pretty(lesson.title),
    subtitle: 'Camac Lever Mastery',
    activeNotesMask: [true, true, true, true, true, true, true, true],
    isChromatic: false,
    rounds: totalRounds,
  };

  return (
    <View style={styles.screenRoot}>
      <Image
        source={{ uri: '/images/ingame_bg_levers.jpg' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* 3D Celtic Harp: Positioned cleanly in the center with top & bottom clearance */}
      <View style={styles.fixedHarpContainer} pointerEvents="box-none">
        <ErrorBoundary componentName="LeverHarpCanvas">
          <CelticHarpCanvas
            ref={canvas}
            initialLeverStates={states}
            onLeverToggled={(i, v) => setLever(i - 1, v)}
            interactiveControls={true}
            fixedInGameAngle={true}
            customAngle={-0.95}
            customScale={0.86}
            targetY={0.60}
            minimalHeroMode={true}
            style={[styles.harpCanvas, { pointerEvents: 'auto' } as any]}
          />
        </ErrorBoundary>
      </View>

      {/* Top HUD Bar: Compact & high so it never touches the 3D harp */}
      <View style={styles.topHud} pointerEvents="box-none">
        <TouchableOpacity
          onPress={onBackToHome}
          style={styles.hudBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.hudBtnText}>‹ Home</Text>
        </TouchableOpacity>

        {practice && result === null ? (
          <View style={styles.hudCenterPill} pointerEvents="none">
            <Text style={styles.hudLevelCode}>
              L{stage + 1} · ROUND {round + 1}/{totalRounds}
            </Text>
            <Text style={styles.hudTargetScale}>{pretty(lesson.title)}</Text>
            <Text style={styles.hudSubInstruction}>
              Set levers on harp or buttons below
            </Text>
          </View>
        ) : (
          <View style={styles.hudCenterPill} pointerEvents="none">
            <Text style={styles.hudLevelCode}>
              LEVEL {stage + 1} · {totalRounds} ROUNDS
            </Text>
          </View>
        )}

        {practice && result === null ? (
          <TouchableOpacity
            onPress={() => setPractice(false)}
            style={styles.hudBtn}
            activeOpacity={0.75}
          >
            <Text style={styles.hudBtnText}>◎ Circle</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 68 }} />
        )}
      </View>

      {/* Active Gameplay Bottom Controls: Positioned low so they never touch the 3D harp */}
      {practice && result === null && (
        <View style={styles.controls} pointerEvents="box-none">
          <View style={styles.leverRow}>
            {letters.map((l, i) => {
              const isUp = states[i];
              const isRed = l === 'C';
              const isBlue = l === 'F';
              // Unified box border color across all 8 buttons; only inner C & F letters are colored
              const borderCol = isUp ? '#fbbf24' : 'rgba(255, 255, 255, 0.24)';
              const letterColor = isRed
                ? '#ef4444'
                : isBlue
                  ? '#38bdf8'
                  : isUp
                    ? '#fef08a'
                    : '#f8fafc';

              return (
                <TouchableOpacity
                  key={i}
                  accessibilityLabel={`${l}${i === 7 ? ' upper' : ''} lever ${isUp ? 'up' : 'down'}`}
                  onPress={() => setLever(i, !isUp)}
                  activeOpacity={0.8}
                  style={[
                    styles.leverBtn,
                    {
                      borderColor: borderCol,
                      backgroundColor: isUp
                        ? 'rgba(251, 191, 36, 0.22)'
                        : 'rgba(18, 28, 22, 0.90)',
                      borderWidth: isUp ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.leverLetter, { color: letterColor }]}>
                    {l}
                    {i === 7 ? '²' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.leverState,
                      { color: isUp ? '#fbbf24' : '#94a3b8' },
                    ]}
                  >
                    {isUp ? '↑ UP' : '↓ DN'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={check}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>Confirm Scale →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pre-Play Single-Screen Minimalist Circle of Fifths Overview (Zero Scrolling) */}
      {!practice && !showVictoryModal && (
        <Reveal key={`overview-${target}`} style={styles.overviewOverlay}>
          <View style={styles.overviewContent}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewEyebrow}>
                CAMAC LEVER CIRCLE · {pretty(keys[0])} TUNING
              </Text>
              <Text style={styles.overviewTitle}>{pretty(lesson.title)}</Text>
              <Text style={styles.overviewSubtitle}>
                {signature === 0
                  ? 'Natural scale · Raise ' + (up.join(' · ') || 'none')
                  : `Raise ${up.join(' · ') || 'none — all levers down'}`}
              </Text>
            </View>

            <MechanicalFifths
              tuning={tuning}
              selected={exploreKey ?? lesson.parent}
              onSelect={setExploreKey}
            />

            <TouchableOpacity
              nativeID="lever-overview-play-btn"
              style={styles.playBtn}
              activeOpacity={0.85}
              onPress={() => {
                timers.current.forEach(clearTimeout);
                timers.current = [];
                setExploreKey(null);
                setPractice(true);
                started.current = Date.now();
              }}
            >
              <Text style={styles.playBtnText}>Play</Text>
            </TouchableOpacity>
          </View>
        </Reveal>
      )}

      {/* Unified Round Verdict Overlay (Same Animation & Insight Layout as Single/Melody) */}
      {result !== null && !showVictoryModal && (
        <Reveal style={styles.answerOverlay}>
          <View style={styles.feedbackContentBox}>
            <View style={styles.feedbackTopSection}>
              <Text
                style={[
                  styles.unifiedAnswerTitle,
                  { color: result ? '#22c55e' : '#dc2626' },
                ]}
              >
                {result ? 'Spot On!' : 'Listen Closely...'}
              </Text>
            </View>

            <View style={styles.feedbackMiddleSection}>
              <Text style={styles.unifiedAnswerNote}>
                {pretty(lesson.title.replace(' Major', ''))}
              </Text>
              <View style={styles.scaleWalkRow}>
                {notes.map((n, i) => (
                  <View
                    key={i}
                    style={[
                      styles.scaleWalkPill,
                      playingNote === i && styles.scaleWalkPillActive,
                    ]}
                  >
                    <Text style={styles.scaleWalkText}>{pretty(n.label)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.feedbackBottomSection}>
              <Text style={styles.unifiedInsightText}>
                {result
                  ? `"Every lever is in place — ${up.length ? `raised ${up.join(' · ')}` : 'all levers resting down'}."`
                  : `"${8 - mismatch.length} of 8 levers matched. Needed: ${
                      mismatch
                        .map((x) => `${x.l}${x.i === 7 ? '²' : ''} ${x.wanted ? '↑' : '↓'}`)
                        .join(' · ') || 'none'
                    }."`}
              </Text>
            </View>
          </View>
        </Reveal>
      )}

      {/* Unified End-of-Level Session Insights Modal (Same as Single & Melody Paths) */}
      <SessionInsightsModal
        realm="levers"
        visible={showVictoryModal}
        level={syntheticLevelDef}
        sessionLog={sessionLog}
        onNextLevel={handleNextLevel}
        onReplay={handleReplayLevel}
        onBackToSanctuary={onBackToHome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: '#0d1511',
    position: 'relative',
    overflow: 'hidden',
  },
  fixedHarpContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  harpCanvas: {
    width: '100%',
    height: '100%',
  },
  topHud: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 12 : 40,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  hudBtn: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 29, 22, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  hudBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
  },
  hudCenterPill: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 29, 22, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  hudLevelCode: {
    color: '#f5c76b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  hudTargetScale: {
    fontFamily: 'Cinzel-Bold',
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 1,
  },
  hudSubInstruction: {
    color: '#cbd5e1',
    fontSize: 10.5,
    marginTop: 1,
  },
  controls: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 10 : 20,
    left: 12,
    right: 12,
    zIndex: 60,
    gap: 8,
  },
  leverRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
  leverBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  leverLetter: {
    fontSize: 14,
    fontWeight: '900',
  },
  leverState: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(25, 39, 30, 0.94)',
    borderWidth: 1,
    borderColor: '#f5c76b',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fef08a',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  overviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
    backgroundColor: 'rgba(11, 20, 15, 0.88)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        } as any)
      : {}),
  },
  overviewContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 58 : 84,
    paddingBottom: Platform.OS === 'web' ? 22 : 34,
    paddingHorizontal: 18,
  },
  overviewHeader: {
    alignItems: 'center',
    gap: 3,
  },
  overviewEyebrow: {
    color: '#f5c76b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  overviewTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  overviewSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center',
  },
  playBtn: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#f5c76b',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(245, 199, 107, 0.35)',
  } as any,
  playBtnText: {
    color: '#0f1c14',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  answerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 95,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(6, 12, 9, 0.48)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        } as any)
      : {}),
  },
  feedbackContentBox: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 18,
  },
  feedbackTopSection: {
    alignItems: 'center',
    width: '100%',
  },
  feedbackMiddleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 14,
  },
  feedbackBottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  unifiedAnswerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  unifiedAnswerNote: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 64,
    color: '#fef3c7',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(254, 240, 138, 0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 14,
  },
  scaleWalkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  scaleWalkPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  scaleWalkPillActive: {
    backgroundColor: 'rgba(245, 199, 107, 0.28)',
    borderColor: '#f5c76b',
  },
  scaleWalkText: {
    color: '#fef3c7',
    fontSize: 12.5,
    fontWeight: '800',
  },
  unifiedInsightText: {
    fontFamily: 'Inter',
    fontSize: 17,
    lineHeight: 26,
    color: '#f8fafc',
    textAlign: 'center',
    maxWidth: 360,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
