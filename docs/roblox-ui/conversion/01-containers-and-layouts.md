# Roblox → Problocks: Containers & Layouts

Scope: `ScreenGui`, `SurfaceGui`, `BillboardGui`, `Frame`, `ScrollingFrame`, `UIListLayout` + flex, `UIGridLayout`, `UITableLayout`, `UIPageLayout`.

Two targets throughout:
- **Studio editor** — the Next.js app at `src/app/studio/` (React Flow canvas + panel-controls shell). No runtime games here.
- **Game output** — the HTML5 bundle the AI generates and serves from `public/games/` or `/play/[gameId]`. Plain Canvas / Three.js via CDN, no React.

---

## ScreenGui (on-screen container)

**Roblox does:** A top-level container that clones from `StarterGui` into each player's `PlayerGui` on spawn. Holds all 2D HUD objects, has `Enabled`, `DisplayOrder`, `ResetOnSpawn`, and screen-inset policy.

**Web equivalent:** A fixed-position root layer (`position: fixed; inset: 0; pointer-events: none`) parented to `document.body` (or a React portal target), with child layers owning their own `pointer-events: auto` regions.

**Problocks mapping:**
- Studio editor → No direct equivalent. Our studio shell (`StudioLayout.tsx`) is not a HUD; it's the editor chrome. Skip.
- Game output → Each HUD layer is a `<div class="hud-root">` appended to the game's mount element. The AI emits one root per "ScreenGui" concept (title screen, settings, main HUD, pause overlay). `Enabled` becomes `hidden` attribute or `display: none`. `DisplayOrder` becomes a numeric `z-index` on the root div.

**How it could be used:**
- AI-generated platformer with: `hud-main` (score/lives), `hud-pause` (modal), `hud-title` (pre-game splash). Toggle visibility via a small `ui.js` helper the engine ships.
- Multi-scene games where each scene exposes its own HUD root.

**Edge cases & gotchas:**
- Chromebook perf: too many stacked `position: fixed` layers with `backdrop-filter` tank scrolling FPS on N4000 (4GB Celeron). Cap total HUD roots at ~4 per game; never nest `backdrop-blur` inside game HUD.
- Z-index: The Problocks studio owns z-index tokens (`z-dropdown` 999, `z-modal`, `z-toast`). Game-output HUDs live inside the game iframe/sandbox, so they have their own stacking context — no collision.
- Pointer events: forgetting `pointer-events: none` on the HUD root eats canvas clicks. AI template must always set it on the root and re-enable on interactive children.
- SSR: HUD roots must mount in `useEffect` or inside the iframed game — never render them server-side in the Next app.
- Respawn-clone behavior (`ResetOnSpawn`): we have no concept of player respawn in the host shell. The AI's game runtime re-initializes HUD state on `scene.restart()`; document this in engine API, don't try to mimic `ResetOnSpawn`.

**Recommendation:** Port later — include as a conventional pattern in the engine template once we have a second HUD example. No Studio work needed.

---

## SurfaceGui (in-experience container)

**Roblox does:** Renders a 2D UI onto a face of a 3D part, optionally `AlwaysOnTop`, with `Brightness`, `LightInfluence`, `MaxDistance`, `ZOffset`.

**Web equivalent:** Three.js `CSS3DRenderer` / `CSS2DRenderer`, or a `CanvasTexture` applied to a plane material. Browser has no "always on top over 3D" — requires a second overlay renderer pass.

**Problocks mapping:**
- Studio editor → Skip. Our studio is flat 2D panels.
- Game output → For Three.js CDN games: prefer `CanvasTexture` (draw once, upload to GPU) over `CSS3DRenderer` (DOM in a 3D transform). On Chromebook, DOM-in-3D kills FPS because it forces layer re-composition each frame. For 2D Canvas games, the concept is meaningless — AI should not emit SurfaceGui equivalents for 2D output.

**How it could be used:**
- In-world signboards, shop kiosks, arcade screens, in-world dialogue labels in Three.js games.
- Health bars on enemies that sit *on* the enemy model (not billboarded).

