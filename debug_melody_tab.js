const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const CDP_PORT = 9249;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--window-size=1200,980',
  '--disable-gpu',
  '--no-first-run',
  '--autoplay-policy=no-user-gesture-required',
  'http://localhost:8088/'
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

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
  try {
    await sleep(2000);
    const targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', JSON.stringify(msg.params.exceptionDetails));
        }
      } catch (e) {}
    });

    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'Page.enable');

    console.log('Waiting for initial load...');
    await sleep(3500);

    console.log('Clicking on Melody tab (tab-btn-chords)...');
    const clicked = await evalScript(ws, `
      (() => {
        const tab = document.getElementById('tab-btn-chords');
        if (tab) {
          tab.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Tab clicked:', clicked);
    await sleep(2000);

    const state = await evalScript(ws, `
      (() => {
        return {
          bodyLength: document.body.innerText.length,
          bodySnippet: document.body.innerText.slice(0, 300),
          htmlSnippet: document.body.innerHTML.slice(0, 300),
        };
      })()
    `);
    console.log('State after clicking Melody tab:', JSON.stringify(state, null, 2));

    const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95/debug_melody_tab_screenshot.png', Buffer.from(res.data, 'base64'));
    console.log('Screenshot saved: debug_melody_tab_screenshot.png');

  } catch (err) {
    console.error('Error in debug:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
    process.exit(0);
  }
}

main();
