# 02 — Positioning, Sizing, and Styling

How Roblox Studio's UI primitives for layout and theming map to the Problocks web stack (Next.js 16 + Tailwind v4 + `panel-controls/`) and to AI-generated HTML5 game output (Canvas 2D / Three.js via CDN). Chromebook-first: every recommendation is filtered through the Celeron N4000 / 4 GB RAM / Intel UHD 600 constraint.

TL;DR: the Roblox concepts that map well are `UDim2`, `AnchorPoint`, `UIAspectRatioConstraint`, `UIPadding`, `UICorner`, `UIStroke`, `UIGradient`, 9-slice, and the query-based responsive system. The concepts that map poorly and should be skipped in the studio are `UIScale` (use browser zoom), `BorderSizePixel` (CSS borders are better), `TextScaled` (use `clamp()`), and the full `UIStyleSheet` runtime cascade (Tailwind already does this at build time).

---

## UDim2 (Scale + Offset)
**Roblox does:** Every `Position` and `Size` is `UDim2{ xScale, xOffset, yScale, yOffset }`. The final pixel value on each axis is `parent * scale + offset`. One tuple handles "50% of parent minus a 20 px gutter" without JS.
**Web equivalent:** `calc(50% - 20px)` or, better, `clamp(min, preferred, max)` / `min()` / `max()`. Raw `UDim2{0.5, -20}` is literally `calc(50% - 20px)`.
**Problocks mapping:**
- Studio editor → Expose a `UDim2Input` panel-control (two coupled `PanelSlider` pairs — `scale %` + `offset px`). Store as `{ xs: number, xo: number, ys: number, yo: number }` on the node config. Render a live preview pip in the right panel.
- Game output → AI emits CSS `calc()` on absolutely-positioned children, or `transform: translate(calc(Xs% + Xo px), calc(Ys% + Yo px))` to leverage GPU compositing. For Canvas games, resolve to pixels at draw time using the container's `clientWidth`/`clientHeight`.
**How it could be used:**
- HUD score label pinned 20 px from top-right regardless of viewport: `UDim2{1, -20, 0, 20}` + `AnchorPoint{1, 0}` → `right: 20px; top: 20px`.
- Menu card that's 80% of parent width but no wider than 480 px: `UDim2{0.8, 0, 0, auto}` + a `UISizeConstraint.MaxSize = (480, inf)` → `width: min(80%, 480px)`.
- Gutter-plus-percent layouts that used to need JS on window resize.
**Edge cases & gotchas:**
- `clamp()` needs all three args in the same dimensional family — don't mix `%` with `rem` without a `calc()`.
- Safari used to mis-round sub-pixel `calc()` — force integer pixels on small UI (borders, dividers) with `round()` if Chromebooks hit blur.
- CSS `vw`/`vh` include the scrollbar on desktop but not on iOS; prefer `%` of an explicit parent when possible.
- On Canvas, recompute UDim2 → px only on `ResizeObserver`, never per frame — dividing 1920×1080 arithmetic inside the render loop tanks N4000 fps.
- Tailwind arbitrary values (`w-[min(80%,480px)]`) work and stay compile-time; prefer these to inline styles.
**Recommendation:** **Port.** This is the single most valuable Roblox-to-web import. Build a first-class `UDim2Input` panel-control and make the AI emit it by default in generated layouts.

## AnchorPoint
**Roblox does:** `Vector2{0-1, 0-1}` fraction of the object's own size that defines its transform origin. `(0.5, 0.5)` = centered-on-position.
**Web equivalent:** `transform-origin` + `translate(-x%, -y%)`. Specifically: if anchor is `(ax, ay)`, apply `transform: translate(calc(-100% * ax), calc(-100% * ay))`.
**Problocks mapping:**
- Studio editor → A 3×3 `PanelButtonGroup` grid (9 anchor presets: TL, T, TR, L, C, R, BL, B, BR) plus a "custom" mode that reveals two `PanelSlider`s for non-snapping values. This is the one place `PanelButtonGroup` beats `PanelSelect` — the spatial 3×3 grid conveys meaning a dropdown can't.
- Game output → AI uses `position: absolute` + `left/top` from UDim2 + `transform: translate(...)` for anchor. For Canvas, apply the offset when computing draw coords.
**How it could be used:**
- Pin a button to bottom-right: `Position = UDim2{1,-16,1,-16}`, `AnchorPoint = (1,1)` → no "subtract my own width" math in the AI prompt.
- Centered modals: `Position = UDim2{0.5,0,0.5,0}`, `AnchorPoint = (0.5,0.5)` → `left:50%; top:50%; transform:translate(-50%,-50%)`.
**Edge cases & gotchas:**
- Combining `transform` for anchor with `transform` for animation requires composing them in the same rule (`transform: translate(...) scale(...)`) — don't let AI split them across rules, it'll overwrite.
- Sub-pixel transforms on Chromebooks can cause text blur; round to integer px when not animating.
- CSS Anchor Positioning API (2024) covers some of this but isn't safe on older Chrome OS builds — stick with transform.
**Recommendation:** **Port.** Add a 3×3 anchor picker to the studio inspector. AI should always emit anchor + position together.

