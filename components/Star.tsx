import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, ThemeConfig } from '../types';
import { getRandomSpherePoint } from '../utils/geometry';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface StarProps {
  mode: TreeMode;
  theme: ThemeConfig;
}

export const Star: React.FC<StarProps> = ({ mode, theme }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Positions for state machine
  const { scatterPos, treePos } = useMemo(() => {
    return {
      scatterPos: new THREE.Vector3(...getRandomSpherePoint(25)), // Increased spread
      treePos: new THREE.Vector3(0, 5.5, 0) // Place at the very top of the tree
    };
  }, []);

  // Generate 5-pointed star shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.38;
    
    for(let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const a = (i / (points * 2)) * Math.PI * 2;
        // Rotate to point upward
        const x = Math.cos(a + Math.PI/2) * r;
        const y = Math.sin(a + Math.PI/2) * r;
        
        if(i === 0) s.moveTo(x, y);
        else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.05,
    bevelSegments: 3
  }), []);

  const targetFactor = useRef(0);

  useFrame((state, delta) => {
    if(!meshRef.current) return;

    // Morph Logic
    const goal = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    targetFactor.current = THREE.MathUtils.damp(targetFactor.current, goal, 1.5, delta);
    const tf = targetFactor.current;
    const time = state.clock.getElapsedTime();

    // Position Interpolation
    meshRef.current.position.lerpVectors(scatterPos, treePos, tf);

    // Rotation Animation
    if (tf < 0.8) {
        // Tumbling in space when scattered
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.3;
        meshRef.current.rotation.z += delta * 0.2;
    } else {
        // Stabilize and slow spin when formed
        const currentRot = meshRef.current.rotation;
        currentRot.x = THREE.MathUtils.lerp(currentRot.x, 0, delta * 2);
        currentRot.z = THREE.MathUtils.lerp(currentRot.z, 0, delta * 2);
        currentRot.y += delta * 0.5; // Steady spin
    }

    // Scale Animation (Pop in/out)
    const scale = THREE.MathUtils.lerp(0.5, 1.5, tf); // Small when scattered, big on tree
    meshRef.current.scale.setScalar(scale);

    // Pulsing Emission
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        const pulse = (Math.sin(time * 2.5) + 1) * 0.5; // 0 to 1
        meshRef.current.material.emissiveIntensity = 0.5 + pulse * 2.0; // Pulse between 0.5 and 2.5
    }
  });

  return (
    <mesh ref={meshRef}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
            color={theme.colors.ornaments}
            emissive={theme.colors.ornaments}
            roughness={0.1}
            metalness={1.0}
            toneMapped={false}
        />
        {/* Glow Light for the Star */}
        <pointLight 
            distance={8} 
            intensity={3} 
            color={theme.colors.bloom} 
            decay={2} 
        />
    </mesh>
  );
};