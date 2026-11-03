import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import {
  PracticeReminderService,
  InAppNotificationPayload,
} from '../../services/notifications/PracticeReminderService';

export const InAppNotificationBanner: React.FC = () => {
  const [notification, setNotification] = useState<InAppNotificationPayload | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-60));

  useEffect(() => {
    const unsubscribe = PracticeReminderService.subscribe((notif) => {
      setNotification(notif);
      fadeAnim.setValue(0);
      translateY.setValue(-60);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => unsubscribe();
  }, [fadeAnim, translateY]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, 6500);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -60,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotification(null);
    });
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handleDismiss}
        style={styles.banner}
        accessibilityRole="alert"
        accessibilityLabel={`${notification.title}: ${notification.body}`}
      >
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 16 }}>🔔</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{notification.title}</Text>
          <Text style={styles.bodyText} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          accessibilityLabel="Dismiss notification"
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    top: Platform.OS === 'web' ? 14 : 44,
    left: 12,
    right: 12,
    zIndex: 9999999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.75)',
    boxShadow:
      '0 12px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(245, 158, 11, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        } as any)
      : {}),
  } as any,
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(217, 119, 6, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)',
  } as any,
  textContainer: {
    flex: 1,
    gap: 2,
  },
  titleText: {
    color: '#fef08a',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bodyText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
});
