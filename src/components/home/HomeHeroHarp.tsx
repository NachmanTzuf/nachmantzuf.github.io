import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CelticHarpCanvas, CelticHarpCanvasRef } from '../3d/CelticHarpCanvas';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface HomeHeroHarpProps {
  onPressPlay: () => void;
  onOpenRoadmap: () => void;
  onStringPlucked?: (degreeNumber: number) => void;
  onModelLoaded?: () => void;
  streakCount: number;
  currentXp: number;
  nextMilestoneXp: number;
  levelNumber: number;
  levelTitle: string;
  themeColor?: string;
  playTextColor?: string;
  runeColor?: string;
  runeGlow?: string;
  playButtonLabel?: string;
  secondaryAction?: React.ReactNode;
}

export const HomeHeroHarp: React.FC<HomeHeroHarpProps> = ({
  onPressPlay,
  onStringPlucked,
  onModelLoaded,
  themeColor = '#059669',
  playTextColor,
  runeColor = '#fef08a',
  runeGlow = '0 0 10px rgba(254, 240, 138, 0.95), 0 0 20px rgba(245, 158, 11, 0.75)',
  playButtonLabel = 'PRESS TO PLAY',
  secondaryAction,
}) => {
  const canvasRef = useRef<CelticHarpCanvasRef | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const activeRuneColor = playTextColor || runeColor;

  return (
    <View style={styles.heroWrapper}>
      {/* Dynamic Keyframe Animation Style for Gentle Liquid Floating Gold Button */}
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes floatLiquidPlayBtn {
                0%, 100% {
                  transform: perspective(600px) rotateX(16deg) translateY(0px) scale(1);
                  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.7), 0 0 14px rgba(212, 175, 55, 0.22);
                }
                50% {
                  transform: perspective(600px) rotateX(14deg) translateY(-5px) scale(1.015);
                  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.85), 0 0 22px rgba(212, 175, 55, 0.38);
                }
              }
              #liquid-gold-play-btn {
                animation: floatLiquidPlayBtn 3.2s ease-in-out infinite !important;
                transform-style: preserve-3d !important;
                transition: filter 0.18s ease;
              }
              #liquid-gold-play-btn:hover {
                filter: brightness(1.15);
              }
              #liquid-gold-play-btn:active {
                transform: perspective(600px) rotateX(16deg) translateY(2px) scale(0.97) !important;
                filter: brightness(0.95);
              }
            `,
          }}
        />
      )}

      {/* 3D Celtic Harp Canvas on Roman Sandstone Plinth (Centerpiece Masterpiece) */}
      <View style={styles.harpCanvasContainer}>
        <ErrorBoundary componentName="HomeHeroHarpCanvas">
          <CelticHarpCanvas
            ref={canvasRef}
            style={styles.harpCanvas}
            onStringPlucked={onStringPlucked}
            onModelLoaded={onModelLoaded}
            interactiveControls={true}
            minimalHeroMode={true}
            autoSpin={true}
          />
        </ErrorBoundary>
      </View>

      {/* Action Section: Compact Angled Liquid Glass Play Button (Floating above tab bar clearance) */}
      <View style={styles.actionSection} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPressPlay}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          nativeID="liquid-gold-play-btn"
          style={[
            styles.liquidGlassPlayButton,
            isPressed && styles.liquidGlassPlayButtonPressed,
          ]}
        >
          {/* Specular Liquid Glass Top Highlight */}
          <View style={styles.glassTopSpecularLip} />

          {/* Button Content: Roman Antique Gold Material with Illuminated Rune Text & Icon */}
          <View style={styles.playButtonContent}>
            <View style={[styles.playIconGlassCircle, { boxShadow: runeGlow } as any]}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={activeRuneColor}
                stroke={activeRuneColor}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 5px ${activeRuneColor})` }}
              >
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </View>
            <Text
              style={[
                styles.playButtonText,
                {
                  color: activeRuneColor,
                  ...(Platform.OS === 'web' ? ({ textShadow: runeGlow } as any) : {}),
                },
              ]}
            >
              {playButtonLabel}
            </Text>
          </View>
        </TouchableOpacity>
        {secondaryAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroWrapper: {
    width: '100%',
    flex: 1,
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  harpCanvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  harpCanvas: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  actionSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    gap: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 104, // Dedicated action stack clears the bottom navigation.
    backgroundColor: 'transparent',
  },
  liquidGlassPlayButton: {
    width: 206, // Compact width, NOT wide
    height: 50,
    borderRadius: 25,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.28) 0%, rgba(180, 130, 40, 0.12) 50%, rgba(245, 158, 11, 0.22) 100%)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    boxShadow: '0 14px 32px rgba(0, 0, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.65)',
    transform: [{ perspective: 600 }, { rotateX: '16deg' }], // Angled towards the inside of the screen
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(220%)',
          WebkitBackdropFilter: 'blur(28px) saturate(220%)',
          transformStyle: 'preserve-3d',
        } as any)
      : {}),
  } as any,
  liquidGlassPlayButtonPressed: {
    transform: [{ perspective: 600 }, { rotateX: '16deg' }, { translateY: 2 }, { scale: 0.97 }],
    boxShadow: '0 8px 20px rgba(212, 175, 55, 0.45)',
  } as any,
  glassTopSpecularLip: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1.5,
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0) 100%)',
    zIndex: 3,
  } as any,
  playButtonContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  playIconGlassCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
  } as any,
  playButtonText: {
    color: '#fffbeb',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

