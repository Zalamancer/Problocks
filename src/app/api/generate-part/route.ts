/**
 * Generate a low-poly primitive-composition 3D model.
 *
 * Input:  { userPrompt: string, feedback?: string, parentModel?: PartModel }
 * Output: { model: PartModel, expandedPrompt, category, vertexCount }
 *
 * Uses the local Claude CLI so there's no API key required — the user's
 * own Claude subscription is the auth boundary. Output is JSON only,
 * strictly validated against parsePartModel so bad responses can't poison
 * the renderer.
 */
import { spawn } from 'child_process';
import { homedir } from 'os';
import { NextResponse } from 'next/server';
import {
  parsePartModel,
  vertexCountFor,
  type PartModel,
} from '@/lib/part-studio/types';

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

function callClaude(prompt: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let text = '';
    const child = spawn(
      'claude',
      ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions'],
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
        } catch {
          /* skip non-JSON lines */
        }
      }
    });

    child.stderr.on('data', () => {
      /* silent — Claude CLI emits progress to stderr */
    });

    child.on('close', (code: number | null) => {
      if (code === 0 || text) resolve(text);
      else reject(new Error(`claude CLI exited ${code}`));
    });

    child.on('error', reject);
  });
}

// ── Prompt expansion ──────────────────────────────────────────────────────

const CATEGORIES = ['character', 'creature', 'weapon', 'building', 'prop', 'vegetation', 'vehicle'] as const;
type Category = (typeof CATEGORIES)[number];

function inferCategory(prompt: string): Category {
  const p = prompt.toLowerCase();
  if (/\b(sword|axe|bow|spear|staff|shield|hammer|dagger|gun)\b/.test(p)) return 'weapon';
  if (/\b(tree|bush|flower|plant|grass|mushroom)\b/.test(p)) return 'vegetation';
  if (/\b(car|truck|boat|ship|cart|wagon|plane|bike)\b/.test(p)) return 'vehicle';
  if (/\b(house|tower|castle|hut|tent|wall|bridge|barn)\b/.test(p)) return 'building';
  if (/\b(dragon|slime|wolf|cow|sheep|horse|bird|fish|spider)\b/.test(p)) return 'creature';
  if (/\b(knight|wizard|king|mage|soldier|villager|robot|ninja|hero)\b/.test(p)) return 'character';
  return 'prop';
}

const SYSTEM_RULES = `You are a Roblox-style low-poly 3D asset generator. Output ONE JSON object only — no prose, no markdown fences.

SCHEMA:
{
  "name": string,
  "parts": Primitive[]
}
Primitive:
{
  "shape": "box" | "cylinder" | "sphere" | "wedge",
  "pos":   [x,y,z]     // metres; y=0 is the ground
  "size":  [x,y,z]     // see per-shape meaning below
  "color": "#rrggbb",
  "rot":   [x,y,z]     // degrees, optional
}

SHAPE SEMANTICS:
- box:      size = full [width, height, depth]
- cylinder: size = [radius, height, radius]  (both radii must match)
- sphere:   size = [radius, radius, radius]  (all three equal)
- wedge:    size = [width, height, depth]; hypotenuse slopes from front-bottom to back-top

HARD RULES:
- Max 12 primitives per asset (vertex budget ≈ 100).
- Centre the asset at x=0, z=0. Feet/base should rest at y=0.
- Use flat, saturated colours (no gradients, no textures).
- Output ONLY the JSON object. No \`\`\` fences. No commentary.`;

