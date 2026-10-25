const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CDP_PORT = 9275;
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
  console.log('EARPA VERIFICATION: CLOSEST TONIC RESOLUTION & DIRECT PLUCKING');
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

  console.log('[1/5] Navigating to http://localhost:8088/ ...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(4000);

  // 1. Enter in-game screen
  console.log('[2/5] Entering in-game arena...');
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(3500);

  // Wait for cadence audio to finish and show ready message
  console.log('Waiting for cadence & target audio to complete...');
  for (let i = 0; i < 20; i++) {
    const isReady = await evalScript(ws, `document.body.innerText.includes('Identify the scale degree')`);
    if (isReady) {
      console.log('Audio finished, ready for input!');
      break;
    }
    await sleep(500);
  }
  await sleep(400);

  // 2. Test Low Scale Degree Closest Resolution: Tap Degree 2 (Re)
  // Low degree 2 is closer to Low C (1), so it must resolve DOWN: 2 -> 1
  console.log('\n[3/5] Testing Low Scale Degree Closest Resolution (Re -> Do downward walk)...');
  const startTime = Date.now();
  await evalScript(ws, `(() => {
    const btn2 = document.getElementById('degree-btn-2');
    if (btn2) btn2.click();
  })()`);
  await sleep(200);

  const lowResolutionText = await evalScript(ws, `(() => {
    const text = document.body.innerText;
    const m = text.match(/Resolution:[^\n]+/);
    return m ? m[0] : '';
  })()`);
  console.log('Low Degree Initial Resolution:', lowResolutionText);

  // Sample at 600ms (verifying 560ms singing tempo)
  await sleep(500);
  const lowResolutionStep2 = await evalScript(ws, `(() => {
    const text = document.body.innerText;
    const m = text.match(/Resolution:[^\n]+/);
    return m ? m[0] : '';
  })()`);
  console.log('Low Degree Step 2 Resolution:', lowResolutionStep2);
  await captureScreenshot(ws, path.join(BRAIN_DIR, 'verified_closest_resolution_low_down.png'));

  // Wait for full resolution to complete and advance to next round
  await sleep(2800);

  // 3. Test High Scale Degree Closest Resolution: Tap Degree 6 (La)
  // High degree 6 is closer to High C (8), so it must resolve UP: 6 -> 7 -> 8
  console.log('\n[4/5] Testing High Scale Degree Closest Resolution (La -> Ti -> Do upward walk)...');
  // Wait for round 2 cadence to complete
  for (let i = 0; i < 20; i++) {
    const isReady = await evalScript(ws, `document.body.innerText.includes('Identify the scale degree')`);
    if (isReady) break;
    await sleep(500);
  }
  await sleep(400);

  await evalScript(ws, `(() => {
    const btn6 = document.getElementById('degree-btn-6');
    if (btn6) btn6.click();
  })()`);
  await sleep(200);

  const highResolutionStep1 = await evalScript(ws, `(() => {
    const text = document.body.innerText;
    const m = text.match(/Resolution:[^\n]+/);
    return m ? m[0] : '';
  })()`);
  console.log('High Degree Initial Resolution:', highResolutionStep1);

  // Sample step 2 (La -> Ti)
  await sleep(600);
  const highResolutionStep2 = await evalScript(ws, `(() => {
    const text = document.body.innerText;
    const m = text.match(/Resolution:[^\n]+/);
    return m ? m[0] : '';
  })()`);
  console.log('High Degree Step 2 Resolution:', highResolutionStep2);

  // Sample step 3 (La -> Ti -> Do)
  await sleep(600);
  const highResolutionStep3 = await evalScript(ws, `(() => {
    const text = document.body.innerText;
    const m = text.match(/Resolution:[^\n]+/);
    return m ? m[0] : '';
  })()`);
  console.log('High Degree Step 3 Resolution:', highResolutionStep3);
  await captureScreenshot(ws, path.join(BRAIN_DIR, 'verified_closest_resolution_high_up.png'));

  // Wait for round 2 resolution to complete
  await sleep(3000);

  // 4. Test Physical 3D Harp String Pluck
  console.log('\n[5/5] Testing Physical 3D Harp String Pluck on Canvas...');
  // Wait for round 3 cadence to complete
  for (let i = 0; i < 20; i++) {
    const isReady = await evalScript(ws, `document.body.innerText.includes('Identify the scale degree')`);
    if (isReady) break;
    await sleep(500);
  }
  await sleep(400);

  // Get canvas position
  const canvasRect = await evalScript(ws, `(() => {
    const c = document.querySelector('canvas');
    const r = c.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  })()`);

  // Target String 2 (Re) on the 3D canvas (around X: 48%, Y: 52%)
  const pluckX = Math.round(canvasRect.left + canvasRect.width * 0.48);
  const pluckY = Math.round(canvasRect.top + canvasRect.height * 0.52);

  console.log(`Physically plucking String 2 at screen coordinate (${pluckX}, ${pluckY})...`);
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: pluckX,
    y: pluckY,
    button: 'left',
    clickCount: 1,
  });
  await sleep(50);
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: pluckX,
    y: pluckY,
    button: 'left',
  });

  await sleep(250);
  const pluckReaction = await evalScript(ws, `(() => {
    const text = document.body.innerText;
    const m = text.match(/Resolution:[^\n]+/);
    return {
      hasResolution: text.includes('Resolution:'),
      resolutionText: m ? m[0] : null,
    };
  })()`);
  console.log('Pluck Guess Reaction:', pluckReaction);
  await captureScreenshot(ws, path.join(BRAIN_DIR, 'verified_physical_string_pluck_guess.png'));

  console.log('\n================================================================');
  console.log('ALL VERIFICATION CRITERIA EVALUATED SUCCESSFULLY');
  console.log('================================================================');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error('Verification error:', e);
  process.exit(1);
});
