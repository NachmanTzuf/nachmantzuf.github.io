# EARPA: CELTIC HARP EAR TRAINER
## MASTER SYSTEM ARCHITECTURE & DEVELOPER OPERATIONAL MANUAL
### Tailored for GPT Astra & Incoming Lead Engineering Agents

---

## 1. SYSTEM OVERVIEW & PEDAGOGICAL MANDATE

Earpa is an acoustic and visual ear training application engineered on React Native Web, Expo Router, and Three.js WebGL. It reconstructs the pedagogical framework of Alain Benbassat's Functional Ear Trainer within an authentic Celtic lever harp environment.

### Core Pedagogical Pillars
1. **Tonal Gravity Anchor:** The student never memorizes arbitrary pitch distances or intervals in isolation. Every exercise begins with an authentic four-voice harmonic cadence in the target key ($I - IV - V - I$) that establishes a gravitational tonal center (the Tonic Anchor).
2. **Stepwise Gravitational Resolution:** Every single scale degree is experienced not as an isolated pitch, but by its directional magnetic pull toward the nearest Tonic anchor ($C4$ or $C5$). Low degrees ($1, \flat 2, 2, \flat 3, 3, 4$) resolve downward to root $1$; high degrees ($5, \sharp 4, \flat 6, 6, \flat 7, 7, 8$) resolve upward to octave $8$.
3. **Physical Plucking as Response:** The student responds either by directly plucking strings on a 3D Celtic lever harp or by selecting the degree on a liquid glass shelf. Every response immediately sounds the selected pitch and executes the stepwise resolution walk, cementing intuitive auditory pattern recognition.
4. **Authentic Singing Tempo:** Resolution walks proceed at an unhurried, measured singing pace of $560\text{ ms}$ per step, culminating in a $1600\text{ ms}$ tonic hold and an $1100\text{ ms}$ pedagogical reflection pause.
5. **Multi-Account Partitioned Telemetry:** Sub-millisecond response latency ($performance.now()$), full eight-degree confusion matrices, daily practice logs, and personalized pedagogical prescriptions are tracked per user account.

---

## 2. EXACT FILESYSTEM LOCATIONS & REPOSITORY ANATOMY

All core project code, assets, builds, and system state files reside in standard directories on Windows 11:

