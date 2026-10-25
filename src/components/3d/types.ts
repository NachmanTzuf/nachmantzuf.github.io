/**
 * EARPA 3D GRAPHICS & SCENE TYPES
 * Definitions for 3D Celtic harp meshes, physical string geometries,
 * lever kinematics, and atmospheric sanctuary lighting.
 */

import { NoteLetter } from '../../services/theory/types';

export interface HarpString3DData {
  stringIndex: number; // 0 (lowest bass C2) to 33 (highest treble A6)
  noteName: string; // e.g. "C2", "Eb4", "A6"
  letter: NoteLetter;
  octave: number;
  isRedC: boolean;
  isBlueF: boolean;
  baseFrequencyHz: number;
  lengthMm: number;
  soundboardAnchor: [number, number, number]; // [x, y, z] on soundboard face
  neckPinAnchor: [number, number, number]; // [x, y, z] on harmonic curve
  leverPosition: 0 | 1; // 0 = Down, 1 = Up
  vibrationTime: number; // Elapsed vibration time (s)
  vibrationAmplitude: number; // Initial pluck amplitude (0 to 1)
  isTargetedByLightStrike: boolean;
}

export interface SanctuaryLightingState {
  ambientIntensity: number;
  candleFlicker: number;
  cadencePulseProgress: number; // 0 (normal) to 1 (full warm golden bloom)
}

export interface CameraPerspectiveTarget {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const SANCTUARY_CAMERA_PRESETS: Record<'sanctuary_wide' | 'playing_focus' | 'lever_inspection', CameraPerspectiveTarget> = {
  sanctuary_wide: {
    position: [0.0, 1.1, 2.6],
    target: [0.0, 0.85, 0.0],
    fov: 42,
  },
  playing_focus: {
    position: [0.35, 0.95, 1.45],
    target: [0.05, 0.88, 0.0],
    fov: 38,
  },
  lever_inspection: {
    position: [0.25, 1.25, 0.85],
    target: [-0.05, 1.18, 0.0],
    fov: 32,
  },
};
