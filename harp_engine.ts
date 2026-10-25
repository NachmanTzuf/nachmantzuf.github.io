/**
 * Earpa Algorithmic Engine: Mathematical Music Theory & Celtic Lever Configurations
 * 
 * Formal implementation of Diatonic Modular Arithmetic (Z7), Chromatic Pitch Class Arithmetic (Z12),
 * Modal Permutation Matrices, Lever Vector State Encoders, and Minimal Lever Delta Solvers.
 */

// ============================================================================
// 1. FUNDAMENTAL TYPE DEFINITIONS & DATA CONTRACTS
// ============================================================================

export type DiatonicLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type LeverState = 0 | 1; // 0 = DOWN (natural/flat), 1 = UP (natural/sharp)

export type DiatonicMode =
  | 'Ionian'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Aeolian'
  | 'Locrian';

export interface LeverVector {
  C: LeverState;
  D: LeverState;
  E: LeverState;
  F: LeverState;
  G: LeverState;
  A: LeverState;
  B: LeverState;
}

export interface ParentKeyInfo {
  name: string;
  fifthsIndex: number; // k in [0, 7] for accessible keys
  pitchClass: PitchClass;
  signature: string;
  sharpsCount: number;
  flatsCount: number;
  accessibleOnEb: boolean;
  inaccessibilityReason?: string;
  levers?: LeverVector;
  notes: string[];
}

export interface ModeEvaluation {
  tonic: string;
  mode: DiatonicMode;
  tonicPitchClass: PitchClass;
  parentKey: ParentKeyInfo;
  isAccessible: boolean;
  leverVector?: LeverVector;
  scaleNotes: string[];
  scalePitchClasses: PitchClass[];
}

export interface LeverFlipAction {
  string: DiatonicLetter;
  action: 'UP' | 'DOWN';
  fromPitch: string;
  toPitch: string;
  octavesAffected: string;
}

export interface TransitionDeltaPlan {
  fromKeyName: string;
  toKeyName: string;
  fromIndex: number;
  toIndex: number;
  totalFlips: number;
  flips: LeverFlipAction[];
  isZeroDelta: boolean;
}

export interface TuneDescriptor {
  id: string;
  name: string;
  tonic: string;
  mode: DiatonicMode;
  initialMeasuresPitchClasses?: PitchClass[]; // Used for Sneak-Flip calculation
}

export interface MedleyTransition {
  fromTune: string;
  toTune: string;
  deltaPlan: TransitionDeltaPlan;
  sneakFlips: DiatonicLetter[]; // Levers that can be flipped during tune entry because the note is absent in first bars
}

export interface MedleyOptimizationPlan {
  originalTuneOrder: string[];
  optimalTuneOrder: string[];
  originalTotalFlips: number;
  optimalTotalFlips: number;
  flipsSaved: number;
  transitions: MedleyTransition[];
}

// ============================================================================
// 2. MATHEMATICAL CONSTANTS & CANONICAL MAPPINGS
// ============================================================================

export const DIATONIC_LETTERS: readonly DiatonicLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

/**
 * Strict Fifths sharping sequence for Open Eb Celtic Harp:
 * Raising levers in this exact sequence steps from Eb Major (k=0) to E Major (k=7)
 */
export const HARP_SHARPING_SEQUENCE: readonly DiatonicLetter[] = ['A', 'E', 'B', 'F', 'C', 'G', 'D'] as const;

/**
 * Circle of Fourths flattening sequence (dropping levers from UP to DOWN)
 */
export const HARP_FLATTENING_SEQUENCE: readonly DiatonicLetter[] = ['D', 'G', 'C', 'F', 'B', 'E', 'A'] as const;

export const PITCH_CLASSES = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9,
  'A#': 10, Bb: 10, B: 11, Cb: 11
} as const;

/** Diatonic step intervals from Major (Ionian) tonic: [1, 2, 3, 4, 5, 6, 7] */
export const IONIAN_INTERVAL_VECTOR: readonly number[] = [0, 2, 4, 5, 7, 9, 11] as const;

