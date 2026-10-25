/**
 * EARPA TRI-NATIVE HARP TUNING ENGINE & STATE PERSISTENCE
 * Implements the physical mechanics of lever harps across all three canonical open tunings:
 * 1. E-flat (Eb) Major Native (3 flats open: Bb, Eb, Ab) - Universal modern folk standard
 * 2. C Major Native (all naturals open) - Classical/beginner folk standard
 * 3. B-flat (Bb) / F Major Native (2 flats open: Bb, Eb) - Celtic modal standard
 *
 * Enforces Constitutional Law 2: Sharping levers ONLY raise open pitch by +1 semitone.
 */

export type NativeHarpTuning = 'Eb_Major_Native' | 'C_Major_Native' | 'Bb_Major_Native';

export type StringLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface LeverPositionMap {
  C: 0 | 1;
  D: 0 | 1;
  E: 0 | 1;
  F: 0 | 1;
  G: 0 | 1;
  A: 0 | 1;
  B: 0 | 1;
}

export interface StringTuningInfo {
  letter: StringLetter;
  openPitch: string;
  engagedPitch: string;
  openMidiBase: number; // e.g. Octave 4
}

export const TUNING_DISPLAY_NAMES: Record<NativeHarpTuning, string> = {
  Eb_Major_Native: ' E-flat Major Native (3 Flats Open)',
  C_Major_Native: ' C Major Native (All Naturals Open)',
  Bb_Major_Native: ' B-flat Major Native (2 Flats Open)',
};

export const TUNING_SHORT_NAMES: Record<NativeHarpTuning, string> = {
  Eb_Major_Native: 'E♭ Major Native',
  C_Major_Native: 'C Major Native',
  Bb_Major_Native: 'B♭ Major Native',
};

export const TUNING_STRING_BASELINES: Record<NativeHarpTuning, Record<StringLetter, { open: string; engaged: string; openMidi: number }>> = {
  Eb_Major_Native: {
    C: { open: 'C', engaged: 'C#', openMidi: 60 },
    D: { open: 'D', engaged: 'D#', openMidi: 62 },
    E: { open: 'Eb', engaged: 'E', openMidi: 63 },
    F: { open: 'F', engaged: 'F#', openMidi: 65 },
    G: { open: 'G', engaged: 'G#', openMidi: 67 },
    A: { open: 'Ab', engaged: 'A', openMidi: 68 },
    B: { open: 'Bb', engaged: 'B', openMidi: 70 },
  },
  C_Major_Native: {
    C: { open: 'C', engaged: 'C#', openMidi: 60 },
    D: { open: 'D', engaged: 'D#', openMidi: 62 },
    E: { open: 'E', engaged: 'E#', openMidi: 64 },
    F: { open: 'F', engaged: 'F#', openMidi: 65 },
    G: { open: 'G', engaged: 'G#', openMidi: 67 },
    A: { open: 'A', engaged: 'A#', openMidi: 69 },
    B: { open: 'B', engaged: 'B#', openMidi: 71 },
  },
  Bb_Major_Native: {
    C: { open: 'C', engaged: 'C#', openMidi: 60 },
    D: { open: 'D', engaged: 'D#', openMidi: 62 },
    E: { open: 'Eb', engaged: 'E', openMidi: 63 },
    F: { open: 'F', engaged: 'F#', openMidi: 65 },
    G: { open: 'G', engaged: 'G#', openMidi: 67 },
    A: { open: 'A', engaged: 'A#', openMidi: 69 },
    B: { open: 'Bb', engaged: 'B', openMidi: 70 },
  },
};

// Playable major keys per native tuning (derived mathematically via Circle of Fifths lever progression)
export const PLAYABLE_MAJOR_KEYS: Record<NativeHarpTuning, string[]> = {
  Eb_Major_Native: ['Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E'],
  C_Major_Native: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'],
  Bb_Major_Native: ['Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B'],
};

// Relative minor keys
export const PLAYABLE_MINOR_KEYS: Record<NativeHarpTuning, string[]> = {
  Eb_Major_Native: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'],
  C_Major_Native: ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#'],
  Bb_Major_Native: ['G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#'],
};

