# EARPA INTELLECTUAL PROPERTY & RIGHTS REGISTER
Version: 1.0 (2026-10-25)
Standard: Evidence-Based Legal Readiness Audit (Not a legal certification)

---

## 1. CORE METHODOLOGY & CURRICULUM PROVENANCE

### Functional Ear Training Principles vs Protected Expression
- **Underlying Method:** Functional Ear Trainer, developed by Alain Benbassat (Brussels, Belgium; https://www.miles.be/).
- **Nature of Material:** The pedagogical concept of functional relative pitch (hearing each scale degree relative to a pre-established tonic anchor rather than interval-by-interval distance) is a musical fact and pedagogical principle. Mathematical facts, pitch classes, and foundational acoustic relationships are non-copyrightable principles under US Copyright Circular 31 and Israeli Copyright Act 2007, Section 5.
- **Protected Expression:** The specific wording of lessons, software code, graphic layout, audio recordings, and unique sequential lesson compilations created by Alain Benbassat are protected by copyright.
- **Earpa Implementation:**
  - Earpa generates all cadences algorithmically via its own TypeScript SATB engine (`CadenceEngine.ts`).
  - All audio synthesis is computed in real time via Karplus-Strong DSP (`HarpSoundSynthesizer.ts`). No audio files from Benbassat or any software are used.
  - All lesson copy, level titles, descriptions, and user guidance have been authored originally.
  - Public marketing copy, feedback strings, and documentation must not claim endorsement or partnership with Alain Benbassat or Miles.be without an explicit licensing contract.

### Remediation Action on Pedagogical Text
- In `src/services/intelligence/MusicalResponsesCatalog.ts`: Line 27 (`COR_006`) contains:
  `Pitch-perfect instinct! Alain Benbassat would raise a toast.`
  **Finding:** This creates an implied personal endorsement without verified permission.
  **Remediation:** Remove the personal name reference and replace with original text:
  `Pitch-perfect instinct! The tonic anchor held firm.`

---

## 2. 3D INSTRUMENT ASSETS & LUTHERIE GEOMETRY

### Celtic Harp 8-String Model
- **File:** `public/models/celtic_harp_8string.glb`, `dist/models/celtic_harp_8string.glb`
- **SHA256:** `605DC38BEAFB16CEC9A9BC40D4BAC04090C1306C992E5CABACA642177445CE6E`
- **Creation History:** Programmatically generated and sculpted via Blender Python scripts (`build_realistic_harp_v9_3.py`) within this repository. Constructed from procedural mathematical curves (C1 stave continuity, harmonic neck miter planes, 24-vertex welded mesh).
- **Third-Party 3D Meshes:** None. Zero pre-purchased or downloaded third-party mesh geometry is bundled in this GLB.
- **Procedural Textures:** Wood grain is procedurally generated Sitka spruce and figured cherry-maple shaders.
- **Commercial Use:** Full ownership by project creator; free of third-party royalty or commercial distribution restrictions.

### Manufacturer Trademarks & Branding
- **Sharping Levers Reference:** Components and feedback strings occasionally reference "Camac" levers.
- **Finding:** Camac is a registered trademark of Camac Harps (Mouzeil, France). While lever harps physically use Camac or Loveland sharping mechanisms, using the trademark in public feedback or UI copy without license may present brand infringement or implied endorsement risks.
- **Remediation:**
  - User-facing UI copy, feedback strings, and marketing materials must use generic terminology: "sharping levers" or "semitone levers".
  - Code identifiers and internal comments referencing Camac kinematics may remain for technical precision under technical exemptions, but public text must be strictly generic.

---

## 3. VISUAL ASSETS, BACKDROPS & REALMS

### Background Photography & Sanctuaries
1. **Irish Celtic Sanctuary (Single Note Realm):**
   - File: `public/images/irish_celtic_sanctuary.jpg`, `dist/images/irish_celtic_sanctuary.jpg`
   - Origin: AI-generated visual composition (Midjourney / Imagen) created for the project and upscaled.
   - Terms: Generated under commercial-tier AI subscription.
   - Legal Status: Under current US Copyright Office guidance (2023), raw AI outputs lack human authorship for copyright registration, but are unencumbered by third-party proprietary claims if created without copyrighted input prompts. Permitted for commercial app distribution.
2. **Coastal Cliff Pathway (Home Map Modal):**
   - File: `public/images/coastal_cliff_pathway.jpg`
   - Origin: Sourced from user photography / open commercial repository.
   - Remediation: Document exact source license (Unsplash / Pexels license allowing unrestricted commercial use without attribution).
3. **Arctic Fjord Pathway (Melody Realm):**
   - File: `public/images/arctic_fjord_pathway.jpg`
   - Origin: Curated landscape photograph under CC0 / commercial Unsplash license.
4. **Sandstone Canyon Pathway (Levers Realm):**
   - File: `public/images/canyon_desert_pathway.jpg`
   - Origin: Curated landscape photograph under CC0 / commercial Unsplash license.

---

## 4. AUDIO ASSETS & ACOUSTIC IMPULSES

### Real-Time Synthesis vs Samples
- **Instrument Audio:** 100% computed mathematically at runtime via the Web Audio API using `HarpSoundSynthesizer.ts` (Extended Karplus-Strong). Zero sampled WAV or MP3 audio files are bundled or streamed for instrument playback.
- **Reverb Impulse Response:** Generated procedurally in code via white noise decay exponential shaping. No copyrighted third-party room impulse response files are distributed.
- **Narration / Voiceovers:**
  - `narration.wav` in review folder is a local temporary file not bundled into `dist/`.
  - No synthetic voice cloning of living individuals or unlicensed voice actors is used in production.

---

## 5. ICONS, FONTS & DESIGN ASSETS

### Scalable Celtic Vector Icons
- **File:** `src/components/common/CelticIcons.tsx`
- **Origin:** Custom mathematical SVG path components authored directly in this repository (Crannog Roundhouse, Triquetra, Solar Cross, Saint Brigid Flame, Gold Torc, Penannular Brooch).
- **Rights:** 100% original code owned by project creator.

### Typography & Fonts
- **Cinzel & Cinzel Decorative:** Google Fonts (OFL - Open Font License 1.1). Permits free commercial distribution, embedding, and modification.
- **Inter:** Rasmus Andersson (OFL - Open Font License 1.1). Permits free commercial distribution, bundling, and web embedding.

---

## 6. CODE DEPENDENCIES & THIRD-PARTY PACKAGES

### Production Web Dependencies
- `react`, `react-dom` (MIT License)
- `react-native-web` (MIT License)
- `expo`, `expo-router` (MIT License)
- `three` (MIT License)
- `@supabase/supabase-js` (MIT License)
- All production dependencies use permissive MIT/Apache-2.0 licenses. No copyleft (GPL / AGPL) dependencies are bundled in client exports.

---

## 7. OWNER DECISIONS REQUIRED FOR LEGAL READINESS

Before opening paid subscriptions, the business owner must provide formal determinations on the following:

1. **Legal Seller Entity & Jurisdiction:**
   - Operating country: Israel.
   - Business structure: Osek Patur, Osek Murshe, or private company (Ltd).
   - Merchant of Record recommendation: Paddle or FastSpring (handles global VAT/sales tax compliance, consumer invoice generation, and cross-border currency conversion seamlessly for Israeli businesses without requiring US incorporation).
2. **Customer Terms & Refund Policy:**
   - 14-day statutory consumer cancellation rights (Israeli Consumer Protection Law and EU Consumer Rights Directive).
   - Clear disclosure of founding annual rate ($24/year) and transparent renewal rate ($39/year).
3. **Privacy Policy & Data Handling:**
   - GDPR and Israeli Privacy Protection Regulations compliance for user email addresses, profile photos, and learning logs.
   - User account deletion endpoint allowing instant erasure of all associated trials and profile photos upon request.
4. **Age Boundaries:**
   - If children under 16 participate, COPPA / GDPR-K compliance requires parental consent for email collection. Private local-only guest mode provides full pedagogical access without data collection.
