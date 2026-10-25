/**
 * EARPA PHASE 5: ADAPTIVE INTELLIGENCE & HUB TAG MASTERY SUITE
 * Automated unit and mathematical validation suite for A-BKT, motor slip isolation,
 * 20% weak-spot injection, 54-line feedback catalog, and Hub Tag Vault.
 */

import { BayesianKnowledgeTracingEngine } from './BayesianKnowledgeTracing';
import { ContextualFeedbackEngine } from './ContextualFeedbackEngine';
import { HubTagMasteryVault } from './HubTagMasteryVault';
import { LocalTelemetryStore } from './LocalTelemetryStore';
import { TrialObservation } from './types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

console.log('====================================================');
console.log('EARPA PHASE 5: ADAPTIVE INTELLIGENCE VERIFICATION');
console.log('====================================================\n');

// --- TEST GROUP 1: Auditory Bayesian Knowledge Tracing (A-BKT) ---
console.log('--- TEST GROUP 1: Auditory Bayesian Knowledge Tracing (A-BKT) ---');
const bkt = new BayesianKnowledgeTracingEngine();

const initialMasteryDegree3 = bkt.getMastery('3');
assert(initialMasteryDegree3 === 0.32, `Degree 3 initializes with calibrated prior P(L0)=0.32 (found: ${initialMasteryDegree3})`);

// 1. Correct trial increases mastery
const correctObs: TrialObservation = {
  trialIndex: 0,
  timestamp: Date.now(),
  rootPitchClass: 3, // Eb
  mode: 'ionian',
  stimulusDegree: '3',
  guessedDegree: '3',
  stimulusMidi: 55,
  guessedMidi: 55,
  latencyMs: 720,
  isCorrect: true,
  isMotorSlip: false,
  activeLeversCount: 0,
};

const update1 = bkt.recordTrial(correctObs);
assert(update1.updatedMastery > initialMasteryDegree3, `Correct trial increases Degree 3 mastery from ${initialMasteryDegree3} to ${update1.updatedMastery.toFixed(3)}`);

// 2. Incorrect cognitive trial decreases mastery
const wrongObs: TrialObservation = {
  trialIndex: 1,
  timestamp: Date.now(),
  rootPitchClass: 3,
  mode: 'ionian',
  stimulusDegree: '3',
  guessedDegree: '4',
  stimulusMidi: 55,
  guessedMidi: 56,
  latencyMs: 1400,
  isCorrect: false,
  isMotorSlip: false,
  activeLeversCount: 0,
};

const update2 = bkt.recordTrial(wrongObs);
assert(update2.updatedMastery < update1.updatedMastery, `Incorrect trial reduces mastery from ${update1.updatedMastery.toFixed(3)} down to ${update2.updatedMastery.toFixed(3)}`);

// 3. Motor slip isolation attenuates penalty
const bktMotorTest = new BayesianKnowledgeTracingEngine();
const initialDeg4 = bktMotorTest.getMastery('4');

// Standard error
bktMotorTest.recordTrial({
  ...wrongObs,
  stimulusDegree: '4',
  guessedDegree: '3',
  isMotorSlip: false,
});
const penaltyCognitive = initialDeg4 - bktMotorTest.getMastery('4');

// Motor slip error
const bktMotorTest2 = new BayesianKnowledgeTracingEngine();
bktMotorTest2.recordTrial({
  ...wrongObs,
  stimulusDegree: '4',
  guessedDegree: '3',
  isMotorSlip: true, // Motor slip flag active
});
const penaltyMotorSlip = initialDeg4 - bktMotorTest2.getMastery('4');

assert(penaltyMotorSlip < penaltyCognitive, `Motor slip preserves cognitive credit (motor drop: ${penaltyMotorSlip.toFixed(3)} vs cognitive drop: ${penaltyCognitive.toFixed(3)})`);

// --- TEST GROUP 2: Dynamic 20% Weak-Spot Practice Injection ---
console.log('\n--- TEST GROUP 2: Dynamic 20% Weak-Spot Practice Injection ---');
const bktInjection = new BayesianKnowledgeTracingEngine();
const activePool: any[] = ['1', '2', '3', '4', '5'];

