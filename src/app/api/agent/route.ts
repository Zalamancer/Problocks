/**
 * Game generation agent — two-pass architecture:
 *   Pass 1: Claude CLI plans sprites + sounds needed (JSON)
 *   Assets: PixelLab → pixel art sprites, Freesound → sound effects
 *   Pass 2: Claude CLI builds the game HTML using real assets
 *
 * No ANTHROPIC_API_KEY needed — uses the user's Claude CLI subscription.
 */
import { spawn } from 'child_process';
import { homedir } from 'os';
import { generateSprite, isAvailable as pixelLabAvailable } from '@/lib/pixellab';
import { findSound, isAvailable as freesoundAvailable } from '@/lib/freesound';
import { spendCreditsFor } from '@/lib/credits';

// --- Claude CLI helpers ---

function cliEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HOME: process.env.HOME || homedir(),
    PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    USER: process.env.USER || '',
    SHELL: process.env.SHELL || '/bin/zsh',
    TERM: 'xterm-256color',
  };
}

/** Call Claude CLI and return the full text response. */
function callClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let text = '';
    const child = spawn(
      'claude',
      ['-p', prompt, '--output-format', 'stream-json', '--dangerously-skip-permissions'],
      { env: cliEnv() },
    );

    child.stdout.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        try {
          const p = JSON.parse(line);
          if (p.type === 'assistant' && p.message?.content) {
            for (const b of p.message.content) {
              if (b.type === 'text') text += b.text;
            }
          }
          if (p.type === 'result' && p.result && !text) {
            text = p.result;
          }
        } catch { /* skip */ }
      }
    });

    child.on('close', () => resolve(text));
    child.on('error', reject);
  });
}

/** Call Claude CLI and stream text chunks via callback. */
function streamClaude(
  prompt: string,
  onText: (text: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let sent = false;
    const child = spawn(
      'claude',
      ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions'],
      { env: cliEnv() },
    );

    child.stdout.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        try {
          const p = JSON.parse(line);
          if (p.type === 'system' || p.type === 'rate_limit_event') continue;
          if (p.type === 'assistant' && p.message?.content) {
            for (const b of p.message.content) {
              if (b.type === 'text' && b.text) {
                onText(b.text);
                sent = true;
              }
            }
          }
          if (p.type === 'result' && p.result && !sent) {
            onText(p.result);
          }
        } catch { /* skip */ }
      }
    });

    child.on('close', () => resolve());
    child.on('error', reject);
  });
}

// --- Asset planning ---

interface SpritePlan {
  name: string;
  description: string;
  width: number;
  height: number;
}

interface SoundPlan {
  name: string;
  description: string;
}

interface GamePlan {
  sprites: SpritePlan[];
  sounds: SoundPlan[];
}

const PLAN_PROMPT = (userMsg: string) => `You are planning assets for an HTML5 game.

Game request: "${userMsg}"

List all visual sprites AND sound effects the game needs. Output ONLY valid JSON, no other text:
{"sprites":[{"name":"player","description":"pixel art blue spaceship facing up, dark background","width":32,"height":32}],"sounds":[{"name":"shoot","description":"laser shoot"},{"name":"explosion","description":"explosion boom"}]}

Sprite rules:
- Maximum 6 sprites
- Sizes: 16, 24, 32, 48, or 64 pixels (square)
- Description MUST start with "pixel art" and include colors and style
- Include: player, enemies, collectibles, projectiles

Sound rules:
- Maximum 5 sounds
- Short descriptive names: jump, coin, shoot, explosion, hit, powerup, death, victory
- Description should describe the sound character (e.g., "coin collect chime", "8bit jump")`;

function parsePlan(output: string): GamePlan {
  const match = output.match(/\{[\s\S]*"sprites"[\s\S]*\}/);
  if (!match) return { sprites: [], sounds: [] };
  try {
    const data = JSON.parse(match[0]);
    const sprites = ((data.sprites || []) as SpritePlan[])
      .filter((s) => s.name && s.description && s.width && s.height)
      .slice(0, 8);
    const sounds = ((data.sounds || []) as SoundPlan[])
      .filter((s) => s.name && s.description)
      .slice(0, 6);
    return { sprites, sounds };
  } catch {
    return { sprites: [], sounds: [] };
  }
}

// --- Game generation prompt ---

