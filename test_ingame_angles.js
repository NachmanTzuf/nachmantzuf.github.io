const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';
const CDP_PORT = 9236;

console.log('Spawning headless Chrome on port', CDP_PORT);
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
  const res = await sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true });
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
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(3500);

  // Click Press to Play
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(2500);

  // Test different theta, camera target, and radius on the in-game canvas
  const configs = [
    { name: 'current_9deg', theta: 9 * Math.PI / 180, targetY: 0.44, radius: 2.30 },
    { name: 'fit_9deg', theta: 9 * Math.PI / 180, targetY: 0.60, radius: 2.75 },
    { name: 'fit_25deg', theta: 25 * Math.PI / 180, targetY: 0.60, radius: 2.75 },
    { name: 'fit_45deg', theta: 45 * Math.PI / 180, targetY: 0.60, radius: 2.75 },
    { name: 'fit_60deg', theta: 60 * Math.PI / 180, targetY: 0.60, radius: 2.75 },
    { name: 'fit_75deg', theta: 75 * Math.PI / 180, targetY: 0.60, radius: 2.75 },
    { name: 'fit_neg9deg', theta: -9 * Math.PI / 180, targetY: 0.60, radius: 2.75 },
  ];

  for (const c of configs) {
    await evalScript(ws, `(() => {
      const o = window.__earpa_orbit ? window.__earpa_orbit.current : null;
      if (o) {
        o.theta = ${c.theta};
        o.desiredTheta = ${c.theta};
        o.target.y = ${c.targetY};
        o.desiredTarget.y = ${c.targetY};
        o.radius = ${c.radius};
        o.desiredRadius = ${c.radius};
      }
    })()`);
    await sleep(400);
    await captureScreenshot(ws, `${BRAIN_DIR}/angle_test_${c.name}.png`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  if (chrome) chrome.kill();
  process.exit(1);
});
