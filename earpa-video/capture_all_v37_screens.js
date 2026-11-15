const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const distDir = path.resolve(__dirname, '..', 'dist');
const outputDir = path.resolve(__dirname, 'public/textures/v37');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const HTTP_PORT = 8093;
const CDP_PORT = 9258;

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
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return res.result ? res.result.value : null;
}

async function clickById(ws, id) {
  return await evalScript(ws, `(() => {
    const el = document.getElementById('${id}');
    if (!el) return false;
    el.click();
    return true;
  })()`);
}

async function clickByText(ws, exactOrSub, partial = false) {
  return await evalScript(ws, `(() => {
    const els = Array.from(document.querySelectorAll('div, span, button')).filter(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const t = (el.innerText || el.textContent || '').trim();
      return ${partial ? `t.includes(${JSON.stringify(exactOrSub)})` : `t === ${JSON.stringify(exactOrSub)}`};
    });
    // Pick deepest clickable node
    els.sort((a, b) => (a.children.length - b.children.length));
    for (const el of els) {
      el.click();
      return true;
    }
    return false;
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
      if (r.width > 0 && r.height > 0 && r.width < 95 && r.height < 95) {
        el.click();
        return true;
      }
    }
    return false;
  })()`);
}

async function waitForHub(ws) {
  for (let i = 0; i < 45; i++) {
    await sleep(400);
    const ok = await evalScript(ws, `(() => {
      const btn = document.getElementById('top-roadmap-banner-btn');
      const play = document.getElementById('liquid-gold-play-btn');
      const txt = document.body.innerText || '';
      return !!btn && !!play && play.getBoundingClientRect().height > 20 && txt.includes('PRESS TO PLAY');
    })()`);
    if (ok) {
      await sleep(2200);
      return true;
    }
  }
  return false;
}

async function snap(ws, name) {
  const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(res.data, 'base64');
  const out = path.join(outputDir, name);
  fs.writeFileSync(out, buf);
  console.log(`[CAP] ${name} (${buf.length} bytes)`);
}

async function seedProfile(ws, { single = 12, melody = 4, leverStage = 0 }) {
  await evalScript(ws, `(() => {
    const profile = {
      id: 'usr_default_bard',
      username: 'CelticHarper',
      displayName: 'Celtic Harper',
      avatarIcon: 'lyre',
      avatarColor: '#10b981',
      experienceLevel: 'Apprentice Bard',
      createdTimestamp: Date.now() - 86400000 * 14,
      lastActiveTimestamp: Date.now(),
      totalPracticeTimeSeconds: 5400,
      totalSessionsPlayed: 32,
      totalTrialsAttempted: 380,
      totalCorrectTrials: 356,
      overallAccuracyPct: 93.7,
      highestStreak: 16,
      activeTuning: 'Eb_Major_Native',
      leverStage: ${leverStage},
      onboardingComplete: true,
      progress: { single: ${single}, melody: ${melody} },
      notationPreference: 'notes',
      hapticsEnabled: true,
      hapticMode: 'full',
      shardsBalance: 1450
    };
    localStorage.setItem('earpa_user_profiles_v1', JSON.stringify([profile]));
    localStorage.setItem('earpa_active_user_id_v1', 'usr_default_bard');
    return true;
  })()`);
}

// Install fast timer multiplier ONLY inside capture browser when requested so full 15-round sessions complete fast cleanly
async function installFastTimerShim(ws) {
  await evalScript(ws, `(() => {
    if (!window.__origSetTimeout) {
      window.__origSetTimeout = window.setTimeout.bind(window);
      window.__fastMode = false;
      window.setTimeout = function(fn, ms, ...args) {
        const eff = window.__fastMode && typeof ms === 'number' && ms > 40 ? 12 : ms;
        return window.__origSetTimeout(fn, eff, ...args);
      };
    }
    return true;
  })()`);
}

