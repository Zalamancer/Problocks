# 04 — Interaction & Detection

Maps Roblox Studio's interaction primitives (buttons, drag detectors, proximity prompts, UI tweens, 2D paths) onto the Problocks stack (Next.js 16, React Flow, Tailwind v4, optional Three.js CDN for 3D game output). Target hardware: Celeron N4000 / 4 GB RAM Chromebooks — so anything that does per-frame hit-testing, main-thread animation, or pulls in a large library is suspect.

Scope covers:
1. TextButton / ImageButton
2. UIDragDetector (deep dive)
3. 3D DragDetector
4. ProximityPrompt (deep dive, with sketch)
5. UI animation / TweenService (deep dive — CSS vs framer-motion vs WAAPI on Celeron)
6. Path2D (2D splines)

Two audiences for every entry: **Studio editor** (React Flow canvas, panel controls) and **Game output** (AI-generated HTML5 playing inside `/play/[gameId]`).

---

## TextButton / ImageButton

**Roblox does:** `TextButton` / `ImageButton` are `GuiObject`s that fire an `Activated` event on click/tap. `ImageButton` has built-in `Image`, `HoverImage`, `PressedImage` states.

**Web equivalent:** `<button>` element with `onClick`, `:hover` / `:active` / `:focus-visible` pseudo-classes, `<img>` swapping via state, or background-image. Pointer Events (`pointerdown`/`pointerup`) when click semantics aren't enough.

**Problocks mapping:**
- Studio editor → already covered. Never author a raw `<button>`; use `PanelActionButton` (primary/secondary/destructive/accent) for panel CTAs, `PanelButtonGroup` for segmented pairs, `IconButton` for icon-only. `PanelSelect` replaces any `PanelButtonGroup` with 2+ status-like options (per project rule).
- Game output → AI emits plain DOM `<button>` inside the HTML5 game, or for Canvas/Three.js games, a simulated button: an `<img>` or `<div>` with `pointerdown`/`pointerup` swapping the `src` (hover/normal/pressed). For Three.js games, prefer a DOM overlay (`position:absolute`) above the canvas instead of raycast-picked meshes — cheaper on a Celeron.

**How it could be used:** menu pages, shop buttons, HUD actions, dialog choices, per-tile action buttons in a grid.

**Edge cases & gotchas:**
- **Click vs tap delay:** iOS Safari 300 ms click delay is gone if `<meta name="viewport" content="width=device-width">` is set. The AI template must include it.
- **Pointer vs mouse vs touch:** use Pointer Events (`pointerdown`) so one handler covers all three. Don't stack `click` + `touchstart` — duplicate fires.
- **Focus ring:** use `:focus-visible` (not `:focus`) so keyboard users get a ring and mouse users don't — accessibility requirement for classroom use.
- **Hover on touch:** `:hover` sticks after tap on iOS. Pair every `:hover` rule with `@media (hover: hover)` or accept the stuck state.
- **Disabled state:** `aria-disabled` + `pointer-events: none`, not the `disabled` attribute alone (which drops focus).
- **Preload images:** `HoverImage` and `PressedImage` equivalents need `<link rel="preload" as="image">` or the first hover flashes a blank.

**Recommendation:** port. Already done for studio; publish a documented `<GameButton>` primitive for the game-output runtime so AI templates stop reinventing it.

---

## UIDragDetector (deep dive)

**Roblox does:** drop a `UIDragDetector` under a `GuiObject` and it becomes draggable with zero code. Features:

| Feature | Roblox |
|---|---|
| Drag styles | `TranslateLine`, `TranslatePlane`, `Rotate`, `Scriptable` |
| Response | `Offset`, `Scale`, `CustomOffset`, `CustomScale` (data-only, no visual move) |
| Axis lock | `DragAxis` Vector2 in reference-instance local space |
| Bounds | `BoundingUI` container + `BoundingBehavior` (EntireObject / HitPoint / Automatic) |
| Limits | `MinDragTranslation` / `MaxDragTranslation`, `MinDragAngle` / `MaxDragAngle` |
| Reference frame | `ReferenceUIInstance` redefines origin/axes |
| Speed | `SelectionModeDragSpeed`, `SelectionModeRotateSpeed`, `UIDragSpeedAxisMapping` (for gamepad selection mode) |
| Events | `DragStart` / `DragContinue` / `DragEnd` |
| Custom constraints | `AddConstraintFunction(priority, fn)` — grid snap, custom regions |
| Scripted style | `SetDragStyleFunction(fn)` returns `(UDim2, rotation)` |

**Web equivalent:** Pointer Events (`pointerdown` + `setPointerCapture` + `pointermove` + `pointerup`). Libraries: `@use-gesture/react` (2 KB core, excellent pointer/touch/wheel unification), `framer-motion`'s `drag` prop (rich but ~35 KB gz), or hand-rolled `PointerEvent` handlers.

**Feature-by-feature mapping:**

| Roblox feature | Web | Difficulty |
|---|---|---|
| `TranslatePlane` | Pointer delta → `transform: translate3d(dx, dy, 0)` | Easy — 20 lines with `@use-gesture` |
| `TranslateLine` + `DragAxis` | Project pointer delta onto axis vector: `t = dot(delta, axis) / len(axis)` | Easy |
| `Rotate` | `atan2(py - cy, px - cx) - startAngle`, apply `rotate()` transform | Medium — needs center-of-element math; careful with unwrapping across ±π |
| `Scriptable` | Pass a user function `(pointer) => ({x, y, rotation})` | Easy |
| `BoundingUI` | Clamp to parent `getBoundingClientRect()` each move | Easy |
| `BoundingBehavior.HitPoint` vs `EntireObject` | Clamp using grab-point offset vs clamp AABB of element | Medium — EntireObject needs element rect; HitPoint needs initial grab offset |
| Min/Max translation limits | `Math.min(max, Math.max(min, value))` | Easy |
| Min/Max angle limits | Same, modulo unwrapping | Medium |
| `Scale` response (relative to parent) | Convert pixel delta to `% parentWidth` | Easy |
| `CustomOffset` / `CustomScale` (data-only) | Don't apply transform; only fire `onDrag({dx, dy})` | Easy |
| Custom constraint fn (grid snap) | `x = round(x / step) * step` inside move handler | Easy |
| Momentum / inertia (NOT in Roblox but commonly bundled) | framer-motion's `dragMomentum` or manual exponential decay in `requestAnimationFrame` | Medium |

**Problocks mapping:**
- Studio editor → **do not** add our own drag layer for nodes; React Flow already handles node drag, pan, zoom, and multi-select. Hooking any pointer handler on `.react-flow__node` without `stopPropagation` will conflict. If we need draggable panel widgets (e.g., a slider inside the right panel), those live outside React Flow's surface; port `PanelSlider` behavior (pointer-lock drag, already spec'd in AutoAnimation) instead of inventing a UIDragDetector clone.
- Game output → the AI-generated game is where this lives. Ship a tiny `<Draggable>` helper in the game runtime that wraps `@use-gesture/react` and exposes the Roblox-style props (`dragAxis`, `dragBounds`, `onDragStart/Continue/End`, `snapGrid`). Avoid framer-motion in game output — it brings React reconciler into the animation loop, which we pay for on every frame.

**How it could be used (game output):** volume sliders, inventory drag-and-drop, puzzle pieces, hue rotators, transparency dimmers, draggable minimap cursor, grid-snap tile placement.

