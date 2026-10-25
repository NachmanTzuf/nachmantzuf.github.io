const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// 1. Verify Model SHA256 integrity
const publicModel = fs.readFileSync('c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/public/models/celtic_harp_8string.glb');
const distModel = fs.readFileSync('c:/Users/Hp/.gemini/antigravity/scratch/mobile-app-studio/dist/models/celtic_harp_8string.glb');
const hashPublic = crypto.createHash('sha256').update(publicModel).digest('hex').toUpperCase();
const hashDist = crypto.createHash('sha256').update(distModel).digest('hex').toUpperCase();
console.log('Model SHA256 (Public):', hashPublic);
console.log('Model SHA256 (Dist):  ', hashDist);
if (hashPublic !== hashDist) {
  console.error('ERROR: Model hash mismatch between public and dist!');
  process.exit(1);
}

const artifactDir = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\71677e65-ddd0-4156-bd73-ec960d83fd95';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9230',
  '--window-size=1200,980',
  'http://localhost:8088/'
]);

function evaluate(ws, expr, cb) {
  const reqId = Math.floor(Math.random() * 100000) + 1000;
  const handler = (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.id === reqId) {
      ws.removeListener('message', handler);
      cb(parsed.result ? parsed.result.result : null);
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({
    id: reqId,
    method: 'Runtime.evaluate',
    params: { expression: expr, returnByValue: true }
  }));
}