// Lever configuration table (0 = DOWN, 1 = UP) per key for each native tuning
export const LEVER_CONFIGS_BY_KEY: Record<NativeHarpTuning, Record<string, LeverPositionMap>> = {
  Eb_Major_Native: {
    Eb: { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    Bb: { C: 0, D: 0, E: 0, F: 0, G: 0, A: 1, B: 0 },
    F:  { C: 0, D: 0, E: 1, F: 0, G: 0, A: 1, B: 0 },
    C:  { C: 0, D: 0, E: 1, F: 0, G: 0, A: 1, B: 1 },
    G:  { C: 0, D: 0, E: 1, F: 1, G: 0, A: 1, B: 1 },
    D:  { C: 1, D: 0, E: 1, F: 1, G: 0, A: 1, B: 1 },
    A:  { C: 1, D: 0, E: 1, F: 1, G: 1, A: 1, B: 1 },
    E:  { C: 1, D: 1, E: 1, F: 1, G: 1, A: 1, B: 1 },
    // Minors
    'C_minor': { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    'G_minor': { C: 0, D: 0, E: 0, F: 0, G: 0, A: 1, B: 0 },
    'D_minor': { C: 0, D: 0, E: 1, F: 0, G: 0, A: 1, B: 0 },
    'A_minor': { C: 0, D: 0, E: 1, F: 0, G: 0, A: 1, B: 1 },
    'E_minor': { C: 0, D: 0, E: 1, F: 1, G: 0, A: 1, B: 1 },
    'B_minor': { C: 1, D: 0, E: 1, F: 1, G: 0, A: 1, B: 1 },
    'F#_minor': { C: 1, D: 0, E: 1, F: 1, G: 1, A: 1, B: 1 },
    'C#_minor': { C: 1, D: 1, E: 1, F: 1, G: 1, A: 1, B: 1 },
  },
  C_Major_Native: {
    C:  { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    G:  { C: 0, D: 0, E: 0, F: 1, G: 0, A: 0, B: 0 },
    D:  { C: 1, D: 0, E: 0, F: 1, G: 0, A: 0, B: 0 },
    A:  { C: 1, D: 0, E: 0, F: 1, G: 1, A: 0, B: 0 },
    E:  { C: 1, D: 1, E: 0, F: 1, G: 1, A: 0, B: 0 },
    B:  { C: 1, D: 1, E: 0, F: 1, G: 1, A: 1, B: 0 },
    'F#': { C: 1, D: 1, E: 1, F: 1, G: 1, A: 1, B: 0 },
    // Minors
    'A_minor': { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    'E_minor': { C: 0, D: 0, E: 0, F: 1, G: 0, A: 0, B: 0 },
    'B_minor': { C: 1, D: 0, E: 0, F: 1, G: 0, A: 0, B: 0 },
    'F#_minor': { C: 1, D: 0, E: 0, F: 1, G: 1, A: 0, B: 0 },
    'C#_minor': { C: 1, D: 1, E: 0, F: 1, G: 1, A: 0, B: 0 },
    'G#_minor': { C: 1, D: 1, E: 0, F: 1, G: 1, A: 1, B: 0 },
    'D#_minor': { C: 1, D: 1, E: 1, F: 1, G: 1, A: 1, B: 0 },
  },
  Bb_Major_Native: {
    Bb: { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    F:  { C: 0, D: 0, E: 1, F: 0, G: 0, A: 0, B: 0 },
    C:  { C: 0, D: 0, E: 1, F: 0, G: 0, A: 0, B: 1 },
    G:  { C: 0, D: 0, E: 1, F: 1, G: 0, A: 0, B: 1 },
    D:  { C: 1, D: 0, E: 1, F: 1, G: 0, A: 0, B: 1 },
    A:  { C: 1, D: 0, E: 1, F: 1, G: 1, A: 0, B: 1 },
    E:  { C: 1, D: 1, E: 1, F: 1, G: 1, A: 0, B: 1 },
    B:  { C: 1, D: 1, E: 1, F: 1, G: 1, A: 1, B: 1 },
    // Minors
    'G_minor': { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 },
    'D_minor': { C: 0, D: 0, E: 1, F: 0, G: 0, A: 0, B: 0 },
    'A_minor': { C: 0, D: 0, E: 1, F: 0, G: 0, A: 0, B: 1 },
    'E_minor': { C: 0, D: 0, E: 1, F: 1, G: 0, A: 0, B: 1 },
    'B_minor': { C: 1, D: 0, E: 1, F: 1, G: 0, A: 0, B: 1 },
    'F#_minor': { C: 1, D: 0, E: 1, F: 1, G: 1, A: 0, B: 1 },
    'C#_minor': { C: 1, D: 1, E: 1, F: 1, G: 1, A: 0, B: 1 },
    'G#_minor': { C: 1, D: 1, E: 1, F: 1, G: 1, A: 1, B: 1 },
  },
};

export const PERSISTENCE_STORAGE_KEY = 'earpa_native_harp_tuning';

export class TuningMatrixEngine {
  private static activeTuning: NativeHarpTuning = 'Eb_Major_Native';
  private static listeners: Array<(tuning: NativeHarpTuning) => void> = [];

  /**
   * Initialize and load persisted tuning from localStorage / MMKV.
   */
  public static init(): NativeHarpTuning {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(PERSISTENCE_STORAGE_KEY) as NativeHarpTuning | null;
      if (saved && (saved === 'Eb_Major_Native' || saved === 'C_Major_Native' || saved === 'Bb_Major_Native')) {
        this.activeTuning = saved;
      }
    }
    return this.activeTuning;
  }

  public static getActiveTuning(): NativeHarpTuning {
    return this.activeTuning;
  }

  public static setActiveTuning(tuning: NativeHarpTuning): void {
    if (this.activeTuning === tuning) return;
    this.activeTuning = tuning;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PERSISTENCE_STORAGE_KEY, tuning);
    }
    // Propagate to all subscribers immediately without page reload
    this.listeners.forEach((fn) => fn(tuning));
  }

  public static subscribe(listener: (tuning: NativeHarpTuning) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Check if a given major key is playable on the specified native harp tuning.
   */
  public static isMajorKeyPlayable(tuning: NativeHarpTuning, key: string): boolean {
    return PLAYABLE_MAJOR_KEYS[tuning].includes(key);
  }

  /**
   * Check if a given minor key is playable on the specified native harp tuning.
   */
  public static isMinorKeyPlayable(tuning: NativeHarpTuning, key: string): boolean {
    return PLAYABLE_MINOR_KEYS[tuning].includes(key);
  }

  /**
   * Resolves the lever positions (0 = DOWN, 1 = UP) for a given key and native tuning.
   * If key is not natively playable, fallback to root tonic baseline.
   */
  public static getLeverConfiguration(tuning: NativeHarpTuning, key: string): LeverPositionMap {
    if (tuning === 'C_Major_Native' && (key === 'C#' || key === 'A#_minor')) return {C:1,D:1,E:1,F:1,G:1,A:1,B:1};
    const configMap = LEVER_CONFIGS_BY_KEY[tuning];
    if (configMap && configMap[key]) {
      return { ...configMap[key] };
    }
    // Fallback: Default to all levers down
    return { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
  }

  /**
   * Calculate exact MIDI note number for a string with current lever state.
   */
  public static getStringMidi(
    tuning: NativeHarpTuning,
    letter: StringLetter,
    leverUp: boolean,
    octave: number = 4
  ): number {
    const baseline = TUNING_STRING_BASELINES[tuning][letter];
    const baseMidi = baseline.openMidi + (octave - 4) * 12;
    return leverUp ? baseMidi + 1 : baseMidi;
  }

  /**
   * Convert MIDI number to frequency in Hz.
   */
  public static midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Returns root MIDI note for a key name (e.g., 'C' -> 60, 'Eb' -> 63, 'G' -> 67).
   */
  public static getRootMidiForKey(key: string, octave: number = 4): number {
    const semitonesFromC: Record<string, number> = {
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
    const offset = semitonesFromC[key] ?? 0;
    return 12 * (octave + 1) + offset;
  }

  /**
   * Returns a random playable major key for the current native tuning.
   * If nonC is true, excludes C Major.
   */
  public static getRandomPlayableMajorKey(tuning: NativeHarpTuning, nonC: boolean = false): string {
    let keys = PLAYABLE_MAJOR_KEYS[tuning];
    if (nonC) {
      keys = keys.filter((k) => k !== 'C');
    }
    const idx = Math.floor(Math.random() * keys.length);
    return keys[idx];
  }

  /**
   * Returns a random playable minor key for the current native tuning.
   * If nonC is true, excludes C Minor / A Minor.
   */
  public static getRandomPlayableMinorKey(tuning: NativeHarpTuning, nonC: boolean = false): string {
    let keys = PLAYABLE_MINOR_KEYS[tuning];
    if (nonC) {
      keys = keys.filter((k) => k !== 'C');
    }
    const idx = Math.floor(Math.random() * keys.length);
    return keys[idx];
  }
}
