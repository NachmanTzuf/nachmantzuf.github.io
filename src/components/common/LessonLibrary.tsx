import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, Linking, StyleSheet } from 'react-native';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';
import { hasCompletedLessonMilestone, LessonTrack } from './lessonVisibility';

type Entry = {
  id: string;
  title: string;
  track: string;
  url: string;
  seconds: number;
};

const TRACK_THEMES: Record<
  LessonTrack,
  {
    primary: string;
    badgeBg: string;
    badgeBorder: string;
    text: string;
    glow: string;
    label: string;
    persistentLabel: string;
  }
> = {
  single: {
    primary: '#10b981',
    badgeBg: 'rgba(6, 78, 59, 0.50)',
    badgeBorder: 'rgba(52, 211, 153, 0.70)',
    text: '#ecfdf5',
    glow: '0 2px 10px rgba(16, 185, 129, 0.40)',
    label: '▷ QUICK LESSON · TONIC ANCHOR (90s)',
    persistentLabel: 'Single note',
  },
  melody: {
    primary: '#38bdf8',
    badgeBg: 'rgba(12, 74, 110, 0.55)',
    badgeBorder: 'rgba(56, 189, 248, 0.75)',
    text: '#e0f2fe',
    glow: '0 2px 12px rgba(56, 189, 248, 0.45)',
    label: '▷ QUICK LESSON · MELODIC SEQUENCE (80s)',
    persistentLabel: 'Melody',
  },
  levers: {
    primary: '#fbbf24',
    badgeBg: 'rgba(120, 53, 15, 0.50)',
    badgeBorder: 'rgba(245, 158, 11, 0.70)',
    text: '#fef08a',
    glow: '0 2px 10px rgba(245, 158, 11, 0.40)',
    label: '▷ QUICK LESSON · LEVER MASTERY (97s)',
    persistentLabel: 'Levers',
  },
};

export function LessonLibrary({
  track,
  persistent = false,
}: {
  track: LessonTrack;
  persistent?: boolean;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [error, setError] = useState(false);
  const [, refresh] = useState(0);

  const db = UserAccountDatabase.getInstance();

  useEffect(() => db.subscribe(() => refresh((n) => n + 1)), [db]);

  useEffect(() => {
    let active = true;
    fetch('/videos/mission/manifest.json?v=v33_20261110', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) setEntries(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSelected(null);
    setError(false);
  }, [track, db.getActiveProfile().id]);

  const close = () => {
    setSelected(null);
    setError(false);
  };

  useEffect(() => {
    if (!selected || Platform.OS !== 'web') return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [selected]);

  const available = entries.filter((e) => e.track === track);
  const profile = db.getActiveProfile();
  const completed =
    hasCompletedLessonMilestone(db.getUserSessions(profile.id), track) ||
    (track === 'levers'
      ? (profile.leverStage || 0) + 1
      : profile.progress?.[track] || 1) >= 10;

  if (!available.length || (!persistent && completed)) return null;

  const currentTheme = TRACK_THEMES[track] || TRACK_THEMES.single;

  return (
    <>
      {Platform.OS === 'web' && (
        <style>{`
          @keyframes lessonThemePulse {
            0%, 100% {
              box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.35);
            }
            50% {
              box-shadow: inset 0 1px 4px rgba(255, 255, 255, 0.65), 0 2px 14px ${currentTheme.glow};
            }
          }
          #path-lesson-button {
            animation: lessonThemePulse 3.5s ease-in-out infinite;
            transition: transform 0.15s ease, filter 0.15s ease;
          }
          #path-lesson-button:hover {
            filter: brightness(1.15);
            transform: scale(1.01);
          }
          #path-lesson-button:active {
            transform: scale(0.985);
          }
        `}</style>
      )}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Watch ${track === 'single' ? 'single-note' : track} quick lesson`}
        nativeID={persistent ? `journey-lesson-${track}` : 'path-lesson-button'}
        onPress={() => {
          setSelected(available[0]);
          setError(false);
        }}
        activeOpacity={0.82}
        style={
          persistent
            ? {
                width: 132,
                minHeight: 36,
                paddingHorizontal: 14,
                paddingVertical: 7,
                justifyContent: 'center',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: currentTheme.badgeBorder,
                backgroundColor: currentTheme.badgeBg,
                zIndex: 30,
              }
            : ({
                width: '100%',
                height: 28,
                minHeight: 28,
                marginTop: 8,
                paddingHorizontal: 14,
                paddingVertical: 2,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: currentTheme.badgeBorder,
                backgroundColor: currentTheme.badgeBg,
                boxShadow: currentTheme.glow,
                zIndex: 30,
                ...(Platform.OS === 'web'
                  ? {
                      backdropFilter: 'blur(18px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                    }
                  : {}),
              } as any)
        }
      >
        <Text
          style={
            persistent
              ? {
                  color: currentTheme.text,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: '700',
                }
              : {
                  color: currentTheme.text,
                  textAlign: 'center',
                  fontSize: 10.5,
                  fontWeight: '800',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }
          }
        >
          {persistent ? `▷ ${currentTheme.persistentLabel}` : currentTheme.label}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={!!selected}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={{ flex: 1, backgroundColor: '#090d16' }}>
          {selected &&
            (Platform.OS === 'web' ? (
              <video
                key={selected.id}
                aria-label={selected.title}
                autoPlay
                controls
                playsInline
                preload="auto"
                src={selected.url}
                onError={() => setError(true)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  border: 0,
                  borderRadius: 0,
                  background: '#090d16',
                }}
              />
            ) : (
              <TouchableOpacity
                onPress={() => Linking.openURL(selected.url)}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ color: currentTheme.text }}>Play lesson</Text>
              </TouchableOpacity>
            ))}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Home, close lesson"
            onPress={close}
            style={{
              position: 'absolute',
              top: Platform.OS === 'web' ? 12 : 48,
              left: 14,
              zIndex: 100,
              minHeight: 44,
              paddingHorizontal: 18,
              justifyContent: 'center',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              ...(Platform.OS === 'web' ? { marginTop: 'env(safe-area-inset-top)' as any } : {}),
            }}
          >
            <Text style={{ color: '#fff5dc', fontSize: 16, fontWeight: '600' }}>⌂ Home</Text>
          </TouchableOpacity>
          {error && (
            <View
              style={{
                position: 'absolute',
                left: 25,
                right: 25,
                top: '45%',
                padding: 22,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(244, 63, 94, 0.45)',
              }}
            >
              <Text accessibilityRole="alert" style={{ color: '#fecdd3', textAlign: 'center' }}>
                The lesson could not load. Check your connection, return Home and try again.
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
