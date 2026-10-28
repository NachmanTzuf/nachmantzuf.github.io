import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LevelDefinition } from '../../services/curriculum/curriculumData';

interface LiquidGlassLevelBadgeProps {
  level: LevelDefinition;
  theme?: 'single' | 'melody' | 'levers';
  align?: 'left' | 'right';
}

export const LiquidGlassLevelBadge: React.FC<LiquidGlassLevelBadgeProps> = ({
  level,
  theme = 'single',
  align = 'right',
}) => {
  const themeColors = {
    single: {
      accent: '#10b981', // Emerald green
      activeSquare: '#059669',
      border: 'rgba(16, 185, 129, 0.45)',
      glow: 'rgba(16, 185, 129, 0.25)',
    },
    melody: {
      accent: '#38bdf8', // Glacial cyan
      activeSquare: '#0284c7',
      border: 'rgba(56, 189, 248, 0.45)',
      glow: 'rgba(56, 189, 248, 0.25)',
    },
    levers: {
      accent: '#f59e0b', // Amber sand
      activeSquare: '#d97706',
      border: 'rgba(245, 158, 11, 0.45)',
      glow: 'rgba(245, 158, 11, 0.25)',
    },
  }[theme];

  if (level.id.startsWith('lever_')) return <View style={[styles.container,{borderColor:'#ba9a65'}]}><Text style={[styles.levelCodeText,{color:'#ddbc86'}]}>{level.code} · LEVERS</Text><Text style={styles.titleText}>{level.title}</Text><Text style={{fontSize:11,color:'#ddd0b3',lineHeight:17}}>Circle of fifths</Text><Text style={{fontSize:11,color:'#b9a98c'}}>5 rounds · set the scale</Text></View>;
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: themeColors.border,
          shadowColor: themeColors.accent,
        },
        align === 'left' ? styles.alignLeft : styles.alignRight,
      ]}
    >
      {/* Top Header Row: Level Code & Cadence */}
      <View style={styles.topRow}>
        <Text style={[styles.levelCodeText, { color: themeColors.accent }]}>
          {level.code}
        </Text>
        <View style={styles.cadenceChip}>
          <Text style={styles.cadenceText}>{level.cadenceProgression}</Text>
        </View>
      </View>

      {/* Level Title */}
      <Text style={styles.titleText} numberOfLines={1}>
        {level.title}
      </Text>

      {/* 8-Square Active Note Indicator Matrix */}
      <View style={styles.matrixContainer}>
        <View style={styles.matrixLabelRow}>
          <Text style={styles.matrixLabel}>Degree Matrix:</Text>
          {level.isChromatic && (
            <Text style={[styles.chromaticTag, { color: themeColors.accent }]}>+Chromatics</Text>
          )}
        </View>
        <View style={styles.squaresRow}>
          {level.activeNotesMask.map((isActive, idx) => (
            <View
              key={idx}
              style={[
                styles.matrixSquare,
                isActive
                  ? {
                      backgroundColor: themeColors.activeSquare,
                      borderColor: themeColors.accent,
                      shadowColor: themeColors.accent,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.6,
                      shadowRadius: 2,
                    }
                  : styles.inactiveSquare,
              ]}
            >
              <Text style={[styles.degreeNumber, isActive ? styles.activeDegreeNumber : styles.inactiveDegreeNumber]}>
                {idx + 1}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Pills Row: Rounds & Octaves */}
      <View style={styles.pillsRow}>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>{level.rounds} Rounds</Text>
        </View>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>
            {level.register === 5 ? 'High octave' : `${level.octaves} ${level.octaves===1?'Octave':'Octaves'}`}
          </Text>
        </View>
        {level.tempoBpm && (
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>{level.tempoBpm} BPM</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 154,
    maxWidth: 180,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  alignLeft: {
    marginRight: 8,
  },
  alignRight: {
    marginLeft: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  levelCodeText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  cadenceChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cadenceText: {
    color: '#cbd5e1',
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    letterSpacing: 0.4,
  },
  titleText: {
    color: '#f8fafc',
    fontFamily: 'Cinzel-Regular',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  matrixContainer: {
    marginBottom: 6,
  },
  matrixLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  matrixLabel: {
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    fontSize: 8.5,
  },
  chromaticTag: {
    fontFamily: 'Inter-Medium',
    fontSize: 8,
  },
  squaresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matrixSquare: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveSquare: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  degreeNumber: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  activeDegreeNumber: {
    color: '#ffffff',
  },
  inactiveDegreeNumber: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillText: {
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
    fontSize: 8.5,
  },
});
