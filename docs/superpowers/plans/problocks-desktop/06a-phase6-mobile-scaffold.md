# Phase 6a: Mobile Player App — Scaffold & API (Tasks 16-17)

> Part of [Problocks Desktop Implementation Plan](00-overview.md)
>
> **Note:** Phase 6 is a separate project (`ProblocksMobile`). Execute after Phases 1-5 are stable and you have games to distribute.

### Task 16: Scaffold React Native + Embedded Godot Runtime

**Files:**
- Create: `~/ProblocksMobile/` (React Native project)
- Create: `~/ProblocksMobile/android/app/src/main/java/.../GodotPlayerActivity.java`
- Create: `~/ProblocksMobile/ios/GodotPlayer/` (Godot runtime framework)

**Architecture:** The app is a React Native shell (store UI for browsing/downloading) that launches an embedded Godot runtime to play `.pck` game files. This is the same model as Roblox — one app, many "experiences" loaded as data.

```
ProblocksMobile/
├── src/                        # React Native (Expo or bare RN)
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Featured games, categories
│   │   ├── BrowseScreen.tsx    # Search, filter, sort
│   │   ├── GameDetailScreen.tsx # Game info, screenshots, play button
│   │   └── PlayerScreen.tsx    # Launches Godot runtime with .pck
│   ├── api/
│   │   └── problocks-api.ts   # REST client for problocks.gg backend
│   ├── store/
│   │   └── library-store.ts   # Downloaded games, play history
│   └── components/
│       ├── GameCard.tsx        # Game listing card with thumbnail
│       └── DownloadButton.tsx  # Download .pck with progress bar
├── android/
│   └── godot-runtime/         # Godot Android library (AAR)
├── ios/
│   └── GodotRuntime.xcframework  # Godot iOS framework
└── package.json
```

- [ ] **Step 1: Initialize React Native project**

```bash
npx react-native init ProblocksMobile --template react-native-template-typescript
cd ~/ProblocksMobile
npm install @react-navigation/native @react-navigation/bottom-tabs zustand
```

- [ ] **Step 2: Set up Godot export templates for mobile**

The Godot engine can be compiled as a library for Android (AAR) and iOS (XCFramework). This allows embedding it inside a native app.

```bash
# Clone Godot source for library build
git clone --depth 1 --branch 4.3-stable https://github.com/godotengine/godot.git ~/godot-source

# Android library build
cd ~/godot-source
scons platform=android target=template_release arch=arm64 build_profile=custom.py

# iOS library build
scons platform=ios target=template_release arch=arm64
```

> **Note:** Pre-built Godot Android/iOS libraries are also available from the Godot download page. Use those for faster iteration, compile from source only when you need custom modules.

- [ ] **Step 3: Create native bridge for Godot player**

Android (`GodotBridge.java`):

```java
package com.problocks.mobile;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class GodotBridge extends ReactContextBaseJavaModule {
    GodotBridge(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "GodotBridge";
    }

    @ReactMethod
    public void playGame(String pckPath) {
        Intent intent = new Intent(getReactApplicationContext(), GodotPlayerActivity.class);
        intent.putExtra("pck_path", pckPath);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }
}
```

- [ ] **Step 4: Commit**

```bash
cd ~/ProblocksMobile && git init && git add -A
git commit -m "chore: scaffold React Native mobile app with Godot runtime bridge"
```

---

### Task 17: Game Store API + Backend

**Files:**
- Create: `~/ProblockDesktop/src-tauri/src/publish.rs` (export .pck from desktop)
- API routes on problocks.gg backend (or Supabase Edge Functions)

**The backend serves as the bridge between creators (desktop) and players (mobile/web):**

```
Creator (Desktop)                    Player (Mobile)
     │                                    │
     │ Upload .pck + metadata             │ Browse games
     ▼                                    ▼
┌─────────────── problocks.gg API ───────────────────┐
│                                                     │
│  POST /api/games/publish     GET /api/games         │
│    - .pck file → R2/S3      GET /api/games/:id      │
│    - screenshots             GET /api/games/:id/pck  │
│    - metadata (title,        POST /api/games/:id/    │
│      description, tags)        rate                  │
│                                                     │
│  Storage: Supabase Storage or Cloudflare R2          │
│  Database: Supabase (game listings, ratings, users)  │
└─────────────────────────────────────────────────────┘
```

- [ ] **Step 1: Add .pck export command to Problocks Desktop**

Add to `src-tauri/src/godot.rs`:

```rust
/// Export project as .pck (packed game data for mobile player)
pub async fn export_pck(
    app: &AppHandle,
    godot_path: &str,
    project_path: &str,
    output_path: &str,
) -> Result<String, String> {
    let mut cmd = Command::new(godot_path);
    cmd.arg("--headless")
        .arg("--path")
        .arg(project_path)
        .arg("--export-pack")
        .arg("Android")
        .arg(output_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let output = cmd.output().await
        .map_err(|e| format!("PCK export failed: {}", e))?;

    if output.status.success() {
        let _ = app.emit("godot:pck_exported", output_path);
        Ok(output_path.to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
```

- [ ] **Step 2: Define Supabase schema for game listings**

```sql
-- Games table
create table games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  creator_id uuid references auth.users(id),
  pck_url text not null,
  html5_url text,
  thumbnail_url text,
  screenshots text[] default '{}',
  tags text[] default '{}',
  file_size_bytes bigint,
  download_count int default 0,
  rating_avg float default 0,
  rating_count int default 0,
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ratings
create table game_ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  user_id uuid references auth.users(id),
  rating int check (rating between 1 and 5),
  review text,
  created_at timestamptz default now(),
  unique(game_id, user_id)
);
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add .pck export and game store database schema"
```
