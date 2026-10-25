const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=1200,980',
  'http://localhost:8088/'
]);

setTimeout(() => {
  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      if (target) {
        console.log('Connecting to:', target.webSocketDebuggerUrl);
        const WebSocket = require('ws');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        ws.on('open', () => {
          ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
        });

        ws.on('message', (msg) => {
          const parsed = JSON.parse(msg);
          if (parsed.id === 8) {
            console.log('DOM Rects:', parsed.result?.result?.value);
          }
          if (parsed.id === 10) {
            // Screenshot data received
            const base64Data = parsed.result.data;
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_desktop_iphone15.png', Buffer.from(base64Data, 'base64'));
            console.log('Screenshot saved successfully!');
            chrome.kill();
            process.exit(0);
          }
        });

        // Wait 4.5 seconds for Three.js, textures and React rendering
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 8,
            method: 'Runtime.evaluate',
            params: {
              expression: `(() => {
                const canvas = document.querySelector('canvas');
                const img = document.querySelector('img[alt="Ancient Irish Celtic Sanctuary"]');
                return JSON.stringify({
                  canvas: canvas ? canvas.getBoundingClientRect() : null,
                  img: img ? img.getBoundingClientRect() : null
                });
              })()`
            }
          }));
          setTimeout(() => {
            console.log('Requesting screenshot...');
            ws.send(JSON.stringify({ id: 10, method: 'Page.captureScreenshot', params: { format: 'png' } }));
          }, 300);
        }, 4200);
      }
    });
  });
}, 2000);
