import os

SVG_DIR = r"C:\Users\Hp\.gemini\antigravity\brain\cc5042a1-3e33-4c73-adad-1cbcbf2cc323\assets\svg"
os.makedirs(SVG_DIR, exist_ok=True)

# Helper function to generate standardized SVG wrapper with glowing gold / bronze Celtic theme
def wrap_svg(inner_content, title, subtitle):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a384c"/>
      <stop offset="100%" stop-color="#0f141d"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf0cd"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#593e03"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58d68d"/>
      <stop offset="50%" stop-color="#27ae60"/>
      <stop offset="100%" stop-color="#145a32"/>
    </linearGradient>
    <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e59866"/>
      <stop offset="50%" stop-color="#b9770e"/>
      <stop offset="100%" stop-color="#6e2c00"/>
    </linearGradient>
    <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#85929e"/>
      <stop offset="50%" stop-color="#566573"/>
      <stop offset="100%" stop-color="#2c3e50"/>
    </linearGradient>
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#c0392b"/>
      <stop offset="40%" stop-color="#e67e22"/>
      <stop offset="75%" stop-color="#f39c12"/>
      <stop offset="100%" stop-color="#f1c40f"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Medallion -->
  <circle cx="100" cy="100" r="94" fill="url(#bgGlow)" stroke="url(#goldGrad)" stroke-width="3"/>
  <circle cx="100" cy="100" r="88" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>

  <!-- Icon Artwork -->
  {inner_content}

</svg>'''

SYMBOLS = {}

# 1. Close Button
SYMBOLS["close_brigid_cross"] = (
    '''<g transform="translate(100,100) rotate(45) scale(0.9)" stroke="url(#goldGrad)" stroke-width="4" fill="none" stroke-linecap="round">
      <!-- Central woven square -->
      <rect x="-16" y="-16" width="32" height="32" rx="3" fill="#2a384c" stroke="url(#goldGrad)" stroke-width="3"/>
      <line x1="-16" y1="-8" x2="16" y2="-8" stroke="#d4af37" stroke-width="2"/>
      <line x1="-16" y1="0" x2="16" y2="0" stroke="#d4af37" stroke-width="2"/>
      <line x1="-16" y1="8" x2="16" y2="8" stroke="#d4af37" stroke-width="2"/>
      <line x1="-8" y1="-16" x2="-8" y2="16" stroke="#d4af37" stroke-width="2"/>
      <line x1="0" y1="-16" x2="0" y2="16" stroke="#d4af37" stroke-width="2"/>
      <line x1="8" y1="-16" x2="8" y2="16" stroke="#d4af37" stroke-width="2"/>
      <!-- Four woven rush arms -->
      <path d="M 0,-16 L 0,-65 M 8,-16 L 8,-60 M -8,-16 L -8,-58" stroke="url(#goldGrad)" stroke-width="3"/>
      <path d="M 16,0 L 65,0 M 16,8 L 60,8 M 16,-8 L 58,-8" stroke="url(#goldGrad)" stroke-width="3"/>
      <path d="M 0,16 L 0,65 M -8,16 L -8,60 M 8,16 L 8,58" stroke="url(#goldGrad)" stroke-width="3"/>
      <path d="M -16,0 L -65,0 M -16,-8 L -60,-8 M -16,8 L -58,8" stroke="url(#goldGrad)" stroke-width="3"/>
      <!-- Arm binding ties -->
      <line x1="-10" y1="-55" x2="10" y2="-55" stroke="#e59866" stroke-width="4"/>
      <line x1="55" y1="-10" x2="55" y2="10" stroke="#e59866" stroke-width="4"/>
      <line x1="-10" y1="55" x2="10" y2="55" stroke="#e59866" stroke-width="4"/>
      <line x1="-55" y1="-10" x2="-55" y2="10" stroke="#e59866" stroke-width="4"/>
    </g>''',
    "Saint Brigid Cross Saltire", "Woven reed diagonal protection cross"
)

SYMBOLS["close_dara_knot"] = (
    '''<g transform="translate(100,100) rotate(45) scale(0.85)" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M -40,-40 C -10,-10 10,-10 40,-40 C 10,-70 -10,-70 -40,-40 Z"/>
      <path d="M 40,-40 C 10,-10 10,10 40,40 C 70,10 70,-10 40,-40 Z"/>
      <path d="M 40,40 C 10,10 -10,10 -40,40 C -10,70 10,70 40,40 Z"/>
      <path d="M -40,40 C -10,10 -10,-10 -40,-40 C -70,-10 -70,10 -40,40 Z"/>
      <circle cx="0" cy="0" r="14" fill="#0f141d" stroke="url(#emeraldGrad)" stroke-width="4"/>
    </g>''',
    "Celtic Dara Knot Saltire", "Sacred Oak root interlace forming an organic X"
)

SYMBOLS["close_crossed_rowan"] = (
    '''<g transform="translate(100,100) scale(0.9)" stroke-linecap="round">
      <!-- Crossed ash/rowan boughs -->
      <line x1="-50" y1="-50" x2="50" y2="50" stroke="url(#bronzeGrad)" stroke-width="8"/>
      <line x1="50" y1="-50" x2="-50" y2="50" stroke="url(#bronzeGrad)" stroke-width="8"/>
      <!-- Wood grain nodes -->
      <circle cx="-25" cy="-25" r="5" fill="#593e03"/>
      <circle cx="25" cy="25" r="5" fill="#593e03"/>
      <circle cx="25" cy="-25" r="5" fill="#593e03"/>
      <circle cx="-25" cy="25" r="5" fill="#593e03"/>
      <!-- Center leather binding twine -->
      <circle cx="0" cy="0" r="16" fill="none" stroke="url(#goldGrad)" stroke-width="4"/>
      <line x1="-12" y1="-12" x2="12" y2="12" stroke="#d4af37" stroke-width="3"/>
      <line x1="12" y1="-12" x2="-12" y2="12" stroke="#d4af37" stroke-width="3"/>
      <!-- Berries -->
      <circle cx="-42" cy="-48" r="4" fill="#c0392b"/>
      <circle cx="-48" cy="-40" r="4" fill="#e74c3c"/>
      <circle cx="42" cy="48" r="4" fill="#c0392b"/>
      <circle cx="48" cy="40" r="4" fill="#e74c3c"/>
    </g>''',
    "Crossed Rowan Twigs", "Protective Gaelic boughs with sacred red rowan berries"
)

# 2. Currency Shards
SYMBOLS["currency_gold_torc"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Broighter curved torc collar -->
      <path d="M -45,-15 C -65,-55 65,-55 45,-15 C 35,5 15,25 0,35 C -15,25 -35,5 -45,-15" fill="none" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round"/>
      <path d="M -45,-15 C -65,-55 65,-55 45,-15 C 35,5 15,25 0,35 C -15,25 -35,5 -45,-15" fill="none" stroke="#fff" stroke-width="2" opacity="0.4"/>
      <!-- Terminal decorative knobs -->
      <circle cx="-45" cy="-15" r="14" fill="url(#goldGrad)" stroke="#593e03" stroke-width="3"/>
      <circle cx="45" cy="-15" r="14" fill="url(#goldGrad)" stroke="#593e03" stroke-width="3"/>
      <circle cx="-45" cy="-15" r="6" fill="#0f141d"/>
      <circle cx="45" cy="-15" r="6" fill="#0f141d"/>
      <!-- La Tène relief spirals on body -->
      <path d="M -20,-48 C -10,-55 0,-45 10,-50 C 20,-55 25,-46 30,-48" fill="none" stroke="#593e03" stroke-width="2.5"/>
    </g>''',
    "Broighter Gold Torc", "Twisted Celtic gold collar with engraved repoussé spirals"
)

