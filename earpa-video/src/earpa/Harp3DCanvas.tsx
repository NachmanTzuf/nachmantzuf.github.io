import React, { useEffect, useRef, useState } from 'react';
import {
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface PluckEvent {
  /** 1-indexed string number (1 = C4 Red .. 8 = C5 Red, 4 = F4 Blue) */
  stringNum: number;
  /** Frame relative to current scene when plucked */
  startFrame: number;
  /** Peak lateral vibration amplitude in meters (default 0.021) */
  amplitude?: number;
}

export interface LeverFlipEvent {
  /** 1-indexed lever number (1..8) */
  leverNum: number;
  /** Frame relative to current scene when flipped UP (+1.75 rad) */
  flipFrame: number;
  /** Optional frame when flipped back DOWN (0.0 rad) */
  unflipFrame?: number;
}

export interface Harp3DCanvasProps {
  width: number;
  height: number;
  /** Horizontal orbit angle in radians */
  theta: number;
  /** Vertical polar angle in radians (default ~1.34) */
  phi?: number;
  /** Camera distance from target in meters (default 2.40) */
  radius?: number;
  /** Camera lookAt Y height in meters (default 0.48) */
  targetY?: number;
  /** Camera lookAt X offset in meters (default 0) */
  targetX?: number;
  /** Camera lookAt Z offset in meters (default 0) */
  targetZ?: number;
  /** Field of view in degrees (default 34) */
  fov?: number;
  /** String pluck events relative to current Sequence frame */
  pluckEvents?: PluckEvent[];
  /** Camac sharping lever flip events relative to current Sequence frame */
  leverEvents?: LeverFlipEvent[];
  /** Retained for backwards compatibility; bottom plate is removed per user mandate */
  showPlinth?: boolean;
  /** Optional scale multiplier (default 0.73) */
  harpScale?: number;
  /** Optional free-floating 3D pitch/roll tilt in radians for multi-directional motion */
  tiltX?: number;
  tiltZ?: number;
  /** Optional vertical mid-air levitation bobbing offset in meters */
  floatY?: number;
}

interface StringRecord {
  num: number;
  mesh: THREE.Mesh;
  origPos: Float32Array;
  minY: number;
  maxY: number;
  glowColor: THREE.Color;
}

interface LeverRecord {
  num: number;
  obj: THREE.Object3D;
  baseQuat: THREE.Quaternion;
}

interface ParsedHarpModel {
  wrapper: THREE.Group;
  strings: StringRecord[];
  levers: LeverRecord[];
}

const InnerHarpScene: React.FC<Omit<Harp3DCanvasProps, 'width' | 'height'>> = ({
  theta,
  phi = 1.34,
  radius = 2.40,
  targetY = 0.48,
  targetX = 0.0,
  targetZ = 0.0,
  fov = 34,
  pluckEvents = [],
  leverEvents = [],
  harpScale = 0.73,
  tiltX = 0.0,
  tiltZ = 0.0,
  floatY = 0.0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { gl, scene, camera, invalidate } = useThree();

  const [handle] = useState(() => delayRender('Loading V9.3 Master 3D Celtic Harp GLB'));
  const [parsedModel, setParsedModel] = useState<ParsedHarpModel | null>(null);
  const loadedRef = useRef(false);

  // Configure ACES Filmic tone mapping and RoomEnvironment PBR reflection map matching viewer.html
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.outputColorSpace = THREE.SRGBColorSpace;

    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    return () => {
      envTex.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  // Load V9.3 Master 8-string Celtic harp GLB once, preserving its baked procedural wood grain texture!
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loader = new GLTFLoader();
    const modelUrl = staticFile('models/celtic_harp_8string.glb');

    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;
        const stringRecords: StringRecord[] = [];
        const leverRecords: LeverRecord[] = [];

        root.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              const n: string = child.name || '';
              if (n.startsWith('Lever_Base')) {
                child.material = child.material.clone();
                child.material.metalness = 0.92;
                child.material.roughness = 0.24;
                child.material.color = new THREE.Color(0x333b47);
              } else if (n.startsWith('Lever_Handle')) {
                child.material = child.material.clone();
                child.material.metalness = 0.99;
                child.material.roughness = 0.03;
                child.material.color = new THREE.Color(0xffffff);
              } else if (n.startsWith('Lever_Roller')) {
                child.material = child.material.clone();
                child.material.metalness = 0.98;
                child.material.roughness = 0.05;
                child.material.color = new THREE.Color(0xf1f5f9);
              } else if (n.startsWith('Lever_Band_1') || n.startsWith('Lever_Band_8')) {
                child.material = child.material.clone();
                child.material.color = new THREE.Color(0xef4444);
                child.material.emissive = new THREE.Color(0xef4444);
                child.material.emissiveIntensity = 0.25;
                child.material.roughness = 0.35;
                child.material.metalness = 0.02;
              } else if (n.startsWith('Lever_Band_4')) {
                child.material = child.material.clone();
                child.material.color = new THREE.Color(0x2563eb);
                child.material.emissive = new THREE.Color(0x2563eb);
                child.material.emissiveIntensity = 0.25;
                child.material.roughness = 0.35;
                child.material.metalness = 0.02;
              } else if (
                n.startsWith('Harp_Harmonic_Frame') ||
                n.startsWith('Harp_Forepillar') ||
                n.startsWith('Harp_Leg') ||
                n.startsWith('Harp_Soundbox')
              ) {
                // Clone material while preserving the baked procedural figured maple texture map!
                child.material = child.material.clone();
                child.material.color = new THREE.Color(0xd4a872);
                child.material.roughness = 0.30;
              }
              child.material.needsUpdate = true;
            }
          }

          for (let d = 1; d <= 8; d++) {
            if (child.name === `Lever_Handle_${d}`) {
              leverRecords.push({
                num: d,
                obj: child,
                baseQuat: child.quaternion.clone(),
              });
            }

            if (child.name === `String_${d}` && child.isMesh) {
              child.geometry = child.geometry.clone();
              child.material = child.material.clone();
              const posAttr = child.geometry.attributes.position;
              const origPos = new Float32Array(posAttr.array.length);
              origPos.set(posAttr.array);

              let minY = Infinity;
              let maxY = -Infinity;
              for (let i = 0; i < posAttr.count; i++) {
                const y = origPos[i * 3 + 1];
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }

              let glowColor = new THREE.Color(0xffaa44);
              if (d === 1 || d === 8) glowColor = new THREE.Color(0xff3333);
              else if (d === 4) glowColor = new THREE.Color(0x38bdf8);

              stringRecords.push({
                num: d,
                mesh: child,
                origPos,
                minY,
                maxY,
                glowColor,
              });
            }
          }
        });

        // Center feet stance at (0, 0, -0.0755) inside a free-floating wrapper group (ZERO bottom plate!)
        root.scale.setScalar(1.0);
        root.position.set(0.0, 0.0, -0.0755);

        const wrapper = new THREE.Group();
        wrapper.add(root);

        setParsedModel({
          wrapper,
          strings: stringRecords,
          levers: leverRecords,
        });
      },
      undefined,
      (err) => {
        console.error('Error loading celtic_harp_8string.glb:', err);
        continueRender(handle);
      }
    );
  }, [handle, harpScale]);

  // Deterministically update camera, free-floating 3D orientation, string vibrations, and lever angles BEFORE continueRender
  useEffect(() => {
    if (!parsedModel) return;

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.near = 0.05;
      camera.far = 50;
      camera.updateProjectionMatrix();
    }

    // Subtle organic mid-air levitation & multi-directional tilt
    const autoBobY = floatY + Math.sin(frame * 0.07) * 0.012;
    const autoTiltX = tiltX + Math.sin(frame * 0.05) * 0.035;
    const autoTiltZ = tiltZ + Math.cos(frame * 0.045) * 0.03;

    parsedModel.wrapper.position.set(0, autoBobY, 0);
    parsedModel.wrapper.rotation.set(autoTiltX, 0, autoTiltZ);
    parsedModel.wrapper.scale.setScalar(harpScale);
    parsedModel.wrapper.updateMatrixWorld(true);

    const camX = targetX + radius * Math.sin(phi) * Math.sin(theta);
    const camY = targetY + radius * Math.cos(phi);
    const camZ = targetZ + radius * Math.sin(phi) * Math.cos(theta);
    camera.position.set(camX, camY, camZ);
    camera.lookAt(targetX, targetY, targetZ);
    camera.updateMatrixWorld();

    // Update string standing waves & ultra-thin filament emissive stripe (matching Milestone M36)
    parsedModel.strings.forEach((sRec) => {
      let totalDispX = 0;
      let totalDispZ = 0;
      let maxEnv = 0;

      for (const ev of pluckEvents) {
        if (ev.stringNum !== sRec.num) continue;
        const dtFrames = frame - ev.startFrame;
        if (dtFrames >= 0 && dtFrames <= 75) {
          const dtSec = dtFrames / fps;
          const peakAmp = ev.amplitude ?? 0.022;
          const env = peakAmp * Math.pow(0.962, dtFrames);
          if (env > maxEnv) maxEnv = env;
          const omega = 2.0 * Math.PI * (12.0 + sRec.num * 1.4);
          const wave = Math.sin(omega * dtSec + sRec.num * 0.7);
          totalDispX += env * wave;
          totalDispZ += env * 0.45 * Math.cos(omega * dtSec * 1.35);
        }
      }

      const posAttr = sRec.mesh.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const orig = sRec.origPos;
      const spanY = Math.max(0.001, sRec.maxY - sRec.minY);
      const mat = sRec.mesh.material as THREE.MeshStandardMaterial;

      if (maxEnv > 0.0002) {
        for (let i = 0; i < posAttr.count; i++) {
          const idx = i * 3;
          const y = orig[idx + 1];
          const sNorm = Math.max(0, Math.min(1, (y - sRec.minY) / spanY));
          const envelopeShape =
            Math.sin(Math.PI * sNorm) + 0.18 * Math.sin(2.0 * Math.PI * sNorm);
          arr[idx] = orig[idx] + totalDispX * envelopeShape;
          arr[idx + 1] = orig[idx + 1];
          arr[idx + 2] = orig[idx + 2] + totalDispZ * envelopeShape;
        }
        posAttr.needsUpdate = true;

        const decayFrac = Math.max(0.0, Math.min(1.0, maxEnv / 0.022));
        mat.emissive.copy(sRec.glowColor);
        mat.emissiveIntensity = decayFrac * 0.95;
      } else {
        arr.set(orig);
        posAttr.needsUpdate = true;
        mat.emissiveIntensity = 0.0;
      }
    });

    // Update Camac sharping lever rotations using exact baseQuat.multiply(flipQuat) from viewer.html
    const xAxis = new THREE.Vector3(1, 0, 0);
    parsedModel.levers.forEach((lRec) => {
      let targetAngle = 0.0;
      for (const lev of leverEvents) {
        if (lev.leverNum !== lRec.num) continue;
        if (frame >= lev.flipFrame) {
          const progressUp = Math.min(1, Math.max(0, (frame - lev.flipFrame) / 8));
          const easedUp = 1 - Math.pow(1 - progressUp, 3);
          targetAngle = 1.75 * easedUp;

          if (lev.unflipFrame !== undefined && frame >= lev.unflipFrame) {
            const progressDown = Math.min(1, Math.max(0, (frame - lev.unflipFrame) / 8));
            const easedDown = 1 - Math.pow(1 - progressDown, 3);
            targetAngle = 1.75 * (1 - easedDown);
          }
        }
      }
      const flipQuat = new THREE.Quaternion().setFromAxisAngle(xAxis, targetAngle);
      lRec.obj.quaternion.copy(lRec.baseQuat).multiply(flipQuat);
    });

    invalidate();
    gl.render(scene, camera);
    continueRender(handle);
  }, [
    camera,
    floatY,
    fov,
    frame,
    fps,
    gl,
    handle,
    invalidate,
    leverEvents,
    parsedModel,
    phi,
    pluckEvents,
    radius,
    scene,
    targetX,
    targetY,
    targetZ,
    theta,
    tiltX,
    tiltZ,
  ]);

  return (
    <>
      <hemisphereLight args={[0xfff8ee, 0x161b24, 0.95]} />
      {/* Low-angle sunlight streaming from upper-right matching viewer.html */}
      <directionalLight
        position={[2.4, 2.8, 2.2]}
        intensity={2.65}
        color={0xfff7ed}
        castShadow
      />
      {/* Warm Front-Left Fill Light */}
      <directionalLight position={[-2.0, 1.6, 2.4]} intensity={0.85} color={0xd4a574} />
      {/* Dedicated Specular Light for Camac Levers on +X side */}
      <directionalLight position={[1.8, 1.4, 0.9]} intensity={1.9} color={0xffffff} />
      {/* Amber Rim Light for 3D edge separation */}
      <pointLight position={[-1.8, 1.8, -1.2]} intensity={1.55} distance={9.0} color={0xfde68a} />

      {parsedModel && <primitive object={parsedModel.wrapper} />}
    </>
  );
};

export const Harp3DCanvas: React.FC<Harp3DCanvasProps> = (props) => {
  const { width, height, ...sceneProps } = props;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ width, height, background: 'transparent' }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
    >
      <InnerHarpScene {...sceneProps} />
    </ThreeCanvas>
  );
};
