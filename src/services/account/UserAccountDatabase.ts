/**
 * EARPA USER ACCOUNT & PERSISTENT TELEMETRY DATABASE
 * Complete multi-account management, session logging, granular note relationship tracking,
 * response latency timing, daily practice time tracking, and pedagogical insight derivation.
 */

import { ScaleDegree } from '../audio/types';
import { NativeHarpTuning, TuningMatrixEngine } from '../curriculum/TuningMatrixEngine';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarPhoto?: string;
  avatarIcon: string; // e.g. 'lyre', 'flame', 'torc', 'crown', 'tree'
  avatarColor: string;
  experienceLevel: 'Beginner Harper' | 'Apprentice Bard' | 'Journeyman Minstrel' | 'Master Harper';
  createdTimestamp: number;
  lastActiveTimestamp: number;
  totalPracticeTimeSeconds: number;
  totalSessionsPlayed: number;
  totalTrialsAttempted: number;
  totalCorrectTrials?: number;
  overallAccuracyPct: number;
  highestStreak: number;
  activeTuning: NativeHarpTuning;
  leverStage?: number;
  onboardingComplete?: boolean;
  progress?: {single: number; melody: number};
  notationPreference?: 'numbers' | 'solfege' | 'notes';
}

export interface TrialLogEntry {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: number;
  levelId: string;
  track: 'single' | 'melody' | 'levers';
  tonicKey: string;
  stimulusDegree: string;
  guessedDegree: string;
  isCorrect: boolean;
  latencyMs: number; // exact response time in milliseconds
  roundIndex: number;
}

export interface SessionLogEntry {
  trialSessionId?: string;
  id: string;
  userId: string;
  timestamp: number;
  levelId: string;
  levelCode: string;
  track: 'single' | 'melody' | 'levers';
  durationSeconds: number;
  totalRounds: number;
  correctRounds: number;
  accuracyPct: number;
  passed: boolean;
  averageLatencyMs: number;
  fastestLatencyMs: number;
}

export interface DailyPracticeRecord {
  dateKey: string; // 'YYYY-MM-DD'
  practiceSeconds: number;
  sessionsCount: number;
  trialsCount: number;
  correctCount: number;
  accuracyPct: number;
}

export interface DegreeRelationshipStats {
  degree: string;
  solfege: string;
  totalPresentations: number;
  totalCorrect: number;
  accuracyPct: number;
  averageLatencySeconds: number;
  fastestLatencySeconds: number;
  confusionDistribution: Record<string, number>; // other degrees guessed when this degree was presented
  primaryConfusion?: {
    confusedWithDegree: string;
    confusionCount: number;
    confusionPct: number;
    musicalExplanation: string;
  };
}

export interface UserPedagogicalInsights {
  overallAccuracyPct: number;
  totalPracticeTimeFormatted: string;
  todayPracticeTimeFormatted: string;
  currentStreakDays: number;
  strongestDegrees: DegreeRelationshipStats[];
  weakestDegrees: DegreeRelationshipStats[];
  fastestReflexDegree: DegreeRelationshipStats | null;
  primaryConfusionPair: {
    stimulus: string;
    confusedWith: string;
    percentage: number;
    explanation: string;
    pedagogicalPrescription: string;
  } | null;
  keyInsights: string[];
  recommendedAction: string;
}

const STORAGE_KEY_PROFILES = 'earpa_user_profiles_v1';
const STORAGE_KEY_ACTIVE_USER = 'earpa_active_user_id_v1';
const STORAGE_KEY_TRIALS = 'earpa_trials_log_v1_';
const STORAGE_KEY_SESSIONS = 'earpa_sessions_log_v1_';
const STORAGE_KEY_DAILY = 'earpa_daily_practice_v1_';

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default_bard',
  username: 'celtic_harper',
  displayName: 'Bardic Harper',
  avatarIcon: 'lyre',
  avatarColor: '#10b981',
  experienceLevel: 'Apprentice Bard',
  createdTimestamp: Date.now() - 86400000 * 7, // 7 days ago
  lastActiveTimestamp: Date.now(),
  totalPracticeTimeSeconds: 0, // ~23 minutes
  totalSessionsPlayed: 0,
  totalTrialsAttempted: 0,
  overallAccuracyPct: 0,
  highestStreak: 0,
  activeTuning: 'Eb_Major_Native',
};

