/**
 * EARPA HARP SHOP LIVE PREVIEW
 * Displays a dynamic visual model of the Celtic harp inside the Artisan Workshop.
 * Real-time updates reflect the exact wood timber finish, carved soundboard rosette,
 * Camac lever metallurgy, and glowing illuminated LED strings.
 * Strings are interactively pluckable with soft, warm, velvety Celtic resonance.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { TimbreType } from '../../services/audio/types';

interface HarpShopPreviewProps {
  timberColor: string;
  timberName: string;
  rosetteColor: string;
  rosetName: string;
  stringsColor: string;
  stringsName: string;
  leverColor: string;
  leverName: string;
  soundPackId: string;
  soundPackName: string;
  isPreviewing?: boolean;
  previewItemName?: string;
}

// 8 diatonic scale frequencies: C4 (261.63Hz) to C5 (523.25Hz)
const STRING_FREQUENCIES = [
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
];

export const HarpShopPreview: React.FC<HarpShopPreviewProps> = ({
  timberColor,
  timberName,
  rosetteColor,
  rosetName,
  stringsColor,
  stringsName,
  leverColor,
  leverName,
  soundPackId,
  soundPackName,
  isPreviewing,
  previewItemName,
}) => {
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);

  const getTimbreForSoundPack = (packId: string): TimbreType => {
    if (packId === 'gut_string_warmth') return 'gut_string_warmth';
    if (packId === 'subtle_cathedral_reverb') return 'subtle_cathedral_reverb';
    return 'celtic_nylon';
  };

  const handlePluckString = (idx: number) => {
    setActiveStringIndex(idx);
    const freq = STRING_FREQUENCIES[idx] || 330;
    const timbre = getTimbreForSoundPack(soundPackId);
    HarpSoundSynthesizer.playWarmHarpChime(timbre, freq);

    setTimeout(() => {
      setActiveStringIndex((cur) => (cur === idx ? null : cur));
    }, 450);
  };

  // 8 string coordinates across the Celtic harp geometry (viewBox: 0 0 320 200)
  // Harmonic curve at top: y varies ~30 to 45
  // Soundboard at bottom: y varies ~165 to 175
  const stringCoords = [
    { xTop: 110, yTop: 36, xBot: 155, yBot: 172, isTonic: true },   // 1 (C4)
    { xTop: 126, yTop: 34, xBot: 170, yBot: 170, isTonic: false },  // 2 (D4)
    { xTop: 142, yTop: 32, xBot: 185, yBot: 168, isTonic: false },  // 3 (E4)
    { xTop: 158, yTop: 32, xBot: 200, yBot: 166, isTonic: false },  // 4 (F4 - blue)
    { xTop: 174, yTop: 33, xBot: 215, yBot: 164, isTonic: false },  // 5 (G4)
    { xTop: 190, yTop: 35, xBot: 230, yBot: 162, isTonic: false },  // 6 (A4)
    { xTop: 206, yTop: 38, xBot: 245, yBot: 160, isTonic: false },  // 7 (B4)
    { xTop: 222, yTop: 42, xBot: 260, yBot: 158, isTonic: true },   // 8 (C5)
  ];

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusIcon}>✨</Text>
          <Text style={styles.statusText}>
            {isPreviewing ? `Previewing: ${previewItemName}` : `Fitted: ${timberName}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handlePluckString(2)} // plucks warm E4
          style={styles.strumHintBtn}
        >
          <Text style={styles.strumHintText}>Tap strings to hear tone 🎵</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Celtic Harp Canvas / SVG */}
      <View style={styles.harpHolder}>
        <svg
          viewBox="0 0 320 200"
          style={{ width: '100%', height: 185, overflow: 'visible' }}
        >
          <defs>
            {/* Ambient Shadow under harp */}
            <radialGradient id="pedestalShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
            </radialGradient>

            {/* Dynamic Wood Grain Gradient with Selected Timber Color */}
            <linearGradient id="timberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={timberColor} stopOpacity="1" />
              <stop offset="45%" stopColor={timberColor} stopOpacity="0.88" />
              <stop offset="75%" stopColor="#1a1410" stopOpacity="0.55" />
              <stop offset="100%" stopColor={timberColor} stopOpacity="1" />
            </linearGradient>

            {/* Soundboard Highlights */}
            <linearGradient id="soundboxGradient" x1="20%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor={timberColor} stopOpacity="0.95" />
              <stop offset="50%" stopColor="#251a14" stopOpacity="0.4" />
              <stop offset="100%" stopColor={timberColor} stopOpacity="0.85" />
            </linearGradient>

            {/* LED String Glow Filter */}
            <filter id="stringGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Pedestal Base Shadow */}
          <ellipse cx="185" cy="186" rx="95" ry="10" fill="url(#pedestalShadow)" />

          {/* Soundbox Body (Resonant Angled Body on Right) */}
          <path
            d="M 145 174 L 272 156 L 255 72 L 232 45 Q 210 52 178 78 Z"
            fill="url(#soundboxGradient)"
            stroke={timberColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Soundboard Center Inlay Strip */}
          <path
            d="M 152 171 L 263 157"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Hand-Carved Rosette on Soundbox */}
          <g transform="translate(230, 115)">
            <circle cx="0" cy="0" r="14" fill="none" stroke={rosetteColor} strokeWidth="1.8" opacity="0.85" />
            <circle cx="0" cy="0" r="9" fill="none" stroke={rosetteColor} strokeWidth="1.2" opacity="0.65" />
            {/* Celtic Triskele Spirals inside rosette */}
            <path
              d="M 0 -7 Q 6 -2 0 3 Q -6 8 0 7 Q 6 2 0 -2 Z"
              fill={rosetteColor}
              opacity="0.9"
            />
            <circle cx="0" cy="0" r="2.5" fill={rosetteColor} />
          </g>

          {/* Harmonic Curve (Top Arch holding Levers and Tuning Pins) */}
          <path
            d="M 62 170 Q 56 75 78 40 Q 98 14 165 24 Q 215 32 238 48 Q 215 62 175 42 Q 120 34 88 56 Q 74 80 80 166 Z"
            fill="url(#timberGradient)"
            stroke={timberColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Forepillar (Graceful S-curved column connecting Arch to Base) */}
          <path
            d="M 62 170 Q 52 110 68 52 Q 74 38 78 40 Q 82 48 76 96 Q 72 135 84 166 Z"
            fill="url(#timberGradient)"
            stroke={timberColor}
            strokeWidth="1.5"
          />

          {/* Harp Feet / Base Stance */}
          <path
            d="M 54 175 L 94 175 Q 86 184 72 186 Q 58 184 54 175 Z"
            fill="url(#timberGradient)"
            stroke={timberColor}
            strokeWidth="1.5"
          />
          <path
            d="M 140 178 L 180 178 Q 172 187 160 188 Q 146 187 140 178 Z"
            fill="url(#timberGradient)"
            stroke={timberColor}
            strokeWidth="1.5"
          />

          {/* 8 Camac Levers along the Harmonic Arch */}
          {stringCoords.map((st, i) => {
            const lx = st.xTop;
            const ly = st.yTop - 5;
            return (
              <g key={`lever-${i}`}>
                {/* Lever Base */}
                <circle cx={lx} cy={ly} r="2.8" fill="#2d3748" stroke="#4a5568" strokeWidth="0.8" />
                {/* Camac Lever Handle */}
                <line
                  x1={lx}
                  y1={ly}
                  x2={lx - 3}
                  y2={ly - 7}
                  stroke={leverColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Tuning Pin */}
                <circle cx={lx + 1} cy={ly + 4} r="1.5" fill={leverColor} />
              </g>
            );
          })}

          {/* 8 Resonance Strings */}
          {stringCoords.map((st, i) => {
            const isPlucked = activeStringIndex === i;
            // Traditional Celtic string coloring: tonic red (C), subdominant blue (F)
            const baseColor = st.isTonic
              ? '#ef4444' // Red C string
              : i === 3
              ? '#38bdf8' // Blue F string
              : stringsColor;

            const glowColor = isPlucked ? '#ffffff' : stringsColor;
            const strokeWidth = isPlucked ? 3.0 : 1.8;

            return (
              <g
                key={`string-${i}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handlePluckString(i)}
              >
                {/* Broad transparent touch hit area */}
                <line
                  x1={st.xTop}
                  y1={st.yTop}
                  x2={st.xBot}
                  y2={st.yBot}
                  stroke="transparent"
                  strokeWidth="18"
                />

                {/* Outer Glow when active or illuminated */}
                <line
                  x1={st.xTop}
                  y1={st.yTop}
                  x2={st.xBot}
                  y2={st.yBot}
                  stroke={glowColor}
                  strokeWidth={isPlucked ? 5 : 2.5}
                  strokeOpacity={isPlucked ? 0.95 : 0.45}
                  filter="url(#stringGlow)"
                />

                {/* Core String Line */}
                <line
                  x1={st.xTop}
                  y1={st.yTop}
                  x2={st.xBot}
                  y2={st.yBot}
                  stroke={baseColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
      </View>

      {/* Showcase Legend Badges */}
      <View style={styles.legendRow}>
        <View style={styles.legendPill}>
          <View style={[styles.legendDot, { backgroundColor: timberColor }]} />
          <Text style={styles.legendText}>{timberName}</Text>
        </View>
        <View style={styles.legendPill}>
          <View style={[styles.legendDot, { backgroundColor: stringsColor }]} />
          <Text style={styles.legendText}>{stringsName}</Text>
        </View>
        <View style={styles.legendPill}>
          <View style={[styles.legendDot, { backgroundColor: leverColor }]} />
          <Text style={styles.legendText}>{leverName}</Text>
        </View>
        <View style={styles.legendPill}>
          <Text style={{ fontSize: 10 }}>🎵</Text>
          <Text style={styles.legendText}>{soundPackName}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: 'rgba(11, 20, 27, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: 14,
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    color: '#fef08a',
    fontSize: 11.5,
    fontWeight: '800',
  },
  strumHintBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  strumHintText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontStyle: 'italic',
  },
  harpHolder: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 185,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 198, 154, 0.15)',
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#e2e8f0',
    fontSize: 10.5,
    fontWeight: '600',
  },
});
