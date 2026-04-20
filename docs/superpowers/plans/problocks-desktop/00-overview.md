# Problocks Desktop Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Tauri desktop app that orchestrates Blender and Godot for indie game devs, with an AI terminal agent that dispatches work to both tools and previews results.

**Architecture:** Tauri v2 (Rust backend) wraps a Vite + React SPA. Rust manages Blender/Godot as subprocesses, watches the filesystem for asset changes, and emits events to the React frontend. The AI agent spawns Claude CLI in Rust, parses its output, and generates Blender Python scripts + Godot scene/script files. The filesystem is the communication bus between all components.

**Tech Stack:** Tauri v2, Rust (tokio, notify, serde), Vite, React 19, TypeScript, Zustand, Tailwind CSS v4, Lucide icons

---

## Plan Structure

This plan is split across multiple files for readability (per CLAUDE.md max 400 lines):

| File | Phase | Tasks | What it delivers |
|------|-------|-------|-----------------|
| [01-phase1-scaffold-shell.md](01-phase1-scaffold-shell.md) | Phase 1 | 1-3 | Tauri app with 4-zone layout and Zustand stores |
| [02a-phase2-project-blender.md](02a-phase2-project-blender.md) | Phase 2a | 4-5 | Rust managers for Project and Blender |
| [02b-phase2-godot-watcher.md](02b-phase2-godot-watcher.md) | Phase 2b | 6-7 | Rust managers for Godot and file watching |
| [03-phase3-tauri-bridge.md](03-phase3-tauri-bridge.md) | Phase 3 | 8-9 | Tauri commands + typed TypeScript bridge |
| [04-phase4-frontend.md](04-phase4-frontend.md) | Phase 4 | 10-13 | PipelinePanel, ActivityLog, Terminal, wired DesktopLayout |
| [05-phase5-ai-agent.md](05-phase5-ai-agent.md) | Phase 5 | 14-15 | AI agent spawning Claude CLI, dispatching to Blender/Godot |
| [06a-phase6-mobile-scaffold.md](06a-phase6-mobile-scaffold.md) | Phase 6a | 16-17 | Mobile app scaffold + game store API |
| [06b-phase6-mobile-ui-publish.md](06b-phase6-mobile-ui-publish.md) | Phase 6b | 18-19 | Mobile store UI + publish flow |

---

## File Structure

```
~/ProblockDesktop/
├── package.json                    # Vite + React deps
├── vite.config.ts                  # Vite config with Tauri plugin
├── tsconfig.json
├── index.html                      # Vite entry
├── src/                            # React frontend
│   ├── main.tsx                    # React mount
│   ├── App.tsx                     # Root — renders DesktopLayout
│   ├── components/
│   │   ├── DesktopLayout.tsx       # 4-zone shell (pipeline | preview | log | terminal)
│   │   ├── Terminal.tsx            # Adapted from Problocks — uses Tauri events
│   │   ├── GamePreview.tsx         # Adapted — loads Godot HTML5 export
│   │   ├── PipelinePanel.tsx       # Shows Blender/Godot process status + asset list
│   │   └── ActivityLog.tsx         # Real-time event feed
│   ├── store/
│   │   ├── orchestrator-store.ts   # Project state, process status, assets
│   │   └── activity-store.ts       # Activity log entries
│   └── lib/
│       └── tauri-bridge.ts         # Typed wrappers around invoke() + listen()
├── src-tauri/                      # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json            # Tauri v2 permissions
│   └── src/
│       ├── main.rs                 # Tauri setup, register commands
│       ├── commands.rs             # All #[tauri::command] functions
│       ├── blender.rs              # BlenderManager — detect, run scripts, monitor
│       ├── godot.rs                # GodotManager — detect, launch, export
│       ├── project.rs              # ProjectManager — create/open project dirs
│       ├── watcher.rs              # FileWatcher — notify crate, emit events
│       └── agent.rs                # AIAgent — spawn Claude CLI, parse stream, dispatch
└── docs/
```

**Responsibility map:**

| File | Responsibility |
|------|---------------|
| `blender.rs` | Find Blender binary, run `blender --background --python`, stream stdout, detect exports |
| `godot.rs` | Find Godot binary, open editor at scene, run project, export HTML5 |
| `project.rs` | Create project folder structure, read manifest, list assets |
| `watcher.rs` | Watch project dir with `notify` crate, emit Tauri events on file changes |
| `agent.rs` | Spawn `claude` CLI, parse stream-json output, generate Blender .py and Godot .tscn/.gd files |
| `commands.rs` | Thin Tauri command layer — delegates to managers |
| `tauri-bridge.ts` | TypeScript `invoke()` wrappers with proper types for every command |
| `orchestrator-store.ts` | Zustand store: project state, Blender/Godot process status, asset list |
| `activity-store.ts` | Zustand store: timestamped activity log entries |
| `DesktopLayout.tsx` | 4-zone CSS grid: left=Pipeline, center=Preview, right=ActivityLog, bottom=Terminal |
| `PipelinePanel.tsx` | Renders Blender/Godot status cards + clickable asset list |
| `ActivityLog.tsx` | Scrolling log of events with source badges [Blender] [Godot] [AI] |
| `Terminal.tsx` | AI chat — sends prompts via Tauri command, receives streamed events |
| `GamePreview.tsx` | Loads Godot HTML5 export from local file path via Tauri asset protocol |

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| **Phase 1** | 1-3 | Tauri app with 4-zone layout and Zustand stores |
| **Phase 2** | 4-7 | Rust managers for Project, Blender, Godot, and file watching |
| **Phase 3** | 8-9 | Tauri commands + typed TypeScript bridge |
| **Phase 4** | 10-13 | PipelinePanel, ActivityLog, Terminal, wired DesktopLayout |
| **Phase 5** | 14-15 | AI agent spawning Claude CLI, dispatching to Blender/Godot |
| **Phase 6** | 16-19 | Mobile player app (React Native + Godot runtime) + publish flow |

**Full ecosystem:**

```
┌──────────────────────────────────────────────────────────┐
│                    Problocks Platform                     │
│                                                          │
│  Desktop (Tauri)  ──publish──▶  problocks.gg  ◀──browse──  Mobile (RN)
│  Create games                  API + Storage              Play games
│  Blender + Godot               Game listings              Godot runtime
│  AI orchestration              .pck + HTML5 hosting       Download .pck
│                                Ratings, discovery          
│  Web (Next.js)  ──────────────browse + play──────────────▶  Browser
│  Lightweight creator           HTML5 games in iframe       Play in browser
└──────────────────────────────────────────────────────────┘
```

**Post-MVP extensions (not in this plan):**
- GamePreview loading Godot HTML5 exports via Tauri asset protocol
- Open file dialog for "Open Project"
- Drag-to-resize terminal height
- Conversation persistence across sessions
- Classroom integration (from existing Problocks)
- Godot export preset auto-configuration
- Asset thumbnail previews
- Mobile: In-app purchases, creator monetization, social features
- Mobile: Push notifications for new games
- Mobile: Offline play support with cached .pck files
