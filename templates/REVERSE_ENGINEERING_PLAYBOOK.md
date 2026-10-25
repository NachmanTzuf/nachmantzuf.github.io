---
title: Reverse Engineering Playbook for Mobile Applications
schema_version: agos.note/1
project_id: mobile_architecture
status: active
revision: 1
---

# REVERSE ENGINEERING PLAYBOOK FOR MOBILE APPLICATIONS

This playbook guides mobile architects through deconstructing reference mobile applications and recreating them with architectural enhancements, tactile ergonomics, and bespoke product identity.

---

## 1. EXECUTIVE DECONSTRUCTION PROTOCOL

Every benchmark mobile application succeeds through intentional convergence of tactile ergonomics, fluid physics, and psychological engagement loops. Recreating an experience with an elevated custom twist requires dissecting its underlying mechanisms before writing code.

The deconstruction lifecycle operates across three phases:
• Phase 1: Physical and visual asset extraction from 120 frame per second captures.
• Phase 2: Finite state machine modeling of user flows and error recovery.
• Phase 3: Psychological core loop mapping via the 4 phase Hook Cycle.

---

## 2. VISUAL TOKEN EXTRACTION FROM 120FPS RECORDINGS

High refresh rate capture reveals micro decisions invisible during casual use.

### Video Capture Standards
• Device Setup: Connect flagship hardware running ProMotion or Smooth Display. Enable developer touch indicators to expose exact tap coordinates and drag paths.
• Capture Rate: Record uncompressed video at 120 frames per second over USB.
• Tooling: Use frame stepping utilities to analyze interactions at 8.33 millisecond intervals.

### Extracting Motion Physics
• Frame Counting: Measure the exact frame count from gesture release to visual rest. A 24 frame animation at 120fps equates to 200 milliseconds.
• Spring Estimation: Note whether the element overshoots its target boundary. If zero overshoot occurs, the damping ratio exceeds 0.75. If subtle bounce occurs, damping sits between 0.55 and 0.65.
• Parameter Translation:
  • Button compressions: stiffness 450, damping 24, mass 1.0.
  • Bottom sheets and modal slides: stiffness 220, damping 28, mass 1.0.
  • Celebratory elements and badges: stiffness 180, damping 14, mass 0.9.

