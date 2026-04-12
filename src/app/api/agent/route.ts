import { spawn } from 'child_process';
import { homedir } from 'os';
import Anthropic from '@anthropic-ai/sdk';
import { GAME_TOOLS, executeTool, getToolStatusMessage } from '@/lib/game-tools';

const USE_CLI = !process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are Problocks Game Engine — an AI that creates complete, playable HTML5 games.

You have tools to generate game assets:
- generate_sprite: Creates sprite images (returns data URLs for Canvas drawImage or <img>)
- generate_sound: Creates Web Audio API sound parameters

WORKFLOW — follow this order:
1. Plan what sprites and sounds the game needs
2. Call generate_sprite for each visual element (player, enemies, items, backgrounds, etc.)
3. Call generate_sound for each sound effect (jump, shoot, collect, explosion, etc.)
4. Output the complete HTML game in a single \`\`\`html code fence, using the asset data URLs

GAME RULES:
- Single self-contained HTML file, all CSS/JS inline
- Use sprite data URLs from tool results: const img = new Image(); img.src = "<data url from tool>";
- Implement sounds using Web Audio API with the params from generate_sound results
- May load CDN libraries (Phaser 3, p5.js) but prefer vanilla Canvas for simple games
- html,body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000 }
- Include: title screen → gameplay → game over → restart loop
- Show controls on title screen (keyboard + touch/click)
- 60fps requestAnimationFrame, handle window resize
- Score display, particles, smooth animations

When modifying an existing game, call tools for any NEW assets needed, then output the COMPLETE updated HTML.
Keep text explanations to one sentence before and after the code block.`;

// CLI-only prompt — no tools available, generate everything inline
const CLI_SYSTEM_PROMPT = `You are Problocks Game Engine — an AI that creates complete, playable HTML5 games from descriptions.

RULES:
1. ALWAYS output a complete, self-contained HTML file inside a single \`\`\`html code fence
2. ALL CSS and JavaScript must be inline (<style> and <script> tags)
3. You may load libraries from CDNs (Phaser 3, p5.js) but prefer vanilla Canvas for simple games
4. Game MUST fill its container: html,body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000 }
5. Include: title screen → gameplay → game over → restart
6. Show keyboard/touch controls on the title screen
7. Use requestAnimationFrame for smooth 60fps animation
8. Handle window resize gracefully
9. Add simple sound effects via Web Audio API (short synth beeps/boops, no external files)
10. Draw all sprites using canvas shapes, gradients, and paths — make them look polished

STYLE:
- Colorful, polished visuals (canvas shapes, gradients, geometric art)
- Smooth animations, screen transitions
- Score display, particles, juice effects for game feel
- Dark background (#000 or #111)

When modifying an existing game, output the COMPLETE updated HTML file (not a diff).
Keep explanations brief — one sentence before and after the code block.`;

// --- Shared SSE helpers ---

function makeEmitter(controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  return (data: Record<string, unknown>) => {
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      // Controller already closed — ignore
    }
  };
}

function closeStream(controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  try {
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  } catch {
    // Already closed — ignore
  }
}

// --- API mode: full tool_use loop with streaming ---

