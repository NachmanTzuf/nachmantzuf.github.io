/**
 * EARPA HARP GARAGE COSMETIC ENGINE
 * Dedicated cosmetic customization studio for timber finishes, carved soundboard rosettes,
 * and illuminated resonance string shaders with real-time Shard economy and persistent equipping.
 */

import {
  CosmeticItem,
  TimberFinishId,
  SoundboardRosetteId,
  ResonanceStringShaderId,
} from './types';
import { UserAccountDatabase } from '../account/UserAccountDatabase';

const STORAGE_KEY_UNLOCKED = 'earpa_unlocked_cosmetics_v1';
const STORAGE_KEY_EQUIPPED = 'earpa_equipped_cosmetics_v1';

export class HarpGarageEngine {
  private timbers: Map<TimberFinishId, CosmeticItem<TimberFinishId>> = new Map();
  private rosettes: Map<SoundboardRosetteId, CosmeticItem<SoundboardRosetteId>> = new Map();
  private strings: Map<ResonanceStringShaderId, CosmeticItem<ResonanceStringShaderId>> = new Map();

  private equippedTimber: TimberFinishId = 'curly_maple';
  private equippedRosette: SoundboardRosetteId = 'triskele_tara';
  private equippedStrings: ResonanceStringShaderId = 'solar_flare_brass';

  constructor() {
    this.initializeCosmeticCatalog();
    this.loadPersistence();
  }

