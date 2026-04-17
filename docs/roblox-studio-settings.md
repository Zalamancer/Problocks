# Roblox Studio Settings — reference

Purpose: reference doc for mirroring Roblox Studio's settings surface in Problocks. All field names below are taken verbatim from the official Roblox Creator docs (primarily the `Studio` class property list, the `PhysicsSettings` class, and the Experience Settings page). Source URLs at the bottom.

Two top-level dialogs exist in Roblox Studio:

1. **Studio Settings** — application-wide preferences (File → Studio Settings, `Alt+S` / `⌥+S`). Backed by the `Studio` class, plus several sibling settings classes (`PhysicsSettings`, `RenderSettings`, `NetworkSettings`, `DebugSettings`, `TaskScheduler`, `LuaSettings`).
2. **Game Settings / Experience Settings** — per-place/per-experience config (File → Game Settings, sometimes labeled "Experience Settings" in newer Studio builds). Backed by the Creator Dashboard experience config.

Roblox also ships a **Customize Shortcuts** dialog (File → Customize Shortcuts) and a theme system (Light / Dark / custom script-editor color preset).

---

## Studio Settings dialog

The Studio Settings dialog is organized into a left-hand category list. The categories below come from the groupings exposed on the `Studio` class reference page and from the sibling settings classes that Roblox Studio surfaces alongside it.

### Studio

General studio preferences.

- **Always Save Script Changes** — toggle — Automatically save script changes when the place is saved.
- **Basic Objects Display Mode** — dropdown (`ListDisplayMode`) — How the "Basic Objects" insert list is shown.
- **DeprecatedObjectsShown** — toggle — Include deprecated classes in Explorer/insert menus.
- **DisplayLanguage** — dropdown (string) — Studio UI language.
- **PermissionLevelShown** — dropdown (`PermissionLevelShown`) — Which API permission tier to display.
- **Script Editor Color Preset** — dropdown (`StudioScriptEditorColorPresets`) — Pre-made color theme for the script editor.
- **Theme** — dropdown (Instance → `Light` / `Dark`) — Overall Studio UI theme.
- **UI Theme** — dropdown (`UITheme`, deprecated) — Legacy alias for Theme.
- **Respect Studio shortcuts when game has focus** — toggle — Let Studio shortcuts fire while a running play session has keyboard focus.

### Auto-Recovery

- **Auto-Recovery Enabled** — toggle — Turn automatic backup on/off.
- **Auto-Recovery Interval (Minutes)** — number (int) — How often auto-recovery writes a snapshot.
- (Auto-recovery folder path) — directory picker — Where backup files are written.

### Camera

Viewport navigation feel.

- **Camera Speed** — number (float) — Base WASD camera speed.
- **Camera Shift Speed** — number (float) — Speed multiplier while holding Shift.
- **Camera Pan Speed** — number (float) — Middle-mouse/RMB pan speed.
- **Camera Mouse Wheel Speed** — number (float) — Zoom speed per wheel tick.
- **Camera Zoom to Mouse Position** — toggle — Zoom toward the cursor instead of viewport center.
- **Camera Speed Adjust Binding** — dropdown (`CameraSpeedAdjustBinding`) — Which modifier adjusts camera speed.
- **CameraAdaptiveSpeed** — toggle — Scale camera speed with distance to focus.
- **CameraNavigationModel** — dropdown (`CameraNavigationModel`) — Classic vs. modern navigation model.
- **CameraOrbitSensitivity** — number (float) — Orbit rotation sensitivity.
- **CameraPanSensitivity** — number (float) — Pan sensitivity.
- **CameraShiftFactor** — number (float) — Shift speed multiplier.
- **CameraTweenFocus** — toggle — Smoothly tween focus changes.
- **CameraZoomSpeed** — number (float) — Zoom speed (non-wheel).

### Script Editor

Editor behavior.

