import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, ThemeConfig, ThemeId } from '../types';
import { getConePoint, getRandomSpherePoint } from '../utils/geometry';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface OrnamentsProps {
  mode: TreeMode;
  theme: ThemeConfig;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ mode, theme }) => {
  const baublesRef = useRef<THREE.InstancedMesh>(null);
  const giftsRef = useRef<THREE.InstancedMesh>(null);
  const bellsRef = useRef<THREE.InstancedMesh>(null);
  const crystalsRef = useRef<THREE.InstancedMesh>(null);
  const berriesRef = useRef<THREE.InstancedMesh>(null);

  // --- 1. Baubles (Spheres) ---
  const baubleData = useMemo(() => {
    const items = [];
    const colors = [];
    const count = 150; 
    
    const palette = [
        new THREE.Color(theme.colors.ornaments), // Champagne
        new THREE.Color(theme.colors.particlesPrimary), // Emerald
        new THREE.Color("#E8D7A6"), // Moon-Gold
        new THREE.Color("#F8F6F2"), // Frosted White
    ];

    for (let i = 0; i < count; i++) {
        const scatterPos = getRandomSpherePoint(30);
        const treePosRaw = getConePoint(11, 5.0);
        // Push slightly out
        const treePos = new THREE.Vector3(treePosRaw[0]*1.2, treePosRaw[1], treePosRaw[2]*1.2);
        
        const scale = (Math.random() * 0.4) + 0.3; // 0.3 to 0.7
        
        const color = palette[Math.floor(Math.random() * palette.length)];

        items.push({ scatterPos: new THREE.Vector3(...scatterPos), treePos, scale, phase: Math.random()*10 });
        colors.push(color.r, color.g, color.b);
    }
    return { items, colors: new Float32Array(colors) };
  }, [theme]);

  // --- 2. Gifts (Boxes) ---
  const giftData = useMemo(() => {
    const items = [];
    const colors = [];
    const count = 40;
    
    const palette = [
        new THREE.Color("#B02424"), // Ruby Accents
        new THREE.Color("#E8D7A6"), // Moon-Gold
        new THREE.Color("#0B4036"), // Deep Emerald
    ];

    for (let i = 0; i < count; i++) {
        const scatterPos = getRandomSpherePoint(30);
        const treePosRaw = getConePoint(11, 5.0);
        // Bias towards bottom
        if (Math.random() > 0.3) treePosRaw[1] -= 2; 
        
        const treePos = new THREE.Vector3(treePosRaw[0]*1.3, treePosRaw[1], treePosRaw[2]*1.3);
        
        const scale = 0.4 + Math.random() * 0.3;
        const color = palette[Math.floor(Math.random() * palette.length)];
        
        items.push({ 
            scatterPos: new THREE.Vector3(...scatterPos), 
            treePos, 
            scale, 
            rotSpeed: Math.random() - 0.5 
        });
        colors.push(color.r, color.g, color.b);
    }
    return { items, colors: new Float32Array(colors) };
  }, []);

  // --- 3. Bells (Cones) ---
  const bellData = useMemo(() => {
    const items = [];
    const count = 50;
    const color = new THREE.Color("#D9C28F"); // Champagne Gold

    for (let i = 0; i < count; i++) {
        const scatterPos = getRandomSpherePoint(30);
        const treePosRaw = getConePoint(11, 5.0);
        const treePos = new THREE.Vector3(treePosRaw[0]*1.2, treePosRaw[1], treePosRaw[2]*1.2);
        
        items.push({ 
            scatterPos: new THREE.Vector3(...scatterPos), 
            treePos, 
            scale: 0.25 + Math.random() * 0.1,
            swaySpeed: 2 + Math.random()
        });
    }
    return { items, color };
  }, []);

  // --- 4. Crystals (Octahedrons/Diamonds) ---
  const crystalData = useMemo(() => {
    const items = [];
    const count = 60;
    const color = new THREE.Color("#F8F6F2"); // Frosted White

    for (let i = 0; i < count; i++) {
        const scatterPos = getRandomSpherePoint(30);
        const treePosRaw = getConePoint(11, 5.0);
        const treePos = new THREE.Vector3(treePosRaw[0]*1.25, treePosRaw[1], treePosRaw[2]*1.25);
        
        items.push({ 
            scatterPos: new THREE.Vector3(...scatterPos), 
            treePos, 
            scale: 0.2 + Math.random() * 0.2,
            rot: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0)
        });
    }
    return { items, color };
  }, []);

  // --- 5. Berries (Tiny Clusters) ---
  const berryData = useMemo(() => {
    const items = [];
    const colors = [];
    const count = 300; // Lots of tiny berries
    const color = new THREE.Color("#B02424"); // Ruby Accents

    for (let i = 0; i < count; i++) {
        const scatterPos = getRandomSpherePoint(30);
        const treePosRaw = getConePoint(11, 5.0);
        const treePos = new THREE.Vector3(treePosRaw[0]*1.1, treePosRaw[1], treePosRaw[2]*1.1);
        
        items.push({ 
            scatterPos: new THREE.Vector3(...scatterPos), 
            treePos, 
            scale: 0.08 + Math.random() * 0.05
        });
        colors.push(color.r, color.g, color.b);
    }
    return { items, colors: new Float32Array(colors) };
  }, []);


  // --- Layout Effects for Color ---
  useLayoutEffect(() => {
     if(baublesRef.current) {
         baubleData.items.forEach((_, i) => {
             baublesRef.current!.setColorAt(i, new THREE.Color(baubleData.colors[i*3], baubleData.colors[i*3+1], baubleData.colors[i*3+2]));
         });
         baublesRef.current.instanceColor!.needsUpdate = true;
     }
     if(giftsRef.current) {
         giftData.items.forEach((_, i) => {
             giftsRef.current!.setColorAt(i, new THREE.Color(giftData.colors[i*3], giftData.colors[i*3+1], giftData.colors[i*3+2]));
         });
         giftsRef.current.instanceColor!.needsUpdate = true;
     }
     if(berriesRef.current) {
         berryData.items.forEach((_, i) => {
             berriesRef.current!.setColorAt(i, new THREE.Color(berryData.colors[i*3], berryData.colors[i*3+1], berryData.colors[i*3+2]));
         });
         berriesRef.current.instanceColor!.needsUpdate = true;
     }
     // Bells and Crystals single color
  }, [baubleData, giftData, berryData]);


  const dummy = new THREE.Object3D();
  const targetFactor = useRef(0);

  useFrame((state, delta) => {
    const goal = mode === TreeMode.TREE_SHAPE ? 1 : 0;
    targetFactor.current = THREE.MathUtils.damp(targetFactor.current, goal, 1.2, delta);
    const tf = targetFactor.current;
    const time = state.clock.getElapsedTime();

    // 1. Baubles
    if (baublesRef.current) {
        baubleData.items.forEach((item, i) => {
            const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, tf);
            dummy.position.copy(currentPos);
            dummy.scale.setScalar(item.scale * tf);
            dummy.rotation.y = time * 0.5 + item.phase;
            dummy.updateMatrix();
            baublesRef.current!.setMatrixAt(i, dummy.matrix);
        });
        baublesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Gifts
    if (giftsRef.current) {
        giftData.items.forEach((item, i) => {
            const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, tf);
            dummy.position.copy(currentPos);
            dummy.scale.setScalar(item.scale * tf);
            dummy.rotation.x = time * item.rotSpeed;
            dummy.rotation.y = time * item.rotSpeed;
            dummy.updateMatrix();
            giftsRef.current!.setMatrixAt(i, dummy.matrix);
        });
        giftsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Bells
    if (bellsRef.current) {
        bellData.items.forEach((item, i) => {
            const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, tf);
            dummy.position.copy(currentPos);
            dummy.scale.setScalar(item.scale * tf);
            // Swaying motion
            dummy.rotation.z = Math.sin(time * item.swaySpeed + i) * 0.2; 
            dummy.updateMatrix();
            bellsRef.current!.setMatrixAt(i, dummy.matrix);
        });
        bellsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Crystals
    if (crystalsRef.current) {
        crystalData.items.forEach((item, i) => {
            const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, tf);
            dummy.position.copy(currentPos);
            dummy.scale.setScalar(item.scale * tf);
            dummy.rotation.copy(item.rot);
            dummy.rotation.y += delta * 0.5; // Slow spin
            dummy.updateMatrix();
            crystalsRef.current!.setMatrixAt(i, dummy.matrix);
        });
        crystalsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 5. Berries
    if (berriesRef.current) {
        berryData.items.forEach((item, i) => {
            const currentPos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, tf);
            dummy.position.copy(currentPos);
            dummy.scale.setScalar(item.scale * tf);
            dummy.updateMatrix();
            berriesRef.current!.setMatrixAt(i, dummy.matrix);
        });
        berriesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
        {/* Baubles */}
        <instancedMesh ref={baublesRef} args={[undefined, undefined, baubleData.items.length]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial 
                roughness={0.1}
                metalness={0.8}
                clearcoat={1}
                clearcoatRoughness={0.1}
            />
        </instancedMesh>

        {/* Gifts */}
        <instancedMesh ref={giftsRef} args={[undefined, undefined, giftData.items.length]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial roughness={0.3} metalness={0.2} />
        </instancedMesh>

        {/* Bells */}
        <instancedMesh ref={bellsRef} args={[undefined, undefined, bellData.items.length]}>
            <coneGeometry args={[0.5, 1.2, 16]} />
            <meshStandardMaterial color={bellData.color} roughness={0.2} metalness={0.9} />
        </instancedMesh>

        {/* Crystals */}
        <instancedMesh ref={crystalsRef} args={[undefined, undefined, crystalData.items.length]}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial 
                color={crystalData.color} 
                transmission={0.6}
                opacity={0.9}
                metalness={0.1}
                roughness={0}
                ior={1.5}
                thickness={2.0}
            />
        </instancedMesh>

        {/* Berries */}
        <instancedMesh ref={berriesRef} args={[undefined, undefined, berryData.items.length]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial roughness={0.5} metalness={0.1} />
        </instancedMesh>
    </group>
  );
};