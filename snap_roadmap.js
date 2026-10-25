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
    res.on('data', c => data += c);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      if (target) {
        const WebSocket = require('ws');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        let id = 10;
        const send = (method, params = {}) => new Promise(r => {
          const reqId = ++id;
          const handler = (raw) => {
            const m = JSON.parse(raw);
            if (m.id === reqId) { ws.off('message', handler); r(m.result); }
          };
          ws.on('message', handler);
          ws.send(JSON.stringify({ id: reqId, method, params }));
        });

        ws.on('open', async () => {
          await send('Page.enable');
          await send('Runtime.enable');
          await new Promise(r => setTimeout(r, 2200));
          await send('Runtime.evaluate', {
            expression: `
              const btn = document.getElementById('top-roadmap-banner-btn') || Array.from(document.querySelectorAll('div, span, p')).find(el => el.textContent.includes('TRAIL MAP'));
              if (btn) btn.click();
            `
          });
          await new Promise(r => setTimeout(r, 1400));
          const snap = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_roadmap_modal.png', Buffer.from(snap.data, 'base64'));
          console.log('Saved earpa_ui_roadmap_modal.png!');
          chrome.kill();
          process.exit(0);
        });
      }
    });
  });
}, 2000);
