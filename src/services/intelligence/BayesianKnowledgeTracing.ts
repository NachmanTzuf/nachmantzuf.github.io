/**
 * EARPA AUDITORY BAYESIAN KNOWLEDGE TRACING (A-BKT) ENGINE
 * Implements Bayesian posterior mastery updates, motor slip decomposition,
 * forward time state transition, 20% weak-spot injection, and Shannon entropy.
 */

import { ScaleDegree } from '../audio/types';
import {
  ScaleDegreeBKTParams,
  DegreeMasteryState,
  TrialObservation,
  ConfusionMatrixNode,
} from './types';

export class BayesianKnowledgeTracingEngine {
  private static readonly DEGREE_PARAMS: Record<ScaleDegree, ScaleDegreeBKTParams> = {
    '1': { pL0: 0.50, pT: 0.35, pS: 0.04, pG: 0.28, stabilityHalfLifeDays: 14.0 },
    'b2': { pL0: 0.04, pT: 0.08, pS: 0.08, pG: 0.05, stabilityHalfLifeDays: 1.5 },
    '2': { pL0: 0.20, pT: 0.18, pS: 0.06, pG: 0.12, stabilityHalfLifeDays: 4.0 },
    'b3': { pL0: 0.08, pT: 0.12, pS: 0.07, pG: 0.07, stabilityHalfLifeDays: 2.5 },
    '3': { pL0: 0.32, pT: 0.25, pS: 0.05, pG: 0.18, stabilityHalfLifeDays: 7.0 },
    '4': { pL0: 0.18, pT: 0.16, pS: 0.06, pG: 0.10, stabilityHalfLifeDays: 3.5 },
    '#4': { pL0: 0.03, pT: 0.06, pS: 0.09, pG: 0.04, stabilityHalfLifeDays: 1.0 },
    '5': { pL0: 0.40, pT: 0.30, pS: 0.04, pG: 0.22, stabilityHalfLifeDays: 10.0 },
    'b6': { pL0: 0.06, pT: 0.10, pS: 0.07, pG: 0.06, stabilityHalfLifeDays: 2.0 },
    '6': { pL0: 0.16, pT: 0.15, pS: 0.06, pG: 0.09, stabilityHalfLifeDays: 3.0 },
    'b7': { pL0: 0.10, pT: 0.14, pS: 0.07, pG: 0.08, stabilityHalfLifeDays: 2.8 },
    '7': { pL0: 0.15, pT: 0.16, pS: 0.08, pG: 0.08, stabilityHalfLifeDays: 3.2 },
    '8': { pL0: 0.45, pT: 0.32, pS: 0.04, pG: 0.20, stabilityHalfLifeDays: 12.0 },
  };

  private masteryStates: Map<ScaleDegree, DegreeMasteryState> = new Map();
  private confusionNodes: Map<ScaleDegree, ConfusionMatrixNode> = new Map();
  private observationHistory: TrialObservation[] = [];

  constructor() {
    this.resetAllStates();
  }

  public resetAllStates(): void {
    this.masteryStates.clear();
    this.confusionNodes.clear();
    this.observationHistory = [];

    const allDegrees: ScaleDegree[] = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7', '8'];

    allDegrees.forEach((deg) => {
      const params = BayesianKnowledgeTracingEngine.DEGREE_PARAMS[deg] || {
        pL0: 0.10, pT: 0.10, pS: 0.06, pG: 0.10, stabilityHalfLifeDays: 3.0,
      };

      this.masteryStates.set(deg, {
        degree: deg,
        masteryProbability: params.pL0,
        trialsCount: 0,
        correctCount: 0,
        averageLatencyMs: 0,
        lastTestedTimestamp: 0,
      });

      const initialConfusions: Record<string, number> = {};
      allDegrees.forEach((targetDeg) => {
        initialConfusions[targetDeg] = 0;
      });

      this.confusionNodes.set(deg, {
        stimulusDegree: deg,
        confusions: initialConfusions as Record<ScaleDegree, number>,
        totalPresentations: 0,
        shannonEntropy: 0,
      });
    });
  }

  public getMastery(degree: ScaleDegree): number {
    return this.masteryStates.get(degree)?.masteryProbability ?? 0.10;
  }

  public getAllMasteries(): Record<ScaleDegree, number> {
    const result: Record<string, number> = {};
    this.masteryStates.forEach((state, deg) => {
      result[deg] = state.masteryProbability;
    });
    return result as Record<ScaleDegree, number>;
  }

