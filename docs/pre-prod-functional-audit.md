# Pre-Production Functional Audit

**Date:** 2026-04-22  
**Scope:** UI/UX, user workflows, feature gaps. What students/teachers will click, what works, what's missing.  
**Not covered here:** security, API hardening, build health — see separate security audit.

Priority tags:
- **P0** — must fix before inviting real students/teachers
- **P1** — fix before public announce / feels unfinished without
- **P2** — polish / delight

---

## TL;DR — Top 10 blockers

1. **Core loop is broken.** Student can't publish a game. `/play/[gameId]` route doesn't exist. Marketplace is one hardcoded LEGO entry.
2. **Studio `Save`, `Publish`, `Share` buttons are no-ops.** `TopMenuBar.tsx:161-171` — four kebab items do nothing.
3. **No "my games" library UI.** `games[]` persists to localStorage but nothing renders the list. Students can't return to drafts.
4. **No undo.** AI generation overwrites `gameHtml` outright. One bad prompt destroys work.
5. **Join code mismatch.** Input is 6 chars, new codes are 8. Kids typing real codes see truncation.
6. **Teacher "Publish to class" / "Save as draft" only update local state.** `NewAssignment.tsx:84-99` — assignments vanish on refresh.
7. **Live quiz is hardcoded to one physics question set.** No content picker. `LiveHost.tsx:40`.
8. **No teacher refresh-recovery.** Teacher reloads during class → room dies, all students disconnect.
9. **Fake numbers everywhere for new users.** Streak=7, coins=2480, XP=1840 hardcoded in `Dashboard.tsx:37-40`.
10. **Brand confusion.** Codebase says `playdemy.app`, CLAUDE.md and repo say Problocks. Pick one.

---

## 1. Student experience

### A. Dead / broken UI

**P0**
- Forgot password link is `href="#"` — `AuthScreen.tsx:193`. Locked-out kids have no recovery.
- "Clever" SSO button rendered but disabled — `AuthScreen.tsx:158-166`. Teases a feature that isn't there.
- Terms / COPPA links go to `#` — `AuthScreen.tsx:246`.
- "Browse public games" on join screen is `href="#"` — `JoinScreen.tsx:145`.
- QR scanner is a fake 2.4s animation — `JoinScreen.tsx:242-349`. No camera access, hardcodes a sample class.
- Settings menu routes to `/student/settings` which 404s — `Dashboard.tsx:631`.
- "Daily challenge" Try-it launches a modal that says "(Demo — real game would launch here)" — `Dashboard.tsx:342`.
- Library / Recent plays / Explore cards all launch the same demo modal — `Dashboard.tsx:216, 449, 486`.
- Join code input is 6 chars; real codes are 8 — `JoinScreen.tsx:59-118`. Typing a real code truncates.

**P1**
- "View all" on Recent plays is `href="#"` — `Dashboard.tsx:500`.
- Streak = 7, coins = 2480, XP = 1840 hardcoded — `Dashboard.tsx:37-40`. Every new kid sees the same fake "veteran" numbers.
- No equip feedback in wardrobe beyond a tiny fading text — `Wardrobe.tsx:205-211`.
- Crate inventory lives only in `localStorage` — wiping browser loses everything. `CratesPanel.tsx:13-49`.

**P2**
- `window.prompt()` used to name saved outfit — `Wardrobe.tsx:104`. Feels broken on Chromebook.

### B. Missing student screens / features

**P0**
- No password reset / email confirm UX beyond a one-line toast.
- No onboarding / tutorial. Brand-new account lands on Dashboard with empty lists + fake "Level 14" badge.
- No "my published games" view.
- No assignment-feedback screen (student sees only rank + "teacher can see scores" after quiz).
- No messaging / "ask teacher" / notification center.
- No friends / classmate list / invite-a-friend.
- No "report inappropriate content" button anywhere. Required for a kids platform.

**P1**
- No parental consent flow beyond one-line footer. COPPA risk.
- No search / filter on Explore. Single hardcoded grid.
- Profile page in real mode is a stub ("No progress data yet") — `StudentProfile.tsx:120-123`.

### C. Engagement / wow gaps

**P0**
- No confetti or level-up moment anywhere. Quiz reveal is a tinted card.
- Avatar never reacts to equip / new crate. `showFlash` is text-only.

**P1**
- Crate unboxing exists but claimed item never shows avatar wearing it.
- No streak reward / daily-login bonus. Streak chip is cosmetic.
- No badges / achievements surface in real mode.
- No shareable play link / replay gallery. Kids can't brag.
- No sound anywhere — quiz, race, crate-open are silent.

