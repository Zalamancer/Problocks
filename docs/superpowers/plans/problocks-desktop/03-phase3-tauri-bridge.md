# Phase 3: Tauri Commands & Bridge (Tasks 8-9)

> Part of [Problocks Desktop Implementation Plan](00-overview.md)

### Task 8: Tauri commands — connect Rust managers to frontend

**Files:**
- Create: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/main.rs`

- [ ] **Step 1: Create commands.rs**

Create `src-tauri/src/commands.rs`:

```rust
use crate::{blender, godot, project};
use notify::RecommendedWatcher;
use std::sync::Mutex;
use tauri::{AppHandle, State};

pub struct AppState {
    pub blender_path: Mutex<Option<String>>,
    pub godot_path: Mutex<Option<String>>,
    pub project_path: Mutex<Option<String>>,
    pub watcher: Mutex<Option<RecommendedWatcher>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            blender_path: Mutex::new(None),
            godot_path: Mutex::new(None),
            project_path: Mutex::new(None),
            watcher: Mutex::new(None),
        }
    }
}

// ── Detection ──────────────────────────────────────

#[tauri::command]
pub fn detect_tools(state: State<'_, AppState>) -> serde_json::Value {
    let bp = blender::detect_blender();
    let gp = godot::detect_godot();

    if let Some(ref p) = bp {
        *state.blender_path.lock().unwrap() = Some(p.clone());
    }
    if let Some(ref p) = gp {
        *state.godot_path.lock().unwrap() = Some(p.clone());
    }

    serde_json::json!({
        "blender": bp,
        "godot": gp,
    })
}

// ── Project ────────────────────────────────────────

#[tauri::command]
pub fn create_project(
    app: AppHandle,
    state: State<'_, AppState>,
    base_dir: String,
    name: String,
) -> Result<project::ProjectInfo, String> {
    let info = project::create_project(&base_dir, &name)?;

    *state.project_path.lock().unwrap() = Some(info.path.clone());

    // Start watching the new project
    let watcher = crate::watcher::watch_project(app, &info.path)?;
    *state.watcher.lock().unwrap() = Some(watcher);

    Ok(info)
}

#[tauri::command]
pub fn open_project(
    app: AppHandle,
    state: State<'_, AppState>,
    project_path: String,
) -> Result<project::ProjectInfo, String> {
    let info = project::open_project(&project_path)?;

    *state.project_path.lock().unwrap() = Some(info.path.clone());

    let watcher = crate::watcher::watch_project(app, &info.path)?;
    *state.watcher.lock().unwrap() = Some(watcher);

    Ok(info)
}

#[tauri::command]
pub fn list_assets(state: State<'_, AppState>) -> Result<Vec<project::AssetInfo>, String> {
    let path = state.project_path.lock().unwrap();
    let path = path.as_ref().ok_or("No project open")?;
    project::list_assets(path)
}

// ── Blender ────────────────────────────────────────

#[tauri::command]
pub async fn run_blender_script(
    app: AppHandle,
    state: State<'_, AppState>,
    script_content: String,
) -> Result<blender::BlenderResult, String> {
    let bp = state.blender_path.lock().unwrap().clone()
        .ok_or("Blender not detected")?;
    let pp = state.project_path.lock().unwrap().clone()
        .ok_or("No project open")?;

    // Write script to temp file inside project
    let script_path = format!("{}/.problocks/blender-scripts/_current.py", pp);
    std::fs::write(&script_path, &script_content)
        .map_err(|e| format!("Failed to write script: {}", e))?;

    blender::run_script(&app, &bp, &script_path, None).await
}

#[tauri::command]
pub fn open_in_blender(state: State<'_, AppState>, file_path: String) -> Result<(), String> {
    let bp = state.blender_path.lock().unwrap().clone()
        .ok_or("Blender not detected")?;

    std::process::Command::new(&bp)
        .arg(&file_path)
        .spawn()
        .map_err(|e| format!("Failed to open Blender: {}", e))?;

    Ok(())
}

// ── Godot ──────────────────────────────────────────

#[tauri::command]
pub async fn open_godot_editor(
    state: State<'_, AppState>,
    scene: Option<String>,
) -> Result<(), String> {
    let gp = state.godot_path.lock().unwrap().clone()
        .ok_or("Godot not detected")?;
    let pp = state.project_path.lock().unwrap().clone()
        .ok_or("No project open")?;

    godot::open_editor(&gp, &pp, scene.as_deref()).await
}

#[tauri::command]
pub async fn run_godot_game(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let gp = state.godot_path.lock().unwrap().clone()
        .ok_or("Godot not detected")?;
    let pp = state.project_path.lock().unwrap().clone()
        .ok_or("No project open")?;

    godot::run_game(&app, &gp, &pp).await
}

