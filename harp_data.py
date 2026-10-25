import sys, os, subprocess

sys.stdout.reconfigure(encoding='utf-8')

HTML_OUTPUT_PATH = r"C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\harp_guide.html"
PDF_DESKTOP_PATH = r"C:\Users\Hp\Desktop\all levels screen shots\harp_tunings_scales_and_cadences_master_guide.pdf"
PDF_WORKSPACE_PATH = r"C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\harp_tunings_scales_and_cadences_master_guide.pdf"

# -------------------------------------------------------------
# DATA DEFINITIONS
# -------------------------------------------------------------

STRINGS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

TUNINGS = [
    {
        'id': 'eb_major',
        'name': 'E-flat Major Native Tuning',
        'key': 'Eb Major',
        'description': 'Modern universal standard for full-lever Celtic and folk harps worldwide. Provides 3 flats to 4 sharps (8 major keys, 8 minor keys, 56 modes).',
        'open_strings': {'C': 'C', 'D': 'D', 'E': 'Eb', 'F': 'F', 'G': 'G', 'A': 'Ab', 'B': 'Bb'},
        'open_accidentals': '3 Flats: B♭, E♭, A♭',
        'raised_strings': {'C': 'C#', 'D': 'D#', 'E': 'E', 'F': 'F#', 'G': 'G#', 'A': 'A', 'B': 'B'},
        'keys': [
            {'scale': 'Eb Major / C Minor', 'sig': '3 flats (Bb, Eb, Ab)', 'up': [], 'down': ['C', 'D', 'E', 'F', 'G', 'A', 'B']},
            {'scale': 'Bb Major / G Minor', 'sig': '2 flats (Bb, Eb)', 'up': ['A'], 'down': ['C', 'D', 'E', 'F', 'G', 'B']},
            {'scale': 'F Major / D Minor', 'sig': '1 flat (Bb)', 'up': ['E', 'A'], 'down': ['C', 'D', 'F', 'G', 'B']},
            {'scale': 'C Major / A Minor', 'sig': '0 accidentals', 'up': ['B', 'E', 'A'], 'down': ['C', 'D', 'F', 'G']},
            {'scale': 'G Major / E Minor', 'sig': '1 sharp (F#)', 'up': ['B', 'E', 'A', 'F'], 'down': ['C', 'D', 'G']},
            {'scale': 'D Major / B Minor', 'sig': '2 sharps (F#, C#)', 'up': ['B', 'E', 'A', 'F', 'C'], 'down': ['D', 'G']},
            {'scale': 'A Major / F# Minor', 'sig': '3 sharps (F#, C#, G#)', 'up': ['B', 'E', 'A', 'F', 'C', 'G'], 'down': ['D']},
            {'scale': 'E Major / C# Minor', 'sig': '4 sharps (F#, C#, G#, D#)', 'up': ['B', 'E', 'A', 'F', 'C', 'G', 'D'], 'down': []}
        ]
    },
    {
        'id': 'c_major',
        'name': 'C Major Native Tuning',
        'key': 'C Major',
        'description': 'Historical, classical, and beginner standard. All strings open are natural. Provides 0 to 7 sharps (8 major keys, 8 minor keys, 56 modes). Cannot play flat keys without manual retuning.',
        'open_strings': {'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B'},
        'open_accidentals': '0 accidentals (All Naturals)',
        'raised_strings': {'C': 'C#', 'D': 'D#', 'E': 'E#', 'F': 'F#', 'G': 'G#', 'A': 'A#', 'B': 'B#'},
        'keys': [
            {'scale': 'C Major / A Minor', 'sig': '0 accidentals', 'up': [], 'down': ['C', 'D', 'E', 'F', 'G', 'A', 'B']},
            {'scale': 'G Major / E Minor', 'sig': '1 sharp (F#)', 'up': ['F'], 'down': ['C', 'D', 'E', 'G', 'A', 'B']},
            {'scale': 'D Major / B Minor', 'sig': '2 sharps (F#, C#)', 'up': ['C', 'F'], 'down': ['D', 'E', 'G', 'A', 'B']},
            {'scale': 'A Major / F# Minor', 'sig': '3 sharps (F#, C#, G#)', 'up': ['C', 'F', 'G'], 'down': ['D', 'E', 'A', 'B']},
            {'scale': 'E Major / C# Minor', 'sig': '4 sharps (F#, C#, G#, D#)', 'up': ['C', 'D', 'F', 'G'], 'down': ['E', 'A', 'B']},
            {'scale': 'B Major / G# Minor', 'sig': '5 sharps (F#, C#, G#, D#, A#)', 'up': ['C', 'D', 'F', 'G', 'A'], 'down': ['E', 'B']},
            {'scale': 'F# Major / D# Minor', 'sig': '6 sharps (F#, C#, G#, D#, A#, E#)', 'up': ['C', 'D', 'E', 'F', 'G', 'A'], 'down': ['B']},
            {'scale': 'C# Major / A# Minor', 'sig': '7 sharps (all sharps)', 'up': ['C', 'D', 'E', 'F', 'G', 'A', 'B'], 'down': []}
        ]
    },
    {
        'id': 'bb_major',
        'name': 'B-flat Major Native Tuning',
        'key': 'Bb Major',
        'description': 'Traditional Celtic, Irish, and Scottish session standard. Open strings have 2 flats (B♭, E♭). Provides 2 flats to 5 sharps (8 major keys, 8 minor keys, 56 modes). Gives access to B Major/Minor while retaining F and B♭.',
        'open_strings': {'C': 'C', 'D': 'D', 'E': 'Eb', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'Bb'},
        'open_accidentals': '2 Flats: B♭, E♭',
        'raised_strings': {'C': 'C#', 'D': 'D#', 'E': 'E', 'F': 'F#', 'G': 'G#', 'A': 'A#', 'B': 'B'},
        'keys': [
            {'scale': 'Bb Major / G Minor', 'sig': '2 flats (Bb, Eb)', 'up': [], 'down': ['C', 'D', 'E', 'F', 'G', 'A', 'B']},
            {'scale': 'F Major / D Minor', 'sig': '1 flat (Bb)', 'up': ['E'], 'down': ['C', 'D', 'F', 'G', 'A', 'B']},
            {'scale': 'C Major / A Minor', 'sig': '0 accidentals', 'up': ['E', 'B'], 'down': ['C', 'D', 'F', 'G', 'A']},
            {'scale': 'G Major / E Minor', 'sig': '1 sharp (F#)', 'up': ['E', 'B', 'F'], 'down': ['C', 'D', 'G', 'A']},
            {'scale': 'D Major / B Minor', 'sig': '2 sharps (F#, C#)', 'up': ['E', 'B', 'F', 'C'], 'down': ['D', 'G', 'A']},
            {'scale': 'A Major / F# Minor', 'sig': '3 sharps (F#, C#, G#)', 'up': ['E', 'B', 'F', 'C', 'G'], 'down': ['D', 'A']},
            {'scale': 'E Major / C# Minor', 'sig': '4 sharps (F#, C#, G#, D#)', 'up': ['E', 'B', 'F', 'C', 'G', 'D'], 'down': ['A']},
            {'scale': 'B Major / G# Minor', 'sig': '5 sharps (F#, C#, G#, D#, A#)', 'up': ['E', 'B', 'F', 'C', 'G', 'D', 'A'], 'down': []}
        ]
    },
    {
        'id': 'f_major',
        'name': 'F Major Native Tuning',
        'key': 'F Major',
        'description': 'Partial-lever and modal folk standard (Rees Flatsicle, harps with C, F, B levers). Open strings have 1 flat (B♭). Provides 1 flat to 6 sharps (8 major keys, 8 minor keys, 56 modes).',
        'open_strings': {'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'Bb'},
        'open_accidentals': '1 Flat: B♭',
        'raised_strings': {'C': 'C#', 'D': 'D#', 'E': 'E#', 'F': 'F#', 'G': 'G#', 'A': 'A#', 'B': 'B'},
        'keys': [
            {'scale': 'F Major / D Minor', 'sig': '1 flat (Bb)', 'up': [], 'down': ['C', 'D', 'E', 'F', 'G', 'A', 'B']},
            {'scale': 'C Major / A Minor', 'sig': '0 accidentals', 'up': ['B'], 'down': ['C', 'D', 'E', 'F', 'G', 'A']},
            {'scale': 'G Major / E Minor', 'sig': '1 sharp (F#)', 'up': ['B', 'F'], 'down': ['C', 'D', 'E', 'G', 'A']},
            {'scale': 'D Major / B Minor', 'sig': '2 sharps (F#, C#)', 'up': ['B', 'F', 'C'], 'down': ['D', 'E', 'G', 'A']},
            {'scale': 'A Major / F# Minor', 'sig': '3 sharps (F#, C#, G#)', 'up': ['B', 'F', 'C', 'G'], 'down': ['D', 'E', 'A']},
            {'scale': 'E Major / C# Minor', 'sig': '4 sharps (F#, C#, G#, D#)', 'up': ['B', 'F', 'C', 'G', 'D'], 'down': ['E', 'A']},
            {'scale': 'B Major / G# Minor', 'sig': '5 sharps (F#, C#, G#, D#, A#)', 'up': ['B', 'F', 'C', 'G', 'D', 'A'], 'down': ['E']},
            {'scale': 'F# Major / D# Minor', 'sig': '6 sharps (F#, C#, G#, D#, A#, E#)', 'up': ['B', 'F', 'C', 'G', 'D', 'A', 'E'], 'down': []}
        ]
    }
]

# 15 Major Keys Data
ALL_MAJOR_KEYS = [
    {
        'name': 'C Major', 'accidentals': '0 accidentals', 'acc_list': 'None',
        'notes': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        'chords': 'I: C | ii: Dm | iii: Em | IV: F | V: G (G7) | vi: Am | vii°: Bdim',
        'authentic': 'V → I (G → C or G7 → C)',
        'functional': 'I - IV - V - I (C - F - G - C)',
        'plagal': 'IV → I (F → C)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'G Major', 'accidentals': '1 sharp', 'acc_list': 'F#',
        'notes': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
        'chords': 'I: G | ii: Am | iii: Bm | IV: C | V: D (D7) | vi: Em | vii°: F#dim',
        'authentic': 'V → I (D → G or D7 → G)',
        'functional': 'I - IV - V - I (G - C - D - G)',
        'plagal': 'IV → I (C → G)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'D Major', 'accidentals': '2 sharps', 'acc_list': 'F#, C#',
        'notes': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
        'chords': 'I: D | ii: Em | iii: F#m | IV: G | V: A (A7) | vi: Bm | vii°: C#dim',
        'authentic': 'V → I (A → D or A7 → D)',
        'functional': 'I - IV - V - I (D - G - A - D)',
        'plagal': 'IV → I (G → D)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'A Major', 'accidentals': '3 sharps', 'acc_list': 'F#, C#, G#',
        'notes': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
        'chords': 'I: A | ii: Bm | iii: C#m | IV: D | V: E (E7) | vi: F#m | vii°: G#dim',
        'authentic': 'V → I (E → A or E7 → A)',
        'functional': 'I - IV - V - I (A - D - E - A)',
        'plagal': 'IV → I (D → A)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'E Major', 'accidentals': '4 sharps', 'acc_list': 'F#, C#, G#, D#',
        'notes': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
        'chords': 'I: E | ii: F#m | iii: G#m | IV: A | V: B (B7) | vi: C#m | vii°: D#dim',
        'authentic': 'V → I (B → E or B7 → E)',
        'functional': 'I - IV - V - I (E - A - B - E)',
        'plagal': 'IV → I (A → E)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'B Major', 'accidentals': '5 sharps', 'acc_list': 'F#, C#, G#, D#, A#',
        'notes': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
        'chords': 'I: B | ii: C#m | iii: D#m | IV: E | V: F# (F#7) | vi: G#m | vii°: A#dim',
        'authentic': 'V → I (F# → B or F#7 → B)',
        'functional': 'I - IV - V - I (B - E - F# - B)',
        'plagal': 'IV → I (E → B)',
        'tunings': 'C Tuning, Bb Tuning, F Tuning (Requires 5 Sharps)'
    },
    {
        'name': 'F# Major', 'accidentals': '6 sharps', 'acc_list': 'F#, C#, G#, D#, A#, E#',
        'notes': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
        'chords': 'I: F# | ii: G#m | iii: A#m | IV: B | V: C# (C#7) | vi: D#m | vii°: E#dim',
        'authentic': 'V → I (C# → F# or C#7 → F#)',
        'functional': 'I - IV - V - I (F# - B - C# - F#)',
        'plagal': 'IV → I (B → F#)',
        'tunings': 'C Tuning, F Tuning (Requires 6 Sharps)'
    },
    {
        'name': 'C# Major', 'accidentals': '7 sharps', 'acc_list': 'F#, C#, G#, D#, A#, E#, B#',
        'notes': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
        'chords': 'I: C# | ii: D#m | iii: E#m | IV: F# | V: G# (G#7) | vi: A#m | vii°: B#dim',
        'authentic': 'V → I (G# → C# or G#7 → C#)',
        'functional': 'I - IV - V - I (C# - F# - G# - C#)',
        'plagal': 'IV → I (F# → C#)',
        'tunings': 'C Tuning Only (All 7 levers UP)'
    },
    {
        'name': 'F Major', 'accidentals': '1 flat', 'acc_list': 'Bb',
        'notes': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
        'chords': 'I: F | ii: Gm | iii: Am | IV: Bb | V: C (C7) | vi: Dm | vii°: Edim',
        'authentic': 'V → I (C → F or C7 → F)',
        'functional': 'I - IV - V - I (F - Bb - C - F)',
        'plagal': 'IV → I (Bb → F)',
        'tunings': 'Eb Tuning, Bb Tuning, F Tuning (Requires Bb string flat)'
    },
    {
        'name': 'Bb Major', 'accidentals': '2 flats', 'acc_list': 'Bb, Eb',
        'notes': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
        'chords': 'I: Bb | ii: Cm | iii: Dm | IV: Eb | V: F (F7) | vi: Gm | vii°: Adim',
        'authentic': 'V → I (F → Bb or F7 → Bb)',
        'functional': 'I - IV - V - I (Bb - Eb - F - Bb)',
        'plagal': 'IV → I (Eb → Bb)',
        'tunings': 'Eb Tuning, Bb Tuning (Requires Bb and Eb strings flat)'
    },
    {
        'name': 'Eb Major', 'accidentals': '3 flats', 'acc_list': 'Bb, Eb, Ab',
        'notes': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
        'chords': 'I: Eb | ii: Fm | iii: Gm | IV: Ab | V: Bb (Bb7) | vi: Cm | vii°: Ddim',
        'authentic': 'V → I (Bb → Eb or Bb7 → Eb)',
        'functional': 'I - IV - V - I (Eb - Ab - Bb - Eb)',
        'plagal': 'IV → I (Ab → Eb)',
        'tunings': 'Eb Tuning Only (Open baseline with all levers DOWN)'
    },
    {
        'name': 'Ab Major', 'accidentals': '4 flats', 'acc_list': 'Bb, Eb, Ab, Db',
        'notes': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
        'chords': 'I: Ab | ii: Bbm | iii: Cm | IV: Db | V: Eb (Eb7) | vi: Fm | vii°: Gdim',
        'authentic': 'V → I (Eb → Ab or Eb7 → Ab)',
        'functional': 'I - IV - V - I (Ab - Db - Eb - Ab)',
        'plagal': 'IV → I (Db → Ab)',
        'tunings': 'Manual Retune (Requires Db string flat open)'
    },
    {
        'name': 'Db Major', 'accidentals': '5 flats', 'acc_list': 'Bb, Eb, Ab, Db, Gb',
        'notes': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
        'chords': 'I: Db | ii: Ebm | iii: Fm | IV: Gb | V: Ab (Ab7) | vi: Bbm | vii°: Cdim',
        'authentic': 'V → I (Ab → Db or Ab7 → Db)',
        'functional': 'I - IV - V - I (Db - Gb - Ab - Db)',
        'plagal': 'IV → I (Gb → Db)',
        'tunings': 'Manual Retune (Pedal harp or custom flat tuning)'
    },
    {
        'name': 'Gb Major', 'accidentals': '6 flats', 'acc_list': 'Bb, Eb, Ab, Db, Gb, Cb',
        'notes': ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
        'chords': 'I: Gb | ii: Abm | iii: Bbm | IV: Cb | V: Db (Db7) | vi: Ebm | vii°: Fdim',
        'authentic': 'V → I (Db → Gb or Db7 → Gb)',
        'functional': 'I - IV - V - I (Gb - Cb - Db - Gb)',
        'plagal': 'IV → I (Cb → Gb)',
        'tunings': 'Manual Retune (Pedal harp / enharmonic F# Major)'
    },
    {
        'name': 'Cb Major', 'accidentals': '7 flats', 'acc_list': 'Bb, Eb, Ab, Db, Gb, Cb, Fb',
        'notes': ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'],
        'chords': 'I: Cb | ii: Dbm | iii: Ebm | IV: Fb | V: Gb (Gb7) | vi: Abm | vii°: Bbdim',
        'authentic': 'V → I (Gb → Cb or Gb7 → Cb)',
        'functional': 'I - IV - V - I (Cb - Fb - Gb - Cb)',
        'plagal': 'IV → I (Fb → Cb)',
        'tunings': 'Manual Retune (Pedal harp home key / enharmonic B Major)'
    }
]

# 15 Natural Minor Keys Data
ALL_MINOR_KEYS = [
    {
        'name': 'A Minor', 'rel_major': 'C Major', 'accidentals': '0 accidentals', 'acc_list': 'None',
        'notes': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        'chords': 'i: Am | ii°: Bdim | III: C | iv: Dm | v: Em (V: E) | VI: F | VII: G',
        'modal_cad': 'i - iv - v - i (Am - Dm - Em - Am)',
        'harmonic_cad': 'i - iv - V - i (Am - Dm - E - Am)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'E Minor', 'rel_major': 'G Major', 'accidentals': '1 sharp', 'acc_list': 'F#',
        'notes': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
        'chords': 'i: Em | ii°: F#dim | III: G | iv: Am | v: Bm (V: B) | VI: C | VII: D',
        'modal_cad': 'i - iv - v - i (Em - Am - Bm - Em)',
        'harmonic_cad': 'i - iv - V - i (Em - Am - B - Em)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'B Minor', 'rel_major': 'D Major', 'accidentals': '2 sharps', 'acc_list': 'F#, C#',
        'notes': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
        'chords': 'i: Bm | ii°: C#dim | III: D | iv: Em | v: F#m (V: F#) | VI: G | VII: A',
        'modal_cad': 'i - iv - v - i (Bm - Em - F#m - Bm)',
        'harmonic_cad': 'i - iv - V - i (Bm - Em - F# - Bm)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'F# Minor', 'rel_major': 'A Major', 'accidentals': '3 sharps', 'acc_list': 'F#, C#, G#',
        'notes': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],
        'chords': 'i: F#m | ii°: G#dim | III: A | iv: Bm | v: C#m (V: C#) | VI: D | VII: E',
        'modal_cad': 'i - iv - v - i (F#m - Bm - C#m - F#m)',
        'harmonic_cad': 'i - iv - V - i (F#m - Bm - C# - F#m)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'C# Minor', 'rel_major': 'E Major', 'accidentals': '4 sharps', 'acc_list': 'F#, C#, G#, D#',
        'notes': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],
        'chords': 'i: C#m | ii°: D#dim | III: E | iv: F#m | v: G#m (V: G#) | VI: A | VII: B',
        'modal_cad': 'i - iv - v - i (C#m - F#m - G#m - C#m)',
        'harmonic_cad': 'i - iv - V - i (C#m - F#m - G# - C#m)',
        'tunings': 'Eb Tuning, C Tuning, Bb Tuning, F Tuning (All 4)'
    },
    {
        'name': 'G# Minor', 'rel_major': 'B Major', 'accidentals': '5 sharps', 'acc_list': 'F#, C#, G#, D#, A#',
        'notes': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'],
        'chords': 'i: G#m | ii°: A#dim | III: B | iv: C#m | v: D#m (V: D#) | VI: E | VII: F#',
        'modal_cad': 'i - iv - v - i (G#m - C#m - D#m - G#m)',
        'harmonic_cad': 'i - iv - V - i (G#m - C#m - D# - G#m)',
        'tunings': 'C Tuning, Bb Tuning, F Tuning'
    },
    {
        'name': 'D# Minor', 'rel_major': 'F# Major', 'accidentals': '6 sharps', 'acc_list': 'F#, C#, G#, D#, A#, E#',
        'notes': ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#'],
        'chords': 'i: D#m | ii°: E#dim | III: F# | iv: G#m | v: A#m (V: A#) | VI: B | VII: C#',
        'modal_cad': 'i - iv - v - i (D#m - G#m - A#m - D#m)',
        'harmonic_cad': 'i - iv - V - i (D#m - G#m - A# - D#m)',
        'tunings': 'C Tuning, F Tuning'
    },
    {
        'name': 'A# Minor', 'rel_major': 'C# Major', 'accidentals': '7 sharps', 'acc_list': 'F#, C#, G#, D#, A#, E#, B#',
        'notes': ['A#', 'B#', 'C#', 'D#', 'E#', 'F#', 'G#'],
        'chords': 'i: A#m | ii°: B#dim | III: C# | iv: D#m | v: E#m (V: E#) | VI: F# | VII: G#',
        'modal_cad': 'i - iv - v - i (A#m - D#m - E#m - A#m)',
        'harmonic_cad': 'i - iv - V - i (A#m - D#m - E# - A#m)',
        'tunings': 'C Tuning Only'
    },
    {
        'name': 'D Minor', 'rel_major': 'F Major', 'accidentals': '1 flat', 'acc_list': 'Bb',
        'notes': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
        'chords': 'i: Dm | ii°: Edim | III: F | iv: Gm | v: Am (V: A) | VI: Bb | VII: C',
        'modal_cad': 'i - iv - v - i (Dm - Gm - Am - Dm)',
        'harmonic_cad': 'i - iv - V - i (Dm - Gm - A - Dm)',
        'tunings': 'Eb Tuning, Bb Tuning, F Tuning'
    },
    {
        'name': 'G Minor', 'rel_major': 'Bb Major', 'accidentals': '2 flats', 'acc_list': 'Bb, Eb',
        'notes': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
        'chords': 'i: Gm | ii°: Adim | III: Bb | iv: Cm | v: Dm (V: D) | VI: Eb | VII: F',
        'modal_cad': 'i - iv - v - i (Gm - Cm - Dm - Gm)',
        'harmonic_cad': 'i - iv - V - i (Gm - Cm - D - Gm)',
        'tunings': 'Eb Tuning, Bb Tuning'
    },
    {
        'name': 'C Minor', 'rel_major': 'Eb Major', 'accidentals': '3 flats', 'acc_list': 'Bb, Eb, Ab',
        'notes': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
        'chords': 'i: Cm | ii°: Ddim | III: Eb | iv: Fm | v: Gm (V: G) | VI: Ab | VII: Bb',
        'modal_cad': 'i - iv - v - i (Cm - Fm - Gm - Cm)',
        'harmonic_cad': 'i - iv - V - i (Cm - Fm - G - Cm)',
        'tunings': 'Eb Tuning Only'
    },
    {
        'name': 'F Minor', 'rel_major': 'Ab Major', 'accidentals': '4 flats', 'acc_list': 'Bb, Eb, Ab, Db',
        'notes': ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'],
        'chords': 'i: Fm | ii°: Gdim | III: Ab | iv: Bbm | v: Cm (V: C) | VI: Db | VII: Eb',
        'modal_cad': 'i - iv - v - i (Fm - Bbm - Cm - Fm)',
        'harmonic_cad': 'i - iv - V - i (Fm - Bbm - C - Fm)',
        'tunings': 'Manual Retune (Requires Db string flat)'
    },
    {
        'name': 'Bb Minor', 'rel_major': 'Db Major', 'accidentals': '5 flats', 'acc_list': 'Bb, Eb, Ab, Db, Gb',
        'notes': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'],
        'chords': 'i: Bbm | ii°: Cdim | III: Db | iv: Ebm | v: Fm (V: F) | VI: Gb | VII: Ab',
        'modal_cad': 'i - iv - v - i (Bbm - Ebm - Fm - Bbm)',
        'harmonic_cad': 'i - iv - V - i (Bbm - Ebm - F - Bbm)',
        'tunings': 'Manual Retune'
    },
    {
        'name': 'Eb Minor', 'rel_major': 'Gb Major', 'accidentals': '6 flats', 'acc_list': 'Bb, Eb, Ab, Db, Gb, Cb',
        'notes': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'],
        'chords': 'i: Ebm | ii°: Fdim | III: Gb | iv: Abm | v: Bbm (V: Bb) | VI: Cb | VII: Db',
        'modal_cad': 'i - iv - v - i (Ebm - Abm - Bbm - Ebm)',
        'harmonic_cad': 'i - iv - V - i (Ebm - Abm - Bb - Ebm)',
        'tunings': 'Manual Retune'
    },
    {
        'name': 'Ab Minor', 'rel_major': 'Cb Major', 'accidentals': '7 flats', 'acc_list': 'Bb, Eb, Ab, Db, Gb, Cb, Fb',
        'notes': ['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'Gb'],
        'chords': 'i: Abm | ii°: Bbdim | III: Cb | iv: Dbm | v: Ebm (V: Eb) | VI: Fb | VII: Gb',
        'modal_cad': 'i - iv - v - i (Abm - Dbm - Ebm - Abm)',
        'harmonic_cad': 'i - iv - V - i (Abm - Dbm - Eb - Abm)',
        'tunings': 'Manual Retune'
    }
]

