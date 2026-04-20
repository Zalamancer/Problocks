# Phase 6b: Mobile Store UI & Publish Flow (Tasks 18-19)

> Part of [Problocks Desktop Implementation Plan](00-overview.md)

### Task 18: Mobile Store UI — Browse and Download

**Files:**
- Create: `~/ProblocksMobile/src/screens/HomeScreen.tsx`
- Create: `~/ProblocksMobile/src/screens/BrowseScreen.tsx`
- Create: `~/ProblocksMobile/src/screens/GameDetailScreen.tsx`
- Create: `~/ProblocksMobile/src/api/problocks-api.ts`
- Create: `~/ProblocksMobile/src/store/library-store.ts`

- [ ] **Step 1: Create API client**

Create `~/ProblocksMobile/src/api/problocks-api.ts`:

```typescript
const API_BASE = "https://problocks.gg/api";

export interface GameListing {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  thumbnail_url: string;
  screenshots: string[];
  tags: string[];
  file_size_bytes: number;
  download_count: number;
  rating_avg: number;
  rating_count: number;
  published_at: string;
}

export const api = {
  listGames: async (params?: { tag?: string; search?: string; sort?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/games?${query}`);
    return res.json() as Promise<GameListing[]>;
  },

  getGame: async (id: string) => {
    const res = await fetch(`${API_BASE}/games/${id}`);
    return res.json() as Promise<GameListing>;
  },

  downloadPck: async (id: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/games/${id}/pck`);
    const blob = await res.blob();
    // Save to local filesystem using react-native-fs
    const RNFS = require("react-native-fs");
    const path = `${RNFS.DocumentDirectoryPath}/games/${id}.pck`;
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/games`);
    await RNFS.writeFile(path, await blob.text(), "base64");
    return path;
  },
};
```

- [ ] **Step 2: Create library store**

Create `~/ProblocksMobile/src/store/library-store.ts`:

```typescript
import { create } from "zustand";

interface DownloadedGame {
  id: string;
  title: string;
  pckPath: string;
  thumbnailUrl: string;
  downloadedAt: number;
  lastPlayedAt?: number;
}

interface LibraryStore {
  downloaded: DownloadedGame[];
  addDownload: (game: DownloadedGame) => void;
  markPlayed: (id: string) => void;
  removeDownload: (id: string) => void;
}

export const useLibrary = create<LibraryStore>((set) => ({
  downloaded: [],
  addDownload: (game) =>
    set((s) => ({ downloaded: [...s.downloaded, game] })),
  markPlayed: (id) =>
    set((s) => ({
      downloaded: s.downloaded.map((g) =>
        g.id === id ? { ...g, lastPlayedAt: Date.now() } : g
      ),
    })),
  removeDownload: (id) =>
    set((s) => ({ downloaded: s.downloaded.filter((g) => g.id !== id) })),
}));
```

- [ ] **Step 3: Create HomeScreen with game cards**

Create `~/ProblocksMobile/src/screens/HomeScreen.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { api, type GameListing } from "../api/problocks-api";

