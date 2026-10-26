import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface AppLoadingScreenProps {
  onLoaded?: () => void;
  isAppReady?: boolean;
  minDurationMs?: number;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  onLoaded,
  isAppReady = true,
  minDurationMs = 1600,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const isAppReadyRef = useRef(isAppReady);
  isAppReadyRef.current = isAppReady;

  useEffect(() => {
    const startTime = performance.now();
    let animId = 0;
    let completed = false;

    const tick = (now: number) => {
      if (completed) return;
      const elapsed = now - startTime;
      const timeProgress = Math.min(1.0, elapsed / minDurationMs);
      const ready = isAppReadyRef.current;

      let targetPct = 0;
      if (!ready) {
        // While app is still loading in background, progress smoothly up to 90%
        targetPct = Math.min(90, Math.round(90 * (1 - Math.pow(1 - timeProgress, 2.2))));
      } else {
        // App is confirmed ready in background!
        if (timeProgress < 1.0) {
          // If min display time hasn't finished yet, progress towards 95%
          targetPct = Math.min(95, Math.round(95 * (1 - Math.pow(1 - timeProgress, 2.2))));
        } else {
          // Both min time and app readiness achieved: finish to 100%!
          targetPct = 100;
        }
      }

      setProgress(targetPct);

      if (targetPct >= 100) {
        completed = true;
        // Hold 100% briefly, then smoothly fade out to reveal the live interactive app
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDone(true);
            if (onLoaded) onLoaded();
          }, 450);
        }, 120);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);

    // Safety fallback: ensure loading screen never hangs beyond 4.5 seconds
    const safetyTimer = setTimeout(() => {
      if (!completed) {
        completed = true;
        setProgress(100);
        setIsFadingOut(true);
        setTimeout(() => {
          setIsDone(true);
          if (onLoaded) onLoaded();
        }, 450);
      }
    }, 4500);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(safetyTimer);
    };
  }, [minDurationMs, onLoaded]);

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
