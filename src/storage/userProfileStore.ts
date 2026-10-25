/**
 * User Profile and Behavioral Adaptive Storage Store
 * Provides zero-latency synchronous persistence via MMKV with in-memory fallback.
 */

declare const require: any;

export interface StorageAdapter {
  readonly isPersistent: boolean;
  getString: (key: string) => string | undefined;
  set: (key: string, value: string | boolean | number) => void;
  getNumber: (key: string) => number | undefined;
  getBoolean: (key: string) => boolean | undefined;
  delete: (key: string) => void;
  clearAll: () => void;
}

// In-memory fallback adapter for environments without native binary bindings (tests, web, expo-go)
export class InMemoryStorageAdapter implements StorageAdapter {
  readonly isPersistent = false;
  private memoryMap = new Map<string, string | number | boolean>();

  getString(key: string): string | undefined {
    const val = this.memoryMap.get(key);
    return typeof val === 'string' ? val : undefined;
  }

  set(key: string, value: string | boolean | number): void {
    this.memoryMap.set(key, value);
  }

  getNumber(key: string): number | undefined {
    const val = this.memoryMap.get(key);
    return typeof val === 'number' ? val : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.memoryMap.get(key);
    return typeof val === 'boolean' ? val : undefined;
  }

  delete(key: string): void {
    this.memoryMap.delete(key);
  }

  clearAll(): void {
    this.memoryMap.clear();
  }
}

// Factory to instantiate native MMKV or gracefully degrade to in-memory adapter
function createStorageInstance(): StorageAdapter {
  try {
    // Dynamic require prevents build-time crash when native MMKV module is absent
    const { MMKV } = require('react-native-mmkv');
    const instance = new MMKV({ id: 'antigravity-user-profile-store' });
    return Object.assign(instance, { isPersistent: true });
  } catch {
    console.warn('[Storage] MMKV native module not detected. Gracefully falling back to volatile InMemoryStorageAdapter. Offline persistence disabled.');
    return new InMemoryStorageAdapter();
  }
}

export const storage: StorageAdapter = createStorageInstance();

// Types
export interface SkillVector {
  [domain: string]: number; // Normalised 0.0 to 1.0
}

export interface UserProfile {
  id: string;
  username: string;
  baselineSkills: SkillVector;
  skillVector: SkillVector;
  adaptiveChallengeLevel: number; // 1.0 (Novice) to 10.0 (Master)
  totalSessions: number;
  lastSessionTimestamp: number;
  averageLatencyMs: number;
  errorRate: number; // 0.0 to 1.0
  totalInteractions: number;
  failedInteractions: number;
}

export interface SessionResumptionState {
  activeRoute: string;
  scrollOffset: { x: number; y: number };
  activeComponentId?: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile_v1',
  SESSION_RESUMPTION: 'session_resumption_v1',
} as const;

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user',
  username: 'Explorer',
  baselineSkills: {
    reactionSpeed: 0.5,
    patternRecall: 0.5,
    cognitiveLoad: 0.5,
  },
  skillVector: {
    reactionSpeed: 0.5,
    patternRecall: 0.5,
    cognitiveLoad: 0.5,
  },
  adaptiveChallengeLevel: 3.0,
  totalSessions: 1,
  lastSessionTimestamp: Date.now(),
  averageLatencyMs: 450,
  errorRate: 0.05,
  totalInteractions: 0,
  failedInteractions: 0,
};

/**
 * Calculates adaptive difficulty level based on behavioral latency and error performance.
 * - Low errors (<10%) and fast response (<400ms) increases challenge.
 * - High errors (>30%) or slow response (>1200ms) drops challenge to prevent frustration.
 */
export function calculateAdaptiveChallengeLevel(
  currentLevel: number,
  errorRate: number,
  averageLatencyMs: number
): number {
  let adjustment = 0;

  if (errorRate < 0.10 && averageLatencyMs < 450) {
    adjustment += 0.25;
  } else if (errorRate > 0.30 || averageLatencyMs > 1100) {
    adjustment -= 0.35;
  } else if (errorRate > 0.50) {
    adjustment -= 0.70;
  }

  const nextLevel = currentLevel + adjustment;
  // Clamp challenge between 1.0 (simplest) and 10.0 (maximum mastery)
  return Math.min(10.0, Math.max(1.0, Math.round(nextLevel * 100) / 100));
}

export const UserProfileStore = {
  /**
   * Retrieves active user profile synchronously.
   */
  getProfile(): UserProfile {
    const raw = storage.getString(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      storage.set(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return { ...DEFAULT_PROFILE };
    }
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  },

  /**
   * Updates partial profile fields and persists synchronously.
   */
  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      lastSessionTimestamp: Date.now(),
    };
    storage.set(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    return updated;
  },

  /**
   * Records interaction latency and outcome, dynamically updating behavioral metrics and challenge level.
   */
  recordInteraction(latencyMs: number, success: boolean): UserProfile {
    const current = this.getProfile();
    const totalInteractions = current.totalInteractions + 1;
    const failedInteractions = current.failedInteractions + (success ? 0 : 1);
    const errorRate = failedInteractions / totalInteractions;

    // Moving average calculation for latency
    const averageLatencyMs = Math.round(
      (current.averageLatencyMs * current.totalInteractions + latencyMs) /
        totalInteractions
    );

    const adaptiveChallengeLevel = calculateAdaptiveChallengeLevel(
      current.adaptiveChallengeLevel,
      errorRate,
      averageLatencyMs
    );

    return this.updateProfile({
      totalInteractions,
      failedInteractions,
      errorRate,
      averageLatencyMs,
      adaptiveChallengeLevel,
    });
  },

  /**
   * Updates specific skill vector dimension.
   */
  updateSkillVector(dimension: string, score: number): UserProfile {
    const current = this.getProfile();
    const clampedScore = Math.min(1.0, Math.max(0.0, score));
    const skillVector = {
      ...current.skillVector,
      [dimension]: clampedScore,
    };
    return this.updateProfile({ skillVector });
  },

  /**
   * Serializes active screen and scroll state for instant session resumption.
   */
  saveSessionResumption(
    activeRoute: string,
    scrollOffset: { x: number; y: number },
    activeComponentId?: string
  ): void {
    const state: SessionResumptionState = {
      activeRoute,
      scrollOffset,
      activeComponentId,
      timestamp: Date.now(),
    };
    storage.set(STORAGE_KEYS.SESSION_RESUMPTION, JSON.stringify(state));
  },

  /**
   * Restores active screen state upon app relaunch.
   */
  getSessionResumption(): SessionResumptionState | null {
    const raw = storage.getString(STORAGE_KEYS.SESSION_RESUMPTION);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionResumptionState;
    } catch {
      return null;
    }
  },

  /**
   * Clears saved session resumption state.
   */
  clearSessionResumption(): void {
    storage.delete(STORAGE_KEYS.SESSION_RESUMPTION);
  },

  /**
   * Resets profile back to pristine baseline.
   */
  resetProfile(): void {
    storage.delete(STORAGE_KEYS.USER_PROFILE);
    storage.delete(STORAGE_KEYS.SESSION_RESUMPTION);
  },
};