// Manually weaken degree 4 with consecutive errors
for (let i = 0; i < 3; i++) {
  bktInjection.recordTrial({
    trialIndex: i,
    timestamp: Date.now(),
    rootPitchClass: 3,
    mode: 'ionian',
    stimulusDegree: '4',
    guessedDegree: '5',
    stimulusMidi: 56,
    guessedMidi: 58,
    latencyMs: 1600,
    isCorrect: false,
    isMotorSlip: false,
    activeLeversCount: 0,
  });
}

const lowestDeg = '4';
assert(bktInjection.getMastery('4') < bktInjection.getMastery('1'), 'Degree 4 is established as the weakest degree in the active pool');

// Test trial 4 (5th trial, 0-indexed: index 4)
const injectionResult = bktInjection.selectNextStimulusDegree(activePool, 4);
assert(injectionResult.isWeakSpotInjection === true, 'Trial 4 (index 4, 5th trial) triggers 20% weak-spot injection flag');
assert(injectionResult.selectedDegree === lowestDeg, `Weak-spot injection correctly selected lowest mastery degree (selected: ${injectionResult.selectedDegree})`);

// Test non-injection trial (index 3)
const standardResult = bktInjection.selectNextStimulusDegree(activePool, 3);
assert(standardResult.isWeakSpotInjection === false, 'Trial 3 proceeds as standard pseudo-random selection');

// --- TEST GROUP 3: Directed Confusion Matrix & Shannon Entropy ---
console.log('\n--- TEST GROUP 3: Directed Confusion Matrix & Shannon Entropy ---');
const bktMatrix = new BayesianKnowledgeTracingEngine();

// Record asymmetric confusion: Degree 6 mistaken for Degree 2 three times
for (let i = 0; i < 3; i++) {
  bktMatrix.recordTrial({
    trialIndex: i,
    timestamp: Date.now(),
    rootPitchClass: 3,
    mode: 'ionian',
    stimulusDegree: '6',
    guessedDegree: '2',
    stimulusMidi: 60,
    guessedMidi: 53,
    latencyMs: 1200,
    isCorrect: false,
    isMotorSlip: false,
    activeLeversCount: 0,
  });
}

const primaryConfusion = bktMatrix.getPrimaryConfusion();
assert(primaryConfusion !== null, 'Primary confusion pair identified');
assert(primaryConfusion?.stimulus === '6' && primaryConfusion?.guessed === '2', `Top confusion correctly identifies Stimulus 6 -> Guessed 2 (found: ${primaryConfusion?.stimulus} -> ${primaryConfusion?.guessed})`);
assert(primaryConfusion?.count === 3, `Confusion frequency matches 3 recorded trials (count: ${primaryConfusion?.count})`);

const node6 = bktMatrix.getConfusionNode('6');
assert(node6 !== undefined && node6.shannonEntropy >= 0, `Shannon perceptual entropy computed for Degree 6 (H = ${node6?.shannonEntropy.toFixed(3)})`);

// --- TEST GROUP 4: 54-Line Contextual Feedback Engine & Cooldowns ---
console.log('\n--- TEST GROUP 4: 54-Line Contextual Feedback Engine & Cooldowns ---');
const feedbackEngine = new ContextualFeedbackEngine();
const catalogKeys = Object.keys(ContextualFeedbackEngine.CATALOG);

assert(catalogKeys.length === 54, `Master feedback catalog contains exactly 54 handcrafted lines (found: ${catalogKeys.length})`);

// Test speed reflex trigger (< 500ms)
const speedFeedback = feedbackEngine.generateFeedback({
  isCorrect: true,
  latencyMs: 420,
  currentStreak: 1,
  previousStreak: 0,
  stimulusDegree: '1',
  guessedDegree: '1',
  activeMode: 'ionian',
  sessionTrialCount: 1,
  sessionAccuracy: 1.0,
});
assert(speedFeedback.category === 'SPEED', `Sub-500ms correct answer triggers SPEED category (got: ${speedFeedback.category}, text: "${speedFeedback.text}")`);

