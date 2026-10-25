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
          if (parsed.id === 5) {
            // Galaxy button clicked, wait 3 seconds and take screenshot
            setTimeout(() => {
              ws.send(JSON.stringify({ id: 10, method: 'Page.captureScreenshot', params: { format: 'png' } }));
            }, 3000);
          }
          if (parsed.id === 10) {
            const base64Data = parsed.result.data;
            fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_galaxy_s24.png', Buffer.from(base64Data, 'base64'));
            console.log('Galaxy S24 screenshot saved successfully!');
            chrome.kill();
            process.exit(0);
          }
        });

        // Wait 3.5s then click Galaxy S24 button
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 5,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                const buttons = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.trim() === 'Galaxy S24');
                if (buttons.length > 0) {
                  buttons[buttons.length - 1].click();
                  true;
                } else {
                  false;
                }
              `
            }
          }));
        }, 3500);
      }
    });
  });
}, 2000);
