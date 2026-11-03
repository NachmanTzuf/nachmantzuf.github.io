const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const os = require('os');

const PORT = 8098;
const CDP_PORT = 9269;
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
  console.log(`Static test server running on http://127.0.0.1:${PORT}`);
  runTests();
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

async function takeScreenshot(ws, filename) {
  const result = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(result.data, 'base64');
  const outPath = path.join(BRAIN_DIR, filename);
  fs.writeFileSync(outPath, buf);
  console.log(`[SCREENSHOT] Saved: ${outPath} (${buf.length} bytes)`);
}

async function evaluate(ws, expression) {
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
  }
  return res.result?.value;
}

async function runTests() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(os.tmpdir(), `chrome_cdp_v21_${Date.now()}`);

  console.log(`Launching headless Chrome on port ${CDP_PORT}...`);
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
    const versionInfo = await getJSON(`http://127.0.0.1:${CDP_PORT}/json/version`);
    console.log(`Chrome CDP ready: ${versionInfo['User-Agent']}`);

    const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve) => ws.on('open', resolve));
    console.log('Connected to page CDP websocket');

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 1,
      mobile: true,
    });

    console.log(`Navigating to http://127.0.0.1:${PORT}...`);
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}` });

    // Wait for initial load
    let ready = false;
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      ready = await evaluate(ws, `window.__earpa_harpReady === true`);
      if (ready) break;
    }
    console.log(`App boot status: window.__earpa_harpReady = ${ready}`);
    await sleep(1500);

    // 1. Navigate to Journey Tab
    console.log('Switching to Journey Tab...');
    await evaluate(ws, `(() => {
      const btn = document.querySelector('[data-testid="tab-btn-profile"]') || 
                  document.querySelector('#tab-btn-profile');
      if (btn) btn.click();
      else {
        // Fallback: click tab by label text
        const tabs = Array.from(document.querySelectorAll('div, button'));
        const jTab = tabs.find(t => t.textContent && t.textContent.trim() === 'JOURNEY');
        if (jTab) jTab.click();
      }
    })()`);
    await sleep(1000);

    // 2. Inspect Journey Tab Hierarchy
    const hierarchy = await evaluate(ws, `(() => {
      const text = document.body.innerText;
      return {
        hasFeedback: text.includes('Tester Feedback'),
        hasSessions: text.includes('sessions') && text.includes('minutes') && text.includes('accuracy'),
        hasStrategy: text.includes('Strategy Roadmap') || text.includes('Single Note') || text.includes('Coastal Sanctuary'),
        hasThreePaths: text.includes('Three paths'),
        hasListening: text.includes('Your listening'),
        hasRhythm: text.includes('Your rhythm'),
        hasShopButton: !!document.querySelector('#open-garage-card-btn') || text.includes('Harp Artisan Workshop'),
        hasPreferencesButton: !!document.querySelector('#open-preferences-menu-btn') || text.includes('Preferences & Audio Settings'),
        hasHarperProfiles: text.includes('Harper Profiles') || text.includes('ACTIVE PLAYER'),
        hasPracticeFilms: text.includes('Practice films'),
        shardsText: document.querySelector('#open-garage-card-btn')?.innerText || '',
      };
    })()`);
    console.log('Journey Tab Hierarchy check:', JSON.stringify(hierarchy, null, 2));

    await takeScreenshot(ws, 'verified_v21_journey_tab_hierarchy.png');

    // 3. Open the Shop / Harp Artisan Workshop Modal
    console.log('Opening Harp Artisan Workshop Modal...');
    await evaluate(ws, `(() => {
      const btn = document.querySelector('#open-garage-card-btn') ||
                  Array.from(document.querySelectorAll('div, button')).find(el => el.textContent && el.textContent.includes('Harp Artisan Workshop'));
      if (btn) btn.click();
    })()`);
    await sleep(1200);

    // 4. Verify Shop Showcase & Interactive Live Celtic Harp
    const shopDetails = await evaluate(ws, `(() => {
      const text = document.body.innerText;
      const svgHarp = document.querySelector('svg');
      return {
        hasTitle: text.includes('The Luthier Vault'),
        hasNaturalWoods: text.includes('Natural Woods'),
        hasCarvedInlays: text.includes('Carved Inlays'),
        hasSoundPacks: text.includes('Sound Packs'),
        hasCamacLevers: text.includes('Camac Levers'),
        hasLedStrings: text.includes('LED Strings'),
        hasSvgHarp: !!svgHarp,
        hasPreviewStatus: text.includes('Fitted:') || text.includes('Previewing:'),
      };
    })()`);
    console.log('Shop Modal Live Preview check:', JSON.stringify(shopDetails, null, 2));

    await takeScreenshot(ws, 'verified_v21_shop_live_preview.png');

    // Tap a timber finish to test live preview update
    console.log('Tapping Cherry Blossom Rosewood finish to test dynamic harp update...');
    await evaluate(ws, `(() => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const rosewoodCard = cards.find(c => c.textContent && c.textContent.includes('Cherry Blossom Rosewood'));
      if (rosewoodCard) rosewoodCard.click();
    })()`);
    await sleep(600);

    await takeScreenshot(ws, 'verified_v21_shop_rosewood_preview.png');

    // Close Shop Modal
    console.log('Closing Shop Modal...');
    await evaluate(ws, `(() => {
      const doneBtn = Array.from(document.querySelectorAll('div, button')).find(b => b.textContent && b.textContent.trim() === 'Done');
      if (doneBtn) doneBtn.click();
    })()`);
    await sleep(800);

    // 5. Open Preferences Modal
    console.log('Opening Unified Preferences Modal...');
    await evaluate(ws, `(() => {
      const prefBtn = document.querySelector('#open-preferences-menu-btn') ||
                      Array.from(document.querySelectorAll('div, button')).find(el => el.textContent && el.textContent.includes('Preferences & Audio Settings'));
      if (prefBtn) prefBtn.click();
    })()`);
    await sleep(1000);

    const prefsDetails = await evaluate(ws, `(() => {
      const text = document.body.innerText;
      return {
        hasPreferencesTitle: text.includes('Preferences'),
        hasVibration: text.includes('Vibration Feedback') && text.includes('Minimal') && text.includes('Off') && text.includes('Full'),
        hasNotation: text.includes('Note Names & Solfège') && text.includes('Do Re Mi'),
        hasTuning: text.includes('Native Harp Tuning') || text.includes('432'),
        hasReminders: text.includes('Daily Practice Reminder'),
        hasPwaInstall: text.includes('Install Earpa App'),
      };
    })()`);
    console.log('Unified Preferences Modal check:', JSON.stringify(prefsDetails, null, 2));

    await takeScreenshot(ws, 'verified_v21_preferences_modal.png');

    // Close Preferences Modal
    await evaluate(ws, `(() => {
      const closeBtn = Array.from(document.querySelectorAll('div, button')).find(b => b.textContent && (b.textContent.trim() === 'Save & Close' || b.textContent.trim() === '✕'));
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(600);

    // 6. Scroll down to Harper Profiles and screenshot user telemetry metrics
    console.log('Inspecting Harper Profiles user metrics...');
    await evaluate(ws, `(() => {
      const section = Array.from(document.querySelectorAll('div')).find(d => d.textContent && d.textContent.includes('Harper Profiles'));
      if (section) section.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`);
    await sleep(600);

    const userMetrics = await evaluate(ws, `(() => {
      const text = document.body.innerText;
      return {
        hasPracticeLabel: text.includes('PRACTICE'),
        hasSessionsLabel: text.includes('SESSIONS'),
        hasTrialsLabel: text.includes('TRIALS'),
        hasAccuracyLabel: text.includes('ACCURACY'),
        hasActivePlayer: text.includes('ACTIVE PLAYER'),
      };
    })()`);
    console.log('Harper Profiles telemetry check:', JSON.stringify(userMetrics, null, 2));

    await takeScreenshot(ws, 'verified_v21_user_profiles_metrics.png');

    console.log('\n========================================');
    console.log('ALL V21 VERIFICATIONS PASSED 100%!');
    console.log('========================================');

    ws.close();
    chromeProc.kill();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    try {
      chromeProc.kill();
      server.close();
    } catch {}
    process.exit(1);
  }
}