const GAME_PROMPT = (
  userMsg: string,
  spriteAssets: Record<string, string>,
  soundAssets: Record<string, string>,
  conversation: { role: string; content: string }[],
) => {
  const spriteLines = Object.entries(spriteAssets)
    .map(([name, url]) => `  ${name}: "${url}"`)
    .join('\n');

  const soundLines = Object.entries(soundAssets)
    .map(([name, url]) => `  ${name}: "${url}"`)
    .join('\n');

  const history = conversation
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  return `You are Playdemy Game Engine — an AI that creates complete, playable HTML5 games.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current request: "${userMsg}"

SPRITE ASSETS — use these EXACT data URLs as image sources:
${spriteLines || '  (no sprites generated — draw everything with canvas shapes)'}

Load sprites like this:
  const img = new Image();
  img.src = "<paste the full data URL here>";
  // Wait for img.onload before drawing

SOUND ASSETS — use these EXACT data URLs for sound effects:
${soundLines || '  (no sounds loaded — use Web Audio API synth beeps instead)'}

Play sounds like this:
  const snd = new Audio("<paste the full data URL here>");
  snd.volume = 0.5;
  snd.play().catch(() => {}); // catch for autoplay policy
  // Create new Audio() each time to allow overlapping plays

GAME RULES:
- Single self-contained HTML file in a \`\`\`html code fence
- ALL CSS/JS inline, may use CDN libs (Phaser 3, p5.js) but prefer vanilla Canvas
- html,body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000 }
- Include: title screen → gameplay → game over → restart
- Show keyboard/touch controls on title screen
- 60fps requestAnimationFrame, handle window resize
- For any sounds NOT in the assets above, use Web Audio API synth beeps as fallback
- Score display, particles, smooth animations, polished feel

When modifying an existing game, output the COMPLETE updated HTML file.
Keep text to one sentence before and after the code block.`;
};