export const MODE_METADATA: Record<DiatonicMode, { rotationIndex: number; semitoneOffset: number; formula: string }> = {
  Ionian:     { rotationIndex: 0, semitoneOffset: 0,  formula: '1 - 2 - 3 - 4 - 5 - 6 - 7' },
  Dorian:     { rotationIndex: 1, semitoneOffset: 2,  formula: '1 - 2 - b3 - 4 - 5 - 6 - b7' },
  Phrygian:   { rotationIndex: 2, semitoneOffset: 4,  formula: '1 - b2 - b3 - 4 - 5 - b6 - b7' },
  Lydian:     { rotationIndex: 3, semitoneOffset: 5,  formula: '1 - 2 - 3 - #4 - 5 - 6 - 7' },
  Mixolydian: { rotationIndex: 4, semitoneOffset: 7,  formula: '1 - 2 - 3 - 4 - 5 - 6 - b7' },
  Aeolian:    { rotationIndex: 5, semitoneOffset: 9,  formula: '1 - 2 - b3 - 4 - b5 - b6 - b7' },
  Locrian:    { rotationIndex: 6, semitoneOffset: 11, formula: '1 - b2 - b3 - 4 - b5 - b6 - b7' },
};

/**
 * Open Eb Harp Base String Pitch Classes (Levers DOWN = 0):
 * C(0), D(2), Eb(3), F(5), G(7), Ab(8), Bb(10)
 */
export const OPEN_EB_BASE_PITCH: Record<DiatonicLetter, { downName: string; downPc: PitchClass; upName: string; upPc: PitchClass }> = {
  C: { downName: 'C',  downPc: 0,  upName: 'C#', upPc: 1 },
  D: { downName: 'D',  downPc: 2,  upName: 'D#', upPc: 3 },
  E: { downName: 'Eb', downPc: 3,  upName: 'E',  upPc: 4 },
  F: { downName: 'F',  downPc: 5,  upName: 'F#', upPc: 6 },
  G: { downName: 'G',  downPc: 7,  upName: 'G#', upPc: 8 },
  A: { downName: 'Ab', downPc: 8,  upName: 'A',  upPc: 9 },
  B: { downName: 'Bb', downPc: 10, upName: 'B',  upPc: 11 },
};

/**
 * The 12 canonical major scale reference definitions
 */
