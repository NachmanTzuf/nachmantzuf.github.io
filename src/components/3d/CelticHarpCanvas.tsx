/**
 * EARPA PHOTOREALISTIC 8-STRING 3D CELTIC HARP VIEWER & PHYSICS ENGINE
 * Loads the Blender 5.2 engineered 8-string Celtic lever harp GLB
 * (`/models/celtic_harp_8string.glb`) with embedded honey-cherry & Sitka spruce
 * wood grain textures, gunmetal tuning pins, silver bridge pins, and Camac
 * teardrop sharping levers with Red (C) and Blue (F) indicator bands.
 *
 * Features:
 *  - Full 360-degree interactive drag orbit, tilt, and zoom + camera angle presets
 *    (matching Video 1 full side view, Video 2 levers close-up, Video 3 pluck view,
 *    and rear soundholes view).
 *  - Authentic standing-wave string vibration physics (Video 3) with fixed endpoints
 *    at the bridge pin and soundboard eyelet, sinusoidal belly displacement, and
 *    optical persistence-of-vision vibration envelope.
 *  - Real-time 3D Camac lever rotation (UP / DOWN / Alternated) around each lever's
 *    hinge axle.
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DiatonicMode, PitchClass } from '../../services/theory/types';
import { ModalShiftEngine } from '../../services/theory/ModalShiftEngine';
import { UserAccountDatabase } from '../../services/account/UserAccountDatabase';

export type CameraPreset =
  | 'sanctuary_wide'
  | 'playing_focus'
  | 'lever_inspection'
  | 'bottom_cradle'
  | 'pluck_closeup'
  | 'rear_soundholes';

export interface CelticHarpCanvasRef {
  triggerLightStrike: (stringIndex: number) => void;
  triggerCadencePulse: () => void;
  applyMode: (rootPc: PitchClass, mode: DiatonicMode) => void;
  setLeverState: (stringNumber: number, isUp: boolean) => void;
  setAllLevers: (states: boolean[]) => void;
  transitionCamera: (preset: CameraPreset) => void;
}

interface CelticHarpCanvasProps {
  style?: any;
  onStringPlucked?: (degreeNumber: number) => void;
  onLeverToggled?: (degreeNumber: number, isUp: boolean) => void;
  initialLeverStates?: boolean[];
  interactiveControls?: boolean;
  minimalHeroMode?: boolean;
  autoSpin?: boolean;
  fixedInGameAngle?: boolean;
  customScale?: number;
  customAngle?: number;
  targetY?: number;
}

// Physical Smartphone Haptic Feedback
const triggerHaptic = (type: 'pluck' | 'lever' = 'pluck') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      if (!UserAccountDatabase.getInstance().isHapticsEnabled()) return;
      if (type === 'pluck') {
        navigator.vibrate(22); // 22ms crisp physical acoustic string pluck impulse
      } else if (type === 'lever') {
        navigator.vibrate(10); // 10ms mechanical toggle click
      }
    } catch {}
  }
};

interface StringPhysicsState {
  mesh: THREE.Mesh;
  basePositions: Float32Array;
  minY: number;
  maxY: number;
  dirVec: THREE.Vector3;
  pluckDirA: THREE.Vector3;
  pluckDirB: THREE.Vector3;
  amplitude: number;
  phase: number;
  frequencyHz: number;
  glowColor: THREE.Color;
  botPt: THREE.Vector3;
  topPt: THREE.Vector3;
  ghostLineA?: THREE.Line;
  ghostLineB?: THREE.Line;
}

export const CelticHarpCanvas = forwardRef<CelticHarpCanvasRef, CelticHarpCanvasProps>(
  (
    {
      style,
      onStringPlucked,
      onLeverToggled,
      initialLeverStates,
      interactiveControls = true,
      minimalHeroMode = false,
      autoSpin = false,
      fixedInGameAngle = false,
      customScale,
      customAngle,
      targetY,
    },
    ref
  ) => {
    const initialLeversRef = useRef(initialLeverStates);
    initialLeversRef.current = initialLeverStates;
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [activePreset, setActivePreset] = useState<CameraPreset>('sanctuary_wide');
    const [autoOrbit, setAutoOrbit] = useState<boolean>(fixedInGameAngle ? false : (autoSpin || minimalHeroMode));
    const [leverStates, setLeverStates] = useState<boolean[]>(
      initialLeverStates || [false, false, false, false, false, false, false, false]
    );

    // Fixed camera alignment in Y-Z plane (x = 0) looking straight at harp centroid
    // phi: 1.325 matches the exact 14.10-degree perspective tilt of the Irish stone pedestal
    // theta: 1.10 displays the classical 3/4 beauty view with strings, levers & pillar (matching viewer.html)
    // In in-game mode, theta defaults to -0.95 rad (~-54.4 deg) presenting forepillar towards viewer and soundbox back
    const inGameTheta = customAngle ?? -0.95;
    const initialTheta = fixedInGameAngle ? inGameTheta : 1.10;
    const initialTargetY = targetY ?? (fixedInGameAngle ? 0.60 : 0.385);
    const initialRadius = fixedInGameAngle ? 2.85 : 2.75;

    const orbitRef = useRef({
      theta: initialTheta,
      phi: 1.325,
      radius: initialRadius,
      target: new THREE.Vector3(0.0, initialTargetY, -0.015),
      desiredTheta: initialTheta,
      desiredPhi: 1.325,
      desiredRadius: initialRadius,
      desiredTarget: new THREE.Vector3(0.0, initialTargetY, -0.015),
      isDragging: false,
      lastX: 0,
      lastY: 0,
      autoOrbit: fixedInGameAngle ? false : (autoSpin || minimalHeroMode),
    });

    if (typeof window !== 'undefined') {
      (window as any).__earpa_orbit = orbitRef;
      (window as any).__earpa_setTheta = (th: number) => {
        if (orbitRef.current) {
          orbitRef.current.theta = th;
          orbitRef.current.desiredTheta = th;
          orbitRef.current.autoOrbit = false;
        }
      };
    }

    const harpRootRef = useRef<THREE.Group | null>(null);
    const stringsRef = useRef<Map<number, StringPhysicsState>>(new Map());
    const leversRef = useRef<Map<number, { obj: THREE.Object3D; baseQuat: THREE.Quaternion; targetAngle: number; currentAngle: number; isEngaged: boolean }>>(new Map());
    const leverHitObjectsRef = useRef<THREE.Object3D[]>([]);
    const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
    const pulseIntensityRef = useRef<number>(0);

    const setCameraPresetInternal = (preset: CameraPreset) => {
      setActivePreset(preset);
      const o = orbitRef.current;
      o.autoOrbit = false;
      setAutoOrbit(false);

      switch (preset) {
        case 'sanctuary_wide':
          // Frontal upright 3/4 beauty view directly centered over tilted 3D stone pedestal (14.10 deg tilt)
          o.desiredTheta = 1.10;
          o.desiredPhi = 1.325;
          o.desiredRadius = 2.75;
          o.desiredTarget.set(0.0, 0.385, -0.015);
          break;
        case 'lever_inspection':
          // Close-up on the 8 Levers, Treble C Clearance & Authentic Knee Dome
          o.desiredTheta = 1.28;
          o.desiredPhi = 1.50;
          o.desiredRadius = 0.78;
          o.desiredTarget.set(0.0, 1.05, 0.0);
          break;
        case 'bottom_cradle':
          // Close-up of Forepillar seated in Dark Walnut Central Rib Cradle + Sculpted Arched Legs
          o.desiredTheta = 0.85;
          o.desiredPhi = 1.42;
          o.desiredRadius = 0.72;
          o.desiredTarget.set(0.0, 0.16, 0.12);
          break;
        case 'pluck_closeup':
        case 'playing_focus':
          // Forepillar & Vibrating Strings View from Lever Side (+X)
          o.desiredTheta = 0.92;
          o.desiredPhi = 1.48;
          o.desiredRadius = 0.96;
          o.desiredTarget.set(0.0, 0.70, 0.0);
          break;
        case 'rear_soundholes':
          // Tuning Pins Side (-X) & Rear Soundbox View
          o.desiredTheta = -1.25;
          o.desiredPhi = 1.42;
          o.desiredRadius = 1.45;
          o.desiredTarget.set(0.0, 0.68, -0.08);
          break;
      }
    };

    const pluckString = (degreeNum: number, velocity: number = 1.0) => {
      // Clamp to 1..8
      const deg = ((Math.max(1, degreeNum) - 1) % 8) + 1;
      const st = stringsRef.current.get(deg);
      if (st) {
        st.amplitude = 0.009 * velocity; // Subtle realistic physical vibration
        st.phase = 0;
        const meshMat = st.mesh.material as THREE.MeshStandardMaterial;
        if (meshMat) {
          meshMat.emissive.copy(st.glowColor);
          meshMat.emissiveIntensity = 0.85; // Very thin, delicate, subtle stripe of light strictly on the string itself
        }
        triggerHaptic('pluck'); // Physical 22ms mobile vibration feedback
      }
    };

    useImperativeHandle(ref, () => ({
      triggerLightStrike: (stringIndex: number) => {
        // Map either 1..8 or 0..33 to 1..8
        const deg = stringIndex >= 1 && stringIndex <= 8 ? stringIndex : (stringIndex % 8) + 1;
        pluckString(deg, 1.0);
      },
      triggerCadencePulse: () => {
        pulseIntensityRef.current = 1.0;
        // Gently pluck tonic, mediant, dominant, octave strings (1, 3, 5, 8)
        [1, 3, 5, 8].forEach((deg, idx) => {
          setTimeout(() => pluckString(deg, 0.75), idx * 45);
        });
      },
      applyMode: (rootPc: PitchClass, mode: DiatonicMode) => {
        try {
          const def = ModalShiftEngine.getModalDefinition(rootPc, mode);
          const ls = def.levers;
          // Map C, D, E, F, G, A, B, C8 to the 8 levers
          const nextStates = [
            ls.C === 1,
            ls.D === 1,
            ls.E === 1,
            ls.F === 1,
            ls.G === 1,
            ls.A === 1,
            ls.B === 1,
            ls.C === 1,
          ];
          setLeverStates(nextStates);
          nextStates.forEach((isUp, idx) => {
            const lev = leversRef.current.get(idx + 1);
            if (lev) {
              lev.isEngaged = isUp;
          lev.targetAngle = isUp ? 1.75 : 0.0; // Flip handle UP (+1.75 rad along user blue line) or DOWN (0.0 rad resting natural)
            }
          });
        } catch {
          // Ignore fallback
        }
      },
      setLeverState: (stringNumber: number, isUp: boolean) => {
        setLeverStates((prev) => {
          const next = [...prev];
          if (stringNumber >= 1 && stringNumber <= 8) {
            next[stringNumber - 1] = isUp;
          }
          return next;
        });
        const lev = leversRef.current.get(stringNumber);
        if (lev) {
          lev.isEngaged = isUp;
          lev.targetAngle = isUp ? 1.75 : 0.0;
        }
      },
      setAllLevers: (states: boolean[]) => {
        const padded = states.slice(0, 8);
        setLeverStates(padded);
        padded.forEach((isUp, idx) => {
          const lev = leversRef.current.get(idx + 1);
          if (lev) {
            lev.isEngaged = isUp;
          lev.targetAngle = isUp ? 1.75 : 0.0;
          }
        });
      },
      transitionCamera: (preset: CameraPreset) => {
        setCameraPresetInternal(preset);
      },
    }));

    const onStringPluckedRef = useRef(onStringPlucked);
    onStringPluckedRef.current = onStringPlucked;

    const onLeverToggledRef = useRef(onLeverToggled);
    onLeverToggledRef.current = onLeverToggled;

    useEffect(() => {
      if (Platform.OS !== 'web' || !mountRef.current) return;

      const container = mountRef.current;
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 420;

      const scene = new THREE.Scene();
      if (!minimalHeroMode) {
        scene.background = new THREE.Color('#0f141d');
      }

      const camera = new THREE.PerspectiveCamera(36, width / height, 0.05, 25);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.10;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      if (minimalHeroMode) {
        renderer.setClearColor(0x000000, 0);
      }

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Studio Environment for lustrous metallic reflections on silver levers & hardware (matching viewer.html)
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

      // Warm Natural Ambient Lighting matching the Roman Temple Sanctuary
      const ambientLight = new THREE.HemisphereLight(0xffeed8, 0x423326, 0.95);
      scene.add(ambientLight);

      // Key light: Natural Sunlight Streaming Through the Arch in a Distinct 60-Degree Angle
      // Positioned at (1.8, 6.0, -3.0) deep in the scene, casting dramatic elongated shadows forward across the pedestal
      const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
      keyLight.position.set(1.8, 6.0, -3.0);
      keyLight.target.position.set(-0.015, 0.0, -0.015);
      scene.add(keyLight.target);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 1.0;
      keyLight.shadow.camera.far = 16.0;
      keyLight.shadow.camera.left = -2.5;
      keyLight.shadow.camera.right = 2.5;
      keyLight.shadow.camera.top = 3.5;
      keyLight.shadow.camera.bottom = -2.5;
      keyLight.shadow.bias = -0.0003;
      scene.add(keyLight);
      keyLightRef.current = keyLight;

      // Soft Warm Atmospheric Front-Left Fill Light so front details stay visible without washing out dynamic shadows
      const fillLight = new THREE.DirectionalLight(0xd4a574, 0.65);
      fillLight.position.set(-2.0, 1.6, 2.4);
      scene.add(fillLight);

      // Dedicated Specular Light for Camac Levers on +X side: ensures bright gleam on chrome handles
      const leverAccentLight = new THREE.DirectionalLight(0xffffff, 1.8);
      leverAccentLight.position.set(1.6, 1.3, 0.8);
      leverAccentLight.target.position.set(0.0, 1.05, 0.0);
      scene.add(leverAccentLight);
      scene.add(leverAccentLight.target);

      // Dynamic Contact Shadow Receiver Disc directly on the flat stone surface
      // Radius 2.2m captures full elongated harp silhouette from 60-degree sunlight and extends over the play button
      const stoneShadowGeo = new THREE.CircleGeometry(2.2, 64);
      stoneShadowGeo.rotateX(-Math.PI / 2);
      const stoneShadowMat = new THREE.ShadowMaterial({
        opacity: 0.58,
      });
      const stoneShadowMesh = new THREE.Mesh(stoneShadowGeo, stoneShadowMat);
      stoneShadowMesh.position.set(-0.015, 0.0005, -0.015); // Floating 0.5mm above ground centered beneath harp
      stoneShadowMesh.rotation.set(0, 0, 0); // Flat, zero tilt
      stoneShadowMesh.receiveShadow = true;
      scene.add(stoneShadowMesh);

      // Balanced Harp Turntable Pivot Group:
      // Rotates strictly around the harp's exact vertical foot stance center axis (X=0.0, Z=0.0755 in GLB)
      // Positioned dead center of cracked stone pedestal at Z = -0.015m
      // Perfectly centered inside the pedestal center circle, legs never touching the outer stone layer during 360 rotation
      const harpPivotGroup = new THREE.Group();
      harpPivotGroup.position.set(-0.015, 0.003, -0.015);
      scene.add(harpPivotGroup);
      harpRootRef.current = harpPivotGroup;

      // Load the Master Photorealistic 8-String Harp GLB (with cache buster v=25)
      const loader = new GLTFLoader();
      const freqs = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];

      loader.load(
        './models/celtic_harp_8string.glb?v=25',
        (gltf) => {
          const root = gltf.scene;
          const harpScale = customScale ?? (minimalHeroMode ? 0.78 : 0.88);
          const stanceOffsetZ = 0.0755; // Exact center of foot contact area on floor: ([-0.046, +0.197] / 2)
          root.scale.set(harpScale, harpScale, harpScale);
          // Mathematical center of rotation: shift root by -stanceOffsetZ * harpScale so foot stance center lands exactly on (0, 0)
          root.position.set(0.0, 0.0, -stanceOffsetZ * harpScale);
          root.rotation.set(0, 0, 0);
          harpPivotGroup.add(root);

          root.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.needsUpdate = true;
                if (child.name.startsWith('Lever_Base')) {
                  // High contrast dark gunmetal mounting bracket
                  child.material = child.material.clone();
                  child.material.metalness = 0.92;
                  child.material.roughness = 0.24;
                  child.material.color = new THREE.Color(0x333b47);
                } else if (child.name.startsWith('Lever_Handle')) {
                  // Mirror-polished brilliant silver chrome handle
                  child.material = child.material.clone();
                  child.material.metalness = 0.99;
                  child.material.roughness = 0.03;
                  child.material.color = new THREE.Color(0xffffff);
                } else if (child.name.startsWith('Lever_Roller')) {
                  // Polished chrome roller
                  child.material = child.material.clone();
                  child.material.metalness = 0.98;
                  child.material.roughness = 0.05;
                  child.material.color = new THREE.Color(0xf1f5f9);
                }
                if (child.name.startsWith('Lever_Band_1') || child.name.startsWith('Lever_Band_8')) {
                  child.material = child.material.clone();
                  child.material.color = new THREE.Color(0xef4444);
                  child.material.emissive = new THREE.Color(0xef4444);
                  child.material.emissiveIntensity = 0.25;
                  child.material.roughness = 0.35;
                  child.material.metalness = 0.02;
                }
                if (child.name.startsWith('Lever_Band_4')) {
                  child.material = child.material.clone();
                  child.material.color = new THREE.Color(0x2563eb);
                  child.material.emissive = new THREE.Color(0x2563eb);
                  child.material.emissiveIntensity = 0.25;
                  child.material.roughness = 0.35;
                  child.material.metalness = 0.02;
                }
                // Darker, richer figured maple wood tone (warm golden amber)
                if (child.name.startsWith('Harp_Harmonic_Frame') || child.name.startsWith('Harp_Forepillar') || child.name.startsWith('Harp_Leg') || child.name.startsWith('Harp_Soundbox')) {
                  child.material = child.material.clone();
                  child.material.color = new THREE.Color(0xd4a872);
                  child.material.roughness = 0.30;
                }
              }
            }

            // Capture Lever_Handle_1 .. Lever_Handle_8 for interactive 3D flipping
            for (let d = 1; d <= 8; d++) {
              if (child.name === `Lever_Handle_${d}`) {
                const isInitiallyUp = !!initialLeversRef.current?.[d - 1];
                const initialAngle = isInitiallyUp ? 1.75 : 0.0;
                const baseQuat = child.quaternion.clone();
                if (isInitiallyUp) {
                  const flipQuat = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(1, 0, 0),
                    initialAngle
                  );
                  child.quaternion.copy(baseQuat).multiply(flipQuat);
                }
                leversRef.current.set(d, {
                  obj: child,
                  baseQuat: baseQuat,
                  targetAngle: initialAngle,
                  currentAngle: initialAngle,
                  isEngaged: isInitiallyUp,
                });
              }

              // Capture String_1 .. String_8 for standing-wave vibration physics
              if (child.name === `String_${d}` && child.isMesh) {
                child.material = child.material.clone();
                child.material.emissive = new THREE.Color(0x000000);
                child.material.emissiveIntensity = 0.0;
                let glowColor = new THREE.Color(0xffaa44); // Rich warm golden amber radiance
                if (d === 1 || d === 8) glowColor = new THREE.Color(0xff3333); // Vivid red for C
                else if (d === 4) glowColor = new THREE.Color(0x38bdf8); // Vivid cyan sky-blue for F

                const geom = child.geometry as THREE.BufferGeometry;
                const posAttr = geom.attributes.position;
                const basePositions = new Float32Array(posAttr.array.length);
                basePositions.set(posAttr.array);

                let minY = Infinity;
                let maxY = -Infinity;
                const topPt = new THREE.Vector3();
                const botPt = new THREE.Vector3();

                for (let i = 0; i < posAttr.count; i++) {
                  const y = posAttr.getY(i);
                  if (y < minY) {
                    minY = y;
                    botPt.set(posAttr.getX(i), y, posAttr.getZ(i));
                  }
                  if (y > maxY) {
                    maxY = y;
                    topPt.set(posAttr.getX(i), y, posAttr.getZ(i));
                  }
                }

                const dirVec = topPt.clone().sub(botPt).normalize();
                const pluckDirA = new THREE.Vector3(0, 0, 1).cross(dirVec).normalize();
                const pluckDirB = dirVec.clone().cross(pluckDirA).normalize();

                // Create optical persistence-of-vision ghost lines (matching Video 3 blur!)
                const lineColor = d === 1 || d === 8 ? 0xff3b3b : d === 4 ? 0x3b82f6 : 0xfef3c7;
                const ghostPtsA = new Array(25).fill(0).map(() => new THREE.Vector3());
                const ghostPtsB = new Array(25).fill(0).map(() => new THREE.Vector3());
                const ghostGeoA = new THREE.BufferGeometry().setFromPoints(ghostPtsA);
                const ghostGeoB = new THREE.BufferGeometry().setFromPoints(ghostPtsB);
                const ghostMat = new THREE.LineBasicMaterial({
                  color: lineColor,
                  transparent: true,
                  opacity: 0.0,
                });
                const ghostLineA = new THREE.Line(ghostGeoA, ghostMat);
                const ghostLineB = new THREE.Line(ghostGeoB, ghostMat);
                child.parent?.add(ghostLineA);
                child.parent?.add(ghostLineB);

                stringsRef.current.set(d, {
                  mesh: child,
                  basePositions,
                  minY,
                  maxY,
                  dirVec,
                  pluckDirA,
                  pluckDirB,
                  amplitude: 0.0,
                  phase: 0.0,
                  frequencyHz: freqs[d - 1],
                  glowColor,
                  botPt,
                  topPt,
                  ghostLineA,
                  ghostLineB,
                });
              }
            }

            if (child.name.startsWith('Lever_') && child.isMesh) {
              leverHitObjectsRef.current.push(child);
            }
          });
        },
        undefined,
        (err) => {
          console.error('Failed to load celtic_harp_8string.glb:', err);
        }
      );

      // Raycaster for finger plucking, mobile glissando strumming, and lever swipe flip
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let isStrumming = false;
      let lastPluckedDeg = -1;
      let isLeverInteracting = false;
      let activeLeverDeg = -1;
      let leverTouchStartY = 0;
      let leverActionTaken = false;

      const checkLeverInteraction = (ray: THREE.Ray): number => {
        // 1. Direct mesh hit test on all lever parts
        if (leverHitObjectsRef.current.length > 0) {
          const leverHits = raycaster.intersectObjects(leverHitObjectsRef.current, false);
          if (leverHits.length > 0) {
            for (const hit of leverHits) {
              const match = hit.object.name.match(/Lever_.*_(\d)/);
              if (match) {
                return parseInt(match[1], 10);
              }
            }
          }
        }

        // 2. 3D Proximity test to each lever handle position (~5cm touch radius)
        let bestLever = -1;
        let bestDistSq = 0.0025; // ~5cm radius
        const worldPos = new THREE.Vector3();
        for (let d = 1; d <= 8; d++) {
          const lev = leversRef.current.get(d);
          if (lev && lev.obj) {
            lev.obj.getWorldPosition(worldPos);
            const distSq = ray.distanceSqToPoint(worldPos);
            if (distSq < bestDistSq) {
              bestDistSq = distSq;
              bestLever = d;
            }
          }
        }
        return bestLever;
      };

      const setSingleLeverState = (deg: number, isUp: boolean) => {
        const lev = leversRef.current.get(deg);
        if (!lev) return;
        if (lev.isEngaged !== isUp) {
          lev.isEngaged = isUp;
          lev.isEngaged = isUp;
          lev.targetAngle = isUp ? 1.75 : 0.0;
          triggerHaptic('lever');
          setLeverStates((prev) => {
            const next = [...prev];
            if (deg >= 1 && deg <= 8) next[deg - 1] = isUp;
            return next;
          });
          onLeverToggledRef.current?.(deg, isUp);
        }
      };

      const getClosestStringDegree = (ray: THREE.Ray): number => {
        // Reject the whole mounting/upper-string region before finding a playable string.
        // This also prevents a nearby string from winning when a lever is between strings.
        for (const st of stringsRef.current.values()) {
          const bottom = st.botPt.clone().applyMatrix4(st.mesh.matrixWorld);
          const top = st.topPt.clone().applyMatrix4(st.mesh.matrixWorld);
          const boundary = bottom.clone().lerp(top, 0.74);
          if (ray.distanceSqToSegment(boundary, top) < 0.0009) return -1;
        }
        if (checkLeverInteraction(ray) !== -1) return -1;
        let bestDeg = -1;
        let bestDistSq = 0.0001; // ~15.8cm generous touch proximity radius in world coordinates (~60px on mobile screen)
        const pBot = new THREE.Vector3();
        const pTop = new THREE.Vector3();
        const pPlayingTop = new THREE.Vector3();

        stringsRef.current.forEach((st, deg) => {
          pBot.copy(st.botPt).applyMatrix4(st.mesh.matrixWorld);
          pTop.copy(st.topPt).applyMatrix4(st.mesh.matrixWorld);

          // Pluck zone covers 92% of the string length
          pPlayingTop.copy(pBot).lerp(pTop, 0.70);

          const distSq = ray.distanceSqToSegment(pBot, pPlayingTop);
          if (distSq < bestDistSq) {
            bestDistSq = distSq;
            bestDeg = deg;
          }
        });
        return bestDeg;
      };

      const handlePointerStringCheck = (clientX: number, clientY: number): boolean => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        // Restrict all plucks to the playable segment, including direct hits.
        const hitDeg = getClosestStringDegree(raycaster.ray);

        if (hitDeg !== -1) {
          if (hitDeg !== lastPluckedDeg) {
            pluckString(hitDeg, 1.0);
            onStringPluckedRef.current?.(hitDeg);
            lastPluckedDeg = hitDeg;
          }
          return true;
        }
        return false;
      };

      const onPointerDown = (e: PointerEvent) => {
        // Priority 0: Check if user tapped the PRESS TO PLAY button under the shadow layer
        if (typeof document !== 'undefined') {
          const playBtn = document.getElementById('liquid-gold-play-btn');
          if (playBtn) {
            const btnRect = playBtn.getBoundingClientRect();
            if (
              e.clientX >= btnRect.left &&
              e.clientX <= btnRect.right &&
              e.clientY >= btnRect.top &&
              e.clientY <= btnRect.bottom
            ) {
              playBtn.click();
              return;
            }
          }
        }

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;
        lastPluckedDeg = -1;
        isLeverInteracting = false;
        activeLeverDeg = -1;
        leverActionTaken = false;

        // Priority 2: Check if user touched or is near a Camac lever!
        const hitLever = checkLeverInteraction(raycaster.ray);
        if (hitLever > 0) {
          isLeverInteracting = true;
          activeLeverDeg = hitLever;
          leverTouchStartY = e.clientY;
          orbitRef.current.isDragging = false;
          return; // STOP! Never pluck string or rotate camera when touching lever
        }

        // Priority 1: Check if user touched or is near strings (Direct Pluck Guess Priority)
        const hitString = handlePointerStringCheck(e.clientX, e.clientY);
        if (hitString) {
          isStrumming = true;
          orbitRef.current.isDragging = false;
          return;
        }

        isStrumming = false;
        orbitRef.current.isDragging = interactiveControls && !fixedInGameAngle;
      };

      const onPointerMove = (e: PointerEvent) => {
        // Update hover cursor over PRESS TO PLAY button
        if (typeof document !== 'undefined') {
          const playBtn = document.getElementById('liquid-gold-play-btn');
          if (playBtn) {
            const btnRect = playBtn.getBoundingClientRect();
            const isOverBtn =
              e.clientX >= btnRect.left &&
              e.clientX <= btnRect.right &&
              e.clientY >= btnRect.top &&
              e.clientY <= btnRect.bottom;
            if (isOverBtn) {
              domElem.style.cursor = 'pointer';
            } else if (!orbitRef.current.isDragging) {
              domElem.style.cursor = fixedInGameAngle ? 'default' : 'grab';
            }
          }
        }

        if (isLeverInteracting && activeLeverDeg > 0) {
          const dy = leverTouchStartY - e.clientY; // dy > 0 is finger moving UP, dy < 0 is finger moving DOWN
          if (dy > 14) {
            // Swipe UP: flip lever UP!
            setSingleLeverState(activeLeverDeg, true);
            leverActionTaken = true;
          } else if (dy < -14) {
            // Swipe DOWN: flip lever DOWN!
            setSingleLeverState(activeLeverDeg, false);
            leverActionTaken = true;
          }
          return;
        }

        // Responsive glissando strumming & swipe-to-pluck across strings
        const hitMovedString = isStrumming && e.buttons !== 0
          && handlePointerStringCheck(e.clientX, e.clientY);
        if (hitMovedString) {
          isStrumming = true;
          return;
        }

        if (!orbitRef.current.isDragging || fixedInGameAngle || !interactiveControls) return;

        // If not strumming or swiping levers, rotate harp smoothly
        const dx = e.clientX - orbitRef.current.lastX;
        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;

        // Increased finger touch drag sensitivity so harp spins faster and more fluidly under the finger
        orbitRef.current.desiredTheta -= dx * 0.018;
        // Strictly lock vertical tilt angle to 1.325 (14.10 deg) matching the Irish stone pedestal
        orbitRef.current.desiredPhi = 1.325;
      };

      const onPointerUp = () => {
        if (isLeverInteracting && activeLeverDeg > 0) {
          // Tapped without swiping
          if (!leverActionTaken) {
            const lev = leversRef.current.get(activeLeverDeg);
            if (lev) {
              setSingleLeverState(activeLeverDeg, !lev.isEngaged);
            }
          }
        }

        orbitRef.current.isDragging = false;
        isStrumming = false;
        isLeverInteracting = false;
        activeLeverDeg = -1;
        leverActionTaken = false;
        lastPluckedDeg = -1;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        // Zoom locked per user mandate: camera framing remains constant so entirety of harp is visible
      };

      const domElem = renderer.domElement;
      domElem.style.touchAction = 'none';
      domElem.style.cursor = 'grab';
      domElem.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      domElem.addEventListener('wheel', onWheel, { passive: false });

      // 120Hz ProMotion Render & Standing-Wave Physics Loop
      let animId = 0;
      let lastTime = performance.now();

      const animate = (now: number) => {
        animId = requestAnimationFrame(animate);
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        // 1. Update Camera and Harp rotation smoothly
        const o = orbitRef.current;
        if (o.autoOrbit && !o.isDragging) {
          o.desiredTheta += dt * 0.20;
        }
        const smooth = 1.0 - Math.exp(-10.0 * dt);
        o.theta += (o.desiredTheta - o.theta) * smooth;
        o.phi += (o.desiredPhi - o.phi) * smooth;
        o.radius += (o.desiredRadius - o.radius) * smooth;
        o.target.lerp(o.desiredTarget, smooth);

        // Fixed camera in Y-Z plane looking straight ahead (x = 0)
        // This guarantees the harp is centered in the screen and rotates upright at 90 degrees to the ground with zero diagonal wobble!
        const sinPhi = Math.sin(o.phi);
        camera.position.set(
          0.0,
          o.target.y + o.radius * Math.cos(o.phi),
          o.target.z + o.radius * sinPhi
        );
        camera.lookAt(o.target);

        // Spin the harp on its own vertical Y-axis at 90 degrees to ground
        if (harpRootRef.current) {
          harpRootRef.current.rotation.y = o.theta;
        }

        // 2. Animate 3D Camac Levers flipping UP / DOWN smoothly
        leversRef.current.forEach((lev) => {
          const diff = lev.targetAngle - lev.currentAngle;
          if (Math.abs(diff) > 0.001) {
            lev.currentAngle += diff * Math.min(1.0, dt * 14.0);
            const flipQuat = new THREE.Quaternion().setFromAxisAngle(
              new THREE.Vector3(1, 0, 0),
              lev.currentAngle
            );
            lev.obj.quaternion.copy(lev.baseQuat).multiply(flipQuat);
          }
        });

        // 3. Animate Standing-Wave String Vibrations (matching Video 3!)
        stringsRef.current.forEach((st) => {
          if (st.amplitude > 0.00008) {
            // Natural acoustic decay: clearly visible vibration sustained for ~2.5 seconds
            st.amplitude *= Math.exp(-0.85 * dt);
            // High-speed visual oscillation phase
            st.phase += dt * 58.0;

            // Subtle glowing light feedback: starts radiant, fades smoothly in exact lockstep with vibration down to total extinction
            // Subtle glowing light strictly on the thin string filament itself, fading in exact lockstep with vibration
            const decayFrac = Math.max(0.0, Math.min(1.0, st.amplitude / 0.009));
            const meshMat = st.mesh.material as THREE.MeshStandardMaterial;
            if (meshMat) {
              meshMat.emissive.copy(st.glowColor);
              meshMat.emissiveIntensity = decayFrac * 0.85;
            }

            const posAttr = st.mesh.geometry.attributes.position as THREE.BufferAttribute;
            const arr = posAttr.array as Float32Array;
            const base = st.basePositions;
            const spanY = Math.max(0.01, st.maxY - st.minY);

            const cosPhase = Math.cos(st.phase);
            const sinPhase2 = Math.sin(st.phase * 1.9);

            for (let i = 0; i < posAttr.count; i++) {
              const idx3 = i * 3;
              const bx = base[idx3];
              const by = base[idx3 + 1];
              const bz = base[idx3 + 2];

              // Normalized position s in [0, 1] along string from eyelet (0) to bridge pin (1)
              const s = Math.max(0.0, Math.min(1.0, (by - st.minY) / spanY));
              // Fundamental standing wave sin(pi * s) + 2nd harmonic sin(2 * pi * s)
              const standingEnvelope = Math.sin(Math.PI * s);
              const harmonic2 = 0.22 * Math.sin(2.0 * Math.PI * s);

              const dispA = st.amplitude * (standingEnvelope * cosPhase + harmonic2 * sinPhase2);
              const dispB = st.amplitude * 0.65 * standingEnvelope * Math.sin(st.phase);

              arr[idx3]     = bx + st.pluckDirA.x * dispA + st.pluckDirB.x * dispB;
              arr[idx3 + 1] = by + st.pluckDirA.y * dispA + st.pluckDirB.y * dispB;
              arr[idx3 + 2] = bz + st.pluckDirA.z * dispA + st.pluckDirB.z * dispB;
            }
            posAttr.needsUpdate = true;

            // Update optical persistence-of-vision envelope lines (Video 3 translucent double-edge)
            if (st.ghostLineA && st.ghostLineB) {
              const mat = st.ghostLineA.material as THREE.LineBasicMaterial;
              mat.opacity = Math.min(0.55, st.amplitude * 38.0);
              const posA = st.ghostLineA.geometry.attributes.position as THREE.BufferAttribute;
              const posB = st.ghostLineB.geometry.attributes.position as THREE.BufferAttribute;
              const bot = new THREE.Vector3(base[0], base[1], base[2]);
              const lastIdx = (posAttr.count - 1) * 3;
              const top = new THREE.Vector3(base[lastIdx], base[lastIdx + 1], base[lastIdx + 2]);

              for (let k = 0; k < 25; k++) {
                const f = k / 24;
                const mid = bot.clone().lerp(top, f);
                const env = st.amplitude * 1.15 * Math.sin(Math.PI * f);
                posA.setXYZ(
                  k,
                  mid.x + st.pluckDirB.x * env,
                  mid.y + st.pluckDirB.y * env,
                  mid.z + st.pluckDirB.z * env
                );
                posB.setXYZ(
                  k,
                  mid.x - st.pluckDirB.x * env,
                  mid.y - st.pluckDirB.y * env,
                  mid.z - st.pluckDirB.z * env
                );
              }
              posA.needsUpdate = true;
              posB.needsUpdate = true;
            }
          } else if (st.amplitude > 0 || ((st.mesh.material as THREE.MeshStandardMaterial)?.emissiveIntensity ?? 0) > 0) {
            st.amplitude = 0;
            const meshMat = st.mesh.material as THREE.MeshStandardMaterial;
            if (meshMat) {
              meshMat.emissiveIntensity = 0.0;
            }
            const posAttr = st.mesh.geometry.attributes.position as THREE.BufferAttribute;
            (posAttr.array as Float32Array).set(st.basePositions);
            posAttr.needsUpdate = true;
            if (st.ghostLineA) {
              (st.ghostLineA.material as THREE.LineBasicMaterial).opacity = 0;
            }
          }
        });

        // 4. Cadence warm light pulse
        if (pulseIntensityRef.current > 0.01 && keyLightRef.current) {
          pulseIntensityRef.current *= Math.exp(-3.0 * dt);
          keyLightRef.current.intensity = 2.5 + pulseIntensityRef.current * 1.2;
        }

        renderer.render(scene, camera);
      };

      animId = requestAnimationFrame(animate);

      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth || 640;
        const h = mountRef.current.clientHeight || 420;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        domElem.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        domElem.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', handleResize);
        pmremGenerator.dispose();
        renderer.dispose();
      };
    }, []);

    const toggleSingleLever = (deg: number) => {
      const nextUp = !leverStates[deg - 1];
      setLeverStates((prev) => {
        const copy = [...prev];
        copy[deg - 1] = nextUp;
        return copy;
      });
      const lev = leversRef.current.get(deg);
      if (lev) {
        lev.targetAngle = nextUp ? 1.75 : 0.0;
        triggerHaptic('lever');
      }
    };

    const setAllLeversPattern = (pattern: 'down' | 'up' | 'alternated') => {
      const next = [1, 2, 3, 4, 5, 6, 7, 8].map((d) =>
        pattern === 'up' ? true : pattern === 'down' ? false : d % 2 === 1
      );
      setLeverStates(next);
      next.forEach((isUp, idx) => {
        const lev = leversRef.current.get(idx + 1);
        if (lev) {
          lev.isEngaged = isUp;
          lev.targetAngle = isUp ? 1.75 : 0.0;
        }
      });
      triggerHaptic('lever');
    };

    const toggleAutoOrbit = () => {
      const next = !autoOrbit;
      setAutoOrbit(next);
      orbitRef.current.autoOrbit = next;
    };

    return (
      <View
        style={[styles.wrapper, minimalHeroMode && styles.wrapperHero, { pointerEvents: 'auto' } as any, style]}
        pointerEvents="auto"
      >
        {/* 3D WebGL Mount Container */}
        <View style={[styles.canvasContainer, { pointerEvents: 'auto' } as any]} pointerEvents="auto">
          {Platform.OS === 'web' ? (
            <div
              ref={mountRef}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 16,
                overflow: 'hidden',
                pointerEvents: 'auto',
                touchAction: 'none',
              }}
            />
          ) : null}

          {/* Floating Camera Angle Preset Bar */}
          {interactiveControls && !minimalHeroMode && (
            <View style={styles.cameraOverlayTop}>
              <TouchableOpacity
                onPress={() => setCameraPresetInternal('sanctuary_wide')}
                style={[styles.camChip, activePreset === 'sanctuary_wide' && styles.camChipActive]}
              >
                <Text style={[styles.camChipText, activePreset === 'sanctuary_wide' && styles.camChipTextActive]}>
                  Full Harp
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCameraPresetInternal('lever_inspection')}
                style={[styles.camChip, activePreset === 'lever_inspection' && styles.camChipActive]}
              >
                <Text style={[styles.camChipText, activePreset === 'lever_inspection' && styles.camChipTextActive]}>
                  Neck & Levers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCameraPresetInternal('bottom_cradle')}
                style={[styles.camChip, activePreset === 'bottom_cradle' && styles.camChipActive]}
              >
                <Text style={[styles.camChipText, activePreset === 'bottom_cradle' && styles.camChipTextActive]}>
                  Base Cradle & Legs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCameraPresetInternal('rear_soundholes')}
                style={[styles.camChip, activePreset === 'rear_soundholes' && styles.camChipActive]}
              >
                <Text style={[styles.camChipText, activePreset === 'rear_soundholes' && styles.camChipTextActive]}>
                  Rear 5-Stave & Dome
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleAutoOrbit}
                style={[styles.camChip, autoOrbit && styles.camChipActive]}
              >
                <Text style={[styles.camChipText, autoOrbit && styles.camChipTextActive]}>
                  360° Spin
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Interactive 8-Lever Flip Bar at Bottom of 3D Viewport */}
          {interactiveControls && !minimalHeroMode && (
            <View style={styles.leverOverlayBottom}>
              <View style={styles.leverQuickRow}>
                <Text style={styles.leverHintText}>3D SHARPING LEVERS:</Text>
                <TouchableOpacity onPress={() => setAllLeversPattern('down')} style={styles.leverMacroBtn}>
                  <Text style={styles.leverMacroText}>All Down</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAllLeversPattern('up')} style={styles.leverMacroBtn}>
                  <Text style={styles.leverMacroText}>All Up</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAllLeversPattern('alternated')} style={styles.leverMacroBtn}>
                  <Text style={styles.leverMacroText}>Alternate</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.leverPillsRow}>
                {['1 C', '2 D', '3 E', '4 F', '5 G', '6 A', '7 B', '8 C'].map((label, idx) => {
                  const deg = idx + 1;
                  const isUp = leverStates[idx];
                  const isRed = deg === 1 || deg === 8;
                  const isBlue = deg === 4;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => toggleSingleLever(deg)}
                      style={[
                        styles.leverTogglePill,
                        isRed && styles.leverRedBorder,
                        isBlue && styles.leverBlueBorder,
                        isUp && styles.leverTogglePillUp,
                      ]}
                    >
                      <Text style={styles.leverToggleLabel}>{label}</Text>
                      <Text style={[styles.leverStateTag, isUp && styles.leverStateTagUp]}>
                        {isUp ? '▲ UP' : '▼ DN'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 390,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f141d',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  wrapperHero: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraOverlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  camChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 20, 29, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  camChipActive: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  camChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  camChipTextActive: {
    color: '#0f172a',
  },
  leverOverlayBottom: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 20, 29, 0.84)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  leverQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  leverHintText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  leverMacroBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  leverMacroText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fde68a',
  },
  leverPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  leverTogglePill: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#161f2e',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  leverRedBorder: {
    borderColor: '#ef4444',
  },
  leverBlueBorder: {
    borderColor: '#3b82f6',
  },
  leverTogglePillUp: {
    backgroundColor: 'rgba(212, 175, 55, 0.24)',
  },
  leverToggleLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f8fafc',
  },
  leverStateTag: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 1,
  },
  leverStateTagUp: {
    color: '#fbbf24',
  },
});
