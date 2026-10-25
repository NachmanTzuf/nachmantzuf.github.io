import {LevelPreviewCard} from '../roadmap/LevelPreviewCard';
import {CrannogHomeIcon,TriquetraChordIcon} from '../common/CelticIcons';
import {LEVER_LEVELS} from '../../services/curriculum/leverCurriculum';
import { trailPoints, projectTrailPoint } from '../roadmap/trailGeometry';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  CelticBroochLockIcon,
  CelticSunburstStarIcon,
  GoldTorcIcon,
  CelticChaliceRelicIcon,
  CelticLyreIcon,
  CamacLeverIcon,
} from '../common/CelticIcons';
import { TreadmillRoadmap } from '../roadmap/TreadmillRoadmap';
import { LevelDefinition, isLevelUnlocked, SINGLE_NOTE_LEVELS, MELODY_LEVELS } from '../../services/curriculum/curriculumData';

export type RoadmapTheme = 'single' | 'melody' | 'levers';

interface RoadmapModalProps {
  visible: boolean;
  onClose: () => void;
  currentXp: number;
  currentLevel: number;
  theme?: RoadmapTheme;
  onThemeChange?: (theme: RoadmapTheme) => void;
  onSelectLevel?: (stageId: number, levelId: number) => void;
  onSelectLevelDef?: (level: LevelDefinition) => void;
}

interface LevelWaypoint {
  id: number;
  stageId: number;
  globalLevel: number;
  title: string;
  subtitle: string;
  requiredXp: number;
  stars: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  isMilestone: boolean;
  milestoneReward?: string;
  xPct: number;
  yPct: number;
}

interface StageDefinition {
  id: number;
  title: string;
  subtitle: string;
}

/**
 * 10 Equidistant coordinates directly along the stone walkway centerline
 * measured from the foreground path entrance (Level 1 starting where Level 2 was at y = 88.38%)
 * to the horizon summit (y = 30.27%)
 */
export const ROADMAP_10_LEVELS_PATH = [
  { id: 1, xPct: 36.0, yPct: 88.0 },
  { id: 2, xPct: 34.5, yPct: 80.0 },
  { id: 3, xPct: 36.5, yPct: 71.5 },
  { id: 4, xPct: 45.0, yPct: 63.5 },
  { id: 5, xPct: 54.0, yPct: 56.5 },
  { id: 6, xPct: 64.0, yPct: 51.0 },
  { id: 7, xPct: 58.0, yPct: 46.0 },
  { id: 8, xPct: 51.5, yPct: 41.5 },
  { id: 9, xPct: 47.5, yPct: 36.5 },
  { id: 10, xPct: 51.5, yPct: 31.0 },
];

/**
 * Dense Spline Guide Points along the paved stone path
 * including curve guides so the Catmull-Rom glowing line stays 100% inside the stone walkway
 */
const SPLINE_ROAD_GUIDES = [
  { xPct: 36.0, yPct: 88.0 }, // 1
  { xPct: 34.5, yPct: 80.0 }, // 2
  { xPct: 36.5, yPct: 71.5 }, // 3
  { xPct: 40.0, yPct: 67.5 }, // curve guide (hugs walkway)
  { xPct: 45.0, yPct: 63.5 }, // 4
  { xPct: 54.0, yPct: 56.5 }, // 5
  { xPct: 64.0, yPct: 51.0 }, // 6 (apex)
  { xPct: 62.0, yPct: 48.0 }, // hairpin turnaround apex guide
  { xPct: 58.0, yPct: 46.0 }, // 7
  { xPct: 54.5, yPct: 43.5 }, // curve guide
  { xPct: 51.5, yPct: 41.5 }, // 8
  { xPct: 48.0, yPct: 39.0 }, // curve guide
  { xPct: 47.5, yPct: 36.5 }, // 9
  { xPct: 49.0, yPct: 33.5 }, // summit saddle guide
  { xPct: 51.5, yPct: 31.0 }, // 10
];

