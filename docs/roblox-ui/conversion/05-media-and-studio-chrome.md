# 05 — Media + Studio Chrome (Editor UX)

Conversion map from Roblox Studio primitives to Problocks (Next.js 16 + React Flow + Zustand + Tailwind v4 + Supabase) for the **editor shell** and **in-experience media** surfaces. Scope covers `VideoFrame`, `ViewportFrame`, `Explorer`, `Properties`, Plugin/Widget system, and toolbar/layout chrome. Target hardware: Celeron N4000 / 4 GB Chromebooks — all recommendations bias toward a single shared renderer, aggressive lazy-load, and no per-tile WebGL contexts.

Problocks already has:

- `StudioLayout.tsx` — 3-column shell (LeftPanel, center, right panel) with padded gaps and glass aside tokens.
- `LeftPanel.tsx` — `DropdownSectionHeader`-style group switcher over `scene | assets | chat`.
- Right panel is **context-switched** in `StudioLayout`: `PartPropertiesPanel` (selected part), `WorkspacePropertiesPanel` (lighting), `TaskDetailPanel` (task). No single generic `NodeProperties` anymore.
- `PanelSection / PanelSelect / PanelSlider / PanelToggle / PanelActionButton / PanelIconTabs` building blocks.

---

## ViewportFrame (embedded 3D preview)

**Roblox does:** `ViewportFrame` renders a child 3D `Model` through a dedicated `Camera` into a 2D rectangle in the UI hierarchy. Supports its own `Ambient`, `LightDirection`, `LightColor`, `ImageColor3`, `ImageTransparency`, optional `Sky` cubemap for reflections. One viewport per UI node, cheap because Roblox shares its scene renderer.

**Web equivalent:** Three.js scene rendered into a `<canvas>` positioned under a DOM rect. The naive port — one `THREE.WebGLRenderer` per tile — is catastrophic on Chromebooks (each context costs ~30–50 MB VRAM, and browsers cap live contexts at ~16 before evicting them).

**Problocks mapping:**
- Studio editor → New `ThreePreview` component usable anywhere a thumbnail shows up: `AssetsPanel` tiles, `ScenePanel` leaf rows, marketplace cards, task cover images for "3D model" deliverables. Must use a **shared renderer pool** (see below) and mount inside `PanelSection` when embedded.
- Game output → In generated HTML5 games, an asset inventory or minimap would be a standard `<canvas>` the AI-generated code writes to (Three.js CDN already allowed per engine decisions in memory). No special primitive needed.

### Renderer-pooling pattern for `<ThreePreview>`

One `WebGLRenderer` for the whole studio, drawn to an offscreen canvas, then blitted into each visible tile via `drawImage` on the tile's own 2D canvas. This is the only pattern that scales to 20+ simultaneous previews on N4000.

```
src/lib/three-preview/
  renderer-pool.ts      ← single WebGLRenderer, 512x512 offscreen canvas
  scene-cache.ts        ← Map<modelUrl, GLTF> with LRU eviction
  ThreePreview.tsx      ← <canvas> tile; subscribes to pool, receives frames
  use-three-preview.ts  ← hook: mount/unmount, visibility via IntersectionObserver
```

Core loop:

1. `renderer-pool` owns one `WebGLRenderer({ antialias: false, powerPreference: 'low-power' })`, `THREE.Scene`, `PerspectiveCamera`, and a round-robin request queue.
2. `ThreePreview` tile registers `{ modelUrl, rotation, targetCanvas2d }` with the pool when it becomes visible (`IntersectionObserver` root-margin `200px`).
3. Pool per-frame: pop up to N requests (N=2 on low-end detected via `navigator.hardwareConcurrency <= 4`), swap scene contents to the cached GLTF, render to its offscreen canvas, then `targetCtx.drawImage(offscreenCanvas, 0, 0, w, h)` into each waiter. Requests coalesce so an idle tile re-uses the last frame.
4. Invisible tiles are dropped from the queue — they keep their last `drawImage` result as a static thumbnail.
5. Cache GLTF parses in `scene-cache` keyed by URL; evict on LRU beyond ~30 models.
6. Expose `refresh()` so hover / selection can force a new frame on one tile.

Public API:

```tsx
<ThreePreview modelUrl="/assets/hero.glb" rotation="auto" size={96} />
```

Ambient / light direction / tint mirror `ViewportFrame.Ambient` etc. — three uniforms on a shared `MeshStandardMaterial`, no per-tile lights.

