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
import { PIECES } from '@/lib/building-kit';
import type { PieceKind } from '@/lib/building-kit';

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
  floors: string[];   // "x,y,z"
  walls: string[];    // "x,y,z,dir"
  roofs: string[];    // "x,y,z"
  corners: string[];  // "x,y,z"
  stairs: string[];   // "x,y,z,facing"
  gridSize: number;
  selectedPiece: Record<PieceKind, string>;
  /** User-enabled imported GLB model names (from /assets/medieval/). */
  libraryAssets?: string[];
}

// --- Asset catalog (served to the model so it can pick real piece ids) ---

function catalogByKind(): string {
  const order: PieceKind[] = [
    'floor',
    'wall',
    'wall-window',
    'wall-door',
    'roof',
    'roof-corner',
    'corner',
    'stairs',
  ];
  return order
    .map((kind) => {
      const list = PIECES.filter((p) => p.kind === kind)
        .map((p) => `    - ${p.id}  (${p.label})`)
        .join('\n');
      return `  ${kind}:\n${list}`;
    })
    .join('\n');
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

  const dump = (label: string, arr: string[]) =>
    arr.length
      ? `  ${label}: ${arr.slice(0, 40).join(', ')}${arr.length > 40 ? `, +${arr.length - 40} more` : ''}`
      : `  ${label}: (none)`;

  const selected = Object.entries(scene.selectedPiece)
    .map(([k, v]) => `    ${k} = ${v}`)
    .join('\n');

  const lib = scene.libraryAssets ?? [];
  const librarySection = lib.length
    ? `## User's imported model library (AI-enabled GLB models)

These are the ONLY custom 3D models the user has enabled for you. Use them
by emitting addPart with partType:"GLB" and modelName set to EXACTLY one
of these names (no path, no extension):

${lib.map((n) => `  - ${n}`).join('\n')}

Prefer these imported models over generic Block/Sphere parts when the user
asks for something that matches (e.g. a cart → Prop_Wagon, a fence →
Prop_WoodenFence_*). Combine multiple to build scenes.
`
    : `## User's imported model library

The user has not enabled any imported GLB models for AI use. Do NOT invent
GLB modelName values — only create parts with partType "Block" | "Sphere"
| "Cylinder" | "Wedge", or place building tiles from the piece catalog
below. If the user wants a custom model, tell them to open the + palette
drop-up → Library tab and enable the assets they want.
`;

  return `You are the Problocks Studio Agent. You edit a 3D scene directly —
you do NOT write HTML or build a standalone game. Your output is a sequence
of ACTION lines that mutate the live scene.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current user message: "${userMsg}"

## Current scene

Parts:
${partsDump}

Building tiles (grid coords, tile size = ${scene.gridSize}m, y = level index):
${dump('floors', scene.floors)}
${dump('walls', scene.walls)}
${dump('roofs', scene.roofs)}
${dump('corners', scene.corners)}
${dump('stairs', scene.stairs)}

Currently selected piece per kind (used when an action omits "asset"):
${selected}

${librarySection}
## Available piece ids (use EXACTLY these strings for "asset")

${catalogByKind()}

## Output format

Every mutation is ONE LINE starting with "ACTION: " followed by a single JSON
object. Narration text can appear between ACTION lines; keep it short.

### Free-form parts (scene-store)

  {"type":"addPart","name":"Tower","partType":"Block","position":{"x":0,"y":0.5,"z":0},"scale":{"x":1,"y":1,"z":1},"color":"#ff4444"}
    — partType: "Block" | "Sphere" | "Cylinder" | "Wedge" | "GLB"
    — for partType:"GLB" add "modelName":"<exact library name from the section above>"
      color is ignored for GLBs. Example:
      {"type":"addPart","partType":"GLB","modelName":"Prop_Wagon","position":{"x":4,"y":0,"z":2}}

  {"type":"updatePart","id":"<existing-id>","color":"#00ff00","position":{"x":2,"y":0.5,"z":0}}
  {"type":"removePart","id":"<existing-id>"}
  {"type":"clearParts"}

### Grid building (building-store)

All placements take integer grid coords (x, z) and optional y level (default 0).
"asset" is optional; if omitted the currently-selected piece of that kind is used.

  {"type":"placeFloor","x":0,"z":0,"y":0,"asset":"floor.wood_dark"}
  {"type":"eraseFloor","x":0,"z":0,"y":0}

  {"type":"placeWall","x":0,"z":0,"y":0,"dir":"N","kind":"wall","asset":"wall.brick_red"}
    — dir: "N" (north edge) or "E" (east edge)
    — kind: "wall" | "wall-window" | "wall-door" (default "wall")
    — asset MUST match the chosen kind

  {"type":"eraseWall","x":0,"z":0,"y":0,"dir":"N"}

  {"type":"placeRoof","x":0,"z":0,"y":1,"asset":"roof.gable_x"}
  {"type":"eraseRoof","x":0,"z":0,"y":1}

  {"type":"placeCorner","x":0,"z":0,"y":0,"kind":"corner","asset":"cnr.doric_round"}
    — kind: "corner" | "roof-corner" (default "corner")
    — corners sit at TILE VERTICES, so x/z range is 0..gridExtent inclusive

  {"type":"eraseCorner","x":0,"z":0,"y":0}

  {"type":"placeStairs","x":0,"z":0,"y":0,"facing":"N","asset":"stairs.straight_wood"}
    — facing: "N" | "S" | "E" | "W"

  {"type":"eraseStairs","x":0,"z":0,"y":0,"facing":"N"}

  {"type":"clearBuilding"}
    — removes ALL floors/walls/roofs/corners/stairs at every level

### Selecting the default piece (used when a later placement omits "asset")

  {"type":"setSelectedPiece","kind":"floor","asset":"floor.grass"}
    — kind is any PieceKind above; asset must belong to that kind.

Legacy aliases (still supported):
  {"type":"setFloorAsset","asset":"floor.wood_dark"}  → setSelectedPiece kind=floor
  {"type":"setWallAsset","asset":"wall.brick_red"}    → setSelectedPiece kind=wall

## Rules

- Output ACTION lines with valid JSON only — no comments, no trailing commas.
- Use ONLY asset ids from the catalog above. Never invent new ids.
- Match asset to kind: a "wall-window" action must use a "wallwin.*" id, a
  "wall-door" action must use a "walldoor.*" id, roofs use "roof.*", etc.
- Units: parts use meters for position; building uses integer grid indices.
- Building a room: place floors first, then walls on the boundary edges
  (N edges on the north side, E edges on the east side of the row), then
  roofs one level up (y=1), then corners at the 4 outer vertices.
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
