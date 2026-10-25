/**
 * EARPA HARP SOUND SYNTHESIZER
 * Extended Karplus-Strong Physical Plucked String Synthesizer with Sitka Spruce
 * soundboard body resonance formant filters and stereo room convolution.
 * Acoustically modeled after authentic wooden Celtic lever harps.
 */

import { CadenceEngine, VoiceLeadingChord } from './CadenceEngine';
import { ResolutionStep } from './ResolutionWalker';
import { TimbreType } from './types';

export class HarpSoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundboardBloomFilter: BiquadFilterNode | null = null;
  private soundboardWoodFilter: BiquadFilterNode | null = null;
  private highCutFilter: BiquadFilterNode | null = null;
  private dryGain: GainNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  private pendingTimers = new Set<ReturnType<typeof setTimeout>>();
  private voices = new Set<AudioBufferSourceNode>();
  private schedule(callback: () => void, delay: number): void {
    const timer = setTimeout(() => { this.pendingTimers.delete(timer); callback(); }, delay);
    this.pendingTimers.add(timer);
  }
  public stopAll(): void {
    this.pendingTimers.forEach(clearTimeout);
    this.pendingTimers.clear();
    this.voices.forEach(source => { try { source.stop(); } catch {} });
    this.voices.clear();
  }
  public dispose(): void {
    this.stopAll();
    void this.audioCtx?.close();
    this.audioCtx = null;
    this.bufferCache.clear();
  }

  private currentTimbre: TimbreType = 'celtic_nylon';
  private bufferCache: Map<string, AudioBuffer> = new Map();

  constructor(timbre: TimbreType = 'celtic_nylon') {
    this.currentTimbre = timbre;
  }

  /**
   * Initialize or resume the Web Audio Context lazily on user touch,
   * wiring the physical soundboard formant filters and stereo room convolution.
   */
  public async initAudio(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;

      if (!this.audioCtx) {
        const AudioContextClass =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return false;

        const ctx: AudioContext = new AudioContextClass();
        this.audioCtx = ctx;

        // Master Output Gain
        this.masterGain = ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.55, ctx.currentTime);
        this.masterGain.connect(ctx.destination);

        // Warm Spruce Soundboard Formant Filters:
        // 1. Deep Helmholtz body bloom around 180Hz (Sitka spruce cavity resonance)
        this.soundboardBloomFilter = ctx.createBiquadFilter();
        this.soundboardBloomFilter.type = 'peaking';
        this.soundboardBloomFilter.frequency.setValueAtTime(180, ctx.currentTime);
        this.soundboardBloomFilter.Q.setValueAtTime(1.5, ctx.currentTime);
        this.soundboardBloomFilter.gain.setValueAtTime(4.5, ctx.currentTime);

        // 2. Sitka spruce soundboard plate & cavity formant (calibrated to WhatsApp recording 331Hz)
        this.soundboardWoodFilter = ctx.createBiquadFilter();
        this.soundboardWoodFilter.type = 'peaking';
        this.soundboardWoodFilter.frequency.setValueAtTime(331, ctx.currentTime);
        this.soundboardWoodFilter.Q.setValueAtTime(2.0, ctx.currentTime);
        this.soundboardWoodFilter.gain.setValueAtTime(4.2, ctx.currentTime);

        // 3. Acoustic high-cut roll-off filter (calibrated to physical harp steep roll-off above 2400Hz)
        this.highCutFilter = ctx.createBiquadFilter();
        this.highCutFilter.type = 'lowpass';
        this.highCutFilter.frequency.setValueAtTime(2100, ctx.currentTime);
        this.highCutFilter.Q.setValueAtTime(0.707, ctx.currentTime);

        // Connect Formant Chain
        this.soundboardBloomFilter.connect(this.soundboardWoodFilter);
        this.soundboardWoodFilter.connect(this.highCutFilter);

        // Dry Bus
        this.dryGain = ctx.createGain();
        this.dryGain.gain.setValueAtTime(0.82, ctx.currentTime);
        this.highCutFilter.connect(this.dryGain);
        this.dryGain.connect(this.masterGain);

        // Subtle Stereo Wooden Room Reverb Convolver
        this.reverbGain = ctx.createGain();
        this.reverbGain.gain.setValueAtTime(0.24, ctx.currentTime);
        try {
          this.reverbConvolver = ctx.createConvolver();
          this.reverbConvolver.buffer = this.createRoomImpulseResponse(ctx);
          this.highCutFilter.connect(this.reverbConvolver);
          this.reverbConvolver.connect(this.reverbGain);
          this.reverbGain.connect(this.masterGain);
        } catch {
          // Convolver fallback: continue purely on dry path if unsupported
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        try {
          await Promise.race([
            this.audioCtx.resume(),
            new Promise((resolve) => setTimeout(resolve, 250)),
          ]);
        } catch {}
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Synchronously unlock Web Audio context on user gesture (click/pointerdown)
   */
  public unlockSynchronously(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume();
      } catch {}
    }
  }

  public setTimbre(timbre: TimbreType): void {
    if (this.currentTimbre !== timbre) {
      this.currentTimbre = timbre;
      this.bufferCache.clear();
    }
  }

  public getTimbre(): TimbreType {
    return this.currentTimbre;
  }

  public clearBufferCache(): void {
    this.bufferCache.clear();
  }

  /**
   * Synthesizes or retrieves a cached AudioBuffer for the given pitch and timbre.
   */
  public getOrCreatePluckBuffer(
    frequencyHz: number,
    durationSec: number = 3.2
  ): AudioBuffer | null {
    if (!this.audioCtx) return null;

    const midi = Math.round(69 + 12 * Math.log2(frequencyHz / 440));
    const cacheKey = `${frequencyHz}_${durationSec}_${this.currentTimbre}`;

    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    const sampleRate = this.audioCtx.sampleRate || 44100;
    const samples = HarpSoundSynthesizer.generatePluckedStringSamples(
      frequencyHz,
      durationSec,
      this.currentTimbre,
      sampleRate
    );

    const buffer = this.audioCtx.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    this.bufferCache.set(cacheKey, buffer);
    return buffer;
  }

  /**
   * Synthesize a plucked Celtic harp note using the Extended Karplus-Strong physical model.
   */
  public playPluck(
    frequencyHz: number,
    durationMs: number = 2000,
    velocity: number = 0.8
  ): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;
    const durSec = durationMs / 1000;

    const buffer = this.getOrCreatePluckBuffer(frequencyHz, Math.max(durSec, 2.5));
    if (!buffer) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;

    const noteGain = this.audioCtx.createGain();
    const peakGain = Math.max(0.01, Math.min(velocity, 1.0));

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + 0.008);
    const releaseStart = Math.max(0.05, durSec - 0.08);
    noteGain.gain.setValueAtTime(peakGain, now + releaseStart);
    noteGain.gain.linearRampToValueAtTime(0.0001, now + durSec);

    source.connect(noteGain);
    if (this.soundboardBloomFilter) {
      noteGain.connect(this.soundboardBloomFilter);
    } else {
      noteGain.connect(this.masterGain);
    }

    this.voices.add(source);
    source.onended = () => { this.voices.delete(source); source.disconnect(); noteGain.disconnect(); };
    source.start(now);
    source.stop(now + durSec + 0.1);
  }

  /**
   * Voice the 4-note SATB cadence chords with a natural, musical harpist arpeggio roll
   * (45ms between bass, tenor, alto, soprano) so the I - IV - V - I cadence sounds rich and angelic.
   */
  public playChord(chord: VoiceLeadingChord, isRolled: boolean = true): void {
    if (!this.audioCtx) return;

    chord.allMidi.forEach((midi, idx) => {
      const freq = CadenceEngine.midiToFreq(midi);
      // 52ms roll delay between bass (idx 0), tenor (idx 1), alto (idx 2), soprano (idx 3)
      const delayMs = isRolled ? idx * 52 : 0;

      this.schedule(() => {
        // Lower bass notes voiced slightly richer and louder
        const velocity = idx === 0 ? 0.92 : idx === 3 ? 0.82 : 0.76;
        this.playPluck(freq, chord.durationMs, velocity);
      }, delayMs);
    });
  }

  /**
   * Play the stepwise resolution walkdown/walkup with calibrated pauses.
   */
  public playResolutionSequence(
    steps: ResolutionStep[],
    onComplete?: () => void
  ): void {
    let accumulatedDelayMs = 0;

    steps.forEach((step, idx) => {
      const isFinal = idx === steps.length - 1;
      this.schedule(() => {
        this.playPluck(step.frequencyHz, step.durationMs, isFinal ? 0.95 : 0.75);
      }, accumulatedDelayMs);

      accumulatedDelayMs += step.durationMs;
    });

    if (onComplete) {
      this.schedule(onComplete, accumulatedDelayMs);
    }
  }

  /**
   * Generates a Float32Array of physical plucked string samples at 44.1kHz.
   * Employs:
   * 1. Dual-stage finger-pad pluck excitation (pink-filtered noise + warm fundamental displacement).
   * 2. Tuned fractional delay line with a 2-point averaging loop filter.
   * 3. Frequency-dependent damping: 0.996 for bass down to 0.991 for treble.
   * 4. Subtle sympathetic octave resonance mode (2 * f0).
   * 5. Sitka spruce soundboard body resonance formant filtering (220Hz bloom, 460Hz wood plate, high roll-off).
   */
  public static generatePluckedStringSamples(
    frequencyHz: number,
    durationSec: number = 3.2,
    timbre: TimbreType = 'celtic_nylon',
    sampleRate: number = 44100
  ): Float32Array {
    const f0 = Math.max(30, Math.min(3500, frequencyHz));
    const totalSamples = Math.floor(sampleRate * durationSec);
    const out = new Float32Array(totalSamples);

    // Fundamental delay line parameters
    const P = sampleRate / f0;
    const D = Math.max(2, P - 0.5); // Subtract 0.5 phase delay of loop filter
    const L = Math.floor(D);
    const f = D - L;
    const delay = new Float32Array(L + 3);

    // Frequency-dependent damping: 0.996 (bass, MIDI 36) down to 0.991 (treble, MIDI 84)
    const midi = 69 + 12 * Math.log2(f0 / 440);
    const t = Math.max(0, Math.min(1, (midi - 36) / (84 - 36)));
    let rho = 0.996 - t * (0.996 - 0.991);
    if (timbre === 'celtic_wire') {
      rho = Math.min(0.998, rho + 0.0012);
    } else if (timbre === 'concert_piano') {
      rho = Math.max(0.988, rho - 0.0012);
    }

    // Dual-Stage Finger-Pad Pluck Excitation
    const N_exc = Math.max(24, Math.min(L, 480));
    let b0 = 0, b1 = 0, b2 = 0;
    const pink = new Float32Array(N_exc);
    for (let i = 0; i < N_exc; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      pink[i] = b0 + b1 + b2 + white * 0.1848;
    }

    // Lowpass filter pink noise (~600Hz fleshy finger pad contact damping)
    const alphaLP = Math.exp((-2 * Math.PI * 600) / sampleRate);
    let lpState = 0;
    for (let i = 0; i < N_exc; i++) {
      lpState = (1 - alphaLP) * pink[i] + alphaLP * lpState;
      pink[i] = lpState;
    }

    // Blend warm fundamental displacement window with pink noise
    const fundWeight =
      timbre === 'celtic_nylon' ? 0.72 : timbre === 'celtic_wire' ? 0.42 : 0.55;
    const noiseWeight = 1.0 - fundWeight;
    let excSum = 0;
    for (let i = 0; i < N_exc; i++) {
      const env = Math.sin((Math.PI * i) / (N_exc - 1));
      const fund = Math.sin((2 * Math.PI * f0 * i) / sampleRate);
      delay[i] = env * (fundWeight * fund + noiseWeight * pink[i]);
      excSum += delay[i];
    }
    // Remove DC offset
    const excMean = excSum / N_exc;
    for (let i = 0; i < N_exc; i++) {
      delay[i] -= excMean;
    }

    // Coupled Sympathetic Octave Resonance Mode (2 * f0)
    const P2 = sampleRate / (2 * f0);
    const D2 = Math.max(2, P2 - 0.5);
    const L2 = Math.floor(D2);
    const f2 = D2 - L2;
    const delay2 = new Float32Array(L2 + 3);
    const rho2 = rho * 0.994;
    const N_exc2 = Math.min(L2, N_exc);
    let exc2Sum = 0;
    for (let i = 0; i < N_exc2; i++) {
      const env2 = Math.sin((Math.PI * i) / (N_exc2 - 1));
      delay2[i] = env2 * 0.18 * Math.sin((4 * Math.PI * f0 * i) / sampleRate);
      exc2Sum += delay2[i];
    }
    const exc2Mean = exc2Sum / N_exc2;
    for (let i = 0; i < N_exc2; i++) {
      delay2[i] -= exc2Mean;
    }

    // Karplus-Strong Loop with fractional delay and 2-point averaging
    let p1 = 0, prev1 = 0;
    let p2 = 0, prev2 = 0;

    for (let n = 0; n < totalSamples; n++) {
      // Main fundamental string
      const s1 = (1 - f) * delay[p1] + f * delay[(p1 + 1) % (L + 1)];
      const filt1 = 0.5 * (s1 + prev1);
      prev1 = s1;
      delay[p1] = filt1 * rho;
      p1 = (p1 + 1) % (L + 1);

      // Sympathetic octave mode
      const s2 = (1 - f2) * delay2[p2] + f2 * delay2[(p2 + 1) % (L2 + 1)];
      const filt2 = 0.5 * (s2 + prev2);
      prev2 = s2;
      delay2[p2] = filt2 * rho2;
      p2 = (p2 + 1) % (L2 + 1);

      out[n] = s1 + 0.13 * s2;
    }

    // Apply micro-attack ramp over 32 samples (~0.7ms) to guarantee zero click at sample 0
    const rampLen = Math.min(32, totalSamples);
    for (let i = 0; i < rampLen; i++) {
      const ramp = 0.5 * (1 - Math.cos((Math.PI * i) / rampLen));
      out[i] *= ramp;
    }

    // Spruce Soundboard Formant Filter modeling
    // 1. Deep Helmholtz body bloom around 180Hz
    HarpSoundSynthesizer.applyBiquadFilterInPlace(
      out,
      sampleRate,
      'peaking',
      180,
      1.5,
      5.5
    );
    // 2. Secondary wood presence around 280Hz
    HarpSoundSynthesizer.applyBiquadFilterInPlace(
      out,
      sampleRate,
      'peaking',
      280,
      1.8,
      4.2
    );
    // 3. Warm nylon/gut high-cut roll-off at 3400Hz
    HarpSoundSynthesizer.applyBiquadFilterInPlace(
      out,
      sampleRate,
      'lowpass',
      3400,
      0.707
    );

    // Normalize peak to 0.85
    let peak = 0;
    for (let i = 0; i < totalSamples; i++) {
      const absVal = Math.abs(out[i]);
      if (absVal > peak) peak = absVal;
    }
    if (peak > 0.0001) {
      const scale = 0.85 / peak;
      for (let i = 0; i < totalSamples; i++) {
        out[i] *= scale;
      }
    }

    return out;
  }

  /**
   * Synthesize a warm stereo room impulse response modeling wooden parlor acoustics.
   */
  private createRoomImpulseResponse(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate || 44100;
    const duration = 1.25;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    // Early discrete reflection taps
    const earlyLeftTaps = [
      { delay: 0.012, gain: 0.35 },
      { delay: 0.026, gain: 0.28 },
      { delay: 0.041, gain: 0.22 },
      { delay: 0.059, gain: 0.17 },
      { delay: 0.078, gain: 0.13 },
    ];
    const earlyRightTaps = [
      { delay: 0.015, gain: 0.33 },
      { delay: 0.029, gain: 0.26 },
      { delay: 0.046, gain: 0.21 },
      { delay: 0.064, gain: 0.16 },
      { delay: 0.084, gain: 0.12 },
    ];

    earlyLeftTaps.forEach((tap) => {
      const idx = Math.floor(tap.delay * sampleRate);
      if (idx < length) left[idx] += tap.gain;
    });
    earlyRightTaps.forEach((tap) => {
      const idx = Math.floor(tap.delay * sampleRate);
      if (idx < length) right[idx] += tap.gain;
    });

    // Late diffuse wooden reverberation
    const decayFactor = 0.32;
    let lpL = 0, lpR = 0;
    const lpCoeff = 0.72;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t / decayFactor);
      const whiteL = (Math.random() * 2 - 1) * env * 0.15;
      const whiteR = (Math.random() * 2 - 1) * env * 0.15;

      lpL = lpCoeff * lpL + (1 - lpCoeff) * whiteL;
      lpR = lpCoeff * lpR + (1 - lpCoeff) * whiteR;

      left[i] += lpL;
      right[i] += lpR;

      if (i > length - 2000) {
        const fade = (length - i) / 2000;
        left[i] *= fade;
        right[i] *= fade;
      }
    }

    return impulse;
  }

  private static applyBiquadFilterInPlace(
    samples: Float32Array,
    sampleRate: number,
    type: 'peaking' | 'lowpass',
    f0: number,
    Q: number,
    gainDb: number = 0
  ): void {
    const w0 = (2 * Math.PI * f0) / sampleRate;
    const alpha = Math.sin(w0) / (2 * Q);
    const cosw0 = Math.cos(w0);
    let b0 = 0, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

    if (type === 'peaking') {
      const A = Math.pow(10, gainDb / 40);
      b0 = 1 + alpha * A;
      b1 = -2 * cosw0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosw0;
      a2 = 1 - alpha / A;
    } else if (type === 'lowpass') {
      b0 = (1 - cosw0) / 2;
      b1 = 1 - cosw0;
      b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
    }

    b0 /= a0;
    b1 /= a0;
    b2 /= a0;
    a1 /= a0;
    a2 /= a0;

    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < samples.length; i++) {
      const x = samples[i];
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y;
      samples[i] = y;
    }
  }
}
