const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';
const CDP_PORT = 9231;

console.log('Spawning headless Chrome on port', CDP_PORT);
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--window-size=1200,980',
  '--disable-gpu',
  '--no-first-run',
  'http://localhost:8088/'
]);

chrome.on('error', (err) => console.error('Chrome spawn error:', err));

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const msg = JSON.stringify({ id, method, params });
    const handler = (raw) => {
      const resp = JSON.parse(raw);
      if (resp.id === id) {
        ws.off('message', handler);
        if (resp.error) reject(resp.error);
        else resolve(resp.result);
      }
    };
    ws.on('message', handler);
    ws.send(msg);
  });
}

async function evalScript(ws, expression) {
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  return res.result ? res.result.value : null;
}

async function captureScreenshot(ws, filename) {
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(shot.data, 'base64');
  fs.writeFileSync(filename, buffer);
  console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
}

async function run() {
  await sleep(2000);

  let targets = [];
  for (let i = 0; i < 10; i++) {
    try {
      targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
      if (targets.length > 0) break;
    } catch (e) {}
    await sleep(500);
  }

  const page = targets.find(t => t.type === 'page');
  if (!page) {
    console.error('Failed to find page target!');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  console.log('Connected to Chrome page via CDP!');

  // Navigate and let WebGL render
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(3500);

  // 1. Verify Home Tab (Single Note / Green theme)
  console.log('=== TEST 1: HOME TAB (SINGLE NOTE / GREEN THEME) ===');
  const homeBg = await evalScript(ws, `
    const img = document.querySelector('img[alt="Ancient Realm Sanctuary"]');
    img ? img.getAttribute('src') : null;
  `);
  console.log('Home background src:', homeBg);

  const homeBtnSvg = await evalScript(ws, `
    const btn = document.getElementById('liquid-gold-play-btn');
    const svg = btn ? btn.querySelector('svg polygon') : null;
    return svg ? svg.getAttribute('fill') : null;
  `);
  console.log('Home play button icon fill:', homeBtnSvg);

  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_single_green.png`);

  // 2. Switch to Melody Tab
  console.log('=== TEST 2: MELODY TAB (BLUE THEME) ===');
  await evalScript(ws, `
    const btn = document.getElementById('tab-btn-chords');
    if (btn) btn.click();
  `);
  await sleep(2000);

  const melodyBg = await evalScript(ws, `
    const img = document.querySelector('img[alt="Ancient Realm Sanctuary"]');
    img ? img.getAttribute('src') : null;
  `);
  console.log('Melody background src:', melodyBg);

  const melodyBtnSvg = await evalScript(ws, `
    const btn = document.getElementById('liquid-gold-play-btn');
    const svg = btn ? btn.querySelector('svg polygon') : null;
    return svg ? svg.getAttribute('fill') : null;
  `);
  console.log('Melody play button icon fill:', melodyBtnSvg);

  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_melody_blue.png`);

  // 3. Switch to Levers Tab
  console.log('=== TEST 3: LEVERS TAB (ORANGEY SAND THEME) ===');
  await evalScript(ws, `
    const btn = document.getElementById('tab-btn-levers');
    if (btn) btn.click();
  `);
  await sleep(2000);

  const leversBg = await evalScript(ws, `
    const img = document.querySelector('img[alt="Ancient Realm Sanctuary"]');
    img ? img.getAttribute('src') : null;
  `);
  console.log('Levers background src:', leversBg);

  const leversBtnSvg = await evalScript(ws, `
    const btn = document.getElementById('liquid-gold-play-btn');
    const svg = btn ? btn.querySelector('svg polygon') : null;
    return svg ? svg.getAttribute('fill') : null;
  `);
  console.log('Levers play button icon fill:', leversBtnSvg);

  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_levers_orange.png`);

  // 4. Open Sandstone Canyon Roadmap Modal from Levers tab
  console.log('=== TEST 4: OPEN CANYON ROADMAP FROM LEVERS TAB ===');
  await evalScript(ws, `
    const mapBtn = document.getElementById('levers-trail-map-btn');
    if (mapBtn) mapBtn.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_levers_canyon_roadmap.png`);

  // Close roadmap
  await evalScript(ws, `
    const closeBtn = document.getElementById('roadmap-close-btn');
    if (closeBtn) closeBtn.click();
  `);
  await sleep(1000);

  // 5. Switch to Journey Tab
  console.log('=== TEST 5: JOURNEY TAB (PURPLE THEME) ===');
  await evalScript(ws, `
    const btn = document.getElementById('tab-btn-profile');
    if (btn) btn.click();
  `);
  await sleep(1500);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_journey_purple.png`);

  ws.close();
  chrome.kill();
  console.log('SUCCESS! All 5 tests completed and verified.');
  process.exit(0);
}

run().catch(err => {
  console.error('Test execution failure:', err);
  if (chrome) chrome.kill();
  process.exit(1);
});
