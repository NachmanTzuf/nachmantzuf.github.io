import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { CadenceEngine } from '../../services/audio/CadenceEngine';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { ResolutionWalker } from '../../services/audio/ResolutionWalker';
import { TriquetraChordIcon } from '../common/CelticIcons';

interface ChordsTabScreenProps {
  rootMidi?: number;
  onStartChordChallenge?: () => void;
  onOpenRoadmap?: () => void;
}

export const ChordsTabScreen: React.FC<ChordsTabScreenProps> = ({
  rootMidi = 63, // Eb default
  onStartChordChallenge,
  onOpenRoadmap,
}) => {
  const [synth] = useState(() => new HarpSoundSynthesizer('celtic_nylon'));
  const [cadenceEngine] = useState(() => new CadenceEngine());

  // Sequence Training State: 2 notes, 3 notes, or 4 notes in a row
  const [sequenceLength, setSequenceLength] = useState<2 | 3 | 4>(2);
  const [targetSequence, setTargetSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('Select sequence length and tap Play Melody Sequence');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  // Generate and play a sequence of notes
  const handlePlaySequence = async () => {
    await synth.initAudio();
    setIsPlaying(true);
    setUserSequence([]);
    setIsSuccess(null);

    // Generate random diatonic scale degrees (1 through 8)
    const seq: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      seq.push(Math.floor(Math.random() * 8) + 1);
    }
    setTargetSequence(seq);
    setFeedback(`Listening to ${sequenceLength} notes in a row...`);

    // Play cadence first to anchor tonal center, then play sequence
    const cadenceChords = cadenceEngine.generateCadence(rootMidi, 'inverted');
    // Play quick cadence
    synth.playChord({...cadenceChords[0],durationMs:900});
    setTimeout(() => {
      synth.playChord({...cadenceChords[3],durationMs:1000});
    }, 450);

    // Play melody notes spaced by 400ms after cadence
    seq.forEach((deg, idx) => {
      setTimeout(() => {
        const semitones = ResolutionWalker.getSemitones(String(deg) as any);
        const freq = CadenceEngine.midiToFreq(rootMidi + semitones);
        synth.playPluck(freq, 1600, 0.92);
      }, 1000 + idx * 420);
    });

    setTimeout(() => {
      setIsPlaying(false);
      setFeedback(`Enter the ${sequenceLength} notes in the order you heard them`);
    }, 1000 + sequenceLength * 420);
  };

  // User taps a scale degree note
  const handleTapDegree = async (deg: number) => {
    if (isPlaying || targetSequence.length === 0) return;
    await synth.initAudio();
    const semitones = ResolutionWalker.getSemitones(String(deg) as any);
    const freq = CadenceEngine.midiToFreq(rootMidi + semitones);
    synth.playPluck(freq, 1400, 0.88);

    const nextUserSeq = [...userSequence, deg];
    setUserSequence(nextUserSeq);

    // Check if sequence is complete
    if (nextUserSeq.length === targetSequence.length) {
      const match = nextUserSeq.every((val, i) => val === targetSequence[i]);
      if (match) {
        setIsSuccess(true);
        setFeedback(`Exact Match: [${nextUserSeq.join(' → ')}]! Harmonic ear precision.`);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([20, 40, 20]);
        }
      } else {
        setIsSuccess(false);
        setFeedback(`Target was [${targetSequence.join(' → ')}]. You guessed [${nextUserSeq.join(' → ')}].`);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Melodic Sequence Ear Training</Text>
        <Text style={styles.subtitle}>
          Train your ear to identify sequences of notes in succession. Master 2 notes, then 3 notes, then 4 notes in a row.
        </Text>
      </View>

      {/* Sequence Length Difficulty Selector */}
      <View style={styles.lengthCard}>
        <Text style={styles.lengthCardLabel}>SEQUENCE LENGTH:</Text>
        <View style={styles.lengthPillsRow}>
          {([2, 3, 4] as const).map((len) => {
            const isActive = sequenceLength === len;
            return (
              <TouchableOpacity
                key={len}
                activeOpacity={0.8}
                onPress={() => {
                  setSequenceLength(len);
                  setTargetSequence([]);
                  setUserSequence([]);
                  setIsSuccess(null);
                  setFeedback(`Difficulty: ${len} notes in a row. Tap Play Melody Sequence.`);
                }}
                style={[
                  styles.lengthPill,
                  isActive && styles.lengthPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.lengthPillText,
                    isActive && styles.lengthPillTextActive,
                  ]}
                >
                  {len} Notes
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Primary Action Button: Play Sequence */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isPlaying}
        onPress={handlePlaySequence}
        style={[
          styles.playSequenceBtn,
          isPlaying && styles.btnDisabled,
        ]}
      >
        <Text style={styles.playSequenceBtnText}>
          {isPlaying ? 'PLUCKING HARP MELODY...' : `▶ PLAY ${sequenceLength}-NOTE SEQUENCE`}
        </Text>
      </TouchableOpacity>

      {/* Interactive Sequence Slots & Feedback Display */}
      <View style={styles.slotsCard}>
        <Text style={styles.feedbackText}>{feedback}</Text>
        <View style={styles.slotsRow}>
          {Array.from({ length: sequenceLength }).map((_, i) => {
            const val = userSequence[i];
            const isFilled = val !== undefined;
            return (
              <View
                key={i}
                style={[
                  styles.slotBox,
                  isFilled && styles.slotBoxFilled,
                  isSuccess === true && styles.slotBoxSuccess,
                  isSuccess === false && styles.slotBoxError,
                ]}
              >
                <Text style={styles.slotBoxText}>
                  {isFilled ? val : '?'}
                </Text>
                <Text style={styles.slotBoxLabel}>Note {i + 1}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 8-Degree Touch Shelf for Input */}
      <View style={styles.shelfCard}>
        <Text style={styles.shelfTitle}>TAP THE SCALE DEGREES IN ORDER:</Text>
        <View style={styles.degreesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((deg) => (
            <TouchableOpacity
              key={deg}
              activeOpacity={0.75}
              disabled={isPlaying || userSequence.length >= sequenceLength}
              onPress={() => handleTapDegree(deg)}
              style={styles.degreeKeyBtn}
            >
              <Text style={styles.degreeKeyNum}>{deg}</Text>
              <Text style={styles.degreeKeySolf}>
                {ResolutionWalker.getSolfege(String(deg) as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
    gap: 14,
  },
  header: {
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitleWrap: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.18)',
    borderWidth: 0.8,
    borderColor: '#c084fc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  categoryBadgeText: {
    color: '#e9d5ff',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  trailMapBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderWidth: 1,
    borderColor: '#c084fc',
    marginLeft: 8,
  },
  trailMapBtnText: {
    color: '#f5d0fe',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  lengthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  lengthCardLabel: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lengthPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  lengthPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  lengthPillActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.3)',
    borderColor: '#c084fc',
  },
  lengthPillText: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  lengthPillTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  playSequenceBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 18px rgba(124, 58, 237, 0.45)',
  } as any,
  btnDisabled: {
    opacity: 0.6,
  },
  playSequenceBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  slotsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    padding: 14,
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  feedbackText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  slotBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBoxFilled: {
    backgroundColor: 'rgba(192, 132, 252, 0.25)',
    borderColor: '#c084fc',
  },
  slotBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#10b981',
  },
  slotBoxError: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#ef4444',
  },
  slotBoxText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  slotBoxLabel: {
    color: '#94a3b8',
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 1,
  },
  shelfCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    padding: 12,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  shelfTitle: {
    color: '#cbd5e1',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  degreesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  degreeKeyBtn: {
    width: 72,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  degreeKeyNum: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
  degreeKeySolf: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
  },
});
