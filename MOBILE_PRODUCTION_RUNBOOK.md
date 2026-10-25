# CANONICAL MOBILE APP PRODUCTION RUNBOOK

This runbook guides the deterministic lifecycle for architecting, engineering, and verifying mobile applications across Apple iOS and Google Android.

---

## 1. THE 6 STEP SCREEN LIFECYCLE

### Step 1: Route and Navigation Graph Setup
• Define file-based routes inside `src/app/` using Expo Router.
• Establish persistent tab bars in `app/(tabs)/_layout.tsx` with haptic feedback on tab changes.
• Configure modal sheets using native stack presentation options.

### Step 2: Physical Ergonomics and Touch Tokens
• Bind layout containers to `SafeAreaProvider` and extract insets with `useSafeAreaInsets`.
• Enforce minimum touch target heights (44pt on iOS, 48dp on Android).
• Bind color tokens from `src/design-system/TOKENS.ts`.

### Step 3: Tactile Physics and Micro-Interactions
• Author animated components with React Native Reanimated.
• Ensure all gesture responders run on native UI thread worklets.
• Bind `expo-haptics` impacts on primary actions.

### Step 4: Local Storage and Offline Cache
• Initialize MMKV for synchronous high speed state saving.
• Connect SQLite tables for relational data models.
• Store offline sync queues to handle background synchronization when connectivity returns.

### Step 5: Real-Time Cloud Synchronization
• Connect Supabase PostgreSQL or Firebase Data Connect.
• Configure Row Level Security (RLS) to enforce tenant isolation.
• Implement optimistic UI updates so user interactions feel instantaneous.

### Step 6: Multi-Device Verification Gate
• Execute `mobile-hardware-audit` across phone screen sizes (390px, 412px, 430px).
• Confirm 120Hz frame budget compliance (8.33ms per frame).
• Ensure zero layout clipping across Dynamic Island, notches, and home indicator bars.