SYMBOLS["currency_gold_lunula"] = (
    '''<g transform="translate(100,105) scale(0.9)">
      <!-- Crescent lunula collar -->
      <path d="M -60,-35 C -50,50 50,50 60,-35 C 35,15 -35,15 -60,-35 Z" fill="url(#goldGrad)" stroke="#aa7c11" stroke-width="2"/>
      <!-- Chevron terminal engraving -->
      <path d="M -58,-30 L -50,-15 L -45,-25 L -40,-10 L -35,-20" fill="none" stroke="#593e03" stroke-width="1.8"/>
      <path d="M 58,-30 L 50,-15 L 45,-25 L 40,-10 L 35,-20" fill="none" stroke="#593e03" stroke-width="1.8"/>
      <!-- Paddle terminals -->
      <rect x="-65" y="-45" width="10" height="15" rx="3" fill="url(#goldGrad)" stroke="#aa7c11" stroke-width="2" transform="rotate(20 -60 -37)"/>
      <rect x="55" y="-45" width="10" height="15" rx="3" fill="url(#goldGrad)" stroke="#aa7c11" stroke-width="2" transform="rotate(-20 60 -37)"/>
    </g>''',
    "Celtic Gold Lunula", "Early Bronze Age crescent hammered sheet gold neckpiece"
)

SYMBOLS["currency_ogham_stone"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Standing slate pillar -->
      <path d="M -22,-65 L 18,-68 L 26,65 L -18,68 Z" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="3"/>
      <!-- Natural cracks / moss accents -->
      <path d="M -15,-40 Q -8,-35 -12,-20" fill="none" stroke="#27ae60" stroke-width="2"/>
      <path d="M 12,20 Q 8,35 15,45" fill="none" stroke="#27ae60" stroke-width="2"/>
      <!-- Central Ogham stem line -->
      <line x1="0" y1="-60" x2="4" y2="60" stroke="#fdf0cd" stroke-width="3" filter="url(#glow)"/>
      <!-- Incised Ogham notches (Aicme) -->
      <line x1="0" y1="-45" x2="16" y2="-45" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="1" y1="-35" x2="17" y2="-35" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="1" y1="-20" x2="-15" y2="-20" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="2" y1="-10" x2="-14" y2="-10" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="2" y1="0" x2="-14" y2="0" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="-12" y1="15" x2="18" y2="15" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="-12" y1="28" x2="18" y2="28" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="3" y1="42" x2="19" y2="42" stroke="#fdf0cd" stroke-width="3"/>
    </g>''',
    "Ogham Inscribed Stone Shard", "Ancient Celtic stone pillar fragment glowing with runic notches"
)

# 3. Streak Flame
SYMBOLS["streak_brigid_flame"] = (
    '''<g transform="translate(100,105) scale(0.9)">
      <!-- Ancient stone fire cauldron -->
      <path d="M -45,15 Q 0,55 45,15 L 35,35 Q 0,65 -35,35 Z" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="3"/>
      <ellipse cx="0" cy="15" rx="45" ry="12" fill="#1e2533" stroke="url(#goldGrad)" stroke-width="2"/>
      <path d="M -20,15 C -20,-10 0,-15 0,-45 C 10,-20 30,-15 25,15 Z" fill="url(#fireGrad)" filter="url(#glow)"/>
      <path d="M -10,15 C -10,0 0,-5 0,-25 C 5,-10 15,-5 12,15 Z" fill="#ffffff" opacity="0.8"/>
      <!-- Celtic knot band on cauldron -->
      <circle cx="-20" cy="30" r="4" fill="url(#goldGrad)"/>
      <circle cx="0" cy="35" r="4" fill="url(#goldGrad)"/>
      <circle cx="20" cy="30" r="4" fill="url(#goldGrad)"/>
    </g>''',
    "Brigid Sacred Hearth Flame", "Perpetual sacred fire burning inside an ancient stone cauldron"
)

SYMBOLS["streak_taranis_wheel"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Outer rim with flame spokes -->
      <circle cx="0" cy="0" r="55" fill="none" stroke="url(#goldGrad)" stroke-width="6"/>
      <circle cx="0" cy="0" r="48" fill="none" stroke="#c0392b" stroke-width="2"/>
      <!-- Central solar hub -->
      <circle cx="0" cy="0" r="16" fill="url(#fireGrad)" stroke="url(#goldGrad)" stroke-width="3" filter="url(#glow)"/>
      <!-- 6 radiating solar rays -->
      <g stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round">
        <line x1="0" y1="-16" x2="0" y2="-55"/>
        <line x1="0" y1="16" x2="0" y2="55"/>
        <line x1="-14" y1="-8" x2="-48" y2="-28"/>
        <line x1="14" y1="8" x2="48" y2="28"/>
        <line x1="-14" y1="8" x2="-48" y2="28"/>
        <line x1="14" y1="-8" x2="48" y2="-28"/>
      </g>
      <!-- Flame tips around perimeter -->
      <path d="M 0,-55 L -6,-68 L 0,-64 L 6,-68 Z" fill="#f39c12"/>
      <path d="M 0,55 L -6,68 L 0,64 L 6,68 Z" fill="#f39c12"/>
    </g>''',
    "Taranis Solar Fire Wheel", "Celtic sun god wheel radiating unbroken daily solar rays"
)

