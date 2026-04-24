# Roblox-cube style — everything is a box

> **North star**: a ten-year-old can build a working world by stacking, tilting,
> and colouring cubes. No spheres. No cones. No rounded corners. No particle
> systems. No random-tree generator. Just `BoxGeometry(w, h, d)` with 8
> vertices, a slight face-colour gradient, and a dark inverted-hull outline.

This is the primary aesthetic the studio should steer new users toward. It's
Roblox Classic / Pokopia-first-build / Minecraft-creative-mode — the visual
grammar every kid already recognises.

## Why blocks-only

1. **Performance**. A cube is 8 unique vertices / 24 position entries. A
   single UV sphere is ~99. A plot built from cubes runs smoothly on a
   Celeron Chromebook (our target).
2. **Composability**. Any shape can be approximated by stacking and
   tilting cubes. The cognitive model is legos — young users get it
   immediately.
3. **No dead ends**. A child trying to build a "dog" never gets stuck
   searching for a dog mesh. They stack six cubes and it works.
4. **Consistent style**. When every prop is a cube, a new prop auto-
   matches the visual language — you can't accidentally introduce a
   jarring realistic mesh.

## The primitives (only these)

```
cube                                   — the only geometry
cube tilted (Math.PI / 8 / 4 / 2)      — sunshade, ramp, roof
cube scaled thin (0.04, h, d)          — outline bar, trim, door panel
cube scaled wide & thin (w, 0.05, d)   — floor tile, rug, step
```

If you can't make it out of cubes, it doesn't belong in a beginner's world.

## Color gradient trick

Pure flat-shaded cubes read as debug geometry. Kid-style blocks need just
enough shading variance per face to sell depth. Two tricks:

1. **Toon light-ramp** (already enabled project-wide via `toonMaterial`).
   Key-light side ends up 10–15% brighter than shadow side. Reads as
   "chunky pastel block".
2. **Manual vertex colours** — optional, only when a face needs more
   visual weight than the light can supply. Paint the top face 5% lighter
   and the bottom face 10% darker so the stack has a subtle gradient.

```ts
// Cheap per-face tint without breaking the cache.
const g = new THREE.BoxGeometry(w, h, d);
g.setAttribute('color', new THREE.Float32BufferAttribute([
  /* 24 verts × 3 rgb, brighter on +Y, darker on -Y */
], 3));
```

But 9/10 times, just let the toon ramp do its job.

## Outlines, not bevels

Roblox Classic uses no bevels. The silhouette reads as "chunky" because
of the outline + shadow, not because corners are softened. Use the
inverted-hull outline at `thickness: 0.03` for every cube prop. Never
use `RoundedBoxGeometry` in this style.

## Build patterns (recipes)

### Baseplate (starting world)

```ts
const baseplate = new THREE.Mesh(
  new THREE.BoxGeometry(40, 0.5, 40),
  toonMaterial({ color: PALETTE.grass }),
);
baseplate.position.y = -0.25;  // top face at y=0
```

One cube. That's the whole starter world. Students add props on top.

### Wall

```ts
// Straight cube. Never Plane, never ExtrudeGeometry.
const wall = new THREE.Mesh(
  new THREE.BoxGeometry(4, 3, 0.2),
  toonMaterial({ color: PALETTE.ivory }),
);
wall.position.set(0, 1.5, 0);
```

Want a gradient? Two stacked cubes, slightly different colors:

```ts
const bottom = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 0.2), toonMaterial({ color: '#c5bfaa' }));
const top    = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 0.2), toonMaterial({ color: '#ece4ce' }));
bottom.position.y = 0.75;
top.position.y = 2.25;
```

### Shop stall (5 cubes)

```
           ┌─────────┐   ← cube, tilted 15° → sunshade
           │         │
          ┃         ┃    ← 2 pillar cubes (0.2 × 2.5 × 0.2)
          ┃  ┌───┐  ┃    ← desk cube (2 × 0.1 × 0.7) floating at y=1
          ┃  └───┘  ┃
           └─────────┘   ← implied floor (use baseplate)
```

```ts
// Pillars
const leftPost  = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), toonMaterial({ color: PALETTE.woodDark }));
const rightPost = leftPost.clone(); rightPost.position.x = 2;
leftPost.position.set(0, 1.25, 0);

// Desk
const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.8), toonMaterial({ color: PALETTE.woodLight }));
desk.position.set(1, 1.0, 0.2);

// Sunshade (tilted slab)
const shade = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.4), toonMaterial({ color: PALETTE.roof }));
shade.position.set(1, 2.6, 0.3);
shade.rotation.x = Math.PI / 8;  // tilt forward ~22°
```

Five cubes. Reads as "shop" at a glance.

### Pet (6–8 cubes)

```
              ┌───┐
      ┌───┐   │ ■ │         ← 2 ear cubes (0.15 × 0.25 × 0.15)
      └───┘   └───┘
        ┌─────────┐         ← head cube (0.7 × 0.6 × 0.6)
        │  ● ●    │         ← eye cubes (2 × 0.12×0.12×0.04) white
        │   ○ ○   │         ← pupil cubes (2 × 0.06×0.06×0.02) black
        └─────────┘
   ┌─────────────────┐      ← body cube (1.1 × 0.7 × 0.7)
   └─────────────────┘
    ┃    ┃    ┃    ┃        ← 4 leg cubes (0.15 × 0.3 × 0.15)
```

