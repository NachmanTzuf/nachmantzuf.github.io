/**
 * EARPA HARP GARAGE 3D CUSTOMIZATION MODAL
 * Dedicated cosmetic customization studio for timber finishes, carved soundboard rosettes,
 * and illuminated resonance string shaders.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HarpGarageEngine } from '../../services/gamification/HarpGarageEngine';
import {
  TimberFinishId,
  SoundboardRosetteId,
  ResonanceStringShaderId,
} from '../../services/gamification/types';

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
  const [activeTab, setActiveTab] = useState<'TIMBER' | 'ROSETTE' | 'STRINGS'>('TIMBER');
  const equipped = garageEngine.getEquipped();

  const timbers = garageEngine.getTimbers();
  const rosettes = garageEngine.getRosettes();
  const strings = garageEngine.getStrings();

  const handleEquipTimber = (id: TimberFinishId, colorHex: string) => {
    if (garageEngine.equipTimber(id)) {
      onApplyCosmetic('timber', colorHex);
    }
  };

  const handleEquipRosette = (id: SoundboardRosetteId, colorHex: string) => {
    if (garageEngine.equipRosette(id)) {
      onApplyCosmetic('rosette', colorHex);
    }
  };

  const handleEquipStrings = (id: ResonanceStringShaderId, colorHex: string) => {
    if (garageEngine.equipStrings(id)) {
      onApplyCosmetic('strings', colorHex);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>The Harp Garage</Text>
              <Text style={styles.subtitle}>Customize your 3D Celtic harp with earned craftsmanship</Text>
            </View>

            {/* Category Tabs */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'TIMBER' && styles.tabActive]}
                onPress={() => setActiveTab('TIMBER')}
              >
                <Text style={[styles.tabText, activeTab === 'TIMBER' && styles.tabTextActive]}>
                  Timbers (5)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'ROSETTE' && styles.tabActive]}
                onPress={() => setActiveTab('ROSETTE')}
              >
                <Text style={[styles.tabText, activeTab === 'ROSETTE' && styles.tabTextActive]}>
                  Rosettes (5)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeTab === 'STRINGS' && styles.tabActive]}
                onPress={() => setActiveTab('STRINGS')}
              >
                <Text style={[styles.tabText, activeTab === 'STRINGS' && styles.tabTextActive]}>
                  Strings (5)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Timbers List */}
            {activeTab === 'TIMBER' && (
              <View style={styles.itemList}>
                {timbers.map((item) => {
                  const isEquipped = equipped.timber.id === item.id;
                  const isUnlocked = item.isUnlocked;

                  return (
                    <View key={item.id} style={[styles.itemCard, !isUnlocked && styles.cardLocked]}>
                      <View style={styles.itemHeader}>
                        <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemLore}>{item.lore}</Text>
                          {!isUnlocked && (
                            <Text style={styles.itemUnlockText}>Lock: {item.unlockRequirement}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        {isEquipped ? (
                          <View style={styles.equippedBadge}>
                            <Text style={styles.equippedText}>Currently Fitted</Text>
                          </View>
                        ) : isUnlocked ? (
                          <TouchableOpacity
                            style={styles.equipBtn}
                            onPress={() => handleEquipTimber(item.id, item.colorHex)}
                          >
                            <Text style={styles.equipBtnText}>Fit to Harp</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.lockedBadge}>
                            <Text style={styles.lockedText}>Milestone Locked</Text>
                          </View>
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

                  return (
                    <View key={item.id} style={[styles.itemCard, !isUnlocked && styles.cardLocked]}>
                      <View style={styles.itemHeader}>
                        <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemLore}>{item.lore}</Text>
                          {!isUnlocked && (
                            <Text style={styles.itemUnlockText}>Lock: {item.unlockRequirement}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        {isEquipped ? (
                          <View style={styles.equippedBadge}>
                            <Text style={styles.equippedText}>Currently Fitted</Text>
                          </View>
                        ) : isUnlocked ? (
                          <TouchableOpacity
                            style={styles.equipBtn}
                            onPress={() => handleEquipRosette(item.id, item.colorHex)}
                          >
                            <Text style={styles.equipBtnText}>Fit to Harp</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.lockedBadge}>
                            <Text style={styles.lockedText}>Milestone Locked</Text>
                          </View>
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

                  return (
                    <View key={item.id} style={[styles.itemCard, !isUnlocked && styles.cardLocked]}>
                      <View style={styles.itemHeader}>
                        <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemLore}>{item.lore}</Text>
                          {!isUnlocked && (
                            <Text style={styles.itemUnlockText}>Lock: {item.unlockRequirement}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        {isEquipped ? (
                          <View style={styles.equippedBadge}>
                            <Text style={styles.equippedText}>Currently Fitted</Text>
                          </View>
                        ) : isUnlocked ? (
                          <TouchableOpacity
                            style={styles.equipBtn}
                            onPress={() => handleEquipStrings(item.id, item.colorHex)}
                          >
                            <Text style={styles.equipBtnText}>Fit to Harp</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.lockedBadge}>
                            <Text style={styles.lockedText}>Milestone Locked</Text>
                          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#121722',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#d4af37',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 20,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a2232',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#273347',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#d4af37',
  },
  itemList: {
    gap: 12,
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#18202e',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardLocked: {
    opacity: 0.55,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  itemLore: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 16,
  },
  itemUnlockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f87171',
    marginTop: 4,
  },
  actionRow: {
    alignItems: 'flex-end',
  },
  equippedBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#065f46',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  equippedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  equipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#d4af37',
    borderRadius: 8,
  },
  equipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  lockedBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#273142',
    borderRadius: 6,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  closeBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
});