export const MAJOR_KEYS: Record<number, ParentKeyInfo> = {
  3: {
    name: 'Eb', fifthsIndex: 0, pitchClass: 3, signature: '3 flats (Bb, Eb, Ab)', sharpsCount: 0, flatsCount: 3,
    accessibleOnEb: true, levers: { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    notes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']
  },
  10: {
    name: 'Bb', fifthsIndex: 1, pitchClass: 10, signature: '2 flats (Bb, Eb)', sharpsCount: 0, flatsCount: 2,
    accessibleOnEb: true, levers: { C: 0, D: 0, E: 0, F: 0, G: 0, A: 1, B: 0 },
    notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']
  },
  5: {
    name: 'F', fifthsIndex: 2, pitchClass: 5, signature: '1 flat (Bb)', sharpsCount: 0, flatsCount: 1,
    accessibleOnEb: true, levers: { C: 0, D: 0, E: 1, F: 0, G: 0, A: 1, B: 0 },
    notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']
  },
  0: {
    name: 'C', fifthsIndex: 3, pitchClass: 0, signature: 'Natural (0 accidentals)', sharpsCount: 0, flatsCount: 0,
    accessibleOnEb: true, levers: { C: 0, D: 0, E: 1, F: 0, G: 0, A: 1, B: 1 },
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  },
  7: {
    name: 'G', fifthsIndex: 4, pitchClass: 7, signature: '1 sharp (F#)', sharpsCount: 1, flatsCount: 0,
    accessibleOnEb: true, levers: { C: 0, D: 0, E: 1, F: 1, G: 0, A: 1, B: 1 },
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#']
  },
  2: {
    name: 'D', fifthsIndex: 5, pitchClass: 2, signature: '2 sharps (F#, C#)', sharpsCount: 2, flatsCount: 0,
    accessibleOnEb: true, levers: { C: 1, D: 0, E: 1, F: 1, G: 0, A: 1, B: 1 },
    notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']
  },
  9: {
    name: 'A', fifthsIndex: 6, pitchClass: 9, signature: '3 sharps (F#, C#, G#)', sharpsCount: 3, flatsCount: 0,
    accessibleOnEb: true, levers: { C: 1, D: 0, E: 1, F: 1, G: 1, A: 1, B: 1 },
    notes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']
  },
  4: {
    name: 'E', fifthsIndex: 7, pitchClass: 4, signature: '4 sharps (F#, C#, G#, D#)', sharpsCount: 4, flatsCount: 0,
    accessibleOnEb: true, levers: { C: 1, D: 1, E: 1, F: 1, G: 1, A: 1, B: 1 },
    notes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']
  },
  11: {
    name: 'B', fifthsIndex: -1, pitchClass: 11, signature: '5 sharps', sharpsCount: 5, flatsCount: 0,
    accessibleOnEb: false, inaccessibilityReason: 'Requires A# (String A only produces Ab or A natural)',
    notes: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']
  },
  6: {
    name: 'F#', fifthsIndex: -1, pitchClass: 6, signature: '6 sharps', sharpsCount: 6, flatsCount: 0,
    accessibleOnEb: false, inaccessibilityReason: 'Requires A# and E# (outside 1-semitone physical throw)',
    notes: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']
  },
  1: {
    name: 'Db', fifthsIndex: -1, pitchClass: 1, signature: '5 flats', sharpsCount: 0, flatsCount: 5,
    accessibleOnEb: false, inaccessibilityReason: 'Requires Db and Gb (Strings D and G are tuned natural)',
    notes: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']
  },
  8: {
    name: 'Ab', fifthsIndex: -1, pitchClass: 8, signature: '4 flats', sharpsCount: 0, flatsCount: 4,
    accessibleOnEb: false, inaccessibilityReason: 'Requires Db (String D is tuned natural, cannot produce Db)',
    notes: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']
  }
};

// ============================================================================
// 3. DIATONIC MODULAR ARITHMETIC & MODAL ROTATION ENGINE
// ============================================================================

export class DiatonicArithmetic {
  /** Modulo arithmetic ensuring strictly non-negative results */
  public static mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  /** Greatest common divisor */
  public static gcd(a: number, b: number): number {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const temp = y;
      y = x % y;
      x = temp;
    }
    return x;
  }

  /** Proves that 7 is a generator of Z12 and 4 is a generator of Z7 */
  public static verifyGenerators(): { z12Cyclic: boolean; z7Cyclic: boolean; involutionHolds: boolean } {
    const z12Cyclic = this.gcd(7, 12) === 1;
    const z7Cyclic = this.gcd(4, 7) === 1;
    // 7 * 7 = 49 = 1 mod 12
    const involutionHolds = this.mod(7 * 7, 12) === 1;
    return { z12Cyclic, z7Cyclic, involutionHolds };
  }

  /** Convert note string into canonical pitch class (0..11) */
  public static noteToPitchClass(note: string): PitchClass {
    const clean = note.trim();
    if (clean in PITCH_CLASSES) {
      return (PITCH_CLASSES as Record<string, PitchClass>)[clean];
    }
    throw new Error(`Invalid note name: ${note}`);
  }

  /**
   * Calculate parent Major key from modal tonic and mode name
   * Formula: K_parent = (T_modal - semitoneOffset) mod 12
   */
  public static getParentKey(modalTonic: string, mode: DiatonicMode): ParentKeyInfo {
    const tonicPc = this.noteToPitchClass(modalTonic);
    const modeMeta = MODE_METADATA[mode];
    const parentPc = this.mod(tonicPc - modeMeta.semitoneOffset, 12) as PitchClass;
    return MAJOR_KEYS[parentPc];
  }

  /**
   * Evaluates complete scale note spellings and pitch classes for any tonic and mode
   */
  public static evaluateMode(tonic: string, mode: DiatonicMode): ModeEvaluation {
    const tonicPc = this.noteToPitchClass(tonic);
    const parent = this.getParentKey(tonic, mode);
    const modeMeta = MODE_METADATA[mode];

    // Permute parent notes by cyclic rotation of modeMeta.rotationIndex
    const scaleNotes: string[] = [];
    const scalePitchClasses: PitchClass[] = [];

    for (let i = 0; i < 7; i++) {
      const parentNoteIdx = (i + modeMeta.rotationIndex) % 7;
      const noteName = parent.notes[parentNoteIdx];
      scaleNotes.push(noteName);
      scalePitchClasses.push(this.noteToPitchClass(noteName));
    }

    return {
      tonic,
      mode,
      tonicPitchClass: tonicPc,
      parentKey: parent,
      isAccessible: parent.accessibleOnEb,
      leverVector: parent.levers,
      scaleNotes,
      scalePitchClasses
    };
  }
}

