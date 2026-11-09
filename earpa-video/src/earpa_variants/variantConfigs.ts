import { VariantProps } from './VariantVideo';

export interface FullVariantDefinition extends VariantProps {
  durationInFrames: number;
  fps: number;
}

export const ALL_10_VARIANTS: FullVariantDefinition[] = [
  // 1. V01: Flagship Master (45s, 1350f) - Balanced 50/50 3D & App UI
  {
    id: 'EarpaV01MasterFlagship45s',
    durationInFrames: 1350,
    fps: 30,
    heroMode: 'balanced',
    showAppDepth: 'full',
    themeColor: '#10b981',
    headlineBadge: 'THE ALAIN BENBASSAT METHOD',
    tagline: 'Functional Ear Training Architecture',
    audioFile: 'variants/audio_v01.mp3',
  },
  // 2. V02: Futuristic Soundwaves (35s, 1050f) - Heavy 3D Audio Visualizer / Less App
  {
    id: 'EarpaV02FuturisticSoundwaves35s',
    durationInFrames: 1050,
    fps: 30,
    heroMode: 'soundwaves',
    showAppDepth: 'minimal',
    themeColor: '#06b6d4',
    headlineBadge: 'VOLUMETRIC SOUND FREQUENCIES',
    tagline: 'Acoustic Resonance Physics',
    audioFile: 'variants/audio_v02.mp3',
  },
  // 3. V03: Stop Counting Intervals (30s, 900f) - High Energy / Anti-Academic / Snappy
  {
    id: 'EarpaV03StopCountingIntervals30s',
    durationInFrames: 900,
    fps: 30,
    heroMode: 'anti_interval',
    showAppDepth: 'medium',
    themeColor: '#f43f5e',
    headlineBadge: 'INTERVAL COUNTING IS BROKEN',
    tagline: 'Magnetic Tonal Gravity',
    audioFile: 'variants/audio_v03.mp3',
  },
  // 4. V04: Jam Session Panic (35s, 1050f) - Musician Problem & Solution / High Conversion
  {
    id: 'EarpaV04JamSessionPanic35s',
    durationInFrames: 1050,
    fps: 30,
    heroMode: 'jam_panic',
    showAppDepth: 'full',
    themeColor: '#f59e0b',
    headlineBadge: 'JAM SESSION ANXIETY CURED',
    tagline: 'Instant Improv Flow',
    audioFile: 'variants/audio_v04.mp3',
  },
  // 5. V05: Astrolabe Lever Mastery (40s, 1200f) - 3D Mechanical Astrolabe / Less App
  {
    id: 'EarpaV05AstrolabeLeverMastery40s',
    durationInFrames: 1200,
    fps: 30,
    heroMode: 'astrolabe',
    showAppDepth: 'minimal',
    themeColor: '#d97706',
    headlineBadge: '3D ASTROLABE KINEMATICS',
    tagline: 'The Celtic Lever Code',
    audioFile: 'variants/audio_v05.mp3',
  },
  // 6. V06: 10-Minute Daily Habit (30s, 900f) - Habit Psychology / High App UI
  {
    id: 'EarpaV06TenMinuteHabit30s',
    durationInFrames: 900,
    fps: 30,
    heroMode: 'habit',
    showAppDepth: 'full',
    themeColor: '#34d399',
    headlineBadge: '10 MINUTES EVERY MORNING',
    tagline: 'Daily Harper Streak & XP',
    audioFile: 'variants/audio_v06.mp3',
  },
  // 7. V07: Acoustic Resonance Chamber (45s, 1350f) - Luthier Acoustics / Low App
  {
    id: 'EarpaV07AcousticResonance45s',
    durationInFrames: 1350,
    fps: 30,
    heroMode: 'resonance',
    showAppDepth: 'minimal',
    themeColor: '#38bdf8',
    headlineBadge: 'SITKA SPRUCE DUAL CAVITY',
    tagline: '135 Hz Helmholtz Resonance',
    audioFile: 'variants/audio_v07.mp3',
  },
  // 8. V08: Facial Recognition Ear (35s, 1050f) - Cognitive Analogy / Mental Model
  {
    id: 'EarpaV08FacialRecognitionEar35s',
    durationInFrames: 1050,
    fps: 30,
    heroMode: 'facial',
    showAppDepth: 'medium',
    themeColor: '#a855f7',
    headlineBadge: 'FACIAL RECOGNITION ANALOGY',
    tagline: 'Holistic Tonal Identification',
    audioFile: 'variants/audio_v08.mp3',
  },
  // 9. V09: Folk Melodic Flow (40s, 1200f) - Bardic Phrasing & Irish Celtic Lore
  {
    id: 'EarpaV09FolkMelodicFlow40s',
    durationInFrames: 1200,
    fps: 30,
    heroMode: 'bardic',
    showAppDepth: 'medium',
    themeColor: '#10b981',
    headlineBadge: 'ANCIENT BARDIC INTUITION',
    tagline: 'Phonation & Phrasing by Ear',
    audioFile: 'variants/audio_v09.mp3',
  },
  // 10. V10: The Ultimate Flagship (45s, 1350f) - Apex Commercial / Peak Conversion
  {
    id: 'EarpaV10TheUltimateFlagship45s',
    durationInFrames: 1350,
    fps: 30,
    heroMode: 'apex',
    showAppDepth: 'full',
    themeColor: '#6366f1',
    headlineBadge: 'SPEAK THROUGH YOUR INSTRUMENT',
    tagline: '220 Guided Levels Across 3 Paths',
    audioFile: 'variants/audio_v10.mp3',
  },
];