## ZIndex
**Roblox does:** Integer per object, higher = in front. Children render above parents by default (`ZIndexBehavior.Sibling`).
**Web equivalent:** `z-index` on stacking-context-forming elements.
**Problocks mapping:**
- Studio editor → `PanelInput` (type=number) with small `+`/`−` steppers. Don't expose raw z-index across the app; reserve Problocks' `z-dropdown` (999), `z-modal`, `z-toast` tokens.
- Game output → AI picks from a 0–100 range for game UI. Document that anything above 100 collides with studio shell.
**How it could be used:** Layered pause menu, toast over HUD over gameplay.
**Edge cases & gotchas:**
- CSS `z-index` only works inside a stacking context — `position: static` elements are ignored. AI must pair `z-index` with `position: relative|absolute`.
- `transform`, `opacity < 1`, `filter`, and `will-change` all create new stacking contexts — surprising. Tooltip inside a `transform: translate` parent gets trapped.
- Problocks uses `z-dropdown: 999` globally; games are iframed so clashes are contained, but in-studio previews aren't — always sandbox game preview in an `<iframe>` or a new stacking root.
**Recommendation:** **Port** with guardrails (clamp game-level values 0–100, reserve 100+ for studio chrome).

## AutomaticSize
**Roblox does:** `AutomaticSize = X | Y | XY` grows the container to wrap its descendants' measured size. `Size` becomes the *minimum*.
**Web equivalent:** Default block/inline-block behavior, `width: fit-content`, `min-width: <size>`, or flex `min-content`.
**Problocks mapping:**
- Studio editor → `PanelSelect` with options None / X / Y / XY. When not None, the adjacent Size fields are re-labeled "Min size".
- Game output → AI emits `width: fit-content; min-width: 100px` or flex items with `flex: 0 0 auto`. For localized text labels, always pair with `max-width` to prevent 40-char German strings blowing out the HUD.
**How it could be used:** Tooltip that grows with text. Button that fits its label in any locale.
**Edge cases & gotchas:**
- `fit-content` + `position: absolute` can collapse to 0 in Safari — give it an explicit `max-width`.
- `text-wrap: balance` is Chromium 114+; OK for Chromebooks, not guaranteed on older kiosk devices.
- Auto-size on Canvas means re-measuring text each frame → use `ctx.measureText` once and cache.
**Recommendation:** **Port.** Default on for any text-bearing node.

## UIScale
**Roblox does:** Single scalar multiplier applied to a subtree's absolute size, including strokes and corner radii.
**Web equivalent:** `transform: scale()` + `transform-origin`. Or `zoom` (non-standard but Chromium-supported and cheaper).
**Problocks mapping:**
- Studio editor → **Skip** as a primitive. Don't expose a subtree scale slider — it confuses layout math and students won't understand why hit-testing drifts. Browser zoom / OS accessibility scaling already handle the use case.
- Game output → AI may use `transform: scale()` for a hover grow on a button, but not for layout.
**How it could be used:** Hover-grow micro-interaction on a button (`:hover { transform: scale(1.05) }`).
**Edge cases & gotchas:**
- `transform: scale` doesn't affect layout — parent stays the old size, siblings don't reflow. Often a bug.
- Scaled elements get blurry unless you use `will-change: transform` and integer final sizes.
- Chromebook GPU has only ~200 MB of video RAM; too many `will-change` layers cause a texture upload storm.
**Recommendation:** **Skip** as a studio primitive. **Port** only as a shorthand for hover/press animation (already covered by Tailwind `hover:scale-105`).

