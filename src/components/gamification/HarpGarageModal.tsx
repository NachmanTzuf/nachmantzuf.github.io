/**
 * EARPA HARP ARTISAN WORKSHOP (FULL SCREEN 3D LUTHIER VAULT)
 * Dedicated full-screen cosmetic customization studio featuring:
 * - Real 3D Celtic Harp Canvas in the center that dynamically changes finishes in real time
 * - Dual liquid-glass navigation-sized bars taking minimal vertical space
 * - Authentic Diatonic Strings Standard: C=Red, F=Blue, natural nylon ivory
 * - Direct 360° interactive spin and velvet acoustic string plucking
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
  SoundPackId,
  LeverFinishId,
  CosmeticItem,
} from '../../services/gamification/types';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';
import { CelticHarpCanvas, CelticHarpCanvasRef } from '../3d/CelticHarpCanvas';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { TimbreType } from '../../services/audio/types';
import {
  GoldTorcIcon,
  PurpleHeatherFlora,
  TriquetraChordIcon,
  CamacLeverIcon,
  CelticLyreIcon,
} from '../common/CelticIcons';

interface HarpGarageModalProps {
  visible: boolean;
  onClose: () => void;
  garageEngine: HarpGarageEngine;
  onApplyCosmetic: (type: 'timber' | 'rosette' | 'sound' | 'lever', colorHex: string, itemId?: string) => void;
}

type StoreCategory = 'TIMBER' | 'ROSETTE' | 'LEVERS' | 'SOUND';

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
      shopCanvasRef.current.applyLeverColor(eq.lever.colorHex);
      shopCanvasRef.current.applyRosetteInlay?.(eq.rosette.colorHex, eq.rosette.id);
    } catch {}
  };

  const getTimbreForSoundId = (id: string): TimbreType => {
    if (id === 'gut_string_warmth') return 'gut_string_warmth';
    if (id === 'subtle_cathedral_reverb') return 'subtle_cathedral_reverb';
    return 'celtic_nylon';
  };

  const handlePreviewItem = (item: CosmeticItem<any>) => {
    setSelectedItem(item);

    if (activeCategory === 'TIMBER') {
      shopCanvasRef.current?.applyTimberColor(item.colorHex, item.roughness, item.metalness);
    } else if (activeCategory === 'ROSETTE') {
      shopCanvasRef.current?.applyRosetteInlay?.(item.colorHex, item.id);
    } else if (activeCategory === 'LEVERS') {
      shopCanvasRef.current?.applyLeverColor(item.colorHex);
    } else if (activeCategory === 'SOUND') {
      // Only SOUND category triggers a single clear note of the selected timbre
      const soundTimbre = getTimbreForSoundId(item.id);
      HarpSoundSynthesizer.playWarmHarpChime(soundTimbre, 329.63);
    }
  };

  const broadcastCosmeticsUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('earpa:cosmetics-updated'));
    }
  };

  const handleEquip = (item: CosmeticItem<any>) => {
    let success = false;
    if (activeCategory === 'TIMBER') success = garageEngine.equipTimber(item.id as TimberFinishId);
    else if (activeCategory === 'ROSETTE') success = garageEngine.equipRosette(item.id as SoundboardRosetteId);
    else if (activeCategory === 'LEVERS') success = garageEngine.equipLever(item.id as LeverFinishId);
    else if (activeCategory === 'SOUND') success = garageEngine.equipSound(item.id as SoundPackId);

    if (success) {
      onApplyCosmetic(
        activeCategory.toLowerCase() as any,
        activeCategory === 'SOUND' ? item.id : item.colorHex,
        item.id
      );
      setToastMessage(`Fitted ${item.name} ✓`);
      broadcastCosmeticsUpdate();

      const eq = garageEngine.getEquipped();
      applyCurrentEquippedToCanvas(eq);
    }
  };

  const handleBuy = (item: CosmeticItem<any>) => {
    const res = garageEngine.buyWithShards(activeCategory, item.id);
    if (res.success) {
      setUserShards(db.getShards());
      item.isUnlocked = true;
      handleEquip(item);
    } else {
      setToastMessage(res.message);
    }
  };

  const handleConfirmAction = (item: CosmeticItem<any>) => {
    const eqId = getEquippedIdForActiveCategory();
    if (item.id === eqId) {
      setToastMessage(`${item.name} is fitted to your harp.`);
    } else if (item.isUnlocked) {
      handleEquip(item);
    } else if (userShards >= (item.shardCost || 0)) {
      handleBuy(item);
    } else {
      setToastMessage(`Need ${item.shardCost} shards (you have ${userShards}).`);
    }
  };

  const timbers = garageEngine.getTimbers();
  const rosettes = garageEngine.getRosettes();
  const levers = garageEngine.getLevers();
  const sounds = garageEngine.getSounds();

  const getItemsForActiveCategory = (): CosmeticItem<any>[] => {
    switch (activeCategory) {
      case 'TIMBER': return timbers;
      case 'ROSETTE': return rosettes;
      case 'LEVERS': return levers;
      case 'SOUND': return sounds;
    }
  };

  const getEquippedIdForActiveCategory = (): string => {
    switch (activeCategory) {
      case 'TIMBER': return equipped.timber.id;
      case 'ROSETTE': return equipped.rosette.id;
      case 'LEVERS': return equipped.lever.id;
      case 'SOUND': return equipped.sound.id;
    }
  };

  const currentCategoryItems = getItemsForActiveCategory();
  const currentEquippedId = getEquippedIdForActiveCategory();

  const switchCategory = (cat: StoreCategory) => {
    setActiveCategory(cat);
    let item: CosmeticItem<any>;
    switch (cat) {
      case 'TIMBER': item = equipped.timber; break;
      case 'ROSETTE': item = equipped.rosette; break;
      case 'LEVERS': item = equipped.lever; break;
      case 'SOUND': item = equipped.sound; break;
    }
    setSelectedItem(item);
    applyCurrentEquippedToCanvas();
    if (cat === 'LEVERS') {
      shopCanvasRef.current?.rotateToAngle?.(2.65);
    } else {
      shopCanvasRef.current?.rotateToAngle?.(1.10);
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
        {/* Authentic Celtic Master Portal Background showing all 3 realm elements */}
        <Image
          source={{ uri: '/images/tri_realm_sanctuary.jpg' }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={styles.darkAtmosphereOverlay} />

        {/* 1. TOP BAR: Close, Artisan Shop, Shards Balance */}
        <View style={styles.topBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Exit Artisan Shop"
            onPress={onClose}
            style={styles.exitBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.exitBtnText}>✕ Close</Text>
          </TouchableOpacity>

          <Text style={styles.vaultTitle}>Artisan Shop</Text>

          <View style={styles.shardsBadgePill}>
            <GoldTorcIcon size={15} color="#fbbf24" />
            <Text style={styles.shardsBadgeText}>{userShards}</Text>
          </View>
        </View>

        {/* 2. 3D CELTIC HARP: Exact 0.78 scale, 0.385 targetY, matching Single Note tab pixel-for-pixel */}
        <View style={styles.middleHarpCanvasContainer}>
          <CelticHarpCanvas
            ref={shopCanvasRef}
            style={styles.harpCanvas3d}
            interactiveControls={true}
            minimalHeroMode={true}
            autoSpin={false}
            customScale={0.78}
            targetY={0.385}
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

        {/* PREVIEW ACTION PILL: Confirm Equip or Unlock after previewing */}
        {selectedItem && selectedItem.id !== currentEquippedId && (
          <View style={styles.previewActionContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                selectedItem.isUnlocked
                  ? `Equip ${selectedItem.name}`
                  : `Unlock ${selectedItem.name} for ${selectedItem.shardCost} shards`
              }
              onPress={() => handleConfirmAction(selectedItem)}
              style={styles.previewActionPill}
              activeOpacity={0.85}
            >
              {!selectedItem.isUnlocked && <GoldTorcIcon size={14} color="#fbbf24" />}
              <Text style={styles.previewActionText}>
                {selectedItem.isUnlocked
                  ? `Equip ${selectedItem.name.replace('Fiddleback ', '').replace('Connemara ', '').replace('Camac ', '')}`
                  : `Unlock · ${selectedItem.shardCost}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. ITEM OPTIONS SELECTOR BAR (Minimal liquid glass matching navigation bar) */}
        <View style={styles.itemSelectionBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemSelectionScroll}
          >
            {currentCategoryItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isEquipped = currentEquippedId === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handlePreviewItem(item)}
                  style={[
                    styles.itemPill,
                    isSelected && styles.itemPillSelected,
                    isEquipped && styles.itemPillEquipped,
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.itemColorSwatch,
                      { backgroundColor: item.colorHex || '#d4af37' },
                    ]}
                  />
                  <Text style={styles.itemPillName} numberOfLines={1}>
                    {item.name.replace('Fiddleback ', '').replace('Connemara ', '').replace('Camac ', '')}
                  </Text>
                  <View
                    style={[
                      styles.itemStatusBadge,
                      isEquipped && styles.itemStatusBadgeEquipped,
                      item.isUnlocked && !isEquipped && styles.itemStatusBadgeUnlocked,
                    ]}
                  >
                    {!isEquipped && !item.isUnlocked && <GoldTorcIcon size={11} color="#fef08a" />}
                    <Text
                      style={[
                        styles.itemStatusText,
                        isEquipped && styles.itemStatusTextEquipped,
                        item.isUnlocked && !isEquipped && styles.itemStatusTextUnlocked,
                      ]}
                    >
                      {isEquipped ? '✓' : item.isUnlocked ? 'Owned' : `${item.shardCost}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. BOTTOM CATEGORY NAVIGATION BAR (Woods, Carves, Levers, Sound) */}
        <View style={styles.bottomCategoryNavBar}>
          <TouchableOpacity
            onPress={() => switchCategory('TIMBER')}
            style={[styles.categoryNavTab, activeCategory === 'TIMBER' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <PurpleHeatherFlora size={19} color={activeCategory === 'TIMBER' ? '#e2e8f0' : '#94a3b8'} />
            <Text style={[styles.categoryNavLabel, activeCategory === 'TIMBER' && styles.categoryNavLabelActive]}>
              WOODS
            </Text>
            {activeCategory === 'TIMBER' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchCategory('ROSETTE')}
            style={[styles.categoryNavTab, activeCategory === 'ROSETTE' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <TriquetraChordIcon size={19} color={activeCategory === 'ROSETTE' ? '#e2e8f0' : '#94a3b8'} />
            <Text style={[styles.categoryNavLabel, activeCategory === 'ROSETTE' && styles.categoryNavLabelActive]}>
              CARVES
            </Text>
            {activeCategory === 'ROSETTE' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchCategory('LEVERS')}
            style={[styles.categoryNavTab, activeCategory === 'LEVERS' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <CamacLeverIcon size={19} color={activeCategory === 'LEVERS' ? '#e2e8f0' : '#94a3b8'} />
            <Text style={[styles.categoryNavLabel, activeCategory === 'LEVERS' && styles.categoryNavLabelActive]}>
              LEVERS
            </Text>
            {activeCategory === 'LEVERS' && <View style={styles.activeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchCategory('SOUND')}
            style={[styles.categoryNavTab, activeCategory === 'SOUND' && styles.categoryNavTabActive]}
            activeOpacity={0.75}
          >
            <CelticLyreIcon size={19} color={activeCategory === 'SOUND' ? '#e2e8f0' : '#94a3b8'} />
            <Text style={[styles.categoryNavLabel, activeCategory === 'SOUND' && styles.categoryNavLabelActive]}>
              SOUND
            </Text>
            {activeCategory === 'SOUND' && <View style={styles.activeDot} />}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 14 : 48,
    paddingBottom: 10,
    backgroundColor: 'rgba(25, 39, 30, 0.72)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.14)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        } as any)
      : {}),
    zIndex: 30,
  },
  exitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  exitBtnText: {
    color: '#e2e8f0',
    fontSize: 12.5,
    fontWeight: '700',
  },
  vaultTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#f8fafc',
  },
  shardsBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  shardsBadgeText: {
    color: '#fef08a',
    fontSize: 13,
    fontWeight: '800',
  },
  middleHarpCanvasContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 158 : 154,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  harpCanvas3d: {
    width: '100%',
    height: '100%',
  },
  toastOverlay: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(5, 150, 105, 0.90)',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
    zIndex: 40,
  } as any,
  toastOverlayText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  previewActionContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 150 : 162,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 35,
  },
  previewActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 39, 30, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.55)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        } as any)
      : {}),
  } as any,
  previewActionText: {
    color: '#fef08a',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  itemSelectionBar: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 84 : 96,
    left: 14,
    right: 14,
    height: 58,
    backgroundColor: 'rgba(25, 39, 30, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        } as any)
      : {}),
    zIndex: 30,
  },
  itemSelectionScroll: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  itemPillSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderColor: '#fbbf24',
    boxShadow: '0 0 10px rgba(251, 191, 36, 0.35)',
  } as any,
  itemPillEquipped: {
    borderColor: '#34d399',
  },
  itemColorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  itemPillName: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  itemStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.20)',
    borderWidth: 0.8,
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  itemStatusBadgeEquipped: {
    backgroundColor: 'rgba(52, 211, 153, 0.22)',
    borderColor: '#34d399',
  },
  itemStatusBadgeUnlocked: {
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    borderColor: '#38bdf8',
  },
  itemStatusText: {
    color: '#fef08a',
    fontSize: 10,
    fontWeight: '800',
  },
  itemStatusTextEquipped: {
    color: '#a7f3d0',
  },
  itemStatusTextUnlocked: {
    color: '#bae6fd',
  },
  bottomCategoryNavBar: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 14 : 26,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 62,
    backgroundColor: 'rgba(25, 39, 30, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    paddingHorizontal: 6,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        } as any)
      : {}),
    zIndex: 30,
  },
  categoryNavTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 18,
    position: 'relative',
  },
  categoryNavTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  categoryNavLabel: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  categoryNavLabelActive: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#d97706',
  },
});
