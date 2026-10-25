const http = require('http');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9228',
  'http://localhost:8088/'
]);

setTimeout(() => {
  http.get('http://localhost:9228/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      if (!target) return;
      const WebSocket = require('ws');
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        ws.on('message', (m) => {
          const p = JSON.parse(m);
          if (p.method === 'Runtime.consoleAPICalled' || p.method === 'Runtime.exceptionThrown') {
            console.log('CONSOLE / EXCEPTION:', JSON.stringify(p.params));
          }
        });
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 10,
            method: 'Runtime.evaluate',
            params: {
              expression: `(function() {
                try {
                  const tab = document.getElementById('tab-btn-profile');
                  if (tab) {
                    tab.click();
                    return 'clicked profile tab';
                  }
                  return 'tab-btn-profile not found';
                } catch(e) {
                  return 'Error clicking: ' + e.message;
                }
              })()`,
              returnByValue: true
            }
          }));
        }, 2000);

        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 20,
            method: 'Runtime.evaluate',
            params: {
              expression: `(function() {
                return {
                  bodyLength: document.body.innerHTML.length,
                  rootHtml: document.getElementById('root') ? document.getElementById('root').innerHTML.substring(0, 300) : 'no root',
                  profileTabPresent: !!document.getElementById('journey-video-card-btn')
                };
              })()`,
              returnByValue: true
            }
          }));
        }, 3000);

        ws.on('message', (m) => {
          const p = JSON.parse(m);
          if (p.id === 10) console.log('Click result:', p.result);
          if (p.id === 20) {
            console.log('DOM check:', p.result);
            ws.close();
            chrome.kill();
            process.exit(0);
          }
        });
      });
    });
  });
}, 1500);
