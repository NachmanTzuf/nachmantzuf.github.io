import {Reveal} from '../common/Reveal';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { CelticHarpCanvas, CelticHarpCanvasRef } from '../3d/CelticHarpCanvas';
import { CadenceEngine, VoiceLeadingChord } from '../../services/audio/CadenceEngine';
import { ResolutionWalker } from '../../services/audio/ResolutionWalker';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { ScaleDegree, DEFAULT_CADENCE_TIMINGS } from '../../services/audio/types';
import {
  LevelDefinition,
  SINGLE_NOTE_LEVELS,
  MELODY_LEVELS,
  getLevelById,
  UNRESTRICTED_DEV_MODE,
} from '../../services/curriculum/curriculumData';
import {
  CurriculumRandomizer,
  PromptQuestion,
} from '../../services/curriculum/CurriculumRandomizer';
import { TuningMatrixEngine, StringLetter } from '../../services/curriculum/TuningMatrixEngine';
import {
  UserAccountDatabase,
  SessionLogEntry,
} from '../../services/account/UserAccountDatabase';
import { MusicalResponsesCatalog } from '../../services/intelligence/MusicalResponsesCatalog';
import { SessionInsightsModal } from './SessionInsightsModal';

export interface InGamePlayScreenProps {
  realm: 'single' | 'melody' | 'levers';
  level?: LevelDefinition;
  onBackToHome: () => void;
  onCompleteSession?: (score: number, total: number, passed: boolean) => void;
  onNextLevel?: (nextLevel: LevelDefinition) => void;
  onOpenProfileInsights?: () => void;
}

const REALM_THEMES = {
  single: {
    name: 'Irish Sanctuary',
    title: 'The Tonic Anchor',
    bg: '/images/ingame_bg_single.jpg',
    accent: '#059669',
    glow: 'rgba(5, 150, 105, 0.7)',
    textAccent: '#34d399',
    runeIllum: '#fef08a',
  },
  melody: {
    name: 'Glacial Fjord',
    title: 'Melodic Sequence',
    bg: '/images/ingame_bg_melody.jpg',
    accent: '#0284c7',
    glow: 'rgba(2, 132, 199, 0.7)',
    textAccent: '#7dd3fc',
    runeIllum: '#e0f2fe',
  },
  levers: {
    name: 'Desert Canyon',
    title: 'Lever Roadmap',
    bg: '/images/ingame_bg_levers.jpg',
    accent: '#d97706',
    glow: 'rgba(217, 119, 6, 0.7)',
    textAccent: '#fbbf24',
    runeIllum: '#ffedd5',
  },
};

const DIATONIC_DEGREES: ScaleDegree[] = ['1', '2', '3', '4', '5', '6', '7', '8'];
const CHROMATIC_DEGREES: ScaleDegree[] = ['b2', 'b3', '#4', 'b6', 'b7'];

function degreeToStringNumber(deg: string): number {
  const map: Record<string, number> = {
    '1': 1,
    'b2': 2,
    '2': 2,
    'b3': 3,
    '3': 3,
    '4': 4,
    '#4': 4,
    '5': 5,
    'b6': 6,
    '6': 6,
    'b7': 7,
    '7': 7,
    '8': 8,
  };
  return map[deg] || 1;
}

export type NotationPreference = 'numbers' | 'solfege' | 'notes';

function formatDegreeLabel(deg: ScaleDegree, pref: NotationPreference): string {
  if (pref === 'numbers') return deg;
  const solfegeMap: Record<ScaleDegree, string> = {
    '1': 'Do',
    'b2': 'Ra',
    '2': 'Re',
    'b3': 'Me',
    '3': 'Mi',
    '4': 'Fa',
    '#4': 'Fi',
    '5': 'Sol',
    'b6': 'Le',
    '6': 'La',
    'b7': 'Te',
    '7': 'Ti',
    '8': 'Do',
  };
  const noteMap: Record<ScaleDegree, string> = {
    '1': 'C',
    'b2': 'Db',
    '2': 'D',
    'b3': 'Eb',
    '3': 'E',
    '4': 'F',
    '#4': 'F#',
    '5': 'G',
    'b6': 'Ab',
    '6': 'A',
    'b7': 'Bb',
    '7': 'B',
    '8': 'C',
  };
  if (pref === 'solfege') return solfegeMap[deg] || deg;
  if (pref === 'notes') return noteMap[deg] || deg;
  return deg;
}

function calculateStringFrequency(strNum: number, isLeverUp: boolean): number {
  const openMidiTable = [60, 62, 63, 65, 67, 68, 70, 72];
  const baseMidi = openMidiTable[strNum - 1] || 60;
  const actualMidi = isLeverUp ? baseMidi + 1 : baseMidi;
  return CadenceEngine.midiToFreq(actualMidi);
}

