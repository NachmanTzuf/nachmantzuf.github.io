const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

function findChromePath() {
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = require('ws');
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(msg.error);
          else cb.resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = this.id++;
      this.callbacks.set(curId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }
}

async function test() {
  const chromePath = findChromePath();
  const port = 9444;
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=430,932',
    'http://localhost:8088/',
  ]);

  await sleep(2500);

  try {
    const versionRes = await new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}/json`, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });

    const target = versionRes.find((t) => t.type === 'page');
    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    await sleep(4000);

    // Launch In-Game arena directly via Home Play Button
    console.log('Clicking PRESS TO PLAY button...');
    await client.evaluate(`
      (() => {
        const btn = document.getElementById('liquid-gold-play-btn');
        if (btn) btn.click();
      })()
    `);

    console.log('Waiting for in-game arena and cadence audio...');
    for (let i = 0; i < 20; i++) {
      const isReady = await client.evaluate(`document.body.innerText.includes('Identify the scale degree')`);
      if (isReady) {
        console.log(`Ready for input after ${(i+1)*500}ms`);
        break;
      }
      await sleep(500);
    }
    await sleep(500);

    // Check canvas element bounding rect
    const canvasRect = await client.evaluate(`
      (() => {
        const c = document.querySelector('canvas');
        if (!c) return null;
        const r = c.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      })()
    `);
    console.log('Canvas Rect:', canvasRect);

    // Let's test dispatching pointer events to canvas at various coordinates across strings
    // In our 430x932 viewport:
    // String 1 is around x=170, y=450
    // String 2 is around x=190, y=450
    // String 3 is around x=215, y=450
    // String 4 is around x=235, y=450
    console.log('Dispatching pointerdown at (191, 450)...');
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 191,
      y: 450,
      button: 'left',
      clickCount: 1,
    });
    await sleep(50);
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 191,
      y: 450,
      button: 'left',
    });

    await sleep(200);

    const postClickState = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        return {
          textSnippet: text.slice(0, 400),
          hasResolution: text.includes('Resolution:'),
          hasFeedback: text.includes('✦') || text.includes('Guessed') || text.includes('Target'),
        };
      })()
    `);
    console.log('Post Click on String 2 at (191, 450):', postClickState);

  } finally {
    chromeProc.kill();
  }
}

test().catch(console.error);