# The 7 Diatonic Modes Reference
MODES_THEORY = [
    {
        'name': 'Ionian (Major)',
        'degree': '1st Degree',
        'formula': '1 - 2 - 3 - 4 - 5 - 6 - 7',
        'char_interval': 'Major 3rd and Major 7th (bright, resolved, stable)',
        'chords': 'I - ii - iii - IV - V - vi - vii°',
        'cadences': 'Authentic: V → I | Plagal: IV → I | Functional: I - IV - V - I',
        'mood': 'Bright, triumphant, resolved, classical'
    },
    {
        'name': 'Dorian',
        'degree': '2nd Degree',
        'formula': '1 - 2 - ♭3 - 4 - 5 - 6 - ♭7',
        'char_interval': 'Natural 6th with Minor 3rd (avoids the melancholy of natural minor)',
        'chords': 'i - ii - ♭III - IV - v - vi° - ♭VII',
        'cadences': 'Modal Signature: i - IV - i (or i - IV - v - i, or ii - V - i relative)',
        'mood': 'Noble, medieval, bittersweet, Celtic ballad standard (e.g., Scarborough Fair, Drunken Sailor)'
    },
    {
        'name': 'Phrygian',
        'degree': '3rd Degree',
        'formula': '1 - ♭2 - ♭3 - 4 - 5 - ♭6 - ♭7',
        'char_interval': 'Minor 2nd (half step above tonic, exotic Spanish/flamenco gravity)',
        'chords': 'i - ♭II - ♭III - iv - v° - ♭VI - ♭vii',
        'cadences': 'Flamenco / Phrygian Cadence: i - ♭II - i (or ♭II → i)',
        'mood': 'Dark, intense, mystical, Middle Eastern, Andalusian'
    },
    {
        'name': 'Lydian',
        'degree': '4th Degree',
        'formula': '1 - 2 - 3 - ♯4 - 5 - 6 - 7',
        'char_interval': 'Augmented 4th (Tritone above root, floating, ethereal lifting quality)',
        'chords': 'I - II - iii - ♯iv° - V - vi - vii',
        'cadences': 'Lydian Cadence: I - II - I (e.g. C - D - C) or II → I',
        'mood': 'Dreamy, otherworldly, luminous, cinematic fantasy'
    },
    {
        'name': 'Mixolydian',
        'degree': '5th Degree',
        'formula': '1 - 2 - 3 - 4 - 5 - 6 - ♭7',
        'char_interval': 'Minor 7th with Major 3rd (bluesy, folk rock, bagpipe scale)',
        'chords': 'I - ii - iii° - IV - v - vi - ♭VII',
        'cadences': 'Mixolydian Cadence: I - ♭VII - I (or I - v - ♭VII - I)',
        'mood': 'Carefree, rustic, Celtic dance, Scottish pipe reels (e.g., Old Joe Clark, Sweet Child O\' Mine)'
    },
    {
        'name': 'Aeolian (Natural Minor)',
        'degree': '6th Degree',
        'formula': '1 - 2 - ♭3 - 4 - 5 - ♭6 - ♭7',
        'char_interval': 'Minor 6th with Minor 3rd and Minor 7th (somber natural minor)',
        'chords': 'i - ii° - ♭III - iv - v - ♭VI - ♭VII',
        'cadences': 'Modal Minor: i - iv - v - i | Classical: i - iv - V - i (using raised 7th)',
        'mood': 'Poignant, mournful, introspective, reflective'
    },
    {
        'name': 'Locrian',
        'degree': '7th Degree',
        'formula': '1 - ♭2 - ♭3 - 4 - ♭5 - ♭6 - ♭7',
        'char_interval': 'Diminished 5th (unstable tritone tonic triad i°)',
        'chords': 'i° - ♭II - ♭iii - iv - ♭V - ♭VI - ♭vii',
        'cadences': 'Locrian Resolution: i° - ♭V - i° (or ♭II → i°)',
        'mood': 'Tense, unresolved, eerie, unstable, gothic horror'
    }
]

print("Data loaded successfully.")
