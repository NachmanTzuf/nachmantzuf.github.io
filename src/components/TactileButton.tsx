import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  SPRING_PHYSICS,
  TOUCH_TARGETS,
  COLOR_PALETTE,
} from '../design-system/TOKENS';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TactileButtonProps {
  /** Function invoked upon button activation */
  onPress?: () => void;
  /** Function invoked upon prolonged press */
  onLongPress?: () => void;
  /** Primary label displayed inside button */
  title?: string;
  /** Optional custom child components */
  children?: React.ReactNode;
  /** Visual theme archetype */
  variant?: 'primary' | 'secondary' | 'surface';
  /** Active color mode */
  themeMode?: 'dark' | 'light';
  /** Disabled state */
  disabled?: boolean;
  /** Hit boundary expansion preset */
  hitSlopPreset?: 'compact' | 'standard' | 'none';
  /** Target scale compression on touch down (default: 0.96) */
  pressScale?: number;
  /** Custom container styling */
  style?: StyleProp<ViewStyle>;
  /** Custom text styling */
  textStyle?: StyleProp<TextStyle>;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Accessibility hint explaining action consequence */
  accessibilityHint?: string;
}

export const TactileButton = ({
  onPress,
  onLongPress,
  title,
  children,
  variant = 'primary',
  themeMode = 'dark',
  disabled = false,
  hitSlopPreset = 'standard',
  pressScale = 0.96,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: TactileButtonProps): React.ReactElement => {
  const scale = useSharedValue(1);
  const palette = COLOR_PALETTE[themeMode];

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(pressScale, SPRING_PHYSICS.BUTTON_PRESS);
  }, [disabled, pressScale, scale]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(1, SPRING_PHYSICS.BUTTON_PRESS);
  }, [disabled, scale]);

  const handlePress = useCallback(async () => {
    if (disabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics fallback on web or unsupported hardware
    }
    onPress?.();
  }, [disabled, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const hitSlop =
    hitSlopPreset === 'compact'
      ? TOUCH_TARGETS.HIT_SLOP_COMPACT
      : hitSlopPreset === 'standard'
      ? TOUCH_TARGETS.HIT_SLOP_STANDARD
      : undefined;

  // Resolve visual variant colors
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: palette.surfaceElevated2,
            borderColor: palette.primaryAccent,
            borderWidth: 1.5,
          },
          text: {
            color: palette.textPrimary,
          },
        };
      case 'surface':
        return {
          container: {
            backgroundColor: palette.surfaceElevated1,
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: palette.textPrimary,
          },
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: palette.primaryAccent,
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: themeMode === 'dark' ? '#0A0C10' : '#FFFFFF',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      style={[
        styles.baseContainer,
        variantStyles.container,
        disabled && styles.disabledContainer,
        animatedStyle,
        style,
      ]}
    >
      {children ? (
        children
      ) : (
        <Text
          style={[
            styles.baseText,
            variantStyles.text,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    minHeight: TOUCH_TARGETS.MIN_TOUCH_ANDROID, // 48dp Material 3 ceiling
    minWidth: TOUCH_TARGETS.MIN_TOUCH_ANDROID,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  baseText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  disabledContainer: {
    opacity: 0.45,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledText: {
    color: '#94A3B8',
  },
});
