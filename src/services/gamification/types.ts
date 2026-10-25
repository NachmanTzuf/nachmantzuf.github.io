/**
 * EARPA BARDIC JOURNEY & HARP GARAGE TYPES
 * 36-node curriculum across 6 stages, XP economy, combo multipliers,
 * and 3D Harp Garage cosmetic unlock definitions.
 */

import { ScaleDegree } from '../audio/types';
import { DiatonicMode, PitchClass } from '../theory/types';

export type JourneyStageId = 1 | 2 | 3 | 4 | 5 | 6;

export interface JourneyNode {
  nodeId: string; // e.g. "NODE_1_1" to "NODE_6_6"
  stageId: JourneyStageId;
  stageNodeIndex: number; // 1 to 6
  title: string;
  subtitle: string;
  pedagogicalFocus: string;
  rootPitchClass: PitchClass;
  mode: DiatonicMode;
  stimulusPool: ScaleDegree[];
  requiredTrials: number;
  targetAccuracy: number; // 0.90 standard
  isUnlocked: boolean;
  isCompleted: boolean;
  starsEarned: 0 | 1 | 2 | 3;
  highScore: number;
}

export type TimberFinishId =
  | 'curly_maple'
  | 'claddagh_walnut'
  | 'emerald_ebony'
  | 'connemara_bogoak'
  | 'skye_yew';

export type SoundboardRosetteId =
  | 'triskele_tara'
  | 'knotwork_vine'
  | 'claddagh_heart'
  | 'ogham_whisper'
  | 'high_king_sunburst';

export type ResonanceStringShaderId =
  | 'silver_shimmer'
  | 'druidic_emerald'
  | 'solar_flare_brass'
  | 'aurora_wave'
  | 'starlight_phosphor';

export interface CosmeticItem<T> {
  id: T;
  name: string;
  category: 'TIMBER' | 'ROSETTE' | 'STRINGS';
  lore: string;
  unlockRequirement: string;
  isUnlocked: boolean;
  colorHex: string;
  roughness: number;
  metalness: number;
}

export interface UserProgressionState {
  totalXp: number;
  bardicLevel: number; // Level = Math.floor(sqrt(totalXp / 50)) + 1
  currentDailyStreak: number;
  bestDailyStreak: number;
  completedNodeIds: string[];
  equippedTimber: TimberFinishId;
  equippedRosette: SoundboardRosetteId;
  equippedStrings: ResonanceStringShaderId;
}
