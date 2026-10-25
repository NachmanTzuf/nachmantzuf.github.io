/**
 * EARPA PHASE 6: GAME MODES & LEVER LADDER VERIFICATION SUITE
 * Validates 4-Tier Progressive Lever Ladder nodes, star rating gating,
 * Session Lever Rush 60s sprint scoring, and Practice Sanctuary drone acoustics.
 */

import { LeverLadderEngine } from './LeverLadderEngine';
import { PracticeSanctuaryEngine } from './PracticeSanctuaryEngine';

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
console.log('EARPA PHASE 6: GAME MODES & LEVER LADDER VERIFICATION');
console.log('====================================================\n');

// --- TEST GROUP 1: 4-Tier Lever Ladder Architecture ---
console.log('--- TEST GROUP 1: 4-Tier Lever Ladder Architecture ---');
const ladder = new LeverLadderEngine();

const tier1Nodes = ladder.getNodesByTier(1);
assert(tier1Nodes.length >= 6, `Tier 1 contains 6 major key progression nodes (found: ${tier1Nodes.length})`);
assert(tier1Nodes[0].nodeId === 'LL_T1_01', 'First node is Eb Major Sanctuary');
assert(tier1Nodes[0].isUnlocked === true, 'First node LL_T1_01 is unlocked by default');
assert(tier1Nodes[1].isUnlocked === false, 'Subsequent node LL_T1_02 is locked initially');

const tier2Nodes = ladder.getNodesByTier(2);
assert(tier2Nodes.length >= 4, `Tier 2 contains Celtic mode progression nodes (found: ${tier2Nodes.length})`);
assert(tier2Nodes.some(n => n.title.includes('Dorian')), 'Tier 2 includes Dorian mode challenge');
assert(tier2Nodes.some(n => n.title.includes('Mixolydian')), 'Tier 2 includes Mixolydian mode challenge');

const tier3Nodes = ladder.getNodesByTier(3);
assert(tier3Nodes.length >= 3, `Tier 3 contains Celtic repertoire tune context nodes (found: ${tier3Nodes.length})`);
assert(tier3Nodes.some(n => n.tuneContextName === 'The Butterfly (Slip Jig)'), 'Tier 3 features The Butterfly slip jig in E Dorian');

const tier4Nodes = ladder.getNodesByTier(4);
assert(tier4Nodes.length >= 1, `Tier 4 contains timed Session Lever Rush (found: ${tier4Nodes.length})`);
assert(tier4Nodes[0].timeLimitSec === 60, 'Tier 4 sprint enforces 60-second time limit');

// --- TEST GROUP 2: Gating & Star Rating Progression ---
console.log('\n--- TEST GROUP 2: Gating & Star Rating Progression ---');
// 1. Failed gate (85% accuracy < 90% threshold)
const failResult = ladder.recordNodeCompletion('LL_T1_01', 0.85, 850);
assert(failResult.passed === false, '85% accuracy fails 90% Bardic Gate');
assert(failResult.stars === 0, 'Failed gate awards 0 stars');
assert(ladder.getNode('LL_T1_02')?.isUnlocked === false, 'Next node remains locked after failed trial');

// 2. Passed gate with 2 stars (95% accuracy)
const passResult2Stars = ladder.recordNodeCompletion('LL_T1_01', 0.95, 1250);
assert(passResult2Stars.passed === true, '95% accuracy passes 90% Bardic Gate');
assert(passResult2Stars.stars === 2, `95% accuracy awards 2 stars (found: ${passResult2Stars.stars})`);
assert(passResult2Stars.unlockedNextId === 'LL_T1_02', 'Successful trial unlocks LL_T1_02');
assert(ladder.getNode('LL_T1_02')?.isUnlocked === true, 'Node LL_T1_02 is now unlocked in ladder state');

// 3. Perfect run with 3 stars (100% accuracy)
const perfectResult = ladder.recordNodeCompletion('LL_T1_01', 1.0, 1600);
assert(perfectResult.stars === 3, '100% accuracy awards full 3 stars');

// --- TEST GROUP 3: Timed Session Lever Rush Mechanics ---
console.log('\n--- TEST GROUP 3: Timed Session Lever Rush Mechanics ---');
const rush = ladder.startSessionLeverRush();
assert(rush.isActive === true, 'Session Lever Rush initiates in active state');
assert(rush.timeRemainingSec === 60, 'Sprint timer starts at 60s');
assert(rush.scoreMultiplier === 1.0, 'Initial score multiplier is 1.0x');

// Simulate 5 consecutive fast hits (<600ms)
for (let i = 0; i < 5; i++) {
  ladder.recordRushHit(450);
}
const stateAfter5 = ladder.recordRushHit(450);
assert(stateAfter5.comboStreak === 6, `Combo streak increments to 6 (found: ${stateAfter5.comboStreak})`);
assert(stateAfter5.scoreMultiplier === 1.5, `5+ combo streak scales score multiplier to 1.5x (multiplier: ${stateAfter5.scoreMultiplier})`);
assert(stateAfter5.currentScore > 600, `Speed bonus and multiplier boost current score (score: ${stateAfter5.currentScore})`);

// Simulate miss resets multiplier
const stateAfterMiss = ladder.recordRushMiss();
assert(stateAfterMiss.comboStreak === 0, 'Miss resets combo streak to 0');
assert(stateAfterMiss.scoreMultiplier === 1.0, 'Miss resets score multiplier to 1.0x');

// --- TEST GROUP 4: Practice Sanctuary Drone Acoustics ---
console.log('\n--- TEST GROUP 4: Practice Sanctuary Drone Acoustics ---');
const sanctuary = new PracticeSanctuaryEngine(3); // Eb Root
const config = sanctuary.getConfig();

assert(config.rootPitchClass === 3, 'Sanctuary initializes with root Eb (PitchClass 3)');
assert(config.droneActive === false, 'Drone is initially disengaged');

// Test BPM limits
sanctuary.setCadenceBpm(30); // Below 40 minimum
assert(sanctuary.getConfig().cadenceBpm === 40, 'BPM clamped to 40 minimum');

sanctuary.setCadenceBpm(200); // Above 180 maximum
assert(sanctuary.getConfig().cadenceBpm === 180, 'BPM clamped to 180 maximum');

sanctuary.setCadenceBpm(85);
assert(sanctuary.getConfig().cadenceBpm === 85, 'BPM set to 85 BPM');

// Test volume adjustment
sanctuary.setDroneVolume(0.5);
assert(sanctuary.getConfig().droneVolume === 0.5, 'Drone volume set to 0.5');

// Test key update
sanctuary.updateKey(7); // G Major
assert(sanctuary.getConfig().rootPitchClass === 7, 'Sanctuary root updated to G (PitchClass 7)');

console.log('\n====================================================');
console.log(`PHASE 6 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
