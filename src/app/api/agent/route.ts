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

// --- Claude CLI helpers ---

function cliEnv() {
  return {
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

  return `You are Problocks Game Engine — an AI that creates complete, playable HTML5 games.

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

  return `You are Problocks Game Engine — you create games as modular script files.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current request: "${userMsg}"

A game framework handles: game loop, input, physics, rendering, entities, audio, particles, scenes.
You ONLY write game-specific logic as separate files.

Output ONLY a JSON object with this structure (no other text before or after):

\`\`\`json
{
  "title": "Game Title",
  "files": {
    "config.js": "const CONFIG = { renderer: '2d', bgColor: '#111', world: { width: 800, height: 600 }, gravity: 0, startScene: 'title' };",
    "player.js": "const PLAYER = { type: 'player', width: 32, height: 32, speed: 200, ... };",
    "enemies.js": "const ENEMIES = [{ type: 'slime', ... }, { type: 'goblin', ... }];",
    "scenes.js": "const SCENES = { title: { enter(game) {...}, update(game,dt) {...}, draw(game,ctx) {...} }, gameplay: {...}, gameover: {...} };",
    "sounds.js": "const SOUNDS = { hit: { freq: 200, type: 'sawtooth', duration: 0.15 }, ... };",
    "setup.js": "const SETUP = function(game) { game.physics.addCollisionPair('player','enemy'); game.entities.spawn('player', {x:400,y:300}); };"
  }
}
\`\`\`

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
- Set CONFIG.renderer = '3d'
- Three.js is auto-loaded via CDN
- Access via game.three.scene, game.three.camera, game.three.renderer
- In SETUP function: create Three.js scene, camera, lights, add meshes
- In entity update: manipulate Three.js objects stored on entity (entity.mesh = ...)
- The canvas is shared — framework handles the render call

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
game.ui.text('Score: ' + game.state.score, 20, 30, { color: '#fff', font: '20px sans-serif' });
game.ui.bar(20, 40, 100, 8, player.hp, player.maxHp, '#e74c3c');

RULES:
- Each file defines ONE const (PLAYER, ENEMIES, SCENES, SOUNDS, CONFIG, SETUP, COLLISIONS)
- Arrays for multiple entity types: const ENEMIES = [{type:'slime',...}, {type:'goblin',...}]
- config.js is ALWAYS required
- scenes.js is ALWAYS required (must have at least 'title' and 'gameplay')
- setup.js is ALWAYS required (spawns initial entities, registers collisions)
- Keep each file focused on one concern
- For 3D games: put Three.js setup in setup.js, mesh creation in entity init/setup3d
- All positions in pixels, speeds in pixels/sec, time in seconds`;
};

const MODULAR_EDIT_PROMPT = (userMsg: string, currentFiles: Record<string, string>) => {
  const filesListing = Object.entries(currentFiles)
    .map(([name, content]) => `// ── ${name} ──\n${content}`)
    .join('\n\n');

  return `You are editing an existing game. Here are the current files:

${filesListing}

User request: "${userMsg}"

Output ONLY a JSON object with the files that need to change (omit unchanged files):

\`\`\`json
{
  "files": {
    "player.js": "...updated content..."
  }
}
\`\`\`

Rules:
- Only include files that actually change
- Output the COMPLETE file content for changed files (not diffs)
- Do not change the framework API calls — only change game logic
- Keep the same const name conventions (PLAYER, ENEMIES, SCENES, etc.)`;
};

/** Parse a JSON game response (```json block) into title + files */
function parseGameJson(text: string): { title: string; files: Record<string, string> } | null {
  // Try to extract from ```json code fence first
  const fenceMatch = text.match(/```json\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text.trim();

  try {
    const data = JSON.parse(jsonStr);
    if (data.files && typeof data.files === 'object') {
      return { title: data.title || 'Untitled Game', files: data.files };
    }
    return null;
  } catch {
    // Try to find a JSON object with "files" key anywhere in the text
    const match = text.match(/\{[\s\S]*"files"\s*:\s*\{[\s\S]*\}\s*\}/);
    if (match) {
      try {
        const data = JSON.parse(match[0]);
        if (data.files && typeof data.files === 'object') {
          return { title: data.title || 'Untitled Game', files: data.files };
        }
      } catch { /* fall through */ }
    }
    return null;
  }
}

/** Extract game files from the last assistant message in conversation history */
function extractLastGameFiles(messages: { role: string; content: string }[]): Record<string, string> | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === 'assistant') {
      const parsed = parseGameJson(m.content);
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
    const { messages } = (await req.json()) as {
      messages: { role: string; content: string }[];
    };
    const encoder = new TextEncoder();
    const userMsg = messages[messages.length - 1]?.content || '';

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
              let editResponse = '';
              await streamClaude(
                MODULAR_EDIT_PROMPT(userMsg, existingFiles),
                (text) => { editResponse += text; },
              );

              clearInterval(pInterval);

              const parsed = parseGameJson(editResponse);
              if (parsed && Object.keys(parsed.files).length > 0) {
                // Merge changed files into existing files
                const mergedFiles = { ...existingFiles, ...parsed.files };
                emit({ status: '✅ Changes applied' });
                emit({ game: { title: parsed.title || 'Updated Game', files: mergedFiles } });
                // Also emit the raw JSON as text so it's stored in conversation history
                const gameJson = JSON.stringify({ title: parsed.title || 'Updated Game', files: mergedFiles });
                emit({ text: '```json\n' + gameJson + '\n```\n' });
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

          // === Always use modular generation with the framework ===
          emit({ status: '⏳ Generating modular game...' });
          const progressMsgs = [
            '🎮 Building game...',
            '⚙️ Designing game logic...',
            '🎨 Creating visuals...',
            '🔧 Adding interactions...',
            '✨ Polishing gameplay...',
            '📦 Finalizing...',
          ];
          let progressIdx = 0;
          const progressInterval = setInterval(() => {
            if (progressIdx < progressMsgs.length) {
              emit({ status: progressMsgs[progressIdx] });
              progressIdx++;
            }
          }, 4000);

          let fullResponse = '';
          try {
            await streamClaude(
              MODULAR_PROMPT(userMsg, messages),
              (text) => { fullResponse += text; },
            );
          } finally {
            clearInterval(progressInterval);
          }

          // Parse the completed JSON response and emit the game event
          const parsed = parseGameJson(fullResponse);
          if (parsed) {
            emit({ status: `✅ Game ready — ${Object.keys(parsed.files).length} modules` });
            emit({ game: { title: parsed.title, files: parsed.files } });
          } else {
            // Fallback: Claude returned something other than JSON — try HTML extraction
            emit({ status: '⚠️ Unexpected format — trying fallback...' });
            emit({ text: fullResponse });
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