#[tauri::command]
pub async fn export_godot_html5(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<godot::GodotExportResult, String> {
    let gp = state.godot_path.lock().unwrap().clone()
        .ok_or("Godot not detected")?;
    let pp = state.project_path.lock().unwrap().clone()
        .ok_or("No project open")?;

    let output_dir = format!("{}/.problocks/html5-export", pp);
    godot::export_html5(&app, &gp, &pp, &output_dir).await
}

#[tauri::command]
pub fn get_godot_counts(state: State<'_, AppState>) -> Result<(usize, usize), String> {
    let pp = state.project_path.lock().unwrap().clone()
        .ok_or("No project open")?;
    Ok(godot::count_project_files(&pp))
}
```

- [ ] **Step 2: Wire everything in main.rs**

Replace `src-tauri/src/main.rs`:

```rust
mod blender;
mod commands;
mod godot;
mod project;
mod watcher;

use commands::AppState;

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::detect_tools,
            commands::create_project,
            commands::open_project,
            commands::list_assets,
            commands::run_blender_script,
            commands::open_in_blender,
            commands::open_godot_editor,
            commands::run_godot_game,
            commands::export_godot_html5,
            commands::get_godot_counts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 3: Update Tauri v2 capabilities**

Create/update `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capability for Problocks Desktop",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:event:default",
    "core:event:allow-emit",
    "core:event:allow-listen"
  ]
}
```

- [ ] **Step 4: Verify it compiles**

```bash
cd ~/ProblockDesktop && cargo build --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Tauri commands connecting all Rust managers to frontend"
```

---

### Task 9: TypeScript bridge — typed wrappers for Tauri commands

**Files:**
- Create: `src/lib/tauri-bridge.ts`

- [ ] **Step 1: Create tauri-bridge.ts**

Create `src/lib/tauri-bridge.ts`:

```typescript
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

// ── Types ──────────────────────────────────────────

export interface ToolDetection {
  blender: string | null;
  godot: string | null;
}

export interface ProjectInfo {
  name: string;
  path: string;
  godot_project_path: string;
}

export interface AssetInfo {
  name: string;
  path: string;
  asset_type: string;
  source: string;
  size_bytes: number;
}

export interface BlenderResult {
  success: boolean;
  output_files: string[];
  stdout: string;
  stderr: string;
}

export interface GodotExportResult {
  success: boolean;
  output_path: string;
  stdout: string;
  stderr: string;
}

export interface FileChangeEvent {
  kind: "created" | "modified" | "removed";
  path: string;
  extension: string;
}

// ── Commands ───────────────────────────────────────

export const bridge = {
  detectTools: () => invoke<ToolDetection>("detect_tools"),

  createProject: (baseDir: string, name: string) =>
    invoke<ProjectInfo>("create_project", { baseDir, name }),

  openProject: (projectPath: string) =>
    invoke<ProjectInfo>("open_project", { projectPath }),

  listAssets: () => invoke<AssetInfo[]>("list_assets"),

  runBlenderScript: (scriptContent: string) =>
    invoke<BlenderResult>("run_blender_script", { scriptContent }),

  openInBlender: (filePath: string) =>
    invoke<void>("open_in_blender", { filePath }),

  openGodotEditor: (scene?: string) =>
    invoke<void>("open_godot_editor", { scene: scene ?? null }),

  runGodotGame: () => invoke<void>("run_godot_game"),

  exportGodotHtml5: () => invoke<GodotExportResult>("export_godot_html5"),

  getGodotCounts: () => invoke<[number, number]>("get_godot_counts"),
};

// ── Event Listeners ────────────────────────────────

export const events = {
  onBlenderStdout: (cb: (line: string) => void): Promise<UnlistenFn> =>
    listen<string>("blender:stdout", (e) => cb(e.payload)),

  onGodotStdout: (cb: (line: string) => void): Promise<UnlistenFn> =>
    listen<string>("godot:stdout", (e) => cb(e.payload)),

  onGodotExportComplete: (cb: (path: string) => void): Promise<UnlistenFn> =>
    listen<string>("godot:export_complete", (e) => cb(e.payload)),

  onFileChange: (cb: (event: FileChangeEvent) => void): Promise<UnlistenFn> =>
    listen<FileChangeEvent>("fs:change", (e) => cb(e.payload)),
};
```

- [ ] **Step 2: Install Tauri JS API**

```bash
cd ~/ProblockDesktop && npm install @tauri-apps/api
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add typed TypeScript bridge for all Tauri commands and events"
```