// Test near-miss harmonic diagnostic trigger (Stimulus 6 mistook for 2)
const nearMissFeedback = feedbackEngine.generateFeedback({
  isCorrect: false,
  latencyMs: 1100,
  currentStreak: 0,
  previousStreak: 5,
  stimulusDegree: '6',
  guessedDegree: '2',
  activeMode: 'ionian',
  sessionTrialCount: 2,
  sessionAccuracy: 0.5,
});
assert(nearMissFeedback.id === 'MIS_01', `Stimulus 6 mistook for 2 triggers MIS_01 harmonic diagnostic (got: ${nearMissFeedback.id})`);

// Test anti-fatigue cooldown suppression
const immediateRepeat = feedbackEngine.generateFeedback({
  isCorrect: false,
  latencyMs: 1100,
  currentStreak: 0,
  previousStreak: 0,
  stimulusDegree: '6',
  guessedDegree: '2',
  activeMode: 'ionian',
  sessionTrialCount: 3, // Still within 12-trial cooldown of MIS_01
  sessionAccuracy: 0.33,
});
assert(immediateRepeat.id !== 'MIS_01', `Anti-fatigue cooldown suppresses immediate repetition of MIS_01 (delivered: ${immediateRepeat.id})`);

// --- TEST GROUP 5: Hub Tag Mastery Vault & 90% Gate Evaluation ---
console.log('\n--- TEST GROUP 5: Hub Tag Mastery Vault & 90% Gate Evaluation ---');
const vault = new HubTagMasteryVault();
const allTags = vault.getAllTags();

assert(allTags.length === 25, `Hub Tag Mastery Vault defines exactly 25 collectible badges (found: ${allTags.length})`);

const categories = ['DIATONIC_FOUNDATIONS', 'CELTIC_MODES', 'SPEED_AND_REFLEX', 'LEVER_VIRTUOSITY', 'BARDIC_DEDICATION'] as const;
for (const cat of categories) {
  const catTags = vault.getTagsByCategory(cat);
  assert(catTags.length === 5, `Category ${cat} contains exactly 5 badges (found: ${catTags.length})`);
}

// Simulate 20 correct trials on Degree 1 and 8 to unlock TAG_TONIC_ANCHOR
const mockTonicTrials: TrialObservation[] = [];
for (let i = 0; i < 20; i++) {
  mockTonicTrials.push({
    trialIndex: i,
    timestamp: Date.now(),
    rootPitchClass: 3,
    mode: 'ionian',
    stimulusDegree: i % 2 === 0 ? '1' : '8',
    guessedDegree: i % 2 === 0 ? '1' : '8',
    stimulusMidi: i % 2 === 0 ? 51 : 63,
    guessedMidi: i % 2 === 0 ? 51 : 63,
    latencyMs: 600,
    isCorrect: true,
    isMotorSlip: false,
    activeLeversCount: 0,
  });
}

const newlyUnlocked = vault.evaluateObservations(mockTonicTrials);
const tonicTag = vault.getTag('TAG_TONIC_ANCHOR');
assert(tonicTag?.isUnlocked === true, `TAG_TONIC_ANCHOR unlocks upon achieving >= 95% on 20 tonic trials`);
assert(newlyUnlocked.some((t) => t.id === 'TAG_TONIC_ANCHOR'), 'Newly unlocked array includes TAG_TONIC_ANCHOR');

// --- TEST GROUP 6: Local Telemetry Store Sub-2ms Persistence ---
console.log('\n--- TEST GROUP 6: Local Telemetry Store Sub-2ms Persistence ---');
const store = new LocalTelemetryStore();
store.clearAllData();

const startPerf = performance.now();
for (let i = 0; i < 50; i++) {
  store.recordTrial(mockTonicTrials[0]);
}
const elapsedMs = performance.now() - startPerf;
const avgWriteMs = elapsedMs / 50;

assert(avgWriteMs < 2.0, `Telemetry writes execute in sub-2ms time budget (measured: ${avgWriteMs.toFixed(3)}ms per write)`);
assert(store.getObservations().length === 50, `Telemetry store persists exactly 50 observations (found: ${store.getObservations().length})`);

console.log('\n====================================================');
console.log(`PHASE 5 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
