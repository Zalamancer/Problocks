# Phase 4: Frontend Components (Tasks 10-13)

> Part of [Problocks Desktop Implementation Plan](00-overview.md)

### Task 10: PipelinePanel — show process status and assets

**Files:**
- Create: `src/components/PipelinePanel.tsx`

- [ ] **Step 1: Create PipelinePanel.tsx**

Create `src/components/PipelinePanel.tsx`:

```tsx
import { useOrchestrator, type ProcessStatus } from "@/store/orchestrator-store";
import { bridge } from "@/lib/tauri-bridge";

function StatusDot({ status }: { status: ProcessStatus }) {
  const color =
    status === "running"
      ? "bg-green-400 animate-pulse"
      : status === "error"
        ? "bg-red-400"
        : "bg-zinc-600";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function ProcessCard({
  name,
  status,
  detail,
}: {
  name: string;
  status: ProcessStatus;
  detail?: string;
}) {
  return (
    <div className="bg-zinc-800 rounded-md p-2.5 border border-zinc-700">
      <div className="flex items-center gap-2">
        <StatusDot status={status} />
        <span className="text-xs font-semibold text-zinc-200">{name}</span>
      </div>
      {detail && (
        <p className="text-[10px] text-zinc-400 mt-1 truncate">{detail}</p>
      )}
    </div>
  );
}

const TYPE_ICONS: Record<string, string> = {
  model: "cube",
  scene: "layout",
  script: "file-code",
  texture: "image",
  audio: "volume-2",
};

export function PipelinePanel() {
  const {
    project,
    blenderStatus,
    godotStatus,
    blenderActiveTask,
    godotSceneCount,
    godotScriptCount,
    assets,
  } = useOrchestrator();

  const handleAssetClick = (asset: { path: string; source: string }) => {
    if (asset.source === "blender") {
      bridge.openInBlender(asset.path);
    } else if (asset.source === "godot") {
      bridge.openGodotEditor(asset.path);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Pipeline
      </h2>

      {!project ? (
        <p className="text-xs text-zinc-500">No project open</p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <ProcessCard
              name="Blender"
              status={blenderStatus}
              detail={blenderActiveTask ?? undefined}
            />
            <ProcessCard
              name="Godot"
              status={godotStatus}
              detail={
                godotSceneCount + godotScriptCount > 0
                  ? `${godotSceneCount} scenes, ${godotScriptCount} scripts`
                  : undefined
              }
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              Assets ({assets.length})
            </h3>
            <div className="flex flex-col gap-0.5">
              {assets.map((a) => (
                <button
                  key={a.path}
                  onClick={() => handleAssetClick(a)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-[10px] text-zinc-500 w-10">
                    {a.type}
                  </span>
                  <span className="text-xs text-zinc-300 truncate">
                    {a.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add PipelinePanel component with process cards and asset list"
```

---

### Task 11: ActivityLog — real-time event feed

**Files:**
- Create: `src/components/ActivityLog.tsx`

- [ ] **Step 1: Create ActivityLog.tsx**

Create `src/components/ActivityLog.tsx`:

```tsx
import { useEffect, useRef } from "react";
import { useActivity, type ActivitySource, type ActivityLevel } from "@/store/activity-store";

const SOURCE_COLORS: Record<ActivitySource, string> = {
  blender: "text-orange-400 bg-orange-400/10",
  godot: "text-blue-400 bg-blue-400/10",
  ai: "text-purple-400 bg-purple-400/10",
  system: "text-zinc-400 bg-zinc-400/10",
};

const LEVEL_ICONS: Record<ActivityLevel, string> = {
  success: "\u2713",
  error: "\u2717",
  pending: "\u25CF",
  info: "\u2022",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ActivityLog() {
  const entries = useActivity((s) => s.entries);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Activity
      </h2>

      <div className="flex-1 overflow-y-auto space-y-1">
        {entries.length === 0 && (
          <p className="text-xs text-zinc-500">No activity yet</p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="flex items-start gap-1.5 text-[11px]">
            <span className="text-zinc-600 font-mono shrink-0 w-16">
              {formatTime(e.timestamp)}
            </span>
            <span
              className={`px-1 rounded text-[9px] font-semibold uppercase shrink-0 ${SOURCE_COLORS[e.source]}`}
            >
              {e.source}
            </span>
            <span
              className={`shrink-0 ${
                e.level === "success"
                  ? "text-green-400"
                  : e.level === "error"
                    ? "text-red-400"
                    : e.level === "pending"
                      ? "text-yellow-400"
                      : "text-zinc-500"
              }`}
            >
              {LEVEL_ICONS[e.level]}
            </span>
            <span className="text-zinc-300">{e.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add ActivityLog component with timestamped source-tagged entries"
```

---

### Task 12: Terminal — adapt for Tauri commands and events

**Files:**
- Create: `src/components/Terminal.tsx`

This is adapted from the existing `~/Problocks/src/components/studio/Terminal.tsx` but uses Tauri commands instead of `fetch()` to an API route.

- [ ] **Step 1: Create Terminal.tsx**

Create `src/components/Terminal.tsx`:

```tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useActivity } from "@/store/activity-store";
import { useOrchestrator } from "@/store/orchestrator-store";
import { bridge, events } from "@/lib/tauri-bridge";

interface TerminalLine {
  type: "input" | "output" | "system" | "error" | "status";
  text: string;
}

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", text: "Problocks Desktop ready. Type a game idea to begin." },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addActivity = useActivity((s) => s.add);
  const project = useOrchestrator((s) => s.project);

  const addLine = useCallback((line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  // Listen for Blender/Godot stdout events
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    events.onBlenderStdout((line) => {
      addLine({ type: "output", text: `[Blender] ${line}` });
    }).then((u) => unsubs.push(u));

    events.onGodotStdout((line) => {
      addLine({ type: "output", text: `[Godot] ${line}` });
    }).then((u) => unsubs.push(u));

    events.onFileChange((e) => {
      addLine({
        type: "status",
        text: `[FS] ${e.kind}: ${e.path.split("/").pop()} (.${e.extension})`,
      });
      addActivity("system", "info", `${e.kind} ${e.path.split("/").pop()}`);
    }).then((u) => unsubs.push(u));

    return () => unsubs.forEach((u) => u());
  }, [addLine, addActivity]);

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

    // TODO (Task 14): Wire to AI agent command
    // For now, echo the command
    addLine({ type: "system", text: "AI agent not yet connected. (Phase 5)" });
    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const lineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input": return "text-green-400";
      case "output": return "text-zinc-300";
      case "system": return "text-blue-400";
      case "error": return "text-red-400";
      case "status": return "text-yellow-400";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-700">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Terminal
        </h2>
        {isProcessing && (
          <span className="text-[10px] text-yellow-400 animate-pulse">Processing...</span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className={lineColor(line.type)}>
            {line.text}
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-700 p-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-xs font-mono">{">"}</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={project ? "Describe your game..." : "Open a project first"}
            disabled={!project}
            rows={1}
            className="flex-1 bg-transparent text-zinc-100 text-xs font-mono outline-none resize-none placeholder-zinc-600 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Terminal component adapted for Tauri events"
```

---

### Task 13: Wire DesktopLayout with all components

**Files:**
- Modify: `src/components/DesktopLayout.tsx`

- [ ] **Step 1: Update DesktopLayout to use real components**

Replace `src/components/DesktopLayout.tsx`:

```tsx
import { useEffect, useState } from "react";
import { PipelinePanel } from "@/components/PipelinePanel";
import { ActivityLog } from "@/components/ActivityLog";
import { Terminal } from "@/components/Terminal";
import { useOrchestrator } from "@/store/orchestrator-store";
import { useActivity } from "@/store/activity-store";
import { bridge } from "@/lib/tauri-bridge";

export function DesktopLayout() {
  const { project, setProject } = useOrchestrator();
  const addActivity = useActivity((s) => s.add);
  const [toolsDetected, setToolsDetected] = useState(false);
  const [gamePreviewPath, setGamePreviewPath] = useState<string | null>(null);

  // Detect tools on mount
  useEffect(() => {
    bridge.detectTools().then((tools) => {
      setToolsDetected(true);
      if (tools.blender) {
        addActivity("system", "success", `Blender found: ${tools.blender}`);
      } else {
        addActivity("system", "error", "Blender not found — install Blender 4.x");
      }
      if (tools.godot) {
        addActivity("system", "success", `Godot found: ${tools.godot}`);
      } else {
        addActivity("system", "error", "Godot not found — install Godot 4.x");
      }
    });
  }, []);

  const handleNewProject = async () => {
    const name = prompt("Project name:");
    if (!name) return;

    try {
      const home = await import("@tauri-apps/api/path").then((m) => m.homeDir());
      const info = await bridge.createProject(home + "ProblockDesktop-Projects", name);
      setProject({ name: info.name, path: info.path, godotProjectPath: info.godot_project_path });
      addActivity("system", "success", `Created project: ${name}`);
    } catch (e) {
      addActivity("system", "error", `Failed to create project: ${e}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 p-1.5 gap-1.5">
      {/* Top bar */}
      <div className="h-10 flex items-center justify-between px-3 bg-zinc-900 rounded-lg border border-zinc-800">
        <span className="text-sm font-semibold tracking-wide">Problocks</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">
            {project ? project.name : "No project"}
          </span>
          <button
            onClick={handleNewProject}
            className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            New Project
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-1.5 min-h-0">
        {/* Left: Pipeline */}
        <div className="w-56 bg-zinc-900 rounded-lg border border-zinc-800 p-3 overflow-y-auto">
          <PipelinePanel />
        </div>

        {/* Center: Preview + Terminal */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Preview */}
          <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden">
            {gamePreviewPath ? (
              <iframe
                src={`asset://localhost/${gamePreviewPath}`}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="text-center">
                <p className="text-sm text-zinc-500">Game Preview</p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {project
                    ? "Run a game to see preview here"
                    : "Create a project to get started"}
                </p>
              </div>
            )}
          </div>

          {/* Terminal */}
          <div className="h-64 bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <Terminal />
          </div>
        </div>

        {/* Right: Activity Log */}
        <div className="w-64 bg-zinc-900 rounded-lg border border-zinc-800 p-3 overflow-y-auto">
          <ActivityLog />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the full app runs**

```bash
cd ~/ProblockDesktop && npm run tauri dev
```

Expected: Tauri window with Pipeline (left), Preview (center top), Terminal (center bottom), Activity (right). Tool detection messages appear in Activity Log.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: wire DesktopLayout with PipelinePanel, ActivityLog, Terminal, and tool detection"
```
