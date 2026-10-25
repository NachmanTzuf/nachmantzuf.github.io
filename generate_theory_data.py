"""
Generates complete music theory lookup dictionary for all major, minor, and modal scales.
"""
import json

CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

# The 7 modes and their scale degree intervals in semitones from root
MODE_PATTERNS = {
    'Ionian (Major)':     [0, 2, 4, 5, 7, 9, 11],
    'Dorian':             [0, 2, 3, 5, 7, 9, 10],
    'Phrygian':           [0, 1, 3, 5, 7, 8, 10],
    'Lydian':             [0, 2, 4, 6, 7, 9, 11],
    'Mixolydian':         [0, 2, 4, 5, 7, 9, 10],
    'Aeolian (Nat Minor)':[0, 2, 3, 5, 7, 8, 10],
    'Locrian':            [0, 1, 3, 5, 6, 8, 10]
}

# The parent scales on circle of fifths
PARENT_KEYS = [
    # (Key Name, Accidental count, Sharps/Flats list, Notes)
    ('Eb Major', '3 flats', ['Bb', 'Eb', 'Ab'], ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']),
    ('Bb Major', '2 flats', ['Bb', 'Eb'],       ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']),
    ('F Major',  '1 flat',  ['Bb'],             ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']),
    ('C Major',  '0 accidentals', [],           ['C', 'D', 'E', 'F', 'G', 'A', 'B']),
    ('G Major',  '1 sharp', ['F#'],             ['G', 'A', 'B', 'C', 'D', 'E', 'F#']),
    ('D Major',  '2 sharps',['F#', 'C#'],       ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']),
    ('A Major',  '3 sharps',['F#', 'C#', 'G#'], ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']),
    ('E Major',  '4 sharps',['F#', 'C#', 'G#', 'D#'], ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']),
    ('B Major',  '5 sharps',['F#', 'C#', 'G#', 'D#', 'A#'], ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']),
    ('F# Major', '6 sharps',['F#', 'C#', 'G#', 'D#', 'A#', 'E#'], ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']),
    ('C# Major', '7 sharps',['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'], ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#']),
    ('Ab Major', '4 flats', ['Bb', 'Eb', 'Ab', 'Db'], ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']),
    ('Db Major', '5 flats', ['Bb', 'Eb', 'Ab', 'Db', 'Gb'], ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']),
    ('Gb Major', '6 flats', ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'], ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F']),
    ('Cb Major', '7 flats', ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'], ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'])
]

print(f"Loaded {len(PARENT_KEYS)} parent major tonalities.")
