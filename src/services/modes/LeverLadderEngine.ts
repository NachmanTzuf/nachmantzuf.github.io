/**
 * EARPA PROGRESSIVE LEVER LADDER ENGINE
 * Coordinates Tier 1 (Major Keys), Tier 2 (Celtic Modes), Tier 3 (Repertoire Tune Context),
 * and Tier 4 (Timed Session Lever Rush) with star ratings and gating.
 */

import { LeverLadderNode, LeverLadderTier, SessionLeverRushState } from './types';
import { ModalShiftEngine } from '../theory/ModalShiftEngine';
import { MinimumDeltaSolver } from '../theory/MinimumDeltaSolver';
import { PitchClass } from '../theory/types';

export class LeverLadderEngine {
  private nodes: Map<string, LeverLadderNode> = new Map();
  private activeRushState: SessionLeverRushState | null = null;

  constructor() {
    this.initializeLadderNodes();
  }

  private initializeLadderNodes(): void {
    const defaultNodes: LeverLadderNode[] = [
      // --- TIER 1: MAJOR KEYS (Open Eb to 7 Sharps) ---
      {
        nodeId: 'LL_T1_01',
        tier: 1,
        title: 'Eb Major Sanctuary',
        subtitle: 'The open harp acoustic home. 0 levers raised.',
        rootPitchClass: 3,
        mode: 'ionian',
        targetAccuracy: 0.90,
        isUnlocked: true,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T1_02',
        tier: 1,
        title: 'Bb Major Gateway',
        subtitle: 'First step along the Circle of Fifths. Raise A.',
        rootPitchClass: 10,
        mode: 'ionian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T1_03',
        tier: 1,
        title: 'F Major Crossing',
        subtitle: 'Pastoral second fifth. Raise A and E.',
        rootPitchClass: 5,
        mode: 'ionian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T1_04',
        tier: 1,
        title: 'C Major Natural',
        subtitle: 'The universal natural key. Raise A, E, and B.',
        rootPitchClass: 0,
        mode: 'ionian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T1_05',
        tier: 1,
        title: 'G Major Heart',
        subtitle: 'Primary Celtic session key. Raise A, E, B, and F.',
        rootPitchClass: 7,
        mode: 'ionian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T1_06',
        tier: 1,
        title: 'D Major Anthem',
        subtitle: 'The fiddler king key. Raise A, E, B, F, and C.',
        rootPitchClass: 2,
        mode: 'ionian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },

      // --- TIER 2: CELTIC MODES ---
      {
        nodeId: 'LL_T2_01',
        tier: 2,
        title: 'D Dorian Mist',
        subtitle: 'Recognize the radiant natural 6th over minor 3rd.',
        rootPitchClass: 2,
        mode: 'dorian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T2_02',
        tier: 2,
        title: 'E Dorian Fire',
        subtitle: 'The driving pulse of Irish reels. Parent key D Major.',
        rootPitchClass: 4,
        mode: 'dorian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T2_03',
        tier: 2,
        title: 'G Mixolydian Pipe Air',
        subtitle: 'Highland bagpipe sound with flat 7th. Parent C Major.',
        rootPitchClass: 7,
        mode: 'mixolydian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T2_04',
        tier: 2,
        title: 'A Mixolydian Chieftain',
        subtitle: 'Piping anthem mode. Zero delta from D Major.',
        rootPitchClass: 9,
        mode: 'mixolydian',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },

      // --- TIER 3: CELTIC REPERTOIRE TUNE CONTEXT ---
      {
        nodeId: 'LL_T3_01',
        tier: 3,
        title: 'The Butterfly Slip Jig',
        subtitle: 'Identify E Dorian gravity in 9/8 time.',
        rootPitchClass: 4,
        mode: 'dorian',
        tuneContextName: 'The Butterfly (Slip Jig)',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T3_02',
        tier: 3,
        title: 'Drowsy Maggie Reel',
        subtitle: 'Master the modulation between E Dorian and D Major.',
        rootPitchClass: 4,
        mode: 'dorian',
        tuneContextName: 'Drowsy Maggie (Reel)',
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
      {
        nodeId: 'LL_T3_03',
        tier: 3,
        title: 'Morrison Jig Mastery',
        subtitle: 'Navigate Dorian tension tones in classic double jig rhythm.',
        rootPitchClass: 4,
        mode: 'dorian',
        tuneContextName: "Morrison's Jig",
        targetAccuracy: 0.90,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },

      // --- TIER 4: TIMED SESSION LEVER RUSH ---
      {
        nodeId: 'LL_T4_01',
        tier: 4,
        title: 'Session Lever Rush 60s',
        subtitle: 'Fast key changes under 60-second timer with score multipliers.',
        rootPitchClass: 7,
        mode: 'ionian',
        targetAccuracy: 0.85,
        timeLimitSec: 60,
        isUnlocked: false,
        highScore: 0,
        starsEarned: 0,
      },
    ];

    defaultNodes.forEach((node) => {
      this.nodes.set(node.nodeId, node);
    });
  }

  public getNodesByTier(tier: LeverLadderTier): LeverLadderNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.tier === tier);
  }

