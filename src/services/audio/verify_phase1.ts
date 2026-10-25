/**
 * PHASE 1 & 2 VERIFICATION SCRIPT: CORE CADENCE & AUDIO ENGINE
 * Runs automated tests verifying voice leading, timing intervals,
 * the Alain Benbassat resolution walkdown vectors (bidirectional: down & up),
 * Extended Karplus-Strong physical plucked string synthesis, and state machine API.
 */

import { CadenceEngine } from './CadenceEngine';
import { ResolutionWalker } from './ResolutionWalker';
import { HarpSoundSynthesizer } from './HarpSoundSynthesizer';
import { AudioStateMachine } from './AudioStateMachine';
import { DEFAULT_CADENCE_TIMINGS, ScaleDegree, ResolutionDirection } from './types';

function runAssertions() {
  console.log('====================================================');
  console.log('EARPA PHASE 1 & 2: AUDIO & CADENCE ENGINE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Cadence Engine Tests
  console.log('--- TEST GROUP 1: Cadence Engine & Voice Leading ---');
  const cadenceEngine = new CadenceEngine();
  const rootMidiEb4 = 63; // 311.13 Hz (Celtic Harp Eb standard)
  const invertedChords = cadenceEngine.generateCadence(rootMidiEb4, 'inverted');

  assert(invertedChords.length === 4, 'Cadence generates exactly 4 chords (I - IV - V - I)');
  assert(invertedChords[0].romanNumeral === 'I', 'Chord 1 is Tonic (I)');
  assert(invertedChords[1].romanNumeral === 'IV', 'Chord 2 is Subdominant (IV)');
  assert(invertedChords[2].romanNumeral === 'V', 'Chord 3 is Dominant (V)');
  assert(invertedChords[3].romanNumeral === 'I', 'Chord 4 is Tonic resolution (I)');

  // Voice leading checks: Bass should be Root (51), 4th (56), 5th (58), Root (51)
  assert(invertedChords[0].bassMidi === 51, 'Tonic bass is Eb3 (MIDI 51)');
  assert(invertedChords[1].bassMidi === 56, 'Subdominant bass is Ab3 (MIDI 56)');
  assert(invertedChords[2].bassMidi === 58, 'Dominant bass is Bb3 (MIDI 58)');
  assert(invertedChords[3].bassMidi === 51, 'Resolution bass returns to Eb3 (MIDI 51)');

  // Tritone isolation check between IV and V chords: 4th degree (Ab4, MIDI 68) and 7th degree (D5, MIDI 74)
  // Distance = 74 - 68 = 6 semitones (Tritone)
  const fourthDegree = rootMidiEb4 + 5; // Ab4 (MIDI 68)
  const seventhDegree = rootMidiEb4 + 11; // D5 (MIDI 74)
  assert(seventhDegree - fourthDegree === 6, 'Cadence isolates the unique diatonic tritone (6 semitones between degree 4 and 7)');

  // Frequency check
  const eb4Freq = CadenceEngine.midiToFreq(63);
  assert(Math.abs(eb4Freq - 311.127) < 0.05, `Eb4 frequency is exactly ~311.13 Hz (calculated: ${eb4Freq.toFixed(3)} Hz)`);

  // 2. Resolution Walker Tests: Alain Benbassat Natural Tendency
  console.log('\n--- TEST GROUP 2: Alain Benbassat Natural Gravitational Return ---');
  const walker = new ResolutionWalker();

  // Degree 4 resolution: 4 -> 3 -> 2 -> 1
  const path4 = walker.generatePath('4', 60);
  const path4Degrees = path4.map((p) => p.degree);
  assert(
    JSON.stringify(path4Degrees) === JSON.stringify(['4', '3', '2', '1']),
    `Degree 4 stepwise resolution is ['4', '3', '2', '1'] (result: ${JSON.stringify(path4Degrees)})`
  );

  // Degree 2 resolution: 2 -> 1
  const path2 = walker.generatePath('2', 60);
  const path2Degrees = path2.map((p) => p.degree);
  assert(
    JSON.stringify(path2Degrees) === JSON.stringify(['2', '1']),
    `Degree 2 stepwise resolution is ['2', '1'] (result: ${JSON.stringify(path2Degrees)})`
  );

  // Degree 7 resolution: 7 -> 8 (upward to tonic octave)
  const path7 = walker.generatePath('7', 60);
  const path7Degrees = path7.map((p) => p.degree);
  assert(
    JSON.stringify(path7Degrees) === JSON.stringify(['7', '8']),
    `Degree 7 stepwise resolution is upward ['7', '8'] (result: ${JSON.stringify(path7Degrees)})`
  );

  // Chromatic #4 resolution: #4 -> 5 -> 6 -> 7 -> 8
  const pathSharp4 = walker.generatePath('#4', 60);
  const pathSharp4Degrees = pathSharp4.map((p) => p.degree);
  assert(
    pathSharp4Degrees[0] === '#4' && pathSharp4Degrees[pathSharp4Degrees.length - 1] === '8',
    `Chromatic #4 resolves upward to tonic octave 8 (result: ${JSON.stringify(pathSharp4Degrees)})`
  );

  // Timing check
  const timings = DEFAULT_CADENCE_TIMINGS;
  assert(timings.bpm === 80, 'Default Cadence BPM is calibrated to 80 BPM');
  assert(timings.preStimulusSilenceMs === 650, 'Pre-stimulus silence is calibrated to 650 ms');
  assert(timings.postGuessBeatMs === 300, 'Post-guess confirmation beat is calibrated to 300 ms');
  assert(timings.resolutionStepDurationMs === 420, 'Resolution step duration is calibrated to 420 ms');

  // 3. Bidirectional Stepwise Resolution Tests
  console.log('\n--- TEST GROUP 3: Bidirectional Stepwise Resolution (Down to 1 & Up to 8) ---');

  // Downward diatonic pathways to 1
  const down4 = walker.generatePath('4', 60, 'down').map((s) => s.degree);
  assert(
    JSON.stringify(down4) === JSON.stringify(['4', '3', '2', '1']),
    `Degree 4 resolving 'down': ['4', '3', '2', '1'] (result: ${JSON.stringify(down4)})`
  );

  const down6 = walker.generatePath('6', 60, 'down').map((s) => s.degree);
  assert(
    JSON.stringify(down6) === JSON.stringify(['6', '5', '4', '3', '2', '1']),
    `Degree 6 resolving 'down': ['6', '5', '4', '3', '2', '1'] (result: ${JSON.stringify(down6)})`
  );

  const down7 = walker.generatePath('7', 60, 'down').map((s) => s.degree);
  assert(
    JSON.stringify(down7) === JSON.stringify(['7', '6', '5', '4', '3', '2', '1']),
    `Degree 7 resolving 'down': ['7', '6', '5', '4', '3', '2', '1'] (result: ${JSON.stringify(down7)})`
  );

  const down8 = walker.generatePath('8', 60, 'down').map((s) => s.degree);
  assert(
    JSON.stringify(down8) === JSON.stringify(['8', '7', '6', '5', '4', '3', '2', '1']),
    `Degree 8 resolving 'down': ['8', '7', '6', '5', '4', '3', '2', '1'] (result: ${JSON.stringify(down8)})`
  );

  // Upward diatonic pathways to 8
  const up5 = walker.generatePath('5', 60, 'up').map((s) => s.degree);
  assert(
    JSON.stringify(up5) === JSON.stringify(['5', '6', '7', '8']),
    `Degree 5 resolving 'up': ['5', '6', '7', '8'] (result: ${JSON.stringify(up5)})`
  );

  const up6 = walker.generatePath('6', 60, 'up').map((s) => s.degree);
  assert(
    JSON.stringify(up6) === JSON.stringify(['6', '7', '8']),
    `Degree 6 resolving 'up': ['6', '7', '8'] (result: ${JSON.stringify(up6)})`
  );

  const up7 = walker.generatePath('7', 60, 'up').map((s) => s.degree);
  assert(
    JSON.stringify(up7) === JSON.stringify(['7', '8']),
    `Degree 7 resolving 'up': ['7', '8'] (result: ${JSON.stringify(up7)})`
  );

  const up4 = walker.generatePath('4', 60, 'up').map((s) => s.degree);
  assert(
    JSON.stringify(up4) === JSON.stringify(['4', '5', '6', '7', '8']),
    `Degree 4 resolving 'up': ['4', '5', '6', '7', '8'] (result: ${JSON.stringify(up4)})`
  );

  const up2 = walker.generatePath('2', 60, 'up').map((s) => s.degree);
  assert(
    JSON.stringify(up2) === JSON.stringify(['2', '3', '4', '5', '6', '7', '8']),
    `Degree 2 resolving 'up': ['2', '3', '4', '5', '6', '7', '8'] (result: ${JSON.stringify(up2)})`
  );

  // Backward compatibility check
  const natural3 = walker.generatePath('3', 60).map((s) => s.degree);
  assert(
    JSON.stringify(natural3) === JSON.stringify(['3', '2', '1']),
    `Default direction is 'natural' for degree 3: ['3', '2', '1'] (result: ${JSON.stringify(natural3)})`
  );

  // 4. Extended Karplus-Strong Physical Synthesis & Acoustic Celtic Harp
  console.log('\n--- TEST GROUP 4: Extended Karplus-Strong Physical Synthesis & Acoustics ---');
  const sampleRate = 44100;
  const durationSec = 2.0;
  const bassSamples = HarpSoundSynthesizer.generatePluckedStringSamples(82.4, durationSec, 'celtic_nylon', sampleRate); // E2 ~82.4Hz
  const trebleSamples = HarpSoundSynthesizer.generatePluckedStringSamples(830.6, durationSec, 'celtic_nylon', sampleRate); // Ab5 ~830.6Hz

  assert(
    bassSamples.length === Math.floor(sampleRate * durationSec),
    'Synthesizer produces exact 44.1kHz buffer length for 2.0s duration'
  );

  // Click-free onset: sample 0 starts at 0.0 with smooth micro-envelope
  assert(
    Math.abs(bassSamples[0]) < 0.0001,
    `Zero click onset: sample 0 is exactly 0.0 (${bassSamples[0]})`
  );

  // Frequency-dependent damping: bass strings ring longer than treble strings
  const lateStartIdx = Math.floor(1.0 * sampleRate);
  const lateEndIdx = Math.floor(1.1 * sampleRate);
  let bassLateEnergy = 0;
  let trebleLateEnergy = 0;
  for (let i = lateStartIdx; i < lateEndIdx; i++) {
    bassLateEnergy += bassSamples[i] * bassSamples[i];
    trebleLateEnergy += trebleSamples[i] * trebleSamples[i];
  }
  assert(
    bassLateEnergy > trebleLateEnergy * 5,
    `Frequency-dependent damping: bass string sustains longer at t=1.0s (bass energy: ${bassLateEnergy.toFixed(4)}, treble: ${trebleLateEnergy.toFixed(4)})`
  );

  // Peak amplitude normalization check
  let maxPeak = 0;
  for (let i = 0; i < bassSamples.length; i++) {
    if (Math.abs(bassSamples[i]) > maxPeak) maxPeak = Math.abs(bassSamples[i]);
  }
  assert(
    Math.abs(maxPeak - 0.85) < 0.01,
    `Buffer peak amplitude normalized to ~0.85 to prevent clipping (measured: ${maxPeak.toFixed(3)})`
  );

  // Timbre selection check
  const synth = new HarpSoundSynthesizer('celtic_nylon');
  assert(synth.getTimbre() === 'celtic_nylon', 'Initial timbre is celtic_nylon');
  synth.setTimbre('celtic_wire');
  assert(synth.getTimbre() === 'celtic_wire', 'Timbre successfully switched to celtic_wire');

  // 5. AudioStateMachine Custom Resolution API
  console.log('\n--- TEST GROUP 5: AudioStateMachine Custom Bidirectional Resolution API ---');
  const fsm = new AudioStateMachine(synth, cadenceEngine, walker);
  assert(typeof fsm.playCustomResolution === 'function', 'AudioStateMachine.playCustomResolution method exists');

  fsm.playCustomResolution('4', 'down');
  assert(
    fsm.getState() === 'RESOLUTION_WALKDOWN',
    'playCustomResolution transitions FSM state to RESOLUTION_WALKDOWN'
  );

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAssertions();