const MODULAR_PROMPT = (
  userMsg: string,
  conversation: { role: string; content: string }[],
) => {
  const history = conversation
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  return `You are Playdemy Game Engine — you create games as modular script files.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current request: "${userMsg}"

A game framework handles: game loop, input, physics, rendering, entities, audio, particles, scenes.
You ONLY write game-specific logic as separate files.

Output each file with markers. First line is the game title, then each file:

===TITLE: Game Title===
===FILE: config.js===
const CONFIG = { renderer: '2d', bgColor: '#111', world: { width: 800, height: 600 }, gravity: 0, startScene: 'title' };
===FILE: player.js===
const PLAYER = { type: 'player', width: 32, height: 32, speed: 200, ... };
===FILE: enemies.js===
const ENEMIES = [{ type: 'slime', ... }, { type: 'goblin', ... }];
===FILE: scenes.js===
const SCENES = { title: { enter(game) {...}, update(game,dt) {...}, draw(game,ctx) {...} }, gameplay: {...}, gameover: {...} };
===FILE: sounds.js===
const SOUNDS = { hit: { freq: 200, type: 'sawtooth', duration: 0.15 }, ... };
===FILE: setup.js===
const SETUP = function(game) { game.physics.addCollisionPair('player','enemy'); game.entities.spawn('player', {x:400,y:300}); };
===DONE===

IMPORTANT OUTPUT FORMAT RULES:
- First line must be ===TITLE: Your Title===
- Each file starts with ===FILE: filename.js===
- End with ===DONE===
- No text before ===TITLE or after ===DONE===
- No code fences (\`\`\`) — just raw code between markers

## Framework API available to your scripts:

### Entity definitions (each file exports a const):
const PLAYER = {
  type: 'player',           // required unique type name
  tags: ['friendly'],        // optional tags for querying
  width: 32, height: 32,    // size
  // any custom properties...
  speed: 200, hp: 100,

  init(entity, game) {},           // called on spawn
  update(entity, game, dt) {       // called every frame
    // game.input.isDown('KeyW')   — held check
    // game.input.justPressed('Space') — single press
    // game.input.mouse            — {x, y, dx, dy, buttons}
    // game.input.mouseDown(0)     — held check (0=left)
    // game.input.mouseJustPressed(0) — single click
    // game.input.mouseJustReleased(0) — single release
    // entity.x, entity.y, entity.vx, entity.vy — position/velocity
    // game.entities.query('enemy') — find entities by type
    // game.entities.first('player') — get single entity
    // game.physics.distance(a, b)
    // game.particles.emit(x, y, { count, color, speed })
    // game.audio.play('hit')
    // game.scenes.switch('gameover')
    // game.time.dt, game.time.elapsed
    // game.state.score = 10  — shared state
    // game.camera.follow(entity)
    // entity.destroy()
  },
  onCollide(entity, other, game) {},  // called on AABB overlap
  onDestroy(entity) {},
  draw(entity, game, ctx) {          // custom 2D drawing (optional)
    ctx.fillStyle = '#3af';
    ctx.fillRect(entity.x - entity.width/2, entity.y - entity.height/2, entity.width, entity.height);
  },
};

### For 3D games (config.renderer = '3d'):

CONFIG for 3D:
const CONFIG = {
  renderer: '3d',
  skyColor: '#87ceeb',
  fogColor: '#87ceeb',
  fogDensity: 0.015,
  groundColor: 0x4a7a4a,
  camDistance: 10,
  camHeight: 5,
  startScene: 'title',
};

Three.js (r128) + GLTFLoader are auto-loaded. Access via:
- game.three.scene — THREE.Scene
- game.three.camera — THREE.PerspectiveCamera
- game.three.renderer — THREE.WebGLRenderer
- game.three.sun — THREE.DirectionalLight
- game.three.camYaw / camPitch — camera rotation
- game.three.followEntity(entity) — third-person camera follow
- game.three.addToScene(object) — add THREE.Object3D to scene
- game.three.removeFromScene(object) — remove from scene

Model loading:
- game.loader.loadModel(url) — load any glTF, returns Promise<THREE.Group>
- game.loader.medieval(name) — shortcut for /assets/medieval/{name}.gltf
- game.loader.preload([url1, url2]) — preload multiple models

Available medieval models (use game.loader.medieval('ModelName')):
WALLS: Wall_Plaster_Straight, Wall_Plaster_Door_Flat, Wall_Plaster_Door_Round, Wall_Plaster_Window_Wide_Round, Wall_UnevenBrick_Straight, Wall_UnevenBrick_Door_Flat, Wall_Arch
FLOORS: Floor_Brick, Floor_WoodDark, Floor_WoodLight, Floor_RedBrick, Floor_UnevenBrick
ROOFS: Roof_RoundTiles_4x4, Roof_RoundTiles_6x6, Roof_RoundTiles_8x8, Roof_Tower_RoundTiles, Roof_Wooden_2x1
DOORS: Door_1_Flat, Door_1_Round, Door_2_Flat, Door_4_Round, Door_8_Flat
WINDOWS: Window_Thin_Round1, Window_Wide_Round1, WindowShutters_Wide_Round_Open
STAIRS: Stairs_Exterior_Straight, Stairs_Exterior_Platform, Stair_Interior_Simple
PROPS: Prop_Crate, Prop_Wagon, Prop_Chimney, Prop_WoodenFence_Single, Prop_Vine1, Prop_Support
STRUCTURAL: Corner_Exterior_Brick, Corner_Exterior_Wood, Balcony_Simple_Straight, Overhang_Plaster_Long, DoorFrame_Round_Brick

3D entity pattern:
const BUILDING = {
  type: 'building',
  async init(entity, game) {
    // Load and position a model
    const wall = await game.loader.medieval('Wall_Plaster_Straight');
    wall.position.set(entity.x, 0, entity.z);
    wall.scale.setScalar(entity.scale || 1);
    game.three.addToScene(wall);
    entity.mesh = wall; // store reference for updates
  },
  update(entity, game, dt) {
    // Sync mesh position with entity
    if (entity.mesh) {
      entity.mesh.position.set(entity.x, entity.y, entity.z);
    }
  },
  onDestroy(entity) {
    if (entity.mesh) entity.mesh.parent?.remove(entity.mesh);
  },
};

3D player pattern:
const PLAYER = {
  type: 'player',
  speed: 5,
  async init(entity, game) {
    // Create simple mesh or load model
    const geo = new THREE.BoxGeometry(0.6, 1.6, 0.4);
    const mat = new THREE.MeshLambertMaterial({ color: 0x3a6a9a });
    entity.mesh = new THREE.Mesh(geo, mat);
    entity.mesh.castShadow = true;
    entity.mesh.position.set(entity.x, 0.8, entity.z);
    game.three.addToScene(entity.mesh);
    game.three.followEntity(entity);
    game.input.requestPointerLock();
  },
  update(entity, game, dt) {
    const speed = entity.speed || 5;
    let mx = 0, mz = 0;
    if (game.input.isDown('KeyW')) mz -= 1;
    if (game.input.isDown('KeyS')) mz += 1;
    if (game.input.isDown('KeyA')) mx -= 1;
    if (game.input.isDown('KeyD')) mx += 1;
    if (mx || mz) {
      const len = Math.sqrt(mx*mx + mz*mz);
      mx /= len; mz /= len;
      const yaw = game.three.camYaw;
      entity.x += (mx*Math.cos(yaw) - mz*Math.sin(yaw)) * speed * dt;
      entity.z += (mx*Math.sin(yaw) + mz*Math.cos(yaw)) * speed * dt;
    }
    if (entity.mesh) {
      entity.mesh.position.set(entity.x, 0.8, entity.z);
      entity.mesh.rotation.y = game.three.camYaw + Math.PI;
    }
  },
};

### Scenes:
const SCENES = {
  title: {
    enter(game) { /* spawn title entities, show UI */ },
    update(game, dt) { if (game.input.justPressed('Space')) game.scenes.switch('gameplay'); },
    draw(game, ctx) { /* draw title screen overlay */ },
    exit(game) { /* cleanup */ },
  },
  gameplay: { enter(game) {}, update(game, dt) {} },
  gameover: { enter(game) {}, update(game, dt) {}, draw(game, ctx) {} },
};

### Sounds (synth):
const SOUNDS = {
  hit: { freq: 200, type: 'sawtooth', duration: 0.15, vol: 0.12 },
  pickup: { notes: [{ freq: 523, type: 'sine', duration: 0.1 }, { freq: 784, type: 'sine', duration: 0.15, delay: 0.08 }] },
};

### Collisions (registered in SETUP):
const COLLISIONS = [['player', 'enemy'], ['player', 'item'], ['bullet', 'enemy']];

### UI (called in update/draw):
// Raw px (fine for top-left HUD):
game.ui.text('Score: ' + game.state.score, 20, 30, { color: '#fff', font: '20px sans-serif' });
game.ui.bar(20, 40, 100, 8, player.hp, player.maxHp, '#e74c3c');

// Responsive (UDim = scale*canvas + offset; ANCHOR pins element by its own bounds):
game.ui.text('FPS: ' + game.time.fps, UDim(1, -20), UDim(0, 20), { anchor: ANCHOR.TopRight });
game.ui.text('GAME OVER', UDim(0.5, 0), UDim(0.5, 0), { anchor: ANCHOR.Center, font: '48px sans-serif' });
game.ui.bar(UDim(0.5, -50), UDim(1, -30), UDim(0, 100), UDim(0, 10), player.hp, player.maxHp, '#e74c3c', '#333', { anchor: ANCHOR.Bottom });
// Prefer UDim+ANCHOR for anything that shouldn't hug the top-left corner — keeps HUD correct on any screen size (Chromebook → monitor).

RULES:
- Each file defines ONE const (PLAYER, ENEMIES, SCENES, SOUNDS, CONFIG, SETUP, COLLISIONS)
- Arrays for multiple entity types: const ENEMIES = [{type:'slime',...}, {type:'goblin',...}]
- config.js is ALWAYS required
- scenes.js is ALWAYS required (must have at least 'title' and 'gameplay')
- setup.js is ALWAYS required (spawns initial entities, registers collisions)
- Keep each file focused on one concern
- For 3D games: entity init can be async (use async init(entity, game) {...})
- Load models in init(), store on entity.mesh, sync position in update()
- Use game.three.followEntity(entity) for third-person camera
- Available medieval models: see list above, use game.loader.medieval('Name')
- All positions in pixels, speeds in pixels/sec, time in seconds`;
};