// ============================================================================
// 4. CELTIC LEVER ENGINE & PREFIX VECTOR THEORY
// ============================================================================

export class CelticLeverEngine {
  /**
   * Constructs prefix vector on fifhs basis [A, E, B, F, C, G, D]
   * for key index k in [0, 7].
   * Vector contains exactly k ones followed by (7 - k) zeros.
   */
  public static getFifthsPrefixVector(k: number): readonly LeverState[] {
    if (k < 0 || k > 7) {
      throw new Error(`Key index ${k} outside accessible range [0, 7]`);
    }
    const vec: LeverState[] = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < k; i++) {
      vec[i] = 1;
    }
    return vec;
  }

  /**
   * Converts a fifths prefix index k into full string-indexed LeverVector [C, D, E, F, G, A, B]
   */
  public static indexToLeverVector(k: number): LeverVector {
    const prefix = this.getFifthsPrefixVector(k);
    // Sequence order: index 0:A, 1:E, 2:B, 3:F, 4:C, 5:G, 6:D
    return {
      A: prefix[0],
      E: prefix[1],
      B: prefix[2],
      F: prefix[3],
      C: prefix[4],
      G: prefix[5],
      D: prefix[6]
    };
  }

  /**
   * Calculates the exact pitch sounding on a string given its binary lever state
   */
  public static getSoundingPitch(stringLetter: DiatonicLetter, leverState: LeverState): string {
    const base = OPEN_EB_BASE_PITCH[stringLetter];
    return leverState === 0 ? base.downName : base.upName;
  }

  /**
   * Verifies that the string pitches under lever state match the requested diatonic parent key
   */
  public static verifyLeverConcordance(k: number): boolean {
    const vec = this.indexToLeverVector(k);
    const parentKey = Object.values(MAJOR_KEYS).find(mk => mk.fifthsIndex === k);
    if (!parentKey) return false;

    for (const letter of DIATONIC_LETTERS) {
      const state = vec[letter];
      const pitchName = this.getSoundingPitch(letter, state);
      if (!parentKey.notes.includes(pitchName)) {
        return false;
      }
    }
    return true;
  }
}

// ============================================================================
// 5. MINIMUM LEVER DELTA SOLVER & HAMMING DISTANCE PROVER
// ============================================================================

