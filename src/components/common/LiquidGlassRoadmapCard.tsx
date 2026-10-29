import React from 'react';
import { LessonLibrary } from './LessonLibrary';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  MegalithicDolmenIcon,
  CelticSunburstStarIcon,
  CelticChaliceRelicIcon,
} from './CelticIcons';

export type RealmThemeKey = 'single' | 'melody' | 'levers' | 'profile';

interface RealmThemeConfig {
  primary: string;
  textHighlight: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  titleColor: string;
  roadStroke: string;
  roadGlow: string;
  progressFill: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
  nodeActiveBg: string;
  nodeActiveBorder: string;
}

export const REALM_CARD_THEMES: Record<RealmThemeKey, RealmThemeConfig> = {
  single: {
    primary: '#059669',
    textHighlight: '#10b981',
    badgeBg: 'rgba(6, 78, 59, 0.42)',
    badgeBorder: 'rgba(16, 185, 129, 0.55)',
    badgeText: '#10b981',
    titleColor: '#34d399',
    roadStroke: '#059669',
    roadGlow: 'rgba(5, 150, 105, 0.55)',
    progressFill: '#059669',
    btnBg: 'rgba(6, 78, 59, 0.45)',
    btnBorder: 'rgba(16, 185, 129, 0.55)',
    btnText: '#34d399',
    nodeActiveBg: '#047857',
    nodeActiveBorder: '#10b981',
  },
  melody: {
    primary: '#0284c7',
    textHighlight: '#38bdf8',
    badgeBg: 'rgba(12, 74, 110, 0.42)',
    badgeBorder: 'rgba(56, 189, 248, 0.55)',
    badgeText: '#38bdf8',
    titleColor: '#7dd3fc',
    roadStroke: '#0284c7',
    roadGlow: 'rgba(2, 132, 199, 0.55)',
    progressFill: '#0284c7',
    btnBg: 'rgba(12, 74, 110, 0.45)',
    btnBorder: 'rgba(56, 189, 248, 0.55)',
    btnText: '#7dd3fc',
    nodeActiveBg: '#0369a1',
    nodeActiveBorder: '#38bdf8',
  },
  levers: {
    primary: '#d97706',
    textHighlight: '#f59e0b',
    badgeBg: 'rgba(120, 53, 15, 0.42)',
    badgeBorder: 'rgba(245, 158, 11, 0.55)',
    badgeText: '#f59e0b',
    titleColor: '#fbbf24',
    roadStroke: '#d97706',
    roadGlow: 'rgba(217, 119, 6, 0.55)',
    progressFill: '#d97706',
    btnBg: 'rgba(120, 53, 15, 0.45)',
    btnBorder: 'rgba(245, 158, 11, 0.55)',
    btnText: '#fbbf24',
    nodeActiveBg: '#b45309',
    nodeActiveBorder: '#fbbf24',
  },
  profile: {
    primary: '#a855f7',
    textHighlight: '#c084fc',
    badgeBg: 'rgba(88, 28, 135, 0.42)',
    badgeBorder: 'rgba(168, 85, 247, 0.55)',
    badgeText: '#c084fc',
    titleColor: '#e9d5ff',
    roadStroke: '#a855f7',
    roadGlow: 'rgba(168, 85, 247, 0.55)',
    progressFill: '#a855f7',
    btnBg: 'rgba(88, 28, 135, 0.45)',
    btnBorder: 'rgba(168, 85, 247, 0.55)',
    btnText: '#c084fc',
    nodeActiveBg: '#7c3aed',
    nodeActiveBorder: '#e9d5ff',
  },
};

export interface LiquidGlassRoadmapCardProps {
  stageNumber: number;
  stageTitle: string;
  currentLevelInStage: number; // 1 to 10
  globalLevel: number;
  currentXp: number;
  nextMilestoneXp: number;
  buttonNativeId?: string;
  onOpenRoadmap: () => void;
  accentColor?: string;
  theme?: RealmThemeKey;
}

