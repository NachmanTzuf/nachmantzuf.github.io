import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  CrannogHomeIcon,
  TriquetraChordIcon,
  CamacLeverIcon,
  CelticSolarCrossIcon,
} from '../common/CelticIcons';

export type TabKey = 'home' | 'chords' | 'levers' | 'profile';

interface LiquidGlassTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

interface TabItem {
  key: TabKey;
  label: string;
  badge?: string;
  renderIcon: (active: boolean, color: string) => React.ReactNode;
}

const TAB_THEMES: Record<
  TabKey,
  { color: string; labelColor: string }
> = {
  home: {
    color: '#e0c99d', // Dark moss green with vein gradient
    labelColor: '#e0c99d',
  },
  chords: {
    color: '#e0c99d', // Deep glacial blue
    labelColor: '#e0c99d',
  },
  levers: {
    color: '#e0c99d', // Deep sandstone desert amber
    labelColor: '#e0c99d',
  },
  profile: {
    color: '#c3a36d', // Royal purple
    labelColor: '#c3a36d',
  },
};

export const LiquidGlassTabBar: React.FC<LiquidGlassTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: TabItem[] = [
    {
      key: 'home',
      label: 'Single',
      renderIcon: (active, color) => <CrannogHomeIcon size={20} active={active} color={color} />,
    },
    {
      key: 'chords',
      label: 'Melody',
      renderIcon: (active, color) => <TriquetraChordIcon size={20} active={active} color={color} />,
    },
    {
      key: 'levers',
      label: 'Levers',
      renderIcon: (active, color) => <CamacLeverIcon size={20} active={active} color={color} />,
    },
    {
      key: 'profile',
      label: 'Journey',
      renderIcon: (active, color) => <CelticSolarCrossIcon size={20} active={active} color={color} />,
    },
  ];

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.liquidGlassBar}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const theme = TAB_THEMES[tab.key];
          const itemColor = isActive ? theme.color : '#aaad96';
          return (
            <React.Fragment key={tab.key}>
              {index > 0 && <View style={styles.compartmentDivider} />}
              <TouchableOpacity
                nativeID={`tab-btn-${tab.key}`}
                activeOpacity={0.75}
                onPress={() => onTabChange(tab.key)}
                style={[
                  styles.tabCompartment,
                  isActive && styles.tabCompartmentActive,
                ]}
              >
                <View style={styles.iconWrapper}>
                  {tab.renderIcon(isActive, itemColor)}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && { color: theme.labelColor, fontWeight: '800' },
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View
                    style={[
                      styles.activeGlowIndicator,
                      {
                        backgroundColor: theme.color,
                        boxShadow: 'none',
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 24 : 34,
    left: 14,
    right: 14,
    zIndex: 999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  liquidGlassBar: {
    width: '100%',
    maxWidth: 440,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(25,39,30,.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    boxShadow: '0 6px 20px rgba(0,0,0,.18)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        } as any)
      : {}),
  },
  compartmentDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabCompartment: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 4,
    position: 'relative',
    transition: 'background-color 0.2s ease, transform 0.15s ease',
  } as any,
  tabCompartmentActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.25)',
  } as any,
  iconWrapper: {
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#aaad96',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  activeGlowIndicator: {
    position: 'absolute',
    bottom: 3,
    width: 14,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    boxShadow: '0 0 8px #38bdf8',
  } as any,
});
