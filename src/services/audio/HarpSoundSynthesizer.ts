/**
 * EARPA STUDIO GUT-STRING CELTIC HARP SOUND ENGINE
 * Hybrid Studio Multi-Sampled Natural Gut Harp + Physical Acoustic Fallback Engine.
 *
 * Primary Engine (Browser / PWA):
 *  - Plays 13 studio-recorded, 0.0-cent pitch-calibrated, zero-lag natural gut harp
 *    zones (A2 through D6, spaced every minor/major third in `/audio/harp/*.mp3`,
 *    sourced from Versilian Studios Chamber Orchestra 2 Community Edition CC0).
 *  - Pre-fetches raw sample bytes at module load and decodes into shared AudioBuffers
 *    for instant 0ms polyphonic playback across Hub, Single Notes, Melodies, Levers, & Shop.
 *  - Sculpted through a warm wooden Sitka spruce shelf, silky high-cut filter, natural
 *    velvet chamber convolution, same-string finger re-pluck damping, and a transparent
 *    polyphonic DynamicsCompressorNode soft-limiter so chords & glissandos never clip or sting.
 *
 * Secondary Fallback (Pre-decode / Offline Node Tests):
 *  - Phase-coherent 0.0-cent Physical Modal Gut-String synthesizer (`generatePluckedStringSamples`).
 */

import { CadenceEngine, VoiceLeadingChord } from './CadenceEngine';
import { ResolutionStep } from './ResolutionWalker';
import { TimbreType } from './types';

interface StudioSampleZone {
  note: string;
  midi: number;
  freqHz: number;
  url: string;
}

const STUDIO_GUT_ZONES: StudioSampleZone[] = [
  { note: 'A2', midi: 45, freqHz: 110.0, url: '/audio/harp/A2.mp3' },
  { note: 'C3', midi: 48, freqHz: 130.8128, url: '/audio/harp/C3.mp3' },
  { note: 'E3', midi: 52, freqHz: 164.8138, url: '/audio/harp/E3.mp3' },
  { note: 'G3', midi: 55, freqHz: 195.9977, url: '/audio/harp/G3.mp3' },
  { note: 'B3', midi: 59, freqHz: 246.9417, url: '/audio/harp/B3.mp3' },
  { note: 'D4', midi: 62, freqHz: 293.6648, url: '/audio/harp/D4.mp3' },
  { note: 'F4', midi: 65, freqHz: 349.2282, url: '/audio/harp/F4.mp3' },
  { note: 'A4', midi: 69, freqHz: 440.0, url: '/audio/harp/A4.mp3' },
  { note: 'C5', midi: 72, freqHz: 523.2511, url: '/audio/harp/C5.mp3' },
  { note: 'E5', midi: 76, freqHz: 659.2551, url: '/audio/harp/E5.mp3' },
  { note: 'G5', midi: 79, freqHz: 783.9909, url: '/audio/harp/G5.mp3' },
  { note: 'B5', midi: 83, freqHz: 987.7666, url: '/audio/harp/B5.mp3' },
  { note: 'D6', midi: 86, freqHz: 1174.659, url: '/audio/harp/D6.mp3' },
];

interface ActiveStringVoice {
  source: AudioBufferSourceNode;
  gain: GainNode;
  freqKey: number;
}

export class HarpSoundSynthesizer {
  // Singleton raw ArrayBuffer cache fetched immediately on app startup
  private static rawSampleBytes = new Map<number, ArrayBuffer>();
  private static prefetchPromise: Promise<void> | null = null;
  // Decoded AudioBuffers keyed by sampleRate so multiple AudioContexts share decoded buffers safely
  private static decodedBanksByRate = new Map<number, Map<number, AudioBuffer>>();

  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private warmthShelf: BiquadFilterNode | null = null;
  private silkHighCut: BiquadFilterNode | null = null;
  private dryGain: GainNode | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  private pendingTimers = new Set<ReturnType<typeof setTimeout>>();
  private voices = new Set<AudioBufferSourceNode>();
  private activeByString = new Map<number, ActiveStringVoice>();