**Edge cases & gotchas:**
- `LightInfluence` ≠ free. Matching Roblox-style light-respecting UI means computing scene lighting into the texture — expensive. AI should emit `LightInfluence: 0` by default (unlit material) and only light-respond for aesthetic showcases.
- `MaxDistance` pop-in: use a fade shader on the material's opacity, not hard hide/show — prevents jarring flashes.
- Occlusion (`AlwaysOnTop`): requires a second render pass with `depthTest: false` on the material. Document this, don't auto-enable.
- `CanvasTexture` must call `needsUpdate = true` after each redraw; forgetting this is the #1 bug.
- Input: Three.js has no native click-on-SurfaceGui. AI needs a raycaster + UV-to-pixel mapping helper. This is non-trivial — provide a prebuilt helper in the engine template rather than asking the AI to generate it each time.

**Recommendation:** Skip for now. Revisit when we have a 3D template that demonstrably needs it. For signage, a Billboard is usually sufficient and 10× simpler.

---

## BillboardGui (in-experience, camera-facing)

**Roblox does:** UI that lives at a 3D position but rotates to always face the camera. Good for name tags, health bars, quest markers.

**Web equivalent:** Three.js `Sprite` (built-in billboarding), or a `CSS2DObject` via `CSS2DRenderer` (a DOM node positioned each frame by projecting 3D → screen).

**Problocks mapping:**
- Studio editor → Skip.
- Game output → Two concrete AI-emittable patterns:
  1. `THREE.Sprite` with a `SpriteMaterial` whose `map` is a small `CanvasTexture`. Fastest; stays on GPU.
  2. `CSS2DRenderer` + HTML `<div>` when the content is rich text/interactive. Slower but styleable with Tailwind-esque utility classes inside the game bundle.

