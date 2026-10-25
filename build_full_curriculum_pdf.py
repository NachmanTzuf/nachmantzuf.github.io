import os
import subprocess

DESKTOP_DIR = r"C:\Users\Hp\Desktop\all levels screen shots"
OUTPUT_PDF = os.path.join(DESKTOP_DIR, "instruction general instructions.pdf")
TEMP_HTML = os.path.join(r"C:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio", "full_curriculum_instructions.html")
EDGE_EXE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Comprehensive Ear Training Curriculum Specification</title>
<style>
  @page {
    size: A4 portrait;
    margin: 14mm 12mm 14mm 12mm;
    @bottom-right {
      content: "Page " counter(page);
      font-size: 8pt;
      color: #718096;
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1a202c;
    background: #ffffff;
    line-height: 1.45;
    font-size: 9pt;
  }
  .doc-header {
    border-bottom: 3px solid #2b6cb0;
    padding-bottom: 12px;
    margin-bottom: 18px;
  }
  .doc-title {
    font-size: 20pt;
    font-weight: 800;
    color: #1a365d;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
  }
  .doc-subtitle {
    font-size: 11pt;
    color: #4a5568;
    margin: 0 0 8px 0;
    font-weight: 500;
  }
  .doc-meta {
    font-size: 8.5pt;
    color: #718096;
    display: flex;
    gap: 18px;
  }
  .doc-meta strong { color: #2d3748; }
  h2 {
    font-size: 13pt;
    color: #2b6cb0;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 20px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 10.5pt;
    color: #2d3748;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  p { margin: 0 0 8px 0; }
  ul, ol { margin: 0 0 10px 0; padding-left: 20px; }
  li { margin-bottom: 3px; }
  .callout {
    background: #ebf8ff;
    border-left: 4px solid #3182ce;
    padding: 10px 12px;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 9pt;
  }
  .callout-title {
    font-weight: 700;
    color: #2b6cb0;
    margin-bottom: 3px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 14px 0;
    font-size: 8pt;
  }
  th, td {
    border: 1px solid #cbd5e0;
    padding: 5px 7px;
    text-align: left;
    vertical-align: middle;
  }
  th {
    background: #edf2f7;
    color: #2d3748;
    font-weight: 700;
  }
  tr:nth-child(even) td { background: #f7fafc; }
  .badge {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 7.5pt;
    font-weight: 600;
  }
  .badge-blue { background: #e2e8f0; color: #2b6cb0; border: 1px solid #cbd5e0; }
  .badge-green { background: #c6f6d5; color: #22543d; }
  .badge-purple { background: #e9d8fd; color: #553c9e; }
  .badge-orange { background: #feebc8; color: #9c4221; }
  .square-matrix {
    display: inline-flex;
    gap: 2px;
    vertical-align: middle;
  }
  .sq {
    width: 8px;
    height: 8px;
    border-radius: 1px;
    display: inline-block;
  }
  .sq-act { background: #1a365d; }
  .sq-inact { background: #cbd5e0; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>

<div class="doc-header">
  <div class="doc-title">Master Ear Training Curriculum & Technical Engine Specification</div>
  <div class="doc-subtitle">Complete Screenshot Audit, Decoded Level Matrices, Eased Beginner Track, and Perfectly Balanced 68-Level Parallel Paths</div>
  <div class="doc-meta">
    <span><strong>Audited Directory:</strong> Desktop / all levels screen shots</span>
    <span><strong>Curriculum Architecture:</strong> Path 1 (Single Note & Harmonic Dyads: 68 Levels) | Path 2 (Melodic Sequences: 68 Levels)</span>
    <span><strong>Status:</strong> Approved Production Master</span>
  </div>
</div>

<div class="callout">
  <div class="callout-title">EXECUTIVE SYSTEM ARCHITECTURE</div>
  This specification defines the complete ear training curriculum for the production mobile application. Based on a rigorous audit of all screenshots across <code>single note trainig</code>, <code>note sequance training</code>, and <code>other instractions and deta</code>, this document maps out every single level, parameter, and rule. The two major paths have been mathematically balanced to exactly <strong>68 levels each</strong> by pruning unplayable extreme speeds and integrating a rich, pedagogical 27-level Advanced Harmonic Dyads track.
</div>

<h2>1. System Fundamentals & Metric Decoding</h2>
<p>Every level card contains five distinct engine parameters that determine game behavior:</p>
<ul>
  <li><strong>Rounds per Session:</strong> Displayed as <code>10:</code> or <code>20:</code> (50 in mastery finals). This is the exact number of trials before calculating user score.</li>
  <li><strong>Register / Octave Scope:</strong> <code>1 octave</code> limits tone playback to the middle vocal register (C4 to C5). <code>many octaves</code> spreads tones across low, middle, and high registers.</li>
  <li><strong>Harmonic Cadence:</strong> Played prior to each question (<code>I-IV-V-I</code> in major; <code>i-iv-V-i</code> in minor) to establish the tonic center.</li>
  <li><strong>Diatonic Note Matrix:</strong> 8 inline blocks representing the diatonic scale degrees (1=Do, 2=Re, 3=Mi, 4=Fa, 5=Sol, 6=La, 7=Ti, 8=Do). Dark blocks indicate active notes user must recognize. In chromatic modes, a 12-block piano matrix is utilized.</li>
  <li><strong>Key Signature Modes:</strong> <code>C major/minor</code> (fixed tonic C), <code>Not-C</code> (session locked to a single random non-C key), and <code>Random</code> (every question switches to a new random key).</li>
  <li><strong>Tonic Resolution Pipeline:</strong> Upon correct answer submission, the engine plays the stepwise resolution back to the nearest tonic (<code>1 &larr; 2 &larr; 3 &larr; 4</code> and <code>5 &rarr; 6 &rarr; 7 &rarr; 1</code>).</li>
</ul>

<div class="page-break"></div>

<h2>2. PATH 1: Single Note & Simultaneous Harmonic Dyads Track (Exact 68 Levels)</h2>
<p>Path 1 progresses from absolute beginner two-note foundations, through diatonic and chromatic scales, culminating in 27 levels of simultaneous two-note harmonic dyads.</p>

<h3>Module 0: Intro Game - Gentle Beginner Onboarding (Levels 1 to 9)</h3>
<p>Extracted directly from <code>other instractions and deta / Intro Game</code>. Starts with 2 notes and 10 questions per round.</p>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 20%;">Level Title</th>
      <th style="width: 10%;">Questions</th>
      <th style="width: 12%;">Octave</th>
      <th style="width: 14%;">Cadence</th>
      <th style="width: 16%;">Active Degrees</th>
      <th>Acoustic & Pedagogical Focus</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P1-01</strong></td>
      <td>Intro 1: Do, Re</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1, 2 (Do, Re)</td>
      <td>Distinguish stable tonic vs stepwise tension. Re resolves to Do.</td>
    </tr>
    <tr>
      <td><strong>P1-02</strong></td>
      <td>Intro 2: Do, Re, Mi</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1, 2, 3 (Do, Re, Mi)</td>
      <td>Introduce bright major 3rd. Mi resolves down through Re to Do.</td>
    </tr>
    <tr>
      <td><strong>P1-03</strong></td>
      <td>Intro 3: Do, Re, Mi, Fa</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1, 2, 3, 4 (Do-Fa)</td>
      <td>Lower tetrachord. Fa resolves downward to Mi then Do.</td>
    </tr>
    <tr>
      <td><strong>P1-04</strong></td>
      <td>Intro 4: Ti, Do</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>7, 8 (Ti, High Do)</td>
      <td>Leading tone magnetic pull upward into tonic.</td>
    </tr>
    <tr>
      <td><strong>P1-05</strong></td>
      <td>Intro 5: La, Ti, Do</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>6, 7, 8 (La-Do)</td>
      <td>Upper register stepwise approach into upper tonic.</td>
    </tr>
    <tr>
      <td><strong>P1-06</strong></td>
      <td>Intro 6: Sol, La, Ti, Do</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>5, 6, 7, 8 (Sol-Do)</td>
      <td>Upper tetrachord. Sol acts as anchor for upper notes.</td>
    </tr>
    <tr>
      <td><strong>P1-07</strong></td>
      <td>Intro 7: The Whole Octave</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1, 2, 3, 4, 5, 6, 7, 8</td>
      <td>Complete 1-octave diatonic scale.</td>
    </tr>
    <tr>
      <td><strong>P1-08</strong></td>
      <td>Intro 8: Another Octave</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>High octave</td>
      <td>I-IV-V-I</td>
      <td>1, 2, 3, 4, 5, 6, 7, 8</td>
      <td>Repeat diatonic scale in higher vocal register.</td>
    </tr>
    <tr>
      <td><strong>P1-09</strong></td>
      <td>Intro 9: Two Octaves Together</td>
      <td><span class="badge badge-blue">10</span></td>
      <td>2 octaves</td>
      <td>I-IV-V-I</td>
      <td>16 active pitch keys</td>
      <td>Diatonic identification across dual octaves.</td>
    </tr>
  </tbody>
</table>

<h3>Module 1: The Major Scale Single Note (Levels 10 to 17)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 20%;">Level Title</th>
      <th style="width: 10%;">Questions</th>
      <th style="width: 12%;">Octave</th>
      <th style="width: 14%;">Cadence</th>
      <th style="width: 16%;">Active Degrees</th>
      <th>Notes & Key Mode</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P1-10</strong></td>
      <td>C Major - Lower Tetrachord</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1, 2, 3, 4</td>
      <td>Fixed C major (C, D, E, F)</td>
    </tr>
    <tr>
      <td><strong>P1-11</strong></td>
      <td>C Major - Upper Tetrachord</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>5, 6, 7, 8</td>
      <td>Fixed C major (G, A, B, C)</td>
    </tr>
    <tr>
      <td><strong>P1-12</strong></td>
      <td>C Major - Full Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 8 diatonic</td>
      <td>Fixed C major (C4 to C5)</td>
    </tr>
    <tr>
      <td><strong>P1-13</strong></td>
      <td>C Major - Multi-Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All 8 diatonic</td>
      <td>Fixed C major across 3 octaves</td>
    </tr>
    <tr>
      <td><strong>P1-14</strong></td>
      <td>Not-C Major - 1 Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 8 diatonic</td>
      <td>Session locked to 1 random key</td>
    </tr>
    <tr>
      <td><strong>P1-15</strong></td>
      <td>Not-C Major - Multi-Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All 8 diatonic</td>
      <td>Session locked to 1 random key</td>
    </tr>
    <tr>
      <td><strong>P1-16</strong></td>
      <td>Random Major - 1 Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 8 diatonic</td>
      <td>Cadence changes key every trial</td>
    </tr>
    <tr>
      <td><strong>P1-17</strong></td>
      <td>Random Major - Master Exam</td>
      <td><span class="badge badge-orange">50</span></td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All 8 diatonic</td>
      <td>50-question master test across all keys</td>
    </tr>
  </tbody>
</table>

<h3>Module 2: Chromatics in Major Context (Levels 18 to 25)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 20%;">Level Title</th>
      <th style="width: 10%;">Questions</th>
      <th style="width: 12%;">Octave</th>
      <th style="width: 14%;">Cadence</th>
      <th style="width: 16%;">Active Degrees</th>
      <th>Chromatic Coverage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P1-18</strong></td>
      <td>C Major Chromatic - Lower</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1, b2, 2, b3, 3, 4</td>
      <td>Lower semitones (C, Db, D, Eb, E, F)</td>
    </tr>
    <tr>
      <td><strong>P1-19</strong></td>
      <td>C Major Chromatic - Upper</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>#4, 5, b6, 6, b7, 7, 8</td>
      <td>Upper semitones (F#, G, Ab, A, Bb, B, C)</td>
    </tr>
    <tr>
      <td><strong>P1-20</strong></td>
      <td>C Major Chromatic - Full</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 12 chromatic</td>
      <td>Complete 12-tone chromatic pool</td>
    </tr>
    <tr>
      <td><strong>P1-21</strong></td>
      <td>C Major Chromatic - Multi</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All 12 chromatic</td>
      <td>12 tones across multiple registers</td>
    </tr>
    <tr>
      <td><strong>P1-22</strong></td>
      <td>Not-C Chromatic - 1 Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 12 chromatic</td>
      <td>Locked random key, all 12 semitones</td>
    </tr>
    <tr>
      <td><strong>P1-23</strong></td>
      <td>Not-C Chromatic - Multi</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All 12 chromatic</td>
      <td>Locked random key across registers</td>
    </tr>
    <tr>
      <td><strong>P1-24</strong></td>
      <td>Random Major Chromatic</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 12 chromatic</td>
      <td>Key changes every trial</td>
    </tr>
    <tr>
      <td><strong>P1-25</strong></td>
      <td>Random Major Chromatic Final</td>
      <td><span class="badge badge-orange">50</span></td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All 12 chromatic</td>
      <td>50-question chromatic master exam</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h3>Module 3: The Minor Scale (Levels 26 to 33)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 20%;">Level Title</th>
      <th style="width: 10%;">Questions</th>
      <th style="width: 12%;">Octave</th>
      <th style="width: 14%;">Cadence</th>
      <th style="width: 16%;">Active Degrees</th>
      <th>Minor Tonal Logic</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P1-26</strong></td>
      <td>C Minor - Lower Tetrachord</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>1, 2, b3, 4 (Do-Re-Me-Fa)</td>
      <td>Natural minor lower tetrachord</td>
    </tr>
    <tr>
      <td><strong>P1-27</strong></td>
      <td>C Minor - Upper Tetrachord</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>5, b6, b7, 8 (Sol-Le-Te-Do)</td>
      <td>Natural minor upper tetrachord</td>
    </tr>
    <tr>
      <td><strong>P1-28</strong></td>
      <td>C Minor - Full Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>All 8 diatonic minor</td>
      <td>Complete natural minor scale</td>
    </tr>
    <tr>
      <td><strong>P1-29</strong></td>
      <td>C Minor - Multi-Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>i-iv-V-i</td>
      <td>All 8 diatonic minor</td>
      <td>Natural minor across registers</td>
    </tr>
    <tr>
      <td><strong>P1-30</strong></td>
      <td>Not-C Minor - 1 Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>All 8 diatonic minor</td>
      <td>Session locked to 1 random minor key</td>
    </tr>
    <tr>
      <td><strong>P1-31</strong></td>
      <td>Not-C Minor - Multi-Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>i-iv-V-i</td>
      <td>All 8 diatonic minor</td>
      <td>Session locked to 1 random minor key</td>
    </tr>
    <tr>
      <td><strong>P1-32</strong></td>
      <td>Random Minor - 1 Octave</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>All 8 diatonic minor</td>
      <td>Minor key switches every trial</td>
    </tr>
    <tr>
      <td><strong>P1-33</strong></td>
      <td>Random Minor - Master Exam</td>
      <td><span class="badge badge-orange">50</span></td>
      <td>Many octaves</td>
      <td>i-iv-V-i</td>
      <td>All 8 diatonic minor</td>
      <td>50-question master diatonic minor exam</td>
    </tr>
  </tbody>
</table>

<h3>Module 4: Chromatics in Minor Context (Levels 34 to 41)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 20%;">Level Title</th>
      <th style="width: 10%;">Questions</th>
      <th style="width: 12%;">Octave</th>
      <th style="width: 14%;">Cadence</th>
      <th style="width: 16%;">Active Degrees</th>
      <th>Minor Chromatic Logic</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P1-34</strong></td>
      <td>C Minor Chromatic - Lower</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>1, b2, 2, b3, 3, 4</td>
      <td>Lower semitones against minor cadence</td>
    </tr>
    <tr>
      <td><strong>P1-35</strong></td>
      <td>C Minor Chromatic - Upper</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>#4, 5, b6, 6, b7, 7, 8</td>
      <td>Upper semitones against minor cadence</td>
    </tr>
    <tr>
      <td><strong>P1-36</strong></td>
      <td>C Minor Chromatic - Full</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>All 12 chromatic</td>
      <td>Full 12-tone chromatic in minor context</td>
    </tr>
    <tr>
      <td><strong>P1-37</strong></td>
      <td>C Minor Chromatic - Multi</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>i-iv-V-i</td>
      <td>All 12 chromatic</td>
      <td>Multi-octave chromatic minor</td>
    </tr>
    <tr>
      <td><strong>P1-38</strong></td>
      <td>Not-C Minor Chromatic - 1 Oct</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>All 12 chromatic</td>
      <td>Single locked random minor key</td>
    </tr>
    <tr>
      <td><strong>P1-39</strong></td>
      <td>Not-C Minor Chromatic - Multi</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>Many octaves</td>
      <td>i-iv-V-i</td>
      <td>All 12 chromatic</td>
      <td>Locked random minor key across registers</td>
    </tr>
    <tr>
      <td><strong>P1-40</strong></td>
      <td>Random Minor Chromatic</td>
      <td><span class="badge badge-blue">20</span></td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>All 12 chromatic</td>
      <td>Minor key switches every trial</td>
    </tr>
    <tr>
      <td><strong>P1-41</strong></td>
      <td>Random Minor Chromatic Final</td>
      <td><span class="badge badge-orange">50</span></td>
      <td>Many octaves</td>
      <td>i-iv-V-i</td>
      <td>All 12 chromatic</td>
      <td>50-question minor chromatic master test</td>
    </tr>
  </tbody>
</table>

<h3>Module 5: Advanced Harmonic Dyads - Two Notes Simultaneously (Levels 42 to 68)</h3>
<p>In this premier 27-level track, the engine plays <strong>two notes simultaneously</strong>. The user must identify the harmonic dyad interval.</p>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 22%;">Level Title</th>
      <th style="width: 8%;">Quest.</th>
      <th style="width: 12%;">Octave</th>
      <th style="width: 14%;">Cadence</th>
      <th style="width: 18%;">Intervals Tested</th>
      <th>Acoustic & Harmonic Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P1-42</strong></td>
      <td>Harmonic 1: Octaves & Unisons</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-1, 1-8 (Unison, Octave)</td>
      <td>Pure acoustic unisons. Zero beating frequencies.</td>
    </tr>
    <tr>
      <td><strong>P1-43</strong></td>
      <td>Harmonic 2: Perfect Fifths</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-1, 1-5, 1-8</td>
      <td>Open hollow fifths. Distinguish 5th vs 8ve.</td>
    </tr>
    <tr>
      <td><strong>P1-44</strong></td>
      <td>Harmonic 3: Perfect Fourths</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-4, 1-5, 1-8</td>
      <td>Inverted fifths. Subtle harmonic tension of fourths.</td>
    </tr>
    <tr>
      <td><strong>P1-45</strong></td>
      <td>Harmonic 4: Open Consonance Review</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-1, 1-4, 1-5, 1-8</td>
      <td>Speed review of all open consonances.</td>
    </tr>
    <tr>
      <td><strong>P1-46</strong></td>
      <td>Harmonic 5: Major Thirds</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-3, 1-5, 1-8</td>
      <td>Warm triad color. Distinguish major 3rd vs 5th.</td>
    </tr>
    <tr>
      <td><strong>P1-47</strong></td>
      <td>Harmonic 6: Minor Thirds</td>
      <td>20</td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>1-b3, 1-3, 1-5</td>
      <td>Dark sadness of minor 3rd vs sweet major 3rd.</td>
    </tr>
    <tr>
      <td><strong>P1-48</strong></td>
      <td>Harmonic 7: Major & Minor Thirds</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-b3, 1-3</td>
      <td>Direct A/B discrimination of third quality.</td>
    </tr>
    <tr>
      <td><strong>P1-49</strong></td>
      <td>Harmonic 8: Major Sixths</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-5, 1-6, 1-8</td>
      <td>Lyrical sweetness of 6th against 5th and 8ve.</td>
    </tr>
    <tr>
      <td><strong>P1-50</strong></td>
      <td>Harmonic 9: Minor Sixths</td>
      <td>20</td>
      <td>1 octave</td>
      <td>i-iv-V-i</td>
      <td>1-5, 1-b6, 1-6</td>
      <td>Tragic yearning of minor 6th against 5th.</td>
    </tr>
    <tr>
      <td><strong>P1-51</strong></td>
      <td>Harmonic 10: Sweet Consonances</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-3, 1-b3, 1-6, 1-b6</td>
      <td>Mixed 3rds and 6ths identification.</td>
    </tr>
    <tr>
      <td><strong>P1-52</strong></td>
      <td>Harmonic 11: All Consonances Pool</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-1, 1-3, 1-4, 1-5, 1-6, 1-8</td>
      <td>Consolidating all consonant dyads.</td>
    </tr>
    <tr>
      <td><strong>P1-53</strong></td>
      <td>Harmonic 12: Major Seconds</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-2, 1-3</td>
      <td>Whole-step acoustic rubbing vs consonant 3rd.</td>
    </tr>
    <tr>
      <td><strong>P1-54</strong></td>
      <td>Harmonic 13: Minor Sevenths</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-b7, 1-8</td>
      <td>Bluesy minor 7th pull vs pure octave.</td>
    </tr>
    <tr>
      <td><strong>P1-55</strong></td>
      <td>Harmonic 14: Major Sevenths</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-7, 1-8</td>
      <td>Sharp piercing half-step friction under octave.</td>
    </tr>
    <tr>
      <td><strong>P1-56</strong></td>
      <td>Harmonic 15: Minor Seconds</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-b2, 1-2</td>
      <td>Harsh rapid acoustic beating of minor second.</td>
    </tr>
    <tr>
      <td><strong>P1-57</strong></td>
      <td>Harmonic 16: The Tritone</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-#4, 1-4, 1-5</td>
      <td>Extreme instability. Distinguish tritone vs 4th/5th.</td>
    </tr>
    <tr>
      <td><strong>P1-58</strong></td>
      <td>Harmonic 17: All Dissonances Pool</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>1-b2, 1-2, 1-#4, 1-b7, 1-7</td>
      <td>Rapid classification of dissonant intervals.</td>
    </tr>
    <tr>
      <td><strong>P1-59</strong></td>
      <td>Harmonic 18: Full Diatonic Dyads</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 7 diatonic intervals</td>
      <td>Any diatonic note paired over root.</td>
    </tr>
    <tr>
      <td><strong>P1-60</strong></td>
      <td>Harmonic 19: Full Chromatic Dyads</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All 12 chromatic intervals</td>
      <td>All chromatic interval dyads in C.</td>
    </tr>
    <tr>
      <td><strong>P1-61</strong></td>
      <td>Harmonic 20: Inverted Dyads (Pedal 5)</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>Dyads over fifth (5-1, 5-3, 5-7)</td>
      <td>Non-root bass note harmonic dyads.</td>
    </tr>
    <tr>
      <td><strong>P1-62</strong></td>
      <td>Harmonic 21: Inverted Dyads (Pedal 3)</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>Dyads over third (3-1, 3-5, 3-8)</td>
      <td>First-inversion harmonic color.</td>
    </tr>
    <tr>
      <td><strong>P1-63</strong></td>
      <td>Harmonic 22: Compound Tenths</td>
      <td>20</td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>1-10 (Octave + 3rd)</td>
      <td>Wide voicing open thirds.</td>
    </tr>
    <tr>
      <td><strong>P1-64</strong></td>
      <td>Harmonic 23: Compound Twelfths</td>
      <td>20</td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>1-12 (Octave + 5th)</td>
      <td>Deep resonant acoustic harp spread.</td>
    </tr>
    <tr>
      <td><strong>P1-65</strong></td>
      <td>Harmonic 24: Multi-Octave Dyads</td>
      <td>20</td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All intervals wide spread</td>
      <td>Dyads across 2 to 3 octaves.</td>
    </tr>
    <tr>
      <td><strong>P1-66</strong></td>
      <td>Harmonic 25: Not-C Dyads</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All intervals</td>
      <td>Locked random key transposed dyads.</td>
    </tr>
    <tr>
      <td><strong>P1-67</strong></td>
      <td>Harmonic 26: Random Key Dyads</td>
      <td>20</td>
      <td>1 octave</td>
      <td>I-IV-V-I</td>
      <td>All intervals</td>
      <td>Key changes every question.</td>
    </tr>
    <tr>
      <td><strong>P1-68</strong></td>
      <td>Harmonic 27: Master Grand Dyad Final</td>
      <td><span class="badge badge-orange">50</span></td>
      <td>Many octaves</td>
      <td>I-IV-V-I</td>
      <td>All 12 intervals multi-octave</td>
      <td>50-question ultimate harmonic ear certification.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h2>3. PATH 2: Melodic Sequence & Dictation Track (Exact 68 Levels)</h2>
<p>Path 2 teaches the user to hear and transcribe sequences of notes played one after another. In accordance with user directives, overly punitive 160/180 BPM speeds have been removed, creating a smooth, musical progression from 2-note short motifs up to complex 4-note melodic dictations.</p>

<h3>Module S0: Introduction to Sequences (Levels S01 to S08)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 22%;">Level Title</th>
      <th style="width: 8%;">Quest.</th>
      <th style="width: 14%;">Motif Length</th>
      <th style="width: 12%;">Tempo</th>
      <th style="width: 18%;">Active Degrees</th>
      <th>Pedagogical Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P2-01</strong></td>
      <td>Seq Intro 1: Two-Note Step</td>
      <td>10</td>
      <td>2 notes</td>
      <td>60 bpm</td>
      <td>1, 2 (Do, Re)</td>
      <td>Simple 2-note motif: Do-Re, Re-Do, etc.</td>
    </tr>
    <tr>
      <td><strong>P2-02</strong></td>
      <td>Seq Intro 2: Two-Note Third</td>
      <td>10</td>
      <td>2 notes</td>
      <td>60 bpm</td>
      <td>1, 3 (Do, Mi)</td>
      <td>2-note motif leaping to 3rd.</td>
    </tr>
    <tr>
      <td><strong>P2-03</strong></td>
      <td>Seq Intro 3: Two-Note Fifth</td>
      <td>10</td>
      <td>2 notes</td>
      <td>60 bpm</td>
      <td>1, 5 (Do, Sol)</td>
      <td>2-note motif leaping to 5th.</td>
    </tr>
    <tr>
      <td><strong>P2-04</strong></td>
      <td>Seq Intro 4: Three-Note Triad</td>
      <td>10</td>
      <td>3 notes</td>
      <td>60 bpm</td>
      <td>1, 3, 5 (Do-Mi-Sol)</td>
      <td>3-note arpeggios within the tonic triad.</td>
    </tr>
    <tr>
      <td><strong>P2-05</strong></td>
      <td>Seq Intro 5: Three-Note Steps</td>
      <td>10</td>
      <td>3 notes</td>
      <td>60 bpm</td>
      <td>1, 2, 3 (Do-Re-Mi)</td>
      <td>3-note stepwise scalic motions.</td>
    </tr>
    <tr>
      <td><strong>P2-06</strong></td>
      <td>Seq Intro 6: Four-Note Lower</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>1, 2, 3, 4 (Do-Fa)</td>
      <td>4-note scalic runs in lower tetrachord.</td>
    </tr>
    <tr>
      <td><strong>P2-07</strong></td>
      <td>Seq Intro 7: Four-Note Upper</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>5, 6, 7, 8 (Sol-Do)</td>
      <td>4-note scalic runs in upper tetrachord.</td>
    </tr>
    <tr>
      <td><strong>P2-08</strong></td>
      <td>Seq Intro 8: Four-Note Triad Fill</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>1, 3, 5, 8 (Do-Mi-Sol-Do)</td>
      <td>Tonic triad and octave arpeggio dictations.</td>
    </tr>
  </tbody>
</table>

<h3>Module S1: Major Scale Sequences (Levels S09 to S23 - 15 Levels)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 22%;">Level Title</th>
      <th style="width: 8%;">Quest.</th>
      <th style="width: 14%;">Motif Length</th>
      <th style="width: 12%;">Tempo</th>
      <th style="width: 18%;">Active Degrees</th>
      <th>Key Mode & Octaves</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P2-09</strong></td>
      <td>Major Seq 1: Pentachord Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>1, 2, 3, 4, 5</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-10</strong></td>
      <td>Major Seq 2: Pentachord Medium</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>1, 2, 3, 4, 5</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-11</strong></td>
      <td>Major Seq 3: Pentachord Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>1, 2, 3, 4, 5</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-12</strong></td>
      <td>Major Seq 4: Full Octave Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 diatonic</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-13</strong></td>
      <td>Major Seq 5: Full Octave Medium</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 8 diatonic</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-14</strong></td>
      <td>Major Seq 6: Full Octave Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 diatonic</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-15</strong></td>
      <td>Major Seq 7: Full Octave Allegro</td>
      <td>10</td>
      <td>4 notes</td>
      <td>100 bpm</td>
      <td>All 8 diatonic</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-16</strong></td>
      <td>Major Seq 8: Multi-Octave Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 diatonic</td>
      <td>C Major, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-17</strong></td>
      <td>Major Seq 9: Multi-Octave Medium</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 8 diatonic</td>
      <td>C Major, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-18</strong></td>
      <td>Major Seq 10: Multi-Octave Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 diatonic</td>
      <td>C Major, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-19</strong></td>
      <td>Major Seq 11: Not-C Major Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 diatonic</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-20</strong></td>
      <td>Major Seq 12: Not-C Major Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 diatonic</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-21</strong></td>
      <td>Major Seq 13: Random Major Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 diatonic</td>
      <td>Key changes every question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-22</strong></td>
      <td>Major Seq 14: Random Major Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 diatonic</td>
      <td>Key changes every question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-23</strong></td>
      <td>Major Seq 15: Major Dictation Exam</td>
      <td><span class="badge badge-orange">25</span></td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 diatonic</td>
      <td>Random key, many octaves exam</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h3>Module S2: Chromatics in Major Context Sequences (Levels S24 to S38 - 15 Levels)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 22%;">Level Title</th>
      <th style="width: 8%;">Quest.</th>
      <th style="width: 14%;">Motif Length</th>
      <th style="width: 12%;">Tempo</th>
      <th style="width: 18%;">Active Degrees</th>
      <th>Key Mode & Registers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P2-24</strong></td>
      <td>Maj Chrom Seq 1: Lower Semitones</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>1, b2, 2, b3, 3, 4</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-25</strong></td>
      <td>Maj Chrom Seq 2: Upper Semitones</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>#4, 5, b6, 6, b7, 7, 8</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-26</strong></td>
      <td>Maj Chrom Seq 3: Lower Semitones 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>1, b2, 2, b3, 3, 4</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-27</strong></td>
      <td>Maj Chrom Seq 4: Upper Semitones 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>#4, 5, b6, 6, b7, 7, 8</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-28</strong></td>
      <td>Maj Chrom Seq 5: Full 12 Chromatic</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-29</strong></td>
      <td>Maj Chrom Seq 6: Full 12 Chromatic 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-30</strong></td>
      <td>Maj Chrom Seq 7: Full 12 Chromatic 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Major, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-31</strong></td>
      <td>Maj Chrom Seq 8: Multi-Octave 60</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Major, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-32</strong></td>
      <td>Maj Chrom Seq 9: Multi-Octave 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Major, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-33</strong></td>
      <td>Maj Chrom Seq 10: Multi-Octave 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Major, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-34</strong></td>
      <td>Maj Chrom Seq 11: Not-C Chromatic 60</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-35</strong></td>
      <td>Maj Chrom Seq 12: Not-C Chromatic 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-36</strong></td>
      <td>Maj Chrom Seq 13: Random Chromatic 60</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>Random key per question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-37</strong></td>
      <td>Maj Chrom Seq 14: Random Chromatic 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>Random key per question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-38</strong></td>
      <td>Maj Chrom Seq 15: Chromatic Master Exam</td>
      <td><span class="badge badge-orange">25</span></td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>Random key, many octaves exam</td>
    </tr>
  </tbody>
</table>

<h3>Module S3: Minor Scale Sequences (Levels S39 to S53 - 15 Levels)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 22%;">Level Title</th>
      <th style="width: 8%;">Quest.</th>
      <th style="width: 14%;">Motif Length</th>
      <th style="width: 12%;">Tempo</th>
      <th style="width: 18%;">Active Degrees</th>
      <th>Key Mode & Registers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P2-39</strong></td>
      <td>Minor Seq 1: Pentachord Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>1, 2, b3, 4, 5</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-40</strong></td>
      <td>Minor Seq 2: Pentachord Medium</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>1, 2, b3, 4, 5</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-41</strong></td>
      <td>Minor Seq 3: Pentachord Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>1, 2, b3, 4, 5</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-42</strong></td>
      <td>Minor Seq 4: Full Octave Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 natural minor</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-43</strong></td>
      <td>Minor Seq 5: Full Octave Medium</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 8 natural minor</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-44</strong></td>
      <td>Minor Seq 6: Full Octave Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 natural minor</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-45</strong></td>
      <td>Minor Seq 7: Full Octave Allegro</td>
      <td>10</td>
      <td>4 notes</td>
      <td>100 bpm</td>
      <td>All 8 natural minor</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-46</strong></td>
      <td>Minor Seq 8: Multi-Octave Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 natural minor</td>
      <td>C Minor, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-47</strong></td>
      <td>Minor Seq 9: Multi-Octave Medium</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 8 natural minor</td>
      <td>C Minor, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-48</strong></td>
      <td>Minor Seq 10: Multi-Octave Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 natural minor</td>
      <td>C Minor, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-49</strong></td>
      <td>Minor Seq 11: Not-C Minor Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 natural minor</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-50</strong></td>
      <td>Minor Seq 12: Not-C Minor Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 natural minor</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-51</strong></td>
      <td>Minor Seq 13: Random Minor Slow</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 8 natural minor</td>
      <td>Key changes every question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-52</strong></td>
      <td>Minor Seq 14: Random Minor Fast</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 natural minor</td>
      <td>Key changes every question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-53</strong></td>
      <td>Minor Seq 15: Minor Dictation Exam</td>
      <td><span class="badge badge-orange">25</span></td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 8 natural minor</td>
      <td>Random key, many octaves exam</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h3>Module S4: Chromatics in Minor Context Sequences (Levels S54 to S68 - 15 Levels)</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">ID</th>
      <th style="width: 22%;">Level Title</th>
      <th style="width: 8%;">Quest.</th>
      <th style="width: 14%;">Motif Length</th>
      <th style="width: 12%;">Tempo</th>
      <th style="width: 18%;">Active Degrees</th>
      <th>Key Mode & Registers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P2-54</strong></td>
      <td>Min Chrom Seq 1: Lower Semitones</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>1, b2, 2, b3, 3, 4</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-55</strong></td>
      <td>Min Chrom Seq 2: Upper Semitones</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>#4, 5, b6, 6, b7, 7, 8</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-56</strong></td>
      <td>Min Chrom Seq 3: Lower Semitones 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>1, b2, 2, b3, 3, 4</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-57</strong></td>
      <td>Min Chrom Seq 4: Upper Semitones 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>#4, 5, b6, 6, b7, 7, 8</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-58</strong></td>
      <td>Min Chrom Seq 5: Full 12 Chromatic</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-59</strong></td>
      <td>Min Chrom Seq 6: Full 12 Chromatic 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-60</strong></td>
      <td>Min Chrom Seq 7: Full 12 Chromatic 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Minor, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-61</strong></td>
      <td>Min Chrom Seq 8: Multi-Octave 60</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Minor, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-62</strong></td>
      <td>Min Chrom Seq 9: Multi-Octave 70</td>
      <td>10</td>
      <td>4 notes</td>
      <td>70 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Minor, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-63</strong></td>
      <td>Min Chrom Seq 10: Multi-Octave 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>C Minor, many octaves</td>
    </tr>
    <tr>
      <td><strong>P2-64</strong></td>
      <td>Min Chrom Seq 11: Not-C Chromatic 60</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-65</strong></td>
      <td>Min Chrom Seq 12: Not-C Chromatic 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>Locked random key, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-66</strong></td>
      <td>Min Chrom Seq 13: Random Chromatic 60</td>
      <td>10</td>
      <td>4 notes</td>
      <td>60 bpm</td>
      <td>All 12 chromatic</td>
      <td>Random key per question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-67</strong></td>
      <td>Min Chrom Seq 14: Random Chromatic 80</td>
      <td>10</td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>Random key per question, 1 octave</td>
    </tr>
    <tr>
      <td><strong>P2-68</strong></td>
      <td>Min Chrom Seq 15: Grand Master Dictation</td>
      <td><span class="badge badge-orange">25</span></td>
      <td>4 notes</td>
      <td>80 bpm</td>
      <td>All 12 chromatic</td>
      <td>Grand master melodic dictation certification</td>
    </tr>
  </tbody>
</table>

<div class="callout">
  <div class="callout-title">COMPLETE ROADMAP BALANCE CONFIRMATION</div>
  • <strong>Path 1 (Single Note & Harmonic Dyads):</strong> 9 (Intro) + 8 (Major) + 8 (Major Chromatic) + 8 (Minor) + 8 (Minor Chromatic) + 27 (Harmonic Dyads) = <strong>68 Levels</strong>.<br>
  • <strong>Path 2 (Melodic Sequences & Dictations):</strong> 8 (Intro) + 15 (Major) + 15 (Major Chromatic) + 15 (Minor) + 15 (Minor Chromatic) = <strong>68 Levels</strong>.<br>
  The two paths achieve 100% structural parity, enabling identical UI progression, stage unlock pacing, and visual roadmap nodes across the entire mobile application.
</div>

</body>
</html>
"""

with open(TEMP_HTML, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Full curriculum HTML written to {TEMP_HTML}")

# Compile into PDF
cmd = f'"{EDGE_EXE}" --headless --no-pdf-header-footer --print-to-pdf="{OUTPUT_PDF}" "file:///{TEMP_HTML.replace(os.sep, "/")}"'
print("Compiling PDF...")
res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print("Return code:", res.returncode)

if os.path.exists(OUTPUT_PDF):
    size = os.path.getsize(OUTPUT_PDF)
    print(f"SUCCESS: Compiled master curriculum PDF at {OUTPUT_PDF} ({size} bytes)")
else:
    print("FAILED to compile PDF.")
