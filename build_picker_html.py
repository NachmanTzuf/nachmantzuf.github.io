import os

HTML_PATH = r"C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\celtic_icon_picker.html"
SVG_DIR = r"C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\assets\svg"

CATEGORIES = [
    {
        "id": "close",
        "title": "1. Trail Map Close Button",
        "current": "Generic round white X (ⓧ)",
        "options": [
            {
                "id": "close_brigid_cross",
                "name": "Saint Brigid's Cross Saltire",
                "lore": "Woven river reed cross traditionally hung over doorways to protect the household from fire and harm. Perfect organic Celtic X.",
                "svg_file": "close_brigid_cross.svg"
            },
            {
                "id": "close_dara_knot",
                "name": "Celtic Dara Knot Saltire",
                "lore": "Sacred Oak root interlace (Dara from 'Doire'). Unbroken interwoven lines forming an ancient organic X.",
                "svg_file": "close_dara_knot.svg"
            },
            {
                "id": "close_crossed_rowan",
                "name": "Crossed Rowan Twigs",
                "lore": "Sacred protective ash/rowan boughs bound with spiral leather twine and accented with bright red rowan berries.",
                "svg_file": "close_crossed_rowan.svg"
            }
        ]
    },
    {
        "id": "currency",
        "title": "2. Shards / Primary Currency",
        "current": "Modern blue faceted diamond gem (💎)",
        "options": [
            {
                "id": "currency_gold_torc",
                "name": "Broighter Gold Torc",
                "lore": "Masterpiece of Celtic La Tène goldsmithing found near Lough Foyle. Symbol of royal prestige and sacred acoustic wealth.",
                "svg_file": "currency_gold_torc.svg"
            },
            {
                "id": "currency_gold_lunula",
                "name": "Celtic Gold Lunula",
                "lore": "Early Bronze Age crescent hammered gold collar discovered across Irish bogs, incised with delicate geometric chevrons.",
                "svg_file": "currency_gold_lunula.svg"
            },
            {
                "id": "currency_ogham_stone",
                "name": "Ogham Slate Inscription Shard",
                "lore": "Faceted river slate talisman with vertical stem line and glowing Ogham notches marking bardic secret language.",
                "svg_file": "currency_ogham_stone.svg"
            }
        ]
    },
    {
        "id": "streak",
        "title": "3. Daily Streak Counter",
        "current": "Standard orange fire emoji (🔥)",
        "options": [
            {
                "id": "streak_brigid_flame",
                "name": "Saint Brigid Sacred Hearth Flame",
                "lore": "Perpetual sacred fire tended in Kildare, burning inside an ancient carved stone basin with gold Celtic knotwork.",
                "svg_file": "streak_brigid_flame.svg"
            },
            {
                "id": "streak_taranis_wheel",
                "name": "Taranis Solar Fire Wheel",
                "lore": "Celtic solar wheel with six glowing flame spokes celebrating unbroken daily solar journeys across the sky.",
                "svg_file": "streak_taranis_wheel.svg"
            },
            {
                "id": "streak_triquetra_fire",
                "name": "Triquetra Fire Knot",
                "lore": "Continuous three-lobed trinity knot formed from licking gold and crimson flames, embodying persistent practice.",
                "svg_file": "streak_triquetra_fire.svg"
            }
        ]
    },
    {
        "id": "monument",
        "title": "4. Stage 1 Milestone Monument",
        "current": "Greco-Roman classical pillared temple (🏛️)",
        "options": [
            {
                "id": "monument_glendalough",
                "name": "Glendalough Round Stone Tower",
                "lore": "Iconic tapered medieval Irish stone tower with high arched portal and conical slate cap, rising above misty valleys.",
                "svg_file": "monument_glendalough.svg"
            },
            {
                "id": "monument_poulnabrone",
                "name": "Poulnabrone Megalithic Dolmen",
                "lore": "Massive 5,800-year-old limestone table capstone poised upon vertical portal slabs in the Burren highland karst.",
                "svg_file": "monument_poulnabrone.svg"
            },
            {
                "id": "monument_newgrange",
                "name": "Newgrange Megalithic Passage Cairn",
                "lore": "Ancient Stone Age temple mound with white quartz facade, carved triple-spiral kerbstone, and winter solstice roofbox.",
                "svg_file": "monument_newgrange.svg"
            }
        ]
    },
    {
        "id": "stars",
        "title": "5. Waypoint Mastery Stars",
        "current": "Generic five-pointed yellow stars (⭐)",
        "options": [
            {
                "id": "stars_shamrock",
                "name": "Emerald Irish Shamrock",
                "lore": "Heart-shaped wood sorrel leaflets with luminous gold veins, lighting up progressively as the player earns mastery.",
                "svg_file": "stars_shamrock.svg"
            },
            {
                "id": "stars_triskele",
                "name": "Newgrange Triskele Spiral",
                "lore": "Dynamic triple spiral from Irish megaliths, symbolizing physical, intellectual, and acoustic mastery stages.",
                "svg_file": "stars_triskele.svg"
            },
            {
                "id": "stars_shield_knot",
                "name": "Quaternary Celtic Shield Knot",
                "lore": "Four-cornered continuous warding knot with central gold starpoint, conferring ancient sonic protection.",
                "svg_file": "stars_shield_knot.svg"
            }
        ]
    },
    {
        "id": "foliage",
        "title": "6. Roadmap Foliage & Decor",
        "current": "Green desert saguaro cactus (🌵)",
        "options": [
            {
                "id": "foliage_heather",
                "name": "Wild Connemara Purple Heather",
                "lore": "Hardy highland heather sprigs bursting with deep violet and bell blossoms along the winding mossy path.",
                "svg_file": "foliage_heather.svg"
            },
            {
                "id": "foliage_hawthorn",
                "name": "Sacred Fairy Hawthorn Tree",
                "lore": "Gnarled lone thorn tree with white spring blossoms and red prayer ribbons fluttering in the Atlantic breeze.",
                "svg_file": "foliage_hawthorn.svg"
            },
            {
                "id": "foliage_fern",
                "name": "Irish Highland Bracken Fern",
                "lore": "Unfurling emerald fiddlehead spiral with golden spores and delicate pinnate fronds rooted in dark peat soil.",
                "svg_file": "foliage_fern.svg"
            }
        ]
    },
    {
        "id": "nodes",
        "title": "7. Roadmap Level Nodes",
        "current": "Plain round wood discs with numbers 1, 2, 3, 4",
        "options": [
            {
                "id": "node_battersea_shield",
                "name": "Battersea Celtic Shield Boss",
                "lore": "Bronze warrior disc featuring swirling La Tène S-curves, raised repoussé rims, and deep red enamel insets.",
                "svg_file": "node_battersea_shield.svg"
            },
            {
                "id": "node_sun_disc",
                "name": "Celtic Gold Sun Disc",
                "lore": "Hammered sheet gold medallion with concentric repoussé beaded rings and solar cruciform embossing.",
                "svg_file": "node_sun_disc.svg"
            },
            {
                "id": "node_carved_ogham",
                "name": "Carved Ogham Milestone",
                "lore": "Smooth river granite waypoint stone with carved circular knotwork border and incised bardic Ogham degree notches.",
                "svg_file": "node_carved_ogham.svg"
            }
        ]
    },
    {
        "id": "lock",
        "title": "8. Roadmap Locked Stages",
        "current": "Standard modern brass padlock (🔒)",
        "options": [
            {
                "id": "lock_tara_brooch",
                "name": "Tara Penannular Brooch Clasp",
                "lore": "Eighth-century Celtic brooch with interlocking zoomorphic terminals held locked by a long swiveling bronze skewer.",
                "svg_file": "lock_tara_brooch.svg"
            },
            {
                "id": "lock_interlaced_iron",
                "name": "Interlaced Celtic Iron Lock",
                "lore": "Forged bog iron padlock with heavy entwined serpent knotwork shackle and engraved keyhole plate.",
                "svg_file": "lock_interlaced_iron.svg"
            },
            {
                "id": "lock_bound_stone",
                "name": "Bound Megalithic Rune Stone",
                "lore": "Weathered standing stone bound with riveted bronze straps and glowing red Triquetra wax seal.",
                "svg_file": "lock_bound_stone.svg"
            }
        ]
    },
    {
        "id": "avatar",
        "title": "9. Profile Avatar & Harper Badge",
        "current": "Cartoon folk banjo in blue circle (🪕)",
        "options": [
            {
                "id": "avatar_brian_boru",
                "name": "Trinity Brian Boru Harp",
                "lore": "The fourteenth-century Irish national emblem with curved willow forepillar, wire strings, and brass mountings.",
                "svg_file": "avatar_brian_boru.svg"
            },
            {
                "id": "avatar_bodhran",
                "name": "Traditional Irish Bodhrán",
                "lore": "Round goatskin frame drum with brass studs and dual-ended carved ashwood beater (cipín).",
                "svg_file": "avatar_bodhran.svg"
            },
            {
                "id": "avatar_crwth",
                "name": "Celtic Crwth Bowed Lyre",
                "lore": "Ancient Celtic box lyre with dual pillar arms, center fingerboard, and dual circular soundholes.",
                "svg_file": "avatar_crwth.svg"
            }
        ]
    },
    {
        "id": "home",
        "title": "10. Navigation: Home Tab",
        "current": "Modern suburban house outline (🏠)",
        "options": [
            {
                "id": "nav_crannog",
                "name": "Celtic Thatched Crannóg",
                "lore": "Timber lake roundhouse with golden conical reed thatch roof and smoke curling into the twilight sky.",
                "svg_file": "nav_crannog.svg"
            },
            {
                "id": "nav_beehive_hut",
                "name": "Skellig Michael Clochán",
                "lore": "Drystone beehive hut perched on sea cliffs, representing serene acoustic sanctuary and deep contemplation.",
                "svg_file": "nav_beehive_hut.svg"
            },
            {
                "id": "nav_stone_hearth",
                "name": "Ancestral Celtic Hearth",
                "lore": "Circular river boulder fire basin with glowing peat embers, the timeless center of storytelling and hospitality.",
                "svg_file": "nav_stone_hearth.svg"
            }
        ]
    },
    {
        "id": "chords",
        "title": "11. Navigation: Chords Tab",
        "current": "Generic beamed eighth notes (♫)",
        "options": [
            {
                "id": "nav_harp_strings",
                "name": "Resonating Celtic Harp Strings",
                "lore": "Triad of parallel curved bronze harp strings with radiating emerald acoustic harmonic resonance waves.",
                "svg_file": "nav_harp_strings.svg"
            },
            {
                "id": "nav_triquetra_harmony",
                "name": "Trinity Harmonic Chord Knot",
                "lore": "Sacred knot unifying the three ancient bardic musical modes: Goltraí (sorrow), Geantraí (joy), and Suantraí (peace).",
                "svg_file": "nav_triquetra_harmony.svg"
            },
            {
                "id": "nav_ogham_stave",
                "name": "Ogham Bardic Chord Stave",
                "lore": "Carved hazel rod displaying ancient Ogham harmonic musical intervals for Root, Third, and Fifth chord tones.",
                "svg_file": "nav_ogham_stave.svg"
            }
        ]
    },
    {
        "id": "levers",
        "title": "12. Navigation: Levers Tab",
        "current": "Modern DJ studio audio sliders (🎚️)",
        "options": [
            {
                "id": "nav_camac_levers",
                "name": "Camac Harp Semitone Lever",
                "lore": "Authentic mechanical brass sharping lever mounted on the harp neck to alter string pitch by a half-step.",
                "svg_file": "nav_camac_levers.svg"
            },
            {
                "id": "nav_tuning_key",
                "name": "Bronze T-Bar Tuning Wrench",
                "lore": "Ancient bronze harp tuning key with spiral terminals and square drive socket for adjusting pin tension.",
                "svg_file": "nav_tuning_key.svg"
            },
            {
                "id": "nav_tuning_pegs",
                "name": "Graduated Harp Tuning Pins",
                "lore": "Tapered square-topped ebony and brass bridge pins set at staggered heights across the soundboard curve.",
                "svg_file": "nav_tuning_pegs.svg"
            }
        ]
    },
    {
        "id": "journey",
        "title": "13. Navigation: Journey Tab",
        "current": "Modern directional magnetic compass (🧭)",
        "options": [
            {
                "id": "nav_solar_cross",
                "name": "Celtic Solar Cross Wheel",
                "lore": "Sacred four-directional sun cross in stone ring, guiding bards across the four ancient provinces of Ireland.",
                "svg_file": "nav_solar_cross.svg"
            },
            {
                "id": "nav_triskele_spiral",
                "name": "Dynamic Voyage Triskele",
                "lore": "Perpetual motion triple spiral symbolizing spiritual voyages, melodic growth, and endless open roads.",
                "svg_file": "nav_triskele_spiral.svg"
            },
            {
                "id": "nav_celtic_labyrinth",
                "name": "Celtic Pilgrim Labyrinth",
                "lore": "Concentric circular stone maze walked by medieval travelers seeking acoustic illumination.",
                "svg_file": "nav_celtic_labyrinth.svg"
            }
        ]
    },
    {
        "id": "play",
        "title": "14. Play Action Button",
        "current": "Standard flat triangle in circle (▶)",
        "options": [
            {
                "id": "play_lugh_spear",
                "name": "Spearhead of Lugh",
                "lore": "Legendary Celtic bronze spear blade with carved midrib and red enamel core, pointing forward with heroic impetus.",
                "svg_file": "play_lugh_spear.svg"
            },
            {
                "id": "play_harp_quill",
                "name": "Carved Bone Harp Quill",
                "lore": "Traditional streamlined bone plectrum used by ancient harpers, shaped into a sleek rightward play wedge.",
                "svg_file": "play_harp_quill.svg"
            },
            {
                "id": "play_triquetra_arrow",
                "name": "Dynamic Triquetra Vector",
                "lore": "Horizontally elongated Celtic knot tapered into an aerodynamic rightward action arrow.",
                "svg_file": "play_triquetra_arrow.svg"
            }
        ]
    }
]

