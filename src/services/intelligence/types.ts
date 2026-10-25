/**
 * EARPA ADAPTIVE INTELLIGENCE & TELEMETRY TYPES
 * Auditory Bayesian Knowledge Tracing (A-BKT), continuous Elo latent ratings,
 * directed confusion matrices, and Hub Tag Mastery Vault taxonomy.
 */

import { ScaleDegree } from '../audio/types';
import { DiatonicMode, PitchClass } from '../theory/types';

export interface ScaleDegreeBKTParams {
  pL0: number; // Prior mastery probability
  pT: number;  // Transition probability per trial
  pS: number;  // Total slip probability (motor + auditory)
  pG: number;  // Guess probability
  stabilityHalfLifeDays: number;
}

export interface DegreeMasteryState {
  degree: ScaleDegree;
  masteryProbability: number; // P(L) in [0.0, 1.0]
  trialsCount: number;
  correctCount: number;
  averageLatencyMs: number;
  lastTestedTimestamp: number;
}

export interface TrialObservation {
  trialIndex: number;
  timestamp: number;
  rootPitchClass: PitchClass;
  mode: DiatonicMode;
  stimulusDegree: ScaleDegree;
  guessedDegree: ScaleDegree;
  stimulusMidi: number;
  guessedMidi: number;
  latencyMs: number;
  isCorrect: boolean;
  isMotorSlip: boolean;
  activeLeversCount: number;
}

export interface ConfusionMatrixNode {
  stimulusDegree: ScaleDegree;
  confusions: Record<ScaleDegree, number>; // Total counts guessed for each degree
  totalPresentations: number;
  shannonEntropy: number;
}

export type HubTagCategory =
  | 'DIATONIC_FOUNDATIONS'
  | 'CELTIC_MODES'
  | 'SPEED_AND_REFLEX'
  | 'LEVER_VIRTUOSITY'
  | 'BARDIC_DEDICATION';

export interface HubTag {
  id: string;
  category: HubTagCategory;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  currentProgress: number; // 0.0 to 1.0
  masteryThreshold: number; // Target requirement (e.g. 0.90 for 90%)
  unlockedAtTimestamp?: number;
}

export interface PostLevelDiagnosticReport {
  levelId: string;
  totalTrials: number;
  accuracy: number; // 0.0 to 1.0
  passedGate: boolean; // accuracy >= 0.90
  xpEarned: number;
  averageLatencyMs: number;
  fastestLatencyMs: number;
  primaryConfusion?: {
    stimulus: ScaleDegree;
    guessed: ScaleDegree;
    count: number;
    explanation: string;
  };
  weakestDegrees: ScaleDegree[];
  strongestDegrees: ScaleDegree[];
  unlockedTags: HubTag[];
  contextualFeedback: string;
}
