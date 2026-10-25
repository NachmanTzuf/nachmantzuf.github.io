const fs = require('fs');

const majorKeyData = {
  3:  { name: 'Eb', k: 0, notes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'], sig: '3 flats (Bb, Eb, Ab)', levers: [0, 0, 0, 0, 0, 0, 0] },
  10: { name: 'Bb', k: 1, notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'], sig: '2 flats (Bb, Eb)', levers: [0, 0, 0, 0, 0, 1, 0] },
  5:  { name: 'F',  k: 2, notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'], sig: '1 flat (Bb)', levers: [0, 0, 1, 0, 0, 1, 0] },
  0:  { name: 'C',  k: 3, notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], sig: 'Natural (0 accidentals)', levers: [0, 0, 1, 0, 0, 1, 1] },
  7:  { name: 'G',  k: 4, notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'], sig: '1 sharp (F#)', levers: [0, 0, 1, 1, 0, 1, 1] },
  2:  { name: 'D',  k: 5, notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'], sig: '2 sharps (F#, C#)', levers: [1, 0, 1, 1, 0, 1, 1] },
  9:  { name: 'A',  k: 6, notes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'], sig: '3 sharps (F#, C#, G#)', levers: [1, 0, 1, 1, 1, 1, 1] },
  4:  { name: 'E',  k: 7, notes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'], sig: '4 sharps (F#, C#, G#, D#)', levers: [1, 1, 1, 1, 1, 1, 1] },
  11: { name: 'B',  k: -1, notes: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'], sig: '5 sharps', reason: 'Requires A# (String A only produces Ab or A natural)' },
  6:  { name: 'F#', k: -1, notes: ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'], sig: '6 sharps', reason: 'Requires A# and E# (outside single-semitone throw)' },
  1:  { name: 'Db', k: -1, notes: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'], sig: '5 flats', reason: 'Requires Db and Gb (Strings D and G are tuned natural)' },
  8:  { name: 'Ab', k: -1, notes: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'], sig: '4 flats', reason: 'Requires Db (String D is tuned natural, cannot produce Db)' }
};

const rootPcMap = {
  'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11
};

const modes = [
  { name: 'Ionian', offset: 0, degree: 0 },
  { name: 'Dorian', offset: 2, degree: 1 },
  { name: 'Phrygian', offset: 4, degree: 2 },
  { name: 'Lydian', offset: 5, degree: 3 },
  { name: 'Mixolydian', offset: 7, degree: 4 },
  { name: 'Aeolian', offset: 9, degree: 5 },
  { name: 'Locrian', offset: 11, degree: 6 }
];

const tonics = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

let md = '| # | Tonic | Mode | Parent Major Key | Key Signature | Harp Acc.? | Fifths $k$ | Levers $[C,D,E,F,G,A,B]$ | Scale Note Spelling | Mechanical Diagnostic / Repertoire Note |\n';
md += '|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|\n';

let count = 0;
for (const tonic of tonics) {
  const tPc = rootPcMap[tonic];
  for (const m of modes) {
    count++;
    const parentPc = (tPc - m.offset + 12) % 12;
    const parent = majorKeyData[parentPc];
    
    // Scale notes:
    const scaleNotes = [];
    for (let i = 0; i < 7; i++) {
      scaleNotes.push(parent.notes[(i + m.degree) % 7]);
    }
    const scaleStr = scaleNotes.join(', ');

    if (parent.k >= 0) {
      const levStr = '[' + parent.levers.join(', ') + ']';
      md += `| ${count} | **${tonic}** | ${m.name} | ${parent.name} Major | ${parent.sig} | **YES** | ${parent.k} | \`${levStr}\` | ${scaleStr} | Standard Celtic harp accessible (Key $k=${parent.k}$) |\n`;
    } else {
      md += `| ${count} | **${tonic}** | ${m.name} | ${parent.name} Major | ${parent.sig} | **NO** | N/A | \`[-, -, -, -, -, -, -]\` | ${scaleStr} | Inaccessible: ${parent.reason} |\n`;
    }
  }
}

fs.writeFileSync('c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/scratch_table.md', md);
console.log('Saved scratch_table.md, rows:', count);