SYMBOLS["streak_triquetra_fire"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Trinity knot shaped from fire flames -->
      <path d="M 0,-50 C 35,-50 55,-10 30,35 C 10,65 -10,65 -30,35 C -55,-10 -35,-50 0,-50 Z" fill="none" stroke="url(#fireGrad)" stroke-width="10" stroke-linecap="round" filter="url(#glow)"/>
      <circle cx="0" cy="5" r="28" fill="none" stroke="url(#goldGrad)" stroke-width="4"/>
      <!-- Core inner fire -->
      <path d="M 0,-30 C 15,-10 15,10 0,25 C -15,10 -15,-10 0,-30 Z" fill="url(#fireGrad)"/>
      <circle cx="0" cy="5" r="6" fill="#fff"/>
    </g>''',
    "Triquetra Fire Knot", "Trinity knot surging with blazing streak fire"
)

# 4. Stage Monument
SYMBOLS["monument_glendalough"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Grassy hill base -->
      <path d="M -60,65 Q 0,50 60,65 Z" fill="url(#emeraldGrad)"/>
      <!-- Tapered stone round tower -->
      <polygon points="-16,55 16,55 11,-25 -11,-25" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="3"/>
      <!-- Conical stone cap -->
      <polygon points="-15,-25 15,-25 0,-65" fill="#34495e" stroke="url(#goldGrad)" stroke-width="2.5"/>
      <!-- High arched doorway -->
      <path d="M -4,15 A 4,4 0 0 1 4,15 L 4,30 L -4,30 Z" fill="#0f141d" stroke="#aa7c11" stroke-width="1.5"/>
      <!-- Bell window slits near top -->
      <rect x="-8" y="-18" width="3" height="8" rx="1" fill="#0f141d"/>
      <rect x="5" y="-18" width="3" height="8" rx="1" fill="#0f141d"/>
      <!-- Stone texture lines -->
      <line x1="-14" y1="40" x2="14" y2="40" stroke="#1a252f" stroke-width="1.5"/>
      <line x1="-12" y1="0" x2="12" y2="0" stroke="#1a252f" stroke-width="1.5"/>
    </g>''',
    "Glendalough Round Stone Tower", "Monastic Irish stone watchtower standing proud in the valley"
)

SYMBOLS["monument_poulnabrone"] = (
    '''<g transform="translate(100,105) scale(0.85)">
      <!-- Limestone pavement ground -->
      <path d="M -65,55 L 65,55 L 55,65 L -55,65 Z" fill="#566573"/>
      <!-- Two vertical portal supporting stones -->
      <polygon points="-42,55 -38,-5 -22,-5 -26,55" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="2.5"/>
      <polygon points="26,55 22,-5 38,-5 42,55" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="2.5"/>
      <!-- Enormous tilted table capstone -->
      <polygon points="-58,-5 52,-25 58,-12 -52,10" fill="url(#stoneGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
      <!-- Moss patches -->
      <path d="M -45,-3 Q -35,-8 -25,-4" fill="none" stroke="#27ae60" stroke-width="3"/>
      <!-- Horizon light opening -->
      <ellipse cx="0" cy="25" rx="14" ry="20" fill="#fdf0cd" opacity="0.3" filter="url(#glow)"/>
    </g>''',
    "Poulnabrone Megalithic Dolmen", "Ancient portal tomb of the Burren perched between earth and sky"
)

SYMBOLS["monument_newgrange"] = (
    '''<g transform="translate(100,105) scale(0.85)">
      <!-- Green grassy mound tumulus -->
      <path d="M -65,55 C -55,-10 55,-10 65,55 Z" fill="url(#emeraldGrad)" stroke="#145a32" stroke-width="2"/>
      <!-- White quartz wall facade -->
      <path d="M -45,55 C -35,20 35,20 45,55 Z" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2"/>
      <!-- Famous entrance stone with triple spirals -->
      <rect x="-35" y="32" width="70" height="24" rx="5" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="2"/>
      <circle cx="-16" cy="44" r="7" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
      <circle cx="0" cy="44" r="7" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
      <circle cx="16" cy="44" r="7" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
      <!-- Roofbox opening with sunbeam -->
      <rect x="-8" y="16" width="16" height="12" fill="#0f141d" stroke="url(#goldGrad)" stroke-width="1.5"/>
      <line x1="0" y1="20" x2="0" y2="-30" stroke="#f1c40f" stroke-width="3" filter="url(#glow)"/>
    </g>''',
    "Newgrange Megalithic Passage Cairn", "Five thousand year old temple with carved triple spiral kerbstone"
)

# 5. Rating Stars
SYMBOLS["stars_shamrock"] = (
    '''<g transform="translate(100,100) scale(0.9)">
      <!-- Three emerald clover leaflets -->
      <!-- Top leaflet -->
      <path d="M 0,-15 C -25,-45 0,-55 0,-25 C 0,-55 25,-45 0,-15 Z" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="3" filter="url(#glow)"/>
      <!-- Left leaflet -->
      <g transform="rotate(-120 0 -15)">
        <path d="M 0,-15 C -25,-45 0,-55 0,-25 C 0,-55 25,-45 0,-15 Z" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
      </g>
      <!-- Right leaflet -->
      <g transform="rotate(120 0 -15)">
        <path d="M 0,-15 C -25,-45 0,-55 0,-25 C 0,-55 25,-45 0,-15 Z" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
      </g>
      <!-- Stem -->
      <path d="M 0,-15 Q -5,25 20,45" fill="none" stroke="url(#emeraldGrad)" stroke-width="5" stroke-linecap="round"/>
      <!-- Center gold vein knot -->
      <circle cx="0" cy="-15" r="4" fill="url(#goldGrad)"/>
    </g>''',
    "Emerald Irish Shamrock", "Lush three leaf wood sorrel with luminous gold veins"
)

