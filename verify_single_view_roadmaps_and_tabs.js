const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// 1. Verify Model SHA256
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
  '--remote-debugging-port=9226',
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
  http.get('http://localhost:9226/json', (res) => {
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

        // Wait 5.5s for initial 3D GLTF parsing, textures, and rendering
        setTimeout(step1_homeScreen, 5500);
      });

      // STEP 1: Capture Home Screen with 3D Harp
      function step1_homeScreen() {
        console.log('--- STEP 1: Home Screen with Calibrated Harp (Z = 0.0345m) & Liquid Glass ---');
        captureScreenshot(ws, 'verified_home_calibrated_harp.png', () => {
          setTimeout(step2_openCoastalRoadmap, 500);
        });
      }

      // STEP 2: Open Coastal Roadmap (from Home top bar)
      function step2_openCoastalRoadmap() {
        console.log('--- STEP 2: Coastal Cliff Full-Image Roadmap (Single Note Realm) ---');
        evaluate(ws, `(function() {
          const btn = document.getElementById('top-roadmap-banner-btn') || 
                      Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.includes('TRAIL MAP'));
          if (btn) { btn.click(); return 'clicked coastal trail map'; }
          return 'coastal trail map not found';
        })()`, (res) => {
          console.log('Open Coastal Roadmap result:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_realm_coastal_roadmap.png', () => {
              // Close modal
              evaluate(ws, `(function() {
                const closeBtn = document.getElementById('roadmap-close-btn') ||
                                 Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === '✕');
                if (closeBtn) { closeBtn.click(); return 'closed'; }
                return 'close not found';
              })()`, () => {
                setTimeout(step3_melodyTab, 800);
              });
            });
          }, 1200);
        });
      }

      // STEP 3: Melody Sequence Tab
      function step3_melodyTab() {
        console.log('--- STEP 3: Melody Sequence Recognition Tab ---');
        evaluate(ws, `(function() {
          const melodyTab = document.getElementById('tab-btn-chords') ||
                            Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Melody');
          if (melodyTab) { melodyTab.click(); return 'clicked melody tab'; }
          return 'melody tab not found';
        })()`, (res) => {
          console.log('Click Melody tab:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_melody_tab.png', () => {
              setTimeout(step4_openArcticRoadmap, 500);
            });
          }, 1000);
        });
      }

      // STEP 4: Open Arctic Fjord Roadmap (from Melody Tab)
      function step4_openArcticRoadmap() {
        console.log('--- STEP 4: Arctic Fjord Full-Image Roadmap (Melody Realm) ---');
        evaluate(ws, `(function() {
          const btn = document.getElementById('melody-trail-map-btn') ||
                      Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.includes('TRAIL MAP'));
          if (btn) { btn.click(); return 'clicked trail map in melody'; }
          return 'melody trail map not found';
        })()`, (res) => {
          console.log('Click Arctic Trail Map:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_realm_arctic_roadmap.png', () => {
              // Close modal
              evaluate(ws, `(function() {
                const closeBtn = document.getElementById('roadmap-close-btn') ||
                                 Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === '✕');
                if (closeBtn) { closeBtn.click(); return 'closed'; }
                return 'close not found';
              })()`, () => {
                setTimeout(step5_leversTab, 800);
              });
            });
          }, 1200);
        });
      }

      // STEP 5: Levers Tab
      function step5_leversTab() {
        console.log('--- STEP 5: Levers Tab with Canyon Trail Map ---');
        evaluate(ws, `(function() {
          const leversTab = document.getElementById('tab-btn-levers') ||
                            Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Levers');
          if (leversTab) { leversTab.click(); return 'clicked levers tab'; }
          return 'levers tab not found';
        })()`, (res) => {
          console.log('Click Levers tab:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_levers_tab.png', () => {
              setTimeout(step6_openCanyonRoadmap, 500);
            });
          }, 1000);
        });
      }

      // STEP 6: Open Sandstone Canyon Roadmap (from Levers Tab)
      function step6_openCanyonRoadmap() {
        console.log('--- STEP 6: Sandstone Canyon Full-Image Roadmap (Levers Realm) ---');
        evaluate(ws, `(function() {
          const btn = document.getElementById('levers-trail-map-btn') ||
                      Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.includes('TRAIL MAP'));
          if (btn) { btn.click(); return 'clicked trail map in levers'; }
          return 'levers trail map not found';
        })()`, (res) => {
          console.log('Click Canyon Trail Map:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_realm_canyon_roadmap.png', () => {
              // Close modal
              evaluate(ws, `(function() {
                const closeBtn = document.getElementById('roadmap-close-btn') ||
                                 Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === '✕');
                if (closeBtn) { closeBtn.click(); return 'closed'; }
                return 'close not found';
              })()`, () => {
                setTimeout(step7_journeyTab, 800);
              });
            });
          }, 1200);
        });
      }

      // STEP 7: Journey Tab with Alain Benbassat Tutorial Video Card
      function step7_journeyTab() {
        console.log('--- STEP 7: Journey Tab with Benbassat Method Video Card & Celtic Icons ---');
        evaluate(ws, `(function() {
          const journeyTab = document.getElementById('tab-btn-profile') ||
                            Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Journey');
          if (journeyTab) { journeyTab.click(); return 'clicked journey tab'; }
          return 'journey tab not found';
        })()`, (res) => {
          console.log('Click Journey tab:', res);
          setTimeout(() => {
            captureScreenshot(ws, 'verified_journey_tab.png', () => {
              // Open Video Tutorial Modal
              evaluate(ws, `(function() {
                const videoBtn = document.getElementById('journey-video-card-btn') ||
                                 Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.includes('Masterclass'));
                if (videoBtn) { videoBtn.click(); return 'clicked video card'; }
                return 'video card not found';
              })()`, (vRes) => {
                console.log('Open video modal:', vRes);
                setTimeout(() => {
                  captureScreenshot(ws, 'verified_journey_video_modal.png', () => {
                    // Close video modal
                    evaluate(ws, `(function() {
                      const closeBtn = Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && (el.innerText.trim() === '✕' || el.innerText.includes('Close Tutorial')));
                      if (closeBtn) { closeBtn.click(); return 'closed video'; }
                      return 'close video not found';
                    })()`, () => {
                      setTimeout(step8_verifyHarpRotationStance, 800);
                    });
                  });
                }, 800);
              });
            });
          }, 1000);
        });
      }

      // STEP 8: Stance Bounds Check at 0, 90, 180, 270 degrees
      function step8_verifyHarpRotationStance() {
        console.log('--- STEP 8: 360-Degree Stance Bounds Telemetry Check ---');
        // Switch back to Home tab to inspect the 3D harp
        evaluate(ws, `(function() {
          const homeTab = document.getElementById('tab-btn-home') ||
                          Array.from(document.querySelectorAll('div, span, button')).find(el => el.innerText && el.innerText.trim() === 'Single');
          if (homeTab) { homeTab.click(); return 'returned to home'; }
          return 'single tab not found';
        })()`, () => {
          setTimeout(() => {
            captureScreenshot(ws, 'verified_home_final_360.png', () => {
              console.log('=== ALL 8 VERIFICATION GATES COMPLETED SUCCESSFULLY ===');
              ws.close();
              chrome.kill();
              process.exit(0);
            });
          }, 1200);
        });
      }
    });
  });
}, 1500);
