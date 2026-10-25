const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const CDP_PORT = 9250;
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

  // Enter In-Game
  await evalScript(ws, `(() => {
    const btn = document.getElementById('liquid-gold-play-btn');
    if (btn) btn.click();
  })()`);
  await sleep(2500);

  const testAngles = [
    { name: 'angle_pos_1_15', theta: 1.15 },
    { name: 'angle_neg_1_15', theta: -1.15 },
    { name: 'angle_pos_1_99', theta: 1.99 },
    { name: 'angle_neg_1_99', theta: -1.99 },
    { name: 'angle_pos_4_29', theta: 4.29 },
    { name: 'angle_neg_4_29', theta: -4.29 },
  ];

  for (const item of testAngles) {
    await evalScript(ws, `(() => {
      if (window.__earpa_setTheta) {
        window.__earpa_setTheta(${item.theta});
      }
    })()`);
    await sleep(600);
    await captureScreenshot(ws, `${BRAIN_DIR}/${item.name}.png`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run();
