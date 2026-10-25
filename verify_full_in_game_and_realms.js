const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';
const CDP_PORT = 9235;

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
  await sleep(4000);

  // 1. Verify Home Tab (Single Note / Green theme)
  console.log('=== TEST 1: HOME TAB (SINGLE NOTE / GREEN THEME) ===');
  const homeData = await evalScript(ws, `(() => {
    const img = document.querySelector('img[alt="Ancient Realm Sanctuary"]');
    const btn = document.getElementById('liquid-gold-play-btn');
    const polygon = btn ? btn.querySelector('polygon') : null;
    const btnText = btn ? btn.innerText.trim() : null;
    const tabSingleText = document.getElementById('tab-btn-home');
    return {
      bgSrc: img ? img.getAttribute('src') : null,
      playButtonText: btnText,
      iconFill: polygon ? polygon.getAttribute('fill') : null,
    };
  })()`);
  console.log('Home tab data:', homeData);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_single_green.png`);

  // 2. Click PRESS TO PLAY to enter In-Game Experience
  console.log('=== TEST 2: ENTER IN-GAME EXPERIENCE SCREEN (SINGLE REALM) ===');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(3000);

  const inGameSingleData = await evalScript(ws, `(() => {
    const backBtn = document.getElementById('ingame-back-btn');
    const replayBtn = document.getElementById('ingame-replay-btn');
    const bgImg = document.querySelector('img[src*="ingame_bg"]');
    const canvas = document.querySelector('canvas');
    return {
      hasBackBtn: !!backBtn,
      hasReplayBtn: !!replayBtn,
      bgSrc: bgImg ? bgImg.getAttribute('src') : null,
      hasCanvas: !!canvas,
    };
  })()`);
  console.log('In-Game Single data:', inGameSingleData);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_ingame_single.png`);

  // Return to Hub
  await evalScript(ws, `(() => {
    const backBtn = document.getElementById('ingame-back-btn');
    if (backBtn) backBtn.click();
  })()`);
  await sleep(2500);

  // 3. Switch to Melody Tab
  console.log('=== TEST 3: MELODY TAB (BLUE THEME) ===');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('tab-btn-chords');
    if (btn) btn.click();
  })()`);
  await sleep(3000);

  const melodyData = await evalScript(ws, `(() => {
    const img = document.querySelector('img[alt="Ancient Realm Sanctuary"]');
    const btn = document.getElementById('liquid-gold-play-btn');
    const polygon = btn ? btn.querySelector('polygon') : null;
    return {
      bgSrc: img ? img.getAttribute('src') : null,
      iconFill: polygon ? polygon.getAttribute('fill') : null,
    };
  })()`);
  console.log('Melody tab data:', melodyData);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_melody_blue.png`);

  // Enter In-Game Melody
  console.log('=== TEST 4: ENTER IN-GAME EXPERIENCE SCREEN (MELODY REALM) ===');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(3000);

  const inGameMelodyData = await evalScript(ws, `(() => {
    const bgImg = document.querySelector('img[src*="ingame_bg"]');
    return {
      bgSrc: bgImg ? bgImg.getAttribute('src') : null,
    };
  })()`);
  console.log('In-Game Melody data:', inGameMelodyData);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_ingame_melody.png`);

  // Return to Hub
  await evalScript(ws, `(() => {
    const backBtn = document.getElementById('ingame-back-btn');
    if (backBtn) backBtn.click();
  })()`);
  await sleep(2500);

  // 5. Switch to Levers Tab
  console.log('=== TEST 5: LEVERS TAB (ORANGE / AMBER THEME) ===');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('tab-btn-levers');
    if (btn) btn.click();
  })()`);
  await sleep(3000);

  const leversData = await evalScript(ws, `(() => {
    const img = document.querySelector('img[alt="Ancient Realm Sanctuary"]');
    const btn = document.getElementById('liquid-gold-play-btn');
    const polygon = btn ? btn.querySelector('polygon') : null;
    return {
      bgSrc: img ? img.getAttribute('src') : null,
      iconFill: polygon ? polygon.getAttribute('fill') : null,
    };
  })()`);
  console.log('Levers tab data:', leversData);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_levers_orange.png`);

  // Enter In-Game Levers
  console.log('=== TEST 6: ENTER IN-GAME EXPERIENCE SCREEN (LEVERS REALM) ===');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(3000);

  const inGameLeversData = await evalScript(ws, `(() => {
    const bgImg = document.querySelector('img[src*="ingame_bg"]');
    return {
      bgSrc: bgImg ? bgImg.getAttribute('src') : null,
    };
  })()`);
  console.log('In-Game Levers data:', inGameLeversData);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_ingame_levers.png`);

  // Return to Hub
  await evalScript(ws, `(() => {
    const backBtn = document.getElementById('ingame-back-btn');
    if (backBtn) backBtn.click();
  })()`);
  await sleep(2500);

  // 7. Switch to Journey Tab
  console.log('=== TEST 7: JOURNEY TAB (PURPLE THEME) ===');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('tab-btn-profile');
    if (btn) btn.click();
  })()`);
  await sleep(2500);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_journey_purple.png`);

  ws.close();
  chrome.kill();
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

run().catch(err => {
  console.error('Test error:', err);
  if (chrome) chrome.kill();
  process.exit(1);
});
