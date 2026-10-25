import sys
sys.stdout.reconfigure(encoding='utf-8')

# The 15 standard Major Scales (ordered by Circle of Fifths from 7 flats to 7 sharps)
MAJOR_SCALES = [
    ('Cb Major', ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'], '7 flats'),
    ('Gb Major', ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'], '6 flats'),
    ('Db Major', ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'], '5 flats'),
    ('Ab Major', ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'], '4 flats'),
    ('Eb Major', ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'], '3 flats'),
    ('Bb Major', ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'], '2 flats'),
    ('F Major',  ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'], '1 flat'),
    ('C Major',  ['C', 'D', 'E', 'F', 'G', 'A', 'B'], '0 accidentals'),
    ('G Major',  ['G', 'A', 'B', 'C', 'D', 'E', 'F#'], '1 sharp'),
    ('D Major',  ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'], '2 sharps'),
    ('A Major',  ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'], '3 sharps'),
    ('E Major',  ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'], '4 sharps'),
    ('B Major',  ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'], '5 sharps'),
    ('F# Major', ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'], '6 sharps'),
    ('C# Major', ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'], '7 sharps'),
]

STRINGS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

TUNINGS = {
    'Eb Major Tuning (3 Flats: Bb, Eb, Ab)': {
        'C': ('C', 'C#'),
        'D': ('D', 'D#'),
        'E': ('Eb', 'E'),
        'F': ('F', 'F#'),
        'G': ('G', 'G#'),
        'A': ('Ab', 'A'),
        'B': ('Bb', 'B')
    },
    'C Major Tuning (Natural: 0 Accidentals)': {
        'C': ('C', 'C#'),
        'D': ('D', 'D#'),
        'E': ('E', 'E#'),
        'F': ('F', 'F#'),
        'G': ('G', 'G#'),
        'A': ('A', 'A#'),
        'B': ('B', 'B#')
    },
    'Bb Major Tuning (2 Flats: Bb, Eb)': {
        'C': ('C', 'C#'),
        'D': ('D', 'D#'),
        'E': ('Eb', 'E'),
        'F': ('F', 'F#'),
        'G': ('G', 'G#'),
        'A': ('A', 'A#'),
        'B': ('Bb', 'B')
    },
    'F Major Tuning (1 Flat: Bb)': {
        'C': ('C', 'C#'),
        'D': ('D', 'D#'),
        'E': ('E', 'E#'),
        'F': ('F', 'F#'),
        'G': ('G', 'G#'),
        'A': ('A', 'A#'),
        'B': ('Bb', 'B')
    }
}

for tuning_name, string_options in TUNINGS.items():
    print(f"\n=======================================================")
    print(f"ANALYZING: {tuning_name}")
    print(f"=======================================================")
    playable_count = 0
    for scale_name, notes, sig in MAJOR_SCALES:
        # Check if every note in the scale can be produced by the corresponding string
        # Map each note in the scale to its letter name
        scale_dict = {}
        for n in notes:
            letter = n[0]
            scale_dict[letter] = n
        
        possible = True
        lever_config = {}
        for s in STRINGS:
            required_note = scale_dict[s]
            down_note, up_note = string_options[s]
            if required_note == down_note:
                lever_config[s] = 'DOWN'
            elif required_note == up_note:
                lever_config[s] = 'UP'
            else:
                possible = False
                break
        
        if possible:
            playable_count += 1
            config_str = " | ".join([f"{s}: {lever_config[s]}" for s in STRINGS])
            up_levers = [s for s in STRINGS if lever_config[s] == 'UP']
            up_str = ", ".join(up_levers) if up_levers else "None (all DOWN)"
            print(f"  [OK] {scale_name:<10} ({sig:<14}): Levers UP -> {up_str}")
        else:
            # print(f"  [--] {scale_name} impossible")
            pass
    print(f"Total Playable Major Keys: {playable_count}")
