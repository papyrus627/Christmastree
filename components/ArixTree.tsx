import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, ThemeConfig, ThemeId } from '../types';
import { PARTICLE_COUNT } from '../constants';
import { getConePoint, getRandomSpherePoint } from '../utils/geometry';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface ArixTreeProps {
  mode: TreeMode;
  theme: ThemeConfig;
}

export const ArixTree: React.FC<ArixTreeProps> = ({ mode, theme }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const trunkRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // --- 1. Foliage Particles (Needles) ---
  const { particles, colors } = useMemo(() => {
    const tempParticles = [];
    const tempColors = [];
    const colorPrimary = new THREE.Color(theme.colors.particlesPrimary);
    const colorSecondary = new THREE.Color(theme.colors.particlesSecondary);
    const colorObj = new THREE.Color();

    const TREE_HEIGHT = 11;
    const TREE_RADIUS = 5.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const scatterPos = getRandomSpherePoint(28); // Wide scatter
      const treePosRaw = getConePoint(TREE_HEIGHT, TREE_RADIUS);
      const treePos = new THREE.Vector3(...treePosRaw);
      
      // Calculate normalized height (0 at bottom, 1 at top)
      const yNorm = (treePos.y + TREE_HEIGHT/2) / TREE_HEIGHT;

      // Natural Fullness Noise:
      // Add subtle random displacement to break perfect geometry
      const noiseAmp = 0.22;
      treePos.x += (Math.random() - 0.5) * noiseAmp;
      treePos.y += (Math.random() - 0.5) * noiseAmp;
      treePos.z += (Math.random() - 0.5) * noiseAmp;

      // Size: 
      // Base scale around 1.0. Taper to 0.4 at top.
      const baseScale = 1.0 - (yNorm * 0.6);
      // Increased variation: 0.3x to 1.8x multiplier
      const randomScale = 0.3 + Math.random() * 1.5; 
      const finalScale = baseScale * randomScale;

      // Color Mixing:
      // Chance of secondary (lighter) color increases with height.
      const secondaryChance = 0.1 + (yNorm * 0.5);
      
      if (Math.random() < secondaryChance) {
          colorObj.copy(colorSecondary);
      } else {
          colorObj.copy(colorPrimary);
      }

      tempParticles.push({
        scatterPos: new THREE.Vector3(...scatterPos),
        treePos: treePos,
        speed: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
        scale: finalScale
      });

      tempColors.push(colorObj.r, colorObj.g, colorObj.b);
    }
    return { particles: tempParticles, colors: new Float32Array(tempColors) };
  }, [theme]);

  // --- 2. Trunk Logic ---
  const trunkData = useMemo(() => {
      const scatterPos = getRandomSpherePoint(25);
      return {
          scatterPos: new THREE.Vector3(...scatterPos),
          treePos: new THREE.Vector3(0, -2.5, 0)
      };
  }, []);

  // Apply colors to instances
  useLayoutEffect(() => {
    if (meshRef.current) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            meshRef.current.setColorAt(i, new THREE.Color(colors[i*3], colors[i*3+1], colors[i*3+2]));
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [colors]);

  const dummy = new THREE.Object3D();
  const targetFactor = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth transition
    const goal = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    targetFactor.current = THREE.MathUtils.damp(targetFactor.current, goal, 1.5, delta);
    const tf = targetFactor.current;
    const time = state.clock.getElapsedTime();

    // Animate Foliage
    particles.forEach((particle, i) => {
      const currentPos = new THREE.Vector3().lerpVectors(
        particle.scatterPos,
        particle.treePos,
        tf
      );

      // Breathing effect
      const breathe = Math.sin(time * particle.speed + particle.phase) * (0.1 + (1-tf)*0.3);
      currentPos.y += breathe;

      // Spin effect during morph
      const spin = (1 - tf) * Math.sin(time * 0.1) * 4; 
      const angle = Math.atan2(currentPos.x, currentPos.z) + spin;
      const radius = Math.sqrt(currentPos.x**2 + currentPos.z**2);
      
      if (tf < 0.9) {
          currentPos.x = radius * Math.cos(angle);
          currentPos.z = radius * Math.sin(angle);
      }

      dummy.position.copy(currentPos);
      
      // Orient needles
      dummy.rotation.copy(particle.rotation);
      dummy.rotation.x = THREE.MathUtils.lerp(particle.rotation.x, -0.5, tf); 
      dummy.rotation.y += time * 0.1;

      // Scale transition
      const currentScale = THREE.MathUtils.lerp(1.2, particle.scale, tf);
      dummy.scale.setScalar(currentScale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Animate Trunk
    if (trunkRef.current) {
        trunkRef.current.position.lerpVectors(trunkData.scatterPos, trunkData.treePos, tf);
        trunkRef.current.rotation.z = (1 - tf) * Math.sin(time) * 0.5;
        trunkRef.current.rotation.x = (1 - tf) * Math.cos(time) * 0.5;
        const trunkScale = THREE.MathUtils.lerp(0.1, 1, tf);
        trunkRef.current.scale.set(trunkScale, trunkScale, trunkScale);
    }

    // Animate Core Glow
    if (coreRef.current && lightRef.current) {
        const pulse = Math.sin(time * 2) * 0.5 + 1;
        const intensity = THREE.MathUtils.lerp(pulse, 2, tf);
        coreRef.current.scale.setScalar(intensity * 0.5);
        lightRef.current.intensity = intensity * 3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Foliage: Deep Emerald Needles with Cold Gold Sheen */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <tetrahedronGeometry args={[0.15, 0]} />
        <meshPhysicalMaterial 
            color={theme.colors.particlesPrimary} 
            roughness={0.4} 
            metalness={0.1}
            sheen={1}
            sheenColor="#C9B078"
            sheenRoughness={0.3}
            flatShading={false}
        />
      </instancedMesh>

      {/* 2. Trunk */}
      <mesh ref={trunkRef}>
          <cylinderGeometry args={[0.4, 1.4, 3.5, 8]} />
          <meshStandardMaterial 
             color="#1a1a0d" 
             roughness={0.8}
             metalness={0.1}
          />
      </mesh>

      {/* 3. Core Glow Sphere */}
      <mesh ref={coreRef} position={[0, 1, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color={theme.colors.bloom} transparent opacity={0.4} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1, 0]} distance={12} decay={2} color={theme.colors.bloom} />
    </group>
  );
};