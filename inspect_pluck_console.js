const http = require('http');
const { spawn } = require('child_process');

const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--remote-debugging-port=9777',
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=430,932',
  'http://localhost:8088/',
]);

setTimeout(async () => {
  try {
    const versionRes = await new Promise((r) =>
      http.get('http://localhost:9777/json', (res) => {
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

    ws.on('message', (d) => {
      const msg = JSON.parse(d.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map((a) => a.value || a.description).join(' '));
      }
    });

    await send('Runtime.enable');
    await send('Log.enable');
    await new Promise((r) => setTimeout(r, 3500));

    // Click play
    await send('Runtime.evaluate', {
      expression: "document.getElementById('liquid-gold-play-btn')?.click()",
    });
    await new Promise((r) => setTimeout(r, 6500));

    // Inject console logging into the canvas pointerdown handler
    const hookRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return 'no canvas';
        
        canvas.addEventListener('pointerdown', (e) => {
          console.log('HOOK POINTERDOWN clientX:', e.clientX, 'clientY:', e.clientY);
        });
        
        return 'hooked';
      })()`,
      returnByValue: true
    });
    console.log('Hook status:', hookRes.result.value);

    // Now dispatch CDP MouseEvent (which is trusted!)
    console.log('Dispatching CDP mousePressed at (205, 407)...');
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 205,
      y: 407,
      button: 'left',
      clickCount: 1,
    });
    await new Promise((r) => setTimeout(r, 50));
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 205,
      y: 407,
      button: 'left',
    });

    await new Promise((r) => setTimeout(r, 2000));

    const finalState = await send('Runtime.evaluate', {
      expression: `document.body.innerText.slice(0, 300)`,
      returnByValue: true,
    });
    console.log('Final Text after CDP click:', finalState.result.value);

  } finally {
    chromeProc.kill();
  }
}, 2000);
