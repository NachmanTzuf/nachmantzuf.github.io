// Canonical Mobile Design Tokens: Apple HIG and Material Design 3 Compliant

export const TOUCH_TARGETS = {
  MIN_TOUCH_IOS: 44,
  MIN_TOUCH_ANDROID: 48,
  HIT_SLOP_COMPACT: { top: 12, bottom: 12, left: 12, right: 12 },
  HIT_SLOP_STANDARD: { top: 8, bottom: 8, left: 8, right: 8 }
};

export const SPRING_PHYSICS = {
  BUTTON_PRESS: {
    stiffness: 450,
    damping: 24,
    mass: 1.0
  },
  SHEET_EXPAND: {
    stiffness: 220,
    damping: 28,
    mass: 1.0
  },
  GAME_REWARD: {
    stiffness: 180,
    damping: 14,
    mass: 0.9
  }
};

export const COLOR_PALETTE = {
  dark: {
    background: '#0A0C10',
    surfaceElevated1: '#141822',
    surfaceElevated2: '#1C2230',
    primaryAccent: '#00F0FF',
    successAccent: '#10B981',
    warningAccent: '#F59E0B',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8'
  },
  light: {
    background: '#F8FAFC',
    surfaceElevated1: '#FFFFFF',
    surfaceElevated2: '#F1F5F9',
    primaryAccent: '#0284C7',
    successAccent: '#059669',
    warningAccent: '#D97706',
    textPrimary: '#0F172A',
    textSecondary: '#64748B'
  }
};

export const SAFE_AREA_BUFFERS = {
  BOTTOM_HOME_INDICATOR: 34,
  TOP_DYNAMIC_ISLAND_MAX: 59,
  TOP_NOTCH_DEFAULT: 47
};
