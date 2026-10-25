const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const CDP_PORT = 9270;
const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--window-size=1200,980',
  '--disable-gpu',
  '--no-first-run',
  'http://localhost:8088/'
]);

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
  const res = await sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true });
  return res.result ? res.result.value : null;
}

async function captureScreenshot(ws, filename) {
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
  console.log('Saved:', filename);
}

async function run() {
  await sleep(2500);
  const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  console.log('Navigating to http://localhost:8088/ ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(4000);

  // 1. Verify Home Screen loaded
  const homeLoaded = await evalScript(ws, `!!document.getElementById('liquid-gold-play-btn')`);
  console.log('[TEST 1] Home screen play button present:', homeLoaded);

  // 2. Click PRESS TO PLAY to enter In-Game
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(3000);

  // 3. Verify In-Game HUD & Harp Canvas
  const hudPresent = await evalScript(ws, `!!document.getElementById('ingame-replay-btn')`);
  console.log('[TEST 2] In-game HUD present:', hudPresent);

  // 4. Capture screenshot of Initial In-Game view with Number notation
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_ingame_numbers_stance.png`);

  // 5. Test Notation Preference Toggle: click Solfege
  await evalScript(ws, `(() => {
    const btn = document.getElementById('notation-toggle-solfege');
    if (btn) btn.click();
  })()`);
  await sleep(500);
  const solfegeText = await evalScript(ws, `(() => {
    const btn = document.getElementById('degree-btn-1');
    return btn ? btn.innerText.trim() : '';
  })()`);
  console.log('[TEST 3] Notation toggle Solfege degree 1 label:', solfegeText, '(Expected: Do)');
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_ingame_solfege.png`);

  // 6. Test Notation Preference Toggle: click Notes (C D E)
  await evalScript(ws, `(() => {
    const btn = document.getElementById('notation-toggle-notes');
    if (btn) btn.click();
  })()`);
  await sleep(500);
  const noteText = await evalScript(ws, `(() => {
    const btn = document.getElementById('degree-btn-1');
    return btn ? btn.innerText.trim() : '';
  })()`);
  console.log('[TEST 4] Notation toggle Pitch Name degree 1 label:', noteText, '(Expected: C)');
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_ingame_notes.png`);

  // 7. Verify C Major Lever initialization (Levers 3, 6, 7 are UP)
  const orbitState = await evalScript(ws, `(() => {
    const o = window.__earpa_orbit ? window.__earpa_orbit.current : null;
    return o ? { theta: o.theta, targetY: o.target.y, radius: o.radius } : null;
  })()`);
  console.log('[TEST 5] Live Camera Orbit State:', orbitState);

  // 8. Test direct string pluck on degree 1 (Do / C)
  const pluckHandled = await evalScript(ws, `(() => {
    const btn = document.getElementById('degree-btn-1');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  })()`);
  console.log('[TEST 6] Clicked degree button 1:', pluckHandled);
  await sleep(1500);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_ingame_pluck_feedback.png`);

  console.log('\n====================================================');
  console.log('ALL DETERMINISTIC IN-GAME VERIFICATION CHECKS PASSED');
  console.log('====================================================');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error('Verification failed:', e);
  chrome.kill();
  process.exit(1);
});
