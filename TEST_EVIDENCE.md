# EARPA TEST EVIDENCE & VERIFICATION LEDGER
Version: 2.0 (2026-10-25)
Standard: Deterministic Verification (No fabricated tests or unverified claims)

---

## 1. BASELINE AUDIT EVIDENCE (2026-10-25)

### Test Run 1: Master 3D Harp Geometry Hash Verification
- **Command:** `Get-FileHash public/models/celtic_harp_8string.glb -Algorithm SHA256`
- **Output:**
  ```
  Algorithm       Hash
  ---------       ----
  SHA256          605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E
  ```
- **Verdict:** **PASS** (100% identical to locked reference hash).

### Test Run 2: Full TypeScript Compiler Diagnostic Check
- **Command:** `cmd /c npx tsc --noEmit`
- **Exit Code:** `0`
- **Output:** 0 errors, clean compilation across all source and test files.
- **Verdict:** **PASS**.

### Test Run 3: Core Engine & Invariant Verification Suite
- **Script:** `verify_engine.cjs`
- **Command:** `powershell -Command "node 'C:/Users/Hp/.codex/.chatgpt-projects/g-p-6a967e36c0e88191897fc93dcbc7d361/review/verify_engine.cjs'"`
- **Exit Code:** `0`
- **Output:**
  ```
  PASS: minor pitches, cadences, tonic paths/holds, 408 curriculum/tuning combinations (10 samples each), edited syntax.
  PASS: session isolation, account trial isolation, per-profile notation.
  PASS: all 30 marker centers remain image-anchored across four map viewport sizes.
  ```
- **Verdict:** **PASS**.

### Test Run 4: Curriculum Reference & Tuning Matrix Audit
- **Script:** `curriculum_audit.cjs`
- **Command:** `powershell -Command "node 'C:/Users/Hp/.codex/.chatgpt-projects/g-p-6a967e36c0e88191897fc93dcbc7d361/review/curriculum_audit.cjs'"`
- **Exit Code:** `0`
- **Output:**
  ```
  PDF rows checked: 136 ; mismatches: []
  PASS: all PDF round counts, melody lengths/tempos, single-path cadence modes/registers, 24 major lever configurations and chromatic-minor resolution starting pitches.
  ```
- **Verdict:** **PASS**.

### Test Run 5: Profile Persistence & Practice Rhythm Audit
- **Script:** `persistence_audit.cjs`
- **Command:** `powershell -Command "node 'C:/Users/Hp/.codex/.chatgpt-projects/g-p-6a967e36c0e88191897fc93dcbc7d361/review/persistence_audit.cjs'"`
- **Exit Code:** `0`
- **Output:**
  ```
  PASS: separate profiles/tunings/progression, zero fabricated streak, exact session time without double-counting.
  ```
- **Verdict:** **PASS**.

### Test Run 6: Local Web Server Live Endpoint Status
- **Commands:**
  - `(Invoke-WebRequest -Uri 'http://localhost:8088/' -UseBasicParsing).StatusCode` -> `200`
  - `(Invoke-WebRequest -Uri 'http://localhost:8088/viewer.html' -UseBasicParsing).StatusCode` -> `200`
- **Verdict:** **PASS**.

---

## 2. PRODUCTION ENHANCEMENT AUDIT EVIDENCE (2026-10-25)

### Test Run 7: Five-Round Lever Session & Advancement Gate
- **Script:** `test_lever_5round_session.cjs`
- **Command:** `powershell -Command "node test_lever_5round_session.cjs"`
- **Exit Code:** `0`
- **Output:**
  ```
  PASS: All 7 LEVER_LEVELS configured with exactly 5 rounds.
  PASS: 4/5 lever session passes and advances leverStage to 1.
  PASS: 3/5 lever session fails (60%) and does not advance leverStage.
  PASS: Historical 20-round sessions preserve their denominator without alteration.
  ALL FIVE-ROUND LEVER MECHANICS TESTS PASSED DETERMINISTICALLY.
  ```
- **Verdict:** **PASS**.

### Test Run 8: Multi-Note Timing & State Machine Audit
- **Script:** `test_multinote_timing.cjs`
- **Command:** `powershell -Command "node test_multinote_timing.cjs"`
- **Exit Code:** `0`
- **Output:**
  ```
  PASS: Guard against duplicate sequence submissions verified
  PASS: Settling separation gap calibrated to 300ms (within 250-350ms ceiling)
  PASS: Dyad simultaneous playback and melodic tempo spacing verified
  PASS: Unmount and trial reset timer cancellation verified
  PASS: Target note sequence replay verified without tonic walk
  All 5 Phase 3.A Multi-Note Timing tests passed successfully!
  ```
- **Verdict:** **PASS**.

### Test Run 9: Sandbox Billing, Entitlements & Webhook Replay Suite
- **Script:** `test_payments.cjs`
- **Command:** `powershell -Command "node test_payments.cjs"`
- **Exit Code:** `0`
- **Output:**
  ```
  PASS 1: Default entitlement is free with zero paid access.
  PASS 2: Subscription creation activates founding status with paid access.
  PASS 3: Duplicate webhook handled idempotently.
  PASS 4: Payment failure transitions to past_due.
  PASS 5: Cancellation flags cancelAtPeriodEnd while honoring paid access window.
  PASS 6: Refund revokes paid access immediately.
  ALL 6 BILLING AND ENTITLEMENT TESTS PASSED DETERMINISTICALLY.
  ```
- **Verdict:** **PASS**.

### Test Run 10: Expo Web Production Build & Asset Synchronization
- **Commands:**
  - `cmd /c npx expo export --platform web` (Exit code: 0)
  - `robocopy public dist /E /IS /IT /NP` (166 files synchronized, Exit code: 0)
  - `Get-FileHash public/models/celtic_harp_8string.glb, dist/models/celtic_harp_8string.glb -Algorithm SHA256`
- **Output:**
  ```
  public/models/celtic_harp_8string.glb: 605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E
  dist/models/celtic_harp_8string.glb:   605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E
  ```
- **Verdict:** **PASS** (100% hash preservation, zero drift).
