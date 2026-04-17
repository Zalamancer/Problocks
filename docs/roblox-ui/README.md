# Roblox UI → Problocks Conversion Reference

Source of truth for porting Roblox Studio's UI/GUI concepts to the Problocks web stack (Next.js 16 + React Flow + Tailwind v4 + panel-controls). Every conversion considers the **Celeron N4000 / 4GB Chromebook** hardware target.

## Layout

```
docs/roblox-ui/
├── README.md                    ← this index
├── source/                      ← verbatim copies from github.com/Roblox/creator-docs
│   ├── ui/                      ← 24 in-experience GUI docs (+ styling/ subfolder)
│   └── studio/                  ← 6 editor-chrome docs
└── conversion/                  ← Problocks mapping + edge cases per topic
    ├── 01-containers-and-layouts.md
    ├── 02-positioning-and-styling.md
    ├── 03-text-and-rich-content.md
    ├── 04-interaction-and-detection.md
    └── 05-media-and-studio-chrome.md
```

## Where each Roblox concept is analyzed

| Roblox concept | File | Verdict |
|---|---|---|
| ScreenGui / SurfaceGui / BillboardGui | 01 | port later (game-side only) |
| Frame | 01 | skip — use `<div>` + Tailwind |
| ScrollingFrame | 01 | port now (native `overflow-auto` + styled thumb) |
| UIListLayout / UIFlexItem | 01 | skip — flexbox is the equivalent |
| UIGridLayout / UITableLayout | 01 | skip — CSS Grid is the equivalent |
| UIPageLayout | 01 | port later (CSS scroll-snap) |
| UDim2 (Scale + Offset) | 02 | **port now** — best model for responsive AI-generated games (`calc()`/`clamp()`) |
| AnchorPoint / ZIndex / AutomaticSize | 02 | port later |
| UIScale / UIAspectRatioConstraint | 02 | port later (container queries) |
| UIPadding / UICorner / UIStroke / UIGradient | 02 | skip — Tailwind covers it |
| 9-slice (ImageLabel SliceCenter) | 02 | port later (CSS `border-image`) |
| Style Editor / UIStyleSheet | 02 | **hybrid** — steal tokens panel + container queries; skip runtime cascade |
| TextLabel / ImageLabel | 03 | skip — `<span>`/`<img>` |
| Rich Text | 03 | **port now** — custom allowlist parser (no `dangerouslySetInnerHTML`) |
| TextBox | 03 | skip — existing `PanelInput`/`PanelTextarea` cover it |
| TextService filtering | 03 | **port now, blocks Phase 1** — Next.js route + Supabase edge function + IndexedDB offline queue |
| Buttons (TextButton/ImageButton) | 04 | skip — `PanelActionButton` covers studio, `<button>` covers game |
| UIDragDetector | 04 | port later (Pointer Events + `@use-gesture` for momentum) |
| 3D DragDetector | 04 | port later (Three.js raycast + drag plane) |
| ProximityPrompt | 04 | **port now** for 3D games — reusable `<ProximityPrompt>` sketched with LoS raycast + hold-to-activate |
| TweenService | 04 | **WAAPI** for game runtime, CSS transitions for studio; framer-motion skipped (bundle+main-thread cost on N4000) |
| Path2D | 04 | port later (Canvas `Path2D` API maps 1:1) |
| VideoFrame | 05 | port later — MP4-first, HLS on demand, Supabase signed URLs |
| ViewportFrame | 05 | **port now** — shared `WebGLRenderer` pool blitted into many `<canvas>` via `drawImage` (critical on N4000) |
| Explorer / Properties | 05 | already have equivalents (`ScenePanel` / `PartPropertiesPanel`); steal filter DSL, reveal-in-canvas, multi-select, attributes/tags |
| Plugin / DockWidget system | 05 | defer — sandboxed iframe + typed postMessage RPC + fine-grained permissions |

## How to use this reference

1. **Designing a new studio panel or game primitive?** Open the relevant conversion doc first — don't re-derive from Roblox source.
2. **Every block** has: _Roblox does_ → _Web equivalent_ → _Studio mapping_ → _Game mapping_ → _Usage scenarios_ → _Edge cases & gotchas_ → _Recommendation_.
3. **Edge cases are the value.** Roblox-to-web is usually easy structurally; the gotchas (IME, pointer capture, reduced-motion, autoplay policy, React Flow zoom coords, Chromebook GPU limits) are what break things.

## Source provenance

- Upstream: https://github.com/Roblox/creator-docs (`content/en-us/ui/` and `content/en-us/studio/`)
- Snapshot taken: 2026-04-17
- License of source docs: see upstream repo's `LICENSE` — these are copied for reference only; do not ship verbatim in product.

## Cross-cutting themes the conversion docs surface

- **Celeron N4000 is the constraint that picks the winner** between equivalent web APIs. CSS transitions beat framer-motion; shared-renderer pool beats per-tile WebGL; `drawImage` blit beats multiple live contexts.
- **Studio ≠ Game.** Roblox's docs conflate them; our docs split every concept into both columns so the AI game generator and the studio UI don't borrow each other's assumptions.
- **Classroom safety is load-bearing.** Text filtering and plugin sandboxing are non-optional because students are the users.
- **Don't fight React Flow.** Any drag/pointer work in the studio must account for React Flow zoom/pan coords and wheel capture.
