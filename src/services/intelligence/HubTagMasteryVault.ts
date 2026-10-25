/**
 * EARPA HUB TAG MASTERY VAULT
 * Authoritative taxonomy of 25 collectible bardic badges across 5 categories
 * with mathematical progress calculation, 90% mastery threshold gating,
 * and persistent unlock states.
 */

import { HubTag, HubTagCategory, TrialObservation } from './types';

export class HubTagMasteryVault {
  private tags: Map<string, HubTag> = new Map();

  constructor() {
    this.initializeTags();
  }

  private initializeTags(): void {
    const definitions: Omit<HubTag, 'isUnlocked' | 'currentProgress'>[] = [
      // 1. DIATONIC FOUNDATIONS
      {
        id: 'TAG_TONIC_ANCHOR',
        category: 'DIATONIC_FOUNDATIONS',
        title: 'Tonic Anchor',
        description: 'Achieve 95% accuracy on Degrees 1 and 8 across 20 trials',
        iconName: 'Anchor',
        masteryThreshold: 0.95,
      },
      {
        id: 'TAG_PILLAR_HARPER',
        category: 'DIATONIC_FOUNDATIONS',
        title: 'Pillar Harper',
        description: 'Master the triad pillars 1, 3, and 5 with 90% accuracy',
        iconName: 'Columns',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_TENDENCY_MASTER',
        category: 'DIATONIC_FOUNDATIONS',
        title: 'Tendency Master',
        description: 'Master diatonic tension tones 2, 4, 6, and 7 with 90% accuracy',
        iconName: 'Compass',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_TRITONE_SLAYER',
        category: 'DIATONIC_FOUNDATIONS',
        title: 'Tritone Slayer',
        description: 'Identify the chromatic tritone sharp 4 five times without error',
        iconName: 'Zap',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_OCTAVE_SOVEREIGN',
        category: 'DIATONIC_FOUNDATIONS',
        title: 'Octave Sovereign',
        description: 'Maintain 90% accuracy across both low bass wire and treble octaves',
        iconName: 'Crown',
        masteryThreshold: 0.90,
      },

      // 2. CELTIC MODES
      {
        id: 'TAG_DORIAN_BARD',
        category: 'CELTIC_MODES',
        title: 'Dorian Bard',
        description: 'Attain 90% accuracy in D Dorian mode recognizing the major 6th',
        iconName: 'Music',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_MIXOLYDIAN_ROVER',
        category: 'CELTIC_MODES',
        title: 'Mixolydian Rover',
        description: 'Master the Scottish and Irish Highland flat 7th with 90% accuracy',
        iconName: 'Wind',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_AEOLIAN_SHADOW',
        category: 'CELTIC_MODES',
        title: 'Aeolian Shadow',
        description: 'Navigate pure minor laments with degrees 3, 6, and 7 at 90% accuracy',
        iconName: 'Moon',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_PENTATONIC_SKELETON',
        category: 'CELTIC_MODES',
        title: 'Ancient Pentatonic',
        description: 'Complete 15 trials identifying the 5 pentatonic degrees without a miss',
        iconName: 'Feather',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_MODAL_ALCHEMY',
        category: 'CELTIC_MODES',
        title: 'Modal Alchemist',
        description: 'Successfully complete practice sessions across 3 distinct modal keys',
        iconName: 'Sparkles',
        masteryThreshold: 1.0,
      },

      // 3. SPEED & REFLEX
      {
        id: 'TAG_LIGHTNING_INSTINCT',
        category: 'SPEED_AND_REFLEX',
        title: 'Lightning Instinct',
        description: 'Score 5 consecutive correct answers under 500 milliseconds',
        iconName: 'Bolt',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_REEL_SPEED_HARPER',
        category: 'SPEED_AND_REFLEX',
        title: 'Reel Speed Harper',
        description: 'Average under 650ms reaction time with over 90% accuracy',
        iconName: 'FastForward',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_SUB_SECOND_REFLEX',
        category: 'SPEED_AND_REFLEX',
        title: 'Sub Second Reflex',
        description: 'Complete 10 correct trials under 1000 milliseconds',
        iconName: 'Clock',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_TEMPO_INVARIANCE',
        category: 'SPEED_AND_REFLEX',
        title: 'Tempo Invariant',
        description: 'Maintain 90% accuracy during rapid 120 BPM cadence priming',
        iconName: 'Activity',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_STEADY_PULSE',
        category: 'SPEED_AND_REFLEX',
        title: 'Steady Pulse',
        description: 'Demonstrate response latency variance under 150ms over 15 notes',
        iconName: 'Heart',
        masteryThreshold: 1.0,
      },

      // 4. LEVER VIRTUOSITY
      {
        id: 'TAG_ZERO_DELTA_SCHOLAR',
        category: 'LEVER_VIRTUOSITY',
        title: 'Zero Delta Scholar',
        description: 'Pivot between relative Celtic modes requiring zero lever flips',
        iconName: 'Layers',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_LEVER_TACTICIAN',
        category: 'LEVER_VIRTUOSITY',
        title: 'Lever Tactician',
        description: 'Execute minimum lever transitions across a 3 tune session medley',
        iconName: 'Sliders',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_OPEN_EB_GUARDIAN',
        category: 'LEVER_VIRTUOSITY',
        title: 'Open Eb Guardian',
        description: 'Tune and configure all 8 major Celtic keys starting from open Eb',
        iconName: 'Shield',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_CAMAC_PRECISION',
        category: 'LEVER_VIRTUOSITY',
        title: 'Camac Precision',
        description: 'Follow the Circle of Fifths order A, E, B, F, C, G, D perfectly',
        iconName: 'CheckCircle',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_HAMMING_PATH',
        category: 'LEVER_VIRTUOSITY',
        title: 'Hypercube Navigator',
        description: 'Calculate and apply Hamiltonian minimal lever flip paths in 7 cube space',
        iconName: 'Navigation',
        masteryThreshold: 1.0,
      },

      // 5. BARDIC DEDICATION
      {
        id: 'TAG_CENTURY_CLUB',
        category: 'BARDIC_DEDICATION',
        title: 'Century Club',
        description: 'Complete 100 cumulative ear training trials at the harp',
        iconName: 'Award',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_BARDIC_FLOW',
        category: 'BARDIC_DEDICATION',
        title: 'Bardic Flow',
        description: 'Achieve an uninterrupted streak of 20 correct scale degree plucks',
        iconName: 'Flame',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_IRON_WILL',
        category: 'BARDIC_DEDICATION',
        title: 'Iron Will',
        description: 'Bounce back from a multi error slump to complete the level at 90%',
        iconName: 'Target',
        masteryThreshold: 0.90,
      },
      {
        id: 'TAG_DAWN_HARPER',
        category: 'BARDIC_DEDICATION',
        title: 'Dawn Harper',
        description: 'Complete a full Celtic ear training session before 9:00 AM',
        iconName: 'Sun',
        masteryThreshold: 1.0,
      },
      {
        id: 'TAG_MASTER_CAROLAN',
        category: 'BARDIC_DEDICATION',
        title: 'Master Carolan',
        description: 'Unlock 15 or more Hub Tags and sustain 90% overall mastery',
        iconName: 'Star',
        masteryThreshold: 0.90,
      },
    ];

    definitions.forEach((def) => {
      this.tags.set(def.id, {
        ...def,
        isUnlocked: false,
        currentProgress: 0.0,
      });
    });
  }

