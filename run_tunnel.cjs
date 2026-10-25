const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

const PORT = 8088;
const URL_FILE = path.resolve(__dirname, 'tunnel_url.txt');

let currentTunnel = null;

async function startTunnel() {
  try {
    console.log(`[Tunnel] Opening persistent tunnel for port ${PORT}...`);
    currentTunnel = await localtunnel({ port: PORT });

    const url = currentTunnel.url;
    console.log(`[Tunnel] Active public URL: ${url}`);
    fs.writeFileSync(URL_FILE, url, 'utf8');

    currentTunnel.on('close', () => {
      console.log('[Tunnel] Tunnel closed. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    currentTunnel.on('error', (err) => {
      console.error('[Tunnel] Error:', err.message);
      try { currentTunnel.close(); } catch(e) {}
    });
  } catch (err) {
    console.error('[Tunnel] Failed to open tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

// Keep event loop alive
process.on('SIGINT', () => {
  if (currentTunnel) currentTunnel.close();
  process.exit(0);
});

startTunnel();