**How it could be used:**
- Assets panel: every `.glb` / `.fbx` tile rotates slowly instead of showing a screenshot, matching Roblox's Toolbox feel.
- Scene hierarchy rows: a 24 px preview chip beside each `MeshPart` row.
- Marketplace game cards: a 160 px preview of the hero object, auto-pauses off-screen.
- Classroom grading: teachers scrub a roster of student asset previews without loading each page.
- `PartPropertiesPanel` header: small preview of the selected part's mesh.

**Edge cases & gotchas:**
- **Context loss** — Chromebooks will drop the WebGL context on tab-blur or memory pressure; pool must listen for `webglcontextlost`/`restored` and re-upload cached GLTFs.
- **IntersectionObserver + React Flow** — canvas pan/zoom doesn't fire scroll events on the root, so we need the observer rooted on the canvas viewport, not the body.
- **Pixel ratio** — force `renderer.setPixelRatio(1)` on low-end; 2× is ~4× fragments.
- **SSR** — Three.js is client-only; the component must be a `'use client'` leaf and the pool lazy-imported (`await import('three')`) so Next 16's prerender doesn't choke.
- **Transparent PNG fallback** — if WebGL is unavailable (Chromebook kiosk mode), render a stored screenshot from Supabase storage instead. Supply `fallbackImageUrl` prop.
- **Memory ceiling** — hard-cap offscreen canvas at 512 px; anything bigger won't be legible in a 96 px tile anyway.
- **No per-tile `requestAnimationFrame`** — this is the fatal mistake; one rAF in the pool only.

**Recommendation:** Port — **Phase 2**, after the native WorkspaceView ships. Gated behind a feature flag because N4000 behavior needs real-device testing before shipping to classroom.

---

## VideoFrame (embedded video)

**Roblox does:** `VideoFrame` plays an uploaded video asset inside a UI rect (max 2 simultaneous, mp4/mov only, 5 min / 3.75 GB cap). Properties `Looped`, `Playing`, `Volume`, `Video` (asset ID).

**Web equivalent:** `<video>` element, optionally with MSE/HLS for adaptive streaming. MP4 (H.264 + AAC) for broad support; HLS via `hls.js` for bandwidth-aware streaming when duration > ~2 min.

**Problocks mapping:**
- Studio editor → New `LessonVideo` component (sticky footer PanelActionButton pattern preserved). Lives in `ChatPanel` (tutorials), `SettingsPanel` (onboarding), and a future `HelpPanel`. Loads lazily via `next/dynamic` so the studio bundle doesn't pay for video-player code on cold start.
- Game output → Standard `<video>` tag written into the AI-generated HTML. The engine CDN list should NOT include `hls.js` — keeps game payload small; use MP4 only for in-game cutscenes.

Component shape:

```tsx
<LessonVideo
  src={signedUrl}         // Supabase storage signed URL, 1h TTL
  poster={posterUrl}
  hlsManifest={hlsUrl}    // optional; picks hls.js path if set
  autoplay={false}        // never autoplay with sound in classroom
  captionsUrl={vttUrl}
/>
```

**How it could be used:**
- Classroom onboarding: 30 s "what is a node?" clip on first studio load.
- Task deliverables: teachers upload a demo video showing the expected result; student sees it pinned inside `TaskDetailPanel`.
- Marketplace: game cards play a 10 s silent hero-loop on hover (MP4, muted, `playsInline`).
- AI-generated tutorials: Claude explains a step → ElevenLabs TTS + a looping screen-capture MP4.
- In-game cutscenes: the AI engine drops a `<video>` into the HTML output.

