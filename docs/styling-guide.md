# Problocks — Styling Guide

Source of truth for visual decisions. When a design choice isn't covered here, default to the AutoAnimation reference at `/Users/ihsanduru/autoStudio/AutoAnimation/`.

---

## Z-Index Hierarchy

All z-index values are CSS custom properties defined in `src/app/globals.css` and registered as Tailwind tokens. **Never use a raw z-index number in a component** — always use the token class.

| Layer    | Token class   | CSS var        | Value | What goes here                                      |
|----------|---------------|----------------|-------|-----------------------------------------------------|
| Overlay  | `z-overlay`   | `--z-overlay`  | 10    | Backdrop overlays behind modals                     |
| Panel    | `z-panel`     | `--z-panel`    | 20    | Floating side panels, drawers                       |
| Modal    | `z-modal`     | `--z-modal`    | 40    | `ConfirmDialog`, full-screen modal sheets           |
| Toast    | `z-toast`     | `--z-toast`    | 50    | `ToastContainer` — must sit above modals            |
| Dropdown | `z-dropdown`  | `--z-dropdown` | 999   | **Every dropdown, popover, tooltip, date picker**   |

### Hard rule: dropdowns and popups always use `z-dropdown`

Any element that floats above page content — `PanelSelect` portal, `DueDatePicker` popover, tooltips, context menus, autocomplete lists — **must** use `z-dropdown` (999). This is the ceiling of the stack. Nothing exceeds it.

```tsx
// ✅ correct
<div className="absolute z-dropdown ...">

// ❌ wrong — raw number, ignores token system
<div className="absolute z-[9999] ...">
<div style={{ zIndex: 9999 }} ...>
```

---

## Color Tokens

Defined in `src/app/globals.css` `:root` / `.light`, registered via `@theme` for Tailwind.

### Surfaces

| Token class            | Dark value  | Light value | Usage                          |
|------------------------|-------------|-------------|--------------------------------|
| `bg-studio-bg`         | `#09090b`   | `#f9fafb`   | Outermost canvas background    |
| `bg-panel-bg`          | `#18181b`   | `#f4f4f5`   | Panel background               |
| `bg-panel-surface`     | `#27272a`   | `#e4e4e7`   | Controls, inputs, rows         |
| `bg-panel-surface-hover` | `#3f3f46` | `#d4d4d8`   | Hover state for surface items  |

### Accent (brand green)

| Token class        | Value     | Usage                               |
|--------------------|-----------|-------------------------------------|
| `bg-accent`        | `#22c55e` | Active state, selected, CTA buttons |
| `hover:bg-accent-hover` | `#16a34a` | Hover on accent buttons        |
| `text-accent`      | `#22c55e` | Highlighted text, today's date      |

### Text scale

| Class          | Usage                        |
|----------------|------------------------------|
| `text-zinc-200` | Primary content              |
| `text-zinc-400` | Secondary / labels           |
| `text-zinc-500` | Icons, placeholder-adjacent  |
| `text-zinc-600` | Placeholder text, disabled   |

### Node-specific tokens (canvas only)

Use `var(--node-*)` CSS vars directly in node components — these are not Tailwind tokens.

| CSS var               | Purpose                         |
|-----------------------|---------------------------------|
| `--node-bg`           | Node card background            |
| `--node-text`         | Node title                      |
| `--node-text-muted`   | Node subtitle / secondary       |
| `--node-field-bg`     | Inline field background         |
| `--node-border-default` / `hover` / `selected` | Card border states |

---

## Borders & Radius

| Context              | Value                          |
|----------------------|--------------------------------|
| Panel / aside shell  | `border border-white/[0.06] rounded-xl` |
| Popover / dropdown   | `border border-white/[0.08] rounded-xl` |
| Controls (input, btn) | `rounded-lg`                 |
| Small pill / badge   | `rounded-full`                 |
| Day cell in calendar | `rounded-lg`                   |

---

## Spacing Conventions

| Context                         | Value          |
|---------------------------------|----------------|
| Between panel sections          | `gap-4`        |
| Section content padding         | `px-4 py-4`    |
| Between controls inside section | `gap-2`        |
| Panel header padding            | `px-4 py-3`    |
| Section header border           | `border-b border-white/5` |
| Sticky footer padding           | `px-4 py-3 border-t border-white/5` |

---

## Popover / Dropdown Pattern

All floating UI (date pickers, select dropdowns, tooltips, context menus) follows this shell:

```tsx
<div className={cn(
  'absolute z-dropdown left-0 right-0 mt-1.5',
  'bg-zinc-900 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden',
)}>
```

- `z-dropdown` — always, no exceptions
- `bg-zinc-900` — one step darker than the panel surface it floats above
- `border-white/[0.08]` — slightly stronger than panel border (`/[0.06]`)
- `rounded-xl` — matches panel radius
- `shadow-2xl` — separation from content below
- `overflow-hidden` — clips inner content to rounded corners

---

## Light / Dark Theming

All zinc and white-opacity classes are automatically remapped in `.light` via CSS overrides in `globals.css`. **Do not add manual `dark:` or `light:` variants in components** — the global override handles it. The only exception is when a component needs an accent colour that differs per theme (discuss first).

---

## Node Accent Colours (connector type)

| Connector type | Accent colour  | Tailwind class  |
|----------------|----------------|-----------------|
| AI / Claude    | Purple         | `text-purple-400` / `bg-purple-400` |
| Art / Pixel    | Pink           | `text-pink-400` / `bg-pink-400`     |
| Audio / Suno   | Green          | `text-green-400` / `bg-green-400`   |
| Brand / CTA    | Green (brand)  | `bg-accent` / `text-accent`         |
