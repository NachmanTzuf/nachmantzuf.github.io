/**
 * EARPA CONTEXTUAL FEEDBACK ENGINE & ANTI-FATIGUE STATE MACHINE
 * Implements the 54-line categorized feedback copy catalog with anti-fatigue
 * cooldown timers, latency reflex analysis, and near-miss harmonic diagnostics.
 */

import { ScaleDegree } from '../audio/types';

export interface FeedbackCopyItem {
  id: string;
  category: 'STREAK' | 'SPEED' | 'NEAR_MISS' | 'RESILIENCE' | 'MODAL' | 'SESSION' | 'WISDOM';
  text: string;
  emotionalTone: string;
  cooldownTrials: number;
}

export interface FeedbackContext {
  isCorrect: boolean;
  latencyMs: number;
  currentStreak: number;
  previousStreak: number;
  stimulusDegree: ScaleDegree;
  guessedDegree: ScaleDegree;
  activeMode: string;
  sessionTrialCount: number;
  sessionAccuracy: number;
}

export class ContextualFeedbackEngine {
  // Master Catalog of 54 Handcrafted Copy Lines
  public static readonly CATALOG: Record<string, FeedbackCopyItem> = {
    // 1. Streak Tier 1 (3 to 5)
    STK_01: { id: 'STK_01', category: 'STREAK', text: 'The ear awakens. Three clean resolutions in rhythm.', emotionalTone: 'Encouraging', cooldownTrials: 8 },
    STK_02: { id: 'STK_02', category: 'STREAK', text: 'Four in a row. The tonal center is locking in.', emotionalTone: 'Focused', cooldownTrials: 8 },
    STK_03: { id: 'STK_03', category: 'STREAK', text: 'Five consecutive hits: your harmonic compass is centered.', emotionalTone: 'Validating', cooldownTrials: 10 },

    // 2. Streak Tier 2 (6 to 10)
    STK_04: { id: 'STK_04', category: 'STREAK', text: "Six clean plucks. You are feeling the gravity, not counting steps.", emotionalTone: 'Grounded', cooldownTrials: 12 },
    STK_05: { id: 'STK_05', category: 'STREAK', text: 'Eight notes straight. Pure harmonic momentum.', emotionalTone: 'Inspiring', cooldownTrials: 12 },
    STK_06: { id: 'STK_06', category: 'STREAK', text: 'Ten in harmony! The strings are answering without hesitation.', emotionalTone: 'Victorious', cooldownTrials: 15 },

    // 3. Streak Tier 3 (11 to 20)
    STK_07: { id: 'STK_07', category: 'STREAK', text: 'A dozen true strikes. You are swimming in the key now.', emotionalTone: 'Fluent', cooldownTrials: 15 },
    STK_08: { id: 'STK_08', category: 'STREAK', text: 'Fifteen notes deep. The cadence breathes with you.', emotionalTone: 'Poetic', cooldownTrials: 18 },
    STK_09: { id: 'STK_09', category: 'STREAK', text: 'Eighteen consecutive strikes. You have unlocked true bardic clarity.', emotionalTone: 'Elevating', cooldownTrials: 20 },
    STK_10: { id: 'STK_10', category: 'STREAK', text: 'Twenty without a tremor! Total harmonic equilibrium.', emotionalTone: 'Exhilarating', cooldownTrials: 25 },

    // 4. Streak Tier 4 (21+)
    STK_11: { id: 'STK_11', category: 'STREAK', text: 'Twenty two flawless ears. You hear the note before it rings.', emotionalTone: 'Reverent', cooldownTrials: 25 },
    STK_12: { id: 'STK_12', category: 'STREAK', text: "A quarter century of notes! Pure O'Carolan instinct on display.", emotionalTone: 'Legendary', cooldownTrials: 30 },
    STK_13: { id: 'STK_13', category: 'STREAK', text: 'Thirty in a row. The harp is an extension of your own mind.', emotionalTone: 'Transcendent', cooldownTrials: 40 },
    STK_14: { id: 'STK_14', category: 'STREAK', text: 'Forty flawless strikes. Rare air: true master harper territory.', emotionalTone: 'Mythic', cooldownTrials: 50 },

    // 5. Reflex Latency Analysis
    SPD_01: { id: 'SPD_01', category: 'SPEED', text: 'Lightning instinct! Pure reflex, zero calculation.', emotionalTone: 'Electrifying', cooldownTrials: 10 },
    SPD_02: { id: 'SPD_02', category: 'SPEED', text: 'Sub half second! You caught the personality instantly.', emotionalTone: 'Dashing', cooldownTrials: 10 },
    SPD_03: { id: 'SPD_03', category: 'SPEED', text: 'Snagged on the fly. That degree lives in your hands now.', emotionalTone: 'Crisp', cooldownTrials: 10 },
    SPD_04: { id: 'SPD_04', category: 'SPEED', text: 'Centered and swift. That is the rhythm of a session player.', emotionalTone: 'Balanced', cooldownTrials: 8 },
    SPD_05: { id: 'SPD_05', category: 'SPEED', text: 'Measured, confident, and true. Exactly right.', emotionalTone: 'Calm', cooldownTrials: 8 },
    SPD_06: { id: 'SPD_06', category: 'SPEED', text: 'Spot on: now trust that first feeling next time.', emotionalTone: 'Instructive', cooldownTrials: 12 },
    SPD_07: { id: 'SPD_07', category: 'SPEED', text: 'Correct! But do not climb the ladder: feel its weight against the tonic.', emotionalTone: 'Mentoring', cooldownTrials: 15 },
    SPD_08: { id: 'SPD_08', category: 'SPEED', text: 'You got it! Next time, let the cadence pull your hand; skip the math.', emotionalTone: 'Gentle Insight', cooldownTrials: 15 },

    // 6. Near-Miss Harmonic Diagnostics
    MIS_01: { id: 'MIS_01', category: 'NEAR_MISS', text: 'Tempting! Degree 6 shares that warm second degree feel, but sits above the 5th.', emotionalTone: 'Illuminating', cooldownTrials: 12 },
    MIS_02: { id: 'MIS_02', category: 'NEAR_MISS', text: 'Close neighbor! 2 leans down to the root; 6 rests just over the 5th.', emotionalTone: 'Dissecting', cooldownTrials: 12 },
    MIS_03: { id: 'MIS_03', category: 'NEAR_MISS', text: 'The leading tone magnetic pull got you: it wanted so badly to reach home.', emotionalTone: 'Warm Humor', cooldownTrials: 10 },
    MIS_04: { id: 'MIS_04', category: 'NEAR_MISS', text: 'It was right on the doorstep! Degree 7 was begging to resolve up to 8.', emotionalTone: 'Guiding', cooldownTrials: 10 },
    MIS_05: { id: 'MIS_05', category: 'NEAR_MISS', text: 'Caught in the gravity! That 4 was sliding downhill into the 3rd.', emotionalTone: 'Insightful', cooldownTrials: 10 },
    MIS_06: { id: 'MIS_06', category: 'NEAR_MISS', text: 'Close: remember the 3rd is pure rest within the chord; the 4th is searching.', emotionalTone: 'Grounding', cooldownTrials: 12 },
    MIS_07: { id: 'MIS_07', category: 'NEAR_MISS', text: 'Between the two pillars! The 5th is open sky; the 4th leans forward.', emotionalTone: 'Poetic Theory', cooldownTrials: 12 },
    MIS_08: { id: 'MIS_08', category: 'NEAR_MISS', text: 'Almost! The 5th is your rock solid fifth; 4 carries that sweet longing.', emotionalTone: 'Clarifying', cooldownTrials: 12 },
    MIS_09: { id: 'MIS_09', category: 'NEAR_MISS', text: 'The Lydian spark! That sharp 4 was piercing right into the fifth.', emotionalTone: 'Mystical', cooldownTrials: 15 },
    MIS_10: { id: 'MIS_10', category: 'NEAR_MISS', text: 'That is the Celtic flat 7th: earthy and modal, not the classical leading tone.', emotionalTone: 'Cultural Insight', cooldownTrials: 15 },
    MIS_11: { id: 'MIS_11', category: 'NEAR_MISS', text: 'That was the minor shadow: darker and more mournful than the sunny 3rd.', emotionalTone: 'Expressive', cooldownTrials: 15 },
    MIS_12: { id: 'MIS_12', category: 'NEAR_MISS', text: 'Fell right into the tonic! The flat 2 clings to home like mist to the grass.', emotionalTone: 'Celtic Imagery', cooldownTrials: 15 },

    // 7. Resilience & Slump Recovery
    REC_01: { id: 'REC_01', category: 'RESILIENCE', text: 'The string slipped: no matter. Reset the cadence and begin anew.', emotionalTone: 'Stoic', cooldownTrials: 10 },
    REC_02: { id: 'REC_02', category: 'RESILIENCE', text: 'A magnificent run! Every master leaves a mark on the wood. Breathe and reset.', emotionalTone: 'Noble', cooldownTrials: 15 },
    REC_03: { id: 'REC_03', category: 'RESILIENCE', text: 'Two stumbles happen to every harper. Listen deeply to this next cadence.', emotionalTone: 'Anchoring', cooldownTrials: 8 },
    REC_04: { id: 'REC_04', category: 'RESILIENCE', text: 'Clear the mental slate. Let the chords wash over your ear. You know the tonic.', emotionalTone: 'Calming', cooldownTrials: 10 },
    REC_05: { id: 'REC_05', category: 'RESILIENCE', text: 'Right back on the path! That is the bounce of a true musician.', emotionalTone: 'Reassuring', cooldownTrials: 8 },
    REC_06: { id: 'REC_06', category: 'RESILIENCE', text: 'The fog clears. You reclaimed the root immediately.', emotionalTone: 'Empowering', cooldownTrials: 10 },

    // 8. Modal Enlightenment
    MOD_01: { id: 'MOD_01', category: 'MODAL', text: 'Hear that bright 6th ringing against the minor 3rd? That is pure D Dorian magic.', emotionalTone: 'Repertoire Lore', cooldownTrials: 15 },
    MOD_02: { id: 'MOD_02', category: 'MODAL', text: 'That flattened 7th is the voice of the highland pipes. No leading tone here.', emotionalTone: 'Celtic Lore', cooldownTrials: 15 },
    MOD_03: { id: 'MOD_03', category: 'MODAL', text: 'The pure minor sadness: degrees 3, 6, and 7 all bowed in ancient grief.', emotionalTone: 'Melancholic', cooldownTrials: 18 },
    MOD_04: { id: 'MOD_04', category: 'MODAL', text: 'Five notes, infinite stories. You are hearing the ancient skeleton of Irish air.', emotionalTone: 'Folklore', cooldownTrials: 18 },

    // 9. Session Dedication & Milestones
    SES_01: { id: 'SES_01', category: 'SESSION', text: 'Ten trials in. Your ear is warming up to the soundboard.', emotionalTone: 'Warm', cooldownTrials: 10 },
    SES_02: { id: 'SES_02', category: 'SESSION', text: 'Twenty five plucks today. The neural pathways are knitting tight.', emotionalTone: 'Scientific Warmth', cooldownTrials: 12 },
    SES_03: { id: 'SES_03', category: 'SESSION', text: 'Fifty notes explored! That dedication is how reel speed instinct is born.', emotionalTone: 'Honoring', cooldownTrials: 20 },
    SES_04: { id: 'SES_04', category: 'SESSION', text: 'Over 90% precision across this set. The Celtic knot is tightening.', emotionalTone: 'Proud', cooldownTrials: 20 },
    SES_05: { id: 'SES_05', category: 'SESSION', text: 'An early morning ear is sharp and hungry. A fine hour for the strings.', emotionalTone: 'Atmospheric', cooldownTrials: 24 },
    SES_06: { id: 'SES_06', category: 'SESSION', text: 'Twilight practice settles deep into the subconscious while you sleep.', emotionalTone: 'Soothing', cooldownTrials: 24 },

    // 10. Bardic Wisdom
    WIS_01: { id: 'WIS_01', category: 'WISDOM', text: 'Soaring up in the treble: yet its functional anchor remains unchanged.', emotionalTone: 'Structural', cooldownTrials: 15 },
    WIS_02: { id: 'WIS_02', category: 'WISDOM', text: 'Deep down in the wire strings! Feel the vibration in your chest before guessing.', emotionalTone: 'Visceral', cooldownTrials: 15 },
    WIS_03: { id: 'WIS_03', category: 'WISDOM', text: 'A rogue chromatic tone! You recognized the stranger in the house.', emotionalTone: 'Playful', cooldownTrials: 20 },
    WIS_04: { id: 'WIS_04', category: 'WISDOM', text: 'A full week of daily dedication. Your fingers and ears are becoming one.', emotionalTone: 'Celebrating', cooldownTrials: 30 },
  };

