/**
 * EARPA UNIFIED PREFERENCES & AUDIO SETTINGS MODAL
 * Tucks all user preferences neatly into a single, elegant modal dialog.
 * Includes Harper profile photo and name, tactile haptic feedback mode,
 * note notation (1 2 3 / Do Re Mi / C D E), native Pythagorean tuning,
 * daily practice reminders, PWA install shortcut, and cloud account sync.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';
import { PhotoPicker } from '../account/ProfilePhoto';
import { NativeTuningSelector } from './NativeTuningSelector';
import { PracticeReminderModal } from '../notifications/PracticeReminderModal';
import { CloudAccountPanel } from '../account/CloudAccountPanel';

interface UnifiedPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const UnifiedPreferencesModal: React.FC<UnifiedPreferencesModalProps> = ({
  visible,
  onClose,
}) => {
  const db = UserAccountDatabase.getInstance();
  const profile = db.getActiveProfile();
  const [reminderOpen, setReminderOpen] = useState(false);
  const [, setRefresh] = useState(0);

  const forceRefresh = () => setRefresh((n) => n + 1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Subtle Celtic Glass Background */}
          <Image
            source={{ uri: '/images/earpa_journey_bg.jpg' }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.tintOverlay} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>SETTINGS & TUNING</Text>
                <Text style={styles.title}>Preferences</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close preferences"
                onPress={onClose}
                style={styles.closeIconBtn}
              >
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Section 1: Profile Photo & Display Name */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Harper Profile</Text>
              <PhotoPicker
                name={profile.displayName}
                uri={profile.avatarPhoto}
                onChange={(avatarPhoto) => {
                  db.updateActiveProfile({ avatarPhoto });
                  forceRefresh();
                }}
              />
              <View style={{ marginTop: 12, gap: 6 }}>
                <Text style={styles.fieldLabel}>Display Name</Text>
                <TextInput
                  accessibilityLabel="Edit display name"
                  defaultValue={profile.displayName}
                  key={profile.id}
                  onEndEditing={(e) => {
                    const text = e.nativeEvent.text.trim();
                    if (text) {
                      db.updateActiveProfile({ displayName: text });
                      forceRefresh();
                    }
                  }}
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#8a998d"
                />
              </View>
            </View>

            {/* Section 2: Haptic Vibration Mode */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Vibration Feedback</Text>
              <Text style={styles.helperText}>
                {db.getHapticMode() === 'minimal'
                  ? 'Minimal: Vibrates only when you pluck a string or toggle a lever. Cadence audio has zero vibration.'
                  : db.getHapticMode() === 'off'
                  ? 'Off: All device vibrations are completely disabled.'
                  : 'Full: Vibrates on player interactions and background cadence pulses.'}
              </Text>
              <View style={styles.segmentedRow}>
                {(['minimal', 'off', 'full'] as const).map((mode) => {
                  const isSelected = db.getHapticMode() === mode;
                  const label = mode === 'minimal' ? 'Minimal' : mode === 'off' ? 'Off' : 'Full';
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => {
                        db.setHapticMode(mode);
                        forceRefresh();
                      }}
                      style={[
                        styles.segmentBtn,
                        isSelected && styles.segmentBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentBtnText,
                          isSelected && styles.segmentBtnTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Note Names & Solfège Notation */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Note Names & Solfège</Text>
              <Text style={styles.helperText}>
                Choose how pitch degrees and notes are rendered across the app.
              </Text>
              <View style={styles.segmentedRow}>
                {(['numbers', 'solfege', 'notes'] as const).map((n, i) => {
                  const isSelected = profile.notationPreference === n;
                  const label = ['1 2 3', 'Do Re Mi', 'C D E'][i];
                  return (
                    <TouchableOpacity
                      key={n}
                      onPress={() => {
                        db.updateActiveProfile({ notationPreference: n });
                        forceRefresh();
                      }}
                      style={[
                        styles.segmentBtn,
                        isSelected && styles.segmentBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentBtnText,
                          isSelected && styles.segmentBtnTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 4: Native Pythagorean & Celtic Harp Tuning */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Native Harp Tuning</Text>
              <NativeTuningSelector themeColor="#c7ad7b" />
            </View>

            {/* Section 5: Daily Practice Reminders */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Daily Practice Reminder</Text>
              <Text style={styles.helperText}>
                Receive a daily prompt at your preferred practice hour to maintain your streak.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setReminderOpen(true)}
                style={styles.actionPillBtn}
              >
                <Text style={styles.actionPillIcon}>🔔</Text>
                <Text style={styles.actionPillText}>Configure Practice Notification ›</Text>
              </TouchableOpacity>
            </View>

            {/* Section 6: Install App Shortcut */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Install Earpa App</Text>
              <Text style={styles.helperText}>
                Add to your Home Screen for full screen 120Hz display and offline play.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  if (Platform.OS === 'web') {
                    const prompt = (window as any).__pwaInstallPrompt;
                    if (prompt) {
                      prompt.prompt();
                      prompt.userChoice.then((choice: any) => {
                        (window as any).__pwaInstallPrompt = null;
                      });
                    } else {
                      alert('To install Earpa on your device:\n\n• On Android: Tap Chrome menu (⋮) → "Install app" or "Add to Home screen"\n• On iOS (Safari): Tap Share (⎋) → "Add to Home Screen"');
                    }
                  }
                }}
                style={styles.actionPillBtn}
              >
                <Text style={styles.actionPillIcon}>📲</Text>
                <Text style={styles.actionPillText}>Add to Home Screen / Install ›</Text>
              </TouchableOpacity>
            </View>

            {/* Section 7: Cloud Account Sync */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Cloud Account & Sync</Text>
              <CloudAccountPanel />
            </View>

            {/* Done / Close Button */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Done"
              onPress={onClose}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>Save & Close</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Child Reminder Modal */}
          <PracticeReminderModal
            visible={reminderOpen}
            onClose={() => setReminderOpen(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    borderRadius: 24,
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
        } as any)
      : {}),
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 13, 22, 0.88)',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    position: 'relative',
    zIndex: 10,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(220, 198, 154, 0.2)',
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 10.5,
    letterSpacing: 2,
    fontWeight: '800',
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#fef08a',
    marginTop: 2,
  },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    color: '#fae8c2',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSection: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 30, 24, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.25)',
    gap: 10,
  },
  sectionHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#fae8c2',
  },
  helperText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#bfb39a',
    fontWeight: '600',
  },
  input: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.35)',
    color: '#fef08a',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.20)',
    borderColor: '#34d399',
  },
  segmentBtnText: {
    fontSize: 13,
    color: '#c0b59d',
    fontWeight: '500',
  },
  segmentBtnTextActive: {
    color: '#a7f3d0',
    fontWeight: '700',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  actionPillIcon: {
    fontSize: 16,
  },
  actionPillText: {
    color: '#fef08a',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(217, 119, 6, 0.4)',
        } as any)
      : {}),
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
