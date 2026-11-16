import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { CelticLyreIcon } from '../common/CelticIcons';

const KEY_INSTALLED = 'earpa_pwa_installed';
const KEY_DISMISSED_AT = 'earpa_pwa_install_dismissed_at';

// Capture beforeinstallprompt as early as possible at module load
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    (window as any).__earpaDeferredInstallPrompt = e;
    window.dispatchEvent(new Event('earpa:install-prompt-ready'));
  });
  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem(KEY_INSTALLED, 'true');
    } catch {}
    (window as any).__earpaDeferredInstallPrompt = null;
    window.dispatchEvent(new Event('earpa:pwa-installed'));
  });
}

export function isRunningAsInstalledPwa(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return true;
  try {
    const standaloneMatch =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
      window.matchMedia?.('(display-mode: minimal-ui)')?.matches;
    const iosStandalone = (window.navigator as any)?.standalone === true;
    const androidTwa = document.referrer?.startsWith('android-app://');
    const markedInstalled = localStorage.getItem(KEY_INSTALLED) === 'true';
    if (standaloneMatch || iosStandalone || androidTwa) {
      localStorage.setItem(KEY_INSTALLED, 'true');
      return true;
    }
    return markedInstalled;
  } catch {
    return false;
  }
}

function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1)
  );
}

interface PwaInstallModalProps {
  isAppReady: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isAppReady }) => {
  const [visible, setVisible] = useState(false);
  const [hasNativePrompt, setHasNativePrompt] = useState<boolean>(
    typeof window !== 'undefined' && !!(window as any).__earpaDeferredInstallPrompt
  );
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (isRunningAsInstalledPwa()) {
      setVisible(false);
      return;
    }

    const onPromptReady = () => {
      setHasNativePrompt(true);
    };
    const onInstalled = () => {
      setVisible(false);
    };

    window.addEventListener('earpa:install-prompt-ready', onPromptReady);
    window.addEventListener('earpa:pwa-installed', onInstalled);

    return () => {
      window.removeEventListener('earpa:install-prompt-ready', onPromptReady);
      window.removeEventListener('earpa:pwa-installed', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (isRunningAsInstalledPwa()) return;

    try {
      const dismissedAt = localStorage.getItem(KEY_DISMISSED_AT);
      if (dismissedAt) return;
    } catch {}

    const delay = isAppReady ? 300 : 1800;
    const timer = setTimeout(() => {
      if (!isRunningAsInstalledPwa()) {
        setVisible(true);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [isAppReady]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(KEY_DISMISSED_AT, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  const handleInstallPress = async () => {
    if (typeof window === 'undefined') return;
    const deferred = (window as any).__earpaDeferredInstallPrompt;
    if (deferred && typeof deferred.prompt === 'function') {
      setInstalling(true);
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice?.outcome === 'accepted') {
          try {
            localStorage.setItem(KEY_INSTALLED, 'true');
          } catch {}
          (window as any).__earpaDeferredInstallPrompt = null;
          setVisible(false);
          return;
        }
      } catch {
        setShowManualSteps(true);
      } finally {
        setInstalling(false);
      }
      return;
    }
    // Apple iOS Safari or browser without native beforeinstallprompt
    setShowManualSteps(true);
  };

  if (!visible) return null;

  const isApple = isAppleDevice();

  const content = (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close install prompt"
          onPress={handleDismiss}
          style={styles.closeBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.iconFrame}>
          <Image
            source={{ uri: '/images/icons/earpa_icon_192.png' }}
            style={styles.appIcon}
            resizeMode="cover"
          />
        </View>

        <View style={styles.badgeRow}>
          <CelticLyreIcon size={14} color="#f5c76b" />
          <Text style={styles.badgeText}>EARPA SANCTUARY APP</Text>
        </View>

        <Text style={styles.title}>Install Earpa</Text>
        <Text style={styles.subtitle}>
          Add Earpa to your home screen for full-screen Celtic harp training, offline practice, and daily reminders.
        </Text>

        <TouchableOpacity
          nativeID="pwa-install-primary-btn"
          accessibilityRole="button"
          accessibilityLabel="Install Earpa App"
          onPress={handleInstallPress}
          disabled={installing}
          style={styles.installBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.installBtnText}>
            {installing ? 'Opening Installer...' : 'Install'}
          </Text>
        </TouchableOpacity>

        {(showManualSteps || (!hasNativePrompt && isApple)) && (
          <View style={styles.stepsBox}>
            {isApple ? (
              <>
                <Text style={styles.stepsHeader}>Apple iPhone / iPad</Text>
                <Text style={styles.stepLine}>1. Tap the Share icon (□↑) in Safari.</Text>
                <Text style={styles.stepLine}>2. Scroll and tap "Add to Home Screen".</Text>
                <Text style={styles.stepLine}>3. Tap "Add" at the top right.</Text>
              </>
            ) : (
              <>
                <Text style={styles.stepsHeader}>Quick Browser Install</Text>
                <Text style={styles.stepLine}>1. Open your browser menu (⋮).</Text>
                <Text style={styles.stepLine}>2. Tap "Install app" or "Add to Home screen".</Text>
              </>
            )}
          </View>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Continue in Browser"
          onPress={handleDismiss}
          style={styles.dismissLinkBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissLinkText}>Continue in Browser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: 'rgba(4, 10, 8, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(25, 39, 30, 0.94)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        } as any)
      : {}),
  } as any,
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  iconFrame: {
    width: 68,
    height: 68,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 199, 107, 0.55)',
    marginBottom: 14,
    backgroundColor: '#0f1c14',
  },
  appIcon: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: '#f5c76b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    color: '#f8fafc',
    fontSize: 23,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  installBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: '#f5c76b',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(245, 199, 107, 0.35)',
    marginBottom: 12,
  } as any,
  installBtnText: {
    color: '#0f1c14',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stepsBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
  },
  stepsHeader: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },
  stepLine: {
    color: '#e2e8f0',
    fontSize: 12.5,
    lineHeight: 19,
  },
  dismissLinkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dismissLinkText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: '600',
  },
});
