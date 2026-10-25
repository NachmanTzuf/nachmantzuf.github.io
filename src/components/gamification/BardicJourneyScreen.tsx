/**
 * EARPA BARDIC JOURNEY INTERACTIVE SCREEN
 * Visual winding path across 6 stages and 36 nodes with star badges,
 * progress gates, and node launch triggers.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BardicJourneyEngine } from '../../services/gamification/BardicJourneyEngine';
import { JourneyNode, JourneyStageId } from '../../services/gamification/types';

interface BardicJourneyScreenProps {
  journeyEngine: BardicJourneyEngine;
  onSelectNode: (node: JourneyNode) => void;
  onClose: () => void;
}

const STAGE_NAMES: Record<JourneyStageId, string> = {
  1: 'Stage 1: The First Resonance',
  2: 'Stage 2: The Diatonic Octave',
  3: 'Stage 3: Bass Wires and Treble Heights',
  4: 'Stage 4: Chromatic Shadows',
  5: 'Stage 5: Modal Lever Shifts',
  6: 'Stage 6: Melodic Dictation',
};

export const BardicJourneyScreen: React.FC<BardicJourneyScreenProps> = ({
  journeyEngine,
  onSelectNode,
  onClose,
}) => {
  const [selectedStage, setSelectedStage] = useState<JourneyStageId>(1);
  const userProgression = journeyEngine.getUserProgression();
  const nodes = journeyEngine.getNodesByStage(selectedStage);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>The Bardic Journey</Text>
          <Text style={styles.subtitle}>
            Level {userProgression.bardicLevel} Harper • {userProgression.totalXp} Total XP
          </Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Return</Text>
        </TouchableOpacity>
      </View>

      {/* Stage Tab Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll} contentContainerStyle={styles.stageScrollContent}>
        {([1, 2, 3, 4, 5, 6] as JourneyStageId[]).map((stageId) => {
          const isSelected = selectedStage === stageId;
          return (
            <TouchableOpacity
              key={stageId}
              style={[styles.stageTab, isSelected && styles.stageTabSelected]}
              onPress={() => setSelectedStage(stageId)}
            >
              <Text style={[styles.stageTabText, isSelected && styles.stageTabTextSelected]}>
                Stage {stageId}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Stage Title Banner */}
      <View style={styles.stageBanner}>
        <Text style={styles.stageBannerText}>{STAGE_NAMES[selectedStage]}</Text>
      </View>

      {/* 6 Nodes per Stage */}
      <ScrollView contentContainerStyle={styles.nodesScrollContent} showsVerticalScrollIndicator={false}>
        {nodes.map((node) => {
          const isUnlocked = node.isUnlocked;
          const isCompleted = node.isCompleted;

          return (
            <TouchableOpacity
              key={node.nodeId}
              style={[styles.nodeCard, !isUnlocked && styles.nodeLocked]}
              activeOpacity={isUnlocked ? 0.75 : 1.0}
              onPress={() => isUnlocked && onSelectNode(node)}
            >
              <View style={styles.nodeLeft}>
                <View
                  style={[
                    styles.nodeIndexCircle,
                    isCompleted
                      ? styles.circleCompleted
                      : isUnlocked
                      ? styles.circleUnlocked
                      : styles.circleLocked,
                  ]}
                >
                  <Text style={styles.circleText}>{node.stageNodeIndex}</Text>
                </View>
                <View style={styles.nodeInfo}>
                  <Text style={[styles.nodeTitle, !isUnlocked && styles.textLocked]}>
                    {node.title}
                  </Text>
                  <Text style={styles.nodeSubtitle}>{node.subtitle}</Text>
                  <Text style={styles.nodeFocus}>Focus: {node.pedagogicalFocus}</Text>
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
                    <Text style={styles.lockText}>Gate Locked</Text>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#d4af37',
    fontWeight: '700',
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
  stageScroll: {
    maxHeight: 44,
    marginBottom: 12,
  },
  stageScrollContent: {
    gap: 8,
  },
  stageTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#161d2a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stageTabSelected: {
    backgroundColor: '#273347',
    borderColor: '#d4af37',
  },
  stageTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  stageTabTextSelected: {
    color: '#d4af37',
  },
  stageBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#131822',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#d4af37',
    marginBottom: 14,
  },
  stageBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  nodesScrollContent: {
    paddingBottom: 32,
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
  nodeIndexCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: '#065f46',
    borderWidth: 1.5,
    borderColor: '#10b981',
  },
  circleUnlocked: {
    backgroundColor: '#273347',
    borderWidth: 1.5,
    borderColor: '#d4af37',
  },
  circleLocked: {
    backgroundColor: '#1c2432',
  },
  circleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  nodeInfo: {
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
  nodeFocus: {
    fontSize: 10,
    color: '#34d399',
    marginTop: 3,
    fontWeight: '600',
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