async function runSingleCapture(ws) {
  await seedProfile(ws, { single: 12, melody: 4, leverStage: 0 });
  await sendCDP(ws, 'Page.reload');
  await waitForHub(ws);
  await snap(ws, 'p1_home.png');

  // Open Single Roadmap & preview P1-12
  await clickById(ws, 'top-roadmap-banner-btn');
  await sleep(1200);
  await clickById(ws, 'treadmill-prev-window-btn');
  await sleep(900);
  await clickNodeNumber(ws, '12');
  await sleep(800);
  await snap(ws, 'p1_map_12.png');

  // Launch P1-12 in-game
  await clickById(ws, 'level-card-play');
  for (let i = 0; i < 30; i++) {
    await sleep(450);
    const t = await evalScript(ws, `document.body.innerText || ''`);
    if (t.includes('Your turn')) break;
  }
  await sleep(700);
  await snap(ws, 'p1_ingame.png');

  // Fast-forward through the remaining 15 rounds cleanly to trigger genuine SessionInsightsModal (#session-summary)
  await installFastTimerShim(ws);
  await evalScript(ws, `window.__fastMode = true;`);
  for (let r = 0; r < 18; r++) {
    const done = await evalScript(ws, `!!document.getElementById('session-summary')`);
    if (done) break;
    await evalScript(ws, `(() => {
      const btn = document.getElementById('degree-btn-4');
      if (btn) btn.click();
    })()`);
    await sleep(140);
  }
  await evalScript(ws, `window.__fastMode = false;`);
  for (let i = 0; i < 20; i++) {
    const hasSum = await evalScript(ws, `!!document.getElementById('session-summary')`);
    if (hasSum) break;
    await evalScript(ws, `(() => { const b = document.getElementById('degree-btn-4'); if (b) b.click(); })()`);
    await sleep(160);
  }
  // Ensure realistic 14/15 passed display in genuine modal for pedagogical showcase
  await evalScript(ws, `(() => {
    const sum = document.getElementById('session-summary');
    if (!sum) return false;
    const walkers = Array.from(sum.querySelectorAll('div, span'));
    for (const el of walkers) {
      const t = (el.textContent || '').trim();
      if (/^\\d+\\s*\\/\\s*15$/.test(t)) el.innerHTML = '14<span style="font-size:20px;color:#a89a80"> / 15</span>';
      if (t === 'Finding your way') el.textContent = 'A clear ear';
      if (t.includes('average response')) el.textContent = '2 min · 1.6s average response';
      if (t.startsWith('Strongest')) el.textContent = 'Strongest · degree F (4)';
      if (t.startsWith('Next practice')) el.textContent = 'Next practice · degree B (7)';
    }
    // Style 14 gold marks and 1 muted mark
    const marks = Array.from(sum.querySelectorAll('div')).filter(d => {
      const r = d.getBoundingClientRect();
      return Math.abs(r.width - 6) < 2 && Math.abs(r.height - 18) < 2;
    });
    marks.forEach((m, idx) => { m.style.backgroundColor = idx < 14 ? '#d5b77c' : '#514a3e'; });
    return true;
  })()`);
  await sleep(600);
  await snap(ws, 'p1_insights.png');
}

async function runMelodyCapture(ws) {
  await seedProfile(ws, { single: 12, melody: 4, leverStage: 0 });
  await sendCDP(ws, 'Page.reload');
  await waitForHub(ws);
  await clickById(ws, 'tab-btn-chords');
  await sleep(1600);
  await snap(ws, 'p2_home.png');

  const okMap2 = await clickById(ws, 'melody-trail-map-btn');
  console.log('[CAP] melody-trail-map-btn:', okMap2);
  await sleep(1200);
  const okNode4 = await clickNodeNumber(ws, '4');
  console.log('[CAP] clickNodeNumber 4:', okNode4);
  await sleep(800);
  await snap(ws, 'p2_map_04.png');

  const okPlay2 = await clickById(ws, 'level-card-play');
  console.log('[CAP] p2 level-card-play:', okPlay2);
  for (let i = 0; i < 40; i++) {
    await sleep(450);
    const t = await evalScript(ws, `document.body.innerText || ''`);
    if (t.includes('Tap the 3 notes') || t.includes('Your turn')) break;
  }
  await sleep(600);
  await snap(ws, 'p2_ingame.png');

  // Fast-forward through 15 rounds (3 clicks per round)
  await installFastTimerShim(ws);
  await evalScript(ws, `window.__fastMode = true;`);
  for (let step = 0; step < 30; step++) {
    const done = await evalScript(ws, `!!document.getElementById('session-summary')`);
    if (done) break;
    await evalScript(ws, `(() => {
      for (const d of ['1','3','5']) {
        const b = document.getElementById('degree-btn-' + d);
        if (b) b.click();
      }
    })()`);
    await sleep(130);
  }
  await evalScript(ws, `window.__fastMode = false;`);
  await evalScript(ws, `(() => {
    const sum = document.getElementById('session-summary');
    if (!sum) return false;
    for (const el of sum.querySelectorAll('div, span')) {
      const t = (el.textContent || '').trim();
      if (/^\\d+\\s*\\/\\s*15$/.test(t)) el.innerHTML = '14<span style="font-size:20px;color:#a89a80"> / 15</span>';
      if (t === 'Finding your way') el.textContent = 'A clear ear';
      if (t.includes('average response')) el.textContent = '2 min · 1.4s average response';
      if (t.startsWith('Strongest')) el.textContent = 'Strongest · degree E (3)';
      if (t.startsWith('Next practice')) el.textContent = 'Next practice · degree G (5)';
    }
    const marks = Array.from(sum.querySelectorAll('div')).filter(d => {
      const r = d.getBoundingClientRect();
      return Math.abs(r.width - 6) < 2 && Math.abs(r.height - 18) < 2;
    });
    marks.forEach((m, idx) => { m.style.backgroundColor = idx < 14 ? '#d5b77c' : '#514a3e'; });
    return true;
  })()`);
  await sleep(600);
  await snap(ws, 'p2_insights.png');
}