SYMBOLS["stars_triskele"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Newgrange running triple spiral -->
      <path d="M 0,0 C 15,-10 30,-30 15,-45 C 0,-60 -30,-40 -15,-20 C -5,-8 0,0 0,0 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      <g transform="rotate(120)">
        <path d="M 0,0 C 15,-10 30,-30 15,-45 C 0,-60 -30,-40 -15,-20 C -5,-8 0,0 0,0 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      </g>
      <g transform="rotate(240)">
        <path d="M 0,0 C 15,-10 30,-30 15,-45 C 0,-60 -30,-40 -15,-20 C -5,-8 0,0 0,0 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      </g>
      <circle cx="0" cy="0" r="8" fill="#fdf0cd" filter="url(#glow)"/>
    </g>''',
    "Newgrange Triskele Spiral", "Dynamic three part cosmic spiral carved into megalithic rock"
)

SYMBOLS["stars_shield_knot"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Celtic quaternary protection knot -->
      <path d="M -35,-35 C -15,-55 15,-55 35,-35 C 55,-15 55,15 35,35 C 15,55 -15,55 -35,35 C -55,15 -55,-15 -35,-35 Z" fill="none" stroke="url(#goldGrad)" stroke-width="8" stroke-linejoin="round"/>
      <circle cx="0" cy="0" r="28" fill="none" stroke="#27ae60" stroke-width="4"/>
      <!-- Inner star points -->
      <polygon points="0,-22 6,-6 22,0 6,6 0,22 -6,6 -22,0 -6,-6" fill="url(#goldGrad)" filter="url(#glow)"/>
    </g>''',
    "Celtic Shield Knot", "Unbroken four fold knot representing ancient acoustic warding"
)

# 6. Roadmap Foliage
SYMBOLS["foliage_heather"] = (
    '''<g transform="translate(100,105) scale(0.9)">
      <!-- Woody stems -->
      <path d="M 0,55 Q -10,15 -25,-30" fill="none" stroke="#6e2c00" stroke-width="3" stroke-linecap="round"/>
      <path d="M 0,55 Q 5,10 0,-45" fill="none" stroke="#6e2c00" stroke-width="3" stroke-linecap="round"/>
      <path d="M 0,55 Q 15,20 25,-25" fill="none" stroke="#6e2c00" stroke-width="3" stroke-linecap="round"/>
      <!-- Purple bell blossoms -->
      <g fill="#9b59b6" stroke="#8e44ad" stroke-width="1.5">
        <circle cx="-25" cy="-30" r="5"/>
        <circle cx="-20" cy="-20" r="6"/>
        <circle cx="-28" cy="-15" r="5"/>
        <circle cx="0" cy="-45" r="6"/>
        <circle cx="-5" cy="-35" r="6"/>
        <circle cx="5" cy="-32" r="6"/>
        <circle cx="0" cy="-20" r="7"/>
        <circle cx="25" cy="-25" r="5"/>
        <circle cx="20" cy="-15" r="6"/>
        <circle cx="28" cy="-10" r="5"/>
      </g>
      <!-- Tiny green needle leaves -->
      <line x1="-15" y1="10" x2="-22" y2="5" stroke="#27ae60" stroke-width="2"/>
      <line x1="12" y1="15" x2="20" y2="8" stroke="#27ae60" stroke-width="2"/>
    </g>''',
    "Wild Connemara Purple Heather", "Hardy mountain heather blooming in deep violet and rose pink"
)

SYMBOLS["foliage_hawthorn"] = (
    '''<g transform="translate(100,105) scale(0.85)">
      <!-- Twisted gnarled fairy tree trunk -->
      <path d="M -15,55 Q -25,20 -5,5 Q 15,-10 25,-35" fill="none" stroke="url(#bronzeGrad)" stroke-width="8" stroke-linecap="round"/>
      <path d="M -5,5 Q -30,-5 -40,-25" fill="none" stroke="url(#bronzeGrad)" stroke-width="6" stroke-linecap="round"/>
      <path d="M 5,-5 Q 0,-30 -5,-45" fill="none" stroke="url(#bronzeGrad)" stroke-width="5" stroke-linecap="round"/>
      <!-- White blossom clusters -->
      <g fill="#fdfefe" stroke="#d4af37" stroke-width="1.5" filter="url(#glow)">
        <circle cx="25" cy="-35" r="8"/>
        <circle cx="-40" cy="-25" r="8"/>
        <circle cx="-5" cy="-45" r="9"/>
        <circle cx="10" cy="-20" r="7"/>
        <circle cx="-22" cy="-15" r="7"/>
      </g>
      <!-- Red fairy ribbons tied to branch -->
      <path d="M -15,-20 Q -20,-5 -15,10" fill="none" stroke="#e74c3c" stroke-width="2.5"/>
    </g>''',
    "Sacred Fairy Hawthorn Tree", "Ancient lone fairy thorn tree with sacred ribbons and white blossoms"
)

SYMBOLS["foliage_fern"] = (
    '''<g transform="translate(100,105) scale(0.85)">
      <!-- Curled fiddlehead frond -->
      <path d="M 0,55 Q 0,-15 15,-35 Q 25,-50 15,-55 Q 5,-55 5,-45 Q 5,-38 12,-38" fill="none" stroke="url(#emeraldGrad)" stroke-width="6" stroke-linecap="round"/>
      <!-- Leaf pinnae branching outward -->
      <path d="M 2,30 Q -25,20 -35,25" fill="none" stroke="#27ae60" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 2,15 Q -25,5 -38,8" fill="none" stroke="#27ae60" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 5,0 Q -20,-10 -30,-8" fill="none" stroke="#27ae60" stroke-width="3" stroke-linecap="round"/>
      <path d="M 8,-15 Q -15,-25 -22,-22" fill="none" stroke="#27ae60" stroke-width="3" stroke-linecap="round"/>
      <!-- Golden spore dots -->
      <circle cx="-30" cy="24" r="2.5" fill="url(#goldGrad)"/>
      <circle cx="-32" cy="7" r="2.5" fill="url(#goldGrad)"/>
    </g>''',
    "Irish Highland Bracken Fern", "Unfurling emerald fiddlehead spiral with golden spores"
)

