import { spawn } from 'child_process';

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
        env: { ...process.env, PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin' },
      });

      child.stdout.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            // stream-json emits objects with type "assistant" and content blocks
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
            }
            // Also handle the simpler text streaming format
            if (parsed.type === 'assistant' && parsed.message) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.message })}\n\n`));
            }
          } catch {
            // Raw text fallback — some versions just stream text
            if (line.trim()) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: line })}\n\n`));
            }
          }
        }
      });

      child.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        // Skip progress/status lines, only forward real errors
        if (text.includes('Error') || text.includes('error')) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: `[Error] ${text.trim()}` })}\n\n`));
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
