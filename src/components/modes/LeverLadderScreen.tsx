/**
 * EARPA LEVER LADDER INTERACTIVE SCREEN
 * Visual hierarchy for 4-Tier Lever Ladder with star badges, node progression gating,
 * and high-energy Session Lever Rush 60-second sprint HUD.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LeverLadderEngine } from '../../services/modes/LeverLadderEngine';
import { LeverLadderTier, LeverLadderNode, SessionLeverRushState } from '../../services/modes/types';

interface LeverLadderScreenProps {
  ladderEngine: LeverLadderEngine;
  onSelectNode: (node: LeverLadderNode) => void;
  onClose: () => void;
}

export const LeverLadderScreen: React.FC<LeverLadderScreenProps> = ({
  ladderEngine,
  onSelectNode,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<LeverLadderTier>(1);
  const [rushState, setRushState] = useState<SessionLeverRushState | null>(null);

  const nodes = ladderEngine.getNodesByTier(selectedTier);

  const handleStartRush = () => {
    const state = ladderEngine.startSessionLeverRush();
    setRushState(state);
  };

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>The Lever Ladder</Text>
          <Text style={styles.subtitle}>Progressive Celtic Lever Mastery & Game Modes</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Tier Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, selectedTier === 1 && styles.tabActive]}
          onPress={() => setSelectedTier(1)}
        >
          <Text style={[styles.tabText, selectedTier === 1 && styles.tabTextActive]}>
            Tier 1: Major Keys
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTier === 2 && styles.tabActive]}
          onPress={() => setSelectedTier(2)}
        >
          <Text style={[styles.tabText, selectedTier === 2 && styles.tabTextActive]}>
            Tier 2: Modes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTier === 3 && styles.tabActive]}
          onPress={() => setSelectedTier(3)}
        >
          <Text style={[styles.tabText, selectedTier === 3 && styles.tabTextActive]}>
            Tier 3: Tunes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTier === 4 && styles.tabActive]}
          onPress={() => setSelectedTier(4)}
        >
          <Text style={[styles.tabText, selectedTier === 4 && styles.tabTextActive]}>
            Tier 4: Rush
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tier 4 Special Sprint Banner */}
        {selectedTier === 4 && (
          <View style={styles.rushCard}>
            <Text style={styles.rushTitle}>Session Lever Rush (60s)</Text>
            <Text style={styles.rushDesc}>
              A rapid Celtic session sprint. Identify modulation targets and scale degrees under a strict 60 second timer with combo multipliers up to 3.0x.
            </Text>

            {rushState && rushState.isActive ? (
              <View style={styles.rushHud}>
                <View style={styles.hudMetric}>
                  <Text style={styles.hudLabel}>TIME LEFT</Text>
                  <Text style={styles.hudTimer}>{rushState.timeRemainingSec}s</Text>
                </View>
                <View style={styles.hudMetric}>
                  <Text style={styles.hudLabel}>MULTIPLIER</Text>
                  <Text style={styles.hudMultiplier}>{rushState.scoreMultiplier.toFixed(1)}x</Text>
                </View>
                <View style={styles.hudMetric}>
                  <Text style={styles.hudLabel}>SCORE</Text>
                  <Text style={styles.hudScore}>{rushState.currentScore}</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.rushStartBtn} activeOpacity={0.8} onPress={handleStartRush}>
                <Text style={styles.rushStartText}>Ignite 60s Sprint</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Node Cards List */}
        {nodes.map((node, index) => {
          const isUnlocked = node.isUnlocked;

          return (
            <TouchableOpacity
              key={node.nodeId}
              style={[styles.nodeCard, !isUnlocked && styles.nodeLocked]}
              activeOpacity={isUnlocked ? 0.75 : 1.0}
              onPress={() => isUnlocked && onSelectNode(node)}
            >
              <View style={styles.nodeLeft}>
                <View style={[styles.nodeIndexBadge, isUnlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                  <Text style={styles.badgeIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.nodeTextContainer}>
                  <Text style={[styles.nodeTitle, !isUnlocked && styles.textLocked]}>{node.title}</Text>
                  <Text style={styles.nodeSubtitle}>{node.subtitle}</Text>
                  {node.tuneContextName && (
                    <Text style={styles.tuneContextTag}>Repertoire: {node.tuneContextName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.nodeRight}>
                {isUnlocked ? (
                  <View style={styles.starRow}>
                    {[1, 2, 3].map((starIdx) => (
                      <Text
                        key={starIdx}
                        style={[
                          styles.starIcon,
                          starIdx <= node.starsEarned ? styles.starFilled : styles.starEmpty,
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                ) : (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockText}>Locked</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginTop: 2,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#273142',
    borderRadius: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d4af37',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#161d2a',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#d4af37',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  rushCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#d4af37',
  },
  rushTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d4af37',
    marginBottom: 4,
  },
  rushDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 12,
  },
  rushStartBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rushStartText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  rushHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#121824',
    borderRadius: 12,
    padding: 12,
  },
  hudMetric: {
    alignItems: 'center',
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
  },
  hudTimer: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ef4444',
    marginTop: 2,
  },
  hudMultiplier: {
    fontSize: 20,
    fontWeight: '800',
    color: '#34d399',
    marginTop: 2,
  },
  hudScore: {
    fontSize: 20,
    fontWeight: '800',
    color: '#d4af37',
    marginTop: 2,
  },
  nodeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161d2a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  nodeLocked: {
    opacity: 0.5,
  },
  nodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  nodeIndexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeUnlocked: {
    backgroundColor: '#273347',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  badgeLocked: {
    backgroundColor: '#1c2432',
  },
  badgeIndexText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  nodeTextContainer: {
    flex: 1,
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  textLocked: {
    color: '#64748b',
  },
  nodeSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  tuneContextTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34d399',
    marginTop: 3,
  },
  nodeRight: {
    marginLeft: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  starIcon: {
    fontSize: 16,
  },
  starFilled: {
    color: '#d4af37',
  },
  starEmpty: {
    color: '#334155',
  },
  lockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1e2838',
    borderRadius: 6,
  },
  lockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
});
