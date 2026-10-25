import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { cloud, syncCloudAccount, migrateActiveLocalProfileToCloud } from '../../services/account/CloudAccounts';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';

export function CloudAccountPanel() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const db = UserAccountDatabase.getInstance();
  const currentProfile = db.getActiveProfile();

  const sync = async () => {
    setBusy(true);
    try {
      const who = await syncCloudAccount();
      setMessage(`Synced successfully · ${who}`);
    } catch (e: any) {
      setMessage(e.message || 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  const migrate = async () => {
    setBusy(true);
    try {
      const who = await migrateActiveLocalProfileToCloud();
      setMessage(`Migrated local profile to cloud · ${who}`);
    } catch (e: any) {
      setMessage(e.message || 'Migration failed');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!cloud) return;
    cloud.auth.getSession().then(({ data }) => {
      if (data.session) void sync();
    });
  }, []);

  if (!cloud) {
    return (
      <View style={styles.card}>
        <Text style={styles.notice}>
          Email cloud sync is available when configured with Supabase credentials.
          All your progress, tunings, and sessions are safely saved locally on this browser.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Cloud Account & Cross-Device Sync</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Email address"
        placeholder="Enter email address"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />
      <TouchableOpacity
        disabled={busy}
        onPress={async () => {
          if (!email.includes('@')) {
            setMessage('Please enter a valid email address.');
            return;
          }
          setBusy(true);
          try {
            const { error } = await cloud!.auth.signInWithOtp({
              email: email.trim(),
              options: { emailRedirectTo: window.location.origin },
            });
            if (error) throw error;
            setMessage('Check your email for a secure sign-in magic link.');
          } catch (e: any) {
            setMessage(e.message);
          } finally {
            setBusy(false);
          }
        }}
        style={styles.primaryBtn}
      >
        <Text style={styles.primaryBtnText}>Send Magic Sign-in Link →</Text>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity disabled={busy} onPress={sync} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Sync Cloud Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={busy} onPress={migrate} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Migrate Local Progress</Text>
        </TouchableOpacity>
      </View>

      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {busy ? 'Connecting to cloud...' : message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(200, 157, 88, 0.25)',
  },
  title: {
    color: '#ead6af',
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
  },
  notice: {
    color: '#b8ad97',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 8,
  },
  input: {
    color: '#efdfbd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(200, 157, 88, 0.35)',
    fontSize: 14,
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 157, 88, 0.22)',
    borderWidth: 1,
    borderColor: '#c89d58',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#f0d9ab',
    fontWeight: '700',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  status: {
    color: '#fde047',
    fontSize: 12,
    textAlign: 'center',
    minHeight: 16,
  },
});