## UISizeConstraint (MinSize / MaxSize)
**Roblox does:** Hard pixel floor/ceiling on the child, overriding layout math.
**Web equivalent:** `min-width/min-height` and `max-width/max-height`, or `clamp()`.
**Problocks mapping:**
- Studio editor → Two `PanelInput` pairs (min X/Y, max X/Y) inside a collapsible `PanelSection` titled "Size constraints". Empty = no constraint.
- Game output → AI prefers `clamp(min, ideal, max)` on one axis where possible because it collapses to one line.
**How it could be used:** Ensure a HUD panel is never smaller than 240 px on phones nor wider than 480 px on desktop.
**Edge cases & gotchas:**
- `max-width` in a flex container is ignored if `flex-basis` wins — set `flex: 0 1 auto`.
- `clamp()` with `vw` units re-evaluates on every window resize; at 60 Hz this is free, but on a low-end Chromebook pair it with `contain: layout` on the parent.
**Recommendation:** **Port.** Collapsible section in the inspector.

## UIAspectRatioConstraint
**Roblox does:** Locks width:height ratio on the parent regardless of Size properties.
**Web equivalent:** `aspect-ratio: 16 / 9` (Chromium 88+, fine on Chromebooks).
**Problocks mapping:**
- Studio editor → `PanelSelect` with common presets (1:1, 4:3, 16:9, 9:16, 21:9, Custom). Custom reveals a numeric `PanelInput` for the ratio as a decimal (matching Roblox).
- Game output → `aspect-ratio: X / Y` on container; AI pairs with `width: 100%` or `height: 100%` depending on dominant axis (Roblox has a `DominantAxis` enum — preserve this as a second dropdown).
**How it could be used:** Square avatar thumbnails, letterboxed minimap, 16:9 video card.
**Edge cases & gotchas:**
- `aspect-ratio` is ignored when both `width` and `height` are explicitly set.
- Inside `display: grid` tracks, the track size wins — document that the constraint is for content-box sizing.
**Recommendation:** **Port.** Trivial, high-value, zero runtime cost.

## UITextSizeConstraint
**Roblox does:** Clamps text size between `MinTextSize` and `MaxTextSize` when `TextScaled` is on.
**Web equivalent:** `font-size: clamp(12px, 2.5vw, 32px)`.
**Problocks mapping:**
- Studio editor → Collapsible section "Text scaling" with a `PanelToggle` "Scale to fit" and two `PanelInput`s (min / max px). Default min = 12, never let AI or user set below 9 (Roblox docs explicitly warn at 9).
- Game output → AI prefers CSS `clamp()`. Avoid JS-driven measure loops.
**How it could be used:** Score readouts that shrink on phones but never become illegible.
**Edge cases & gotchas:**
- `clamp()` uses the *viewport*, not the parent. For parent-relative scaling use CSS container queries + `cqw` units (Chromium 105+ — fine on Chromebooks from 2022+).
- Enforcing a min ≥ 12 px is a WCAG-adjacent choice — document it as a target, not a law.
**Recommendation:** **Port** as `clamp()` sugar. Never ship `TextScaled` without a min.

## UIPadding
**Roblox does:** Insets content from each edge (top/right/bottom/left) using `UDim` per side.
**Web equivalent:** `padding` (obviously).
**Problocks mapping:**
- Studio editor → A 4-input cluster inside a `PanelSection`, with a link icon to sync all four to one value. Accept `UDim` (scale + offset) so AI can emit `calc(5% + 8px)`.
- Game output → AI uses Tailwind utilities (`p-4`, `px-6`) where possible, `padding: calc(...)` for UDim values.
**How it could be used:** Breathing room inside a card, gutter inside a scroll view.
**Edge cases & gotchas:**
- `box-sizing: border-box` is the studio default and must stay that way — Roblox's model is border-box equivalent.
- Percentage padding in a flex/grid child resolves against the *parent's inline size*, not the container.
**Recommendation:** **Port.** Standard.

