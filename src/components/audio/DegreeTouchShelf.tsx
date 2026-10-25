/**
 * EARPA DEGREE TOUCH SHELF
 * Focused single-octave touch input zone (degrees 1 through 8 plus accidentals)
 * with tactile haptic feedback, WCAG tap ergonomics (>=48dp), and stateful glow animations.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScaleDegree, SolfegeName } from '../../services/audio/types';

interface DegreeTouchShelfProps {
  onSelectDegree: (degree: ScaleDegree) => void;
  disabled?: boolean;
  activeDegree?: ScaleDegree | null;
  correctDegree?: ScaleDegree | null;
  guessedDegree?: ScaleDegree | null;
}

interface DegreePadConfig {
  degree: ScaleDegree;
  solfege: SolfegeName;
  isTonicAnchor: boolean;
}

const DIATONIC_PADS: DegreePadConfig[] = [
  { degree: '1', solfege: 'Do', isTonicAnchor: true },
  { degree: '2', solfege: 'Re', isTonicAnchor: false },
  { degree: '3', solfege: 'Mi', isTonicAnchor: false },
  { degree: '4', solfege: 'Fa', isTonicAnchor: false },
  { degree: '5', solfege: 'Sol', isTonicAnchor: false },
  { degree: '6', solfege: 'La', isTonicAnchor: false },
  { degree: '7', solfege: 'Ti', isTonicAnchor: false },
  { degree: '8', solfege: 'Do8', isTonicAnchor: true },
];

export const DegreeTouchShelf: React.FC<DegreeTouchShelfProps> = ({
  onSelectDegree,
  disabled = false,
  correctDegree,
  guessedDegree,
}) => {
  const handlePress = (degree: ScaleDegree) => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSelectDegree(degree);
  };

  return (
    <View style={styles.container}>
      <View style={styles.shelfRow}>
        {DIATONIC_PADS.map((pad) => {
          const isSelected = guessedDegree === pad.degree;
          const isCorrect = correctDegree === pad.degree;
          const isWrongGuess = isSelected && correctDegree && correctDegree !== pad.degree;

          let padStyle = styles.padDefault;

          if (isCorrect) {
            padStyle = styles.padCorrect;
          } else if (isWrongGuess) {
            padStyle = styles.padWrong;
          } else if (pad.isTonicAnchor) {
            padStyle = styles.padTonicAnchor;
          }

          return (
            <TouchableOpacity
              key={pad.degree}
              activeOpacity={0.72}
              disabled={disabled}
              onPress={() => handlePress(pad.degree)}
              style={[
                styles.padBase,
                padStyle,
                disabled && styles.padDisabled,
              ]}
            >
              <Text
                style={[
                  styles.padNumber,
                  isCorrect && styles.padNumberCorrect,
                  isWrongGuess && styles.padNumberWrong,
                ]}
              >
                {pad.degree}
              </Text>
              <Text style={styles.solfegeText}>{pad.solfege}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#131822',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)', // Subtle Celtic brass border
  },
  shelfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  padBase: {
    flex: 1,
    minHeight: 56, // Enforces WCAG touch target height >= 48dp
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e2430',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  padDefault: {
    backgroundColor: '#1e2430',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  padTonicAnchor: {
    backgroundColor: '#273142',
    borderColor: '#d4af37', // Golden border for Tonic anchors (1 & 8)
    borderWidth: 1.5,
  },
  padCorrect: {
    backgroundColor: '#065f46',
    borderColor: '#10b981',
    borderWidth: 2,
  },
  padWrong: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  padDisabled: {
    opacity: 0.5,
  },
  padNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  padNumberCorrect: {
    fontSize: 20,
    fontWeight: '800',
    color: '#34d399',
  },
  padNumberWrong: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f87171',
  },
  solfegeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 2,
  },
});
