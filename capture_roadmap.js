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
        const WebSocket = require('ws');
        const ws = new WebSocket(target.webSocketDebuggerUrl);

        let msgId = 100;
        const send = (method, params = {}) => {
          return new Promise((resolve) => {
            const id = ++msgId;
            const handler = (raw) => {
              const msg = JSON.parse(raw);
              if (msg.id === id) {
                ws.off('message', handler);
                resolve(msg.result);
              }
            };
            ws.on('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
          });
        };

        ws.on('open', async () => {
          await send('Page.enable');
          await send('Runtime.enable');

          console.log('Waiting for page load...');
          await new Promise(r => setTimeout(r, 2500));

          // Click on the top-roadmap-banner-btn
          console.log('Clicking top-roadmap-banner-btn...');
          const clickRes = await send('Runtime.evaluate', {
            expression: `
              (() => {
                const btn = document.getElementById('top-roadmap-banner-btn');
                if (btn) {
                  btn.click();
                  return 'clicked ID';
                }
                const els = Array.from(document.querySelectorAll('*')).filter(e => e.textContent && (e.textContent.includes('Trail Map') || e.textContent.includes('TRAIL MAP')));
                if (els.length > 0) {
                  const target = els[els.length - 1].closest('[role="button"]') || els[els.length - 1];
                  target.click();
                  return 'clicked text';
                }
                return 'not found';
              })()
            `
          });
          console.log('Click result:', clickRes);

          await new Promise(r => setTimeout(r, 1500));

          // Capture roadmap screenshot
          const snapRoadmap = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_roadmap_modal.png', Buffer.from(snapRoadmap.data, 'base64'));
          console.log('Saved earpa_ui_roadmap_modal.png');

          // Scroll down roadmap to show stage 2 & 3
          await send('Runtime.evaluate', {
            expression: `
              const scrollables = document.querySelectorAll('*');
              for (const el of scrollables) {
                if (el.scrollHeight > el.clientHeight && el.clientHeight > 200) {
                  el.scrollTop = 500;
                  break;
                }
              }
            `
          });
          await new Promise(r => setTimeout(r, 800));
          const snapScrolled = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_roadmap_scrolled.png', Buffer.from(snapScrolled.data, 'base64'));
          console.log('Saved earpa_ui_roadmap_scrolled.png');

          chrome.kill();
          process.exit(0);
        });
      }
    });
  });
}, 2000);
