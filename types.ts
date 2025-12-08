export enum TreeMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export enum ThemeId {
  AURORA_GREEN = 'AURORA_GREEN',
  LUXURY_GOLD = 'LUXURY_GOLD',
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    fog: string;
    particlesPrimary: string;
    particlesSecondary: string;
    ornaments: string;
    bloom: string;
    wireframe: string;
  };
}

export interface ParticleData {
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  speed: number;
  offset: number;
}