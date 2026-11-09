# Earpa rebuild — 28 October 2026

## Ready locally
- KineticLandscape.mp4: 45 seconds, 1920×1080, 30 fps.
- KineticVertical.mp4: 45 seconds, 1080×1920, 30 fps.
- SingleNoteWalkthrough.mp4: 40 seconds, 1080×1920, 30 fps.
- LeverMasterclassRebuilt.mp4: 90 seconds, 1080×1920, 30 fps.
- Review gallery: http://localhost:8088/watch-rebuilt.html
- App preview: http://localhost:8088/
- Editable Remotion compositions: http://localhost:3015/

The latest four-video scope was used. No additional 30-second variants were rendered.

## What changed
Ads retain the exact original V6 voice/script recording (AndrewMultilingualNeural and its original processing). The original mix SHA256 is 8725808f4edc14323e323f2d7b6a283a7c05fa2aba0ed0e062e8d72b50f9c0b7. The export adds timed tactile transitions, rapid typography, rotating harp shots, perspective phone handoffs, vertical entrances and axial pushes. All app imagery fills a single phone screen.

The single-note lesson demonstrates actual CadenceEngine/ResolutionWalker notes using HarpSoundSynthesizer samples: correct D→C and wrong E against target F, followed by F→E→D→C. It is a timed reconstruction using genuine app captures, not a continuous live screen recording. Selected strings and buttons are highlighted. The masterclass teaches E-flat native tuning, lever semitones, the circle of fifths, E-flat→B-flat→F→C→G, then D Dorian and D major. Other native tunings need their own instructional examples.

The lesson button is a normal-flow secondary action below Play in the shared HomeHeroHarp action stack. Its 44px hit area has roughly 15px or more separation from Play and 20.67px clearance above navigation. All nine combinations of three paths and 375×667, 393×852, 412×915 phone sizes passed. The lesson opens and the new video loads inside the app.

Harp geometry, materials and app camera were unchanged. App GLB SHA256 remains 605dc38beafb16cec9a9bc40d4bac04090c1306c992e5cabaca642177445ce6e.

## Verification and limits
App web build and video TypeScript checks passed. All four finished files have expected dimensions, frame counts and exact durations. The measured ~42.7ms export audio offset was removed without rerendering video; source/output correlation reports 0ms residual. Measured delivered integrated loudness is approximately -13.29 LUFS for ads, -14.80 for single-note, -14.32 for masterclass. Highest measured true peak is -0.27dBTP; no clipping was detected. See the input_* values in verification.json; output_* values are hypothetical loudnorm results, not applied normalization.

Independent review inspected final sampled frames and found no remaining must-fix issues. Review was bounded-frame inspection and technical measurement, not continuous independent listening. Scale-note labels in the masterclass can trail a new note onset by about 50ms because adjacent note envelopes overlap.

The optional video-shotcraft editing workbench could not start because Windows refused its symbolic link. Remotion Studio works; an editable shot/headline/audio manifest remains in earpa-video/src/workbench.tsx. No security settings were changed.

## Publication pending
The live site has NOT been updated by this rebuild. Automatic approval review rejected the attempted commit/push because explicit permission to update the live default branch could not be verified. No workaround was used. The local gallery and lesson manifest are ready for review and publication approval. Existing reference films and the previous gallery were preserved in watch-archive.html. No new marketing claims or legal clearance are asserted for the inherited V6 wording.