  private initializeCosmeticCatalog(): void {
    // 1. TIMBERS & FINISHES
    const timberList: CosmeticItem<TimberFinishId>[] = [
      {
        id: 'curly_maple',
        name: 'Fiddleback Curly Maple',
        category: 'TIMBER',
        lore: 'Harvested from flamed European mountain maples with bright acoustic projection.',
        unlockRequirement: 'Starter finish · Default Celtic tone',
        isUnlocked: true,
        shardCost: 0,
        colorHex: '#d4a872',
        roughness: 0.30,
        metalness: 0.05,
      },
      {
        id: 'claddagh_walnut',
        name: 'Dark Cherry Walnut',
        category: 'TIMBER',
        lore: 'Velvety dark cherry walnut with rich warm resonance and singing sustain.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 300,
        colorHex: '#4a1e1b',
        roughness: 0.32,
        metalness: 0.04,
      },
      {
        id: 'connemara_bogoak',
        name: 'Connemara Peat Bog Oak',
        category: 'TIMBER',
        lore: 'Ancient 5000-year-old Irish bog oak fossilized into deep charcoal timber.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 550,
        colorHex: '#222226',
        roughness: 0.55,
        metalness: 0.02,
      },
      {
        id: 'emerald_ebony',
        name: 'Emerald Moss Ebony',
        category: 'TIMBER',
        lore: 'Jet black African ebony aged in peat with luminescent green mineral veins.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 800,
        colorHex: '#14281e',
        roughness: 0.20,
        metalness: 0.10,
      },
      {
        id: 'skye_yew',
        name: 'Royal Isle of Skye Yew',
        category: 'TIMBER',
        lore: 'Sacred bardic timber of the Hebrides with glowing copper-amber heartwood.',
        unlockRequirement: 'Grand Master Luthier Tier',
        isUnlocked: false,
        shardCost: 1100,
        colorHex: '#b45309',
        roughness: 0.24,
        metalness: 0.08,
      },
    ];
    timberList.forEach((t) => this.timbers.set(t.id, t));

    // 2. ROSETTES (SOUNDBOARD CARVINGS)
    const rosetteList: CosmeticItem<SoundboardRosetteId>[] = [
      {
        id: 'triskele_tara',
        name: 'Triskele of Tara',
        category: 'ROSETTE',
        lore: 'Triple spiral Celtic motif in polished brass symbolizing earth, sea, and sky.',
        unlockRequirement: 'Starter rosette · Default inlay',
        isUnlocked: true,
        shardCost: 0,
        colorHex: '#d4af37',
        roughness: 0.2,
        metalness: 0.9,
      },
      {
        id: 'knotwork_vine',
        name: 'Knotwork Vine Carving',
        category: 'ROSETTE',
        lore: 'Continuous woven knotwork band carved into the soundboard perimeter.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 250,
        colorHex: '#c59b27',
        roughness: 0.3,
        metalness: 0.8,
      },
      {
        id: 'claddagh_heart',
        name: 'Claddagh Heart & Crown',
        category: 'ROSETTE',
        lore: 'Hands embracing crowned heart symbolizing friendship, loyalty, and love of song.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 450,
        colorHex: '#e5c07b',
        roughness: 0.25,
        metalness: 0.85,
      },
      {
        id: 'ogham_whisper',
        name: 'Ogham Tree Runes',
        category: 'ROSETTE',
        lore: 'Silver inlaid Ogham alphabet runes whispering ancient bardic tree secrets.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 700,
        colorHex: '#e2e8f0',
        roughness: 0.18,
        metalness: 0.95,
      },
      {
        id: 'high_king_sunburst',
        name: 'High King Sunburst',
        category: 'ROSETTE',
        lore: 'Pure gold leaf rays radiating outward from the central soundboard eye.',
        unlockRequirement: 'Grand Master Luthier Tier',
        isUnlocked: false,
        shardCost: 1000,
        colorHex: '#ffd700',
        roughness: 0.12,
        metalness: 0.98,
      },
    ];
    rosetteList.forEach((r) => this.rosettes.set(r.id, r));

    // 3. RESONANCE STRINGS / LED ILLUMINATION
    const stringList: CosmeticItem<ResonanceStringShaderId>[] = [
      {
        id: 'solar_flare_brass',
        name: 'Solar Flare Brass',
        category: 'STRINGS',
        lore: 'Warm golden standing wave reflection mirroring glowing embers in the sanctuary.',
        unlockRequirement: 'Starter strings · Default acoustic luminescence',
        isUnlocked: true,
        shardCost: 0,
        colorHex: '#ffaa44',
        roughness: 0.3,
        metalness: 0.8,
      },
      {
        id: 'silver_shimmer',
        name: 'Ancient Silver Shimmer',
        category: 'STRINGS',
        lore: 'Cool platinum string sheen illuminating with crisp brilliant clarity on plucks.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 250,
        colorHex: '#e2e8f0',
        roughness: 0.15,
        metalness: 0.95,
      },
      {
        id: 'druidic_emerald',
        name: 'Druidic Bio Emerald',
        category: 'STRINGS',
        lore: 'Bioluminescent green phosphor threads glowing vividly on string contact.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 450,
        colorHex: '#10b981',
        roughness: 0.2,
        metalness: 0.7,
      },
      {
        id: 'aurora_wave',
        name: 'Aurora Borealis Wave',
        category: 'STRINGS',
        lore: 'Electric neon cyan LED illumination tracing each vibrating string waveform.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 750,
        colorHex: '#38bdf8',
        roughness: 0.1,
        metalness: 0.85,
      },
      {
        id: 'starlight_phosphor',
        name: 'Starlight Phosphor Violet',
        category: 'STRINGS',
        lore: 'Ethereal celestial violet pulses that light up on mystery note resolutions.',
        unlockRequirement: 'Grand Master Luthier Tier',
        isUnlocked: false,
        shardCost: 1050,
        colorHex: '#c084fc',
        roughness: 0.1,
        metalness: 0.9,
      },
    ];
    stringList.forEach((s) => this.strings.set(s.id, s));
  }

