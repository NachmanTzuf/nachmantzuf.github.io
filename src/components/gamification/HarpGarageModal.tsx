/**
 * EARPA HARP ARTISAN WORKSHOP (FULL SCREEN 3D LUTHIER VAULT)
 * Dedicated full-screen cosmetic customization studio featuring:
 * - Real 3D Celtic Harp Canvas in the center that dynamically changes colors and finishes in real time
 * - Bottom category navigation bar (Woods, Carves, Strings, Levers, Sound)
 * - Swipable horizontal item carousel
 * - Direct real-time 3D model previewing before equipping or buying
 * - Velvety soft, warm acoustic harp sound plucking
 * - Synchronizes across Hub, Home, and In-Game experiences
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { HarpGarageEngine } from '../../services/gamification/HarpGarageEngine';
import {
  TimberFinishId,
  SoundboardRosetteId,
  ResonanceStringShaderId,
  SoundPackId,
  LeverFinishId,
  CosmeticItem,
} from '../../services/gamification/types';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';
import { CelticHarpCanvas, CelticHarpCanvasRef } from '../3d/CelticHarpCanvas';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { TimbreType } from '../../services/audio/types';

interface HarpGarageModalProps {
  visible: boolean;
  onClose: () => void;
  garageEngine: HarpGarageEngine;
  onApplyCosmetic: (type: 'timber' | 'rosette' | 'strings' | 'sound' | 'lever', colorHex: string) => void;
}

type StoreCategory = 'TIMBER' | 'ROSETTE' | 'STRINGS' | 'LEVERS' | 'SOUND';

export const HarpGarageModal: React.FC<HarpGarageModalProps> = ({
  visible,
  onClose,
  garageEngine,
  onApplyCosmetic,
}) => {
  const db = UserAccountDatabase.getInstance();
  const shopCanvasRef = useRef<CelticHarpCanvasRef | null>(null);

  const [activeCategory, setActiveCategory] = useState<StoreCategory>('TIMBER');
  const [userShards, setUserShards] = useState<number>(db.getShards());
  const [toastMessage, setToastMessage] = useState<string>('');

  const equipped = garageEngine.getEquipped();
  const [selectedItem, setSelectedItem] = useState<CosmeticItem<any>>(equipped.timber);

  // Synchronize on modal visibility change
  useEffect(() => {
    if (visible) {
      setUserShards(db.getShards());
      setToastMessage('');
      const eq = garageEngine.getEquipped();
      setSelectedItem(eq.timber);
      setActiveCategory('TIMBER');

      // Sync 3D canvas with equipped state
      setTimeout(() => {
        applyCurrentEquippedToCanvas(eq);
      }, 250);
    }
  }, [visible]);

  const applyCurrentEquippedToCanvas = (eq = garageEngine.getEquipped()) => {
    if (!shopCanvasRef.current) return;
    try {
      shopCanvasRef.current.applyTimberColor(eq.timber.colorHex, eq.timber.roughness, eq.timber.metalness);
      shopCanvasRef.current.applyStringGlowColor(eq.strings.colorHex);
      shopCanvasRef.current.applyLeverColor(eq.lever.colorHex);
      shopCanvasRef.current.applyRosetteInlay?.(eq.rosette.colorHex, eq.rosette.id);
    } catch {}
  };

  const getTimbreForSoundId = (id: string): TimbreType => {
    if (id === 'gut_string_warmth') return 'gut_string_warmth';
    if (id === 'subtle_cathedral_reverb') return 'subtle_cathedral_reverb';
    return 'celtic_nylon';
  };

  const handleSelectItem = (item: CosmeticItem<any>) => {
    setSelectedItem(item);
    setToastMessage('');

    let noteFreq = 329.63; // E4 warm note
    let soundTimbre = getTimbreForSoundId(garageEngine.getEquipped().sound.id);

    if (activeCategory === 'TIMBER') {
      shopCanvasRef.current?.applyTimberColor(item.colorHex, item.roughness, item.metalness);
      noteFreq = 261.63; // Deep C4
    } else if (activeCategory === 'ROSETTE') {
      shopCanvasRef.current?.applyRosetteInlay?.(item.colorHex, item.id);
      noteFreq = 392.00; // Resonant G4
    } else if (activeCategory === 'STRINGS') {
      shopCanvasRef.current?.applyStringGlowColor(item.colorHex);
      noteFreq = 523.25; // Shimmering C5
    } else if (activeCategory === 'LEVERS') {
      shopCanvasRef.current?.applyLeverColor(item.colorHex);
      noteFreq = 369.99; // F#4 semitone lever shift
    } else if (activeCategory === 'SOUND') {
      soundTimbre = getTimbreForSoundId(item.id);
      noteFreq = 349.23; // F4
    }

    // Play soft, warm, satisfying Celtic pluck
    HarpSoundSynthesizer.playWarmHarpChime(soundTimbre, noteFreq);
  };

  const handleEquip = (item: CosmeticItem<any>) => {
    let success = false;
    if (activeCategory === 'TIMBER') success = garageEngine.equipTimber(item.id as TimberFinishId);
    else if (activeCategory === 'ROSETTE') success = garageEngine.equipRosette(item.id as SoundboardRosetteId);
    else if (activeCategory === 'STRINGS') success = garageEngine.equipStrings(item.id as ResonanceStringShaderId);
    else if (activeCategory === 'LEVERS') success = garageEngine.equipLever(item.id as LeverFinishId);
    else if (activeCategory === 'SOUND') success = garageEngine.equipSound(item.id as SoundPackId);

    if (success) {
      onApplyCosmetic(activeCategory.toLowerCase() as any, activeCategory === 'SOUND' ? item.id : item.colorHex);
      setToastMessage(`Fitted ${item.name} to your Celtic harp.`);

      const eq = garageEngine.getEquipped();
      applyCurrentEquippedToCanvas(eq);

      // Warm celebration chime
      const timbre = getTimbreForSoundId(eq.sound.id);
      HarpSoundSynthesizer.playWarmHarpChime(timbre, 261.63);
      setTimeout(() => HarpSoundSynthesizer.playWarmHarpChime(timbre, 329.63), 100);
      setTimeout(() => HarpSoundSynthesizer.playWarmHarpChime(timbre, 392.00), 200);
    }
  };

  const handleBuy = (item: CosmeticItem<any>) => {
    const res = garageEngine.buyWithShards(activeCategory, item.id);
    if (res.success) {
      setUserShards(db.getShards());
      setToastMessage(res.message);
      item.isUnlocked = true;

      // Automatically equip newly purchased item
      handleEquip(item);
    } else {
      setToastMessage(res.message);
    }
  };

  const timbers = garageEngine.getTimbers();
  const rosettes = garageEngine.getRosettes();
  const strings = garageEngine.getStrings();
  const levers = garageEngine.getLevers();
  const sounds = garageEngine.getSounds();

  const getItemsForActiveCategory = (): CosmeticItem<any>[] => {
    switch (activeCategory) {
      case 'TIMBER': return timbers;
      case 'ROSETTE': return rosettes;
      case 'STRINGS': return strings;
      case 'LEVERS': return levers;
      case 'SOUND': return sounds;
    }
  };

  const getEquippedIdForActiveCategory = (): string => {
    switch (activeCategory) {
      case 'TIMBER': return equipped.timber.id;
      case 'ROSETTE': return equipped.rosette.id;
      case 'STRINGS': return equipped.strings.id;
      case 'LEVERS': return equipped.lever.id;
      case 'SOUND': return equipped.sound.id;
    }
  };

  const currentCategoryItems = getItemsForActiveCategory();
  const currentEquippedId = getEquippedIdForActiveCategory();
  const isSelectedEquipped = selectedItem?.id === currentEquippedId;
  const canAffordSelected = userShards >= (selectedItem?.shardCost || 0);

  const switchCategory = (cat: CategoryKey) => {
    setActiveCategory(cat);
    let item: CosmeticItem<any>;
    switch (cat) {
      case 'TIMBER': item = equipped.timber; break;
      case 'ROSETTE': item = equipped.rosette; break;
      case 'STRINGS': item = equipped.strings; break;
      case 'LEVERS': item = equipped.lever; break;
      case 'SOUND': item = equipped.sound; break;
    }
    setSelectedItem(item);
    applyCurrentEquippedToCanvas();
    if (cat === 'LEVERS') {
      shopCanvasRef.current?.rotateToAngle?.(2.65);
    } else {
      shopCanvasRef.current?.rotateToAngle?.(0.0);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenContainer}>
        {/* Authentic Celtic Sanctuary Background (No 2D baked-in harp, clean plinth for 3D harp) */}
        <Image
          source={{ uri: '/images/irish_celtic_sanctuary.jpg' }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={styles.darkAtmosphereOverlay} />

        {/* 1. TOP BAR: ONLY 3 ELEMENTS (Close, Artisan Shop, Shards Balance) */}
        <View style={styles.topBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Exit Artisan Workshop"
            onPress={onClose}
            style={styles.exitBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.exitBtnText}>✕ Close</Text>
          </TouchableOpacity>

          <Text style={styles.vaultTitle}>Artisan Shop</Text>

          <View style={styles.shardsBadgePill}>
            <Text style={styles.shardsBadgeText}>{userShards} 🪙</Text>
          </View>
        </View>

        {/* 2. MIDDLE VIEWPORT: SEAMLESS 3D CELTIC HARP (360° Interactive Spin) */}
        <View style={styles.middleHarpCanvasContainer}>
          <CelticHarpCanvas
            ref={shopCanvasRef}
            style={styles.harpCanvas3d}
            interactiveControls={true}
            minimalHeroMode={true}
            autoSpin={false}
            customScale={1.0}
            targetY={0.35}
            onModelLoaded={() => applyCurrentEquippedToCanvas()}
            onStringPlucked={(deg) => {
              const timbre = getTimbreForSoundId(garageEngine.getEquipped().sound.id);
              HarpSoundSynthesizer.playWarmHarpChime(timbre, 261.63 * Math.pow(2, (deg - 1) / 7));
            }}
          />

          {!!toastMessage && (
            <View style={styles.toastOverlay}>
              <Text style={styles.toastOverlayText}>{toastMessage}</Text>
            </View>
          )}
        </View>

        {/* 3. SELECTED ITEM DETAILS & ACTION BUTTON */}
        <View style={styles.selectedActionShelf}>
          <View style={styles.selectedMetaBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.miniSwatch, { backgroundColor: selectedItem.colorHex || '#f59e0b' }]} />
              <Text style={styles.selectedItemTitle}>{selectedItem.name}</Text>
              {isSelectedEquipped && (
                <View style={styles.fittedMiniTag}>
                  <Text style={styles.fittedMiniTagText}>FITTED</Text>
                </View>
              )}
            </View>
            <Text style={styles.selectedItemLore} numberOfLines={1}>
              {selectedItem.lore}
            </Text>
          </View>

          {/* Equip / Buy Button */}
          {selectedItem.isUnlocked ? (
            <TouchableOpacity
              disabled={isSelectedEquipped}
              onPress={() => handleEquip(selectedItem)}
              style={[
                styles.primaryActionBtn,
                isSelectedEquipped ? styles.btnAlreadyFitted : styles.btnEquipActive,
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryActionBtnText, isSelectedEquipped && styles.btnTextAlreadyFitted]}>
                {isSelectedEquipped ? '✓ Fitted to Harp' : 'Equip Finish ›'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={!canAffordSelected}
              onPress={() => handleBuy(selectedItem)}
              style={[
                styles.primaryActionBtn,
                canAffordSelected ? styles.btnBuyAmber : styles.btnBuyDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionBtnText}>
                {canAffordSelected ? `Unlock for ${selectedItem.shardCost} 🪙` : 'Not Enough Shards'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. HORIZONTAL ITEM CAROUSEL */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScrollContent}
          >
            {currentCategoryItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isEquipped = currentEquippedId === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelectItem(item)}
                  style={[
                    styles.carouselCard,
                    isSelected && styles.carouselCardSelected,
                    isEquipped && styles.carouselCardEquipped,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.itemCardColorSwatch, { backgroundColor: item.colorHex || '#d4af37' }]} />
                  <Text style={styles.itemCardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemCardCost}>
                    {isEquipped ? 'Fitted' : item.isUnlocked ? 'Unlocked' : `${item.shardCost} 🪙`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. BOTTOM CATEGORY NAVIGATION BAR */}
        <View style={styles.bottomCategoryNavBar}>
          <TouchableOpacity
            onPress={() => switchCategory('TIMBER')}
            style={[styles.categoryNavTab, activeCategory === 'TIMBER' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <Text style={styles.categoryNavIcon}>🌲</Text>
            <Text style={[styles.categoryNavLabel, activeCategory === 'TIMBER' && styles.categoryNavLabelActive]}>
              Woods
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchCategory('ROSETTE')}
            style={[styles.categoryNavTab, activeCategory === 'ROSETTE' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <Text style={styles.categoryNavIcon}>⚜️</Text>
            <Text style={[styles.categoryNavLabel, activeCategory === 'ROSETTE' && styles.categoryNavLabelActive]}>
              Carves
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchCategory('STRINGS')}
            style={[styles.categoryNavTab, activeCategory === 'STRINGS' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <Text style={styles.categoryNavIcon}>✨</Text>
            <Text style={[styles.categoryNavLabel, activeCategory === 'STRINGS' && styles.categoryNavLabelActive]}>
              Strings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchCategory('LEVERS')}
            style={[styles.categoryNavTab, activeCategory === 'LEVERS' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <Text style={styles.categoryNavIcon}>🔧</Text>
            <Text style={[styles.categoryNavLabel, activeCategory === 'LEVERS' && styles.categoryNavLabelActive]}>
              Levers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchCategory('SOUND')}
            style={[styles.categoryNavTab, activeCategory === 'SOUND' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <Text style={styles.categoryNavIcon}>🎵</Text>
            <Text style={[styles.categoryNavLabel, activeCategory === 'SOUND' && styles.categoryNavLabelActive]}>
              Sound
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#060c12',
    position: 'relative',
    justifyContent: 'space-between',
  },
  darkAtmosphereOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 12, 18, 0.35)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 14 : 48,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
    zIndex: 20,
  },
  exitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.35)',
  },
  exitBtnText: {
    color: '#fae8c2',
    fontSize: 13,
    fontWeight: '700',
  },
  titleCenterBox: {
    alignItems: 'center',
  },
  vaultEyebrow: {
    fontSize: 9.5,
    letterSpacing: 1.8,
    color: '#d4af37',
    fontWeight: '800',
  },
  vaultTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#fef08a',
  },
  shardsBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  shardsBadgeText: {
    color: '#fef08a',
    fontSize: 13,
    fontWeight: '800',
  },
  middleHarpCanvasContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    minHeight: 280,
  },
  harpCanvas3d: {
    width: '100%',
    height: '100%',
  },
  canvasFloatingHeader: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  previewStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.55)',
  },
  previewStatusDot: {
    fontSize: 11,
  },
  previewStatusText: {
    color: '#fef08a',
    fontSize: 11.5,
    fontWeight: '800',
  },
  interactive3dHint: {
    color: '#cbd5e1',
    fontSize: 10.5,
    fontStyle: 'italic',
  },
  rosetteBadgeCrest: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  rosetteBadgeText: {
    color: '#fae8c2',
    fontSize: 11.5,
    fontWeight: '700',
  },
  toastOverlay: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
  },
  toastOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  selectedActionShelf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(11, 20, 27, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 198, 154, 0.18)',
    zIndex: 10,
  },
  selectedMetaBox: {
    flex: 1,
    paddingRight: 12,
    gap: 2,
  },
  miniSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  selectedItemTitle: {
    color: '#fae8c2',
    fontSize: 14,
    fontWeight: '800',
  },
  fittedMiniTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  fittedMiniTagText: {
    color: '#a7f3d0',
    fontSize: 8.5,
    fontWeight: '900',
  },
  selectedItemLore: {
    color: '#94a3b8',
    fontSize: 11,
  },
  primaryActionBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEquipActive: {
    backgroundColor: '#0284c7',
  },
  btnAlreadyFitted: {
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  btnBuyAmber: {
    backgroundColor: '#d97706',
  },
  btnBuyDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  btnTextAlreadyFitted: {
    color: '#34d399',
  },
  carouselContainer: {
    paddingVertical: 8,
    backgroundColor: 'rgba(7, 14, 20, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 198, 154, 0.12)',
    zIndex: 10,
  },
  carouselScrollContent: {
    paddingHorizontal: 14,
    gap: 10,
  },
  carouselCard: {
    width: 106,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    gap: 6,
  },
  carouselCardSelected: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  carouselCardEquipped: {
    borderColor: '#34d399',
  },
  itemCardColorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  itemCardName: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  itemCardCost: {
    color: '#fef08a',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomCategoryNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: Platform.OS === 'web' ? 14 : 26,
    height: 58,
    backgroundColor: 'rgba(25, 39, 30, 0.92)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        } as any)
      : {}),
    zIndex: 20,
  },
  categoryNavTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryNavTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.45)',
  },
  categoryNavIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryNavLabel: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  categoryNavLabelActive: {
    color: '#fef08a',
    fontWeight: '800',
  },
});
