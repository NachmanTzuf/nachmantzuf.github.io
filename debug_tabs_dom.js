const http = require('http');
const WebSocket = require('ws');

http.get('http://127.0.0.1:9232/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    const list = JSON.parse(data);
    const page = list.find(t => t.type === 'page');
    if (!page) {
      console.log('No page found');
      process.exit(1);
    }
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(function() {
            const tabs = Array.from(document.querySelectorAll('*')).filter(el => ['Single', 'Melody', 'Levers', 'Journey'].includes(el.innerText && el.innerText.trim()));
            return tabs.map(t => ({
              tag: t.tagName,
              text: t.innerText.trim(),
              id: t.id,
              parentId: t.parentElement ? t.parentElement.id : null,
              grandParentId: t.parentElement && t.parentElement.parentElement ? t.parentElement.parentElement.id : null,
              hasClickListener: typeof t.onclick === 'function'
            }));
          })()`,
          returnByValue: true
        }
      }));
    });

    ws.on('message', (raw) => {
      const resp = JSON.parse(raw);
      console.log('Tabs in DOM:', JSON.stringify(resp.result.result.value, null, 2));
      ws.close();
      process.exit(0);
    });
  });
});
