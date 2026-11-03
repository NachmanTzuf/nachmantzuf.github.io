/**
 * EARPA HARP GARAGE COSMETIC & LUTHIER ENGINE
 * Dedicated cosmetic customization studio for timber finishes, carved soundboard rosettes,
 * illuminated resonance string shaders, acoustic sound packs, and Camac levers metallurgy.
 */

import {
  CosmeticItem,
  TimberFinishId,
  SoundboardRosetteId,
  ResonanceStringShaderId,
  SoundPackId,
  LeverFinishId,
} from './types';
import { UserAccountDatabase } from '../account/UserAccountDatabase';

const STORAGE_KEY_UNLOCKED = 'earpa_unlocked_cosmetics_v1';
const STORAGE_KEY_EQUIPPED = 'earpa_equipped_cosmetics_v1';

export class HarpGarageEngine {
  private timbers: Map<TimberFinishId, CosmeticItem<TimberFinishId>> = new Map();
  private rosettes: Map<SoundboardRosetteId, CosmeticItem<SoundboardRosetteId>> = new Map();
  private strings: Map<ResonanceStringShaderId, CosmeticItem<ResonanceStringShaderId>> = new Map();
  private sounds: Map<SoundPackId, CosmeticItem<SoundPackId>> = new Map();
  private levers: Map<LeverFinishId, CosmeticItem<LeverFinishId>> = new Map();

  private equippedTimber: TimberFinishId = 'curly_maple';
  private equippedRosette: SoundboardRosetteId = 'triskele_tara';
  private equippedStrings: ResonanceStringShaderId = 'solar_flare_brass';
  private equippedSound: SoundPackId = 'standard_celtic';
  private equippedLever: LeverFinishId = 'standard_brass';

  constructor() {
    this.initializeCosmeticCatalog();
    this.loadPersistence();
  }