const MODULAR_EDIT_PROMPT = (userMsg: string, currentFiles: Record<string, string>) => {
  const filesListing = Object.entries(currentFiles)
    .map(([name, content]) => `// ── ${name} ──\n${content}`)
    .join('\n\n');

  return `You are editing an existing game. Here are the current files:

${filesListing}

User request: "${userMsg}"

Output ONLY the files that need to change (omit unchanged files), using file markers:

===FILE: player.js===
...complete updated file content...
===DONE===

Rules:
- Only include files that actually change
- Output the COMPLETE file content for changed files (not diffs)
- No code fences — just raw code between markers
- Do not change the framework API calls — only change game logic
- Keep the same const name conventions (PLAYER, ENEMIES, SCENES, etc.)`;
};

/** Parse file-marker format streaming output into files */
function parseFileMarkers(text: string): { title: string; files: Record<string, string> } | null {
  const files: Record<string, string> = {};
  let title = 'Untitled Game';

  // Extract title
  const titleMatch = text.match(/===TITLE:\s*(.*?)===/);
  if (titleMatch) title = titleMatch[1].trim();

  // Extract files
  const filePattern = /===FILE:\s*([\w.-]+)===\n([\s\S]*?)(?====FILE:|===DONE===|$)/g;
  let match;
  while ((match = filePattern.exec(text)) !== null) {
    const name = match[1].trim();
    const content = match[2].trim();
    if (name && content) files[name] = content;
  }

  return Object.keys(files).length > 0 ? { title, files } : null;
}

