'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sky, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { CarbonBoss3D } from './CarbonBoss3D';

interface WorldSceneProps {
  carbonReductionScore: number;
  activeBoss?: string | null;
  bossHealth?: number;
  bossMaxHealth?: number;
}

// ── Lightweight static tree ───────────────────────────────────────────────────
const AncientTree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.8, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.32, 1.6, 6]} />
      <meshStandardMaterial color="#5C4033" roughness={1} />
    </mesh>
    <group position={[0, 1.8, 0]}>
      <Sphere args={[0.82, 7, 7]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#2E8B57" roughness={0.9} />
      </Sphere>
      <Sphere args={[0.6, 6, 6]} position={[0.5, -0.3, 0.3]} castShadow>
        <meshStandardMaterial color="#3CB371" roughness={0.9} />
      </Sphere>
      <Sphere args={[0.65, 6, 6]} position={[-0.4, -0.2, -0.4]} castShadow>
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </Sphere>
    </group>
  </group>
);

// ── Static flower ─────────────────────────────────────────────────────────────
const Flower = ({ position, color }: { position: [number, number, number]; color: string }) => (
  <group position={position}>
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.28, 4]} />
      <meshStandardMaterial color="#32CD32" />
    </mesh>
    <mesh position={[0, 0.34, 0]}>
      <sphereGeometry args={[0.11, 6, 6]} />
      <meshStandardMaterial color={color} roughness={0.35} />
    </mesh>
  </group>
);

// ── Static river strip ────────────────────────────────────────────────────────
const River = () => (
  <mesh position={[-0.5, 0.16, 0.5]} rotation={[0, Math.PI / 4, Math.PI / 2]}>
    <cylinderGeometry args={[0.2, 0.2, 4, 6]} />
    <meshPhysicalMaterial color="#00BFFF" transmission={0.9} roughness={0.05} ior={1.33} />
  </mesh>
);

// ── Floating island ───────────────────────────────────────────────────────────
interface IslandProps {
  position: [number, number, number];
  isLush: boolean;
  scale?: number;
  rotationSpeed?: number;
}

const FloatingIsland: React.FC<IslandProps> = ({ position, isLush, scale = 1, rotationSpeed = 1 }) => (
  <Float speed={1.2} rotationIntensity={0.07 * rotationSpeed} floatIntensity={0.4} position={position}>
    <group scale={scale}>
      {/* Island base */}
      <mesh position={[0, -1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 0.5, 2, 8]} />
        <meshStandardMaterial color={isLush ? '#8B4513' : '#6e5d53'} roughness={1} />
      </mesh>
      {/* Grass cap */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[2.55, 2.5, 0.2, 8]} />
        <meshStandardMaterial color={isLush ? '#4CAF50' : '#7d8c70'} roughness={0.8} />
      </mesh>
      {/* Upper plateau */}
      <mesh position={[0.5, 0.6, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 1, 8]} />
        <meshStandardMaterial color={isLush ? '#654321' : '#57524e'} roughness={1} />
      </mesh>
      <mesh position={[0.5, 1.12, -0.5]} receiveShadow>
        <cylinderGeometry args={[1.55, 1.5, 0.2, 8]} />
        <meshStandardMaterial color={isLush ? '#8BC34A' : '#9aaa8a'} roughness={0.8} />
      </mesh>

      {/* Lush content */}
      {isLush && (
        <>
          <River />
          <AncientTree position={[-1.2, 0.15, -1.0]} scale={0.88} />
          <AncientTree position={[1.5, 0.15, 1.0]} scale={0.7} />
          <AncientTree position={[0.5, 1.2, -0.5]} scale={1.05} />
          <Flower position={[1.2, 0.15, -1.5]} color="#FF69B4" />
          <Flower position={[-1.5, 0.15, 1.0]} color="#FFD700" />
          <Flower position={[0.2, 1.2, -1.2]} color="#FF4500" />
          <Flower position={[1.5, 1.2, 0.2]} color="#9370DB" />
          <mesh position={[-1.8, 0.22, -0.2]} castShadow>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#9E9E9E" roughness={0.9} />
          </mesh>
        </>
      )}

      {/* Barren content */}
      {!isLush && (
        <>
          <mesh position={[-0.8, 0.7, -0.5]} rotation={[0, 0, 0.1]} castShadow>
            <cylinderGeometry args={[0.1, 0.2, 1.5, 5]} />
            <meshStandardMaterial color="#4a4a4a" roughness={1} />
          </mesh>
          <mesh position={[0.5, 1.5, -0.5]} rotation={[0, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.08, 0.15, 1.0, 4]} />
            <meshStandardMaterial color="#4a4a4a" roughness={1} />
          </mesh>
        </>
      )}
    </group>
  </Float>
);

