import * as THREE from 'three';

// Random point inside a sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Point on a cone surface/volume (Tree shape) with layers
export const getConePoint = (height: number, bottomRadius: number): [number, number, number] => {
  // We sample 'd' (distance from tip) based on volume.
  // Lower power (< 0.33) pushes more points towards max d (the base).
  // 0.20 creates a very strong bottom-heavy distribution for lushness.
  const d = height * Math.pow(Math.random(), 0.20);
  
  // y ranges from height/2 (tip) to -height/2 (base).
  // tip is d=0. base is d=height.
  const y = (height / 2) - d;
  
  // Radius at this height (linear taper)
  const rAtHeight = (d / height) * bottomRadius;
  
  // Distribute inside the cone slice (solid tree)
  // sqrt(random) for uniform disk distribution
  const r = rAtHeight * Math.sqrt(Math.random());
  
  const theta = Math.random() * 2 * Math.PI;
  
  return [
    r * Math.cos(theta),
    y,
    r * Math.sin(theta)
  ];
};

// Get a point along a spiral for the ribbon
export const getSpiralPoint = (t: number, height: number, bottomRadius: number, turns: number): [number, number, number] => {
    // t goes from 0 (bottom) to 1 (top)
    const y = (t - 0.5) * height;
    const r = (1 - t) * bottomRadius; // Taper to top
    const angle = t * turns * 2 * Math.PI;
    
    return [
        r * Math.cos(angle),
        y,
        r * Math.sin(angle)
    ];
}