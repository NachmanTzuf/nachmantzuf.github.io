/**
 * EARPA LEVER CONTROL PANEL
 * Displays active key and mode, provides one-tap Celtic session scale presets,
 * and renders the 7 physical brass lever states with live delta change notifications.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DiatonicMode, NoteLetter, PitchClass } from '../../services/theory/types';
import { ModalShiftEngine } from '../../services/theory/ModalShiftEngine';

interface LeverControlPanelProps {
  activeRootPitchClass: PitchClass;
  activeMode: DiatonicMode;
  onSelectScale: (rootPc: PitchClass, mode: DiatonicMode) => void;
}

interface ScalePreset {
  label: string;
  rootPc: PitchClass;
  mode: DiatonicMode;
  isStandardCeltic: boolean;
}

const CELTIC_PRESETS: ScalePreset[] = [
  { label: 'Eb Major (Open Standard)', rootPc: 3, mode: 'ionian', isStandardCeltic: true },
  { label: 'C Major', rootPc: 0, mode: 'ionian', isStandardCeltic: false },
  { label: 'G Major (1#)', rootPc: 7, mode: 'ionian', isStandardCeltic: false },
  { label: 'D Major (2#)', rootPc: 2, mode: 'ionian', isStandardCeltic: false },
  { label: 'E Dorian', rootPc: 4, mode: 'dorian', isStandardCeltic: true },
  { label: 'A Dorian', rootPc: 9, mode: 'dorian', isStandardCeltic: true },
];

const LEVER_LETTERS: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const LeverControlPanel: React.FC<LeverControlPanelProps> = ({
  activeRootPitchClass,
  activeMode,
  onSelectScale,
}) => {
  const currentDef = ModalShiftEngine.getModalDefinition(activeRootPitchClass, activeMode);
  const levers = currentDef.levers;

  const handleSelect = (preset: ScalePreset) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectScale(preset.rootPc, preset.mode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.activeKeyLabel}>ACTIVE KEY & HARP LEVERS</Text>
          <Text style={styles.activeKeyTitle}>
            {currentDef.rootName} {currentDef.mode.toUpperCase()} (Parent: {currentDef.parentMajorKey} Major)
          </Text>
        </View>
        <View style={styles.tuningBadge}>
          <Text style={styles.tuningBadgeText}>Open Eb Tuning</Text>
        </View>
      </View>

      {/* Preset Pills */}
      <View style={styles.presetRow}>
        {CELTIC_PRESETS.map((p) => {
          const isSelected = p.rootPc === activeRootPitchClass && p.mode === activeMode;
          return (
            <TouchableOpacity
              key={`${p.rootPc}-${p.mode}`}
              onPress={() => handleSelect(p)}
              style={[styles.presetPill, isSelected && styles.presetPillActive]}
            >
              <Text style={[styles.presetPillText, isSelected && styles.presetPillTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Physical Lever Indicators [C, D, E, F, G, A, B] */}
      <View style={styles.leversContainer}>
        {LEVER_LETTERS.map((letter) => {
          const isUp = levers[letter] === 1;
          const isColorC = letter === 'C';
          const isColorF = letter === 'F';

          return (
            <View key={letter} style={styles.leverItem}>
              <View
                style={[
                  styles.leverIndicator,
                  isUp ? styles.leverUp : styles.leverDown,
                  isColorC && styles.leverIndicatorC,
                  isColorF && styles.leverIndicatorF,
                ]}
              >
                <Text style={styles.leverStateText}>{isUp ? 'UP' : 'DN'}</Text>
              </View>
              <Text
                style={[
                  styles.leverLetterText,
                  isColorC && styles.colorRedText,
                  isColorF && styles.colorBlueText,
                ]}
              >
                {letter}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 12,
    backgroundColor: '#131822',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeKeyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.1,
  },
  activeKeyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 2,
  },
  tuningBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  tuningBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d4af37',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1e2430',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  presetPillActive: {
    backgroundColor: '#d4af37',
    borderColor: '#f59e0b',
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  presetPillTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  leversContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  leverItem: {
    alignItems: 'center',
    gap: 4,
  },
  leverIndicator: {
    width: 32,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leverUp: {
    backgroundColor: '#059669', // Green for engaged sharped lever
  },
  leverDown: {
    backgroundColor: '#334155', // Slate for open / down lever
  },
  leverIndicatorC: {
    borderWidth: 1.5,
    borderColor: '#e63946',
  },
  leverIndicatorF: {
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  leverStateText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f8fafc',
  },
  leverLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  colorRedText: {
    color: '#f87171',
  },
  colorBlueText: {
    color: '#60a5fa',
  },
});
