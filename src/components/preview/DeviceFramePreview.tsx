import {CelticSolarCrossIcon} from '../common/CelticIcons';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';

export type DeviceModel = 'iphone15' | 'galaxy' | 'responsive';
export type ScaleMode = 'fit' | '75' | '85' | '100';

interface DeviceFramePreviewProps {
  children: React.ReactNode;
}

export const DeviceFramePreview: React.FC<DeviceFramePreviewProps> = ({ children }) => {
  const [device, setDevice] = useState<DeviceModel>('iphone15');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('fit');
  const [showPwaGuide, setShowPwaGuide] = useState<boolean>(false);
  const [windowHeight, setWindowHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute exact scale to fit 100% of the phone inside screen height in one single glance
  // Top control bar is 44px + 20px padding = 64px chrome; leave 24px safety buffer
  const availableHeight = Math.max(400, windowHeight - 88);
  const targetBezelHeight = device === 'iphone15' ? 852 : 844;
  const autoScale = Math.min(0.92, Math.max(0.42, (availableHeight - 24) / targetBezelHeight));
  const currentScale =
    scaleMode === 'fit'
      ? autoScale
      : scaleMode === '75'
      ? 0.75
      : scaleMode === '85'
      ? 0.85
      : 1.0;

  // If on actual mobile device or running native mobile app, render directly without frame
  if (Platform.OS !== 'web') {
    return <View style={styles.nativeRoot}>{children}</View>;
  }

  // Check if viewport is already mobile width
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth <= 600;
  if (isMobileScreen || device === 'responsive') {
    return (
      <View style={styles.responsiveRoot}>
        {/* Mobile top floating switcher for PWA installation guide */}
        <View style={styles.mobileInstallBanner}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowPwaGuide(true)}
            style={styles.mobileInstallBtn}
          >
            <CelticSolarCrossIcon size={16}/>
            <Text style={styles.installText}>Install Earpa App (Free PWA)</Text>
          </TouchableOpacity>
          {device === 'responsive' && !isMobileScreen && (
            <TouchableOpacity
              onPress={() => setDevice('iphone15')}
              style={styles.deviceTogglePill}
            >
              <Text style={styles.deviceToggleText}>Switch to Device Frame</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.responsiveContent}>{children}</View>

        {/* PWA Install Guide Modal */}
        <PwaInstallModal visible={showPwaGuide} onClose={() => setShowPwaGuide(false)} />
      </View>
    );
  }

  return (
    <View style={styles.desktopContainer}>
      {/* Top Floating Sleek Header Bar */}
      <View style={styles.controlBar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>EARPA</Text>
          <Text style={styles.brandBadge}>Celtic Harp Studio</Text>
        </View>

        {/* Device Switcher Pills */}
        <View style={styles.switcherPills}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDevice('iphone15')}
            style={[styles.switchPill, device === 'iphone15' && styles.switchPillActive]}
          >
            <Text style={[styles.switchText, device === 'iphone15' && styles.switchTextActive]}>
              iPhone 15 Pro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDevice('galaxy')}
            style={[styles.switchPill, device === 'galaxy' && styles.switchPillActive]}
          >
            <Text style={[styles.switchText, device === 'galaxy' && styles.switchTextActive]}>
              Galaxy S24
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDevice('responsive')}
            style={styles.switchPill}
          >
            <Text style={styles.switchText}>
              Full Screen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Section: Scale Selector Pills & PWA Install Button */}
        <View style={styles.rightSection}>
          <View style={styles.scaleSelectorPills}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setScaleMode('fit')}
              style={[styles.scalePill, scaleMode === 'fit' && styles.scalePillActive]}
            >
              <Text style={[styles.scaleText, scaleMode === 'fit' && styles.scaleTextActive]}>
                Fit Screen ({Math.round(autoScale * 100)}%)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setScaleMode('75')}
              style={[styles.scalePill, scaleMode === '75' && styles.scalePillActive]}
            >
              <Text style={[styles.scaleText, scaleMode === '75' && styles.scaleTextActive]}>
                75%
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setScaleMode('85')}
              style={[styles.scalePill, scaleMode === '85' && styles.scalePillActive]}
            >
              <Text style={[styles.scaleText, scaleMode === '85' && styles.scaleTextActive]}>
                85%
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setScaleMode('100')}
              style={[styles.scalePill, scaleMode === '100' && styles.scalePillActive]}
            >
              <Text style={[styles.scaleText, scaleMode === '100' && styles.scaleTextActive]}>
                100%
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowPwaGuide(true)}
            style={styles.pwaGuideButton}
          >
            <CelticSolarCrossIcon size={28}/>
            <Text style={styles.pwaGuideText}>Install on Phone</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Phone Viewport Area: Centered and Scaled in One Glance */}
      <View style={styles.phoneViewportArea}>
        <div
          style={{
            width: (device === 'iphone15' ? 393 : 384) * currentScale,
            height: (device === 'iphone15' ? 852 : 844) * currentScale,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${currentScale})`,
              transformOrigin: 'center center',
              width: device === 'iphone15' ? 393 : 384,
              height: device === 'iphone15' ? 852 : 844,
              transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {device === 'iphone15' && (
              <View style={styles.iphoneBezel}>
                {/* Dynamic Island */}
                <View style={styles.dynamicIsland}>
                  <View style={styles.cameraLens} />
                  <View style={styles.sensorPill} />
                </View>

                {/* Screen Viewport */}
                <View style={styles.iphoneScreen}>{children}</View>

                {/* iOS Home Indicator Bar */}
                <View style={styles.homeIndicator} />
              </View>
            )}

            {device === 'galaxy' && (
              <View style={styles.galaxyBezel}>
                {/* Centered Punch-hole Selfie Camera */}
                <View style={styles.galaxyCameraHole} />

                {/* Screen Viewport */}
                <View style={styles.galaxyScreen}>{children}</View>

                {/* Android Gesture Bar */}
                <View style={styles.androidGestureBar} />
              </View>
            )}
          </div>
        </div>
      </View>

      {/* PWA Install Guide Modal */}
      <PwaInstallModal visible={showPwaGuide} onClose={() => setShowPwaGuide(false)} />
    </View>
  );
};

interface PwaModalProps {
  visible: boolean;
  onClose: () => void;
}

const PwaInstallModal: React.FC<PwaModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.pwaModalCard}>
          <View style={styles.pwaModalHeader}>
            <View>
              <Text style={styles.pwaModalTitle}>Install Earpa Directly on Phone</Text>
              <Text style={styles.pwaModalSubtitle}>
                Bypass App Store fees & test instantly via URL
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructionSections}>
            {/* Apple iOS Safari Guide */}
            <View style={styles.guideCard}>
              <View style={styles.platformBadgeApple}>
                <Text style={styles.platformBadgeText}>APPLE iOS (Safari)</Text>
              </View>
              <View style={styles.stepsList}>
                <Text style={styles.stepItem}>1. Open this website URL in Safari on your iPhone.</Text>
                <Text style={styles.stepItem}>2. Tap the Share button (the square with an arrow pointing up).</Text>
                <Text style={styles.stepItem}>3. Scroll down and tap Add to Home Screen.</Text>
                <Text style={styles.stepItem}>4. Earpa launches in full-screen standalone mode just like an App Store app.</Text>
              </View>
            </View>

            {/* Google Android Chrome Guide */}
            <View style={styles.guideCard}>
              <View style={styles.platformBadgeAndroid}>
                <Text style={styles.platformBadgeText}>GOOGLE ANDROID (Chrome)</Text>
              </View>
              <View style={styles.stepsList}>
                <Text style={styles.stepItem}>1. Open this website URL in Google Chrome on your Android device.</Text>
                <Text style={styles.stepItem}>2. Tap the three dots menu icon in the upper right corner.</Text>
                <Text style={styles.stepItem}>3. Tap Install app or Add to Home screen.</Text>
                <Text style={styles.stepItem}>4. Bypasses untrusted APK warnings and runs with full hardware acceleration.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.gotItButton}>
            <Text style={styles.gotItText}>GOT IT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  nativeRoot: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  responsiveRoot: {
    flex: 1,
    backgroundColor: '#090d16',
    minHeight: '100vh' as any,
  },
  mobileInstallBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.25)',
  },
  mobileInstallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  installIcon: {
    fontSize: 14,
  },
  installText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  deviceTogglePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deviceToggleText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
  responsiveContent: {
    flex: 1,
  },
  desktopContainer: {
    width: '100%',
    height: '100vh' as any,
    maxHeight: '100vh' as any,
    backgroundColor: '#05080e',
    background: 'radial-gradient(ellipse at 50% 25%, #0e1726 0%, #060910 65%, #030408 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: 'hidden',
    boxSizing: 'border-box',
  } as any,
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1040,
    height: 44,
    flexShrink: 0,
    zIndex: 100,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    color: '#fef08a',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  brandBadge: {
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  switcherPills: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  switchPillActive: {
    backgroundColor: '#38bdf8',
  },
  switchText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#090d16',
    fontWeight: '800',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scaleSelectorPills: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scalePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  scalePillActive: {
    backgroundColor: '#10b981',
  },
  scaleText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  scaleTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  pwaGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pwaGuideIcon: {
    fontSize: 12,
  },
  pwaGuideText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  phoneViewportArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iphoneBezel: {
    width: 393,
    height: 852,
    backgroundColor: '#090d16',
    borderRadius: 54,
    borderWidth: 10,
    borderColor: '#2b3342', // Titanium dark finish
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  } as any,
  dynamicIsland: {
    position: 'absolute',
    top: 11,
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 34,
    backgroundColor: '#000000',
    borderRadius: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sensorPill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f172a',
  },
  iphoneScreen: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    paddingTop: 48,
    boxSizing: 'border-box',
  } as any,
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -68,
    width: 136,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  galaxyBezel: {
    width: 384,
    height: 844,
    backgroundColor: '#090d16',
    borderRadius: 42,
    borderWidth: 8,
    borderColor: '#1f242e',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
    position: 'relative',
    overflow: 'hidden',
  } as any,
  galaxyCameraHole: {
    position: 'absolute',
    top: 14,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    zIndex: 9999,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  galaxyScreen: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    paddingTop: 36,
    boxSizing: 'border-box',
  } as any,
  androidGestureBar: {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pwaModalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0f141d',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    padding: 20,
  },
  pwaModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pwaModalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  pwaModalSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionSections: {
    gap: 14,
    marginBottom: 20,
  },
  guideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  platformBadgeApple: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  platformBadgeAndroid: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  platformBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  stepsList: {
    gap: 6,
  },
  stepItem: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 17,
  },
  gotItButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  gotItText: {
    color: '#090d16',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
