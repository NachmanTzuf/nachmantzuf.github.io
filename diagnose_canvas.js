const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const CDP_PORT = 9274;

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

async function run() {
  await sleep(2500);
  const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  await sleep(4000);

  // Enter in-game screen
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('liquid-gold-play-btn');
      if (btn) btn.click();
    })()`
  });
  await sleep(3000);

  // Wait for cadence to finish
  for (let i = 0; i < 20; i++) {
    const r = await sendCDP(ws, 'Runtime.evaluate', {
      returnByValue: true,
      expression: `document.body.innerText.includes('Identify the scale degree')`
    });
    if (r?.result?.value) break;
    await sleep(500);
  }

  // Get canvas coordinates
  const canvasInfo = await sendCDP(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const canvas = document.querySelector('canvas');
      const r = canvas.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    })()`
  });
  const rect = canvasInfo.result.value;
  console.log('Canvas Rect:', rect);

  // Test clicking several points across the harp strings area
  // In inGameAngle (-0.95 rad): harp is centered, strings span around X=46%..62%, Y=45%..65%
  const testX = Math.round(rect.left + rect.width * 0.52);
  const testY = Math.round(rect.top + rect.height * 0.55);

  console.log(`Dispatching CDP mouse click at (${testX}, ${testY})...`);
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: testX,
    y: testY,
    button: 'left',
    clickCount: 1,
  });
  await sleep(100);
  await sendCDP(ws, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: testX,
    y: testY,
    button: 'left',
  });

  await sleep(600);

  const textAfterClick = await sendCDP(ws, 'Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const text = document.body.innerText;
      return {
        hasResolution: text.includes('Resolution:'),
        feedbackSnippet: (text.match(/Resolution:[^\n]+/) || text.match(/Identify[^\n]+/) || [''])[0]
      };
    })()`
  });
  console.log('Result After Click:', textAfterClick.result.value);

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
