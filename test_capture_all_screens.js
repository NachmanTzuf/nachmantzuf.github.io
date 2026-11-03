const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9277;
const tempDir = path.join(os.tmpdir(), 'chrome_cdp_v22_app_' + Date.now());

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

    ws.on('message', (raw) => {
      const msg = JSON.parse(raw);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        console.log('[BROWSER]', text);
      }
    });

    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'Page.enable');

    console.log('--- Navigating to Earpa Main App with founder=nachman ---');
    await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8081/?founder=nachman' });

    // Wait until instant loader is gone
    for (let i = 0; i < 25; i++) {
      await sleep(500);
      const res = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const l = document.getElementById('earpa-instant-loader');
          const root = document.getElementById('root');
          return {
            loaderPresent: !!l,
            loaderOpacity: l ? window.getComputedStyle(l).opacity : null,
            rootChildren: root ? root.children.length : 0
          };
        })()`,
        returnByValue: true
      });
      if (res.result.value.rootChildren > 0 && (!res.result.value.loaderPresent || res.result.value.loaderOpacity === '0')) {
        console.log('App loaded and loader hidden at cycle', i);
        break;
      }
    }

    // Dismiss loader if still hanging
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const l = document.getElementById('earpa-instant-loader');
        if (l) l.style.display = 'none';
      })()`
    });
    await sleep(1000);

    console.log('--- Capturing Home Hero Tab ---');
    await captureScreenshot(ws, 'verified_v22_home_hero.png');

    console.log('--- Switching to Melody Tab ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tab = document.getElementById('tab-btn-chords');
        if (tab) { tab.click(); return 'Clicked Melody Tab'; }
        return 'Melody tab not found';
      })()`
    });
    await sleep(2000);
    await captureScreenshot(ws, 'verified_v22_melody_tab.png');

    console.log('--- Switching to Journey Tab ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tab = document.getElementById('tab-btn-profile');
        if (tab) { tab.click(); return 'Clicked Journey Tab'; }
        return 'Journey tab not found';
      })()`
    });
    await sleep(2000);
    await captureScreenshot(ws, 'verified_v22_journey_tab.png');

    console.log('--- Opening Artisan Workshop ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('journey-enter-workshop-btn');
        if (btn) { btn.click(); return 'Clicked Enter Workshop'; }
        return 'Enter Workshop button not found';
      })()`
    });
    await sleep(3500);
    await captureScreenshot(ws, 'verified_v22_fullscreen_shop_3d.png');

    console.log('--- Clicking Wood in Workshop ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const rosewood = document.getElementById('garage-item-royal_rosewood');
        if (rosewood) { rosewood.click(); return 'Clicked Royal Rosewood'; }
        return 'Rosewood item not found';
      })()`
    });
    await sleep(2000);
    await captureScreenshot(ws, 'verified_v22_shop_rosewood_preview.png');

    ws.close();
    console.log('All verification steps complete.');
  } catch (err) {
    console.error('Run failed:', err);
  } finally {
    chrome.kill();
  }
}

run();