```
c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\
├── dist\                                      # Production Web Export (served on port 8088)
│   ├── index.html                             # Compiled application entry point
│   ├── viewer.html                            # Standalone 3D Harp Luthier inspection studio
│   ├── models\celtic_harp_8string.glb         # Production 3D binary model
│   └── images\                                # Production sanctuary backdrops & pathways
├── public\                                    # Static public assets
│   ├── models\celtic_harp_8string.glb         # MASTER 3D MODEL (SHA256 locked)
│   ├── viewer.html                            # Master 3D Harp inspector
│   └── images\                                # High-res sanctuary backdrops
├── src\
│   ├── app\                                   # Expo Router file-based routes
│   │   ├── _layout.tsx                        # Root layout provider & global styles
│   │   └── index.tsx                          # Master root container & tab router
│   ├── components\
│   │   ├── 3d\                                # 3D WebGL Three.js Lutherie Engine
│   │   │   ├── CelticHarpCanvas.tsx           # Primary interactive 3D harp canvas & raycasting
│   │   │   ├── CelticHarpModel.ts             # Geometry loader, PBR materials & textures
│   │   │   └── SanctuaryScene.ts              # Lighting, shadows, and environment maps
│   │   ├── game\                              # In-Game Play Experience & Debrief
│   │   │   ├── InGamePlayScreen.tsx           # Active game arena, plucking logic & resolution loop
│   │   │   └── SessionInsightsModal.tsx       # Modern liquid glass post-session debrief modal
│   │   ├── home\                              # Home screen components
│   │   │   ├── HomeHeroHarp.tsx               # Spinning 3D harp plinth hero & play button
│   │   │   ├── LiquidGlassTabBar.tsx          # 4-compartment frosted bottom navigation bar
│   │   │   └── TopHeaderBar.tsx               # Consolidated header (Profile, Shards, Streaks)
│   │   ├── roadmap\                           # Progression Roadmaps
│   │   │   ├── RoadmapModal.tsx               # 8-Stage Coastal Cliff Trail Map Modal
│   │   │   ├── TreadmillRoadmap.tsx           # Continuous rolling treadmill roadmap view
│   │   │   ├── LiquidGlassRoadmapCard.tsx     # Preview card on Home tab with road preview
│   │   │   └── LiquidGlassLevelBadge.tsx      # Compact liquid glass level badge component
│   │   ├── tabs\                              # Tab Screen Implementations
│   │   │   ├── ChordsTabScreen.tsx            # Melody sequence training tab (Arctic Fjord)
│   │   │   ├── LeversTabScreen.tsx            # Camac sharping levers modal tab (Desert Canyon)
│   │   │   └── ProfileTabScreen.tsx           # Harper profile, telemetry matrix, accounts, tuning
│   │   └── diagnostics\                       # Developer Simulator & Icon Suite
│   │       ├── DeviceFramePreview.tsx         # iPhone 15 Pro & Galaxy S24 device simulator
│   │       └── CelticIcons.tsx                # Scalable vector Celtic icon suite
│   ├── services\
│   │   ├── account\                           # User Accounts & Telemetry
│   │   │   └── UserAccountDatabase.ts         # Multi-account database, latency & confusion matrix
│   │   ├── audio\                             # Web Audio Synthesis & Cadence DSP
│   │   │   ├── HarpSoundSynthesizer.ts        # Karplus-Strong physical plucked string synthesis
│   │   │   ├── CadenceEngine.ts               # SATB four-voice voice-leading cadence generator
│   │   │   ├── ResolutionWalker.ts            # Closest-C bidirectional resolution walker
│   │   │   ├── AudioStateMachine.ts           # Game audio state transitions
│   │   │   ├── types.ts                       # Audio type definitions and timing presets
│   │   │   └── cadence_timing_profile.json    # Verified timing profile cross-correlation data
│   │   ├── curriculum\                        # Curriculum Engine & Tuning Matrix
│   │   │   ├── curriculumData.ts              # Complete 136-level curriculum & UNRESTRICTED_DEV_MODE
│   │   │   ├── CurriculumRandomizer.ts        # Active note bitmask sampler & question generator
│   │   │   └── TuningMatrixEngine.ts          # Tri-native harp tuning lever state matrix
│   │   └── intelligence\                      # Cognitive Responses & Feedback
│   │       ├── MusicalResponsesCatalog.ts     # 200 handcrafted musical wordplay responses
│   │       ├── ContextualFeedbackEngine.ts    # Real-time feedback engine
│   │       └── BayesianKnowledgeTracing.ts    # Knowledge tracing and mastery evaluation
│   └── storage\
│       └── userProfileStore.ts                # Lightweight profile store
└── verification scripts                       # Headless Chrome CDP automated verification suites
    ├── verify_closest_resolution_and_plucking.js
    ├── verify_roadmap_access.js
    └── verify_accounts_telemetry_and_insights.js
```

