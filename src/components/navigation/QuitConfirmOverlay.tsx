import React from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBackHandler } from '../../services/navigation/AppBackGuard';

interface QuitConfirmOverlayProps {
  showBackHint: boolean;
  showQuitModal: boolean;
  onStay: () => void;
  onConfirmQuit: () => void;
}

export const QuitConfirmOverlay: React.FC<QuitConfirmOverlayProps> = ({
  showBackHint,
  showQuitModal,
  onStay,
  onConfirmQuit,
}) => {
  // Pressing Back again while the Quit dialog is open simply dismisses it back to the app
  useBackHandler(
    'quit-confirm-modal',
    showQuitModal,
    () => {
      onStay();
      return true;
    },
    100
  );

  return (
    <>
      {showBackHint && !showQuitModal && (
        <View pointerEvents="none" style={styles.hintWrap} nativeID="earpa-back-quit-hint">
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>Swipe or press back again to quit</Text>
          </View>
        </View>
      )}

      <Modal
        visible={showQuitModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onStay}
      >
        <View style={styles.backdrop} nativeID="earpa-quit-confirm-modal">
          <View style={styles.card}>
            <Text style={styles.eyebrow}>EARPA</Text>
            <Text style={styles.title}>Leave Earpa?</Text>
            <Text style={styles.message}>
              Are you sure you want to quit this app?
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                nativeID="earpa-quit-confirm-btn"
                accessibilityRole="button"
                accessibilityLabel="Quit App"
                activeOpacity={0.78}
                onPress={onConfirmQuit}
                style={styles.quitBtn}
              >
                <Text style={styles.quitBtnText}>Quit App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                nativeID="earpa-quit-stay-btn"
                accessibilityRole="button"
                accessibilityLabel="Stay in Earpa"
                activeOpacity={0.82}
                onPress={onStay}
                style={styles.stayBtn}
              >
                <Text style={styles.stayBtnText}>Stay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 162,
    alignItems: 'center',
    zIndex: 9999,
  },
  hintPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 22, 16, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(218, 197, 153, 0.36)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        } as any)
      : {}),
  },
  hintText: {
    color: '#f2e3c4',
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 13, 10, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        } as any)
      : {}),
  },
  card: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(15, 29, 22, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(218, 197, 153, 0.35)',
    alignItems: 'center',
    gap: 10,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.58)',
        } as any)
      : {}),
  },
  eyebrow: {
    color: '#d0bd96',
    fontSize: 10.5,
    letterSpacing: 3,
    fontFamily: 'Inter-SemiBold',
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 23,
    color: '#f7ead0',
    textAlign: 'center',
  },
  message: {
    color: '#c8bca2',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  quitBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(218, 197, 153, 0.25)',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  quitBtnText: {
    color: '#d8c8a8',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  stayBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.65)',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  stayBtnText: {
    color: '#ecfdf5',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});
