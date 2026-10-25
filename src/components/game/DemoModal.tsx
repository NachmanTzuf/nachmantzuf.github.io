import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { CadenceEngine } from '../../services/audio/CadenceEngine';
import { TuningMatrixEngine } from '../../services/curriculum/TuningMatrixEngine';

export type DemoType = 'single' | 'melody' | 'levers';

interface DemoModalProps {
  visible: boolean;
  initialType?: DemoType;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  visible,
  initialType = 'single',
  onClose,
}) => {
  const [activeType, setActiveType] = useState<DemoType>(initialType);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [interactiveGuess, setInteractiveGuess] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  
  const synthRef = useRef<HarpSoundSynthesizer>(new HarpSoundSynthesizer('celtic_nylon'));
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setActiveType(initialType);
    setDemoStep(0);
    setInteractiveGuess(null);
    setFeedback('');
  }, [initialType, visible]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      synthRef.current.dispose();
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  const markDemoCompleted = (type: DemoType) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`earpa_demo_completed_${type}`, 'true');
    }
  };

  // Demo 1: Single Note Walkthrough
  const playSingleNoteDemoCadence = () => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    setFeedback('Listening to I - IV - V - I cadence establishing C tonic...');
    synthRef.current.initAudio();
    synthRef.current.unlockSynchronously();

    const rootMidi = 60; // C4
    const cadenceEngine = new CadenceEngine();
    const chords = cadenceEngine.generateCadence(rootMidi, 'inverted', false);

    let delay = 100;
    chords.forEach((chord, idx) => {
      later(() => {
        synthRef.current.playChord(chord, true);
        setFeedback(`Cadence chord ${idx + 1} of 4 · Anchor to home C`);
      }, delay);
      delay += chord.durationMs;
    });

    // Mystery note: Degree 4 (Fa / F4, midi 65)
    delay += 350;
    later(() => {
      setFeedback('Now listen to the mystery note...');
      synthRef.current.playPluck(CadenceEngine.midiToFreq(65), 1500, 0.92);
      setDemoStep(1);
      setIsAudioPlaying(false);
    }, delay);
  };

  const handleSingleNoteGuess = (deg: string) => {
    setInteractiveGuess(deg);
    const targetDeg = '4';
    const isCorrect = deg === targetDeg;
    synthRef.current.initAudio();
    synthRef.current.unlockSynchronously();

    // Play guessed note
    const intervals: Record<string, number> = { '1': 0, '2': 2, '3': 4, '4': 5, '5': 7, '6': 9, '7': 11, '8': 12 };
    const guessedMidi = 60 + (intervals[deg] || 0);
    synthRef.current.playPluck(CadenceEngine.midiToFreq(guessedMidi), 900, 0.9);

    // Play resolution walk down 4 -> 3 -> 2 -> 1
    later(() => {
      setFeedback('Resolution walk: 4 (Fa) → 3 (Mi) → 2 (Re) → 1 (Do)');
      [65, 64, 62, 60].forEach((m, idx) => {
        later(() => {
          synthRef.current.playPluck(CadenceEngine.midiToFreq(m), idx === 3 ? 1600 : 560, 0.9);
        }, idx * 560);
      });
      later(() => {
        setFeedback(isCorrect
          ? 'Spot on! Degree 4 wants to resolve down to the tonic.'
          : 'Notice how Degree 4 pulls gravitationally downward to 1.');
        setDemoStep(2);
        markDemoCompleted('single');
      }, 4 * 560 + 400);
    }, 450);
  };

  // Demo 2: Multi-Note Walkthrough
  const playMelodyDemoSequence = () => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    setFeedback('Listen to a 2-note melodic motif (3 → 5)...');
    synthRef.current.initAudio();
    synthRef.current.unlockSynchronously();

    // Notes: 3 (E4, midi 64) and 5 (G4, midi 67)
    later(() => {
      synthRef.current.playPluck(CadenceEngine.midiToFreq(64), 800, 0.9);
    }, 150);
    later(() => {
      synthRef.current.playPluck(CadenceEngine.midiToFreq(67), 1200, 0.9);
      setIsAudioPlaying(false);
      setDemoStep(1);
      setFeedback('Tap the 2 notes in order: 3 then 5');
    }, 550);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>INTERACTIVE DEMO</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.selectorRow}>
            {(['single', 'melody', 'levers'] as DemoType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setActiveType(t);
                  setDemoStep(0);
                  setInteractiveGuess(null);
                  setFeedback('');
                }}
                style={[styles.tabChip, activeType === t && styles.tabChipActive]}
              >
                <Text style={[styles.tabChipText, activeType === t && styles.tabChipTextActive]}>
                  {t === 'single' ? 'Single Note' : t === 'melody' ? 'Melodic Sequence' : 'Sharping Levers'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody}>
            {/* DEMO 1: SINGLE NOTE */}
            {activeType === 'single' && (
              <View style={styles.demoSection}>
                <Text style={styles.sectionHeader}>Functional Relative Pitch</Text>
                <Text style={styles.bodyText}>
                  Earpa does not train isolated pitch memory. It anchors your ear to the tonal center (1 / Do),
                  so every scale degree has a distinct gravitational pull back home.
                </Text>

                {demoStep === 0 && (
                  <TouchableOpacity
                    style={[styles.actionBtn, isAudioPlaying && { opacity: 0.6 }]}
                    onPress={playSingleNoteDemoCadence}
                    disabled={isAudioPlaying}
                  >
                    <Text style={styles.actionBtnText}>
                      {isAudioPlaying ? 'Playing cadence...' : '▶ Listen to Cadence & Mystery Note'}
                    </Text>
                  </TouchableOpacity>
                )}

                {demoStep >= 1 && (
                  <View style={styles.interactiveArea}>
                    <Text style={styles.promptText}>Which degree did you hear?</Text>
                    <View style={styles.degreesRow}>
                      {['1', '2', '3', '4', '5'].map((d) => (
                        <TouchableOpacity
                          key={d}
                          style={[
                            styles.degreeBtn,
                            interactiveGuess === d && (d === '4' ? styles.degreeBtnCorrect : styles.degreeBtnWrong),
                          ]}
                          onPress={() => handleSingleNoteGuess(d)}
                        >
                          <Text style={styles.degreeBtnText}>{d}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

                {demoStep === 2 && (
                  <View style={styles.successCard}>
                    <Text style={styles.successTitle}>✓ Single Note Method Mastered</Text>
                    <Text style={styles.successBody}>
                      Notice how Degree 4 feels like a hanging breath resolving to 3, 2, and 1.
                      You are ready to practice real levels!
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* DEMO 2: MELODY SEQUENCE */}
            {activeType === 'melody' && (
              <View style={styles.demoSection}>
                <Text style={styles.sectionHeader}>Melodic Motif Sequence</Text>
                <Text style={styles.bodyText}>
                  Melody mode trains your working memory for 2, 3, and 4 note phrases.
                  Listen to the phrase, then tap each note in order.
                </Text>

                {demoStep === 0 && (
                  <TouchableOpacity
                    style={[styles.actionBtn, isAudioPlaying && { opacity: 0.6 }]}
                    onPress={playMelodyDemoSequence}
                    disabled={isAudioPlaying}
                  >
                    <Text style={styles.actionBtnText}>
                      {isAudioPlaying ? 'Playing motif...' : '▶ Play Sample 2-Note Motif'}
                    </Text>
                  </TouchableOpacity>
                )}

                {demoStep >= 1 && (
                  <View style={styles.interactiveArea}>
                    <Text style={styles.promptText}>Tap the motif notes (3 then 5):</Text>
                    <View style={styles.degreesRow}>
                      {['1', '2', '3', '4', '5'].map((d) => (
                        <TouchableOpacity
                          key={d}
                          style={styles.degreeBtn}
                          onPress={() => {
                            synthRef.current.initAudio();
                            synthRef.current.unlockSynchronously();
                            const midi = 60 + ({ '1': 0, '2': 2, '3': 4, '4': 5, '5': 7 }[d] || 0);
                            synthRef.current.playPluck(CadenceEngine.midiToFreq(midi), 800, 0.9);
                            if (d === '5') {
                              setFeedback('Correct! 3 (Mi) → 5 (Sol). Sequence successfully identified.');
                              setDemoStep(2);
                              markDemoCompleted('melody');
                            }
                          }}
                        >
                          <Text style={styles.degreeBtnText}>{d}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

                {demoStep === 2 && (
                  <View style={styles.successCard}>
                    <Text style={styles.successTitle}>✓ Sequence Method Mastered</Text>
                    <Text style={styles.successBody}>
                      Motifs are replayed at tempo without resolution walks, building real harp ear memory.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* DEMO 3: LEVERS */}
            {activeType === 'levers' && (
              <View style={styles.demoSection}>
                <Text style={styles.sectionHeader}>Celtic Sharping Levers</Text>
                <Text style={styles.bodyText}>
                  A Celtic harp changes keys by engaging sharping levers on the neck.
                  Each engaged lever raises that string by exactly one semitone (+1 half step).
                </Text>

                <View style={styles.ruleCard}>
                  <Text style={styles.ruleTitle}>The 3 Core Lutherie Laws</Text>
                  <Text style={styles.ruleItem}>1. Levers only raise pitch (+1 semitone); they never lower.</Text>
                  <Text style={styles.ruleItem}>2. Clockwise steps on Circle of Fifths = Raised lever groups.</Text>
                  <Text style={styles.ruleItem}>3. Both C levers (C4 and C5) must always change together.</Text>
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    synthRef.current.initAudio();
                    synthRef.current.unlockSynchronously();
                    // Play C4 open, then C4 sharp (+1)
                    synthRef.current.playPluck(CadenceEngine.midiToFreq(60), 600, 0.85);
                    later(() => {
                      synthRef.current.playPluck(CadenceEngine.midiToFreq(61), 1000, 0.92);
                      setFeedback('Open C (60) → Engaged C♯ (61). Exactly one half step higher.');
                      setDemoStep(1);
                      markDemoCompleted('levers');
                    }, 400);
                  }}
                >
                  <Text style={styles.actionBtnText}>♫ Hear Lever Semitone Shift</Text>
                </TouchableOpacity>

                {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
              </View>
            )}
          </ScrollView>

          {/* Footer Controls */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip / Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                markDemoCompleted(activeType);
                onClose();
              }}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Got it, let's play →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
    backgroundColor: 'rgba(20, 26, 38, 0.94)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 157, 88, 0.35)',
    padding: 20,
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)' } as any,
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  modalTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#ebc47a',
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#edddc0',
    fontSize: 14,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: 'rgba(200, 157, 88, 0.2)',
    borderColor: '#c89d58',
  },
  tabChipText: {
    color: '#a0aec0',
    fontSize: 12,
    fontWeight: '600',
  },
  tabChipTextActive: {
    color: '#f0d9ab',
  },
  scrollBody: {
    paddingVertical: 8,
    gap: 16,
  },
  demoSection: {
    gap: 12,
  },
  sectionHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#f0d9ab',
  },
  bodyText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  actionBtn: {
    backgroundColor: 'rgba(200, 157, 88, 0.18)',
    borderWidth: 1,
    borderColor: '#c89d58',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  actionBtnText: {
    color: '#f0d9ab',
    fontSize: 15,
    fontWeight: '700',
  },
  interactiveArea: {
    gap: 8,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  promptText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  degreesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  degreeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  degreeBtnCorrect: {
    backgroundColor: 'rgba(74, 222, 128, 0.25)',
    borderColor: '#4ade80',
  },
  degreeBtnWrong: {
    backgroundColor: 'rgba(248, 113, 113, 0.25)',
    borderColor: '#f87171',
  },
  degreeBtnText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackText: {
    color: '#fde047',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 4,
  },
  successCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: '#22c55e',
    gap: 6,
  },
  successTitle: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '700',
  },
  successBody: {
    color: '#dcfce7',
    fontSize: 13,
    lineHeight: 18,
  },
  ruleCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(210, 183, 126, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(210, 183, 126, 0.25)',
    gap: 6,
  },
  ruleTitle: {
    color: '#f0d9ab',
    fontSize: 14,
    fontWeight: '700',
  },
  ruleItem: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipBtnText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  doneBtn: {
    backgroundColor: '#c89d58',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  doneBtnText: {
    color: '#0d111a',
    fontSize: 14,
    fontWeight: '700',
  },
});
