/**
 * Freeform 3D agent — drives the kid-style Three.js scene (prefabs),
 * NOT an iframe game. Takes the user message + current freeform3d scene
 * snapshot + active prefab style, and streams back structured mutation
 * actions the client applies through `useFreeform3D`.
 *
 * Why a dedicated route (vs reusing /api/studio-agent):
 * the legacy studio-agent targets scene-store (free parts) and
 * building-store (grid tiles) — a completely different vocabulary. The
 * freeform3d world speaks in prefab kinds (house, tree-oak, character)
 * with per-instance color/props. Forking is cheaper than parameterizing
 * every line of the legacy prompt.
 *
 * Output contract from Claude CLI is line-delimited:
 *   ACTION: {"type":"addPrefab", "kind":"house", "position":[0,0,-5]}
 *   ACTION: {"type":"updatePrefab", "id":"o_abc", "color":"#ff0000"}
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
import {
  getPrefabsForStyle,
  PREFAB_STYLES,
  type PrefabStyleId,
  type PrefabDef,
} from '@/lib/kid-style-3d/prefabs';

// --- Scene snapshot (matches what ChatPanel ships for freeform3d) ---

interface Freeform3DSnapshot {
  /** Currently-active kit — the agent is only allowed to use prefab
      kinds registered under this style. */
  activeStyle: PrefabStyleId;
  /** Existing objects so the agent can reference them for updates/removes. */
  objects: Array<{
    id: string;
    kind: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color?: string;
    props?: Record<string, unknown>;
  }>;
}

function cliEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
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

// --- Prompt composition ------------------------------------------------

function catalog(prefabs: PrefabDef[]): string {
  const byCategory = new Map<string, PrefabDef[]>();
  for (const p of prefabs) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category)!.push(p);
  }
  const order = ['primitives', 'nature', 'buildings', 'characters'] as const;
  return order
    .filter((cat) => byCategory.has(cat))
    .map((cat) => {
      const items = byCategory.get(cat)!;
      const lines = items.map((p) => {
        const propHint =
          p.props && p.props.length
            ? ` (props: ${p.props.map((pr) => pr.key).join(', ')})`
            : '';
        return `    - ${p.kind}  — ${p.label}, default color ${p.defaultColor}${propHint}`;
      });
      return `  ${cat}:\n${lines.join('\n')}`;
    })
    .join('\n');
}

function styleDescription(style: PrefabStyleId): string {
  const entry = PREFAB_STYLES.find((s) => s.id === style);
  return entry ? `${entry.label} — ${entry.desc}` : style;
}

