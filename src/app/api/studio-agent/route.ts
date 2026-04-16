/**
 * Studio agent — drives the NATIVE studio (scene parts + building tiles),
 * NOT an iframe game. Takes a user message + current scene snapshot and
 * streams back structured mutation actions the client applies directly
 * to `scene-store` and `building-store`.
 *
 * Output contract from Claude CLI is line-delimited:
 *   ACTION: {"type":"addPart", ...}
 *   ACTION: {"type":"placeFloor", "x":0, "z":0}
 *   Any non-ACTION line is treated as narration.
 *
 * Over SSE we emit:
 *   { status: "..." }           — step markers
 *   { action: {...} }           — one applied action
 *   { text: "..." }             — narration chunks
 *   [DONE]                      — stream end
 */
import { spawn } from 'child_process';
import { homedir } from 'os';

function cliEnv() {
  return {
    HOME: process.env.HOME || homedir(),
    PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    USER: process.env.USER || '',
    SHELL: process.env.SHELL || '/bin/zsh',
    TERM: 'xterm-256color',
  };
}

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
        } catch {
          /* skip */
        }
      }
    });

    child.on('close', () => resolve());
    child.on('error', reject);
  });
}

// --- Scene snapshot ---

interface SceneSnapshot {
  parts: Array<{
    id: string;
    name: string;
    partType: string;
    position: { x: number; y: number; z: number };
    color: string;
    scale: { x: number; y: number; z: number };
  }>;
  floors: string[]; // list of "x,z" keys
  walls: string[]; // list of "x,z,dir" keys
  gridSize: number;
}

// --- Prompt ---

const STUDIO_PROMPT = (
  userMsg: string,
  scene: SceneSnapshot,
  conversation: { role: string; content: string }[],
) => {
  const history = conversation
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const partsDump = scene.parts.length
    ? scene.parts
        .map(
          (p) =>
            `  id=${p.id} name="${p.name}" type=${p.partType} pos=(${p.position.x},${p.position.y},${p.position.z}) color=${p.color} scale=(${p.scale.x},${p.scale.y},${p.scale.z})`,
        )
        .join('\n')
    : '  (scene is empty)';

  const floorsDump = scene.floors.length
    ? `  ${scene.floors.slice(0, 40).join(', ')}${scene.floors.length > 40 ? `, +${scene.floors.length - 40} more` : ''}`
    : '  (no floor tiles)';
  const wallsDump = scene.walls.length
    ? `  ${scene.walls.slice(0, 40).join(', ')}${scene.walls.length > 40 ? `, +${scene.walls.length - 40} more` : ''}`
    : '  (no walls)';

  return `You are the Problocks Studio Agent. You edit a 3D scene directly —
you do NOT write HTML or build a standalone game. Your output is a sequence
of ACTION lines that mutate the live scene.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current user message: "${userMsg}"

Current scene:
  Parts:
${partsDump}

  Floor tiles (grid coords, tile = ${scene.gridSize}m):
${floorsDump}

  Walls (grid coords + dir, N or E):
${wallsDump}

## Output format

Every mutation is ONE LINE starting with "ACTION: " followed by a single JSON
object. Narration text can appear between ACTION lines; keep it short.

Supported actions:

  {"type":"addPart","name":"Tower","partType":"Block","position":{"x":0,"y":0.5,"z":0},"scale":{"x":1,"y":1,"z":1},"color":"#ff4444"}
    — partType: "Block" | "Sphere" | "Cylinder" | "Wedge"
    — position/scale default sensibly; color is hex like "#3af".

  {"type":"updatePart","id":"<existing-id>","color":"#00ff00","position":{"x":2,"y":0.5,"z":0}}
    — any subset of addPart fields (except partType) can be updated.

  {"type":"removePart","id":"<existing-id>"}

  {"type":"clearParts"}
    — remove ALL parts. Use sparingly.

  {"type":"placeFloor","x":0,"z":0}
    — add a floor tile at grid (x,z). Integer coords.

  {"type":"eraseFloor","x":0,"z":0}

  {"type":"placeWall","x":0,"z":0,"dir":"N"}
    — dir is "N" (north edge of tile) or "E" (east edge of tile).

  {"type":"eraseWall","x":0,"z":0,"dir":"N"}

  {"type":"clearBuilding"}
    — clear all floors and walls.

  {"type":"setFloorAsset","asset":"Floor_WoodDark"}
  {"type":"setWallAsset","asset":"Wall_Brick"}
    — change the asset future placements will use.

## Rules

- Output ACTION lines with valid JSON only — no comments, no trailing commas.
- Place parts on or slightly above y=0.5 (the ground plane) unless stacking.
- Units: parts use meters for position; tile grid is integer indices.
- When building rooms, place floors first then walls on the boundary edges.
- If the user asks to "clear" or "start over", emit clearParts AND clearBuilding.
- For referring to existing parts, ALWAYS use the id from the scene dump above.
- Keep narration to one or two short sentences; the user mostly wants the scene to change.

Now respond to the user message with narration + ACTION lines.`;
};

// --- Action streaming parser ---

interface Emit {
  (data: Record<string, unknown>): void;
}

/**
 * Feed Claude's text chunks; parse out "ACTION: {json}" lines and emit
 * each as { action: ... }. Non-action content streams as { text: ... }.
 */
function createActionParser(emit: Emit) {
  let buffer = '';

  function flushLine(line: string) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('ACTION:')) {
      const json = trimmed.slice('ACTION:'.length).trim();
      try {
        const obj = JSON.parse(json);
        if (obj && typeof obj.type === 'string') {
          emit({ action: obj });
          return;
        }
      } catch {
        // fall through — treat as text
      }
    }
    // Treat as narration (preserve original line including the newline
    // that followed it so the chat looks natural)
    if (line.length > 0) emit({ text: line + '\n' });
  }

  return {
    push(chunk: string) {
      buffer += chunk;
      while (true) {
        const nl = buffer.indexOf('\n');
        if (nl === -1) break;
        const line = buffer.substring(0, nl);
        buffer = buffer.substring(nl + 1);
        flushLine(line);
      }
    },
    flush() {
      if (buffer.length > 0) {
        flushLine(buffer);
        buffer = '';
      }
    },
  };
}

// --- SSE helpers ---

function makeEmitter(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): Emit {
  return (data) => {
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      /* closed */
    }
  };
}

function closeStream(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) {
  try {
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  } catch {
    /* already closed */
  }
}

// --- Route ---

export async function POST(req: Request) {
  try {
    const { messages, scene } = (await req.json()) as {
      messages: { role: string; content: string }[];
      scene: SceneSnapshot;
    };
    const encoder = new TextEncoder();
    const userMsg = messages[messages.length - 1]?.content || '';

    const readable = new ReadableStream({
      async start(controller) {
        const emit = makeEmitter(controller, encoder);
        try {
          emit({ status: '🧠 Planning scene changes...' });
          const parser = createActionParser(emit);
          await streamClaude(
            STUDIO_PROMPT(userMsg, scene, messages),
            (text) => {
              parser.push(text);
            },
          );
          parser.flush();
          emit({ status: '✅ Done' });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          emit({ status: `❌ Error: ${msg}` });
          console.error('[studio-agent]', err);
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
    console.error('[studio-agent/route]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
