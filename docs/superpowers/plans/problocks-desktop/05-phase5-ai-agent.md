# Phase 5: AI Agent Orchestration (Tasks 14-15)

> Part of [Problocks Desktop Implementation Plan](00-overview.md)

### Task 14: Rust AI Agent — spawn Claude CLI and dispatch to Blender/Godot

**Files:**
- Create: `src-tauri/src/agent.rs`
- Modify: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/main.rs`

- [ ] **Step 1: Create agent.rs**

Create `src-tauri/src/agent.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentEvent {
    pub event_type: String, // "text", "status", "blender_script", "godot_file", "done", "error"
    pub content: String,
}

/// Run the AI agent: spawn Claude CLI, parse streaming output, dispatch actions
pub async fn run_agent(
    app: &AppHandle,
    prompt: &str,
    project_path: &str,
    conversation_history: &str,
) -> Result<String, String> {
    let system_prompt = format!(
        r#"You are the Problocks AI game development agent. You orchestrate Blender and Godot to build games.

PROJECT PATH: {project_path}
ASSET DIRECTORY: {project_path}/assets/models/
SCENE DIRECTORY: {project_path}/scenes/
SCRIPT DIRECTORY: {project_path}/scripts/

When asked to create 3D models, output Blender Python scripts wrapped in:
```blender-python
<script content>
```

When asked to create game scenes, output Godot .tscn files wrapped in:
```godot-scene
<filename>: <scene content>
```

When asked to create game scripts, output GDScript wrapped in:
```gdscript
<filename>: <script content>
```

In Blender scripts:
- Always end with a print("EXPORT:<output_file_path>") line
- Export to {project_path}/assets/models/<name>.glb
- Use bpy.ops.export_scene.gltf() for export

In Godot scenes/scripts:
- Reference assets as res://assets/models/<name>.glb
- Main scene goes in res://scenes/main.tscn

Previous conversation:
{conversation_history}
"#
    );

    let mut cmd = Command::new("claude");
    cmd.arg("--output-format")
        .arg("stream-json")
        .arg("--dangerously-skip-permissions")
        .arg("--system")
        .arg(&system_prompt)
        .arg("--prompt")
        .arg(prompt)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn claude: {}", e))?;
    let stdout = child.stdout.take().unwrap();
    let reader = BufReader::new(stdout);
    let mut lines = reader.lines();
    let mut full_response = String::new();

    while let Ok(Some(line)) = lines.next_line().await {
        if line.trim().is_empty() {
            continue;
        }

        // Parse stream-json format
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&line) {
            match json.get("type").and_then(|t| t.as_str()) {
                Some("assistant") => {
                    if let Some(text) = json
                        .get("message")
                        .and_then(|m| m.get("content"))
                        .and_then(|c| c.as_array())
                        .and_then(|arr| arr.first())
                        .and_then(|b| b.get("text"))
                        .and_then(|t| t.as_str())
                    {
                        full_response.push_str(text);
                        let _ = app.emit("agent:text", text);
                    }
                }
                Some("content_block_delta") => {
                    if let Some(text) = json
                        .get("delta")
                        .and_then(|d| d.get("text"))
                        .and_then(|t| t.as_str())
                    {
                        full_response.push_str(text);
                        let _ = app.emit("agent:text", text);
                    }
                }
                Some("result") => {
                    if let Some(text) = json
                        .get("result")
                        .and_then(|r| r.as_str())
                    {
                        full_response = text.to_string();
                    }
                    let _ = app.emit("agent:done", "");
                }
                _ => {}
            }
        }
    }

    child.wait().await.map_err(|e| format!("Claude process error: {}", e))?;

    Ok(full_response)
}

/// Extract code blocks from AI response by language tag
pub fn extract_code_blocks(response: &str, tag: &str) -> Vec<(Option<String>, String)> {
    let mut blocks = Vec::new();
    let fence = format!("```{}", tag);
    let mut remaining = response;

    while let Some(start_idx) = remaining.find(&fence) {
        let after_fence = &remaining[start_idx + fence.len()..];
        // Skip to next newline
        let code_start = after_fence.find('\n').map(|i| i + 1).unwrap_or(0);
        let first_line = &after_fence[..code_start].trim();

        // Check if first line has a filename (e.g., "enemy.gd: ...")
        let filename = first_line
            .strip_suffix(':')
            .map(|f| f.trim().to_string());

        let code_content = &after_fence[code_start..];
        if let Some(end_idx) = code_content.find("```") {
            let code = code_content[..end_idx].trim().to_string();
            blocks.push((filename, code));
            remaining = &code_content[end_idx + 3..];
        } else {
            break;
        }
    }

    blocks
}
```

- [ ] **Step 2: Add agent command to commands.rs**

Add to `src-tauri/src/commands.rs`:

```rust
use crate::agent;

