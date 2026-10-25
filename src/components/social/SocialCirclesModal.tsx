/**
 * EARPA SOCIAL CIRCLES & BARDIC FELLOWSHIP MODAL
 * Fellowship activity feed, friend encouragement cheers, and weekly dedication board.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SocialCirclesEngine } from '../../services/social/SocialCirclesEngine';
import { ActivityFeedItem, WeeklyDedicationEntry } from '../../services/social/types';

interface SocialCirclesModalProps {
  visible: boolean;
  onClose: () => void;
  socialEngine: SocialCirclesEngine;
  currentUserStreak: number;
  currentUserTrials: number;
}

export const SocialCirclesModal: React.FC<SocialCirclesModalProps> = ({
  visible,
  onClose,
  socialEngine,
  currentUserStreak,
  currentUserTrials,
}) => {
  const [activeTab, setActiveTab] = useState<'FEED' | 'LEADERBOARD'>('FEED');
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>(socialEngine.getActivityFeed());
  const [newFriendName, setNewFriendName] = useState<string>('');

  const leaderboard: WeeklyDedicationEntry[] = socialEngine.getWeeklyLeaderboard(
    currentUserStreak,
    currentUserTrials
  );

  const handleCheer = (activityId: string) => {
    if (socialEngine.cheerActivityItem(activityId)) {
      setFeedItems([...socialEngine.getActivityFeed()]);
    }
  };

  const handleAddFriend = () => {
    if (newFriendName.trim().length > 0) {
      socialEngine.addFriend(newFriendName.trim());
      setNewFriendName('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Bardic Fellowship</Text>
              <Text style={styles.subtitle}>Collaborate, share streaks, and cheer fellow Celtic harpers</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'FEED' && styles.tabActive]}
                onPress={() => setActiveTab('FEED')}
              >
                <Text style={[styles.tabText, activeTab === 'FEED' && styles.tabTextActive]}>
                  Fellowship Feed
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'LEADERBOARD' && styles.tabActive]}
                onPress={() => setActiveTab('LEADERBOARD')}
              >
                <Text style={[styles.tabText, activeTab === 'LEADERBOARD' && styles.tabTextActive]}>
                  Dedication Board
                </Text>
              </TouchableOpacity>
            </View>

            {/* Feed Tab */}
            {activeTab === 'FEED' && (
              <View style={styles.sectionContainer}>
                {/* Add Friend Row */}
                <View style={styles.addFriendRow}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter friend harper name..."
                    placeholderTextColor="#64748b"
                    value={newFriendName}
                    onChangeText={setNewFriendName}
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddFriend}>
                    <Text style={styles.addBtnText}>Connect</Text>
                  </TouchableOpacity>
                </View>

                {feedItems.map((item) => (
                  <View key={item.id} style={styles.feedCard}>
                    <View style={styles.feedCardHeader}>
                      <Text style={styles.friendName}>{item.friendName}</Text>
                      <Text style={styles.eventBadge}>{item.eventType}</Text>
                    </View>
                    <Text style={styles.feedTitle}>{item.title}</Text>
                    <Text style={styles.feedDescription}>{item.description}</Text>
                    <View style={styles.feedFooter}>
                      <TouchableOpacity
                        style={[styles.cheerBtn, item.hasCheered && styles.cheerBtnActive]}
                        onPress={() => handleCheer(item.id)}
                      >
                        <Text style={styles.cheerBtnText}>
                          {item.hasCheered ? 'Cheered' : 'Cheer Harper'} ({item.cheersCount})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'LEADERBOARD' && (
              <View style={styles.sectionContainer}>
                <Text style={styles.leaderboardSub}>
                  Ranked by weekly consistency: honoring daily dedication over stress.
                </Text>

                {leaderboard.map((entry) => (
                  <View
                    key={entry.friendId}
                    style={[styles.rankCard, entry.isCurrentUser && styles.rankCardCurrent]}
                  >
                    <View style={styles.rankLeft}>
                      <View style={[styles.rankBadge, entry.rank <= 3 ? styles.rankTop : styles.rankNormal]}>
                        <Text style={styles.rankText}>{entry.rank}</Text>
                      </View>
                      <View>
                        <Text style={[styles.rankName, entry.isCurrentUser && styles.rankNameCurrent]}>
                          {entry.friendName}
                        </Text>
                        <Text style={styles.rankMeta}>
                          Level {entry.bardicLevel} • {entry.currentStreak} Day Streak
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rankRight}>
                      <Text style={styles.rankDays}>{entry.practiceDaysThisWeek} / 7 Days</Text>
                      <Text style={styles.rankTrials}>{entry.totalTrialsThisWeek} notes</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Return Button */}
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.closeBtnText}>Return to Sanctuary</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#121722',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#d4af37',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a2232',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#273347',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#d4af37',
  },
  sectionContainer: {
    gap: 10,
    marginBottom: 16,
  },
  addFriendRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#18202e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addBtn: {
    backgroundColor: '#d4af37',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  feedCard: {
    backgroundColor: '#18202e',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  feedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  eventBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  feedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d4af37',
    marginTop: 2,
  },
  feedDescription: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 16,
  },
  feedFooter: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  cheerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#273142',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cheerBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#d4af37',
  },
  cheerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d4af37',
  },
  leaderboardSub: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  rankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18202e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rankCardCurrent: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTop: {
    backgroundColor: '#d4af37',
  },
  rankNormal: {
    backgroundColor: '#273142',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  rankName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  rankNameCurrent: {
    color: '#d4af37',
  },
  rankMeta: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankDays: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
  },
  rankTrials: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  closeBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
});