html_parts = []
html_parts.append('''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Celtic & Irish App Icon Design System Picker</title>
  <style>
    :root {
      --bg: #0b0f17;
      --card-bg: #141b26;
      --card-hover: #1c2636;
      --card-selected: #1d3328;
      --gold: #d4af37;
      --gold-light: #fdf0cd;
      --emerald: #2ecc71;
      --emerald-dark: #1e824c;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --border: #233144;
      --border-selected: #2ecc71;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 30px 20px 80px 20px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 40px auto;
      text-align: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 30px;
    }
    .header h1 {
      font-size: 2.4rem;
      color: var(--gold-light);
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .header p {
      font-size: 1.1rem;
      color: var(--text-muted);
      max-width: 800px;
      margin: 0 auto 15px auto;
    }
    .selection-summary-bar {
      display: inline-flex;
      align-items: center;
      gap: 15px;
      background: #141b26;
      padding: 10px 25px;
      border-radius: 30px;
      border: 1px solid var(--gold);
      margin-top: 15px;
    }
    .selection-summary-bar span {
      color: var(--gold);
      font-weight: 600;
    }
    .copy-btn {
      background: var(--gold);
      color: #0b0f17;
      border: none;
      padding: 8px 18px;
      border-radius: 20px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .copy-btn:hover {
      background: #fff;
      transform: translateY(-1px);
    }
    .category-section {
      max-width: 1200px;
      margin: 0 auto 50px auto;
    }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 20px;
      border-left: 4px solid var(--gold);
      padding-left: 15px;
    }
    .category-header h2 {
      font-size: 1.5rem;
      color: var(--gold-light);
    }
    .category-header .current-badge {
      font-size: 0.9rem;
      color: var(--text-muted);
      background: #192231;
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid #2d3d52;
    }
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }
    .option-card {
      background: var(--card-bg);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
    }
    .option-card:hover {
      background: var(--card-hover);
      border-color: #3b4e6b;
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    .option-card.selected {
      background: var(--card-selected);
      border-color: var(--border-selected);
      box-shadow: 0 0 20px rgba(46, 204, 113, 0.25);
    }
    .option-tag {
      position: absolute;
      top: 15px;
      left: 15px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--gold);
      background: rgba(212, 175, 55, 0.12);
      padding: 3px 10px;
      border-radius: 10px;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }
    .select-indicator {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #4a5d78;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .option-card.selected .select-indicator {
      border-color: var(--emerald);
      background: var(--emerald);
    }
    .option-card.selected .select-indicator::after {
      content: "✓";
      color: #0b0f17;
      font-weight: 900;
      font-size: 13px;
    }
    .svg-container {
      width: 170px;
      height: 170px;
      margin: 15px 0 20px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));
    }
    .svg-container svg {
      width: 100%;
      height: 100%;
    }
    .option-card h3 {
      font-size: 1.25rem;
      color: #fff;
      margin-bottom: 8px;
    }
    .option-card p {
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Celtic & Irish App Icon Design System</h1>
    <p>Explore 42 custom-designed Celtic and Irish replacements for every symbol in your app. Click any card to select your preference, then copy your choices.</p>
    <div class="selection-summary-bar">
      <span>Selected: <span id="selectedCount">0</span> / 14 categories</span>
      <button class="copy-btn" onclick="copySelection()">Copy Chosen Configuration</button>
    </div>
  </div>
''')