**Edge cases & gotchas:**
- **Autoplay policy** — Chrome/Safari block audio autoplay; always start `muted` + `playsInline`, unmute on explicit play click.
- **Codec support** — AV1 not decoded on N4000; stick to H.264 baseline profile for tutorials. HEVC is a no on Chromebook.
- **HLS vs MP4** — under 2 min → MP4 + `preload="metadata"`. Over 2 min or classroom bandwidth concerns → HLS via `hls.js` dynamic import (adds ~30 KB only when needed). Safari has native HLS, skip the library there.
- **Signed URLs** — Supabase signed URLs expire; renew via `onError` handler that re-fetches the URL from a `/api/video-url` route. Never bake the bucket URL into the DB.
- **CORS** — video element doesn't need `crossOrigin` unless you read frames into a canvas. If we extract posters client-side we must set `crossOrigin="anonymous"` and the bucket must send `Access-Control-Allow-Origin`.
- **Lazy-load** — `<video preload="none">` + `IntersectionObserver` to set `src` only when the tile enters the viewport. Otherwise marketplace grids preload dozens of manifests.
- **Storage quota** — Supabase storage cost is the real ceiling; 720 p + H.264 at 1.5 Mbps is the sweet spot. Reject uploads > 250 MB in the upload UI, and transcode anything larger in a background worker (later).
- **Pointer-events through iframes** — if the video sits inside the game preview iframe, the studio shell cannot intercept play/pause hotkeys; document this and avoid global media keys.
- **Captions** — ship a `.vtt` sidecar for every tutorial; required for classroom accessibility.

**Recommendation:** Port — **Phase 1** for MP4-only `LessonVideo` (tutorials + onboarding). Defer HLS + transcoding pipeline to Phase 3 when we actually have user-submitted video.

---

## Explorer + Properties (tree + inspector)

**Roblox does:**
- **Explorer** is a live hierarchical tree of every instance in the DataModel. Keyboard-navigable (`←/→/Home/End/PageUp/PageDown`), drag-to-reparent, `+` insertion, right-click context menu, power-user search DSL: `is:Part`, `tag:LightSource`, `ClassName = Decal`, `Position.X > 10`, `Cart.**` descendants, logical `and`/`or`, wildcard `*`. Shift-select respects filter (only matches between anchors).
- **Properties** is a key/value inspector for the current selection, grouped into sections (Appearance, Transform, etc.), collapsible, property filter input, multi-select edit (mixed values shown blank), plus user-definable **Attributes** and **Tags** at the bottom. "Save as Default [Instance]" persists locally.

**Web equivalent:** Any tree-view + property-grid combo (react-arborist / custom). The paradigm maps cleanly onto React + Zustand selectors — the selected-node id lives in the store, panels subscribe to it.

**Problocks mapping:**
- **Studio editor — Explorer →** `ScenePanel` inside `LeftPanel` group `scene`. Today it renders scene parts + a `Workspace` pseudo-root. What to steal, ranked:
  1. **Filter DSL (high value, medium cost)** — even a subset (`name`, `is:partType`, `tag:foo`, `anchored=true`) is huge once scenes cross 50 parts. Tokenize in a `lib/scene-query.ts`, return a predicate, feed it into the existing `ScenePanel` map filter. Use a `PanelSearchInput` at the top of the panel.
  2. **Keyboard navigation** — `←/→` expand/collapse, `↑/↓` move selection, `Home/End`, `Ctrl+Shift+X` to focus the filter. Already partially in place via `useHotkeys` infra.
  3. **Multi-select + shift-click respecting filter** — one new store field `selectedPartIds: string[]`, update `PartPropertiesPanel` to render mixed values as empty inputs (existing `PanelSlider`/`PanelInput` need a `mixed` prop).
  4. **Reveal-in-canvas** — right-click → "Frame in viewport"; posts `{ type: 'frameModel', id }` to the game iframe or calls `WorkspaceView` camera controller. This is the single highest-impact steal because tree ↔ canvas desync is the main UX complaint.
  5. **Drag-to-reparent** — already possible via React-DnD; low priority since Problocks scenes are flat today.
  6. **`+` insertion menu** — already implemented as the Assets drop flow; skip.
- **Studio editor — Properties →** `PartPropertiesPanel` / `WorkspacePropertiesPanel` / `TaskDetailPanel`. What to steal:
  1. **Property filter input** at the top of `PartPropertiesPanel`, matching substring against `PanelSection` titles + field labels. One-line addition on top of `PanelSearchInput`.
  2. **Property groups as `<PanelSection collapsible>`** — already enforced by the global rule; just make sure every panel uses the same group names (`Transform`, `Appearance`, `Physics`, `Behavior`) so muscle memory works.
  3. **Persistent collapse state per class** — Roblox remembers "I collapsed Transform" across selections. Store in `studio-store` keyed by part-type; trivial.
  4. **Attributes** — user-defined key/value store at the bottom. Maps to scene-store's free-form `metadata` bag; expose in a collapsible `Attributes` section with +/− rows of `<PanelSelect type>` + `<PanelInput value>`.
  5. **Tags** — `CollectionService`-style. Useful for AI targeting ("move all objects tagged `enemy`"). A new `tags: string[]` field on `ScenePart` + a tag chip editor.
  6. **Save as Default** — skip for v1; we don't have a defaults system yet.