function getSoundedScaleDegree(strNum: number, isLeverUp: boolean): ScaleDegree {
  switch (strNum) {
    case 1: return isLeverUp ? 'b2' : '1';
    case 2: return isLeverUp ? 'b3' : '2';
    case 3: return isLeverUp ? '3' : 'b3';
    case 4: return isLeverUp ? '#4' : '4';
    case 5: return isLeverUp ? 'b6' : '5';
    case 6: return isLeverUp ? '6' : 'b6';
    case 7: return isLeverUp ? '7' : 'b7';
    case 8: return isLeverUp ? 'b2' : '8';
    default: return '1';
  }
}

export const InGamePlayScreen: React.FC<InGamePlayScreenProps> = ({
  realm,
  level: initialLevel,
  onBackToHome,
  onCompleteSession,
  onNextLevel,
  onOpenProfileInsights,
}) => {
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const aliveRef = useRef(true);
  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      if (aliveRef.current) callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  };
  const feedbackOpacity = useRef(new Animated.Value(1)).current;
  const [replayIndex,setReplayIndex]=useState(-1);
  const [answerFeedback, setAnswerFeedback] = useState<{correct: boolean; text: string} | null>(null);
  const theme = REALM_THEMES[realm] || REALM_THEMES.single;
  const canvasRef = useRef<CelticHarpCanvasRef | null>(null);
  const synthRef = useRef<HarpSoundSynthesizer>(new HarpSoundSynthesizer('celtic_nylon'));
  const cadenceEngineRef = useRef<CadenceEngine>(new CadenceEngine());

  // Determine active level definition
  const fallbackLevel =
    realm === 'melody'
      ? MELODY_LEVELS[0]
      : SINGLE_NOTE_LEVELS[0];

  const [activeLevel, setActiveLevel] = useState<LevelDefinition>(initialLevel || fallbackLevel);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [activeQuestion, setActiveQuestion] = useState<PromptQuestion | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('Listen to the Cadence, then identify the note');
  const [lastGuessedDegree, setLastGuessedDegree] = useState<ScaleDegree | null>(null);
  const guessesRef = useRef<string[]>([]);
  const guessTimesRef = useRef<number[]>([]);
  const feedbackStartedRef = useRef(0);
  const lockedKeyRef = useRef<string | undefined>(undefined);
  const [sequenceGuesses, setSequenceGuesses] = useState<string[]>([]);
  const [isRoundResolved, setIsRoundResolved] = useState<boolean>(false);
  const [isVictoryModalVisible, setIsVictoryModalVisible] = useState<boolean>(false);
  const [sessionPassed, setSessionPassed] = useState<boolean>(false);
  const [activeSessionLog, setActiveSessionLog] = useState<SessionLogEntry | null>(null);

  // Notation Preference (Numbers: 1..8 | Solfege: Do..Do | Pitch: C..C)
  const [notationPreference, setNotationPreference] = useState<NotationPreference>(UserAccountDatabase.getInstance().getActiveProfile().notationPreference || 'numbers');

  // C Major Initial Tuning: on open Eb harp, levers 3, 6, 7 (E, A, B) are UP
  const [leverStates, setLeverStates] = useState<boolean[]>([
    false, false, true, false, false, true, true, false
  ]);

  // Synchronized state refs to prevent Three.js event listener stale closures
  const activeQuestionRef = useRef<PromptQuestion | null>(activeQuestion);
  activeQuestionRef.current = activeQuestion;

  const isRoundResolvedRef = useRef<boolean>(isRoundResolved);
  isRoundResolvedRef.current = isRoundResolved;

  const isPlayingAudioRef = useRef<boolean>(isPlayingAudio);
  isPlayingAudioRef.current = isPlayingAudio;

  const leverStatesRef = useRef<boolean[]>(leverStates);
  leverStatesRef.current = leverStates;

  const targetPluckTimestampRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Side 3/4 beauty stance matching user reference photo:
  // theta = -0.95 rad: Forepillar tilted toward viewer, soundbox tilted into photo
  const inGameAngle = -0.95;

  // Global synchronous gesture audio unlocking
  useEffect(() => {
    const unlockAudio = () => {
      synthRef.current.initAudio();
      synthRef.current.unlockSynchronously();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });
    }
    return () => {
      aliveRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      }
    };
  }, []);

  const totalRounds = activeLevel.rounds || 10;
  const melodyLength = activeLevel.isHarmonicDyad ? 2 : activeLevel.melodyLength || 1;
  const isSequenceMode = melodyLength > 1;

  // Start new trial round using CurriculumRandomizer
  const startNewTrial = (roundNum: number, currentLevelDef: LevelDefinition) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    setIsRoundResolved(false);
    isRoundResolvedRef.current = false;
    setLastGuessedDegree(null);
    setSequenceGuesses([]);
    guessesRef.current = [];
    guessTimesRef.current = [];

    // Sample question from CurriculumRandomizer obeying bitmask and octave rules
    const question = CurriculumRandomizer.generateQuestion(currentLevelDef, roundNum, currentLevelDef.cadenceKey === 'RANDOM_NON_C' ? lockedKeyRef.current : undefined);
    if (currentLevelDef.cadenceKey === 'RANDOM_NON_C') lockedKeyRef.current = question.tonicKey;
    const config = TuningMatrixEngine.getLeverConfiguration(TuningMatrixEngine.getActiveTuning(), question.tonicKey.replace('_minor', '') + (question.isMinor ? '_minor' : ''));
    const states = [...'CDEFGABC'].map(letter => !!config[letter as StringLetter]);
    setLeverStates(states);
    leverStatesRef.current = states;
    canvasRef.current?.setAllLevers(states);
    setActiveQuestion(question);
    activeQuestionRef.current = question;

    const targetDesc = isSequenceMode ? `${melodyLength}-note melody` : 'mystery note';
    setFeedbackText('Settle in · listen for home');

    // Play cadence & target
    playQuestionAudio(question);
  };

  const playQuestionAudio = async (question: PromptQuestion) => {
    if (isPlayingAudioRef.current || isRoundResolvedRef.current) return;
    setIsPlayingAudio(true);
    isPlayingAudioRef.current = true;

    try {
      await Promise.race([
        synthRef.current.initAudio(),
        new Promise<void>((resolve) => schedule(() => resolve(), 350)),
      ]);

      if (!aliveRef.current) return;
      // 1. Generate Voice-Leading Cadence (I - IV - V - I)
      const cleanKey = question.tonicKey.replace('_minor', '');
      const rootMidi = TuningMatrixEngine.getRootMidiForKey(cleanKey, 4);
      const cadenceChords = cadenceEngineRef.current.generateCadence(rootMidi, 'inverted', question.isMinor);

      // Schedule Cadence Chords
      let elapsedMs = question.questionIndex === 1 ? 1000 : 180;
      cadenceChords.forEach((chord, chordIdx) => {
        schedule(() => {
          synthRef.current.playChord(chord, true);
          canvasRef.current?.triggerCadencePulse();
          setFeedbackText(`Listen · ${chordIdx + 1} / 4`);
        }, elapsedMs);
        elapsedMs += chord.durationMs;
      });

      // 2. Anticipation Gap (420ms)
      const anticipationGapMs = 240;
      elapsedMs += anticipationGapMs;

      // 3. Play Target Note(s)
      schedule(() => {
        setFeedbackText(`Listening to ${isSequenceMode ? `${melodyLength}-note melody` : 'mystery note'}...`);

        question.targetMidiNotes.forEach((midi, noteIdx) => {
          const noteDelay = question.isHarmonicDyad ? 0 : noteIdx * (60000 / (question.tempoBpm || 150)); // 400ms Inter-Onset Interval
          schedule(() => {
            const freq = CadenceEngine.midiToFreq(midi);
            synthRef.current.playPluck(freq, 1600, 0.92);
            if (noteIdx === 0) {
              targetPluckTimestampRef.current = performance.now();
            }

            // CRITICAL: Question stimulus is strictly auditory!
            // String must NOT vibrate or illuminate during the question, preventing visual answer leakage!

            if (noteIdx === question.targetMidiNotes.length - 1) {
              schedule(() => {
                targetPluckTimestampRef.current = performance.now();
                setIsPlayingAudio(false);
                isPlayingAudioRef.current = false;
                setFeedbackText(
                  isSequenceMode
                    ? `Tap the ${melodyLength} notes in order`
                    : 'Your turn · pluck a string or choose a note'
                );
              }, 400);
            }
          }, noteDelay);
        });
      }, elapsedMs);
    } catch (err) {
      console.warn('Audio playback error:', err);
      setIsPlayingAudio(false);
      isPlayingAudioRef.current = false;
      setFeedbackText('Identify the scale degree');
    }
  };

  // Direct 3D Harp String Pluck (Identical handling to lower shelf buttons)
  const handleDirectStringPluck = (strNum: number) => {
    if (isRoundResolvedRef.current || isPlayingAudioRef.current || !activeQuestionRef.current) return;
    const isUp = leverStatesRef.current[strNum - 1] ?? false;
    const q = activeQuestionRef.current;
    const midi = TuningMatrixEngine.getStringMidi(TuningMatrixEngine.getActiveTuning(), 'CDEFGABC'[strNum - 1] as StringLetter, isUp, strNum === 8 ? 5 : 4);
    const root = TuningMatrixEngine.getRootMidiForKey(q.tonicKey.replace('_minor', ''), 4);
    const delta = ((midi - root) % 12 + 12) % 12;
    const scale = q.isMinor && !activeLevel.isChromatic && !activeLevel.isHarmonicDyad ? ['1','b2','2','3','b3','4','#4','5','6','b6','7','b7'] : ['1','b2','2','b3','3','4','#4','5','b6','6','b7','7'];
    const soundedDegree = (delta === 0 && midi > root ? '8' : scale[delta]) as ScaleDegree;
    handleGuess(soundedDegree);
  };

  // Interactive 3D Camac Lever Toggle
  const handleLeverToggled = (degNum: number, isUp: boolean) => {
    setLeverStates((prev) => {
      const next = [...prev];
      if (degNum >= 1 && degNum <= 8) next[degNum - 1] = isUp;
      return next;
    });

  };

  // User input handling (Tapping lower shelf button OR plucking 3D string)
  const handleGuess = (degree: ScaleDegree) => {
    if (isRoundResolvedRef.current || isPlayingAudioRef.current || !activeQuestionRef.current) return;

    if (isSequenceMode) {
      // Guard against duplicate or extraneous submissions once required melody length is reached
      if (guessesRef.current.length >= melodyLength) return;

      // Sequence collection mode: play note audio immediately on tap/pluck
      const degNum = degreeToStringNumber(degree);
      const isUp = leverStates[degNum - 1] ?? false;
      const freq = CadenceEngine.midiToFreq(noteMidi(degree, activeQuestionRef.current));
      synthRef.current.playPluck(freq, 1200, 0.90);
      canvasRef.current?.triggerLightStrike(degNum);

      const nextGuesses = [...guessesRef.current, degree];
      guessesRef.current = nextGuesses;
      guessTimesRef.current.push(performance.now());
      setSequenceGuesses(nextGuesses);

      if (nextGuesses.length < melodyLength) {
        setFeedbackText(`Note ${nextGuesses.length} of ${melodyLength}: ${nextGuesses.join(' → ')}`);
        return;
      }

      // Full sequence entered -> evaluate
      evaluateSequence(nextGuesses);
    } else {
      // Single note mode
      evaluateSingleNote(degree);
    }
  };

  const noteMidi = (degree: string, q: PromptQuestion) => {
    const intervals: Record<string,number> = {'1':0,'b2':1,'2':2,'b3':3,'3':4,'4':5,'#4':6,'5':7,'b6':8,'6':9,'b7':10,'7':11,'8':12};
    if (q.isMinor && !activeLevel.isChromatic && !activeLevel.isHarmonicDyad) Object.assign(intervals, {'3':3,'6':8,'7':10});
    return TuningMatrixEngine.getRootMidiForKey(q.tonicKey.replace('_minor',''), q.octave) + intervals[degree];
  };
  const choiceLabel = (degree: ScaleDegree) => {
    if (notationPreference !== 'notes' || !activeQuestion) return formatDegreeLabel(degree, notationPreference);
    return ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][noteMidi(degree,activeQuestion)%12];
  };
  const answerLabel = (degree: string, q: PromptQuestion) => {
    const i = q.targetDegrees.indexOf(degree);
    const midi = q.targetMidiNotes[Math.max(0, i)];
    const pitch = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][midi % 12];
    return `${pitch} (${degree})`;
  };
  const finishFeedback = (score: number) => {
    // Keep the verdict readable without delaying the cadence-paced resolution.
    schedule(() => { setAnswerFeedback(null); handleRoundCompletion(score); },
      Math.max(350, 3200 - (performance.now() - feedbackStartedRef.current)));
  };

  const evaluateSingleNote = (degree: ScaleDegree) => {
    const q = activeQuestionRef.current || activeQuestion;
    if (!q) return;
    setLastGuessedDegree(degree);
    setIsRoundResolved(true);
    isRoundResolvedRef.current = true;

    const degNum = degreeToStringNumber(degree);
    const target = q.targetDegrees[0] as ScaleDegree;
    const isCorrect = degree === target;

    const latencyMs = targetPluckTimestampRef.current > 0
      ? Math.max(50, Math.round(performance.now() - targetPluckTimestampRef.current))
      : 1200;

    // Persist trial in UserAccountDatabase
    const db = UserAccountDatabase.getInstance();
    db.recordTrial({
      sessionId: `session_${sessionStartTimeRef.current}`,
      levelId: activeLevel.id,
      track: activeLevel.track,
      tonicKey: q.tonicKey,
      stimulusDegree: target,
      guessedDegree: degree,
      isCorrect,
      latencyMs,
      roundIndex: currentRound,
    });

    const newScore = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(newScore);
    feedbackStartedRef.current = performance.now();
    setAnswerFeedback({ correct: isCorrect, text: isCorrect
      ? `Correct note: ${answerLabel(target, q)}`
      : `Correct note: ${answerLabel(target, q)}` });
    schedule(() => {
      playGuessedResolutionWalk(target, () => { finishFeedback(newScore); });
    }, 0);
  };

  const evaluateSequence = (guesses: string[]) => {
    const q = activeQuestionRef.current || activeQuestion;
    if (!q) return;
    setIsRoundResolved(true);
    isRoundResolvedRef.current = true;

    const targets = q.targetDegrees;
    const isCorrect = guesses.length === targets.length && (activeLevel.isHarmonicDyad
      ? [...guesses].sort().join() === [...targets].sort().join()
      : guesses.every((g, idx) => g === targets[idx]));

    const latencyMs = targetPluckTimestampRef.current > 0
      ? Math.max(50, Math.round(performance.now() - targetPluckTimestampRef.current))
      : 2400;

    // Persist each note in sequence to UserAccountDatabase
    const db = UserAccountDatabase.getInstance();
    const remaining = [...guesses];
    const evaluatedGuesses = activeLevel.isHarmonicDyad ? targets.map(target => {
      const match = remaining.indexOf(target);
      return remaining.splice(match >= 0 ? match : 0, 1)[0];
    }) : guesses;
    evaluatedGuesses.forEach((g, idx) => {
      const targetDeg = targets[idx];
      db.recordTrial({
        sessionId: `session_${sessionStartTimeRef.current}`,
        levelId: activeLevel.id,
        track: activeLevel.track,
        tonicKey: q.tonicKey,
        stimulusDegree: targetDeg,
        guessedDegree: g,
        isCorrect: g === targetDeg,
        latencyMs: Math.max(0, Math.round(guessTimesRef.current[idx] - (idx === 0 ? targetPluckTimestampRef.current : guessTimesRef.current[idx-1]))),
        roundIndex: currentRound,
      });
    });

    const newScore = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(newScore);
    feedbackStartedRef.current = performance.now();
    setAnswerFeedback({ correct: isCorrect, text: isCorrect
      ? `Correct notes: ${targets.map(d => answerLabel(d, q)).join(' → ')}`
      : `Correct notes: ${targets.map(d => answerLabel(d, q)).join(' → ')}` });
    const beat = 60000 / (q.tempoBpm || 150);
    const separationMs = 300; // Configurable 250-350ms settling separation gap per REQ-P3-A02
    setFeedbackText('Listen to the correct pattern');
    q.targetMidiNotes.forEach((midi, index) => schedule(() => {
      setReplayIndex(activeLevel.isHarmonicDyad ? -2 : index);
      canvasRef.current?.triggerLightStrike(degreeToStringNumber(targets[index] as ScaleDegree));
      synthRef.current.playPluck(440 * Math.pow(2, (midi - 69) / 12), Math.max(900, beat * 2), 0.9);
    }, separationMs + (activeLevel.isHarmonicDyad ? 0 : index * beat)));
    schedule(() => {
      setReplayIndex(-1);
      finishFeedback(newScore);
    }, separationMs + (activeLevel.isHarmonicDyad ? 1 : targets.length) * beat);

  };

  const playGuessedResolutionWalk = (guessedDeg: ScaleDegree, onFinish: () => void) => {
    try {
      const q = activeQuestionRef.current || activeQuestion;
      const cleanKey = q?.tonicKey.replace('_minor', '') || 'C';
      const rootMidi = TuningMatrixEngine.getRootMidiForKey(cleanKey, q?.octave || 4);

      // Bidirectional stepwise resolution path to CLOSEST tonic anchor C:
      // Low degrees (1, b2, 2, b3, 3, 4) resolve DOWN to Low C4 ('1')
      // High degrees (5, #4, b6, 6, b7, 7, 8) resolve UP to High C5 ('8')
      const walker = new ResolutionWalker({ resolutionStepDurationMs: DEFAULT_CADENCE_TIMINGS.chordDurationMs, resolutionTonicHoldMs: DEFAULT_CADENCE_TIMINGS.chordDurationMs });
      const path = walker.generatePath(guessedDeg, rootMidi, 'closest', !!q?.isMinor, activeLevel.isChromatic || !!activeLevel.isHarmonicDyad);

      // Authentic unhurried singing pace matching Alain Benbassat Functional Ear Trainer (560ms per step)
      const stepIntervalMs = 560;

      const executeStep = (stepIdx: number) => {
        if (stepIdx < path.length) {
          const step = path[stepIdx];
          const isFinal = stepIdx === path.length - 1;
          const sNum = degreeToStringNumber(step.degree);

          feedbackOpacity.setValue(0.65);
          Animated.sequence([
            Animated.timing(feedbackOpacity, { toValue: 1, duration: 140, useNativeDriver: true }),
            Animated.timing(feedbackOpacity, { toValue: 0.65, duration: DEFAULT_CADENCE_TIMINGS.chordDurationMs - 140, useNativeDriver: true }),
          ]).start();
          // String illumination and acoustic physical pluck
          canvasRef.current?.triggerLightStrike(sNum);
          synthRef.current.playPluck(step.frequencyHz, step.durationMs, isFinal ? 0.95 : 0.85);

          const stepHistory = path
            .slice(0, stepIdx + 1)
            .map((s) => `${formatDegreeLabel(s.degree, notationPreference)} (${s.solfege})`)
            .join(' → ');
          setFeedbackText(`Homeward · ${formatDegreeLabel(step.degree, notationPreference)}`);

          // Schedule next step in the walk at unhurried singing pace
          schedule(() => executeStep(stepIdx + 1), step.durationMs);
        } else {
          // Pedagogical reflection pause after final tonic resolves
          onFinish();
        }
      };

      // Step 0 plucks IMMEDIATELY upon user touch / pluck (0ms latency)!
      executeStep(0);
    } catch {
      schedule(onFinish, 1200);
    }
  };

  const playResolutionWalk = playGuessedResolutionWalk;

  const handleRoundCompletion = (score: number) => {
    if (currentRound >= totalRounds) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
      const accuracyPct = Math.round((score / totalRounds) * 100);
      const passed = accuracyPct >= 90;
      setSessionPassed(passed);

      // Record Session and Practice Time in UserAccountDatabase
      const db = UserAccountDatabase.getInstance();


      // Compute actual reflex timing from recorded session trials
      const userTrials = db.getUserTrials(db.getActiveProfile().id);
      const curSessionTrials = userTrials.filter(t => t.sessionId === `session_${sessionStartTimeRef.current}`);
      const avgLat = curSessionTrials.length > 0
        ? Math.round(curSessionTrials.reduce((sum, t) => sum + t.latencyMs, 0) / curSessionTrials.length)
        : 780;
      const fastestLat = curSessionTrials.length > 0
        ? Math.min(...curSessionTrials.map(t => t.latencyMs))
        : 450;

      const sLog = db.recordSession({
        trialSessionId: `session_${sessionStartTimeRef.current}`,
        levelId: activeLevel.id,
        levelCode: activeLevel.code,
        track: activeLevel.track,
        durationSeconds,
        totalRounds,
        correctRounds: score,
        accuracyPct,
        passed,
        averageLatencyMs: avgLat,
        fastestLatencyMs: fastestLat,
      });

      setActiveSessionLog(sLog);
      setIsVictoryModalVisible(true);
      onCompleteSession?.(score, totalRounds, passed);
    } else {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      startNewTrial(nextRound, activeLevel);
    }
  };

  const handleAdvanceNextLevel = () => {
    const allTrackLevels = activeLevel.track === 'melody' ? MELODY_LEVELS : SINGLE_NOTE_LEVELS;
    const nextIdx = activeLevel.levelNumber; // levelNumber is 1-indexed, so index nextIdx is the next level
    if (nextIdx < allTrackLevels.length) {
      const nextLvl = allTrackLevels[nextIdx];
      lockedKeyRef.current = undefined;
      setActiveLevel(nextLvl);
      setCurrentRound(1);
      setCorrectCount(0);
      setIsVictoryModalVisible(false);
      setActiveSessionLog(null);
      sessionStartTimeRef.current = Date.now();
      onNextLevel?.(nextLvl);
      startNewTrial(1, nextLvl);
    } else {
      onBackToHome();
    }
  };

  const handleReplaySession = () => {
    setCurrentRound(1);
    setCorrectCount(0);
    setIsVictoryModalVisible(false);
    setActiveSessionLog(null);
    sessionStartTimeRef.current = Date.now();
    startNewTrial(1, activeLevel);
  };

  useEffect(() => {
    aliveRef.current = true;
    startNewTrial(1, activeLevel);
    return () => {
      aliveRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
      synthRef.current.dispose();
    };
  }, []);

  // Determine which scale degrees are candidate choices for this level
  const isCandidateDegree = (deg: ScaleDegree): boolean => {
    if (UNRESTRICTED_DEV_MODE) return true;
    const degNum = parseInt(deg, 10);
    if (!isNaN(degNum) && degNum >= 1 && degNum <= 8) {
      return activeLevel.activeNotesMask[degNum - 1] === true;
    }
    if (activeLevel.isChromatic && activeLevel.allowedChromaticDegrees) {
      return activeLevel.allowedChromaticDegrees.includes(deg);
    }
    return false;
  };

  const hasChromatics = activeLevel.isChromatic && (activeLevel.allowedChromaticDegrees?.length || 0) > 0;

  return (
    <View style={styles.container}>
      {/* 1. Atmospheric Dark Background Image */}
      <Image
        source={{ uri: theme.bg }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* 2. Top Minimalist HUD Bar */}
      <View style={styles.topHudContainer} pointerEvents="box-none">
        {/* Back Button */}
        <TouchableOpacity
          nativeID="ingame-back-btn"
          activeOpacity={0.75}
          onPress={onBackToHome}
          style={styles.liquidGlassBtn}
        >
          <Text style={styles.backBtnText}>‹ Home</Text>
        </TouchableOpacity>

        {/* Center Progress Pill & Level Title */}
        <View style={styles.progressPill}>
          <Text style={styles.levelCodeBadge}>
            {activeLevel.code} • {activeLevel.title}
          </Text>
          <Text style={styles.progressPillTitle}>
            Round {currentRound} / {totalRounds}
          </Text>
          <View style={styles.pipsRow}>
            {Array.from({ length: Math.min(10, totalRounds) }).map((_, i) => {
              const normalizedIndex = Math.floor((i / 10) * totalRounds);
              const isPast = normalizedIndex < currentRound - 1;
              const isCurrent = Math.floor(((currentRound - 1) / totalRounds) * 10) === i;
              return (
                <View
                  key={i}
                  style={[
                    styles.roundPip,
                    isPast && { backgroundColor: theme.accent, boxShadow: `0 0 4px ${theme.accent}` } as any,
                    isCurrent && { backgroundColor: '#ffffff', boxShadow: '0 0 6px #ffffff', transform: [{ scale: 1.25 }] } as any,
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Replay Cadence Button */}
        <TouchableOpacity
          nativeID="ingame-replay-btn"
          activeOpacity={0.75}
          disabled={isPlayingAudio || isRoundResolved || !activeQuestion}
          onPress={() => {guessesRef.current=[];guessTimesRef.current=[];setSequenceGuesses([]);if(activeQuestion)void playQuestionAudio(activeQuestion);}}
          style={[styles.liquidGlassBtn, isPlayingAudio && { opacity: 0.5 }]}
        >
          <Text style={styles.replayBtnText}>↺ Replay</Text>
        </TouchableOpacity>
      </View>

      {/* 3. 3D Celtic Harp: Side 3/4 Beauty Angle with Direct Finger Plucking */}
      <View style={styles.fixedHarpContainer} pointerEvents="box-none">
        <CelticHarpCanvas
          ref={canvasRef}
          style={[styles.harpCanvas, { pointerEvents: 'auto' } as any]}
          onStringPlucked={handleDirectStringPluck}
          onLeverToggled={handleLeverToggled}
          initialLeverStates={leverStates}
          interactiveControls={true}
          fixedInGameAngle={true}
          customAngle={inGameAngle}
          customScale={0.84}
          targetY={0.60}
          minimalHeroMode={true}
        />
      </View>

      {/* 4. Bottom Scale Degree Shelf */}
      <View style={styles.bottomShelfContainer} pointerEvents="box-none">
        <TouchableOpacity accessibilityLabel="Change note notation" onPress={() => {
          const options: NotationPreference[] = ['numbers', 'solfege', 'notes'];
          const next = options[(options.indexOf(notationPreference) + 1) % options.length];
          setNotationPreference(next);
          UserAccountDatabase.getInstance().updateActiveProfile({ notationPreference: next });
        }} style={{ alignSelf: 'flex-end', padding: 8 }}>
          <Text style={{ color: '#d9cbb5', fontSize: 12 }}>{notationPreference === 'numbers' ? '1 2 3' : notationPreference === 'solfege' ? 'Do Re Mi' : 'C D E'}</Text>
        </TouchableOpacity>

        {/* Feedback Chip */}
        <View style={styles.feedbackChip}>
          <Text style={[styles.feedbackText, { color: theme.textAccent }]}>
            {feedbackText}
          </Text>
        </View>

        {/* Sequence Guess Indicators (if melody sequence mode) */}
        {isSequenceMode && (
          <View style={styles.sequenceIndicatorsRow}>
            {Array.from({ length: melodyLength }).map((_, idx) => {
              const guess = sequenceGuesses[idx];
              return (
                <View
                  key={idx}
                  style={[
                    styles.sequenceChip,
                    guess ? { borderColor: theme.accent, backgroundColor: 'rgba(255, 255, 255, 0.12)' } : null,
                  ]}
                >
                  <Text style={[styles.sequenceChipText, { color: guess ? theme.textAccent : '#64748b' }]}>
                    {guess ? formatDegreeLabel(guess as ScaleDegree, notationPreference) : `Note ${idx + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Chromatic Degree Row (if active) */}
        {hasChromatics && (
          <View style={styles.chromaticButtonsRow}>
            {CHROMATIC_DEGREES.map((deg) => {
              const isAllowed = isCandidateDegree(deg);
              if (!isAllowed) return null;
              return (
                <TouchableOpacity
                  key={deg}
                  nativeID={`degree-btn-${deg}`}
                  activeOpacity={0.75}
                  disabled={isRoundResolved || isPlayingAudio}
                  onPress={() => handleGuess(deg)}
                  style={[
                    styles.chromaticButton,
                    { borderColor: theme.accent },
                  ]}
                >
                  <Text style={[styles.chromaticButtonText, { color: theme.textAccent }]}>
                    {choiceLabel(deg)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Diatonic Scale Degree Touch Buttons (1 to 8) */}
        <View style={styles.degreeButtonsRow}>
          {DIATONIC_DEGREES.map((deg) => {
            const isCandidate = isCandidateDegree(deg);
            const isGuessed = lastGuessedDegree === deg;
            const isTarget = isRoundResolved && activeQuestion?.targetDegrees.includes(deg);

            return (
              <TouchableOpacity
                key={deg}
                nativeID={`degree-btn-${deg}`}
                activeOpacity={0.75}
                disabled={isRoundResolved || isPlayingAudio}
                onPress={() => handleGuess(deg)}
                style={[
                  styles.degreeButton,
                  isCandidate ? styles.candidateButton : styles.inactiveButton,
                  isGuessed && isTarget && { backgroundColor: theme.accent, borderColor: '#ffffff' },
                  isGuessed && !isTarget && { backgroundColor: '#b91c1c', borderColor: '#ef4444' },
                ]}
              >
                <Text
                  style={[
                    styles.degreeButtonText,
                    !isCandidate && { color: '#64748b', opacity: 0.6 },
                  ]}
                >
                  {choiceLabel(deg)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {answerFeedback && (
        <Reveal style={styles.answerOverlay}><View nativeID="answer-feedback" style={{width:'100%',alignItems:'center',gap:20}}>
          <Animated.Text style={[styles.answerTitle, {opacity: feedbackOpacity}]}>{answerFeedback.correct ? 'Correct' : 'Incorrect'}</Animated.Text>
          <Text style={{color:'#e9cf9c',fontSize:14,letterSpacing:2}}>THE CORRECT {activeLevel.track==='melody'?'PATTERN':'NOTE'}</Text>
          {activeLevel.track==='melody' && activeQuestion ? <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:12}}>{activeQuestion.targetDegrees.map((d,i)=><View key={i} style={{minWidth:70,padding:14,borderRadius:16,borderWidth:1,borderColor:replayIndex===i||replayIndex===-2?'#f4dfaf':'#8d826b',backgroundColor:replayIndex===i||replayIndex===-2?'rgba(211,184,125,.32)':'rgba(31,43,33,.5)',alignItems:'center',gap:10}}><Text style={{color:'#c9b997',fontSize:12}}>{activeLevel.isHarmonicDyad?'Together':i+1}</Text><Text style={{color:'#fae8c2',fontFamily:'Cinzel-Bold',fontSize:30}}>{['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][activeQuestion.targetMidiNotes[i]%12]}</Text><Text style={{color:'#e3d1ae',fontSize:17}}>Degree {d}</Text></View>)}</View> : <Text style={styles.answerDetail}>{answerFeedback.text.replace('Correct note: ','')}</Text>}
          <Text accessibilityLiveRegion="polite" style={{ color: "#f4dfaf", fontSize: 24, marginTop: 24 }}>{feedbackText}</Text>
        </View></Reveal>
      )}
      {/* 5. Session Complete Debrief Modal with 90% Gate, Reflex Latency & Pedagogical Insights */}
      <SessionInsightsModal
        realm={realm}
        visible={isVictoryModalVisible}
        level={activeLevel}
        sessionLog={activeSessionLog}
        onNextLevel={handleAdvanceNextLevel}
        onReplay={handleReplaySession}
        onBackToSanctuary={onBackToHome}
        onOpenProfileInsights={onOpenProfileInsights}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  answerOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 90, alignItems: 'center', justifyContent: 'center',
    padding: 32, backgroundColor: 'rgba(12, 10, 8, 0.25)',
    ...(Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(180deg, rgba(8,7,6,.04), rgba(15,12,9,.68), rgba(8,7,6,.08))' } as any : {}),
  },
  answerTitle: { fontFamily: 'Cinzel-Bold', fontSize: 44, color: '#e9cf9c', textAlign: 'center', marginBottom: 20 },
  answerDetail: { fontFamily: 'Inter', fontSize: 42, lineHeight: 54, color: '#f0dfbd', textAlign: 'center' },
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0a0d12',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  topHudContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 18 : 44,
    left: 14,
    right: 14,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liquidGlassBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        } as any)
      : {}),
  },
  backBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#e2e8f0',
    letterSpacing: 0.4,
  },
  replayBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#e2e8f0',
    letterSpacing: 0.4,
  },
  progressPill: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        } as any)
      : {}),
  },
  levelCodeBadge: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  progressPillTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  pipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  roundPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  fixedHarpContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  harpCanvas: {
    width: '100%',
    height: '100%',
  },
  bottomShelfContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: Platform.OS === 'web' ? 24 : 40,
    zIndex: 30,
    alignItems: 'center',
  },
  notationToggleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
        } as any)
      : {}),
  },
  notationToggleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  notationToggleText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  feedbackChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 8,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        } as any)
      : {}),
  },
  feedbackText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  sequenceIndicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sequenceChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  sequenceChipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
  },
  chromaticButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  chromaticButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1,
  },
  chromaticButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
  },
  degreeButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  degreeButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        } as any)
      : {}),
  },
  candidateButton: {
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  inactiveButton: {
    opacity: 0.45,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(15, 23, 42, 0.40)',
  },
  degreeButtonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  victoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  victoryCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    padding: 20,
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65)',
        } as any)
      : {}),
  },
  victoryEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  victoryTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#ffffff',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  victoryScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: '#f8fafc',
    marginBottom: 2,
  },
  victoryGateRequirement: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 6,
  },
  victorySub: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 16,
  },
  victoryButtonsRow: {
    width: '100%',
    gap: 8,
  },
  victoryActionBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryActionBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  victorySecondaryBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  victorySecondaryBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#e2e8f0',
  },
  victoryGhostBtn: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryGhostBtnText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
  },
});

