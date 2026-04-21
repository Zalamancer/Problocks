# Scratch patches

Problocks customizations to the upstream `scratch-gui` / `scratch-vm` source.
The built output lives in `public/scratch/` and is consumed by the two-pane
shell at `/studio/scratch/bricks`.

`scratch-gui` is checked out at `/Users/ihsanduru/scratch-gui/` on the dev
machine (not in this repo — it's large and distributed under AGPL-3.0).

## What's here

- `scratch3_bricks/index.js` — canonical source for the custom "Bricks"
  Scratch extension. Blocks emit `window.parent.postMessage(
  {source:'scratch-blocks', action, ...})` to the embedding shell.

## How it's wired upstream

Three edit points in the `scratch-gui` checkout:

1. **Extension source** — copied to
   `scratch-gui/node_modules/scratch-vm/src/extensions/scratch3_bricks/index.js`

2. **Registration** — in
   `scratch-gui/node_modules/scratch-vm/src/extension-support/extension-manager.js`,
   inside the `builtinExtensions` map, add:
   ```js
   bricks: () => require('../extensions/scratch3_bricks')
   ```

3. **Auto-load** — in `scratch-gui/src/playground/blocks-only.jsx`, add a
   `VMBootstrap` container (connected to `state.scratchGui.vm`) that calls
   `vm.extensionManager.loadExtensionIdSync('bricks')` on mount and exposes
   the VM at `window.__scratchVM`.

## Re-applying after `npm install` in scratch-gui

`npm install` will wipe edits 1 and 2 (they live in `node_modules`). Edit 3
is in the checkout's `src/` and survives.

```bash
# from the Problocks repo root:
cp scratch-patches/scratch3_bricks/index.js \
   ~/scratch-gui/node_modules/scratch-vm/src/extensions/scratch3_bricks/index.js

# then manually re-add the one line to extension-manager.js (see above)
```

If this becomes painful, fork `scratch-vm`, add `scratch3_bricks` + the
registration line there, and `npm install ../scratch-vm` from the
`scratch-gui` checkout. At that point the patch lives in a repo you own and
survives reinstalls.

## Building

```bash
cd ~/scratch-gui
npm run build
```

Then copy the build output to `Problocks/public/scratch/`:

```bash
cp -R ~/scratch-gui/build/* ~/Problocks/public/scratch/
```

The two-pane shell at `/studio/scratch/bricks` will pick it up on next
iframe load.
