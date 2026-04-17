# Text, Rich Content, Labels & Input — Roblox → Problocks

Mapping Roblox Studio's `TextLabel`, `ImageLabel`, `TextBox`, Rich Text markup, and `TextService` filtering onto the Problocks web stack (Next.js 16, Tailwind v4, React, Supabase) — with Chromebook (Celeron N4000 / 4GB) and classroom-safety constraints front-of-mind.

Source files covered:
- `docs/roblox-ui/source/ui/labels.md`
- `docs/roblox-ui/source/ui/rich-text.md`
- `docs/roblox-ui/source/ui/text-input.md`
- `docs/roblox-ui/source/ui/text-filtering.md`

---

## TextLabel (plain text display)
**Roblox does:** `TextLabel` GuiObject — rectangle with a `Text` string plus styling props (`TextColor3`, `TextSize`, `Font`, `TextScaled`, `TextXAlignment`, `TextTransparency`, `TextStrokeColor3`).
**Web equivalent:** a `<span>` / `<p>` / `<div>` with Tailwind typography utilities (`text-*`, `font-*`, `leading-*`, `tracking-*`). `TextScaled` = CSS `clamp()` or a resize-observer-driven font-size hook.
**Problocks mapping:**
- Studio editor → no dedicated "label editor" primitive. Static chrome text is hand-authored in TSX. For configurable label nodes in the game-graph, expose via `PanelInput` (short strings) or `PanelTextarea` (multi-line), with adjacent `PanelSelect` for font family, `PanelSlider` for size, `ColorPicker` for color (port from AutoAnimation when we need it).
- Game output → AI emits a `<Label>` component inside the HTML5 game template that reads `{ text, fontSize, color, align }` from a JSON props object. Uses `next/font` at build-time for the handful of approved font families (see gotchas).
**How it could be used:** HUD score/timer, dialogue boxes in an AI-generated RPG, shop item names, tutorial callouts, level titles.
**Edge cases & gotchas:**
- **FOUT / FOIT:** Next.js `next/font` with `display: 'swap'` avoids invisible-text flashes; do NOT use arbitrary Google Fonts at runtime in student games (network hit on Chromebooks).
- **RTL:** set `dir="auto"` on the root label so Arabic/Hebrew student content renders correctly without per-node config.
- **Emoji & grapheme clusters:** `str.length` lies. If we truncate by length for a "max chars" preview, use `Intl.Segmenter` (`'grapheme'`) — falls back to spread-and-count on older Chrome OS versions.
- **Screen readers:** decorative labels need `aria-hidden`; informative labels inherit semantics from `<p>`/`<h*>`. Do not ship a label-as-button pattern.
- **TextScaled parity:** Roblox's auto-fit is expensive. On Chromebook, prefer static `clamp()` sizing over JS-driven resize observers to keep render cost off the CPU.
- **Line wrapping:** Roblox's `TextWrapped` maps to `whitespace-normal break-words`; `TextTruncate` maps to `truncate` (single line) or the `@tailwindcss/line-clamp` utilities.
**Recommendation:** **Port** — first-class game primitive. Studio side is already covered by `PanelInput` + `PanelTextarea`; add a single `<GameLabel>` runtime component with a JSON schema.

---

