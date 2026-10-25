/**
 * MASTER VERIFICATION SUITE: 408-POINT MATRIX & MONTE CARLO SIMULATION
 * Enforces Constitutional Law 1 & Law 2 (Anti-Laziness Protocol):
 * Gate 1: 136 levels x 3 tunings = 408 configurations deterministically verified.
 * Gate 2: 1,000-round Monte Carlo simulation per level (136,000 simulated rounds).
 */

import { ALL_CURRICULUM_LEVELS, LevelDefinition } from './curriculumData';
import { TuningMatrixEngine, NativeHarpTuning } from './TuningMatrixEngine';
import { CurriculumRandomizer } from './CurriculumRandomizer';

const TUNINGS: NativeHarpTuning[] = ['Eb_Major_Native', 'C_Major_Native', 'Bb_Major_Native'];

export function runGate1MatrixTest(): { passed: number; failed: number; errors: string[] } {
  console.log('\n================================================================');
  console.log('GATE 1: 136 LEVELS x 3 TUNINGS = 408 CONFIGURATION MATRIX TEST');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const tuning of TUNINGS) {
    TuningMatrixEngine.setActiveTuning(tuning);
    console.log(`\nTesting Tuning: ${tuning}...`);

    for (const level of ALL_CURRICULUM_LEVELS) {
      try {
        // 1. Generate Question
        const q = CurriculumRandomizer.generateQuestion(level, 1, undefined, tuning);

        // 2. Validate Question Outputs
        if (!q.tonicKey) throw new Error(`Missing tonicKey for level ${level.id}`);
        if (!q.cadenceProgression) throw new Error(`Missing cadenceProgression for level ${level.id}`);
        if (q.targetDegrees.length === 0) throw new Error(`Empty targetDegrees for level ${level.id}`);
        if (q.targetMidiNotes.length === 0) throw new Error(`Empty targetMidiNotes for level ${level.id}`);
        if (q.targetFrequenciesHz.length === 0) throw new Error(`Empty targetFrequenciesHz for level ${level.id}`);

        // 3. Validate Levers for the Key
        const cleanKey = q.tonicKey.replace('_minor', '');
        const levers = TuningMatrixEngine.getLeverConfiguration(tuning, cleanKey);
        if (!levers) throw new Error(`Missing lever configuration for key ${cleanKey}`);

        // 4. Validate Frequencies
        for (const freq of q.targetFrequenciesHz) {
          if (isNaN(freq) || freq < 50 || freq > 4000) {
            throw new Error(`Invalid frequency ${freq}Hz for level ${level.id}`);
          }
        }

        passed++;
      } catch (err: any) {
        failed++;
        errors.push(`[${tuning}] Level ${level.id} (${level.title}): ${err.message}`);
      }
    }
  }

  console.log(`\nGate 1 Results: ${passed} / 408 PASSED (${failed} failed).`);
  return { passed, failed, errors };
}

export function runGate2MonteCarloTest(simRoundsPerLevel: number = 1000): {
  passedLevels: number;
  totalSimRounds: number;
  maskViolations: number;
  octaveViolations: number;
  accuracyGateFailures: number;
  errors: string[];
} {
  console.log('\n================================================================');
  console.log(`GATE 2: ${simRoundsPerLevel}-ROUND MONTE CARLO SIMULATION PER LEVEL`);
  console.log('================================================================');

  let passedLevels = 0;
  let totalSimRounds = 0;
  let maskViolations = 0;
  let octaveViolations = 0;
  let accuracyGateFailures = 0;
  const errors: string[] = [];

  for (const level of ALL_CURRICULUM_LEVELS) {
    let levelOk = true;

    // Simulate rounds
    for (let r = 0; r < simRoundsPerLevel; r++) {
      totalSimRounds++;
      const q = CurriculumRandomizer.generateQuestion(level, (r % level.rounds) + 1);

      // Verify Octave Bounds
      if (level.octaves === 1 && q.octave !== 4) {
        octaveViolations++;
        levelOk = false;
        errors.push(`Level ${level.id} octave violation: expected 4, got ${q.octave}`);
      } else if (level.octaves === 2 && (q.octave < 3 || q.octave > 4)) {
        octaveViolations++;
        levelOk = false;
        errors.push(`Level ${level.id} octave out of bounds: ${q.octave}`);
      }

      // Verify Active Notes Mask (for non-dyad, diatonic/chromatic levels)
      if (!level.isHarmonicDyad) {
        for (const deg of q.targetDegrees) {
          const num = parseInt(deg.replace('b', '').replace('#', ''), 10);
          if (!isNaN(num) && num >= 1 && num <= 8) {
            const isDiatonicActive = level.activeNotesMask[num - 1];
            const isChromaticActive =
              level.isChromatic &&
              level.allowedChromaticDegrees &&
              level.allowedChromaticDegrees.includes(deg);

            if (!isDiatonicActive && !isChromaticActive) {
              maskViolations++;
              levelOk = false;
              errors.push(`Level ${level.id} bitmask violation: emitted unmasked degree '${deg}'`);
            }
          }
        }
      }
    }

    // Verify 90% Accuracy Threshold Gating
    // Case A: 89% accuracy -> MUST FAIL
    const failScore = Math.floor(level.rounds * 0.89);
    const failEval = CurriculumRandomizer.evaluateSession(level, failScore);
    if (failEval.passed) {
      accuracyGateFailures++;
      levelOk = false;
      errors.push(`Level ${level.id} gated incorrectly: 89% score was allowed to pass!`);
    }

    // Case B: 90% accuracy -> MUST PASS
    const passScore = Math.ceil(level.rounds * 0.90);
    const passEval = CurriculumRandomizer.evaluateSession(level, passScore);
    if (!passEval.passed) {
      accuracyGateFailures++;
      levelOk = false;
      errors.push(`Level ${level.id} gated incorrectly: 90% score was rejected!`);
    }

    if (levelOk) {
      passedLevels++;
    }
  }

  console.log(`Total Simulated Rounds: ${totalSimRounds.toLocaleString()}`);
  console.log(`Bitmask Violations: ${maskViolations}`);
  console.log(`Octave Violations: ${octaveViolations}`);
  console.log(`Accuracy Gate Failures: ${accuracyGateFailures}`);
  console.log(`Gate 2 Passed Levels: ${passedLevels} / ${ALL_CURRICULUM_LEVELS.length}`);

  return {
    passedLevels,
    totalSimRounds,
    maskViolations,
    octaveViolations,
    accuracyGateFailures,
    errors,
  };
}

// Self-executing runner
const gate1 = runGate1MatrixTest();
const gate2 = runGate2MonteCarloTest(1000);

if (gate1.failed > 0 || gate2.errors.length > 0) {
  console.error('\nFAILURES ENCOUNTERED:');
  console.error([...gate1.errors, ...gate2.errors].slice(0, 10));
  process.exit(1);
} else {
  console.log('\n================================================================');
  console.log('ALL GATES DETERMINISTICALLY VERIFIED: 100% PASS');
  console.log('408 Matrix Validations PASS | 136,000 Monte Carlo Rounds PASS');
  console.log('================================================================\n');
  process.exit(0);
}
