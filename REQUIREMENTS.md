# EARPA REQUIREMENTS TRACEABILITY MATRIX
Version: 2.1 (2026-10-25)
Project: Earpa (Celtic Lever Harp Ear Trainer)
Status Labels: NOT STARTED | IN PROGRESS | IMPLEMENTED / UNVERIFIED | VERIFIED | BLOCKED | DEFERRED

---

## NON-NEGOTIABLES & BASELINE INVARIANTS

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-NN-01** | Preserve approved 3D Celtic harp model geometry & materials | `public/models/celtic_harp_8string.glb`, `dist/models/celtic_harp_8string.glb` | SHA256 must match `605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E` exactly | `Get-FileHash` | **VERIFIED** |
| **REQ-NN-02** | Preserve warm acoustic sound direction & Karplus-Strong physical modeling | `src/services/audio/HarpSoundSynthesizer.ts`, `src/services/audio/CadenceEngine.ts` | 600Hz filtered pink noise excitation, Sitka spruce formant filters, zero digital clicks | `verify_engine.cjs`, audio unit tests | **VERIFIED** |
| **REQ-NN-03** | Support three native harp tunings: Eb Major, C Major, Bb Major | `src/services/curriculum/TuningMatrixEngine.ts`, `src/components/settings/NativeTuningSelector.tsx` | All 24 major lever configurations, correct baseline pitches, and dynamic lever frequency shifts | `curriculum_audit.cjs` | **VERIFIED** |
| **REQ-NN-04** | Support note names, solfege, and scale degree notations | `src/services/account/UserAccountDatabase.ts`, `src/components/game/InGamePlayScreen.tsx` | Notation preference updates shelf labels, trial logs, and feedback text in real time | `persistence_audit.cjs` | **VERIFIED** |
| **REQ-NN-05** | Image-anchored road alignment on all three realm maps | `src/components/roadmap/trailGeometry.ts`, `src/components/home/RoadmapModal.tsx` | All 30 stepping stone markers remain locked to paved walkway across all viewport aspect ratios | `verify_engine.cjs` | **VERIFIED** |

---

## PHASE 0: RIGHTS AND LEGAL READINESS

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P0-01** | Evidence-based Rights Register authored for all shipped assets | `RIGHTS_REGISTER.md` | Complete inventory of 3D models, images, audio, fonts, curriculum, dependencies, and branding with license status | File inspection & audit | **VERIFIED** |
| **REQ-P0-02** | Purge unsupported endorsement claims from user-facing copy | `src/services/intelligence/MusicalResponsesCatalog.ts` | Remove "Alain Benbassat would raise a toast" (COR_006); replace with original pedagogical text | Code inspection & unit test | **VERIFIED** |
| **REQ-P0-03** | Neutralize proprietary manufacturer trademarks in user-facing copy | `src/services/intelligence/MusicalResponsesCatalog.ts`, UI text | Replace "Camac levers" with generic "sharping levers" in public feedback | Code search & text check | **VERIFIED** |
| **REQ-P0-04** | Distinguish internal musical principles from protected curriculum arrangement | `src/services/curriculum/curriculumData.ts`, `RIGHTS_REGISTER.md` | Document functional ear training musical principles vs original implementation and notation | Architectural documentation | **VERIFIED** |
| **REQ-P0-05** | Prepare legal seller, customer jurisdiction, and privacy disclosure decisions | `RIGHTS_REGISTER.md`, `DECISIONS.md` | Concise issue brief for owner regarding merchant of record, privacy policy, and age limits | Documentation review | **VERIFIED** |

---

## PHASE 1: RELEASE SCOPE AND BUSINESS

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P1-01** | Scope initial release as HTTPS Progressive Web App | `dist/manifest.json`, `src/app/index.tsx` | Add-to-home-screen installable PWA; no native store packaging this week | Browser manifest verification | **VERIFIED** |
| **REQ-P1-02** | Document pricing hypothesis ($24 founding, $39 renewal) and revenue models | `DECISIONS.md` | Models at 25, 50, 100, 300, 500, 1000 paying users separating gross, cash, fees, and churn | Mathematical audit | **VERIFIED** |
| **REQ-P1-03** | Verify payment processor eligibility for Israeli entity (Paddle vs Stripe vs local) | `DECISIONS.md` | Document concrete merchant-of-record options without foreign incorporation assumptions | Provider eligibility review | **VERIFIED** |

