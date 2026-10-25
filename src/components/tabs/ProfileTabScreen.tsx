import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';
import { PhotoPicker, ProfilePhoto } from '../account/ProfilePhoto';
import { WelcomeProfile } from '../account/WelcomeProfile';
import { NativeTuningSelector } from '../settings/NativeTuningSelector';
import { Reveal } from '../common/Reveal';
import { PracticeReminderModal } from '../notifications/PracticeReminderModal';
import { CloudAccountPanel } from '../account/CloudAccountPanel';

interface ProfileTabScreenProps {
  levelNumber: number;
  currentXp: number;
  streakCount: number;
  accuracyPct: number;
  totalTrials: number;
  onOpenRoadmap: (realm?: 'single' | 'melody' | 'levers') => void;
  onOpenSocial: () => void;
}

const Bar = ({ label, value, detail }: { label: string; value: number; detail: string }) => (
  <View style={{ gap: 7, marginVertical: 7 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={s.text}>{label}</Text>
      <Text style={s.small}>{detail}</Text>
    </View>
    <View style={{ height: 6, borderRadius: 4, backgroundColor: 'rgba(221,204,164,.15)', overflow: 'hidden' }}>
      <View style={{ height: 6, width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: '#c7ad7b', borderRadius: 4 }} />
    </View>
  </View>
);

export function ProfileTabScreen({ onOpenRoadmap }: ProfileTabScreenProps) {
  const db = UserAccountDatabase.getInstance();
  const [, refresh] = useState(0);
  useEffect(() => db.subscribe(() => refresh((n) => n + 1)), []);

  const profile = db.getActiveProfile();
  const trials = db.getUserTrials(profile.id);
  const days = db.getDailyPracticeHistory(7);
  const degrees = db.getDegreeRelationshipStatsList().filter((d) => /^[b#]?[1-8]$/.test(d.degree));

  const [prefs, setPrefs] = useState(false);
  const [accounts, setAccounts] = useState(false);
  const [create, setCreate] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState<'single' | 'melody' | 'levers'>('single');

  const maxDay = Math.max(60, ...days.map((d) => d.practiceSeconds));
  const recent = trials.slice(-20);
  const accuracy = (items: typeof trials) =>
    items.length ? Math.round((items.filter((t) => t.isCorrect).length / items.length) * 100) : 0;
  const avg = trials.length ? trials.reduce((n, t) => n + t.latencyMs, 0) / trials.length / 1000 : 0;
  const keys = [...new Set(trials.map((t) => t.tonicKey))];

  if (create) {
    return (
      <View style={{ flex: 1, paddingBottom: 90 }}>
        <WelcomeProfile
          onDone={() => {
            setCreate(false);
            setAccounts(false);
          }}
        />
      </View>
    );
  }

  const realmMetadata = {
    single: {
      name: 'Coastal Sanctuary',
      trackName: 'Single Note Relative Pitch',
      accent: '#10b981',
      bg: '/images/coastal_cliff_pathway.jpg',
      desc: 'Master the 7 diatonic degrees and tonic anchor pull',
    },
    melody: {
      name: 'Glacial Fjord',
      trackName: 'Melody Sequence Dictation',
      accent: '#38bdf8',
      bg: '/images/arctic_fjord_pathway.jpg',
      desc: 'Recognize 2 to 4 note Celtic phrases and ornamentation turns',
    },
    levers: {
      name: 'Sandstone Canyon',
      trackName: 'Lever Scales & Modal Shifts',
      accent: '#fbbf24',
      bg: '/images/canyon_desert_pathway.jpg',
      desc: 'Master Camac lever sharping and circle of fifths modulations',
    },
  }[selectedRealm];

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 24 }}>
        
        {/* 1. TOP: Name, Avatar Photo, and Level */}
        <View style={{ alignItems: 'center', gap: 10, marginTop: 8 }}>
          <ProfilePhoto uri={profile.avatarPhoto} name={profile.displayName} size={80} />
          <Text style={s.title}>{profile.displayName}</Text>
          <Text style={s.small}>{profile.experienceLevel}</Text>
        </View>

        {/* 2. TOP: 3 Stat Counters Row (Sessions, Minutes, Accuracy %) */}
        <View style={s.statsCard}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={s.number}>{profile.totalSessionsPlayed}</Text>
            <Text style={s.small}>sessions</Text>
          </View>
          <View style={s.statDivider} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={s.number}>{Math.round(profile.totalPracticeTimeSeconds / 60)}</Text>
            <Text style={s.small}>minutes</Text>
          </View>
          <View style={s.statDivider} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={s.number}>{profile.overallAccuracyPct}%</Text>
            <Text style={s.small}>accuracy</Text>
          </View>
        </View>

        {/* 3. UNDER PROFILE: Your Journey Section */}
        <View style={s.journeyCard}>
          <Text style={s.sectionHeader}>Your journey</Text>
          
          {/* Obvious 3-Map Segmented Selector */}
          <View style={s.realmSelectorBar}>
            {(['single', 'melody', 'levers'] as const).map((rKey) => {
              const isActive = selectedRealm === rKey;
              const meta = {
                single: { label: 'Coast', full: 'Single Note', accent: '#10b981' },
                melody: { label: 'Fjord', full: 'Melody', accent: '#38bdf8' },
                levers: { label: 'Canyon', full: 'Levers', accent: '#fbbf24' },
              }[rKey];

              return (
                <TouchableOpacity
                  key={rKey}
                  onPress={() => setSelectedRealm(rKey)}
                  style={[
                    s.realmTabBtn,
                    isActive && { backgroundColor: 'rgba(255, 255, 255, 0.16)', borderColor: meta.accent, borderWidth: 1.5 },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[s.realmTabText, isActive && { color: meta.accent, fontWeight: '900' }]}>
                    {meta.full}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Map Preview Card */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${realmMetadata.name} trail map`}
            onPress={() => onOpenRoadmap(selectedRealm)}
            style={s.mapPreviewBox}
            activeOpacity={0.85}
          >
            <Image source={{ uri: realmMetadata.bg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <View style={s.mapPreviewScrim}>
              <Text style={[s.mapPreviewBadge, { color: realmMetadata.accent }]}>
                {realmMetadata.trackName.toUpperCase()}
              </Text>
              <Text style={s.mapPreviewTitle}>{realmMetadata.name}</Text>
              <Text style={s.mapPreviewDesc}>{realmMetadata.desc}</Text>
              <View style={[s.openMapPill, { borderColor: realmMetadata.accent }]}>
                <Text style={[s.openMapPillText, { color: realmMetadata.accent }]}>
                  Open Trail Map →
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Sleek Daily Practice Reminder Button */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => setReminderOpen(true)}
          style={s.sleekActionCard}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <View style={{ gap: 4 }}>
              <Text style={s.sleekActionTitle}>🔔 Daily Practice Reminder</Text>
              <Text style={s.small}>Keep your relative pitch active with daily prompts</Text>
            </View>
            <Text style={{ color: '#d5ba85', fontSize: 16 }}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 5. Sleek Preferences Panel with Haptic Vibrations Toggle */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded: prefs }}
          onPress={() => setPrefs(!prefs)}
          style={s.sleekActionCard}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Text style={s.sleekActionTitle}>Preferences</Text>
            <Text style={{ color: '#d5ba85', fontSize: 16 }}>{prefs ? '−' : '+'}</Text>
          </View>
        </TouchableOpacity>

        {prefs && (
          <Reveal style={s.section}>
            <PhotoPicker
              name={profile.displayName}
              uri={profile.avatarPhoto}
              onChange={(avatarPhoto) => db.updateActiveProfile({ avatarPhoto })}
            />
            
            <Text style={s.small}>Your name</Text>
            <TextInput
              accessibilityLabel="Profile name"
              defaultValue={profile.displayName}
              key={profile.id}
              onEndEditing={(e) => {
                if (e.nativeEvent.text.trim()) db.updateActiveProfile({ displayName: e.nativeEvent.text.trim() });
              }}
              style={s.input}
            />

            {/* Haptic Vibrations Toggle */}
            <View style={s.toggleRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.text}>Haptic vibrations</Text>
                <Text style={s.small}>Vibrate phone on string pluck and lever flips</Text>
              </View>
              <Switch
                value={profile.hapticsEnabled !== false}
                onValueChange={(val) => {
                  db.updateActiveProfile({ hapticsEnabled: val });
                }}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#059669' }}
                thumbColor={profile.hapticsEnabled !== false ? '#34d399' : '#94a3b8'}
              />
            </View>

            <Text style={s.title}>Note names</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {(['numbers', 'solfege', 'notes'] as const).map((n, i) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => db.updateActiveProfile({ notationPreference: n })}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderColor: profile.notationPreference === n ? '#d5ba85' : 'transparent',
                  }}
                >
                  <Text style={s.text}>{['1 2 3', 'Do Re Mi', 'C D E'][i]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <NativeTuningSelector themeColor="#c7ad7b" />
          </Reveal>
        )}

        {/* 6. Practice Rhythm & History */}
        <View style={s.section}>
          <Text style={s.title}>Your rhythm</Text>
          <Text style={s.small}>Practice this week · minutes</Text>
          <View style={{ height: 120, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
            {days.map((d) => (
              <View key={d.dateKey} style={{ alignItems: 'center', gap: 7 }}>
                <Text style={s.small}>{Math.round(d.practiceSeconds / 60)}</Text>
                <View
                  style={{
                    height: Math.max(2, (d.practiceSeconds / maxDay) * 70),
                    width: 14,
                    borderRadius: 7,
                    backgroundColor: '#c7ad7b',
                  }}
                />
                <Text style={s.small}>
                  {new Date(d.dateKey + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7. Three Paths Accuracy */}
        <View style={s.section}>
          <Text style={s.title}>Three paths</Text>
          {(['single', 'melody', 'levers'] as const).map((track, i) => {
            const subset = trials.filter((t) => t.track === track);
            return (
              <Bar
                key={track}
                label={['Single note', 'Multi note', 'Lever'][i]}
                value={accuracy(subset)}
                detail={subset.length ? `${accuracy(subset)}% · ${subset.length} answers` : 'No practice yet'}
              />
            );
          })}
        </View>

        {/* 8. Your Listening Performance */}
        <View style={s.section}>
          <Text style={s.title}>Your listening</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
            <View>
              <Text style={s.number}>{recent.length ? `${accuracy(recent)}%` : '—'}</Text>
              <Text style={s.small}>Last {recent.length || 20} answers</Text>
            </View>
            <View>
              <Text style={s.number}>{trials.length ? `${avg.toFixed(1)}s` : '—'}</Text>
              <Text style={s.small}>Average response</Text>
            </View>
          </View>
          {degrees.map((d) => (
            <Bar
              key={d.degree}
              label={`Degree ${d.degree}`}
              value={d.totalPresentations ? d.accuracyPct : 0}
              detail={d.totalPresentations ? `${Math.round(d.accuracyPct)}% · ${d.totalPresentations} heard` : 'Not heard yet'}
            />
          ))}
        </View>

        {/* 9. Keys Explored */}
        <View style={s.section}>
          <Text style={s.title}>Keys explored</Text>
          {keys.length ? (
            keys.map((key) => {
              const subset = trials.filter((t) => t.tonicKey === key);
              return (
                <Bar
                  key={key}
                  label={key.replace('_minor', ' minor').replace('b', '♭')}
                  value={accuracy(subset)}
                  detail={`${accuracy(subset)}% · ${subset.length} answers`}
                />
              );
            })
          ) : (
            <Text style={s.small}>Your first practice will start this chart.</Text>
          )}
        </View>

        {/* 10. Cloud Account & Profile Management */}
        <CloudAccountPanel />

        <TouchableOpacity nativeID="profile-switch-account-btn" onPress={() => setAccounts(!accounts)} style={s.sleekActionCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Text style={s.sleekActionTitle}>Harper profiles</Text>
            <Text style={{ color: '#d5ba85', fontSize: 16 }}>{accounts ? '−' : '+'}</Text>
          </View>
        </TouchableOpacity>

        {accounts && (
          <Reveal style={s.section}>
            {db.getAllProfiles().map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  db.switchAccount(p.id);
                  setAccounts(false);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 }}
              >
                <ProfilePhoto name={p.displayName} uri={p.avatarPhoto} size={36} />
                <Text style={s.text}>
                  {p.displayName}
                  {p.id === profile.id ? ' · active' : ''}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setCreate(true)} style={[s.sleekActionCard, { marginTop: 8 }]}>
              <Text style={s.sleekActionTitle}>Create a profile →</Text>
            </TouchableOpacity>
          </Reveal>
        )}

        <Text style={s.small}>
          Your photo, preferences and practice are saved separately for each profile on this browser.
        </Text>

        {/* Sleek Practice Reminder Modal */}
        <PracticeReminderModal visible={reminderOpen} onClose={() => setReminderOpen(false)} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#ead9b4',
  },
  sectionHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 20,
    color: '#fae8c2',
    marginBottom: 8,
  },
  number: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 26,
    color: '#fae8c2',
  },
  text: {
    fontSize: 14,
    color: '#e5d4b2',
  },
  small: {
    fontSize: 11,
    color: '#bfb39a',
    lineHeight: 18,
  },
  section: {
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(220,198,154,.2)',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(18, 32, 23, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.35)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(220, 198, 154, 0.2)',
  },
  journeyCard: {
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 32, 23, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.3)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  realmSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 19, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  realmTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  realmTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  mapPreviewBox: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  mapPreviewScrim: {
    position: 'absolute',
    inset: 0,
    padding: 18,
    justifyContent: 'flex-end',
    backgroundColor: 'linear-gradient(180deg, rgba(10,16,13,0.1) 0%, rgba(10,16,13,0.85) 100%)',
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: 'linear-gradient(180deg, rgba(10,16,13,0.1) 0%, rgba(10,16,13,0.85) 100%)',
        } as any)
      : {}),
  },
  mapPreviewBadge: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mapPreviewTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#ffffff',
  },
  mapPreviewDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
    marginBottom: 10,
  },
  openMapPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
  },
  openMapPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sleekActionCard: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.35)',
    borderRadius: 16,
    backgroundColor: 'rgba(31, 49, 37, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleekActionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#f0d9ab',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  input: {
    fontSize: 18,
    color: '#ead9b4',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#9d8965',
  },
});