export class MinimumDeltaSolver {
  /**
   * Computes minimum lever transitions between any two diatonic keys or modes.
   * Proves Hamming Distance = |k2 - k1|
   */
  public static computeDelta(
    fromTonic: string,
    fromMode: DiatonicMode,
    toTonic: string,
    toMode: DiatonicMode
  ): TransitionDeltaPlan {
    const eval1 = DiatonicArithmetic.evaluateMode(fromTonic, fromMode);
    const eval2 = DiatonicArithmetic.evaluateMode(toTonic, toMode);

    if (!eval1.isAccessible) {
      throw new Error(`Starting key ${fromTonic} ${fromMode} is inaccessible on open Eb harp: ${eval1.parentKey.inaccessibilityReason}`);
    }
    if (!eval2.isAccessible) {
      throw new Error(`Target key ${toTonic} ${toMode} is inaccessible on open Eb harp: ${eval2.parentKey.inaccessibilityReason}`);
    }

    const k1 = eval1.parentKey.fifthsIndex;
    const k2 = eval2.parentKey.fifthsIndex;
    const diff = k2 - k1;
    const flips: LeverFlipAction[] = [];

    if (diff > 0) {
      // Clockwise rotation: Raise levers in fifths order HARP_SHARPING_SEQUENCE
      for (let i = k1; i < k2; i++) {
        const str = HARP_SHARPING_SEQUENCE[i];
        flips.push({
          string: str,
          action: 'UP',
          fromPitch: OPEN_EB_BASE_PITCH[str].downName,
          toPitch: OPEN_EB_BASE_PITCH[str].upName,
          octavesAffected: 'All octaves on instrument'
        });
      }
    } else if (diff < 0) {
      // Counter-clockwise rotation: Drop levers in fourths order HARP_FLATTENING_SEQUENCE
      for (let i = k1 - 1; i >= k2; i--) {
        const str = HARP_SHARPING_SEQUENCE[i];
        flips.push({
          string: str,
          action: 'DOWN',
          fromPitch: OPEN_EB_BASE_PITCH[str].upName,
          toPitch: OPEN_EB_BASE_PITCH[str].downName,
          octavesAffected: 'All octaves on instrument'
        });
      }
    }

    return {
      fromKeyName: `${fromTonic} ${fromMode} (Parent ${eval1.parentKey.name})`,
      toKeyName: `${toTonic} ${toMode} (Parent ${eval2.parentKey.name})`,
      fromIndex: k1,
      toIndex: k2,
      totalFlips: Math.abs(diff),
      flips,
      isZeroDelta: diff === 0
    };
  }
}

// ============================================================================
// 6. MEDLEY SEQUENCE OPTIMIZER (CELTIC SESSION SET PLANNER)
// ============================================================================