### D. Kid-friendliness

**P0**
- Heavy English-only copy ("Mastery", "classmates", "Period 3"). No audio, no read-aloud, no translations.
- Nickname errors use `alert()` — `quiz/page.tsx:87`, `race/page.tsx:80`. Jarring modal breaks vibe.

**P1**
- Dashboard desktop-only grid `1.7fr 1fr` — `Dashboard.tsx:126`. Squished on Chromebook portrait / tablet.
- Wheel-lock wardrobe scroll advances one row per tick — `Wardrobe.tsx:122-144`. Feels laggy.
- Body type options are "Boy / Girl" only. Modern schools need a neutral option.

**P2**
- Avatar menu text at 13px / 9px padding — small tap targets.
- COPPA footer is 11.5px muted text — invisible to kids.

---

## 2. Teacher experience

### A. Broken buttons / dead ends

**P0**
- "Publish to class" / "Save as draft" only update local React state — `NewAssignment.tsx:84-99`. Refresh = assignment gone. No `/api/assignments` exists.
- "Re-teach" button has no `onClick` — `Overview.tsx:218`.
- `/teach/race` "Teacher hub" link goes to `/teach` which 404s — `race/page.tsx:106`.
- Live quiz always hardcodes `frqId: 'cart-on-incline'` — `LiveHost.tsx:40`. No content picker exists. `/teach/quiz` only chooses pacing.

**P1**
- "Watch a 90-sec demo" → `#demo` — `ClassroomSetupApp.tsx:66`.
- "Admin info →" → `#admin` — `StepAboutYou.tsx:130`.
- "Skip for now" exists on roster step but wizard still forces steps 4+5 before room opens.

### B. Missing teacher screens / features

**P0**
- No "student games / approve for marketplace" screen. Moderation pillar unbuilt.
- No gradebook or CSV export — grep for `export`/`CSV`/`download` in teacher/ returns zero.
- No parent/guardian contact surface.
- No "assign to specific students" picker behind the chip in `NewAssignment.tsx:223-234`.
- No `/teach` landing hub — routes link to it but `page.tsx` doesn't exist.

**P1**
- Multi-class switching works visually but no "add another class" CTA inside ClassPicker.
- `starter_units` table is written at setup but never re-surfaced as lesson templates.
- StudentDetail exists but shows no games-played / minutes / last-seen in real data.

### C. Live-class risks

**P0**
- No kick / mute / remove-player. A troll nickname stays on leaderboard all class.
- No "presenter vs control" split. If teacher projects `/teach/quiz`, kids see the Lock-in & reveal controls.
- No refresh-recovery. Teacher refreshes → `LiveHost.tsx:33-54` creates a brand-new room. Whole class disconnects.

**P1**
- No question timer in `QuestionPanel` — `LiveHost.tsx:304`.
- No pause, skip, or go-back for broken questions mid-quiz.

### D. Onboarding friction

**P1**
- 5-step wizard before any value. Steps 1 (About You) and 4 (Unit) are dispensable for "open a room now" — move them post-dashboard.
- No Google sign-in gate before wizard. Teacher fills 5 steps, then POST may silently fail on auth — `StepRoster.tsx:85` swallows error.

**P2**
- Session-storage draft works but no "Draft saved 2s ago" indicator.
- "4 minutes" promise on setup banner is aspirational vs 5 steps + unit generation.

### E. Polish

**P0**
- Brand inconsistency: page titles say "Playdemy" (`teacher/page.tsx:13`, `setup/page.tsx:10`). Repo says "Problocks".

**P1**
- "Ms. Rivera" demo persona leaks when `?classId=` is unset — `TeacherApp.tsx:127`. No "viewing a demo" ribbon.
- Copy mixes "Class / Classroom / Room". Pick one noun per surface.
- Clever / Teams tiles hidden but no timeline signal — teacher who needs them bounces.

---

## 3. Studio (creator) experience

### A. First-run dead-end

**P0**
- `/studio` cold-opens directly into a 3D workspace with baseplate — `StudioLayout.tsx:132` default `viewMode: '3d'`. No tour, no empty state, no "make your first game" CTA.
- `EmptyState` with "Start a new game project" exists but only renders in Kanban/Flowchart view. New user in default 3D never sees it.
- `NewGameDialog` only opens on `⌘N` or kebab — both hidden from first-timer. Does not auto-open on first visit (explicit comment at `StudioLayout.tsx:123`).
- Top bar breadcrumb says "Playdemy > Ms. Alvarez > Period 4 > Untitled Game" — hardcoded fake-classroom text for every user — `TopMenuBar.tsx:203-207`.
- No starter templates ("platformer", "quiz", "3D adventure") in opening view. `OnboardingWizard.tsx` has them but is unreachable.

