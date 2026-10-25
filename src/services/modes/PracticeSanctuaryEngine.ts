/**
 * EARPA PRACTICE SANCTUARY ENGINE
 * Unconstrained sandbox providing continuous harmonic drone synthesis (root + fifth dyad),
 * microtonal cents detuning, free plucking sandbox, and custom BPM cadence player.
 */

import { PracticeSanctuaryConfig } from './types';
import { PitchClass } from '../theory/types';

export class PracticeSanctuaryEngine {
  private config: PracticeSanctuaryConfig;
  private audioCtx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private rootOsc: OscillatorNode | null = null;
  private fifthOsc: OscillatorNode | null = null;

  constructor(initialRoot: PitchClass = 3) {
    this.config = {
      rootPitchClass: initialRoot,
      mode: 'ionian',
      droneActive: false,
      droneVolume: 0.35,
      cadenceBpm: 80,
      freePluckAudible: true,
      activeStimulusPool: ['1', '2', '3', '4', '5', '6', '7', '8'],
    };
  }

  public getConfig(): PracticeSanctuaryConfig {
    return { ...this.config };
  }

  public setCadenceBpm(bpm: number): void {
    this.config.cadenceBpm = Math.max(40, Math.min(180, bpm));
  }

  public setDroneVolume(volume: number): void {
    this.config.droneVolume = Math.max(0, Math.min(1, volume));
    if (this.droneGain && this.audioCtx) {
      this.droneGain.gain.setValueAtTime(this.config.droneVolume, this.audioCtx.currentTime);
    }
  }

  /**
   * Initializes or toggles continuous fifths drone (e.g. Eb2 + Bb2).
   */
  public async toggleDrone(): Promise<boolean> {
    if (this.config.droneActive) {
      this.stopDrone();
      this.config.droneActive = false;
      return false;
    } else {
      await this.startDrone();
      this.config.droneActive = true;
      return true;
    }
  }

  private async startDrone(): Promise<void> {
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master drone gain
      this.droneGain = ctx.createGain();
      this.droneGain.gain.setValueAtTime(this.config.droneVolume, now);

      // Lowpass filter for warm, cello-like acoustic body
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);

      this.droneGain.connect(filter);
      filter.connect(ctx.destination);

      // Calculate root frequency in low bass octave 2 (e.g. Eb2 = ~77.78 Hz)
      const rootMidi = 36 + this.config.rootPitchClass; // Octave 2
      const rootFreq = 440 * Math.pow(2, (rootMidi - 69) / 12);

      // Calculate fifth frequency (7 semitones higher, e.g. Bb2 = ~116.54 Hz)
      const fifthFreq = rootFreq * Math.pow(2, 7 / 12);

      // Root Oscillator
      this.rootOsc = ctx.createOscillator();
      this.rootOsc.type = 'triangle';
      this.rootOsc.frequency.setValueAtTime(rootFreq, now);

      // Fifth Oscillator
      this.fifthOsc = ctx.createOscillator();
      this.fifthOsc.type = 'sine';
      this.fifthOsc.frequency.setValueAtTime(fifthFreq, now);

      this.rootOsc.connect(this.droneGain);
      this.fifthOsc.connect(this.droneGain);

      this.rootOsc.start(now);
      this.fifthOsc.start(now);
    } catch {
      // In-memory or fallback mode
    }
  }

  public stopDrone(): void {
    try {
      if (this.rootOsc) {
        this.rootOsc.stop();
        this.rootOsc.disconnect();
        this.rootOsc = null;
      }
      if (this.fifthOsc) {
        this.fifthOsc.stop();
        this.fifthOsc.disconnect();
        this.fifthOsc = null;
      }
    } catch {
      // Ignored
    }
  }

  public updateKey(rootPitchClass: PitchClass): void {
    this.config.rootPitchClass = rootPitchClass;
    if (this.config.droneActive) {
      this.stopDrone();
      this.startDrone();
    }
  }
}