  private currentTimbre: TimbreType = 'gut_string_warmth';
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private static sharedPreviewSynth: HarpSoundSynthesizer | null = null;

  /**
   * Kick off non-blocking background fetch of all 13 studio gut harp zones (~625 KB total).
   */
  public static prefetchStudioSamples(): Promise<void> {
    if (typeof window === 'undefined' || typeof fetch !== 'function') {
      return Promise.resolve();
    }
    if (this.prefetchPromise) return this.prefetchPromise;

    this.prefetchPromise = Promise.all(
      STUDIO_GUT_ZONES.map(async (zone) => {
        if (this.rawSampleBytes.has(zone.midi)) return;
        try {
          const res = await fetch(zone.url, { cache: 'force-cache' });
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (buf && buf.byteLength > 256) {
              this.rawSampleBytes.set(zone.midi, buf);
            }
          }
        } catch {
          // Offline or dev test environment; fallback synthesis handles seamlessly
        }
      })
    ).then(() => undefined);

    return this.prefetchPromise;
  }

  private async ensureStudioBankDecoded(ctx: AudioContext): Promise<void> {
    const rate = ctx.sampleRate || 44100;
    let rateMap = HarpSoundSynthesizer.decodedBanksByRate.get(rate);
    if (!rateMap) {
      rateMap = new Map<number, AudioBuffer>();
      HarpSoundSynthesizer.decodedBanksByRate.set(rate, rateMap);
    }
    if (rateMap.size >= STUDIO_GUT_ZONES.length) return;

    await HarpSoundSynthesizer.prefetchStudioSamples();

    await Promise.all(
      STUDIO_GUT_ZONES.map(async (zone) => {
        if (rateMap!.has(zone.midi)) return;
        const raw = HarpSoundSynthesizer.rawSampleBytes.get(zone.midi);
        if (!raw) return;
        try {
          // Slice ArrayBuffer because decodeAudioData detaches its input buffer in some browsers
          const copy = raw.slice(0);
          const decoded = await ctx.decodeAudioData(copy);
          rateMap!.set(zone.midi, decoded);
        } catch {}
      })
    );
  }

  private findClosestStudioSample(
    frequencyHz: number
  ): { buffer: AudioBuffer; playbackRate: number } | null {
    if (!this.audioCtx) return null;
    const rate = this.audioCtx.sampleRate || 44100;
    const rateMap = HarpSoundSynthesizer.decodedBanksByRate.get(rate);
    if (!rateMap || rateMap.size === 0) return null;

    const targetMidi = 69 + 12 * Math.log2(Math.max(32, frequencyHz) / 440);
    let bestZone: StudioSampleZone | null = null;
    let bestDist = Infinity;

    for (const zone of STUDIO_GUT_ZONES) {
      if (!rateMap.has(zone.midi)) continue;
      const dist = Math.abs(targetMidi - zone.midi);
      if (dist < bestDist) {
        bestDist = dist;
        bestZone = zone;
      }
    }

    if (!bestZone) return null;
    const buffer = rateMap.get(bestZone.midi)!;
    const playbackRate = Math.max(0.25, Math.min(4.0, frequencyHz / bestZone.freqHz));
    return { buffer, playbackRate };
  }

  private schedule(callback: () => void, delay: number): void {
    const timer = setTimeout(() => {
      this.pendingTimers.delete(timer);
      callback();
    }, delay);
    this.pendingTimers.add(timer);
  }

  public stopAll(): void {
    this.pendingTimers.forEach(clearTimeout);
    this.pendingTimers.clear();
    this.voices.forEach((source) => {
      try {
        source.stop();
      } catch {}
    });
    this.voices.clear();
    this.activeByString.clear();
  }

  public dispose(): void {
    this.stopAll();
    void this.audioCtx?.close();
    this.audioCtx = null;
    this.bufferCache.clear();
  }

  public static playWarmHarpChime(
    timbre: TimbreType = 'gut_string_warmth',
    freqHz: number = 329.63
  ): void {
    if (typeof window === 'undefined') return;
    if (!this.sharedPreviewSynth) {
      this.sharedPreviewSynth = new HarpSoundSynthesizer(timbre);
    }
    this.sharedPreviewSynth.initAudio().then(() => {
      if (this.sharedPreviewSynth) {
        this.sharedPreviewSynth.setTimbre(timbre);
        this.sharedPreviewSynth.playPluck(freqHz, 3400, 0.78);
      }
    });
  }

  constructor(timbre: TimbreType = 'gut_string_warmth') {
    this.currentTimbre = timbre;
    if (typeof window !== 'undefined') {
      void HarpSoundSynthesizer.prefetchStudioSamples();
    }
  }

  private getTimbreFilterProfile() {
    if (this.currentTimbre === 'gut_string_warmth') {
      return { shelfDb: 2.8, highCutHz: 2250, reverbWet: 0.12, dryLevel: 0.90 };
    }
    if (this.currentTimbre === 'subtle_cathedral_reverb') {
      return { shelfDb: 1.6, highCutHz: 3100, reverbWet: 0.28, dryLevel: 0.84 };
    }
    return { shelfDb: 1.4, highCutHz: 3400, reverbWet: 0.15, dryLevel: 0.88 };
  }

  private applyTimbreBusVoicing(): void {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const p = this.getTimbreFilterProfile();
    this.warmthShelf?.gain.setValueAtTime(p.shelfDb, now);
    this.silkHighCut?.frequency.setValueAtTime(p.highCutHz, now);
    this.reverbGain?.gain.setValueAtTime(p.reverbWet, now);
    this.dryGain?.gain.setValueAtTime(p.dryLevel, now);
  }

  /**
   * Initialize or resume Web Audio Context lazily on user touch,
   * decoding the 13 studio gut harp zones and wiring the warm Sitka spruce acoustic bus.
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

        // Soft-knee polyphonic limiter so 4-note chords & glissandos never clip or sting
        this.masterLimiter = ctx.createDynamicsCompressor();
        this.masterLimiter.threshold.setValueAtTime(-8.0, ctx.currentTime);
        this.masterLimiter.knee.setValueAtTime(14.0, ctx.currentTime);
        this.masterLimiter.ratio.setValueAtTime(3.0, ctx.currentTime);
        this.masterLimiter.attack.setValueAtTime(0.003, ctx.currentTime);
        this.masterLimiter.release.setValueAtTime(0.20, ctx.currentTime);

        this.masterGain = ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.84, ctx.currentTime);

        this.masterLimiter.connect(this.masterGain);
        this.masterGain.connect(ctx.destination);

        const p = this.getTimbreFilterProfile();

        // Warm wooden soundboard low-shelf
        this.warmthShelf = ctx.createBiquadFilter();
        this.warmthShelf.type = 'lowshelf';
        this.warmthShelf.frequency.setValueAtTime(230, ctx.currentTime);
        this.warmthShelf.gain.setValueAtTime(p.shelfDb, ctx.currentTime);

        // Silky acoustic high-cut preventing any stingy high transients
        this.silkHighCut = ctx.createBiquadFilter();
        this.silkHighCut.type = 'lowpass';
        this.silkHighCut.frequency.setValueAtTime(p.highCutHz, ctx.currentTime);
        this.silkHighCut.Q.setValueAtTime(0.58, ctx.currentTime);

        this.warmthShelf.connect(this.silkHighCut);

        // Direct Dry Bus
        this.dryGain = ctx.createGain();
        this.dryGain.gain.setValueAtTime(p.dryLevel, ctx.currentTime);
        this.silkHighCut.connect(this.dryGain);
        this.dryGain.connect(this.masterLimiter);

        // Natural Wooden Parlor / Stone Sanctuary Reverb Bus
        this.reverbGain = ctx.createGain();
        this.reverbGain.gain.setValueAtTime(p.reverbWet, ctx.currentTime);
        try {
          this.reverbConvolver = ctx.createConvolver();
          this.reverbConvolver.buffer = this.createVelvetChamberImpulse(ctx);
          this.silkHighCut.connect(this.reverbConvolver);
          this.reverbConvolver.connect(this.reverbGain);
          this.reverbGain.connect(this.masterLimiter);
        } catch {}
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        try {
          await Promise.race([
            this.audioCtx.resume(),
            new Promise((resolve) => setTimeout(resolve, 250)),
          ]);
        } catch {}
      }

      if (this.audioCtx) {
        // Decode studio multi-samples into shared AudioBuffers (awaits up to 300ms on cold boot, continues in background if slower)
        await Promise.race([
          this.ensureStudioBankDecoded(this.audioCtx),
          new Promise((resolve) => setTimeout(resolve, 300)),
        ]);
      }

      return true;
    } catch {
      return false;
    }
  }

  public unlockSynchronously(): void {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        try {
          void this.audioCtx.resume();
        } catch {}
      }
      void this.ensureStudioBankDecoded(this.audioCtx);
    }
  }

  public setTimbre(timbre: TimbreType): void {
    if (this.currentTimbre !== timbre) {
      this.currentTimbre = timbre;
      this.bufferCache.clear();
      this.applyTimbreBusVoicing();
    }
  }

  public getTimbre(): TimbreType {
    return this.currentTimbre;
  }

  public clearBufferCache(): void {
    this.bufferCache.clear();
  }

  public getOrCreatePluckBuffer(
    frequencyHz: number,
    durationSec: number = 3.8
  ): AudioBuffer | null {
    if (!this.audioCtx) return null;

    const roundedFreq = Math.round(frequencyHz * 100) / 100;
    const cacheKey = `${roundedFreq}_${durationSec.toFixed(2)}_${this.currentTimbre}`;

    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    const sampleRate = this.audioCtx.sampleRate || 44100;
    const samples = HarpSoundSynthesizer.generatePluckedStringSamples(
      roundedFreq,
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
   * Play a smooth, warm, authentic studio-recorded gut Celtic harp note.
   * Uses the decoded studio gut multi-sample bank with exact 0.0-cent pitch interpolation,
   * falling back seamlessly to physical gut synthesis only if samples are still decoding.
   */
  public playPluck(
    frequencyHz: number,
    durationMs: number = 3200,
    velocity: number = 0.80
  ): void {
    if (!this.audioCtx || !this.masterGain) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const studioMatch = this.findClosestStudioSample(frequencyHz);
    let buffer: AudioBuffer | null = null;
    let playbackRate = 1.0;

    if (studioMatch) {
      buffer = studioMatch.buffer;
      playbackRate = studioMatch.playbackRate;
    } else {
      void this.ensureStudioBankDecoded(ctx);
      buffer = this.getOrCreatePluckBuffer(
        frequencyHz,
        Math.max(3.6, durationMs / 1000)
      );
    }

    if (!buffer) return;

    // Gentle finger-placement damping (42ms) if the exact same string is re-plucked while ringing
    const freqKey = Math.round(frequencyHz * 10);
    const prevVoice = this.activeByString.get(freqKey);
    if (prevVoice) {
      try {
        prevVoice.gain.gain.cancelScheduledValues(now);
        prevVoice.gain.gain.setValueAtTime(
          Math.max(0.0001, prevVoice.gain.gain.value),
          now
        );
        prevVoice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);
        prevVoice.source.stop(now + 0.05);
      } catch {}
      this.activeByString.delete(freqKey);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, now);

    const naturalDurSec = buffer.duration / playbackRate;
    const midi = 69 + 12 * Math.log2(Math.max(40, frequencyHz) / 440);
    const registerTaper =
      midi > 70 ? Math.max(0.72, 1.0 - (midi - 70) * 0.014) : 1.0;
    const peakGain = Math.max(0.02, Math.min(velocity, 1.0)) * 0.82 * registerTaper;

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + 0.003);
    noteGain.gain.setValueAtTime(peakGain, now + Math.max(0.1, naturalDurSec - 0.16));
    noteGain.gain.linearRampToValueAtTime(0.0001, now + naturalDurSec);

    source.connect(noteGain);
    if (this.warmthShelf) {
      noteGain.connect(this.warmthShelf);
    } else {
      noteGain.connect(this.masterGain);
    }

    const voiceRecord: ActiveStringVoice = { source, gain: noteGain, freqKey };
    this.activeByString.set(freqKey, voiceRecord);
    this.voices.add(source);

    source.onended = () => {
      this.voices.delete(source);
      if (this.activeByString.get(freqKey) === voiceRecord) {
        this.activeByString.delete(freqKey);
      }
      try {
        source.disconnect();
        noteGain.disconnect();
      } catch {}
    };

    source.start(now);
    source.stop(now + naturalDurSec + 0.05);
  }

  /**
   * Voice 4-note SATB cadence chords with an authentic, warm upward Celtic harpist finger roll
   * and balanced polyphonic velocities so chords sound lush, clear, and deeply pleasant.
   */
  public playChord(chord: VoiceLeadingChord, isRolled: boolean = true): void {
    if (!this.audioCtx) return;

    const sortedMidi = [...chord.allMidi].sort((a, b) => a - b);

    sortedMidi.forEach((midi, idx) => {
      const freq = CadenceEngine.midiToFreq(midi);
      const delayMs = isRolled ? idx * 58 : 0;

      this.schedule(() => {
        const velocity =
          idx === 0 ? 0.68 : idx === sortedMidi.length - 1 ? 0.58 : 0.52;
        this.playPluck(freq, Math.max(3800, chord.durationMs), velocity);
      }, delayMs);
    });
  }

  /**
   * Play the stepwise resolution walkdown/walkup with natural overlapping gut string sustain.
   */
  public playResolutionSequence(
    steps: ResolutionStep[],
    onComplete?: () => void
  ): void {
    let accumulatedDelayMs = 0;

    steps.forEach((step, idx) => {
      const isFinal = idx === steps.length - 1;
      this.schedule(() => {
        this.playPluck(
          step.frequencyHz,
          Math.max(3600, step.durationMs),
          isFinal ? 0.84 : 0.70
        );
      }, accumulatedDelayMs);

      accumulatedDelayMs += step.durationMs;
    });

    if (onComplete) {
      this.schedule(onComplete, accumulatedDelayMs);
    }
  }

  /**
   * Phase-coherent 0.0-cent Physical Modal Gut-String fallback synthesizer
   * (used synchronously if studio MP3 buffers haven't finished decoding yet or in Node tests).
   */
  public static generatePluckedStringSamples(
    frequencyHz: number,
    durationSec: number = 3.6,
    timbre: TimbreType = 'gut_string_warmth',
    sampleRate: number = 44100
  ): Float32Array {
    const f0 = Math.max(32, Math.min(3200, frequencyHz));
    const totalSamples = Math.floor(sampleRate * durationSec);
    const out = new Float32Array(totalSamples);

    const midi = 69 + 12 * Math.log2(f0 / 440);
    const reg = Math.max(0, Math.min(1, (midi - 40) / 40));

    let pluckBeta = 0.225;
    let padWidth = 0.24;
    let harmonicSlope = 1.85;
    let maxPartialFreq = 2600;
    let sustainScale = 1.0;
    let bodyWoodiness = 0.042;

    if (timbre === 'gut_string_warmth') {
      pluckBeta = 0.265;
      padWidth = 0.34;
      harmonicSlope = 2.05;
      maxPartialFreq = 1950;
      sustainScale = 1.14;
      bodyWoodiness = 0.050;
    } else if (timbre === 'subtle_cathedral_reverb') {
      pluckBeta = 0.235;
      padWidth = 0.27;
      harmonicSlope = 1.92;
      maxPartialFreq = 2400;
      sustainScale = 1.18;
      bodyWoodiness = 0.040;
    }

    const tauFundamental = (1.88 * Math.pow(0.20, reg) + 0.06) * sustainScale;
    const B = 0.000024 * Math.pow(f0 / 261.63, 0.3);
    const maxK = Math.min(
      10,
      Math.max(2, Math.floor(Math.min(maxPartialFreq, sampleRate * 0.42) / f0))
    );

    const dt = 1 / sampleRate;
    const attackSamples = Math.max(12, Math.floor((0.0022 - 0.0006 * reg) * sampleRate));
    const pitchSettleSamples = Math.min(totalSamples, Math.floor(0.028 * sampleRate));

    for (let k = 1; k <= maxK; k++) {
      const fk = k * f0 * Math.sqrt(1 + B * (k * k - 1));
      if (fk > maxPartialFreq && k > 2) break;

      const pluckNodeFactor = Math.abs(Math.sin(k * Math.PI * pluckBeta));
      const padFilter = Math.exp(-0.5 * Math.pow((k - 1) * padWidth, 2));
      const harmonicVoicing = k === 1 ? 1.0 : k === 2 ? 0.72 : k === 3 ? 0.45 : 0.30;
      const ampK =
        (pluckNodeFactor / Math.pow(k, harmonicSlope)) * padFilter * harmonicVoicing;
      if (ampK < 0.0015) continue;

      const tauSlow =
        tauFundamental / (1 + 0.90 * (k - 1) + 0.38 * (k - 1) * (k - 1));
      const tauFast = Math.min(0.14, tauSlow * 0.22);

      const bloomShare = k === 1 ? 0.24 : 0.36;
      const tailShare = 1.0 - bloomShare;

      const decFast = Math.exp(-dt / tauFast);
      const decSlow = Math.exp(-dt / tauSlow);

      const wSteady = (2 * Math.PI * fk) / sampleRate;
      const cosW = Math.cos(wSteady);
      const sinW = Math.sin(wSteady);

      const hasDualPlane = k <= 2;
      const beatHz = k === 1 ? 0.32 + 0.12 * reg : 0.58;
      const wBeat = (2 * Math.PI * (fk + beatHz)) / sampleRate;
      const cosW2 = Math.cos(wBeat);
      const sinW2 = Math.sin(wBeat);

      let envFast = ampK * bloomShare;
      let envSlow = ampK * tailShare;

      let phase1 = 0.0;
      let phase2 = 0.0;
      for (let i = 0; i < pitchSettleSamples; i++) {
        const tensionCents = 1.4 * Math.exp(-i / (0.010 * sampleRate));
        const freqMult = 1.0 + tensionCents * 0.0005776;
        const val = hasDualPlane
          ? 0.78 * Math.sin(phase1) + 0.22 * Math.sin(phase2)
          : Math.sin(phase1);
        out[i] += (envFast + envSlow) * val;

        phase1 += wSteady * freqMult;
        if (hasDualPlane) phase2 += wBeat * freqMult;
        envFast *= decFast;
        envSlow *= decSlow;
      }

      let s1 = Math.sin(phase1);
      let c1 = Math.cos(phase1);
      let s2 = hasDualPlane ? Math.sin(phase2) : 0;
      let c2 = hasDualPlane ? Math.cos(phase2) : 1;

      for (let i = pitchSettleSamples; i < totalSamples; i++) {
        const env = envFast + envSlow;
        if (env < 0.00002) break;

        const val = hasDualPlane ? 0.78 * s1 + 0.22 * s2 : s1;
        out[i] += env * val;

        const nextS1 = s1 * cosW + c1 * sinW;
        const nextC1 = c1 * cosW - s1 * sinW;
        s1 = nextS1;
        c1 = nextC1;

        if (hasDualPlane) {
          const nextS2 = s2 * cosW2 + c2 * sinW2;
          const nextC2 = c2 * cosW2 - s2 * sinW2;
          s2 = nextS2;
          c2 = nextC2;
        }

        envFast *= decFast;
        envSlow *= decSlow;
      }
    }

    const bodySamples = Math.min(totalSamples, Math.floor(0.024 * sampleRate));
    for (let i = 0; i < bodySamples; i++) {
      const tSec = i * dt;
      const bodyEnv =
        Math.sin((Math.PI * i) / bodySamples) * Math.exp(-tSec / 0.008);
      const woodBody =
        0.65 * Math.sin(2 * Math.PI * 128 * tSec) +
        0.35 * Math.sin(2 * Math.PI * 246 * tSec);
      out[i] += bodyWoodiness * (1.0 - 0.35 * reg) * bodyEnv * woodBody;
    }

    for (let i = 0; i < attackSamples && i < totalSamples; i++) {
      out[i] *= 0.5 * (1 - Math.cos((Math.PI * i) / attackSamples));
    }
    if (totalSamples > 0) out[0] = 0.0;

    const tailFade = Math.min(
      Math.floor(0.04 * sampleRate),
      Math.floor(totalSamples * 0.1)
    );
    const tailStart = totalSamples - tailFade;
    for (let i = tailStart; i < totalSamples; i++) {
      const u = (i - tailStart) / Math.max(1, tailFade);
      out[i] *= 0.5 * (1 + Math.cos(Math.PI * u));
    }

    HarpSoundSynthesizer.applyBiquadFilterInPlace(
      out,
      sampleRate,
      'lowpass',
      maxPartialFreq,
      0.707
    );
    if (totalSamples > 0) out[0] = 0.0;

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

  private createVelvetChamberImpulse(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate || 44100;
    const duration = 1.45;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    let seed = 20261118;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 2147483648 - 1.0;
    };

    const earlyLeft = [
      { delay: 0.017, gain: 0.16 },
      { delay: 0.031, gain: 0.12 },
      { delay: 0.049, gain: 0.09 },
      { delay: 0.071, gain: 0.06 },
    ];
    const earlyRight = [
      { delay: 0.021, gain: 0.15 },
      { delay: 0.037, gain: 0.11 },
      { delay: 0.056, gain: 0.08 },
      { delay: 0.079, gain: 0.06 },
    ];

    earlyLeft.forEach((tap) => {
      const idx = Math.floor(tap.delay * sampleRate);
      if (idx < length) left[idx] += tap.gain;
    });
    earlyRight.forEach((tap) => {
      const idx = Math.floor(tap.delay * sampleRate);
      if (idx < length) right[idx] += tap.gain;
    });

    const decayTau = 0.36;
    let lpL1 = 0,
      lpL2 = 0;
    let lpR1 = 0,
      lpR2 = 0;
    const alpha = Math.exp((-2 * Math.PI * 1150) / sampleRate);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const preRamp = Math.min(1.0, t / 0.018);
      const env = preRamp * Math.exp(-t / decayTau);
      const wL = rand() * env * 0.11;
      const wR = rand() * env * 0.11;

      lpL1 = alpha * lpL1 + (1 - alpha) * wL;
      lpL2 = alpha * lpL2 + (1 - alpha) * lpL1;
      lpR1 = alpha * lpR1 + (1 - alpha) * wR;
      lpR2 = alpha * lpR2 + (1 - alpha) * lpR1;

      left[i] += lpL2;
      right[i] += lpR2;

      if (i > length - 2048) {
        const fade = (length - i) / 2048;
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
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      a0 = 1,
      a1 = 0,
      a2 = 0;

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

    let x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0;
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
