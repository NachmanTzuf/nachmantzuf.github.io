/**
 * EARPA POST-LEVEL DIAGNOSTIC SCREEN & BARDIC GATE MODAL
 * Dynamic post-trial summary displaying 90% accuracy gating, latency metrics,
 * primary harmonic confusion analysis, and newly unlocked Hub Tags.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PostLevelDiagnosticReport } from '../../services/intelligence/types';

interface PostLevelDiagnosticModalProps {
  visible: boolean;
  report: PostLevelDiagnosticReport | null;
  onContinue: () => void;
  onRetry: () => void;
  onOpenSanctuary: () => void;
}

export const PostLevelDiagnosticModal: React.FC<PostLevelDiagnosticModalProps> = ({
  visible,
  report,
  onContinue,
  onRetry,
  onOpenSanctuary,
}) => {
  if (!report) return null;

  const accuracyPercent = Math.round(report.accuracy * 100);
  const passed = report.passedGate;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header Badge */}
            <View style={styles.header}>
              <Text style={styles.levelTitle}>Level Diagnostic</Text>
              <Text style={[styles.gateStatus, passed ? styles.gatePassed : styles.gateFailed]}>
                {passed ? 'Bardic Gate Passed (90% Met)' : 'Gate Locked: 90% Precision Needed'}
              </Text>
            </View>

            {/* Score Ring / Bar */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>{accuracyPercent}%</Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>{report.averageLatencyMs.toFixed(0)} ms</Text>
                <Text style={styles.scoreLabel}>Reflex Speed</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNumber}>+{report.xpEarned}</Text>
                <Text style={styles.scoreLabel}>Bardic XP</Text>
              </View>
            </View>

            {/* Pedagogical Voiceover Feedback */}
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>"{report.contextualFeedback}"</Text>
            </View>

            {/* Primary Harmonic Confusion */}
            {report.primaryConfusion && (
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Tonal Confusion Analysis</Text>
                <Text style={styles.confusionHighlight}>
                  Degree {report.primaryConfusion.stimulus} mistook for Degree {report.primaryConfusion.guessed} ({report.primaryConfusion.count} times)
                </Text>
                <Text style={styles.confusionExplanation}>
                  {report.primaryConfusion.explanation}
                </Text>
              </View>
            )}

            {/* Scale Degree Masteries */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Scale Degree Pillars</Text>
              <View style={styles.pillRow}>
                {report.strongestDegrees.map((deg) => (
                  <View key={`strong-${deg}`} style={[styles.degreePill, styles.strongPill]}>
                    <Text style={styles.pillText}>Degree {deg} (Strong)</Text>
                  </View>
                ))}
                {report.weakestDegrees.map((deg) => (
                  <View key={`weak-${deg}`} style={[styles.degreePill, styles.weakPill]}>
                    <Text style={styles.pillText}>Degree {deg} (Focus)</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Unlocked Hub Tags */}
            {report.unlockedTags.length > 0 && (
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Newly Unlocked Hub Tags</Text>
                {report.unlockedTags.map((tag) => (
                  <View key={tag.id} style={styles.tagCard}>
                    <Text style={styles.tagTitle}>{tag.title}</Text>
                    <Text style={styles.tagDescription}>{tag.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {passed ? (
                <TouchableOpacity
                  style={[styles.btnBase, styles.btnPrimary]}
                  activeOpacity={0.8}
                  onPress={onContinue}
                >
                  <Text style={styles.btnTextPrimary}>Proceed to Next Node</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.btnBase, styles.btnPrimary]}
                  activeOpacity={0.8}
                  onPress={onRetry}
                >
                  <Text style={styles.btnTextPrimary}>Retry Level</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.btnBase, styles.btnSecondary]}
                activeOpacity={0.8}
                onPress={onOpenSanctuary}
              >
                <Text style={styles.btnTextSecondary}>Open Practice Sanctuary</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#131822',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#d4af37', // Celtic brass accent
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  gateStatus: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gatePassed: {
    color: '#34d399',
  },
  gateFailed: {
    color: '#f87171',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#1e2430',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d4af37',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  feedbackBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#d4af37',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#fef3c7',
    lineHeight: 20,
  },
  sectionBox: {
    backgroundColor: '#181f2c',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  confusionHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f87171',
    marginBottom: 4,
  },
  confusionExplanation: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  degreePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  strongPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  weakPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f8fafc',
  },
  tagCard: {
    backgroundColor: '#232b3b',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#34d399',
  },
  tagTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34d399',
  },
  tagDescription: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 8,
    gap: 10,
  },
  btnBase: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#d4af37',
  },
  btnTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0e1117',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  btnTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