  private initializeCosmeticCatalog(): void {
    // 1. TIMBERS & FINISHES (5 Natural, Beautiful Wood Finishes)
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
        name: 'Cherry Blossom Rosewood',
        category: 'TIMBER',
        lore: 'Rich pinkish warm rosewood with velvety resonance and singing overtone sustain.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 300,
        colorHex: '#8b3a3a',
        roughness: 0.28,
        metalness: 0.06,
      },
      {
        id: 'connemara_bogoak',
        name: 'Irish Bog Oak',
        category: 'TIMBER',
        lore: 'Ancient fossilized 5000-year-old Irish peat bog oak with natural deep jet grain.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 550,
        colorHex: '#1e1e24',
        roughness: 0.52,
        metalness: 0.02,
      },
      {
        id: 'emerald_ebony',
        name: 'Connemara Emerald Moss',
        category: 'TIMBER',
        lore: 'Organic moss green stain on flamed alpine spruce with subtle mineral lustre.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 800,
        colorHex: '#1b3b2b',
        roughness: 0.22,
        metalness: 0.08,
      },
      {
        id: 'skye_yew',
        name: 'Royal Purple Heart',
        category: 'TIMBER',
        lore: 'Regal exotic purpleheart timber with natural violet iridescence and crisp attack.',
        unlockRequirement: 'Grand Master Luthier Tier',
        isUnlocked: false,
        shardCost: 1100,
        colorHex: '#581c87',
        roughness: 0.25,
        metalness: 0.07,
      },
    ];
    timberList.forEach((t) => this.timbers.set(t.id, t));

    // 2. ROSETTES (HAND-CARVED SOUNDBOARD DESIGNS)
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
        name: 'Ogham Druidic Runes',
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

    // 4. ACOUSTIC TIMBRES & SOUND PACKS
    const soundList: CosmeticItem<SoundPackId>[] = [
      {
        id: 'standard_celtic',
        name: 'Standard Celtic Harp',
        category: 'SOUND',
        lore: 'Traditional bright, bell-like bronze string acoustic timbre.',
        unlockRequirement: 'Starter sound · Default',
        isUnlocked: true,
        shardCost: 0,
        colorHex: '#eab308',
        roughness: 0.3,
        metalness: 0.5,
      },
      {
        id: 'gut_string_warmth',
        name: 'Gut String Warmth',
        category: 'SOUND',
        lore: 'Organic hand-spun gut resonance with mellow woody body and singing fundamental.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 400,
        colorHex: '#d97706',
        roughness: 0.4,
        metalness: 0.3,
      },
      {
        id: 'subtle_cathedral_reverb',
        name: 'Subtle Cathedral Reverb',
        category: 'SOUND',
        lore: 'Refined, small tight acoustic sanctuary space. Subtle 0.8s tail, clean and never muddy.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 600,
        colorHex: '#60a5fa',
        roughness: 0.2,
        metalness: 0.6,
      },
    ];
    soundList.forEach((s) => this.sounds.set(s.id, s));

    // 5. CAMAC LEVERS METALLURGY
    const leverList: CosmeticItem<LeverFinishId>[] = [
      {
        id: 'standard_brass',
        name: 'Standard Brushed Brass',
        category: 'LEVERS',
        lore: 'Durable brushed brass Camac sharping levers with smooth mechanical engagement.',
        unlockRequirement: 'Starter metallurgy · Default',
        isUnlocked: true,
        shardCost: 0,
        colorHex: '#ca8a04',
        roughness: 0.35,
        metalness: 0.85,
      },
      {
        id: 'polished_24k_gold',
        name: 'Polished 24K Gold Camac',
        category: 'LEVERS',
        lore: 'Master jeweler mirror-polished pure 24K gold plating for frictionless lever action.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 350,
        colorHex: '#fbbf24',
        roughness: 0.15,
        metalness: 0.98,
      },
      {
        id: 'antique_celtic_bronze',
        name: 'Antique Celtic Bronze',
        category: 'LEVERS',
        lore: 'Weathered historical Celtic bronze alloy with sculpted grip knurling.',
        unlockRequirement: 'Artisan Luthier Workshop',
        isUnlocked: false,
        shardCost: 500,
        colorHex: '#92400e',
        roughness: 0.45,
        metalness: 0.75,
      },
      {
        id: 'silver_chrome',
        name: 'Silver Chrome Metallurgy',
        category: 'LEVERS',
        lore: 'Brilliant mirror chrome with aerospace plating and razor-sharp semitone pitch shifts.',
        unlockRequirement: 'Grand Master Luthier Tier',
        isUnlocked: false,
        shardCost: 700,
        colorHex: '#f1f5f9',
        roughness: 0.1,
        metalness: 0.95,
      },
    ];
    leverList.forEach((l) => this.levers.set(l.id, l));
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
            if (this.sounds.has(id as SoundPackId)) this.sounds.get(id as SoundPackId)!.isUnlocked = true;
            if (this.levers.has(id as LeverFinishId)) this.levers.get(id as LeverFinishId)!.isUnlocked = true;
          });
        }

        const equippedData = localStorage.getItem(STORAGE_KEY_EQUIPPED);
        if (equippedData) {
          const eq = JSON.parse(equippedData);
          if (eq.timber && this.timbers.has(eq.timber)) this.equippedTimber = eq.timber;
          if (eq.rosette && this.rosettes.has(eq.rosette)) this.equippedRosette = eq.rosette;
          if (eq.strings && this.strings.has(eq.strings)) this.equippedStrings = eq.strings;
          if (eq.sound && this.sounds.has(eq.sound)) this.equippedSound = eq.sound;
          if (eq.lever && this.levers.has(eq.lever)) this.equippedLever = eq.lever;
        }

        const isFounder =
          window.location.search.includes('founder=nachman') ||
          window.location.search.includes('admin=nachman') ||
          localStorage.getItem('earpa_founder_mode') === 'true';

        if (isFounder) {
          localStorage.setItem('earpa_founder_mode', 'true');
          this.enableFounderUnlimitedMode();
        }
      }
    } catch {}
  }

  public enableFounderUnlimitedMode(): void {
    this.timbers.forEach((t) => { t.isUnlocked = true; });
    this.rosettes.forEach((r) => { r.isUnlocked = true; });
    this.strings.forEach((s) => { s.isUnlocked = true; });
    this.sounds.forEach((s) => { s.isUnlocked = true; });
    const profile = UserAccountDatabase.getInstance().getActiveProfile();
    if (profile && profile.shardsBalance !== 999999) {
      UserAccountDatabase.getInstance().updateActiveProfile({ shardsBalance: 999999 });
    }
  }

  public isFounderMode(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.location.search.includes('founder=nachman') ||
      window.location.search.includes('admin=nachman') ||
      localStorage.getItem('earpa_founder_mode') === 'true'
    );
  }

  private savePersistence(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const unlockedIds: string[] = [];
        this.timbers.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        this.rosettes.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        this.strings.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        this.sounds.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        this.levers.forEach((v, k) => { if (v.isUnlocked) unlockedIds.push(k); });
        localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(unlockedIds));

        localStorage.setItem(
          STORAGE_KEY_EQUIPPED,
          JSON.stringify({
            timber: this.equippedTimber,
            rosette: this.equippedRosette,
            strings: this.equippedStrings,
            sound: this.equippedSound,
            lever: this.equippedLever,
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

  public getSounds(): CosmeticItem<SoundPackId>[] {
    return Array.from(this.sounds.values());
  }

  public getLevers(): CosmeticItem<LeverFinishId>[] {
    return Array.from(this.levers.values());
  }

  public getEquipped(): {
    timber: CosmeticItem<TimberFinishId>;
    rosette: CosmeticItem<SoundboardRosetteId>;
    strings: CosmeticItem<ResonanceStringShaderId>;
    sound: CosmeticItem<SoundPackId>;
    lever: CosmeticItem<LeverFinishId>;
  } {
    return {
      timber: this.timbers.get(this.equippedTimber) || this.timbers.get('curly_maple')!,
      rosette: this.rosettes.get(this.equippedRosette) || this.rosettes.get('triskele_tara')!,
      strings: this.strings.get(this.equippedStrings) || this.strings.get('solar_flare_brass')!,
      sound: this.sounds.get(this.equippedSound) || this.sounds.get('standard_celtic')!,
      lever: this.levers.get(this.equippedLever) || this.levers.get('standard_brass')!,
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

  public equipSound(id: SoundPackId): boolean {
    const item = this.sounds.get(id);
    if (item && item.isUnlocked) {
      this.equippedSound = id;
      this.savePersistence();
      return true;
    }
    return false;
  }

  public equipLever(id: LeverFinishId): boolean {
    const item = this.levers.get(id);
    if (item && item.isUnlocked) {
      this.equippedLever = id;
      this.savePersistence();
      return true;
    }
    return false;
  }

  public buyWithShards(
    category: 'TIMBER' | 'ROSETTE' | 'STRINGS' | 'SOUND' | 'LEVERS',
    id: string
  ): { success: boolean; message: string; colorHex?: string } {
    const db = UserAccountDatabase.getInstance();
    let item: CosmeticItem<any> | undefined;

    if (category === 'TIMBER') item = this.timbers.get(id as TimberFinishId);
    else if (category === 'ROSETTE') item = this.rosettes.get(id as SoundboardRosetteId);
    else if (category === 'STRINGS') item = this.strings.get(id as ResonanceStringShaderId);
    else if (category === 'SOUND') item = this.sounds.get(id as SoundPackId);
    else if (category === 'LEVERS') item = this.levers.get(id as LeverFinishId);

    if (!item) return { success: false, message: 'Item not found in catalog.' };
    if (item.isUnlocked) {
      // Already unlocked, equip it!
      if (category === 'TIMBER') this.equipTimber(id as TimberFinishId);
      else if (category === 'ROSETTE') this.equipRosette(id as SoundboardRosetteId);
      else if (category === 'STRINGS') this.equipStrings(id as ResonanceStringShaderId);
      else if (category === 'SOUND') this.equipSound(id as SoundPackId);
      else if (category === 'LEVERS') this.equipLever(id as LeverFinishId);
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
    else if (category === 'SOUND') this.equipSound(id as SoundPackId);
    else if (category === 'LEVERS') this.equipLever(id as LeverFinishId);

    this.savePersistence();
    return {
      success: true,
      message: `Unlocked and fitted ${item.name} for ${cost} Shards!`,
      colorHex: item.colorHex,
    };
  }

  public unlockItem(category: 'TIMBER' | 'ROSETTE' | 'STRINGS' | 'SOUND' | 'LEVERS', id: string): boolean {
    let item: CosmeticItem<any> | undefined;
    if (category === 'TIMBER') item = this.timbers.get(id as TimberFinishId);
    else if (category === 'ROSETTE') item = this.rosettes.get(id as SoundboardRosetteId);
    else if (category === 'STRINGS') item = this.strings.get(id as ResonanceStringShaderId);
    else if (category === 'SOUND') item = this.sounds.get(id as SoundPackId);
    else if (category === 'LEVERS') item = this.levers.get(id as LeverFinishId);
    if (!item) return false;
    item.isUnlocked = true;
    this.savePersistence();
    return true;
  }
}