  private cooldownTracker: Map<string, number> = new Map();
  private consecutiveErrors: number = 0;

  /**
   * Evaluates trial context and returns the optimal, non-repetitive feedback copy item.
   */
  public generateFeedback(ctx: FeedbackContext): FeedbackCopyItem {
    const trial = ctx.sessionTrialCount;
    this.cleanExpiredCooldowns(trial);

    let candidateId: string | null = null;

    if (ctx.isCorrect) {
      const recoveredFromErrors = this.consecutiveErrors > 0;
      this.consecutiveErrors = 0;

      // 1. Resilience recovery trigger
      if (recoveredFromErrors) {
        candidateId = this.findAvailable(['REC_05', 'REC_06']);
      }

      // 2. High Streak milestones (Priority 1)
      if (!candidateId && ctx.currentStreak >= 3) {
        if (ctx.currentStreak >= 40) candidateId = this.findAvailable(['STK_14']);
        else if (ctx.currentStreak === 30) candidateId = this.findAvailable(['STK_13']);
        else if (ctx.currentStreak === 25) candidateId = this.findAvailable(['STK_12']);
        else if (ctx.currentStreak === 22) candidateId = this.findAvailable(['STK_11']);
        else if (ctx.currentStreak === 20) candidateId = this.findAvailable(['STK_10']);
        else if (ctx.currentStreak === 18) candidateId = this.findAvailable(['STK_09']);
        else if (ctx.currentStreak === 15) candidateId = this.findAvailable(['STK_08']);
        else if (ctx.currentStreak === 12) candidateId = this.findAvailable(['STK_07']);
        else if (ctx.currentStreak === 10) candidateId = this.findAvailable(['STK_06']);
        else if (ctx.currentStreak === 8) candidateId = this.findAvailable(['STK_05']);
        else if (ctx.currentStreak === 6) candidateId = this.findAvailable(['STK_04']);
        else if (ctx.currentStreak === 5) candidateId = this.findAvailable(['STK_03']);
        else if (ctx.currentStreak === 4) candidateId = this.findAvailable(['STK_02']);
        else if (ctx.currentStreak === 3) candidateId = this.findAvailable(['STK_01']);
      }

      // 3. Reflex speed triggers
      if (!candidateId) {
        if (ctx.latencyMs < 450) candidateId = this.findAvailable(['SPD_01']);
        else if (ctx.latencyMs < 500) candidateId = this.findAvailable(['SPD_02']);
        else if (ctx.latencyMs < 550) candidateId = this.findAvailable(['SPD_03']);
        else if (ctx.latencyMs >= 550 && ctx.latencyMs <= 800) candidateId = this.findAvailable(['SPD_04']);
        else if (ctx.latencyMs > 2500) candidateId = this.findAvailable(['SPD_07', 'SPD_08']);
      }

      // 4. Session milestones
      if (!candidateId) {
        if (ctx.sessionTrialCount === 10) candidateId = this.findAvailable(['SES_01']);
        else if (ctx.sessionTrialCount === 25) candidateId = this.findAvailable(['SES_02']);
        else if (ctx.sessionTrialCount === 50) candidateId = this.findAvailable(['SES_03']);
      }
    } else {
      // Incorrect Answer
      this.consecutiveErrors += 1;

      // 1. Slump breaks
      if (this.consecutiveErrors >= 3) {
        candidateId = this.findAvailable(['REC_04']);
      } else if (this.consecutiveErrors === 2) {
        candidateId = this.findAvailable(['REC_03']);
      } else if (ctx.previousStreak >= 20) {
        candidateId = this.findAvailable(['REC_02']);
      } else if (ctx.previousStreak >= 10) {
        candidateId = this.findAvailable(['REC_01']);
      }

      // 2. Specific near-miss harmonic confusions
      if (!candidateId) {
        const stim = ctx.stimulusDegree;
        const guess = ctx.guessedDegree;

        if (stim === '6' && guess === '2') candidateId = this.findAvailable(['MIS_01']);
        else if (stim === '2' && guess === '6') candidateId = this.findAvailable(['MIS_02']);
        else if (stim === '7' && guess === '1') candidateId = this.findAvailable(['MIS_03']);
        else if (stim === '7' && guess === '8') candidateId = this.findAvailable(['MIS_04']);
        else if (stim === '4' && guess === '3') candidateId = this.findAvailable(['MIS_05']);
        else if (stim === '3' && guess === '4') candidateId = this.findAvailable(['MIS_06']);
        else if (stim === '4' && guess === '5') candidateId = this.findAvailable(['MIS_07']);
        else if (stim === '5' && guess === '4') candidateId = this.findAvailable(['MIS_08']);
        else if (stim === '#4') candidateId = this.findAvailable(['MIS_09']);
        else if (stim === 'b7') candidateId = this.findAvailable(['MIS_10']);
        else if (stim === 'b3') candidateId = this.findAvailable(['MIS_11']);
        else if (stim === 'b2') candidateId = this.findAvailable(['MIS_12']);
      }
    }

    // Default fallback
    if (!candidateId) {
      candidateId = ctx.isCorrect ? 'SPD_05' : 'REC_01';
    }

    const item = ContextualFeedbackEngine.CATALOG[candidateId] || ContextualFeedbackEngine.CATALOG['SPD_05'];
    this.cooldownTracker.set(item.id, trial + item.cooldownTrials);

    return item;
  }

  private findAvailable(ids: string[]): string | null {
    for (const id of ids) {
      if (!this.cooldownTracker.has(id)) {
        return id;
      }
    }
    return null;
  }

  private cleanExpiredCooldowns(currentTrial: number): void {
    this.cooldownTracker.forEach((expireTrial, id) => {
      if (currentTrial >= expireTrial) {
        this.cooldownTracker.delete(id);
      }
    });
  }
}