**Edge cases & gotchas:**
- **setPointerCapture is mandatory.** Without it, fast drags that leave the element lose `pointermove`.
- **Passive listeners:** `pointermove` is non-passive by default; fine. But `touchmove` *is* passive — avoid it, use Pointer Events exclusively.
- **React Flow zoom-aware coords:** if we ever put a draggable widget *inside a React Flow node*, screen pixels ≠ flow coords. Multiply `delta` by `1 / zoom` via `useReactFlow().getZoom()`, or use `screenToFlowPosition`. Forgetting this is the #1 drag bug in node canvases.
- **iOS rubber-band:** `touch-action: none` on the draggable element or the browser hijacks horizontal drags for page nav.
- **60 fps on Celeron:** `transform` + `will-change: transform` keeps it on the compositor. Do NOT animate `left`/`top` — layout thrash kills frame rate on N4000.
- **Rotation drag wrap:** raw `atan2` flips from +π to −π; unwrap by tracking the previous angle and adding `±2π` on jumps, else the element spins wildly.
- **Pointer capture + iframes:** if `/play/[gameId]` embeds the game in an iframe, capture is per-document — no cross-frame drag.
- **Reduced motion:** snap directly to final position on `prefers-reduced-motion: reduce`.

**Recommendation:** port, as a runtime helper baked into the game-output boilerplate. Do **not** try to retrofit React Flow nodes — that's a different use case.

---

## 3D DragDetector

**Roblox does:** drop a `DragDetector` under a `BasePart` / `Model`; player can drag it in 3D. Drag styles: `TranslateLine`, `TranslatePlane`, `TranslatePlaneOrLine`, `TranslateLineOrPlane`, `TranslateViewPlane`, `RotateAxis`, `RotateTrackball`, `BestForDevice`, `Scriptable`. Response: `Geometric` (snap), `Physical` (constraint forces), `Custom` (data-only). Per-player permission policy, modifier keys for mode switching, grid-snap constraints.

**Web equivalent:** Three.js `THREE.Raycaster` on pointerdown → intersect meshes with a `userData.draggable` flag → on pointermove, project pointer ray onto the drag plane / axis and update `mesh.position`. Libraries: `three/examples/jsm/controls/DragControls.js` (plane drag only, no axis-lock or rotation), `@react-three/drei`'s `<TransformControls>` (gizmo-style, not "grab and drag"), or hand-rolled.

**Problocks mapping:**
- Studio editor → not applicable. Studio doesn't render a 3D scene; it's a React Flow task canvas.
- Game output → for Three.js (CDN) games the AI generates, provide a `<DraggableMesh axis="y" bounds={[0, 10]} onDragFrame={...}>` helper that runs the raycast → plane-project → clamp pipeline. Default to `TranslatePlane` in ground plane because that's the cheapest.

**How it could be used:** draggable chess pieces, physics toys, drawer/door sliders, dimmer sliders in 3D world, placing turrets in a tower defense.

**Edge cases & gotchas:**
- **Raycasting cost on Celeron:** `Raycaster.intersectObjects(scene.children, true)` over a big scene tree is a frame-killer. Tag draggables with a flat array, raycast only against that array.
- **Pointer-to-NDC:** `((e.clientX - rect.left) / rect.width) * 2 - 1` — be sure to use the canvas rect, not viewport.
- **Plane vs line projection math:** for axis-lock drag, construct a plane that contains the axis and is most perpendicular to the camera view; intersect pointer ray with that plane; project result onto axis. This is Roblox's `TranslateLine` math — non-trivial, document it.
- **Anchored vs unanchored:** Roblox auto-anchors unanchored parts during Physical drag. In Three.js + cannon/rapier we'd have to `body.setBodyType(KINEMATIC)` during drag, restore `DYNAMIC` on release.
- **Modifier key for mode switching:** `e.ctrlKey` in pointermove callback. Note: on Chromebooks, `Ctrl+click` can open context menus — `e.preventDefault()` in pointerdown.
- **Camera-relative drag (`TranslateViewPlane`):** plane normal is `camera.getWorldDirection()` — recalculate every frame because the camera may move.
- **VR:** ignore. Chromebooks don't do WebXR meaningfully.

**Recommendation:** later. 3D game output is Phase 2+; for MVP the AI can emit simpler click-handlers. Port when we have a real 3D game pipeline.

---

## ProximityPrompt (deep dive)

