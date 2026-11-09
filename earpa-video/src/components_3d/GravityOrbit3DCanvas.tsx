import React, { useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

interface GravityOrbitProps {
  width: number;
  height: number;
  accent?: string;
  resolvingDegree?: number; // 1 to 8
}

const InnerGravityOrbitScene: React.FC<{
  accent: string;
  resolvingDegree: number;
}> = ({ accent, resolvingDegree }) => {
  const frame = useCurrentFrame();
  const time = frame * 0.04;
  const colAccent = new THREE.Color(accent);
  const colTonic = new THREE.Color('#10b981'); // Emerald Tonic DO

  // 7 orbiting musical degrees (2 RE to 8 DO)
  const degrees = [
    { num: 2, name: 'RE', r: 0.85, speed: 1.1, baseCol: '#38bdf8' },
    { num: 3, name: 'MI', r: 1.05, speed: 0.9, baseCol: '#818cf8' },
    { num: 4, name: 'FA', r: 1.25, speed: 0.75, baseCol: '#f43f5e' }, // High tension
    { num: 5, name: 'SOL', r: 1.45, speed: 0.65, baseCol: '#fbbf24' },
    { num: 6, name: 'LA', r: 1.65, speed: 0.55, baseCol: '#a855f7' },
    { num: 7, name: 'TI', r: 1.85, speed: 0.45, baseCol: '#ec4899' }, // Leading tone tension
    { num: 8, name: 'DO', r: 2.05, speed: 0.40, baseCol: '#34d399' },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 4]} intensity={2.0} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={3.0} color="#10b981" />

      <group rotation={[0.55, time * 0.15, 0]}>
        {/* Center Tonic DO Sun */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial
            color={colTonic}
            emissive={colTonic}
            emissiveIntensity={2.8}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Tonic Halo Pulse Ring */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[
              0.36 + Math.sin(time * 3.0) * 0.04,
              0.44 + Math.sin(time * 3.0) * 0.04,
              64,
            ]}
          />
          <meshStandardMaterial
            color={colTonic}
            emissive={colTonic}
            emissiveIntensity={1.5}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Orbiting Degrees */}
        {degrees.map((d) => {
          const isResolving = d.num === resolvingDegree;
          // If resolving, pull satellite closer to center Tonic DO
          const curR = isResolving
            ? d.r * Math.max(0.4, 1.0 - Math.sin(time * 2.0) * 0.5)
            : d.r;
          const angle = time * d.speed + (d.num * Math.PI) / 3.5;
          const x = Math.cos(angle) * curR;
          const y = Math.sin(angle) * curR;
          const z = Math.sin(angle * 2.0) * 0.18;
          const satCol = new THREE.Color(d.baseCol);

          return (
            <group key={`deg-${d.num}`}>
              {/* Elliptical Orbit Track */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[d.r - 0.008, d.r + 0.008, 64]} />
                <meshStandardMaterial
                  color={isResolving ? colAccent : new THREE.Color(0x334155)}
                  transparent
                  opacity={isResolving ? 0.8 : 0.25}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Gravitational Tension Vector Line connecting to Tonic DO */}
              {isResolving && (
                <line>
                  <bufferGeometry
                    attach="geometry"
                    onUpdate={(self) => {
                      const pts = new Float32Array([0, 0, 0, x, y, z]);
                      self.setAttribute(
                        'position',
                        new THREE.BufferAttribute(pts, 3)
                      );
                    }}
                  />
                  <lineBasicMaterial
                    attach="material"
                    color={colAccent}
                    linewidth={2}
                    transparent
                    opacity={0.85}
                  />
                </line>
              )}

              {/* Satellite Degree Sphere */}
              <mesh position={[x, y, z]}>
                <sphereGeometry args={[isResolving ? 0.12 : 0.08, 24, 24]} />
                <meshStandardMaterial
                  color={satCol}
                  emissive={satCol}
                  emissiveIntensity={isResolving ? 2.5 : 1.2}
                  roughness={0.15}
                  metalness={0.8}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
};

export const GravityOrbit3DCanvas: React.FC<GravityOrbitProps> = ({
  width,
  height,
  accent = '#38bdf8',
  resolvingDegree = 4,
}) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 4.2], fov: 36 }}
      >
        <InnerGravityOrbitScene
          accent={accent}
          resolvingDegree={resolvingDegree}
        />
      </ThreeCanvas>
    </div>
  );
};