# 7. Level Nodes
SYMBOLS["node_battersea_shield"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Round bronze shield boss -->
      <circle cx="0" cy="0" r="54" fill="url(#bronzeGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
      <!-- Outer rivet circle -->
      <circle cx="0" cy="0" r="46" fill="none" stroke="#593e03" stroke-width="2" stroke-dasharray="4,6"/>
      <!-- Swirling La Tène S curves -->
      <path d="M -30,0 C -30,-25 0,-25 0,0 C 0,25 30,25 30,0" fill="none" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
      <!-- Red glass champlevé enamel cabochons -->
      <circle cx="-30" cy="0" r="9" fill="#c0392b" stroke="#593e03" stroke-width="2"/>
      <circle cx="30" cy="0" r="9" fill="#c0392b" stroke="#593e03" stroke-width="2"/>
      <circle cx="0" cy="0" r="14" fill="url(#goldGrad)" stroke="#c0392b" stroke-width="4" filter="url(#glow)"/>
    </g>''',
    "Battersea Celtic Shield Boss", "Hammered bronze warrior disc with swirling S relief and red enamel"
)

SYMBOLS["node_sun_disc"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Hammered sheet gold disc -->
      <circle cx="0" cy="0" r="54" fill="url(#goldGrad)" stroke="#aa7c11" stroke-width="3"/>
      <!-- Concentric repoussé dot bands -->
      <circle cx="0" cy="0" r="44" fill="none" stroke="#593e03" stroke-width="2" stroke-dasharray="3,4"/>
      <circle cx="0" cy="0" r="34" fill="none" stroke="#593e03" stroke-width="2" stroke-dasharray="3,4"/>
      <!-- Central four ray cross -->
      <polygon points="0,-30 6,-8 28,0 6,8 0,30 -6,8 -28,0 -6,-8" fill="#593e03"/>
      <circle cx="0" cy="0" r="10" fill="#fdf0cd" stroke="#aa7c11" stroke-width="2"/>
      <!-- Perforation holes for attaching to clothing -->
      <circle cx="-4" cy="-3" r="2.5" fill="#0f141d"/>
      <circle cx="4" cy="-3" r="2.5" fill="#0f141d"/>
    </g>''',
    "Celtic Gold Sun Disc", "Bronze Age hammered solar roundel with sacred repoussé patterns"
)

SYMBOLS["node_carved_ogham"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Round river boundary stone -->
      <circle cx="0" cy="0" r="52" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="4"/>
      <!-- Carved circular Celtic knot border -->
      <circle cx="0" cy="0" r="42" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <!-- Incised Ogham central stem and notches -->
      <line x1="0" y1="-32" x2="0" y2="32" stroke="#fdf0cd" stroke-width="3" filter="url(#glow)"/>
      <line x1="0" y1="-20" x2="16" y2="-20" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="0" y1="-10" x2="16" y2="-10" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="-16" y1="5" x2="0" y2="5" stroke="#fdf0cd" stroke-width="3"/>
      <line x1="-16" y1="15" x2="0" y2="15" stroke="#fdf0cd" stroke-width="3"/>
      <!-- Roman numeral I in center -->
      <text x="0" y="8" font-family="serif" font-size="28" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle" opacity="0.9">1</text>
    </g>''',
    "Carved Ogham Milestone", "Smooth river granite waypoint stone carved with ancient bardic degrees"
)

# 8. Locked Node
SYMBOLS["lock_tara_brooch"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Penannular pseudo-split ring -->
      <path d="M -35,30 A 45,45 0 1 1 35,30 L 25,18 A 32,32 0 1 0 -25,18 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="3"/>
      <!-- Bottom terminal plates with knotwork -->
      <rect x="-42" y="24" width="22" height="22" rx="4" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="2"/>
      <rect x="20" y="24" width="22" height="22" rx="4" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="2"/>
      <!-- Swiveling long bronze pin holding the ring locked -->
      <line x1="-40" y1="-50" x2="35" y2="45" stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round" filter="url(#glow)"/>
      <circle cx="-40" cy="-50" r="10" fill="url(#bronzeGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
      <circle cx="-40" cy="-50" r="4" fill="#c0392b"/>
    </g>''',
    "Tara Penannular Brooch Clasp", "Masterwork Celtic cloak pin with long locking bronze skewer"
)

SYMBOLS["lock_interlaced_iron"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Iron padlock shackle as Celtic serpent knot -->
      <path d="M -28,5 C -28,-40 28,-40 28,5" fill="none" stroke="url(#stoneGrad)" stroke-width="12" stroke-linecap="round"/>
      <path d="M -28,5 C -28,-40 28,-40 28,5" fill="none" stroke="#aa7c11" stroke-width="3"/>
      <!-- Heavy square bronze padlock body -->
      <rect x="-40" y="0" width="80" height="52" rx="8" fill="url(#bronzeGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
      <!-- Celtic knot embossed on face -->
      <circle cx="0" cy="24" r="14" fill="#0f141d" stroke="url(#goldGrad)" stroke-width="3"/>
      <!-- Keyhole -->
      <circle cx="0" cy="20" r="4" fill="url(#goldGrad)"/>
      <polygon points="-3,20 3,20 5,32 -5,32" fill="url(#goldGrad)"/>
    </g>''',
    "Interlaced Celtic Iron Lock", "Forged bog iron padlock adorned with protective bronze knotwork"
)

SYMBOLS["lock_bound_stone"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Upright monolith -->
      <rect x="-28" y="-55" width="56" height="110" rx="8" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="3"/>
      <!-- Riveted iron locking straps -->
      <rect x="-32" y="-30" width="64" height="14" rx="2" fill="#2c3e50" stroke="url(#goldGrad)" stroke-width="2"/>
      <rect x="-32" y="10" width="64" height="14" rx="2" fill="#2c3e50" stroke="url(#goldGrad)" stroke-width="2"/>
      <!-- Rivets -->
      <circle cx="-20" cy="-23" r="3" fill="#d4af37"/>
      <circle cx="20" cy="-23" r="3" fill="#d4af37"/>
      <circle cx="-20" cy="17" r="3" fill="#d4af37"/>
      <circle cx="20" cy="17" r="3" fill="#d4af37"/>
      <!-- Locked Celtic Triquetra seal -->
      <circle cx="0" cy="-3" r="10" fill="#c0392b" stroke="url(#goldGrad)" stroke-width="2" filter="url(#glow)"/>
    </g>''',
    "Bound Megalithic Rune Stone", "Weathered stone waypoint sealed with heavy riveted bronze bands"
)

