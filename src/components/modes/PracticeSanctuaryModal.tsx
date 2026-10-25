/**
 * EARPA PRACTICE SANCTUARY SANDBOX MODAL
 * Dedicated sandbox interface providing continuous harmonic drone audio,
 * tempo adjustment, and free key exploration without test pressure.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PracticeSanctuaryEngine } from '../../services/modes/PracticeSanctuaryEngine';
import { PitchClass } from '../../services/theory/types';

interface PracticeSanctuaryModalProps {
  visible: boolean;
  onClose: () => void;
  sanctuaryEngine: PracticeSanctuaryEngine;
  onSelectKey: (rootPc: PitchClass) => void;
}

const CELTIC_KEY_OPTIONS: { root: PitchClass; name: string }[] = [
  { root: 3, name: 'Eb Major' },
  { root: 10, name: 'Bb Major' },
  { root: 5, name: 'F Major' },
  { root: 0, name: 'C Major' },
  { root: 7, name: 'G Major' },
  { root: 2, name: 'D Major' },
  { root: 9, name: 'A Major' },
  { root: 4, name: 'E Major' },
];

export const PracticeSanctuaryModal: React.FC<PracticeSanctuaryModalProps> = ({
  visible,
  onClose,
  sanctuaryEngine,
  onSelectKey,
}) => {
  const config = sanctuaryEngine.getConfig();
  const [droneOn, setDroneOn] = useState<boolean>(config.droneActive);
  const [bpm, setBpm] = useState<number>(config.cadenceBpm);
  const [selectedRoot, setSelectedRoot] = useState<PitchClass>(config.rootPitchClass);

  const handleToggleDrone = async () => {
    const newState = await sanctuaryEngine.toggleDrone();
    setDroneOn(newState);
  };

  const handleAdjustBpm = (delta: number) => {
    const newBpm = Math.max(50, Math.min(160, bpm + delta));
    setBpm(newBpm);
    sanctuaryEngine.setCadenceBpm(newBpm);
  };

  const handleChooseKey = (root: PitchClass) => {
    setSelectedRoot(root);
    sanctuaryEngine.updateKey(root);
    onSelectKey(root);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Practice Sanctuary</Text>
              <Text style={styles.subtitle}>Unconstrained acoustic sandbox with continuous drone</Text>
            </View>

            {/* Continuous Drone Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Harmonic Drone (Root and Fifth)</Text>
              <Text style={styles.sectionDesc}>
                Sing or pluck against this immovable fifth dyad to anchor your internal pitch reference.
              </Text>
              <TouchableOpacity
                style={[styles.droneButton, droneOn ? styles.droneActive : styles.droneInactive]}
                activeOpacity={0.8}
                onPress={handleToggleDrone}
              >
                <Text style={[styles.droneButtonText, droneOn ? styles.droneTextActive : styles.droneTextInactive]}>
                  {droneOn ? 'Harmonic Drone Sounding' : 'Activate Harmonic Drone'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cadence Tempo Adjustment */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Cadence Tempo (BPM)</Text>
              <View style={styles.bpmRow}>
                <TouchableOpacity style={styles.stepperButton} onPress={() => handleAdjustBpm(-5)}>
                  <Text style={styles.stepperText}>-5</Text>
                </TouchableOpacity>
                <View style={styles.bpmDisplay}>
                  <Text style={styles.bpmValue}>{bpm}</Text>
                  <Text style={styles.bpmUnit}>BPM</Text>
                </View>
                <TouchableOpacity style={styles.stepperButton} onPress={() => handleAdjustBpm(5)}>
                  <Text style={styles.stepperText}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Root Key Explorer */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Sanctuary Key Explorer</Text>
              <View style={styles.keyGrid}>
                {CELTIC_KEY_OPTIONS.map((k) => {
                  const isSelected = selectedRoot === k.root;
                  return (
                    <TouchableOpacity
                      key={k.root}
                      style={[styles.keyPill, isSelected && styles.keyPillSelected]}
                      onPress={() => handleChooseKey(k.root)}
                    >
                      <Text style={[styles.keyText, isSelected && styles.keyTextSelected]}>
                        {k.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.closeButtonText}>Return to Sanctuary</Text>
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
    paddingBottom: 12,
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
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  cardSection: {
    backgroundColor: '#1a2232',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 10,
  },
  droneButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  droneActive: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  droneInactive: {
    backgroundColor: '#273142',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  droneButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  droneTextActive: {
    color: '#0f172a',
  },
  droneTextInactive: {
    color: '#f8fafc',
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  stepperButton: {
    width: 44,
    height: 44,
    backgroundColor: '#273142',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#d4af37',
  },
  bpmDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  bpmValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
  },
  bpmUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  keyPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#273142',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  keyPillSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#d4af37',
  },
  keyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  keyTextSelected: {
    color: '#d4af37',
    fontWeight: '800',
  },
  closeButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
});
