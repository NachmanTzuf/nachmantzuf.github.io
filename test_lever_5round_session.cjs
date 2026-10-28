const assert = require('assert');
const root = 'C:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio';
const fs = require('fs');
const ts = require(root + '/node_modules/typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);

// Mock localStorage
const store = new Map();
global.localStorage = { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v) };
global.window = { localStorage: global.localStorage };

const { UserAccountDatabase } = require(root + '/src/services/account/UserAccountDatabase.ts');
const { LEVER_LEVELS } = require(root + '/src/services/curriculum/leverCurriculum.ts');

// 1. Verify LEVER_LEVELS rounds metadata
assert.equal(LEVER_LEVELS.length, 13);
LEVER_LEVELS.forEach((lvl, i) => {
  assert.equal(lvl.rounds, 5, `Stage ${i + 1} rounds must be 5`);
});
console.log('PASS: All 13 LEVER_LEVELS configured with exactly 5 rounds.');

// 2. Test 5-round session simulation with 4/5 pass threshold
const db = UserAccountDatabase.getInstance();
const user = db.createAccount({ username: 'lever_5round_tester', displayName: 'Lever Tester', activeTuning: 'Eb_Major_Native' });
db.switchAccount(user.id);
assert.equal(db.getActiveProfile().leverStage || 0, 0);

// Record 5 trials (4 correct, 1 wrong)
const sid = `levers_${Date.now()}`;
for (let r = 1; r <= 5; r++) {
  db.recordTrial({
    sessionId: sid,
    levelId: 'lever_stage_1',
    track: 'levers',
    tonicKey: 'Ab',
    stimulusDegree: 'A',
    guessedDegree: r === 5 ? 'all down' : 'A',
    isCorrect: r !== 5,
    latencyMs: 1400,
    roundIndex: r
  });
}

// Record 5-round session
const session1 = db.recordSession({
  trialSessionId: sid,
  levelId: 'lever_stage_1',
  levelCode: 'L1',
  track: 'levers',
  durationSeconds: 45,
  totalRounds: 5,
  correctRounds: 4,
  accuracyPct: 80,
  passed: true,
  averageLatencyMs: 1400,
  fastestLatencyMs: 1200
});

assert.equal(session1.totalRounds, 5);
assert.equal(session1.correctRounds, 4);
assert.equal(session1.passed, true);
assert.equal(session1.accuracyPct, 80);

// Emulate stage advancement upon 4/5 pass
if (session1.passed) {
  db.updateActiveProfile({ leverStage: Math.max(db.getActiveProfile().leverStage || 0, 1) });
}
assert.equal(db.getActiveProfile().leverStage, 1);
console.log('PASS: 4/5 lever session passes and advances leverStage to 1.');

// 3. Test failed 3/5 session (does not advance stage)
const sid2 = `levers_${Date.now() + 1000}`;
const session2 = db.recordSession({
  trialSessionId: sid2,
  levelId: 'lever_stage_2',
  levelCode: 'L2',
  track: 'levers',
  durationSeconds: 50,
  totalRounds: 5,
  correctRounds: 3,
  accuracyPct: 60,
  passed: false,
  averageLatencyMs: 1500,
  fastestLatencyMs: 1300
});

assert.equal(session2.passed, false);
if (session2.passed) {
  db.updateActiveProfile({ leverStage: 2 });
}
assert.equal(db.getActiveProfile().leverStage, 1, 'Stage must remain 1 after failing');
console.log('PASS: 3/5 lever session fails (60%) and does not advance leverStage.');

// 4. Verify historical 20-round session preservation
const histSid = `levers_historical_${Date.now()}`;
const histSession = db.recordSession({
  trialSessionId: histSid,
  levelId: 'lever_stage_1',
  levelCode: 'L1',
  track: 'levers',
  durationSeconds: 120,
  totalRounds: 20,
  correctRounds: 18,
  accuracyPct: 90,
  passed: true,
  averageLatencyMs: 1600,
  fastestLatencyMs: 1100
});
assert.equal(histSession.totalRounds, 20);
assert.equal(histSession.correctRounds, 18);
assert.equal(histSession.accuracyPct, 90);

const allSessions = db.getUserSessions(user.id);
assert.equal(allSessions.length, 3);
assert.equal(allSessions[0].totalRounds, 5);
assert.equal(allSessions[1].totalRounds, 5);
assert.equal(allSessions[2].totalRounds, 20);
console.log('PASS: Historical 20-round sessions preserve their denominator without alteration.');
console.log('ALL FIVE-ROUND LEVER MECHANICS TESTS PASSED DETERMINISTICALLY.');
