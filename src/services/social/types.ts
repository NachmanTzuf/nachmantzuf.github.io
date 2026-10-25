/**
 * EARPA SOCIAL CIRCLES & BARDIC FELLOWSHIP TYPES
 * Lightweight friend connections, activity feeds, and weekly dedication leaderboards.
 */

import { TimberFinishId, SoundboardRosetteId } from '../gamification/types';

export interface BardicFriend {
  friendId: string;
  username: string;
  avatarIcon: string;
  bardicLevel: number;
  currentStreak: number;
  equippedTimber: TimberFinishId;
  equippedRosette: SoundboardRosetteId;
  weeklyPracticeMinutes: number;
  lastActiveTimestamp: number;
}

export type SocialEventType =
  | 'NODE_COMPLETED'
  | 'TAG_UNLOCKED'
  | 'STREAK_MILESTONE'
  | 'GARAGE_EQUIPPED';

export interface ActivityFeedItem {
  id: string;
  friendId: string;
  friendName: string;
  eventType: SocialEventType;
  title: string;
  description: string;
  timestamp: number;
  cheersCount: number;
  hasCheered: boolean;
}

export interface WeeklyDedicationEntry {
  rank: number;
  friendId: string;
  friendName: string;
  practiceDaysThisWeek: number; // 0 to 7
  totalTrialsThisWeek: number;
  currentStreak: number;
  bardicLevel: number;
  isCurrentUser: boolean;
}
