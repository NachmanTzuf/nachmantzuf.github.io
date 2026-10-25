import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TreadmillRoadmap } from '../roadmap/TreadmillRoadmap';
import { LevelDefinition } from '../../services/curriculum/curriculumData';

export type RoadmapTheme = 'single' | 'melody' | 'levers';

export interface StageDefinition {
  id: number;
  title: string;
  subtitle: string;
}

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

export const LEVERS_MODAL_STAGES: StageDefinition[] = [
  { id: 1, title: 'Circle of fifths', subtitle: 'Build from two scales to eight' }
];

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

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  visible,
  onClose,
  currentXp,
  currentLevel,
  theme = 'single',
  onSelectLevel,
  onSelectLevelDef,
}) => {
  const realmConfig = {
    single: {
      image: '/images/coastal_cliff_pathway.jpg',
      badge: 'COASTAL SANCTUARY',
      title: 'Single Note Relative Pitch',
    },
    melody: {
      image: '/images/arctic_fjord_pathway.jpg',
      badge: 'GLACIAL FJORD',
      title: 'Melody Sequence Recognition',
    },
    levers: {
      image: '/images/canyon_desert_pathway.jpg',
      badge: 'SANDSTONE CANYON',
      title: 'Lever Scales & Circle of Fifths',
    },
  }[theme];

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 10000, width: '100%', height: '100%' }]}>
      <TreadmillRoadmap
        track={theme === 'melody' ? 'melody' : theme === 'levers' ? 'levers' : 'single'}
        activeLevelNumber={currentLevel}
        backgroundImage={realmConfig.image}
        realm={theme}
        onPlayLevel={(level) => {
          if (onSelectLevelDef) onSelectLevelDef(level);
          else onSelectLevel?.(Math.ceil(level.levelNumber / 10), ((level.levelNumber - 1) % 10) + 1);
        }}
        onClose={onClose}
      />
    </View>
  );
};

export default RoadmapModal;