# 9. Avatar / Harper Badge
SYMBOLS["avatar_brian_boru"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Curved willow soundbox and forepillar -->
      <path d="M 30,50 L 35,-30 C 35,-45 0,-40 -15,-30 C -35,-15 -35,25 0,55 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="4"/>
      <!-- Soundbox resonator hollow -->
      <path d="M 24,42 L 28,-22 C 20,-28 10,-24 0,-15 C -15,0 -15,30 5,45 Z" fill="#2a384c"/>
      <!-- Soundholes -->
      <circle cx="15" cy="25" r="5" fill="url(#goldGrad)"/>
      <circle cx="18" cy="5" r="4" fill="url(#goldGrad)"/>
      <circle cx="20" cy="-12" r="3.5" fill="url(#goldGrad)"/>
      <!-- Wire strings -->
      <line x1="28" y1="-20" x2="-8" y2="-28" stroke="#fdf0cd" stroke-width="1.8"/>
      <line x1="26" y1="-5" x2="-14" y2="-18" stroke="#fdf0cd" stroke-width="1.8"/>
      <line x1="24" y1="10" x2="-18" y2="-5" stroke="#fdf0cd" stroke-width="1.8"/>
      <line x1="20" y1="25" x2="-20" y2="10" stroke="#fdf0cd" stroke-width="1.8"/>
      <line x1="16" y1="40" x2="-15" y2="28" stroke="#fdf0cd" stroke-width="1.8"/>
    </g>''',
    "Trinity Brian Boru Harp", "National emblem of Ireland with curved pillar and wire strings"
)

SYMBOLS["avatar_bodhran"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Round wood frame drum -->
      <circle cx="-5" cy="0" r="48" fill="#fcf3cf" stroke="url(#bronzeGrad)" stroke-width="8"/>
      <!-- Brass tack studs around rim -->
      <circle cx="-5" cy="0" r="42" fill="none" stroke="#aa7c11" stroke-width="2" stroke-dasharray="3,7"/>
      <!-- Celtic knot painted on drumhead -->
      <circle cx="-5" cy="0" r="16" fill="none" stroke="#27ae60" stroke-width="3"/>
      <!-- Wooden tipper (cipín) crossed over drum -->
      <g transform="translate(15, -10) rotate(35)">
        <rect x="-4" y="-50" width="8" height="100" rx="4" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
        <circle cx="0" cy="-48" r="7" fill="url(#bronzeGrad)"/>
        <circle cx="0" cy="48" r="7" fill="url(#bronzeGrad)"/>
      </g>
    </g>''',
    "Traditional Irish Bodhrán", "Goatskin frame drum with brass studs and dual ended wooden tipper"
)

SYMBOLS["avatar_crwth"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Ancient Celtic box lyre body -->
      <rect x="-35" y="-15" width="70" height="70" rx="10" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="4"/>
      <!-- Upper frame arms -->
      <path d="M -30,-15 L -30,-55 L 30,-55 L 30,-15" fill="none" stroke="url(#bronzeGrad)" stroke-width="8" stroke-linecap="round"/>
      <!-- Center fingerboard -->
      <rect x="-10" y="-55" width="20" height="70" fill="#2c3e50" stroke="url(#goldGrad)" stroke-width="2"/>
      <!-- Circular soundholes -->
      <circle cx="-22" cy="20" r="6" fill="#0f141d"/>
      <circle cx="22" cy="20" r="6" fill="#0f141d"/>
      <!-- Strings -->
      <line x1="-5" y1="-50" x2="-5" y2="45" stroke="#fdf0cd" stroke-width="1.8"/>
      <line x1="0" y1="-50" x2="0" y2="45" stroke="#fdf0cd" stroke-width="1.8"/>
      <line x1="5" y1="-50" x2="5" y2="45" stroke="#fdf0cd" stroke-width="1.8"/>
    </g>''',
    "Celtic Crwth Bowed Lyre", "Archaic Celtic chordophone played by ancient bardic storytellers"
)

# 10. Nav Home
SYMBOLS["nav_crannog"] = (
    '''<g transform="translate(100,105) scale(0.85)">
      <!-- Lake water ripples -->
      <path d="M -60,55 Q 0,45 60,55" fill="none" stroke="#2980b9" stroke-width="4"/>
      <!-- Wooden roundhouse wall -->
      <rect x="-36" y="10" width="72" height="42" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="3"/>
      <!-- Conical thatched roof -->
      <polygon points="-48,15 48,15 0,-45" fill="url(#goldGrad)" stroke="#aa7c11" stroke-width="3"/>
      <line x1="0" y1="-45" x2="0" y2="-55" stroke="#aa7c11" stroke-width="3"/>
      <!-- Hearth smoke curling up -->
      <path d="M 0,-55 Q 12,-65 5,-75" fill="none" stroke="#bdc3c7" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Arched timber door -->
      <path d="M -10,30 A 10,10 0 0 1 10,30 L 10,52 L -10,52 Z" fill="#0f141d" stroke="url(#goldGrad)" stroke-width="2"/>
    </g>''',
    "Celtic Thatched Crannóg", "Fortified loch dwelling with golden reed thatch and hearth smoke"
)

SYMBOLS["nav_beehive_hut"] = (
    '''<g transform="translate(100,105) scale(0.85)">
      <!-- Drystone corbelled dome (Clochán) -->
      <path d="M -48,55 C -50,10 -25,-45 0,-48 C 25,-45 50,10 48,55 Z" fill="url(#stoneGrad)" stroke="#1a252f" stroke-width="3"/>
      <!-- Horizontal drystone course layers -->
      <path d="M -44,35 Q 0,30 44,35" fill="none" stroke="#1a252f" stroke-width="2"/>
      <path d="M -38,15 Q 0,10 38,15" fill="none" stroke="#1a252f" stroke-width="2"/>
      <path d="M -28,-5 Q 0,-10 28,-5" fill="none" stroke="#1a252f" stroke-width="2"/>
      <path d="M -18,-25 Q 0,-30 18,-25" fill="none" stroke="#1a252f" stroke-width="2"/>
      <!-- Low stone lintel entrance -->
      <rect x="-12" y="25" width="24" height="30" rx="3" fill="#0f141d" stroke="url(#goldGrad)" stroke-width="2"/>
      <!-- Green moss tufts -->
      <circle cx="-25" cy="10" r="3" fill="#27ae60"/>
      <circle cx="20" cy="-15" r="3" fill="#27ae60"/>
    </g>''',
    "Skellig Michael Clochán", "Ancient monastic beehive stone sanctuary on the wild Atlantic cliff"
)

SYMBOLS["nav_stone_hearth"] = (
    '''<g transform="translate(100,105) scale(0.85)">
      <!-- Circular river stone ring -->
      <ellipse cx="0" cy="25" rx="55" ry="25" fill="#1e2533" stroke="url(#stoneGrad)" stroke-width="8"/>
      <!-- River boulder stones around rim -->
      <circle cx="-45" cy="25" r="10" fill="url(#stoneGrad)"/>
      <circle cx="-30" cy="40" r="10" fill="url(#stoneGrad)"/>
      <circle cx="0" cy="45" r="10" fill="url(#stoneGrad)"/>
      <circle cx="30" cy="40" r="10" fill="url(#stoneGrad)"/>
      <circle cx="45" cy="25" r="10" fill="url(#stoneGrad)"/>
      <circle cx="35" cy="10" r="9" fill="url(#stoneGrad)"/>
      <circle cx="-35" cy="10" r="9" fill="url(#stoneGrad)"/>
      <!-- Glowing peat fire in center -->
      <ellipse cx="0" cy="22" rx="28" ry="12" fill="#c0392b" filter="url(#glow)"/>
      <path d="M -15,20 Q 0,-25 0,-40 Q 5,-15 15,20 Z" fill="url(#fireGrad)"/>
    </g>''',
    "Ancestral Celtic Hearth", "Round stone sanctuary fire pit representing the heart of the home"
)

# 11. Nav Chords
SYMBOLS["nav_harp_strings"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Three arched harmonic strings with sound waves -->
      <path d="M -30,-45 Q -10,0 -30,45" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round"/>
      <path d="M 0,-50 Q 20,0 0,50" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M 30,-45 Q 50,0 30,45" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round"/>
      <!-- Resonance ripples (harmonics) -->
      <circle cx="10" cy="0" r="18" fill="none" stroke="#27ae60" stroke-width="2" stroke-dasharray="3,4" opacity="0.8"/>
      <circle cx="10" cy="0" r="30" fill="none" stroke="#27ae60" stroke-width="1.5" stroke-dasharray="3,5" opacity="0.5"/>
      <!-- Top and bottom brass soundboard mounts -->
      <rect x="-42" y="-52" width="84" height="8" rx="3" fill="url(#bronzeGrad)"/>
      <rect x="-42" y="44" width="84" height="8" rx="3" fill="url(#bronzeGrad)"/>
    </g>''',
    "Resonating Celtic Harp Strings", "Triad of vibrating wire strings sounding three part acoustic harmony"
)

