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

// --- API mode: full tool_use loop with streaming ---

async function handleWithAPI(clientMessages: { role: string; content: string }[]) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const emit = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      emit({ status: '⏳ Planning game...' });

      // Build conversation (mutable — grows with tool rounds)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conv: any[] = clientMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      for (let round = 0; round < 10; round++) {
        const stream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16384,
          system: SYSTEM_PROMPT,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: GAME_TOOLS as any,
          messages: conv,
        });

        // Track tool_use blocks during streaming
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
          break; // Done — no more tools to call
        }

        // Add assistant message to conversation
        conv.push({ role: 'assistant', content: finalMsg.content });

        // Execute each tool and collect results
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
          const result = await executeTool(tb.name, input);
          emit({
            status: `✅ ${(input.name as string) || tb.name} ready`,
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: tb.id,
            content: JSON.stringify(result),
          });
        }

        // Add tool results to conversation
        conv.push({ role: 'user', content: toolResults });

        emit({ status: '🎮 Assembling game...' });
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// --- CLI mode: enhanced prompt, no tool support ---

function handleWithCLI(messages: { role: string; content: string }[]) {
  const cliPrompt = `${SYSTEM_PROMPT}

NOTE: Tools are not available in CLI mode. Generate all sprites as inline canvas drawing code and all sounds as inline Web Audio API code. Output status comments as you work:
// [STATUS] Planning game...
// [STATUS] Drawing sprites...
// [STATUS] Adding sound effects...
// [STATUS] Assembling final game...`;

  const prompt = [
    `System instructions: ${cliPrompt}`,
    '',
    ...messages.map((m) =>
      m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`,
    ),
  ].join('\n\n');

  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      // Emit initial status
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ status: '⏳ Planning game...' })}\n\n`),
      );

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
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ text: block.text })}\n\n`,
                    ),
                  );
                  sentText = true;
                }
              }
              continue;
            }

            if (parsed.type === 'result' && parsed.result && !sentText) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: parsed.result })}\n\n`,
                ),
              );
            }
          } catch {
            // Not JSON — skip
          }
        }
      });

      child.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString().trim();
        if (text && (text.includes('Error') || text.includes('error'))) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: `[Error] ${text}` })}\n\n`,
            ),
          );
        }
      });

      child.on('close', () => {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      });

      child.on('error', (err: Error) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ text: `[Error] Could not start claude: ${err.message}` })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      });
    },
  });
}

// --- Route handler ---

export async function POST(req: Request) {
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
}
