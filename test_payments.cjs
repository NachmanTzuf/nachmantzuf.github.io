// test_payments.cjs
// Deterministic Sandbox Billing & Entitlements Test Suite

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ts = require('typescript');

require.extensions['.ts'] = (m, f) => {
  const content = fs.readFileSync(f, 'utf8');
  m._compile(ts.transpileModule(content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
};

// Mock localStorage
const store = new Map();
global.localStorage = { getItem: k => store.get(k) || null, setItem: (k, v) => store.set(k, v) };
global.window = { localStorage: global.localStorage };

const { BillingService } = require('./src/services/billing/BillingService.ts');

console.log('Running Sandbox Billing & Entitlements Test Suite...');

const billing = BillingService.getInstance();
const testUser = 'usr_test_harper_1';

// Test 1: Unpaid user defaults to free tier
const defaultEnt = billing.getEntitlement(testUser);
assert.equal(defaultEnt.status, 'free', 'Default status must be free');
assert.equal(billing.hasPaidAccess(testUser), false, 'Free user must not have paid access');
console.log('PASS 1: Default entitlement is free with zero paid access.');

// Test 2: Successful subscription creation webhook activates founding access
const oneYearLater = Date.now() + 365 * 24 * 60 * 60 * 1000;
const createEvent = {
  eventId: 'evt_webhook_001',
  eventType: 'subscription.created',
  userId: testUser,
  planId: 'earpa_founding_annual',
  status: 'active',
  currentPeriodEnd: oneYearLater,
  timestamp: Date.now(),
};
const res1 = billing.processVerifiedWebhook(createEvent);
assert.equal(res1.success, true);
assert.equal(billing.hasPaidAccess(testUser), true, 'User must have paid access after creation');
const activeEnt = billing.getEntitlement(testUser);
assert.equal(activeEnt.status, 'founding');
assert.equal(activeEnt.planId, 'earpa_founding_annual');
console.log('PASS 2: Subscription creation activates founding status with paid access.');

// Test 3: Idempotent duplicate webhook replay
const res2 = billing.processVerifiedWebhook(createEvent);
assert.equal(res2.success, true);
assert.equal(res2.duplicate, true, 'Replayed event must be flagged as duplicate without mutating state');
console.log('PASS 3: Duplicate webhook handled idempotently.');

// Test 4: Failed payment webhook marks status past_due
const failEvent = {
  eventId: 'evt_webhook_002',
  eventType: 'payment.failed',
  userId: testUser,
  planId: 'earpa_founding_annual',
  status: 'past_due',
  currentPeriodEnd: oneYearLater,
  timestamp: Date.now(),
};
billing.processVerifiedWebhook(failEvent);
const pastDueEnt = billing.getEntitlement(testUser);
assert.equal(pastDueEnt.status, 'past_due', 'Status must be updated to past_due');
assert.equal(billing.hasPaidAccess(testUser), false, 'Past due user must not have active access');
console.log('PASS 4: Payment failure transitions to past_due.');

// Test 5: Subscription cancellation sets cancelAtPeriodEnd while preserving access until period end
billing.processVerifiedWebhook({
  eventId: 'evt_webhook_003',
  eventType: 'subscription.renewed',
  userId: testUser,
  planId: 'earpa_standard_annual',
  status: 'active',
  currentPeriodEnd: oneYearLater,
  timestamp: Date.now(),
});
assert.equal(billing.hasPaidAccess(testUser), true);

billing.processVerifiedWebhook({
  eventId: 'evt_webhook_004',
  eventType: 'subscription.canceled',
  userId: testUser,
  planId: 'earpa_standard_annual',
  status: 'canceled',
  currentPeriodEnd: oneYearLater,
  timestamp: Date.now(),
});
const canceledEnt = billing.getEntitlement(testUser);
assert.equal(canceledEnt.cancelAtPeriodEnd, true, 'Must set cancelAtPeriodEnd');
assert.equal(billing.hasPaidAccess(testUser), true, 'Canceled subscription still active until currentPeriodEnd');
console.log('PASS 5: Cancellation flags cancelAtPeriodEnd while honoring paid access window.');

// Test 6: Refund event revokes access immediately
billing.processVerifiedWebhook({
  eventId: 'evt_webhook_005',
  eventType: 'payment.refunded',
  userId: testUser,
  planId: 'earpa_standard_annual',
  status: 'canceled',
  currentPeriodEnd: Date.now() - 1000,
  timestamp: Date.now(),
});
const refundedEnt = billing.getEntitlement(testUser);
assert.equal(refundedEnt.status, 'expired', 'Refund must immediately expire entitlement');
assert.equal(billing.hasPaidAccess(testUser), false, 'Refunded user must have zero paid access');
console.log('PASS 6: Refund revokes paid access immediately.');

console.log('\nALL 6 BILLING AND ENTITLEMENT TESTS PASSED DETERMINISTICALLY.');