SYMBOLS["nav_triquetra_harmony"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Interwoven Triquetra of the Three Bardic Modes -->
      <path d="M 0,-45 C 32,-45 50,-10 25,30 C 10,55 -10,55 -25,30 C -50,-10 -32,-45 0,-45 Z" fill="none" stroke="url(#goldGrad)" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="0" cy="5" r="26" fill="none" stroke="url(#emeraldGrad)" stroke-width="5"/>
      <!-- Three musical dots at node lobes -->
      <circle cx="0" cy="-45" r="6" fill="#fdf0cd" filter="url(#glow)"/>
      <circle cx="-38" cy="22" r="6" fill="#fdf0cd" filter="url(#glow)"/>
      <circle cx="38" cy="22" r="6" fill="#fdf0cd" filter="url(#glow)"/>
    </g>''',
    "Trinity Harmonic Chord Knot", "Sacred knot unifying Goltraí (sorrow), Geantraí (joy), and Suantraí (peace)"
)

SYMBOLS["nav_ogham_stave"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Vertical bardic hazel stave -->
      <rect x="-6" y="-55" width="12" height="110" rx="4" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="2"/>
      <!-- Three pitch clusters (Root, Third, Fifth chord) -->
      <!-- Lower cluster (Root) -->
      <line x1="-30" y1="35" x2="-6" y2="35" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
      <line x1="-30" y1="22" x2="-6" y2="22" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
      <!-- Middle cluster (Third) -->
      <line x1="6" y1="0" x2="30" y2="0" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
      <line x1="6" y1="-12" x2="30" y2="-12" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round"/>
      <!-- Upper cluster (Fifth) -->
      <line x1="-28" y1="-32" x2="28" y2="-32" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round" filter="url(#glow)"/>
      <line x1="-28" y1="-44" x2="28" y2="-44" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round" filter="url(#glow)"/>
    </g>''',
    "Ogham Bardic Chord Stave", "Carved hazel rod displaying ancient Ogham harmonic musical intervals"
)

