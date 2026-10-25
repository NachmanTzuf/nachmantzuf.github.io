const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';
const CDP_PORT = 9234;

console.log('Spawning Chrome on port', CDP_PORT);
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--window-size=1200,980',
  '--disable-gpu',
  'http://localhost:8088/'
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
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
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  if (res.exceptionDetails) {
    console.error('CDP Eval Exception:', res.exceptionDetails);
  }
  return res.result ? res.result.value : null;
}

async function captureScreenshot(ws, filename) {
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(shot.data, 'base64');
  fs.writeFileSync(filename, buffer);
  console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
}

async function run() {
  await sleep(2500);
  const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(3500);

  // 1. Single Note (Home)
  console.log('Testing Home...');
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_single_green.png`);

  // 2. Melody Tab
  console.log('Switching to Melody Tab...');
  const clickedMelody = await evalScript(ws, `(function() {
    const el = document.getElementById('tab-btn-chords');
    if (!el) return false;
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
    return true;
  })()`);
  console.log('Clicked Melody:', clickedMelody);
  await sleep(2500);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_melody_blue.png`);

  // 3. Levers Tab
  console.log('Switching to Levers Tab...');
  const clickedLevers = await evalScript(ws, `(function() {
    const el = document.getElementById('tab-btn-levers');
    if (!el) return false;
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
    return true;
  })()`);
  console.log('Clicked Levers:', clickedLevers);
  await sleep(2500);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_levers_orange.png`);

  // 4. Open Canyon Roadmap from Levers tab
  console.log('Opening Canyon Roadmap from Levers tab...');
  const clickedRoadmap = await evalScript(ws, `(function() {
    const btn = document.getElementById('levers-trail-map-btn');
    if (!btn) return false;
    const opts = { bubbles: true, cancelable: true, view: window };
    btn.dispatchEvent(new MouseEvent('mousedown', opts));
    btn.dispatchEvent(new MouseEvent('mouseup', opts));
    btn.dispatchEvent(new MouseEvent('click', opts));
    return true;
  })()`);
  console.log('Clicked Canyon Roadmap:', clickedRoadmap);
  await sleep(1800);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_levers_canyon_roadmap.png`);

  // Close roadmap
  await evalScript(ws, `(function() {
    const btn = document.getElementById('roadmap-close-btn');
    if (!btn) return false;
    const opts = { bubbles: true, cancelable: true, view: window };
    btn.dispatchEvent(new MouseEvent('mousedown', opts));
    btn.dispatchEvent(new MouseEvent('mouseup', opts));
    btn.dispatchEvent(new MouseEvent('click', opts));
    return true;
  })()`);
  await sleep(1000);

  // 5. Journey Tab
  console.log('Switching to Journey Tab...');
  const clickedJourney = await evalScript(ws, `(function() {
    const el = document.getElementById('tab-btn-profile');
    if (!el) return false;
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
    return true;
  })()`);
  console.log('Clicked Journey:', clickedJourney);
  await sleep(2000);
  await captureScreenshot(ws, `${BRAIN_DIR}/verified_tab_journey_purple.png`);

  ws.close();
  chrome.kill();
  console.log('Finished all tests successfully with IIFE scoping!');
  process.exit(0);
}

run().catch(err => {
  console.error('Failure:', err);
  if (chrome) chrome.kill();
  process.exit(1);
});