- **Game output →** The running HTML5 game just has its own JS data model; Explorer/Properties are editor-only. For debugging we could ship a dev-only overlay that inspects the game's scene graph via `postMessage`, but that's a separate tool.

**How it could be used:**
- Student types `is:enemy Health<20` in Scene filter → multi-selects wounded enemies → one slider in Properties raises their Health field. That's the Roblox dream, totally ownable on web.
- AI agent writes to the selection by name: "select everything tagged `tree` and set `CastShadow=false`" becomes a few store calls; the query DSL is literally the AI's API too.
- Teachers grade: filter to `is:script Modified=today`, skim the inspector for each.
- Marketplace preview: a read-only Explorer + Properties pair so buyers can inspect what's inside a game template before purchase.

**Edge cases & gotchas:**
- **Perf at scale** — flat virtualization (`react-virtuoso` or `@tanstack/react-virtual`) the moment the tree crosses ~200 nodes; N4000 repaints a whole list on every selection change today.
- **Filter DSL parser must be safe** — never `eval`. A tiny PEG or hand-rolled tokenizer; reject unknown ops so we can extend later.
- **Mixed-value rendering** — `PanelSlider` currently assumes a number; add a `mixed?: boolean` prop that shows "—" and commits the typed value to every selected id on blur.
- **Keyboard shortcuts vs browser** — `Ctrl+D` (Duplicate) conflicts with Chrome's bookmark dialog; use `Ctrl+Alt+D` on web or warn in a first-run tooltip. `Ctrl+Shift+X` is the Roblox filter-focus shortcut and it's free on Chrome.
- **Reveal-in-canvas with React Flow** — React Flow's `useReactFlow().fitView({ nodes: [...] })` works; for 3D it's `camera.lookAt` on the part's world position.
- **Undo/Redo** — Roblox's `ChangeHistoryService` expects every property change to commit a waypoint. We need one in `studio-store` (command pattern) before we expose multi-select edit, or one "set Color on 40 parts" edit becomes 40 undo steps.
- **Attribute naming** — Roblox forbids spaces; enforce the same so query-DSL `attr:myThing = 5` stays parseable.
- **Collapsed state leaks across projects** — scope the per-class collapse map to the current project id, not globally.

**Recommendation:** Port — **Phase 1 for filter DSL + reveal-in-canvas + property filter**, **Phase 2 for multi-select edit + attributes + tags**. Skip Save-as-Default.

---

## Plugin / Widget system

**Roblox does:** Lua plugins create `DockWidgetPluginGui` panels, register toolbar buttons, read `Selection`, mutate the DataModel, participate in `ChangeHistoryService`. They run with full engine access. Sold on the Creator Store; community extends Studio freely.

**Web equivalent:** No single standard. Options: postMessage + sandboxed `<iframe>` (the only safe choice for untrusted code), Shadow DOM + restricted API, or a native "plugin" really being a typed npm module that gets bundled at build time (Figma-style). For Problocks — where classroom teachers and third-party AI tools are the audience — **arbitrary JS in a classroom tab is a hard no**.

**Problocks mapping:**
- Studio editor → Plugins live as iframes in a new left-panel group `plugins` and/or right-panel context. Host ↔ plugin RPC over `postMessage` with a typed contract. Plugin manifest + iframe entry lives in Supabase storage; verified plugins ship signed manifests.
- Game output → Not applicable; plugins only run in the editor.

### Minimal plugin contract

**Manifest (`plugin.json`):**

```json
{
  "id": "acme.color-grade",
  "name": "Color Grade",
  "version": "1.0.0",
  "author": "acme",
  "entry": "index.html",
  "mountPoint": "right-panel" | "left-panel-group" | "topbar-dropdown",
  "permissions": [
    "scene:read",
    "scene:write:color",
    "assets:read",
    "ai:chat"
  ],
  "sandboxRoles": ["allow-scripts"]
}
```

**Entry point** is a single HTML file loaded as `<iframe src="..." sandbox="allow-scripts">`. No `allow-same-origin` for untrusted; that kills cookie/localStorage access and forces everything through RPC.

**Host RPC surface (host → plugin):**

