import React, { useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

interface AstrolabeProps {
  width: number;
  height: number;
  accent?: string;
  leverEngagedCount?: number;
}

const InnerAstrolabeScene: React.FC<{ accent: string; leverEngagedCount: number }> = ({
  accent,
  leverEngagedCount,
}) => {
  const frame = useCurrentFrame();
  const time = frame * 0.035;
  const colAccent = new THREE.Color(accent);
  const bronze = new THREE.Color(0xb8860b);
  const darkMetal = new THREE.Color(0x1a2332);

  // 12 chromatic dial stations
  const stations = 12;
  const stationMeshes = Array.from({ length: stations }).map((_, i) => {
    const angle = (i / stations) * Math.PI * 2;
    const r = 1.35;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const isActive = i <= (leverEngagedCount % stations);
    return { x, y, angle, isActive, i };
  });

  // 7 sharping lever handles
  const levers = Array.from({ length: 7 }).map((_, i) => {
    const isUp = i < leverEngagedCount;
    const leverAngle = isUp ? 0.38 : 0.0;
    const posX = -0.9 + i * 0.3;
    const posY = -1.25;
    return { posX, posY, leverAngle, isUp, i };
  });

  // 36 outer cog teeth
  const cogTeeth = 36;
  const teeth = Array.from({ length: cogTeeth }).map((_, i) => {
    const angle = (i / cogTeeth) * Math.PI * 2 + time * 0.15;
    const r = 1.62;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return { x, y, angle, i };
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-2, -2, 2]} intensity={1.4} color={accent} />

      <group rotation={[0.35 + Math.sin(time * 0.4) * 0.05, Math.sin(time * 0.3) * 0.2, 0]}>
        {/* Main Brushed Bronze Cogged Ring */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, time * 0.15]}>
          <ringGeometry args={[1.42, 1.60, 64]} />
          <meshStandardMaterial
            color={bronze}
            roughness={0.25}
            metalness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 36 Outer Cog Teeth */}
        {teeth.map((t) => (
          <mesh
            key={`cog-${t.i}`}
            position={[t.x, t.y, 0]}
            rotation={[0, 0, t.angle]}
          >
            <boxGeometry args={[0.08, 0.04, 0.04]} />
            <meshStandardMaterial color={bronze} roughness={0.3} metalness={0.8} />
          </mesh>
        ))}

        {/* Inner Obsidian Dial Plate */}
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[1.40, 64]} />
          <meshStandardMaterial color={darkMetal} roughness={0.4} metalness={0.6} />
        </mesh>

        {/* 12 Chromatic Stations */}
        {stationMeshes.map((s) => (
          <mesh key={`st-${s.i}`} position={[s.x, s.y, 0.02]}>
            <cylinderGeometry args={[0.065, 0.065, 0.03, 16]} />
            <meshStandardMaterial
              color={s.isActive ? colAccent : new THREE.Color(0x334155)}
              emissive={s.isActive ? colAccent : new THREE.Color(0x000000)}
              emissiveIntensity={s.isActive ? 1.5 : 0}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        ))}

        {/* Central Sapphire Pointer Arm */}
        <mesh
          position={[0, 0, 0.04]}
          rotation={[0, 0, -time * 0.45 - (leverEngagedCount * Math.PI) / 6]}
        >
          <boxGeometry args={[0.06, 1.25, 0.03]} />
          <meshStandardMaterial
            color={colAccent}
            emissive={colAccent}
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* 7 Sharping Lever Handles */}
        {levers.map((lev) => (
          <group
            key={`lev-${lev.i}`}
            position={[lev.posX, lev.posY, 0.1]}
            rotation={[0, 0, lev.leverAngle]}
          >
            {/* Base bracket */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.06, 0.12, 0.06]} />
              <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Chrome Handle */}
            <mesh position={[0, 0.14, 0.02]}>
              <cylinderGeometry args={[0.02, 0.02, 0.22, 16]} />
              <meshStandardMaterial
                color="#f8fafc"
                roughness={0.05}
                metalness={0.98}
              />
            </mesh>
            {/* Status Tip */}
            <mesh position={[0, 0.26, 0.02]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial
                color={lev.isUp ? colAccent : new THREE.Color(0x64748b)}
                emissive={lev.isUp ? colAccent : new THREE.Color(0x000000)}
                emissiveIntensity={lev.isUp ? 1.8 : 0}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
};

export const Astrolabe3DCanvas: React.FC<AstrolabeProps> = ({
  width,
  height,
  accent = '#f59e0b',
  leverEngagedCount = 3,
}) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 4.4], fov: 36 }}
      >
        <InnerAstrolabeScene accent={accent} leverEngagedCount={leverEngagedCount} />
      </ThreeCanvas>
    </div>
  );
};
