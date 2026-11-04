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
        accessibilityLabel="Share your feedback directly with Nachman"
        onPress={() => open(false)}
        activeOpacity={0.85}
        style={styles.celticCard}
      >
        {/* Subtle Liquid Gold Specular Top Line */}
        <View style={styles.specularTopLine} />

        <View style={styles.innerContent}>
          {/* Header Row with Celtic Triquetra Icons */}
          <View style={styles.headerRow}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.8">
              <path d="M12 2C8 6 6 10 6 14a6 6 0 0 0 12 0c0-4-2-8-6-12z" />
              <circle cx="12" cy="14" r="3" fill="#d4af37" fillOpacity="0.3" />
            </svg>
            <Text style={styles.eyebrow}>✦ FOUNDER'S DIRECT LINE ✦</Text>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.8">
              <path d="M12 2C8 6 6 10 6 14a6 6 0 0 0 12 0c0-4-2-8-6-12z" />
              <circle cx="12" cy="14" r="3" fill="#d4af37" fillOpacity="0.3" />
            </svg>
          </View>

          {/* Main Symmetrical Title */}
          <Text style={styles.title}>Share Feedback Directly with Nachman</Text>
          <Text style={styles.subtitle}>
            Your ideas, bugs, and musical impressions directly shape Earpa
          </Text>

          {/* Symmetrical CTA Button */}
          <View style={styles.ctaPill}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <Text style={styles.ctaText}>Message on WhatsApp ›</Text>
          </View>
        </View>
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
    marginVertical: 8,
  },
  celticCard: {
    width: '100%',
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(21, 32, 28, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.18)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } as any)
      : {}),
  },
  specularTopLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 0%, rgba(254, 240, 138, 0.85) 50%, rgba(212, 175, 55, 0) 100%)',
    zIndex: 2,
  } as any,
  innerContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    color: '#fef3c7',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 320,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  } as any,
  ctaText: {
    color: '#fef08a',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
