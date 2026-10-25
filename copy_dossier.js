const fs = require('fs');
const path = require('path');

const target1 = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/R3_MATHEMATICAL_THEORY_MODAL_ALGORITHMS.md';
const target2 = 'C:/Users/Hp/.gemini/antigravity/brain/6a3512a2-ced3-43d1-8d00-6ff7f0ccddaf/R3_MATHEMATICAL_THEORY_MODAL_ALGORITHMS.md';

const source = 'c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/r3_content.md';
const content = fs.readFileSync(source, 'utf-8');

fs.writeFileSync(target1, content, 'utf-8');
console.log('Successfully written to target 1:', target1, 'Bytes:', fs.statSync(target1).size);

try {
  fs.mkdirSync(path.dirname(target2), { recursive: true });
  fs.writeFileSync(target2, content, 'utf-8');
  console.log('Successfully written to target 2:', target2, 'Bytes:', fs.statSync(target2).size);
} catch (e) {
  console.log('Target 2 notice:', e.message);
}