```ts
type HostCall =
  | { id: string; method: 'scene.list'; params: { filter?: string } }
  | { id: string; method: 'scene.get'; params: { partId: string } }
  | { id: string; method: 'scene.update'; params: { partId: string; patch: Partial<ScenePart> } }
  | { id: string; method: 'assets.list'; params: { kind?: 'glb'|'png'|'mp3' } }
  | { id: string; method: 'ai.chat'; params: { prompt: string } }
  | { id: string; method: 'ui.toast'; params: { type: 'info'|'error'; message: string } }
```

Every call is permission-checked against the manifest before dispatch. `scene.update` with a `color` patch is allowed if manifest declares `scene:write:color`; anything else rejects with `{ error: 'permission_denied' }`. The permission grammar is deliberately fine-grained (`scene:write:color`, `scene:write:transform`) so a color-grade plugin can't silently teleport the player.

**Plugin events (host → plugin):** `selection.changed`, `scene.changed`, `project.saved`.

Undo/redo is host-managed: the host wraps every `scene.update` RPC in a `ChangeHistoryService`-equivalent waypoint. Plugins don't need to know.

### Security model

- **Sandbox** — `<iframe sandbox="allow-scripts">`, no `allow-same-origin`, no `allow-top-navigation`. Plugin cannot read parent cookies, cannot navigate the window, cannot hit `fetch('/api/...')` as the user.
- **Network** — plugins that need HTTP go through a host-mediated `net.fetch` RPC with an allow-list in the manifest (`"network": ["api.acme.com"]`). Host enforces CORS + rate limits.
- **Storage** — plugins get a keyed bucket `pluginStorage.get/set(id, key, value)` backed by the host, not IndexedDB directly. Host enforces a 1 MB quota per plugin per project.
- **Classroom lockdown** — teacher setting `plugins.allowList = ['verified']` blocks everything not signed by Problocks. Default for any classroom account.
- **Arbitrary JS is the top risk** — a malicious plugin could exfiltrate AI chat history, student work, or phish teachers by rendering a convincing login prompt. Mitigations: (a) signed manifests for the verified tier; (b) visible "Plugin Panel" chrome the plugin can't restyle; (c) CSP on the plugin iframe blocking `eval` and inline scripts unless declared.
- **Manifest approvals** — a new permission triggers a modal ("Color Grade wants to write to scene transform — allow?") on install; revocable from `SettingsPanel`.
- **Resource ceilings** — iframe pinned to 300 px wide in the right panel; N4000 dies if every tab-plugin spawns its own Web Worker, so Web Workers are allowed but host throttles total count.
- **postMessage origin checks** — host only accepts messages whose `event.source` matches the known plugin iframe `contentWindow`; ignore everything else.

### How it could be used

- **AI tool panels** — PixelLab, Meshy, Suno, ElevenLabs ship as first-party plugins with pre-approved permissions (`assets:write`). Same plugin surface as third parties → no special code path.
- **Classroom widgets** — teacher-authored "Check my progress" panels that read scene state and rubric-score it.
- **Curriculum packs** — a `right-panel` plugin that walks a student through a guided build, annotating their scene via `ui.toast` + `scene.update` patches.
- **Marketplace extensions** — community-built analytics dashboards for game creators (CCU, DAU, revenue), mounted as a `topbar-dropdown` plugin.

### Edge cases & gotchas