- **Auto Clean Empty Line** — toggle — Strip trailing whitespace/empty lines on save.
- **Auto Closing Brackets** — toggle — Insert matching `)` `]` `}`.
- **Auto Closing Quotes** — toggle — Insert matching `"` `'`.
- **Auto Delete Closing Brackets and Quotes** — toggle — Delete paired closers when deleting an opener.
- **Auto Indent Rule** — dropdown (`AutoIndentRule`) — How auto-indent behaves.
- **AutocompleteAcceptanceBehavior** — dropdown (`CompletionAcceptanceBehavior`) — Tab/Enter acceptance rules.
- **Automatically trigger AI Code Completion** — toggle — Inline AI completions.
- **CommandBarEnterExec** — toggle — Enter runs the Command Bar.
- **CommandBarFont** — font picker — Command Bar typeface/size.
- **Enable Autocomplete** — toggle — Turn autocomplete on.
- **Enable Autocomplete Doc View** — toggle — Show docs panel next to completions.
- **Enable Script Analysis** — toggle — Live Luau analysis (squiggles).
- **Enable Scrollbar Markers** — toggle — Mark errors/matches in the scrollbar.
- **Enable Signature Help** — toggle — Parameter hints while typing calls.
- **Enable Signature Help Doc View** — toggle — Show doc panel with signature help.
- **Enable Temporary Tabs** — toggle — Single-click previews open as temporary tabs.
- **Enable Temporary Tabs In Explorer** — toggle — Same for Explorer previews.
- **Enable Type Hover** — toggle — Show inferred types on hover.
- **EnableCodeAssist** — toggle — Master switch for AI code assist.
- **EnableIndentationRulers** — toggle — Show vertical indent guides.
- **EnableSelectionTooltips** — toggle — Tooltip when selecting text.
- **Font** — font picker — Editor typeface/size.
- **Format On Paste** — toggle — Auto-format pasted blocks.
- **Format On Type** — toggle — Auto-format while typing.
- **Highlight Current Line** — toggle — Draw highlight on caret line.
- **Highlight Occurances** — toggle — Highlight other occurrences of selected word.
- **Indent Using Spaces** — toggle — Spaces vs. tabs.
- **LargeFileLineCountThreshold** — number (int) — Line count above which "large file" optimizations kick in.
- **LargeFileThreshold** — number (int) — Byte-size equivalent.
- **Rulers** — text — Comma-separated ruler column positions.
- **Scroll Past Last Line** — toggle — Allow scrolling past EOF.
- **Show Whitespace** — toggle — Render whitespace glyphs.
- **Skip Closing Brackets and Quotes** — toggle — Skip over auto-inserted closers when typing them.
- **Tab Width** — number (int) — Tab size in columns.
- **Text Wrapping** — toggle — Soft-wrap long lines.

### Script Editor Colors (Theme)

All are color pickers (`Color3`). Full list from the `Studio` class:

`"function" Color`, `"local" Color`, `"nil" Color`, `"self" Color`, `"TODO" Color`, `Background Color`, `Bool Color`, `Bracket Color`, `Built-in Function Color`, `Comment Color`, `Current Line Highlight Color`, `Debugger Current Line Color`, `Debugger Error Line Color`, `Error Color`, `Find Selection Background Color`, `Function Name Color`, `HintColor`, `IndentationRulerColor`, `InformationColor`, `Keyword Color`, `Luau Keyword Color`, `Matching Word Background Color`, `Menu Item Background Color`, `Selected Menu Item Background Color`, `Method Color`, `Number Color`, `Operator Color`, `Primary Text Color`, `Secondary Text Color`, `Property Color`, `Ruler Color`, `Script Editor Scrollbar Background Color`, `Script Editor Scrollbar Handle Color`, `Selected Text Color`, `Selection Background Color`, `Selection Color`, `String Color`, `Text Color`, `Warning Color`, `Whitespace Color`.

### Tools & Selection

Viewport selection visuals.

- **Active Color** — color — Active gizmo/handle color.
- **Active Hover Over Color** — color — Hover color for the active tool.
- **Animate Hover Over** — toggle — Animate the hover outline.
- **Hover Animate Speed** — dropdown (`HoverAnimateSpeed`) — Off / Slow / Medium / Fast.
- **Hover Box Thickness** — number (float) — Hover outline thickness.
- **Hover Line Thickness** — number (int) — Legacy hover thickness.
- **Hover Over Color** — color — Default hover color.
- **Line Thickness** — number (float) — Selection outline line thickness.
- **Physical Draggers Select Scope By Default** — toggle — Click-picks use scope (Model) by default.
- **Pivot Snap To Geometry Color** — color — Pivot snap highlight color.
- **Select Color** — color — Selection outline color.
- **Select/Hover Color** — color — Mixed state outline color.
- **Selection Box Thickness** — number (float) — Selection outline thickness.
- **Selection Line Thickness** — number (int) — Legacy thickness.
- **Show Hover Over** — toggle — Draw hover outline at all.
- **Use Bounding Box Move Handles** — toggle — Use bounding-box handles for Move tool.

