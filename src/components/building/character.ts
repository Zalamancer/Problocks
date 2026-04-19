/**
 * Avatar builder supporting two styles:
 *   - 'roblox'    : R15 proportions, 585×559 classic shirt+pants templates
 *   - 'minecraft' : Steve/Alex proportions, single 64×64 skin PNG
 *
 * Both styles land on the same CAP_HEIGHT = 1.8 so the capsule collision and
 * camera math in play-mode.ts don't have to care which style was chosen.
 *
 * Geometry convention (matches play-mode.ts):
 *   +X = player's right, -X = player's left, +Z = player's front, -Z = back.
 * Three.js BoxGeometry face order is +X, -X, +Y, -Y, +Z, -Z (indices 0..5).
 * Default per-face UVs are oriented "as viewed from outside", so a direct
 * pixel-rectangle remap lands on the right face at the right orientation.
 */
import * as THREE from 'three';

// =========================================================================
// Shared helpers
// =========================================================================

type FaceRegions = {
  up: readonly [number, number, number, number];
  down: readonly [number, number, number, number];
  front: readonly [number, number, number, number];
  back: readonly [number, number, number, number];
  left: readonly [number, number, number, number];
  right: readonly [number, number, number, number];
};

/** Remap BoxGeometry UVs so each face samples [px, py, pw, ph] from a (texW, texH) image. */
function setBoxUVs(
  geom: THREE.BoxGeometry,
  regions: FaceRegions,
  texW: number,
  texH: number,
): void {
  const uv = geom.attributes.uv as THREE.BufferAttribute;
  const apply = (faceIdx: number, region: readonly [number, number, number, number]) => {
    const [px, py, pw, ph] = region;
    const uL = px / texW;
    const uR = (px + pw) / texW;
    // Three.js UV: v=0 is bottom. Image pixel Y: 0 is top. Flip.
    const vT = 1 - py / texH;
    const vB = 1 - (py + ph) / texH;
    const base = faceIdx * 4;
    // BoxGeometry per-face vertex order: (0,1), (1,1), (0,0), (1,0)
    // i.e. top-left, top-right, bottom-left, bottom-right.
    uv.setXY(base + 0, uL, vT);
    uv.setXY(base + 1, uR, vT);
    uv.setXY(base + 2, uL, vB);
    uv.setXY(base + 3, uR, vB);
  };
  apply(0, regions.right); // +X
  apply(1, regions.left);  // -X
  apply(2, regions.up);    // +Y
  apply(3, regions.down);  // -Y
  apply(4, regions.front); // +Z
  apply(5, regions.back);  // -Z
  uv.needsUpdate = true;
}

function makePivotBox(
  width: number, height: number, depth: number,
  pivotX: number, pivotY: number,
  regions: FaceRegions, texW: number, texH: number,
  material: THREE.Material,
): { pivot: THREE.Group; mesh: THREE.Mesh } {
  const pivot = new THREE.Group();
  pivot.position.set(pivotX, pivotY, 0);
  const geom = new THREE.BoxGeometry(width, height, depth);
  setBoxUVs(geom, regions, texW, texH);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.y = -height / 2;
  mesh.castShadow = true;
  pivot.add(mesh);
  return { pivot, mesh };
}

// =========================================================================
// Roblox classic — 585×559 shirt + pants templates
// =========================================================================
const R_SCALE = 0.9;
const R = {
  LEG_W: 0.5 * R_SCALE, LEG_H: 1.0 * R_SCALE, LEG_D: 0.5 * R_SCALE,
  HIP_SPACING: 0.25 * R_SCALE,
  TORSO_W: 1.0 * R_SCALE, TORSO_H: 1.0 * R_SCALE, TORSO_D: 0.5 * R_SCALE,
  ARM_W: 0.5 * R_SCALE, ARM_H: 1.0 * R_SCALE, ARM_D: 0.5 * R_SCALE,
  HEAD_SIZE: 0.5 * R_SCALE,
  SHOULDER_Y_DROP: 0.1 * R_SCALE,
  SHOULDER_X_TUCK: 0.02 * R_SCALE,
  TEX_W: 585, TEX_H: 559,
};

const R_TORSO: FaceRegions = {
  up:    [164,  33, 128,  64],
  front: [164,  97, 128, 128],
  down:  [164, 225, 128,  64],
  right: [100,  97,  64, 128],
  left:  [292,  97,  64, 128],
  back:  [356,  97, 128, 128],
};
const R_LIMB_R: FaceRegions = {
  up:    [ 97, 303,  64,  64],
  left:  [ 33, 367,  64, 128],
  back:  [ 97, 367,  64, 128],
  right: [161, 367,  64, 128],
  front: [225, 367,  64, 128],
  down:  [ 97, 495,  64,  64],
};
const R_LIMB_L: FaceRegions = {
  up:    [289, 303,  64,  64],
  front: [289, 367,  64, 128],
  left:  [353, 367,  64, 128],
  back:  [417, 367,  64, 128],
  right: [481, 367,  64, 128],
  down:  [289, 495,  64,  64],
};

