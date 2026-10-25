const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const CDP_PORT = 9255;
const OUT_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';

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

async function main() {
  console.log('Starting local server...');
  const server = spawn('node', ['serve.js'], { stdio: 'inherit' });
  await sleep(1500);

  console.log('Spawning Chrome on port', CDP_PORT);
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1024,1024',
    '--disable-gpu',
    '--no-first-run',
    'http://localhost:8088/render_icon_generator.html'
  ]);

  try {
    await sleep(2500);
    let targets = [];
    for (let i = 0; i < 15; i++) {
      try {
        targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
        if (targets.length > 0) break;
      } catch (e) {}
      await sleep(500);
    }

    const page = targets.find(t => t.type === 'page');
    if (!page) throw new Error('No page target found');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('Waiting for 3D model render...');
    const ready = await evalScript(ws, `new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.__ICON_RENDER_READY) {
          clearInterval(interval);
          resolve(true);
        }
        if (window.__ICON_RENDER_ERROR) {
          clearInterval(interval);
          resolve(false);
        }
      }, 200);
      setTimeout(() => { clearInterval(interval); resolve(false); }, 15000);
    })`);

    console.log('Render ready status:', ready);
    await sleep(800);

    // 1. Get transparent canvas data URL
    const canvasDataUrl = await evalScript(ws, `(() => {
      const c = document.getElementById('three-canvas');
      return c ? c.toDataURL('image/png') : null;
    })()`);

    if (canvasDataUrl) {
      const base64Data = canvasDataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(`${OUT_DIR}/harp_transparent_1024.png`, Buffer.from(base64Data, 'base64'));
      console.log('Saved transparent harp PNG!');
    }

    // 2. Capture full composite screenshot of #icon-stage
    const shot = await sendCDP(ws, 'Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1024, height: 1024, scale: 1 }
    });
    const shotBuffer = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(`${OUT_DIR}/master_icon_composite_1024.png`, shotBuffer);
    console.log(`Saved master composite screenshot: ${shotBuffer.length} bytes`);

    ws.close();
    chrome.kill();
  } finally {
    server.kill();
  }
}

main().catch(err => {
  console.error('Error during icon capture:', err);
  process.exit(1);
});
