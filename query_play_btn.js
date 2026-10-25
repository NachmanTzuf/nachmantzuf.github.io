const http = require('http');
const { spawn } = require('child_process');

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
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                expression: 'JSON.stringify(document.querySelector("#liquid-gold-play-btn")?.getBoundingClientRect())'
              }
            }));
          }, 1500);
        });
        ws.on('message', (msg) => {
          const parsed = JSON.parse(msg);
          if (parsed.id === 2) {
            console.log('Play Button Rect:', parsed.result?.result?.value);
            chrome.kill();
            process.exit(0);
          }
        });
      }
    });
  });
}, 1500);
