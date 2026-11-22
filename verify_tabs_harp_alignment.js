const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';
const PORT = 8094;
const CDP_PORT = 9284;

// Static server serving dist/
const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(__dirname, 'dist', reqPath.replace(/^[/\\]+/, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    let contentType = 'text/html';
    if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.json') || filePath.endsWith('.webmanifest')) contentType = 'application/json';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.glb')) contentType = 'model/gltf-binary';
    else if (filePath.endsWith('.mp3')) contentType = 'audio/mpeg';
    else if (filePath.endsWith('.wav')) contentType = 'audio/wav';
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=412,915',
    '--use-gl=angle',
    `http://127.0.0.1:${PORT}/`
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', async () => {
      const list = JSON.parse(body);
      const target = list.find(t => t.type === 'page') || list[0];
      const ws = new WebSocket(target.webSocketDebuggerUrl);

      ws.on('open', async () => {
        const send = (m, params = {}) => new Promise(resolve => {
          const id = Math.floor(Math.random() * 1000000);
          const handler = d => {
            const j = JSON.parse(d);
            if (j.id === id) {
              ws.off('message', handler);
              resolve(j.result);
            }
          };
          ws.on('message', handler);
          ws.send(JSON.stringify({ id, method: m, params }));
        });

        await send('Page.enable');
        await send('Runtime.enable');
        await send('DOM.enable');
        await send('Emulation.setDeviceMetricsOverride', {
          width: 412,
          height: 915,
          deviceScaleFactor: 2,
          mobile: true
        });

        // STEP A: Brand-new first-time link visitor (zero localStorage) -> Must see Download Earpa Gate BEFORE Sign-Up
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
        await new Promise(r => setTimeout(r, 800));
        await send('Runtime.evaluate', { expression: `localStorage.clear()` });
        await send('Page.reload');
        await new Promise(r => setTimeout(r, 2200));

        const pwaCheck = await send('Runtime.evaluate', {
          expression: `(() => ({
            hasDownloadBtn: !!document.getElementById('pwa-install-primary-btn'),
            bodyText: document.body.innerText.slice(0, 200)
          }))()`,
          returnByValue: true
        });
        console.log('First-Time Download Gate Check:', JSON.stringify(pwaCheck?.result?.value));
        const installShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACTS_DIR, 'verified_v40_first_time_download_gate.png'), Buffer.from(installShot.data, 'base64'));
        console.log('Saved screenshot: verified_v40_first_time_download_gate.png');

        // STEP B: Dismiss Download Gate (or simulate opening installed app ?source=pwa) -> Must see "What's your name?"
        await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = document.querySelector('[aria-label="Continue in Browser"], [accessibilitylabel="Continue in Browser"], [aria-label="Close install prompt"]');
            if (btn) btn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 1200));
        const signupShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACTS_DIR, 'verified_v43_signup_with_guest_btn.png'), Buffer.from(signupShot.data, 'base64'));
        console.log('Saved screenshot: verified_v43_signup_with_guest_btn.png');

        // STEP B2: Tap "Continue as Guest" once -> Must skip registration completely and enter playable 3D harp app
        const guestClickResult = await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = document.getElementById('continue-as-guest-btn');
            if (!btn) return { found: false };
            const rect = btn.getBoundingClientRect();
            btn.click();
            return { found: true, text: btn.innerText, top: Math.round(rect.top), height: Math.round(rect.height), width: Math.round(rect.width) };
          })()`,
          returnByValue: true
        });
        console.log('Guest Button Click Check:', JSON.stringify(guestClickResult?.result?.value));
        await new Promise(r => setTimeout(r, 2200));
        const guestEntryCheck = await send('Runtime.evaluate', {
          expression: `(() => ({
            hasCanvas: !!document.querySelector('canvas'),
            hasPlayBtn: !!document.getElementById('liquid-gold-play-btn'),
            hasGuestName: document.body.innerText.includes('Guest'),
            stillOnSignup: document.body.innerText.includes("What's your name?")
          }))()`,
          returnByValue: true
        });
        console.log('Guest One-Press App Entry Check:', JSON.stringify(guestEntryCheck?.result?.value));
        const guestShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACTS_DIR, 'verified_v43_guest_instant_entry.png'), Buffer.from(guestShot.data, 'base64'));
        console.log('Saved screenshot: verified_v43_guest_instant_entry.png');

        // STEP C: Simulate installed app with Nachman's profile to verify all tabs & Levers in-game screens
        await send('Runtime.evaluate', {
          expression: `(() => {
            try {
              localStorage.setItem('earpa_pwa_installed', 'true');
              const raw = localStorage.getItem('earpa_user_profiles_v1');
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed[0]) {
                  parsed[0].displayName = 'Nachman';
                  parsed[0].onboardingComplete = true;
                  parsed[0].progress = { single: 13, melody: 1, levers: 1 };
                  localStorage.setItem('earpa_user_profiles_v1', JSON.stringify(parsed));
                  localStorage.setItem('earpa_active_user_id_v1', parsed[0].id);
                }
              }
            } catch (e) {}
          })()`
        });
        await send('Page.reload');

        // Wait for instant loader to disappear and React app to be fully ready
        console.log('Waiting for cold boot loading to finish...');
        for (let i = 0; i < 35; i++) {
          await new Promise(r => setTimeout(r, 500));
          const check = await send('Runtime.evaluate', {
            expression: `(() => {
              const loader = document.getElementById('earpa-instant-loader');
              const canvas = document.querySelector('canvas');
              const playBtn = document.getElementById('liquid-gold-play-btn');
              return { hasLoader: !!loader, hasCanvas: !!canvas, hasPlay: !!playBtn };
            })()`,
            returnByValue: true
          });
          const val = check?.result?.value;
          if (val && !val.hasLoader && val.hasCanvas && val.hasPlay) {
            console.log(`Fully loaded and ready after ${(i + 1) * 500}ms!`);
            break;
          }
        }

        await new Promise(r => setTimeout(r, 1500));

        const captureAndMeasure = async (name, shotFileName) => {
          const metrics = await send('Runtime.evaluate', {
            expression: `(() => {
              const canvas = document.querySelector('canvas');
              const cRect = canvas ? canvas.getBoundingClientRect() : null;
              const lessonBtn = document.querySelector('#path-lesson-button');
              const lRect = lessonBtn ? lessonBtn.getBoundingClientRect() : null;
              const play = document.querySelector('#liquid-gold-play-btn');
              const pRect = play ? play.getBoundingClientRect() : null;
              return {
                view: '${name}',
                canvas: cRect ? { top: Math.round(cRect.top), height: Math.round(cRect.height), width: Math.round(cRect.width) } : null,
                lessonBtn: lRect ? { top: Math.round(lRect.top), height: Math.round(lRect.height), width: Math.round(lRect.width) } : null,
                play: pRect ? { top: Math.round(pRect.top), bottom: Math.round(pRect.bottom), height: Math.round(pRect.height) } : null
              };
            })()`,
            returnByValue: true
          });
          console.log(`=== METRICS FOR ${name} ===\n`, JSON.stringify(metrics?.result?.value, null, 2));

          if (shotFileName) {
            const shot = await send('Page.captureScreenshot', { format: 'png' });
            const outPath = path.join(ARTIFACTS_DIR, shotFileName);
            fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
            console.log(`Saved screenshot: ${outPath}`);
          }

          return metrics?.result?.value;
        };

        // 1. Single Note Tab (Level 13 - no Quick Lesson button)
        const singleMetrics = await captureAndMeasure('SINGLE NOTE (LVL 13)', 'verified_v34_single_tab.png');

        // 2. Melody Tab (Level 1 - with Quick Lesson button)
        console.log('Switching to Melody Tab...');
        await send('Runtime.evaluate', { expression: `document.querySelector('#tab-btn-chords').click()` });
        await new Promise(r => setTimeout(r, 1500));
        const melodyMetrics = await captureAndMeasure('MELODY TAB (LVL 1)', 'verified_v34_melody_tab.png');

        // 3. Levers Tab (Level 1 - with Quick Lesson button)
        console.log('Switching to Levers Tab...');
        await send('Runtime.evaluate', { expression: `document.querySelector('#tab-btn-levers').click()` });
        await new Promise(r => setTimeout(r, 1500));
        const leversMetrics = await captureAndMeasure('LEVERS TAB (LVL 1)', 'verified_v34_levers_tab.png');

        // 3B. Enter Levers In-Game Experience -> Capture Single-Screen Circle of Fifths Overview & Active Gameplay
        console.log('Entering Levers In-Game Experience...');
        await send('Runtime.evaluate', { expression: `document.querySelector('#liquid-gold-play-btn').click()` });
        await new Promise(r => setTimeout(r, 1800));
        const circleShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACTS_DIR, 'verified_v40_levers_circle_overview.png'), Buffer.from(circleShot.data, 'base64'));
        console.log('Saved screenshot: verified_v40_levers_circle_overview.png');

        await send('Runtime.evaluate', { expression: `document.querySelector('#lever-overview-play-btn')?.click()` });
        await new Promise(r => setTimeout(r, 1200));
        const leverPlayShot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACTS_DIR, 'verified_v40_levers_gameplay_clean.png'), Buffer.from(leverPlayShot.data, 'base64'));
        console.log('Saved screenshot: verified_v40_levers_gameplay_clean.png');

        // Return to Home Hub
        await send('Runtime.evaluate', {
          expression: `(() => {
            const els = Array.from(document.querySelectorAll('*'));
            const homeBtn = els.find(el => el.textContent && el.textContent.trim() === '‹ Home');
            if (homeBtn) homeBtn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 1000));

        // 4. Journey Tab TOP (verifying zero header gap & unclipped avatar)
        console.log('Switching to Journey Tab...');
        await send('Runtime.evaluate', { expression: `document.querySelector('#tab-btn-profile').click()` });
        await new Promise(r => setTimeout(r, 1500));
        await captureAndMeasure('JOURNEY TAB TOP', 'verified_v34_journey_top.png');

        // 5. Open Artisan Workshop Modal
        console.log('Opening Artisan Workshop Modal...');
        await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = document.querySelector('#journey-enter-workshop-btn') || document.querySelector('[accessibilitylabel*="Artisan"]');
            if (btn) btn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 2000));
        const shopMetrics = await captureAndMeasure('ARTISAN WORKSHOP MODAL', 'verified_v34_artisan_shop_modal.png');

        // 6. Switch to CARVES, select Forepillar Flowing Vine & Sterling Silver inlay color
        console.log('Switching to CARVES tab in Shop...');
        await send('Runtime.evaluate', {
          expression: `(() => {
            const els = Array.from(document.querySelectorAll('*'));
            const carvesBtn = els.find(el => el.textContent && el.textContent.trim() === 'CARVES');
            if (carvesBtn) carvesBtn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 900));
        await send('Runtime.evaluate', {
          expression: `(() => {
            const els = Array.from(document.querySelectorAll('*'));
            const itemBtn = els.find(el => el.textContent && el.textContent.includes('Forepillar Flowing Vine'));
            if (itemBtn) {
              itemBtn.scrollIntoView({ inline: 'center' });
              itemBtn.click();
            }
          })()`
        });
        await new Promise(r => setTimeout(r, 600));
        await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = document.querySelector('[aria-label*="Sterling Silver"], [accessibilitylabel*="Sterling Silver"]');
            if (btn) btn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 900));
        await captureAndMeasure('ARTISAN WORKSHOP CARVES PREVIEW', 'verified_v37_shop_carves_preview.png');

        // 7. Switch to SOUND tab in Shop -> Verify Aged Velvet Gut is equipped by default
        console.log('Switching to SOUND tab in Shop...');
        await send('Runtime.evaluate', {
          expression: `(() => {
            const els = Array.from(document.querySelectorAll('*'));
            const soundBtn = els.find(el => el.textContent && el.textContent.trim() === 'SOUND');
            if (soundBtn) soundBtn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 900));
        const soundCheck = await send('Runtime.evaluate', {
          expression: `(() => ({
            equippedStorage: localStorage.getItem('earpa_equipped_cosmetics_v1'),
            migratedFlag: localStorage.getItem('earpa_sound_default_v44_migrated'),
            hasAgedVelvetGut: document.body.innerText.includes('Aged Velvet Gut')
          }))()`,
          returnByValue: true
        });
        console.log('Default Sound Check:', JSON.stringify(soundCheck?.result?.value));
        await captureAndMeasure('ARTISAN WORKSHOP SOUND DEFAULT', 'verified_v44_shop_sound_default_aged_velvet_gut.png');

        // Check deltas
        console.log('\n================ DELTA AUDIT ================');
        console.log('Single Canvas (158px baseline):', singleMetrics.canvas);
        console.log('Melody Canvas:                 ', melodyMetrics.canvas);
        console.log('Levers Canvas:                 ', leversMetrics.canvas);
        console.log('Shop Canvas:                   ', shopMetrics.canvas);
        console.log('Single Play Btn:               ', singleMetrics.play);
        console.log('Melody Play Btn:               ', melodyMetrics.play);
        console.log('Levers Play Btn:               ', leversMetrics.play);

        ws.close();
        chrome.kill();
        server.close();
        process.exit(0);
      });
    });
  });
});
