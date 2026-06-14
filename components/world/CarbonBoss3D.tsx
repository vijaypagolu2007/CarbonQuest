'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

interface CarbonBoss3DProps {
  health: number
  maxHealth: number
  position?: [number, number, number]
}

export function CarbonBoss3D({ health, maxHealth, position = [0, 8, -5] }: CarbonBoss3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const healthRatio = Math.max(0.05, health / maxHealth)
  // Boss shrinks as it takes damage
  const bossScale = 0.6 + healthRatio * 0.8

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15
    }
    if (coreRef.current) {
      // Pulsing core
      const pulse = 1 + Math.sin(t * 3) * 0.08
      coreRef.current.scale.setScalar(pulse)
      ;(coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(t * 2.5) * 0.4
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.6
      ringRef.current.rotation.z = t * 0.4
    }
  })

  // Color shifts red → orange as boss weakens
  const coreColor = healthRatio > 0.5 ? '#FF1744' : healthRatio > 0.25 ? '#FF6D00' : '#FFD600'
  const ringColor = healthRatio > 0.5 ? '#B71C1C' : '#E65100'

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={1} position={position}>
      <group ref={groupRef} scale={bossScale}>

        {/* Outer toxic ring — visible and distinctive */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.6, 0.12, 8, 32]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={1.2}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Second orbital ring at different angle */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.08, 8, 32]} />
          <meshStandardMaterial
            color="#FF4757"
            emissive="#FF4757"
            emissiveIntensity={0.8}
            roughness={0.4}
          />
        </mesh>

        {/* Spiky shell — dark icosphere */}
        <mesh>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshStandardMaterial
            color="#1a0a0a"
            emissive="#300000"
            emissiveIntensity={0.3}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        {/* Glowing core — the "eye" */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={1.5}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Particle spikes around the core */}
        {[
          [0, 1.1, 0], [0, -1.1, 0],
          [1.1, 0, 0], [-1.1, 0, 0],
          [0, 0, 1.1], [0, 0, -1.1],
          [0.8, 0.8, 0], [-0.8, -0.8, 0],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <coneGeometry args={[0.06, 0.35, 4]} />
            <meshStandardMaterial
              color={coreColor}
              emissive={coreColor}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}

        {/* Red point light for scene illumination */}
        <pointLight color="#FF1744" intensity={healthRatio * 3} distance={20} decay={2} />
        <pointLight color="#FF4757" intensity={healthRatio * 1.5} distance={12} decay={2} position={[0, 2, 0]} />
      </group>
    </Float>
  )
}