## UICorner (rounded corners)
**Roblox does:** `CornerRadius` as `UDim` (scale rounds against the shortest edge → 0.5 = pill).
**Web equivalent:** `border-radius: <px>` or `border-radius: 9999px` for pill.
**Problocks mapping:**
- Studio editor → `PanelSlider` with unit toggle (px / %) and a "pill" preset button. Preview the corner live in the header thumbnail.
- Game output → `border-radius: clamp(...)` or static px. For Canvas, draw rounded rects via `ctx.roundRect()` (Chromium 99+).
**How it could be used:** Every button, card, modal, avatar.
**Edge cases & gotchas:**
- Anti-aliasing on N4000 Intel UHD 600 is fine for static radii, but radius-tweened animations cause CPU-side repainting. Use `transform: scale` for hover, not radius tweens.
- `overflow: hidden` + large radius + child video/canvas → Safari rounds the corner but keeps full-res paint behind it. Add `isolation: isolate` to avoid paint bugs.
**Recommendation:** **Port.** Default 8 px in the design system.

## UIStroke (border / text outline)
**Roblox does:** Configurable outline with color, thickness, corner style (Round/Bevel/Miter), gradient child, and inner/center/outer positioning.
**Web equivalent:** For **borders**: `border: Npx solid ...` (center-only equivalent is `outline`; `box-shadow: 0 0 0 N` for outer; `inset` for inner). For **text outlines**: `-webkit-text-stroke` or `text-shadow` stacks, or `paint-order: stroke fill` with `stroke` on SVG text.
**Problocks mapping:**
- Studio editor → Collapsible "Stroke" section with color picker, thickness `PanelSlider`, position `PanelSelect` (Inner / Center / Outer), and style `PanelSelect` (Solid / Bevel / Miter — but Miter/Bevel only meaningful on SVG, so label honestly).
- Game output → AI uses `box-shadow` stacks for outer strokes (pairs better with `border-radius`), `border` for inner. For text, prefer SVG text with `stroke` for crisp outlines; fallback `text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, ...` for low-end paths.
**How it could be used:** Cartoony text outlines, emphasized button borders, focused-state rings.
**Edge cases & gotchas:**
- `-webkit-text-stroke` is not standard but works in Chromium/Safari — safe on Chromebooks.
- Thick text strokes re-rasterize glyphs. Roblox warns against tweening thickness; same on the web — don't animate it. Animate `opacity` or `transform` instead.
- `box-shadow` with large spread values is a GPU cost on UHD 600 — cap outer-stroke shadows at 8 px spread and pair with `will-change: transform` only during interaction.
**Recommendation:** **Port** border mode. **Skip** the Bevel/Miter distinction on non-SVG elements; document it as "only applies to SVG text".

## UIGradient
**Roblox does:** Background gradient with `ColorSequence` (multi-stop), `NumberSequence` transparency, offset, and rotation.
**Web equivalent:** `linear-gradient(Ndeg, ...)` / `radial-gradient(...)` / `conic-gradient(...)`.
**Problocks mapping:**
- Studio editor → A dedicated `GradientEditor` panel-control (port from AutoAnimation if it exists; otherwise build one around `PanelSlider` + color stops list). Keypoints are draggable markers on a 1D track; rotation is a separate angle dial.
- Game output → AI emits `background: linear-gradient(...)`. For Canvas, `ctx.createLinearGradient` / `addColorStop` — resolve at draw time, cache the gradient object.
**How it could be used:** Title banners, health bars, vignettes, "shiny" button fills.
**Edge cases & gotchas:**
- `conic-gradient` is Chromium 69+; Chromebooks fine. But on UHD 600, large conic/radial gradients cause GPU bandwidth spikes — prefer linear when possible.
- Gradient transparency via `rgba` stops interacts poorly with `mix-blend-mode` — document blending caveats.
- Animating gradient stops via JS is expensive; use a fixed gradient + moving `background-position` for shine effects.
**Recommendation:** **Port** linear gradients fully. Radial/conic later.

