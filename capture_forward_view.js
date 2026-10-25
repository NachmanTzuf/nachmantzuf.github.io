const { spawn } = require('child_process');
const http = require('http');
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
      const WebSocket = require('ws');
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      });

      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);

        if (parsed.id === 2) {
          setTimeout(() => {
            // Find theta matching media_1792345316654_0b904593.png
            // In that image, the soundbox is on the left, pillar on right, seen nearly end-on facing forward
            ws.send(JSON.stringify({
              id: 10,
              method: 'Runtime.evaluate',
              params: {
                expression: '(function() { if (window.__earpa_setTheta) window.__earpa_setTheta(0.0); return "ok"; })()'
              }
            }));
            setTimeout(() => {
              ws.send(JSON.stringify({ id: 100, method: 'Page.captureScreenshot', params: { format: 'png' } }));
            }, 600);
          }, 3500);
        }

        if (parsed.id === 100) {
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_facing_forward_user.png', Buffer.from(parsed.result.data, 'base64'));
          console.log('Saved earpa_ui_facing_forward_user.png');
          chrome.kill();
          process.exit(0);
        }
      });
    });
  });
}, 1000);
