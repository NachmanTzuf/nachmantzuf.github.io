/**
 * PHASE 2 VERIFICATION SCRIPT: MATHEMATICAL THEORY ENGINE & LEVER SOLVER
 * Runs comprehensive mathematical and algorithmic unit tests verifying
 * the Circle of Fifths sequence, Modal Parent Key Invariant, Zero-Delta Invariant,
 * 84-entry modal truth table, and Minimum Lever Delta Solver.
 */

import { FifthsSequenceEngine } from './FifthsSequenceEngine';
import { ModalShiftEngine } from './ModalShiftEngine';
import { MinimumDeltaSolver } from './MinimumDeltaSolver';
import { CelticTune } from './types';

function runAssertions() {
  console.log('====================================================');
  console.log('EARPA PHASE 2: MATHEMATICAL THEORY & LEVER VERIFICATION');
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

  // 1. Line of Fifths & Modulo Arithmetic
  console.log('--- TEST GROUP 1: Line of Fifths Modulo-12 Sequence ---');
  const expectedFifthsOrder = ['A', 'E', 'B', 'F', 'C', 'G', 'D'];
  assert(
    JSON.stringify(FifthsSequenceEngine.SHARPING_SEQUENCE) === JSON.stringify(expectedFifthsOrder),
    'Sharping sequence strictly follows fifths progression: [A, E, B, F, C, G, D]'
  );

  const expectedFlatsOrder = ['D', 'G', 'C', 'F', 'B', 'E', 'A'];
  assert(
    JSON.stringify(FifthsSequenceEngine.FLATTENING_SEQUENCE) === JSON.stringify(expectedFlatsOrder),
    'Flattening sequence strictly follows fourths progression: [D, G, C, F, B, E, A]'
  );

  // Accessible major keys: Eb (0), Bb (1), F (2), C (3), G (4), D (5), A (6), E (7)
  assert(FifthsSequenceEngine.getPrefixCountForMajorKey('Eb') === 0, 'Open Eb Major requires 0 levers raised (all down)');
  assert(FifthsSequenceEngine.getPrefixCountForMajorKey('C') === 3, 'C Major requires 3 levers raised (A, E, B up)');
  assert(FifthsSequenceEngine.getPrefixCountForMajorKey('G') === 4, 'G Major requires 4 levers raised (A, E, B, F up)');
  assert(FifthsSequenceEngine.getPrefixCountForMajorKey('D') === 5, 'D Major requires 5 levers raised (A, E, B, F, C up)');
  assert(FifthsSequenceEngine.getPrefixCountForMajorKey('E') === 7, 'E Major requires 7 levers raised (all up)');

  // Verify lever state mapping for C Major (3 levers raised: A=1, E=1, B=1, others=0)
  const cLevers = FifthsSequenceEngine.getLeversForPrefixCount(3);
  assert(
    cLevers.A === 1 && cLevers.E === 1 && cLevers.B === 1 && cLevers.C === 0 && cLevers.D === 0 && cLevers.F === 0 && cLevers.G === 0,
    'C Major lever state has A=1, E=1, B=1, and all others=0'
  );

  // Verify lever state mapping for D Major (5 levers raised: A=1, E=1, B=1, F=1, C=1, G=0, D=0)
  const dLevers = FifthsSequenceEngine.getLeversForPrefixCount(5);
  assert(
    dLevers.A === 1 && dLevers.E === 1 && dLevers.B === 1 && dLevers.F === 1 && dLevers.C === 1 && dLevers.G === 0 && dLevers.D === 0,
    'D Major lever state has A=1, E=1, B=1, F=1, C=1, and G=0, D=0'
  );

  // 2. Modal Parent Key Invariant & Zero-Delta Invariant
  console.log('\n--- TEST GROUP 2: Modal Parent Key Invariant & Zero-Delta Invariant ---');
  // D Dorian (Root D = PC 2) -> Parent should be C Major (PC 0)
  const dDorian = ModalShiftEngine.getModalDefinition(2, 'dorian');
  assert(dDorian.parentMajorKey === 'C', 'D Dorian parent key is C Major');
  assert(dDorian.isAccessibleOnEbHarp === true, 'D Dorian is accessible on open Eb harp');

  // E Dorian (Root E = PC 4) -> Parent should be D Major (PC 2)
  const eDorian = ModalShiftEngine.getModalDefinition(4, 'dorian');
  assert(eDorian.parentMajorKey === 'D', 'E Dorian parent key is D Major');
  assert(eDorian.isAccessibleOnEbHarp === true, 'E Dorian is accessible on open Eb harp');

  // G Mixolydian (Root G = PC 7) -> Parent should be C Major (PC 0)
  const gMixo = ModalShiftEngine.getModalDefinition(7, 'mixolydian');
  assert(gMixo.parentMajorKey === 'C', 'G Mixolydian parent key is C Major');

  // A Mixolydian (Root A = PC 9) -> Parent should be D Major (PC 2)
  const aMixo = ModalShiftEngine.getModalDefinition(9, 'mixolydian');
  assert(aMixo.parentMajorKey === 'D', 'A Mixolydian parent key is D Major');

  // B Aeolian (Root B = PC 11) -> Parent should be D Major (PC 2)
  const bAeolian = ModalShiftEngine.getModalDefinition(11, 'aeolian');
  assert(bAeolian.parentMajorKey === 'D', 'B Aeolian parent key is D Major');

  // ZERO-DELTA INVARIANT: D Major, E Dorian, A Mixolydian, B Aeolian share identical parent key D Major (prefix 5)
  const dMajor = ModalShiftEngine.getModalDefinition(2, 'ionian');
  assert(
    JSON.stringify(dMajor.levers) === JSON.stringify(eDorian.levers) &&
    JSON.stringify(eDorian.levers) === JSON.stringify(aMixo.levers) &&
    JSON.stringify(aMixo.levers) === JSON.stringify(bAeolian.levers),
    'Zero-Delta Invariant verified: D Major, E Dorian, A Mixolydian, and B Aeolian share identical physical levers'
  );

  // 3. Complete 84-Row Truth Table Verification
  console.log('\n--- TEST GROUP 3: 84-Entry Modal Truth Table Coverage ---');
  const truthTable = ModalShiftEngine.generateCompleteTruthTable();
  assert(truthTable.length === 84, 'Complete truth table contains exactly 84 entries (12 roots x 7 modes)');

  const accessibleCount = truthTable.filter((e) => e.isAccessibleOnEbHarp).length;
  const inaccessibleCount = truthTable.filter((e) => !e.isAccessibleOnEbHarp).length;
  assert(accessibleCount === 56, `Exactly 56 modes (8 keys x 7 modes) are accessible on open Eb harp (found: ${accessibleCount})`);
  assert(inaccessibleCount === 28, `Exactly 28 modes are inaccessible on open Eb harp (found: ${inaccessibleCount})`);

  // Verify 100% Celtic coverage for session roots D and A
  const dModes = truthTable.filter((e) => e.rootName === 'D');
  assert(dModes.every((m) => m.isAccessibleOnEbHarp), 'Root D has 100% modal coverage (7/7 modes accessible on open Eb harp)');

  const aModes = truthTable.filter((e) => e.rootName === 'A');
  assert(aModes.every((m) => m.isAccessibleOnEbHarp), 'Root A has 100% modal coverage (7/7 modes accessible on open Eb harp)');

  // 4. Minimum Lever Delta Solver
  console.log('\n--- TEST GROUP 4: Minimum Lever Delta Solver ---');
  // Transition 1: D Major (prefix 5) to G Major (prefix 4) => 1 flip: Lower C (C# -> C natural)
  const gLevers = FifthsSequenceEngine.getLeversForPrefixCount(4);
  const deltaDToG = MinimumDeltaSolver.calculateDelta(dLevers, gLevers, 'D Major', 'G Major');
  assert(deltaDToG.totalFlips === 1, 'Transition from D Major to G Major requires exactly 1 lever flip');
  assert(deltaDToG.actions[0].letter === 'C' && deltaDToG.actions[0].direction === 'DOWN', 'D Major to G Major action is: Lower C');

  // Transition 2: G Major (prefix 4) to D Major (prefix 5) => 1 flip: Raise C (C natural -> C#)
  const deltaGToD = MinimumDeltaSolver.calculateDelta(gLevers, dLevers, 'G Major', 'D Major');
  assert(deltaGToD.totalFlips === 1, 'Transition from G Major to D Major requires exactly 1 lever flip');
  assert(deltaGToD.actions[0].letter === 'C' && deltaGToD.actions[0].direction === 'UP', 'G Major to D Major action is: Raise C');

  // Transition 3: D Major to E Dorian => 0 flips (Zero-Delta Invariant)
  const deltaDToEDorian = MinimumDeltaSolver.calculateModalTransition(2, 'ionian', 4, 'dorian');
  assert(deltaDToEDorian.totalFlips === 0, 'Transition from D Major to E Dorian requires exactly 0 lever flips');

  // Transition 4: D Major (prefix 5) to C Major (prefix 3) => 2 flips: Lower F, Lower C
  const deltaDToC = MinimumDeltaSolver.calculateDelta(dLevers, cLevers, 'D Major', 'C Major');
  assert(deltaDToC.totalFlips === 2, 'Transition from D Major to C Major requires exactly 2 lever flips');

  // 5. Medley Permutation Optimizer
  console.log('\n--- TEST GROUP 5: Session Medley Permutation Optimizer ---');
  const celticMedley: CelticTune[] = [
    { title: 'The Kesh Jig', tonic: 'G', mode: 'ionian', type: 'jig' },     // G Major (prefix 4)
    { title: 'Drowsy Maggie', tonic: 'E', mode: 'dorian', type: 'reel' },   // E Dorian = D Major (prefix 5)
    { title: 'Morrison\'s Jig', tonic: 'E', mode: 'dorian', type: 'jig' }, // E Dorian = D Major (prefix 5)
    { title: 'Cooley\'s Reel', tonic: 'E', mode: 'dorian', type: 'reel' },  // E Dorian = D Major (prefix 5)
  ];

  const medleyResult = MinimumDeltaSolver.optimizeMedley(celticMedley);
  assert(medleyResult.originalTotalFlips === 1, 'Medley [G Major -> E Dorian -> E Dorian -> E Dorian] requires only 1 total lever flip');
  assert(medleyResult.optimizedTotalFlips === 1, 'Optimized medley sustains minimal 1 flip across 4 tunes');

  console.log('\n====================================================');
  console.log(`PHASE 2 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAssertions();