export const LiquidGlassRoadmapCard: React.FC<LiquidGlassRoadmapCardProps> = ({
  stageNumber = 1,
  stageTitle = 'THE TONIC ANCHOR',
  currentLevelInStage = 4,
  globalLevel = 4,
  currentXp = 320,
  nextMilestoneXp = 500,
  buttonNativeId = 'top-roadmap-banner-btn',
  onOpenRoadmap,
  theme = 'single',
}) => {
  const cfg = REALM_CARD_THEMES[theme] || REALM_CARD_THEMES.single;
  const totalTargetStages = 10;
  const totalTargetLevels = 68; // 68 levels leading to the 10th Stage Pinnacle
  const stageProgressRatio = Math.min(1, Math.max(0, (globalLevel - 1) / (totalTargetLevels - 1)));
  const stageProgressPct = Math.round(stageProgressRatio * 100);
  const remainingPct = 100 - stageProgressPct;

  // 10 Mini Waypoint Stepping Stones representing the 10 Levels of the Active Stage
  const miniStones = Array.from({ length: 10 }, (_, i) => {
    const num = i + 1;
    const isCompleted = num < currentLevelInStage;
    const isCurrent = num === currentLevelInStage;
    const isRelic = num === 10;
    return {
      num,
      status: isCompleted ? 'completed' : isCurrent ? 'current' : isRelic ? 'relic' : 'upcoming',
    };
  });

  return (
    <View style={styles.roadmapCard}>
      {/* Top Header of Card: Stage Title on Left, Trail Map Button on Right */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.stageTitleWrap}>
          <View
            style={[
              styles.stageBadge,
              {
                backgroundColor: cfg.badgeBg,
                borderColor: cfg.badgeBorder,
              },
            ]}
          >
            <MegalithicDolmenIcon size={14} color={cfg.badgeText} />
            <Text style={[styles.stageBadgeText, { color: cfg.badgeText }]}>
              STAGE {stageNumber}
            </Text>
          </View>
          <Text style={[styles.stageTitleText, { color: cfg.titleColor }]}>
            {stageTitle.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onOpenRoadmap}
          nativeID={buttonNativeId}
          style={[
            styles.trailMapBtn,
            {
              backgroundColor: cfg.btnBg,
              borderColor: cfg.btnBorder,
              boxShadow: `0 2px 10px ${cfg.roadGlow}`,
            },
          ]}
        >
          <Text style={[styles.trailMapBtnText, { color: cfg.btnText }]}>
            TRAIL MAP ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* Middle of Card: Sinuous SVG Road Mini-Map Preview */}
      <View style={styles.miniMapWrapper}>
        <svg
          style={styles.miniMapSvg}
          viewBox="0 0 320 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 18 14 Q 50 20 80 14 Q 110 8 140 14 Q 170 20 200 14 Q 230 8 260 14 Q 285 18 302 14"
            stroke={cfg.roadGlow}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 18 14 Q 50 20 80 14 Q 110 8 140 14 Q 170 20 200 14 Q 230 8 260 14 Q 285 18 302 14"
            stroke={cfg.roadStroke}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
        </svg>

        {/* 10 Mini Waypoint Nodes along the road */}
        <View style={styles.miniNodesRow}>
          {miniStones.map((st) => {
            const isCompleted = st.status === 'completed';
            const isCurrent = st.status === 'current';
            const isRelic = st.status === 'relic';

            return (
              <View
                key={st.num}
                style={[
                  styles.miniNode,
                  isCompleted && {
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    borderColor: cfg.primary,
                    boxShadow: `0 0 6px ${cfg.roadGlow}`,
                  },
                  isCurrent && {
                    backgroundColor: cfg.nodeActiveBg,
                    borderColor: cfg.nodeActiveBorder,
                    boxShadow: `0 0 10px ${cfg.primary}`,
                    transform: [{ scale: 1.15 }],
                  },
                  !isCompleted && !isCurrent && {
                    backgroundColor: 'rgba(30, 41, 59, 0.40)',
                    borderColor: 'rgba(148, 163, 184, 0.22)',
                  },
                ]}
              >
                {isCompleted && (
                  <CelticSunburstStarIcon size={11} filled={true} color="#f59e0b" />
                )}
                {isCurrent && <Text style={styles.miniNodeCurrentNum}>{st.num}</Text>}
                {!isCompleted && !isCurrent && (
                  <Text style={[styles.miniNodeUpcomingNum, { color: '#64748b' }]}>{st.num}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {theme !== 'profile' && <View style={{alignItems:'flex-end', marginTop:4, marginBottom:4}}><LessonLibrary track={theme} /></View>}
      {/* Bottom of Card: Stage 10 Progress and Remaining Percentage */}
      <View style={styles.xpBarContainer}>
        <View style={styles.xpTextRow}>
          <Text style={styles.xpLabel}>STAGE 10 PROGRESS</Text>
          <Text style={[styles.xpValue, { color: cfg.textHighlight }]}>
            {remainingPct}% LEFT TO 10TH STAGE ({stageProgressPct}%)
          </Text>
        </View>
        <View style={styles.xpTrack}>
          <View
            style={[
              styles.xpFill,
              {
                width: `${Math.max(4, stageProgressPct)}%`,
                backgroundColor: cfg.progressFill,
                boxShadow: `0 0 8px ${cfg.primary}`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  roadmapCard: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.45), 0 12px 36px rgba(0, 0, 0, 0.45)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        } as any)
      : {}),
  } as any,
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  stageTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 0.8,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  stageBadgeText: {
    color: '#fef08a',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  stageTitleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  trailMapBtn: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.6)',
    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)',
  } as any,
  trailMapBtnText: {
    color: '#fef08a',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  miniMapWrapper: {
    width: '100%',
    height: 28,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  miniMapSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  } as any,
  miniNodesRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    zIndex: 2,
  },
  miniNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#261b12',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniNodeCompleted: {
    backgroundColor: '#8c592e',
    borderColor: '#fbbf24',
    boxShadow: '0 0 6px rgba(251, 191, 36, 0.4)',
  } as any,
  miniNodeCurrent: {
    backgroundColor: '#d97706',
    borderColor: '#fef08a',
    boxShadow: '0 0 10px rgba(254, 240, 138, 0.8)',
    transform: [{ scale: 1.15 }],
  } as any,
  miniNodeRelic: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#fbbf24',
  },
  miniNodeCurrentNum: {
    color: '#0f0a06',
    fontSize: 10,
    fontWeight: '900',
  },
  miniNodeUpcomingNum: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
  },
  xpBarContainer: {
    width: '100%',
  },
  xpTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  xpLabel: {
    color: '#94a3b8',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xpValue: {
    color: '#fef08a',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  xpTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 2,
    boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)',
  } as any,
});
