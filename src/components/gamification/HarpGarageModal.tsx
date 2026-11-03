/**
 * EARPA HARP ARTISAN WORKSHOP (HARP GARAGE)
 * Spend earned Shards to customize your Celtic harp with authentic natural timbers,
 * hand-carved soundboard inlays, illuminated LED strings, acoustic sound packs, and Camac levers.
 * Styled with the Journey sunglasses background and liquid glass aesthetic.
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

  useEffect(() => {
    if (visible) {
      setUserShards(db.getShards());
      setToastMessage('');
    }
  }, [visible]);

  const equipped = garageEngine.getEquipped();
  const timbers = garageEngine.getTimbers();
  const rosettes = garageEngine.getRosettes();
  const strings = garageEngine.getStrings();
  const sounds = garageEngine.getSounds();
  const levers = garageEngine.getLevers();

  const handleEquip = (category: StoreCategory, id: string, colorHex: string) => {
    let success = false;
    if (category === 'TIMBER') success = garageEngine.equipTimber(id as TimberFinishId);
    else if (category === 'ROSETTE') success = garageEngine.equipRosette(id as SoundboardRosetteId);
    else if (category === 'STRINGS') success = garageEngine.equipStrings(id as ResonanceStringShaderId);
    else if (category === 'SOUND') success = garageEngine.equipSound(id as SoundPackId);
    else if (category === 'LEVERS') success = garageEngine.equipLever(id as LeverFinishId);

    if (success) {
      onApplyCosmetic(category.toLowerCase() as any, colorHex);
      setToastMessage(`Fitted ${category.toLowerCase()} to your Celtic harp.`);
    }
  };

  const handleBuy = (category: StoreCategory, id: string) => {
    const res = garageEngine.buyWithShards(category, id);
    if (res.success) {
      setUserShards(db.getShards());
      setToastMessage(res.message);
      if (res.colorHex) {
        onApplyCosmetic(category.toLowerCase() as any, res.colorHex);
      }
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
              <Text style={styles.eyebrow}>EARPA · ARTISAN WORKSHOP</Text>
              <Text style={styles.title}>The Luthier Vault</Text>
              <Text style={styles.subtitle}>
                Spend your earned Shards on handcrafted woods, carvings, gut warmth, and golden levers.
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
                const canAfford = userShards >= (item.shardCost || 0);

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      !item.isUnlocked && styles.cardLocked,
                      isEquipped && styles.cardEquipped,
                    ]}
                  >
                    <View style={styles.itemHeader}>
                      <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                      <View style={styles.itemMeta}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {isEquipped && <Text style={styles.equippedBadge}>EQUIPPED</Text>}
                        </View>
                        <Text style={styles.itemLore}>{item.lore}</Text>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <Text style={styles.requirementText}>
                        {item.isUnlocked
                          ? 'Unlocked in collection'
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
                  </View>
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
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: 24,
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
  } as any,
  sunglassesTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 13, 22, 0.86)',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    position: 'relative',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    gap: 6,
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
    textAlign: 'center',
    letterSpacing: 0.5,
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
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.55)',
  },
  tabText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#fef08a',
    fontWeight: '800',
  },
  itemList: {
    gap: 12,
  },
  itemCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 10,
  },
  cardLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardEquipped: {
    borderColor: 'rgba(251, 191, 36, 0.7)',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  itemMeta: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '800',
  },
  equippedBadge: {
    fontSize: 9.5,
    color: '#fbbf24',
    fontWeight: '900',
    letterSpacing: 0.8,
    borderWidth: 1,
    borderColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  itemLore: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
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
    fontSize: 11.5,
    color: '#d4af37',
    fontWeight: '700',
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEquip: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  btnEquipped: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  btnBuy: {
    backgroundColor: '#d97706',
    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)',
  } as any,
  btnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  btnTextEquipped: {
    color: '#fbbf24',
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