// Single Note Relative Pitch Curriculum (Home Tab)
export const SINGLE_NOTE_STAGES: StageDefinition[] = [
  { id: 1, title: 'Tonic Anchor', subtitle: 'Fundamental gravitational anchor' },
  { id: 2, title: 'Supertonic Pull', subtitle: 'Stepwise downward resolutions' },
  { id: 3, title: 'Mediant Warmth', subtitle: 'Major third acoustic color' },
  { id: 4, title: 'Subdominant Pull', subtitle: 'Tender downward fall to Mi' },
  { id: 5, title: 'Dominant Pillar', subtitle: 'Perfect fifth harmonic pillar' },
  { id: 6, title: 'Submediant Airs', subtitle: 'Pastoral Celtic sweetness' },
  { id: 7, title: 'Leading Tone Snap', subtitle: 'Subtonic upward snap to Do' },
  { id: 8, title: 'Grand Bardic Pinnacle', subtitle: 'Ultimate scale mastery and horizon gate' },
];

// Melodic Sequence Progression Curriculum (Melody Tab)
export const MELODY_SEQUENCE_STAGES: StageDefinition[] = [
  { id: 1, title: 'Two-Note Motifs', subtitle: 'Diatonic two-note steps & leaps' },
  { id: 2, title: 'Diatonic Steps', subtitle: 'Ascending and descending scale steps' },
  { id: 3, title: 'Triadic Arpeggios', subtitle: 'Root triad harp rolls' },
  { id: 4, title: 'Three-Note Sequences', subtitle: 'Celtic reel ornamentation turns' },
  { id: 5, title: 'Four-Note Reels', subtitle: 'Flowing melodic reel phrases' },
  { id: 6, title: 'Minor Third Melodies', subtitle: 'Aeolian modal melancholy' },
  { id: 7, title: 'Pentatonic Leaps', subtitle: 'Wide folk intervals & octave jumps' },
  { id: 8, title: 'Bardic Songsmith', subtitle: 'Grand multi-phrase modal sequence mastery' },
];