---

## PHASE 2: ACCOUNTS AND PERSISTENCE

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P2-01** | Per-user isolation and local profile persistence | `src/services/account/UserAccountDatabase.ts` | Trials, sessions, practice time, tuning, notation, and progress partitioned per user ID | `persistence_audit.cjs` | **VERIFIED** |
| **REQ-P2-02** | Profile photo upload, local resize, and persistence | `src/components/account/ProfilePhoto.tsx`, `src/services/account/UserAccountDatabase.ts` | Uploaded photo resizes locally, saves to profile, and displays in header, Journey, and switcher | Browser fixture test | **VERIFIED** |
| **REQ-P2-03** | Cloud account architecture & Supabase client integration | `src/services/account/CloudAccounts.ts`, `supabase/schema.sql` | RLS policies, email OTP auth flow, no service-role secrets in client bundle | Schema audit & code review | **VERIFIED** |
| **REQ-P2-04** | Two-device conflict handling & offline queue safety | `src/services/account/CloudAccounts.ts`, `src/services/account/UserAccountDatabase.ts` | Newer cloud progress never overwritten by stale local state; unique event IDs prevent duplicates | Code implementation & test | **VERIFIED** |
| **REQ-P2-05** | Explicit local profile to cloud account migration | `src/services/account/UserAccountDatabase.ts`, `src/components/account/CloudAccountPanel.tsx` | User explicitly chooses when to link local progress to a cloud account | Code review & UI test | **VERIFIED** |

---

## PHASE 3: MUSIC AND INTERACTION FIXES

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P3-A01** | Multi-note explicit state machine: stimulus -> accepting -> complete -> separation -> replay -> feedback -> next | `src/components/game/InGamePlayScreen.tsx` | Clean transitions; wait for all required guesses; guard against duplicate submission | Automated & interactive test | **VERIFIED** |
| **REQ-P3-A02** | Multi-note post-guess settling separation (250-350ms) and acoustic tail management | `src/components/game/InGamePlayScreen.tsx`, `src/services/audio/HarpSoundSynthesizer.ts` | Configurable 250-350ms gap; damp prior note tail so replay does not clash | Audio scheduling review | **VERIFIED** |
| **REQ-P3-A03** | Melody replay of actual target notes at tempo (dyads together) with NO tonic walk | `src/components/game/InGamePlayScreen.tsx` | Replays actual target sequence at target BPM; harmonic dyads replay simultaneously; tonic walk strictly excluded | Code check & browser test | **VERIFIED** |
| **REQ-P3-A04** | Cleanup of timers and cancellation on unmount or restart | `src/components/game/InGamePlayScreen.tsx` | Exiting round or restarting clears all pending playback timeouts; late taps ignored | Code audit & test | **VERIFIED** |
| **REQ-P3-B01** | Five-round scored lever sessions | `src/components/game/LeverTrainingScreen.tsx`, `src/services/curriculum/leverCurriculum.ts` | Scored sessions contain exactly 5 rounds (not 20); 4/5 correct unlocks next stage; 20-round assumptions removed | Unit test & gameplay run | **VERIFIED** |
| **REQ-P3-B02** | Historical session accounting preserves 20-round records | `src/services/account/UserAccountDatabase.ts` | Historical denominator remains accurate; new sessions log 5 rounds | Persistence test | **VERIFIED** |
| **REQ-P3-C01** | Interactive guided action lever teaching replacing passive reading | `src/components/game/LeverTrainingScreen.tsx` | Interactive sequence: show all-down -> highlight lever -> user flips -> sound open/raised -> circle of fifths -> mathematical explanation -> try independently | Component implementation | **VERIFIED** |
| **REQ-P3-C02** | Correct lever group order per native tuning (Eb, C, Bb) and both C strings | `src/components/game/LeverTrainingScreen.tsx`, `src/services/curriculum/TuningMatrixEngine.ts` | Eb=A,E,B,F,C,G,D; C=F,C,G,D,A,E,B; Bb=E,B,F,C,G,D,A; both C strings validated | Automated matrix test | **VERIFIED** |
| **REQ-P3-C03** | Lever safe zone: no accidental string plucks near levers | `src/components/3d/CelticHarpCanvas.tsx` | Upper 30% of string safe zone rejects plucks; only lower 70% playable | Proximity raycast test | **VERIFIED** |

