const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const distDir = path.resolve(__dirname, '..', 'dist');
const outputDir = path.resolve(__dirname, 'public/textures/path1_v36');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const HTTP_PORT = 8091;
const CDP_PORT = 9255;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = (req.url || '/').split('?')[0];
      let filePath = path.join(distDir, cleanUrl === '/' ? 'index.html' : cleanUrl);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(HTTP_PORT, '127.0.0.1', () => {
      console.log(`Serving dist/ at http://127.0.0.1:${HTTP_PORT}`);
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (raw) => {
      const resp = JSON.parse(raw);
      if (resp.id === id) {
        ws.off('message', handler);
        if (resp.error) reject(resp.error);
        else resolve(resp.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalScript(ws, expression) {
  const res = await sendCDP(ws, 'Runtime.evaluate', { expression, returnByValue: true });
  return res.result ? res.result.value : null;
}

async function clickNativeId(ws, id) {
  return await evalScript(ws, `(() => {
    const el = document.getElementById('${id}');
    if (!el) return false;
    el.click();
    return true;
  })()`);
}

async function clickNodeNumber(ws, numStr) {
  return await evalScript(ws, `(() => {
    const candidates = Array.from(document.querySelectorAll('div')).filter(d => {
      const txt = (d.innerText || d.textContent || '').trim();
      return txt === '${numStr}' || txt.startsWith('${numStr}\\n') || txt.endsWith('\\n${numStr}');
    });
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.width < 90 && r.height < 90) {
        el.click();
        return true;
      }
    }
    return false;
  })()`);
}

async function waitForSplashGone(ws) {
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const ready = await evalScript(ws, `(() => {
      const btn = document.getElementById('top-roadmap-banner-btn');
      const play = document.getElementById('liquid-gold-play-btn');
      if (!btn || !play) return false;
      const r = play.getBoundingClientRect();
      // Ensure splash container is gone or fully transparent
      const txt = document.body.innerText || '';
      return r.height > 20 && txt.includes('PRESS TO PLAY') && txt.includes('TRAIL MAP');
    })()`);
    if (ready) {
      await sleep(2500);
      return true;
    }
  }
  return false;
}

async function captureScreenshot(ws, filename) {
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(shot.data, 'base64');
  fs.writeFileSync(filename, buffer);
  console.log(`Saved: ${path.basename(filename)} (${buffer.length} bytes)`);
}

async function setProfile(ws, singleProg) {
  await evalScript(ws, `(() => {
    const profile = {
      id: 'usr_default_bard',
      username: 'CelticHarper',
      displayName: 'Celtic Harper',
      avatarIcon: 'lyre',
      avatarColor: '#10b981',
      experienceLevel: 'Apprentice Harper',
      createdTimestamp: Date.now() - 86400000 * 10,
      lastActiveTimestamp: Date.now(),
      totalPracticeTimeSeconds: 4200,
      totalSessionsPlayed: 24,
      totalTrialsAttempted: 240,
      totalCorrectTrials: 232,
      overallAccuracyPct: 96.6,
      highestStreak: 14,
      activeTuning: 'eb_major',
      leverStage: 4,
      onboardingComplete: true,
      progress: { single: ${singleProg}, melody: 4 },
      notationPreference: 'notes',
      hapticsEnabled: true,
      hapticMode: 'full',
      shardsBalance: 1250
    };
    localStorage.setItem('earpa_user_profiles_v1', JSON.stringify([profile]));
    localStorage.setItem('earpa_active_user_id_v1', 'usr_default_bard');
    return true;
  })()`);
}

async function main() {
  const server = await startStaticServer();
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1280,1080',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--no-first-run',
    `http://127.0.0.1:${HTTP_PORT}/`,
  ]);

  await sleep(2500);

  let targets = [];
  for (let i = 0; i < 15; i++) {
    try {
      targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
      if (targets.some((t) => t.type === 'page')) break;
    } catch {}
    await sleep(400);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));

  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true,
    screenWidth: 393,
    screenHeight: 852,
  });

  // Pass 1: Level 12 Sanctuary + P1-11 + P1-12 + In-Game Letter Notation
  await setProfile(ws, 12);
  await sendCDP(ws, 'Page.reload');
  await waitForSplashGone(ws);
  await sleep(1500);

  // Verify splash gone by checking innerText doesn't stall on splash; extra grace time
  await captureScreenshot(ws, path.join(outputDir, 'home_sanctuary.png'));

  // Open Roadmap (starts on activeLevel=12 -> Levels 12 - 21; click prev -> Levels 7 - 16 so 11 and 12 sit on cliff)
  await clickNativeId(ws, 'top-roadmap-banner-btn');
  await sleep(1500);
  await clickNativeId(ws, 'treadmill-prev-window-btn');
  await sleep(1000);

  // Inspect P1-11
  const c11 = await clickNodeNumber(ws, '11');
  console.log('Clicked node 11:', c11);
  await sleep(900);
  await captureScreenshot(ws, path.join(outputDir, 'roadmap_p1_11.png'));

  // Inspect P1-12
  const c12 = await clickNodeNumber(ws, '12');
  console.log('Clicked node 12:', c12);
  await sleep(900);
  await captureScreenshot(ws, path.join(outputDir, 'roadmap_p1_12.png'));

  // Play P1-12!
  await clickNativeId(ws, 'level-card-play');
  console.log('Entering P1-12 arena...');
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    const txt = await evalScript(ws, `document.body.innerText || ''`);
    if (txt.includes('Your turn')) break;
  }
  await sleep(800);
  await captureScreenshot(ws, path.join(outputDir, 'ingame_p1_12_clean.png'));

  // Pass 2: Unlocked Coastal Progression (Levels 25-34)
  await setProfile(ws, 30);
  await sendCDP(ws, 'Page.reload');
  await waitForSplashGone(ws);
  await clickNativeId(ws, 'top-roadmap-banner-btn');
  await sleep(1400);
  await clickNativeId(ws, 'treadmill-prev-window-btn'); // 30 -> 25
  await sleep(1000);
  await captureScreenshot(ws, path.join(outputDir, 'roadmap_progression.png'));

  console.log('=== All 3x captures complete ===');
  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
