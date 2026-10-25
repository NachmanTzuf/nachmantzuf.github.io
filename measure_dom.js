const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const target = tabs.find(t => t.url.includes('8088'));
    if (!target) return console.log('No tab found');
    const WebSocket = require('ws');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (() => {
              const canvas = document.querySelector('canvas');
              const playBtn = document.getElementById('liquid-gold-play-btn');
              const bgImg = document.querySelector('img[alt*="Sanctuary"]');
              const cR = canvas ? canvas.getBoundingClientRect() : null;
              const pR = playBtn ? playBtn.getBoundingClientRect() : null;
              const bR = bgImg ? bgImg.getBoundingClientRect() : null;
              return JSON.stringify({
                canvas: cR ? { top: cR.top, left: cR.left, width: cR.width, height: cR.height } : null,
                playBtn: pR ? { top: pR.top, left: pR.left, width: pR.width, height: pR.height } : null,
                bgImg: bR ? { top: bR.top, left: bR.left, width: bR.width, height: bR.height } : null,
              });
            })()
          `
        }
      }));
    });
    ws.on('message', m => {
      const p = JSON.parse(m);
      if (p.id === 1) {
        console.log('DOM Measurements:', p.result.result.value);
        process.exit(0);
      }
    });
  });
});
