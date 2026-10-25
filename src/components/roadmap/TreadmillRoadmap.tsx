import {LevelPreviewCard} from './LevelPreviewCard';
import {LEVER_LEVELS} from '../../services/curriculum/leverCurriculum';
import { trailPoints, projectTrailPoint, TrailRealm } from './trailGeometry';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LevelDefinition, getLevelsByTrack, UNRESTRICTED_DEV_MODE, isLevelUnlocked } from '../../services/curriculum/curriculumData';
import { LiquidGlassLevelBadge } from './LiquidGlassLevelBadge';
import {
  CelticBroochLockIcon,
  CelticSunburstStarIcon,
  GoldTorcIcon,
  CelticChaliceRelicIcon,
} from '../common/CelticIcons';

export type RoadmapTrack = 'single' | 'melody';

interface TreadmillRoadmapProps {
  track: RoadmapTrack;
  activeLevelNumber: number; // 1 to 68 (The level player is currently on)
  onPlayLevel: (level: LevelDefinition) => void;
  onClose: () => void;
  backgroundImage?: string;
  realm?: TrailRealm;
}

/**
 * 10 Winding Stepping Stone Waypoint Coordinates along the path
 * Position 1 is at the bottom (yPct: 88.0%), winding upward to Position 10 (yPct: 31.0%)
 */
export const TREADMILL_WAYPOINTS = [
  { position: 1, xPct: 36.0, yPct: 88.0, badgeAlign: 'right' as const },
  { position: 2, xPct: 34.5, yPct: 80.0, badgeAlign: 'right' as const },
  { position: 3, xPct: 36.5, yPct: 71.5, badgeAlign: 'right' as const },
  { position: 4, xPct: 45.0, yPct: 63.5, badgeAlign: 'left' as const },
  { position: 5, xPct: 54.0, yPct: 56.5, badgeAlign: 'left' as const },
  { position: 6, xPct: 64.0, yPct: 51.0, badgeAlign: 'left' as const },
  { position: 7, xPct: 58.0, yPct: 46.0, badgeAlign: 'right' as const },
  { position: 8, xPct: 51.5, yPct: 41.5, badgeAlign: 'right' as const },
  { position: 9, xPct: 47.5, yPct: 36.5, badgeAlign: 'left' as const },
  { position: 10, xPct: 51.5, yPct: 31.0, badgeAlign: 'left' as const },
];

