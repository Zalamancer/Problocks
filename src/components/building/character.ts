/**
 * Roblox-R15-classic-compatible avatar builder.
 *
 * Body proportions follow the canonical R15 ratios (torso 2:2:1, arm 1:2:1,
 * leg 1:2:1) so that a 585×559 classic shirt/pants PNG downloaded from the
 * Roblox template wraps correctly around our boxes.
 *
 * The UV regions below are measured against Roblox's classic clothing template
 * (see docs/roblox-ui and create.roblox.com/docs/art/classic-clothing). Each
 * face of each body-part BoxGeometry is remapped to sample the right pixel
 * rectangle from the single texture, so when a user uploads a shirt/pants PNG
 * authored for Roblox, it lands on our avatar in the right orientation.
 *
 * Geometry convention in this codebase (matches play-mode.ts):
 *   +X = player's right, -X = player's left, +Z = player's front, -Z = back.
 * Three.js BoxGeometry face order is +X, -X, +Y, -Y, +Z, -Z (indices 0..5).
 */
import * as THREE from 'three';

// --- Body proportions ----------------------------------------------------
// R15 canonical ratios, scaled so CAP_HEIGHT comes out close to 1.8 (the
// collision height that the rest of the game was tuned against).
const S = 0.9;

export const LEG_WIDTH = 0.5 * S;
export const LEG_HEIGHT = 1.0 * S;
export const LEG_DEPTH = 0.5 * S;
export const HIP_SPACING = 0.25 * S;             // half-distance between leg centers

export const TORSO_WIDTH = 1.0 * S;
export const TORSO_HEIGHT = 1.0 * S;
export const TORSO_DEPTH = 0.5 * S;

export const ARM_WIDTH = 0.5 * S;
export const ARM_HEIGHT = 1.0 * S;
export const ARM_DEPTH = 0.5 * S;

export const HEAD_SIZE = 0.5 * S;

export const SHOULDER_Y = LEG_HEIGHT + TORSO_HEIGHT - 0.1 * S;
export const SHOULDER_X = TORSO_WIDTH / 2 + ARM_WIDTH / 2 - 0.02 * S;

export const CAP_HEIGHT = LEG_HEIGHT + TORSO_HEIGHT;
export const HEAD_OFFSET = HEAD_SIZE / 2;

// --- Classic clothing template regions -----------------------------------
// Template PNG is 585×559. Regions are [x, y, w, h] in pixels from TOP-LEFT.
// Layout mirrors the diagram in https://create.roblox.com/docs/art/classic-clothing:
//   Torso cross centered horizontally in upper half, two arm/leg unfolded
//   boxes side by side in lower half.
const TEMPLATE_W = 585;
const TEMPLATE_H = 559;

type FaceRegions = {
  up: readonly [number, number, number, number];
  down: readonly [number, number, number, number];
  front: readonly [number, number, number, number];
  back: readonly [number, number, number, number];
  left: readonly [number, number, number, number];
  right: readonly [number, number, number, number];
};

const TORSO: FaceRegions = {
  up:    [164,  33, 128,  64],
  front: [164,  97, 128, 128],
  down:  [164, 225, 128,  64],
  right: [100,  97,  64, 128],
  left:  [292,  97,  64, 128],
  back:  [356,  97, 128, 128],
};

const LIMB_R: FaceRegions = {
  up:    [ 97, 303,  64,  64],
  left:  [ 33, 367,  64, 128],
  back:  [ 97, 367,  64, 128],
  right: [161, 367,  64, 128],
  front: [225, 367,  64, 128],
  down:  [ 97, 495,  64,  64],
};

const LIMB_L: FaceRegions = {
  up:    [289, 303,  64,  64],
  front: [289, 367,  64, 128],
  left:  [353, 367,  64, 128],
  back:  [417, 367,  64, 128],
  right: [481, 367,  64, 128],
  down:  [289, 495,  64,  64],
};

/**
 * Remap a BoxGeometry's default UVs so each face samples the given pixel
 * rectangle from a texture of size (texW, texH). Three.js BoxGeometry's
 * default per-face UVs are oriented "as viewed from outside", so a direct
 * rectangle remap gives the correct orientation on all 6 faces.
 */
