import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { UserAccountDatabase, UserProfile } from '../../services/account/UserAccountDatabase';
import { ProfilePhoto } from '../account/ProfilePhoto';
import { WelcomeProfile } from '../account/WelcomeProfile';
import { TesterFeedback } from '../common/TesterFeedback';
import { UnifiedPreferencesModal } from '../settings/UnifiedPreferencesModal';

interface ProfileTabScreenProps {
  levelNumber: number;
  currentXp: number;
  streakCount: number;
  accuracyPct: number;
  totalTrials: number;
  onOpenRoadmap: (realm?: 'single' | 'melody' | 'levers') => void;
  onOpenSocial: () => void;
  onOpenGarage?: () => void;
}

const PRACTICE_VIDEOS = [
  {
    id: 'single',
    title: 'Single Note',
    subtitle: 'Find Tonic',
    duration: '60s',
    poster: '/videos/plus/SingleMotionPlus-poster.jpg',
    url: '/videos/plus/SingleMotionPlus.mp4',
    accent: '#34d399',
  },
  {
    id: 'melody',
    title: 'Melody',
    subtitle: 'Hear Pattern',
    duration: '60s',
    poster: '/videos/plus/MelodyMotionPlus-poster.jpg',
    url: '/videos/plus/MelodyMotionPlus.mp4',
    accent: '#38bdf8',
  },
  {
    id: 'levers',
    title: 'Levers',
    subtitle: 'Learn by Doing',
    duration: '90s',
    poster: '/videos/plus/LeverMotionPlus-poster.jpg',
    url: '/videos/plus/LeverMotionPlus.mp4',
    accent: '#fbbf24',
  },
] as const;

type PracticeVideo = (typeof PRACTICE_VIDEOS)[number];

const formatPracticeTime = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0m';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
};

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

