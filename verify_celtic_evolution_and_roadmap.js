const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

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
            // Wait 3.5s for initial 3D harp and UI load
            setTimeout(() => {
              console.log('Capturing Home screen with Celtic icons...');
              ws.send(JSON.stringify({ id: 10, method: 'Page.captureScreenshot', params: { format: 'png' } }));
            }, 3500);
          }

          if (parsed.id === 10) {
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\celtic_ui_home_verified.png', Buffer.from(parsed.result.data, 'base64'));
            console.log('Saved celtic_ui_home_verified.png');

            // Open Roadmap Modal by finding and clicking the TRAIL MAP button
            ws.send(JSON.stringify({
              id: 20,
              method: 'Runtime.evaluate',
              params: {
                expression: `(function() {
                  const trailBtn = document.getElementById('top-roadmap-banner-btn') || 
                                   Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.includes('TRAIL MAP'));
                  if (trailBtn) {
                    trailBtn.click();
                    return 'TRAIL MAP clicked';
                  }
                  return 'Button not found directly';
                })()`
              }
            }));

            // Wait 1.2s for modal slide and automated progression focus to stone 1
            setTimeout(() => {
              console.log('Capturing Coastal Roadmap Modal (Stage 1 foreground focus)...');
              ws.send(JSON.stringify({ id: 30, method: 'Page.captureScreenshot', params: { format: 'png' } }));
            }, 1200);
          }

          if (parsed.id === 30) {
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\celtic_coastal_roadmap_stage1_verified.png', Buffer.from(parsed.result.data, 'base64'));
            console.log('Saved celtic_coastal_roadmap_stage1_verified.png');

            // Scroll to Stage 6 / Summit (click Stage 6 pill at bottom)
            ws.send(JSON.stringify({
              id: 40,
              method: 'Runtime.evaluate',
              params: {
                expression: `(function() {
                  const stage6Btn = Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Stage 6');
                  if (stage6Btn) {
                    stage6Btn.click();
                    return 'Stage 6 clicked';
                  }
                  return 'Stage 6 button not found';
                })()`
              }
            }));

            // Wait 1s for smooth scroll to summit
            setTimeout(() => {
              console.log('Capturing Coastal Roadmap Modal (Stage 6 Summit & Completion Gate)...');
              ws.send(JSON.stringify({ id: 50, method: 'Page.captureScreenshot', params: { format: 'png' } }));
            }, 1000);
          }

          if (parsed.id === 50) {
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\celtic_coastal_roadmap_summit_verified.png', Buffer.from(parsed.result.data, 'base64'));
            console.log('Saved celtic_coastal_roadmap_summit_verified.png');

            ws.close();
            chrome.kill();
            process.exit(0);
          }
        });
      }
    });
  });
}, 1500);