function setBoxUVs(geom: THREE.BoxGeometry, regions: FaceRegions): void {
  const uv = geom.attributes.uv as THREE.BufferAttribute;
  const apply = (faceIdx: number, region: readonly [number, number, number, number]) => {
    const [px, py, pw, ph] = region;
    const uL = px / TEMPLATE_W;
    const uR = (px + pw) / TEMPLATE_W;
    // Three.js UV: v=0 is bottom. Image pixel Y: 0 is top. Flip.
    const vT = 1 - py / TEMPLATE_H;
    const vB = 1 - (py + ph) / TEMPLATE_H;
    const base = faceIdx * 4;
    // BoxGeometry per-face vertex order is: (0,1), (1,1), (0,0), (1,0)
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

// --- Public API ----------------------------------------------------------

export interface Avatar {
  group: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  /** Swap in a shirt texture URL at runtime; applies to torso + both arms. */
  setShirt(url: string | null): void;
  /** Swap in a pants texture URL at runtime; applies to both legs. */
  setPants(url: string | null): void;
  /** Dispose geometries, materials, and textures owned by this avatar. */
  dispose(): void;
}

export interface AvatarOptions {
  shirtUrl?: string | null;
  pantsUrl?: string | null;
  skinColor?: number;      // 0xrrggbb
  shirtColor?: number;     // fallback tint when no shirt texture
  pantsColor?: number;     // fallback tint when no pants texture
}

/** Default placeholder colors (Roblox "Really red" / "Really blue"-ish). */
const DEFAULTS = {
  skin:  0xf0c090,
  shirt: 0x3a7be2,
  pants: 0x2a4158,
};

export function buildAvatar(opts: AvatarOptions = {}): Avatar {
  const skinMat = new THREE.MeshStandardMaterial({
    color: opts.skinColor ?? DEFAULTS.skin,
    roughness: 0.8,
  });
  // Shirt/pants start as flat-color materials; switched to textured mats when
  // setShirt/setPants are called (or if shirtUrl/pantsUrl are provided).
  const shirtMat = new THREE.MeshStandardMaterial({
    color: opts.shirtColor ?? DEFAULTS.shirt,
    roughness: 0.6,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: opts.pantsColor ?? DEFAULTS.pants,
    roughness: 0.85,
  });

  const group = new THREE.Group();
  group.name = 'avatar';

  // Torso — the single box covers both UpperTorso + LowerTorso in one piece.
  const torsoGeom = new THREE.BoxGeometry(TORSO_WIDTH, TORSO_HEIGHT, TORSO_DEPTH);
  setBoxUVs(torsoGeom, TORSO);
  const torso = new THREE.Mesh(torsoGeom, shirtMat);
  torso.position.y = LEG_HEIGHT + TORSO_HEIGHT / 2;
  torso.castShadow = true;
  group.add(torso);

  // Head — skin material, with eyes + mouth as decals.
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(HEAD_SIZE, HEAD_SIZE, HEAD_SIZE),
    skinMat,
  );
  head.position.y = LEG_HEIGHT + TORSO_HEIGHT + HEAD_SIZE / 2;
  head.castShadow = true;
  group.add(head);

  const faceMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), faceMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), faceMat);
  eyeL.position.set(-0.11, 0.04, HEAD_SIZE / 2 + 0.001);
  eyeR.position.set( 0.11, 0.04, HEAD_SIZE / 2 + 0.001);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.02), faceMat);
  mouth.position.set(0, -0.08, HEAD_SIZE / 2 + 0.001);
  head.add(eyeL, eyeR, mouth);

  // Arms — pivot group at the shoulder so rotating the group swings the arm.
  function makeLimb(
    width: number, height: number, depth: number,
    pivotX: number, pivotY: number,
    regions: FaceRegions,
    material: THREE.Material,
  ): { pivot: THREE.Group; mesh: THREE.Mesh } {
    const pivot = new THREE.Group();
    pivot.position.set(pivotX, pivotY, 0);
    const geom = new THREE.BoxGeometry(width, height, depth);
    setBoxUVs(geom, regions);
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.y = -height / 2;
    mesh.castShadow = true;
    pivot.add(mesh);
    return { pivot, mesh };
  }

  const armLParts = makeLimb(ARM_WIDTH, ARM_HEIGHT, ARM_DEPTH,
    -SHOULDER_X, SHOULDER_Y, LIMB_L, shirtMat);
  const armRParts = makeLimb(ARM_WIDTH, ARM_HEIGHT, ARM_DEPTH,
     SHOULDER_X, SHOULDER_Y, LIMB_R, shirtMat);
  group.add(armLParts.pivot, armRParts.pivot);

  const legLParts = makeLimb(LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH,
    -HIP_SPACING, LEG_HEIGHT, LIMB_L, pantsMat);
  const legRParts = makeLimb(LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH,
     HIP_SPACING, LEG_HEIGHT, LIMB_R, pantsMat);
  group.add(legLParts.pivot, legRParts.pivot);

  // --- Texture loading / swapping ---------------------------------------
  const loader = new THREE.TextureLoader();
  let currentShirtTex: THREE.Texture | null = null;
  let currentPantsTex: THREE.Texture | null = null;

  function makeClothingTexture(tex: THREE.Texture): void {
    tex.colorSpace = THREE.SRGBColorSpace;
    // Crisp-pixel look — Roblox shirts are often pixel-art at 128×128 per face.
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
  }

  function setShirt(url: string | null): void {
    if (currentShirtTex) { currentShirtTex.dispose(); currentShirtTex = null; }
    if (!url) {
      torso.material = shirtMat;
      armLParts.mesh.material = shirtMat;
      armRParts.mesh.material = shirtMat;
      return;
    }
    loader.load(url, (tex) => {
      makeClothingTexture(tex);
      currentShirtTex = tex;
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
      torso.material = mat;
      armLParts.mesh.material = mat;
      armRParts.mesh.material = mat;
    });
  }

  function setPants(url: string | null): void {
    if (currentPantsTex) { currentPantsTex.dispose(); currentPantsTex = null; }
    if (!url) {
      legLParts.mesh.material = pantsMat;
      legRParts.mesh.material = pantsMat;
      return;
    }
    loader.load(url, (tex) => {
      makeClothingTexture(tex);
      currentPantsTex = tex;
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
      // Pants template also has a torso region, but shirt takes visual priority
      // on the torso (matches Roblox layering). So only the legs get the pants
      // texture here — if no shirt is set, the torso stays on shirtMat color.
      legLParts.mesh.material = mat;
      legRParts.mesh.material = mat;
    });
  }

  if (opts.shirtUrl) setShirt(opts.shirtUrl);
  if (opts.pantsUrl) setPants(opts.pantsUrl);

  function dispose(): void {
    group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    currentShirtTex?.dispose();
    currentPantsTex?.dispose();
  }

  return {
    group,
    torso,
    head,
    armL: armLParts.pivot,
    armR: armRParts.pivot,
    legL: legLParts.pivot,
    legR: legRParts.pivot,
    setShirt,
    setPants,
    dispose,
  };
}
