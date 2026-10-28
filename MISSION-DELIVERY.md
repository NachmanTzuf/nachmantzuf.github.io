# Earpa delivery report — 28 October 2026

This is an implemented app update and a review media suite. It is not a claim that every item of the mission is commercially finished.

| Requested phase | Delivered | Outstanding |
|---|---|---|
| 1. Three 45-second cinema masters | V7, V8, V9 editable compositions and 1920×1080/30fps exports; V5 closing shots reused | Human harp solo, voice/style approval, final musical sync, and clearance of inherited V5 marketing claims |
| 2. Five 45-second vertical shorts | Five 1080×1920/30fps drafts, one dominant phone, distinct narratives, mobile encodes | Human audio, measured acoustic waveform sync, final creative review; readability/layout deviations documented |
| 3. Six path explanations | Two animated 20-second studies per path; in-app gallery and playback | Real performer and finger-placement footage is absent; these are explicitly labeled animated previews |
| 4. Tester feedback | Journey button opens WhatsApp composer for the specified number, SMS fallback/option, haptic request | Physical-device haptic and installed-app routing check; no message was sent |
| 5. Daily reminders | Saved time, consent, foreground fallback, service-worker push handlers, per-user RLS schema, server sender and deployment instructions | SQL/function deployment, VAPID keys, cron, real-device closed-app/reboot tests. Background reminders are not live |
| 6. Lever learning | Native-aware solver, interactive fifths circle, 13 five-round lessons, seven modes, root-to-root replay, correct/incorrect lever feedback, 90-second animated masterclass | Ornate gear teeth/knotwork/tick sound and deeper guided-demo polish; instructor review of media; physical phone testing |
| 7. Verification/archive | Type checks, web export, 231 music cases, reminder mocks, five-round persistence checks, browser checks, metadata/loudness report, vault archive and gallery | Real-device acceptance remains; one pre-existing timing assertion disagrees with current implementation |

## Musical corrections
From E-flat native tuning, clockwise lever additions are A, E, B, F, C, G, D. A fixed lever harp cannot reach all twelve major keys without retuning. Modes share a parent configuration but use a different tonic. Unsupported keys are identified instead of teaching impossible lever positions. All three native tunings (E-flat, C, B-flat) are tested.

The model and harp appearance were preserved. Feedback now retains the submitted answer while changing the displayed harp to the correct configuration for replay. Browser verification of an all-down D-Dorian attempt showed Incorrect, 5 of 8 correct, and E/A/B to raise, followed by D–E–F–G–A–B–C–D.

## Evidence and limits
- App and Remotion TypeScript checks pass; Expo web export passes.
- 231 music cases and reminder client mocks pass. The mocks do not establish actual server push delivery.
- All 13 lever levels use five rounds. Four correct answers advance; three do not. Historical 20-round records retain their original denominator.
- Existing test_multinote_timing.cjs expects 250–350ms; existing app uses Math.max(700, beat). This pre-existing behavior was preserved; the repository is not claimed to have every test passing.
- Only two trial guesses were added to the existing Earpa Review test profile during browser QA. No real user account or completed session was created.
- The eight-string illustration cannot physically show every upper-octave note required by modal root-to-root playback. The app avoids highlighting a wrong string when no matching MIDI pitch exists.
- Media measurements are in media-verification.json. All videos remain review drafts. No unverified sub-300ms efficacy claim was added.
- V5 ending footage was preserved as requested; it retains historical claims including 220+ levels and named-method/manufacturer references. This is not rights clearance or approval for advertising.

## What is needed from the owner
1. Supply a licensed human harp solo and real-player demonstration footage, or approve commissioning/recording them. Current audio is synthesized harp plus AI narration.
2. Review the musical teaching and media with a harp instructor before public promotion.
3. Configure the push infrastructure using supabase/PUSH-SETUP.md and test on installed iPhone/Android PWAs.
4. Rotate the credential embedded in the existing Git remote: it appeared in an earlier tool output. No credential is included in this report or the media archive.

Account/database launch, payment setup, legal clearance, social community, and a complete redesign of every historical UI request are not claimed complete by this mission. The latest approved brief focused on media, tester feedback, reminders, and lever learning.
