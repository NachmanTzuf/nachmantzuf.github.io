const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

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

        let msgId = 100;
        const send = (method, params = {}) => {
          return new Promise((resolve) => {
            const id = ++msgId;
            const handler = (raw) => {
              const msg = JSON.parse(raw);
              if (msg.id === id) {
                ws.off('message', handler);
                resolve(msg.result);
              }
            };
            ws.on('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
          });
        };

        ws.on('open', async () => {
          await send('Page.enable');
          await send('Runtime.enable');

          console.log('Waiting 2.5s for initial load...');
          await new Promise(r => setTimeout(r, 2500));

          // 1. Capture Galaxy S24 view
          console.log('Switching to Galaxy S24...');
          await send('Runtime.evaluate', {
            expression: `
              const buttons = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent === 'Galaxy S24');
              if (buttons[0]) buttons[0].click();
            `
          });
          await new Promise(r => setTimeout(r, 1200));
          const snapGalaxy = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_galaxy_s24.png', Buffer.from(snapGalaxy.data, 'base64'));
          console.log('Saved earpa_ui_galaxy_s24.png');

          // Switch back to iPhone 15 Pro
          await send('Runtime.evaluate', {
            expression: `
              const buttons = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent === 'iPhone 15 Pro');
              if (buttons[0]) buttons[0].click();
            `
          });
          await new Promise(r => setTimeout(r, 800));

          // 2. Open Roadmap Modal
          console.log('Opening Roadmap Modal...');
          await send('Runtime.evaluate', {
            expression: `
              const mapBtns = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent.includes('TRAIL MAP') || el.textContent.trim() === 'MAP');
              if (mapBtns[0]) {
                const target = mapBtns[0].closest('[role="button"]') || mapBtns[0];
                target.click();
              }
            `
          });
          await new Promise(r => setTimeout(r, 1200));
          const snapRoadmap = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_roadmap_modal.png', Buffer.from(snapRoadmap.data, 'base64'));
          console.log('Saved earpa_ui_roadmap_modal.png');

          // Close Roadmap Modal
          await send('Runtime.evaluate', {
            expression: `
              const closeBtns = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent.trim() === '✕');
              if (closeBtns[0]) {
                const target = closeBtns[0].closest('[role="button"]') || closeBtns[0];
                target.click();
              }
            `
          });
          await new Promise(r => setTimeout(r, 800));

          // 3. Open Chords Tab
          console.log('Switching to Chords Tab...');
          await send('Runtime.evaluate', {
            expression: `
              const chordTabs = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent.trim().toUpperCase() === 'CHORDS');
              if (chordTabs[0]) chordTabs[0].click();
            `
          });
          await new Promise(r => setTimeout(r, 1000));
          const snapChords = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_chords_tab.png', Buffer.from(snapChords.data, 'base64'));
          console.log('Saved earpa_ui_chords_tab.png');

          // 4. Open Levers Tab
          console.log('Switching to Levers Tab...');
          await send('Runtime.evaluate', {
            expression: `
              const leverTabs = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent.trim().toUpperCase() === 'LEVERS');
              if (leverTabs[0]) leverTabs[0].click();
            `
          });
          await new Promise(r => setTimeout(r, 1000));
          const snapLevers = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_levers_tab.png', Buffer.from(snapLevers.data, 'base64'));
          console.log('Saved earpa_ui_levers_tab.png');

          // 5. Open Journey / Profile Tab
          console.log('Switching to Journey Tab...');
          await send('Runtime.evaluate', {
            expression: `
              const journeyTabs = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent.trim().toUpperCase() === 'JOURNEY');
              if (journeyTabs[0]) journeyTabs[0].click();
            `
          });
          await new Promise(r => setTimeout(r, 1000));
          const snapJourney = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_journey_tab.png', Buffer.from(snapJourney.data, 'base64'));
          console.log('Saved earpa_ui_journey_tab.png');

          // 6. Open PWA Installation Guide Modal
          console.log('Opening PWA Guide Modal...');
          await send('Runtime.evaluate', {
            expression: `
              const pwaBtns = Array.from(document.querySelectorAll('div, span, p')).filter(el => el.textContent.trim() === 'Install on Phone Guide');
              if (pwaBtns[0]) {
                const target = pwaBtns[0].closest('[role="button"]') || pwaBtns[0];
                target.click();
              }
            `
          });
          await new Promise(r => setTimeout(r, 1200));
          const snapPwa = await send('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync('C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95\\earpa_ui_pwa_guide_modal.png', Buffer.from(snapPwa.data, 'base64'));
          console.log('Saved earpa_ui_pwa_guide_modal.png');

          chrome.kill();
          process.exit(0);
        });
      }
    });
  });
}, 2000);
