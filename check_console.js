const http = require('http');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
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
        ws.on('open', () => {
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        });
        ws.on('message', (m) => {
          const p = JSON.parse(m);
          if (p.method === 'Runtime.consoleAPICalled') {
            console.log('CONSOLE:', p.params.type, p.params.args.map(a => a.value || a.description).join(' '));
          }
          if (p.method === 'Runtime.exceptionThrown') {
            console.error('EXCEPTION:', JSON.stringify(p.params.exceptionDetails));
          }
        });
        setTimeout(() => {
          chrome.kill();
          process.exit(0);
        }, 5000);
      }
    });
  });
}, 1500);
