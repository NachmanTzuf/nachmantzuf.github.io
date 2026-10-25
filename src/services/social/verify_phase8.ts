/**
 * EARPA PHASE 8: SOCIAL LAYER & CLOUD SYNC VERIFICATION SUITE
 * Validates lightweight Social Circles, activity feeds, cheer mechanics,
 * weekly dedication leaderboards, and offline backend sync mutation queue.
 */

import { SocialCirclesEngine } from './SocialCirclesEngine';
import { BackendSyncManager, QueuedMutation } from '../backendSync';

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
console.log('EARPA PHASE 8: SOCIAL CIRCLES & CLOUD SYNC VERIFICATION');
console.log('====================================================\n');

// --- TEST GROUP 1: Bardic Fellowship & Friends ---
console.log('--- TEST GROUP 1: Bardic Fellowship & Friends ---');
const social = new SocialCirclesEngine();
const initialFriends = social.getFriends();

assert(initialFriends.length === 4, `Initial fellowship contains 4 default harper friends (found: ${initialFriends.length})`);
assert(initialFriends.some(f => f.username === 'Cathal of Tara'), 'Fellowship includes master harper Cathal of Tara');
assert(initialFriends.some(f => f.username === 'Siobhan of Skye'), 'Fellowship includes high level harper Siobhan of Skye');

// Add friend
const newHarper = social.addFriend('Cormac the Harper');
assert(newHarper.username === 'Cormac the Harper', `New friend ${newHarper.username} registered with ID ${newHarper.friendId}`);
assert(social.getFriends().length === 5, 'Friends count incremented to 5');

// --- TEST GROUP 2: Activity Feed & Encouragement Cheers ---
console.log('\n--- TEST GROUP 2: Activity Feed & Encouragement Cheers ---');
const feed = social.getActivityFeed();
assert(feed.length >= 3, `Activity feed populated with milestone events (count: ${feed.length})`);

const firstActivity = feed[0];
const initialCheers = firstActivity.cheersCount;

// Cheer activity item
const cheerSuccess = social.cheerActivityItem(firstActivity.id);
assert(cheerSuccess === true, `Cheering activity ${firstActivity.id} succeeds`);
assert(firstActivity.cheersCount === initialCheers + 1, `Cheers count incremented from ${initialCheers} to ${firstActivity.cheersCount}`);
assert(firstActivity.hasCheered === true, 'Activity item marked as cheered');

// Duplicate cheer attempt should be ignored
const duplicateCheer = social.cheerActivityItem(firstActivity.id);
assert(duplicateCheer === false, 'Duplicate cheer attempt by same user prevented');

// --- TEST GROUP 3: Weekly Dedication Leaderboard ---
console.log('\n--- TEST GROUP 3: Weekly Dedication Leaderboard ---');
const currentStreak = 5;
const currentTrials = 45;
const leaderboard = social.getWeeklyLeaderboard(currentStreak, currentTrials);

assert(leaderboard.length === 6, `Leaderboard includes current user plus 5 friends (total: ${leaderboard.length})`);
assert(leaderboard.some(e => e.isCurrentUser), 'Current user entry is present in leaderboard');

// Verify ranks are strictly ascending 1, 2, 3...
for (let i = 0; i < leaderboard.length; i++) {
  assert(leaderboard[i].rank === i + 1, `Entry at index ${i} has rank ${i + 1} (${leaderboard[i].friendName})`);
}

// Verify ranking sorted by practiceDaysThisWeek descending
for (let i = 0; i < leaderboard.length - 1; i++) {
  const currentDays = leaderboard[i].practiceDaysThisWeek;
  const nextDays = leaderboard[i + 1].practiceDaysThisWeek;
  assert(currentDays >= nextDays, `Rank ${leaderboard[i].rank} (${currentDays} days) >= Rank ${leaderboard[i+1].rank} (${nextDays} days)`);
}

// --- TEST GROUP 4: Optimistic Offline Sync & Mutation Queue ---
console.log('\n--- TEST GROUP 4: Optimistic Offline Sync & Mutation Queue ---');

// Mock in-memory storage adapter conforming to StorageAdapter interface
const mockStorageMap = new Map<string, string>();
const mockStorageAdapter = {
  isPersistent: true,
  getNumber: (key: string) => mockStorageMap.has(key) ? Number(mockStorageMap.get(key)) : undefined,
  getBoolean: (key: string) => mockStorageMap.has(key) ? mockStorageMap.get(key) === 'true' : undefined,
  getString: (key: string) => mockStorageMap.get(key),
  set: (key: string, value: string | number | boolean) => { mockStorageMap.set(key, String(value)); },
  delete: (key: string) => { mockStorageMap.delete(key); },
  clearAll: () => { mockStorageMap.clear(); },
};

const syncManager = new BackendSyncManager(mockStorageAdapter, null);

// Enqueue trial sync mutation
let optimisticCalled = false;
let mutationId = '';

const runSyncTest = async () => {
  mutationId = await syncManager.enqueueMutation(
    'trial_telemetry',
    'INSERT',
    {
      user_id: 'test_harper_01',
      stimulus_degree: '4',
      guessed_degree: '4',
      is_correct: true,
      latency_ms: 620,
      timestamp: Date.now(),
    },
    undefined,
    () => {
      optimisticCalled = true;
    }
  );
};

runSyncTest().then(() => {
  assert(optimisticCalled === true, 'Optimistic local callback executes immediately without waiting for network');
  assert(mutationId.startsWith('mut_'), `Offline mutation enqueued with unique ID: ${mutationId}`);

  const queue = syncManager.getMutationQueue();
  assert(queue.length === 1, `Mutation queue persists exactly 1 queued mutation (found: ${queue.length})`);
  assert(queue[0].id === mutationId, 'Queued mutation ID matches returned ID');
  assert(queue[0].status === 'pending', 'Queued mutation initialized in pending state');
  assert(queue[0].type === 'INSERT', 'Queued mutation records correct INSERT type');

  console.log('\n====================================================');
  console.log(`PHASE 8 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exit(1);
  }
});