### B. Broken buttons

**P0**
- Kebab menu: `Save`, `Publish to Marketplace`, `Classroom`, `Sign out` all `onClick: () => {}` — `TopMenuBar.tsx:161-171`.
- Share button top bar has no `onClick` — `TopMenuBar.tsx:283`.
- ConnectorsPanel rows are `draggable: true` but no surface has an `onDrop` handler — `ConnectorsPanel.tsx:32`.
- Meshy / Suno / ElevenLabs show `connected: true` but no API routes exist — `ConnectorsPanel.tsx:22-26`.
- "Browse marketplace" dashed button has no `onClick` — `ConnectorsPanel.tsx:96-117`.
- Auto-save + Show grid toggles are `onChange={() => {}}` — `SettingsPanel.tsx:667-668`.
- "Buy More Credits" has no `onClick` — `SettingsPanel.tsx:843-849`.
- **SettingsPanel is orphaned entirely.** No tab, no route, no button mounts it. Dead code.
- Right-panel "Workspace" tab duplicates lighting that's already in ScenePanel via `useLightingStore`.

### C. Missing creator features

**P0**
- No "my games" library UI. `games[]` is in studio-store + localStorage but never rendered. Refresh drops you into a new-game state (`activeGameId` intentionally not persisted — `studio-store.ts:194-196`).
- No undo/redo. No `mod+z`, no history stack. AI generation overwrites `gameHtml` — `StudioLayout.tsx:304, 315`.
- No rename. Game name set once from `<title>` regex. Title-bar input edits `projectName` (shell label), not active game's `name`.
- No save flow. "Save" is a no-op. Persistence is Zustand localStorage only — no Supabase sync, no cover image, no tags.

**P1**
- No fork / remix / share-preview link / export-to-HTML.
- No preview-on-device-size toggle. Single fixed iframe.
- Template starters exist but only reachable via Kanban → EmptyState.
- Error recovery silent — `/api/agent` error shows a red line in terminal. No retry, no "regenerate just this file".

### D. Agent / chat confusion

**P1**
- Three AI entry points with zero shared history:
  1. Terminal (⌘J) → `/api/agent` → full HTML game
  2. Right-panel Chat "Scene" mode → `/api/studio-agent` → scene actions
  3. Right-panel Chat "Part" mode → swaps to Part Studio, own generator
- Top bar "Claude" pill sets `leftPanelActiveGroup='chat'` but chat moved to right panel — decorative dead-end (`TopMenuBar.tsx:96-102`, `LeftPanel.tsx:17`).
- No shared transcript view, no "continue last thread".
- No cost indicator anywhere. Credits "2,450" is static decoration.
- Terminal hint says "Ctrl+C to cancel", chat shows a Cancel button. Different mental models for the same action.
- Streaming UX uneven: Terminal has per-file "Writing X..." / "✅ X (N lines)". Chat just shows a pulsing cursor.

### E. Save / library loop

**P0**
- Save → no-op. Publish → no-op. No draft list. No cover thumbnail. No "return to yesterday's game" path.
- `games[]` persists but only way to re-open is `setActiveGameId` which nothing in the UI calls outside `addGame`. Effectively write-only.

### F. Polish

**P1**
- Hardcoded "Ms. Alvarez · Period 4" breadcrumb + "Jules Tran, Rosa Shah" avatars — `TopMenuBar.tsx:206, 281`. Unreplaced design-bundle stubs.
- `/studio/scratch` is a raw full-screen iframe. No back link, no preview-commit flow.
- `/studio/scratch/bricks` and `/build` both do tile-based 3D. Unclear which is canonical.
- No `?` hotkey panel.
- "Coming soon" placeholders for 2D and top-down asset panels visible in prod — `AssetsPanel.tsx:122-131`.

---

## 4. Strategic feature gaps (the big missing pieces)

### Core loop — does not close

**P0 · ~1 month**
- Student publish-to-play link doesn't exist. `games` table has no `is_published` / `visibility` / `plays_count` / `approval` fields.
- Marketplace hardcodes one LEGO entry — `marketplace/page.tsx:16`.
- `/play/[gameId]` route doesn't exist. Only `/play/quiz` and `/play/race`.
- Play telemetry is zero — no `plays_count` / `play_event` anywhere.
- No comments / likes / ratings / "who played my game" surface.

### Monetization — aspirational only

