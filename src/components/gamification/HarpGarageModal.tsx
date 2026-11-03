/**
 * EARPA HARP ARTISAN WORKSHOP (HARP GARAGE)
 * Spend earned Shards to customize your Celtic harp with authentic natural timbers,
 * hand-carved soundboard inlays, illuminated LED strings, acoustic sound packs, and Camac levers.
 * Features real-time visual Celtic harp preview, dynamic color accuracy,
 * and velvety soft, warm acoustic harp plucks.
 */

import React, { useState, useEffect } from 'react';
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
import { HarpShopPreview } from './HarpShopPreview';
import { HarpSoundSynthesizer } from '../../services/audio/HarpSoundSynthesizer';
import { TimbreType } from '../../services/audio/types';

interface HarpGarageModalProps {
  visible: boolean;
  onClose: () => void;
  garageEngine: HarpGarageEngine;
  onApplyCosmetic: (type: 'timber' | 'rosette' | 'strings' | 'sound' | 'lever', colorHex: string) => void;
}

type StoreCategory = 'TIMBER' | 'ROSETTE' | 'STRINGS' | 'SOUND' | 'LEVERS';

export const HarpGarageModal: React.FC<HarpGarageModalProps> = ({
  visible,
  onClose,
  garageEngine,
  onApplyCosmetic,
}) => {
  const db = UserAccountDatabase.getInstance();
  const [activeTab, setActiveTab] = useState<StoreCategory>('TIMBER');
  const [userShards, setUserShards] = useState<number>(db.getShards());
  const [toastMessage, setToastMessage] = useState<string>('');

  // Live preview state (defaults to equipped items)
  const equipped = garageEngine.getEquipped();
  const [previewTimber, setPreviewTimber] = useState<CosmeticItem<TimberFinishId>>(equipped.timber);
  const [previewRosette, setPreviewRosette] = useState<CosmeticItem<SoundboardRosetteId>>(equipped.rosette);
  const [previewStrings, setPreviewStrings] = useState<CosmeticItem<ResonanceStringShaderId>>(equipped.strings);
  const [previewSound, setPreviewSound] = useState<CosmeticItem<SoundPackId>>(equipped.sound);
  const [previewLever, setPreviewLever] = useState<CosmeticItem<LeverFinishId>>(equipped.lever);
  const [previewItemName, setPreviewItemName] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setUserShards(db.getShards());
      setToastMessage('');
      const eq = garageEngine.getEquipped();
      setPreviewTimber(eq.timber);
      setPreviewRosette(eq.rosette);
      setPreviewStrings(eq.strings);
      setPreviewSound(eq.sound);
      setPreviewLever(eq.lever);
      setPreviewItemName('');
    }
  }, [visible]);

  const timbers = garageEngine.getTimbers();
  const rosettes = garageEngine.getRosettes();
  const strings = garageEngine.getStrings();
  const sounds = garageEngine.getSounds();
  const levers = garageEngine.getLevers();

  const getTimbreForSoundId = (id: string): TimbreType => {
    if (id === 'gut_string_warmth') return 'gut_string_warmth';
    if (id === 'subtle_cathedral_reverb') return 'subtle_cathedral_reverb';
    return 'celtic_nylon';
  };

  const handlePreviewItem = (category: StoreCategory, item: CosmeticItem<any>) => {
    setPreviewItemName(item.name);
    let noteFreq = 329.63; // E4 warm note
    let soundTimbre = getTimbreForSoundId(previewSound.id);

    if (category === 'TIMBER') {
      setPreviewTimber(item);
      noteFreq = 261.63; // Rich deep C4
    } else if (category === 'ROSETTE') {
      setPreviewRosette(item);
      noteFreq = 392.00; // Resonant G4
    } else if (category === 'STRINGS') {
      setPreviewStrings(item);
      noteFreq = 523.25; // Shimmering C5
    } else if (category === 'SOUND') {
      setPreviewSound(item);
      soundTimbre = getTimbreForSoundId(item.id);
      noteFreq = 349.23; // F4
    } else if (category === 'LEVERS') {
      setPreviewLever(item);
      noteFreq = 369.99; // F#4 Semitone lever shift
    }

    // Play ultra soft, warm, satisfying chime on touch
    HarpSoundSynthesizer.playWarmHarpChime(soundTimbre, noteFreq);
  };

  const handleEquip = (category: StoreCategory, id: string, colorHex: string) => {
    let success = false;
    if (category === 'TIMBER') success = garageEngine.equipTimber(id as TimberFinishId);
    else if (category === 'ROSETTE') success = garageEngine.equipRosette(id as SoundboardRosetteId);
    else if (category === 'STRINGS') success = garageEngine.equipStrings(id as ResonanceStringShaderId);
    else if (category === 'SOUND') success = garageEngine.equipSound(id as SoundPackId);
    else if (category === 'LEVERS') success = garageEngine.equipLever(id as LeverFinishId);

    if (success) {
      const eq = garageEngine.getEquipped();
      setPreviewTimber(eq.timber);
      setPreviewRosette(eq.rosette);
      setPreviewStrings(eq.strings);
      setPreviewSound(eq.sound);
      setPreviewLever(eq.lever);
      setPreviewItemName('');

      onApplyCosmetic(category.toLowerCase() as any, category === 'SOUND' ? id : colorHex);
      setToastMessage(`Fitted ${category.toLowerCase()} to your Celtic harp.`);

      // Play warm celebration chord
      const timbre = getTimbreForSoundId(eq.sound.id);
      HarpSoundSynthesizer.playWarmHarpChime(timbre, 261.63);
      setTimeout(() => HarpSoundSynthesizer.playWarmHarpChime(timbre, 329.63), 100);
      setTimeout(() => HarpSoundSynthesizer.playWarmHarpChime(timbre, 392.00), 200);
      setTimeout(() => HarpSoundSynthesizer.playWarmHarpChime(timbre, 523.25), 300);
    }
  };

  const handleBuy = (category: StoreCategory, id: string) => {
    const res = garageEngine.buyWithShards(category, id);
    if (res.success) {
      setUserShards(db.getShards());
      setToastMessage(res.message);
      const eq = garageEngine.getEquipped();
      setPreviewTimber(eq.timber);
      setPreviewRosette(eq.rosette);
      setPreviewStrings(eq.strings);
      setPreviewSound(eq.sound);
      setPreviewLever(eq.lever);
      setPreviewItemName('');

      if (res.colorHex) {
        onApplyCosmetic(category.toLowerCase() as any, category === 'SOUND' ? id : res.colorHex);
      }

      // Play warm affirmation arpeggio
      const timbre = getTimbreForSoundId(eq.sound.id);
      HarpSoundSynthesizer.playWarmHarpChime(timbre, 329.63);
      setTimeout(() => HarpSoundSynthesizer.playWarmHarpChime(timbre, 392.00), 120);
      setTimeout(() => HarpSoundSynthesizer.playWarmHarpChime(timbre, 523.25), 240);
    } else {
      setToastMessage(res.message);
    }
  };

  const getItemsForTab = (): CosmeticItem<any>[] => {
    switch (activeTab) {
      case 'TIMBER': return timbers;
      case 'ROSETTE': return rosettes;
      case 'STRINGS': return strings;
      case 'SOUND': return sounds;
      case 'LEVERS': return levers;
    }
  };

  const getEquippedId = (): string => {
    switch (activeTab) {
      case 'TIMBER': return equipped.timber.id;
      case 'ROSETTE': return equipped.rosette.id;
      case 'STRINGS': return equipped.strings.id;
      case 'SOUND': return equipped.sound.id;
      case 'LEVERS': return equipped.lever.id;
    }
  };

  const currentItems = getItemsForTab();
  const currentEquippedId = getEquippedId();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Journey Sunglasses Background Layer */}
          <Image
            source={{ uri: '/images/earpa_journey_bg.jpg' }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.sunglassesTint} />

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.eyebrow}>EARPA · ARTISAN WORKSHOP</Text>
                  <Text style={styles.title}>The Luthier Vault</Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Close workshop"
                  onPress={onClose}
                  style={styles.closeHeaderBtn}
                >
                  <Text style={styles.closeHeaderText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Spend earned Shards on handcrafted woods, carvings, gut string warmth, and Camac levers.
              </Text>

              {/* Shards Currency Counter */}
              <View style={styles.shardsBadge}>
                <Text style={styles.shardsIcon}>🪙</Text>
                <Text style={styles.shardsValue}>{userShards} Shards Available</Text>
              </View>

              {!!toastMessage && (
                <View style={styles.toastBox}>
                  <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
              )}
            </View>

            {/* LIVE DYNAMIC CELTIC HARP SHOWCASE */}
            <HarpShopPreview
              timberColor={previewTimber.colorHex}
              timberName={previewTimber.name}
              rosetteColor={previewRosette.colorHex}
              rosetName={previewRosette.name}
              stringsColor={previewStrings.colorHex}
              stringsName={previewStrings.name}
              leverColor={previewLever.colorHex}
              leverName={previewLever.name}
              soundPackId={previewSound.id}
              soundPackName={previewSound.name}
              isPreviewing={!!previewItemName}
              previewItemName={previewItemName}
            />

            {/* Category Tabs: Woods, Carvings, LED, Sound, Levers */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'TIMBER' && styles.tabActive]}
                onPress={() => { setActiveTab('TIMBER'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'TIMBER' && styles.tabTextActive]}>
                  🌲 Natural Woods ({timbers.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'ROSETTE' && styles.tabActive]}
                onPress={() => { setActiveTab('ROSETTE'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'ROSETTE' && styles.tabTextActive]}>
                  ⚜️ Carved Inlays ({rosettes.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'SOUND' && styles.tabActive]}
                onPress={() => { setActiveTab('SOUND'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'SOUND' && styles.tabTextActive]}>
                  🎵 Sound Packs ({sounds.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'LEVERS' && styles.tabActive]}
                onPress={() => { setActiveTab('LEVERS'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'LEVERS' && styles.tabTextActive]}>
                  🔧 Camac Levers ({levers.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'STRINGS' && styles.tabActive]}
                onPress={() => { setActiveTab('STRINGS'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'STRINGS' && styles.tabTextActive]}>
                  ✨ LED Strings ({strings.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Catalog Items */}
            <View style={styles.itemList}>
              {currentItems.map((item) => {
                const isEquipped = currentEquippedId === item.id;
                const isPreviewed = previewItemName === item.name;
                const canAfford = userShards >= (item.shardCost || 0);

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => handlePreviewItem(activeTab, item)}
                    style={[
                      styles.itemCard,
                      !item.isUnlocked && styles.cardLocked,
                      isEquipped && styles.cardEquipped,
                      isPreviewed && styles.cardPreviewed,
                    ]}
                  >
                    <View style={styles.itemHeader}>
                      <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                      <View style={styles.itemMeta}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {isEquipped ? (
                            <Text style={styles.equippedBadge}>EQUIPPED</Text>
                          ) : isPreviewed ? (
                            <Text style={styles.previewBadge}>PREVIEWING</Text>
                          ) : null}
                        </View>
                        <Text style={styles.itemLore}>{item.lore}</Text>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <Text style={styles.requirementText}>
                        {item.isUnlocked
                          ? 'Tap to preview tone'
                          : `${item.shardCost || 0} Shards`}
                      </Text>

                      {item.isUnlocked ? (
                        <TouchableOpacity
                          disabled={isEquipped}
                          style={[styles.actionBtn, isEquipped ? styles.btnEquipped : styles.btnEquip]}
                          onPress={() => handleEquip(activeTab, item.id, item.colorHex)}
                        >
                          <Text style={[styles.actionBtnText, isEquipped && styles.btnTextEquipped]}>
                            {isEquipped ? 'Fitted' : 'Equip'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          disabled={!canAfford}
                          style={[styles.actionBtn, canAfford ? styles.btnBuy : styles.btnDisabled]}
                          onPress={() => handleBuy(activeTab, item.id)}
                        >
                          <Text style={styles.actionBtnText}>
                            {canAfford ? `Buy for ${item.shardCost} 🪙` : 'Not Enough Shards'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Done / Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 16, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    borderRadius: 24,
    backgroundColor: '#090d16',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
        } as any)
      : {}),
  },
  sunglassesTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 13, 22, 0.86)',
  },
  scrollContent: {
    padding: 18,
    gap: 16,
    position: 'relative',
    zIndex: 10,
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 10.5,
    letterSpacing: 2,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    color: '#fef08a',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeHeaderBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 198, 154, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeHeaderText: {
    color: '#fae8c2',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 17,
  },
  shardsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 4,
  },
  shardsIcon: {
    fontSize: 14,
  },
  shardsValue: {
    color: '#fef08a',
    fontSize: 13,
    fontWeight: '800',
  },
  toastBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.35)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 10,
    marginTop: 4,
  },
  toastText: {
    color: '#a7f3d0',
    fontSize: 11.5,
    fontWeight: '700',
  },
  tabBar: {
    gap: 8,
    paddingVertical: 4,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#fbbf24',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fef08a',
    fontWeight: '800',
  },
  itemList: {
    gap: 10,
  },
  itemCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 8,
  },
  cardLocked: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardEquipped: {
    borderColor: '#34d399',
    backgroundColor: 'rgba(6, 78, 59, 0.28)',
  },
  cardPreviewed: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  itemMeta: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    color: '#f8fafc',
    fontSize: 13.5,
    fontWeight: '700',
  },
  itemLore: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  equippedBadge: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  previewBadge: {
    color: '#fef08a',
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  requirementText: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btnEquip: {
    backgroundColor: '#0284c7',
  },
  btnEquipped: {
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
  },
  btnBuy: {
    backgroundColor: '#d97706',
  },
  btnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  btnTextEquipped: {
    color: '#34d399',
  },
  closeBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  closeBtnText: {
    color: '#fae8c2',
    fontSize: 14,
    fontWeight: '800',
  },
});
