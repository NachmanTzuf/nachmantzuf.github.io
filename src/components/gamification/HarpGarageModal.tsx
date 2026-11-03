/**
 * EARPA HARP ARTISAN WORKSHOP (HARP GARAGE)
 * Spend earned Shards to customize your Celtic harp with authentic timbers,
 * carved soundboard rosettes, and illuminated LED resonance string shaders.
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
} from 'react-native';
import { HarpGarageEngine } from '../../services/gamification/HarpGarageEngine';
import {
  TimberFinishId,
  SoundboardRosetteId,
  ResonanceStringShaderId,
} from '../../services/gamification/types';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';

interface HarpGarageModalProps {
  visible: boolean;
  onClose: () => void;
  garageEngine: HarpGarageEngine;
  onApplyCosmetic: (type: 'timber' | 'rosette' | 'strings', colorHex: string) => void;
}

export const HarpGarageModal: React.FC<HarpGarageModalProps> = ({
  visible,
  onClose,
  garageEngine,
  onApplyCosmetic,
}) => {
  const db = UserAccountDatabase.getInstance();
  const [activeTab, setActiveTab] = useState<'TIMBER' | 'ROSETTE' | 'STRINGS'>('TIMBER');
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

  const handleEquipTimber = (id: TimberFinishId, colorHex: string) => {
    if (garageEngine.equipTimber(id)) {
      onApplyCosmetic('timber', colorHex);
      setToastMessage('Fitted finish to harp.');
    }
  };

  const handleEquipRosette = (id: SoundboardRosetteId, colorHex: string) => {
    if (garageEngine.equipRosette(id)) {
      onApplyCosmetic('rosette', colorHex);
      setToastMessage('Fitted rosette inlay to soundboard.');
    }
  };

  const handleEquipStrings = (id: ResonanceStringShaderId, colorHex: string) => {
    if (garageEngine.equipStrings(id)) {
      onApplyCosmetic('strings', colorHex);
      setToastMessage('Fitted illuminated strings to harp.');
    }
  };

  const handleBuy = (category: 'TIMBER' | 'ROSETTE' | 'STRINGS', id: string) => {
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.eyebrow}>EARPA · ARTISAN WORKSHOP</Text>
              <Text style={styles.title}>The Luthier Vault</Text>
              <Text style={styles.subtitle}>
                Spend your earned Shards on handcrafted woods, carvings, and illuminated LED strings.
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

            {/* Category Tabs */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'TIMBER' && styles.tabActive]}
                onPress={() => { setActiveTab('TIMBER'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'TIMBER' && styles.tabTextActive]}>
                  Woods & Finishes ({timbers.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'STRINGS' && styles.tabActive]}
                onPress={() => { setActiveTab('STRINGS'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'STRINGS' && styles.tabTextActive]}>
                  LED Strings ({strings.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'ROSETTE' && styles.tabActive]}
                onPress={() => { setActiveTab('ROSETTE'); setToastMessage(''); }}
              >
                <Text style={[styles.tabText, activeTab === 'ROSETTE' && styles.tabTextActive]}>
                  Rosettes ({rosettes.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Timbers List */}
            {activeTab === 'TIMBER' && (
              <View style={styles.itemList}>
                {timbers.map((item) => {
                  const isEquipped = equipped.timber.id === item.id;
                  const isUnlocked = item.isUnlocked;
                  const cost = item.shardCost || 0;
                  const canAfford = userShards >= cost;

                  return (
                    <View key={item.id} style={[styles.itemCard, !isUnlocked && styles.cardLocked]}>
                      <View style={styles.itemHeader}>
                        <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemLore}>{item.lore}</Text>
                          {!isUnlocked && (
                            <Text style={styles.costText}>🪙 Cost: {cost} Shards</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        {isEquipped ? (
                          <View style={styles.equippedBadge}>
                            <Text style={styles.equippedText}>✓ Fitted to Harp</Text>
                          </View>
                        ) : isUnlocked ? (
                          <TouchableOpacity
                            style={styles.equipBtn}
                            onPress={() => handleEquipTimber(item.id, item.colorHex)}
                          >
                            <Text style={styles.equipBtnText}>Fit to Harp</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            disabled={!canAfford}
                            style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                            onPress={() => handleBuy('TIMBER', item.id)}
                          >
                            <Text style={styles.buyBtnText}>
                              {canAfford ? `Unlock for ${cost} Shards` : `Need ${cost - userShards} more`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Strings List */}
            {activeTab === 'STRINGS' && (
              <View style={styles.itemList}>
                {strings.map((item) => {
                  const isEquipped = equipped.strings.id === item.id;
                  const isUnlocked = item.isUnlocked;
                  const cost = item.shardCost || 0;
                  const canAfford = userShards >= cost;

                  return (
                    <View key={item.id} style={[styles.itemCard, !isUnlocked && styles.cardLocked]}>
                      <View style={styles.itemHeader}>
                        <View style={[styles.colorSwatch, { backgroundColor: item.colorHex, boxShadow: `0 0 10px ${item.colorHex}` } as any]} />
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemLore}>{item.lore}</Text>
                          {!isUnlocked && (
                            <Text style={styles.costText}>🪙 Cost: {cost} Shards</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        {isEquipped ? (
                          <View style={styles.equippedBadge}>
                            <Text style={styles.equippedText}>✓ Fitted to Harp</Text>
                          </View>
                        ) : isUnlocked ? (
                          <TouchableOpacity
                            style={styles.equipBtn}
                            onPress={() => handleEquipStrings(item.id, item.colorHex)}
                          >
                            <Text style={styles.equipBtnText}>Fit to Harp</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            disabled={!canAfford}
                            style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                            onPress={() => handleBuy('STRINGS', item.id)}
                          >
                            <Text style={styles.buyBtnText}>
                              {canAfford ? `Unlock for ${cost} Shards` : `Need ${cost - userShards} more`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Rosettes List */}
            {activeTab === 'ROSETTE' && (
              <View style={styles.itemList}>
                {rosettes.map((item) => {
                  const isEquipped = equipped.rosette.id === item.id;
                  const isUnlocked = item.isUnlocked;
                  const cost = item.shardCost || 0;
                  const canAfford = userShards >= cost;

                  return (
                    <View key={item.id} style={[styles.itemCard, !isUnlocked && styles.cardLocked]}>
                      <View style={styles.itemHeader}>
                        <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemLore}>{item.lore}</Text>
                          {!isUnlocked && (
                            <Text style={styles.costText}>🪙 Cost: {cost} Shards</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        {isEquipped ? (
                          <View style={styles.equippedBadge}>
                            <Text style={styles.equippedText}>✓ Fitted to Harp</Text>
                          </View>
                        ) : isUnlocked ? (
                          <TouchableOpacity
                            style={styles.equipBtn}
                            onPress={() => handleEquipRosette(item.id, item.colorHex)}
                          >
                            <Text style={styles.equipBtnText}>Fit to Harp</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            disabled={!canAfford}
                            style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                            onPress={() => handleBuy('ROSETTE', item.id)}
                          >
                            <Text style={styles.buyBtnText}>
                              {canAfford ? `Unlock for ${cost} Shards` : `Need ${cost - userShards} more`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Return Button */}
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.closeBtnText}>Return to Sanctuary</Text>
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
    backgroundColor: 'rgba(5, 12, 9, 0.88)',
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
    backgroundColor: 'rgba(19, 35, 27, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
  } as any,
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  eyebrow: {
    color: '#d4af37',
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: 'Cinzel-Bold',
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 24,
    color: '#fef08a',
    textAlign: 'center',
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
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.45)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 10,
  },
  cardLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#f8fafc',
  },
  itemLore: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
  },
  costText: {
    fontSize: 11,
    color: '#fcd34d',
    fontWeight: '700',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  equippedBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  equippedText: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '700',
  },
  equipBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  equipBtnText: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '700',
  },
  buyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#b45309',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  buyBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    marginTop: 8,
  },
  closeBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
});