/**
 * Stream Claude output and emit per-file events in real-time.
 * Detects ===FILE: name=== markers as they arrive.
 */
function createFileStreamParser(emit: (data: Record<string, unknown>) => void) {
  let buffer = '';
  let currentFile: string | null = null;
  let currentContent = '';
  let title = 'Untitled Game';
  const files: Record<string, string> = {};

  return {
    /** Feed a text chunk from Claude */
    push(chunk: string) {
      buffer += chunk;

      // Process complete lines
      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;
        const line = buffer.substring(0, lineEnd);
        buffer = buffer.substring(lineEnd + 1);

        // Check for title marker
        const titleMatch = line.match(/^===TITLE:\s*(.*?)===/);
        if (titleMatch) {
          title = titleMatch[1].trim();
          emit({ status: `🎮 ${title}` });
          continue;
        }

        // Check for file marker
        const fileMatch = line.match(/^===FILE:\s*([\w.-]+)===/);
        if (fileMatch) {
          // Finish previous file
          if (currentFile) {
            files[currentFile] = currentContent.trim();
            const lineCount = files[currentFile].split('\n').length;
            emit({ fileDone: currentFile, lines: lineCount });
          }
          // Start new file
          currentFile = fileMatch[1].trim();
          currentContent = '';
          emit({ fileStart: currentFile });
          continue;
        }

        // Check for done marker
        if (line.trim() === '===DONE===') {
          if (currentFile) {
            files[currentFile] = currentContent.trim();
            const lineCount = files[currentFile].split('\n').length;
            emit({ fileDone: currentFile, lines: lineCount });
            currentFile = null;
          }
          continue;
        }

        // Regular line — append to current file
        if (currentFile) {
          currentContent += line + '\n';
          emit({ fileChunk: { name: currentFile, line } });
        }
      }
    },

    /** Flush remaining buffer */
    flush() {
      if (currentFile && (currentContent.trim() || buffer.trim())) {
        currentContent += buffer;
        files[currentFile] = currentContent.trim();
        const lineCount = files[currentFile].split('\n').length;
        emit({ fileDone: currentFile, lines: lineCount });
      }
      buffer = '';
    },

    getResult() { return { title, files }; },
  };
}

/** Extract game files from the last assistant message in conversation history */
function extractLastGameFiles(messages: { role: string; content: string }[]): Record<string, string> | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === 'assistant') {
      const parsed = parseFileMarkers(m.content);
      if (parsed) return parsed.files;
    }
  }
  return null;
}

/** Legacy: extract HTML from old-format assistant messages (backward compat) */
function extractLastGameHtml(messages: { role: string; content: string }[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === 'assistant') {
      const match = m.content.match(/```html\s*([\s\S]*?)```/);
      if (match) return match[1].trim();
    }
  }
  return null;
}

// --- SSE helpers ---

function makeEmitter(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) {
  return (data: Record<string, unknown>) => {
    try {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
      );
    } catch { /* controller closed */ }
  };
}

function closeStream(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) {
  try {
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  } catch { /* already closed */ }
}

// --- Main handler ---