// Camac Levers & Modal Shifts Curriculum (Levers Tab)
export const LEVERS_MODAL_STAGES: StageDefinition[] = [{id:1,title:'Circle of fifths',subtitle:'Build from two scales to eight'}];

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  visible,
  onClose,
  currentXp,
  currentLevel,
  theme = 'single',
  onThemeChange,
  onSelectLevel,
  onSelectLevelDef,
}) => {
  const [mapSize, setMapSize] = useState({width: 571, height: 1024});
  const points = trailPoints(theme).map(p => projectTrailPoint(p, mapSize.width, mapSize.height));
  const [viewMode, setViewMode] = useState<'treadmill' | 'stages'>('stages');
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [selectedWaypoint, setSelectedWaypoint] = useState<LevelWaypoint | null>(null);
  const [crawlingProgress, setCrawlingProgress] = useState<number>(1.0); // 0 to 1 along path segment
  const [activeCrawlingSegment, setActiveCrawlingSegment] = useState<number | null>(null);

  // Determine realm backdrop and metadata based on the active tab/theme
  const realmConfig = {
    single: {
      image: '/images/coastal_cliff_pathway.jpg',
      badge: 'COASTAL SANCTUARY',
      title: 'Single Note Relative Pitch',
      accentColor: '#059669',
      textHighlight: '#10b981',
      roadStroke: '#059669',
      roadGlow: 'rgba(5, 150, 105, 0.60)',
      dashedStroke: '#34d399',
    },
    melody: {
      image: '/images/arctic_fjord_pathway.jpg',
      badge: 'GLACIAL FJORD',
      title: 'Melody Sequence Recognition',
      accentColor: '#0284c7',
      textHighlight: '#38bdf8',
      roadStroke: '#0284c7',
      roadGlow: 'rgba(2, 132, 199, 0.60)',
      dashedStroke: '#7dd3fc',
    },
    levers: {
      image: '/images/canyon_desert_pathway.jpg',
      badge: 'SANDSTONE CANYON',
      title: 'Lever Scales & Circle of Fifths',
      accentColor: '#d97706',
      textHighlight: '#f59e0b',
      roadStroke: '#d97706',
      roadGlow: 'rgba(217, 119, 6, 0.60)',
      dashedStroke: '#fbbf24',
    },
  }[theme];

  // Select curriculum stages catalog for active realm theme
  const stagesCatalog =
    theme === 'melody'
      ? MELODY_SEQUENCE_STAGES
      : theme === 'levers'
      ? LEVERS_MODAL_STAGES
      : SINGLE_NOTE_STAGES;

  // Active Stage object
  const activeStage = stagesCatalog.find((s) => s.id === activeStageId) || stagesCatalog[0];

  // Build the 10 Waypoint levels for the active stage (governed by isLevelUnlocked & UNRESTRICTED_DEV_MODE)
  const actualLevels = theme === 'levers' ? LEVER_LEVELS : theme === 'melody' ? MELODY_LEVELS : SINGLE_NOTE_LEVELS;
  const waypoints: LevelWaypoint[] = points.filter((_,idx) => (activeStageId - 1) * 10 + idx < actualLevels.length).map((coords, idx) => {
    const levelNumberInStage = idx + 1;
    const globalLvl = (activeStageId - 1) * 10 + levelNumberInStage;
    const isUnlocked = isLevelUnlocked(globalLvl, currentLevel);
    const isCurrent = globalLvl === currentLevel;
    const isMilestone = levelNumberInStage === 10;

    return {
      id: levelNumberInStage,
      stageId: activeStageId,
      globalLevel: globalLvl,
      title: actualLevels[globalLvl-1]?.title || activeStage.title,
      subtitle: actualLevels[globalLvl-1]?.description || activeStage.subtitle,
      requiredXp: (globalLvl - 1) * 80,
      stars: globalLvl < currentLevel ? 3 : globalLvl === currentLevel ? 1 : 0,
      isUnlocked,
      isCurrent,
      isMilestone,
      milestoneReward: isMilestone ? `${activeStage.title} Relic` : undefined,
      xPct: coords.xPct,
      yPct: coords.yPct,
    };
  });

  // Haptic feedback and subtle crawling light animation when selecting/unlocking
  const triggerCrawlingLight = (toLevelIndex: number) => {
    if (toLevelIndex <= 0) return;
    setActiveCrawlingSegment(toLevelIndex);
    setCrawlingProgress(0);

    // Subtle Web Audio harp chime
    try {
      if (typeof window !== 'undefined' && (window as any).AudioContext) {
        const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 + toLevelIndex * 40, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (_) {}

    // Animate crawling light along the path segment
    let start: number | null = null;
    const duration = 650; // ms
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      setCrawlingProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Haptic feedback on arrival
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([15, 30, 20]);
        }
        setTimeout(() => setActiveCrawlingSegment(null), 300);
      }
    };
    requestAnimationFrame(step);
  };

  // SVG dimensions for 1:1 image overlay coordinate mapping (571 x 1024)
  const mapW = 571;
  const mapH = 1024;

  // Build Catmull-Rom smooth road path that stays 100% inside the stone walkway
  const pxGuides = SPLINE_ROAD_GUIDES.map((g) => ({
    x: (g.xPct / 100) * mapW,
    y: (g.yPct / 100) * mapH,
  }));
  const padded = [pxGuides[0], ...pxGuides, pxGuides[pxGuides.length - 1]];
  let roadPathD = `M ${pxGuides[0].x.toFixed(1)} ${pxGuides[0].y.toFixed(1)}`;
  for (let i = 1; i < padded.length - 2; i++) {
    const p0 = padded[i - 1];
    const p1 = padded[i];
    const p2 = padded[i + 1];
    const p3 = padded[i + 2];
    const c1x = p1.x + (p2.x - p0.x) / 6.0;
    const c1y = p1.y + (p2.y - p0.y) / 6.0;
    const c2x = p2.x - (p3.x - p1.x) / 6.0;
    const c2y = p2.y - (p3.y - p1.y) / 6.0;
    roadPathD += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 10000, display: visible ? 'flex' : 'none' }]}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={{position:'absolute',bottom:12,left:14,right:14,height:64,zIndex:1000,flexDirection:'row',padding:4,borderRadius:22,backgroundColor:'rgba(25,39,30,.94)',borderWidth:1,borderColor:'rgba(210,189,146,.3)'}}>
            {(['single','melody','levers'] as RoadmapTheme[]).map((r,i)=>{const Icon=[CrannogHomeIcon,TriquetraChordIcon,CamacLeverIcon][i];return <TouchableOpacity key={r} accessibilityLabel={`${['Single note','Multi note','Lever'][i]} map`} onPress={()=>{setSelectedWaypoint(null);setActiveStageId(1);onThemeChange?.(r);}} style={{flex:1,padding:6,alignItems:'center',gap:4,borderRadius:15,backgroundColor:r===theme?'rgba(203,179,132,.15)':'transparent'}}><Icon size={22}/><Text style={{color:'#efdfbd',fontSize:11}}>{['Single note','Multi note','Lever'][i]}</Text></TouchableOpacity>})}
          </View>
          {/* Top Segmented Mode Switcher */}
          <View style={styles.modeSwitcherBar}>
            <TouchableOpacity
              nativeID="roadmap-mode-treadmill"
              activeOpacity={0.8}
              onPress={() => setViewMode('treadmill')}
              style={[
                styles.modeToggleChip,
                viewMode === 'treadmill' && {
                  backgroundColor: 'rgba(184, 156, 103, 0.22)',
                  borderColor: realmConfig.textHighlight,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeToggleChipText,
                  viewMode === 'treadmill' && { color: '#ffffff', fontWeight: '700' },
                ]}
              >
                All levels
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              nativeID="roadmap-mode-stages"
              activeOpacity={0.8}
              onPress={() => setViewMode('stages')}
              style={[
                styles.modeToggleChip,
                viewMode === 'stages' && {
                  backgroundColor: 'rgba(184, 156, 103, 0.22)',
                  borderColor: realmConfig.textHighlight,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeToggleChipText,
                  viewMode === 'stages' && { color: '#ffffff', fontWeight: '700' },
                ]}
              >
                Stages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              nativeID="roadmap-close-btn"
              activeOpacity={0.75}
              onPress={onClose}
              style={styles.glassCloseBtn}
            >
              <Text style={styles.glassCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {viewMode === 'treadmill' ? (
            <TreadmillRoadmap
              track={theme === 'melody' ? 'melody' : 'single'}
              activeLevelNumber={currentLevel}
              backgroundImage={realmConfig.image}
              realm={theme}
              onPlayLevel={(level) => {
                if(onSelectLevelDef) onSelectLevelDef(level);
                else onSelectLevel?.(Math.ceil(level.levelNumber/10), ((level.levelNumber-1)%10)+1);
              }}
              onClose={onClose}
            />
          ) : (
            <View style={{position:'absolute',top:0,bottom:90,left:0,right:0}} onLayout={e=>setMapSize(e.nativeEvent.layout)}>
              {/* Full Cinematic Photograph shown in one go (zero cropping, entire path visible) */}
              <div style={styles.cinematicImageWrap as React.CSSProperties}>
                <img
                  src={realmConfig.image}
                  alt={realmConfig.title}
                  style={styles.cinematicImage as React.CSSProperties}
                />
                {/* Subtle atmospheric gradient scrim at top and bottom */}
                <div style={styles.cinematicScrimOverlay as React.CSSProperties} />
              </div>

              {/* Ultra Minimalist Liquid Glass Top Header */}
              <View style={styles.liquidTopHeader}>
                <View style={styles.headerLeft}>
                  <View style={[styles.realmBadge, { borderColor: realmConfig.accentColor }]}>
                    <Text style={[styles.realmBadgeText, { color: realmConfig.accentColor }]}>
                      {realmConfig.badge}
                    </Text>
                  </View>
                  <Text style={[styles.headerStageTitle, { color: realmConfig.textHighlight }]}>
                    STAGE {activeStageId}: {activeStage.title.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.headerRight}>
                  <View style={styles.shardsPill}>
                    <GoldTorcIcon size={14} />
                    <Text style={styles.shardsText}>{currentXp} Shards</Text>
                  </View>
                </View>
              </View>

          {/* 10 Level Stepping Stones positioned directly on the stone walkway */}
          {waypoints.map((wp, idx) => {
            // Perspective size scaling from foreground (Level 1: 44px) to summit (Level 10: 30px)
            const perspectiveScale = 1 - (1 - wp.yPct / 100) * 0.32;
            const size = Math.round(44 * perspectiveScale);

            return (
              <View
                key={wp.id}
                style={[
                  styles.stoneWrapper,
                  {
                    left: `${wp.xPct}%`,
                    top: `${wp.yPct}%`,
                    transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
                  },
                ]}
              >
                {/* Completed stars directly above stone */}
                {wp.stars > 0 && (
                  <View style={styles.starsGroup}>
                    {[1, 2, 3].map((starIdx) => (
                      <CelticSunburstStarIcon
                        key={starIdx}
                        size={Math.max(8, Math.round(size * 0.28))}
                        filled={starIdx <= wp.stars}
                      />
                    ))}
                  </View>
                )}

                {/* Tactile Stepping Stone Button - Governed by wp.isUnlocked */}
                <TouchableOpacity
                  nativeID={`stepping-stone-${wp.id}`}
                  activeOpacity={0.75}
                  disabled={!wp.isUnlocked}
                  onPress={() => {
                    setSelectedWaypoint(wp);
                    triggerCrawlingLight(idx);
                  }}
                  style={[
                    styles.stoneButton,
                    {
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                    },
                    wp.isUnlocked ? styles.stoneUnlocked : styles.stoneLocked,
                    wp.isCurrent && styles.stoneCurrent,
                    wp.isMilestone && styles.stoneMilestone,
                  ]}
                >
                  <View
                    style={[
                      styles.stoneInner,
                      {
                        width: size - 8,
                        height: size - 8,
                        borderRadius: (size - 8) / 2,
                      },
                      wp.isUnlocked ? styles.stoneInnerUnlocked : styles.stoneInnerLocked,
                      wp.isCurrent && styles.stoneInnerCurrent,
                    ]}
                  >
                    {wp.isUnlocked ? (
                      <Text
                        style={[
                          styles.stoneNumber,
                          wp.isCurrent && styles.stoneNumberCurrent,
                          { fontSize: Math.max(10, Math.round(size * 0.38)) },
                        ]}
                      >
                        {wp.id}
                      </Text>
                    ) : (
                      <CelticBroochLockIcon size={Math.max(10, Math.round(size * 0.38))} color="#94a3b8" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Milestone 10 Relic Crown / Chalice */}
                {wp.isMilestone && (
                  <View style={styles.milestoneRelicWrap}>
                    {activeStageId === 8 ? (
                      <CelticChaliceRelicIcon size={17}/>
                    ) : (
                      <CelticChaliceRelicIcon size={14} />
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {/* Summit Horizon Completion Banner (At Level 10 Summit) */}
          <View style={styles.summitGateBanner}>
            <Text style={styles.summitGateText}>
              FOLLOW THE STONE PATH
            </Text>
          </View>

          {/* Active Level Detail Drawer (when a stone is tapped) */}
          {selectedWaypoint && actualLevels[selectedWaypoint.globalLevel-1] && <View style={{position:'absolute',top:'30%',right:52,zIndex:100}}><LevelPreviewCard level={actualLevels[selectedWaypoint.globalLevel-1]} theme={theme} onClose={()=>setSelectedWaypoint(null)} onPlay={()=>{if(onSelectLevelDef)onSelectLevelDef(actualLevels[selectedWaypoint.globalLevel-1]);else onSelectLevel?.(selectedWaypoint.stageId,selectedWaypoint.id);onClose();}}/></View>}

          {/* 8 Stages Horizontal Selector Carousel (pinned above bottom safe area) */}
          <View style={styles.stageSelectorBar}>
            {stagesCatalog.slice(0, Math.ceil(actualLevels.length/10)).map((stg) => {
              const isActive = activeStageId === stg.id;
              return (
                <TouchableOpacity
                  key={stg.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveStageId(stg.id);
                    setSelectedWaypoint(null);
                  }}
                  style={[
                    styles.stageTabPill,
                    isActive && styles.stageTabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stageTabText,
                      isActive && styles.stageTabTextActive,
                    ]}
                  >
                    {stg.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modeSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'web' ? 10 : 20,
    paddingBottom: 8,
    backgroundColor: 'rgba(25,39,30,.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 40,
    gap: 8,
  },
  modeToggleChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeToggleChipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    backgroundColor: '#050811',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
  } as any,
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
      'linear-gradient(180deg, rgba(10, 15, 26, 0.55) 0%, rgba(10, 15, 26, 0.10) 30%, rgba(10, 15, 26, 0.15) 75%, rgba(10, 15, 26, 0.85) 100%)',
    pointerEvents: 'none',
  } as any,
  liquidTopHeader: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 52 : 62,
    left: 12,
    right: 12,
    zIndex: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(27,42,31,.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    boxShadow: 'none',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        } as any)
      : {}),
  },
  headerLeft: {
    flex: 1,
  },
  realmBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 0.8,
    backgroundColor: 'rgba(27,42,31,.65)',
    marginBottom: 2,
  },
  realmBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  headerStageTitle: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  shardsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: 'rgba(27,42,31,.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shardsText: {
    color: '#fbbf24',
    fontSize: 10.5,
    fontWeight: '800',
  },
  glassCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCloseBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  svgPathOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
  } as any,
  stoneWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  starsGroup: {
    position: 'absolute',
    top: -12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
    zIndex: 6,
  },
  stoneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
  } as any,
  stoneUnlocked: {
    backgroundColor: '#382b22',
    borderColor: '#d4af37',
  },
  stoneCurrent: {
    backgroundColor: '#047857',
    borderColor: '#fef08a',
    boxShadow: '0 0 18px rgba(254, 240, 138, 0.9), 0 4px 12px rgba(0, 0, 0, 0.8)',
  } as any,
  stoneLocked: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    opacity: 0.9,
  },
  stoneMilestone: {
    borderWidth: 2.5,
    borderColor: '#fbbf24',
  },
  stoneInner: {
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.6)',
  } as any,
  stoneInnerUnlocked: {
    backgroundColor: '#574233',
  },
  stoneInnerCurrent: {
    backgroundColor: '#059669',
    background: 'radial-gradient(circle at 40% 35%, #10b981 0%, #047857 85%)',
  } as any,
  stoneInnerLocked: {
    backgroundColor: '#0f172a',
  },
  stoneNumber: {
    color: '#ffffff',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  stoneNumberCurrent: {
    color: '#fef08a',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  milestoneRelicWrap: {
    position: 'absolute',
    top: '100%',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#fbbf24',
    zIndex: 8,
  },
  summitGateBanner: {
    position: 'absolute',
    top: '23%',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.6)',
    zIndex: 3,
  },
  summitGateText: {
    color: '#fef08a',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  levelDrawer: {
    position: 'absolute',
    bottom: 100,
    left: 12,
    right: 12,
    zIndex: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#d4af37',
    padding: 12,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.85)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  drawerStagePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  drawerStagePillText: {
    color: '#fef08a',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  drawerCloseBtn: {
    padding: 3,
  },
  drawerCloseText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  drawerTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  drawerSubtitle: {
    color: '#cbd5e1',
    fontSize: 9.5,
    marginTop: 2,
  },
  drawerRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  drawerRewardText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '700',
  },
  startLevelBtn: {
    marginTop: 8,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startLevelBtnText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 8,
    paddingVertical: 6,
  },
  lockedPillText: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '700',
  },
  stageSelectorBar: {
    position: 'absolute',
    top: 114,
    left: 10,
    right: 10,
    zIndex: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(27,42,31,.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    boxShadow: 'none',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        } as any)
      : {}),
  },
  stageTabPill: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  stageTabPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  stageTabText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '700',
  },
  stageTabTextActive: {
    color: '#fef08a',
    fontWeight: '900',
  },
});

