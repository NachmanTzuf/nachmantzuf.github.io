import {LessonLibrary} from '../components/common/LessonLibrary';
import {WelcomeProfile} from '../components/account/WelcomeProfile';
import {UserAccountDatabase} from '../services/account/UserAccountDatabase';
import {LeverTrainingScreen} from '../components/game/LeverTrainingScreen';
/**
 * EARPA: 3D CELTIC HARP & FUNCTIONAL EAR TRAINER
 * Master Application Screen with:
 *   1. DeviceFramePreview (Realistic iPhone 15 Pro / Galaxy S24 preview on desktop + PWA install guide)
 *   2. TopHeaderBar (Avatar, Level, Streak, Map button)
 *   3. 4-Tab Navigation via LiquidGlassTabBar:
 *      - Home (Hero 3D Harp with Volumetric Ray from Top Right + Play Button + XP Milestone Bar)
 *      - Chords (Cadence Progressions I - IV - V - I & SATB Arpeggio Studio)
 *      - Levers (Camac Sharping Levers & Circle of Fifths Studio)
 *      - Journey / Profile (Harper Statistics & Bayesian Scale Degree Mastery Radar)
 *   4. Focused Mini-Game Arena (Cadence, Pluck Resolution UP to 8 / DOWN to 1, 8-Degree Touch Shelf)
 *   5. Full 360° 3D Harp & Levers Lutherie Studio
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
} from 'react-native';
import { CelticHarpCanvas, CelticHarpCanvasRef } from '../components/3d/CelticHarpCanvas';
import { DegreeTouchShelf } from '../components/audio/DegreeTouchShelf';
import { LeverControlPanel } from '../components/audio/LeverControlPanel';
import { PostLevelDiagnosticModal } from '../components/diagnostics/PostLevelDiagnosticModal';
import { PracticeSanctuaryModal } from '../components/modes/PracticeSanctuaryModal';
import { LeverLadderScreen } from '../components/modes/LeverLadderScreen';
import { BardicJourneyScreen } from '../components/gamification/BardicJourneyScreen';
import { HarpGarageModal } from '../components/gamification/HarpGarageModal';
import { SocialCirclesModal } from '../components/social/SocialCirclesModal';
import { CadenceEngine } from '../services/audio/CadenceEngine';
import { ResolutionWalker } from '../services/audio/ResolutionWalker';
import { HarpSoundSynthesizer } from '../services/audio/HarpSoundSynthesizer';
import { AudioStateMachine } from '../services/audio/AudioStateMachine';
import { AudioFSMState, ScaleDegree, TrialEvaluation } from '../services/audio/types';
import { DiatonicMode, PitchClass } from '../services/theory/types';
import { ModalShiftEngine } from '../services/theory/ModalShiftEngine';
import { BayesianKnowledgeTracingEngine } from '../services/intelligence/BayesianKnowledgeTracing';
import { ContextualFeedbackEngine } from '../services/intelligence/ContextualFeedbackEngine';
import { HubTagMasteryVault } from '../services/intelligence/HubTagMasteryVault';
import { LocalTelemetryStore } from '../services/intelligence/LocalTelemetryStore';
import { PostLevelDiagnosticReport, TrialObservation } from '../services/intelligence/types';
import { LeverLadderEngine } from '../services/modes/LeverLadderEngine';
import { PracticeSanctuaryEngine } from '../services/modes/PracticeSanctuaryEngine';
import { LeverLadderNode } from '../services/modes/types';
import { BardicJourneyEngine } from '../services/gamification/BardicJourneyEngine';
import { HarpGarageEngine } from '../services/gamification/HarpGarageEngine';
import { JourneyNode } from '../services/gamification/types';
import { SocialCirclesEngine } from '../services/social/SocialCirclesEngine';

// New UI Architecture Components
import { LiquidGlassTabBar, TabKey } from '../components/navigation/LiquidGlassTabBar';
import { HomeHeroHarp } from '../components/home/HomeHeroHarp';
import { TopHeaderBar } from '../components/home/TopHeaderBar';
import { RoadmapModal } from '../components/home/RoadmapModal';
import { ChordsTabScreen } from '../components/tabs/ChordsTabScreen';
import { LeversTabScreen } from '../components/tabs/LeversTabScreen';
import { ProfileTabScreen } from '../components/tabs/ProfileTabScreen';
import { DeviceFramePreview } from '../components/preview/DeviceFramePreview';
import { InGamePlayScreen } from '../components/game/InGamePlayScreen';
import { PracticeReminderModal } from '../components/notifications/PracticeReminderModal';
import { PracticeReminderService } from '../services/notifications/PracticeReminderService';
import { AppLoadingScreen } from '../components/loading/AppLoadingScreen';
import {
  LevelDefinition,
  SINGLE_NOTE_LEVELS,
  MELODY_LEVELS,
} from '../services/curriculum/curriculumData';

const DIATONIC_DEGREES: ScaleDegree[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

type ScreenViewMode = 'HUB' | 'MINI_GAME' | 'HARP_STUDIO' | 'IN_GAME';

function degreeToStringNumber(deg: ScaleDegree): number {
  const map: Record<ScaleDegree, number> = {
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

export default function EarpaMasterScreen() {
  const accountDb = UserAccountDatabase.getInstance();
  const [profile, setProfile] = useState(accountDb.getActiveProfile());
  useEffect(() => accountDb.subscribe(() => setProfile({...accountDb.getActiveProfile()})), []);
  // Primary Navigation View State: Out-of-Game Hub vs In-Game Mini-Game vs 3D Studio
  const [viewMode, setViewMode] = useState<ScreenViewMode>('HUB');
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Theory & Lever State
  const [activeRootPc, setActiveRootPc] = useState<PitchClass>(3); // Eb Major default
  const [activeMode, setActiveMode] = useState<DiatonicMode>('ionian');

  // Audio & FSM State
  const [fsmState, setFsmState] = useState<AudioFSMState>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Tap Start Round to hear the I - IV - V - I cadence & mystery note'
  );
  const [activeWalkText, setActiveWalkText] = useState<string>('');
  const [streak, setStreak] = useState<number>(1);
  const [previousStreak, setPreviousStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalTrials, setTotalTrials] = useState<number>(0);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [isHarpLoaded, setIsHarpLoaded] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && (window as any).__earpa_harpReady) {
      return true;
    }
    return false;
  });

  // Periodic check for Daily Practice Reminder (18:00 to 19:00 evening window in local timezone)
  useEffect(() => {
    PracticeReminderService.checkAndDispatchDailyReminder();
    const reminderInterval = setInterval(() => {
      PracticeReminderService.checkAndDispatchDailyReminder();
    }, 60000);
    return () => clearInterval(reminderInterval);
  }, []);

  // Active Trial State
  const [stimulusDegree, setStimulusDegree] = useState<ScaleDegree | null>(null);
  const [guessedDegree, setGuessedDegree] = useState<ScaleDegree | null>(null);
  const [correctDegree, setCorrectDegree] = useState<ScaleDegree | null>(null);

  // Modals
  const [showRoadmapModal, setShowRoadmapModal] = useState<boolean>(false);
  const [roadmapTheme, setRoadmapTheme] = useState<'single' | 'melody' | 'levers'>('single');
  const [diagnosticVisible, setDiagnosticVisible] = useState<boolean>(false);
  const [diagnosticReport, setDiagnosticReport] = useState<PostLevelDiagnosticReport | null>(null);
  const [showSanctuaryModal, setShowSanctuaryModal] = useState<boolean>(false);
  const [showLadderScreen, setShowLadderScreen] = useState<boolean>(false);
  const [showJourneyScreen, setShowJourneyScreen] = useState<boolean>(false);
  const [showGarageModal, setShowGarageModal] = useState<boolean>(false);
  const [showSocialModal, setShowSocialModal] = useState<boolean>(false);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [activeJourneyNode, setActiveJourneyNode] = useState<JourneyNode | null>(null);

  // Curriculum Progression State (1 to 68)
  const [userProgressionLevel, setUserProgressionLevel] = useState<number>(1);
  const [activeCurriculumLevel, setActiveCurriculumLevel] = useState<LevelDefinition>(SINGLE_NOTE_LEVELS[0]);

  useEffect(() => { setUserProgressionLevel(activeTab === 'levers' ? (profile.leverStage || 0)+1 : profile.progress?.[activeTab === 'chords' ? 'melody' : 'single'] || 1); }, [profile.id, profile.progress, profile.leverStage, activeTab]);

  const handleLaunchInGame = (track?: 'single' | 'melody') => {
    const isMelody = track ? track === 'melody' : activeTab === 'chords';
    const list = isMelody ? MELODY_LEVELS : SINGLE_NOTE_LEVELS;
    const currentDef = list[(profile.progress?.[isMelody ? 'melody' : 'single'] || 1) - 1] || list[0];
    setActiveCurriculumLevel(currentDef);
    setViewMode('IN_GAME');
  };

  const handleOpenRoadmapWithTheme = (theme: 'single' | 'melody' | 'levers') => {
    setRoadmapTheme(theme);
    setShowRoadmapModal(true);
  };

  // Engine Refs
  const canvasRef = useRef<CelticHarpCanvasRef | null>(null);
  const synthRef = useRef<HarpSoundSynthesizer>(new HarpSoundSynthesizer('celtic_nylon'));
  const fsmRef = useRef<AudioStateMachine | null>(null);
  const bktRef = useRef<BayesianKnowledgeTracingEngine>(new BayesianKnowledgeTracingEngine());
  const feedbackEngineRef = useRef<ContextualFeedbackEngine>(new ContextualFeedbackEngine());
  const vaultRef = useRef<HubTagMasteryVault>(new HubTagMasteryVault());
  const storeRef = useRef<LocalTelemetryStore>(new LocalTelemetryStore());
  const ladderEngineRef = useRef<LeverLadderEngine>(new LeverLadderEngine());
  const sanctuaryEngineRef = useRef<PracticeSanctuaryEngine>(new PracticeSanctuaryEngine(3));
  const journeyEngineRef = useRef<BardicJourneyEngine>(new BardicJourneyEngine());
  const garageEngineRef = useRef<HarpGarageEngine>(new HarpGarageEngine());
  const socialEngineRef = useRef<SocialCirclesEngine>(new SocialCirclesEngine());

  useEffect(() => {
    const synth = synthRef.current;
    const cadenceEngine = new CadenceEngine();
    const resolutionWalker = new ResolutionWalker();
    const fsm = new AudioStateMachine(synth, cadenceEngine, resolutionWalker);

    fsm.setCallbacks({
      onStateChange: (newState) => {
        setFsmState(newState);
        switch (newState) {
          case 'IDLE':
            setStatusMessage('Ready. Tap Start Round to anchor the key.');
            break;
          case 'PLAYING_CADENCE':
            setStatusMessage('Playing Cadence (I - IV - V - I)...');
            break;
          case 'PRE_STIMULUS_SILENCE':
            setStatusMessage('Listening space...');
            break;
          case 'PRESENTING_STIMULUS':
            setStatusMessage('Mystery string plucked! Feel its gravitational pull...');
            break;
          case 'AWAITING_INPUT':
            setStatusMessage('Which scale degree (1 - 8) did you hear?');
            break;
          case 'RESOLUTION_WALKDOWN':
            setStatusMessage('Plucking stepwise resolution back to Tonic...');
            break;
          case 'COMPLETED':
            setStatusMessage('Resolved! Tap Next Note or test Resolve Up / Down.');
            break;
        }
      },
      onCadenceChordPlay: (chordIndex, romanNumeral) => {
        canvasRef.current?.triggerCadencePulse();
        setStatusMessage(`Cadence: ${romanNumeral} chord (${chordIndex + 1}/4)`);
      },
      onStimulusPlayed: () => { /* Keep the mystery note strictly auditory. */ },
      onStepwiseNotePlayed: (degree) => {
        const strNum = degreeToStringNumber(degree);
        canvasRef.current?.triggerLightStrike(strNum);
        const solf = ResolutionWalker.getSolfege(degree);
        setActiveWalkText(`Plucking String ${strNum} (${degree} • ${solf})`);
      },
      onTrialEvaluated: (evalData: TrialEvaluation) => {
        handleEvaluation(evalData);
      },
    });

    fsmRef.current = fsm;
  }, [activeRootPc, activeMode]);

  const rootMidi = 60 + activeRootPc;

  const handleStartTrial = async () => {
    if (!fsmRef.current) return;
    setGuessedDegree(null);
    setCorrectDegree(null);
    setActiveWalkText('');

    const activePool = activeJourneyNode ? activeJourneyNode.stimulusPool : DIATONIC_DEGREES;
    const nextTrialIndex = totalTrials;
    const selectedDegree = bktRef.current.selectNextStimulusDegree(activePool, nextTrialIndex).selectedDegree;
    setStimulusDegree(selectedDegree);

    await fsmRef.current.startTrial(selectedDegree, rootMidi, 0);
  };

  const handleRepeatMysteryNote = async () => {
    const target = stimulusDegree || correctDegree || '1';
    await synthRef.current.initAudio();
    const semitones = ResolutionWalker.getSemitones(target);
    const freq = CadenceEngine.midiToFreq(rootMidi + semitones);
    const strNum = degreeToStringNumber(target);
    canvasRef.current?.triggerLightStrike(strNum);
    synthRef.current.playPluck(freq, 1800, 0.92);
  };

  const handleExplicitResolve = async (direction: 'down' | 'up') => {
    if (!fsmRef.current) return;
    const target = stimulusDegree || correctDegree || '4';
    await synthRef.current.initAudio();

    const dirLabel = direction === 'down' ? 'DOWN to 1 (Do)' : 'UP to 8 (Do)';
    setStatusMessage(`Resolving ${target} stepwise ${dirLabel}...`);

    fsmRef.current.playCustomResolution(
      target,
      direction,
      (stepDeg) => {
        const strNum = degreeToStringNumber(stepDeg);
        canvasRef.current?.triggerLightStrike(strNum);
        setActiveWalkText(
          `Stepwise ${direction.toUpperCase()}: String ${strNum} (${stepDeg} • ${ResolutionWalker.getSolfege(stepDeg)})`
        );
      },
      () => {
        setStatusMessage(`Resolved ${target} ${dirLabel}.`);
      }
    );
  };

  const handleDirectStringPluck = async (degNum: number) => {
    await synthRef.current.initAudio();
    const deg = String(Math.max(1, Math.min(8, degNum))) as ScaleDegree;
    const semitones = ResolutionWalker.getSemitones(deg);
    const freq = CadenceEngine.midiToFreq(rootMidi + semitones);
    synthRef.current.playPluck(freq, 2100, 0.92);
    setActiveWalkText(`Plucked String ${degNum} (${deg} • ${ResolutionWalker.getSolfege(deg)})`);
  };

  const handleSelectDegree = (degree: ScaleDegree) => {
    if (!fsmRef.current || fsmState !== 'AWAITING_INPUT') return;
    setGuessedDegree(degree);
    fsmRef.current.submitGuess(degree);
  };

  const handleEvaluation = (evalData: TrialEvaluation) => {
    setCorrectDegree(evalData.stimulusDegree);
    const newTotal = totalTrials + 1;
    setTotalTrials(newTotal);

    const newCorrect = evalData.isCorrect ? correctCount + 1 : correctCount;
    if (evalData.isCorrect) setCorrectCount(newCorrect);

    const nextStreak = evalData.isCorrect ? streak + 1 : 0;
    setPreviousStreak(streak);
    setStreak(nextStreak);

    const obs: TrialObservation = {
      trialIndex: newTotal,
      timestamp: Date.now(),
      stimulusDegree: evalData.stimulusDegree,
      guessedDegree: evalData.guessedDegree,
      isCorrect: evalData.isCorrect,
      latencyMs: evalData.responseLatencyMs,
      mode: activeMode,
      stimulusMidi: rootMidi + ResolutionWalker.getSemitones(evalData.stimulusDegree),
      guessedMidi: rootMidi + ResolutionWalker.getSemitones(evalData.guessedDegree),
      isMotorSlip: false,
      activeLeversCount: 0,
      rootPitchClass: activeRootPc,
    };
    storeRef.current.recordTrial(obs);
    bktRef.current.recordTrial(obs);
    journeyEngineRef.current.calculateTrialXp(evalData.isCorrect, nextStreak, evalData.responseLatencyMs);

    const allObs = storeRef.current.getObservations();
    const newlyUnlockedTags = vaultRef.current.evaluateObservations(allObs);

    const feedbackItem = feedbackEngineRef.current.generateFeedback({
      activeMode, sessionTrialCount:newTotal, sessionAccuracy:newCorrect/newTotal,
      stimulusDegree: evalData.stimulusDegree,
      guessedDegree: evalData.guessedDegree,
      isCorrect: evalData.isCorrect,
      latencyMs: evalData.responseLatencyMs,
      currentStreak: nextStreak,
      previousStreak: streak,
    });

    setActiveWalkText(feedbackItem.text);

    if (newTotal > 0 && newTotal % 10 === 0) {
      const count = allObs.length;
      const correct = allObs.filter((o) => o.isCorrect).length;
      const acc = correct / count;
      const masteries = bktRef.current.getAllMasteries();
      const sortedDegrees = Object.entries(masteries).sort((a, b) => b[1] - a[1]);

      const report: PostLevelDiagnosticReport = {
        levelId: activeJourneyNode ? activeJourneyNode.title : 'Level 1: The Tonic Anchor',
        totalTrials: count,
        accuracy: acc,
        passedGate: acc >= 0.9,
        xpEarned: correct * 15 + Math.round(acc * 100),
        averageLatencyMs: allObs.reduce((s, o) => s + o.latencyMs, 0) / count,
        fastestLatencyMs: Math.min(...allObs.map((o) => o.latencyMs)),
        strongestDegrees: sortedDegrees.slice(0, 3).map((e) => e[0] as ScaleDegree),
        weakestDegrees: sortedDegrees.slice(-3).reverse().map((e) => e[0] as ScaleDegree),
        unlockedTags: newlyUnlockedTags,
        contextualFeedback: feedbackItem.text,
      };
      setDiagnosticReport(report);
      setDiagnosticVisible(true);
    }
  };

  const handleScaleChange = (rootPc: PitchClass, mode: DiatonicMode) => {
    setActiveRootPc(rootPc);
    setActiveMode(mode);
    canvasRef.current?.applyMode(rootPc, mode);
    sanctuaryEngineRef.current.updateKey(rootPc);
  };

  const handleSelectLadderNode = (node: LeverLadderNode) => {
    handleScaleChange(node.rootPitchClass, node.mode);
    setShowLadderScreen(false);
    setViewMode('MINI_GAME');
  };

  const handleSelectJourneyNode = (node: JourneyNode) => {
    setActiveJourneyNode(node);
    handleScaleChange(node.rootPitchClass, node.mode);
    setShowJourneyScreen(false);
    setShowRoadmapModal(false);
    setViewMode('MINI_GAME');
  };

  const accuracyPct = totalTrials > 0 ? Math.round((correctCount / totalTrials) * 100) : 100;
  const progression = journeyEngineRef.current.getUserProgression();
  const modalDef = ModalShiftEngine.getModalDefinition(activeRootPc, activeMode);

  // =========================================================================
  // VIEW 1: MASTER OUT-OF-GAME MOBILE HUB (With Hybrid Tab Bar & Hero 3D Harp)
  // =========================================================================
  if (!profile.onboardingComplete && profile.id === 'usr_default_bard') {
    return (
      <DeviceFramePreview>
        <SafeAreaView style={styles.hubSafeRoot}>
          <WelcomeProfile onDone={() => setProfile({ ...accountDb.getActiveProfile() })} />
          {isAppLoading && (
            <AppLoadingScreen
              isAppReady={true}
              onLoaded={() => setIsAppLoading(false)}
              minDurationMs={1400}
            />
          )}
        </SafeAreaView>
      </DeviceFramePreview>
    );
  }

  if (viewMode === 'HUB') {
    return (
      <DeviceFramePreview>
        <SafeAreaView style={styles.hubSafeRoot}>
          {/* Authentic Full-Bleed Realm Sanctuary Photo (User Flow Masterpiece) */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <img
              src={
                activeTab === 'chords'
                  ? '/images/arctic_celtic_sanctuary.jpg'
                  : activeTab === 'levers'
                  ? '/images/desert_celtic_sanctuary.jpg'
                  : activeTab === 'profile'
                  ? '/images/earpa_journey_bg.jpg'
                  : '/images/irish_celtic_sanctuary.jpg'
              }
              alt="Ancient Realm Sanctuary"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                pointerEvents: 'none',
              }}
            />
            {/* Gentle Cinematic Vignette for Edge Depth / Polarized Sunglasses Black Gradient Tint on Journey */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background:
                  activeTab === 'profile'
                    ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.28) 40%, rgba(0, 0, 0, 0.65) 100%)'
                    : 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(6, 12, 8, 0.32) 100%)',
                pointerEvents: 'none',
              }}
            />
          </View>

          {/* Top Header Bar with Prominent Stage Roadmap, Mini-Map Trail & XP Progress */}
          <TopHeaderBar
            activeTab={activeTab}
            levelNumber={userProgressionLevel}
            streakCount={accountDb.getPedagogicalInsights().currentStreakDays}
            currentXp={profile.totalTrialsAttempted * 10}
            nextMilestoneXp={500}
            onOpenRoadmap={(theme) => handleOpenRoadmapWithTheme(theme || 'single')}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenSocial={() => setShowSocialModal(true)}
            onOpenReminders={() => setShowReminderModal(true)}
          />

          {/* Active Tab View Body: Identical Hero 3D Harp & Pedestal across Single, Melody, and Levers */}
          <View style={styles.tabContentContainer}>
            {activeTab === 'home' && (
              <View style={styles.homeTabStatic}>
                <HomeHeroHarp
                  onPressPlay={() => handleLaunchInGame('single')}
                  onStringPlucked={handleDirectStringPluck}
                  onOpenRoadmap={() => handleOpenRoadmapWithTheme('single')}
                  onModelLoaded={() => setIsHarpLoaded(true)}
                  streakCount={accountDb.getPedagogicalInsights().currentStreakDays}
                  currentXp={profile.totalTrialsAttempted * 10}
                  nextMilestoneXp={500}
                  levelNumber={userProgressionLevel}
                  levelTitle={SINGLE_NOTE_LEVELS[userProgressionLevel - 1]?.title || 'The Tonic Anchor'}
                  themeColor="#059669"
                  playTextColor="#fef08a"
                  runeColor="#fef08a"
                  runeGlow="0 0 10px rgba(254, 240, 138, 0.95), 0 0 20px rgba(245, 158, 11, 0.75)"
                  playButtonLabel="PRESS TO PLAY"
                />
              <LessonLibrary track="single" />
              </View>
            )}

            {activeTab === 'chords' && (
              <View style={styles.homeTabStatic}>
                <HomeHeroHarp
                  onPressPlay={() => handleLaunchInGame('melody')}
                  onStringPlucked={handleDirectStringPluck}
                  onOpenRoadmap={() => handleOpenRoadmapWithTheme('melody')}
                  onModelLoaded={() => setIsHarpLoaded(true)}
                  streakCount={accountDb.getPedagogicalInsights().currentStreakDays}
                  currentXp={180}
                  nextMilestoneXp={400}
                  levelNumber={userProgressionLevel}
                  levelTitle={MELODY_LEVELS[userProgressionLevel - 1]?.title || 'Melodic Sequence'}
                  themeColor="#0284c7"
                  playTextColor="#e0f2fe"
                  runeColor="#e0f2fe"
                  runeGlow="0 0 10px rgba(56, 189, 248, 0.95), 0 0 20px rgba(14, 165, 233, 0.8), 0 0 32px rgba(2, 132, 199, 0.55)"
                  playButtonLabel="PRESS TO PLAY"
                />
              <LessonLibrary track="melody" />
              </View>
            )}

            {activeTab === 'levers' && (
              <View style={styles.homeTabStatic}>
                <HomeHeroHarp
                  onPressPlay={() => handleLaunchInGame('single')}
                  onStringPlucked={handleDirectStringPluck}
                  onOpenRoadmap={() => handleOpenRoadmapWithTheme('levers')}
                  onModelLoaded={() => setIsHarpLoaded(true)}
                  streakCount={accountDb.getPedagogicalInsights().currentStreakDays}
                  currentXp={260}
                  nextMilestoneXp={450}
                  levelNumber={userProgressionLevel}
                  levelTitle="Lever Roadmap"
                  themeColor="#d97706"
                  playTextColor="#ffedd5"
                  runeColor="#ffedd5"
                  runeGlow="0 0 10px rgba(251, 191, 36, 0.95), 0 0 20px rgba(249, 115, 22, 0.8), 0 0 32px rgba(234, 88, 12, 0.6)"
                  playButtonLabel="PRESS TO PLAY"
                />
              <LessonLibrary track="levers" />
              </View>
            )}

            {activeTab === 'profile' && (
              <ProfileTabScreen
                levelNumber={progression.bardicLevel}
                currentXp={profile.totalTrialsAttempted*10}
                streakCount={accountDb.getPedagogicalInsights().currentStreakDays}
                accuracyPct={accuracyPct}
                totalTrials={totalTrials}
                onOpenRoadmap={(realm = 'single') => handleOpenRoadmapWithTheme(realm)}
                onOpenSocial={() => setShowSocialModal(true)}
              />
            )}
          </View>

          {/* Floating Liquid Glass Bottom Navigation Bar */}
          <LiquidGlassTabBar
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
          />

          {/* Full Screen Roadmap Modal with Realm Theme */}
          <RoadmapModal
            visible={showRoadmapModal}
            onClose={() => setShowRoadmapModal(false)}
            theme={roadmapTheme}
            onThemeChange={setRoadmapTheme}
            currentXp={profile.totalTrialsAttempted*10}
            currentLevel={roadmapTheme==='levers' ? (profile.leverStage||0)+1 : profile.progress?.[roadmapTheme]||1}
            onSelectLevelDef={(lvl) => {
              setActiveTab(roadmapTheme === 'melody' ? 'chords' : roadmapTheme === 'levers' ? 'levers' : 'home');
              setActiveCurriculumLevel(lvl);
              setShowRoadmapModal(false);
              setViewMode('IN_GAME');
            }}
            onSelectLevel={(stage, lvl) => {
              setActiveTab(roadmapTheme === 'melody' ? 'chords' : roadmapTheme === 'levers' ? 'levers' : 'home');
              const list = roadmapTheme === 'melody' ? MELODY_LEVELS : SINGLE_NOTE_LEVELS;
              const globalIdx = (stage - 1) * 10 + (lvl - 1);
              if (list[globalIdx]) {
                setActiveCurriculumLevel(list[globalIdx]);
              }
              setShowRoadmapModal(false);
              setViewMode('IN_GAME');
            }}
          />

          {/* Auxiliary Modals */}
          <PracticeSanctuaryModal
            visible={showSanctuaryModal}
            onClose={() => setShowSanctuaryModal(false)}
            sanctuaryEngine={sanctuaryEngineRef.current}
            onSelectKey={(root) => handleScaleChange(root, 'ionian')}
          />
          <Modal visible={showLadderScreen} animationType="slide">
            <LeverLadderScreen
              ladderEngine={ladderEngineRef.current}
              onSelectNode={handleSelectLadderNode}
              onClose={() => setShowLadderScreen(false)}
            />
          </Modal>
          <Modal visible={showJourneyScreen} animationType="slide">
            <BardicJourneyScreen
              journeyEngine={journeyEngineRef.current}
              onSelectNode={handleSelectJourneyNode}
              onClose={() => setShowJourneyScreen(false)}
            />
          </Modal>
          <HarpGarageModal
            visible={showGarageModal}
            onClose={() => setShowGarageModal(false)}
            garageEngine={garageEngineRef.current}
            onApplyCosmetic={() => {}}
          />
          <SocialCirclesModal
            visible={showSocialModal}
            onClose={() => setShowSocialModal(false)}
            socialEngine={socialEngineRef.current}
            currentUserStreak={streak}
            currentUserTrials={totalTrials}
          />
          <PracticeReminderModal
            visible={showReminderModal}
            onClose={() => setShowReminderModal(false)}
          />

          {/* Smooth Zero-Black-Screen Cold Boot Loading Overlay */}
          {isAppLoading && (
            <AppLoadingScreen
              isAppReady={isHarpLoaded}
              onLoaded={() => setIsAppLoading(false)}
              minDurationMs={1600}
            />
          )}
        </SafeAreaView>
      </DeviceFramePreview>
    );
  }

  // =========================================================================
  // VIEW: DEDICATED IN-GAME EXPERIENCE SCREEN (Dark Minimalist Realm, 9° Fixed Harp)
  // =========================================================================
  if (viewMode === 'IN_GAME') {
    const realmKey = activeTab === 'chords' ? 'melody' : activeTab === 'levers' ? 'levers' : 'single';
    return (
      <DeviceFramePreview>
        <SafeAreaView style={styles.safeArea}>
          {realmKey === 'levers' ? <LeverTrainingScreen initialStage={activeCurriculumLevel.id.startsWith('lever_') ? activeCurriculumLevel.levelNumber-1 : undefined} onBackToHome={() => setViewMode('HUB')} /> : <InGamePlayScreen
            realm={realmKey}
            level={activeCurriculumLevel}
            onBackToHome={() => setViewMode('HUB')}
            onCompleteSession={(score, total, passed) => {
              setCorrectCount((prev) => prev + score);
              setTotalTrials((prev) => prev + total);
              if (passed) {
                setUserProgressionLevel((prev) => prev + 1);
              }
            }}
            onNextLevel={(nextLvl) => {
              setActiveCurriculumLevel(nextLvl);
              setUserProgressionLevel((prev) => Math.max(prev, nextLvl.levelNumber));
            }}
            onOpenProfileInsights={() => {
              setViewMode('HUB');
              setActiveTab('profile');
            }}
          />}
        </SafeAreaView>
      </DeviceFramePreview>
    );
  }

  // =========================================================================
  // VIEW 2: FULL-SCREEN 3D HARP & LEVERS LUTHERIE STUDIO
  // =========================================================================
  if (viewMode === 'HARP_STUDIO') {
    return (
      <DeviceFramePreview>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.gameContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.gameTopBar}>
              <TouchableOpacity onPress={() => setViewMode('HUB')} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Main Hub</Text>
              </TouchableOpacity>
              <Text style={styles.gameHeaderTitle}>3D Harp Studio</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (typeof window !== 'undefined') {
                      window.open('/viewer.html', '_blank');
                    }
                  }}
                  style={[styles.switchGameBtn, { backgroundColor: '#2563eb' }]}
                >
                  <Text style={styles.switchGameBtnText}>100% View ↗</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('MINI_GAME')} style={styles.switchGameBtn}>
                  <Text style={styles.switchGameBtnText}>Play Game ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.studioHelpBanner}>
              Drag to rotate 360° • Tap any string to pluck • Tap levers below to flip UP/DOWN
            </Text>

            <CelticHarpCanvas
              ref={canvasRef}
              style={styles.studioHarpCanvas}
              onStringPlucked={handleDirectStringPluck}
              interactiveControls={true}
            />

            {activeWalkText ? (
              <View style={styles.walkPill}>
                <Text style={styles.walkPillText}>{activeWalkText}</Text>
              </View>
            ) : null}

            <LeverControlPanel
              activeRootPitchClass={activeRootPc}
              activeMode={activeMode}
              onSelectScale={handleScaleChange}
            />
          </ScrollView>
        </SafeAreaView>
      </DeviceFramePreview>
    );
  }

  // =========================================================================
  // VIEW 3: FOCUSED IN-GAME MINI-GAME ARENA (Cadence, 3D Harp, Up/Down Resolution)
  // =========================================================================
  return (
    <DeviceFramePreview>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.gameContainer} showsVerticalScrollIndicator={false}>
          {/* In-Game Top Bar */}
          <View style={styles.gameTopBar}>
            <TouchableOpacity onPress={() => setViewMode('HUB')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Hub</Text>
            </TouchableOpacity>
            <View style={styles.gameTitleCenter}>
              <Text style={styles.gameHeaderTitle}>
                {activeJourneyNode ? activeJourneyNode.title : `${modalDef.rootName} ${modalDef.mode}`}
              </Text>
              <Text style={styles.gameHeaderSub}>
                Trial {totalTrials + 1} • Streak {streak} • {accuracyPct}%
              </Text>
            </View>
            <TouchableOpacity onPress={() => setViewMode('HARP_STUDIO')} style={styles.switchGameBtn}>
              <Text style={styles.switchGameBtnText}>3D Zoom</Text>
            </TouchableOpacity>
          </View>

          {/* Focused 3D 8-String Celtic Harp Stage */}
          <CelticHarpCanvas
            ref={canvasRef}
            style={styles.miniGameHarpCanvas}
            onStringPlucked={handleDirectStringPluck}
            interactiveControls={true}
          />

          {/* Status & Active Pluck Walkdown Indicator */}
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>{statusMessage}</Text>
            {activeWalkText ? <Text style={styles.walkSubText}>{activeWalkText}</Text> : null}
          </View>

          {/* Primary Cadence & Bidirectional Pluck Resolution Controls */}
          <View style={styles.actionControlsWrap}>
            <View style={styles.primaryRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={fsmState === 'PLAYING_CADENCE' || fsmState === 'RESOLUTION_WALKDOWN'}
                onPress={handleStartTrial}
                style={[
                  styles.startCadenceBtn,
                  (fsmState === 'PLAYING_CADENCE' || fsmState === 'RESOLUTION_WALKDOWN') &&
                    styles.btnDisabled,
                ]}
              >
                <Text style={styles.startCadenceBtnText}>
                  {fsmState === 'AWAITING_INPUT'
                    ? '↻ Replay Cadence & Note'
                    : fsmState === 'COMPLETED'
                    ? '▶ Next Challenge Note'
                    : '▶ Play Cadence & Mystery Note'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRepeatMysteryNote}
                style={styles.repeatNoteBtn}
              >
                <Text style={styles.repeatNoteBtnText}>Pluck Note</Text>
              </TouchableOpacity>
            </View>

            {/* Explicit Alain Benbassat Pluck DOWN (to 1) vs Pluck UP (to 8) Buttons */}
            <View style={styles.resolutionDirectionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleExplicitResolve('down')}
                style={styles.resolveDirBtn}
              >
                <Text style={styles.resolveDirArrow}>▼</Text>
                <View>
                  <Text style={styles.resolveDirTitle}>Resolve DOWN to 1</Text>
                  <Text style={styles.resolveDirSub}>Stepwise walkdown to Do</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleExplicitResolve('up')}
                style={styles.resolveDirBtn}
              >
                <Text style={styles.resolveDirArrow}>▲</Text>
                <View>
                  <Text style={styles.resolveDirTitle}>Resolve UP to 8</Text>
                  <Text style={styles.resolveDirSub}>Stepwise walkup to High Do</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clean 8-Degree Single-Octave Input Shelf */}
          <DegreeTouchShelf
            onSelectDegree={handleSelectDegree}
            disabled={fsmState !== 'AWAITING_INPUT'}
            correctDegree={correctDegree}
            guessedDegree={guessedDegree}
          />
        </ScrollView>

        <PostLevelDiagnosticModal
          visible={diagnosticVisible}
          report={diagnosticReport}
          onContinue={() => setDiagnosticVisible(false)}
          onRetry={() => setDiagnosticVisible(false)}
          onOpenSanctuary={() => {
            setDiagnosticVisible(false);
            setShowSanctuaryModal(true);
          }}
        />
      </SafeAreaView>
    </DeviceFramePreview>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  hubSafeRoot: {
    flex: 1,
    backgroundColor: '#090d16',
    position: 'relative',
    overflow: 'hidden',
  },
  tabContentContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  homeTabStatic: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  featureCardIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  featureCardTextWrap: {
    flex: 1,
  },
  featureCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featureCardSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  featureCardArrow: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 6,
  },
  gameContainer: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 32,
  },
  gameTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#172030',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  gameTitleCenter: {
    alignItems: 'center',
  },
  gameHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  gameHeaderSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38bdf8',
    marginTop: 1,
  },
  switchGameBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  switchGameBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
  },
  miniGameHarpCanvas: {
    height: 340,
    marginBottom: 8,
  },
  studioHarpCanvas: {
    height: 440,
    marginBottom: 10,
  },
  studioHelpBanner: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  walkPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    marginBottom: 10,
    alignItems: 'center',
  },
  walkPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38bdf8',
  },
  statusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#131b29',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  walkSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38bdf8',
    marginTop: 3,
  },
  actionControlsWrap: {
    gap: 8,
    marginBottom: 10,
  },
  primaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  startCadenceBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  startCadenceBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#090d16',
  },
  repeatNoteBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  repeatNoteBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
  },
  resolutionDirectionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resolveDirBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151e2e',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.28)',
    gap: 10,
  },
  resolveDirArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#60a5fa',
  },
  resolveDirTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
  },
  resolveDirSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94a3b8',
  },
});
