const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const CDP_PORT = 9265;
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

  // Test combinations of targetY, radius, and theta around -0.95 rad (~-55 deg)
  const configs = [
    { name: 'fit_y54_r270_th095', theta: -0.95, targetY: 0.54, radius: 2.70 },
    { name: 'fit_y56_r275_th095', theta: -0.95, targetY: 0.56, radius: 2.75 },
    { name: 'fit_y58_r280_th095', theta: -0.95, targetY: 0.58, radius: 2.80 },
    { name: 'fit_y58_r280_th085', theta: -0.85, targetY: 0.58, radius: 2.80 },
    { name: 'fit_y60_r285_th095', theta: -0.95, targetY: 0.60, radius: 2.85 },
    { name: 'fit_y62_r290_th095', theta: -0.95, targetY: 0.62, radius: 2.90 },
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
    await captureScreenshot(ws, `${BRAIN_DIR}/framing_${c.name}.png`);
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
