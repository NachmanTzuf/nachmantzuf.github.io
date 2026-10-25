/**
 * EARPA MATHEMATICAL MUSIC THEORY & LEVER SOLVER TYPES
 * Formal mathematical types grounded in Modulo-12 / Modulo-7 diatonic group theory
 * and Track R3 specifications.
 */

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export type DiatonicMode =
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

export type LeverPosition = 0 | 1; // 0 = Down (Open Flat/Natural), 1 = Up (Sharped/Raised 1 semitone)

/**
 * 7 physical lever states mapped to note letters [C, D, E, F, G, A, B].
 * In Open Eb Major tuning:
 * - C: 0 = C natural, 1 = C#
 * - D: 0 = D natural, 1 = D#
 * - E: 0 = Eb, 1 = E natural
 * - F: 0 = F natural, 1 = F#
 * - G: 0 = G natural, 1 = G#
 * - A: 0 = Ab, 1 = A natural
 * - B: 0 = Bb, 1 = B natural
 */
export interface PhysicalHarpLevers {
  C: LeverPosition;
  D: LeverPosition;
  E: LeverPosition;
  F: LeverPosition;
  G: LeverPosition;
  A: LeverPosition;
  B: LeverPosition;
}

export interface ModalDefinition {
  rootName: string;
  rootPitchClass: PitchClass;
  mode: DiatonicMode;
  parentKeyIndex: number; // 0 to 7 representing accessible keys on open Eb harp
  parentMajorKey: string;
  isAccessibleOnEbHarp: boolean;
  inaccessibilityReason?: string;
  notes: string[];
  levers: PhysicalHarpLevers;
  fifthsPrefixCount: number; // 0 to 7 levers raised in order (A, E, B, F, C, G, D)
}

export interface LeverDeltaAction {
  letter: NoteLetter;
  from: LeverPosition;
  to: LeverPosition;
  direction: 'UP' | 'DOWN';
  pitchChangeDescription: string;
}

export interface LeverDeltaResult {
  fromKey: string;
  toKey: string;
  totalFlips: number;
  actions: LeverDeltaAction[];
  isDirectlyAccessible: boolean;
  summaryText: string;
}

export interface CelticTune {
  title: string;
  tonic: string;
  mode: DiatonicMode;
  type: 'reel' | 'jig' | 'hornpipe' | 'slip_jig' | 'air';
}

export interface MedleyOptimizationResult {
  originalOrder: CelticTune[];
  optimizedOrder: CelticTune[];
  originalTotalFlips: number;
  optimizedTotalFlips: number;
  flipsSaved: number;
  transitions: LeverDeltaResult[];
}