**Roblox does:** attach a `ProximityPrompt` to a part/model/attachment. When the player walks within `MaxActivationDistance` and (optionally) has line-of-sight, a world-space UI bubble appears showing `ObjectText` + `ActionText` + `KeyboardKeyCode`. Press (or hold for `HoldDuration` seconds) the key to fire `PromptTriggered`. Input-agnostic (keyboard, gamepad, touch). `Exclusivity` modes (OnePerButton / OneGlobally / AlwaysShow) de-dupe overlapping prompts. `ClickablePrompt` lets mouse/touch users tap the bubble directly.

**Web equivalent:** DOM overlay positioned in screen-space from a world-space anchor.

- 2D game (Canvas) → compute distance in game coords, overlay a React/DOM bubble at `camera.worldToScreen(target)` when `dist < maxDist`.
- 3D game (Three.js) → project `worldPos` via `vector.project(camera)` → NDC `(x, y, z)` in [-1, 1] → `screenX = (x + 1) / 2 * canvasW`. Optional raycast from camera to target for line-of-sight.

Trigger via `keydown` listener matching `key`, progress ring via CSS `conic-gradient` or SVG `stroke-dasharray`.

**Problocks mapping:**
- Studio editor → not applicable.
- Game output → ship a `<ProximityPrompt>` React component in the game-output runtime that the AI can emit. Two variants: `<ProximityPrompt2D worldPos={[x, y]}>` and `<ProximityPrompt3D worldPos={[x, y, z]} camera={cam}>`.

**Sketch — reusable `<ProximityPrompt>`:**

```tsx
// game-runtime/ProximityPrompt.tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Props {
  worldPos: [number, number, number];
  camera: THREE.Camera;
  player: { position: THREE.Vector3 };
  canvas: HTMLCanvasElement;
  objectText?: string;
  actionText: string;
  keyLabel?: string;       // visual label, e.g. 'E'
  keyCode?: string;        // matches KeyboardEvent.code, e.g. 'KeyE'
  maxDistance?: number;
  holdDuration?: number;   // seconds; 0 = instant
  requiresLineOfSight?: boolean;
  onTrigger: () => void;
}

export function ProximityPrompt({
  worldPos, camera, player, canvas,
  objectText, actionText,
  keyLabel = 'E', keyCode = 'KeyE',
  maxDistance = 10, holdDuration = 0,
  requiresLineOfSight = false,
  onTrigger,
}: Props) {
  const [screenPos, setScreenPos] = useState<{x:number;y:number}|null>(null);
  const [inRange, setInRange] = useState(false);
  const [holdPct, setHoldPct] = useState(0);
  const holdStart = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  // per-frame: project worldPos -> screen, check distance + LoS
  useEffect(() => {
    const v = new THREE.Vector3();
    const targetVec = new THREE.Vector3(...worldPos);
    const raycaster = requiresLineOfSight ? new THREE.Raycaster() : null;

    const tick = () => {
      const dist = player.position.distanceTo(targetVec);
      let visible = dist <= maxDistance;
      if (visible && raycaster) {
        // cast from camera toward target, check no occluder
        raycaster.set(camera.position,
          targetVec.clone().sub(camera.position).normalize());
        // scope to tagged colliders only; see "gotchas" below
      }
      setInRange(visible);
      if (visible) {
        v.copy(targetVec).project(camera);
        const rect = canvas.getBoundingClientRect();
        setScreenPos({
          x: (v.x * 0.5 + 0.5) * rect.width,
          y: (-v.y * 0.5 + 0.5) * rect.height,
        });
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [worldPos, camera, player, canvas, maxDistance, requiresLineOfSight]);

  // keyboard handling with hold timer
  useEffect(() => {
    if (!inRange) return;
    const down = (e: KeyboardEvent) => {
      if (e.code !== keyCode || holdStart.current) return;
      if (holdDuration === 0) { onTrigger(); return; }
      holdStart.current = performance.now();
      const tickHold = () => {
        if (!holdStart.current) return;
        const pct = (performance.now() - holdStart.current) / (holdDuration * 1000);
        if (pct >= 1) { onTrigger(); holdStart.current = null; setHoldPct(0); }
        else { setHoldPct(pct); requestAnimationFrame(tickHold); }
      };
      requestAnimationFrame(tickHold);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === keyCode) { holdStart.current = null; setHoldPct(0); }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [inRange, keyCode, holdDuration, onTrigger]);

  if (!inRange || !screenPos) return null;
  return (
    <div
      style={{ position: 'absolute', left: screenPos.x, top: screenPos.y,
               transform: 'translate(-50%, -100%)' }}
      className="pointer-events-auto select-none"
      onClick={() => holdDuration === 0 && onTrigger()}
    >
      {/* key pill + action text + optional hold ring */}
      <div className="bg-zinc-900/90 text-zinc-100 rounded-lg px-3 py-1 text-sm">
        <span className="inline-block bg-white/10 rounded px-2 mr-2">{keyLabel}</span>
        {actionText}
        {objectText && <div className="text-xs text-zinc-400">{objectText}</div>}
      </div>
      {holdDuration > 0 && (
        <div className="h-1 bg-white/10 rounded mt-1"
             style={{ width: `${holdPct * 100}%`, background: '#22c55e' }} />
      )}
    </div>
  );
}
```

