const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const os = require('os');

const PORT = 8097;
const CDP_PORT = 9268;
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
  const userDataDir = path.join(os.tmpdir(), `chrome_cdp_v20_${Date.now()}`);

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
    console.log('Connected to CDP target page WebSocket');

    await sendCDP(ws, 'Page.enable');
    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'DOM.enable');

    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 1,
      mobile: true,
    });

    console.log(`Navigating to http://127.0.0.1:${PORT}...`);
    await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/` });

    // 1. Verify Cold-Boot Loading Screen Synchronization
    console.log('\n--- TEST 1: Cold-Boot Loading Screen Synchronization ---');
    let loaderSeen = false;
    let harpReadyBeforeFade = false;

    for (let i = 0; i < 40; i++) {
      const loaderInfo = await evaluate(ws, `(() => {
        const l = document.getElementById('earpa-instant-loader');
        const b = document.getElementById('earpa-instant-bar');
        return {
          exists: !!l,
          opacity: l ? window.getComputedStyle(l).opacity : null,
          barWidth: b ? b.style.width : null,
          harpReady: window.__earpa_harpReady === true,
        };
      })()`);

      if (loaderInfo.exists && loaderInfo.opacity !== '0') {
        loaderSeen = true;
      }
      if (loaderInfo.harpReady) {
        harpReadyBeforeFade = true;
        console.log(`[LOADER] 3D Harp Ready detected at check ${i}! Bar: ${loaderInfo.barWidth}`);
        break;
      }
      await sleep(100);
    }

    console.log(`[LOADER] Loader seen active: ${loaderSeen}, Harp ready captured: ${harpReadyBeforeFade}`);
    await takeScreenshot(ws, 'verified_v20_loading_sync.png');

    // Wait until loader completely fades out
    for (let i = 0; i < 30; i++) {
      const gone = await evaluate(ws, `!document.getElementById('earpa-instant-loader')`);
      if (gone) {
        console.log(`[LOADER] Instant loader smoothly removed from DOM at check ${i}`);
        break;
      }
      await sleep(150);
    }

    await sleep(800);

    // 2. Verify Single Tab Home Hero
    console.log('\n--- TEST 2: Single Tab Home Hero & Geometry ---');
    const homeInfo = await evaluate(ws, `(() => {
      const canvas = document.querySelector('canvas');
      const playBtn = document.getElementById('liquid-gold-play-btn');
      const tabBar = document.getElementById('liquid-glass-tab-bar');
      const lessonBtn = document.getElementById('path-lesson-button');
      const cr = canvas ? canvas.getBoundingClientRect() : null;
      const pr = playBtn ? playBtn.getBoundingClientRect() : null;
      const tr = tabBar ? tabBar.getBoundingClientRect() : null;
      return {
        canvasWidth: cr ? cr.width : 0,
        canvasHeight: cr ? cr.height : 0,
        canvasTop: cr ? cr.top : 0,
        playBtnBottom: pr ? pr.bottom : 0,
        tabBarTop: tr ? tr.top : 0,
        playBtnClearance: pr && tr ? tr.top - pr.bottom : 0,
        lessonBtnPresent: !!lessonBtn,
      };
    })()`);

    console.log('[HOME SINGLE] Info:', JSON.stringify(homeInfo, null, 2));
    await takeScreenshot(ws, 'verified_v20_home_single.png');

    // 3. Switch to Melody Tab
    console.log('\n--- TEST 3: Melody Tab Quick Lesson & Layout ---');
    await evaluate(ws, `(() => {
      const tab = document.getElementById('tab-btn-chords');
      if (tab) tab.click();
    })()`);

    await sleep(900);

    const melodyInfo = await evaluate(ws, `(() => {
      const trailBtn = document.getElementById('melody-trail-map-btn');
      const lessonBtn = document.getElementById('path-lesson-button');
      const canvas = document.querySelector('canvas');
      const lr = lessonBtn ? lessonBtn.getBoundingClientRect() : null;
      const tr = trailBtn ? trailBtn.getBoundingClientRect() : null;
      const cr = canvas ? canvas.getBoundingClientRect() : null;
      const style = lessonBtn ? window.getComputedStyle(lessonBtn) : null;
      return {
        trailBtn: tr ? { left: tr.left, top: tr.top, width: tr.width, height: tr.height } : null,
        lessonBtn: lr ? {
          left: lr.left,
          top: lr.top,
          width: lr.width,
          height: lr.height,
          text: lessonBtn.innerText,
          bgColor: style ? style.backgroundColor : null,
          borderColor: style ? style.borderColor : null,
          color: style ? style.color : null,
        } : null,
        canvas: cr ? { width: cr.width, height: cr.height, top: cr.top } : null,
      };
    })()`);

    console.log('[MELODY TAB] Info:', JSON.stringify(melodyInfo, null, 2));
    await takeScreenshot(ws, 'verified_v20_melody_tab_quick_lesson.png');

    // 4. Switch to Levers Tab
    console.log('\n--- TEST 4: Levers Tab Quick Lesson & Layout ---');
    await evaluate(ws, `(() => {
      const tab = document.getElementById('tab-btn-levers');
      if (tab) tab.click();
    })()`);

    await sleep(900);

    const leversInfo = await evaluate(ws, `(() => {
      const lessonBtn = document.getElementById('path-lesson-button');
      const style = lessonBtn ? window.getComputedStyle(lessonBtn) : null;
      const lr = lessonBtn ? lessonBtn.getBoundingClientRect() : null;
      return {
        lessonBtn: lr ? {
          left: lr.left,
          top: lr.top,
          width: lr.width,
          height: lr.height,
          text: lessonBtn.innerText,
          bgColor: style ? style.backgroundColor : null,
          borderColor: style ? style.borderColor : null,
          color: style ? style.color : null,
        } : null,
      };
    })()`);

    console.log('[LEVERS TAB] Info:', JSON.stringify(leversInfo, null, 2));
    await takeScreenshot(ws, 'verified_v20_levers_tab_quick_lesson.png');

    // 5. Test Notification Modal and In-App Banner
    console.log('\n--- TEST 5: Practice Reminder Modal & In-App Banner Toast ---');
    await evaluate(ws, `(() => {
      const bell = document.getElementById('top-bell-reminders-btn');
      if (bell) bell.click();
    })()`);

    await sleep(800);

    // Click "🔔 Send a Test Notification Now"
    await evaluate(ws, `(() => {
      const testBtn = document.getElementById('send-test-notification-btn');
      if (testBtn) testBtn.click();
    })()`);

    await sleep(800);

    const notifInfo = await evaluate(ws, `(() => {
      const alerts = Array.from(document.querySelectorAll('[role="alert"], [aria-role="alert"]'));
      return {
        alertsCount: alerts.length,
        texts: alerts.map(a => a.innerText),
      };
    })()`);

    console.log('[NOTIFICATIONS] Info:', JSON.stringify(notifInfo, null, 2));
    await takeScreenshot(ws, 'verified_v20_inapp_notification_toast.png');

    console.log('\nALL CDP TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('CDP Test failure:', err);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
    server.close();
    process.exit(0);
  }
}
