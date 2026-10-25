/**
 * EARPA AUDIO & CADENCE ENGINE TYPES
 * Standardized constants, state machine definitions, and musical frequency interfaces
 * based on Track R1 (Alain Benbassat Method) & Track R2 (Celtic Harp Acoustics).
 */

export type ScaleDegree =
  | '1'
  | 'b2'
  | '2'
  | 'b3'
  | '3'
  | '4'
  | '#4'
  | '5'
  | 'b6'
  | '6'
  | 'b7'
  | '7'
  | '8';

export type SolfegeName =
  | 'Do'
  | 'Ra'
  | 'Re'
  | 'Me'
  | 'Mi'
  | 'Fa'
  | 'Fi'
  | 'Sol'
  | 'Le'
  | 'La'
  | 'Te'
  | 'Ti'
  | 'Do8';

export interface MusicalNote {
  degree: ScaleDegree;
  solfege: SolfegeName;
  midiNumber: number;
  frequencyHz: number;
  semitonesFromRoot: number;
  octaveOffset: number;
}

export type CadenceVoicing = 'root' | 'inverted' | 'celtic_arpeggiated';

export type TimbreType = 'celtic_nylon' | 'celtic_wire' | 'concert_piano';

export type ResolutionDirection = 'natural' | 'down' | 'up' | 'closest';

export interface CadenceTimingConfig {
  bpm: number;
  chordDurationMs: number;
  finalTonicHoldMs: number;
  preStimulusSilenceMs: number;
  postGuessBeatMs: number;
  resolutionStepDurationMs: number;
  resolutionTonicHoldMs: number;
  singleNoteSustainMs: number;
  melodyNoteIoiMs: number;
  fingerRollArpeggioMs: number;
}

export const DEFAULT_CADENCE_TIMINGS: CadenceTimingConfig = {
  bpm: 80.0,
  chordDurationMs: 950,
  finalTonicHoldMs: 1600,
  preStimulusSilenceMs: 650,
  postGuessBeatMs: 300,
  resolutionStepDurationMs: 560, // Calibrated steady singing pace matching authentic Alain Benbassat FET
  resolutionTonicHoldMs: 1600, // Settle completely into tonic arrival
  singleNoteSustainMs: 950,
  melodyNoteIoiMs: 480,
  fingerRollArpeggioMs: 52,
};

export type AudioFSMState =
  | 'IDLE'
  | 'PLAYING_CADENCE'
  | 'PRE_STIMULUS_SILENCE'
  | 'PRESENTING_STIMULUS'
  | 'AWAITING_INPUT'
  | 'POST_GUESS_EVALUATION'
  | 'RESOLUTION_WALKDOWN'
  | 'COMPLETED';

export interface TrialEvaluation {
  stimulusDegree: ScaleDegree;
  guessedDegree: ScaleDegree;
  isCorrect: boolean;
  responseLatencyMs: number;
  resolutionPath: ScaleDegree[];
}