  public getAllTags(): HubTag[] {
    return Array.from(this.tags.values());
  }

  public getTagsByCategory(category: HubTagCategory): HubTag[] {
    return this.getAllTags().filter((t) => t.category === category);
  }

  public getTag(id: string): HubTag | undefined {
    return this.tags.get(id);
  }

  /**
   * Evaluate telemetry observations and update badge progress.
   * Returns an array of newly unlocked HubTags during this evaluation.
   */
  public evaluateObservations(observations: TrialObservation[]): HubTag[] {
    const newlyUnlocked: HubTag[] = [];
    const now = Date.now();

    const totalCount = observations.length;
    if (totalCount === 0) return newlyUnlocked;

    const correctCount = observations.filter((o) => o.isCorrect).length;
    const overallAccuracy = correctCount / totalCount;

    // 1. TAG_CENTURY_CLUB: 100 trials
    const centuryTag = this.tags.get('TAG_CENTURY_CLUB')!;
    if (!centuryTag.isUnlocked) {
      centuryTag.currentProgress = Math.min(1.0, totalCount / 100);
      if (totalCount >= 100) {
        centuryTag.isUnlocked = true;
        centuryTag.unlockedAtTimestamp = now;
        newlyUnlocked.push(centuryTag);
      }
    }

    // 2. TAG_TONIC_ANCHOR: 95% on Degrees 1 & 8 across >= 20 trials
    const tonicTrials = observations.filter((o) => o.stimulusDegree === '1' || o.stimulusDegree === '8');
    const tonicTag = this.tags.get('TAG_TONIC_ANCHOR')!;
    if (!tonicTag.isUnlocked && tonicTrials.length >= 20) {
      const tonicCorrect = tonicTrials.filter((o) => o.isCorrect).length;
      const tonicAcc = tonicCorrect / tonicTrials.length;
      tonicTag.currentProgress = Math.min(1.0, tonicAcc / 0.95);
      if (tonicAcc >= 0.95) {
        tonicTag.isUnlocked = true;
        tonicTag.unlockedAtTimestamp = now;
        newlyUnlocked.push(tonicTag);
      }
    }

    // 3. TAG_PILLAR_HARPER: 90% on Triad Pillars (1, 3, 5) across >= 20 trials
    const pillarTrials = observations.filter((o) => ['1', '3', '5'].includes(o.stimulusDegree));
    const pillarTag = this.tags.get('TAG_PILLAR_HARPER')!;
    if (!pillarTag.isUnlocked && pillarTrials.length >= 20) {
      const pillarCorrect = pillarTrials.filter((o) => o.isCorrect).length;
      const pillarAcc = pillarCorrect / pillarTrials.length;
      pillarTag.currentProgress = Math.min(1.0, pillarAcc / 0.90);
      if (pillarAcc >= 0.90) {
        pillarTag.isUnlocked = true;
        pillarTag.unlockedAtTimestamp = now;
        newlyUnlocked.push(pillarTag);
      }
    }

    // 4. TAG_LIGHTNING_INSTINCT: 5 consecutive correct under 500ms
    const lightningTag = this.tags.get('TAG_LIGHTNING_INSTINCT')!;
    if (!lightningTag.isUnlocked) {
      let maxFastStreak = 0;
      let curFastStreak = 0;
      for (const obs of observations) {
        if (obs.isCorrect && obs.latencyMs < 500) {
          curFastStreak++;
          if (curFastStreak > maxFastStreak) maxFastStreak = curFastStreak;
        } else {
          curFastStreak = 0;
        }
      }
      lightningTag.currentProgress = Math.min(1.0, maxFastStreak / 5);
      if (maxFastStreak >= 5) {
        lightningTag.isUnlocked = true;
        lightningTag.unlockedAtTimestamp = now;
        newlyUnlocked.push(lightningTag);
      }
    }

    // 5. TAG_BARDIC_FLOW: 20-note streak
    const flowTag = this.tags.get('TAG_BARDIC_FLOW')!;
    if (!flowTag.isUnlocked) {
      let maxStreak = 0;
      let curStreak = 0;
      for (const obs of observations) {
        if (obs.isCorrect) {
          curStreak++;
          if (curStreak > maxStreak) maxStreak = curStreak;
        } else {
          curStreak = 0;
        }
      }
      flowTag.currentProgress = Math.min(1.0, maxStreak / 20);
      if (maxStreak >= 20) {
        flowTag.isUnlocked = true;
        flowTag.unlockedAtTimestamp = now;
        newlyUnlocked.push(flowTag);
      }
    }

    // 6. TAG_MASTER_CAROLAN: 15+ Hub Tags unlocked and >= 90% overall accuracy
    const carolanTag = this.tags.get('TAG_MASTER_CAROLAN')!;
    if (!carolanTag.isUnlocked) {
      const unlockedCount = this.getAllTags().filter((t) => t.isUnlocked && t.id !== 'TAG_MASTER_CAROLAN').length;
      carolanTag.currentProgress = Math.min(1.0, (unlockedCount / 15 + overallAccuracy / 0.90) / 2);
      if (unlockedCount >= 15 && overallAccuracy >= 0.90) {
        carolanTag.isUnlocked = true;
        carolanTag.unlockedAtTimestamp = now;
        newlyUnlocked.push(carolanTag);
      }
    }

    return newlyUnlocked;
  }
}
