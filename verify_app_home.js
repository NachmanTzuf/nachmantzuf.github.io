const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--window-size=1200,980',
  'http://localhost:8088/'
]);

setTimeout(() => {
  http.get('http://localhost:9227/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      if (!target) {
        chrome.kill();
        process.exit(1);
      }

      const WebSocket = require('ws');
      const ws = new WebSocket(target.webSocketDebuggerUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      });

      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.id === 2) {
          // Wait 4 seconds for full React Native Web bundle and 3D Celtic harp to render
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 10,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 4500);
        }
        if (parsed.id === 10) {
          const base64Data = parsed.result.data;
          const outPath = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\82d91d89-a520-48b5-9902-f6285358d1ff\\earpa_ui_live_verified.png';
          fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
          console.log('App screenshot saved to:', outPath);
          chrome.kill();
          process.exit(0);
        }
      });
    });
  });
}, 1500);
