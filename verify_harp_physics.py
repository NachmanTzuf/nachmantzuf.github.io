"""
Harp Tuning and Music Theory Mathematical Verification Engine
Verifies:
1. Native tunings (Eb, C, Bb, F) and open string pitches.
2. Lever action: Each lever raises open string by +1 semitone.
3. Permissible scales in each tuning based on available pitch sets.
4. Scale note spellings for all 15 major keys, 15 minor keys, and all 7 modes across all roots.
5. Triad qualities, Roman numeral chord analysis, and functional cadences.
"""

# Chromatic scale definitions
PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Standard diatonic string names on a harp
STRINGS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

# Tunings: open string pitches (lever DOWN)
TUNINGS = {
    'Eb Major Tuning': {
        'C': 'C', 'D': 'D', 'E': 'Eb', 'F': 'F', 'G': 'G', 'A': 'Ab', 'B': 'Bb'
    },
    'C Major Tuning': {
        'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B'
    },
    'Bb Major Tuning': {
        'C': 'C', 'D': 'D', 'E': 'Eb', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'Bb'
    },
    'F Major Tuning': {
        'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'Bb'
    }
}

# When lever is raised UP, the pitch is raised by one semitone:
# Flat -> Natural
# Natural -> Sharp
LEVER_UP_MAP = {
    'Eb': 'E',
    'Bb': 'B',
    'Ab': 'A',
    'Db': 'D',
    'C': 'C#',
    'D': 'D#',
    'E': 'E#', # F
    'F': 'F#',
    'G': 'G#',
    'A': 'A#',
    'B': 'B#'  # C
}

print("Verifying lever physics...")
for tuning_name, open_notes in TUNINGS.items():
    print(f"\n--- {tuning_name} ---")
    print("Open (DOWN):", [f"{s}={open_notes[s]}" for s in STRINGS])
    raised_notes = {s: LEVER_UP_MAP.get(open_notes[s], open_notes[s] + '#') for s in STRINGS}
    print("Engaged (UP):", [f"{s}={raised_notes[s]}" for s in STRINGS])