// =========================================================================
// Minecraft — single 64×64 skin PNG
// Leg 12 + torso 12 = 24 voxels. Scale so total height = 1.8 engine units.
// => 1 voxel = 0.075.
// =========================================================================
const MC_V = 0.075;
const MC = {
  LEG_W:  4 * MC_V, LEG_H: 12 * MC_V, LEG_D: 4 * MC_V,
  HIP_SPACING: 2 * MC_V,               // leg center offset (±2 voxels from body center)
  TORSO_W: 8 * MC_V, TORSO_H: 12 * MC_V, TORSO_D: 4 * MC_V,
  ARM_W:  4 * MC_V, ARM_H: 12 * MC_V, ARM_D: 4 * MC_V,
  ARM_W_SLIM: 3 * MC_V,                // Alex-style slim arm width
  HEAD_SIZE: 8 * MC_V,
  TEX_W: 64, TEX_H: 64,
};

const MC_HEAD: FaceRegions = {
  up:    [ 8, 0, 8, 8],
  down:  [16, 0, 8, 8],
  right: [ 0, 8, 8, 8],
  front: [ 8, 8, 8, 8],
  left:  [16, 8, 8, 8],
  back:  [24, 8, 8, 8],
};
const MC_TORSO: FaceRegions = {
  up:    [20, 16, 8,  4],
  down:  [28, 16, 8,  4],
  right: [16, 20, 4, 12],
  front: [20, 20, 8, 12],
  left:  [28, 20, 4, 12],
  back:  [32, 20, 8, 12],
};
const MC_ARM_R: FaceRegions = {
  up:    [44, 16, 4,  4],
  down:  [48, 16, 4,  4],
  right: [40, 20, 4, 12],
  front: [44, 20, 4, 12],
  left:  [48, 20, 4, 12],
  back:  [52, 20, 4, 12],
};
const MC_ARM_L: FaceRegions = {
  up:    [36, 48, 4,  4],
  down:  [40, 48, 4,  4],
  right: [32, 52, 4, 12],
  front: [36, 52, 4, 12],
  left:  [40, 52, 4, 12],
  back:  [44, 52, 4, 12],
};
const MC_LEG_R: FaceRegions = {
  up:    [ 4, 16, 4,  4],
  down:  [ 8, 16, 4,  4],
  right: [ 0, 20, 4, 12],
  front: [ 4, 20, 4, 12],
  left:  [ 8, 20, 4, 12],
  back:  [12, 20, 4, 12],
};
const MC_LEG_L: FaceRegions = {
  up:    [20, 48, 4,  4],
  down:  [24, 48, 4,  4],
  right: [16, 52, 4, 12],
  front: [20, 52, 4, 12],
  left:  [24, 52, 4, 12],
  back:  [28, 52, 4, 12],
};

// =========================================================================
// Public API
// =========================================================================

export type AvatarStyle = 'roblox' | 'minecraft';

export interface Avatar {
  style: AvatarStyle;
  group: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  /** Total capsule height (feet → top of torso). Feed to play-mode collision. */
  capHeight: number;
  /** Y-position of the torso mesh at rest. play-mode adds bob offset. */
  torsoRestY: number;
  /** Y-position of the head mesh at rest. */
  headRestY: number;
  /** Roblox: 585×559 shirt PNG, covers torso + both arms. No-op on Minecraft. */
  setShirt(url: string | null): void;
  /** Roblox: 585×559 pants PNG, covers both legs. No-op on Minecraft. */
  setPants(url: string | null): void;
  /** Minecraft: 64×64 skin PNG, covers everything. No-op on Roblox. */
  setSkin(url: string | null): void;
  dispose(): void;
}

export interface AvatarOptions {
  style?: AvatarStyle;     // default 'minecraft'
  slim?: boolean;          // minecraft only — use 3-pixel Alex arms
  shirtUrl?: string | null;
  pantsUrl?: string | null;
  skinUrl?: string | null;
  skinColor?: number;
  shirtColor?: number;
  pantsColor?: number;
}

const DEFAULTS = {
  skin:  0xc68f6b,  // generic "skin" tone (not any specific Roblox/MC character)
  shirt: 0x3a7be2,
  pants: 0x2a4158,
};

// --- Kept for any legacy importers outside this file --------------------
// (play-mode.ts now reads capHeight/torsoRestY/headRestY from the Avatar.)
export const CAP_HEIGHT = R.LEG_H + R.TORSO_H;           // 1.8
export const LEG_HEIGHT = R.LEG_H;
export const TORSO_HEIGHT = R.TORSO_H;
export const HEAD_OFFSET = R.HEAD_SIZE / 2;