**How it could be used:** "Press E to open" on doors/chests, "Hold E to revive" teammates, "Tap to pick up" items, NPC dialogue triggers, quest handins, tutorial hints.

**Edge cases & gotchas:**
- **`requestAnimationFrame` on background tabs:** browser pauses RAF when tab is hidden, so the prompt will freeze at its last position — fine for gameplay, just document it.
- **Touch devices have no keyboard:** fall back to `ClickablePrompt` always-on (our component above already supports `onClick`).
- **`keydown` repeat:** auto-repeat fires `keydown` many times/sec. The `holdStart.current` guard prevents re-triggering hold logic.
- **Multiple prompts overlap:** implement `Exclusivity` in a singleton store — on each frame, compute angle-to-camera-forward for every in-range prompt, show only the smallest-angle one for `OnePerButton` / `OneGlobally`. Skip for MVP (`AlwaysShow`).
- **LoS raycast cost:** don't raycast against the full scene — tag occluder meshes (`userData.occluder = true`) and intersect only that list. 4 KB scene graph vs 400 KB scene graph is a 10× frame-time difference on Celeron.
- **`KeyboardEvent.key` vs `.code`:** use `.code` (physical key position) so AZERTY/QWERTZ still work — `.key` changes with layout.
- **Prevent default:** if the key is `Space` or arrows, call `e.preventDefault()` to stop page-scroll.
- **Reduced motion:** skip the hold-progress animation, trigger after a silent `setTimeout` instead.
- **Chromebook performance:** cap prompt update rate to 30 fps by skipping every other RAF frame if `performance.now() - lastTick < 33`.

**Recommendation:** port. High-value, low-complexity, and makes AI-generated games feel polished. Ship as `<ProximityPrompt>` in the game-runtime package.

---

## UI animation / TweenService (deep dive)

**Roblox does:** `TweenService:Create(obj, TweenInfo.new(duration, style, direction), {prop = target})` — tweens any animatable property (`Position`, `Size`, `Rotation`, `BackgroundTransparency`, `ImageColor3`, `UIStroke.Thickness`, `CanvasGroup.GroupTransparency`, etc.). 11 easing styles × 3 directions. Chain via `Completed` event. Typewriter effect built on `MaxVisibleGraphemes` + `task.wait`.

**Three web options on Celeron N4000 (4 GB RAM):**

