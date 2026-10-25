/**
 * EARPA CADENCE ENGINE
 * Constructs authentic four-voice SATB authentic cadences (I - IV - V - I)
 * isolating the diatonic tritone (4-7) to collapse key ambiguity instantly,
 * calibrated to the Alain Benbassat empirical timing standards.
 */

import { CadenceVoicing, CadenceTimingConfig, DEFAULT_CADENCE_TIMINGS } from './types';

export interface VoiceLeadingChord {
  romanNumeral: string;
  bassMidi: number;
  tenorMidi: number;
  altoMidi: number;
  sopranoMidi: number;
  allMidi: number[];
  frequenciesHz: number[];
  durationMs: number;
}

export class CadenceEngine {
  private timings: CadenceTimingConfig;

  constructor(timingOverrides?: Partial<CadenceTimingConfig>) {
    this.timings = { ...DEFAULT_CADENCE_TIMINGS, ...timingOverrides };
  }

  /**
   * Convert MIDI note number to fundamental frequency in Hertz.
   */
  public static midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Generates a 4-chord authentic cadence (I - IV - V - I) for any given root tonic MIDI.
   * Default rootMidi: 60 (Middle C) or 63 (Eb4 for Celtic Harp Standard).
   */
  public generateCadence(rootMidi: number = 60, voicing: CadenceVoicing = 'inverted', isMinor: boolean = false): VoiceLeadingChord[] {
    if (isMinor) {
      const b = rootMidi - 12;
      return [
        this.buildChord('i', b, rootMidi + 3, rootMidi + 7, rootMidi + 12, this.timings.chordDurationMs),
        this.buildChord('iv', b + 5, rootMidi + 5, rootMidi + 8, rootMidi + 12, this.timings.chordDurationMs),
        this.buildChord('V', b + 7, rootMidi + 7, rootMidi + 11, rootMidi + 14, this.timings.chordDurationMs),
        this.buildChord('i', b, rootMidi + 3, rootMidi + 7, rootMidi + 12, this.timings.finalTonicHoldMs),
      ];
    }
    const bassOctave = rootMidi - 12; // One octave below central register

    if (voicing === 'inverted') {
      // Smooth voice leading: I - IV6/4 - V6/5 - I retaining common tones
      const chord1: VoiceLeadingChord = this.buildChord(
        'I',
        bassOctave,       // Bass: Root (1)
        rootMidi + 7,     // Tenor: 5th
        rootMidi + 4,     // Alto: 3rd
        rootMidi + 12,    // Soprano: Octave Root (8)
        this.timings.chordDurationMs
      );

      const chord2: VoiceLeadingChord = this.buildChord(
        'IV',
        bassOctave + 5,   // Bass: 4th
        rootMidi + 9,     // Tenor: 6th
        rootMidi + 5,     // Alto: 4th
        rootMidi + 12,    // Soprano: Octave Root (Common tone held)
        this.timings.chordDurationMs
      );

      const chord3: VoiceLeadingChord = this.buildChord(
        'V',
        bassOctave + 7,   // Bass: 5th
        rootMidi + 11,    // Tenor: Leading tone (7th degree - creates tritone with 4th)
        rootMidi + 5,     // Alto: 4th (holds tension)
        rootMidi + 14,    // Soprano: 2nd degree
        this.timings.chordDurationMs
      );

      const chord4: VoiceLeadingChord = this.buildChord(
        'I',
        bassOctave,       // Bass: Root resolution (1)
        rootMidi + 7,     // Tenor: 5th
        rootMidi + 4,     // Alto: 3rd
        rootMidi + 12,    // Soprano: Octave Root (8)
        this.timings.finalTonicHoldMs // Extended sustain
      );

      return [chord1, chord2, chord3, chord4];
    }

    // Standard Root Position Voicing
    const chord1 = this.buildChord('I', bassOctave, rootMidi + 4, rootMidi + 7, rootMidi + 12, this.timings.chordDurationMs);
    const chord2 = this.buildChord('IV', bassOctave + 5, rootMidi + 5, rootMidi + 9, rootMidi + 12, this.timings.chordDurationMs);
    const chord3 = this.buildChord('V', bassOctave + 7, rootMidi + 7, rootMidi + 11, rootMidi + 14, this.timings.chordDurationMs);
    const chord4 = this.buildChord('I', bassOctave, rootMidi + 4, rootMidi + 7, rootMidi + 12, this.timings.finalTonicHoldMs);

    return [chord1, chord2, chord3, chord4];
  }

  private buildChord(
    romanNumeral: string,
    bass: number,
    tenor: number,
    alto: number,
    soprano: number,
    durationMs: number
  ): VoiceLeadingChord {
    const allMidi = [bass, tenor, alto, soprano];
    const frequenciesHz = allMidi.map((m) => CadenceEngine.midiToFreq(m));
    return {
      romanNumeral,
      bassMidi: bass,
      tenorMidi: tenor,
      altoMidi: alto,
      sopranoMidi: soprano,
      allMidi,
      frequenciesHz,
      durationMs,
    };
  }

  public getTimingConfig(): CadenceTimingConfig {
    return { ...this.timings };
  }
}