### Persistent Memory & Second Brain Vaults
- **Active Session State Ledger:** `C:/Users/Hp/Documents/Antigravity second Brain/00_System/ACTIVE_SESSION_STATE.md`
- **System Memory Directory:** `C:/Users/Hp/Documents/Antigravity second Brain/00_System/`
- **Artifact Output Directory:** `C:\Users\Hp\.gemini\antigravity\brain\71677e65-ddd0-4156-bd73-ec960d83fd95\`

---

## 3. UI ARCHITECTURE & DESIGN SYSTEM

Earpa runs as a unified React Native Web application hosted inside a responsive simulator frame.

### 1. Device Frame Simulator (`DeviceFramePreview.tsx`)
- Provides simulated titanium bezels for **Apple iPhone 15 Pro** ($393 \times 852$) and **Samsung Galaxy S24** ($360 \times 780$).
- Implements automated dynamic viewport scaling:
  $$\text{Scale} = \min\left(0.94, \frac{\text{windowHeight} - 76}{\text{targetBezelHeight}}\right)$$
- Guarantees that the entire phone bezel, dynamic island, 3D harp canvas, play button, and bottom tabs are 100% visible simultaneously without any vertical window scrolling.

### 2. Liquid Glass Design System
- Translucent frosted glass containers styled with `backgroundColor: 'rgba(255, 255, 255, 0.08)'`, `backdropFilter: 'blur(28px)'`, and an inset specular white border (`borderTopColor: 'rgba(255, 255, 255, 0.35)'`).
- Typography pairs classical display titles (**Cinzel**, **Cinzel Decorative**) with clean modern numerical and body copy (**Inter**, **Cinzel**).

### 3. Celtic Scalable Vector Icon Suite (`CelticIcons.tsx`)
All icons are custom SVG vector components rendered in antique bronze, burnished gold, and emerald accents:
- **Home Tab:** Thatched Crannog Roundhouse with conical thatch and hearth smoke.
- **Chords/Melody Tab:** Interwoven Triquetra Harmonic Knot.
- **Levers Tab:** Camac Sharping Lever bracket with rotating cam arm.
- **Journey/Profile Tab:** Four-directional Celtic Solar Wheel Cross.
- **Daily Streaks:** Saint Brigid Eternal Hearth Flame with triple spirals.
- **Currency/Shards:** Ancient Gold Torc Collar Fragment with flared terminals.
- **Level Locks:** Celtic Bronze Penannular Brooch with diagonal pin.

### 4. Four Thematic Realms
1. **Single Note (Home):** Irish Celtic Sanctuary (`irish_celtic_sanctuary.jpg`), coastal cliff pathway (`coastal_cliff_pathway.jpg`), ancient megalithic stone arch, climbing green ivy, cracked granite altar pedestal.
2. **Melody Sequences (Chords Tab):** Arctic Frozen Sanctuary, glacial fjord trail (`arctic_fjord_pathway.jpg`), neon cyan ice glow.
3. **Sharping Levers (Levers Tab):** Sandstone Canyon Sanctuary, desert canyon trail (`canyon_desert_pathway.jpg`), molten ember gold glow.
4. **Harper Journey (Profile Tab):** Celestial Sanctuary, deep violet nebula, Alain Benbassat masterclass tutorial card, and multi-account telemetry dashboard.

---

## 4. AUDIO SYNTHESIS & ACOUSTIC DSP ENGINE

All sound generation is synthesized dynamically in real time via the Web Audio API without relying on pre-recorded audio samples.

### 1. Physical Karplus-Strong Synthesis (`HarpSoundSynthesizer.ts`)
Each string note is synthesized at $44.1\text{ kHz}$ using an Extended Karplus-Strong physical plucked string algorithm:
- **Dual-Stage Finger-Pad Excitation:** Replaces harsh white noise with a $600\text{ Hz}$ low-pass filtered pink noise burst shaped by a Hann window displacement curve. This replicates the soft flesh contact of a harpist's finger-pad with zero digital clicks.
- **Tuned Fractional Delay Line:** A circular ring buffer of length $L = \frac{f_s}{f_0}$ with linear interpolation for exact tuning pitch accuracy.
- **Two-Point Averaging Loop Filter:** Applies frequency-dependent damping ($0.996$ for bass down to $0.991$ for treble) plus subtle sympathetic octave resonance.
- **Sitka Spruce Soundboard Formants:** The dry string signal is routed through a series of biquad body filters:
  - Deep Helmholtz cavity bloom: Peaking filter at $180\text{ Hz}$ ($+4.5\text{ dB}, Q = 1.5$).
  - Soundboard plate & cavity formant: Peaking filter at $331\text{ Hz}$ ($+4.2\text{ dB}, Q = 2.0$).
  - Acoustic nylon high-cut roll-off: Low-pass filter at $2400\text{ Hz}$ ($Q = 0.707$).
- **Stereo Room Convolution:** A subtle synthetic wooden room impulse response provides acoustic depth.

### 2. SATB Cadence Engine (`CadenceEngine.ts`)
- Automatically voices authentic four-part chorale cadences ($I - IV - V - I$) with voice-leading in close position across Bass, Tenor, Alto, and Soprano.
- Voiced with an expressive Celtic harpist arpeggio roll ($52\text{ ms}$ delay between successive voices) to produce an angelic, resonant chord bloom.

### 3. Bidirectional Closest-C Resolution Walker (`ResolutionWalker.ts`)
Implements authentic Benbassat Tonal Gravity by calculating the shortest path to the tonic anchor:
- **Low Scale Degrees ($1, \flat 2, 2, \flat 3, 3, 4$):** Resolve **DOWNWARD** to Low $C4$ ('1'):
  - Degree $2$: $2 \rightarrow 1$
  - Degree $3$: $3 \rightarrow 2 \rightarrow 1$
  - Degree $4$: $4 \rightarrow 3 \rightarrow 2 \rightarrow 1$
- **High Scale Degrees ($5, \sharp 4, \flat 6, 6, \flat 7, 7, 8$):** Resolve **UPWARD** to High $C5$ ('8'):
  - Degree $5$: $5 \rightarrow 6 \rightarrow 7 \rightarrow 8$
  - Degree $6$: $6 \rightarrow 7 \rightarrow 8$
  - Degree $7$: $7 \rightarrow 8$
- **Pacing Metrics (`DEFAULT_CADENCE_TIMINGS`):**
  - Resolution step duration: $560\text{ ms}$ per note.
  - Final tonic arrival hold: $1600\text{ ms}$.
  - Post-resolution reflection pause: $1100\text{ ms}$.

---

## 5. CURRICULUM, GAME ENGINE & TUNING MATRIX

### 1. 136-Level Curriculum Structure (`curriculumData.ts`)
The curriculum is organized into two primary tracks of 68 levels each across 8 pedagogical stages:
- **Track 1: Single Note & Harmonic Dyads (Levels 1 to 68):**
  - Stage 1: Tonic Anchor ($1, 2$)
  - Stage 2: Supertonic & Mediant Pull ($1, 2, 3$)
  - Stage 3: Subdominant Framing ($1, 2, 3, 4$)
  - Stage 4: Dominant Pillar ($1, 2, 3, 4, 5$)
  - Stage 5: Submediant Airs ($1, 2, 3, 4, 5, 6$)
  - Stage 6: Leading Tone Snap ($1, 2, 3, 4, 5, 6, 7$)
  - Stage 7: Octave Completion ($1$ to $8$, Chromatic introduces $\flat 2, \flat 3, \sharp 4, \flat 6, \flat 7$)
  - Stage 8: Grand Bardic Pinnacle (Transpositions across all keys)
- **Track 2: Melodic Sequence Dictation (Levels 1 to 68):**
  - Progresses from 2-note motifs to 3-note and 4-note melodies, testing melodic dictation and short-term musical memory.

### 2. Active Note Bitmask Sampling (`CurriculumRandomizer.ts`)
Each level defines an `activeNotesMask: boolean[]` array of length 8 representing degrees $[1, 2, 3, 4, 5, 6, 7, 8]$. The randomizer strictly generates stimuli matching the active bitmask and target octave range.

### 3. Progression Lock Toggle (`UNRESTRICTED_DEV_MODE`)
Located at lines 38-44 of `src/services/curriculum/curriculumData.ts`:
```typescript
export const UNRESTRICTED_DEV_MODE = true;