### Extracting Color Palettes and Surface Depths
• Background Sampling: Avoid pure pitch black (#000000) unless auditing an OLED power conservation theme. Sample root canvases to identify deep obsidian tones (#0A0C10 or #12141C).
• Elevation Hierarchy: Measure the alpha tint progression across floating cards:
  • Level 0 Canvas: Base neutral surface.
  • Level 1 Cards: 5% to 8% white tint overlay.
  • Level 2 Floating Modals: 10% to 15% white tint overlay with diffuse drop shadows.
• Accent Ratios: Ensure all extracted primary accents achieve minimum 4.5:1 contrast against adjacent backgrounds for WCAG compliance.

### Extracting Typography Scales
• Dynamic Type Hierarchy: Identify header, title, body, and caption sizes.
• Leading and Tracking: Note line heights and letter spacing. Modern high density screens require loosened tracking on uppercase subheadings (+0.8pt) and tightened tracking on massive headlines (minus 0.5pt).

---

## 3. FINITE STATE MACHINE DECONSTRUCTION

Every interactive screen must be modeled as a deterministic state machine before layout authoring. Unhandled edge cases produce broken UI states and user frustration.

### The 6 Canonical Screen States
• State 1: Idle
  The screen presents ready interactive surfaces. Cached data renders immediately from local MMKV or SQLite storage without layout shifts.
• State 2: Loading
  Skeleton placeholders maintain exact component heights. Avoid generic center screen spinning indicators.
• State 3: Interacting
  Touch down feedback triggers immediately on the native UI thread. Buttons compress, sliders track thumbs, and sheet drags respond at 120Hz.
• State 4: Success
  Affirmation haptics trigger. Optimistic updates persist to local state before remote cloud acknowledgments arrive.
• State 5: Error
  Graceful fallback surfaces display. Non destructive retry triggers appear within the natural thumb zone.
• State 6: Recovering
  Background sync reconciles queued mutations. Stale data transitions smoothly to current state without full screen reloads.

### State Transition Matrix

```
[Idle] ─────────── (User Tap) ───────────> [Interacting]
  │                                             │
  │ (Data Fetch)                                │ (Gesture Release)
  ▼                                             ▼
[Loading] ──────> [Success] <──────────── [Optimistic Commit]
  │                 │                           │
  │ (Network Fail)  │ (Background Sync)         │ (Server Rejection)
  ▼                 ▼                           ▼
[Error] <───────── [Recovering] <──────── [Rollback Mutation]
```

---

## 4. BEHAVIORAL ENGAGEMENT LOOP DECONSTRUCTION

Iconic apps capture user retention through disciplined behavioral psychology. Deconstruct reference features using the 4 phase Hook Cycle.

### Phase 1: The Trigger
• External Triggers: Push notifications, lock screen widgets, app icon badges, calendar events.
• Internal Triggers: Micro boredom, curiosity, achievement anxiety, desire for skill progression.
• Architectural Rule: External triggers must deep link directly to the target interactive screen via Expo Router paths, bypassing welcome screens.

### Phase 2: The Action
• The action must demand minimal physical and cognitive effort.
• Fitts Law Alignment: Primary CTAs must occupy the bottom 40% of the viewport (Natural Thumb Zone) with minimum 48dp touch heights.
• Zero Friction Inputs: Pre populate default selections; provide tactile segmented chips over text fields.

### Phase 3: The Variable Reward
• Unpredictable Reinforcement: Predictable rewards induce habituation and churn. Introduce variable dopamine pacing:
  • Progression Streaks: Daily counters with milestone celebratory haptics.
  • Surprise Micro Rewards: Random bonus points, unlockable interface themes, dynamic badges.
  • Audio Visual Spark: Particle bursts via Skia, haptic double pulses, and animated vector characters via Rive.

### Phase 4: The Investment
• The user contributes effort that increases switching costs and improves future sessions:
  • Skill Profiling: User answers diagnostic questions, building an adaptive profile.
  • Content Customization: Saving favorites, setting reminder cadences, accumulating history.
  • Session Resumption: Instant state serialization into MMKV ensures returning users resume at their exact scroll offset.

---

## 5. ERGONOMICS AND PHYSICAL TOUCH GEOMETRY

Reference apps often suffer from poor ergonomics on tall modern devices. When recreating an application, apply strict physical corrections.

### Natural Thumb Zone Partitioning
• Bottom 40% (Natural Reach): Place all primary buttons, bottom tabs, search bars, and swipe sheets here.
• Middle 35% (Comfortable Stretch): Place scrollable lists, content cards, and reading material here.
• Top 25% (Hard Reach Zone): Strictly preserve for passive status labels, progress indicators, and navigation titles. Never place destructive or high frequency actions in top corners.

### Touch Target Minimum Ceilings
• Apple HIG Standard: Minimum 44pt by 44pt.
• Material Design 3 Standard: Minimum 48dp by 48dp.
• Compact Icon Expansion: When an icon visually measures 24pt, expand its outer hit boundary using hitSlop to at least 48pt in all directions.

### Safe Area Clearance
• Top Notch and Dynamic Island: Handle top insets dynamically between 47pt and 59pt via useSafeAreaInsets.
• Bottom Home Indicator: Maintain at least 34pt bottom buffer to prevent accidental application dismissals during gestures.

---

## 6. SYSTEMATIC VERIFICATION CHECKLIST

Execute this verification audit before declaring any reverse engineered screen complete:

1. Visual Fidelity and Tokens:
   • Are all colors sourced from verified design tokens rather than hardcoded hex values?
   • Do elevated cards maintain clear contrast separation from root canvas surfaces?
   • Does typography adhere to standard type scale with scalable font units?

2. Motion and Physics:
   • Do all gesture handlers run on native UI thread worklets using Reanimated?
   • Are rigid linear easing curves completely replaced with Newtonian springs?
   • Does modal sheet dismissal track gesture velocity accurately?

3. Sensory Haptics:
   • Does button release trigger medium impact affirmation?
   • Does modal sheet docking trigger rigid impact latching?
   • Do achievement milestones trigger celebratory double pulse feedback?

4. Ergonomics and Touch:
   • Does every interactive element satisfy the 48dp minimum touch target ceiling?
   • Are primary interactive controls located within the bottom 40% Natural Thumb Zone?
   • Are safe area buffers enforced around Dynamic Island and bottom home indicator?

5. Resilience and Persistence:
   • Does the screen restore its active scroll offset and form inputs after app relaunch?
   • Are optimistic mutations queued locally for reliable offline operation?
   • Does the layout survive orientation changes and split screen multitasking?
