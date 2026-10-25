const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

// Minimal polyfills for GLTFLoader in Node
if (typeof global.self === 'undefined') {
  global.self = global;
  global.window = global;
}

const buffer = fs.readFileSync('public/models/celtic_harp_8string.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);

  console.log('=== GLTF Scene World Hierarchy Loaded ===');

  let totalVerts = 0;
  const worldPoints = [];
  const legContactPoints = [];
  const componentBounds = {};

  scene.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const geom = child.geometry;
      const pos = geom.attributes.position;
      if (!pos) return;

      const meshName = child.name || 'unnamed';
      let cMin = new THREE.Vector3(Infinity, Infinity, Infinity);
      let cMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        v.applyMatrix4(child.matrixWorld);

        worldPoints.push(v.clone());
        totalVerts++;

        cMin.min(v);
        cMax.max(v);

        if (meshName.includes('Leg')) {
          if (v.y <= 0.003) {
            legContactPoints.push(v.clone());
          }
        }
      }

      componentBounds[meshName] = {
        min: cMin,
        max: cMax,
        center: new THREE.Vector3().addVectors(cMin, cMax).multiplyScalar(0.5),
        count: pos.count
      };
    }
  });

  console.log(`Total World Vertices: ${totalVerts}`);

  // 1. Overall World Bounding Box
  const overallMin = new THREE.Vector3(Infinity, Infinity, Infinity);
  const overallMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const overallSum = new THREE.Vector3(0, 0, 0);

  for (const p of worldPoints) {
    overallMin.min(p);
    overallMax.max(p);
    overallSum.add(p);
  }

  const overallCenter = new THREE.Vector3().addVectors(overallMin, overallMax).multiplyScalar(0.5);
  const overallCentroid = overallSum.clone().divideScalar(worldPoints.length);

  console.log('\n--- 1. OVERALL WORLD BOUNDING BOX ---');
  console.log(`X: [${overallMin.x.toFixed(6)}, ${overallMax.x.toFixed(6)}] | Width:  ${(overallMax.x - overallMin.x).toFixed(6)}m | Center X: ${overallCenter.x.toFixed(6)}m`);
  console.log(`Y: [${overallMin.y.toFixed(6)}, ${overallMax.y.toFixed(6)}] | Height: ${(overallMax.y - overallMin.y).toFixed(6)}m | Center Y: ${overallCenter.y.toFixed(6)}m`);
  console.log(`Z: [${overallMin.z.toFixed(6)}, ${overallMax.z.toFixed(6)}] | Depth:  ${(overallMax.z - overallMin.z).toFixed(6)}m | Center Z: ${overallCenter.z.toFixed(6)}m`);
  console.log(`BBox Center: (${overallCenter.x.toFixed(6)}, ${overallCenter.y.toFixed(6)}, ${overallCenter.z.toFixed(6)})`);
  console.log(`Centroid (Center of Mass): (${overallCentroid.x.toFixed(6)}, ${overallCentroid.y.toFixed(6)}, ${overallCentroid.z.toFixed(6)})`);

  // 2. Leg Floor Contact Analysis
  console.log('\n--- 2. FLOOR CONTACT POINTS (THE LEGS) ---');
  console.log(`Total leg contact points within 3mm of floor: ${legContactPoints.length}`);

  const legMin = new THREE.Vector3(Infinity, Infinity, Infinity);
  const legMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const legSum = new THREE.Vector3(0, 0, 0);

  for (const p of legContactPoints) {
    legMin.min(p);
    legMax.max(p);
    legSum.add(p);
  }

  const legCenter = new THREE.Vector3().addVectors(legMin, legMax).multiplyScalar(0.5);
  const legMean = legSum.clone().divideScalar(legContactPoints.length);

  console.log(`Leg Floor Contact X: [${legMin.x.toFixed(6)}, ${legMax.x.toFixed(6)}] -> Center X = ${legCenter.x.toFixed(6)}m (Width = ${(legMax.x - legMin.x).toFixed(6)}m)`);
  console.log(`Leg Floor Contact Y: [${legMin.y.toFixed(6)}, ${legMax.y.toFixed(6)}] -> Flatness Delta Y = ${(legMax.y - legMin.y).toFixed(6)}m`);
  console.log(`Leg Floor Contact Z: [${legMin.z.toFixed(6)}, ${legMax.z.toFixed(6)}] -> Center Z = ${legCenter.z.toFixed(6)}m (Length = ${(legMax.z - legMin.z).toFixed(6)}m)`);
  console.log(`Leg Contact Mean Position: (${legMean.x.toFixed(6)}, ${legMean.y.toFixed(6)}, ${legMean.z.toFixed(6)})`);

  // 3. Main Frame & Soundbox Components
  console.log('\n--- 3. MAIN STRUCTURAL COMPONENTS ---');
  ['Harp_Harmonic_Frame_Mesh', 'Harp_Soundboard_Face_Mesh', 'Harp_Central_String_Rib_Mesh', 'Harp_Leg_1_Mesh', 'Harp_Leg_2_Mesh', 'Harp_Bottom_Plate_Mesh'].forEach((name) => {
    const b = componentBounds[name];
    if (b) {
      console.log(`${name.padEnd(30)}: X=[${b.min.x.toFixed(4)}, ${b.max.x.toFixed(4)}] Y=[${b.min.y.toFixed(4)}, ${b.max.y.toFixed(4)}] Z=[${b.min.z.toFixed(4)}, ${b.max.z.toFixed(4)}] | Center: (${b.center.x.toFixed(4)}, ${b.center.y.toFixed(4)}, ${b.center.z.toFixed(4)})`);
    }
  });

  // 4. Vertical Slices to find the True Visual Axis of the Harp
  console.log('\n--- 4. SLICES FROM FLOOR TO CROWN ---');
  for (let y = 0.05; y <= 1.35; y += 0.10) {
    const slice = worldPoints.filter(p => Math.abs(p.y - y) < 0.02);
    if (slice.length > 0) {
      const sMin = new THREE.Vector3(Infinity, Infinity, Infinity);
      const sMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
      slice.forEach(p => { sMin.min(p); sMax.max(p); });
      const sCenter = new THREE.Vector3().addVectors(sMin, sMax).multiplyScalar(0.5);
      console.log(`Height Y=${y.toFixed(2)}m | N=${slice.length.toString().padStart(4)} | Z range: [${sMin.z.toFixed(4)}, ${sMax.z.toFixed(4)}] | Midpoint Z: ${sCenter.z.toFixed(4)}`);
    }
  }

  process.exit(0);
}, undefined, (err) => {
  console.error('Error loading GLB:', err);
  process.exit(1);
});