### Dragger (Move/Rotate/Scale)

- **DraggerActiveColor** — color
- **DraggerLengthFactor** — number (float) — Arrow length scale.
- **DraggerMajorGridIncrement** — number (int) — Major grid tick spacing.
- **DraggerMaxSoftSnaps** — number (int) — Max soft-snap targets.
- **DraggerPassiveColor** — color
- **DraggerScaleFactor** — number (float) — Handle scale multiplier.
- **DraggerShowAxisTicks** — toggle
- **DraggerShowHoverRuler** — toggle
- **DraggerShowMeasurement** — toggle — Draw size readouts while dragging.
- **DraggerShowNegativeAxes** — toggle
- **DraggerShowPlanes** — toggle — Draw plane handles (two-axis drag).
- **DraggerShowTargetSnap** — toggle
- **DraggerShowTrackball** — toggle — Show free-rotate trackball ring.
- **DraggerShowWhileDragging** — toggle — Keep handles visible mid-drag.
- **DraggerSoftSnapMarginFactor** — number (float)
- **DraggerSummonMarginFactor** — number (float)
- **DraggerTiltRotateDuration** — number (float)

### Output

- **Clear Output On Start** — toggle — Clear the Output panel on each play/run.
- **Maximum Output Lines** — number (int) — Scrollback cap.
- **Output Font** — font picker — Output typeface/size.
- **Output Layout Mode** — dropdown (`OutputLayoutMode`) — Combined / separate panes.

### Lua / Luau (Debugger)

- **CommandBarLocalState** — toggle — Command Bar runs in local state by default.
- **LuaDebuggerEnabled** — toggle — Enable the Luau debugger.
- **LuaDebuggerEnabledAtStartup** — read-only toggle — Whether debugger was on at startup.
- **PluginDebuggingEnabled** — toggle — Debug plugins in-process.
- **ScriptTimeoutLength** — number (int, seconds) — Scripts longer than this abort.

### Explorer

- **Show Core GUI in Explorer while Playing** — toggle
- **Show FileSyncService** — toggle
- **Show Hidden Objects in Explorer** — toggle
- **Show Plugin GUI Service in Explorer** — toggle
- **Show plus button on hover in Explorer** — toggle
- **ShowCorePackagesInExplorer** — toggle

### Visualization

- **Show Light Guides** — toggle — Wireframes for lights.
- **Show Navigation Labels** — toggle
- **Show Navigation Mesh** — toggle
- **Show Pathfinding Links** — toggle
- **Show Singly Selected Attachment Parent Frame** — toggle

### Audio

- **Main Volume** — number (float) — Studio playback volume.
- **Only Play Audio from Window in Focus** — toggle

### Directories & Sync (External Editor / Rojo)

- **ActionOnAutoResumeSync** — dropdown (`ActionOnAutoResumeSync`)
- **ActionOnStopSync** — dropdown (`ActionOnStopSync`)
- **AutoResumeSyncOnPlaceOpen** — toggle
- **DefaultInstancesDir** — directory picker
- **DefaultScriptSyncFileType** — dropdown (`DefaultScriptSyncFileType`)
- **ExternalEditorSelection** — directory picker / app picker
- **IconOverrideDir** — directory picker
- **LocalAssetsFolder** — directory picker
- **PluginsDir** — directory picker
- **ReloadBuiltinPluginsOnChange** — toggle
- **ReloadLocalPluginsOnChange** — toggle
- **UseDefaultExternalEditor** — toggle

### Updates

- **AutoUpdateEnabled** — toggle — Auto-update Studio.

### Data / Find & Replace

- **EnableFindOnType** — toggle — Incremental search as you type.
- **LoadAllBuiltinPluginsInRunModes** — toggle
- **LoadInternalPlugins** — toggle
- **LoadUserPluginsInRunModes** — toggle
- **MaxFindReplaceAllResults** — number (int) — Cap on Find-All results.

### Undo

