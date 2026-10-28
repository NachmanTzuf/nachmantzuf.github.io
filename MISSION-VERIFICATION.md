# Earpa mission verification — 28 October 2026

## Verified so far
- App TypeScript check and Expo web export pass.
- Video project TypeScript check passes.
- 231 music cases cover the three native tunings, every reachable major key and all seven relative modes; tonic-to-octave intervals and unavailable-key rejection pass.
- Reminder client tests pass: account ownership, local time, permission denial, subscription registration, failure handling, unsubscribe, foreground fallback. These are mocked integration tests, not live-device delivery evidence.
- Five-round persistence tests pass: 4/5 advances, 3/5 does not, historical 20-round records retain their denominator.
- Browser: Journey feedback entry visible; reminder time/preferences visible; D Dorian lesson explains C-major levers; A-flat major correctly says retuning is required on E-flat-native harp; A/E/B-up trial reports Correct and D–E–F–G–A–B–C–D.
- The app harp GLB SHA256 remains 605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E.
- Private Supabase key is absent from exported JavaScript. Supabase library contains the literal sb_secret_ prefix in its own validation code; that is not an embedded credential.

## Existing regression discrepancy
test_multinote_timing.cjs expects a literal 250–350ms separation. Current pre-existing implementation uses Math.max(700, beat), so that assertion fails. Timing was preserved rather than reverting another author's change just to satisfy a stale string-based test. No claim that every repository test passes.

## Remaining external or experiential checks
- Install on real iPhone and Android phones; check physical audio perception, touch ergonomics, notification delivery with app closed, reboot and timezone changes.
- Activate SQL, Edge Function, VAPID secrets and authenticated cron. The local implementation does not prove server delivery.
- Supply or license a human harp solo and real-player instructional footage. Current media is explicitly synthetic/animated review material.
- Review narration and the preserved V5 ending claims before advertising. In particular, the retained V5 ending includes 220+ levels; current new curriculum does not substantiate that claim.
- Existing Git remote contains a credential exposed in an earlier tool output. Owner should revoke/rotate it. Never include it in the archive.

## Reproduce
node scripts/verify_mission.cjs
node scripts/verify_notifications.cjs
node scripts/verify_bundle_secrets.cjs
node test_lever_5round_session.cjs
npx tsc --noEmit
npx expo export --platform web

Media frame counts, dimensions, duration and loudness are written to earpa-video/out/mission/media-verification.json after all exports finish.

Final release checks: all 15 encoded exports measured between -14.01 and -14.00 LUFS. Seven lesson URLs returned HTTP 206 for byte ranges. Embedded masterclass browser playback reached 18 seconds with readyState 4 and no media error. Final wrong-answer Dorian feedback retained the attempted answer and identified E/A/B to raise. See earpa-video/src/mission/media-verification.json for final export hashes and measurements.