export class MedleyOptimizer {
  /**
   * Generate all permutations of an array
   */
  private static permute<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPerms = this.permute(remaining);
      for (const p of remainingPerms) {
        result.push([current, ...p]);
      }
    }
    return result;
  }

  /**
   * Identifies sneak flip opportunities: If target tune does not use string X
   * in its first 2 bars, lever X can be flipped after the tune begins.
   */
  public static identifySneakFlips(
    flips: LeverFlipAction[],
    targetTunePitchClasses?: PitchClass[]
  ): DiatonicLetter[] {
    if (!targetTunePitchClasses || targetTunePitchClasses.length === 0) {
      return [];
    }
    const sneakable: DiatonicLetter[] = [];
    for (const flip of flips) {
      const targetPc = DiatonicArithmetic.noteToPitchClass(flip.toPitch);
      if (!targetTunePitchClasses.includes(targetPc)) {
        sneakable.push(flip.string);
      }
    }
    return sneakable;
  }

  /**
   * Finds the optimal permutation of tunes in a Celtic medley to minimize total lever flips
   */
  public static optimizeMedley(tunes: TuneDescriptor[]): MedleyOptimizationPlan {
    if (tunes.length === 0) {
      throw new Error('Medley must contain at least 1 tune');
    }

    // Evaluate each tune
    const evaluatedTunes = tunes.map(t => {
      const evaluation = DiatonicArithmetic.evaluateMode(t.tonic, t.mode);
      if (!evaluation.isAccessible) {
        throw new Error(`Tune "${t.name}" in ${t.tonic} ${t.mode} is inaccessible on open Eb harp.`);
      }
      return {
        descriptor: t,
        evaluation,
        k: evaluation.parentKey.fifthsIndex
      };
    });

    // Calculate original sequence flips
    let originalTotalFlips = 0;
    for (let i = 0; i < evaluatedTunes.length - 1; i++) {
      originalTotalFlips += Math.abs(evaluatedTunes[i + 1].k - evaluatedTunes[i].k);
    }

    // Permute to find global minimum Hamiltonian path
    const perms = this.permute(evaluatedTunes);
    let bestPerm = evaluatedTunes;
    let minFlips = Infinity;

    for (const p of perms) {
      let cost = 0;
      for (let i = 0; i < p.length - 1; i++) {
        cost += Math.abs(p[i + 1].k - p[i].k);
      }
      if (cost < minFlips) {
        minFlips = cost;
        bestPerm = p;
      }
    }

    // Construct detailed transitions for optimal permutation
    const transitions: MedleyTransition[] = [];
    for (let i = 0; i < bestPerm.length - 1; i++) {
      const from = bestPerm[i];
      const to = bestPerm[i + 1];
      const deltaPlan = MinimumDeltaSolver.computeDelta(
        from.descriptor.tonic,
        from.descriptor.mode,
        to.descriptor.tonic,
        to.descriptor.mode
      );
      const sneakFlips = this.identifySneakFlips(deltaPlan.flips, to.descriptor.initialMeasuresPitchClasses);
      transitions.push({
        fromTune: from.descriptor.name,
        toTune: to.descriptor.name,
        deltaPlan,
        sneakFlips
      });
    }

    return {
      originalTuneOrder: tunes.map(t => t.name),
      optimalTuneOrder: bestPerm.map(t => t.descriptor.name),
      originalTotalFlips,
      optimalTotalFlips: minFlips,
      flipsSaved: originalTotalFlips - minFlips,
      transitions
    };
  }
}

// ============================================================================
// 7. SELF-EXECUTING VERIFICATION & DEMONSTRATION SUITE
// ============================================================================

