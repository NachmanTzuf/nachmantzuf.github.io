import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface AppLoaderProps {
  message?: string;
  error?: string | null;
  onRetry?: () => void;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  message = 'Tuning Celtic strings...',
  error = null,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes celticPulseRing {
                0% { transform: scale(0.85); opacity: 0.3; }
                50% { transform: scale(1.08); opacity: 0.85; }
                100% { transform: scale(0.85); opacity: 0.3; }
              }
              @keyframes celticSpinSubtle {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .celtic-loader-ring {
                animation: celticPulseRing 2.6s ease-in-out infinite;
                transform-origin: center;
              }
              .celtic-loader-spin {
                animation: celticSpinSubtle 16s linear infinite;
                transform-origin: center;
              }
            `,
          }}
        />
      )}

      {/* Lightweight SVG Animated Celtic Mark */}
      <View style={styles.svgWrapper}>
        <svg
          viewBox="0 0 120 120"
          width="96"
          height="96"
          role="img"
          aria-label={error ? 'Loading error' : 'Loading Earpa'}
        >
          {/* Subtle Outer Dashed Ring */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={error ? '#ef4444' : '#c89d58'}
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="celtic-loader-spin"
            opacity="0.45"
          />

          {/* Pulsing Concentric Aura */}
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke={error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(200, 157, 88, 0.18)'}
            strokeWidth="6"
            className="celtic-loader-ring"
          />

          {/* Center Harp Silhouette Mark */}
          <path
            d="M 44 32 Q 36 62 44 86 M 44 32 Q 66 30 84 48 L 78 86 Z"
            fill="none"
            stroke={error ? '#fca5a5' : '#ebd19f'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Resonant Center Strings */}
          <line x1="50" y1="36" x2="52" y2="84" stroke={error ? '#ef4444' : '#e06060'} strokeWidth="1.5" />
          <line x1="58" y1="39" x2="60" y2="82" stroke="#ebd19f" strokeWidth="1.5" opacity="0.8" />
          <line x1="66" y1="42" x2="68" y2="78" stroke="#ebd19f" strokeWidth="1.5" opacity="0.8" />
          <line x1="74" y1="45" x2="76" y2="72" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      </View>

      {/* Status Message or Error Display */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Sanctuary Connection Interrupted</Text>
          <Text style={styles.errorDesc}>{error}</Text>
          {onRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reconnect & Retry →</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.textWrapper}>
          <Text style={styles.loadingMessage}>{message}</Text>
          <Text style={styles.subText}>Preparing Celtic acoustics & 3D lutherie</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090d16',
    padding: 24,
  },
  svgWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  loadingMessage: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#ebd19f',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorBox: {
    alignItems: 'center',
    maxWidth: 320,
    gap: 8,
  },
  errorTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#f87171',
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c89d58',
    backgroundColor: 'rgba(200, 157, 88, 0.15)',
  },
  retryButtonText: {
    color: '#f0d9ab',
    fontSize: 14,
    fontWeight: '700',
  },
});
