const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9288;
const tempDir = path.join(os.tmpdir(), 'chrome_cdp_v22_scroll_' + Date.now());

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  `--user-data-dir=${tempDir}`,
  '--window-size=430,932',
  '--disable-gpu',
  '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'about:blank'
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

async function captureScreenshot(ws, filename) {
  const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  const outPath = path.join('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95', filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);
}

async function run() {
  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      try {
        await sleep(500);
        targets = await getJSON(`http://127.0.0.1:${CDP_PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }
    const page = targets.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'Page.enable');

    await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8081/?founder=nachman' });

    // Wait until loader fades
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const res = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const l = document.getElementById('earpa-instant-loader');
          const root = document.getElementById('root');
          return { ready: root && root.children.length > 0 && (!l || window.getComputedStyle(l).opacity === '0') };
        })()`,
        returnByValue: true
      });
      if (res.result.value.ready) break;
    }

    // Dismiss loader
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const l = document.getElementById('earpa-instant-loader');
        if (l) l.style.display = 'none';
      })()`
    });
    await sleep(500);

    // Click Journey tab
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.getElementById('tab-btn-profile').click()`
    });
    await sleep(1500);

    // Scroll down the Journey tab scroll container
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const allDivs = document.querySelectorAll('div');
        for (const el of allDivs) {
          if (el.scrollHeight > el.clientHeight && el.clientHeight > 300) {
            el.scrollTop = 420;
          }
        }
      })()`
    });
    await sleep(1000);
    await captureScreenshot(ws, 'verified_v22_journey_tab_scrolled.png');

    // Open Artisan Workshop
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.getElementById('journey-enter-workshop-btn').click()`
    });
    await sleep(3500);
    await captureScreenshot(ws, 'verified_v22_fullscreen_shop_3d.png');

    // Select Wood in carousel
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const item = document.getElementById('garage-item-royal_rosewood');
        if (item) item.click();
      })()`
    });
    await sleep(2000);
    await captureScreenshot(ws, 'verified_v22_shop_rosewood_preview.png');

    ws.close();
    console.log('Scroll and shop test completed.');
  } catch (err) {
    console.error('Run failed:', err);
  } finally {
    chrome.kill();
  }
}

run();