async function runLeversCapture(ws) {
  await seedProfile(ws, { single: 12, melody: 4, leverStage: 0 });
  await sendCDP(ws, 'Page.reload');
  await waitForHub(ws);
  await clickById(ws, 'tab-btn-levers');
  await sleep(1600);
  await snap(ws, 'p3_home.png');

  // Open Levers training directly from roadmap Level 1
  const okMap3 = await clickById(ws, 'levers-trail-map-btn');
  console.log('[CAP] levers-trail-map-btn:', okMap3);
  await sleep(1200);
  await snap(ws, 'p3_map.png');
  const txtMap3 = await evalScript(ws, `(document.body.innerText || '').slice(0, 400).replace(/\\n+/g, ' | ')`);
  console.log('[CAP] p3 map text:', txtMap3);

  const okNode1 = await clickNodeNumber(ws, '1');
  console.log('[CAP] p3 clickNodeNumber 1:', okNode1);
  await sleep(800);
  const okPlay3 = await clickById(ws, 'level-card-play');
  console.log('[CAP] p3 level-card-play:', okPlay3);
  if (!okPlay3) {
    // Fallback if levers map opens a button labeled Play or Begin directly
    await clickByText(ws, 'Play', true);
  }
  await sleep(1200);
  const txtStage = await evalScript(ws, `(document.body.innerText || '').slice(0, 400).replace(/\\n+/g, ' | ')`);
  console.log('[CAP] p3 training text:', txtStage);

  // Step 0 -> Step 1 -> Click "Flip A lever & listen" -> Step 2 (Circle of Fifths!)
  console.log('[CAP] step0 Continue:', await clickByText(ws, 'Continue at your pace', true));
  await sleep(700);
  console.log('[CAP] step1 Flip:', await clickByText(ws, 'Flip', true));
  await sleep(900);
  console.log('[CAP] step1 Continue:', await clickByText(ws, 'Continue at your pace', true));
  await sleep(900);
  await snap(ws, 'p3_circle.png');

  // Step 2 -> 3 -> 4 -> Click "Flip both C levers" -> Step 5 -> Practice Level 1 (Bb major or Eb major)
  console.log('[CAP] step2 Continue:', await clickByText(ws, 'Continue at your pace', true));
  await sleep(600);
  console.log('[CAP] step3 Continue:', await clickByText(ws, 'Continue at your pace', true));
  await sleep(600);
  console.log('[CAP] step4 Flip both C:', await clickByText(ws, 'Flip both C', true));
  await sleep(800);
  console.log('[CAP] step4 Continue:', await clickByText(ws, 'Continue at your pace', true));
  await sleep(800);
  console.log('[CAP] step5 Begin:', await clickByText(ws, 'Begin', true));
  await sleep(1200);
  await snap(ws, 'p3_ingame.png');

  // Walk through 3 rounds to capture genuine Level complete screen!
  await installFastTimerShim(ws);
  await evalScript(ws, `window.__fastMode = true;`);
  for (let round = 0; round < 3; round++) {
    console.log('[CAP] round Confirm scale:', round, await clickByText(ws, 'Confirm scale', true));
    await sleep(450);
    if (round < 2) {
      console.log('[CAP] round Next scale:', round, await clickByText(ws, 'Next scale', true));
      await sleep(350);
    }
  }
  await evalScript(ws, `window.__fastMode = false;`);
  await sleep(900);
  await snap(ws, 'p3_complete.png');
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

  await runSingleCapture(ws);
  await runMelodyCapture(ws);
  await runLeversCapture(ws);

  console.log('=== ALL V37 3x RETINA CAPTURES COMPLETE ===');
  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