  public getAllNodes(): LeverLadderNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(nodeId: string): LeverLadderNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Complete a node trial run and unlock subsequent nodes if passing 90% threshold.
   */
  public recordNodeCompletion(
    nodeId: string,
    accuracy: number,
    score: number
  ): {
    node: LeverLadderNode;
    passed: boolean;
    stars: 0 | 1 | 2 | 3;
    unlockedNextId?: string;
  } {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const passed = accuracy >= node.targetAccuracy;
    let stars: 0 | 1 | 2 | 3 = 0;

    if (passed) {
      if (accuracy >= 0.98) stars = 3;
      else if (accuracy >= 0.94) stars = 2;
      else stars = 1;
    }

    if (score > node.highScore) {
      node.highScore = score;
    }
    if (stars > node.starsEarned) {
      node.starsEarned = stars;
    }

    let unlockedNextId: string | undefined;

    if (passed) {
      // Find subsequent node in same tier or next tier
      const allNodes = this.getAllNodes();
      const currentIndex = allNodes.findIndex((n) => n.nodeId === nodeId);
      if (currentIndex >= 0 && currentIndex + 1 < allNodes.length) {
        const nextNode = allNodes[currentIndex + 1];
        nextNode.isUnlocked = true;
        unlockedNextId = nextNode.nodeId;
      }
    }

    return { node, passed, stars, unlockedNextId };
  }

  /**
   * Starts a 60-second Session Lever Rush session.
   */
  public startSessionLeverRush(): SessionLeverRushState {
    const initialKey = 'G Major';
    const def = ModalShiftEngine.getModalDefinition(7, 'ionian');

    const state: SessionLeverRushState = {
      isActive: true,
      timeRemainingSec: 60,
      currentScore: 0,
      comboStreak: 0,
      scoreMultiplier: 1.0,
      targetModulationKey: initialKey,
      targetLevers: def.levers,
      requiredFlipsCount: MinimumDeltaSolver.calculateDelta({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 }, def.levers).totalFlips,
    };

    this.activeRushState = state;
    return state;
  }

  /**
   * Handle correct hit during Session Lever Rush.
   */
  public recordRushHit(latencyMs: number): SessionLeverRushState {
    if (!this.activeRushState || !this.activeRushState.isActive) {
      throw new Error('No active Lever Rush session');
    }

    const state = this.activeRushState;
    state.comboStreak += 1;

    // Multiplier calculation: 5 streak = 1.5x, 10 streak = 2.0x, 15 streak = 2.5x, 20+ streak = 3.0x
    if (state.comboStreak >= 20) state.scoreMultiplier = 3.0;
    else if (state.comboStreak >= 15) state.scoreMultiplier = 2.5;
    else if (state.comboStreak >= 10) state.scoreMultiplier = 2.0;
    else if (state.comboStreak >= 5) state.scoreMultiplier = 1.5;
    else state.scoreMultiplier = 1.0;

    // Speed bonus for reflex answers
    const speedBonus = latencyMs < 600 ? 50 : latencyMs < 1000 ? 25 : 10;
    state.currentScore += Math.round((100 + speedBonus) * state.scoreMultiplier);

    return { ...state };
  }

  /**
   * Handle miss during Session Lever Rush.
   */
  public recordRushMiss(): SessionLeverRushState {
    if (!this.activeRushState || !this.activeRushState.isActive) {
      throw new Error('No active Lever Rush session');
    }

    const state = this.activeRushState;
    state.comboStreak = 0;
    state.scoreMultiplier = 1.0;

    return { ...state };
  }
}
