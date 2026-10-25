/**
 * EARPA MODAL SHIFT ENGINE
 * Implements the Parent Key Invariant and Zero-Delta Invariant across all 7 diatonic modes
 * and provides complete 84-entry modal truth tables for Open Eb Celtic lever harps.
 */

import { DiatonicMode, ModalDefinition, PhysicalHarpLevers, PitchClass } from './types';
import { FifthsSequenceEngine } from './FifthsSequenceEngine';

export class ModalShiftEngine {
  /**
   * Semitone offsets from Mode Root to Parent Major Key Root:
   * Parent Root = (Mode Root - Offset) mod 12
   */
  public static readonly MODE_OFFSETS: Record<DiatonicMode, number> = {
    ionian: 0,
    dorian: 2,
    phrygian: 4,
    lydian: 5,
    mixolydian: 7,
    aeolian: 9,
    locrian: 11,
  };

  /**
   * Pitch Class to Canonical Flat/Sharp Key Names.
   */
  public static readonly PITCH_CLASS_NAMES: Record<number, string> = {
    0: 'C',
    1: 'Db',
    2: 'D',
    3: 'Eb',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'Ab',
    9: 'A',
    10: 'Bb',
    11: 'B',
  };

  /**
   * Scale degree interval steps from root for each mode.
   */
  public static readonly MODE_INTERVALS: Record<DiatonicMode, number[]> = {
    ionian: [0, 2, 4, 5, 7, 9, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
  };

  /**
   * Resolves the parent major key for any root and mode.
   */
  public static getParentMajorKey(rootPitchClass: PitchClass, mode: DiatonicMode): string {
    const offset = ModalShiftEngine.MODE_OFFSETS[mode];
    const parentPitchClass = ((rootPitchClass - offset) % 12 + 12) % 12;
    return ModalShiftEngine.PITCH_CLASS_NAMES[parentPitchClass];
  }

  /**
   * Resolves the complete modal definition for any root and mode.
   */
  public static getModalDefinition(rootPitchClass: PitchClass, mode: DiatonicMode): ModalDefinition {
    const rootName = ModalShiftEngine.PITCH_CLASS_NAMES[rootPitchClass];
    const parentKey = ModalShiftEngine.getParentMajorKey(rootPitchClass, mode);
    const prefixCount = FifthsSequenceEngine.getPrefixCountForMajorKey(parentKey);
    const isAccessible = prefixCount >= 0;

    let inaccessibilityReason: string | undefined;
    let levers: PhysicalHarpLevers;

    if (isAccessible) {
      levers = FifthsSequenceEngine.getLeversForPrefixCount(prefixCount);
    } else {
      // Inaccessible: default levers to 0 and specify mechanical reason
      levers = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
      if (['Db', 'Ab', 'Gb'].includes(parentKey)) {
        inaccessibilityReason = `Requires flatting levers (e.g. Db/Gb) not present on standard Eb-tuned lever harps.`;
      } else {
        inaccessibilityReason = `Exceeds 4 sharps (parent key ${parentKey} requires 5+ sharps, exceeding Eb harp ceiling).`;
      }
    }

    // Generate note spellings
    const intervals = ModalShiftEngine.MODE_INTERVALS[mode];
    const notes = intervals.map((iv) => {
      const pc = (rootPitchClass + iv) % 12;
      return ModalShiftEngine.PITCH_CLASS_NAMES[pc];
    });

    return {
      rootName,
      rootPitchClass,
      mode,
      parentKeyIndex: prefixCount,
      parentMajorKey: parentKey,
      isAccessibleOnEbHarp: isAccessible,
      inaccessibilityReason,
      notes,
      levers,
      fifthsPrefixCount: prefixCount,
    };
  }

  /**
   * Generates the exhaustive 84-row truth table across all 12 pitch classes x 7 modes.
   */
  public static generateCompleteTruthTable(): ModalDefinition[] {
    const table: ModalDefinition[] = [];
    const modes: DiatonicMode[] = [
      'ionian',
      'dorian',
      'phrygian',
      'lydian',
      'mixolydian',
      'aeolian',
      'locrian',
    ];

    for (let pc = 0; pc < 12; pc++) {
      for (const mode of modes) {
        table.push(ModalShiftEngine.getModalDefinition(pc as PitchClass, mode));
      }
    }

    return table;
  }
}