export function runEarpaTheoryVerificationSuite(): void {
  console.log('================================================================');
  console.log('EARPA MATHEMATICAL THEORY & ALGORITHMIC ENGINE VERIFICATION');
  console.log('================================================================\n');

  // Test 1: Modular group generators
  const gen = DiatonicArithmetic.verifyGenerators();
  console.log('[Test 1] Modular Arithmetic Generators & Involution:');
  console.log(`  gcd(7, 12) = 1 (Chromatic circle generator): ${gen.z12Cyclic}`);
  console.log(`  gcd(4, 7) = 1 (Diatonic fifths generator):   ${gen.z7Cyclic}`);
  console.log(`  7 * 7 = 49 = 1 mod 12 (Involution theorem):   ${gen.involutionHolds}`);
  if (!gen.z12Cyclic || !gen.z7Cyclic || !gen.involutionHolds) {
    throw new Error('Test 1 Failed: Group generator properties violated!');
  }
  console.log('  -> PASS\n');

  // Test 2: Prefix Vector Concordance across all 8 accessible major keys
  console.log('[Test 2] Open Eb Prefix Vector Concordance (k in [0, 7]):');
  for (let k = 0; k <= 7; k++) {
    const valid = CelticLeverEngine.verifyLeverConcordance(k);
    const parentKey = Object.values(MAJOR_KEYS).find(m => m.fifthsIndex === k)!;
    const prefix = CelticLeverEngine.getFifthsPrefixVector(k);
    console.log(`  Key ${parentKey.name.padEnd(2)} (k=${k}): Prefix [${prefix.join(',')}] -> Concordance: ${valid}`);
    if (!valid) throw new Error(`Test 2 Failed for key index ${k}`);
  }
  console.log('  -> PASS\n');

  // Test 3: Celtic Staple Medley Delta Calculations
  console.log('[Test 3] Celtic Repertoire Transition Delta Tests:');
  
  // Transition 1: D Major to G Major (Reel staple)
  const dToG = MinimumDeltaSolver.computeDelta('D', 'Ionian', 'G', 'Ionian');
  console.log(`  D Major -> G Major: ${dToG.totalFlips} flip (${dToG.flips.map(f => f.string + ' ' + f.action).join(', ')})`);
  if (dToG.totalFlips !== 1 || dToG.flips[0].string !== 'C' || dToG.flips[0].action !== 'DOWN') {
    throw new Error('Test 3.1 Failed for D Major -> G Major');
  }

  // Transition 2: G Major to E Dorian
  const gToEdor = MinimumDeltaSolver.computeDelta('G', 'Ionian', 'E', 'Dorian');
  console.log(`  G Major -> E Dorian: ${gToEdor.totalFlips} flip (${gToEdor.flips.map(f => f.string + ' ' + f.action).join(', ')})`);
  if (gToEdor.totalFlips !== 1 || gToEdor.flips[0].string !== 'C' || gToEdor.flips[0].action !== 'UP') {
    throw new Error('Test 3.2 Failed for G Major -> E Dorian');
  }

  // Transition 3: D Major to E Dorian (The Relative Mode Zero-Delta Miracle)
  const dToEdor = MinimumDeltaSolver.computeDelta('D', 'Ionian', 'E', 'Dorian');
  console.log(`  D Major -> E Dorian: ${dToEdor.totalFlips} flips (Zero-Delta: ${dToEdor.isZeroDelta})`);
  if (dToEdor.totalFlips !== 0 || !dToEdor.isZeroDelta) {
    throw new Error('Test 3.3 Failed: D Major to E Dorian must require 0 lever flips!');
  }

  // Transition 4: D Major to A Mixolydian (Zero-Delta)
  const dToAmix = MinimumDeltaSolver.computeDelta('D', 'Ionian', 'A', 'Mixolydian');
  console.log(`  D Major -> A Mixolydian: ${dToAmix.totalFlips} flips (Zero-Delta: ${dToAmix.isZeroDelta})`);
  if (dToAmix.totalFlips !== 0) {
    throw new Error('Test 3.4 Failed: D Major to A Mixolydian must require 0 flips!');
  }
  console.log('  -> PASS\n');

  // Test 4: Celtic Session Medley Optimization (Reordering 3 tunes to save lever flips)
  console.log('[Test 4] Celtic Medley Sequence Optimization:');
  const sampleSet: TuneDescriptor[] = [
    { id: '1', name: "The Maid Behind the Bar", tonic: 'D', mode: 'Ionian' }, // k = 5
    { id: '2', name: "Paddy Fahey's Reel", tonic: 'D', mode: 'Dorian' },       // k = 3 (Parent C)
    { id: '3', name: "The Kesh Jig", tonic: 'G', mode: 'Ionian' }              // k = 4
  ];

  const plan = MedleyOptimizer.optimizeMedley(sampleSet);
  console.log(`  Original Order: ${plan.originalTuneOrder.join(' -> ')} (Total flips: ${plan.originalTotalFlips})`);
  console.log(`  Optimal Order:  ${plan.optimalTuneOrder.join(' -> ')} (Total flips: ${plan.optimalTotalFlips})`);
  console.log(`  Flips Saved:    ${plan.flipsSaved} (${((plan.flipsSaved / plan.originalTotalFlips) * 100).toFixed(1)}% reduction)`);
  if (plan.optimalTotalFlips > plan.originalTotalFlips) {
    throw new Error('Test 4 Failed: Optimization produced worse result!');
  }
  console.log('  -> PASS\n');

  console.log('ALL VERIFICATION AUDITS PASSED WITH ZERO ERRORS.\n');
}

// Run verification if invoked directly
runEarpaTheoryVerificationSuite();
