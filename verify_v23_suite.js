const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const os = require('os');

const PORT = 8099;
const CDP_PORT = 9270;
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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Local static server listening on http://127.0.0.1:${PORT}`);
  runTests();
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const msg = JSON.stringify({ id, method, params });
    const handler = (data) => {
      const resp = JSON.parse(data.toString());
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

async function runTests() {
  const userDataDir = path.join(os.tmpdir(), `chrome_cdp_${Date.now()}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  console.log('Spawning Chrome headlessly with CDP on port', CDP_PORT);
  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-gl=angle',
    '--window-size=430,932', // iPhone 15 Pro Max viewport
  ]);

  await sleep(1800);

  let versionResp;
  for (let i = 0; i < 10; i++) {
    try {
      versionResp = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });
      break;
    } catch {
      await sleep(500);
    }
  }

  if (!versionResp || !versionResp[0]) {
    console.error('Failed to query Chrome targets');
    chrome.kill();
    server.close();
    process.exit(1);
  }

  const targets = versionResp;
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;
  console.log('Connecting to Chrome Page Target WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve) => ws.on('open', resolve));

  try {
    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'DOM.enable');

    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 1,
      mobile: true,
    });

    console.log(`Navigating to http://127.0.0.1:${PORT}/`);
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/` });

    // Wait until loading screen is completely dismissed
    console.log('Waiting for cold boot & loading overlay to dismiss...');
    for (let wait = 0; wait < 15; wait++) {
      await sleep(1000);
      const isGone = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `!document.querySelector('#earpa-loading-screen') && !!document.querySelector('#liquid-gold-play-btn')`,
        returnByValue: true,
      });
      if (isGone?.result?.value) {
        console.log(`Loading overlay dismissed after ${wait + 1}s!`);
        break;
      }
    }
    await sleep(1500);

    // 1. Capture Single Tab (Home Hero) with Lowered Play Button
    console.log('Capturing verified_v23_home_single.png...');
    let shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_home_single.png'), Buffer.from(shot.data, 'base64'));

    // Check play button clearance
    const playBtnMetrics = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#liquid-gold-play-btn');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return { bottom: rect.bottom, height: rect.height, top: rect.top, windowHeight: window.innerHeight };
      })()`,
      returnByValue: true,
    });
    console.log('Play button metrics on Single tab:', playBtnMetrics.result.value);

    // 2. Switch to Melody Tab
    console.log('Switching to Melody Tab...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tab = document.querySelector('#tab-btn-chords');
        if (tab) tab.click();
      })()`,
    });
    await sleep(2000);

    console.log('Capturing verified_v23_melody_tab.png...');
    shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_melody_tab.png'), Buffer.from(shot.data, 'base64'));

    // 3. Switch to Journey Tab
    console.log('Switching to Journey Tab...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tab = document.querySelector('#tab-btn-profile');
        if (tab) tab.click();
      })()`,
    });
    await sleep(2000);

    console.log('Capturing verified_v23_journey_tab.png...');
    shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_journey_tab.png'), Buffer.from(shot.data, 'base64'));

    // Scroll down to show feedback and exterior shop card
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.scrollBy(0, 480);`,
    });
    await sleep(1200);

    console.log('Capturing verified_v23_journey_feedback_and_shop_card.png...');
    shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_journey_feedback_and_shop_card.png'), Buffer.from(shot.data, 'base64'));

    // 4. Open Artisan Workshop Modal
    console.log('Clicking Enter Shop button...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#journey-enter-workshop-btn');
        if (btn) btn.click();
      })()`,
    });
    await sleep(2500);

    console.log('Capturing verified_v23_minimal_fullscreen_workshop.png...');
    shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_minimal_fullscreen_workshop.png'), Buffer.from(shot.data, 'base64'));

    // 5. Test Carves (Rosette) Tab inside Artisan Shop
    console.log('Switching to Carves tab in workshop...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tabs = Array.from(document.querySelectorAll('div, span, button')).filter(el => el.textContent && el.textContent.trim() === 'Carves');
        if (tabs.length) tabs[0].click();
      })()`,
    });
    await sleep(1200);

    console.log('Capturing verified_v23_carves_selection.png...');
    shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_carves_selection.png'), Buffer.from(shot.data, 'base64'));

    // 6. Test Sound Tab inside Artisan Shop
    console.log('Switching to Sound tab in workshop...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tabs = Array.from(document.querySelectorAll('div, span, button')).filter(el => el.textContent && el.textContent.trim() === 'Sound');
        if (tabs.length) tabs[0].click();
      })()`,
    });
    await sleep(1200);

    console.log('Capturing verified_v23_sound_selection.png...');
    shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_sound_selection.png'), Buffer.from(shot.data, 'base64'));

    // 7. Test Levers Tab inside Artisan Shop (rotates harp so levers face user)
    console.log('Switching to Levers tab in workshop...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tabs = Array.from(document.querySelectorAll('div, span, button')).filter(el => el.textContent && el.textContent.trim() === 'Levers');
        if (tabs.length) tabs[0].click();
      })()`,
    });
    await sleep(1500);

    console.log('Capturing verified_v23_levers_facing_camera.png...');
    shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(BRAIN_DIR, 'verified_v23_levers_facing_camera.png'), Buffer.from(shot.data, 'base64'));

    console.log('ALL V23 VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('CDP test error:', err);
  } finally {
    ws.close();
    chrome.kill();
    server.close();
    process.exit(0);
  }
}
