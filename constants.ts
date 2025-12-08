import { ThemeConfig, ThemeId } from './types';

export const PARTICLE_COUNT = 14000; // Increased by ~25% for density
export const ORNAMENT_COUNT = 300; // Increased base count

export const THEMES: Record<ThemeId, ThemeConfig> = {
  [ThemeId.AURORA_GREEN]: {
    id: ThemeId.AURORA_GREEN,
    name: "Festive Emerald",
    colors: {
      background: "#051F1A", 
      fog: "#051810", 
      particlesPrimary: "#0B4036", // Deep Emerald
      particlesSecondary: "#E8D7A6", // Moon-Gold
      ornaments: "#D9C28F", // Champagne Gold
      bloom: "#FFDDAC", // Warm Amber
      wireframe: "#B02424" // Subtle Ruby Accents
    }
  },
  [ThemeId.LUXURY_GOLD]: {
    id: ThemeId.LUXURY_GOLD,
    name: "Royal Gold",
    colors: {
      background: "#050200",
      fog: "#1f140a",
      particlesPrimary: "#b8860b", 
      particlesSecondary: "#ffd700",
      ornaments: "#f2e5c1",
      bloom: "#ffaa00",
      wireframe: "#800000"
    }
  }
};