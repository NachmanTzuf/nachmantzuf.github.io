/**
 * EARPA 3D CELTIC HARP PROCEDURAL MODEL
 * High-performance 3D Celtic lever harp with PBR materials, instanced brass levers,
 * physical string wave deformation, and color-coded strings (Red C, Blue F).
 */

import * as THREE from 'three';
import { HarpString3DData } from './types';
import { NoteLetter, PhysicalHarpLevers } from '../../services/theory/types';

export class CelticHarpModel {
  public readonly rootGroup: THREE.Group;
  public readonly stringsGroup: THREE.Group;
  public readonly leversGroup: THREE.Group;
  public readonly stringDataList: HarpString3DData[] = [];

  // Meshes & Materials
  private stringMeshes: THREE.Line[] = [];
  private leverMeshes: THREE.Mesh[] = [];
  private woodMaterial: THREE.MeshStandardMaterial;
  private soundboardMaterial: THREE.MeshStandardMaterial;
  private brassMaterial: THREE.MeshStandardMaterial;

  // Active plucks tracking
  private activePlucks: Map<number, { startTime: number; amplitude: number; frequency: number }> = new Map();

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'CelticHarp';

    this.stringsGroup = new THREE.Group();
    this.stringsGroup.name = 'HarpStrings';

    this.leversGroup = new THREE.Group();
    this.leversGroup.name = 'HarpLevers';

