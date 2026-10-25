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
import { PracticeReminderService } from '../../services/notifications/PracticeReminderService';

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
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (visible) {
      const cfg = PracticeReminderService.getConfig();
      setEnabled(cfg.enabled);
      setPermission(PracticeReminderService.getPermissionState());
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
      setTimeout(() => setTestSent(false), 3500);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header with Title and Close X */}
          <View style={styles.header}>
            <Text style={styles.title}>Daily Practice Reminder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Clean Minimal Description */}
          <Text style={styles.subtitle}>
            A short, fun daily chime to keep your ear sharp and practice flowing.
          </Text>

          {/* Toggle Switch Row */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.toggleLabel}>Daily notifications</Text>
              <Text style={styles.toggleStatus}>
                {permission === 'granted'
                  ? (enabled ? 'Active · Reminding you once daily' : 'Turned off')
                  : permission === 'denied'
                  ? 'Notifications blocked in browser'
                  : 'Tap toggle to enable'}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={toggleReminders}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#059669' }}
              thumbColor={enabled ? '#34d399' : '#94a3b8'}
            />
          </View>

          {/* Send Notification Now Button */}
          <TouchableOpacity
            style={[styles.testBtn, testSent && styles.testBtnSuccess]}
            onPress={handleTestNow}
            activeOpacity={0.8}
          >
            <Text style={styles.testBtnText}>
              {testSent ? '✓ Sent to device' : 'Send notification now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 8, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1b2a1f',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    padding: 24,
    gap: 20,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.55)',
        } as any)
      : {}),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#fae8c2',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#c2b69d',
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  toggleStatus: {
    fontSize: 12,
    color: '#94a3b8',
  },
  testBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  testBtnSuccess: {
    backgroundColor: '#047857',
  },
  testBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
