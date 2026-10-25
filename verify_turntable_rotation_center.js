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
        ws.on('open', () => {
          ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
        });

        ws.on('message', (msg) => {
          const parsed = JSON.parse(msg);

          if (parsed.id === 2) {
            // Wait 3.5s for initial load
            setTimeout(() => {
              // Step 1: Set initial beauty view
              ws.send(JSON.stringify({
                id: 10,
                method: 'Runtime.evaluate',
                params: {
                  expression: `(function() {
                    if (window.__earpa_setTheta) window.__earpa_setTheta(1.10);
                    return 'front beauty set';
                  })()`
                }
              }));
              setTimeout(() => {
                ws.send(JSON.stringify({ id: 100, method: 'Page.captureScreenshot', params: { format: 'png' } }));
              }, 400);
            }, 3500);
          }

          if (parsed.id === 100) {
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_desktop_iphone15.png', Buffer.from(parsed.result.data, 'base64'));
            console.log('Saved earpa_ui_desktop_iphone15.png');

            // Step 2: Rotate 90 degrees (side view)
            ws.send(JSON.stringify({
              id: 110,
              method: 'Runtime.evaluate',
              params: {
                expression: `(function() {
                  if (window.__earpa_setTheta) window.__earpa_setTheta(1.10 + Math.PI / 2);
                  return 'side view set';
                })()`
              }
            }));

            setTimeout(() => {
              ws.send(JSON.stringify({ id: 200, method: 'Page.captureScreenshot', params: { format: 'png' } }));
            }, 600);
          }

          if (parsed.id === 200) {
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_side_view.png', Buffer.from(parsed.result.data, 'base64'));
            console.log('Saved earpa_ui_side_view.png');

            // Step 3: Rotate to 180 degrees (facing other side)
            ws.send(JSON.stringify({
              id: 210,
              method: 'Runtime.evaluate',
              params: {
                expression: `(function() {
                  if (window.__earpa_setTheta) window.__earpa_setTheta(1.10 + Math.PI);
                  return 'facing other side set';
                })()`
              }
            }));

            setTimeout(() => {
              ws.send(JSON.stringify({ id: 300, method: 'Page.captureScreenshot', params: { format: 'png' } }));
            }, 600);
          }

          if (parsed.id === 300) {
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_facing_other_side.png', Buffer.from(parsed.result.data, 'base64'));
            console.log('Saved earpa_ui_facing_other_side.png (facing away / 180 degrees)!');
            chrome.kill();
            process.exit(0);
          }
        });
      }
    });
  });
}, 1000);