## 9-Slice (ScaleType.Slice)
**Roblox does:** Divide an image into 9 regions; corners keep pixel size, edges stretch along one axis, center stretches both. Drives custom panel/button artwork at any size.
**Web equivalent:** CSS `border-image: url(x) N fill / W / O stretch` is the direct analog. Or `background-image` plus a stable `border-image-slice`.
**Problocks mapping:**
- Studio editor → A dedicated 9-slice editor modal triggered from any `ImageLabel`-style node. Drag 4 draggers on the source image; preview at multiple target sizes. Persist `{ top, right, bottom, left }` offsets in px. Use a `PanelSection` that expands to the full right-panel width when editing.
- Game output → AI emits `border-image: url(...) <slice> fill / <width> / 0 stretch;` for HTML. For Canvas games, ship a tiny `draw9Slice(ctx, img, slice, x, y, w, h)` helper in the game runtime kit — this is ~40 lines and runs fine on N4000.
**How it could be used:** AI-generated fantasy panel frames from PixelLab, reusable button skins, dialog boxes.
**Edge cases & gotchas:**
- `border-image` is quirky — the element needs a `border-width` to define the outer frame. Setting `border-style: solid; border-color: transparent; border-width: 16px` matching the slice width is the classic recipe.
- `image-rendering: pixelated` for pixel-art slices; UHD 600 scales nearest-neighbor faster than bilinear anyway.
- Non-power-of-two textures are fine in CSS but wasteful in WebGL — if Three.js games use 9-slice, pad to POT.
- Slices smaller than the target corner region get stretched instead of clipped — AI must validate `slice.top + slice.bottom < targetH`.
**Recommendation:** **Port.** Build the editor once, reuse for every image-backed UI node.

## BorderSizePixel / BorderColor3 (legacy)
**Roblox does:** Old-school 1-pixel frame border, pre-UIStroke.
**Web equivalent:** `border: 1px solid ...`.
**Problocks mapping:** Skip as a dedicated primitive — subsumed by UIStroke + CSS `border`.
**Recommendation:** **Skip.** Funnel into UIStroke.

## Layout structures (List / Grid / Table / Page)
**Roblox does:** `UIListLayout` (flex row/col), `UIGridLayout` (uniform cells), `UITableLayout` (row/col table), `UIPageLayout` (carousel).
**Web equivalent:** Flexbox, CSS Grid, `<table>`, and a custom carousel (Embla / pure CSS scroll-snap).
**Problocks mapping:**
- Studio editor → Each container node gets a `PanelSelect` "Layout" with None / List / Grid / Table / Pages. Each option swaps in a layout-specific collapsible section below (padding, alignment, direction, flex-align, wrap). Every control is a `PanelSelect` per the stricter 2+-options rule.
- Game output → Flex/Grid CSS. Carousel: emit `scroll-snap-type: x mandatory` + `scroll-snap-align: start` — zero JS, works on N4000 touchpad and touchscreen.
**Edge cases & gotchas:** Flex's `min-height: 0` trap in nested scrollers; CSS grid `minmax(0, 1fr)` idiom needed for text ellipsis.
**Recommendation:** **Port** all four. Covered in detail in a later doc on layouts — kept shallow here.

---

## Roblox Studio's Style Editor vs Problocks approach

Roblox 2025 introduced a visual **Style Editor** that mirrors CSS: `StyleSheet` + `StyleRule` (with class, tag, id, state, pseudo-instance selectors), `StyleDerive` for inheritance, `$attributes` for tokens/variables, and `@StyleQuery` for container + media queries. It's a runtime cascade resolved by the Roblox engine.

Problocks sits on **Tailwind v4 + a closed panel-controls library**, with design tokens in `src/app/globals.css` (`--panel-*`, `--accent`, `--studio-bg`, `--z-index-*`) registered through `@theme` so Tailwind generates `bg-panel-surface`, `text-accent`, etc. The panel-controls enforce the layout and tokens; users never write raw classes inside the right panel.

**Head-to-head:**

| Axis | Roblox Style Editor | Problocks |
|---|---|---|
| Distribution | Built into Studio; runtime-resolved | Tailwind at build time; zero runtime cost |
| Tokens | `$TokenName` attributes on sheets, swappable themes | CSS custom properties in `globals.css` + `@theme` registration, `.light` class override |
| Selectors | Class, `.tag`, `#name`, `::Pseudo`, `:Hover`, `>`, `>>`, selector lists | Tailwind utility composition; no selectors in user-authored panel configs |
| Variants | Query rules (`@ViewportDisplaySizeSmall`, etc.) | Tailwind responsive (`sm:` `md:`) + `html.quality-low` global overrides for Chromebook tier |
| Theming | Duplicate a theme sheet and swap attributes | `.light` class toggle with per-utility overrides — already in `globals.css` |
| Authoring UX | Visual rule editor inside the engine tool | Inspector-driven on nodes — no stylesheet authoring by end users |
| Performance on N4000 | Runtime cascade → every prop read is a lookup | Compiled Tailwind classes → pure CSS, already flat |