**P0 · ~1 month**
- Credits/coins are display-only hardcoded constants.
- Landing FAQ promises "70% of gross revenue goes back to the class" — nothing wired.
- No `credits` or `wallet` table. No Stripe imports. No generation-cost metering in `/api/agent` or `/api/generate-part`.
- A single classroom can burn the Anthropic bill dry.

### Moderation — claimed but unbuilt

**P0 · ~2 weeks**
- Landing pages advertise "teacher-approved publishing", "kindness filter". Zero implementation.
- No approval queue component, no `moderation_status` column, no profanity pass, no report button in play route, no age gate on generator routes.
- Shipping kid-created HTML to other kids with zero review is a lawsuit waiting.

### Progression — a facade

**P1 · ~1 week**
- `streak`, `coins`, `xp`, `xpNext` are static consts — `Dashboard.tsx:37-40`.
- Crates and Wardrobe have full UIs but no earning path — no `crate_earned` / `inventory` writes.
- Highest demo-to-reality gap students notice.

### Social / community layer — absent

**P1 · ~1 month**
- No friends list, followers, creator profile pages, "games from classmates". Grep for `friend`/`follow`/`comment`/`reaction` returns zero.
- Marketplace has no class / school / public scoping filter.

### Re-engagement — absent

**P1 · ~1 week**
- No push, no email reminders, no notifications, no "your friend played your game" triggers.

### Teacher analytics — partly fake

**P1 · ~2 weeks**
- `Overview.tsx` shows real-looking KPIs and heatmaps — `teacher-data-context.tsx` falls back to sample data outside real mode.
- No gradebook, no per-game play records, no cross-game struggling-student signal.

### AI-cost visibility

**P0 · ~3 days (slots into monetization)**
- No credit counter in studio header. No "generating uses X credits" on buttons. No out-of-credits modal.
- Users will hit invisible limits and churn.

### Accessibility — not a feature

**P1 · ~1 week**
- No text-to-speech, dyslexia font, colorblind palette, keyboard-only flows.
- Chunky-pastel on cream fails WCAG AA in several spots.

### Localization — zero

**P1 · ~2 weeks (post-launch)**
- No `i18n` / `next-intl`. All copy hardcoded English. Large ELL/Spanish segment locked out.

### Offline / Chromebook resilience — none

**P1 · ~1 week**
- No service worker, no `manifest.json`, no IndexedDB queue.
- Classroom WiFi flaps will lose unsaved work — and target hardware is Celeron N4000.

### LMS integrations — mostly stubs

**P1 · ~2 weeks per vendor**
- Google Classroom partial. No ClassLink, Schoology, Canvas, Clever. Districts won't buy without at least Clever/ClassLink SSO.

### Device story — desktop-only

**P1 · ~2 weeks**
- `DesktopOnly.tsx` blocks phone sizes. No tablet optimization, no touch-first studio. Chromebook convertibles flip constantly.

### Kids trust & safety

**P0 · ~2 weeks** before any paid school rollout
- Privacy/terms pages exist but no COPPA parent-consent modal, no data-deletion form, no data-export endpoint, no age-gated generator.

### Growth loops — missing

**P1 · ~1 week** (after play route exists)
- No shareable `/play/[gameId]` → no OG image per game, no share button, no embed.

---

## Recommended ship sequence

**Sprint 1 (close the loop)**
1. Real `games` schema (`is_published`, `visibility`, `plays_count`, `moderation_status`, `cover_url`).
2. `/play/[gameId]` route with iframe sandbox + play-event logging.
3. Studio "Save" → Supabase write; "Share" → copy `/play/<id>` link.
4. "My games" list panel (open drafts, rename, delete).
5. Auto-open NewGameDialog on first visit / empty state.

**Sprint 2 (trust + money)**
6. Credits ledger + generator metering + visible counter.
7. Teacher moderation approval queue.
8. Report-content button in play route.
9. COPPA parent-consent modal + data-deletion form.
10. Undo stack for AI generation.

**Sprint 3 (feel finished)**
11. Replace fake streak/coins/XP with real ledger for new users.
12. Fix 6-vs-8 join code, kill fake QR scanner, wire password reset.
13. Teacher: real "Publish to class" API, live quiz content picker, refresh-recovery.
14. Hide dead Meshy/Suno/ElevenLabs connectors and orphaned SettingsPanel.
15. Brand reconciliation (Playdemy vs Problocks) + remove hardcoded demo breadcrumbs.

**Sprint 4 (delight + reach)**
16. Confetti / level-up moments, avatar reactions, sounds.
17. Shareable game links with OG images.
18. Accessibility pass (TTS, dyslexia font, palettes, keyboard nav).
19. PWA + offline save queue for Chromebooks.
20. Clever/ClassLink SSO for district sales.