export function isLevelUnlocked(globalLevel: number, userCompletedLevel: number): boolean {
  if (UNRESTRICTED_DEV_MODE) return true;
  return globalLevel <= userCompletedLevel + 1;
}
```
- **When `true`:** Every level, stage, treadmill stepping stone, and scale degree button is completely unlocked for unrestricted developer testing.
- **When `false`:** Strict sequential gating is enforced; levels unlock only after the user achieves $\ge 90\%$ accuracy on the preceding level.

### 4. Tri-Native Harp Tuning Mechanics (`TuningMatrixEngine.ts`)
Supports three standard historical lever harp setups:
1. **$E\flat$ Major Native (Default Celtic Setup):** 3 flats open ($B\flat, E\flat, A\flat$). Raising levers on $E, A, B$ tunes the harp to pure $C$ Major. Allows playing in 8 keys ($E\flat$ through $E$ Major).
2. **$C$ Major Native:** All strings open natural. Raising levers produces sharps ($F\sharp, C\sharp, G\sharp$, etc.).
3. **$B\flat$ Major Native:** 2 flats open ($B\flat, E\flat$).
The engine exposes reactive state subscriptions and updates string physical frequencies dynamically whenever a sharping lever is flipped.

### 5. In-Game Play Screen (`InGamePlayScreen.tsx`)
- **Forepillar Stance:** The 3D harp is oriented at $\theta = -0.95\text{ rad}$ ($-54.4^\circ$), presenting the forepillar toward the viewer with the soundbox extending into depth.
- **Pure Auditory Stimulus:** The mystery note plays purely as audio. Strings remain completely still and dark during question playback, preventing any visual answer leakage.
- **Dual Response Methods:** The user can respond either by tapping the bottom liquid glass degree buttons or by directly plucking strings on the 3D harp canvas.
- **Guessed Note Immediate Playback:** Plucking or tapping immediately plays the chosen note at $0\text{ ms}$ latency and executes the bidirectional resolution walk back to the closest $C$.
- **Tri-Notation Switcher:** A 3-way toggle switches shelf button labels between:
  - Numbers: `1, 2, 3, 4, 5, 6, 7, 8`
  - Solfege: `Do, Re, Mi, Fa, Sol, La, Ti, Do`
  - Pitch Names: `C, D, E, F, G, A, B, C`

---

## 6. 3D WEBGL HARP PHYSICS & LUTHERIE

The 3D harp runs inside `src/components/3d/CelticHarpCanvas.tsx` using Three.js and the GLTF loader.

### 1. Master 3D Model Protection (`celtic_harp_8string.glb`)
- **Location:** `public/models/celtic_harp_8string.glb` and `dist/models/celtic_harp_8string.glb`.
- **SHA256 Hash:** `605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E`.
- **CRITICAL INVARIANT:** Never edit, mutate, or re-export this GLB binary. Its geometry (41,991 vertices, 1-piece harmonic neck, 8 staves soundbox, and Camac levers) is locked.

### 2. Stance Centroid Alignment
- The physical feet contact area spans $Z: [-0.046\text{ m}, +0.197\text{ m}]$, with its geometric midpoint at $Z = +0.0755\text{ m}$.
- The root mesh is shifted by `-0.0755 * harpScale` inside `harpPivotGroup` ($Z = -0.015\text{ m}$).
- This aligns the stance center $1:1$ with the turntable vertical rotation axis, eliminating eccentric wobble during 360-degree rotation.

### 3. Raycasting Touch & Proximity Plucking
- Physical nylon string meshes have a diameter of $1.0\text{ mm}$, making direct mesh raycasts too narrow on touchscreens.
- The engine uses 3D segment ray distance calculation: `ray.distanceSqToSegment(pBot, pPlayingTop)`.
- Proximity tolerance is set to `bestDistSq = 0.025` ($\approx 15.8\text{ cm}$ in world space, $\approx 60\text{ px}$ on screen).
- The top $8\%$ of the string is reserved as a **Lever Safe Zone**, allowing silent lever flips without accidental string plucks.

### 4. Camac Lever Kinematics
- Swiping UP ($> 14\text{ px}$) rotates the lever handle to $+1.75\text{ rad}$ (Engaged / Sharp).
- Swiping DOWN ($< -14\text{ px}$) rotates the lever handle to $0.0\text{ rad}$ (Disengaged / Natural).
- Lever operations are completely silent, triggering a $10\text{ ms}$ haptic mechanical click.

### 5. Standing Wave Vibration & Filament Illumination
- Plucking initiates a physical sinusoidal standing wave with peak excursion of $9\text{ mm}$ and an acoustic decay factor of $0.978$.
- Illumination is bound strictly to the $1.0\text{ mm}$ nylon string cylinder via PBR emissive intensity ($0.85$ peak), fading in lockstep with acoustic decay and extinguishing completely upon vibration rest.

---

## 7. USER ACCOUNTS, TELEMETRY & PEDAGOGICAL INSIGHTS

### 1. Multi-Account Database Architecture (`UserAccountDatabase.ts`)
The database operates as a persistent singleton managing multiple user profiles with isolated storage partitions:

```typescript
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarIcon: string;
  avatarColor: string;
  experienceLevel: 'Beginner Harper' | 'Apprentice Bard' | 'Journeyman Minstrel' | 'Master Harper';
  createdTimestamp: number;
  lastActiveTimestamp: number;
  totalPracticeTimeSeconds: number;
  totalSessionsPlayed: number;
  totalTrialsAttempted: number;
  overallAccuracyPct: number;
  highestStreak: number;
  activeTuning: NativeHarpTuning;
}
```

#### Storage Partition Keys
- Master Profiles Index: `earpa_user_profiles_v1`
- Active User Pointer: `earpa_active_user_id_v1`
- User Trial History: `earpa_trials_log_v1_${userId}`
- User Session Records: `earpa_sessions_log_v1_${userId}`
- User Daily Practice: `earpa_daily_practice_v1_${userId}`

### 2. Granular Metrics Tracked
1. **Sub-Millisecond Reflex Latency:** Measured directly using `performance.now()` from the stimulus onset timestamp to the user's touch or pluck event.
2. **Eight-Scale-Degree Confusion Matrix:** For every scale degree ($1$ to $8$), the system tracks:
   - Total presentations and correct count.
   - Exact accuracy percentage.
   - Average and fastest reflex latency in seconds.
   - Full distribution of mistaken guesses (e.g., how often degree $4$ was mistaken for degree $3$ vs degree $5$).
   - Primary confusion detection with tailored musical explanations (e.g., downward magnetic pull of Fa to Mi).
3. **Daily Practice Accumulator:** Tracks total daily practice time in seconds, session counts, and maintains a 7-day practice history rhythm.

### 3. Pedagogical Insights Derivation (`getUserPedagogicalInsights`)
Computes high-level pedagogical analytics for display in post-session debriefs and the user profile:
- **Strongest Degrees:** Diatonic degrees with highest accuracy and fastest recognition.
- **Weakest Degrees:** Degrees exhibiting accuracy below $85\%$ or high cognitive latency.
- **Fastest Reflex Degree:** The degree recognized with minimum response time.
- **Primary Confusion Pair:** Highlights the user's most frequent ear-training blind spot along with a tailored pedagogical prescription.

### 4. 200 Handcrafted Musical Responses (`MusicalResponsesCatalog.ts`)
Features 100 positive responses for correct guesses (`CORRECT_100`) and 100 constructive responses for incorrect guesses (`INCORRECT_100`).
- Authored with authentic music theory, acoustics, tonal gravity, and lutherie lore (zero generic cliches).
- Utilizes an anti-fatigue ring buffer that prevents any response from repeating within 25 consecutive rounds.

### 5. Session Debrief Modal (`SessionInsightsModal.tsx`)
- Displayed at the conclusion of each 10-round session.
- Styled in minimalist liquid glass with telemetry pills for Session Duration, Average Reflex Latency, and Fastest Pluck.
- Highlights "What You Excelled At", "Area for Improvement", and provides a actionable "Bardic Earsmith Prescription".

---

## 8. DEVELOPER OPERATIONAL RUNBOOK

Follow these procedures to build, test, and run the project:

### 1. Launching the Local Web Server
Serve the production web build on port 8088:
```powershell
python -m http.server 8088 --directory dist
```
- Main Application: `http://localhost:8088/`
- 3D Master Harp Inspector: `http://localhost:8088/viewer.html`

