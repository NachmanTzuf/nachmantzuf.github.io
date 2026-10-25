import React from 'react';
import {ProfilePhoto} from '../account/ProfilePhoto';
import {UserAccountDatabase} from '../../services/account/UserAccountDatabase';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  CelticLyreIcon,
  GoldTorcIcon,
  SaintBrigidFlameIcon,
} from '../common/CelticIcons';
import { LiquidGlassRoadmapCard } from '../common/LiquidGlassRoadmapCard';

export type TabKey = 'home' | 'chords' | 'levers' | 'profile';

interface TopHeaderBarProps {
  activeTab?: TabKey;
  levelNumber?: number;
  streakCount?: number;
  currentXp?: number;
  nextMilestoneXp?: number;
  levelTitle?: string;
  onOpenProfile?: () => void;
  onOpenRoadmap?: (theme?: 'single' | 'melody' | 'levers') => void;
  onOpenSocial?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  activeTab = 'home',
  levelNumber = 1,
  streakCount = 1,
  currentXp = 320,
  nextMilestoneXp = 500,
  onOpenProfile,
  onOpenRoadmap,
}) => {
  const userLvl = Math.max(1, levelNumber);
  const stageNum = Math.floor((userLvl - 1) / 10) + 1;
  const lvlInStage = ((userLvl - 1) % 10) + 1;

  // Section-specific configuration for the Standalone Liquid Glass Trail Map Card
  // Dynamically bound to user's real live progression level!
  const sectionConfig = {
    home: {
      stageNumber: stageNum,
      stageTitle: 'THE TONIC ANCHOR',
      currentLevelInStage: lvlInStage,
      globalLevel: userLvl,
      currentXp: currentXp,
      nextMilestoneXp: nextMilestoneXp,
      buttonNativeId: 'top-roadmap-banner-btn',
      theme: 'single' as const,
      accentColor: '#059669',
    },
    chords: {
      stageNumber: stageNum,
      stageTitle: 'MELODIC SEQUENCE',
      currentLevelInStage: lvlInStage,
      globalLevel: userLvl,
      currentXp: currentXp,
      nextMilestoneXp: nextMilestoneXp,
      buttonNativeId: 'melody-trail-map-btn',
      theme: 'melody' as const,
      accentColor: '#0284c7',
    },
    levers: {
      stageNumber: stageNum,
      stageTitle: 'LEVER ROADMAP',
      currentLevelInStage: lvlInStage,
      globalLevel: userLvl,
      currentXp: currentXp,
      nextMilestoneXp: nextMilestoneXp,
      buttonNativeId: 'levers-trail-map-btn',
      theme: 'levers' as const,
      accentColor: '#d97706',
    },
    profile: {
      stageNumber: stageNum,
      stageTitle: 'HARPER JOURNEY',
      currentLevelInStage: lvlInStage,
      globalLevel: userLvl,
      currentXp: currentXp,
      nextMilestoneXp: nextMilestoneXp,
      buttonNativeId: 'journey-roadmap-btn',
      theme: 'profile' as const,
      accentColor: '#a855f7',
    },
  }[activeTab || 'home'];

  return (
    <View style={styles.container}>
      {/* 1. Top Status Row: Profile Chip on Left, Shards in Center, Streak on Right (Tripartite Symmetry) */}
      <View style={styles.topStatusRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenProfile}
          style={styles.profileChip}
        >
          <View style={styles.avatarCircle}>
            <ProfilePhoto uri={UserAccountDatabase.getInstance().getActiveProfile().avatarPhoto} name={UserAccountDatabase.getInstance().getActiveProfile().displayName} size={30} />
          </View>
          <View style={styles.profileInfo}>
            <Text numberOfLines={1} style={[styles.userNameText,{maxWidth:105}]}>{UserAccountDatabase.getInstance().getActiveProfile().displayName}</Text>
            <Text style={styles.rankTitleText}>Level {levelNumber}</Text>
          </View>
        </TouchableOpacity>

        {/* Center Symmetrical Metric Pill */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onOpenRoadmap && onOpenRoadmap(activeTab === 'profile' ? 'single' : sectionConfig.theme as 'single' | 'melody' | 'levers')}
          style={styles.centerMetricBadge}
        >
          <GoldTorcIcon size={15} />
          <Text style={styles.centerMetricText}>{currentXp} Shards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenProfile}
          style={styles.streakBadge}
        >
          <SaintBrigidFlameIcon size={15} />
          <Text style={styles.streakCountText}>{streakCount}d Streak</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Standalone Liquid Glass Trail Map Card tailored specifically to the active section */}
      {activeTab !== 'profile' && <LiquidGlassRoadmapCard
        stageNumber={sectionConfig.stageNumber}
        stageTitle={sectionConfig.stageTitle}
        currentLevelInStage={sectionConfig.currentLevelInStage}
        globalLevel={sectionConfig.globalLevel}
        currentXp={sectionConfig.currentXp}
        nextMilestoneXp={sectionConfig.nextMilestoneXp}
        buttonNativeId={sectionConfig.buttonNativeId}
        accentColor={sectionConfig.accentColor}
        theme={sectionConfig.theme}
        onOpenRoadmap={() => {
          if (onOpenRoadmap) {
            onOpenRoadmap(sectionConfig.theme as 'single' | 'melody' | 'levers');
          }
        }}
      />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'web' ? 8 : 4,
    paddingBottom: 4,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  topStatusRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    boxShadow: 'none',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } as any)
      : {}),
  } as any,
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  userNameText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rankTitleText: {
    color: '#e2e8f0',
    fontSize: 9,
    fontWeight: '600',
  },
  centerMetricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    boxShadow: 'none',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } as any)
      : {}),
  } as any,
  centerMetricText: {
    color: '#dfc99f',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    boxShadow: 'none',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } as any)
      : {}),
  } as any,
  streakCountText: {
    color: '#dfc99f',
    fontSize: 11,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
