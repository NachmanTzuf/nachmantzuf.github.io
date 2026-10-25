/**
 * EARPA CURRICULUM RANDOMIZER & GAMEPLAY SIMULATION ENGINE
 * Enforces Constitutional Law 1 & Law 3:
 * 1. Strict active note bitmask adherence (only emits degrees marked true in activeNotesMask).
 * 2. Octave range restriction (1 octave: Octave 4; 2 octaves: Octaves 3 and 4).
 * 3. Chromatic degree sampling when isChromatic is true.
 * 4. Transposition solver for RANDOM_NON_C and RANDOM_DIATONIC keys across all 3 native tunings.
 * 5. Exact 90% pass gating threshold.
 */

import { LevelDefinition } from './curriculumData';
import { TuningMatrixEngine, NativeHarpTuning } from './TuningMatrixEngine';

export interface PromptQuestion {
  questionIndex: number;
  totalQuestions: number;
  tonicKey: string;
  isMinor: boolean;
  cadenceProgression: string;
  targetDegrees: string[]; // ['1'], ['3'], or ['1', '3', '5'] for sequence
  targetMidiNotes: number[]; // MIDI pitch numbers for audio playback
  targetFrequenciesHz: number[];
  octave: number;
  tempoBpm?: number;
  isHarmonicDyad?: boolean;
}

export interface SessionResult {
  levelId: string;
  totalRounds: number;
  correctRounds: number;
  accuracy: number;
  passed: boolean;
}

export class CurriculumRandomizer {
  // Diatonic scale degree semitones from tonic
  private static readonly MAJOR_SEMITONES: Record<number, number> = {
    1: 0,
    2: 2,
    3: 4,
    4: 5,
    5: 7,
    6: 9,
    7: 11,
    8: 12,
  };

  private static readonly MINOR_SEMITONES: Record<number, number> = {
    1: 0,
    2: 2,
    3: 3, // b3
    4: 5,
    5: 7,
    6: 8, // b6
    7: 10, // b7
    8: 12,
  };

  private static readonly CHROMATIC_SEMITONES: Record<string, number> = {
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

  /**
   * Generates a fully playable question for a specific level under the active native harp tuning.
   */
  public static generateQuestion(
    level: LevelDefinition,
    questionIndex: number,
    sessionLockedKey?: string,
    tuning?: NativeHarpTuning
  ): PromptQuestion {
    const activeTuning = tuning || TuningMatrixEngine.getActiveTuning();

    // 1. Resolve Tonic Key for this question
    let key: string;
    if (sessionLockedKey) {
      key = sessionLockedKey;
    } else if (level.cadenceKey === 'RANDOM_NON_C') {
      key = level.isMinor
        ? TuningMatrixEngine.getRandomPlayableMinorKey(activeTuning, true)
        : TuningMatrixEngine.getRandomPlayableMajorKey(activeTuning, true);
    } else if (level.cadenceKey === 'RANDOM_DIATONIC') {
      key = level.isMinor
        ? TuningMatrixEngine.getRandomPlayableMinorKey(activeTuning, false)
        : TuningMatrixEngine.getRandomPlayableMajorKey(activeTuning, false);
    } else {
      key = level.cadenceKey;
    }

    const cleanKeyName = key.replace('_minor', '');
    const rootMidi = TuningMatrixEngine.getRootMidiForKey(cleanKeyName, 4);

    // 2. Select Octave
    let octave = level.register || 4;
    if (level.octaves === 3) octave = 3 + Math.floor(Math.random() * 3);
    if (level.octaves === 2) {
      octave = Math.random() < 0.5 ? 3 : 4;
    }
    const octaveShift = (octave - 4) * 12;

    // 3. Resolve Active Degree Candidate Pool
    let candidateDegrees: string[] = [];

    if (level.isHarmonicDyad && level.harmonicDyadIntervals && level.harmonicDyadIntervals.length > 0) {
      // Harmonic Dyad Mode: pick one interval pair e.g. "1-5" or "1-8"
      const chosenDyad =
        level.harmonicDyadIntervals[Math.floor(Math.random() * level.harmonicDyadIntervals.length)];
      const parts = chosenDyad.split('-');
      candidateDegrees = parts; // [lowerDegree, upperDegree]
    } else if (level.isChromatic && level.allowedChromaticDegrees && level.allowedChromaticDegrees.length > 0) {
      // Chromatic Mode: combine active diatonic degrees + allowed chromatics
      const diatonicActive: string[] = [];
      level.activeNotesMask.forEach((isActive, idx) => {
        if (isActive) {
          diatonicActive.push(String(idx + 1));
        }
      });
      candidateDegrees = [...diatonicActive, ...level.allowedChromaticDegrees];
    } else {
      // Pure Diatonic Mode: strictly filter by activeNotesMask
      level.activeNotesMask.forEach((isActive, idx) => {
        if (isActive) {
          candidateDegrees.push(String(idx + 1));
        }
      });
    }

    // Guard against empty candidate pool
    if (candidateDegrees.length === 0) {
      candidateDegrees = ['1'];
    }

    // 4. Sample Target Note(s)
    let targetDegrees: string[] = [];
    if (level.isHarmonicDyad) {
      targetDegrees = candidateDegrees; // Dyad has both notes simultaneously
    } else {
      const length = level.melodyLength || 1;
      for (let i = 0; i < length; i++) {
        const picked = candidateDegrees[Math.floor(Math.random() * candidateDegrees.length)];
        targetDegrees.push(picked);
      }
    }

    // 5. Calculate MIDI notes and Hertz frequencies
    const targetMidiNotes: number[] = targetDegrees.map((deg) => {
      let semitone = 0;
      if ((level.isChromatic || level.isHarmonicDyad || !/^[1-8]$/.test(deg)) && this.CHROMATIC_SEMITONES[deg] !== undefined) {
        semitone = this.CHROMATIC_SEMITONES[deg];
      } else {
        const num = parseInt(deg, 10);
        semitone = level.isMinor
          ? this.MINOR_SEMITONES[num] ?? 0
          : this.MAJOR_SEMITONES[num] ?? 0;
      }
      return rootMidi + octaveShift + semitone;
    });

    const targetFrequenciesHz = targetMidiNotes.map((m) => TuningMatrixEngine.midiToFreq(m));

    return {
      questionIndex,
      totalQuestions: level.rounds,
      tonicKey: key,
      isMinor: level.isMinor,
      cadenceProgression: level.cadenceProgression,
      targetDegrees,
      targetMidiNotes,
      targetFrequenciesHz,
      octave,
      tempoBpm: level.tempoBpm,
      isHarmonicDyad: level.isHarmonicDyad,
    };
  }

  /**
   * Evaluates a completed session and determines pass/fail against the 90% threshold.
   */
  public static evaluateSession(
    level: LevelDefinition,
    correctCount: number
  ): SessionResult {
    const accuracy = correctCount / level.rounds;
    const passed = accuracy >= level.passAccuracyThreshold;
    return {
      levelId: level.id,
      totalRounds: level.rounds,
      correctRounds: correctCount,
      accuracy,
      passed,
    };
  }
}
