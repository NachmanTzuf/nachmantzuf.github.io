import {UserAccountDatabase} from '../../services/account/UserAccountDatabase';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  TuningMatrixEngine,
  NativeHarpTuning,
  TUNING_DISPLAY_NAMES,
  TUNING_SHORT_NAMES,
  PLAYABLE_MAJOR_KEYS,
} from '../../services/curriculum/TuningMatrixEngine';

interface NativeTuningSelectorProps {
  themeColor?: string;
  onTuningChanged?: (tuning: NativeHarpTuning) => void;
  compact?: boolean;
}

const TUNING_OPTIONS: NativeHarpTuning[] = [
  'Eb_Major_Native',
  'C_Major_Native',
  'Bb_Major_Native',
];

export const NativeTuningSelector: React.FC<NativeTuningSelectorProps> = ({
  themeColor = '#10b981',
  onTuningChanged,
  compact = false,
}) => {
  const [activeTuning, setActiveTuningState] = useState<NativeHarpTuning>(
    TuningMatrixEngine.getActiveTuning()
  );

  useEffect(() => {
    // Subscribe to global tuning changes
    const unsubscribe = TuningMatrixEngine.subscribe((newTuning) => {
      setActiveTuningState(newTuning);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectTuning = (tuning: NativeHarpTuning) => {
    TuningMatrixEngine.setActiveTuning(tuning);
    UserAccountDatabase.getInstance().updateActiveProfile({activeTuning: tuning});
    setActiveTuningState(tuning);
    onTuningChanged?.(tuning);
  };

  const playableKeys = PLAYABLE_MAJOR_KEYS[activeTuning] || [];

  return (
    <View style={styles.cardContainer}>
      {/* Title & Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.headerIcon}></Text>
          <Text style={styles.headerTitle}>Physical Lever Harp Open Tuning</Text>
        </View>
        <View style={[styles.activePill, { borderColor: themeColor }]}>
          <Text style={[styles.activePillText, { color: themeColor }]}>
            {TUNING_SHORT_NAMES[activeTuning]}
          </Text>
        </View>
      </View>

      <Text style={styles.explanationText}>
        Lever harps only raise pitch by +1 semitone. Select your physical instrument's open base tuning to lock available transpositions:
      </Text>

      {/* 3 Radio Options */}
      <View style={styles.optionsColumn}>
        {TUNING_OPTIONS.map((tuning) => {
          const isSelected = activeTuning === tuning;
          const nativeId =
            tuning === 'Eb_Major_Native'
              ? 'tuning-opt-eb'
              : tuning === 'C_Major_Native'
              ? 'tuning-opt-c'
              : 'tuning-opt-bb';

          return (
            <TouchableOpacity
              key={tuning}
              nativeID={nativeId}
              activeOpacity={0.8}
              onPress={() => handleSelectTuning(tuning)}
              style={[
                styles.optionRow,
                isSelected && {
                  borderColor: themeColor,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  shadowColor: themeColor,
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                },
              ]}
            >
              {/* Radio Circle */}
              <View
                style={[
                  styles.radioOuter,
                  isSelected && { borderColor: themeColor },
                ]}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: themeColor },
                    ]}
                  />
                )}
              </View>

              {/* Tuning Label */}
              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    isSelected ? { color: '#ffffff', fontWeight: '700' } : { color: '#94a3b8' },
                  ]}
                >
                  {TUNING_DISPLAY_NAMES[tuning]}
                </Text>
                <Text style={styles.optionDetail}>
                  {tuning === 'Eb_Major_Native' && '8 Major Keys: E♭, B♭, F, C, G, D, A, E'}
                  {tuning === 'C_Major_Native' && '8 Major Keys: C, G, D, A, E, B, F♯, C♯'}
                  {tuning === 'Bb_Major_Native' && '8 Modal Keys: B♭, F, C, G, D, A, E, B'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Playable Keys Matrix Footer */}
      {!compact && (
        <View style={styles.keysFooter}>
          <Text style={styles.keysLabel}>Active Transposition Keys:</Text>
          <View style={styles.keyChipsRow}>
            {playableKeys.map((key) => (
              <View key={key} style={[styles.keyChip, { borderColor: themeColor }]}>
                <Text style={[styles.keyChipText, { color: themeColor }]}>{key}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: 14,
    marginVertical: 8,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        } as any)
      : {}),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  activePillText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  explanationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 12,
  },
  optionsColumn: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 2,
  },
  optionDetail: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#64748b',
  },
  keysFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  keysLabel: {
    fontFamily: 'Cinzel-Regular',
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  keyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keyChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  keyChipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
  },
});
