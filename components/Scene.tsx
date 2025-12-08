import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TreeMode, ThemeConfig } from '../types';
import { ArixTree } from './ArixTree';
import { Ornaments } from './Ornaments';
import { Ribbon } from './Ribbon';
import { Star } from './Star';
import { AtmosphereCubes } from './AtmosphereCubes';
import { FairyLights } from './FairyLights';
import { FloatingPhotos } from './FloatingPhotos';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  mode: TreeMode;
  theme: ThemeConfig;
  photos: string[];
}

export const Scene: React.FC<SceneProps> = ({ mode, theme, photos }) => {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.enablePan = false;
      controls.minPolarAngle = Math.PI / 2.2;
      controls.maxPolarAngle = Math.PI / 1.7;
      controls.minDistance = 8;
      controls.maxDistance = 25;
      controls.autoRotateSpeed = 0.8;
    }
  }, []);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = mode === TreeMode.TREE_SHAPE;
    }
  }, [mode]);

  return (
    <Canvas gl={{ antialias: false, toneMappingExposure: 1.1 }}>
      <PerspectiveCamera makeDefault position={[0, 1, 14]} fov={45} />
      
      <OrbitControls 
        ref={controlsRef}
      />

      {/* --- LIGHTING: Warm, Bright, Festive --- */}
      <ambientLight intensity={1.3} color="#FFDDAC" />
      
      <spotLight 
        position={[15, 10, 5]} 
        angle={0.6} 
        penumbra={1} 
        intensity={2.8} 
        color="#FFDDAC" 
        castShadow
      />
      
      <spotLight 
        position={[-15, 2, 8]} 
        intensity={1.8} 
        color="#E8D7A6" 
      />
      
      <pointLight position={[0, 5, -8]} intensity={2.2} color="#F8F6F2" distance={20} />

      {/* --- ATMOSPHERE --- */}
      <Stars radius={80} depth={40} count={1000} factor={3} saturation={0} fade speed={0.5} />
      
      {/* --- INCREASED FESTIVE PARTICLES --- */}
      
      {/* 1. Snowflakes (White, Translucent, Floating) */}
      {/* Increased count from 200 to 350 for denser snowfall */}
      <Sparkles 
        count={350} 
        scale={25} 
        size={2} 
        speed={0.15} 
        opacity={0.6} 
        color="#F8F6F2" 
      />

      {/* 2. Tiny Golden Sparkles (Drifting slowly, magic dust) */}
      {/* Increased count from 300 to 500 */}
      <Sparkles 
        count={500} 
        scale={15} 
        size={1.0} 
        speed={0.08} 
        opacity={0.8} 
        color="#FFDDAC" 
      />

      {/* 3. Subtle Emerald Particles (Volume/Depth) */}
      {/* Increased count from 100 to 200 */}
      <Sparkles 
        count={200} 
        scale={30} 
        size={3} 
        speed={0.2} 
        opacity={0.3} 
        color="#0B4036" 
      />

      <Suspense fallback={null}>
        <group position={[0, -1, 0]}>
           <ArixTree mode={mode} theme={theme} />
           <Ribbon mode={mode} theme={theme} />
           <FairyLights mode={mode} theme={theme} />
           <Ornaments mode={mode} theme={theme} />
           <Star mode={mode} theme={theme} />
           <AtmosphereCubes mode={mode} theme={theme} />
           <FloatingPhotos mode={mode} theme={theme} photos={photos} />
        </group>
        
        <Environment resolution={512}>
            <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial color="#F8F6F2" toneMapped={false} />
            </mesh>
            <mesh position={[10, 0, 10]} rotation={[0, -Math.PI / 4, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial color="#FFDDAC" toneMapped={false} />
            </mesh>
        </Environment>
      </Suspense>

      {/* --- POST PROCESSING: Clean & Sharp --- */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={0.9} 
            mipmapBlur 
            intensity={0.3} 
            radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
};