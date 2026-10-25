/**
 * EARPA 3D SANCTUARY SCENE
 * Atmospheric candlelit Celtic stone chamber with reactive lighting,
 * volumetric depth light strike beam, and smooth cubic Bezier camera glides.
 */

import * as THREE from 'three';
import { CelticHarpModel } from './CelticHarpModel';
import { SANCTUARY_CAMERA_PRESETS, CameraPerspectiveTarget } from './types';

export class SanctuaryScene {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly harp: CelticHarpModel;

  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private candleLightLeft: THREE.PointLight;
  private candleLightRight: THREE.PointLight;
  private lightStrikeBeam: THREE.Mesh;
  private lightStrikeMaterial: THREE.MeshBasicMaterial;

  // Camera glide state
  private currentCameraTarget: CameraPerspectiveTarget;
  private cameraStartPos: THREE.Vector3;
  private cameraEndPos: THREE.Vector3;
  private cameraLookTarget: THREE.Vector3;
  private cameraTransitionProgress: number = 1.0;
  private cameraTransitionDurationMs: number = 850;
  private cameraTransitionStartTime: number = 0;

  // Cadence reactive pulse
  private cadencePulseActive: boolean = false;
  private cadencePulseProgress: number = 0;

  constructor(aspectRatio: number = 9 / 16) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1117); // Deep atmospheric obsidian slate
    this.scene.fog = new THREE.FogExp2(0x0e1117, 0.28);

    this.currentCameraTarget = SANCTUARY_CAMERA_PRESETS.playing_focus;
    this.camera = new THREE.PerspectiveCamera(
      this.currentCameraTarget.fov,
      aspectRatio,
      0.1,
      20.0
    );
    this.camera.position.set(...this.currentCameraTarget.position);
    this.cameraLookTarget = new THREE.Vector3(...this.currentCameraTarget.target);
    this.camera.lookAt(this.cameraLookTarget);

    this.cameraStartPos = this.camera.position.clone();
    this.cameraEndPos = this.camera.position.clone();

    // 1. Lighting Setup
    this.ambientLight = new THREE.AmbientLight(0x2d1f14, 1.2);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffecd1, 1.8);
    this.keyLight.position.set(1.2, 2.4, 1.8);
    this.scene.add(this.keyLight);

    // Left and Right Celtic Lanterns (Warm flickering flame points)
    this.candleLightLeft = new THREE.PointLight(0xf59e0b, 2.2, 4.5);
    this.candleLightLeft.position.set(-1.2, 1.2, 0.4);
    this.scene.add(this.candleLightLeft);

    this.candleLightRight = new THREE.PointLight(0xd97706, 2.0, 4.5);
    this.candleLightRight.position.set(1.4, 0.9, 0.6);
    this.scene.add(this.candleLightRight);

    // 2. Add Celtic Harp Model
    this.harp = new CelticHarpModel();
    this.scene.add(this.harp.rootGroup);

    // 3. Volumetric Depth Light Strike Beam
    const beamGeo = new THREE.CylinderGeometry(0.008, 0.045, 1.8, 16);
    beamGeo.translate(0, 0.9, 0); // Origin at bottom tip
    this.lightStrikeMaterial = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7, // Glowing emerald starlight beam
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.lightStrikeBeam = new THREE.Mesh(beamGeo, this.lightStrikeMaterial);
    this.lightStrikeBeam.visible = false;
    this.scene.add(this.lightStrikeBeam);

    // 4. Sanctuary Ambient Backdrop (Subtle stone chamber floor)
    const floorGeo = new THREE.PlaneGeometry(6.0, 6.0);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.0;
    this.scene.add(floor);
  }

  /**
   * Smoothly transitions camera to a preset view.
   */
  public transitionCameraTo(presetName: keyof typeof SANCTUARY_CAMERA_PRESETS): void {
    const target = SANCTUARY_CAMERA_PRESETS[presetName];
    this.currentCameraTarget = target;
    this.cameraStartPos = this.camera.position.clone();
    this.cameraEndPos = new THREE.Vector3(...target.position);
    this.cameraLookTarget = new THREE.Vector3(...target.target);
    this.cameraTransitionProgress = 0.0;
    this.cameraTransitionStartTime = performance.now();
  }

  /**
   * Trigger the atmospheric cadence pulse (warm golden bloom across the scene).
   */
  public triggerCadencePulse(): void {
    this.cadencePulseActive = true;
    this.cadencePulseProgress = 1.0;
  }

  /**
   * Trigger a volumetric light strike beam on a target string.
   */
  public triggerLightStrikeOnString(stringIndex: number): void {
    if (stringIndex < 0 || stringIndex >= this.harp.stringDataList.length) return;
    const str = this.harp.stringDataList[stringIndex];
    const [neckX, neckY, neckZ] = str.neckPinAnchor;
    const [sbX, sbY, sbZ] = str.soundboardAnchor;

    // Target midpoint of vibrating string
    const targetMidX = (neckX + sbX) / 2;
    const targetMidY = (neckY + sbY) / 2;
    const targetMidZ = (neckZ + sbZ) / 2;

    // Beam originates from depth (+Z camera space) and strikes string
    this.lightStrikeBeam.position.set(targetMidX, targetMidY, targetMidZ);
    this.lightStrikeBeam.lookAt(targetMidX, targetMidY + 1.0, targetMidZ + 1.2);
    this.lightStrikeBeam.visible = true;
    this.lightStrikeMaterial.opacity = 0.95;

    // Trigger physical string wave vibration
    this.harp.triggerPluck(stringIndex, 0.035);

    // Beam smoothly fades out over 480ms
    const startTime = performance.now();
    const fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / 480;
      if (progress >= 1.0) {
        this.lightStrikeMaterial.opacity = 0.0;
        this.lightStrikeBeam.visible = false;
        clearInterval(fadeInterval);
      } else {
        this.lightStrikeMaterial.opacity = (1.0 - progress) * 0.95;
      }
    }, 16);
  }

  /**
   * Main render update loop running at 120Hz ProMotion.
   */
  public update(): void {
    const now = performance.now();

    // 1. Organic Candle Flicker
    const flicker1 = Math.sin(now * 0.008) * 0.15 + Math.cos(now * 0.017) * 0.1;
    const flicker2 = Math.cos(now * 0.009) * 0.18 + Math.sin(now * 0.015) * 0.12;
    this.candleLightLeft.intensity = 2.2 + flicker1;
    this.candleLightRight.intensity = 2.0 + flicker2;

    // 2. Cadence Lighting Pulse
    if (this.cadencePulseActive) {
      this.cadencePulseProgress -= 0.018;
      if (this.cadencePulseProgress <= 0) {
        this.cadencePulseProgress = 0;
        this.cadencePulseActive = false;
      }
      const warmBonus = this.cadencePulseProgress * 1.5;
      this.ambientLight.intensity = 1.2 + warmBonus;
      this.keyLight.intensity = 1.8 + warmBonus * 0.8;
    }

    // 3. Smooth Camera Glide (Cubic Bezier / SmootherStep)
    if (this.cameraTransitionProgress < 1.0) {
      const elapsedMs = now - this.cameraTransitionStartTime;
      const t = Math.min(1.0, elapsedMs / this.cameraTransitionDurationMs);

      // Ken Perlin's SmootherStep: 6t^5 - 15t^4 + 10t^3 (C2 continuous acceleration)
      const smootherT = 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, smootherT);
      this.camera.lookAt(this.cameraLookTarget);

      this.cameraTransitionProgress = t;
    }

    // 4. Update Physical String Wave Physics
    this.harp.updatePhysics();
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
