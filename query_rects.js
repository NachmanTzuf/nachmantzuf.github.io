const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      if (target) {
        const WebSocket = require('ws');
        const ws = new WebSocket(target.webSocketDebuggerUrl);
        ws.on('open', () => {
          ws.send(JSON.stringify({
            id: 1,
            method: 'Runtime.evaluate',
            params: {
              expression: `(() => {
                const canvas = document.querySelector('canvas');
                const img = document.querySelector('img[alt="Ancient Irish Celtic Sanctuary"]');
                return JSON.stringify({
                  canvas: canvas ? canvas.getBoundingClientRect() : null,
                  img: img ? img.getBoundingClientRect() : null
                });
              })()`
            }
          }));
        });
        ws.on('message', (msg) => {
          const parsed = JSON.parse(msg);
          if (parsed.id === 1) {
            console.log('Result:', parsed.result.result.value);
            process.exit(0);
          }
        });
      } else {
        console.log('No 8088 tab found');
        process.exit(1);
      }
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.log('Chrome not running on 9222');
  process.exit(1);
});
