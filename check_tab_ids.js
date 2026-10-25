const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const CDP_PORT = 9233;

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
  return res.result ? res.result.value : null;
}

async function run() {
  await sleep(2500);
  const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(3500);

  const debugInfo = await evalScript(ws, `(function() {
    const btnHome = document.getElementById('tab-btn-home');
    const btnChords = document.getElementById('tab-btn-chords');
    const btnLevers = document.getElementById('tab-btn-levers');
    const btnProfile = document.getElementById('tab-btn-profile');

    return {
      hasHome: !!btnHome,
      hasChords: !!btnChords,
      hasLevers: !!btnLevers,
      hasProfile: !!btnProfile,
      leversRect: btnLevers ? btnLevers.getBoundingClientRect() : null,
      allIds: Array.from(document.querySelectorAll('[id]')).map(e => e.id)
    };
  })()`);

  console.log('DEBUG INFO:', JSON.stringify(debugInfo, null, 2));

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  if (chrome) chrome.kill();
  process.exit(1);
});
