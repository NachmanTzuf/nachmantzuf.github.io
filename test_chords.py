"""
Comprehensive chord and scale generator for all diatonic keys and modes.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

# The 15 Diatonic Parent Keys
PARENT_KEYS = [
    # (Key Name, Accidental Count & Name, List of Accidentals, 7 Scale Notes C..B or root order)
    ('C Major', '0 accidentals', [], ['C', 'D', 'E', 'F', 'G', 'A', 'B']),
    ('G Major', '1 sharp', ['F#'], ['G', 'A', 'B', 'C', 'D', 'E', 'F#']),
    ('D Major', '2 sharps', ['F#', 'C#'], ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']),
    ('A Major', '3 sharps', ['F#', 'C#', 'G#'], ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']),
    ('E Major', '4 sharps', ['F#', 'C#', 'G#', 'D#'], ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']),
    ('B Major', '5 sharps', ['F#', 'C#', 'G#', 'D#', 'A#'], ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']),
    ('F# Major', '6 sharps', ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'], ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']),
    ('C# Major', '7 sharps', ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'], ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#']),
    ('F Major', '1 flat', ['Bb'], ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']),
    ('Bb Major', '2 flats', ['Bb', 'Eb'], ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']),
    ('Eb Major', '3 flats', ['Bb', 'Eb', 'Ab'], ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']),
    ('Ab Major', '4 flats', ['Bb', 'Eb', 'Ab', 'Db'], ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']),
    ('Db Major', '5 flats', ['Bb', 'Eb', 'Ab', 'Db', 'Gb'], ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']),
    ('Gb Major', '6 flats', ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'], ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F']),
    ('Cb Major', '7 flats', ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'], ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb']),
]

# Mode definitions relative to parent major scale degree
MODES = [
    (0, 'Ionian (Major)', 'I - IV - V - I', 'Major 7th (1 2 3 4 5 6 7)', ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']),
    (1, 'Dorian', 'i - IV - i (or i - IV - v - i)', 'Natural 6th (1 2 b3 4 5 6 b7)', ['i', 'ii', 'bIII', 'IV', 'v', 'vi°', 'bVII']),
    (2, 'Phrygian', 'i - bII - i (or i - bII - bvii - i)', 'Minor 2nd (1 b2 b3 4 5 b6 b7)', ['i', 'bII', 'bIII', 'iv', 'v°', 'bVI', 'bvii']),
    (3, 'Lydian', 'I - II - I (or I - vii - I)', 'Augmented 4th (1 2 3 #4 5 6 7)', ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii']),
    (4, 'Mixolydian', 'I - bVII - I (or I - v - bVII - I)', 'Minor 7th (1 2 3 4 5 6 b7)', ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'bVII']),
    (5, 'Aeolian (Natural Minor)', 'i - iv - V - i (or i - iv - v - i)', 'Minor 6th (1 2 b3 4 5 b6 b7)', ['i', 'ii°', 'bIII', 'iv', 'v (V)', 'bVI', 'bVII']),
    (6, 'Locrian', 'i° - bV - i° (or i° - bII - i°)', 'Diminished 5th (1 b2 b3 4 b5 b6 b7)', ['i°', 'bII', 'biii', 'iv', 'bV', 'bVI', 'bvii'])
]

# Triad chord builder from 7-note parent scale
def get_triad(scale_notes, degree_idx):
    # Root, 3rd (degree + 2), 5th (degree + 4)
    r = scale_notes[degree_idx % 7]
    t = scale_notes[(degree_idx + 2) % 7]
    f = scale_notes[(degree_idx + 4) % 7]
    return f"{r}-{t}-{f}"

for p_name, acc_desc, acc_list, notes in PARENT_KEYS[:3]:
    print(f"\n==================== {p_name} ({acc_desc}) ====================")
    print("Scale notes:", " ".join(notes))
    for deg_offset, mode_name, cadence, char_note, roman_numerals in MODES:
        mode_notes = [notes[(deg_offset + i) % 7] for i in range(7)]
        root = mode_notes[0]
        # Build triads for each degree of the mode
        chords = []
        for i in range(7):
            r = mode_notes[i]
            t = mode_notes[(i + 2) % 7]
            f = mode_notes[(i + 4) % 7]
            # Qualify triad name
            rn = roman_numerals[i]
            if '°' in rn:
                cname = f"{r}dim"
            elif rn.islower() or (rn.startswith('b') and rn[1:].islower()) or (rn.startswith('#') and rn[1:].islower()):
                cname = f"{r}m"
            else:
                cname = f"{r}"
            chords.append(f"{rn}: {cname}")
        print(f"  Mode {deg_offset+1} ({root} {mode_name}):")
        print(f"    Notes: {' '.join(mode_notes)}")
        print(f"    Chords: {', '.join(chords)}")
        print(f"    Cadence: {cadence}")
