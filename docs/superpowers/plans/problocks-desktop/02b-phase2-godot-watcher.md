# Phase 2b: Rust Backend — Godot & FileWatcher (Tasks 6-7)

> Part of [Problocks Desktop Implementation Plan](00-overview.md)

### Task 6: GodotManager — detect, launch editor, export HTML5

**Files:**
- Create: `src-tauri/src/godot.rs`
- Modify: `src-tauri/src/main.rs`

- [ ] **Step 1: Create godot.rs**

Create `src-tauri/src/godot.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Stdio;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GodotExportResult {
    pub success: bool,
    pub output_path: String,
    pub stdout: String,
    pub stderr: String,
}

/// Detect Godot binary on the system
pub fn detect_godot() -> Option<String> {
    let candidates = if cfg!(target_os = "macos") {
        vec![
            "/Applications/Godot.app/Contents/MacOS/Godot".to_string(),
            which("godot"),
            which("godot4"),
        ]
    } else if cfg!(target_os = "windows") {
        vec![
            which("godot"),
            which("godot4"),
        ]
    } else {
        vec![which("godot"), which("godot4")]
    };

    candidates.into_iter().find(|p| !p.is_empty() && Path::new(p).exists())
}

fn which(name: &str) -> String {
    std::process::Command::new("which")
        .arg(name)
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .unwrap_or_default()
}

/// Open Godot editor at a specific scene
pub async fn open_editor(
    godot_path: &str,
    project_path: &str,
    scene: Option<&str>,
) -> Result<(), String> {
    let mut cmd = Command::new(godot_path);
    cmd.arg("--editor").arg("--path").arg(project_path);

    if let Some(s) = scene {
        cmd.arg(s);
    }

    cmd.spawn()
        .map_err(|e| format!("Failed to launch Godot editor: {}", e))?;

    Ok(()) // Godot editor runs independently, we don't wait
}

/// Run the game in Godot
pub async fn run_game(
    app: &AppHandle,
    godot_path: &str,
    project_path: &str,
) -> Result<(), String> {
    let mut cmd = Command::new(godot_path);
    cmd.arg("--path")
        .arg(project_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to run game: {}", e))?;

    let stdout = child.stdout.take().unwrap();
    let app_clone = app.clone();
    tokio::spawn(async move {
        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            let _ = app_clone.emit("godot:stdout", &line);
        }
    });

    Ok(())
}

/// Export project as HTML5 (Web)
pub async fn export_html5(
    app: &AppHandle,
    godot_path: &str,
    project_path: &str,
    output_dir: &str,
) -> Result<GodotExportResult, String> {
    let output_path = Path::new(output_dir).join("index.html");

    // Ensure export directory exists
    std::fs::create_dir_all(output_dir)
        .map_err(|e| format!("Failed to create output dir: {}", e))?;

    let mut cmd = Command::new(godot_path);
    cmd.arg("--headless")
        .arg("--path")
        .arg(project_path)
        .arg("--export-release")
        .arg("Web")
        .arg(output_path.to_string_lossy().as_ref())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Godot export failed: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    let _ = app.emit("godot:export_complete", &output_path.to_string_lossy().to_string());

    Ok(GodotExportResult {
        success: output.status.success(),
        output_path: output_path.to_string_lossy().to_string(),
        stdout,
        stderr,
    })
}

/// Count scenes and scripts in a Godot project
pub fn count_project_files(project_path: &str) -> (usize, usize) {
    let path = Path::new(project_path);
    let mut scenes = 0;
    let mut scripts = 0;

    fn walk(dir: &Path, scenes: &mut usize, scripts: &mut usize) {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.is_dir() {
                    walk(&p, scenes, scripts);
                } else if let Some(ext) = p.extension() {
                    match ext.to_str().unwrap_or("") {
                        "tscn" | "scn" => *scenes += 1,
                        "gd" | "cs" => *scripts += 1,
                        _ => {}
                    }
                }
            }
        }
    }

    walk(path, &mut scenes, &mut scripts);
    (scenes, scripts)
}
```

- [ ] **Step 2: Register module**

Add to `src-tauri/src/main.rs`:

```rust
mod godot;
```

- [ ] **Step 3: Verify it compiles**

```bash
cd ~/ProblockDesktop && cargo build --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Rust GodotManager with editor launch and HTML5 export"
```

---

### Task 7: FileWatcher — watch project directory for changes

**Files:**
- Create: `src-tauri/src/watcher.rs`
- Modify: `src-tauri/src/main.rs`

- [ ] **Step 1: Create watcher.rs**

Create `src-tauri/src/watcher.rs`:

```rust
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::mpsc;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChangeEvent {
    pub kind: String,  // "created", "modified", "removed"
    pub path: String,
    pub extension: String,
}

/// Start watching a project directory. Emits "fs:change" events to the frontend.
/// Returns a handle that stops watching when dropped.
pub fn watch_project(
    app: AppHandle,
    project_path: &str,
) -> Result<RecommendedWatcher, String> {
    let (tx, rx) = mpsc::channel();

    let mut watcher = RecommendedWatcher::new(tx, Config::default())
        .map_err(|e| format!("Failed to create watcher: {}", e))?;

    watcher
        .watch(Path::new(project_path), RecursiveMode::Recursive)
        .map_err(|e| format!("Failed to watch path: {}", e))?;

    // Spawn a thread to process filesystem events
    std::thread::spawn(move || {
        while let Ok(event_result) = rx.recv() {
            if let Ok(event) = event_result {
                if let Some(change) = classify_event(&event) {
                    let _ = app.emit("fs:change", &change);
                }
            }
        }
    });

    Ok(watcher)
}

fn classify_event(event: &Event) -> Option<FileChangeEvent> {
    let path = event.paths.first()?;
    let ext = path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    // Only emit for relevant file types
    let relevant = matches!(
        ext.as_str(),
        "glb" | "gltf" | "blend" | "tscn" | "scn" | "gd" | "cs"
            | "png" | "jpg" | "svg" | "wav" | "ogg" | "mp3"
            | "tres" | "res" | "gdshader"
    );

    if !relevant {
        return None;
    }

    let kind = match event.kind {
        EventKind::Create(_) => "created",
        EventKind::Modify(_) => "modified",
        EventKind::Remove(_) => "removed",
        _ => return None,
    };

    Some(FileChangeEvent {
        kind: kind.to_string(),
        path: path.to_string_lossy().to_string(),
        extension: ext,
    })
}
```

- [ ] **Step 2: Register module**

Add to `src-tauri/src/main.rs`:

```rust
mod watcher;
```

- [ ] **Step 3: Verify it compiles**

```bash
cd ~/ProblockDesktop && cargo build --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add FileWatcher using notify crate for project dir monitoring"
```
