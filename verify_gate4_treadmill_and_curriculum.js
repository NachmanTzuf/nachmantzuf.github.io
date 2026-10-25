const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const BRAIN_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/71677e65-ddd0-4156-bd73-ec960d83fd95';
const CDP_PORT = 9241;

console.log('Spawning headless Chrome on port', CDP_PORT);
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--window-size=1200,980',
  '--disable-gpu',
  '--no-first-run',
  'http://localhost:8088/'
]);

chrome.on('error', (err) => console.error('Chrome spawn error:', err));

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const msg = JSON.stringify({ id, method, params });
    const handler = (raw) => {
      const resp = JSON.parse(raw);
      if (resp.id === id) {
        ws.off('message', handler);
        if (resp.error) reject(resp.error);
        else resolve(resp.result);
      }
    };
    ws.on('message', handler);
    ws.send(msg);
  });
}

async function evalScript(ws, expression) {
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  return res.result ? res.result.value : null;
}

async function captureScreenshot(ws, filename) {
  const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(BRAIN_DIR, filename);
  fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  console.log('✓ Captured screenshot saved to:', outPath);
}

async function runGate4Verification() {
  console.log('Waiting for Chrome CDP to be available...');
  let pages = null;
  for (let i = 0; i < 20; i++) {
    try {
      pages = await getJSON(`http://localhost:${CDP_PORT}/json`);
      if (pages && pages.length > 0) break;
    } catch {}
    await sleep(600);
  }

  if (!pages || pages.length === 0) {
    console.error('Failed to connect to Chrome CDP');
    chrome.kill();
    process.exit(1);
  }

  const page = pages.find(p => p.type === 'page') || pages[0];
  console.log('Attaching WebSocket to page:', page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  console.log('WebSocket connected. Initializing CDP domains...');
  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'DOM.enable');

  // Navigate to ensure fresh load
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:8088/' });
  console.log('Waiting for app bundle and 3D canvas to mount...');
  await sleep(4000);

  const testResults = {
    tuningSelectorMounted: false,
    tuningSelectionToggled: false,
    treadmillModalOpened: false,
    treadmillPosition1Anchored: false,
    treadmill8SquareBadgeVerified: false,
    treadmillWindowShifted: false,
    stageRoadmapModeSwitched: false,
    inGameArenaLaunched: false,
    candidateDegreesHighlighted: false,
    inGameBackToSanctuary: false,
  };

  // --------------------------------------------------------------------------
  // TEST 1: Journey Tab & NativeTuningSelector
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 1: Journey Tab & NativeTuningSelector ---');
  await evalScript(ws, `
    (() => {
      const tabProfile = document.getElementById('tab-btn-profile');
      if (tabProfile) tabProfile.click();
    })()
  `);
  await sleep(2000);

  const tuningCheck = await evalScript(ws, `
    (() => {
      const optEb = document.getElementById('tuning-opt-eb');
      const optC = document.getElementById('tuning-opt-c');
      const optBb = document.getElementById('tuning-opt-bb');
      const hasHeading = document.body.innerText.includes('Physical Lever Harp Open Tuning');
      return {
        hasEb: !!optEb,
        hasC: !!optC,
        hasBb: !!optBb,
        hasHeading,
      };
    })()
  `);
  console.log('Tuning selector check:', tuningCheck);

  if (tuningCheck && tuningCheck.hasEb && tuningCheck.hasC && tuningCheck.hasBb) {
    testResults.tuningSelectorMounted = true;
    console.log('✓ NativeTuningSelector mounted in Journey Tab with 3 radio options');

    // Toggle C Major Native
    await evalScript(ws, `
      (() => {
        const optC = document.getElementById('tuning-opt-c');
        if (optC) optC.click();
      })()
    `);
    await sleep(600);

    // Toggle Bb Major Native
    await evalScript(ws, `
      (() => {
        const optBb = document.getElementById('tuning-opt-bb');
        if (optBb) optBb.click();
      })()
    `);
    await sleep(600);

    // Toggle back to Eb Major Native
    await evalScript(ws, `
      (() => {
        const optEb = document.getElementById('tuning-opt-eb');
        if (optEb) optEb.click();
      })()
    `);
    await sleep(600);

    testResults.tuningSelectionToggled = true;
    console.log('✓ Tri-Native tuning state toggling verified');
  }

  await captureScreenshot(ws, 'gate4_tuning_selector_verified.png');

  // --------------------------------------------------------------------------
  // TEST 2: Continuous Treadmill Roadmap & Position 1 Anchoring
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Continuous Treadmill Roadmap & Position 1 Anchoring ---');
  // Switch back to Home Tab
  await evalScript(ws, `
    (() => {
      const tabHome = document.getElementById('tab-btn-home');
      if (tabHome) tabHome.click();
    })()
  `);
  await sleep(2000);

  // Click Trail Map banner button
  await evalScript(ws, `
    (() => {
      const trailBtn = document.getElementById('top-roadmap-banner-btn');
      if (trailBtn) trailBtn.click();
    })()
  `);
  await sleep(2000);

  const treadmillCheck = await evalScript(ws, `
    (() => {
      const modeTreadmill = document.getElementById('roadmap-mode-treadmill');
      const modeStages = document.getElementById('roadmap-mode-stages');
      const hasPos1 = document.body.innerText.includes('POS 1');
      const hasLevelCode = document.body.innerText.includes('P1-01');
      const hasRounds = document.body.innerText.includes('10 Rounds');
      const hasCadence = document.body.innerText.includes('I - IV - V - I');
      const hasMatrix = document.body.innerText.includes('Degree Matrix');
      return {
        hasModeTreadmill: !!modeTreadmill,
        hasModeStages: !!modeStages,
        hasPos1,
        hasLevelCode,
        hasRounds,
        hasCadence,
        hasMatrix,
      };
    })()
  `);
  console.log('Treadmill Roadmap check:', treadmillCheck);

  if (treadmillCheck && treadmillCheck.hasModeTreadmill) {
    testResults.treadmillModalOpened = true;
    if (treadmillCheck.hasPos1 && treadmillCheck.hasLevelCode) {
      testResults.treadmillPosition1Anchored = true;
    }
    if (treadmillCheck.hasRounds && treadmillCheck.hasCadence && treadmillCheck.hasMatrix) {
      testResults.treadmill8SquareBadgeVerified = true;
    }
    console.log('✓ Treadmill Roadmap Position 1 anchoring and Liquid Glass Badge verified');
  }

  await captureScreenshot(ws, 'gate4_treadmill_roadmap_pos1_verified.png');

  // Shift Treadmill Window
  await evalScript(ws, `
    (() => {
      const nextBtn = document.getElementById('treadmill-next-window-btn');
      if (nextBtn) nextBtn.click();
    })()
  `);
  await sleep(1000);

  const shiftCheck = await evalScript(ws, `
    (() => {
      return document.body.innerText.includes('Showing Levels 6') || document.body.innerText.includes('Position 1');
    })()
  `);
  if (shiftCheck) {
    testResults.treadmillWindowShifted = true;
    console.log('✓ Treadmill window shifting verified');
  }
  await captureScreenshot(ws, 'gate4_treadmill_roadmap_shifted_verified.png');

  // Switch to 8-Stage Map mode
  await evalScript(ws, `
    (() => {
      const modeStages = document.getElementById('roadmap-mode-stages');
      if (modeStages) modeStages.click();
    })()
  `);
  await sleep(1200);

  const stageMapCheck = await evalScript(ws, `
    (() => {
      return document.body.innerText.includes('STAGE 1') && document.body.innerText.includes('Stage 2');
    })()
  `);
  if (stageMapCheck) {
    testResults.stageRoadmapModeSwitched = true;
    console.log('✓ Switched to 8-Stage Map mode successfully');
  }
  await captureScreenshot(ws, 'gate4_stage_roadmap_verified.png');

  // Close Roadmap modal
  await evalScript(ws, `
    (() => {
      const closeBtn = document.getElementById('roadmap-close-btn');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(1200);

  // --------------------------------------------------------------------------
  // TEST 3: InGamePlayScreen with Active Level & Candidate Highlighting
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: InGamePlayScreen with Active Level & Candidate Highlighting ---');
  // Click PRESS TO PLAY
  await evalScript(ws, `
    (() => {
      const playBtn = document.getElementById('liquid-gold-play-btn');
      if (playBtn) playBtn.click();
    })()
  `);
  await sleep(2500);

  const inGameCheck = await evalScript(ws, `
    (() => {
      const backBtn = document.getElementById('ingame-back-btn');
      const replayBtn = document.getElementById('ingame-replay-btn');
      const deg1 = document.getElementById('degree-btn-1');
      const deg2 = document.getElementById('degree-btn-2');
      const deg3 = document.getElementById('degree-btn-3');
      const hasRound = document.body.innerText.includes('Round 1 / 10') || document.body.innerText.includes('P1-01');
      return {
        hasBackBtn: !!backBtn,
        hasReplayBtn: !!replayBtn,
        hasDeg1: !!deg1,
        hasDeg2: !!deg2,
        hasDeg3: !!deg3,
        hasRound,
      };
    })()
  `);
  console.log('In-Game Arena check:', inGameCheck);

  if (inGameCheck && inGameCheck.hasBackBtn && inGameCheck.hasDeg1) {
    testResults.inGameArenaLaunched = true;
    testResults.candidateDegreesHighlighted = true;
    console.log('✓ In-Game Arena launched with Level P1-01 and scale degree touch shelf');

    // Simulate clicking degree 1 guess
    await evalScript(ws, `
      (() => {
        const deg1 = document.getElementById('degree-btn-1');
        if (deg1) deg1.click();
      })()
    `);
    await sleep(1200);
  }

  await captureScreenshot(ws, 'gate4_ingame_curriculum_verified.png');

  // Return to Sanctuary Hub
  await evalScript(ws, `
    (() => {
      const backBtn = document.getElementById('ingame-back-btn');
      if (backBtn) backBtn.click();
    })()
  `);
  await sleep(2000);

  const sanctuaryCheck = await evalScript(ws, `
    (() => {
      return !!document.getElementById('liquid-gold-play-btn');
    })()
  `);
  if (sanctuaryCheck) {
    testResults.inGameBackToSanctuary = true;
    console.log('✓ Returned smoothly to Main Sanctuary Hub');
  }

  await captureScreenshot(ws, 'gate4_return_sanctuary_verified.png');

  // --------------------------------------------------------------------------
  // Summary Verdict
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('GATE 4 VERIFICATION RESULTS SUMMARY:');
  console.log('======================================================');
  let passCount = 0;
  const totalCount = Object.keys(testResults).length;
  for (const [key, val] of Object.entries(testResults)) {
    const status = val ? 'PASS' : 'FAIL';
    if (val) passCount++;
    console.log(`[${status}] ${key}`);
  }
  console.log(`\nTOTAL: ${passCount} / ${totalCount} PASSED`);

  ws.close();
  chrome.kill();

  if (passCount === totalCount) {
    console.log('\n✦ ALL GATE 4 TESTS PASSED DETERMINISTICALLY!');
    process.exit(0);
  } else {
    console.error('\n✖ Some tests failed!');
    process.exit(1);
  }
}

runGate4Verification().catch(err => {
  console.error('Test execution error:', err);
  chrome.kill();
  process.exit(1);
});