export async function POST(req: Request) {
  try {
    const { messages, userId } = (await req.json()) as {
      messages: { role: string; content: string }[];
      userId?: string;
    };
    const encoder = new TextEncoder();
    const userMsg = messages[messages.length - 1]?.content || '';
    const resolvedUserId = userId || 'local-user';

    // Credit metering: debit the generation cost up front so we can't produce
    // an expensive multi-pass game for a user whose balance is gone. On
    // insufficient balance we 402 before opening the stream. Catastrophic
    // stream-time errors do not currently refund — Sprint 3 will add
    // partial-credit refunds once the stream's success state is easier to
    // inspect from here.
    const spend = await spendCreditsFor(resolvedUserId, 'agent');
    if (!spend.ok && spend.reason === 'insufficient') {
      return new Response(
        JSON.stringify({
          error: 'Not enough credits',
          needed: spend.cost,
          balance: spend.balance,
        }),
        { status: 402, headers: { 'content-type': 'application/json' } }
      );
    }

    const readable = new ReadableStream({
      async start(controller) {
        const emit = makeEmitter(controller, encoder);

        try {
          // Check if this is a follow-up edit (has existing game in history)
          const existingFiles = extractLastGameFiles(messages);
          const existingHtml = !existingFiles ? extractLastGameHtml(messages) : null;
          const isFollowUp = (existingFiles || existingHtml) && messages.length > 2;

          if (isFollowUp && existingFiles) {
            // === Modular edit path ===
            emit({ status: '⚡ Applying changes...' });

            const progressMsgs = ['🔍 Analyzing changes needed...', '✏️ Editing game code...', '🔧 Applying modifications...'];
            let pIdx = 0;
            const pInterval = setInterval(() => {
              if (pIdx < progressMsgs.length) { emit({ status: progressMsgs[pIdx] }); pIdx++; }
            }, 3000);

            let editFailed = false;
            try {
              const editParser = createFileStreamParser(emit);
              await streamClaude(
                MODULAR_EDIT_PROMPT(userMsg, existingFiles),
                (text) => { editParser.push(text); },
              );
              editParser.flush();
              clearInterval(pInterval);

              const editResult = editParser.getResult();
              if (Object.keys(editResult.files).length > 0) {
                // Merge changed files into existing files
                const mergedFiles = { ...existingFiles, ...editResult.files };
                emit({ status: '✅ Changes applied' });
                emit({ game: { title: editResult.title || 'Updated Game', files: mergedFiles } });
              } else {
                emit({ status: '⚠️ Edit parse failed, regenerating full game...' });
                editFailed = true;
              }
            } catch {
              clearInterval(pInterval);
              emit({ status: '⚠️ Edit failed, regenerating...' });
              editFailed = true;
            }

            if (!editFailed) {
              closeStream(controller, encoder);
              return;
            }
            // If editFailed, fall through to full generation below
          } else if (isFollowUp && existingHtml) {
            // === Legacy HTML edit path (backward compat for old conversations) ===
            emit({ status: '⚡ Regenerating game with changes...' });
            // Fall through to full generation — legacy conversations get regenerated
          }

          // === Modular generation with real-time file streaming ===
          emit({ status: '⏳ Generating game modules...' });

          const fileParser = createFileStreamParser(emit);

          await streamClaude(
            MODULAR_PROMPT(userMsg, messages),
            (text) => { fileParser.push(text); },
          );
          fileParser.flush();

          const result = fileParser.getResult();
          if (Object.keys(result.files).length > 0) {
            emit({ status: `✅ Game ready — ${Object.keys(result.files).length} modules` });
            emit({ game: { title: result.title, files: result.files } });
          } else {
            // Fallback: markers not found — try JSON parse
            emit({ status: '⚠️ Unexpected format — trying fallback...' });
            // Reconstruct full text for fallback
            let fullText = '';
            await streamClaude(
              MODULAR_PROMPT(userMsg, messages),
              (t) => { fullText += t; },
            );
            const parsed = parseFileMarkers(fullText);
            if (parsed) {
              emit({ game: { title: parsed.title, files: parsed.files } });
            } else {
              emit({ text: fullText });
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          emit({ status: `❌ Error: ${msg}` });
          console.error('[agent]', err);
        } finally {
          closeStream(controller, encoder);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[agent/route]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
