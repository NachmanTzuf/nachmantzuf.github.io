const http = require('http');
const { spawn } = require('child_process');

const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--remote-debugging-port=9555',
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=430,932',
  'http://localhost:8088/',
]);

setTimeout(async () => {
  try {
    const versionRes = await new Promise((r) =>
      http.get('http://localhost:9555/json', (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => r(JSON.parse(b)));
      })
    );
    const target = versionRes.find((t) => t.type === 'page');
    const WebSocket = require('ws');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.on('open', r));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((r) => {
        const curId = id++;
        const handler = (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.id === curId) {
            ws.off('message', handler);
            r(msg.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Runtime.enable');
    await new Promise((r) => setTimeout(r, 3500));

    // Click play
    await send('Runtime.evaluate', {
      expression: "document.getElementById('liquid-gold-play-btn')?.click()",
    });
    await new Promise((r) => setTimeout(r, 6500));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.elementFromPoint(191, 450);
        const canvas = document.querySelector('canvas');
        const r = canvas ? canvas.getBoundingClientRect() : null;
        
        // Also check what happens if we dispatch a pointerdown directly on canvas!
        let pluckFired = false;
        window.addEventListener('test-pluck', () => { pluckFired = true; });
        
        return {
          elTag: el ? el.tagName : null,
          elId: el ? el.id : null,
          elClass: el ? el.className : null,
          canvasRect: r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null,
          canvasStylePointerEvents: canvas ? window.getComputedStyle(canvas).pointerEvents : null,
          canvasParentPointerEvents: canvas && canvas.parentElement ? window.getComputedStyle(canvas.parentElement).pointerEvents : null,
        };
      })()`,
      returnByValue: true,
    });
    console.log('Inspection Result:', evalRes.result.value);

    // Now test dispatching pointerdown on canvas directly with synthetic PointerEvent
    const dispatchRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { error: 'No canvas' };
        
        const rect = canvas.getBoundingClientRect();
        // Dispatch pointerdown at center of canvas
        const evt = new PointerEvent('pointerdown', {
          clientX: rect.left + rect.width * 0.44,
          clientY: rect.top + rect.height * 0.50,
          bubbles: true,
          cancelable: true,
          pointerType: 'touch',
          isPrimary: true
        });
        canvas.dispatchEvent(evt);
        
        return {
          dispatchedAt: { x: rect.left + rect.width * 0.44, y: rect.top + rect.height * 0.50 },
          bodyText: document.body.innerText.slice(0, 300)
        };
      })()`,
      returnByValue: true,
    });
    console.log('Dispatch Result:', dispatchRes.result.value);
    
    await new Promise(r => setTimeout(r, 1500));
    const afterPluck = await send('Runtime.evaluate', {
      expression: `document.body.innerText.slice(0, 400)`,
      returnByValue: true,
    });
    console.log('After Pluck Text:', afterPluck.result.value);

  } finally {
    chromeProc.kill();
  }
}, 2000);
