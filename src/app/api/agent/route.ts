/**
 * Game generation agent — two-pass architecture:
 *   Pass 1: Claude CLI plans the game + lists sprites needed (JSON)
 *   Assets: PixelLab generates real pixel art for each sprite
 *   Pass 2: Claude CLI builds the game HTML using the real assets
 *
 * No ANTHROPIC_API_KEY needed — uses the user's Claude CLI subscription.
 * Needs PIXELLAB_API_KEY for sprite generation (falls back to inline canvas art).
 */
import { spawn } from 'child_process';
import { homedir } from 'os';
import { generateSprite, isAvailable as pixelLabAvailable } from '@/lib/pixellab';

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

// --- Sprite planning ---

interface SpritePlan {
  name: string;
  description: string;
  width: number;
  height: number;
}

const PLAN_PROMPT = (userMsg: string) => `You are planning sprites for an HTML5 game.

Game request: "${userMsg}"

List all visual sprites the game needs. Output ONLY valid JSON, no other text:
{"sprites":[{"name":"player","description":"pixel art blue spaceship facing up, dark background","width":32,"height":32}]}

Rules:
- Maximum 6 sprites (keep it fast)
- Sizes: 16, 24, 32, 48, or 64 pixels
- Each description MUST start with "pixel art" and include colors and style
- Include at minimum: player character, 1-2 enemies, collectibles/items
- Descriptions should be vivid and specific for good AI art generation
- Use square dimensions for most sprites`;

function parseSprites(output: string): SpritePlan[] {
  // Find JSON in output (Claude may wrap in markdown fences or add text)
  const match = output.match(/\{[\s\S]*"sprites"[\s\S]*\}/);
  if (!match) return [];
  try {
    const data = JSON.parse(match[0]);
    const sprites = data.sprites as SpritePlan[];
    // Validate and cap
    return sprites
      .filter((s) => s.name && s.description && s.width && s.height)
      .slice(0, 8);
  } catch {
    return [];
  }
}

// --- Game generation prompt ---

const GAME_PROMPT = (
  userMsg: string,
  assets: Record<string, string>,
  conversation: { role: string; content: string }[],
) => {
  const assetLines = Object.entries(assets)
    .map(([name, url]) => `  ${name}: "${url}"`)
    .join('\n');

  const history = conversation
    .slice(0, -1) // Exclude the latest message (already in userMsg)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  return `You are Problocks Game Engine — an AI that creates complete, playable HTML5 games.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current request: "${userMsg}"

SPRITE ASSETS — use these EXACT data URLs as image sources:
${assetLines || '  (no sprites generated — draw everything with canvas shapes)'}

Load sprites like this:
  const img = new Image();
  img.src = "<paste the full data URL here>";
  // Wait for img.onload before drawing

GAME RULES:
- Single self-contained HTML file in a \`\`\`html code fence
- ALL CSS/JS inline, may use CDN libs (Phaser 3, p5.js) but prefer vanilla Canvas
- html,body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000 }
- Include: title screen → gameplay → game over → restart
- Show keyboard/touch controls on title screen
- 60fps requestAnimationFrame, handle window resize
- Add sound effects via Web Audio API (short synth beeps)
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
          if (pixelLabAvailable()) {
            // === Two-pass: plan → PixelLab sprites → build game ===
            emit({ status: '⏳ Planning game assets...' });

            const planOutput = await callClaude(PLAN_PROMPT(userMsg));
            const sprites = parseSprites(planOutput);

            if (sprites.length > 0) {
              emit({
                status: `📋 Need ${sprites.length} sprites: ${sprites.map((s) => s.name).join(', ')}`,
              });

              // Generate sprites via PixelLab (in parallel, max 3 concurrent)
              const assets: Record<string, string> = {};
              const batches: SpritePlan[][] = [];
              for (let i = 0; i < sprites.length; i += 3) {
                batches.push(sprites.slice(i, i + 3));
              }

              for (const batch of batches) {
                const results = await Promise.allSettled(
                  batch.map(async (sprite) => {
                    emit({
                      status: `🎨 PixelLab: generating ${sprite.name}...`,
                    });
                    try {
                      const url = await generateSprite(
                        sprite.description,
                        sprite.width,
                        sprite.height,
                      );
                      assets[sprite.name] = url;
                      emit({ status: `✅ ${sprite.name} ready` });
                    } catch (err) {
                      const msg =
                        err instanceof Error ? err.message : String(err);
                      emit({ status: `⚠️ ${sprite.name} failed: ${msg}` });
                    }
                  }),
                );
                // Ignore settled status — failures are already reported
                void results;
              }

              emit({ status: '🎮 Building game with assets...' });
              await streamClaude(
                GAME_PROMPT(userMsg, assets, messages),
                (text) => emit({ text }),
              );
            } else {
              // Planning failed to extract sprites — build game inline
              emit({ status: '⚠️ No sprites planned — generating inline...' });
              await streamClaude(
                INLINE_PROMPT(userMsg, messages),
                (text) => emit({ text }),
              );
            }
          } else {
            // === Single-pass: no PixelLab — all inline ===
            emit({ status: '⏳ Generating game (no PixelLab key)...' });
            emit({ status: '✍️ Drawing sprites with canvas...' });
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
