# Testing `/studio/scratch/bricks`

Quick checklist for verifying the two-pane Scratch + Bricks integration.

## 1. Start fresh

```bash
lsof -ti :3000,3001,3002 | xargs -r kill -9
npm run dev
```

Hard reload so the rebuilt `blocksonly.js` is fetched:

- Open http://localhost:3000/studio/scratch/bricks
- **Cmd+Shift+R**

## 2. Confirm the Bricks category exists

- Left pane (Scratch), far-left column of colored category icons.
- Look for a new **Bricks** category (likely at the bottom, default
  extension color — magenta/pink).
- Click it. Expected blocks:
  - `set tool to [build ▾]`
  - `select part [brick 1×2 (#3004) ▾]`
  - `set color to [red ▾]`
  - `set rotation to [0 ▾] degrees`
  - `build at x (0) z (0) layer (0)`
  - `move character [forward ▾] by (5)`
  - `turn character [right ▾] by (45) degrees`
  - `teleport character to x (0) y (0) z (0)`

## 3. Spawn a character in the game

The right pane is the brick builder. The minifig walker is spawned when
no vehicle is being driven — click into the right pane and press WASD.
If the character moves, it's spawned and the `move/turn/teleport` blocks
will have a target.

## 4. Stack-test

Drag this stack into the Scratch workspace:

```
when ⚑ clicked
set tool to [build]
set color to [red]
select part [brick 2×4 (#3001)]
build at x 0 z 0 layer 0
build at x 0 z 0 layer 1
build at x 0 z 0 layer 2
```

Click the green flag (⚑). Expected: three red 2×4 bricks stacked at the
grid origin.

## 5. Character-test

```
when ⚑ clicked
move character [forward] by 5
```

Click ⚑. Expected: the minifig shifts +5 along z.

## 6. Bypass Scratch (sanity check)

Load with the dev flag to get a floating command toolbar:

```
http://localhost:3000/studio/scratch/bricks?dev=1
```

Bottom-right of the game pane you'll see buttons: `ping`, `tool:build`,
`part 3004`, `color red`, `rot 90`, `build @0,0`, `walk +5z`, `turn 45°`.
Clicking them posts directly to the game iframe, bypassing Scratch.

The log strip below the buttons shows the last
`{ source:'game', type:'ack'|'error', action, ... }` reply — handy when
the Scratch side is suspect.

## Troubleshooting

### Bricks category missing

1. Open DevTools → Console.
2. Right-click the blocks iframe → **This Frame → Inspect** to switch
   DevTools into the iframe context.
3. In the iframe console:
   ```js
   window.__scratchVM
   ```
   Expected: a VM object. If `undefined`, the bootstrap didn't run —
   something went wrong with the `VMBootstrap` container in
   `blocks-only.jsx`.
4. Look for red errors mentioning `bricks` or `loadExtensionIdSync`.

### Bricks category present, but game doesn't react

1. In the **outer page** DevTools console (not any iframe), run:
   ```js
   document.querySelectorAll('iframe')[1].contentWindow.postMessage(
     { source: 'scratch-blocks', action: 'ping' },
     '*'
   )
   ```
2. Then switch DevTools into the **game iframe** context (right-click
   game → This Frame → Inspect → Console). You should see a
   `{source:'game', type:'ack', action:'ping'}` object reflected back
   if the listener is wired.
3. If no ack: the game-side `scratchBridge()` IIFE didn't install. Check
   the bottom of `/Users/ihsanduru/lego_game/index.html` for the
   `// ================= Scratch blocks bridge =================` block.

### Blocks flood / placements dropping

Scratch fires commands as fast as the VM can run them. If many `build`
blocks in a tight loop drop placements, add a
`wait 0.05 seconds` (Scratch **Control** category) between them, or
ping me to add native throttling in the extension.

## Rebuild after editing the extension

If you tweak `scratch-patches/scratch3_bricks/index.js`:

```bash
cp scratch-patches/scratch3_bricks/index.js \
   ~/scratch-gui/node_modules/scratch-vm/src/extensions/scratch3_bricks/index.js
cd ~/scratch-gui && NODE_OPTIONS="--openssl-legacy-provider" npm run build
rm -rf ~/Problocks/public/scratch
cp -R ~/scratch-gui/build ~/Problocks/public/scratch
```

Then hard-reload the page.
