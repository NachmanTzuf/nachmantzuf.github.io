/**
 * EARPA BARDIC JOURNEY ENGINE
 * 36-node progressive curriculum tree across 6 stages with strict 90% accuracy gating,
 * 3-star ratings, trial XP calculations, combo streak multipliers, and daily streaks.
 */

import { JourneyNode, JourneyStageId, UserProgressionState } from './types';
import { ScaleDegree } from '../audio/types';

export class BardicJourneyEngine {
  private nodes: Map<string, JourneyNode> = new Map();
  private userState: UserProgressionState;

  constructor() {
    this.userState = {
      totalXp: 0,
      bardicLevel: 1,
      currentDailyStreak: 1,
      bestDailyStreak: 1,
      completedNodeIds: [],
      equippedTimber: 'curly_maple',
      equippedRosette: 'triskele_tara',
      equippedStrings: 'solar_flare_brass',
    };
    this.build36NodeCurriculum();
  }

  private build36NodeCurriculum(): void {
    const stageTitles: Record<JourneyStageId, string> = {
      1: 'The First Resonance: Anchors and Pillars',
      2: 'The Diatonic Octave: The 7 Ancient Tones',
      3: 'Bass Wires and Treble Heights: Multi Octave Invariance',
      4: 'Chromatic Shadows: Tendency Tones and Accidentals',
      5: 'Modal Lever Shifts: Celtic Keys and Repertoire',
      6: 'Melodic Dictation: Celtic Motifs and Reel Turns',
    };

    const nodeTemplates: {
      stage: JourneyStageId;
      idx: number;
      title: string;
      subtitle: string;
      focus: string;
      pool: ScaleDegree[];
      trials: number;
    }[] = [
      // STAGE 1
      { stage: 1, idx: 1, title: 'Tonic and Dominant', subtitle: 'Feel the rock solid foundation of Degrees 1 and 5.', focus: 'Tonic and Dominant stability', pool: ['1', '5'], trials: 10 },
      { stage: 1, idx: 2, title: 'The High Octave', subtitle: 'Ascend to Degree 8 and recognize identical tonic home.', focus: 'Octave recognition', pool: ['1', '5', '8'], trials: 12 },
      { stage: 1, idx: 3, title: 'The Golden Third', subtitle: 'Add the warm major 3rd to complete the tonic triad.', focus: 'Major 3rd color', pool: ['1', '3', '5', '8'], trials: 14 },
      { stage: 1, idx: 4, title: 'Pillar Reflex Sprint', subtitle: 'Swift recognition of triad notes 1, 3, 5, 8 under 1 second.', focus: 'Pillar reflex speed', pool: ['1', '3', '5', '8'], trials: 16 },
      { stage: 1, idx: 5, title: 'Octave Anchor Leaps', subtitle: 'Large melodic jumps between 1, 5, and 8.', focus: 'Melodic leap stability', pool: ['1', '5', '8'], trials: 16 },
      { stage: 1, idx: 6, title: 'Stage 1 Bardic Gate', subtitle: 'Prove mastery over the triad pillars with 90% precision.', focus: 'Stage 1 Comprehensive Gate', pool: ['1', '3', '5', '8'], trials: 20 },

      // STAGE 2
      { stage: 2, idx: 1, title: 'Supertonic Tendency', subtitle: 'Degree 2 leaning down towards the tonic root.', focus: 'Degree 2 step resolution', pool: ['1', '2', '3', '5'], trials: 14 },
      { stage: 2, idx: 2, title: 'Subdominant Longing', subtitle: 'Degree 4 sliding gravitationally into the 3rd.', focus: 'Degree 4 step resolution', pool: ['1', '3', '4', '5'], trials: 14 },
      { stage: 2, idx: 3, title: 'Pastoral Submediant', subtitle: 'Degree 6 resting gently above the fifth.', focus: 'Degree 6 harmonic color', pool: ['1', '3', '5', '6', '8'], trials: 16 },
      { stage: 2, idx: 4, title: 'The Leading Tone', subtitle: 'Degree 7 magnetic pull snapping upward to 8.', focus: 'Degree 7 leading attraction', pool: ['1', '5', '7', '8'], trials: 16 },
      { stage: 2, idx: 5, title: 'Complete Diatonic Scale', subtitle: 'All 7 scale degrees ringing in open harmony.', focus: 'Full diatonic integration', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 20 },
      { stage: 2, idx: 6, title: 'Stage 2 Bardic Gate', subtitle: 'Full 8 degree recognition at 90% accuracy.', focus: 'Stage 2 Comprehensive Gate', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 25 },

      // STAGE 3
      { stage: 3, idx: 1, title: 'Deep Wire Bass', subtitle: 'Low Octave 2 strings humming through the soundboard.', focus: 'Low bass pitch perception', pool: ['1', '3', '5', '8'], trials: 15 },
      { stage: 3, idx: 2, title: 'Treble Airs', subtitle: 'High Octave 5 and 6 nylon strings soaring in light.', focus: 'High treble clarity', pool: ['1', '2', '3', '5', '8'], trials: 15 },
      { stage: 3, idx: 3, title: 'Cross Octave Leaps', subtitle: 'Identify identical degrees across 3 distinct octaves.', focus: 'Multi octave invariance', pool: ['1', '3', '5', '7', '8'], trials: 18 },
      { stage: 3, idx: 4, title: 'Acoustic Timbre Shifts', subtitle: 'Celtic nylon vs bright Celtic wire bass strings.', focus: 'Timbral generalization', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 18 },
      { stage: 3, idx: 5, title: 'Rapid Register Shifts', subtitle: 'Alternating between bass foundation and treble leads.', focus: 'Register agility', pool: ['1', '3', '4', '5', '6', '8'], trials: 20 },
      { stage: 3, idx: 6, title: 'Stage 3 Bardic Gate', subtitle: 'Master multi octave acoustic hearing at 90% precision.', focus: 'Stage 3 Comprehensive Gate', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 25 },

      // STAGE 4
      { stage: 4, idx: 1, title: 'Lydian Sharp 4', subtitle: 'The radiant tritone piercing into the 5th.', focus: 'Sharp 4 chromatic recognition', pool: ['1', '3', '#4', '5', '8'], trials: 15 },
      { stage: 4, idx: 2, title: 'Celtic Flat 7', subtitle: 'The modal subtonic of Scottish reels and jigs.', focus: 'Flat 7 modal color', pool: ['1', '3', '5', 'b7', '8'], trials: 15 },
      { stage: 4, idx: 3, title: 'Minor Mediant Flat 3', subtitle: 'The dark shadow of ancient Celtic minor laments.', focus: 'Flat 3 minor quality', pool: ['1', 'b3', '4', '5', '8'], trials: 16 },
      { stage: 4, idx: 4, title: 'Neapolitan Flat 2', subtitle: 'The intense chromatic tension leaning to the root.', focus: 'Flat 2 downward attraction', pool: ['1', 'b2', '2', '5', '8'], trials: 16 },
      { stage: 4, idx: 5, title: 'Minor Submediant Flat 6', subtitle: 'The mournful Aeolian 6th falling into the 5th.', focus: 'Flat 6 grief color', pool: ['1', '3', '5', 'b6', '8'], trials: 18 },
      { stage: 4, idx: 6, title: 'Stage 4 Bardic Gate', subtitle: 'Identify all 12 chromatic degrees at 90% precision.', focus: 'Stage 4 Comprehensive Gate', pool: ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7', '8'], trials: 25 },

      // STAGE 5
      { stage: 5, idx: 1, title: 'D Dorian Open Harp', subtitle: 'Open natural mode levers with bright major 6th.', focus: 'D Dorian modal center', pool: ['1', '2', 'b3', '4', '5', '6', 'b7', '8'], trials: 18 },
      { stage: 5, idx: 2, title: 'E Dorian Reel Pulse', subtitle: 'Physical lever flip on F strings with D Major parent.', focus: 'E Dorian reel cadence', pool: ['1', '2', 'b3', '4', '5', '6', 'b7', '8'], trials: 18 },
      { stage: 5, idx: 3, title: 'G Mixolydian Pipe Air', subtitle: 'The highland pipe mode with flat 7th.', focus: 'G Mixolydian cadence', pool: ['1', '2', '3', '4', '5', '6', 'b7', '8'], trials: 18 },
      { stage: 5, idx: 4, title: 'A Aeolian Pure Minor', subtitle: 'Pure natural minor without leading tone pull.', focus: 'A Aeolian lament', pool: ['1', '2', 'b3', '4', '5', 'b6', 'b7', '8'], trials: 20 },
      { stage: 5, idx: 5, title: 'Modal Modulation Rush', subtitle: 'Dynamic modulation between Dorian and Mixolydian.', focus: 'Modal modulation agility', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 22 },
      { stage: 5, idx: 6, title: 'Stage 5 Bardic Gate', subtitle: 'Celtic modal mastery with lever flips at 90% precision.', focus: 'Stage 5 Comprehensive Gate', pool: ['1', '2', 'b3', '3', '4', '5', '6', 'b7', '7', '8'], trials: 30 },

      // STAGE 6
      { stage: 6, idx: 1, title: 'Stepwise Dyads', subtitle: 'Recognize 2 note stepwise melodic vectors.', focus: 'Sequential interval recognition', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 16 },
      { stage: 6, idx: 2, title: 'Triadic Arpeggios', subtitle: 'Broken chord melodic motifs in 3 notes.', focus: 'Arpeggiated chord lines', pool: ['1', '3', '5', '8'], trials: 18 },
      { stage: 6, idx: 3, title: 'The Jig Triplet', subtitle: 'Fast 3 note ornaments in 6/8 Irish jig time.', focus: 'Ornamental phrase dictation', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 20 },
      { stage: 6, idx: 4, title: 'The Reel Turn and Roll', subtitle: 'Sequential 4 note reel turns and rolls.', focus: 'Reel ornamental motifs', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 22 },
      { stage: 6, idx: 5, title: 'Master Bard Transcription', subtitle: 'Full 4 measure Celtic melodies transcribed note by note.', focus: 'Authentic session transcription', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 25 },
      { stage: 6, idx: 6, title: 'Grand Bard of Tara Gate', subtitle: 'The final culmination. Earn the ancient title Grand Bard.', focus: 'Grand Master Bardic Culmination', pool: ['1', '2', '3', '4', '5', '6', '7', '8'], trials: 30 },
    ];

    nodeTemplates.forEach((tpl) => {
      const nodeId = `NODE_${tpl.stage}_${tpl.idx}`;
      const isFirst = tpl.stage === 1 && tpl.idx === 1;

      this.nodes.set(nodeId, {
        nodeId,
        stageId: tpl.stage,
        stageNodeIndex: tpl.idx,
        title: tpl.title,
        subtitle: tpl.subtitle,
        pedagogicalFocus: tpl.focus,
        rootPitchClass: 3, // Eb
        mode: 'ionian',
        stimulusPool: tpl.pool,
        requiredTrials: tpl.trials,
        targetAccuracy: 0.90,
        isUnlocked: isFirst,
        isCompleted: false,
        starsEarned: 0,
        highScore: 0,
      });
    });
  }

  public getAllNodes(): JourneyNode[] {
    return Array.from(this.nodes.values());
  }

  public getNodesByStage(stageId: JourneyStageId): JourneyNode[] {
    return this.getAllNodes().filter((n) => n.stageId === stageId);
  }

  public getNode(nodeId: string): JourneyNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getUserProgression(): UserProgressionState {
    return { ...this.userState };
  }

  /**
   * Calculate Trial XP with combo streak and reflex latency bonuses.
   * XP_trial = (XP_base * C * M_combo) + B_latency
   */
  public calculateTrialXp(
    isCorrect: boolean,
    streak: number,
    latencyMs: number
  ): { xpAwarded: number; multiplier: number; speedBonus: number } {
    if (!isCorrect) {
      return { xpAwarded: 0, multiplier: 1.0, speedBonus: 0 };
    }

    const base = 10;

    // Combo streak multiplier
    let multiplier = 1.0;
    if (streak >= 15) multiplier = 3.0; // Bardic Flow
    else if (streak >= 10) multiplier = 2.0;
    else if (streak >= 5) multiplier = 1.5;

    // Speed reflex bonus
    let speedBonus = 0;
    if (latencyMs <= 1000) speedBonus = 5;
    else if (latencyMs <= 1800) speedBonus = 2;

    const xpAwarded = Math.round(base * multiplier) + speedBonus;
    this.userState.totalXp += xpAwarded;
    this.updateBardicLevel();

    return { xpAwarded, multiplier, speedBonus };
  }

  /**
   * Complete a Journey Node run and unlock the next node if passing 90% accuracy.
   */
  public completeNodeRun(
    nodeId: string,
    accuracy: number,
    score: number
  ): {
    node: JourneyNode;
    passed: boolean;
    stars: 0 | 1 | 2 | 3;
    completionXpBonus: number;
    unlockedNextId?: string;
  } {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const passed = accuracy >= node.targetAccuracy;
    let stars: 0 | 1 | 2 | 3 = 0;
    let completionXpBonus = 0;

    if (passed) {
      node.isCompleted = true;
      if (!this.userState.completedNodeIds.includes(nodeId)) {
        this.userState.completedNodeIds.push(nodeId);
      }

      // Star calculation
      if (accuracy >= 0.98) stars = 3;
      else if (accuracy >= 0.94) stars = 2;
      else stars = 1;

      // Completion bonus (+50 XP) plus 3-star burst (+100 XP)
      completionXpBonus = 50 + (stars === 3 ? 100 : 0);
      this.userState.totalXp += completionXpBonus;
      this.updateBardicLevel();
    }

    if (score > node.highScore) node.highScore = score;
    if (stars > node.starsEarned) node.starsEarned = stars;

    // Unlock subsequent node
    let unlockedNextId: string | undefined;
    if (passed) {
      const allNodes = this.getAllNodes();
      const curIdx = allNodes.findIndex((n) => n.nodeId === nodeId);
      if (curIdx >= 0 && curIdx + 1 < allNodes.length) {
        const nextNode = allNodes[curIdx + 1];
        nextNode.isUnlocked = true;
        unlockedNextId = nextNode.nodeId;
      }
    }

    return { node, passed, stars, completionXpBonus, unlockedNextId };
  }

  private updateBardicLevel(): void {
    // Bardic Level = Math.floor(Math.sqrt(totalXp / 50)) + 1
    const newLevel = Math.floor(Math.sqrt(this.userState.totalXp / 50)) + 1;
    this.userState.bardicLevel = Math.max(1, newLevel);
  }
}
