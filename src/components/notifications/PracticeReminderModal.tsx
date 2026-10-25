import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { PracticeReminderService, HARP_REMINDER_PROMPTS } from '../../services/notifications/PracticeReminderService';

interface PracticeReminderModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PracticeReminderModal: React.FC<PracticeReminderModalProps> = ({
  visible,
  onClose,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [samplePrompt, setSamplePrompt] = useState(HARP_REMINDER_PROMPTS[0]);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (visible) {
      const cfg = PracticeReminderService.getConfig();
      setEnabled(cfg.enabled);
      setPermission(PracticeReminderService.getPermissionState());
      setSamplePrompt(PracticeReminderService.getRandomPrompt());
      setTestSent(false);
    }
  }, [visible]);

  const toggleReminders = async (val: boolean) => {
    if (val) {
      const perm = await PracticeReminderService.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        setEnabled(true);
      } else {
        setEnabled(false);
      }
    } else {
      setEnabled(false);
      PracticeReminderService.saveConfig({ enabled: false, time: '19:00' });
    }
  };

  const handleTestNow = async () => {
    const success = await PracticeReminderService.sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>DAILY PRACTICE REMINDERS</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewBox}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewApp}>EARPA REMINDER PREVIEW</Text>
              <Text style={styles.previewTime}>Now</Text>
            </View>
            <Text style={styles.previewTitle}>{samplePrompt.title}</Text>
            <Text style={styles.previewBody}>{samplePrompt.body}</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.toggleLabel}>Enable Daily Notifications</Text>
              <Text style={styles.toggleSub}>
                {permission === 'granted'
                  ? 'Notifications permitted on this device'
                  : permission === 'denied'
                  ? 'Notifications blocked in browser settings'
                  : 'Tap toggle to request permission'}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={toggleReminders}
              trackColor={{ false: '#334155', true: '#c89d58' }}
              thumbColor={enabled ? '#f0d9ab' : '#94a3b8'}
            />
          </View>

          <TouchableOpacity
            style={[styles.testBtn, testSent && styles.testBtnSuccess]}
            onPress={handleTestNow}
          >
            <Text style={styles.testBtnText}>
              {testSent ? '✓ Notification Sent to Device!' : '🔔 Send Test Notification Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(20, 26, 38, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 157, 88, 0.35)',
    padding: 22,
    gap: 18,
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)' } as any,
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#ebc47a',
    letterSpacing: 1.2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#edddc0',
    fontSize: 13,
  },
  previewBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(200, 157, 88, 0.25)',
    gap: 6,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewApp: {
    color: '#c89d58',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  previewTime: {
    color: '#94a3b8',
    fontSize: 11,
  },
  previewTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  previewBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleLabel: {
    color: '#f0d9ab',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  testBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 157, 88, 0.18)',
    borderWidth: 1,
    borderColor: '#c89d58',
    alignItems: 'center',
  },
  testBtnSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
  },
  testBtnText: {
    color: '#f0d9ab',
    fontSize: 14,
    fontWeight: '700',
  },
  doneBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  doneBtnText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