// ------------------------------------------------------------------------

export function buildAvatar(opts: AvatarOptions = {}): Avatar {
  const style: AvatarStyle = opts.style ?? 'minecraft';
  return style === 'roblox' ? buildRoblox(opts) : buildMinecraft(opts);
}

// -------------------- Roblox ---------------------------------------------
function buildRoblox(opts: AvatarOptions): Avatar {
  const skinMat = new THREE.MeshStandardMaterial({
    color: opts.skinColor ?? DEFAULTS.skin, roughness: 0.8,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: opts.shirtColor ?? DEFAULTS.shirt, roughness: 0.6,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: opts.pantsColor ?? DEFAULTS.pants, roughness: 0.85,
  });

  const group = new THREE.Group();
  group.name = 'avatar-roblox';

  const torsoGeom = new THREE.BoxGeometry(R.TORSO_W, R.TORSO_H, R.TORSO_D);
  setBoxUVs(torsoGeom, R_TORSO, R.TEX_W, R.TEX_H);
  const torsoRestY = R.LEG_H + R.TORSO_H / 2;
  const torso = new THREE.Mesh(torsoGeom, shirtMat);
  torso.position.y = torsoRestY;
  torso.castShadow = true;
  group.add(torso);

  const headRestY = R.LEG_H + R.TORSO_H + R.HEAD_SIZE / 2;
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(R.HEAD_SIZE, R.HEAD_SIZE, R.HEAD_SIZE),
    skinMat,
  );
  head.position.y = headRestY;
  head.castShadow = true;
  group.add(head);

  // Roblox classic face has no head template — paint a smiley decal.
  const faceMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), faceMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), faceMat);
  eyeL.position.set(-0.11, 0.04, R.HEAD_SIZE / 2 + 0.001);
  eyeR.position.set( 0.11, 0.04, R.HEAD_SIZE / 2 + 0.001);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.02), faceMat);
  mouth.position.set(0, -0.08, R.HEAD_SIZE / 2 + 0.001);
  head.add(eyeL, eyeR, mouth);

  const shoulderY = R.LEG_H + R.TORSO_H - R.SHOULDER_Y_DROP;
  const shoulderX = R.TORSO_W / 2 + R.ARM_W / 2 - R.SHOULDER_X_TUCK;

  const aL = makePivotBox(R.ARM_W, R.ARM_H, R.ARM_D, -shoulderX, shoulderY,
    R_LIMB_L, R.TEX_W, R.TEX_H, shirtMat);
  const aR = makePivotBox(R.ARM_W, R.ARM_H, R.ARM_D,  shoulderX, shoulderY,
    R_LIMB_R, R.TEX_W, R.TEX_H, shirtMat);
  const lL = makePivotBox(R.LEG_W, R.LEG_H, R.LEG_D, -R.HIP_SPACING, R.LEG_H,
    R_LIMB_L, R.TEX_W, R.TEX_H, pantsMat);
  const lR = makePivotBox(R.LEG_W, R.LEG_H, R.LEG_D,  R.HIP_SPACING, R.LEG_H,
    R_LIMB_R, R.TEX_W, R.TEX_H, pantsMat);
  group.add(aL.pivot, aR.pivot, lL.pivot, lR.pivot);

  const loader = new THREE.TextureLoader();
  let shirtTex: THREE.Texture | null = null;
  let pantsTex: THREE.Texture | null = null;

  function configureClothTex(tex: THREE.Texture) {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
  }
  function setShirt(url: string | null) {
    shirtTex?.dispose(); shirtTex = null;
    if (!url) { torso.material = shirtMat; aL.mesh.material = shirtMat; aR.mesh.material = shirtMat; return; }
    loader.load(url, (tex) => {
      configureClothTex(tex); shirtTex = tex;
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
      torso.material = mat; aL.mesh.material = mat; aR.mesh.material = mat;
    });
  }
  function setPants(url: string | null) {
    pantsTex?.dispose(); pantsTex = null;
    if (!url) { lL.mesh.material = pantsMat; lR.mesh.material = pantsMat; return; }
    loader.load(url, (tex) => {
      configureClothTex(tex); pantsTex = tex;
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
      lL.mesh.material = mat; lR.mesh.material = mat;
    });
  }
  if (opts.shirtUrl) setShirt(opts.shirtUrl);
  if (opts.pantsUrl) setPants(opts.pantsUrl);

  return {
    style: 'roblox',
    group, torso, head,
    armL: aL.pivot, armR: aR.pivot, legL: lL.pivot, legR: lR.pivot,
    capHeight: R.LEG_H + R.TORSO_H,
    torsoRestY, headRestY,
    setShirt, setPants,
    setSkin: () => { /* n/a for roblox */ },
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
      });
      shirtTex?.dispose(); pantsTex?.dispose();
    },
  };
}

