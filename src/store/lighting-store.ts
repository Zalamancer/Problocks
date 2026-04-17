import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Roblox-inspired lighting/atmosphere config.
 *
 * Field names mirror the Roblox `Lighting` service + `Atmosphere` instance so
 * tweaks in the panel map 1:1 to values you'd set in Roblox Studio. The
 * translation into Three.js is handled in BuildingCanvas.tsx:
 *
 *   Roblox `Brightness` (0..5, default 2)   → DirectionalLight.intensity
 *   Roblox `Ambient` (shadow side tint, RGB)→ HemisphereLight ground color
 *   Roblox `OutdoorAmbient` (sky fill, RGB) → HemisphereLight sky color  +  AmbientLight tint
 *   Roblox `ColorShift_Top` (sunlit tint)   → DirectionalLight.color multiply
 *   Roblox `ColorShift_Bottom` (shadow tint)→ AmbientLight.color multiply
 *   Roblox `ExposureCompensation` (-5..5)   → renderer.toneMappingExposure = 2^x
 *   Roblox `ClockTime` (0..24, default 14)  → sun azimuth + altitude
 *   Roblox `EnvironmentDiffuseScale` (0..1) → hemisphere intensity multiplier
 *
 * Atmosphere (Roblox Atmosphere instance):
 *   `Density`  (0..1, def 0.3)  → fog density (FogExp2)
 *   `Offset`   (0..1, def 0.25) → fog offset from camera (sim by scene.fog.near for linear, ignored for exp2)
 *   `Color`    (sky haze, RGB)  → fog + sky tint
 *   `Decay`    (sun color, RGB) → directional light color secondary tint
 *   `Glare`    (0..10)          → exposure boost approximation
 *   `Haze`     (0..10)          → fog density boost
 */

export interface RGB {
  r: number; // 0..255
  g: number;
  b: number;
}

export interface LightingConfig {
  /** Color of shadow side when no sky fill. Roblox default (0,0,0). */
  ambient: RGB;
  /** Sky-side ambient / fill. Roblox default (127,127,127). */
  outdoorAmbient: RGB;
  /** Sun intensity. Roblox default 2. */
  brightness: number;
  /** Tint added to sunlit surfaces. Default (0,0,0). */
  colorShiftTop: RGB;
  /** Tint added to shadowed surfaces. Default (0,0,0). */
  colorShiftBottom: RGB;
  /** -5..5, 0 = neutral. */
  exposureCompensation: number;
  /** 0..24 hours. Default 14 (2pm). Sun moves across the sky. */
  clockTime: number;
  /** 0..1. Default 1 on Future lighting. Scales hemisphere strength. */
  environmentDiffuseScale: number;
  /** 0..1. Not simulated yet, kept for API parity. */
  environmentSpecularScale: number;
  /** Enable shadow casting (master switch, overrides quality's shadow flag when false). */
  globalShadows: boolean;
  /** Background sky color (replaces skybox for now). */
  skyColor: RGB;

  /** --- Atmosphere (Roblox Atmosphere instance) --- */
  atmosphere: {
    /** 0..1. Fog/haze density. Roblox default 0.3. */
    density: number;
    /** 0..1. Where fog starts relative to camera. Roblox default 0.25. */
    offset: number;
    /** Sky/haze color. Roblox default (199,199,199). */
    color: RGB;
    /** Sun decay color tint. Roblox default (106,112,125). */
    decay: RGB;
    /** 0..10. Sun glare bloom approximation. */
    glare: number;
    /** 0..10. Extra haze density. */
    haze: number;
  };
}

/** Baseline matching Roblox Studio's "Future" default ambience. */
export const ROBLOX_DEFAULT: LightingConfig = {
  ambient: { r: 0, g: 0, b: 0 },
  outdoorAmbient: { r: 127, g: 127, b: 127 },
  brightness: 2,
  colorShiftTop: { r: 0, g: 0, b: 0 },
  colorShiftBottom: { r: 0, g: 0, b: 0 },
  exposureCompensation: 0,
  clockTime: 14,
  environmentDiffuseScale: 1,
  environmentSpecularScale: 1,
  globalShadows: true,
  skyColor: { r: 124, g: 200, b: 255 },
  atmosphere: {
    density: 0.3,
    offset: 0.25,
    color: { r: 199, g: 199, b: 199 },
    decay: { r: 106, g: 112, b: 125 },
    glare: 0,
    haze: 0,
  },
};