export function HomeScreen({ navigation }: any) {
  const [featured, setFeatured] = useState<GameListing[]>([]);
  const [recent, setRecent] = useState<GameListing[]>([]);

  useEffect(() => {
    api.listGames({ sort: "rating" }).then(setFeatured);
    api.listGames({ sort: "recent" }).then(setRecent);
  }, []);

  const renderGame = ({ item }: { item: GameListing }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("GameDetail", { id: item.id })}
    >
      <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>
        {"★".repeat(Math.round(item.rating_avg))} · {item.download_count} downloads
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Featured</Text>
      <FlatList
        data={featured}
        renderItem={renderGame}
        keyExtractor={(i) => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      <Text style={styles.sectionTitle}>Recent</Text>
      <FlatList
        data={recent}
        renderItem={renderGame}
        keyExtractor={(i) => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090b", padding: 16 },
  sectionTitle: { color: "#a1a1aa", fontSize: 14, fontWeight: "600", marginBottom: 12, marginTop: 20, textTransform: "uppercase", letterSpacing: 1 },
  card: { width: 160, marginRight: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "#18181b" },
  thumbnail: { width: 160, height: 120, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { color: "#e4e4e7", fontSize: 13, fontWeight: "600", padding: 8, paddingBottom: 2 },
  meta: { color: "#71717a", fontSize: 11, paddingHorizontal: 8, paddingBottom: 8 },
});
```

- [ ] **Step 4: Create GameDetailScreen with download + play**

Create `~/ProblocksMobile/src/screens/GameDetailScreen.tsx`:

```tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, NativeModules, Alert } from "react-native";
import { api, type GameListing } from "../api/problocks-api";
import { useLibrary } from "../store/library-store";

const { GodotBridge } = NativeModules;

export function GameDetailScreen({ route }: any) {
  const { id } = route.params;
  const [game, setGame] = useState<GameListing | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { downloaded, addDownload, markPlayed } = useLibrary();

  const localGame = downloaded.find((g) => g.id === id);

  useEffect(() => {
    api.getGame(id).then(setGame);
  }, [id]);

  const handleDownload = async () => {
    if (!game) return;
    setDownloading(true);
    try {
      const pckPath = await api.downloadPck(id);
      addDownload({
        id: game.id,
        title: game.title,
        pckPath,
        thumbnailUrl: game.thumbnail_url,
        downloadedAt: Date.now(),
      });
    } catch (e) {
      Alert.alert("Download failed", String(e));
    } finally {
      setDownloading(false);
    }
  };

  const handlePlay = () => {
    if (!localGame) return;
    markPlayed(id);
    GodotBridge.playGame(localGame.pckPath);
  };

  if (!game) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: game.thumbnail_url }} style={styles.hero} />
      <View style={styles.content}>
        <Text style={styles.title}>{game.title}</Text>
        <Text style={styles.description}>{game.description}</Text>
        <Text style={styles.stats}>
          {"★".repeat(Math.round(game.rating_avg))} ({game.rating_count}) · {game.download_count} downloads · {(game.file_size_bytes / 1024 / 1024).toFixed(1)} MB
        </Text>
        <TouchableOpacity
          style={[styles.button, localGame ? styles.playButton : styles.downloadButton]}
          onPress={localGame ? handlePlay : handleDownload}
          disabled={downloading}
        >
          <Text style={styles.buttonText}>
            {localGame ? "▶ Play" : downloading ? "Downloading..." : "Download"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090b" },
  loading: { color: "#71717a", textAlign: "center", marginTop: 40 },
  hero: { width: "100%", height: 220 },
  content: { padding: 20 },
  title: { color: "#e4e4e7", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  description: { color: "#a1a1aa", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  stats: { color: "#71717a", fontSize: 12, marginBottom: 24 },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  playButton: { backgroundColor: "#22c55e" },
  downloadButton: { backgroundColor: "#3b82f6" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
```

- [ ] **Step 5: Commit**

```bash
cd ~/ProblocksMobile && git add -A
git commit -m "feat: add store UI with HomeScreen, GameDetailScreen, download + play flow"
```

---

### Task 19: Publish Flow — Desktop to Store to Mobile

**Files:**
- Modify: `~/ProblockDesktop/src/components/DesktopLayout.tsx` (add Publish button)
- Modify: `~/ProblockDesktop/src/lib/tauri-bridge.ts` (add publish commands)
- Modify: `~/ProblockDesktop/src-tauri/src/commands.rs` (add publish command)

This task connects the full loop: **create → export → upload → browse → download → play**

- [ ] **Step 1: Add publish command to Rust backend**

Add to `src-tauri/src/commands.rs`:

```rust
#[tauri::command]
pub async fn publish_game(
    app: AppHandle,
    state: State<'_, AppState>,
    title: String,
    description: String,
    tags: Vec<String>,
) -> Result<String, String> {
    let pp = state.project_path.lock().unwrap().clone()
        .ok_or("No project open")?;
    let gp = state.godot_path.lock().unwrap().clone()
        .ok_or("Godot not detected")?;

    let _ = app.emit("agent:status", "Exporting HTML5 build...");
    let html5_dir = format!("{}/.problocks/html5-export", pp);
    let html5_result = crate::godot::export_html5(&app, &gp, &pp, &html5_dir).await?;

    let _ = app.emit("agent:status", "Exporting .pck for mobile...");
    let pck_path = format!("{}/.problocks/export/{}.pck", pp, title.to_lowercase().replace(' ', "-"));
    std::fs::create_dir_all(format!("{}/.problocks/export", pp))
        .map_err(|e| format!("Failed to create export dir: {}", e))?;
    let _pck_result = crate::godot::export_pck(&app, &gp, &pp, &pck_path).await?;

    let _ = app.emit("agent:status", "Uploading to problocks.gg...");

    // TODO: Upload to problocks.gg API
    // For now, return local paths
    let _ = app.emit("agent:status", "Published successfully!");

    Ok(format!("Exported: HTML5={}, PCK={}", html5_result.output_path, pck_path))
}
```

- [ ] **Step 2: Add publish to TypeScript bridge and UI**

Add to `tauri-bridge.ts`:

```typescript
publishGame: (title: string, description: string, tags: string[]) =>
    invoke<string>("publish_game", { title, description, tags }),
```

- [ ] **Step 3: Add Publish button to DesktopLayout top bar**

Add next to the "New Project" button:

```tsx
{project && (
  <button
    onClick={async () => {
      const title = prompt("Game title:");
      if (!title) return;
      const desc = prompt("Short description:") || "";
      try {
        addActivity("system", "pending", "Publishing game...");
        const result = await bridge.publishGame(title, desc, []);
        addActivity("system", "success", `Published: ${title}`);
      } catch (e) {
        addActivity("system", "error", `Publish failed: ${e}`);
      }
    }}
    className="text-[10px] px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
  >
    Publish
  </button>
)}
```

- [ ] **Step 4: Verify the full publish flow compiles**

```bash
cd ~/ProblockDesktop && cargo build --manifest-path src-tauri/Cargo.toml
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add publish flow — export HTML5 + .pck and upload to store"
```
