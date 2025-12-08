import React, { useRef, useMemo, useState } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';
import { TreeMode, ThemeConfig } from '../types';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface FloatingPhotosProps {
  photos: string[];
  mode: TreeMode;
  theme: ThemeConfig;
}

// Deterministic pseudo-random number generator to keep layout consistent between renders
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const FloatingPhotos: React.FC<FloatingPhotosProps> = ({ photos, mode, theme }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Distribute photos in a disordered, gapped spiral around the tree
  const photoPositions = useMemo(() => {
    if (photos.length === 0) return [];
    
    return photos.map((url, i) => {
      // Use index as seed for consistent randomness per photo
      const r1 = seededRandom(i * 12.34);
      const r2 = seededRandom(i * 56.78);
      const r3 = seededRandom(i * 90.12);

      // Spiral Parameters
      const radiusBase = 7.5; // Wider radius to float outside the dense tree
      
      // Vertical spread: Adjusted to stay within tree bounds
      // Tree tip is at y=5.5. Base is at y=-5.5.
      const yMin = -4.5;
      const yMax = 4.0; // Lowered from 8 to 4.0 to ensure they don't exceed treetop
      
      // Normalized position (0 to 1) along the list
      const t = photos.length > 1 ? i / (photos.length - 1) : 0.5;
      
      // Base height with significant random offset (vertical gaps/disorder)
      let y = THREE.MathUtils.lerp(yMin, yMax, t);
      y += (r1 - 0.5) * 2.5; 

      // Hard clamp to ensure no photo exceeds the star/treetop height (approx 5.5)
      if (y > 5.2) y = 5.2;

      // Spiral angle: 
      // Large step ensures they are not too close horizontally
      // Add random angle offset for "messy" look
      const angle = i * 2.5 + (r2 - 0.5) * 0.8; 
      
      // Radius variation: In/Out scatter
      const radius = radiusBase + (r3 - 0.5) * 3.0;

      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      // Random tilt for organic, floating-in-space feel
      const rotX = (r2 - 0.5) * 0.4;
      // Face roughly towards center (angle + PI) but with loose variation
      const rotY = angle + Math.PI + (r1 - 0.5) * 0.6; 
      const rotZ = (r3 - 0.5) * 0.2;

      return { 
          url, 
          pos: [x, y, z] as [number, number, number], 
          rotation: [rotX, rotY, rotZ] as [number, number, number] 
      };
    });
  }, [photos]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Rotate the entire photo carousel very slowly
    groupRef.current.rotation.y += delta * 0.02;
  });

  const targetScale = mode === TreeMode.TREE_SHAPE ? 1 : 0;
  
  return (
    <group ref={groupRef}>
      {photoPositions.map((item, i) => (
        <PhotoFrame 
            key={item.url + i} 
            item={item} 
            targetScale={targetScale}
            theme={theme}
            index={i}
        />
      ))}
    </group>
  );
};

const PhotoFrame = ({ item, targetScale, theme, index }: { item: any, targetScale: number, theme: ThemeConfig, index: number }) => {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    
    // Track hover scale separately to dampen it
    const hoverScaleRef = useRef(1.0);

    useFrame((state, delta) => {
        if(!meshRef.current) return;
        
        // 1. Base Scale Transition (Tree Mode vs Scattered)
        const currentBaseScale = THREE.MathUtils.damp(meshRef.current.scale.x / hoverScaleRef.current, targetScale, 3, delta);
        
        // 2. Hover Scale Transition
        const targetHover = hovered ? 1.8 : 1.0;
        hoverScaleRef.current = THREE.MathUtils.damp(hoverScaleRef.current, targetHover, 4, delta);
        
        // Combine them
        const finalScale = currentBaseScale * hoverScaleRef.current;

        meshRef.current.scale.setScalar(finalScale);
        
        // Gentle bobbing independent of group rotation
        // Reduce bobbing speed slightly when hovered to make it easier to look at
        const bobSpeed = hovered ? 0.2 : 0.8;
        // Add index to phase so they don't bob in sync
        meshRef.current.position.y = item.pos[1] + Math.sin(state.clock.elapsedTime * bobSpeed + index * 13) * 0.15;
    });

    const handlePointerOver = (e: any) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (e: any) => {
        setHovered(false);
        document.body.style.cursor = 'auto';
    };

    return (
        <group 
            ref={meshRef} 
            position={item.pos} 
            rotation={item.rotation}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {/* The Frame/Plate sandwiched in the middle */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.7, 1.4, 0.04]} />
                <meshStandardMaterial 
                    color={theme.colors.ornaments} 
                    metalness={0.9} 
                    roughness={0.2}
                />
            </mesh>
            
            {/* Front Image */}
            <Image 
                url={item.url} 
                scale={[1.5, 1.2]} 
                transparent 
                opacity={1}
                toneMapped={false}
                position={[0, 0, 0.03]} // Slightly in front
            />

            {/* Back Image (Rotated 180 degrees) */}
            <Image 
                url={item.url} 
                scale={[1.5, 1.2]} 
                transparent 
                opacity={1}
                toneMapped={false}
                position={[0, 0, -0.03]} // Slightly behind
                rotation={[0, Math.PI, 0]}
            />

            {/* Inner Glow when hovered */}
            <pointLight distance={3} intensity={hovered ? 2.0 : 0} color={theme.colors.bloom} position={[0, 0, 0]} decay={2} />
        </group>
    );
}