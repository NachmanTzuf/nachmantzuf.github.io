/**
 * EARPA GAME MODES & LEVER LADDER TYPES
 * 4-Tier Progressive Lever Ladder, Open Practice Sanctuary sandbox,
 * continuous drone generator, and timed Session Lever Rush.
 */

import { ScaleDegree } from '../audio/types';
import { DiatonicMode, PitchClass, PhysicalHarpLevers } from '../theory/types';

export type GameModeId =
  | 'BARDIC_JOURNEY'
  | 'LEVER_LADDER'
  | 'PRACTICE_SANCTUARY'
  | 'SESSION_LEVER_RUSH';

export type LeverLadderTier = 1 | 2 | 3 | 4;

export interface LeverLadderNode {
  nodeId: string;
  tier: LeverLadderTier;
  title: string;
  subtitle: string;
  rootPitchClass: PitchClass;
  mode: DiatonicMode;
  targetAccuracy: number; // 0.90 standard
  timeLimitSec?: number; // For Tier 4 Timed Rush
  tuneContextName?: string; // For Tier 3 Celtic tune context
  isUnlocked: boolean;
  highScore: number;
  starsEarned: 0 | 1 | 2 | 3;
}

export interface SessionLeverRushState {
  isActive: boolean;
  timeRemainingSec: number;
  currentScore: number;
  comboStreak: number;
  scoreMultiplier: number; // 1.0x to 3.0x
  targetModulationKey: string;
  targetLevers: PhysicalHarpLevers;
  requiredFlipsCount: number;
}

export interface PracticeSanctuaryConfig {
  rootPitchClass: PitchClass;
  mode: DiatonicMode;
  droneActive: boolean;
  droneVolume: number; // 0.0 to 1.0
  cadenceBpm: number;
  freePluckAudible: boolean;
  activeStimulusPool: ScaleDegree[];
}
