const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const os = require('os');

const PORT = 8100;
const CDP_PORT = 9271;
const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';
const DIST_DIR = path.join(__dirname, 'dist');

const MIMES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.css': 'text/css; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(DIST_DIR, reqPath);
  if (!fs.existsSync(filePath)) filePath = path.join(DIST_DIR, 'index.html');
  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Type': MIMES[ext] || 'application/octet-stream',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  run();
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

async function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(os.tmpdir(), `chrome_cdp_scroll2_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=412,915',
    '--force-device-scale-factor=1',
    'about:blank',
  ]);

  await sleep(1500);

  try {
    const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.on('open', resolve));

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 1,
      mobile: true,
    });

    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}` });

    for (let i = 0; i < 40; i++) {
      await sleep(500);
      const ready = await sendCDP(ws, 'Runtime.evaluate', {
        expression: 'window.__earpa_harpReady === true',
        returnByValue: true,
      });
      if (ready.result?.value) break;
    }
    await sleep(1500);

    // Switch to Journey tab
    console.log('Switching to Journey Tab...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#tab-btn-profile');
        if (btn) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      })()`,
    });
    await sleep(1200);

    // Verify Journey tab is displayed
    const tabState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        return {
          hasJourneyHeader: document.body.innerText.includes('Strategy Roadmap'),
          hasShop: !!document.querySelector('#open-garage-card-btn'),
          hasPrefs: !!document.querySelector('#open-preferences-menu-btn'),
        };
      })()`,
      returnByValue: true,
    });
    console.log('Tab state:', tabState.result?.value);

    // Scroll shop card into view
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('#open-garage-card-btn');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`,
    });
    await sleep(600);

    const shot1 = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v21_journey_shop_and_prefs_card.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved verified_v21_journey_shop_and_prefs_card.png');

    // Scroll to bottom to capture Harper Profiles and Practice Films
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const scrollers = document.querySelectorAll('*');
        for (const el of scrollers) {
          if (el.scrollHeight > el.clientHeight && el.clientHeight > 300) {
            el.scrollTop = el.scrollHeight;
          }
        }
      })()`,
    });
    await sleep(700);

    const shot2 = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v21_journey_profiles_and_films.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved verified_v21_journey_profiles_and_films.png');

    ws.close();
    chromeProc.kill();
    server.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    chromeProc.kill();
    server.close();
    process.exit(1);
  }
}