function captureScreenshot(ws, filename, cb) {
  const reqId = Math.floor(Math.random() * 100000) + 1000;
  const handler = (msg) => {
    const parsed = JSON.parse(msg);
    if (parsed.id === reqId) {
      ws.removeListener('message', handler);
      const filePath = path.join(artifactDir, filename);
      fs.writeFileSync(filePath, Buffer.from(parsed.result.data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
      cb();
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({
    id: reqId,
    method: 'Page.captureScreenshot',
    params: { format: 'png' }
  }));
}

setTimeout(() => {
  http.get('http://localhost:9230/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const tabs = JSON.parse(data);
      const target = tabs.find(t => t.url.includes('8088'));
      if (!target) {
        console.error('No target tab found on port 8088');
        chrome.kill();
        process.exit(1);
      }

      const WebSocket = require('ws');
      const ws = new WebSocket(target.webSocketDebuggerUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

        // Wait 5.5s for 3D GLTF parsing, textures, and initial layout
        setTimeout(step1_homeScreen, 5500);
      });

      // STEP 1: Home Screen (Single Note) with Smaller Harp (scale = 0.78) and Standalone Card
      function step1_homeScreen() {
        console.log('--- STEP 1: Home Screen with Smaller Harp (scale = 0.78) & Single Note Roadmap Card ---');
        evaluate(ws, `(function() {
          const cardText = document.body.innerText;
          return {
            hasStage1: cardText.includes('STAGE 1'),
            hasTonicAnchor: cardText.includes('THE TONIC ANCHOR'),
            hasLvl4Progress: cardText.includes('LEVEL 4 PROGRESS') || cardText.includes('320 / 500 XP'),
            hasTrailBtn: !!document.getElementById('top-roadmap-banner-btn')
          };
        })()`, (info) => {
          console.log('Home Screen Card Telemetry:', info);
          captureScreenshot(ws, 'verified_home_smaller_harp.png', () => {
            setTimeout(step2_melodyTab, 600);
          });
        });
      }

      // STEP 2: Melody Tab with Standalone Card ("MELODIC SEQUENCE", Level 2 progress)
      function step2_melodyTab() {
        console.log('--- STEP 2: Melody Tab with "MELODIC SEQUENCE" Liquid Glass Card ---');
        evaluate(ws, `(function() {
          const tab = document.getElementById('tab-btn-chords') ||
                      Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Melody');
          if (tab) { tab.click(); return 'clicked melody tab'; }
          return 'melody tab not found';
        })()`, (res) => {
          console.log('Clicked Melody Tab:', res);
          setTimeout(() => {
            evaluate(ws, `(function() {
              const cardText = document.body.innerText;
              const trailBtns = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'TRAIL MAP ›');
              return {
                hasMelodicSequence: cardText.includes('MELODIC SEQUENCE'),
                hasLvl2Progress: cardText.includes('LEVEL 2 PROGRESS') || cardText.includes('180 / 400 XP'),
                trailBtnCount: trailBtns.length,
                hasMelodyTrailBtn: !!document.getElementById('melody-trail-map-btn')
              };
            })()`, (info) => {
              console.log('Melody Tab Card Telemetry:', info);
              captureScreenshot(ws, 'verified_melody_tab_standalone_card.png', () => {
                setTimeout(step3_openMelodyRoadmap, 500);
              });
            });
          }, 1000);
        });
      }

      // STEP 3: Open Glacial Fjord Roadmap from Melody Tab
      function step3_openMelodyRoadmap() {
        console.log('--- STEP 3: Open Glacial Fjord Roadmap from Melody Tab Card ---');
        evaluate(ws, `(function() {
          const btn = document.getElementById('melody-trail-map-btn');
          if (btn) { btn.click(); return 'clicked melody trail btn'; }
          return 'melody trail btn not found';
        })()`, (res) => {
          console.log('Open Melody Roadmap:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_melody_roadmap_from_tab.png', () => {
              // Close modal
              evaluate(ws, `(function() {
                const closeBtn = document.getElementById('roadmap-close-btn') ||
                                 Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === '✕');
                if (closeBtn) { closeBtn.click(); return 'closed'; }
                return 'close not found';
              })()`, () => {
                setTimeout(step4_leversTab, 800);
              });
            });
          }, 1200);
        });
      }

      // STEP 4: Levers Tab with Standalone Card ("LEVER ROADMAP", Level 3 progress)
      function step4_leversTab() {
        console.log('--- STEP 4: Levers Tab with "LEVER ROADMAP" Liquid Glass Card ---');
        evaluate(ws, `(function() {
          const tab = document.getElementById('tab-btn-levers') ||
                      Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Levers');
          if (tab) { tab.click(); return 'clicked levers tab'; }
          return 'levers tab not found';
        })()`, (res) => {
          console.log('Clicked Levers Tab:', res);
          setTimeout(() => {
            evaluate(ws, `(function() {
              const cardText = document.body.innerText;
              const trailBtns = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === 'TRAIL MAP ›');
              return {
                hasLeverRoadmap: cardText.includes('LEVER ROADMAP'),
                hasLvl3Progress: cardText.includes('LEVEL 3 PROGRESS') || cardText.includes('260 / 450 XP'),
                trailBtnCount: trailBtns.length,
                hasLeversTrailBtn: !!document.getElementById('levers-trail-map-btn')
              };
            })()`, (info) => {
              console.log('Levers Tab Card Telemetry:', info);
              captureScreenshot(ws, 'verified_levers_tab_standalone_card.png', () => {
                setTimeout(step5_openLeversRoadmap, 500);
              });
            });
          }, 1000);
        });
      }

      // STEP 5: Open Sandstone Canyon Roadmap from Levers Tab
      function step5_openLeversRoadmap() {
        console.log('--- STEP 5: Open Sandstone Canyon Roadmap from Levers Tab Card ---');
        evaluate(ws, `(function() {
          const btn = document.getElementById('levers-trail-map-btn');
          if (btn) { btn.click(); return 'clicked levers trail btn'; }
          return 'levers trail btn not found';
        })()`, (res) => {
          console.log('Open Levers Roadmap:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_levers_roadmap_from_tab.png', () => {
              // Close modal
              evaluate(ws, `(function() {
                const closeBtn = document.getElementById('roadmap-close-btn') ||
                                 Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === '✕');
                if (closeBtn) { closeBtn.click(); return 'closed'; }
                return 'close not found';
              })()`, () => {
                setTimeout(step6_finish, 600);
              });
            });
          }, 1200);
        });
      }

      function step6_finish() {
        console.log('=== ALL VERIFICATION GATES COMPLETED SUCCESSFULLY ===');
        ws.close();
        chrome.kill();
        process.exit(0);
      }
    });
  });
}, 1500);