### 2. Rebuilding the Production Web Bundle
Whenever changes are made to files in `src/`, rebuild the Expo web export and synchronize public assets:
```powershell
# 1. Export Web Bundle
cmd /c npx expo export --platform web

# 2. Synchronize Master Models and Assets
cmd /c xcopy /E /I /Y public\models dist\models
cmd /c xcopy /E /I /Y public\images dist\images
cmd /c copy /Y public\viewer.html dist\viewer.html
```

### 3. Executing Deterministic Verification Test Suites
Run the headless Chrome verification suites to validate physics, audio, roadmaps, and account telemetry:
```powershell
# 1. Verify Closest Resolution & Physical Plucking
node verify_closest_resolution_and_plucking.js

# 2. Verify Roadmap Universal Access & Level Drawers
node verify_roadmap_access.js

# 3. Verify Account Database, Telemetry & Insights
node verify_accounts_telemetry_and_insights.js

# 4. Verify Audio DSP Unit Tests
cmd /c npx tsx src/services/audio/verify_phase1.ts
```

### 4. Progression Gate Management
To switch between open developer testing and strict user progression gating:
- Open `src/services/curriculum/curriculumData.ts`.
- Set `export const UNRESTRICTED_DEV_MODE = true;` for open testing across all 136 levels.
- Set `export const UNRESTRICTED_DEV_MODE = false;` to enforce strict sequential 90% accuracy unlocking.
- Rebuild the web export (`cmd /c npx expo export --platform web`).

---

## 9. ARCHITECTURAL GUARDRAILS & INVARIANTS

1. **Master 3D GLB Protection:** The file `celtic_harp_8string.glb` must maintain its SHA256 hash (`605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E`). Never attempt to re-export or alter vertex positions.
2. **Auditory Stimulus Integrity:** Never trigger string vibration or illumination during stimulus note playback in `InGamePlayScreen.tsx`. Ear training must remain 100% auditory until the user makes a guess.
3. **Double-Quoted Path Construction:** Always pass absolute double-quoted paths in command line executions to prevent Windows whitespace tokenization errors.
4. **Second Brain State Synchronization:** Record all architectural changes, milestones, and verified invariants in `C:/Users/Hp/Documents/Antigravity second Brain/00_System/ACTIVE_SESSION_STATE.md`.