for cat in CATEGORIES:
    html_parts.append(f'''
  <div class="category-section" id="cat-{cat['id']}">
    <div class="category-header">
      <h2>{cat['title']}</h2>
      <div class="current-badge">Currently: {cat['current']}</div>
    </div>
    <div class="options-grid">''')
    for opt_idx, opt in enumerate(cat['options'], 1):
        svg_file_path = os.path.join(SVG_DIR, opt['svg_file'])
        with open(svg_file_path, "r", encoding="utf-8") as f:
            svg_content = f.read()

        html_parts.append(f'''
      <div class="option-card" onclick="selectOption('{cat['id']}', '{opt['id']}', '{opt['name']}', this)">
        <div class="option-tag">Option {opt_idx}</div>
        <div class="select-indicator"></div>
        <div class="svg-container">
          {svg_content}
        </div>
        <h3>{opt['name']}</h3>
        <p>{opt['lore']}</p>
      </div>''')
    html_parts.append('''
    </div>
  </div>''')

html_parts.append('''
  <script>
    const userChoices = {};

    function selectOption(catId, optId, optName, cardEl) {
      const parent = cardEl.parentElement;
      const allCards = parent.querySelectorAll('.option-card');
      allCards.forEach(c => c.classList.remove('selected'));
      
      cardEl.classList.add('selected');
      userChoices[catId] = { id: optId, name: optName };
      
      document.getElementById('selectedCount').innerText = Object.keys(userChoices).length;
    }

    function copySelection() {
      if (Object.keys(userChoices).length === 0) {
        alert("Please click to select at least one Celtic icon option first!");
        return;
      }
      let text = "Selected Celtic Icon Configuration:\\n";
      for (const [cat, choice] of Object.entries(userChoices)) {
        text += `- ${cat}: ${choice.name} (${choice.id})\\n`;
      }
      navigator.clipboard.writeText(text).then(() => {
        alert("Configuration copied to clipboard!\\n\\n" + text);
      }).catch(err => {
        prompt("Copy your configuration:", text);
      });
    }
  </script>
</body>
</html>''')

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write("".join(html_parts))

print(f"Created complete interactive Celtic icon picker at: {HTML_PATH}")
