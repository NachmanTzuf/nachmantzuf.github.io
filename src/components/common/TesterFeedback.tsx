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
        style={styles.symmetricalCard}
      >
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.text}>
          Share Feedback Directly with Nachman ›
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
    marginVertical: 4,
  },
  symmetricalCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.28)',
    backgroundColor: 'rgba(15, 25, 20, 0.65)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  icon: {
    fontSize: 14,
  },
  text: {
    fontFamily: 'Cinzel-Bold',
    color: '#fae8c2',
    fontSize: 13,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
