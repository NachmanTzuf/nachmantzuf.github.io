/**
 * EARPA RESOLUTION WALKER
 * Computes the psychological gravitational return path from any scale degree
 * back to the tonic anchor, cementing instinctive ear recognition.
 */

import { ScaleDegree, SolfegeName, DEFAULT_CADENCE_TIMINGS, CadenceTimingConfig, ResolutionDirection } from './types';
import { CadenceEngine } from './CadenceEngine';

export interface ResolutionStep {
  degree: ScaleDegree;
  solfege: SolfegeName;
  midiNumber: number;
  frequencyHz: number;
  durationMs: number;
}

export class ResolutionWalker {
  private timings: CadenceTimingConfig;

  // Semitone mapping from root tonic
  private static readonly DEGREE_SEMITONES: Record<ScaleDegree, number> = {
    '1': 0,
    'b2': 1,
    '2': 2,
    'b3': 3,
    '3': 4,
    '4': 5,
    '#4': 6,
    '5': 7,
    'b6': 8,
    '6': 9,
    'b7': 10,
    '7': 11,
    '8': 12,
  };

  private static readonly DEGREE_SOLFEGE: Record<ScaleDegree, SolfegeName> = {
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
    '8': 'Do8',
  };

  // The Alain Benbassat Stepwise Gravitational Return Pathways (Natural Tendency)
  private static readonly NATURAL_RESOLUTION_PATHS: Record<ScaleDegree, ScaleDegree[]> = {
    '1': ['1'],
    'b2': ['b2', '1'],
    '2': ['2', '1'],
    'b3': ['b3', '2', '1'],
    '3': ['3', '2', '1'],
    '4': ['4', '3', '2', '1'],
    '#4': ['#4', '5', '6', '7', '8'],
    '5': ['5', '1'], // Direct leap to tonic
    'b6': ['b6', '5', '4', '3', '2', '1'],
    '6': ['6', '5', '4', '3', '2', '1'],
    'b7': ['b7', '6', '7', '8'],
    '7': ['7', '8'], // Resolves upward to tonic octave
    '8': ['8'],
  };

  // Stepwise Downward Diatonic Pathways to Root Tonic (1)
  private static readonly DOWN_RESOLUTION_PATHS: Record<ScaleDegree, ScaleDegree[]> = {
    '1': ['1'],
    'b2': ['b2', '1'],
    '2': ['2', '1'],
    'b3': ['b3', '2', '1'],
    '3': ['3', '2', '1'],
    '4': ['4', '3', '2', '1'],
    '#4': ['#4', '4', '3', '2', '1'],
    '5': ['5', '4', '3', '2', '1'],
    'b6': ['b6', '5', '4', '3', '2', '1'],
    '6': ['6', '5', '4', '3', '2', '1'],
    'b7': ['b7', '6', '5', '4', '3', '2', '1'],
    '7': ['7', '6', '5', '4', '3', '2', '1'],
    '8': ['8', '7', '6', '5', '4', '3', '2', '1'],
  };

  // Stepwise Upward Diatonic Pathways to Octave Tonic (8)
  private static readonly UP_RESOLUTION_PATHS: Record<ScaleDegree, ScaleDegree[]> = {
    '1': ['1', '2', '3', '4', '5', '6', '7', '8'],
    'b2': ['b2', '2', '3', '4', '5', '6', '7', '8'],
    '2': ['2', '3', '4', '5', '6', '7', '8'],
    'b3': ['b3', '3', '4', '5', '6', '7', '8'],
    '3': ['3', '4', '5', '6', '7', '8'],
    '4': ['4', '5', '6', '7', '8'],
    '#4': ['#4', '5', '6', '7', '8'],
    '5': ['5', '6', '7', '8'],
    'b6': ['b6', '6', '7', '8'],
    '6': ['6', '7', '8'],
    'b7': ['b7', '7', '8'],
    '7': ['7', '8'],
    '8': ['8'],
  };

  // Backwards compatibility alias for external callers
  public static readonly RESOLUTION_PATHS = ResolutionWalker.NATURAL_RESOLUTION_PATHS;

  constructor(timingOverrides?: Partial<CadenceTimingConfig>) {
    this.timings = { ...DEFAULT_CADENCE_TIMINGS, ...timingOverrides };
  }

  /**
   * Generates the concrete sequence of notes for the resolution walk.
   * Supports 'natural' (Benbassat standard), 'down' (stepwise down to 1),
   * and 'up' (stepwise up to 8).
   */
  public generatePath(
    degree: ScaleDegree,
    rootMidi: number = 60,
    direction: ResolutionDirection = 'natural',
    isMinor: boolean = false,
    chromaticDegree: boolean = false
  ): ResolutionStep[] {
    let pathDegrees: ScaleDegree[];

    if (direction === 'down') {
      pathDegrees = ResolutionWalker.DOWN_RESOLUTION_PATHS[degree] || [degree, '1'];
    } else if (direction === 'up') {
      pathDegrees = ResolutionWalker.UP_RESOLUTION_PATHS[degree] || [degree, '8'];
    } else if (direction === 'closest') {
      // Benbassat Tonal Gravity: Resolves to whichever Tonic C is closer!
      // Low C ('1'): degrees 1, b2, 2, b3, 3, 4 (closer to 1) -> walk stepwise DOWN to 1
      // High C ('8'): degrees 5, #4, b6, 6, b7, 7, 8 (closer to 8) -> walk stepwise UP to 8
      const resolvesDown = ['1', 'b2', '2', 'b3', '3', '4'].includes(degree);
      pathDegrees = resolvesDown
        ? ResolutionWalker.DOWN_RESOLUTION_PATHS[degree] || [degree, '1']
        : ResolutionWalker.UP_RESOLUTION_PATHS[degree] || [degree, '8'];
    } else {
      pathDegrees = ResolutionWalker.NATURAL_RESOLUTION_PATHS[degree] || [degree, '1'];
    }

    return pathDegrees.map((deg, index) => {
      const isFinal = index === pathDegrees.length - 1;
      const semitones = isMinor && !(chromaticDegree && index === 0) && ['3', '6', '7'].includes(deg)
        ? ({ '3': 3, '6': 8, '7': 10 } as Record<string, number>)[deg]
        : ResolutionWalker.DEGREE_SEMITONES[deg];
      const midiNumber = rootMidi + semitones;
      const frequencyHz = CadenceEngine.midiToFreq(midiNumber);
      const solfege = ResolutionWalker.DEGREE_SOLFEGE[deg];
      const durationMs = isFinal
        ? this.timings.resolutionTonicHoldMs
        : this.timings.resolutionStepDurationMs;

      return {
        degree: deg,
        solfege,
        midiNumber,
        frequencyHz,
        durationMs,
      };
    }).filter((step, i, all) => i === 0 || step.midiNumber !== all[i-1].midiNumber);
  }

  public static getSemitones(degree: ScaleDegree): number {
    return ResolutionWalker.DEGREE_SEMITONES[degree] ?? 0;
  }

  public static getSolfege(degree: ScaleDegree): SolfegeName {
    return ResolutionWalker.DEGREE_SOLFEGE[degree] ?? 'Do';
  }
}
