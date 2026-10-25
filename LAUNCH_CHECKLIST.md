# EARPA LAUNCH READINESS CHECKLIST & RELEASE GATES
Version: 2.0 (2026-10-25)
Target Launch Date: October 30, 2026 (Private Usability Cohort)
Buffer Date: October 31, 2026

---

## 1. RELEASE GATES AUDIT

### Gate A: Private Usability Beta (Target: October 30, 2026)
All items must pass before issuing invitations to the 5–10 private harper testers:

- [x] **A1. User Authentication & Profile Persistence:** Per-user isolation verified; trials and sessions restore without cross-account bleed. (PASS via `persistence_audit.cjs`)
- [x] **A2. Multi-Note Input & Timing:** State machine enforces clean sequence entry; duplicate submissions blocked; settling separation gap (300ms) prevents audio clash; target pattern replays at tempo with NO tonic resolution walk. (PASS via `test_multinote_timing.cjs`)
- [x] **A3. Five-Round Lever Sessions:** Scored lever practice strictly contains 5 rounds (not 20); 4/5 correct unlocks next stage; historical records preserved. (PASS via `test_lever_5round_session.cjs`)
- [x] **A4. Guided Interactive Lever Teaching:** Interactive step-by-step introduction replaces passive text; correct lever group order verified for Eb, C, and Bb native harps; both C strings handled. (PASS in `LeverTrainingScreen.tsx`)
- [x] **A5. Interactive Demos:** Three short, skippable, replayable demos (Single Note, Multi Note, Levers) that never pollute scored analytics. (PASS in `DemoModal.tsx`)
- [x] **A6. Rights Cleared for Shipped Assets:** Unsupported endorsement references removed from feedback catalog; generic "sharping levers" terminology used in public copy. (PASS in `MusicalResponsesCatalog.ts`, `CelticHarpCanvas.tsx`, `LeversTabScreen.tsx`)
- [x] **A7. Safe Error & Recovery States:** Lightweight animated SVG loader with connection retry and error states. (PASS in `AppLoader.tsx`)
- [ ] **A8. Physical Mobile Device Testing:** Physical iPhone Safari and Android Chrome test results to be conducted with invited cohort on Oct 30.

### Gate B: Paid Founding Access (Target: Following 7–14 Day Evaluation)
All items must pass before opening paid transactions:

- [ ] **B1. Real User Retention Evidence:** 7-day retention measured on real external users outside the immediate family network.
- [ ] **B2. Approved Seller & Processor Setup:** Paddle or Stripe merchant configuration active; customer currency and tax remittance verified.
- [x] **B3. Server-Verified Entitlements:** Webhooks verified idempotently; no access granted by client-side URL or localStorage flag alone. (PASS via `test_payments.cjs`)
- [x] **B4. Clear Pricing & Renewal Disclosures:** $24 first year and $39 renewal prominently displayed prior to checkout. (Documented in `DECISIONS.md`)
- [ ] **B5. Consumer Protection & Privacy:** Terms of service, refund policy, and privacy policy active and compliant.
- [x] **B6. Zero Critical Defects:** No active progress-loss, data corruption, or payment defects. (All test suites PASS 100%)

---

## 2. REBASED SCHEDULE (OCTOBER 25 – OCTOBER 31, 2026)

| Date | Planned Focus | Milestones | Status |
| :--- | :--- | :--- | :--- |
| **Oct 25 (Sun)** | Baseline Audit, Rights Register, Task Matrix | Git checkpoint created, 3D model hash verified, Requirements, Rights Register, Decisions authored | **COMPLETED** |
| **Oct 25 (Sun)** | Rights Remediation, 5-Round Lever Mechanics | Endorsement claims purged, generic sharping levers restored, 5-round lever sessions implemented & tested | **COMPLETED** |
| **Oct 25 (Sun)** | Multi-Note Timing & Interactive Lever Teaching | Settling gap calibrated, duplicate guard added, interactive guided action lever teaching implemented | **COMPLETED** |
| **Oct 25 (Sun)** | Interactive Demos, PWA Icons & Loader | DemoModal created, Celtic PWA icons generated, AppLoader created, web bundle exported | **COMPLETED** |
| **Oct 26–29** | Cohort Invitation Prep & Owner Merchant Decisions | Supervised testing protocol setup, feedback form setup, Paddle/Stripe owner onboarding | **UPCOMING** |
| **Oct 30 (Fri)** | Physical Device Testing & Private Beta Launch | Verify on iOS Safari and Android Chrome; onboard 5–10 invited harper testers | **UPCOMING** |
| **Oct 31 (Sat)** | Defect Buffer & User Observation | Monitor initial tester sessions, fix edge cases, log feedback | **UPCOMING** |
| **Nov 01–14** | 7–14 Day Retention Measurement Window | Evaluate user return rates, fix critical usability issues, prepare paid opening | **UPCOMING** |