**How it could be used:**
- Enemy nameplates and HP bars above heads.
- "Press E" prompt floating over an NPC (this is also Roblox's `ProximityPrompt` — out of scope here, covered elsewhere).
- Waypoint markers in tutorial games.

**Edge cases & gotchas:**
- Chromebook: `CSS2DRenderer` with >30 floating nameplates causes layout thrash (each uses a real DOM node updated per frame). Hard cap at ~16 visible billboards; beyond that, switch template to Sprite.
- `MaxDistance` distance-based fade: cheap with Sprite (`material.opacity`); expensive with CSS2D (reads DOM style). Default template should use Sprite.
- Text crispness: Sprite text rendered to `CanvasTexture` at low DPR looks blurry on retina; AI must render canvas at `devicePixelRatio` and scale the sprite inversely.
- Hit-testing: Sprite requires raycaster; CSS2D gets native DOM clicks for free. Trade-off should be documented in the game engine API doc.

**Recommendation:** Port later, as a pair of engine-template helpers (`createNameplate`, `createWaypoint`). Not needed until we have a Three.js game template.

---

## Frame (basic container)

**Roblox does:** A rectangular UI container. Can have background color / gradient / stroke. Has `ClipsDescendants` (overflow hidden) and `AutomaticSize` (X / Y / XY).

**Web equivalent:** A `<div>`. `ClipsDescendants` = `overflow: hidden`. `AutomaticSize` = `width: fit-content` / `height: fit-content` / both.

**Problocks mapping:**
- Studio editor → This is `PanelSection` from `src/components/ui/panel-controls/`. Every sub-panel in the right-panel must already be a collapsible `PanelSection` per project rules — no new Frame primitive.
- Game output → A plain `<div>` with utility classes baked into the game template's tiny CSS bundle. The AI engine should ship a `box(x, y, w, h, opts)` helper that emits the div + styles.

**How it could be used:**
- Studio: already heavily used; nothing to change.
- Game: AI-generated shop cards, settings rows, dialog boxes.

**Edge cases & gotchas:**
- `ClipsDescendants` + `Rotation`: Roblox explicitly disables clipping when any ancestor is rotated. In CSS, a rotated parent with `overflow: hidden` *does* still clip (via its axis-aligned bounding box). Behavior differs — if AI ports a rotated Roblox UI literally, the clip region will be wrong. Document: "don't combine rotate with overflow-hidden; use `clip-path` for rotated clips".
- `AutomaticSize` on a `PanelSection` containing long text can cause layout jumps when async-loaded content expands. Reserve min-height in panels that fetch.
- Inside React Flow canvas, avoid nesting a Frame-like `<div>` that itself wants `AutomaticSize: XY` inside a node — the zoom transform breaks `fit-content` measurements. Give nodes fixed widths.

**Recommendation:** Already done for the studio. For game output, bake a `box()` helper into the engine template now (low effort, high frequency).

---

## ScrollingFrame

**Roblox does:** A scrollable canvas with customizable scroll bars (`TopImage` / `MidImage` / `BottomImage`, `ScrollBarThickness`, `ScrollBarImageColor3`, `ScrollBarImageTransparency`). Supports `AutomaticCanvasSize`, `VerticalScrollBarInset`, elastic overscroll on touch.

**Web equivalent:** `overflow: auto` on a div. Scroll-bar styling via `::-webkit-scrollbar` (Blink/WebKit) and `scrollbar-width` / `scrollbar-color` (Firefox). Elastic overscroll is native on iOS / Android and can be toggled with `overscroll-behavior`.

**Problocks mapping:**
- Studio editor → Already used as `<div class="flex-1 min-h-0 overflow-y-auto">` inside every right-panel scroll region (matches AutoAnimation shell). Don't introduce a custom ScrollingFrame primitive — CSS + native scroll is enough.
- Game output → `<div style="overflow:auto">`. For inventory/shop lists where Roblox-style custom scroll-bar art matters, emit a `::-webkit-scrollbar-thumb` rule in the game CSS bundle.

**How it could be used:**
- Studio: task list, asset browser, comments feed, long settings panels — all already scroll natively.
- Game: inventory grids, chat logs, quest journals, end-of-run stats.

**Edge cases & gotchas:**
- Chromebook layout thrash: fully custom scroll-bar skins with `::-webkit-scrollbar` work fine on Blink, but any JS-driven scroll-bar (e.g. react-custom-scrollbars) forces extra reflow on every scroll event and murders FPS on N4000. **Rule: style the native scrollbar thumb only, never replace the scroll mechanism with JS.**
- Firefox on ChromeOS: `::-webkit-scrollbar` is ignored. Must also set `scrollbar-width: thin` and `scrollbar-color: <thumb> <track>`. Ship both in one CSS rule.
- `AutomaticCanvasSize` = just let content size itself; no CSS property needed. Don't emit fixed heights and then fight them.
- `VerticalScrollBarInset` (`None` / `Always` / `ScrollBar`): in CSS, `overflow: auto` reserves scroll-bar space only when content overflows, and `scrollbar-gutter: stable` makes it always reserved. Map Roblox `Always` → `scrollbar-gutter: stable`.
- Elastic overscroll: iOS Safari is elastic by default; `overscroll-behavior: contain` stops it (and stops scroll-chaining to the parent, which is usually what you want inside studio panels and game menus).
- React Flow: the canvas wheel handler competes with any child `overflow: auto` div. If a game-preview node contains scrolling content, you must stop propagation on wheel — React Flow's `onWheel` will otherwise zoom the canvas. Already an issue in the current NodeCanvas; note it here so the Frame conversion doesn't reintroduce it.
- SSR: scroll position is not hydrated; avoid rendering a scrolled-to-middle list from the server — always scroll after mount.

**Recommendation:** Port now as a documentation pattern (one paragraph in the engine docs). No new component. The native CSS approach is strictly better than Roblox's image-sliced scroll bar for our target hardware.

---

## UIListLayout + flex

**Roblox does:** Positions siblings into a row or column with `FillDirection`, `SortOrder` (LayoutOrder int or alphanumeric by Name), `HorizontalAlignment` / `VerticalAlignment`, `Wraps`, `Padding`, and flex modifiers (`HorizontalFlex` / `VerticalFlex` / `ItemLineAlignment`, plus per-item `UIFlexItem`).

**Web equivalent:** CSS Flexbox, 1:1. `FillDirection` = `flex-direction`. `Wraps` = `flex-wrap`. `Padding` = `gap`. Flex modes = `justify-content` / `align-items` / `flex-grow` / `flex-shrink`.

**Problocks mapping:**
- Studio editor → Tailwind `flex flex-col gap-2` / `flex flex-row gap-2` inside `PanelSection`. Already idiomatic. No new component needed.
- Game output → Same: plain Tailwind-style utilities or inline `style="display:flex;gap:8px"`. The engine template should document `row()` and `col()` helpers that emit flex divs.

**How it could be used:**
- Studio: control groupings inside a section (label + slider + unit), tab rows, button rows. All existing.
- Game: HUD arrangements (lives + score + timer), settings screen rows, dialog-choice lists.

**Edge cases & gotchas:**
- `SortOrder` by `LayoutOrder`: in React, source order *is* the layout order. Reproducing Roblox's integer `LayoutOrder` requires sorting the array before rendering. For AI-emitted games, just emit DOM in the desired order — don't model `LayoutOrder` as runtime state.
- `Wraps`: `flex-wrap: wrap` with `flex-basis` calculations — AI must set `flex-basis` on children, not just `width`, or wrapping breaks.
- `Padding` as scale (percentage): Roblox allows padding as a fraction of container size. CSS `gap` doesn't accept percentages reliably (works in grid, not flex in older engines). On Chromebook Chrome this is fine; on older embedded browsers avoid percentage `gap`.
- `VerticalFlex: SpaceEvenly` vs CSS `justify-content: space-evenly`: exact match. `SpaceBetween` = `space-between`. Straightforward.
- `ItemLineAlignment: Stretch`: maps to `align-items: stretch`. The Roblox doc specifically calls out uneven-tile layouts — useful pattern for marketplace cards. Document it.
- `UIFlexItem` (per-item flex): CSS `flex: 1 1 auto` on that specific child. Easy, but AI templates must know to emit it on the right child, not the parent.
- React Flow: flex children inside a React Flow node generally behave, but `flex-wrap` combined with a transformed ancestor can cause measurement flicker during zoom. If we ever add wrapped flex inside a node, lock the node width.

**Recommendation:** Port now, as a one-page "Flex cheat sheet: Roblox → Tailwind" doc for the engine templates. No code. This is the highest-ROI mapping of the set.

---

## UIGridLayout

**Roblox does:** Uniform-cell grid. `CellSize`, `CellPadding`, `FillDirection`, `FillDirectionMaxCells`, `SortOrder`. Respects per-item `UISizeConstraint`.

**Web equivalent:** CSS Grid with `grid-template-columns: repeat(auto-fill, minmax(<cell>, 1fr))` and `gap`. Or explicit `repeat(N, 1fr)` when cell count is fixed.

**Problocks mapping:**
- Studio editor → Asset browser thumbnail grid (`AssetsPanel.tsx`) and any "tile picker" panel. Use plain Tailwind `grid grid-cols-<n> gap-2`. Do not build a `PanelGrid` component until we have 3+ uses.
- Game output → Inventory tile grids, level-select screens, character-pick grids. AI emits `display: grid` divs.

**How it could be used:**
- Studio: asset thumbnails (images/audio/3D), template gallery, color palette picker.
- Game: inventory / shop / level-select / character-select.

**Edge cases & gotchas:**
- `FillDirectionMaxCells` (fixed column count) = `grid-template-columns: repeat(N, 1fr)`. Respects orientation automatically.
- Variable-cell-size grids (the `UISizeConstraint` interaction) = CSS subgrid or explicit `grid-column: span N`. Subgrid support on ChromeOS: landed in Blink 117 (mid-2023). Safe on modern Chromebooks; unsafe if users are on very old enterprise-managed devices. Prefer explicit `grid-column: span N` for portability.
- Chromebook perf: large grids (200+ items) need virtualization. Use `react-window` in the studio (AssetsPanel, once it has real assets); in games, implement manual windowing or limit item count.
- Image thumbnails in a grid: specify `width` / `height` attributes on `<img>` so layout doesn't jump as images load. Lazy-load with `loading="lazy"`.
- React Flow: a grid inside a node works fine, but zooming out to <0.5 makes thumbnails indistinguishable — provide a "summary" render when React Flow's `viewport.zoom < 0.5`.

**Recommendation:** Port now for AssetsPanel (we already need it). No new primitive; just Tailwind grid utilities. Revisit virtualization once asset counts exceed 100.

---

## UITableLayout

**Roblox does:** Parents are rows, children are cells. Shared row height and column width. Optional `FillEmptySpaceColumns` / `FillEmptySpaceRows` to stretch to fill.

**Web equivalent:** CSS `display: table` / `table-row` / `table-cell`, or CSS Grid with named row/column lines. Native `<table>` for tabular data.

**Problocks mapping:**
- Studio editor → Settings tables (integrations list, classroom roster, billing history). Use native `<table>` — screen-reader accessibility and semantic HTML are worth it.
- Game output → Leaderboard / stats screens. Native `<table>` is fine, or a CSS Grid with two columns.

**How it could be used:**
- Studio: classroom roster (student, email, games played, earnings), API key list, credit-usage history.
- Game: end-of-run stats, leaderboards, crafting recipe cards.

**Edge cases & gotchas:**
- `<table>` has fixed layout quirks (`table-layout: fixed` vs `auto`). `fixed` is faster — use it when you know column count and approximate widths. Default `auto` can cause reflow storms on large tables.
- Tables don't flex/scroll the way divs do. Wrap in `overflow: auto` to scroll horizontally on narrow viewports.
- `FillEmptySpaceColumns` ≈ giving one `<td>` column `width: 100%` and fixed widths on siblings. Non-obvious; document the trick.
- Chromebook: very large tables (1000+ rows) must be virtualized. For the studio, use `@tanstack/react-virtual` or `react-window`.
- React Flow: tables inside React Flow nodes render OK but touch-scroll gestures on the horizontal overflow compete with the canvas pan. Stop-propagation on touch events inside the node body.
- SSR: tables hydrate correctly but zebra-striping via `:nth-child` must be pure CSS — don't compute stripe in JS or hydration flash will show.

**Recommendation:** Port later, when we have a concrete studio table (classroom roster is the first). Native `<table>` with Tailwind classes; no new component.

---

## UIPageLayout

**Roblox does:** Siblings of a container become individual pages; scripted `:Next()` / `:Previous()` / `:JumpToIndex()` methods transition between them.

**Web equivalent:** A paginated component — a state variable holding the current page index and CSS transitions between snapshot views. Or a horizontal snap-scroll container (`scroll-snap-type: x mandatory`).

**Problocks mapping:**
- Studio editor → Onboarding wizard (`src/components/studio/modals/OnboardingWizard.tsx` already exists), multi-step publish flow, tutorials. One existing implementation; extract the pattern only if a second use case appears.
- Game output → Tutorial carousels, character-customization steps, in-game tutorial slides. AI emits a tiny pager helper.

**How it could be used:**
- Studio: Onboarding wizard (done), project-publish wizard, "first-time AI generation" tour.
- Game: pre-game tutorials, multi-step character setup, store category pages.

**Edge cases & gotchas:**
- Animated page transitions (slide/fade): use CSS `transform` + `transition` on a track, not unmount/remount — remount loses scroll position and refocuses. For a 5-page wizard, keep all five in the DOM and transform the track.
- Chromebook: GPU-accelerated `transform: translateX()` on a 3-page track is fine. Avoid box-shadow on the sliding layer (forces CPU paint).
- Keyboard a11y: arrow keys / PageUp / PageDown should page. Focus must move with the active page so screen readers re-announce.
- Scroll-snap pagers feel native on touch but give weird partial-scroll states on trackpad + mouse wheel. For the studio (mouse/trackpad primary), use button-driven state, not scroll-snap. For games on ChromeOS touchscreens, scroll-snap is OK.
- React Flow: page-layout patterns should *not* live inside a React Flow node — the zoom transform makes CSS transitions janky. If a node wants multi-tab content, use `PanelIconTabs` (tabs, not page transitions) and swap children.
- SSR: if the initial page index is determined by a query param, read it server-side to avoid a flash of page-1 before hydrating to page-3.

**Recommendation:** Skip as a primitive; port later as a `Pager` pattern doc when we extract Onboarding's logic. One of: reuse OnboardingWizard, or write a 50-line headless `usePager` hook.

---

## Summary table

| Roblox concept       | Studio action            | Game-output action                            | Priority |
|----------------------|--------------------------|-----------------------------------------------|----------|
| ScreenGui            | Skip                     | Template pattern (HUD roots)                  | Later    |
| SurfaceGui           | Skip                     | Skip until 3D template demands it             | Skip     |
| BillboardGui         | Skip                     | Sprite + CSS2D helpers in Three.js template   | Later    |
| Frame                | Already = PanelSection   | `box()` helper in engine template             | Now      |
| ScrollingFrame       | Native overflow-auto     | Native overflow + ::-webkit-scrollbar CSS     | Now (doc)|
| UIListLayout / flex  | Tailwind flex            | `row()` / `col()` helpers + cheat-sheet doc   | Now      |
| UIGridLayout         | Tailwind grid utilities  | CSS Grid in AI-emitted game                   | Now      |
| UITableLayout        | Native `<table>`         | Native `<table>`                              | Later    |
| UIPageLayout         | Reuse OnboardingWizard   | Track + transform pager helper                | Later    |

**Overall principle:** Roblox's UI primitives map almost 1:1 to CSS Flexbox / Grid / overflow / transforms. Do not build Roblox-shaped React components — build Tailwind conventions and engine-template helpers. The one place a custom primitive earns its keep is `PanelSection` (already done) because it encodes the collapsible + titled + border convention the studio needs everywhere.
