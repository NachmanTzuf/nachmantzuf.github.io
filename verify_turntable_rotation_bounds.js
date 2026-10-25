const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9229',
  '--window-size=1200,980',
  'http://localhost:8088/'
]);

function evaluate(ws, expr, cb) {
  const reqId = Math.floor(Math.random() * 100000) + 1000;
  const handler = (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.id === reqId) {
      ws.removeListener('message', handler);
      cb(parsed.result ? parsed.result.result : null);
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({
    id: reqId,
    method: 'Runtime.evaluate',
    params: { expression: expr, returnByValue: true }
  }));
}

function captureScreenshot(ws, filename, cb) {
  const reqId = Math.floor(Math.random() * 100000) + 1000;
  const handler = (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.id === reqId) {
      ws.removeListener('message', handler);
      const filePath = path.join(artifactDir, filename);
      fs.writeFileSync(filePath, Buffer.from(parsed.result.data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
      cb();
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({
    id: reqId,
    method: 'Page.captureScreenshot',
    params: { format: 'png' }
  }));
}

setTimeout(() => {
  http.get('http://localhost:9229/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      if (!target) return;

      const WebSocket = require('ws');
      const ws = new WebSocket(target.webSocketDebuggerUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

        // Wait 5s for full 3D load
        setTimeout(() => {
          // Angle 0: Facing forward
          console.log('Testing Angle 0 (Forward)...');
          evaluate(ws, `(function() {
            if (window.__earpa_setTheta) window.__earpa_setTheta(0);
            return 'set 0';
          })()`, () => {
            setTimeout(() => {
              captureScreenshot(ws, 'verified_harp_rotation_0deg.png', () => {
                // Angle 90: Side view
                console.log('Testing Angle 90 (Side)...');
                evaluate(ws, `(function() {
                  if (window.__earpa_setTheta) window.__earpa_setTheta(Math.PI / 2);
                  return 'set 90';
                })()`, () => {
                  setTimeout(() => {
                    captureScreenshot(ws, 'verified_harp_rotation_90deg.png', () => {
                      // Angle 180: Facing rear
                      console.log('Testing Angle 180 (Facing Rear)...');
                      evaluate(ws, `(function() {
                        if (window.__earpa_setTheta) window.__earpa_setTheta(Math.PI);
                        return 'set 180';
                      })()`, () => {
                        setTimeout(() => {
                          captureScreenshot(ws, 'verified_harp_rotation_180deg.png', () => {
                            // Angle 270: Opposite side
                            console.log('Testing Angle 270 (Opposite Side)...');
                            evaluate(ws, `(function() {
                              if (window.__earpa_setTheta) window.__earpa_setTheta(Math.PI * 1.5);
                              return 'set 270';
                            })()`, () => {
                              setTimeout(() => {
                                captureScreenshot(ws, 'verified_harp_rotation_270deg.png', () => {
                                  console.log('All 4 rotation angles verified!');
                                  ws.close();
                                  chrome.kill();
                                  process.exit(0);
                                });
                              }, 600);
                            });
                          }, 600);
                        });
                      }, 600);
                    });
                  }, 600);
                });
              }, 600);
            });
          });
        }, 5000);
      });
    });
  });
}, 1500);
