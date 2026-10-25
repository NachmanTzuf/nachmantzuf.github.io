/**
 * EARPA MINIMUM LEVER DELTA SOLVER
 * Calculates minimal physical lever changes between any two keys or modes,
 * and optimizes session tune medleys to minimize total live stage flips.
 */

import {
  CelticTune,
  DiatonicMode,
  LeverDeltaAction,
  LeverDeltaResult,
  MedleyOptimizationResult,
  NoteLetter,
  PhysicalHarpLevers,
  PitchClass,
} from './types';
import { FifthsSequenceEngine } from './FifthsSequenceEngine';
import { ModalShiftEngine } from './ModalShiftEngine';

export class MinimumDeltaSolver {
  private static readonly NOTE_LETTERS: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  /**
   * Calculates the exact lever actions required to transition from source levers to target levers.
   */
  public static calculateDelta(
    fromLevers: PhysicalHarpLevers,
    toLevers: PhysicalHarpLevers,
    fromLabel: string = 'Current',
    toLabel: string = 'Target'
  ): LeverDeltaResult {
    const actions: LeverDeltaAction[] = [];

    for (const letter of MinimumDeltaSolver.NOTE_LETTERS) {
      const fromPos = fromLevers[letter];
      const toPos = toLevers[letter];

      if (fromPos !== toPos) {
        const direction = toPos === 1 ? 'UP' : 'DOWN';
        const pitchDesc = MinimumDeltaSolver.getPitchDescription(letter, direction);
        actions.push({
          letter,
          from: fromPos,
          to: toPos,
          direction,
          pitchChangeDescription: pitchDesc,
        });
      }
    }

    const totalFlips = actions.length;
    let summaryText = '';
    if (totalFlips === 0) {
      summaryText = `Zero lever changes required (${fromLabel} and ${toLabel} share identical key signatures).`;
    } else {
      const upLetters = actions.filter((a) => a.direction === 'UP').map((a) => a.letter);
      const downLetters = actions.filter((a) => a.direction === 'DOWN').map((a) => a.letter);
      const parts: string[] = [];
      if (upLetters.length > 0) parts.push(`Raise ${upLetters.join(', ')}`);
      if (downLetters.length > 0) parts.push(`Lower ${downLetters.join(', ')}`);
      summaryText = `${parts.join('; ')} (${totalFlips} ${totalFlips === 1 ? 'flip' : 'flips'}).`;
    }

    return {
      fromKey: fromLabel,
      toKey: toLabel,
      totalFlips,
      actions,
      isDirectlyAccessible: true,
      summaryText,
    };
  }

  /**
   * Calculates the lever transition between any two modal scales.
   */
  public static calculateModalTransition(
    fromRoot: PitchClass,
    fromMode: DiatonicMode,
    toRoot: PitchClass,
    toMode: DiatonicMode
  ): LeverDeltaResult {
    const def1 = ModalShiftEngine.getModalDefinition(fromRoot, fromMode);
    const def2 = ModalShiftEngine.getModalDefinition(toRoot, toMode);

    const fromLabel = `${def1.rootName} ${def1.mode}`;
    const toLabel = `${def2.rootName} ${def2.mode}`;

    if (!def1.isAccessibleOnEbHarp || !def2.isAccessibleOnEbHarp) {
      return {
        fromKey: fromLabel,
        toKey: toLabel,
        totalFlips: -1,
        actions: [],
        isDirectlyAccessible: false,
        summaryText: `Transition inaccessible: ${def1.inaccessibilityReason || def2.inaccessibilityReason}`,
      };
    }

    return MinimumDeltaSolver.calculateDelta(def1.levers, def2.levers, fromLabel, toLabel);
  }

  /**
   * Optimizes a session medley of Celtic tunes to minimize total lever transitions.
   */
  public static optimizeMedley(tunes: CelticTune[]): MedleyOptimizationResult {
    if (tunes.length <= 1) {
      return {
        originalOrder: tunes,
        optimizedOrder: tunes,
        originalTotalFlips: 0,
        optimizedTotalFlips: 0,
        flipsSaved: 0,
        transitions: [],
      };
    }

    // Calculate original total flips
    let originalTotalFlips = 0;
    for (let i = 0; i < tunes.length - 1; i++) {
      const delta = MinimumDeltaSolver.calculateTuneDelta(tunes[i], tunes[i + 1]);
      originalTotalFlips += Math.max(0, delta.totalFlips);
    }

    // Generate permutations (for medleys up to 6 tunes)
    const permutations = MinimumDeltaSolver.permute(tunes);
    let bestPermutation = tunes;
    let minFlips = originalTotalFlips;

    for (const perm of permutations) {
      let currentFlips = 0;
      let valid = true;
      for (let i = 0; i < perm.length - 1; i++) {
        const delta = MinimumDeltaSolver.calculateTuneDelta(perm[i], perm[i + 1]);
        if (delta.totalFlips < 0) {
          valid = false;
          break;
        }
        currentFlips += delta.totalFlips;
      }
      if (valid && currentFlips < minFlips) {
        minFlips = currentFlips;
        bestPermutation = perm;
      }
    }

    // Compute transition details for optimized order
    const transitions: LeverDeltaResult[] = [];
    for (let i = 0; i < bestPermutation.length - 1; i++) {
      transitions.push(MinimumDeltaSolver.calculateTuneDelta(bestPermutation[i], bestPermutation[i + 1]));
    }

    return {
      originalOrder: tunes,
      optimizedOrder: bestPermutation,
      originalTotalFlips,
      optimizedTotalFlips: minFlips,
      flipsSaved: originalTotalFlips - minFlips,
      transitions,
    };
  }

  private static calculateTuneDelta(tune1: CelticTune, tune2: CelticTune): LeverDeltaResult {
    const pc1 = MinimumDeltaSolver.nameToPitchClass(tune1.tonic);
    const pc2 = MinimumDeltaSolver.nameToPitchClass(tune2.tonic);
    return MinimumDeltaSolver.calculateModalTransition(pc1, tune1.mode, pc2, tune2.mode);
  }

  private static nameToPitchClass(name: string): PitchClass {
    const map: Record<string, PitchClass> = {
      C: 0,
      'C#': 1,
      Db: 1,
      D: 2,
      'D#': 3,
      Eb: 3,
      E: 4,
      F: 5,
      'F#': 6,
      Gb: 6,
      G: 7,
      'G#': 8,
      Ab: 8,
      A: 9,
      'A#': 10,
      Bb: 10,
      B: 11,
    };
    return map[name.trim()] ?? 0;
  }

  private static getPitchDescription(letter: NoteLetter, direction: 'UP' | 'DOWN'): string {
    const isNaturalInOpenEb = ['C', 'D', 'F', 'G'].includes(letter);
    if (direction === 'UP') {
      return isNaturalInOpenEb ? `${letter} natural to ${letter}#` : `${letter}b to ${letter} natural`;
    }
    return isNaturalInOpenEb ? `${letter}# to ${letter} natural` : `${letter} natural to ${letter}b`;
  }

  private static permute<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPerms = MinimumDeltaSolver.permute(remaining);
      for (const p of remainingPerms) {
        result.push([current, ...p]);
      }
    }
    return result;
  }
}