const FREEFORM3D_PROMPT = (
  userMsg: string,
  scene: Freeform3DSnapshot,
  conversation: { role: string; content: string }[],
  prefabs: PrefabDef[],
) => {
  const history = conversation
    .slice(0, -1)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const objectsDump = scene.objects.length
    ? scene.objects
        .map(
          (o) =>
            `  id=${o.id} kind=${o.kind} pos=(${o.position.join(',')}) color=${o.color ?? '-'}`,
        )
        .join('\n')
    : '  (scene is empty)';

  return `You are the Playdemy 3D Freeform agent. You build kid-style Three.js
scenes by emitting ACTION lines that add/edit/remove prefabs. You do NOT
write HTML, you do NOT run code — your output mutates the live scene.

${history ? `Previous conversation:\n${history}\n\n` : ''}Current user message: "${userMsg}"

## Current scene (active style: ${styleDescription(scene.activeStyle)})

Objects:
${objectsDump}

## Available prefab kinds — USE EXACTLY THESE strings for "kind"

${catalog(prefabs)}

## Output format

Every mutation is ONE LINE starting with "ACTION: " followed by a single JSON
object. Narration text can appear between ACTION lines; keep it short.

### Add a prefab

  {"type":"addPrefab","kind":"house","position":[0,0,-5]}
  {"type":"addPrefab","kind":"tree-oak","position":[7,0,3],"rotation":[0,1.2,0],"scale":[1,1,1],"color":"#6fbf7a"}
  {"type":"addPrefab","kind":"house","position":[0,0,-5],"props":{"roofColor":"#cc4444","doorColor":"#3a1e12"}}

    — kind MUST be one of the ids in the catalog above. Do NOT invent ids.
    — position/rotation/scale are [x,y,z] arrays. y=0 is the ground plane.
    — rotation is radians (Euler XYZ). Omit to keep defaults.
    — scale defaults to [1,1,1]. Typical range 0.5 – 3.
    — color is a CSS hex string; most prefabs tint their "primary" surface.
    — props lets you override per-prefab colors/lengths; only send props
      documented in the catalog above (e.g. house: roofColor, doorColor,
      trimColor, foundationColor; fence: length).

### Update an existing prefab

  {"type":"updatePrefab","id":"o_abc12345","color":"#ff0000"}
  {"type":"updatePrefab","id":"o_abc12345","position":[4,0,2],"rotation":[0,1.57,0]}

    — id MUST come from the scene dump above. Do NOT invent ids.
    — omit fields you don't want to change.

### Remove

  {"type":"removePrefab","id":"o_abc12345"}
  {"type":"clearScene"}
    — clearScene removes EVERY object. Use sparingly (e.g. "start over").

## World scale — match the user's ask

There is NO hard bound on coordinates. The ground plane is effectively
infinite; camera can pan anywhere. Pick the world size from the user's
wording, then commit to it:

  - "small plot / yard / garden"        → ~20×20, 15–30 objects
  - "farm / village / town"              → ~60×60, 60–120 objects
  - "open world / huge map / big world" → ~200×200, 200–500 objects,
                                          multiple biomes / districts
  - "city"                              → ~150×150, dense buildings
                                          in a grid with roads

When the user says "open world", "huge", "big", "whole map", or similar,
DO NOT cap at ±15 or ±30. Spread objects across HUNDREDS of units on
x/z and emit MANY ACTION lines — an "open world" that shows 12 prefabs
is a failure, not a success. Err on the side of too many.

Keep emitting addPrefab lines until the ask is fulfilled; the client
applies each action as it streams, so long outputs show a world filling
in live. Do not truncate the list for brevity — list every prefab.

## Composition tips (to produce worlds that read well)

- Think in a top-down grid before placing. Sketch districts in your
  head: residential cluster here, forest patch there, lake / clearing
  elsewhere. Don't place at random across the whole bound.
- Trees/rocks cluster in groups of 3-8 with small random jitter. Don't
  line them up. For large worlds, build multiple clusters.
- For a forest belt: 20-60 trees across a strip (e.g. x: -80..80, z:
  60..90), mixing oak and pine, with occasional bushes + flowers.
- For a village: 3-8 houses roughly along a "main street", each with
  its own small plot (fence, mailbox, a tree or two, flowers).
- Paths made of stepping stones — 10-30 stones spaced ~2u apart.
- One character per scene unless the user asks for more — the Play mode
  follows the first character it finds.
- Flowers in small patches of 3-6 near doors and paths.
- Clouds float at y=8 to 12; use scale 1.5-3 for variety. Scatter across
  the whole world's xz extent (not just above the centerpiece).
- Buildings face the main view — default rotation is fine; rotate by
  π/2 (1.5708), π (3.1416), or −π/2 (−1.5708) for street alignment.

## Rules

- Output ACTION lines with valid JSON only — no comments, no trailing commas.
- Use ONLY prefab kinds from the catalog above for the ACTIVE style.
- For references to existing prefabs, ALWAYS use id from the scene dump.
- If the user asks to "clear" or "start over", emit clearScene before
  any new additions.
- Keep narration to one or two short sentences; the user mostly wants
  the world to change.
- DO NOT summarize coordinates back at the user — just emit the ACTIONs.

Now respond to the user message with narration + ACTION lines.`;
};

// --- Action streaming parser ------------------------------------------

interface Emit {
  (data: Record<string, unknown>): void;
}

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

// --- SSE helpers ------------------------------------------------------

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

// --- Route ------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { messages, scene } = (await req.json()) as {
      messages: { role: string; content: string }[];
      scene: Freeform3DSnapshot;
    };
    const encoder = new TextEncoder();
    const userMsg = messages[messages.length - 1]?.content || '';
    const prefabs = getPrefabsForStyle(scene.activeStyle);

    const readable = new ReadableStream({
      async start(controller) {
        const emit = makeEmitter(controller, encoder);
        try {
          emit({
            status: `🧠 Planning in ${styleDescription(scene.activeStyle)}...`,
          });
          const parser = createActionParser(emit);
          await streamClaude(
            FREEFORM3D_PROMPT(userMsg, scene, messages, prefabs),
            (text) => parser.push(text),
          );
          parser.flush();
          emit({ status: '✅ Done' });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          emit({ status: `❌ Error: ${msg}` });
          console.error('[freeform3d-agent]', err);
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
    console.error('[freeform3d-agent/route]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