**Strategic position:** we **don't** want a runtime cascade. The AI generates HTML that ships Tailwind classes (or plain inline styles for games). Students never see a stylesheet. Tokens stay where they are: `src/app/globals.css` + `panel-controls/tokens.ts`.

Where Roblox's model is superior and worth cherry-picking:

1. **Tokens as first-class UI objects.** Expose a read-only "Design Tokens" panel in the studio showing the palette, radius, spacing scale — so the AI and the user share the same vocabulary. Implement as a static sidebar tab that reads from `globals.css` / `tokens.ts`.
2. **Style queries → container queries.** AI-generated games should use CSS container queries (`@container (min-width: 400px)`) for any HUD that could appear inside different viewport sizes. This is the web analog of `@StyleQuery MinSize` and is fully supported on Chromebooks from 2022+.
3. **`@ReducedMotionEnabledTrue` → `prefers-reduced-motion`.** Baseline: every AI-generated animation must be wrapped in `@media (prefers-reduced-motion: no-preference)`. Add this as a non-negotiable rule in the game-codegen prompt.
4. **`@PreferredInputTouch` → `@media (pointer: coarse)`.** Use for mobile button sizing (48 px touch targets — WCAG 2.5.5 / Apple HIG) and to disable hover effects on touch.

Where Roblox's model is worse and should not be imitated:

1. **Runtime cascade.** Don't build one. Tailwind already does this at compile time.
2. **`StyleSheet` nesting and `StyleDerive` chains.** Complexity > payoff for a classroom product. One theme layer (`.light`) is enough.
3. **Pseudo-instances modifying other children.** This is Roblox-specific metaphysics (`Frame::UICorner`). Web equivalent — nesting selectors — is a footgun in user-authored styles.

**Concrete ask for the codegen agent:** The AI should emit Tailwind utility classes for every game UI element, pulling from a 30-token palette (spacing 2/4/6/8/12/16/24/32, radius 4/8/12/9999, colors from `globals.css`, font-size clamp presets). It should only drop to inline `style=` when expressing a `UDim2` that needs `calc()` and doesn't fit a utility. No `<style>` blocks in user-facing output — they bloat HTML and fight with the host page's CSS if embedded.

---

## Cross-cutting gotchas (apply to every section)

- **Chromebook reality check.** N4000 has Intel UHD 600 with ~200 MB of VRAM and 4 GB system RAM shared. Avoid: large `backdrop-filter` stacks (already neutered in `globals.css` `quality-low`), many `will-change` layers, JS-driven per-frame layout recalculation, uncached `ctx.measureText`, non-POT Three.js textures.
- **DPI scaling.** Chromebooks ship at 1x, 1.25x, 1.5x, 2x. Use CSS logical pixels everywhere; don't hard-code `window.devicePixelRatio` math in AI-generated games (it's a performance trap and wrong on zoom).
- **Viewport units.** `vw`/`vh` include scrollbar on desktop; prefer `%` of a deliberate parent for HUD math. `svh`/`dvh` fix mobile address-bar jumps but Chromebooks don't need them.
- **Touch targets.** Minimum 44×44 CSS px per WCAG 2.5.5 / 48×48 per Material. Enforce in the studio inspector when `pointer: coarse` is likely (i.e. always, for student-shared games on phones).
- **Reduced motion.** Every tween, every hover-scale, every gradient shift wraps in `@media (prefers-reduced-motion: no-preference)`. Roblox's `@ReducedMotionEnabledTrue` query is the same idea — copy the discipline.
- **Z-index hierarchy.** Reserve 100+ for studio chrome; clamp game-level z-index to 0–99. Document in `docs/styling-guide.md`.
- **Tailwind arbitrary values.** `w-[clamp(240px,80%,480px)]` is legal and compile-time. Prefer these to inline `style=` where possible; they survive theming.
- **CSS containment.** Add `contain: layout paint` to large scrollable lists and grid-heavy studio panels — measurable win on N4000 React Flow renders.
