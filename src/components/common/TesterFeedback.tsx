import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export const FEEDBACK_URL =
  'https://wa.me/972585353148?text=' +
  encodeURIComponent("Hi Nachman, I'm testing Earpa and wanted to share some feedback:");

export function TesterFeedback() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const open = async (sms = false) => {
    if (busy) return;
    setBusy(true);
    setError('');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Linking.openURL(sms ? 'sms:+972585353148' : FEEDBACK_URL);
    } catch {
      if (!sms) {
        try {
          await Linking.openURL('sms:+972585353148');
        } catch {
          setError('WhatsApp and SMS unavailable. Contact: +972 58 535 3148.');
        }
      } else {
        setError('SMS unavailable. Contact: +972 58 535 3148.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Send tester feedback directly to founder"
        onPress={() => open(false)}
        activeOpacity={0.82}
        style={styles.pill}
      >
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.text}>
          Tester Feedback: Share ideas or bug reports directly ›
        </Text>
      </TouchableOpacity>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.42)',
    backgroundColor: 'rgba(15, 25, 20, 0.72)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  } as any,
  icon: {
    fontSize: 13,
  },
  text: {
    color: '#fef08a',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