function buildExpansion(
  userPrompt: string,
  category: Category,
  feedback: string | null,
  parentModel: PartModel | null,
  phraseHints: string[],
): string {
  const catHints: Record<Category, string> = {
    character:  'Target 8–12 primitives. Torso (box) + head (sphere or box) + two arms (cylinder or box) + two legs (cylinder or box). Add 1–3 accent pieces (hat, weapon, belt).',
    creature:   'Target 6–12 primitives. Body + head + 2–4 legs + optional tail/wings. Exaggerate silhouette features.',
    weapon:     'Target 3–6 primitives. Handle + guard/collar + blade/head. Keep proportions chunky so the piece reads at a distance.',
    building:   'Target 6–12 primitives. Base/floor + 2–4 walls + roof (wedge). Add 1–2 window/door detail boxes.',
    prop:       'Target 3–8 primitives. Simple, iconic shape. Think of a game asset a child could draw.',
    vegetation: 'Target 3–6 primitives. Trunk (cylinder) + leaf canopy (1–4 spheres or boxes). For flowers, stem + bloom.',
    vehicle:    'Target 6–10 primitives. Chassis + cabin + 2–4 wheels (cylinders rotated 90° on z).',
  };

  const lines = [
    SYSTEM_RULES,
    '',
    `CATEGORY: ${category}`,
    `GUIDANCE: ${catHints[category]}`,
  ];

  // Learning signal: phrases that correlated with high user ratings get
  // injected as soft style cues. We don't force Claude to use them, but
  // surfacing them biases the aesthetic toward what the user actually
  // liked on past generations.
  if (phraseHints.length > 0) {
    lines.push('');
    lines.push(
      `STYLE HINTS (phrasing that rated well on past generations — draw inspiration only if it fits): ${phraseHints.join(', ')}`,
    );
  }

  lines.push('');
  lines.push(`USER REQUEST: ${userPrompt}`);

  if (feedback && parentModel) {
    lines.push('');
    lines.push('REVISION NOTES — the previous attempt was rated low. Fix these issues:');
    lines.push(feedback);
    lines.push('');
    lines.push('Previous attempt (for reference, rebuild it applying the fixes):');
    lines.push(JSON.stringify(parentModel));
  }

  lines.push('');
  lines.push('Return the JSON object now.');
  return lines.join('\n');
}

// ── JSON extraction ───────────────────────────────────────────────────────

/**
 * Pull the first top-level JSON object out of Claude's response. Handles:
 * - Raw JSON (ideal)
 * - ```json ... ``` fences (common even when told not to)
 * - Leading/trailing narration
 */
function extractJson(text: string): string | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();

  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// ── Route ─────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const b = (body ?? {}) as {
    userPrompt?: unknown;
    feedback?: unknown;
    parentModel?: unknown;
    phraseHints?: unknown;
  };

  const userPrompt =
    typeof b.userPrompt === 'string' ? b.userPrompt.trim() : '';
  if (!userPrompt) {
    return NextResponse.json({ error: 'missing-userPrompt' }, { status: 400 });
  }

  const feedback = typeof b.feedback === 'string' && b.feedback.trim() ? b.feedback.trim() : null;
  const parentModel = parsePartModel(b.parentModel);

  // Phrase hints arrive client-side from part-studio-store's phraseStats,
  // already filtered/ranked. Cap to avoid pushing a huge context if a
  // user has hundreds of high-rated generations.
  const phraseHints = Array.isArray(b.phraseHints)
    ? (b.phraseHints as unknown[])
        .filter((x): x is string => typeof x === 'string' && x.length > 0)
        .slice(0, 8)
    : [];

  const category = inferCategory(userPrompt);
  const expandedPrompt = buildExpansion(userPrompt, category, feedback, parentModel, phraseHints);

  let raw: string;
  try {
    raw = await callClaude(expandedPrompt);
  } catch (e) {
    return NextResponse.json(
      { error: 'claude-cli-failed', detail: (e as Error).message },
      { status: 500 },
    );
  }

  const jsonText = extractJson(raw);
  if (!jsonText) {
    return NextResponse.json(
      { error: 'no-json-in-response', raw: raw.slice(0, 400) },
      { status: 502 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    return NextResponse.json(
      {
        error: 'json-parse-failed',
        detail: (e as Error).message,
        jsonText: jsonText.slice(0, 400),
      },
      { status: 502 },
    );
  }

  const model = parsePartModel(parsed);
  if (!model) {
    return NextResponse.json(
      { error: 'schema-invalid', jsonText: jsonText.slice(0, 400) },
      { status: 502 },
    );
  }

  const vertexCount = vertexCountFor(model);
  return NextResponse.json({
    model,
    expandedPrompt,
    category,
    vertexCount,
  });
}
