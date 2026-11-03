import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Switch, StyleSheet, Platform } from 'react-native';
import { PracticeReminderService as Reminder } from '../../services/notifications/PracticeReminderService';

interface PracticeReminderModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PracticeReminderModal({ visible, onClose }: PracticeReminderModalProps) {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('18:30');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [permissionState, setPermissionState] = useState<string>('default');

  const checkStatus = () => {
    const c = Reminder.getConfig();
    setTime(c.time || '18:30');
    setEnabled(c.enabled);
    const perm = Reminder.getPermissionState();
    setPermissionState(perm);
    if (!Reminder.isSupported()) {
      setMessage('Notifications are not supported in this browser.');
    } else if (perm === 'denied') {
      setMessage('Notifications are currently blocked. Please enable permissions in your browser or device settings.');
    } else if (c.enabled) {
      setMessage(`Daily reminder active for ${c.time || '18:30'}.`);
    } else {
      setMessage('Choose your practice time and toggle daily reminders on.');
    }
  };

  useEffect(() => {
    if (visible) {
      checkStatus();
    }
  }, [visible]);

  const handleToggle = async (value: boolean) => {
    setBusy(true);
    try {
      const resultMsg = await Reminder.configure(value, time);
      setEnabled(value);
      setPermissionState(Reminder.getPermissionState());
      setMessage(resultMsg);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to update reminder.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTime = async () => {
    setBusy(true);
    try {
      if (enabled) {
        const resultMsg = await Reminder.configure(true, time);
        setMessage(resultMsg);
      } else {
        const config = Reminder.getConfig();
        Reminder.saveConfig({ ...config, time });
        setMessage(`Practice time updated to ${time}. Turn reminders ON to activate.`);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Invalid time.');
    } finally {
      setBusy(false);
    }
  };

  const handleTestNotification = async () => {
    setBusy(true);
    setMessage('Sending test notification...');
    try {
      const sent = await Reminder.sendTestNotification();
      setPermissionState(Reminder.getPermissionState());
      if (sent) {
        setMessage('🔔 Test notification sent! Check your notification bar or desktop banner.');
      } else {
        const perm = Reminder.getPermissionState();
        if (perm === 'denied') {
          setMessage('Permission blocked. Please allow notifications in your browser settings and try again.');
        } else {
          setMessage('Notification could not be dispatched. Ensure browser allows alerts.');
        }
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Test failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.eyebrow}>EARPA · DAILY REMINDER</Text>
          <Text style={styles.title}>Practice Sanctuary</Text>
          <Text style={styles.subtitle}>
            A 10-minute daily listening moment to sharpen your Celtic harp ear.
          </Text>

          {/* Time Picker / Input */}
          <View style={styles.timeSection}>
            <Text style={styles.sectionLabel}>Preferred Practice Time (24h)</Text>
            <View style={styles.timeRow}>
              <TextInput
                accessibilityLabel="Daily reminder time in 24-hour format"
                value={time}
                onChangeText={setTime}
                placeholder="18:30"
                placeholderTextColor="#78716c"
                maxLength={5}
                style={styles.timeInput}
              />
              <TouchableOpacity
                disabled={busy}
                onPress={handleSaveTime}
                style={styles.saveTimeBtn}
              >
                <Text style={styles.saveTimeText}>Save Time</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Reminders Toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.toggleLabel}>Daily Evening Reminder</Text>
              <Text style={styles.toggleSub}>
                {permissionState === 'granted'
                  ? 'Permission granted · Ready'
                  : permissionState === 'denied'
                  ? 'Permission blocked in settings'
                  : 'Tap to request notification permission'}
              </Text>
            </View>
            <Switch
              disabled={busy}
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#059669' }}
              thumbColor={enabled ? '#34d399' : '#94a3b8'}
            />
          </View>

          {/* Test Notification Button */}
          <TouchableOpacity
            disabled={busy}
            nativeID="send-test-notification-btn"
            onPress={handleTestNotification}
            style={styles.testBtn}
          >
            <Text style={styles.testBtnText}>🔔 Send a Test Notification Now</Text>
          </TouchableOpacity>

          {/* Status Alert Message */}
          {!!message && (
            <View style={styles.messageBox}>
              <Text accessibilityRole="alert" style={styles.messageText}>
                {message}
              </Text>
            </View>
          )}

          {/* Done Button */}
          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 18, 14, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    gap: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(20, 36, 28, 0.95)',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
  } as any,
  eyebrow: {
    color: '#d4af37',
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'Cinzel-Bold',
  },
  title: {
    color: '#fef08a',
    fontSize: 24,
    fontFamily: 'Cinzel-Bold',
    textAlign: 'center',
    marginTop: -4,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  timeSection: {
    gap: 6,
    marginTop: 6,
  },
  sectionLabel: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    color: '#fffbeb',
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(10, 20, 16, 0.75)',
    textAlign: 'center',
  },
  saveTimeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  saveTimeText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSub: {
    color: '#94a3b8',
    fontSize: 11,
  },
  testBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: '#d4af37',
    alignItems: 'center',
  },
  testBtnText: {
    color: '#fef08a',
    fontSize: 13,
    fontWeight: '700',
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  doneBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