```ts
// Body
const body = cube(1.1, 0.7, 0.7, PALETTE.shirt);

// Head
const head = cube(0.7, 0.6, 0.6, PALETTE.shirt);
head.position.set(0, 0.5, 0.55);

// Ears (two small cubes on top of head)
const earL = cube(0.15, 0.25, 0.15, PALETTE.shirt);
earL.position.set(-0.2, 0.85, 0.55);
const earR = earL.clone(); earR.position.x = 0.2;

// Eyes — white square + black pupil, layered
const eyeL = cube(0.14, 0.14, 0.04, '#ffffff');  eyeL.position.set(-0.15, 0.55, 0.86);
const pupilL = cube(0.07, 0.07, 0.02, '#1a1a1a'); pupilL.position.set(-0.15, 0.55, 0.89);
// mirror for right eye

// Legs — 4 thin cubes hanging below
for (const [x, z] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) {
  const leg = cube(0.15, 0.3, 0.15, PALETTE.pants);
  leg.position.set(x, -0.5, z);
}
```

That's a dog / cat / bear / whatever. Colour the body, swap ear proportions,
and you've got a different pet.

### House (10 cubes)

Walls = 4 thin cube slabs. Roof = 1 tilted cube. Door = 1 thin cube. Windows
= 2 thin cubes (darker blue). Chimney = 2 small cubes stacked. Done.

### Tree (3 cubes)

Trunk cube (thin, tall) + canopy cube (wide, short) + optional smaller
canopy cube stacked on top for a 2-tier silhouette. That's it. If you
want 50 trees, duplicate and paint with the brush.

## What NOT to use in this style

| Tool / geometry | Why not |
|---|---|
| `RoundedBoxGeometry` | Soft corners break the Roblox-classic silhouette |
| `SphereGeometry` | No round shapes in this kit — everything faceted |
| `CylinderGeometry` | Column? Use a thin cube. Wheel? Thin square cube. |
| `ConeGeometry` | Roof? Tilted cube. Tree tier? Cube. Never cones. |
| `TorusGeometry` | Ring? Four thin cubes arranged in a square. |
| `ExtrudeGeometry` | Over-engineered. A cube is enough. |
| `CapsuleGeometry` | Body part? Plain cube. Always. |
| Bevelled edges at all | Outline does this for free. |
| Random-tree generator | Stack two cubes. Paint the brush. Move on. |

## Working with the existing Performance modes

The studio's Performance dropdown already ships this style under
**Extreme — cubes only**. When a kid-friendly world is the goal,
that mode should be the default:

- Every sphere → cube of the same diameter.
- Every cylinder → square prism.
- Every cone → flat-topped prism (the pine tree tapering comes from
  per-instance scale, which is preserved).
- Every rounded box → flat-sided `BoxGeometry` with 8 vertices.

All existing prefabs automatically render in cube-style when that mode
is active — no code changes needed per-prefab. New prefabs should be
designed assuming Extreme mode so they don't reintroduce curves.

## Authoring rules for new prefabs

When writing a new prefab builder, follow these in order:

1. **Start with `kidSimpleBox(w, h, d)`** for every sub-piece. Only reach
   for `kidBox` if you've already shipped a cube version and decided you
   actually need soft corners in the high-perf mode.
2. **Stack, don't subdivide**. Need a peaked roof? Two rectangular cubes
   tilted toward each other, or one cube rotated 45° on Z. Don't write
   custom `BufferGeometry` vertices.
3. **Small cubes for detail**. A 0.04-thick cube is a window frame. A
   0.06-thick cube is a door panel. A 0.02-thick cube is a mouth line.
   Never use `BufferGeometry` lines.
4. **Use instanced meshes** for repeated sub-pieces (fence pickets, pet
   spots, house shingles). The inverted-hull outline already supports
   instancing — see `outlines.ts`.
5. **Colour pair per prop**: pick one primary from `PALETTE` and one
   accent. Resist adding a third colour. Two-colour props read as
   "one thing"; three-colour props read as "fussy".

## Authoring rules for the studio UX

- Default the Performance dropdown to **Extreme** for new users (the
  onboarding flow can flip to High for older students who explicitly
  want rounded pieces).
- When surfacing prefab tiles, show the simplest cube variant first —
  "Cube", "Wall", "Baseplate", "Pillar", "Slab". Complex compound
  prefabs (house, character, random tree) sit below a divider.
- The brush's defaults (Scale 0.85–1.25, Random Y rotation) already
  match this aesthetic — don't change them.

## Anti-pattern gallery

- **Adding a sphere-pet builder** — no. Use cube pets.
- **A procedural random-tree generator with 6 archetypes** — scrap it.
  Two cubes is a tree. The brush paints as many as you want.
- **A BoxGeometry made rounded with bevels** — let the outline do it.
- **Multiple colour gradients across one face** — one colour per face
  is enough; the toon ramp handles the rest.
- **Cloth, hair, or any curve-based organic geometry** — not in this
  kit. Hair is a cube stack.

## TL;DR checklist

- [ ] Can I build it out of 3–10 `BoxGeometry` cubes?
- [ ] Is every rotation a multiple of 15° or less?
- [ ] Are there at most 2 colours per prop?
- [ ] Does it render under Extreme performance mode without looking wrong?
- [ ] Would a ten-year-old recognise it in a screenshot?

If all five boxes tick, it fits the style. If not, simplify.