export function ProfileTabScreen({ onOpenRoadmap, onOpenGarage }: ProfileTabScreenProps) {
  const db = UserAccountDatabase.getInstance();
  const [, refresh] = useState(0);
  useEffect(() => db.subscribe(() => refresh((n) => n + 1)), []);

  const profile = db.getActiveProfile();
  const allProfiles = db.getAllProfiles();
  const trials = db.getUserTrials(profile.id);
  const days = db.getDailyPracticeHistory(7);
  const degrees = db.getDegreeRelationshipStatsList().filter((d) => /^[b#]?[1-8]$/.test(d.degree));

  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [create, setCreate] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState<'single' | 'melody' | 'levers'>('single');
  const [selectedPracticeVideo, setSelectedPracticeVideo] = useState<PracticeVideo | null>(null);

  useEffect(() => {
    if (!selectedPracticeVideo || Platform.OS !== 'web') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPracticeVideo(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedPracticeVideo]);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 24 }}
      >
        {/* 1. TOP: Sleek Feedback Pill, Avatar, Name & Level */}
        <TesterFeedback />

        <View style={{ alignItems: 'center', gap: 10, marginTop: 4 }}>
          <ProfilePhoto uri={profile.avatarPhoto} name={profile.displayName} size={80} />
          <Text style={s.title}>{profile.displayName}</Text>
          <Text style={s.small}>{profile.experienceLevel}</Text>
        </View>

        {/* 2. STRATEGY & CORE METRICS: 3 Stat Counters Row */}
        <View style={s.statsCard}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={s.number}>{profile.totalSessionsPlayed || 0}</Text>
            <Text style={s.small}>sessions</Text>
          </View>
          <View style={s.statDivider} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={s.number}>{Math.round((profile.totalPracticeTimeSeconds || 0) / 60)}</Text>
            <Text style={s.small}>minutes</Text>
          </View>
          <View style={s.statDivider} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={s.number}>{profile.overallAccuracyPct || 0}%</Text>
            <Text style={s.small}>accuracy</Text>
          </View>
        </View>

        {/* 3. STRATEGY ROADMAP: 3-Realm Segmented Maps */}
        <View style={s.journeyCard}>
          <Text style={s.sectionHeader}>Strategy Roadmap</Text>

          {/* 3-Map Segmented Selector */}
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
                    isActive && {
                      backgroundColor: 'rgba(255, 255, 255, 0.16)',
                      borderColor: meta.accent,
                      borderWidth: 1.5,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      s.realmTabText,
                      isActive && { color: meta.accent, fontWeight: '900' },
                    ]}
                  >
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
            <Image
              source={{ uri: realmMetadata.bg }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
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

        {/* 4. COMPREHENSIVE PERFORMANCE STATISTICS */}
        {/* 4a. Three Paths Accuracy */}
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

        {/* 4b. Your Listening Performance */}
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

        {/* 4c. Practice Rhythm & History */}
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

        {/* 4d. Keys Explored */}
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

        {/* 5. THE SHOP BUTTON: Highly Prominent, Beautiful Artisan Workshop Card */}
        {onOpenGarage && (
          <TouchableOpacity
            nativeID="open-garage-card-btn"
            accessibilityRole="button"
            accessibilityLabel="Open Harp Artisan Workshop and Luthier Store"
            onPress={onOpenGarage}
            style={s.prominentShopCard}
            activeOpacity={0.84}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ gap: 6, flex: 1, paddingRight: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={s.prominentShopTitle}>🎨 Harp Artisan Workshop</Text>
                  <View style={s.shopShardsBadge}>
                    <Text style={s.shopShardsText}>{db.getShards()} 🪙</Text>
                  </View>
                </View>
                <Text style={s.prominentShopSubtitle}>
                  Spend earned Shards: 5 Natural Wood Finishes, Hand-Carved Rosettes, Gut String Warmth & Camac Levers
                </Text>
              </View>
              <View style={s.shopEnterBtn}>
                <Text style={s.shopEnterBtnText}>Enter Workshop ›</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* 6. PREFERENCES: Single Button Tucking All Preferences Neatly into a Menu Modal */}
        <TouchableOpacity
          nativeID="open-preferences-menu-btn"
          accessibilityRole="button"
          accessibilityLabel="Open Preferences and Audio Settings"
          onPress={() => setPreferencesModalOpen(true)}
          style={s.sleekActionCard}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <View style={{ gap: 4, flex: 1, paddingRight: 10 }}>
              <Text style={s.sleekActionTitle}>⚙️ Preferences & Audio Settings</Text>
              <Text style={s.small}>
                Haptic vibration feedback, note notation, 432Hz tuning, daily reminders & PWA install
              </Text>
            </View>
            <Text style={{ color: '#d5ba85', fontSize: 18, fontWeight: '700' }}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 7. USER PAGE / HARPER PROFILES: Complete Metrics for Each Registered User */}
        <View style={s.userProfilesSection}>
          <View style={{ gap: 4, marginBottom: 4 }}>
            <Text style={s.sectionHeader}>Harper Profiles</Text>
            <Text style={s.small}>
              Practice telemetry and metrics for each learner on this device. Tap to switch account.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {allProfiles.map((p: UserProfile) => {
              const isActive = p.id === profile.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${p.displayName}`}
                  onPress={() => {
                    if (!isActive) db.switchAccount(p.id);
                  }}
                  style={[
                    s.userCard,
                    isActive && s.userCardActive,
                  ]}
                  activeOpacity={0.82}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <ProfilePhoto name={p.displayName} uri={p.avatarPhoto} size={44} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={s.userNameText}>{p.displayName}</Text>
                        {isActive && (
                          <View style={s.activePlayerBadge}>
                            <Text style={s.activePlayerBadgeText}>ACTIVE PLAYER</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.userLevelText}>{p.experienceLevel}</Text>
                    </View>
                  </View>

                  {/* 4-Metric Diagnostic Grid for each user */}
                  <View style={s.userMetricsGrid}>
                    <View style={s.userMetricPill}>
                      <Text style={s.userMetricLabel}>Practice</Text>
                      <Text style={s.userMetricValue}>{formatPracticeTime(p.totalPracticeTimeSeconds)}</Text>
                    </View>

                    <View style={s.userMetricPill}>
                      <Text style={s.userMetricLabel}>Sessions</Text>
                      <Text style={s.userMetricValue}>{p.totalSessionsPlayed || 0}</Text>
                    </View>

                    <View style={s.userMetricPill}>
                      <Text style={s.userMetricLabel}>Trials</Text>
                      <Text style={s.userMetricValue}>{p.totalTrialsAttempted || 0}</Text>
                    </View>

                    <View style={s.userMetricPill}>
                      <Text style={s.userMetricLabel}>Accuracy</Text>
                      <Text style={s.userMetricValue}>{p.overallAccuracyPct || 0}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => setCreate(true)}
            style={[s.sleekActionCard, { marginTop: 8 }]}
            activeOpacity={0.8}
          >
            <Text style={[s.sleekActionTitle, { textAlign: 'center', width: '100%', color: '#fef08a' }]}>
              + Create New Harper Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* 8. PRACTICE FILMS (GUIDED VIDEOS): Symmetrical 3-Film Shelf */}
        <View style={s.journeyCard} nativeID="journey-video-library">
          <Text style={s.sectionHeader}>Practice films</Text>
          <Text style={s.small}>Guided walkthroughs for your ear training journey.</Text>
          <View style={s.practiceFilmsRow}>
            {PRACTICE_VIDEOS.map((v) => (
              <TouchableOpacity
                key={v.id}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={`Watch ${v.title} practice film`}
                onPress={() => setSelectedPracticeVideo(v)}
                style={s.practiceFilmCard}
              >
                <View style={s.practicePosterContainer}>
                  <Image
                    source={{ uri: v.poster }}
                    style={s.practicePosterImg}
                    resizeMode="cover"
                  />
                  <View style={s.practicePosterScrim} />
                  <View style={s.practicePlayBadge}>
                    <Text style={s.practicePlayIcon}>▶</Text>
                  </View>
                  <View style={s.practiceDurationBadge}>
                    <Text style={s.practiceDurationText}>{v.duration}</Text>
                  </View>
                </View>
                <View style={s.practiceMetaContainer}>
                  <Text style={[s.practiceCardTitle, { color: v.accent }]} numberOfLines={1}>
                    {v.title}
                  </Text>
                  <Text style={s.practiceCardSub} numberOfLines={1}>
                    {v.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Video Theater Modal */}
        <Modal
          visible={!!selectedPracticeVideo}
          transparent={false}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setSelectedPracticeVideo(null)}
        >
          <View style={{ flex: 1, backgroundColor: '#07120c' }}>
            {selectedPracticeVideo && (
              Platform.OS === 'web' ? (
                <video
                  key={selectedPracticeVideo.url}
                  aria-label={selectedPracticeVideo.title}
                  autoPlay
                  controls
                  playsInline
                  src={selectedPracticeVideo.url}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: '#07120c',
                  }}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => Linking.openURL(selectedPracticeVideo.url)}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ color: '#eedcb7', fontSize: 16 }}>Play lesson</Text>
                </TouchableOpacity>
              )
            )}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close practice film"
              onPress={() => setSelectedPracticeVideo(null)}
              style={{
                position: 'absolute',
                top: Platform.OS === 'web' ? 16 : 48,
                left: 16,
                zIndex: 100,
                minHeight: 40,
                paddingHorizontal: 16,
                justifyContent: 'center',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#eedcb755',
                backgroundColor: 'rgba(7, 18, 12, 0.85)',
              }}
            >
              <Text style={{ color: '#fff5dc', fontSize: 15, fontWeight: '600' }}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* UNIFIED PREFERENCES MODAL */}
        <UnifiedPreferencesModal
          visible={preferencesModalOpen}
          onClose={() => setPreferencesModalOpen(false)}
        />
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
    height: 32,
    backgroundColor: 'rgba(220, 198, 154, 0.25)',
  },
  journeyCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 26, 18, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.3)',
    padding: 16,
    gap: 14,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        } as any)
      : {}),
  },
  realmSelectorBar: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.2)',
  },
  realmTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realmTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#bfb39a',
  },
  mapPreviewBox: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.35)',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  mapPreviewScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 18, 12, 0.55)',
    padding: 16,
    justifyContent: 'flex-end',
    gap: 6,
  },
  mapPreviewBadge: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  mapPreviewTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 20,
    color: '#ffffff',
  },
  mapPreviewDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 16,
    maxWidth: '85%',
  },
  openMapPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
  },
  openMapPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  prominentShopCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.85)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  prominentShopTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16.5,
    color: '#fef08a',
  },
  prominentShopSubtitle: {
    fontSize: 12,
    color: '#f1f5f9',
    lineHeight: 17,
  },
  shopShardsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  shopShardsText: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '800',
  },
  shopEnterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#d97706',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 10px rgba(217, 119, 6, 0.5)',
        } as any)
      : {}),
  },
  shopEnterBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  sleekActionCard: {
    padding: 16,
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
  sleekActionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#fae8c2',
  },
  userProfilesSection: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 26, 18, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.3)',
    padding: 16,
    gap: 14,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        } as any)
      : {}),
  },
  userCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 25, 20, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.25)',
    gap: 12,
  },
  userCardActive: {
    borderColor: 'rgba(52, 211, 153, 0.8)',
    backgroundColor: 'rgba(6, 78, 59, 0.3)',
  },
  userNameText: {
    color: '#fae8c2',
    fontSize: 15,
    fontWeight: '800',
  },
  userLevelText: {
    color: '#bfb39a',
    fontSize: 11.5,
  },
  activePlayerBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  activePlayerBadgeText: {
    color: '#a7f3d0',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  userMetricsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 198, 154, 0.15)',
  },
  userMetricPill: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  userMetricLabel: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userMetricValue: {
    fontSize: 12.5,
    color: '#fef08a',
    fontWeight: '800',
  },
  practiceFilmsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  practiceFilmCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 25, 20, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.3)',
    overflow: 'hidden',
  },
  practicePosterContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    backgroundColor: '#07120c',
  },
  practicePosterImg: {
    ...StyleSheet.absoluteFillObject,
  },
  practicePosterScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  practicePlayBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: '#fae8c2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  practicePlayIcon: {
    color: '#fae8c2',
    fontSize: 11,
    marginLeft: 2,
  },
  practiceDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  practiceDurationText: {
    color: '#eedcb7',
    fontSize: 9.5,
    fontWeight: '700',
  },
  practiceMetaContainer: {
    padding: 8,
    gap: 2,
  },
  practiceCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    fontWeight: '700',
  },
  practiceCardSub: {
    fontSize: 10,
    color: '#bfb39a',
  },
});
