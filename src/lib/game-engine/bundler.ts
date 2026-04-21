/**
 * Playdemy Game Bundler
 * Takes framework source + game module files → single HTML string for iframe.
 *
 * This runs at build/preview time in the Next.js app, NOT in the browser game.
 */

import { FRAMEWORK_SOURCE } from './framework-source';

export interface GameFiles {
  'config.js': string;
  [key: string]: string; // player.js, enemies.js, world.js, etc.
}

/**
 * Serializable subset of quality settings that the framework's
 * setup3dRenderer reads off `config.quality`. Only the fields that
 * actually influence the generated game are listed.
 */
export interface BundleQuality {
  shadows?: boolean;
  shadowType?: 'pcf-soft' | 'basic' | 'off';
  shadowMapSize?: number;
  antialias?: boolean;
  maxPixelRatio?: number;
}

export interface BundleOptions {
  /** Quality tier settings to inject as `config.quality`. When omitted the
   *  generated HTML uses framework defaults (high tier). */
  quality?: BundleQuality;
}

/**
 * Bundle framework + game files into a single runnable HTML string.
 */
export function bundleGame(files: GameFiles, options: BundleOptions = {}): string {
  const framework = FRAMEWORK_SOURCE;

  // Collect all game script files (excluding config)
  const configSrc = files['config.js'] || 'const CONFIG = {};';
  const entityFiles = Object.entries(files)
    .filter(([name]) => name !== 'config.js' && name.endsWith('.js'))
    .map(([name, src]) => ({ name, src }));

  // Detect CDN libs from config
  const cdnScripts: string[] = [];
  if (configSrc.includes("'3d'") || configSrc.includes('"3d"')) {
    cdnScripts.push('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
    cdnScripts.push('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Playdemy Game</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
canvas { display: block; width: 100%; height: 100%; }
</style>
${cdnScripts.map(url => `<script src="${url}"></script>`).join('\n')}
</head>
<body>
<canvas id="game"></canvas>
<script>
'use strict';

// ═══════════════════════════════════════════
// Playdemy Runtime Framework
// ═══════════════════════════════════════════
${framework}

// ═══════════════════════════════════════════
// Game Config
// ═══════════════════════════════════════════
${configSrc}

// ═══════════════════════════════════════════
// Game Modules
// ═══════════════════════════════════════════
${entityFiles.map(f => `// ── ${f.name} ──\n${f.src}`).join('\n\n')}

// ═══════════════════════════════════════════
// Bootstrap — auto-discovers all game globals
// ═══════════════════════════════════════════
(function() {
  try {
    const canvas = document.getElementById('game');
    const config = typeof CONFIG !== 'undefined' ? CONFIG : {};
    // Quality tier injected by the host studio. Framework reads these in
    // setup3dRenderer — see renderer3d.js / framework-source.ts.
    if (!config.quality) config.quality = ${JSON.stringify(options.quality || {})};
    const game = createEngine(canvas, config);

    // Register all entity definitions (objects with a 'type' property)
    function registerDef(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach(d => registerDef(d));
      } else if (typeof obj.type === 'string') {
        try { game.entities.register(obj); } catch(e) { console.warn('Entity register:', e.message); }
      }
    }

    // Direct references — no eval needed
    ${entityFiles.map(f => {
      const name = getConstName(f.name);
      return `if (typeof ${name} !== 'undefined') registerDef(${name});`;
    }).join('\n    ')}

    // Register scenes
    if (typeof SCENES !== 'undefined' && SCENES) {
      for (const [name, hooks] of Object.entries(SCENES)) {
        game.scenes.register(name, hooks);
      }
    }

    // Register audio
    if (typeof SOUNDS !== 'undefined' && SOUNDS) {
      for (const [name, def] of Object.entries(SOUNDS)) {
        if (def.notes) game.audio.registerMultiSynth(name, def.notes);
        else if (def.url) game.audio.registerFile(name, def.url);
        else game.audio.registerSynth(name, def);
      }
    }

    // Register collision pairs
    if (typeof COLLISIONS !== 'undefined' && COLLISIONS) {
      for (const pair of COLLISIONS) {
        if (Array.isArray(pair) && pair.length >= 2) {
          game.physics.addCollisionPair(pair[0], pair[1]);
        }
      }
    }

    // Custom setup function
    if (typeof SETUP !== 'undefined' && typeof SETUP === 'function') {
      SETUP(game);
    }

    // Start the game
    game.start(config.startScene || 'title');
    console.log('[Playdemy] Game started with', game.entities.types().length, 'entity types');
  } catch(err) {
    console.error('[Playdemy] Bootstrap failed:', err);
    // Show error on canvas
    const c = document.getElementById('game');
    const ctx = c.getContext('2d');
    c.width = c.clientWidth; c.height = c.clientHeight;
    ctx.fillStyle = '#111'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#e74c3c'; ctx.font = '16px monospace';
    ctx.fillText('Game Error: ' + err.message, 20, 40);
    ctx.fillStyle = '#888'; ctx.font = '12px monospace';
    ctx.fillText('Check browser console for details', 20, 65);
  }
})();
</script>
</body>
</html>`;
}

/** Convert a filename like "player.js" → "PLAYER" (the expected const name) */
function getConstName(filename: string): string {
  return filename
    .replace('.js', '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase();
}

/**
 * Check if a game uses the new multi-file format
 */
export function isMultiFileGame(game: { html?: string; files?: Record<string, string> }): boolean {
  return !!game.files && Object.keys(game.files).length > 0;
}

/**
 * Get the HTML for a game — handles both legacy single-file and new multi-file.
 * When `options.quality` is passed it's injected into the generated bundle so
 * iframes can honor the studio's quality tier on low-end hardware. Legacy
 * single-file games (raw html) are returned untouched since we can't safely
 * rewrite unknown markup.
 */
export function getGameHtml(
  game: { html?: string; files?: Record<string, string> },
  options: BundleOptions = {},
): string {
  if (game.files && Object.keys(game.files).length > 0) {
    return bundleGame(game.files as GameFiles, options);
  }
  return game.html || '';
}
