# EARPA ARCHITECTURAL & BUSINESS DECISIONS RECORD
Version: 1.0 (2026-10-25)
Project: Earpa (Celtic Lever Harp Ear Trainer)

---

## 1. TECHNICAL ARCHITECTURE DECISIONS

### DEC-01: Deployment Target & Progressive Web App (PWA)
- **Decision:** Target initial release strictly as an installable Progressive Web App (HTTPS PWA) hosted on the web, bypassing native App Store and Google Play packaging for the immediate launch week.
- **Rationale:**
  - Zero store review delays; allows immediate defect correction within minutes.
  - Zero 15-30% Apple/Google platform commissions during the testing and founding cohort.
  - Direct web push notification support is available on iOS Safari (16.4+) and Android Chrome.
  - Full native store packaging (Expo EAS Build for iOS/Android) will be scheduled only after sustained retention and user demand are proven.

### DEC-02: Audio DSP & Physical Karplus-Strong Modeling
- **Decision:** Generate all harp tones, arpeggiated SATB cadences, and resolution walks via real-time Web Audio API Karplus-Strong synthesis rather than sample playback.
- **Rationale:**
  - Infinite dynamic range, microtonal sharpness, zero sample bundle weight (<10KB DSP code vs 150MB high-fidelity multi-sample library).
  - Eliminates copyright liabilities associated with commercial sample packs.
  - Allows instant semitone shift whenever a 3D sharping lever is flipped.

### DEC-03: Cloud Authentication & Storage Strategy
- **Decision:** Utilize Supabase (PostgreSQL with Row Level Security and GoTrue Auth) for cross-device synchronization while maintaining full local functionality via `UserAccountDatabase.ts`.
- **Rationale:**
  - Allows guest/local play without forced authentication.
  - Email OTP / magic link provides passwordless authentication without requiring users to manage passwords.
  - Strict RLS guarantees User A cannot read or mutate User B's profile, photos, or trials.

---

## 2. BUSINESS & PRICING HYPOTHESIS

### Commercial Framework
- **Free Interactive Tier:** Full access to interactive demos and introductory lesson stages without payment or credit card entry.
- **Private Usability Cohort:** 7-day complimentary access for 5 to 10 invited testers.
- **Founding Annual Pass:** $24 for the first year during a 30-day founding window.
- **Standard Annual Renewal:** $39/year, clearly disclosed prior to checkout.
- **Future Monthly Option:** $4.99/month considered after the founding window closes.
- **No Deceptive Pricing:** No perpetual "$2/month" guarantee; no ambiguous "lifetime" terminology.

### Revenue Modeling Scenarios
The following scenarios represent mathematical models separating gross sales, recurring equivalents, transaction fees, hosting infrastructure, and customer support allowances. These are scenario projections, not verified sales forecasts.

| Paying Users | Gross Annual Cash | Monthly Equivalent Gross | Est. Payment Fees (MoR 5% + $0.50) | Est. Infra & Email Costs/Year | Net Pre-Tax Cash Received (Year 1) | Net Pre-Tax Cash at Renewal ($39/yr) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **25** | $600 | $50 | $42.50 | $60 | $497.50 | $828.75 |
| **50** | $1,200 | $100 | $85.00 | $60 | $1,055.00 | $1,717.50 |
| **100** | $2,400 | $200 | $170.00 | $120 | $2,110.00 | $3,475.00 |
| **300** | $7,200 | $600 | $510.00 | $240 | $6,450.00 | $10,650.00 |
| **500** | $12,000 | $1,000 | $850.00 | $360 | $10,790.00 | $17,890.00 |
| **1,000** | $24,000 | $2,000 | $1,700.00 | $600 | $21,700.00 | $36,100.00 |

*Assumptions:*
- Payment processor: Merchant of Record (Paddle or FastSpring) at 5% + $0.50 per transaction.
- Infrastructure: Supabase Free tier for <500 users ($0/mo), Pro tier at $25/mo for >500 users with dedicated backups; transactional email at $10-20/year.
- Churn assumption: 20-30% annual churn typical for consumer educational software; renewal revenue reflects 100% active retention scenario.

---

## 3. PAYMENT PROCESSOR EVALUATION FOR ISRAELI SELLER

### Option A: Merchant of Record (Paddle / FastSpring) — RECOMMENDED
- **Status in Israel:** Fully supported. Israeli individual businesses (Osek Patur / Osek Murshe) and companies can onboard directly.
- **Tax Handling:** Paddle acts as the legal seller of record, collecting and remitting VAT/sales taxes across the US, EU, UK, and Israel automatically.
- **Invoicing:** Generates compliant customer tax invoices automatically.
- **Cross-Border Payouts:** Direct SWIFT transfer or Payoneer transfer to Israeli bank accounts in USD or ILS.

### Option B: Direct Stripe Account
- **Status in Israel:** Stripe is available in Israel with local ILS and USD banking.
- **Drawback:** The business owner remains the merchant of record, requiring the seller to configure Stripe Tax and handle foreign VAT registrations and compliance in the EU and UK once statutory thresholds are reached.

### Option C: Israeli Local Processors (Meshulam / Tranzila / GreenInvoice)
- **Status in Israel:** Excellent for domestic ILS credit card clearing.
- **Drawback:** Poor foreign currency conversion support and lacking global recurring subscription UX for international US/EU harpers.

---

## 4. FUTURE EXPANSION DEPENDENCY ANALYSIS (PHASE 8)

### Expansion Order:
1. **Lever Harp (Active Baseline):** 8 strings, 8 sharping levers, 3 native tunings (Eb, C, Bb).
2. **Pedal Harp Extension:**
   - Physical Difference: Pedal harps utilize a 7-pedal mechanical linkage (D, C, B on left; E, F, G, A on right) with 3 positions per pedal (Flat at top, Natural at center, Sharp at bottom).
   - Architectural Requirement: Cannot reskin 2-state levers. Requires a dedicated `PedalMechanismEngine.ts` modeling 3-position pedal state transitions, accidental key groupings, and pedal diagrams (e.g. `D C B | E F G A`).
   - Acoustic Requirement: Deep octave acoustic resonance modeling ($15\text{Hz}-4\text{kHz}$) and gut/wire string transitions.
3. **Piano Edition:**
   - Physical Difference: 88-key chromatic keyboard interface with polyphonic hammer-strike acoustic envelope.
   - Architectural Requirement: Needs a dedicated keyboard UI component, chromatic layout logic, and separate curriculum pathways focusing on harmonic chord qualities rather than lever shifts.
