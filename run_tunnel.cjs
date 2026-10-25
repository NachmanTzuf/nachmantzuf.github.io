const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 8088;
const URL_FILE = path.resolve(__dirname, 'tunnel_url.txt');

let currentTunnel = null;
let isOpening = false;

async function startTunnel() {
  if (isOpening) return;
  isOpening = true;
  try {
    if (currentTunnel) {
      try { currentTunnel.close(); } catch (e) {}
    }
    console.log(`[Tunnel] Opening persistent tunnel for port ${PORT}...`);
    currentTunnel = await localtunnel({ port: PORT });

    const url = currentTunnel.url;
    console.log(`[Tunnel] Active public URL: ${url}`);
    fs.writeFileSync(URL_FILE, url, 'utf8');

    currentTunnel.on('close', () => {
      console.log('[Tunnel] Socket closed. Reopening in 2s...');
      setTimeout(startTunnel, 2000);
    });

    currentTunnel.on('error', (err) => {
      console.error('[Tunnel] Error:', err ? err.message : 'Unknown');
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('[Tunnel] Failed to open tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  } finally {
    isOpening = false;
  }
}

// 1. Permanent interval prevents event loop from ever exiting
const heartbeat = setInterval(() => {
  // Check if tunnel is dead or closed
  if (!currentTunnel || currentTunnel.closed) {
    console.log('[Heartbeat] Tunnel dead, restarting...');
    startTunnel();
  }
}, 15000);

// Uncaught exception handling
process.on('uncaughtException', (err) => {
  console.error('[Tunnel uncaughtException]', err.message);
  setTimeout(startTunnel, 3000);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Tunnel unhandledRejection]', reason);
  setTimeout(startTunnel, 3000);
});

startTunnel();