  private loadPersistence(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const unlockedData = localStorage.getItem(STORAGE_KEY_UNLOCKED);
        if (unlockedData) {
          const unlockedIds: string[] = JSON.parse(unlockedData);
          unlockedIds.forEach((id) => {
            if (this.timbers.has(id as TimberFinishId)) this.timbers.get(id as TimberFinishId)!.isUnlocked = true;
            if (this.rosettes.has(id as SoundboardRosetteId)) this.rosettes.get(id as SoundboardRosetteId)!.isUnlocked = true;
            if (this.strings.has(id as ResonanceStringShaderId)) this.strings.get(id as ResonanceStringShaderId)!.isUnlocked = true;
          });
        }

        const equippedData = localStorage.getItem(STORAGE_KEY_EQUIPPED);
        if (equippedData) {
          const eq = JSON.parse(equippedData);
          if (eq.timber && this.timbers.has(eq.timber)) this.equippedTimber = eq.timber;
          if (eq.rosette && this.rosettes.has(eq.rosette)) this.equippedRosette = eq.rosette;
          if (eq.strings && this.strings.has(eq.strings)) this.equippedStrings = eq.strings;
        }
      }
    } catch {}
  }

  private savePersistence(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const unlockedIds: string[] = [];
        this.timbers.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        this.rosettes.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        this.strings.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(unlockedIds));

        localStorage.setItem(
          STORAGE_KEY_EQUIPPED,
          JSON.stringify({
            timber: this.equippedTimber,
            rosette: this.equippedRosette,
            strings: this.equippedStrings,
          })
        );
      }
    } catch {}
  }

  public getTimbers(): CosmeticItem<TimberFinishId>[] {
    return Array.from(this.timbers.values());
  }

  public getRosettes(): CosmeticItem<SoundboardRosetteId>[] {
    return Array.from(this.rosettes.values());
  }

  public getStrings(): CosmeticItem<ResonanceStringShaderId>[] {
    return Array.from(this.strings.values());
  }

  public getEquipped(): {
    timber: CosmeticItem<TimberFinishId>;
    rosette: CosmeticItem<SoundboardRosetteId>;
    strings: CosmeticItem<ResonanceStringShaderId>;
  } {
    return {
      timber: this.timbers.get(this.equippedTimber) || this.timbers.get('curly_maple')!,
      rosette: this.rosettes.get(this.equippedRosette) || this.rosettes.get('triskele_tara')!,
      strings: this.strings.get(this.equippedStrings) || this.strings.get('solar_flare_brass')!,
    };
  }

  public equipTimber(id: TimberFinishId): boolean {
    const item = this.timbers.get(id);
    if (item && item.isUnlocked) {
      this.equippedTimber = id;
      this.savePersistence();
      return true;
    }
    return false;
  }

  public equipRosette(id: SoundboardRosetteId): boolean {
    const item = this.rosettes.get(id);
    if (item && item.isUnlocked) {
      this.equippedRosette = id;
      this.savePersistence();
      return true;
    }
    return false;
  }

  public equipStrings(id: ResonanceStringShaderId): boolean {
    const item = this.strings.get(id);
    if (item && item.isUnlocked) {
      this.equippedStrings = id;
      this.savePersistence();
      return true;
    }
    return false;
  }

  public buyWithShards(
    category: 'TIMBER' | 'ROSETTE' | 'STRINGS',
    id: string
  ): { success: boolean; message: string; colorHex?: string } {
    const db = UserAccountDatabase.getInstance();
    let item: CosmeticItem<any> | undefined;

    if (category === 'TIMBER') item = this.timbers.get(id as TimberFinishId);
    else if (category === 'ROSETTE') item = this.rosettes.get(id as SoundboardRosetteId);
    else if (category === 'STRINGS') item = this.strings.get(id as ResonanceStringShaderId);

    if (!item) return { success: false, message: 'Item not found in catalog.' };
    if (item.isUnlocked) {
      // Already unlocked, equip it!
      if (category === 'TIMBER') this.equipTimber(id as TimberFinishId);
      else if (category === 'ROSETTE') this.equipRosette(id as SoundboardRosetteId);
      else if (category === 'STRINGS') this.equipStrings(id as ResonanceStringShaderId);
      return { success: true, message: `${item.name} fitted to your harp!`, colorHex: item.colorHex };
    }

    const cost = item.shardCost || 0;
    const currentShards = db.getShards();

    if (currentShards < cost) {
      return {
        success: false,
        message: `Requires ${cost} Shards. You currently have ${currentShards} Shards (${cost - currentShards} more needed).`,
      };
    }

    const spent = db.spendShards(cost);
    if (!spent) return { success: false, message: 'Could not deduct shards.' };

    item.isUnlocked = true;
    if (category === 'TIMBER') this.equipTimber(id as TimberFinishId);
    else if (category === 'ROSETTE') this.equipRosette(id as SoundboardRosetteId);
    else if (category === 'STRINGS') this.equipStrings(id as ResonanceStringShaderId);

    this.savePersistence();
    return {
      success: true,
      message: `Unlocked and fitted ${item.name} for ${cost} Shards!`,
      colorHex: item.colorHex,
    };
  }

  public unlockItem(category: 'TIMBER' | 'ROSETTE' | 'STRINGS', id: string): boolean {
    let item: CosmeticItem<any> | undefined;
    if (category === 'TIMBER') item = this.timbers.get(id as TimberFinishId);
    else if (category === 'ROSETTE') item = this.rosettes.get(id as SoundboardRosetteId);
    else if (category === 'STRINGS') item = this.strings.get(id as ResonanceStringShaderId);
    if (!item) return false;
    item.isUnlocked = true;
    this.savePersistence();
    return true;
  }
}
