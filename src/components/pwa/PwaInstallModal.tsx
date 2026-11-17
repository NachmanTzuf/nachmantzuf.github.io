import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
    (window as any).__pwaInstallPrompt = e;
    window.dispatchEvent(new Event('earpa:install-prompt-ready'));
  });
  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem(KEY_INSTALLED, 'true');
    } catch {}
    (window as any).__earpaDeferredInstallPrompt = null;
    (window as any).__pwaInstallPrompt = null;
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
    const fromPwaStartUrl = window.location?.search?.includes('source=pwa');
    const markedInstalled = localStorage.getItem(KEY_INSTALLED) === 'true';
    if (standaloneMatch || iosStandalone || androidTwa || fromPwaStartUrl) {
      localStorage.setItem(KEY_INSTALLED, 'true');
      return true;
    }
    return markedInstalled;
  } catch {
    return false;
  }
}

export function shouldShowFirstTimeDownloadGate(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  if (isRunningAsInstalledPwa()) return false;
  try {
    const dismissedAt = localStorage.getItem(KEY_DISMISSED_AT);
    if (dismissedAt) return false;
  } catch {}
  return true;
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
  isAppReady?: boolean;
  onDismiss?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState<boolean>(() => shouldShowFirstTimeDownloadGate());
  const [hasNativePrompt, setHasNativePrompt] = useState<boolean>(
    typeof window !== 'undefined' &&
      !!((window as any).__earpaDeferredInstallPrompt || (window as any).__pwaInstallPrompt)
  );
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    (window as any).__earpa_harpReady = true;
    if (isRunningAsInstalledPwa()) {
      setVisible(false);
      onDismiss?.();
      return;
    }

    const onPromptReady = () => {
      setHasNativePrompt(true);
    };
    const onInstalled = () => {
      setVisible(false);
      onDismiss?.();
    };

    window.addEventListener('earpa:install-prompt-ready', onPromptReady);
    window.addEventListener('earpa:can-install', onPromptReady);
    window.addEventListener('earpa:pwa-installed', onInstalled);

    return () => {
      window.removeEventListener('earpa:install-prompt-ready', onPromptReady);
      window.removeEventListener('earpa:can-install', onPromptReady);
      window.removeEventListener('earpa:pwa-installed', onInstalled);
    };
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(KEY_DISMISSED_AT, String(Date.now()));
    } catch {}
    setVisible(false);
    onDismiss?.();
  };

  const handleDownloadPress = async () => {
    if (typeof window === 'undefined') return;
    const deferred =
      (window as any).__earpaDeferredInstallPrompt || (window as any).__pwaInstallPrompt;
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
          (window as any).__pwaInstallPrompt = null;
          setVisible(false);
          onDismiss?.();
          return;
        }
      } catch {
        // Keep manual steps visible below
      } finally {
        setInstalling(false);
      }
    }
  };

  if (!visible || Platform.OS !== 'web') return null;

  const isApple = isAppleDevice();

  return (
    <View style={styles.fullScreenRoot}>
      <Image
        source={{ uri: '/images/earpa_sanctuary_bg.jpg' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
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

          <Text style={styles.title}>Download Earpa</Text>
          <Text style={styles.subtitle}>
            Download the Earpa app to your phone for the full-screen 3D Celtic harp experience. Once installed, open Earpa from your home screen.
          </Text>

          <TouchableOpacity
            nativeID="pwa-install-primary-btn"
            accessibilityRole="button"
            accessibilityLabel="Download Earpa App"
            onPress={handleDownloadPress}
            disabled={installing}
            style={styles.installBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.installBtnText}>
              {installing ? 'Downloading...' : 'Download'}
            </Text>
          </TouchableOpacity>

          <View style={styles.stepsBox}>
            {isApple ? (
              <>
                <Text style={styles.stepsHeader}>How to Download on iPhone / iPad</Text>
                <Text style={styles.stepLine}>1. Tap the Share button (□↑) in Safari.</Text>
                <Text style={styles.stepLine}>2. Scroll down and tap "Add to Home Screen".</Text>
                <Text style={styles.stepLine}>3. Tap "Add" — then open Earpa from your Home Screen.</Text>
              </>
            ) : (
              <>
                <Text style={styles.stepsHeader}>
                  {hasNativePrompt
                    ? 'Tap "Download" above to install instantly'
                    : 'How to Download on Android / Browser'}
                </Text>
                <Text style={styles.stepLine}>
                  1. Tap "Download" above (or tap ⋮ Browser Menu).
                </Text>
                <Text style={styles.stepLine}>
                  2. Tap "Install app" or "Add to Home screen".
                </Text>
                <Text style={styles.stepLine}>
                  3. Open Earpa directly from your phone Home Screen.
                </Text>
              </>
            )}
          </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenRoot: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: '#060c09',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 8, 0.76)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 365,
    backgroundColor: 'rgba(25, 39, 30, 0.94)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    paddingTop: 26,
    paddingBottom: 20,
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
    marginBottom: 12,
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  installBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: '#f5c76b',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(245, 199, 107, 0.35)',
    marginBottom: 14,
  } as any,
  installBtnText: {
    color: '#0f1c14',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.6,
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
    fontSize: 12,
    lineHeight: 18,
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
