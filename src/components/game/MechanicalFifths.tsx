import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import {
  NativeHarpTuning,
  PLAYABLE_MAJOR_KEYS,
  StringLetter,
} from '../../services/curriculum/TuningMatrixEngine';
import {
  FIFTHS,
  solveLevers,
  signatureOf,
} from '../../services/curriculum/LeverLessonEngine';

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  let diff = endAngle - startAngle;
  while (diff < 0) diff += 360;
  const largeArcFlag = diff <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export function MechanicalFifths({
  tuning,
  selected,
  onSelect,
}: {
  tuning: NativeHarpTuning;
  selected: string;
  onSelect?: (key: string) => void;
}) {
  const [unavailableMsg, setUnavailableMsg] = useState('');
  const playable = PLAYABLE_MAJOR_KEYS[tuning];
  const config = solveLevers(tuning, selected, 'major');
  const sig = signatureOf(selected);

  const size = 244;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 94;

  // Find start and end angles of the contiguous available keys arc along FIFTHS
  const availIndices = FIFTHS.map((k, idx) => {
    const alias = k === 'Db' && tuning === 'C_Major_Native' ? 'C#' : k;
    return playable.includes(alias) ? idx : -1;
  }).filter((idx) => idx !== -1);

  // In Eb_Major_Native, available indices are 9 (Eb), 10 (Bb), 11 (F), 0 (C), 1 (G), 2 (D), 3 (A), 4 (E)
  let arcStartDeg = 0;
  let arcEndDeg = 210;
  if (tuning === 'Eb_Major_Native') {
    arcStartDeg = 9 * 30; // 270 deg (Eb)
    arcEndDeg = (4 + 12) * 30; // 480 deg (E)
  } else if (tuning === 'Bb_Major_Native') {
    arcStartDeg = 10 * 30; // 300 deg (Bb)
    arcEndDeg = (5 + 12) * 30; // 510 deg (B)
  } else {
    arcStartDeg = 11 * 30; // 330 deg (F)
    arcEndDeg = (6 + 12) * 30; // 540 deg (F#)
  }

  const activeArcPath = describeArc(cx, cy, radius, arcStartDeg, arcEndDeg);
  const upCount = config
    ? (['C', 'D', 'E', 'F', 'G', 'A', 'B'] as StringLetter[]).filter((l) => config[l]).length
    : 0;

  return (
    <View style={styles.wrapper}>
      {/* Minimalist Connected Circle of Fifths */}
      <View style={{ width: size, height: size, position: 'relative' }}>
        {Platform.OS === 'web' && (
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            {/* Muted background ring for unavailable keys */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="2"
              fill="none"
            />
            {/* Continuous luminous connecting arc across all available scales */}
            <path
              d={activeArcPath}
              stroke="#f5c76b"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.88"
            />
            {/* Subtle inner sanctuary ring */}
            <circle
              cx={cx}
              cy={cy}
              r={54}
              stroke="rgba(245, 199, 107, 0.22)"
              strokeWidth="1"
              fill="rgba(15, 25, 19, 0.72)"
            />
          </svg>
        )}

        {FIFTHS.map((key, i) => {
          const alias =
            key === 'Db' && tuning === 'C_Major_Native'
              ? 'C#'
              : key === 'Gb'
                ? 'F#'
                : key;
          const lookupKey = key === 'Gb' ? (playable.includes('F#') ? 'F#' : 'Gb') : alias;
          const available = playable.includes(lookupKey);
          const isSelected = lookupKey === selected || key === selected;
          const angleRad = ((i * 30 - 90) * Math.PI) / 180;
          const nodeSize = isSelected ? 40 : 36;
          const left = cx + radius * Math.cos(angleRad) - nodeSize / 2;
          const top = cy + radius * Math.sin(angleRad) - nodeSize / 2;
          const label = alias.replace('b', '♭').replace('#', '♯');

          return (
            <TouchableOpacity
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${alias} major${available ? '' : ', unavailable in this tuning'}`}
              accessibilityState={{ selected: isSelected, disabled: !available }}
              activeOpacity={available ? 0.8 : 1}
              onPress={() => {
                if (available) {
                  setUnavailableMsg('');
                  onSelect?.(lookupKey);
                } else {
                  setUnavailableMsg(`${label} major is not available in E♭ tuning.`);
                }
              }}
              style={[
                styles.node,
                {
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: nodeSize / 2,
                  left,
                  top,
                },
                available ? styles.nodeAvailable : styles.nodeUnavailable,
                isSelected && styles.nodeSelected,
              ]}
            >
              <Text
                style={[
                  styles.nodeText,
                  available ? styles.nodeTextAvailable : styles.nodeTextUnavailable,
                  isSelected && styles.nodeTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Center Minimalist Key Summary */}
        <View pointerEvents="none" style={styles.centerHub}>
          <Text style={styles.centerKeyText}>
            {selected.replace('b', '♭').replace('#', '♯')}
          </Text>
          <Text style={styles.centerSubText}>
            {sig === 0 ? '0 flats/sharps' : `${Math.abs(sig)} ${sig < 0 ? (Math.abs(sig) === 1 ? 'flat' : 'flats') : Math.abs(sig) === 1 ? 'sharp' : 'sharps'}`}
          </Text>
          <Text style={styles.centerLeversCount}>
            {upCount === 0 ? 'All levers down' : `${upCount} ${upCount === 1 ? 'group' : 'groups'} up`}
          </Text>
        </View>
      </View>

      {/* Bigger, Separate, Clean Levers UP / DOWN Bar */}
      {config && (
        <View style={styles.leversPanel}>
          {(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'] as StringLetter[]).map((l, i) => {
            const isUp = !!config[l];
            const isRed = l === 'C';
            const isBlue = l === 'F';
            const letterColor = isRed ? '#f87171' : isBlue ? '#60a5fa' : '#f8fafc';

            return (
              <View
                key={i}
                style={[
                  styles.leverCard,
                  isUp ? styles.leverCardUp : styles.leverCardDown,
                ]}
              >
                <Text style={[styles.leverArrow, isUp ? styles.leverArrowUp : styles.leverArrowDown]}>
                  {isUp ? '↑' : '↓'}
                </Text>
                <Text style={[styles.leverNote, { color: letterColor }]}>
                  {l}
                </Text>
                <Text style={[styles.leverStatus, isUp ? styles.leverStatusUp : styles.leverStatusDown]}>
                  {isUp ? 'UP' : 'DN'}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {!!unavailableMsg && (
        <Text accessibilityRole="alert" style={styles.unavailableText}>
          {unavailableMsg}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
  },
  nodeAvailable: {
    backgroundColor: 'rgba(22, 36, 28, 0.94)',
    borderColor: 'rgba(245, 199, 107, 0.65)',
  },
  nodeUnavailable: {
    backgroundColor: 'rgba(12, 18, 15, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.30,
  },
  nodeSelected: {
    backgroundColor: '#f5c76b',
    borderColor: '#fef08a',
    boxShadow: '0 0 14px rgba(245, 199, 107, 0.55)',
  } as any,
  nodeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  nodeTextAvailable: {
    color: '#f8fafc',
  },
  nodeTextUnavailable: {
    color: '#64748b',
    fontWeight: '600',
  },
  nodeTextSelected: {
    color: '#0f1c14',
    fontWeight: '900',
  },
  centerHub: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerKeyText: {
    fontFamily: 'Cinzel-Bold',
    color: '#fef08a',
    fontSize: 25,
    fontWeight: '800',
  },
  centerSubText: {
    color: '#cbd5e1',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  centerLeversCount: {
    color: '#f5c76b',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  leversPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
    maxWidth: 390,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 29, 22, 0.90)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  leverCard: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.4,
    gap: 3,
  },
  leverCardUp: {
    backgroundColor: 'rgba(245, 199, 107, 0.24)',
    borderColor: '#f5c76b',
  },
  leverCardDown: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  leverArrow: {
    fontSize: 14,
    fontWeight: '900',
  },
  leverArrowUp: {
    color: '#f5c76b',
  },
  leverArrowDown: {
    color: '#64748b',
  },
  leverNote: {
    fontSize: 19,
    fontWeight: '900',
  },
  leverStatus: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  leverStatusUp: {
    color: '#fef08a',
  },
  leverStatusDown: {
    color: '#94a3b8',
  },
  unavailableText: {
    color: '#cbd5e1',
    fontSize: 11.5,
    textAlign: 'center',
  },
});