# 12. Nav Levers
SYMBOLS["nav_camac_levers"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Wooden harp neck segment -->
      <path d="M -50,30 Q 0,10 50,25" fill="none" stroke="url(#bronzeGrad)" stroke-width="14" stroke-linecap="round"/>
      <!-- Harp string -->
      <line x1="0" y1="-50" x2="0" y2="50" stroke="#fdf0cd" stroke-width="3"/>
      <!-- Mechanical semitone sharping lever (Camac style) -->
      <circle cx="-12" cy="0" r="8" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      <!-- Engaged lever handle flicked up -->
      <path d="M -12,0 L -25,-35" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" filter="url(#glow)"/>
      <circle cx="-25" cy="-35" r="5" fill="#fdf0cd"/>
      <!-- Cam pinching fret pin against string -->
      <rect x="-8" y="-4" width="16" height="8" rx="2" fill="url(#goldGrad)" stroke="#593e03" stroke-width="1.5"/>
    </g>''',
    "Camac Harp Semitone Lever", "Mechanical brass lever mounted on the harp neck to alter string pitch"
)

SYMBOLS["nav_tuning_key"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Ancient bronze T-shaped tuning wrench -->
      <path d="M -45,-30 L 45,-30" stroke="url(#bronzeGrad)" stroke-width="12" stroke-linecap="round"/>
      <path d="M 0,-30 L 0,40" stroke="url(#bronzeGrad)" stroke-width="10" stroke-linecap="round"/>
      <!-- Square drive socket on end -->
      <rect x="-10" y="32" width="20" height="20" rx="3" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      <rect x="-5" y="37" width="10" height="10" fill="#0f141d"/>
      <!-- Celtic spiral terminals on T handle -->
      <circle cx="-45" cy="-30" r="10" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      <circle cx="45" cy="-30" r="10" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
    </g>''',
    "Bronze T-Bar Tuning Wrench", "Ancient bronze tuning key with spiral terminals for adjusting harp pins"
)

SYMBOLS["nav_tuning_pegs"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Three graduated wooden harp tuning bridge pins -->
      <!-- Low pin -->
      <g transform="translate(-32, 10)">
        <polygon points="-8,-40 8,-40 5,35 -5,35" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="2"/>
        <rect x="-10" y="-48" width="20" height="10" rx="2" fill="url(#goldGrad)"/>
      </g>
      <!-- Middle pin (higher) -->
      <g transform="translate(0, -5)">
        <polygon points="-8,-40 8,-40 5,35 -5,35" fill="url(#goldGrad)" stroke="#aa7c11" stroke-width="2" filter="url(#glow)"/>
        <rect x="-10" y="-48" width="20" height="10" rx="2" fill="#fdf0cd"/>
      </g>
      <!-- High pin -->
      <g transform="translate(32, -20)">
        <polygon points="-8,-40 8,-40 5,35 -5,35" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="2"/>
        <rect x="-10" y="-48" width="20" height="10" rx="2" fill="url(#goldGrad)"/>
      </g>
    </g>''',
    "Graduated Harp Tuning Pins", "Tapered square topped ebony and brass pins controlling string tension"
)

# 13. Nav Journey
SYMBOLS["nav_solar_cross"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Celtic high cross / solar wheel -->
      <circle cx="0" cy="0" r="42" fill="none" stroke="url(#goldGrad)" stroke-width="5"/>
      <!-- Equal armed cross -->
      <path d="M 0,-52 L 0,52" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round"/>
      <path d="M -52,0 L 52,0" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round"/>
      <!-- Carved corner ring knots -->
      <circle cx="-20" cy="-20" r="8" fill="none" stroke="#27ae60" stroke-width="2.5"/>
      <circle cx="20" cy="-20" r="8" fill="none" stroke="#27ae60" stroke-width="2.5"/>
      <circle cx="-20" cy="20" r="8" fill="none" stroke="#27ae60" stroke-width="2.5"/>
      <circle cx="20" cy="20" r="8" fill="none" stroke="#27ae60" stroke-width="2.5"/>
      <!-- Center boss -->
      <circle cx="0" cy="0" r="10" fill="url(#goldGrad)" stroke="#c0392b" stroke-width="3" filter="url(#glow)"/>
    </g>''',
    "Celtic Solar Cross Wheel", "Sacred four directional sun wheel guiding travelers across the four provinces"
)

SYMBOLS["nav_triskele_spiral"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Dynamic swirling voyage spiral -->
      <circle cx="0" cy="0" r="50" fill="none" stroke="#27ae60" stroke-width="2" stroke-dasharray="4,5" opacity="0.7"/>
      <path d="M 0,0 C 20,-15 35,-35 20,-50 C 5,-65 -35,-45 -18,-22 C -6,-10 0,0 0,0 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2" filter="url(#glow)"/>
      <g transform="rotate(120)">
        <path d="M 0,0 C 20,-15 35,-35 20,-50 C 5,-65 -35,-45 -18,-22 C -6,-10 0,0 0,0 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      </g>
      <g transform="rotate(240)">
        <path d="M 0,0 C 20,-15 35,-35 20,-50 C 5,-65 -35,-45 -18,-22 C -6,-10 0,0 0,0 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="2"/>
      </g>
      <circle cx="0" cy="0" r="7" fill="#fdf0cd"/>
    </g>''',
    "Dynamic Voyage Triskele", "Perpetual motion triple spiral symbolizing the spirit of Celtic pilgrimage"
)

SYMBOLS["nav_celtic_labyrinth"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Concentric sacred labyrinth pathways -->
      <circle cx="0" cy="0" r="50" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <circle cx="0" cy="0" r="38" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <circle cx="0" cy="0" r="26" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <circle cx="0" cy="0" r="14" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
      <!-- Meander gateway cuts -->
      <path d="M 0,-50 L 0,-14" stroke="#0f141d" stroke-width="6"/>
      <path d="M 0,14 L 0,50" stroke="#0f141d" stroke-width="6"/>
      <circle cx="0" cy="0" r="7" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="2" filter="url(#glow)"/>
    </g>''',
    "Celtic Pilgrim Labyrinth", "Concentric circular stone labyrinth walked by bards on acoustic quests"
)

# 14. Play Button
SYMBOLS["play_lugh_spear"] = (
    '''<g transform="translate(100,100) rotate(90) scale(0.85)">
      <!-- Spearhead of Lugh (pointed forward / right) -->
      <path d="M 0,-55 C 22,-20 22,25 0,45 C -22,25 -22,-20 0,-55 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="3" filter="url(#glow)"/>
      <!-- Center midrib ridge -->
      <line x1="0" y1="-50" x2="0" y2="40" stroke="#fdf0cd" stroke-width="3"/>
      <!-- Celtic knotwork in blade core -->
      <circle cx="0" cy="-5" r="8" fill="#c0392b" stroke="#593e03" stroke-width="2"/>
      <!-- Socket mount -->
      <rect x="-8" y="42" width="16" height="16" fill="url(#bronzeGrad)" stroke="#593e03" stroke-width="2"/>
    </g>''',
    "Spearhead of Lugh", "Legendary Celtic bronze spear blade forged into a dynamic play arrow"
)

SYMBOLS["play_harp_quill"] = (
    '''<g transform="translate(100,100) scale(0.85)">
      <!-- Carved bone/antler harp plucking quill (plectrum) -->
      <path d="M -30,-45 C -10,-45 45,-15 45,0 C 45,15 -10,45 -30,45 C -45,30 -45,-30 -30,-45 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="4" filter="url(#glow)"/>
      <!-- Carved Celtic knot ornament inside plectrum -->
      <circle cx="-15" cy="0" r="14" fill="#2a384c" stroke="url(#goldGrad)" stroke-width="3"/>
      <path d="M -15,-8 L -15,8 M -23,0 L -7,0" stroke="#d4af37" stroke-width="2.5"/>
      <circle cx="15" cy="0" r="5" fill="#fdf0cd"/>
    </g>''',
    "Carved Bone Harp Quill", "Traditional curved harp plucking plectrum pointing forward like a play wedge"
)

SYMBOLS["play_triquetra_arrow"] = (
    '''<g transform="translate(100,100) rotate(90) scale(0.85)">
      <!-- Dynamic Triquetra Arrowhead -->
      <path d="M 0,-55 C 35,-20 40,25 15,35 C -5,20 -5,20 -15,35 C -40,25 -35,-20 0,-55 Z" fill="url(#goldGrad)" stroke="#593e03" stroke-width="4" filter="url(#glow)"/>
      <circle cx="0" cy="0" r="14" fill="#0f141d" stroke="#27ae60" stroke-width="3"/>
      <circle cx="0" cy="0" r="5" fill="#fdf0cd"/>
    </g>''',
    "Dynamic Triquetra Vector", "Tapered Celtic trinity knot designed as an aerodynamic rightward play marker"
)

# Generate all 42 SVGs
count = 0
for symbol_id, (content, title, subtitle) in SYMBOLS.items():
    svg_code = wrap_svg(content, title, subtitle)
    out_file = os.path.join(SVG_DIR, f"{symbol_id}.svg")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(svg_code)
    count += 1

print(f"Generated {count} high-fidelity Celtic SVG symbols in {SVG_DIR}")
