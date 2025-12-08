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

interface RibbonProps {
  mode: TreeMode;
  theme: ThemeConfig;
}

// Helper to generate a wavy spiral curve segment
const createWavySpiralCurve = (
  startT: number, 
  endT: number, 
  height: number, 
  radius: number, 
  turns: number
): { curve: THREE.CatmullRomCurve3, center: THREE.Vector3 } => {
  const points: THREE.Vector3[] = [];
  const steps = 30; // Resolution of the curve
  
  // Collect points in World Space (relative to tree center)
  const tempPoints: THREE.Vector3[] = [];
  const center = new THREE.Vector3();

  for (let i = 0; i <= steps; i++) {
    const t = THREE.MathUtils.lerp(startT, endT, i / steps);
    const [x, y, z] = getSpiralPoint(t, height, radius, turns);
    
    // Add "Subtle noise waves" - sine wave offsets
    const noiseFreq = 15;
    const noiseAmp = 0.15;
    const waveX = Math.sin(t * noiseFreq) * noiseAmp;
    const waveY = Math.cos(t * noiseFreq * 1.5) * noiseAmp;
    const waveZ = Math.sin(t * noiseFreq * 0.5) * noiseAmp;

    const vec = new THREE.Vector3(x + waveX, y + waveY, z + waveZ);
    tempPoints.push(vec);
    center.add(vec);
  }

  // Calculate Centroid
  center.divideScalar(tempPoints.length);

  // Create Curve relative to Centroid (Local Space)
  // This allows us to move the Mesh to 'center' and rotate it easily
  points.push(...tempPoints.map(p => p.clone().sub(center)));

  return {
    curve: new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5),
    center
  };
};

const RibbonSegment = ({ 
  mode, 
  theme, 
  segmentData 
}: { 
  mode: TreeMode, 
  theme: ThemeConfig, 
  segmentData: any 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetFactor = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 1. Morph Logic (Scatter <-> Tree)
    const goal = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    targetFactor.current = THREE.MathUtils.damp(targetFactor.current, goal, 1.0, delta);
    const tf = targetFactor.current;
    const time = state.clock.getElapsedTime();

    // 2. Position Interpolation
    // Lerp between random scatter position and the calculated tree spiral position
    meshRef.current.position.lerpVectors(segmentData.scatterPos, segmentData.treePos, tf);

    // 3. Rotation & Drift
    // Slow rotation (0.1x speed)
    // When in tree shape, it stays mostly aligned but drifts slightly
    // When scattered, it tumbles
    
    // Base orientation
    const targetRot = new THREE.Euler(0, time * 0.05, 0); // Very slow orbit
    const scatterRot = new THREE.Euler(
        segmentData.randomRot.x + time * 0.2, 
        segmentData.randomRot.y + time * 0.2, 
        segmentData.randomRot.z
    );

    meshRef.current.rotation.x = THREE.MathUtils.lerp(scatterRot.x, 0, tf);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(scatterRot.y, time * 0.02, tf); // Extremely slow rotation
    meshRef.current.rotation.z = THREE.MathUtils.lerp(scatterRot.z, 0, tf);

    // 4. "Slightly Drifting Edges"
    // Gentle bobbing
    const drift = Math.sin(time * 0.5 + segmentData.phase) * 0.05;
    meshRef.current.position.y += drift;
    
    // 5. Scale Transition
    const scale = THREE.MathUtils.lerp(0.1, 1, tf);
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      {/* Thinner: radius 0.04 (60% slimmer than 0.1) */}
      <tubeGeometry args={[segmentData.curve, 64, 0.04, 8, false]} />
      <meshPhysicalMaterial 
        color="#D9C28F" // Champagne Gold
        emissive="#D9C28F"
        emissiveIntensity={0.3} 
        roughness={0.2}
        metalness={0.9}
        transparent={true}
        opacity={0.8}
        side={THREE.DoubleSide}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
};

export const Ribbon: React.FC<RibbonProps> = ({ mode, theme }) => {
  const SEGMENT_COUNT = 8;

  const segments = useMemo(() => {
    const arr = [];
    const height = 11;
    const radius = 5.2; // Slightly wider than tree
    const turns = 3.5;
    
    // Break into segments with gaps
    // Total T from 0 to 1
    // Each segment covers roughly 1/Count, minus a small gap
    const segmentSize = 1 / SEGMENT_COUNT;
    const gap = 0.02; 

    for (let i = 0; i < SEGMENT_COUNT; i++) {
        const tStart = i * segmentSize;
        const tEnd = (i + 1) * segmentSize - gap;

        // Generate geometry data
        const { curve, center } = createWavySpiralCurve(tStart, tEnd, height, radius, turns);
        
        // Random scatter data
        const scatterPos = new THREE.Vector3(...getRandomSpherePoint(35));
        const randomRot = new THREE.Euler(
            Math.random() * Math.PI, 
            Math.random() * Math.PI, 
            Math.random() * Math.PI
        );

        arr.push({
            curve,
            treePos: center,
            scatterPos,
            randomRot,
            phase: Math.random() * Math.PI * 2
        });
    }
    return arr;
  }, []);

  return (
    <group>
      {segments.map((seg, i) => (
        <RibbonSegment 
            key={i} 
            mode={mode} 
            theme={theme} 
            segmentData={seg} 
        />
      ))}
    </group>
  );
};