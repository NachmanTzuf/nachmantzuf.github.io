const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const CDP_PORT = 9260;
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

  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(4000);

  // Click Press to Play to enter in-game
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(2500);

  // Sweep angles with calibrated targetY and radius
  const angles = [
    -2.35, -1.99, -1.57, -1.15, -0.78, -0.35,
    0.0, 0.35, 0.78, 1.15, 1.57, 1.99, 2.35
  ];

  for (const th of angles) {
    const label = (th >= 0 ? 'p' : 'n') + Math.abs(Math.round(th * 100));
    await evalScript(ws, `(() => {
      const o = window.__earpa_orbit ? window.__earpa_orbit.current : null;
      if (o) {
        o.theta = ${th};
        o.desiredTheta = ${th};
        o.target.y = 0.50;
        o.desiredTarget.y = 0.50;
        o.radius = 2.65;
        o.desiredRadius = 2.65;
      }
    })()`);
    await sleep(350);
    await captureScreenshot(ws, `${BRAIN_DIR}/sweep_${label}.png`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
