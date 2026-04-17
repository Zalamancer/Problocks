import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Rendering quality tier. Drives shadow/material/pixel-ratio/UI-blur decisions
 * across BuildingCanvas, the game-engine renderer3d, and UI chrome.
 *
 * - low:    target Celeron N4000 / Chromebooks / integrated GPUs
 * - medium: older laptops, modest integrated GPUs
 * - high:   discrete GPU / modern silicon (current defaults)
 * - custom: any individual setting overridden via setSetting()
 */
export type QualityTier = 'low' | 'medium' | 'high' | 'custom';

export interface QualitySettings {
  /** Enable Three.js shadow map rendering (master switch) */
  shadows: boolean;
  /** 'pcf-soft' (expensive), 'basic' (hard), or 'off' */
  shadowType: 'pcf-soft' | 'basic' | 'off';
  /** Shadow map resolution per axis (e.g. 512, 1024, 2048) */
  shadowMapSize: number;
  /** WebGL antialiasing */
  antialias: boolean;
  /** Max devicePixelRatio cap */
  maxPixelRatio: number;
  /** Use PBR (MeshStandardMaterial) vs cheaper Lambert */
  pbrMaterials: boolean;
  /** Backdrop blur class modifier for glass panels. 'none' = opaque bg instead. */
  backdropBlur: 'xl' | 'md' | 'none';
  /** Reduce geometry subdivision (sphere/cylinder segments) */
  lowPolyPrimitives: boolean;
  /** Enable CSS transitions on React Flow / list items */
  uiTransitions: boolean;
}

/**
 * Concrete numbers per preset. `custom` is not listed here — it's a marker
 * tier that preserves whatever `settings` the user has hand-tweaked.
 */
export const QUALITY_PRESETS: Record<Exclude<QualityTier, 'custom'>, QualitySettings> = {
  low: {
    shadows: false,
    shadowType: 'off',
    shadowMapSize: 512,
    antialias: false,
    maxPixelRatio: 1,
    pbrMaterials: false,
    backdropBlur: 'none',
    lowPolyPrimitives: true,
    uiTransitions: false,
  },
  medium: {
    shadows: true,
    shadowType: 'basic',
    shadowMapSize: 512,
    antialias: false,
    maxPixelRatio: 1.5,
    pbrMaterials: true,
    backdropBlur: 'md',
    lowPolyPrimitives: true,
    uiTransitions: true,
  },
  high: {
    shadows: true,
    shadowType: 'pcf-soft',
    shadowMapSize: 2048,
    antialias: true,
    maxPixelRatio: 2,
    pbrMaterials: true,
    backdropBlur: 'xl',
    lowPolyPrimitives: false,
    uiTransitions: true,
  },
};

/**
 * Best-effort auto-detection of a suitable tier. Runs once on first mount;
 * user's explicit choice overrides this forever after.
 */
export function detectQualityTier(): Exclude<QualityTier, 'custom'> {
  if (typeof window === 'undefined') return 'high';

  // Core-count heuristic: Celeron N4000 = 2 cores, most Chromebooks 2-4.
  const cores = navigator.hardwareConcurrency ?? 4;

  // Device memory (Chrome only, in GB, rounded)
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  // GPU renderer string via WEBGL_debug_renderer_info when available.
  let gpu = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        gpu = String((gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '').toLowerCase();
      }
    }
  } catch {
    // ignore
  }

  const integratedHints = ['intel', 'uhd', 'hd graphics', 'swiftshader', 'llvmpipe', 'mali', 'adreno 3', 'adreno 4', 'apple gpu'];
  const isIntegrated = integratedHints.some((h) => gpu.includes(h));

  if (cores <= 2 || deviceMemory <= 4) return 'low';
  if (isIntegrated || cores <= 4 || deviceMemory <= 8) return 'medium';
  return 'high';
}

interface QualityStore {
  tier: QualityTier;
  /** Whether the current tier was picked by the user (true) or auto-detected (false) */
  userPicked: boolean;
  settings: QualitySettings;

  /** Apply a preset tier — overwrites every individual setting. */
  setTier: (tier: Exclude<QualityTier, 'custom'>) => void;
  /** Override a single setting; flips the tier to 'custom'. */
  setSetting: <K extends keyof QualitySettings>(key: K, value: QualitySettings[K]) => void;
  /** Re-run hardware detection and apply the recommended preset. */
  resetToAutoDetected: () => void;
}

export const useQualityStore = create<QualityStore>()(
  persist(
    (set) => ({
      tier: 'high',
      userPicked: false,
      settings: QUALITY_PRESETS.high,
      setTier: (tier) => set({ tier, userPicked: true, settings: QUALITY_PRESETS[tier] }),
      setSetting: (key, value) =>
        set((s) => ({
          tier: 'custom',
          userPicked: true,
          settings: { ...s.settings, [key]: value },
        })),
      resetToAutoDetected: () => {
        const tier = detectQualityTier();
        set({ tier, userPicked: false, settings: QUALITY_PRESETS[tier] });
      },
    }),
    {
      name: 'problocks-quality-v1',
      onRehydrateStorage: () => (state) => {
        // On first load with no persisted user choice, auto-detect.
        if (state && !state.userPicked) {
          const tier = detectQualityTier();
          state.tier = tier;
          state.settings = QUALITY_PRESETS[tier];
        }
      },
    },
  ),
);