- **RuntimeUndoBehavior** — dropdown (`RuntimeUndoBehavior`) — Whether runtime edits go into undo stack.

### Streaming

- **EnableStudioStreaming** — toggle — Simulate streaming in Studio preview.

### Advanced

- **Enable CoreScript Debugger** — toggle
- **Enable Http Sandboxing** — toggle
- **Enable Internal Beta Features** — toggle
- **Enable Internal Features** — toggle
- **Set Pivot of Imported Parts** — toggle

### Diagnostics / Physics (PhysicsSettings)

Backed by `PhysicsSettings`. Mostly visualization toggles.

- **AllowSleep** — toggle — Rest bodies with no motion.
- **AreAnchorsShown** — toggle
- **AreAssembliesShown** — toggle
- **AreAssemblyCentersOfMassShown** — toggle
- **AreAwakePartsHighlighted** — toggle
- **AreBodyTypesShown** — toggle
- **AreCollisionCostsShown** — toggle
- **AreConstraintForcesShownForSelectedOrHoveredInstances** — toggle
- **AreConstraintTorquesShownForSelectedOrHoveredInstances** — toggle
- **AreContactForcesShownForSelectedOrHoveredAssemblies** — toggle
- **AreContactIslandsShown** — toggle
- **AreContactPointsShown** — toggle
- **AreGravityForcesShownForSelectedOrHoveredAssemblies** — toggle
- **AreJointCoordinatesShown** — toggle
- **AreMagnitudesShownForDrawnForcesAndTorques** — toggle
- **AreMechanismsShown** — toggle
- **AreModelCoordsShown** — toggle (legacy)
- **AreNonAnchorsShown** — toggle
- **AreOwnersShown** — toggle — Show network ownership.
- **ArePartCoordsShown** — toggle (legacy)
- **AreRegionsShown** — toggle — Draw simulation-radius cylinders.
- **AreSolverIslandsShown** — toggle
- **AreTerrainReplicationRegionsShown** — toggle
- **AreTimestepsShown** — toggle
- **AreUnalignedPartsShown** — toggle
- **AreWorldCoordsShown** — toggle (legacy)
- **DisableCSGv2** — toggle
- **DisableCSGv3ForPlugins** — toggle
- **DrawConstraintsNetForce** — toggle
- **DrawContactsNetForce** — toggle
- **DrawTotalNetForce** — toggle
- **EnableForceVisualizationSmoothing** — toggle
- **FluidForceDrawScale** — number (float)
- **ForceDrawScale** — number (float)
- **ForceVisualizationSmoothingSteps** — number (int)
- **IsInterpolationThrottleShown** — toggle
- **IsTreeShown** — toggle
- **PhysicsEnvironmentalThrottle** — dropdown (`EnviromentalPhysicsThrottle`)
- **ShowDecompositionGeometry** — toggle
- **ShowFluidForcesForSelectedOrHoveredMechanisms** — toggle
- **ShowInstanceNamesForDrawnForcesAndTorques** — toggle
- **SolverConvergenceMetricType** — dropdown (`SolverConvergenceMetricType`)
- **SolverConvergenceVisualizationMode** — dropdown (`SolverConvergenceVisualizationMode`)
- **ThrottleAdjustTime** — number (double)
- **TorqueDrawScale** — number (float)
- **UseCSGv2** — toggle
- **Show Diagnostics Bar** — toggle — Bottom-of-viewport perf HUD (from the `Studio` class Advanced group).

### Rendering

(Not exposed verbatim on the `Studio` class reference; the Studio Settings dialog exposes the `RenderSettings` sibling class. Specific fields are not fully documented publicly, but the category is referenced in Studio UI.) (not found in docs)

### Network

(Exposed via `NetworkSettings` — not individually enumerated on the public docs page.) (not found in docs)

### Tasks

(Exposed via `TaskScheduler` — scheduler diagnostics. Not individually enumerated on public docs.) (not found in docs)

### AI

Roblox Studio has a growing "AI" surface (Assistant, Code Assist). Related toggles are mixed into Script Editor: `EnableCodeAssist`, `Automatically trigger AI Code Completion`. A dedicated AI tab in Studio Settings is not documented as a distinct category on the public docs. (not found in docs)

### Menu Items

Not a Studio Settings category on the public docs. The closest surface is File → Customize Shortcuts. (not found in docs)