  /**
   * Updates Bayesian knowledge state and confusion node based on an observed trial.
   */
  public recordTrial(obs: TrialObservation): {
    updatedMastery: number;
    delta: number;
    shannonEntropy: number;
  } {
    this.observationHistory.push(obs);

    const deg = obs.stimulusDegree;
    const currentState = this.masteryStates.get(deg) || {
      degree: deg,
      masteryProbability: 0.20,
      trialsCount: 0,
      correctCount: 0,
      averageLatencyMs: 0,
      lastTestedTimestamp: 0,
    };

    const params = BayesianKnowledgeTracingEngine.DEGREE_PARAMS[deg] || {
      pL0: 0.15, pT: 0.15, pS: 0.06, pG: 0.10, stabilityHalfLifeDays: 3.0,
    };

    const priorPL = currentState.masteryProbability;
    let slip = params.pS;

    // Motor slip mitigation: if identified as a motor border slip, attenuate the penalty
    if (obs.isMotorSlip && !obs.isCorrect) {
      slip = 0.85; // High slip assumption preserves cognitive credit
    }

    const guess = params.pG;
    let posteriorPL: number;

    if (obs.isCorrect) {
      // P(L | Correct) = [P(L) * (1 - S)] / [P(L) * (1 - S) + (1 - P(L)) * G]
      const numerator = priorPL * (1 - slip);
      const denominator = numerator + (1 - priorPL) * guess;
      posteriorPL = denominator > 0 ? numerator / denominator : priorPL;
    } else {
      // P(L | Incorrect) = [P(L) * S] / [P(L) * S + (1 - P(L)) * (1 - G)]
      const numerator = priorPL * slip;
      const denominator = numerator + (1 - priorPL) * (1 - guess);
      posteriorPL = denominator > 0 ? numerator / denominator : priorPL;
    }

    // Forward time state transition: P(L_next) = P(L|Obs) + (1 - P(L|Obs)) * P(T)
    const nextPL = posteriorPL + (1 - posteriorPL) * params.pT;
    const boundedPL = Math.max(0.01, Math.min(0.99, nextPL));

    // Update state records
    const newTrials = currentState.trialsCount + 1;
    const newCorrect = currentState.correctCount + (obs.isCorrect ? 1 : 0);
    const newAvgLatency =
      (currentState.averageLatencyMs * currentState.trialsCount + obs.latencyMs) / newTrials;

    this.masteryStates.set(deg, {
      degree: deg,
      masteryProbability: boundedPL,
      trialsCount: newTrials,
      correctCount: newCorrect,
      averageLatencyMs: newAvgLatency,
      lastTestedTimestamp: obs.timestamp,
    });

    // Update Confusion Matrix Node
    const node = this.confusionNodes.get(deg)!;
    node.totalPresentations += 1;
    node.confusions[obs.guessedDegree] = (node.confusions[obs.guessedDegree] || 0) + 1;
    node.shannonEntropy = this.computeShannonEntropy(node);

    return {
      updatedMastery: boundedPL,
      delta: boundedPL - priorPL,
      shannonEntropy: node.shannonEntropy,
    };
  }

  /**
   * Computes Shannon Perceptual Entropy over a confusion node.
   * H(X) = - SUM(p_i * log2(p_i))
   */
  private computeShannonEntropy(node: ConfusionMatrixNode): number {
    const total = node.totalPresentations;
    if (total <= 1) return 0.0;

    let entropy = 0.0;
    Object.values(node.confusions).forEach((count) => {
      if (count > 0) {
        const p = count / total;
        entropy -= p * Math.log2(p);
      }
    });

    return entropy;
  }

  /**
   * 20% Weak-Spot Practice Injection Selector.
   * On every 5th trial (e.g. trial 4, 9, 14, 19...), intercepts random selection
   * and injects the degree with the lowest current Bayesian mastery probability.
   */
  public selectNextStimulusDegree(
    activePool: ScaleDegree[],
    trialNumber: number
  ): { selectedDegree: ScaleDegree; isWeakSpotInjection: boolean } {
    if (activePool.length === 0) {
      return { selectedDegree: '1', isWeakSpotInjection: false };
    }

    const isInjectionTrial = trialNumber > 0 && trialNumber % 5 === 4;

    if (isInjectionTrial) {
      // Find candidate in activePool with lowest mastery
      let lowestDegree = activePool[0];
      let lowestMastery = 1.0;

      for (const deg of activePool) {
        const m = this.getMastery(deg);
        if (m < lowestMastery) {
          lowestMastery = m;
          lowestDegree = deg;
        }
      }

      return {
        selectedDegree: lowestDegree,
        isWeakSpotInjection: true,
      };
    }

    // Standard pseudo-random draw
    const randomIndex = Math.floor(Math.random() * activePool.length);
    return {
      selectedDegree: activePool[randomIndex],
      isWeakSpotInjection: false,
    };
  }

  /**
   * Returns top confusion pair across the entire matrix (most frequent error).
   */
  public getPrimaryConfusion(): {
    stimulus: ScaleDegree;
    guessed: ScaleDegree;
    count: number;
  } | null {
    let maxCount = 0;
    let result: { stimulus: ScaleDegree; guessed: ScaleDegree; count: number } | null = null;

    this.confusionNodes.forEach((node, stim) => {
      Object.entries(node.confusions).forEach(([guess, count]) => {
        if (guess !== stim && count > maxCount) {
          maxCount = count;
          result = {
            stimulus: stim,
            guessed: guess as ScaleDegree,
            count,
          };
        }
      });
    });

    return result;
  }

  public getConfusionNode(degree: ScaleDegree): ConfusionMatrixNode | undefined {
    return this.confusionNodes.get(degree);
  }
}
