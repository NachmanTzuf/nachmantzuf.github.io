/**
 * EARPA PHASE 7: BARDIC JOURNEY & HARP GARAGE VERIFICATION SUITE
 * Validates 36-node curriculum topology across 6 stages, 90% gate checks,
 * XP calculations, combo multipliers, and Harp Garage cosmetic unlocks.
 */

import { BardicJourneyEngine } from './BardicJourneyEngine';
import { HarpGarageEngine } from './HarpGarageEngine';

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
console.log('EARPA PHASE 7: BARDIC JOURNEY & HARP GARAGE VERIFICATION');
console.log('====================================================\n');

// --- TEST GROUP 1: 36-Node Curriculum Architecture ---
console.log('--- TEST GROUP 1: 36-Node Curriculum Architecture ---');
const journey = new BardicJourneyEngine();
const allNodes = journey.getAllNodes();

assert(allNodes.length === 36, `Curriculum initializes exactly 36 nodes (found: ${allNodes.length})`);

for (let s = 1; s <= 6; s++) {
  const stageNodes = journey.getNodesByStage(s as any);
  assert(stageNodes.length === 6, `Stage ${s} contains exactly 6 nodes (found: ${stageNodes.length})`);
}

const firstNode = journey.getNode('NODE_1_1');
assert(firstNode?.isUnlocked === true, 'Node 1.1 (Tonic and Dominant) is unlocked by default');

const secondNode = journey.getNode('NODE_1_2');
assert(secondNode?.isUnlocked === false, 'Node 1.2 is locked initially');

const finalNode = journey.getNode('NODE_6_6');
assert(finalNode?.title === 'Grand Bard of Tara Gate', 'Final Node 6.6 is Grand Bard of Tara Gate');

// --- TEST GROUP 2: Mathematical XP Formula & Combo Multipliers ---
console.log('\n--- TEST GROUP 2: Mathematical XP Formula & Combo Multipliers ---');
// 1. Base correct trial (Streak 1, latency 1200ms) -> 10 * 1.0 + 2 = 12 XP
const xp1 = journey.calculateTrialXp(true, 1, 1200);
assert(xp1.xpAwarded === 12, `Standard trial awards 12 XP (base 10 + latency 2, got: ${xp1.xpAwarded})`);
assert(xp1.multiplier === 1.0, 'Streak 1 uses 1.0x multiplier');

// 2. Reflex speed trial (Streak 1, latency 450ms) -> 10 * 1.0 + 5 = 15 XP
const xpFast = journey.calculateTrialXp(true, 1, 450);
assert(xpFast.xpAwarded === 15, `Sub-1000ms trial awards 15 XP (base 10 + reflex bonus 5, got: ${xpFast.xpAwarded})`);

// 3. Combo Tier 2 (Streak 6, latency 1200ms) -> 10 * 1.5 + 2 = 17 XP
const xpCombo5 = journey.calculateTrialXp(true, 6, 1200);
assert(xpCombo5.multiplier === 1.5, 'Streak 6 uses 1.5x combo multiplier');
assert(xpCombo5.xpAwarded === 17, `Streak 6 awards 17 XP (15 base + 2 latency, got: ${xpCombo5.xpAwarded})`);

// 4. Bardic Flow (Streak 16, latency 500ms) -> 10 * 3.0 + 5 = 35 XP
const xpFlow = journey.calculateTrialXp(true, 16, 500);
assert(xpFlow.multiplier === 3.0, 'Streak 16 unlocks 3.0x Bardic Flow multiplier');
assert(xpFlow.xpAwarded === 35, `Bardic Flow reflex trial awards 35 XP (30 base + 5 reflex, got: ${xpFlow.xpAwarded})`);

// 5. Incorrect trial
const xpMiss = journey.calculateTrialXp(false, 0, 800);
assert(xpMiss.xpAwarded === 0, 'Incorrect trial awards 0 XP');

// --- TEST GROUP 3: 90% Gate Progression & 3-Star Ratings ---
console.log('\n--- TEST GROUP 3: 90% Gate Progression & 3-Star Ratings ---');
// 1. Failed run (< 90%)
const failResult = journey.completeNodeRun('NODE_1_1', 0.88, 880);
assert(failResult.passed === false, '88% accuracy fails 90% gate threshold');
assert(failResult.stars === 0, 'Failed run awards 0 stars');
assert(journey.getNode('NODE_1_2')?.isUnlocked === false, 'Next node remains locked after failed run');

// 2. Passed run with 2 stars (95%)
const passResult2Stars = journey.completeNodeRun('NODE_1_1', 0.95, 1250);
assert(passResult2Stars.passed === true, '95% accuracy passes 90% gate threshold');
assert(passResult2Stars.stars === 2, `95% accuracy awards 2 stars (found: ${passResult2Stars.stars})`);
assert(passResult2Stars.completionXpBonus === 50, 'Level completion awards +50 XP bonus');
assert(passResult2Stars.unlockedNextId === 'NODE_1_2', 'Successful run unlocks NODE_1_2');
assert(journey.getNode('NODE_1_2')?.isUnlocked === true, 'NODE_1_2 is now unlocked in journey tree');

// 3. Perfect run with 3 stars (100%)
const perfectResult = journey.completeNodeRun('NODE_1_1', 1.0, 1600);
assert(perfectResult.stars === 3, '100% accuracy awards 3 stars');
assert(perfectResult.completionXpBonus === 150, '3-star flawless clear awards +150 XP burst (50 completion + 100 burst)');

// --- TEST GROUP 4: Harp Garage Cosmetics & PBR Shaders ---
console.log('\n--- TEST GROUP 4: Harp Garage Cosmetics & PBR Shaders ---');
const garage = new HarpGarageEngine();

const timbers = garage.getTimbers();
const rosettes = garage.getRosettes();
const strings = garage.getStrings();

assert(timbers.length === 5, `Garage defines exactly 5 timber finishes (found: ${timbers.length})`);
assert(rosettes.length === 5, `Garage defines exactly 5 soundboard rosettes (found: ${rosettes.length})`);
assert(strings.length === 5, `Garage defines exactly 5 resonance string shaders (found: ${strings.length})`);

// Equipped defaults
const equipped = garage.getEquipped();
assert(equipped.timber.id === 'curly_maple', 'Default timber is Fiddleback Curly Maple');
assert(equipped.rosette.id === 'triskele_tara', 'Default rosette is Triskele of Tara');
assert(equipped.strings.id === 'solar_flare_brass', 'Default strings are Solar Flare Brass');

// PBR material bounds validation
for (const t of timbers) {
  assert(t.roughness >= 0 && t.roughness <= 1, `Timber ${t.name} roughness within [0, 1] (${t.roughness})`);
  assert(t.metalness >= 0 && t.metalness <= 1, `Timber ${t.name} metalness within [0, 1] (${t.metalness})`);
}

// Attempt equipping locked item
const equipLockedResult = garage.equipTimber('emerald_ebony');
assert(equipLockedResult === false, 'Equipping locked timber returns false');
assert(garage.getEquipped().timber.id === 'curly_maple', 'Equipped timber remains unchanged');

// Unlock and equip
garage.unlockItem('TIMBER', 'emerald_ebony');
const equipUnlockedResult = garage.equipTimber('emerald_ebony');
assert(equipUnlockedResult === true, 'Equipping unlocked timber returns true');
assert(garage.getEquipped().timber.id === 'emerald_ebony', 'Equipped timber is now Emerald Moss Ebony');

console.log('\n====================================================');
console.log(`PHASE 7 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