---

## PHASE 4: ONBOARDING, DEMOS AND PRESENTATION

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P4-01** | 6-step animated onboarding flow | `src/components/account/WelcomeProfile.tsx` | Step-by-step: name -> photo -> tuning -> notation -> experience -> starting point; progress bar visible | Browser onboarding test | **VERIFIED** |
| **REQ-P4-02** | Three interactive demos (Single Note, Multi Note, Levers) | `src/components/game/DemoModal.tsx` | Skippable, replayable, saves completion, never pollutes scored analytics, never leaks answers | Component test | **VERIFIED** |
| **REQ-P4-03** | Honest profile-specific Journey statistics with empty states | `src/components/tabs/ProfileTabScreen.tsx` | Unpracticed degrees show empty states; distinguish note accuracy from whole-round accuracy | Browser inspection | **VERIFIED** |
| **REQ-P4-04** | Small-size readable Celtic app icon & PWA manifest assets | `public/manifest.json`, `public/images/icons/` | Master SVG, maskable icons, Apple touch icon, favicon, correct theme colors | PWA audit | **VERIFIED** |
| **REQ-P4-05** | Lightweight loading indicator with retry/error states | `src/components/common/AppLoader.tsx` | Lightweight CSS/SVG animated mark; no heavy autoplay video; error/retry states | Component test | **VERIFIED** |

---

## PHASE 5: PAYMENTS AND PRODUCTION

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P5-01** | Hosted checkout & billing architecture | `src/services/billing/BillingService.ts` | Server-verified entitlements; never grant access from browser URL alone; clear pricing and renewals | Sandbox test | **VERIFIED** |
| **REQ-P5-02** | Sandbox test suite for payments | `test_payments.cjs` | Success, failure, duplicate webhook, cancellation, expiry, refund handling | Scripted test | **VERIFIED** |

---

## PHASE 6: REMINDERS AND COMMUNITY

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P6-01** | User-controlled practice reminders (opt-in only) | `src/services/notifications/` | Explicit opt-in after experience; user-chosen time & timezone; no guilt language; quiet hours | Architectural design | **DEFERRED** |
| **REQ-P6-02** | Private profiles by default; deferred public feeds | `src/services/social/` | No public directory or direct messaging without moderation/reporting; opt-in display names only | Architectural design | **DEFERRED** |

---

## PHASE 7: MARKETING AND LAUNCH

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P7-01** | Private beta testing plan for 5-10 invited users (Target: Oct 30) | `LAUNCH_CHECKLIST.md` | Supervised onboarding, real-use observation protocol, feedback form, funnel tracking | Protocol review | **VERIFIED** |
| **REQ-P7-02** | Honest marketing copy & video storyboard | `MARKETING_BRIEF.md` | Real listening/responding behavior, approved visuals, no fabricated claims or fake user counts | Copy review | **VERIFIED** |

---

## PHASE 8: DEFENSIBILITY AND EXPANSION

| Req ID | Description | Files Involved | Acceptance Criteria | Test Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-P8-01** | Decoupled architecture across exercise, instrument, audio, visual, and accounts | Codebase structure | Clean boundaries allowing future pedal harp or piano extensions without rewrites | Architectural review | **VERIFIED** |
| **REQ-P8-02** | Documented expansion analysis for pedal harp and piano | `DECISIONS.md` | Objective technical assessment of 7-pedal mechanical systems vs 2-state levers | Technical analysis | **VERIFIED** |