async function handleWithAPI(clientMessages: { role: string; content: string }[]) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const emit = makeEmitter(controller, encoder);

      try {
        emit({ status: '⏳ Planning game...' });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conv: any[] = clientMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        for (let round = 0; round < 10; round++) {
          emit({ status: round === 0 ? '🤖 Calling Claude...' : '🎮 Assembling game...' });

          const stream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16384,
            system: SYSTEM_PROMPT,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: GAME_TOOLS as any,
            messages: conv,
          });

          const toolBlocks: { id: string; name: string; inputJson: string }[] = [];
          let activeToolId = '';
          let activeInput = '';
          let activeToolName = '';

          for await (const event of stream) {
            if (
              event.type === 'content_block_start' &&
              event.content_block.type === 'tool_use'
            ) {
              activeToolId = event.content_block.id;
              activeToolName = event.content_block.name;
              activeInput = '';
            }

            if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                emit({ text: event.delta.text });
              } else if (event.delta.type === 'input_json_delta') {
                activeInput += event.delta.partial_json;
              }
            }

            if (event.type === 'content_block_stop' && activeToolId) {
              toolBlocks.push({
                id: activeToolId,
                name: activeToolName,
                inputJson: activeInput,
              });
              activeToolId = '';
              activeInput = '';
            }
          }

          const finalMsg = await stream.finalMessage();

          if (finalMsg.stop_reason !== 'tool_use' || toolBlocks.length === 0) {
            break;
          }

          // Add assistant message to conversation
          conv.push({ role: 'assistant', content: finalMsg.content });

          // Execute each tool
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const toolResults: any[] = [];

          for (const tb of toolBlocks) {
            let input: Record<string, unknown>;
            try {
              input = JSON.parse(tb.inputJson);
            } catch {
              input = {};
            }

            emit({ status: getToolStatusMessage(tb.name, input) });

            try {
              const result = await executeTool(tb.name, input);
              emit({ status: `✅ ${(input.name as string) || tb.name} ready` });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: tb.id,
                content: JSON.stringify(result),
              });
            } catch (toolErr) {
              const msg = toolErr instanceof Error ? toolErr.message : 'Tool failed';
              emit({ status: `⚠️ ${tb.name} failed: ${msg}` });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: tb.id,
                content: JSON.stringify({ error: msg }),
                is_error: true,
              });
            }
          }

          conv.push({ role: 'user', content: toolResults });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        emit({ status: `❌ Error: ${msg}` });
        console.error('[agent/api]', err);
      } finally {
        closeStream(controller, encoder);
      }
    },
  });
}

// --- CLI mode: no tool support, streams text directly ---

function handleWithCLI(messages: { role: string; content: string }[]) {
  const prompt = [
    `System instructions: ${CLI_SYSTEM_PROMPT}`,
    '',
    ...messages.map((m) =>
      m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`,
    ),
  ].join('\n\n');

  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      const emit = makeEmitter(controller, encoder);

      emit({ status: '⏳ Planning game...' });
      emit({ status: '🎨 Generating everything inline (no API key — CLI mode)...' });

      const child = spawn(
        'claude',
        [
          '-p',
          prompt,
          '--output-format',
          'stream-json',
          '--verbose',
          '--dangerously-skip-permissions',
        ],
        {
          env: {
            HOME: process.env.HOME || homedir(),
            PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
            USER: process.env.USER || '',
            SHELL: process.env.SHELL || '/bin/zsh',
            TERM: 'xterm-256color',
          },
        },
      );

      let sentText = false;
      let firstChunk = true;

      child.stdout.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'system' || parsed.type === 'rate_limit_event')
              continue;

            if (parsed.type === 'assistant' && parsed.message?.content) {
              for (const block of parsed.message.content) {
                if (block.type === 'text' && block.text) {
                  if (firstChunk) {
                    emit({ status: '✍️ Writing game code...' });
                    firstChunk = false;
                  }
                  emit({ text: block.text });
                  sentText = true;
                }
              }
              continue;
            }

            if (parsed.type === 'result' && parsed.result && !sentText) {
              emit({ text: parsed.result });
            }
          } catch {
            // Not JSON — skip
          }
        }
      });

      child.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString().trim();
        if (text && (text.includes('Error') || text.includes('error'))) {
          emit({ status: `❌ ${text.slice(0, 200)}` });
        }
      });

      child.on('close', (code: number | null) => {
        if (code !== 0 && !sentText) {
          emit({ status: `❌ Claude process exited with code ${code}` });
        }
        closeStream(controller, encoder);
      });

      child.on('error', (err: Error) => {
        emit({ status: `❌ Could not start claude: ${err.message}` });
        closeStream(controller, encoder);
      });
    },
  });
}

// --- Route handler ---

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const readable = USE_CLI
      ? handleWithCLI(messages)
      : await handleWithAPI(messages);

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[agent/route]', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