### Security

(Some security toggles live under Studio → Advanced in the Studio Settings dialog and some under Experience Settings → Security. No separate Studio-Settings "Security" category is documented publicly as of this writing.) (not found in docs)

---

## Game Settings dialog (per-place / per-experience)

File → Game Settings. Recent Studio builds label this **Experience Settings**. Tabs and fields below are verbatim from the Experience Settings docs page.

### Basic Info

- **Name** — text — Experience title.
- **Description** — long text — What a player should expect.
- **Content Maturity Label** — dropdown — Content-maturity rating.
- **Game Icon** — file upload (image) — Main icon.
- **Screenshots & Videos** — file uploads — Promotional thumbnails and videos.
- **Playable Devices** — multi-toggle — Computer / Phone / Tablet / Console / VR.

### Communication

- **Enable Microphone** — toggle — Voice chat for eligible users.
- **Enable Camera** — toggle — Camera-driven avatar animation.

### Permissions

- **Playability** — dropdown — Public / Friends / Private.

### Monetization

- **Badges** — management UI — Create/manage badges.
- **Paid Access** — toggle + number — Charge Robux/local currency to enter.
- **Private Servers** — toggle + number — Enable and price private servers.
- **Developer Products** — management UI — In-experience purchases.

### Security

- **Allow HTTP Requests** — toggle — HttpService outbound requests.
- **Secrets** — management UI — Studio-local secrets for HttpService.
- **Enable Studio Access to API Services** — toggle — Data stores / MessagingService in Studio.
- **Allow Third Party Sales** — toggle — Off-experience Marketplace purchases.
- **Allow Third Party Teleports** — toggle — Teleports to other creators' experiences.
- **Allow Mesh / Image APIs** — toggle — `EditableMesh` / `EditableImage` in published experiences.

### Avatar

Avatar Settings (separate panel, sometimes reached via Game Settings → Avatar). Fields from the Avatar Settings docs:

- **Preset** — dropdown — Player Choice / Consistent Gameplay / Custom.
- **Preview** — toggle — Spawn a preview lineup in Workspace.
- **Avatar Type** — dropdown — R6 / R15 / R15 & R6.
- **General** tab — preset pickers (Player Choice, Consistent Gameplay).
- **Body** tab — Scale / Appearance / Build dropdowns with "Custom" overrides (min/max studs, asset IDs, proportion sliders).
- **Clothing** tab — Clothing Scale (dropdown), Limit Bounds (percentage), Custom Clothing (dropdown + asset IDs).
- **Accessories** tab — Accessory Scale (dropdown), Limit Method (Scale / Remove), Limit Bounds (percentage), Custom Accessories (per-category dropdowns), Accessory Behaviors (VFX/Sound toggles).
- **Movement** tab — Collision (Default / Single Collider / Legacy), Collision Size (length/width/depth numbers), Hit & Touch Detection (dropdown), Animation Packs (Player Choice / Standard R15 / Standard R6), Animation Clips (Player Choice / Custom Clips with IDs), Abilities (Legacy Humanoid / Character Controller Library).

### Places

- **Create** — button — Add a new place to the experience.
- **⋯ Menu** per place — Configure Place / Version History.

### Localization

- **Source Language** — dropdown.
- **Automatic Text Capture** — toggle.
- **Use Translated Content** — toggle.
- **Automatic Translation** — multi-select — Languages to auto-translate into.

### World

- **Presets** — dropdown — Classic / Realistic / Action.
- **Gravity** — number — studs/s².
- **Jump** — number — jump height or power.
- **Walk** — number — walk speed (studs/s).
- **Slope** — number — max climbable angle (degrees).

### Other

- **Enable Drafts Mode** — toggle — Asynchronous collaborative script editing.
- **Shutdown All Servers** — destructive button — Terminate running servers.

---

## Keyboard Shortcuts categories

The dedicated `studio/shortcuts` page 404'd in our fetch; the **Customize Shortcuts** dialog in Studio groups actions by the ribbon tabs/menus they appear in. Based on the Studio UI overview, the practical categories are:

- **File** — New, Open, Save, Save As, Publish, Publish As, Exit, Studio Settings (`Alt+S` / `⌥+S`).
- **Edit** — Undo, Redo, Cut, Copy, Paste, Paste Into, Duplicate, Delete, Find, Find/Replace in All Scripts.
- **View** — Toggle Explorer, Properties, Output, Command Bar, Toolbox, Terrain Editor, Test, full-screen, zoom in/out.
- **Play / Test** — Play, Play Here, Run, Stop, Pause, Resume, Start Server (client+server), Start Player.
- **Model** — Move (`Ctrl+1`), Scale (`Ctrl+2`), Rotate (`Ctrl+3`), Transform, Group, Ungroup, Anchor, Lock, Collision Groups, Pivot Edit, Join/Unjoin, Constraint creation.
- **Avatar** — Rig Builder, Animation Editor shortcuts.
- **Terrain** — Brush sizes, Add, Subtract, Paint, Flatten, Grow, Erode, Smooth, Sea Level.
- **Test** — Emulator, Device, Team Test, Accelerometer toggle.
- **Plugins** — Plugin Manager, plugin actions (plugin-defined, bindable here).
- **Script Editor** — Save Script, Comment/Uncomment, Go To Line, Go To Symbol, Peek Definition, Rename Symbol, Format Script, Toggle Breakpoint, Step Over/Into/Out, Continue, Search Script.
- **Navigation / Camera** — WASD + QE, Focus on Selection (`F`), Zoom to Fit, Frame Selection.
- **Window / Layout** — Reset Layout, Save Layout, Toggle Widget Docking.
- **Menu Items** — entries that live in menus without ribbon equivalents (Customize Shortcuts lets you bind otherwise-unbound actions here).

(Exact per-action default keybindings list: not found as a single page — Roblox distributes these across the ribbon tour, `studio/ui-overview`, and in-product Customize Shortcuts dialog.)

---

## Theme / appearance

Studio ships two global UI themes plus a separate script-editor color theme.

- **Theme** — dropdown — `Light` / `Dark`. Controls window chrome, panel backgrounds, and default Script Editor palette.
- **UI Theme** — dropdown (`UITheme` enum, deprecated) — Legacy alias. Still present for backward compatibility.
- **Script Editor Color Preset** — dropdown (`StudioScriptEditorColorPresets`) — Pre-made color schemes for the editor (e.g. Default, Default Dark, Extra Dark, Earth Tones, High Contrast, Resynth, Sublime).
- **Font** — font picker — Script Editor typeface + size.
- **CommandBarFont** — font picker — Command Bar typeface + size.
- **Output Font** — font picker — Output panel typeface + size.
- **Tab Width** — number (int) — Editor indent width.
- **Text Wrapping** — toggle — Soft-wrap.
- **Show Whitespace** — toggle — Render space/tab/newline glyphs.
- **EnableIndentationRulers** — toggle — Vertical indent guides.
- **Highlight Current Line** — toggle.
- **Scroll Past Last Line** — toggle.

Per-token syntax colors (color pickers): see the **Script Editor Colors** list above — ~40 individually tunable `Color3` properties covering keywords, literals, comments, operators, brackets, selection, matching, current-line, debugger-current-line, error, warning, hint, information, rulers, scrollbars, menu item background, and text colors.

---

## Sources

- Studio class (authoritative property list for Studio Settings fields): https://create.roblox.com/docs/reference/engine/classes/Studio
- PhysicsSettings class (Studio Settings → Physics / Diagnostics): https://create.roblox.com/docs/reference/engine/classes/PhysicsSettings
- Experience Settings (the Game Settings dialog): https://create.roblox.com/docs/studio/experience-settings
- Game Settings page (redirects to Experience Settings): https://create.roblox.com/docs/studio/game-settings
- Avatar Settings: https://create.roblox.com/docs/studio/avatar-settings
- Studio setup (File menu entries, Studio Settings shortcut, Beta Features): https://create.roblox.com/docs/studio/setup
- Studio UI overview (toolbar, layout, shortcuts context): https://create.roblox.com/docs/studio/ui-overview
- Studio landing: https://create.roblox.com/docs/studio
- `Respect Studio shortcuts when game has focus`: https://create.roblox.com/docs/reference/engine/classes/Studio/Respect-Studio-shortcuts-when-game-has-focus
- Studio shortcuts page (404 at fetch time 2026-04-16): https://create.roblox.com/docs/studio/shortcuts
