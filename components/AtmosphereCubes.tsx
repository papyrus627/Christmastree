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

interface AtmosphereCubesProps {
  mode: TreeMode;
  theme: ThemeConfig;
}

export const AtmosphereCubes: React.FC<AtmosphereCubesProps> = ({ mode, theme }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const COUNT = 100;

  // Generate random data for background cubes
  const { data, colorArray } = useMemo(() => {
    const items = [];
    const colors = [];
    const c = new THREE.Color(theme.colors.wireframe);

    for (let i = 0; i < COUNT; i++) {
      // Scatter widely
      const pos = getRandomSpherePoint(40); 
      items.push({
        position: new THREE.Vector3(...pos),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.2 + 0.05,
      });
      colors.push(c.r, c.g, c.b);
    }
    return { data: items, colorArray: new Float32Array(colors) };
  }, [theme]);

  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    data.forEach((item, i) => {
      // Gentle floating animation
      dummy.position.copy(item.position);
      dummy.position.y += Math.sin(time * item.speed + i) * 0.05;
      
      dummy.rotation.copy(item.rotation);
      dummy.rotation.x += delta * item.speed;
      dummy.rotation.y += delta * item.speed;
      
      // Slight scale pulse
      const pulse = Math.sin(time * 0.5 + i) * 0.1 + 1;
      dummy.scale.setScalar(item.scale * pulse);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={theme.colors.wireframe}
        transparent
        opacity={0.15} // Subtle ghost effect
        roughness={0.1}
        metalness={0.8}
        wireframe={true} // Tech/Architectural feel
      />
    </instancedMesh>
  );
};
