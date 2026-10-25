const http = require('http');
const { spawn } = require('child_process');

const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--remote-debugging-port=9666',
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=430,932',
  'http://localhost:8088/',
]);

setTimeout(async () => {
  try {
    const versionRes = await new Promise((r) =>
      http.get('http://localhost:9666/json', (res) => {
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

    // Inspect Three.js scene internal state from window/DOM
    const rayInspect = await send('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return 'no canvas';
        
        // Find Three.js scene and objects
        // We can inspect by dispatching events or inspecting fiber / window
        const r = canvas.getBoundingClientRect();
        
        // Let's test a grid of clicks from x=150 to 300, y=350 to 550
        const testPoints = [
          { name: 'String 1 region', x: r.left + r.width * 0.40, y: r.top + r.height * 0.50 },
          { name: 'String 2 region', x: r.left + r.width * 0.45, y: r.top + r.height * 0.50 },
          { name: 'String 3 region', x: r.left + r.width * 0.50, y: r.top + r.height * 0.50 },
          { name: 'String 4 region', x: r.left + r.width * 0.55, y: r.top + r.height * 0.50 },
          { name: 'String 5 region', x: r.left + r.width * 0.60, y: r.top + r.height * 0.50 },
          { name: 'String 6 region', x: r.left + r.width * 0.65, y: r.top + r.height * 0.50 },
        ];
        
        const results = [];
        for (const pt of testPoints) {
          const evt = new PointerEvent('pointerdown', {
            clientX: pt.x,
            clientY: pt.y,
            bubbles: true,
            cancelable: true,
            pointerType: 'touch',
          });
          canvas.dispatchEvent(evt);
          
          results.push({
            pt: pt.name,
            x: pt.x,
            y: pt.y,
            bodyText: document.body.innerText.slice(0, 300),
          });
        }
        return results;
      })()`,
      returnByValue: true,
    });
    console.log('Ray Inspection Grid:', JSON.stringify(rayInspect.result.value, null, 2));

  } finally {
    chromeProc.kill();
  }
}, 2000);