    // 1. High-fidelity PBR Materials (Sitka spruce soundboard, curly maple body, brushed brass levers)
    this.woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2c11, // Deep warm walnut / maple
      roughness: 0.35,
      metalness: 0.05,
    });

    this.soundboardMaterial = new THREE.MeshStandardMaterial({
      color: 0xdec19b, // Sitka spruce natural light wood grain
      roughness: 0.45,
      metalness: 0.02,
    });

    this.brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished Celtic brass
      roughness: 0.22,
      metalness: 0.88,
    });

    this.buildHarpFrame();
    this.build34Strings();
    this.build34Levers();

    this.rootGroup.add(this.stringsGroup);
    this.rootGroup.add(this.leversGroup);
  }

  /**
   * Constructs the architectural body: Soundbox, Curved Harmonic Neck, and Celtic Forepillar.
   */
  private buildHarpFrame(): void {
    // 1. Soundbox (Resonance body) - expanding trapezoidal hollow chamber
    const soundboxGeo = new THREE.CylinderGeometry(0.08, 0.24, 1.25, 16);
    soundboxGeo.scale(1.0, 1.0, 0.45); // Flatten depth
    const soundbox = new THREE.Mesh(soundboxGeo, this.woodMaterial);
    soundbox.position.set(0.18, 0.65, -0.05);
    soundbox.rotation.z = -0.18;
    this.rootGroup.add(soundbox);

    // 2. Soundboard Face (Spruce acoustic front)
    const soundboardGeo = new THREE.PlaneGeometry(0.19, 1.22);
    const soundboard = new THREE.Mesh(soundboardGeo, this.soundboardMaterial);
    soundboard.position.set(0.17, 0.65, 0.05);
    soundboard.rotation.z = -0.18;
    this.rootGroup.add(soundboard);

    // 3. Harmonic Neck (Gracefully arched upper beam carrying tuning pins and levers)
    const neckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.32, 1.28, 0.0),
      new THREE.Vector3(0.08, 1.34, 0.0),
      new THREE.Vector3(-0.16, 1.31, 0.0),
      new THREE.Vector3(-0.38, 1.20, 0.0),
    ]);
    const neckGeo = new THREE.TubeGeometry(neckCurve, 24, 0.042, 12, false);
    const neck = new THREE.Mesh(neckGeo, this.woodMaterial);
    this.rootGroup.add(neck);

    // 4. Celtic Forepillar (Curved front structural column with Celtic arch curvature)
    const pillarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.38, 1.20, 0.0),
      new THREE.Vector3(-0.44, 0.65, 0.0),
      new THREE.Vector3(-0.36, 0.22, 0.0),
      new THREE.Vector3(0.02, 0.05, 0.0),
    ]);
    const pillarGeo = new THREE.TubeGeometry(pillarCurve, 32, 0.045, 12, false);
    const pillar = new THREE.Mesh(pillarGeo, this.woodMaterial);
    this.rootGroup.add(pillar);

    // 5. Harp Base / Feet
    const baseGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.08, 16);
    const base = new THREE.Mesh(baseGeo, this.woodMaterial);
    base.position.set(0.08, 0.04, 0.0);
    this.rootGroup.add(base);
  }

  /**
   * Constructs all 34 strings (C2 to A6) with authentic Celtic color coding:
   * Red = C, Dark Blue = F, Translucent Amber = Naturals.
   */
  private build34Strings(): void {
    const letters: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    let currentOctave = 2;
    let letterIndex = 0; // Starts at C2

    const totalStrings = 34;

    for (let i = 0; i < totalStrings; i++) {
      const letter = letters[letterIndex];
      const isRedC = letter === 'C';
      const isBlueF = letter === 'F';
      const noteName = `${letter}${currentOctave}`;

      // String interpolation factor along soundboard and neck (0 = bass, 1 = treble)
      const t = i / (totalStrings - 1);

      // Soundboard anchor position (lower point)
      const sbX = 0.06 + t * 0.22;
      const sbY = 0.12 + t * 1.08;
      const sbZ = 0.052;

      // Neck pin anchor position (upper point)
      const neckX = -0.32 + t * 0.62;
      const neckY = 1.22 + Math.sin(t * Math.PI) * 0.11;
      const neckZ = 0.0;

      // String length and base frequency
      const lengthMm = Math.sqrt(
        Math.pow((neckX - sbX) * 1000, 2) + Math.pow((neckY - sbY) * 1000, 2)
      );
      const midiNumber = 36 + i; // C2 = 36
      const baseFrequencyHz = 440 * Math.pow(2, (midiNumber - 69) / 12);

      const stringData: HarpString3DData = {
        stringIndex: i,
        noteName,
        letter,
        octave: currentOctave,
        isRedC,
        isBlueF,
        baseFrequencyHz,
        lengthMm,
        soundboardAnchor: [sbX, sbY, sbZ],
        neckPinAnchor: [neckX, neckY, neckZ],
        leverPosition: 0,
        vibrationTime: 0,
        vibrationAmplitude: 0,
        isTargetedByLightStrike: false,
      };

      this.stringDataList.push(stringData);

      // Color selection
      let stringColor = 0xf4a261; // Warm amber gut/nylon
      if (isRedC) stringColor = 0xe63946; // Distinct Celtic Ruby Red for C
      if (isBlueF) stringColor = 0x1d3557; // Celtic Royal Blue for F

      // Build 1D line geometry with 16 subdivided segments for physical wave displacement
      const points: THREE.Vector3[] = [];
      const numSegments = 16;
      for (let s = 0; s <= numSegments; s++) {
        const st = s / numSegments;
        const px = sbX + (neckX - sbX) * st;
        const py = sbY + (neckY - sbY) * st;
        const pz = sbZ + (neckZ - sbZ) * st;
        points.push(new THREE.Vector3(px, py, pz));
      }

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: stringColor,
        linewidth: isRedC || isBlueF ? 2.2 : 1.4,
      });

      const lineMesh = new THREE.Line(lineGeo, lineMat);
      lineMesh.userData = { stringIndex: i, noteName };
      this.stringsGroup.add(lineMesh);
      this.stringMeshes.push(lineMesh);

      // Advance to next note
      letterIndex++;
      if (letterIndex >= 7) {
        letterIndex = 0;
        currentOctave++;
      }
    }
  }

  /**
   * Constructs 34 brass sharping levers mounted beneath the neck pins.
   */
  private build34Levers(): void {
    const leverBodyGeo = new THREE.BoxGeometry(0.012, 0.024, 0.008);
    const leverHandleGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.028, 8);
    leverHandleGeo.translate(0, 0.014, 0);

    for (let i = 0; i < this.stringDataList.length; i++) {
      const str = this.stringDataList[i];
      const neckPin = str.neckPinAnchor;

      const leverPivot = new THREE.Group();
      // Mounted ~20mm below the neck pin
      leverPivot.position.set(neckPin[0], neckPin[1] - 0.022, neckPin[2] + 0.012);

      const body = new THREE.Mesh(leverBodyGeo, this.brassMaterial);
      const handle = new THREE.Mesh(leverHandleGeo, this.brassMaterial);
      handle.rotation.z = 0.2;

      leverPivot.add(body);
      leverPivot.add(handle);

      this.leversGroup.add(leverPivot);
      this.leverMeshes.push(body);
    }
  }

  /**
   * Trigger physical string vibration on pluck.
   */
  public triggerPluck(stringIndex: number, amplitude: number = 0.025): void {
    if (stringIndex < 0 || stringIndex >= this.stringDataList.length) return;
    const str = this.stringDataList[stringIndex];
    this.activePlucks.set(stringIndex, {
      startTime: performance.now(),
      amplitude,
      frequency: str.baseFrequencyHz,
    });
  }

  /**
   * Set physical lever states across the harp.
   */
  public applyLeverProfile(levers: PhysicalHarpLevers): void {
    this.stringDataList.forEach((str, idx) => {
      const letter = str.letter;
      const targetPos = levers[letter];
      str.leverPosition = targetPos;

      const leverMeshGroup = this.leversGroup.children[idx] as THREE.Group;
      if (leverMeshGroup) {
        // Rotate lever: 0 rad (down) to ~1.05 rad (up ~60 degrees)
        leverMeshGroup.rotation.z = targetPos === 1 ? -0.85 : 0.0;
      }
    });
  }

  /**
   * Update string standing wave equations every frame (120Hz ProMotion loop).
   */
  public updatePhysics(): void {
    const now = performance.now();

    this.activePlucks.forEach((pluck, stringIndex) => {
      const elapsedSec = (now - pluck.startTime) / 1000;
      if (elapsedSec > 2.8) {
        // Pluck finished
        this.activePlucks.delete(stringIndex);
        this.resetStringGeometry(stringIndex);
        return;
      }

      const str = this.stringDataList[stringIndex];
      const lineMesh = this.stringMeshes[stringIndex];
      const positions = lineMesh.geometry.attributes.position as THREE.BufferAttribute;

      const [sbX, sbY, sbZ] = str.soundboardAnchor;
      const [neckX, neckY, neckZ] = str.neckPinAnchor;

      // Standing wave equation: y(x, t) = A * sin(pi * x / L) * cos(omega * t) * exp(-gamma * t)
      const omega = 2 * Math.PI * (pluck.frequency % 120 + 30); // Visual scaled frequency
      const decay = Math.exp(-2.2 * elapsedSec);
      const currentAmp = pluck.amplitude * decay;

      const numPoints = positions.count;
      for (let p = 0; p < numPoints; p++) {
        const st = p / (numPoints - 1);
        const standingWave = Math.sin(st * Math.PI) * currentAmp * Math.cos(omega * elapsedSec);

        const baseX = sbX + (neckX - sbX) * st;
        const baseY = sbY + (neckY - sbY) * st;
        const baseZ = sbZ + (neckZ - sbZ) * st;

        // Displace perpendicular to string plane (z-axis displacement)
        positions.setXYZ(p, baseX, baseY, baseZ + standingWave);
      }

      positions.needsUpdate = true;
    });
  }

  private resetStringGeometry(stringIndex: number): void {
    const str = this.stringDataList[stringIndex];
    const lineMesh = this.stringMeshes[stringIndex];
    const positions = lineMesh.geometry.attributes.position as THREE.BufferAttribute;

    const [sbX, sbY, sbZ] = str.soundboardAnchor;
    const [neckX, neckY, neckZ] = str.neckPinAnchor;

    const numPoints = positions.count;
    for (let p = 0; p < numPoints; p++) {
      const st = p / (numPoints - 1);
      positions.setXYZ(
        p,
        sbX + (neckX - sbX) * st,
        sbY + (neckY - sbY) * st,
        sbZ + (neckZ - sbZ) * st
      );
    }
    positions.needsUpdate = true;
  }
}
