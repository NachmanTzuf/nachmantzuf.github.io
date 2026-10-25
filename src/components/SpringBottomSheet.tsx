import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Pressable,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  SPRING_PHYSICS,
  COLOR_PALETTE,
  SAFE_AREA_BUFFERS,
} from '../design-system/TOKENS';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SpringBottomSheetProps {
  /** Controls open or closed visibility */
  isOpen: boolean;
  /** Invoked when sheet requests dismissal */
  onClose: () => void;
  /** Child content rendered inside modal sheet */
  children: React.ReactNode;
  /** Target sheet expansion height in density independent pixels */
  sheetHeight?: number;
  /** Active visual theme */
  themeMode?: 'dark' | 'light';
  /** Toggle visibility of top tactile grab indicator */
  showHandle?: boolean;
  /** Container custom style override */
  style?: StyleProp<ViewStyle>;
}

export const SpringBottomSheet = ({
  isOpen,
  onClose,
  children,
  sheetHeight = Math.min(SCREEN_HEIGHT * 0.65, 520),
  themeMode = 'dark',
  showHandle = true,
  style,
}: SpringBottomSheetProps): React.ReactElement | null => {
  const insets = useSafeAreaInsets();
  const bottomBuffer = Math.max(
    insets.bottom,
    SAFE_AREA_BUFFERS.BOTTOM_HOME_INDICATOR
  );
  const palette = COLOR_PALETTE[themeMode];

  const translationY = useSharedValue(SCREEN_HEIGHT);
  const startY = useSharedValue(0);

  const triggerRigidHaptic = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    } catch {
      // Haptics fallback on web or unsupported hardware
    }
  }, []);

  const triggerCloseCallback = useCallback(() => {
    onClose();
  }, [onClose]);

  // Synchronize open state with spring transition
  useEffect(() => {
    if (isOpen) {
      translationY.value = withSpring(
        0,
        SPRING_PHYSICS.SHEET_EXPAND,
        (finished?: boolean) => {
          if (finished) {
            runOnJS(triggerRigidHaptic)();
          }
        }
      );
    } else {
      translationY.value = withTiming(SCREEN_HEIGHT, { duration: 240 });
    }
  }, [isOpen, translationY, triggerRigidHaptic]);

  // Velocity and distance aware pan gesture running on UI thread
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startY.value = translationY.value;
    })
    .onUpdate((event: { translationY: number }) => {
      'worklet';
      const nextY = startY.value + event.translationY;
      // Allow slight upward resistance (rubberbanding) if pulled above 0
      if (nextY < 0) {
        translationY.value = nextY * 0.2;
      } else {
        translationY.value = nextY;
      }
    })
    .onEnd((event: { velocityY: number }) => {
      'worklet';
      const shouldDismiss =
        translationY.value > sheetHeight * 0.35 || event.velocityY > 500;

      if (shouldDismiss) {
        translationY.value = withTiming(
          SCREEN_HEIGHT,
          { duration: 220 },
          (finished?: boolean) => {
            if (finished) {
              runOnJS(triggerCloseCallback)();
            }
          }
        );
      } else {
        translationY.value = withSpring(
          0,
          SPRING_PHYSICS.SHEET_EXPAND,
          (finished?: boolean) => {
            if (finished) {
              runOnJS(triggerRigidHaptic)();
            }
          }
        );
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translationY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translationY.value,
      [0, sheetHeight],
      [0.6, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      pointerEvents: translationY.value >= sheetHeight ? 'none' : 'auto',
    };
  });

  if (!isOpen && translationY.value === SCREEN_HEIGHT) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Dimmed backdrop with dismissal on tap */}
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Dismiss sheet backdrop"
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => {
            translationY.value = withTiming(
              SCREEN_HEIGHT,
              { duration: 220 },
              (finished?: boolean) => {
                if (finished) {
                  runOnJS(triggerCloseCallback)();
                }
              }
            );
          }}
        />
      </Animated.View>

      {/* Spring Modal Sheet Container */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              height: sheetHeight + bottomBuffer,
              paddingBottom: bottomBuffer,
              backgroundColor: palette.surfaceElevated1,
            },
            sheetAnimatedStyle,
            style,
          ]}
          accessible={true}
          accessibilityRole="none"
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handleBar,
                  {
                    backgroundColor:
                      themeMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.28)'
                        : 'rgba(0, 0, 0, 0.22)',
                  },
                ]}
              />
            </View>
          )}
          <View style={styles.contentContainer}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  handleContainer: {
    width: '100%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  handleBar: {
    width: 38,
    height: 5,
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
