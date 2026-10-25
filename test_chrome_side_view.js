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
            // Wait 2.5s, then dispatch a drag or evaluate to rotate to side view (~80 deg)
            setTimeout(() => {
              // Simulate pointer drag from x=600 to x=400 to rotate harp to side
              ws.send(JSON.stringify({
                id: 5,
                method: 'Input.dispatchMouseEvent',
                params: { type: 'mousePressed', x: 590, y: 550, button: 'left', buttons: 1 }
              }));
              setTimeout(() => {
                ws.send(JSON.stringify({
                  id: 6,
                  method: 'Input.dispatchMouseEvent',
                  params: { type: 'mouseMoved', x: 370, y: 550, buttons: 1 }
                }));
                setTimeout(() => {
                  ws.send(JSON.stringify({
                    id: 7,
                    method: 'Input.dispatchMouseEvent',
                    params: { type: 'mouseReleased', x: 370, y: 550, button: 'left', buttons: 0 }
                  }));
                  // Wait for smooth lerp to settle
                  setTimeout(() => {
                    ws.send(JSON.stringify({ id: 10, method: 'Page.captureScreenshot', params: { format: 'png' } }));
                  }, 1200);
                }, 100);
              }, 100);
            }, 3000);
          }

          if (parsed.id === 10) {
            const base64Data = parsed.result.data;
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_side_view.png', Buffer.from(base64Data, 'base64'));
            console.log('Side view screenshot saved successfully!');
            chrome.kill();
            process.exit(0);
          }
        });
      }
    });
  });
}, 2000);
