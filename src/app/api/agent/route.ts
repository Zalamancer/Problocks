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

const INLINE_PROMPT = (
  userMsg: string,
  conversation: { role: string; content: string }[],
) => {
  const history = conversation
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  return `You are Problocks Game Engine — an AI that creates complete, playable HTML5 games.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current request: "${userMsg}"

RULES:
- Single HTML file in a \`\`\`html code fence, all CSS/JS inline
- Prefer vanilla Canvas, may use CDN libs (Phaser 3, p5.js) for complex games
- html,body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000 }
- Draw all sprites with canvas shapes, gradients, and paths — make them polished
- Include: title screen → gameplay → game over → restart
- Show controls on title screen, 60fps animation, handle resize
- Web Audio API sound effects, score display, particles
- When modifying, output the COMPLETE updated HTML

Keep text to one sentence before and after the code block.`;
};

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
          const hasPixelLab = pixelLabAvailable();
          const hasFreesound = freesoundAvailable();

          if (hasPixelLab || hasFreesound) {
            // === Two-pass: plan → generate assets → build game ===
            emit({ status: '⏳ Planning game assets...' });

            const planOutput = await callClaude(PLAN_PROMPT(userMsg));
            const plan = parsePlan(planOutput);

            const spriteAssets: Record<string, string> = {};
            const soundAssets: Record<string, string> = {};

            // --- Sprites via PixelLab ---
            if (hasPixelLab && plan.sprites.length > 0) {
              emit({
                status: `📋 ${plan.sprites.length} sprites: ${plan.sprites.map((s) => s.name).join(', ')}`,
              });

              const batches: SpritePlan[][] = [];
              for (let i = 0; i < plan.sprites.length; i += 3) {
                batches.push(plan.sprites.slice(i, i + 3));
              }

              for (const batch of batches) {
                await Promise.allSettled(
                  batch.map(async (sprite) => {
                    emit({ status: `🎨 PixelLab: ${sprite.name}...` });
                    try {
                      spriteAssets[sprite.name] = await generateSprite(
                        sprite.description,
                        sprite.width,
                        sprite.height,
                      );
                      emit({ status: `✅ ${sprite.name} ready` });
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : String(err);
                      emit({ status: `⚠️ ${sprite.name} failed: ${msg}` });
                    }
                  }),
                );
              }
            }

            // --- Sounds via Freesound ---
            if (hasFreesound && plan.sounds.length > 0) {
              emit({
                status: `🔊 ${plan.sounds.length} sounds: ${plan.sounds.map((s) => s.name).join(', ')}`,
              });

              // Fetch sounds in parallel (all at once — they're just searches)
              await Promise.allSettled(
                plan.sounds.map(async (sound) => {
                  emit({ status: `🔊 Freesound: ${sound.name}...` });
                  try {
                    const result = await findSound(sound.description);
                    if (result) {
                      soundAssets[sound.name] = result.url;
                      emit({ status: `✅ ${sound.name} ready` });
                    } else {
                      emit({ status: `⚠️ ${sound.name}: no match (will use synth)` });
                    }
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    emit({ status: `⚠️ ${sound.name} failed: ${msg}` });
                  }
                }),
              );
            }

            // --- Build game ---
            const totalAssets = Object.keys(spriteAssets).length + Object.keys(soundAssets).length;
            if (totalAssets > 0) {
              emit({ status: `🎮 Building game with ${totalAssets} assets...` });
              await streamClaude(
                GAME_PROMPT(userMsg, spriteAssets, soundAssets, messages),
                (text) => emit({ text }),
              );
            } else {
              emit({ status: '⚠️ No assets generated — building inline...' });
              await streamClaude(
                INLINE_PROMPT(userMsg, messages),
                (text) => emit({ text }),
              );
            }
          } else {
            // === Single-pass: no service keys — all inline ===
            emit({ status: '⏳ Generating game (no service keys)...' });
            emit({ status: '✍️ Drawing sprites + synth sounds inline...' });
            await streamClaude(
              INLINE_PROMPT(userMsg, messages),
              (text) => emit({ text }),
            );
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