// ── Main scene ────────────────────────────────────────────────────────────────
export const WorldScene: React.FC<WorldSceneProps> = ({
  carbonReductionScore,
  activeBoss,
  bossHealth,
  bossMaxHealth,
}) => {
  // Viewport-aware sizing
  const [size, setSize] = useState({ width: 360, height: 360 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setSize({
        width: Math.min(vw - 40, 500),
        height: Math.max(320, Math.min(vh * 0.45, 500))
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const activeIslandsCount = Math.max(1, Math.floor(carbonReductionScore / 20));
  const isLushWorld = carbonReductionScore >= 60;

  // Deterministic island layout — no Math.random() to avoid re-renders
  const islands = useMemo(() => [
    { id: 0, position: [0, -1, 0] as [number, number, number],       isLush: true,                      scale: 1.2,  rotationSpeed: 0.1 },
    { id: 1, position: [6,  -1.5, 0] as [number, number, number],    isLush: activeIslandsCount > 1,    scale: 0.75, rotationSpeed: 0.3 },
    { id: 2, position: [-5, -0.5, 4] as [number, number, number],    isLush: activeIslandsCount > 2,    scale: 0.72, rotationSpeed: 0.4 },
    { id: 3, position: [3,  -2,   -6] as [number, number, number],   isLush: activeIslandsCount > 3,    scale: 0.78, rotationSpeed: 0.35 },
    { id: 4, position: [-4, -1.5, -4] as [number, number, number],   isLush: activeIslandsCount > 4,    scale: 0.7,  rotationSpeed: 0.5 },
  ], [activeIslandsCount]);

  const bgGradient = activeBoss
    ? 'linear-gradient(to bottom, #1a0a0a 0%, #3d1515 100%)'
    : isLushWorld
    ? 'linear-gradient(to bottom, #1565C0 0%, #42A5F5 60%, #E0F2F1 100%)'
    : 'linear-gradient(to bottom, #4a8ab5 0%, #a0cce4 100%)';

  const borderColor = activeBoss
    ? 'rgba(255,71,87,0.4)'
    : 'rgba(255,255,255,0.3)';

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: size.width,
        height: size.height,
        margin: '0 auto',
        borderRadius: 32,
        overflow: 'hidden',
        background: bgGradient,
        border: `2px solid ${borderColor}`,
        boxShadow: activeBoss
          ? '0 16px 50px rgba(255,71,87,0.2), inset 0 0 20px rgba(255,0,0,0.05)'
          : '0 16px 50px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.08)',
        transition: 'all 0.6s ease',
      }}
      role="img"
      aria-label="Interactive 3D eco-city. The health and lushness of the city reflects your real-world carbon footprint."
    >
      {/* Screen reader description */}
      <p style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        A 3D animated floating eco-city. Healthy green islands with trees indicate low carbon emissions.
        Pollution and smoke indicate high carbon emissions. Boss monsters appear when your footprint is high.
      </p>
      <Canvas
        dpr={1}
        camera={{ position: [0, 6, 20], fov: 40 }}
        shadows={false}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        {/* Lighting — kept minimal for perf */}
        <ambientLight intensity={activeBoss ? 0.5 : 0.8} />
        <directionalLight
          position={[10, 15, 8]}
          intensity={activeBoss ? 1.0 : 2.2}
          color={activeBoss ? '#ffcccc' : '#fffde7'}
        />
        <directionalLight position={[-8, 8, -8]} intensity={0.5} color="#e0f7fa" />

        {/* Boss — only rendered when active */}
        {activeBoss && bossHealth !== undefined && bossMaxHealth !== undefined && (
          <CarbonBoss3D health={bossHealth} maxHealth={bossMaxHealth} position={[0, 7, -2]} />
        )}

        {/* Islands */}
        {islands.map((island) => (
          <FloatingIsland
            key={island.id}
            position={island.position}
            isLush={island.isLush}
            scale={island.scale}
            rotationSpeed={island.rotationSpeed}
          />
        ))}

        <OrbitControls
          target={[0, 0, 0]}
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 5}
        />
      </Canvas>
    </div>
  );
};
