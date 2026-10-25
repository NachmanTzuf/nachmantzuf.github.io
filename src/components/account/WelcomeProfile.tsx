import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { UserAccountDatabase, UserProfile } from '../../services/account/UserAccountDatabase';
import { NativeHarpTuning, TuningMatrixEngine } from '../../services/curriculum/TuningMatrixEngine';
import { PhotoPicker, ProfilePhoto } from './ProfilePhoto';
import { Reveal } from '../common/Reveal';
import { cloud, syncCloudAccount } from '../../services/account/CloudAccounts';

export function WelcomeProfile({ onDone }: { onDone: () => void }) {
  const db = UserAccountDatabase.getInstance();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [tuning, setTuning] = useState<NativeHarpTuning>('Eb_Major_Native');
  const [notation, setNotation] = useState<'numbers' | 'solfege' | 'notes'>('numbers');
  const [experience, setExperience] = useState<UserProfile['experienceLevel']>('Beginner Harper');
  const [skip, setSkip] = useState(false);

  // Login mode states
  const [cloudEmail, setCloudEmail] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const save = () => {
    db.createAccount({
      username: `harper_${Date.now()}`,
      displayName: name.trim() || 'Harper',
      avatarIcon: '',
      avatarColor: '#c3a36d',
      experienceLevel: experience,
      activeTuning: tuning,
    });
    db.updateActiveProfile({
      avatarPhoto: photo,
      notationPreference: notation,
      onboardingComplete: true,
      progress: { single: skip ? 6 : 1, melody: 1 },
    });
    TuningMatrixEngine.setActiveTuning(tuning);
    onDone();
  };

  const handleSelectExistingProfile = (profileId: string) => {
    const success = db.switchAccount(profileId);
    if (success) {
      const active = db.getActiveProfile();
      TuningMatrixEngine.setActiveTuning(active.activeTuning);
      onDone();
    }
  };

  const handleSendMagicLink = async () => {
    if (!cloudEmail.includes('@')) {
      setLoginMessage('Please enter a valid email address.');
      return;
    }
    setIsBusy(true);
    setLoginMessage('');
    try {
      if (!cloud) throw new Error('Cloud sync service is not connected.');
      const { error } = await cloud.auth.signInWithOtp({
        email: cloudEmail.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setLoginMessage('Magic link sent! Check your email to sign in.');
    } catch (err: any) {
      setLoginMessage(err.message || 'Failed to send sign-in link.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSyncCloud = async () => {
    setIsBusy(true);
    setLoginMessage('');
    try {
      const who = await syncCloudAccount();
      setLoginMessage(`Connected as ${who}`);
      onDone();
    } catch (err: any) {
      setLoginMessage(err.message || 'Could not sync cloud account.');
    } finally {
      setIsBusy(false);
    }
  };

  const choice = (label: string, selected: boolean, fn: () => void) => (
    <TouchableOpacity
      key={label}
      onPress={fn}
      style={[s.choice, selected && s.selected]}
    >
      <Text style={s.text}>{label}</Text>
    </TouchableOpacity>
  );

  const savedProfiles = db.getAllProfiles().filter(
    (p) =>
      p.onboardingComplete ||
      (p.id !== 'usr_default_bard' && p.displayName && p.displayName !== 'Default Bard')
  );

  // -------------------------------------------------------------------------
  // VIEW A: LOG IN TO EXISTING ACCOUNT
  // -------------------------------------------------------------------------
  if (isLoginMode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#132019' }}>
        <Image
          source={{ uri: '/images/ingame_bg_single.jpg' }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.35 }]}
        />
        <ScrollView contentContainerStyle={s.loginPage}>
          <Reveal style={{ width: '100%', gap: 18 }}>
            <Text style={s.eyebrow}>EARPA · WELCOME BACK</Text>
            <Text style={s.title}>Log In</Text>
            <Text style={s.subtitle}>Choose your profile or reconnect with email</Text>

            {/* Saved Local Profiles */}
            <View style={{ width: '100%', gap: 10, marginTop: 10 }}>
              <Text style={s.sectionHeader}>Saved Profiles on this Device</Text>
              {savedProfiles.length > 0 ? (
                savedProfiles.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    accessibilityLabel={`Log in as ${p.displayName || p.username}`}
                    onPress={() => handleSelectExistingProfile(p.id)}
                    style={s.profileCard}
                  >
                    <ProfilePhoto
                      uri={p.avatarPhoto}
                      name={p.displayName || p.username}
                      size={48}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={s.profileCardName}>
                        {p.displayName || p.username}
                      </Text>
                      <Text style={s.profileCardDetail}>
                        {p.experienceLevel} · {p.overallAccuracyPct || 100}% accuracy
                      </Text>
                    </View>
                    <Text style={s.profileCardArrow}>›</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={s.noProfilesCard}>
                  <Text style={s.small}>
                    No existing profiles were found in local storage.
                  </Text>
                </View>
              )}
            </View>

            {/* Cloud Sync Option */}
            {cloud && (
              <View style={s.cloudSection}>
                <Text style={s.sectionHeader}>Cloud Account (Cross-Device)</Text>
                <TextInput
                  value={cloudEmail}
                  onChangeText={setCloudEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  style={s.cloudInput}
                />
                <TouchableOpacity
                  disabled={isBusy}
                  onPress={handleSendMagicLink}
                  style={[s.cloudBtn, isBusy && { opacity: 0.5 }]}
                >
                  <Text style={s.cloudBtnText}>
                    {isBusy ? 'Connecting...' : 'Send Magic Sign-in Link →'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isBusy}
                  onPress={handleSyncCloud}
                  style={s.syncBtn}
                >
                  <Text style={s.syncBtnText}>Sync Cloud Profile</Text>
                </TouchableOpacity>

                {!!loginMessage && (
                  <Text style={s.statusNotice}>{loginMessage}</Text>
                )}
              </View>
            )}

            {/* Switch back to sign up */}
            <TouchableOpacity
              accessibilityLabel="Switch to sign up"
              onPress={() => setIsLoginMode(false)}
              style={s.switchModeBtn}
            >
              <Text style={s.switchModeText}>
                New Harper? <Text style={s.switchModeHighlight}>Create a profile</Text>
              </Text>
            </TouchableOpacity>
          </Reveal>
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW B: SIGN UP / ONBOARDING (DEFAULT OPEN SCREEN)
  // -------------------------------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: '#132019' }}>
      <Image
        source={{ uri: '/images/ingame_bg_single.jpg' }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.35 }]}
      />
      <ScrollView contentContainerStyle={s.page}>
        <Reveal key={step} style={{ width: '100%', gap: 20 }}>
          <Text style={s.eyebrow}>EARPA · YOUR JOURNEY</Text>
          <Text style={s.title}>
            {
              [
                'What shall we call you?',
                'Make it yours',
                'Your harp’s native tuning',
                'How do you name notes?',
                'Your experience',
                'Where shall we begin?',
              ][step]
            }
          </Text>

          {step === 0 && (
            <TextInput
              autoFocus
              accessibilityLabel="Your name"
              placeholder="Your name"
              placeholderTextColor="#baad92"
              value={name}
              onChangeText={setName}
              style={s.input}
            />
          )}

          {step === 1 && (
            <PhotoPicker uri={photo} name={name} onChange={setPhoto} />
          )}

          {step === 2 &&
            (['Eb_Major_Native', 'C_Major_Native', 'Bb_Major_Native'] as const).map(
              (v, i) =>
                choice(
                  ['E♭ major', 'C major', 'B♭ major'][i],
                  tuning === v,
                  () => {
                    setTuning(v);
                    setStep(3);
                  }
                )
            )}

          {step === 3 &&
            (['numbers', 'solfege', 'notes'] as const).map((v, i) =>
              choice(
                [
                  '1 · 2 · 3 — degrees',
                  'Do · Re · Mi — solfège',
                  'C · D · E — note names',
                ][i],
                notation === v,
                () => {
                  setNotation(v);
                  setStep(4);
                }
              )
            )}

          {step === 4 &&
            (['Beginner Harper', 'Apprentice Bard', 'Master Harper'] as const).map(
              (v, i) =>
                choice(
                  ['I’m beginning', 'I have some experience', 'I’m confident'][i],
                  experience === v,
                  () => {
                    setExperience(v);
                    setSkip(false);
                    setStep(5);
                  }
                )
            )}

          {step === 5 && (
            <>
              {choice('Start with the foundations', !skip, () => setSkip(false))}
              {experience !== 'Beginner Harper' &&
                choice(
                  'Skip the first five · begin at level 6',
                  skip,
                  () => setSkip(true)
                )}
              <Text style={s.small}>
                You can revisit every lesson along the path.
              </Text>
            </>
          )}

          {(step < 2 || step === 5) && (
            <TouchableOpacity
              disabled={step === 0 && !name.trim()}
              onPress={() => (step === 5 ? save() : setStep(step + 1))}
              style={[
                s.choice,
                s.selected,
                { opacity: step === 0 && !name.trim() ? 0.4 : 1 },
              ]}
            >
              <Text style={s.text}>
                {step === 5
                  ? 'Begin journey'
                  : step === 1 && !photo
                  ? 'Continue without a photo'
                  : 'Continue'} →
              </Text>
            </TouchableOpacity>
          )}

          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(step - 1)}>
              <Text style={s.small}>‹ Back</Text>
            </TouchableOpacity>
          )}
        </Reveal>
      </ScrollView>

      {/* Setup Step Progress Bar & Log In Button at Bottom */}
      <View style={s.bottomContainer}>
        <View
          accessibilityLabel={`Setup step ${step + 1} of 6`}
          style={s.progressBarTrack}
        >
          <View
            style={[
              s.progressBarFill,
              { width: `${((step + 1) / 6) * 100}%` },
            ]}
          />
        </View>

        <View style={s.bottomRow}>
          <Text style={s.small}>{step + 1} / 6 · Saved on this device</Text>

          {/* Small button at bottom to switch to Log in */}
          <TouchableOpacity
            accessibilityLabel="Switch to log in"
            onPress={() => setIsLoginMode(true)}
            style={s.bottomLoginBtn}
          >
            <Text style={s.bottomLoginText}>
              Already have an account? <Text style={s.bottomLoginHighlight}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 28,
    justifyContent: 'center',
  },
  loginPage: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#d0bd96',
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 3,
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 32,
    lineHeight: 42,
    color: '#f2e3c4',
    textAlign: 'center',
  },
  subtitle: {
    color: '#c0b59d',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -8,
  },
  sectionHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#d0bd96',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  text: {
    color: '#f0dfbd',
    fontSize: 17,
    textAlign: 'center',
  },
  small: {
    color: '#c0b59d',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  input: {
    color: '#f0dfbd',
    borderBottomWidth: 1,
    borderColor: '#b39b70',
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
  },
  choice: {
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(218, 197, 153, 0.25)',
    borderRadius: 14,
    backgroundColor: 'rgba(26, 44, 34, 0.65)',
  },
  selected: {
    borderColor: '#c3a36d',
    backgroundColor: 'rgba(195, 163, 109, 0.20)',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 24 : 36,
    paddingTop: 12,
    gap: 12,
    backgroundColor: 'rgba(19, 32, 25, 0.85)',
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#35483b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#e0c18b',
  },
  bottomRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  bottomLoginBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bottomLoginText: {
    fontSize: 13,
    color: '#c0b59d',
    textAlign: 'center',
  },
  bottomLoginHighlight: {
    color: '#f2e3c4',
    fontFamily: 'Inter-Bold',
    textDecorationLine: 'underline',
  },
  switchModeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  switchModeText: {
    fontSize: 14,
    color: '#c0b59d',
  },
  switchModeHighlight: {
    color: '#e0c18b',
    fontFamily: 'Inter-Bold',
    textDecorationLine: 'underline',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 44, 34, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(218, 197, 153, 0.35)',
    gap: 14,
  },
  profileCardName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 17,
    color: '#f2e3c4',
  },
  profileCardDetail: {
    fontSize: 12,
    color: '#94a3b8',
  },
  profileCardArrow: {
    fontSize: 22,
    color: '#d0bd96',
    fontWeight: '300',
  },
  noProfilesCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cloudSection: {
    width: '100%',
    padding: 16,
    gap: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 44, 34, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(200, 157, 88, 0.25)',
    marginTop: 8,
  },
  cloudInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  cloudBtn: {
    backgroundColor: '#b89355',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cloudBtnText: {
    color: '#0f172a',
    fontFamily: 'Inter-Bold',
    fontSize: 13,
  },
  syncBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  syncBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  statusNotice: {
    color: '#fde68a',
    fontSize: 12,
    textAlign: 'center',
  },
});