| Approach | How it runs | Bundle cost | Celeron verdict |
|---|---|---|---|
| **CSS transitions / `@keyframes`** | Compositor thread for `transform`, `opacity`, `filter`. Layout-thread for `width`, `top`, etc. | 0 bytes | **Winner** for `transform`/`opacity` — effectively free, 60 fps even while JS is blocked. Loses for properties that trigger layout. |
| **WAAPI (`el.animate(keyframes, opts)`)** | Same compositor path as CSS when on composited props; browser handles timing off main thread. | 0 bytes (built in) | **Tied winner.** Gives you JS control (play/pause/reverse/onfinish) without a library. Supports `easing`, `iterations`, `direction`, `composite`. Use this for sequenced / interactive tweens. |
| **framer-motion** | `requestAnimationFrame` on main thread; reads current values, lerps, writes `style`. Uses MotionValue proxies to avoid React re-renders. | ~35 KB gz (v11 core); ~50 KB with common features | **Skip on game output.** Fine for the studio chrome (we already run React). On a Celeron, RAF tween of 8+ elements competes with game logic for the main thread and causes frame drops. |

**Recommendation matrix:**

| Use case | Use this |
|---|---|
| Hover scale / fade on a button | CSS `transition: transform 150ms ease-out` |
| Panel slide-in | CSS transition on `transform` |
| Size + transparency combo on a HUD | WAAPI `el.animate([{opacity:0, transform:'scale(0.9)'}, {opacity:1, transform:'scale(1)'}], {duration:250})` |
| Chained tweens | WAAPI `anim.finished.then(() => nextAnim.play())` |
| Typewriter text | Pure JS loop with `setTimeout`, no library (Roblox's own approach) |
| Interactive drag with spring snap-back | `@use-gesture` + WAAPI commitStyles, or framer-motion if studio-side |
| Path-following animation (spline) | WAAPI against an SVG `motion-path` (one-liner, GPU-accelerated) |

**Easing parity:** Roblox's 11 styles map directly to CSS `cubic-bezier()` except `Bounce` and `Elastic`, which need custom bezier chains or SVG `<animate>` calcMode=spline. Maintain a `robloxEasings.ts` lookup:

```ts
// studio-side port of Roblox EasingStyle names → cubic-bezier
export const EASINGS = {
  Linear:      'linear',
  Sine:        'cubic-bezier(0.47, 0, 0.745, 0.715)',
  Quad:        'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  Cubic:       'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  Quart:       'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  Quint:       'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  Exponential: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  Circular:    'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  Back:        'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  // Bounce, Elastic: require keyframes, not bezier
};
```

**Problocks mapping:**
- Studio editor → already done. Tailwind v4 `transition-*` utilities cover 90% of panel animations. For the few that need interactive timing (confirm dialog, toast slide), WAAPI via a tiny `useAnimate` hook. Do not add framer-motion just for the studio — not worth the payload.
- Game output → AI templates should emit WAAPI by default. Document a `tween(el, props, {duration, easing, direction})` wrapper in the runtime that feels like `TweenService:Create` + `:Play()`.

**How it could be used:** menu transitions, health-bar width changes, damage-number floating text, screen flashes, score counter roll-ups, fade-to-black cutscenes.

**Edge cases & gotchas:**
- **Animating `width`/`height`/`top`/`left`:** triggers layout every frame. Use `transform: scale` / `translate` instead. Only animate layout props on one-off UI transitions, never on per-frame game values.
- **`will-change: transform`** on hot elements, but remove it when the animation ends (permanent `will-change` bloats layer memory — serious on 4 GB Chromebooks).
- **Reduced motion:** respect `window.matchMedia('(prefers-reduced-motion: reduce)')`. Set `duration: 0` or skip the tween entirely.
- **`requestAnimationFrame` in background tabs:** paused. If a tween must complete regardless, use `setTimeout` + end-state commit on `visibilitychange`.
- **CSS transition interrupted by another transition** on the same property: the browser cancels cleanly. WAAPI needs explicit `anim.cancel()` or two `Animation` objects will fight; last write wins.
- **Text typewriter:** use `setTimeout`, NOT `task.wait`-style RAF loop — one character every 30 ms doesn't need 60 fps precision.
- **Transform composition order:** `rotate(45deg) translate(100px)` ≠ `translate(100px) rotate(45deg)`. Pick one convention for the whole codebase.
- **`UIStroke` equivalent:** CSS `outline` is cheap and doesn't affect layout; `border` causes layout. Use `box-shadow: 0 0 0 Npx color` for animated strokes.
- **Chromebook GPU:** Intel UHD Graphics 600 on N4000 has 4 compositor layers before it chokes. Keep the number of concurrently animated elements under ~8.

**Recommendation:** port the concept (WAAPI wrapper + easing map). Skip framer-motion for game runtime. Studio can stay on Tailwind transitions + one-off WAAPI.

---

## Path2D (2D splines)

**Roblox does:** `Path2D` is an editable spline (control points + optional mirrored tangents) living under a `ScreenGui` / `SurfaceGui`. Used for path-based animations (`GetPositionOnCurveArcLength(t)` → UDim2) and graph editors. Visual props: `Color3`, `Thickness`, `Visible`, `ZIndex`.

**Web equivalent:** SVG `<path d="M ... C ...">` with cubic Béziers, or Canvas `ctx.bezierCurveTo`. CSS Motion Path (`offset-path: path('M ...')`) moves an element along a path natively — GPU-composited. For arc-length parameterization (constant-speed animation), sample the path with `pathElement.getPointAtLength(t)` + `getTotalLength()`.

**Problocks mapping:**
- Studio editor → React Flow already draws connection edges (Bézier / smoothstep / step) between nodes. Don't build our own spline editor for that. If we later need a separate curve tool (e.g., tuning enemy flight paths), prototype with SVG + draggable control points.
- Game output → SVG path animations via CSS `offset-path` are the cheapest option for 2D games. For Canvas games, ship a `PathSampler` utility (control points in, `(t) => {x, y}` out) using de Casteljau + arc-length lookup table.

**How it could be used:** enemy flight paths in a shmup, conveyor belts, projectile pre-viz lines, guided tour cursor, level-select world map path.

**Edge cases & gotchas:**
- **Arc-length sampling:** naive `t ∈ [0,1]` on a Bézier is non-uniform speed. Precompute a lookup table of `(t, arcLength)` pairs at init, then binary-search for desired arc length. Same trick Roblox uses in `GetPositionOnCurveArcLength`.
- **CSS `offset-path`** doesn't support piecewise paths in Safari < 16; polyfill by splitting into multiple animated segments.
- **SVG path performance:** `getPointAtLength` is cheap (~µs per call). `getTotalLength` on a complex path can be 1–2 ms — cache it.
- **Editor picking:** hit-testing a draggable control point against a Bézier requires distance-to-curve math. Cheapest approach: sample the curve at 100 points, find nearest, subdivide. Already slow on Celeron if there are dozens of paths visible.
- **Pixel vs relative:** Roblox's points are `UDim2` (scale + offset). Mirror that: store `{scale: {x, y}, offset: {x, y}}` so paths scale with container, matching the Roblox semantic.

**Recommendation:** later. Nice-to-have for more advanced games; MVP doesn't need a path editor. When porting, start with the runtime `PathSampler` — it's useful immediately for AI-generated enemy movement even without an editor UI.

---

## Summary — port priority

| Concept | Priority | Lives in |
|---|---|---|
| Buttons (`PanelActionButton`, runtime `<GameButton>`) | **Now** | Studio done; game runtime TBD |
| UIDragDetector (runtime helper) | **Now** | Game runtime |
| ProximityPrompt (`<ProximityPrompt2D/3D>`) | **Now** | Game runtime |
| UI animation (WAAPI wrapper + easing map) | **Now** | Game runtime |
| 3D DragDetector | Later (Phase 2, when we ship Three.js template) | Game runtime |
| Path2D (runtime `PathSampler`) | Later | Game runtime |
| Path2D editor UI | Skip for MVP | — |

Celeron budget rule of thumb: any per-frame work (RAF tween, raycast, prompt projection) should stay under ~0.5 ms per item so we can run 10+ concurrently and still hit 60 fps with game logic on top.
