/**
 * EARPA HARP GARAGE COSMETIC ENGINE
 * Manages 5 timber finishes, 5 carved rosettes, and 5 resonance string shaders
 * with unlock milestone checks and real-time PBR material updates for the 3D Celtic harp.
 */

import {
  CosmeticItem,
  TimberFinishId,
  SoundboardRosetteId,
  ResonanceStringShaderId,
} from './types';

export class HarpGarageEngine {
  private timbers: Map<TimberFinishId, CosmeticItem<TimberFinishId>> = new Map();
  private rosettes: Map<SoundboardRosetteId, CosmeticItem<SoundboardRosetteId>> = new Map();
  private strings: Map<ResonanceStringShaderId, CosmeticItem<ResonanceStringShaderId>> = new Map();

  private equippedTimber: TimberFinishId = 'curly_maple';
  private equippedRosette: SoundboardRosetteId = 'triskele_tara';
  private equippedStrings: ResonanceStringShaderId = 'solar_flare_brass';

  constructor() {
    this.initializeCosmeticCatalog();
  }

  private initializeCosmeticCatalog(): void {
    // 1. TIMBERS
    const timberList: CosmeticItem<TimberFinishId>[] = [
      {
        id: 'curly_maple',
        name: 'Fiddleback Curly Maple',
        category: 'TIMBER',
        lore: 'Harvested from flamed European mountain maples with bright acoustic projection.',
        unlockRequirement: 'Starter finish: available from the beginning',
        isUnlocked: true,
        colorHex: '#e6b366',
        roughness: 0.22,
        metalness: 0.05,
      },
      {
        id: 'claddagh_walnut',
        name: 'Deep Claddagh Walnut',
        category: 'TIMBER',
        lore: 'Velvety dark black walnut with rich chocolate undertones and warm sustain.',
        unlockRequirement: 'Complete Stage 2 Diatonic Octave Checkpoint',
        isUnlocked: false,
        colorHex: '#382013',
        roughness: 0.38,
        metalness: 0.02,
      },
      {
        id: 'emerald_ebony',
        name: 'Emerald Moss Ebony',
        category: 'TIMBER',
        lore: 'Jet black African ebony aged in peat bogs with luminescent mineral veins.',
        unlockRequirement: 'Complete Stage 4 Chromatic Shadows Checkpoint',
        isUnlocked: false,
        colorHex: '#121214',
        roughness: 0.15,
        metalness: 0.1,
      },
      {
        id: 'connemara_bogoak',
        name: 'Connemara Bog Oak',
        category: 'TIMBER',
        lore: 'Ancient 5000 year old Irish bog oak fossilized into carbon charcoal timber.',
        unlockRequirement: 'Achieve a 14 day practice streak and 15 three star nodes',
        isUnlocked: false,
        colorHex: '#1a1a1a',
        roughness: 0.65,
        metalness: 0.0,
      },
      {
        id: 'skye_yew',
        name: 'Isle of Skye Yew',
        category: 'TIMBER',
        lore: 'Sacred bardic timber of the Hebrides with glowing copper orange heartwood.',
        unlockRequirement: 'Unlock 15 Hub Tag mastery badges',
        isUnlocked: false,
        colorHex: '#b85d19',
        roughness: 0.28,
        metalness: 0.05,
      },
    ];

    timberList.forEach((t) => this.timbers.set(t.id, t));

    // 2. ROSETTES
    const rosetteList: CosmeticItem<SoundboardRosetteId>[] = [
      {
        id: 'triskele_tara',
        name: 'Triskele of Tara',
        category: 'ROSETTE',
        lore: 'Triple spiral Celtic motif in polished brass symbolizing earth, water, and sky.',
        unlockRequirement: 'Starter rosette: available from the beginning',
        isUnlocked: true,
        colorHex: '#d4af37',
        roughness: 0.2,
        metalness: 0.9,
      },
      {
        id: 'knotwork_vine',
        name: 'Knotwork Vine',
        category: 'ROSETTE',
        lore: 'Continuous woven knotwork band carved into the soundboard perimeter.',
        unlockRequirement: 'Clear Stage 1 Bardic Gate at 90% precision',
        isUnlocked: false,
        colorHex: '#c59b27',
        roughness: 0.3,
        metalness: 0.8,
      },
      {
        id: 'claddagh_heart',
        name: 'Claddagh Heart and Crown',
        category: 'ROSETTE',
        lore: 'Hands embracing crowned heart symbolizing friendship, loyalty, and love of song.',
        unlockRequirement: 'Clear Stage 3 Multi Octave Gate',
        isUnlocked: false,
        colorHex: '#e5c07b',
        roughness: 0.25,
        metalness: 0.85,
      },
      {
        id: 'ogham_whisper',
        name: 'Ogham Tree Runes',
        category: 'ROSETTE',
        lore: 'Silver inlaid Ogham alphabet runes whispering ancient tree names.',
        unlockRequirement: 'Unlock 10 Hub Tag mastery badges',
        isUnlocked: false,
        colorHex: '#e2e8f0',
        roughness: 0.18,
        metalness: 0.95,
      },
      {
        id: 'high_king_sunburst',
        name: 'High King Sunburst',
        category: 'ROSETTE',
        lore: 'Pure gold leaf rays radiating outward from the central soundhole.',
        unlockRequirement: 'Achieve the Grand Bard of Tara title',
        isUnlocked: false,
        colorHex: '#ffd700',
        roughness: 0.12,
        metalness: 0.98,
      },
    ];

    rosetteList.forEach((r) => this.rosettes.set(r.id, r));

    // 3. STRINGS
    const stringList: CosmeticItem<ResonanceStringShaderId>[] = [
      {
        id: 'solar_flare_brass',
        name: 'Solar Flare Brass',
        category: 'STRINGS',
        lore: 'Warm golden standing wave reflection mirroring candlelight in the sanctuary.',
        unlockRequirement: 'Starter strings: available from the beginning',
        isUnlocked: true,
        colorHex: '#d4af37',
        roughness: 0.3,
        metalness: 0.8,
      },
      {
        id: 'silver_shimmer',
        name: 'Ancient Silver Shimmer',
        category: 'STRINGS',
        lore: 'Cool platinum string sheen illuminating during rapid reflex plucks.',
        unlockRequirement: 'Perform 25 correct plucks under 600 milliseconds',
        isUnlocked: false,
        colorHex: '#cbd5e1',
        roughness: 0.15,
        metalness: 0.95,
      },
      {
        id: 'druidic_emerald',
        name: 'Druidic Bio Emerald',
        category: 'STRINGS',
        lore: 'Bioluminescent green phosphor threads glowing on fundamental resonance.',
        unlockRequirement: 'Clear Stage 3 Bardic Gate',
        isUnlocked: false,
        colorHex: '#10b981',
        roughness: 0.2,
        metalness: 0.7,
      },
      {
        id: 'aurora_wave',
        name: 'Aurora Borealis Wave',
        category: 'STRINGS',
        lore: 'Shifting teal and violet interference patterns along vibrating strings.',
        unlockRequirement: 'Achieve a 20 note uninterrupted streak',
        isUnlocked: false,
        colorHex: '#38bdf8',
        roughness: 0.1,
        metalness: 0.85,
      },
      {
        id: 'starlight_phosphor',
        name: 'Starlight Phosphor',
        category: 'STRINGS',
        lore: 'Ethereal starlight violet pulses when landing on tonic resolutions.',
        unlockRequirement: 'Attain the Grand Bard of Tara title',
        isUnlocked: false,
        colorHex: '#a855f7',
        roughness: 0.1,
        metalness: 0.9,
      },
    ];

    stringList.forEach((s) => this.strings.set(s.id, s));
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
      timber: this.timbers.get(this.equippedTimber)!,
      rosette: this.rosettes.get(this.equippedRosette)!,
      strings: this.strings.get(this.equippedStrings)!,
    };
  }

  public equipTimber(id: TimberFinishId): boolean {
    const item = this.timbers.get(id);
    if (item && item.isUnlocked) {
      this.equippedTimber = id;
      return true;
    }
    return false;
  }

  public equipRosette(id: SoundboardRosetteId): boolean {
    const item = this.rosettes.get(id);
    if (item && item.isUnlocked) {
      this.equippedRosette = id;
      return true;
    }
    return false;
  }

  public equipStrings(id: ResonanceStringShaderId): boolean {
    const item = this.strings.get(id);
    if (item && item.isUnlocked) {
      this.equippedStrings = id;
      return true;
    }
    return false;
  }

  public unlockItem(category: 'TIMBER' | 'ROSETTE' | 'STRINGS', id: string): boolean {
    if (category === 'TIMBER') {
      const item = this.timbers.get(id as TimberFinishId);
      if (item) { item.isUnlocked = true; return true; }
    } else if (category === 'ROSETTE') {
      const item = this.rosettes.get(id as SoundboardRosetteId);
      if (item) { item.isUnlocked = true; return true; }
    } else if (category === 'STRINGS') {
      const item = this.strings.get(id as ResonanceStringShaderId);
      if (item) { item.isUnlocked = true; return true; }
    }
    return false;
  }
}