#[tauri::command]
pub async fn run_agent_prompt(
    app: AppHandle,
    state: State<'_, AppState>,
    prompt: String,
    conversation_history: String,
) -> Result<String, String> {
    let pp = state.project_path.lock().unwrap().clone()
        .ok_or("No project open")?;

    let response = agent::run_agent(&app, &prompt, &pp, &conversation_history).await?;

    // Extract and execute Blender scripts
    let blender_scripts = agent::extract_code_blocks(&response, "blender-python");
    for (_name, script) in &blender_scripts {
        let bp = state.blender_path.lock().unwrap().clone()
            .ok_or("Blender not detected")?;
        let script_path = format!("{}/.problocks/blender-scripts/_agent.py", pp);
        std::fs::write(&script_path, script)
            .map_err(|e| format!("Failed to write blender script: {}", e))?;

        let _ = app.emit("agent:status", "Running Blender script...");
        let result = crate::blender::run_script(&app, &bp, &script_path, None).await?;
        if result.success {
            let _ = app.emit("agent:status", "Blender script completed");
        } else {
            let _ = app.emit("agent:status", format!("Blender error: {}", result.stderr));
        }
    }

    // Extract and write Godot scene files
    let scenes = agent::extract_code_blocks(&response, "godot-scene");
    for (filename, content) in &scenes {
        let fname = filename.as_deref().unwrap_or("generated.tscn");
        let path = format!("{}/scenes/{}", pp, fname);
        std::fs::write(&path, content)
            .map_err(|e| format!("Failed to write scene: {}", e))?;
        let _ = app.emit("agent:status", format!("Created scene: {}", fname));
    }

    // Extract and write GDScript files
    let scripts = agent::extract_code_blocks(&response, "gdscript");
    for (filename, content) in &scripts {
        let fname = filename.as_deref().unwrap_or("generated.gd");
        let path = format!("{}/scripts/{}", pp, fname);
        std::fs::write(&path, content)
            .map_err(|e| format!("Failed to write script: {}", e))?;
        let _ = app.emit("agent:status", format!("Created script: {}", fname));
    }

    Ok(response)
}
```

- [ ] **Step 3: Register in main.rs**

Add `mod agent;` and add `commands::run_agent_prompt` to the `invoke_handler` list.

- [ ] **Step 4: Verify it compiles**

```bash
cd ~/ProblockDesktop && cargo build --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add AI agent with Claude CLI integration and code block extraction"
```

---

### Task 15: Wire Terminal to AI Agent

**Files:**
- Modify: `src/components/Terminal.tsx`
- Modify: `src/lib/tauri-bridge.ts`

- [ ] **Step 1: Add agent commands to bridge**

Add to `src/lib/tauri-bridge.ts`:

```typescript
// Add to bridge object:
  runAgentPrompt: (prompt: string, conversationHistory: string) =>
    invoke<string>("run_agent_prompt", { prompt, conversationHistory }),

// Add to events object:
  onAgentText: (cb: (text: string) => void): Promise<UnlistenFn> =>
    listen<string>("agent:text", (e) => cb(e.payload)),

  onAgentStatus: (cb: (status: string) => void): Promise<UnlistenFn> =>
    listen<string>("agent:status", (e) => cb(e.payload)),

  onAgentDone: (cb: () => void): Promise<UnlistenFn> =>
    listen<string>("agent:done", () => cb()),
```

- [ ] **Step 2: Update Terminal handleSubmit**

Replace the TODO block in `Terminal.tsx`'s `handleSubmit`:

```typescript
const handleSubmit = async () => {
  const msg = input.trim();
  if (!msg || isProcessing) return;

  setInput("");
  addLine({ type: "input", text: `> ${msg}` });
  setIsProcessing(true);

  if (!project) {
    addLine({ type: "error", text: "No project open. Create or open a project first." });
    setIsProcessing(false);
    return;
  }

  addLine({ type: "status", text: "AI is thinking..." });
  addActivity("ai", "pending", `Processing: "${msg}"`);

  try {
    const history = lines
      .filter((l) => l.type === "input" || l.type === "output")
      .map((l) => l.text)
      .join("\n");

    await bridge.runAgentPrompt(msg, history);
    addActivity("ai", "success", "Agent completed");
  } catch (e) {
    addLine({ type: "error", text: `Error: ${e}` });
    addActivity("ai", "error", `Agent failed: ${e}`);
  } finally {
    setIsProcessing(false);
  }
};
```

- [ ] **Step 3: Add agent event listeners in Terminal useEffect**

Add to the existing `useEffect` that sets up listeners:

```typescript
events.onAgentText((text) => {
  addLine({ type: "output", text });
}).then((u) => unsubs.push(u));

events.onAgentStatus((status) => {
  addLine({ type: "status", text: status });
  addActivity("ai", "info", status);
}).then((u) => unsubs.push(u));

events.onAgentDone(() => {
  addLine({ type: "system", text: "Agent completed." });
}).then((u) => unsubs.push(u));
```

- [ ] **Step 4: Verify full flow**

```bash
cd ~/ProblockDesktop && npm run tauri dev
```

Expected: Create a project → type a game idea → see AI streaming text → Blender scripts run → Godot files created → Activity Log shows all events.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: wire Terminal to AI agent with streaming events and orchestration"
```
