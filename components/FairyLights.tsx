import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, ThemeConfig } from '../types';
import { getSpiralPoint, getRandomSpherePoint } from '../utils/geometry';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface FairyLightsProps {
  mode: TreeMode;
  theme: ThemeConfig;
}

export const FairyLights: React.FC<FairyLightsProps> = ({ mode, theme }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const COUNT = 300;

  // Generate spiral positions
  const { data, colorArray } = useMemo(() => {
    const items = [];
    const colors = [];
    const baseColor = new THREE.Color("#FFDDAC"); // Warm Amber
    const offColor = new THREE.Color("#F8F6F2"); // Frosted White

    const height = 11;
    const bottomRadius = 5.2;
    const turns = 6.5; // More turns than ribbon for density

    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      
      // Tree Position (Spiral)
      // Add a little noise to t so they aren't perfectly linear
      const tNoisy = t + (Math.random() - 0.5) * 0.02;
      const spiralPos = getSpiralPoint(tNoisy, height, bottomRadius, turns);
      
      // Push slightly inward to nestle in leaves, or outward to drape?
      // Let's vary radius slightly
      const rVar = 0.9 + Math.random() * 0.2;
      const treePos = new THREE.Vector3(spiralPos[0]*rVar, spiralPos[1], spiralPos[2]*rVar);

      // Scatter Position
      const scatterPos = getRandomSpherePoint(30);

      items.push({
        treePos,
        scatterPos: new THREE.Vector3(...scatterPos),
        phase: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 3
      });
      
      // Randomize color mix (60% Warm, 40% White)
      const c = Math.random() > 0.4 ? baseColor : offColor;
      colors.push(c.r, c.g, c.b);
    }
    return { data: items, colorArray: new Float32Array(colors) };
  }, []);

  const dummy = new THREE.Object3D();
  const targetFactor = useRef(0);

  // Apply colors
  useMemo(() => {
      if(meshRef.current) {
         // This runs on mount essentially 
         // but needs ref, handled in render usually via attributes or effect
      }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const goal = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    targetFactor.current = THREE.MathUtils.damp(targetFactor.current, goal, 1.0, delta);
    const tf = targetFactor.current;
    const time = state.clock.getElapsedTime();

    // Set colors once if needed, or just let them be static
    // We can't easily set colors inside useFrame efficiently without looping all
    // But we can update emissive intensity via scale or custom shader. 
    // For simplicity, we pulse size.

    data.forEach((item, i) => {
        const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, tf);
        
        // Twinkle Logic
        const twinkle = Math.sin(time * item.speed + item.phase);
        
        // Scale pulse for light ON/OFF feel
        const scaleBase = 0.08;
        const scale = scaleBase * (0.8 + 0.4 * twinkle) * tf; // Scale to 0 when scattered (optional, or just dim)

        dummy.position.copy(currentPos);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        
        // Use color array
        meshRef.current!.setColorAt(i, new THREE.Color(colorArray[i*3], colorArray[i*3+1], colorArray[i*3+2]));
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial 
        toneMapped={false}
        emissive="#FFDDAC"
        emissiveIntensity={3.0} // Very bright
      />
    </instancedMesh>
  );
};