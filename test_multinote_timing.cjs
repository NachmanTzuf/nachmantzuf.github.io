// test_multinote_timing.cjs
// Deterministic audit of Phase 3.A Multi-Note Timing & State Machine

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Auditing Phase 3.A Multi-Note Timing & State Machine...');

const inGamePlayPath = path.join(__dirname, 'src', 'components', 'game', 'InGamePlayScreen.tsx');
assert(fs.existsSync(inGamePlayPath), 'InGamePlayScreen.tsx must exist');
const content = fs.readFileSync(inGamePlayPath, 'utf8');

// Test 1: Guard against duplicate submissions
const hasDuplicateGuard = content.includes('guessesRef.current.length >= melodyLength');
assert(hasDuplicateGuard, 'Must guard against duplicate sequence submissions in handleGuess');
console.log('PASS: Guard against duplicate sequence submissions verified');

// Test 2: Post-guess settling separation gap is 250-350ms
const separationMatch = content.match(/const\s+separationMs\s*=\s*(\d+);/);
assert(separationMatch, 'separationMs must be explicitly declared');
const separationVal = parseInt(separationMatch[1], 10);
assert(separationVal >= 250 && separationVal <= 350, `separationMs (${separationVal}) must be between 250ms and 350ms`);
console.log(`PASS: Settling separation gap calibrated to ${separationVal}ms (within 250-350ms ceiling)`);

// Test 3: Harmonic dyad timing and sequential tempo replay
const hasDyadCheck = content.includes('activeLevel.isHarmonicDyad ? 0 : index * beat');
assert(hasDyadCheck, 'Dyad notes must trigger simultaneously with 0 delay; melody notes at beat interval');
console.log('PASS: Dyad simultaneous playback and melodic tempo spacing verified');

// Test 4: Timer cleanup on new trial and on unmount
const hasTrialCleanup = content.includes('timersRef.current.forEach(clearTimeout)') &&
                        content.includes('timersRef.current.clear()');
assert(hasTrialCleanup, 'Timers must be cleared on trial reset and unmount');
const hasAliveCleanup = content.includes('aliveRef.current = false');
assert(hasAliveCleanup, 'aliveRef must be set to false on unmount to cancel scheduled tasks');
console.log('PASS: Unmount and trial reset timer cancellation verified');

// Test 5: Replay plays target notes directly without tonic walk
const replaySection = content.substring(content.indexOf('const evaluateSequence'), content.indexOf('const playGuessedResolutionWalk'));
assert(!replaySection.includes('playGuessedResolutionWalk'), 'evaluateSequence must NOT invoke resolution walk');
assert(replaySection.includes('q.targetMidiNotes.forEach'), 'evaluateSequence must replay targetMidiNotes at tempo');
console.log('PASS: Target note sequence replay verified without tonic walk');

console.log('\nAll 5 Phase 3.A Multi-Note Timing tests passed successfully!');
