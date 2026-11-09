import React, { useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

interface ChladniProps {
  width: number;
  height: number;
  accent?: string;
}

const InnerChladniScene: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const time = frame * 0.04;
  const colAccent = new THREE.Color(accent);
  const spruceWood = new THREE.Color(0xd4a872);

  // 120 floating acoustic particles
  const particleCount = 120;
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const u = (i / particleCount) * Math.PI * 2;
    const r = 0.4 + Math.sin(u * 3.0 + time * 1.5) * 0.7;
    const x = Math.cos(u + time * 0.4) * r;
    const y = Math.sin(u + time * 0.4) * r;
    const z = Math.sin(time * 2.0 + i) * 0.25;
    return { x, y, z, i };
  });

  // Chladni nodal wave lines
  const wavePoints = 40;
  const lineA = Array.from({ length: wavePoints }).map((_, i) => {
    const tVal = (i / wavePoints) * 2.4 - 1.2;
    const yVal = Math.sin(tVal * 3.5 + time * 2.0) * 0.45;
    return new THREE.Vector3(tVal, yVal, 0.02);
  });
  const lineB = Array.from({ length: wavePoints }).map((_, i) => {
    const tVal = (i / wavePoints) * 2.4 - 1.2;
    const yVal = -Math.sin(tVal * 3.5 + time * 2.0) * 0.45;
    return new THREE.Vector3(tVal, yVal, 0.02);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 3]} intensity={2.2} color="#ffffff" />
      <pointLight position={[2, 2, 2]} intensity={1.5} color={accent} />

      <group rotation={[0.4, time * 0.18, 0]}>
        {/* Sitka Spruce Soundboard Base Plate */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 1.6, 0.04]} />
          <meshStandardMaterial
            color={spruceWood}
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>

        {/* Chladni Nodal Wave Ribbon A */}
        <line>
          <bufferGeometry
            attach="geometry"
            onUpdate={(self) => {
              self.setFromPoints(lineA);
            }}
          />
          <lineBasicMaterial
            attach="material"
            color={colAccent}
            linewidth={3}
          />
        </line>

        {/* Chladni Nodal Wave Ribbon B */}
        <line>
          <bufferGeometry
            attach="geometry"
            onUpdate={(self) => {
              self.setFromPoints(lineB);
            }}
          />
          <lineBasicMaterial
            attach="material"
            color="#34d399"
            linewidth={3}
          />
        </line>

        {/* 120 Floating Gold Acoustic Particles */}
        {particles.map((p) => (
          <mesh key={`part-${p.i}`} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>
    </>
  );
};

export const ChladniResonanceCanvas: React.FC<ChladniProps> = ({
  width,
  height,
  accent = '#38bdf8',
}) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 4.0], fov: 36 }}
      >
        <InnerChladniScene accent={accent} />
      </ThreeCanvas>
    </div>
  );
};