export class UserAccountDatabase {
  private static instance: UserAccountDatabase | null = null;

  private profiles: Map<string, UserProfile> = new Map();
  private activeUserId: string = 'usr_default_bard';
  private sessionStartTime: number = Date.now();
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadFromStorage();
    TuningMatrixEngine.setActiveTuning(this.getActiveProfile().activeTuning);
  }

  public static getInstance(): UserAccountDatabase {
    if (!UserAccountDatabase.instance) {
      UserAccountDatabase.instance = new UserAccountDatabase();
    }
    return UserAccountDatabase.instance;
  }

  /**
   * Subscribe to database / profile state updates.
   */
  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.warn('Listener error in UserAccountDatabase:', err);
      }
    });
  }

  // --------------------------------------------------------------------------
  // ACCOUNT & PROFILE MANAGEMENT
  // --------------------------------------------------------------------------

  public getActiveProfile(): UserProfile {
    const profile = this.profiles.get(this.activeUserId);
    if (profile) return profile;
    return DEFAULT_PROFILE;
  }

  public getAllProfiles(): UserProfile[] {
    return Array.from(this.profiles.values());
  }

  public createAccount(
    paramsOrUsername:
      | string
      | {
          username: string;
          displayName: string;
          avatarIcon?: string;
          avatarColor?: string;
          experienceLevel?: UserProfile['experienceLevel'];
          activeTuning?: NativeHarpTuning;
        },
    displayName?: string,
    experienceLevel?: UserProfile['experienceLevel'],
    avatarIcon?: string,
    avatarColor?: string
  ): UserProfile {
    let rawUsername = '';
    let rawDisplayName = 'New Harper';
    let expLevel: UserProfile['experienceLevel'] = 'Beginner Harper';
    let icon = 'lyre';
    let color = '#38bdf8';
    let tuning: NativeHarpTuning = 'Eb_Major_Native';

    if (typeof paramsOrUsername === 'object' && paramsOrUsername !== null) {
      rawUsername = paramsOrUsername.username || '';
      rawDisplayName = paramsOrUsername.displayName || 'New Harper';
      expLevel = paramsOrUsername.experienceLevel || expLevel;
      icon = paramsOrUsername.avatarIcon || icon;
      color = paramsOrUsername.avatarColor || color;
      tuning = paramsOrUsername.activeTuning || tuning;
    } else {
      rawUsername = String(paramsOrUsername || '');
      rawDisplayName = displayName || 'New Harper';
      expLevel = experienceLevel || expLevel;
      icon = avatarIcon || icon;
      color = avatarColor || color;
    }

    const cleanUsername = rawUsername.trim().toLowerCase().replace(/\s+/g, '_') || `harper_${Date.now()}`;
    const cleanDisplayName = rawDisplayName.trim() || 'New Harper';

    // If profile with this username already exists, switch to it and return
    const existing = Array.from(this.profiles.values()).find((p) => p.username === cleanUsername);
    if (existing) {
      this.activeUserId = existing.id;
      this.persistActiveUserId();
      TuningMatrixEngine.setActiveTuning(this.getActiveProfile().activeTuning);
      this.notify();
      return existing;
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProfile: UserProfile = {
      id,
      username: cleanUsername,
      displayName: cleanDisplayName,
      avatarIcon: icon,
      avatarColor: color,
      experienceLevel: expLevel,
      createdTimestamp: Date.now(),
      lastActiveTimestamp: Date.now(),
      totalPracticeTimeSeconds: 0,
      totalSessionsPlayed: 0,
      totalTrialsAttempted: 0,
      overallAccuracyPct: 0,
      totalCorrectTrials: 0,
      highestStreak: 0,
      activeTuning: tuning,
    };

    TuningMatrixEngine.setActiveTuning(tuning);
    this.profiles.set(id, newProfile);
    this.activeUserId = id;
    this.persistActiveUserId();
    this.persistProfiles();
    this.notify();
    return newProfile;
  }

  public switchAccount(userId: string): boolean {
    if (this.profiles.has(userId)) {
      this.activeUserId = userId;
      this.persistActiveUserId();
      TuningMatrixEngine.setActiveTuning(this.getActiveProfile().activeTuning);
      this.notify();
      return true;
    }
    return false;
  }

  public updateActiveProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getActiveProfile();
    const updated: UserProfile = {
      ...current,
      ...updates,
      lastActiveTimestamp: Date.now(),
    };
    this.profiles.set(this.activeUserId, updated);
    this.persistProfiles();
    this.notify();
    return updated;
  }

  public deleteAccount(userId: string): boolean {
    if (this.profiles.size <= 1) return false; // Prevent deleting the last account
    this.profiles.delete(userId);
    if (this.activeUserId === userId) {
      const remaining = Array.from(this.profiles.keys());
      this.activeUserId = remaining[0];
      this.persistActiveUserId();
      TuningMatrixEngine.setActiveTuning(this.getActiveProfile().activeTuning);
    }
    this.persistProfiles();
    this.notify();
    return true;
  }

  // --------------------------------------------------------------------------
  // TELEMETRY & LOGGING ENGINE
  // --------------------------------------------------------------------------

  public startPracticeSessionTimer(): void {
    this.sessionStartTime = Date.now();
  }

  public recordTrial(trial: Omit<TrialLogEntry, 'id' | 'userId' | 'timestamp'>): TrialLogEntry {
    const fullTrial: TrialLogEntry = {
      id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.activeUserId,
      timestamp: Date.now(),
      ...trial,
    };

    // 1. Append to trials log
    const trials = this.getUserTrials(this.activeUserId);
    trials.push(fullTrial);
    // Keep max 5,000 trials per user to protect local storage budgets
    if (trials.length > 5000) {
      trials.splice(0, trials.length - 5000);
    }
    this.saveUserTrials(this.activeUserId, trials);

    // 2. Update daily practice log
    this.recordDailyProgress(trial.isCorrect, trial.latencyMs);

    // 3. Update profile aggregate metrics
    const user = this.getActiveProfile();
    const totalTrials = user.totalTrialsAttempted + 1;
    const previousCorrect = user.totalCorrectTrials ?? Math.round((user.overallAccuracyPct / 100) * user.totalTrialsAttempted);
    const newCorrect = previousCorrect + (trial.isCorrect ? 1 : 0);
    const newAccuracy = Math.round((newCorrect / totalTrials) * 100);

    this.updateActiveProfile({
      totalTrialsAttempted: totalTrials,
      totalCorrectTrials: newCorrect,
      overallAccuracyPct: newAccuracy,
    });

    return fullTrial;
  }

  public recordSession(session: Omit<SessionLogEntry, 'id' | 'userId' | 'timestamp'>): SessionLogEntry {
    const fullSession: SessionLogEntry = {
      id: `ses_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.activeUserId,
      timestamp: Date.now(),
      ...session,
    };

    const sessions = this.getUserSessions(this.activeUserId);
    sessions.push(fullSession);
    this.saveUserSessions(this.activeUserId, sessions);

    this.addSessionTime(session.durationSeconds);
    // Update profile aggregates
    const user = this.getActiveProfile();
    this.updateActiveProfile({
      ...(session.passed && session.track !== 'levers' ? {progress: {
        single: user.progress?.single || 1, melody: user.progress?.melody || 1,
        [session.track]: Math.max(user.progress?.[session.track] || 1, Number(session.levelId.match(/(\d+)$/)?.[1] || 0) + 1)
      }} : {}),
      totalSessionsPlayed: user.totalSessionsPlayed + 1,

    });

    return fullSession;
  }

  private recordDailyProgress(isCorrect: boolean, latencyMs: number): void {
    const dateKey = this.getTodayDateKey();
    const dailyMap = this.getUserDailyRecords(this.activeUserId);
    const record = dailyMap[dateKey] || {
      dateKey,
      practiceSeconds: 0,
      sessionsCount: 0,
      trialsCount: 0,
      correctCount: 0,
      accuracyPct: 100,
    };

    record.trialsCount += 1;
    if (isCorrect) record.correctCount += 1;

    record.accuracyPct = Math.round((record.correctCount / record.trialsCount) * 100);

    dailyMap[dateKey] = record;
    this.saveUserDailyRecords(this.activeUserId, dailyMap);
  }

  public addSessionTime(seconds: number): void {
    const dateKey = this.getTodayDateKey();
    const dailyMap = this.getUserDailyRecords(this.activeUserId);
    const record = dailyMap[dateKey] || {
      dateKey,
      practiceSeconds: 0,
      sessionsCount: 0,
      trialsCount: 0,
      correctCount: 0,
      accuracyPct: 100,
    };

    record.practiceSeconds += seconds;
    record.sessionsCount += 1;
    dailyMap[dateKey] = record;
    this.saveUserDailyRecords(this.activeUserId, dailyMap);

    const user = this.getActiveProfile();
    this.updateActiveProfile({
      totalPracticeTimeSeconds: user.totalPracticeTimeSeconds + seconds,
    });
  }

  // --------------------------------------------------------------------------
  // INSIGHT DERIVATION & DEGREE RELATIONSHIP ANALYTICS
  // --------------------------------------------------------------------------

  /**
   * Computes exact accuracy percentage, average latency in seconds, and confusion
   * distribution for every relationship between notes and scale degrees.
   */
  public getDegreeRelationshipStats(sessionId?: string): Record<string, DegreeRelationshipStats> {
    const trials = this.getUserTrials(this.activeUserId).filter(t => !sessionId || t.sessionId === sessionId);
    const solfegeMap: Record<string, string> = {
      '1': 'Do (Tonic)',
      'b2': 'Ra (Flat 2)',
      '2': 'Re (Supertonic)',
      'b3': 'Me (Minor 3)',
      '3': 'Mi (Mediant)',
      '4': 'Fa (Subdominant)',
      '#4': 'Fi (Tritone)',
      '5': 'Sol (Dominant)',
      'b6': 'Le (Minor 6)',
      '6': 'La (Submediant)',
      'b7': 'Te (Subtonic)',
      '7': 'Ti (Leading Tone)',
      '8': 'Do (Octave)',
    };

    const explanationTemplates: Record<string, Record<string, string>> = {
      '4': {
        '3': 'Tendency to mistake the tension of 4 for the acoustic rest of 3 due to strong downward magnetic pull.',
        '5': 'Mistaking 4 for 5 because both frame the tonic triad.',
      },
      '7': {
        '8': 'Leading tone 7 has intense upward gravity toward 8, often causing premature resolution assumption.',
        '6': 'Confusing the submediant 6 warmth with leading tone tension.',
      },
      '2': {
        '1': 'Supertonic 2 sits one step above the root and frequently resolves downward.',
        '3': 'Mistaking 2 for 3 when listening for melodic steps.',
      },
      '6': {
        '5': 'Submediant 6 sits right above the fifth pillar and can be drawn into its acoustic shadow.',
      },
    };

    const statsMap: Record<string, DegreeRelationshipStats> = {};

    // Initialize all diatonic degrees 1 to 8
    ['1', '2', '3', '4', '5', '6', '7', '8'].forEach((deg) => {
      statsMap[deg] = {
        degree: deg,
        solfege: solfegeMap[deg] || deg,
        totalPresentations: 0,
        totalCorrect: 0,
        accuracyPct: 100,
        averageLatencySeconds: 0,
        fastestLatencySeconds: 999,
        confusionDistribution: {},
      };
    });

    const latenciesByDegree: Record<string, number[]> = {};

    trials.forEach((t) => {
      const stim = t.stimulusDegree;
      if (!statsMap[stim]) {
        statsMap[stim] = {
          degree: stim,
          solfege: solfegeMap[stim] || stim,
          totalPresentations: 0,
          totalCorrect: 0,
          accuracyPct: 100,
          averageLatencySeconds: 0,
          fastestLatencySeconds: 999,
          confusionDistribution: {},
        };
      }

      const entry = statsMap[stim];
      entry.totalPresentations += 1;
      if (t.isCorrect) {
        entry.totalCorrect += 1;
      } else {
        const guess = t.guessedDegree;
        entry.confusionDistribution[guess] = (entry.confusionDistribution[guess] || 0) + 1;
      }

      if (!latenciesByDegree[stim]) latenciesByDegree[stim] = [];
      const sec = t.latencyMs / 1000;
      latenciesByDegree[stim].push(sec);
      if (sec < entry.fastestLatencySeconds) {
        entry.fastestLatencySeconds = Math.round(sec * 100) / 100;
      }
    });

    // Finalize percentage calculations and primary confusions
    Object.keys(statsMap).forEach((deg) => {
      const item = statsMap[deg];
      if (item.totalPresentations > 0) {
        item.accuracyPct = Math.round((item.totalCorrect / item.totalPresentations) * 100);
        const lats = latenciesByDegree[deg] || [];
        const avg = lats.length > 0 ? lats.reduce((a, b) => a + b, 0) / lats.length : 1.0;
        item.averageLatencySeconds = Math.round(avg * 100) / 100;
        if (item.fastestLatencySeconds === 999) item.fastestLatencySeconds = item.averageLatencySeconds;

        // Find primary confusion
        let topConfused = '';
        let topCount = 0;
        Object.entries(item.confusionDistribution).forEach(([otherDeg, count]) => {
          if (count > topCount) {
            topCount = count;
            topConfused = otherDeg;
          }
        });

        if (topCount > 0) {
          const totalErrors = item.totalPresentations - item.totalCorrect;
          const confPct = Math.round((topCount / totalErrors) * 100);
          const customExplanation =
            explanationTemplates[deg]?.[topConfused] ||
            `Frequent confusion between ${item.solfege} and Degree ${topConfused}.`;

          item.primaryConfusion = {
            confusedWithDegree: topConfused,
            confusionCount: topCount,
            confusionPct: confPct,
            musicalExplanation: customExplanation,
          };
        }
      } else {
        // Defaults for unpracticed degrees
        item.accuracyPct = 100;
        item.averageLatencySeconds = 1.2;
        item.fastestLatencySeconds = 0.8;
      }
    });

    return statsMap;
  }

  public getDegreeRelationshipStatsList(): DegreeRelationshipStats[] {
    const statsMap = this.getDegreeRelationshipStats();
    return Object.values(statsMap);
  }

  /**
   * Derives personalized pedagogical insights, what they did great at,
   * what they need improvement on, and actionable earsmith prescriptions.
   */
  public getPedagogicalInsights(sessionId?: string): UserPedagogicalInsights {
    const statsMap = this.getDegreeRelationshipStats(sessionId);
    const statsList = Object.values(statsMap).filter((s) => s.totalPresentations > 0);

    const sortedByAccuracy = [...statsList].sort((a, b) => b.accuracyPct - a.accuracyPct);
    const sortedBySpeed = [...statsList].sort((a, b) => a.averageLatencySeconds - b.averageLatencySeconds);

    const strongest = sortedByAccuracy.slice(0, 3);
    const weakest = [...sortedByAccuracy].reverse().slice(0, 3);
    const fastest = sortedBySpeed[0] || null;

    // Find overall worst confusion pair
    let worstStim = '';
    let worstConf = '';
    let highestCount = 0;
    let worstPct = 0;
    let explanation = '';

    statsList.forEach((st) => {
      if (st.primaryConfusion && st.primaryConfusion.confusionCount > highestCount) {
        highestCount = st.primaryConfusion.confusionCount;
        worstStim = st.degree;
        worstConf = st.primaryConfusion.confusedWithDegree;
        worstPct = st.primaryConfusion.confusionPct;
        explanation = st.primaryConfusion.musicalExplanation;
      }
    });

    const confusionPair =
      highestCount > 0
        ? {
            stimulus: worstStim,
            confusedWith: worstConf,
            percentage: worstPct,
            explanation,
            pedagogicalPrescription: `When you hear Degree ${worstStim}, pause for 400ms and feel whether it seeks rest (Tonic) or leans forward into ${worstConf}. Do not climb interval steps; listen for tonal gravity.`,
          }
        : null;

    const user = this.getActiveProfile();
    const todayRecord = this.getTodayRecord();
    const todaySec = todayRecord ? todayRecord.practiceSeconds : 0;

    const keyInsights: string[] = [];
    if (strongest.length > 0) {
      keyInsights.push(
        `Rock-solid on Degree ${strongest.map((s) => s.degree).join(' & ')} (${strongest[0].accuracyPct}% accuracy)`
      );
    }
    if (fastest) {
      keyInsights.push(
        `Fastest reflex on Degree ${fastest.degree}: ${fastest.averageLatencySeconds}s average response time`
      );
    }
    if (weakest.length > 0 && weakest[0].accuracyPct < 90) {
      keyInsights.push(
        `Degree ${weakest[0].degree} needs polish (${weakest[0].accuracyPct}% accuracy) • ${weakest[0].primaryConfusion?.musicalExplanation || 'Listening practice recommended'}`
      );
    }

    const recommendedAction =
      weakest.length > 0 && weakest[0].accuracyPct < 90
        ? `Practice Module featuring Degree ${weakest[0].degree} with Stepwise Downward Resolution drills.`
        : 'Continue advancing along the Continuous Treadmill Roadmap to unlock higher octave ranges!';

    return {
      overallAccuracyPct: user.overallAccuracyPct,
      totalPracticeTimeFormatted: this.formatSeconds(user.totalPracticeTimeSeconds),
      todayPracticeTimeFormatted: this.formatSeconds(todaySec),
      currentStreakDays: this.calculateCurrentStreakDays(),
      strongestDegrees: strongest,
      weakestDegrees: weakest,
      fastestReflexDegree: fastest,
      primaryConfusionPair: confusionPair,
      keyInsights,
      recommendedAction,
    };
  }

  public getDailyPracticeHistory(daysCount: number = 7): DailyPracticeRecord[] {
    const dailyMap = this.getUserDailyRecords(this.activeUserId);
    const result: DailyPracticeRecord[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const record = dailyMap[key] || {
        dateKey: key,
        practiceSeconds: 0,
        sessionsCount: 0,
        trialsCount: 0,
        correctCount: 0,
        accuracyPct: 0,
      };
      result.push(record);
    }

    return result;
  }

  public getTodayPracticeSeconds(): number {
    const record = this.getTodayRecord();
    return record ? record.practiceSeconds : 0;
  }

  // --------------------------------------------------------------------------
  // HELPERS & STORAGE WRAPPERS
  // --------------------------------------------------------------------------

  private getTodayDateKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getTodayRecord(): DailyPracticeRecord | undefined {
    const dailyMap = this.getUserDailyRecords(this.activeUserId);
    return dailyMap[this.getTodayDateKey()];
  }

  private calculateCurrentStreakDays(): number {
    const dailyMap = this.getUserDailyRecords(this.activeUserId);
    let streak = 0;
    const now = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const record = dailyMap[key];
      if (record && record.trialsCount > 0) {
        streak += 1;
      } else if (i === 0) {
        // Today might not have trials yet; continue checking yesterday
        continue;
      } else {
        break;
      }
    }
    return streak;
  }

  public formatSeconds(totalSec: number): string {
    if (totalSec < 60) return `${totalSec}s`;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }

  public getUserTrials(userId: string): TrialLogEntry[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(`${STORAGE_KEY_TRIALS}${userId}`);
        if (data) return JSON.parse(data);
      }
    } catch {}
    return [];
  }

  private saveUserTrials(userId: string, trials: TrialLogEntry[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${STORAGE_KEY_TRIALS}${userId}`, JSON.stringify(trials));
      }
    } catch {}
  }

  private getUserSessions(userId: string): SessionLogEntry[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(`${STORAGE_KEY_SESSIONS}${userId}`);
        if (data) return JSON.parse(data);
      }
    } catch {}
    return [];
  }

  private saveUserSessions(userId: string, sessions: SessionLogEntry[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${STORAGE_KEY_SESSIONS}${userId}`, JSON.stringify(sessions));
      }
    } catch {}
  }

  private getUserDailyRecords(userId: string): Record<string, DailyPracticeRecord> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(`${STORAGE_KEY_DAILY}${userId}`);
        if (data) return JSON.parse(data);
      }
    } catch {}
    return {};
  }

  private saveUserDailyRecords(userId: string, dailyMap: Record<string, DailyPracticeRecord>): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${STORAGE_KEY_DAILY}${userId}`, JSON.stringify(dailyMap));
      }
    } catch {}
  }

  public getCloudSnapshot() {
    const profile = this.getActiveProfile();
    return {profile, records: [
      ...this.getUserTrials(profile.id).map(payload => ({kind:'trial',payload})),
      ...this.getUserSessions(profile.id).map(payload => ({kind:'session',payload}))
    ]};
  }

  public openCloudProfile(id: string, remote: UserProfile | undefined, records: Array<{kind:string;payload:any}>) {
    const existing = this.profiles.get(id);
    const profile: UserProfile = existing || {...DEFAULT_PROFILE, ...remote, id, username:remote?.username || 'harper',displayName:remote?.displayName || 'My Harper',onboardingComplete:true};
    this.profiles.set(id,profile); this.activeUserId=id;
    const merge = (local:any[], remoteRows:any[]) => [...new Map([...remoteRows,...local].map(r=>[r.id,{...r,userId:id}])).values()];
    const trials=merge(this.getUserTrials(id),records.filter(r=>r.kind==='trial').map(r=>r.payload));
    const sessions=merge(this.getUserSessions(id),records.filter(r=>r.kind==='session').map(r=>r.payload));
    this.saveUserTrials(id,trials);this.saveUserSessions(id,sessions);
    const daily: Record<string,DailyPracticeRecord> = {};
    for(const t of trials){const dateKey=new Date(t.timestamp).toLocaleDateString('en-CA');const d=daily[dateKey] ||= {dateKey,practiceSeconds:0,sessionsCount:0,trialsCount:0,correctCount:0,accuracyPct:0};d.trialsCount++;if(t.isCorrect)d.correctCount++;d.accuracyPct=Math.round(d.correctCount/d.trialsCount*100);}
    for(const t of sessions){const dateKey=new Date(t.timestamp).toLocaleDateString('en-CA');const d=daily[dateKey] ||= {dateKey,practiceSeconds:0,sessionsCount:0,trialsCount:0,correctCount:0,accuracyPct:0};d.sessionsCount++;d.practiceSeconds+=t.durationSeconds;}
    this.saveUserDailyRecords(id,daily);
    this.updateActiveProfile({totalTrialsAttempted:trials.length,totalSessionsPlayed:sessions.length,totalPracticeTimeSeconds:sessions.reduce((n,s)=>n+s.durationSeconds,0),overallAccuracyPct:trials.length?Math.round(trials.filter(t=>t.isCorrect).length/trials.length*100):0});
    TuningMatrixEngine.setActiveTuning(profile.activeTuning);
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const profilesData = localStorage.getItem(STORAGE_KEY_PROFILES);
        if (profilesData) {
          const list: UserProfile[] = JSON.parse(profilesData);
          list.forEach((p) => this.profiles.set(p.id, p));
        }

        const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
        if (activeId && this.profiles.has(activeId)) {
          this.activeUserId = activeId;
        }
      }
    } catch {}

    // Ensure default profile exists if database empty
    if (this.profiles.size === 0) {
      this.profiles.set(DEFAULT_PROFILE.id, DEFAULT_PROFILE);
      this.activeUserId = DEFAULT_PROFILE.id;
      this.persistProfiles();
    }
  }

  private persistProfiles(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = Array.from(this.profiles.values());
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(list));
      }
    } catch {}
    this.persistActiveUserId();
  }

  private persistActiveUserId(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_USER, this.activeUserId);
      }
    } catch {}
  }
}

if (typeof window !== 'undefined') {
  (window as any).UserAccountDatabase = UserAccountDatabase;
}
