import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface AppLoadingScreenProps {
  onLoaded?: () => void;
  durationMs?: number;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  onLoaded,
  durationMs = 2200,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    let animId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(1.0, elapsed / durationMs);
      // Smooth natural cubic easing curve
      const easedProgress = Math.min(100, Math.round(100 * (1 - Math.pow(1 - rawProgress, 2.5))));
      setProgress(easedProgress);

      if (rawProgress < 1.0) {
        animId = requestAnimationFrame(tick);
      } else {
        // Complete! Hold briefly, then trigger smooth fade-out
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDone(true);
            if (onLoaded) onLoaded();
          }, 450);
        }, 180);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [durationMs, onLoaded]);

  if (isDone) return null;

  return (
    <View
      style={[
        styles.container,
        isFadingOut && styles.fadeOut,
      ]}
      pointerEvents={isFadingOut ? 'none' : 'auto'}
    >
      {/* Full-bleed Tri-Realm Artwork with 3D Celtic Harp on Pedestal */}
      <img
        src="/images/earpa_master_loading_bg.jpg"
        alt="Earpa Celtic Sanctuary Loading"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          pointerEvents: 'none',
        }}
      />

      {/* Gentle bottom shadow gradient to ground the progress indicator */}
      <View style={styles.bottomShadowGradient} pointerEvents="none" />

      {/* Sleek Minimal Progress Indicator Bar (No numbers, no text) */}
      <View style={styles.progressTrackWrapper} pointerEvents="none">
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    backgroundColor: '#090d16',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: 1,
  } as any,
  fadeOut: {
    opacity: 0,
    pointerEvents: 'none',
  } as any,
  bottomShadowGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    background: 'linear-gradient(to top, rgba(5, 10, 16, 0.85) 0%, rgba(5, 10, 16, 0.35) 60%, rgba(5, 10, 16, 0) 100%)',
  } as any,
  progressTrackWrapper: {
    position: 'absolute',
    bottom: 64, // Positioned cleanly in lower viewport
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  progressTrack: {
    width: 240,
    maxWidth: '75%',
    height: 4.5,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.55), inset 0 1px 2px rgba(0, 0, 0, 0.4)',
        } as any)
      : {}),
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #d97706 0%, #fbbf24 50%, #38bdf8 100%)',
    transition: 'width 0.12s linear',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 0 12px rgba(251, 191, 36, 0.90), 0 0 24px rgba(56, 189, 248, 0.60)',
        } as any)
      : {}),
  } as any,
});
