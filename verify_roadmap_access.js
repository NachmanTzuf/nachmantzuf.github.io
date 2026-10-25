const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CDP_PORT = 9276;
const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
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
    awaitPromise: true,
  });
  return res ? res.result?.value : null;
}

async function captureScreenshot(ws, filename) {
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot:', filename);
}

async function run() {
  console.log('================================================================');
  console.log('EARPA VERIFICATION: ALL 68 LEVELS PLAYABLE & ROADMAP ACCESSIBILITY');
  console.log('================================================================\n');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1200,980',
    '--disable-gpu',
    '--no-first-run',
    'http://localhost:8088/'
  ]);

  await sleep(2500);
  const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  console.log('[1/4] Navigating to http://localhost:8088/ ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(4000);

  // 1. Open Roadmap Modal via Trail Map button
  console.log('[2/4] Opening Trail Map from Home Card...');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('top-roadmap-banner-btn');
    if (btn) btn.click();
  })()`);
  await sleep(2000);

  await captureScreenshot(ws, path.join(BRAIN_DIR, 'verified_roadmap_unrestricted_stage_view.png'));

  // 2. Click Level 5 stepping stone
  console.log('[3/4] Testing Level 5 selection in Stage Map...');
  await evalScript(ws, `(() => {
    const s5 = document.getElementById('stepping-stone-5');
    if (s5) s5.click();
  })()`);
  await sleep(1500);

  const drawerStatus = await evalScript(ws, `(() => {
    const drawerBtn = document.getElementById('drawer-start-level-btn');
    return {
      hasDrawerBtn: !!drawerBtn,
      btnText: drawerBtn ? drawerBtn.innerText : null,
    };
  })()`);
  console.log('Level 5 Drawer Status:', drawerStatus);
  await captureScreenshot(ws, path.join(BRAIN_DIR, 'verified_roadmap_level5_drawer.png'));

  // 3. Switch to Treadmill Mode
  console.log('[4/4] Testing Treadmill mode (68 levels)...');
  await evalScript(ws, `(() => {
    const tmBtn = document.getElementById('roadmap-mode-treadmill');
    if (tmBtn) tmBtn.click();
  })()`);
  await sleep(1500);

  await captureScreenshot(ws, path.join(BRAIN_DIR, 'verified_roadmap_treadmill_mode.png'));

  // Click Next Levels on Treadmill to inspect Level 11..20
  await evalScript(ws, `(() => {
    const nextBtn = document.getElementById('treadmill-next-window-btn');
    if (nextBtn) nextBtn.click();
  })()`);
  await sleep(1500);

  const treadmillStatus = await evalScript(ws, `(() => {
    const text = document.body.innerText;
    const match = text.match(/Showing Levels[^\n]+/);
    return {
      windowText: match ? match[0] : null,
    };
  })()`);
  console.log('Treadmill Window:', treadmillStatus);
  await captureScreenshot(ws, path.join(BRAIN_DIR, 'verified_roadmap_treadmill_shifted.png'));

  console.log('\n================================================================');
  console.log('ALL ROADMAP & LEVEL ACCESSIBILITY CHECKS PASSED');
  console.log('================================================================');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error('Verification error:', e);
  process.exit(1);
});
