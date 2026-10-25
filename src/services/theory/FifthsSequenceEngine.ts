/**
 * EARPA FIFTHS SEQUENCE ENGINE
 * Implements the Line of Fifths modulo 12: phi(j) = 7j (mod 12)
 * and proves the strict physical lever progression sequence for Open Eb Celtic harps.
 */

import { NoteLetter, PhysicalHarpLevers } from './types';

export class FifthsSequenceEngine {
  /**
   * The strictly ordered physical sharping lever sequence from Open Eb Major:
   * Raising levers clockwise along the Circle of Fifths:
   * Step 1: A (Ab -> A) => Bb Major
   * Step 2: E (Eb -> E) => F Major
   * Step 3: B (Bb -> B) => C Major
   * Step 4: F (F -> F#) => G Major
   * Step 5: C (C -> C#) => D Major
   * Step 6: G (G -> G#) => A Major
   * Step 7: D (D -> D#) => E Major
   */
  public static readonly SHARPING_SEQUENCE: NoteLetter[] = ['A', 'E', 'B', 'F', 'C', 'G', 'D'];

  /**
   * The strictly ordered physical flattening lever sequence:
   * Lowering levers counter-clockwise along the Circle of Fourths.
   */
  public static readonly FLATTENING_SEQUENCE: NoteLetter[] = ['D', 'G', 'C', 'F', 'B', 'E', 'A'];

  /**
   * Accessible major keys on an Open Eb Celtic lever harp corresponding to prefix counts 0..7.
   */
  public static readonly ACCESSIBLE_MAJOR_KEYS = [
    'Eb', // 0 levers raised (all down)
    'Bb', // 1 lever raised (A)
    'F',  // 2 levers raised (A, E)
    'C',  // 3 levers raised (A, E, B)
    'G',  // 4 levers raised (A, E, B, F)
    'D',  // 5 levers raised (A, E, B, F, C)
    'A',  // 6 levers raised (A, E, B, F, C, G)
    'E',  // 7 levers raised (A, E, B, F, C, G, D)
  ];

  /**
   * Returns the physical lever states [C, D, E, F, G, A, B] given a prefix count k in [0..7].
   */
  public static getLeversForPrefixCount(k: number): PhysicalHarpLevers {
    const clampedK = Math.max(0, Math.min(7, Math.round(k)));
    const levers: PhysicalHarpLevers = {
      C: 0,
      D: 0,
      E: 0,
      F: 0,
      G: 0,
      A: 0,
      B: 0,
    };

    for (let i = 0; i < clampedK; i++) {
      const letter = FifthsSequenceEngine.SHARPING_SEQUENCE[i];
      levers[letter] = 1;
    }

    return levers;
  }

  /**
   * Given an accessible major key name, returns the required fifths prefix count (0..7).
   * Returns -1 if key is outside the 8 accessible keys on open Eb harp.
   */
  public static getPrefixCountForMajorKey(keyName: string): number {
    const normalized = keyName.trim();
    return FifthsSequenceEngine.ACCESSIBLE_MAJOR_KEYS.indexOf(normalized);
  }

  /**
   * Computes the Line of Fifths pitch class modulo 12 for index j.
   */
  public static lineOfFifthsPitchClass(j: number): number {
    return ((7 * j) % 12 + 12) % 12;
  }

  /**
   * Verify if a set of levers corresponds to a valid pure fifths prefix vector.
   */
  public static isValidFifthsPrefix(levers: PhysicalHarpLevers): boolean {
    let raisedCount = 0;
    for (let i = 0; i < FifthsSequenceEngine.SHARPING_SEQUENCE.length; i++) {
      const letter = FifthsSequenceEngine.SHARPING_SEQUENCE[i];
      if (levers[letter] === 1) {
        raisedCount++;
      } else {
        // If an earlier letter is down, all subsequent letters in sequence MUST be down
        for (let j = i + 1; j < FifthsSequenceEngine.SHARPING_SEQUENCE.length; j++) {
          if (levers[FifthsSequenceEngine.SHARPING_SEQUENCE[j]] === 1) {
            return false; // Non-diatonic / accidental lever configuration
          }
        }
        break;
      }
    }
    return true;
  }
}
