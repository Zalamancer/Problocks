import { spawn } from 'child_process';
import { homedir } from 'os';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Build the prompt — include conversation history for context
  const prompt = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`
    )
    .join('\n\n');

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    start(controller) {
      const child = spawn('claude', [
        '-p', prompt,
        '--output-format', 'stream-json',
        '--verbose',
        '--dangerously-skip-permissions',
      ], {
        env: {
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

            // Skip system events (hooks, init, rate limits)
            if (parsed.type === 'system' || parsed.type === 'rate_limit_event') continue;

            // Assistant message — extract text from content blocks
            if (parsed.type === 'assistant' && parsed.message?.content) {
              for (const block of parsed.message.content) {
                if (block.type === 'text' && block.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: block.text })}\n\n`));
                  sentText = true;
                }
              }
              continue;
            }

            // Final result — use as fallback if no assistant text was sent
            if (parsed.type === 'result' && parsed.result && !sentText) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.result })}\n\n`));
              continue;
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

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
