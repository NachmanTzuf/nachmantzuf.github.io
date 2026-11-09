import React, { useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

interface SoundWaveProps {
  width: number;
  height: number;
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: number;
}

const InnerSoundWaveScene: React.FC<{
  primaryColor: string;
  secondaryColor: string;
  intensity: number;
}> = ({ primaryColor, secondaryColor, intensity }) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<THREE.Group>(null);

  // Time evolution
  const time = frame * 0.045;
  const colA = new THREE.Color(primaryColor);
  const colB = new THREE.Color(secondaryColor);

  // 14 concentric volumetric rings
  const ringCount = 14;
  const rings = Array.from({ length: ringCount }).map((_, i) => {
    const radius = 0.35 + i * 0.16;
    const wave = Math.sin(time * 2.2 - i * 0.45) * 0.12 * intensity;
    const rotZ = time * 0.25 + i * 0.08;
    const pulseScale = 1.0 + Math.sin(time * 3.0 + i * 0.3) * 0.05 * intensity;
    const ringCol = colA.clone().lerp(colB, i / ringCount);
    const opacity = (1.0 - (i / ringCount) * 0.65) * Math.min(1.0, intensity);
    return { radius, wave, rotZ, pulseScale, ringCol, opacity, i };
  });

  // 24 orbiting frequency spectrum pillars
  const barCount = 24;
  const bars = Array.from({ length: barCount }).map((_, i) => {
    const angle = (i / barCount) * Math.PI * 2 + time * 0.35;
    const r = 1.65;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const h = 0.2 + Math.abs(Math.sin(time * 4.0 + i * 0.8)) * 0.85 * intensity;
    const barCol = colB.clone().lerp(colA, (Math.sin(angle) + 1) / 2);
    return { x, z, h, barCol };
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 2, 3]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-2, -2, 2]} intensity={1.2} color={primaryColor} />
      <pointLight position={[2, 2, -2]} intensity={1.2} color={secondaryColor} />

      <group ref={groupRef} rotation={[0.42 + Math.sin(time * 0.5) * 0.08, time * 0.2, 0]}>
        {/* Concentric Volumetric Waveform Rings */}
        {rings.map((r) => (
          <mesh
            key={`ring-${r.i}`}
            position={[0, r.wave, 0]}
            rotation={[Math.PI / 2, 0, r.rotZ]}
            scale={[r.pulseScale, r.pulseScale, 1]}
          >
            <torusGeometry args={[r.radius, 0.018, 16, 64]} />
            <meshStandardMaterial
              color={r.ringCol}
              emissive={r.ringCol}
              emissiveIntensity={0.85 * intensity}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={r.opacity}
            />
          </mesh>
        ))}

        {/* 3D Frequency Spectrum Cylinder Pillars */}
        {bars.map((b, idx) => (
          <mesh key={`bar-${idx}`} position={[b.x, b.h / 2 - 0.4, b.z]}>
            <cylinderGeometry args={[0.024, 0.024, b.h, 16]} />
            <meshStandardMaterial
              color={b.barCol}
              emissive={b.barCol}
              emissiveIntensity={0.9 * intensity}
              roughness={0.15}
              metalness={0.9}
            />
          </mesh>
        ))}

        {/* Center Luminous Sonic Singularity Core */}
        <mesh position={[0, 0, 0]} scale={0.22 + Math.sin(time * 5.0) * 0.04 * intensity}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={colA}
            emissive={colA}
            emissiveIntensity={2.5 * intensity}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </group>
    </>
  );
};

export const SoundWave3DCanvas: React.FC<SoundWaveProps> = ({
  width,
  height,
  primaryColor = '#10b981',
  secondaryColor = '#38bdf8',
  intensity = 1.0,
}) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 4.2], fov: 36 }}
      >
        <InnerSoundWaveScene
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          intensity={intensity}
        />
      </ThreeCanvas>
    </div>
  );
};
