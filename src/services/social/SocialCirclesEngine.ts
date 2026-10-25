/**
 * EARPA SOCIAL CIRCLES & BARDIC FELLOWSHIP ENGINE
 * Lightweight friend connections, activity feeds, and weekly dedication leaderboards.
 * Fosters collaborative encouragement and consistency rather than toxic competition.
 */

import {
  BardicFriend,
  ActivityFeedItem,
  WeeklyDedicationEntry,
} from './types';

export class SocialCirclesEngine {
  private friends: Map<string, BardicFriend> = new Map();
  private activityFeed: ActivityFeedItem[] = [];

  constructor() {
    this.initializeFellowship();
  }

  private initializeFellowship(): void {
    const defaultFriends: BardicFriend[] = [
      {
        friendId: 'fr_cathal',
        username: 'Cathal of Tara',
        avatarIcon: 'Music',
        bardicLevel: 12,
        currentStreak: 21,
        equippedTimber: 'connemara_bogoak',
        equippedRosette: 'triskele_tara',
        weeklyPracticeMinutes: 145,
        lastActiveTimestamp: Date.now() - 3600 * 1000 * 2, // 2 hours ago
      },
      {
        friendId: 'fr_fiona',
        username: 'Fiona of Clare',
        avatarIcon: 'Compass',
        bardicLevel: 8,
        currentStreak: 14,
        equippedTimber: 'claddagh_walnut',
        equippedRosette: 'knotwork_vine',
        weeklyPracticeMinutes: 98,
        lastActiveTimestamp: Date.now() - 3600 * 1000 * 5, // 5 hours ago
      },
      {
        friendId: 'fr_liam',
        username: 'Liam the Piper',
        avatarIcon: 'Wind',
        bardicLevel: 6,
        currentStreak: 7,
        equippedTimber: 'curly_maple',
        equippedRosette: 'triskele_tara',
        weeklyPracticeMinutes: 65,
        lastActiveTimestamp: Date.now() - 3600 * 1000 * 18,
      },
      {
        friendId: 'fr_siobhan',
        username: 'Siobhan of Skye',
        avatarIcon: 'Crown',
        bardicLevel: 15,
        currentStreak: 30,
        equippedTimber: 'skye_yew',
        equippedRosette: 'high_king_sunburst',
        weeklyPracticeMinutes: 210,
        lastActiveTimestamp: Date.now() - 3600 * 1000 * 1,
      },
    ];

    defaultFriends.forEach((f) => this.friends.set(f.friendId, f));

    this.activityFeed = [
      {
        id: 'act_01',
        friendId: 'fr_siobhan',
        friendName: 'Siobhan of Skye',
        eventType: 'TAG_UNLOCKED',
        title: 'Master Carolan Unlocked',
        description: 'Unlocked the prestigious Master Carolan Hub Tag with 15 badges and 92% overall accuracy.',
        timestamp: Date.now() - 3600 * 1000 * 3,
        cheersCount: 6,
        hasCheered: false,
      },
      {
        id: 'act_02',
        friendId: 'fr_cathal',
        friendName: 'Cathal of Tara',
        eventType: 'STREAK_MILESTONE',
        title: '21 Day Bardic Streak',
        description: 'Completed three full weeks of consecutive daily practice at the harp.',
        timestamp: Date.now() - 3600 * 1000 * 12,
        cheersCount: 8,
        hasCheered: true,
      },
      {
        id: 'act_03',
        friendId: 'fr_fiona',
        friendName: 'Fiona of Clare',
        eventType: 'NODE_COMPLETED',
        title: 'Dorian Fire Cleared',
        description: 'Passed Node 5.2 in E Dorian with 3 stars and 96% accuracy.',
        timestamp: Date.now() - 3600 * 1000 * 20,
        cheersCount: 4,
        hasCheered: false,
      },
    ];
  }

  public getFriends(): BardicFriend[] {
    return Array.from(this.friends.values());
  }

  public getActivityFeed(): ActivityFeedItem[] {
    return [...this.activityFeed];
  }

  public cheerActivityItem(activityId: string): boolean {
    const item = this.activityFeed.find((a) => a.id === activityId);
    if (item && !item.hasCheered) {
      item.cheersCount += 1;
      item.hasCheered = true;
      return true;
    }
    return false;
  }

  public addFriend(username: string): BardicFriend {
    const friendId = `fr_${Date.now()}`;
    const newFriend: BardicFriend = {
      friendId,
      username,
      avatarIcon: 'Star',
      bardicLevel: 1,
      currentStreak: 1,
      equippedTimber: 'curly_maple',
      equippedRosette: 'triskele_tara',
      weeklyPracticeMinutes: 0,
      lastActiveTimestamp: Date.now(),
    };

    this.friends.set(friendId, newFriend);
    return newFriend;
  }

  public getWeeklyLeaderboard(currentUserStreak: number, currentUserTrials: number): WeeklyDedicationEntry[] {
    const entries: WeeklyDedicationEntry[] = [
      {
        rank: 1,
        friendId: 'user_current',
        friendName: 'You (The Harper)',
        practiceDaysThisWeek: Math.min(7, currentUserStreak),
        totalTrialsThisWeek: currentUserTrials,
        currentStreak: currentUserStreak,
        bardicLevel: Math.floor(Math.sqrt(currentUserTrials * 10 / 50)) + 1,
        isCurrentUser: true,
      },
      ...this.getFriends().map((f) => ({
        rank: 0,
        friendId: f.friendId,
        friendName: f.username,
        practiceDaysThisWeek: Math.min(7, f.currentStreak),
        totalTrialsThisWeek: Math.round(f.weeklyPracticeMinutes * 2.2),
        currentStreak: f.currentStreak,
        bardicLevel: f.bardicLevel,
        isCurrentUser: false,
      })),
    ];

    // Sort primarily by consistency (practiceDaysThisWeek), secondarily by totalTrialsThisWeek
    entries.sort((a, b) => {
      if (b.practiceDaysThisWeek !== a.practiceDaysThisWeek) {
        return b.practiceDaysThisWeek - a.practiceDaysThisWeek;
      }
      return b.totalTrialsThisWeek - a.totalTrialsThisWeek;
    });

    // Re-assign ranks 1 to N
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }
}
