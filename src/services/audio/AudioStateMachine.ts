/**
 * EARPA AUDIO COGNITIVE FINITE STATE MACHINE
 * Orchestrates the exact empirical timing, stimulus presentation, and resolution
 * walkdown lifecycle for every functional ear training trial.
 */

import { AudioFSMState, ScaleDegree, TrialEvaluation, ResolutionDirection } from './types';
import { CadenceEngine } from './CadenceEngine';
import { ResolutionWalker } from './ResolutionWalker';
import { HarpSoundSynthesizer } from './HarpSoundSynthesizer';

export interface FSMCallbacks {
  onStateChange: (state: AudioFSMState) => void;
  onCadenceChordPlay: (chordIndex: number, romanNumeral: string) => void;
  onStimulusPlayed: (stimulusMidi: number, stimulusFreq: number) => void;
  onStepwiseNotePlayed: (degree: ScaleDegree, midi: number, freq: number) => void;
  onTrialEvaluated: (evalData: TrialEvaluation) => void;
}

export class AudioStateMachine {
  private state: AudioFSMState = 'IDLE';
  private cadenceEngine: CadenceEngine;
  private resolutionWalker: ResolutionWalker;
  private synthesizer: HarpSoundSynthesizer;
  private callbacks: Partial<FSMCallbacks> = {};

  private currentRootMidi: number = 63; // Default Eb4 for Celtic Harp Standard
  private currentStimulusDegree: ScaleDegree = '1';
  private currentStimulusMidi: number = 63;
  private stimulusTimestamp: number = 0;

  constructor(
    synthesizer: HarpSoundSynthesizer,
    cadenceEngine?: CadenceEngine,
    resolutionWalker?: ResolutionWalker
  ) {
    this.synthesizer = synthesizer;
    this.cadenceEngine = cadenceEngine || new CadenceEngine();
    this.resolutionWalker = resolutionWalker || new ResolutionWalker();
  }

  public setCallbacks(callbacks: Partial<FSMCallbacks>): void {
    this.callbacks = callbacks;
  }

  public getState(): AudioFSMState {
    return this.state;
  }

  /**
   * Start a complete training trial: plays cadence, pauses, presents stimulus.
   */
  public async startTrial(
    stimulusDegree: ScaleDegree,
    rootMidi: number = 63,
    octaveShift: number = 0,
    skipCadence: boolean = false
  ): Promise<void> {
    if (this.state !== 'IDLE' && this.state !== 'COMPLETED') {
      return;
    }

    await this.synthesizer.initAudio();
    this.currentRootMidi = rootMidi;
    this.currentStimulusDegree = stimulusDegree;

    const semitones = ResolutionWalker.getSemitones(stimulusDegree);
    this.currentStimulusMidi = rootMidi + semitones + octaveShift * 12;

    if (skipCadence) {
      this.presentStimulus();
      return;
    }

    this.transitionTo('PLAYING_CADENCE');
    const chords = this.cadenceEngine.generateCadence(rootMidi);
    let delayMs = 0;

    chords.forEach((chord, idx) => {
      setTimeout(() => {
        if (this.callbacks.onCadenceChordPlay) {
          this.callbacks.onCadenceChordPlay(idx, chord.romanNumeral);
        }
        this.synthesizer.playChord(chord, true);
      }, delayMs);

      delayMs += chord.durationMs;
    });

    // After cadence completes, transition to calibrated silence
    setTimeout(() => {
      this.transitionTo('PRE_STIMULUS_SILENCE');
      const timings = this.cadenceEngine.getTimingConfig();

      setTimeout(() => {
        this.presentStimulus();
      }, timings.preStimulusSilenceMs);
    }, delayMs);
  }

  private presentStimulus(): void {
    this.transitionTo('PRESENTING_STIMULUS');
    const freq = CadenceEngine.midiToFreq(this.currentStimulusMidi);

    if (this.callbacks.onStimulusPlayed) {
      this.callbacks.onStimulusPlayed(this.currentStimulusMidi, freq);
    }

    // Play mystery note in acoustic space (velocity 0.9, duration 1800ms)
    this.synthesizer.playPluck(freq, 1800, 0.9);
    this.stimulusTimestamp = Date.now();

    // Brief 250ms window before user can tap to prevent accidental double taps
    setTimeout(() => {
      this.transitionTo('AWAITING_INPUT');
    }, 250);
  }

  /**
   * User submits their scale degree guess via the touch shelf.
   */
  public submitGuess(guessedDegree: ScaleDegree): TrialEvaluation | null {
    if (this.state !== 'AWAITING_INPUT') {
      return null;
    }

    const responseLatencyMs = Date.now() - this.stimulusTimestamp;
    const isCorrect = guessedDegree === this.currentStimulusDegree;

    this.transitionTo('POST_GUESS_EVALUATION');
    const timings = this.cadenceEngine.getTimingConfig();

    const path = this.resolutionWalker.generatePath(
      this.currentStimulusDegree,
      this.currentRootMidi
    );
    const resolutionPathDegrees = path.map((s) => s.degree);

    const evalData: TrialEvaluation = {
      stimulusDegree: this.currentStimulusDegree,
      guessedDegree,
      isCorrect,
      responseLatencyMs,
      resolutionPath: resolutionPathDegrees,
    };

    if (this.callbacks.onTrialEvaluated) {
      this.callbacks.onTrialEvaluated(evalData);
    }

    // After post-guess confirmation beat (300ms), begin resolution walkdown
    setTimeout(() => {
      this.transitionTo('RESOLUTION_WALKDOWN');

      let accumulatedDelay = 0;
      path.forEach((step) => {
        setTimeout(() => {
          if (this.callbacks.onStepwiseNotePlayed) {
            this.callbacks.onStepwiseNotePlayed(step.degree, step.midiNumber, step.frequencyHz);
          }
        }, accumulatedDelay);
        accumulatedDelay += step.durationMs;
      });

      this.synthesizer.playResolutionSequence(path, () => {
        this.transitionTo('COMPLETED');
      });
    }, timings.postGuessBeatMs);

    return evalData;
  }

  public reset(): void {
    this.transitionTo('IDLE');
  }

  public setRootMidi(rootMidi: number): void {
    this.currentRootMidi = rootMidi;
  }

  public getRootMidi(): number {
    return this.currentRootMidi;
  }

  /**
   * Explicitly triggers a custom stepwise resolution (down to 1, up to 8, or natural).
   * Allows the UI to trigger stepwise resolution plucks on demand.
   */
  public playCustomResolution(
    degree: ScaleDegree,
    direction: 'down' | 'up' | 'natural',
    onStep?: (deg: ScaleDegree, midi: number) => void,
    onDone?: () => void
  ): void {
    this.transitionTo('RESOLUTION_WALKDOWN');
    void this.synthesizer.initAudio().then(() => {
      const path = this.resolutionWalker.generatePath(
        degree,
        this.currentRootMidi,
        direction
      );

      let accumulatedDelay = 0;
      path.forEach((step) => {
        setTimeout(() => {
          if (onStep) {
            onStep(step.degree, step.midiNumber);
          }
          if (this.callbacks.onStepwiseNotePlayed) {
            this.callbacks.onStepwiseNotePlayed(step.degree, step.midiNumber, step.frequencyHz);
          }
        }, accumulatedDelay);
        accumulatedDelay += step.durationMs;
      });

      this.synthesizer.playResolutionSequence(path, () => {
        this.transitionTo('COMPLETED');
        if (onDone) {
          onDone();
        }
      });
    });
  }

  private transitionTo(newState: AudioFSMState): void {
    this.state = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }
}