## ImageLabel
**Roblox does:** rectangle that shows an imported asset image, with `ImageColor3` tint, `ImageTransparency`, `BackgroundTransparency`, `ScaleType` (Fit/Stretch/Slice/Tile).
**Web equivalent:** `next/image` (or a plain `<img>` inside the exported HTML5 game where Next isn't present), with `object-fit` for ScaleType, CSS `filter: opacity()` + `mix-blend-mode` or a `currentColor` SVG mask for tinting.
**Problocks mapping:**
- Studio editor → picker is a `PanelDropZone` (uploads to Supabase Storage) + a thumbnail row. Tint = `ColorPicker`, opacity = `PanelSlider`, scale type = `PanelSelect`.
- Game output → exported HTML uses `<img src="/assets/{hash}.png">` loaded from the game's bundled assets folder. No Next image optimization inside the game sandbox — we pre-optimize on upload (sharp in an API route) and store multiple DPR variants.
**How it could be used:** Character portraits next to dialogue, inventory slot icons, splash backgrounds, achievement badges.
**Edge cases & gotchas:**
- **Chromebook memory:** cap uploaded textures (e.g. 1024x1024) and reject anything > 2 MB at the API route; a class of 30 Chromebooks pulling 8 MB PNGs will OOM.
- **Tinting transparency PNGs:** `mix-blend-mode: multiply` bleeds into the background — use SVG mask or a canvas pre-tint for predictable results.
- **9-slice (Roblox `ScaleType = Slice`):** CSS `border-image` covers this; document the `SliceCenter` insets mapping for the AI template.
- **Lazy loading:** set `loading="lazy"` for off-screen labels; in-game HUD labels need `loading="eager"` to avoid pop-in.
- **Alt text:** mandatory for classroom accessibility — the AI template must emit `alt={label.text || label.describedAs}`.
**Recommendation:** **Port** (minimal version). Defer 9-slice and tile modes to Phase 2; ship Fit/Stretch first.

---

## Rich text — deep dive
**Roblox does:** per-object `RichText = true` flag; a custom XML-ish subset — `<b>`, `<i>`, `<u>`, `<s>`, `<br/>`, `<font color size face family weight transparency>`, `<stroke>`, `<uppercase>`/`<uc>`, `<smallcaps>`/`<sc>`, `<mark>`, `<!-- -->`, plus HTML-style entity escapes (`&lt;`, `&gt;`, `&quot;`, `&apos;`, `&amp;`). Localization strips tags.
**Web equivalent:** three candidate paths, each with different trust models.
  1. `dangerouslySetInnerHTML` with raw HTML — fastest, maximum XSS risk. **Not acceptable** for student-authored text.
  2. Markdown via `react-markdown` + `remark-gfm` — safe by default (no raw HTML), limited styling vocabulary (bold, italic, lists, links), renders to real React nodes.
  3. Allowlist HTML sanitizer (`DOMPurify` or `sanitize-html`) with a tag + attr whitelist that mirrors the Roblox subset — richest fidelity, still safe, heavier bundle (~20 KB gz for DOMPurify).
**Problocks mapping:**
- **Editor chrome (teacher-facing, AI-generated UI copy):** render as Markdown via `react-markdown`. Teachers trust us; we trust react-markdown; no custom sanitizer needed. Used for tooltip bodies, empty-state help text, toast messages.
- **Student-authored text inside games (dialogue, item descriptions, chat bubbles):** ship a **custom mini-parser** that matches the Roblox tagset 1:1, outputs React elements (never strings into `innerHTML`). Only the enumerated tags produce JSX; unknown tags are escaped as literals. This is safer than DOMPurify because the attack surface is a closed grammar, not the entire HTML spec.
- Studio editor → `PanelTextarea` with a live preview pane rendered by the same mini-parser, plus an inline toolbar of `PanelButtonGroup`/icon buttons that insert `<b>…</b>` etc. around the current selection (like the Discord message composer).
- Game output → the mini-parser is bundled into the HTML5 game runtime as a ~2 KB module that exports `renderRichText(str): VNode[]`.
**Tag → output map (for the mini-parser):**

| Roblox tag | React output | Notes |
|---|---|---|
| `<b>` | `<strong>` | semantic, not just `font-bold` |
| `<i>` | `<em>` | semantic |
| `<u>` | `<span class="underline">` | underline-only (no link semantics) |
| `<s>` | `<s>` | strikethrough |
| `<br/>` | `<br />` | |
| `<font color size face weight transparency>` | `<span style={{...}}>` | whitelist `face` to our font set; reject arbitrary families |
| `<stroke>` | `<span class="rt-stroke" style={{ '--stroke-color': ... }}>` | CSS `-webkit-text-stroke` or a text-shadow fallback |
| `<uppercase>` / `<uc>` | `<span class="uppercase">` | CSS text-transform |
| `<smallcaps>` / `<sc>` | `<span style={{ fontVariant: 'small-caps' }}>` | |
| `<mark>` | `<mark>` | coerce `color` attr into background |
| `<!-- ... -->` | stripped | |
| `&lt; &gt; &quot; &apos; &amp;` | decoded | |

**How it could be used:** colorful reward text ("You won **25 gems**!"), highlighted boss names, stylized dialogue, instruction screens, multi-language flavor text.
**Edge cases & gotchas:**
- **XSS in `<font face=…>`:** never pass the attribute through unchecked; validate against a whitelist of family names. Same for `color` — parse as hex/rgb, reject anything else.
- **Nested tag imbalance:** unmatched closers are common in student text — the parser should auto-close on EOF, never throw.
- **Localization stripping:** if we later add i18n, strip tags before sending to translation then re-inject (Roblox does the same).
- **Screen readers:** `<strong>`/`<em>` are announced correctly; `<mark>` needs `aria-label` for VoiceOver. `-webkit-text-stroke` is ignored by AT (fine).
- **Copy/paste from Word/Google Docs:** users will paste styled HTML into the textarea — strip on paste (`onPaste` → `e.clipboardData.getData('text/plain')`).
- **Rich-text + input-method editors (IME):** if we later allow rich input (not just rich render), selection offsets and IME composition ranges break when React re-renders mid-composition. Stay with plain-text input + preview for now.
**Recommendation:** **Port (custom mini-parser)** for game content; **Markdown via react-markdown** for editor chrome. Do **not** use `dangerouslySetInnerHTML` anywhere student text can reach.

---

## TextBox (text input)
**Roblox does:** `TextBox` GuiObject with `Text`, `PlaceholderText`, `ClearTextOnFocus`, `MultiLine`, `TextEditable`, `FocusLost`/`Focused` events. Devs can restrict characters via `GetPropertyChangedSignal("Text")`.
**Web equivalent:** `<input type="text">` / `<textarea>` (React controlled component). Composition/IME events: `onCompositionStart`/`End`. Placeholder via the native `placeholder` attr.
**Problocks mapping:**
- Studio editor → already have `PanelInput`, `PanelTextarea`, `PanelSearchInput` at `src/components/ui/panel-controls/`. Use these directly for any editor-side string property.
- Game output → AI emits a `<GameTextBox>` runtime component that mirrors Roblox's API: `value`, `placeholder`, `multiLine`, `maxGraphemes`, `allowedPattern`, `onSubmit(filteredValue)`. The component does NOT expose raw unfiltered text to the game's onChange — only the submitted-and-filtered value reaches game logic (see filtering section).
**How it could be used:** Player name entry on a start screen, chat input in a multiplayer-ish HTML5 game, a "name your pet" prompt, quiz answer fields, search bars in inventories.
**Edge cases & gotchas:**
- **IME / composition events:** Chinese/Japanese/Korean learners type via composition; filtering mid-composition corrupts input. Only filter on `compositionend` + `onSubmit`.
- **Chromebook virtual keyboard:** when a `<textarea>` focuses in tablet mode, the viewport shrinks — use `env(keyboard-inset-height)` and `visualViewport` API to keep the submit button visible. Roblox on mobile gets this for free; we don't.
- **Paste sanitation:** `onPaste` handler strips non-plain text and clamps to `maxGraphemes`.
- **Grapheme counting:** `"👨‍👩‍👧‍👦".length === 11` in JS. Use `Intl.Segmenter` for max-length enforcement so emoji families don't nuke the budget.
- **autoComplete / autoCorrect / spellCheck:** for "name your character" fields, disable all three (`autoComplete="off" spellCheck={false} autoCorrect="off" autoCapitalize="off"`) — kids hate the autocorrect fighting their fantasy names.
- **RTL:** `dir="auto"` handles mixed directionality; caret placement with mixed LTR+RTL is a browser-level concern, don't try to patch it.
- **Screen-reader labels:** every input needs a visible `<label>` or `aria-label`. `PanelInput`/`PanelTextarea` already accept a `label` prop — the AI-emitted `<GameTextBox>` must too.
- **Real-time filtering warning (from Roblox docs):** do NOT filter per keystroke. Filter on submit (blur or Enter). Otherwise other players see pre-filtered text in multi-user scenarios.
- **Auto-resize textarea thrash:** if we implement an auto-growing textarea (AutoAnimation has one we can copy), debounce the height recalculation via `requestAnimationFrame`, not per-input event.
- **maxLength vs. grapheme cap:** native `maxLength` counts code units (UTF-16) and lets users paste long strings that get silently truncated mid-emoji. Use our own grapheme guard; set native `maxLength` 4x higher as a backstop.
**Recommendation:** **Port** — `GameTextBox` runtime component mirrors `TextBox` semantics on top of our existing panel-controls. Critical for any game with player input.

---

## Text filtering — deep dive
**Roblox does:** `TextService:FilterStringAsync(text, userId)` returns a `TextFilterResult`; dev picks `GetNonChatStringForBroadcastAsync` (visible to everyone) or `GetNonChatStringForUserAsync` (age-/locale-gated per viewer). Roblox enforces filtering at the platform level — unfiltered experiences are taken down.
**Web equivalent:** no built-in. We own the pipeline end-to-end.
**Problocks mapping:** treat filtering as a **product-level invariant**, not a per-game choice.

**Proposed architecture:**
1. **Client-side preflight** (not a filter — a UX nicety): a tiny bundled profanity wordlist (e.g. a vendored copy of `obscenity` or `leo-profanity`'s compact wordlist) blocks the obvious cases and shows an inline "Please choose different words" message before the network call. Never the source of truth.
2. **Authoritative server filter** via a Next.js Route Handler at `src/app/api/filter-text/route.ts`:
   - Input: `{ text, studentId, scope: 'broadcast' | 'self', projectId }`.
   - Calls a moderation provider (OpenAI `omni-moderation-latest` or Perspective API) PLUS a regex pass for PII (phone numbers, emails, addresses — matching Roblox's PII-blocking behavior).
   - Output: `{ filtered: string, flagged: boolean, categories: [...], originalHash }`.
   - Rate-limited per `studentId` (Supabase edge + Upstash or an in-memory token bucket behind the CDN).
   - Writes a row to a `moderation_events` table for teacher/admin review — non-negotiable for a classroom product.
3. **Supabase Edge Function fallback** (`supabase/functions/filter-text`) for when the game is embedded in a third-party iframe and we want to hit Supabase directly without bouncing through Next.
4. **Game runtime integration:** `<GameTextBox onSubmit>` calls `window.Problocks.filterText(text)` which POSTs to the route and resolves with the filtered string. The original text is NEVER stored in game state.

**Offline behavior:**
- Chromebook Wi-Fi drops are common in schools. When the filter API is unreachable:
  - Fall back to the bundled wordlist + PII regex client-side.
  - Mark the submission `provisional: true`.
  - Queue the original submission in IndexedDB for re-filtering when connectivity returns; any displayed text in the meantime must be visible ONLY to the author (matches Roblox's "filter per-user, show to self only" behavior).
  - Never broadcast provisional text to other players in a multiplayer context.
- If offline + broadcast scope + filter unreachable → block submission entirely with a clear "You're offline, text can't be shared right now" message.

**Scopes (mirroring Roblox's two methods):**

| Problocks scope | Roblox equivalent | Use case |
|---|---|---|
| `broadcast` | `GetNonChatStringForBroadcastAsync` | Everything visible to a non-author: signs, pet names on leaderboards, shared chat |
| `self` | `GetNonChatStringForUserAsync` | Private notes, single-player journal, author-only HUD text |

**How it could be used:** player name submission on a game's splash screen, chat messages in a shared-play mode, pet/character naming, custom tombstone text, high-score initials, student-authored sign text in a sandbox game.
**Edge cases & gotchas:**
- **Latency:** moderation API round-trip is 300–800 ms. Show an optimistic "Checking…" state with a spinner from `@/components/ui/LoadingSpinner`; disable the submit button during the wait to prevent double-submits.
- **Cost:** at scale this adds up — cache the hash of already-cleared strings in a `filter_cache` table with a 7-day TTL. Most submissions ("John", "Alice", "DragonSlayer") are repeats.
- **False positives:** classroom context is full of clinical/scientific words (anatomy terms in a biology game, etc.). Teachers need a per-project allowlist override — surface via Settings panel.
- **Localization:** moderation providers vary in coverage per language; for non-English the confidence threshold must be looser OR we block submissions in unsupported languages with a clear message.
- **Minors & PII:** phone numbers, emails, and home addresses MUST be stripped regardless of profanity, matching Roblox. Age of student is known from Supabase Auth profile — use it to pick stricter thresholds for under-13.
- **Audit trail:** store every flagged event with `(student_id, class_id, project_id, scope, categories, timestamp)`. Teachers and admins get a dashboard.
- **Do not echo filtered output back to the AI generator** — the model must never see a student's raw unfiltered string as training/context input, even accidentally. Hash before logging into agent memory.
- **Evasion:** 133tspeak, homoglyphs, zero-width joiners. The moderation provider handles most; add a normalization pass (NFKC + strip ZWJ/ZWNJ, lowercase, collapse repeats) before hashing/caching.
- **Do not filter per keystroke** (direct from Roblox's own warning): filter on submit only.
**Recommendation:** **Port — highest priority.** This is a non-negotiable classroom-safety requirement. Ship v1 with OpenAI Moderation + PII regex + moderation_events table before any multiplayer or shared-text feature goes live. The offline path and filter cache can follow in v2.

---

## Summary recommendations

| Concept | Decision | Phase |
|---|---|---|
| TextLabel → `<GameLabel>` | Port | Phase 1 |
| ImageLabel → `<GameImage>` | Port (minimal — Fit/Stretch; defer Slice/Tile) | Phase 1 → 9-slice Phase 2 |
| Rich text (game content) | Port via custom mini-parser with fixed tagset | Phase 1 |
| Rich text (editor chrome) | react-markdown (no custom parser needed) | Phase 1 |
| TextBox → `<GameTextBox>` | Port on top of `PanelInput`/`PanelTextarea` patterns | Phase 1 |
| Text filtering pipeline | Port — API route + Supabase logging + offline guard | **Phase 1, blocking** for any submit-and-display feature |
| `TextScaled` JS auto-fit | Skip at runtime; use CSS `clamp()` | — |
| Per-keystroke filtering | Skip (explicitly discouraged by Roblox docs) | — |
