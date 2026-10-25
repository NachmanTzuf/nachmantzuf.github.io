const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--window-size=1200,980',
  'http://localhost:8088/'
]);

setTimeout(() => {
  http.get('http://localhost:9223/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      const WebSocket = require('ws');
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `(function() {
                const btn = document.getElementById('liquid-gold-play-btn');
                const canvas = document.querySelector('canvas');
                const img = document.querySelector('img[alt=\"Ancient Irish Celtic Sanctuary\"]');
                const btnRect = btn ? btn.getBoundingClientRect() : null;
                const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
                const imgRect = img ? img.getBoundingClientRect() : null;
                return JSON.stringify({ btnRect, canvasRect, imgRect });
              })()`
            }
          }));
        }, 3000);
      });

      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.id === 2) {
          console.log('DOM Rects:', parsed.result.result.value);
          chrome.kill();
          process.exit(0);
        }
      });
    });
  });
}, 1000);
