import { spawn } from 'child_process';
import { homedir } from 'os';
import Anthropic from '@anthropic-ai/sdk';

const USE_CLI = !process.env.ANTHROPIC_API_KEY;

// --- API mode (production: uses your API key) ---

async function handleWithAPI(messages: { role: string; content: string }[]) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: 'You are a helpful AI assistant embedded in Problocks, an AI-powered game creation studio. Help the user with their game development questions, code, and creative ideas. Be concise and direct.',
    messages: messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  });

  return new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// --- CLI mode (local dev: uses user's Claude subscription) ---

function handleWithCLI(messages: { role: string; content: string }[]) {
  const prompt = messages
    .map((m) => (m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`))
    .join('\n\n');

  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      const child = spawn('claude', [
        '-p', prompt,
        '--output-format', 'stream-json',
        '--verbose',
        '--dangerously-skip-permissions',
      ], {
        env: {
          ...process.env,
          HOME: process.env.HOME || homedir(),
          PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
          USER: process.env.USER || '',
          SHELL: process.env.SHELL || '/bin/zsh',
          TERM: 'xterm-256color',
        },
      });

      let sentText = false;

      child.stdout.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'system' || parsed.type === 'rate_limit_event') continue;

            if (parsed.type === 'assistant' && parsed.message?.content) {
              for (const block of parsed.message.content) {
                if (block.type === 'text' && block.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: block.text })}\n\n`));
                  sentText = true;
                }
              }
              continue;
            }

            if (parsed.type === 'result' && parsed.result && !sentText) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.result })}\n\n`));
            }
          } catch {
            // Not JSON — skip
          }
        }
      });

      child.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString().trim();
        if (text && (text.includes('Error') || text.includes('error'))) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: `[Error] ${text}` })}\n\n`));
        }
      });

      child.on('close', () => {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      });

      child.on('error', (err) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: `[Error] Could not start claude: ${err.message}` })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      });
    },
  });
}

// --- Route handler ---

export async function POST(req: Request) {
  const { messages } = await req.json();
  const readable = USE_CLI ? handleWithCLI(messages) : await handleWithAPI(messages);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