/**
 * Punchy "kid-friendly" preset — saturated, high contrast, minimal haze.
 * Good starting point when the goal is Roblox cartoon worlds (Brookhaven,
 * Adopt Me), not cinematic realistic scenes.
 */
export const ROBLOX_POPPY: LightingConfig = {
  ambient: { r: 0, g: 0, b: 0 },
  outdoorAmbient: { r: 90, g: 110, b: 140 },
  brightness: 3,
  colorShiftTop: { r: 15, g: 10, b: 0 },
  colorShiftBottom: { r: 0, g: 0, b: 0 },
  exposureCompensation: 0.25,
  clockTime: 14,
  environmentDiffuseScale: 0.6,
  environmentSpecularScale: 1,
  globalShadows: true,
  skyColor: { r: 90, g: 195, b: 255 },
  atmosphere: {
    density: 0.05,
    offset: 0.25,
    color: { r: 220, g: 230, b: 240 },
    decay: { r: 120, g: 140, b: 170 },
    glare: 0.5,
    haze: 0,
  },
};

/**
 * Soft/overcast preset. Lower contrast, uniform sky fill.
 */
export const ROBLOX_SOFT: LightingConfig = {
  ambient: { r: 20, g: 20, b: 30 },
  outdoorAmbient: { r: 180, g: 180, b: 190 },
  brightness: 1.4,
  colorShiftTop: { r: 0, g: 0, b: 0 },
  colorShiftBottom: { r: 0, g: 0, b: 0 },
  exposureCompensation: -0.15,
  clockTime: 12,
  environmentDiffuseScale: 1,
  environmentSpecularScale: 1,
  globalShadows: true,
  skyColor: { r: 200, g: 215, b: 230 },
  atmosphere: {
    density: 0.45,
    offset: 0.3,
    color: { r: 210, g: 215, b: 220 },
    decay: { r: 130, g: 140, b: 155 },
    glare: 0,
    haze: 0.4,
  },
};

export type LightingPreset = 'roblox-default' | 'roblox-poppy' | 'roblox-soft' | 'custom';

export const PRESETS: Record<Exclude<LightingPreset, 'custom'>, LightingConfig> = {
  'roblox-default': ROBLOX_DEFAULT,
  'roblox-poppy': ROBLOX_POPPY,
  'roblox-soft': ROBLOX_SOFT,
};

interface LightingStore {
  preset: LightingPreset;
  config: LightingConfig;
  panelOpen: boolean;
  setPreset: (p: Exclude<LightingPreset, 'custom'>) => void;
  setField: <K extends keyof LightingConfig>(key: K, value: LightingConfig[K]) => void;
  setAtmosphereField: <K extends keyof LightingConfig['atmosphere']>(
    key: K,
    value: LightingConfig['atmosphere'][K],
  ) => void;
  setPanelOpen: (open: boolean) => void;
  reset: () => void;
}

export const useLightingStore = create<LightingStore>()(
  persist(
    (set) => ({
      preset: 'roblox-poppy',
      config: ROBLOX_POPPY,
      panelOpen: false,
      setPreset: (p) => set({ preset: p, config: PRESETS[p] }),
      setField: (key, value) =>
        set((s) => ({ preset: 'custom', config: { ...s.config, [key]: value } })),
      setAtmosphereField: (key, value) =>
        set((s) => ({
          preset: 'custom',
          config: { ...s.config, atmosphere: { ...s.config.atmosphere, [key]: value } },
        })),
      setPanelOpen: (panelOpen) => set({ panelOpen }),
      reset: () => set({ preset: 'roblox-poppy', config: ROBLOX_POPPY }),
    }),
    { name: 'problocks-lighting-v1' },
  ),
);

/** Utility: convert RGB{0..255} to hex number for Three.js. */
export function rgbToHex(c: RGB): number {
  return (
    (Math.round(c.r) << 16) |
    (Math.round(c.g) << 8) |
    Math.round(c.b)
  );
}

/** Blend two RGB values in linear 0..255 space. */
export function addRgb(a: RGB, b: RGB): RGB {
  return {
    r: Math.min(255, a.r + b.r),
    g: Math.min(255, a.g + b.g),
    b: Math.min(255, a.b + b.b),
  };
}