- **Frame nav bugs** — an untrusted iframe calling `parent.location = '...'` would hijack the session; sandbox flags block it, double-check in Safari.
- **Pointer-events through iframes** — drag interactions between studio and plugin don't cross iframe boundaries; "drag an asset into a plugin" needs `ondragover` RPC, not native HTML5 DnD.
- **Dock panels vs fixed 3-panel shell** — Roblox lets widgets dock anywhere; we'd have to either add floating/detachable windows (big feature, later) or just pick two canonical mount points (`right-panel-tab`, `left-panel-group`) and be done.
- **Keyboard shortcuts collision** — an iframe can't listen to host-level shortcuts; the host forwards shortcut events to the focused plugin via `shortcut.fired` events. Plugins can NOT register global shortcuts; that stays a first-party feature.
- **Hot reload** — plugins during dev reload via the same mechanism as Roblox's "Save and Reload Plugin": a dev-mode file watcher posts `plugin.reload` and the host recreates the iframe. Production plugins are versioned and immutable.
- **IndexedDB quotas** — if we let plugins use their own IDB (they can't, under no-same-origin), but the host-proxied storage still consumes the browser's quota; 4 GB Chromebook quota is ~20 % of disk (~300 MB typical). Enforce hard caps.
- **Long-running plugins** — a plugin that opens a `setInterval` in the background consumes an RAF slot; host terminates iframes that haven't handled a heartbeat in 30 s.
- **Monetization** — Roblox takes ~0 % on plugins; our equivalent is classroom seats + marketplace rev share. Third-party plugin sales is a v4 topic.

**Recommendation:** **Defer** the public plugin API to Phase 3, AFTER we ship first-party AI tool panels using the same RPC surface internally. Start by defining the host RPC in `src/lib/plugin-host/` and wiring PixelLab/Meshy/Suno/ElevenLabs panels through it — this de-risks the contract long before we expose it to third parties. In the classroom tier, plugins launch locked to the verified list.

---

## Toolbar + layout chrome (mezzanine, custom tabs, dock/pin/float)

**Roblox does:** Ribbon toolbar with Home/Model/Avatar/UI/Script/Plugins tabs, drag-to-dock / drag-to-float / drag-to-pin / tab-grouping for every panel window, custom tabs defined in local `RibbonLayout.json`, compact-toolbar and collapse-toolbar modes.

**Web equivalent:** Any React layout library (react-mosaic, react-grid-layout, allotment). Browsers can't natively tear off a window into an OS-level floating panel, though a `window.open` child window + shared `BroadcastChannel` is close.

**Problocks mapping:**
- Studio editor → `TopMenuBar` is our mezzanine stand-in today; it has top-level nav but no mezzanine with tool-tab switching. Options:
  - **Keep the fixed 3-panel shell** (current) — matches AutoAnimation, predictable for N4000. No dock/float. Recommended.
  - Add a `PanelIconTabs` row inside `TopMenuBar` for future custom-tab tools (Home / Model / UI / Script / Plugins analog). Cheap; works with existing components.
  - `JSON custom tabs` analog: store teacher-customized toolbar layouts in Supabase `profile.toolbar_layout`. Ship `RibbonLayout.json`-style schema but load from DB, not disk.
- Game output → Not applicable.

**How it could be used:**
- Classroom templates ship with a pre-configured toolbar (a "UI" tab with only the buttons the current lesson needs).
- Teachers save the toolbar layout per class; Chromebook login restores it.
- A `Compact` toggle in `SettingsPanel` shrinks everything for 11" screens — single setting writes `compact = true` to the studio store, every `Panel*` component reads it.

**Edge cases & gotchas:**
- **Floating windows in browsers** — `window.open` with `features='popup'` works, but loses shared Zustand state unless you `BroadcastChannel` sync. Not worth the complexity yet.
- **Tab groups** — Roblox's "drop on center → grouped as tabs" is doable with `react-mosaic`, but every mosaic re-layout triggers a full panel re-mount; `PanelIconTabs` inside the right panel gets us 80 % of the value without the cost.
- **Pin/collapse** — already have `LeftPanelToggle`; just mirror it for the right panel and we're done.
- **Keyboard shortcuts** — Roblox's `Alt+S` opens settings; on web that inserts `ß` on German layouts. Use `Cmd/Ctrl+,` (standard app-settings shortcut) instead.
- **First-run layout reset** — provide a "Reset layout" in `SettingsPanel`; lost layouts are the #1 support ticket in editors that allow customization.

**Recommendation:** Skip dock/float. Port **Compact mode** and **custom-tab toolbar in DB** as Phase 2. Keep the 3-panel shell as the canonical chrome.

---

## Cross-cutting notes

- **Undo/Redo is a prerequisite** for any of the Properties multi-select edit or plugin `scene.update` stories. Ship the command-pattern store middleware first.
- **All new panels must use `PanelSection collapsible` + sticky-footer primary action** per the strict right-panel rule in `CLAUDE.md`; do not hand-roll containers.
- **Renderer pool + video player + plugin iframe all share a single IntersectionObserver budget** — centralize in `src/lib/visibility-observer.ts` so we never spawn three observers per tile.
- **N4000 budget check** — on a typical scene: 20 ThreePreview tiles + 2 LessonVideo players + 1 plugin iframe + React Flow canvas ≈ 450 MB RAM. Monitor with `performance.memory` in dev and gate the asset grid to 12 visible previews at once on low-end.
