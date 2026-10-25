const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome-debug-' + Date.now(),
    'https://nachmantzuf.github.io/'
  ]);

  console.log('Spawned Chrome process...');

  // Wait for DevTools port
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });
      const pageTarget = data.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://'));
      if (pageTarget && pageTarget.webSocketDebuggerUrl) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // Retry
    }
  }

  if (!wsUrl) {
    console.error('Failed to get WebSocket debugger URL');
    chromeProcess.kill();
    return;
  }

  console.log('Connecting to WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    console.log('Connected to Chrome DevTools Protocol!');
    let id = 1;
    const send = (method, params = {}) => {
      ws.send(JSON.stringify({ id: id++, method, params }));
    };

    send('Page.enable');
    send('Runtime.enable');
    send('Console.enable');
    send('Network.enable');

    console.log('Navigating to https://nachmantzuf.github.io/ ...');
    send('Page.navigate', { url: 'https://nachmantzuf.github.io/' });
  });

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('\n>>> RUNTIME EXCEPTION THROWN:');
      console.error(JSON.stringify(data.params.exceptionDetails, null, 2));
    } else if (data.method === 'Console.messageAdded') {
      console.log('\n>>> CONSOLE MESSAGE:', data.params.message.level, data.params.message.text);
    } else if (data.method === 'Runtime.consoleAPICalled') {
      console.log('\n>>> CONSOLE API [', data.params.type, ']:', 
        data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ')
      );
    } else if (data.method === 'Network.requestWillBeSent') {
      console.log('REQUEST [', data.params.requestId, ']:', data.params.request.url);
    } else if (data.method === 'Network.responseReceived') {
      console.log('HTTP', data.params.response.status, data.params.response.url);
    } else if (data.method === 'Network.loadingFailed') {
      console.error('FAILED TO LOAD:', data.params.errorText, data.params.requestId);
    } else if (data.method === 'Page.loadEventFired') {
      console.log('PAGE LOAD EVENT FIRED!');
    }
  });

  // Run for 8 seconds to capture everything
  await new Promise(r => setTimeout(r, 8000));
  console.log('\nClosing Chrome...');
  ws.close();
  chromeProcess.kill();
}

main().catch(console.error);
