import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { CadenceEngine } from '../../services/audio/CadenceEngine';
import { CamacLeverIcon } from '../common/CelticIcons';

interface LeversTabScreenProps {
  onOpenStudio3D?: () => void;
  onOpenRoadmap?: () => void;
}

export const LeversTabScreen: React.FC<LeversTabScreenProps> = ({
  onOpenStudio3D,
  onOpenRoadmap,
}) => {
  const [levers, setLevers] = useState<boolean[]>([
    false, false, false, false, false, false, false, false,
  ]);
  const [synth] = useState(() => new HarpSoundSynthesizer('celtic_nylon'));

  const stringLabels = [
    { num: 1, base: 'Eb4', sharp: 'E4', noteName: 'Eb' },
    { num: 2, base: 'F4', sharp: 'F#4', noteName: 'F' },
    { num: 3, base: 'G4', sharp: 'G#4', noteName: 'G' },
    { num: 4, base: 'Ab4', sharp: 'A4', noteName: 'Ab' },
    { num: 5, base: 'Bb4', sharp: 'B4', noteName: 'Bb' },
    { num: 6, base: 'C5', sharp: 'C#5', noteName: 'C' },
    { num: 7, base: 'D5', sharp: 'D#5', noteName: 'D' },
    { num: 8, base: 'Eb5', sharp: 'E5', noteName: 'Eb (Octave)' },
  ];

  const handleToggleLever = async (index: number) => {
    const next = [...levers];
    next[index] = !next[index];
    setLevers(next);

    await synth.initAudio();
    // Base MIDI pitches for open Eb harp: Eb4=63, F4=65, G4=67, Ab4=68, Bb4=70, C5=72, D5=74, Eb5=75
    const baseMidiPitches = [63, 65, 67, 68, 70, 72, 74, 75];
    const pitch = baseMidiPitches[index] + (next[index] ? 1 : 0);
    const freq = CadenceEngine.midiToFreq(pitch);
    synth.playPluck(freq, 1800, 0.9);
  };

  const handleSetAll = async (allUp: boolean) => {
    const next = Array(8).fill(allUp);
    setLevers(next);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Title & Description */}
      <View style={styles.header}>
        <Text style={styles.title}>Camac Sharping Levers</Text>
        <Text style={styles.subtitle}>
          In Celtic harps, flipping a lever UP raises the string pitch by one semitone.
        </Text>
      </View>

      {/* Quick Action Bar: All Up / All Down & 3D Studio Button */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSetAll(false)}
          style={styles.pillButton}
        >
          <Text style={styles.pillButtonText}>All Down (Natural)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSetAll(true)}
          style={styles.pillButton}
        >
          <Text style={styles.pillButtonText}>All Up (Raised)</Text>
        </TouchableOpacity>
        {onOpenStudio3D && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenStudio3D}
            style={[styles.pillButton, styles.studioPill]}
          >
            <Text style={styles.studioPillText}>3D Studio</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 8 Levers Interactive Rack */}
      <View style={styles.leversRack}>
        {stringLabels.map((item, idx) => {
          const isUp = levers[idx];
          return (
            <TouchableOpacity
              key={item.num}
              activeOpacity={0.8}
              onPress={() => handleToggleLever(idx)}
              style={[
                styles.leverRow,
                isUp && styles.leverRowUp,
              ]}
            >
              <View style={styles.leverLeft}>
                <View style={[styles.stringBadge, isUp && styles.stringBadgeUp]}>
                  <Text style={styles.stringBadgeText}>{item.num}</Text>
                </View>
                <View>
                  <Text style={styles.noteNameText}>{item.noteName}</Text>
                  <Text style={styles.pitchText}>
                    {isUp ? `${item.sharp} (Lever UP)` : `${item.base} (Natural)`}
                  </Text>
                </View>
              </View>

              {/* Lever Visual Switch */}
              <View style={[styles.switchTrack, isUp && styles.switchTrackUp]}>
                <View style={[styles.switchThumb, isUp && styles.switchThumbUp]}>
                  <Text style={styles.switchIcon}>{isUp ? '▲' : '▼'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Key Signature Callout */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Circle of Fifths on Open Eb Harp</Text>
        <Text style={styles.infoText}>
          Traditional Celtic harps are tuned to Eb Major with all levers down. By flipping A, B, and E levers up successively, you seamlessly transition into Bb Major, F Major, C Major, and G Major without retuning.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryBadgeText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  trailMapBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  trailMapBtnText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillButtonText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  studioPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  studioPillText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  leversRack: {
    gap: 8,
  },
  leverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 26, 38, 0.72)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  leverRowUp: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
    backgroundColor: 'rgba(245, 158, 11, 0.09)',
  },
  leverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stringBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stringBadgeUp: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  stringBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  noteNameText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  pitchText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchTrackUp: {
    backgroundColor: '#f59e0b',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  } as any,
  switchThumbUp: {
    transform: [{ translateX: 22 }],
  },
  switchIcon: {
    fontSize: 9,
    color: '#0f172a',
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
  },
  infoTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 17,
  },
});