// -------------------- Minecraft ------------------------------------------
function buildMinecraft(opts: AvatarOptions): Avatar {
  const armW = opts.slim ? MC.ARM_W_SLIM : MC.ARM_W;

  // Single material per body part — swapped atomically when setSkin loads.
  // All start as flat skin-toned; colors matter only until a skin PNG arrives.
  const headMat  = new THREE.MeshStandardMaterial({ color: opts.skinColor ?? DEFAULTS.skin, roughness: 0.9 });
  const torsoMat = new THREE.MeshStandardMaterial({ color: opts.shirtColor ?? DEFAULTS.shirt, roughness: 0.9 });
  const armLMat  = new THREE.MeshStandardMaterial({ color: opts.skinColor ?? DEFAULTS.skin, roughness: 0.9 });
  const armRMat  = new THREE.MeshStandardMaterial({ color: opts.skinColor ?? DEFAULTS.skin, roughness: 0.9 });
  const legLMat  = new THREE.MeshStandardMaterial({ color: opts.pantsColor ?? DEFAULTS.pants, roughness: 0.9 });
  const legRMat  = new THREE.MeshStandardMaterial({ color: opts.pantsColor ?? DEFAULTS.pants, roughness: 0.9 });

  const group = new THREE.Group();
  group.name = 'avatar-minecraft';

  const torsoGeom = new THREE.BoxGeometry(MC.TORSO_W, MC.TORSO_H, MC.TORSO_D);
  setBoxUVs(torsoGeom, MC_TORSO, MC.TEX_W, MC.TEX_H);
  const torsoRestY = MC.LEG_H + MC.TORSO_H / 2;
  const torso = new THREE.Mesh(torsoGeom, torsoMat);
  torso.position.y = torsoRestY;
  torso.castShadow = true;
  group.add(torso);

  const headGeom = new THREE.BoxGeometry(MC.HEAD_SIZE, MC.HEAD_SIZE, MC.HEAD_SIZE);
  setBoxUVs(headGeom, MC_HEAD, MC.TEX_W, MC.TEX_H);
  const headRestY = MC.LEG_H + MC.TORSO_H + MC.HEAD_SIZE / 2;
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.y = headRestY;
  head.castShadow = true;
  group.add(head);

  // Arms hang flush against torso side, tops aligned with torso top.
  const shoulderY = MC.LEG_H + MC.TORSO_H;
  const shoulderX = MC.TORSO_W / 2 + armW / 2;

  const aL = makePivotBox(armW, MC.ARM_H, MC.ARM_D, -shoulderX, shoulderY,
    MC_ARM_L, MC.TEX_W, MC.TEX_H, armLMat);
  const aR = makePivotBox(armW, MC.ARM_H, MC.ARM_D,  shoulderX, shoulderY,
    MC_ARM_R, MC.TEX_W, MC.TEX_H, armRMat);
  const lL = makePivotBox(MC.LEG_W, MC.LEG_H, MC.LEG_D, -MC.HIP_SPACING, MC.LEG_H,
    MC_LEG_L, MC.TEX_W, MC.TEX_H, legLMat);
  const lR = makePivotBox(MC.LEG_W, MC.LEG_H, MC.LEG_D,  MC.HIP_SPACING, MC.LEG_H,
    MC_LEG_R, MC.TEX_W, MC.TEX_H, legRMat);
  group.add(aL.pivot, aR.pivot, lL.pivot, lR.pivot);

  const loader = new THREE.TextureLoader();
  let skinTex: THREE.Texture | null = null;

  function setSkin(url: string | null) {
    skinTex?.dispose(); skinTex = null;
    const parts: THREE.MeshStandardMaterial[] = [headMat, torsoMat, armLMat, armRMat, legLMat, legRMat];
    if (!url) { parts.forEach((m) => { m.map = null; m.needsUpdate = true; }); return; }
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      // Minecraft skins MUST be nearest-filtered — any linear sampling blurs
      // the pixel art and bleeds neighboring face regions into each other.
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.anisotropy = 1;
      tex.needsUpdate = true;
      skinTex = tex;
      parts.forEach((m) => { m.map = tex; m.color.setHex(0xffffff); m.needsUpdate = true; });
    });
  }
  if (opts.skinUrl) setSkin(opts.skinUrl);

  return {
    style: 'minecraft',
    group, torso, head,
    armL: aL.pivot, armR: aR.pivot, legL: lL.pivot, legR: lR.pivot,
    capHeight: MC.LEG_H + MC.TORSO_H,
    torsoRestY, headRestY,
    setShirt: () => { /* n/a */ },
    setPants: () => { /* n/a */ },
    setSkin,
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
      });
      skinTex?.dispose();
    },
  };
}