export const TreadmillRoadmap: React.FC<TreadmillRoadmapProps> = ({
  track,
  activeLevelNumber,
  onPlayLevel,
  onClose,
  backgroundImage,
  realm,
}) => {
  const [mapSize, setMapSize] = useState({width:571,height:1024});
  const points = trailPoints(realm || track).map(p => projectTrailPoint(p,mapSize.width,mapSize.height));
  const allLevels = realm === 'levers' ? LEVER_LEVELS : getLevelsByTrack(track);

  // Treadmill offset: windowStart indicates which level is currently mapped to Position 1
  // By default, windowStart = activeLevelNumber (Position 1 anchor rule)
  const [windowStartLevel, setWindowStartLevel] = useState<number>(activeLevelNumber);
  const [inspectedLevelId, setInspectedLevelId] = useState<string | null>(null);

  // Sync window when activeLevelNumber advances
  useEffect(() => {
    setWindowStartLevel(activeLevelNumber);
    setInspectedLevelId(null);
  }, [activeLevelNumber, realm]);

  // Color scheme based on track
  const themeColors = {
    single: {
      accent: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.2)',
      stoneActive: '#059669',
      borderActive: '#34d399',
      roadStroke: '#10b981',
      title: 'Single note',
    },
    melody: {
      accent: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.2)',
      stoneActive: '#0284c7',
      borderActive: '#7dd3fc',
      roadStroke: '#38bdf8',
      title: 'Multi note',
    },
    levers: {accent:'#d5ae73',bgGlow:'rgba(160,119,60,.2)',stoneActive:'#987444',borderActive:'#e1c18c',roadStroke:'#d5ae73',title:'Lever'},
  }[realm || track];

  // Slice the 10 levels visible on the treadmill
  const displayedLevels: LevelDefinition[] = [];
  for (let i = 0; i < 10; i++) {
    const lvlNum = windowStartLevel + i;
    if (lvlNum <= allLevels.length) {
      const lvl = allLevels[lvlNum - 1];
      if (lvl) displayedLevels.push(lvl);
    }
  }

  const handleStepstonePress = (level: LevelDefinition) => {
    setInspectedLevelId(level.id);
  };

  const handleLaunchGame = (level: LevelDefinition) => {
    onPlayLevel(level);
  };

  const handleResetToActive = () => {
    setWindowStartLevel(activeLevelNumber);
  };

  const handlePrevWindow = () => {
    setWindowStartLevel((prev) => Math.max(1, prev - 5));
  };

  const handleNextWindow = () => {
    setWindowStartLevel((prev) => Math.max(1, Math.min(allLevels.length - 9, prev + 5)));
  };

  const bgImg = backgroundImage || (track === 'melody' ? '/images/arctic_fjord_pathway.jpg' : '/images/coastal_cliff_pathway.jpg');

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.accent }]}>
            {themeColors.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            Active Level: {activeLevelNumber} of {allLevels.length}
          </Text>
        </View>

        {windowStartLevel !== activeLevelNumber ? (
          <TouchableOpacity
            style={[styles.jumpActiveBtn, { borderColor: themeColors.accent }]}
            onPress={handleResetToActive}
            activeOpacity={0.7}
          >
            <Text style={[styles.jumpActiveText, { color: themeColors.accent }]}>
              My level
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderRight} />
        )}
      </View>

      {/* Main Roadmap Area */}
      <View style={styles.roadmapArea} onLayout={e => setMapSize(e.nativeEvent.layout)}>
        {/* Full Cinematic Photograph shown directly under the trail (100% visible) */}
        {Platform.OS === 'web' && (
          <div style={styles.cinematicImageWrap}>
            <img
              src={bgImg}
              alt="Sanctuary Trail"
              style={styles.cinematicImage}
            />
            <div style={styles.cinematicScrimOverlay} />
          </div>
        )}

        {/* 10 Waypoint Stepping Stones & Liquid Glass Badges */}
        {displayedLevels.map((lvl, idx) => {
          const waypointCoord = points[idx];
          if (!waypointCoord) return null;

          const isPosition1 = idx === 0;
          const isPassed = lvl.levelNumber < activeLevelNumber;
          const isCurrentActive = lvl.levelNumber === activeLevelNumber;
          const isUnlocked = isLevelUnlocked(lvl.levelNumber, activeLevelNumber);
          const isInspected = inspectedLevelId === lvl.id || (isCurrentActive && !inspectedLevelId);

          return (
            <React.Fragment key={lvl.id}>
              {/* Stepping Stone Node */}
              <TouchableOpacity
                style={[
                  styles.waypointNode,
                  {
                    left: `${waypointCoord.xPct}%`,
                    top: `${waypointCoord.yPct}%`,
                    borderColor: isCurrentActive
                      ? themeColors.borderActive
                      : isPassed
                      ? 'rgba(255, 255, 255, 0.4)'
                      : isUnlocked
                      ? 'rgba(255, 255, 255, 0.22)'
                      : 'rgba(255, 255, 255, 0.10)',
                    backgroundColor: isCurrentActive
                      ? themeColors.stoneActive
                      : isPassed
                      ? 'rgba(30, 41, 59, 0.92)'
                      : isUnlocked
                      ? 'rgba(15, 23, 42, 0.88)'
                      : 'rgba(15, 23, 42, 0.50)',
                    shadowColor: isCurrentActive ? themeColors.accent : 'transparent',
                  },
                ]}
                onPress={() => handleStepstonePress(lvl)}
                activeOpacity={0.8}
              >
                {!isUnlocked ? (
                  <CelticBroochLockIcon size={14} color="#94a3b8" />
                ) : isPassed ? (
                  <CelticSunburstStarIcon size={14} color="#f59e0b" />
                ) : (
                  <Text style={styles.activeNodeNumber}>{lvl.levelNumber}</Text>
                )}

                {/* Position 1 Indicator Crown */}
                {isPosition1 && (
                  <View style={[styles.pos1Badge, { backgroundColor: themeColors.accent }]}>
                    <Text style={styles.pos1BadgeText}>POS 1</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Liquid Glass Badge anchored beside node */}
              {isInspected && (
                <View
                  style={[
                    styles.badgeContainer,
                    {
                      top: `${Math.min(48, Math.max(12, waypointCoord.yPct - 6))}%`,
                      ...(waypointCoord.badgeAlign === 'right'
                        ? { left: `${Math.min(52, waypointCoord.xPct + 7)}%` }
                        : { right: `${Math.min(52, 100 - waypointCoord.xPct + 7)}%` }),
                    },
                  ]}
                >
                  <LevelPreviewCard level={lvl} theme={realm || track} unlocked={isUnlocked} onPlay={()=>handleLaunchGame(lvl)}/>
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Bottom Treadmill Shifter Controls */}
      <View pointerEvents="box-none" style={styles.bottomBar}>
        <TouchableOpacity
          accessibilityLabel="Earlier levels" nativeID="treadmill-prev-window-btn"
          style={[styles.treadmillNavBtn, windowStartLevel <= 1 && styles.disabledNavBtn]}
          onPress={handlePrevWindow}
          disabled={windowStartLevel <= 1}
          activeOpacity={0.7}
        >
          <Text style={styles.treadmillNavBtnText}>‹</Text>
        </TouchableOpacity>

        <View pointerEvents="none" style={[styles.treadmillInfo,{position:'absolute',top:-42,left:50,right:50}]}>
          <Text style={styles.treadmillInfoText}>
            Showing Levels {windowStartLevel} – {Math.min(allLevels.length, windowStartLevel + 9)}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityLabel="Next levels" nativeID="treadmill-next-window-btn"
          style={[
            styles.treadmillNavBtn,
            windowStartLevel >= allLevels.length - 9 && styles.disabledNavBtn,
          ]}
          onPress={handleNextWindow}
          disabled={windowStartLevel >= allLevels.length - 9}
          activeOpacity={0.7}
        >
          <Text style={styles.treadmillNavBtnText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 90,
    backgroundColor: '#050811',
    position: 'relative',
    overflow: 'hidden',
  },
  cinematicImageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
    pointerEvents: 'none',
  } as any,
  cinematicImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    filter: 'brightness(0.92) contrast(1.10) saturate(1.10)',
    pointerEvents: 'none',
  } as any,
  cinematicScrimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background:
      'linear-gradient(180deg, rgba(10, 15, 26, 0.45) 0%, rgba(10, 15, 26, 0.08) 30%, rgba(10, 15, 26, 0.15) 75%, rgba(10, 15, 26, 0.85) 100%)',
    pointerEvents: 'none',
  } as any,
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    zIndex: 20,
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeBtnText: {
    color: '#e2e8f0',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    marginTop: 2,
  },
  jumpActiveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
  },
  jumpActiveText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
  },
  placeholderRight: {
    width: 60,
  },
  roadmapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  waypointNode: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -19 }, { translateY: -19 }],
    zIndex: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  activeNodeNumber: {
    color: '#ffffff',
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
  },
  pos1Badge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pos1BadgeText: {
    color: '#022c22',
    fontFamily: 'Inter-Bold',
    fontSize: 7.5,
    letterSpacing: 0.5,
  },
  badgeContainer: {
    position: 'absolute',
    zIndex: 30,
    alignItems: 'stretch',
  },
  playBtn: {
    marginTop: 4,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  playBtnText: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    letterSpacing: 0.6,
  },
  bottomBar: {position:'absolute',top:'48%',left:8,right:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between',zIndex:25,pointerEvents:'box-none'},
  treadmillNavBtn: {width:40,height:52,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(32,43,34,.8)',borderRadius:20,borderWidth:1,borderColor:'rgba(217,195,148,.4)'},
  disabledNavBtn: {
    opacity: 0.35,
  },
  treadmillNavBtnText: {
    color: '#cbd5e1',
    fontFamily: 'Inter-Medium',
    fontSize: 30,
  },
  treadmillInfo: {
    alignItems: 'center',
  },
  treadmillInfoText: {
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
});
