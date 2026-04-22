// POST /api/starter-units/draft
//   body: { subject: string, grade: string, description: string }
//   → { units: StarterUnitDraft[] }  (3 drafts)
//
// Uses the Claude CLI (no ANTHROPIC_API_KEY needed — matches /api/agent and
// /api/studio-agent). We ask for 3 options in one call so the teacher can
// compare, and we cap the output shape so it can be rendered directly as
// StepUnit cards without post-processing.
//
// This replaces the hardcoded STARTER_UNITS array that used to live in
// StepUnit.tsx. First-time teachers for a given (subject, grade) draft
// their own; subsequent teachers see accepted drafts via /api/starter-units.

import { spawn } from 'child_process';
import { homedir } from 'os';
import { NextResponse } from 'next/server';

// Keep in sync with the Icon primitive and the tone palette used by StepUnit.
const ALLOWED_TONES = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'] as const;
const ALLOWED_ICONS = [
  'coin', 'book', 'spark', 'cube', 'star', 'heart', 'bolt', 'compass',
  'music', 'image', 'mic', 'gamepad', 'code', 'wand', 'smile',
] as const;

export type StarterUnitDraft = {
  title: string;
  weeks: string;
  blurb: string;
  bullets: string[];
  tone: (typeof ALLOWED_TONES)[number];
  icon: (typeof ALLOWED_ICONS)[number];
};

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
          if (p.type === 'result' && p.result && !text) text = p.result;
        } catch { /* skip */ }
      }
    });
    child.on('close', () => resolve(text));
    child.on('error', reject);
  });
}

// Strip ```json fences and recover the first top-level JSON array/object.
function extractJSON(text: string): unknown {
  const stripped = text.replace(/```(?:json)?/gi, '').trim();
  // Find the first [ or { and the last matching ] or }
  const arrStart = stripped.indexOf('[');
  const arrEnd = stripped.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd > arrStart) {
    try { return JSON.parse(stripped.slice(arrStart, arrEnd + 1)); } catch {}
  }
  const objStart = stripped.indexOf('{');
  const objEnd = stripped.lastIndexOf('}');
  if (objStart !== -1 && objEnd > objStart) {
    try { return JSON.parse(stripped.slice(objStart, objEnd + 1)); } catch {}
  }
  throw new Error('Could not parse JSON from model output');
}

function clamp(s: unknown, max: number): string {
  return String(s ?? '').slice(0, max);
}

function sanitizeDraft(raw: unknown): StarterUnitDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const title = clamp(r.title, 60);
  const blurb = clamp(r.blurb, 280);
  const weeks = clamp(r.weeks, 24) || '3 weeks';
  if (!title || !blurb) return null;
  const bulletsRaw = Array.isArray(r.bullets) ? r.bullets : [];
  const bullets = bulletsRaw.slice(0, 3).map((b) => clamp(b, 40)).filter(Boolean);
  if (bullets.length < 2) return null;
  const tone = (ALLOWED_TONES as readonly string[]).includes(String(r.tone))
    ? (r.tone as StarterUnitDraft['tone'])
    : ALLOWED_TONES[Math.floor(Math.random() * ALLOWED_TONES.length)];
  const icon = (ALLOWED_ICONS as readonly string[]).includes(String(r.icon))
    ? (r.icon as StarterUnitDraft['icon'])
    : 'spark';
  return { title, weeks, blurb, bullets, tone, icon };
}

const PROMPT = (subject: string, grade: string, description: string) => `You help teachers spin up a short playable learning unit for their classroom.
Return ONLY a JSON array of THREE distinct unit drafts — no prose, no markdown fences.

Context:
- Subject: ${subject}
- Grade: ${grade}
- What the teacher wants: ${description || '(not specified — pick a broadly useful unit for this subject and grade)'}

Each draft must be a JSON object with EXACTLY these keys:
- "title":   string, 2–4 words, catchy, no quotes in the value
- "weeks":   string like "3 weeks" / "4 weeks" / "2 weeks"
- "blurb":   1–2 sentences (under 180 chars) describing what students build/do
- "bullets": array of exactly 3 short strings (under 32 chars each) — concrete skills or milestones
- "tone":    one of: "butter", "mint", "coral", "sky", "grape", "pink"  (use a DIFFERENT tone for each of the 3 drafts)
- "icon":    one of: "coin", "book", "spark", "cube", "star", "heart", "bolt", "compass", "music", "image", "mic", "gamepad", "code", "wand", "smile"

Make the three drafts genuinely different angles on the topic (e.g. a game-based one, a simulation/sandbox one, and a project/storytelling one) — not slight rewordings of the same idea.

Respond with ONLY the JSON array. Example shape (do not copy the content):
[
  {"title":"…","weeks":"3 weeks","blurb":"…","bullets":["…","…","…"],"tone":"butter","icon":"coin"},
  {"title":"…","weeks":"4 weeks","blurb":"…","bullets":["…","…","…"],"tone":"mint","icon":"spark"},
  {"title":"…","weeks":"2 weeks","blurb":"…","bullets":["…","…","…"],"tone":"coral","icon":"book"}
]`;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { subject?: string; grade?: string; description?: string }
      | null;
    if (!body?.subject || !body?.grade) {
      return NextResponse.json({ error: 'subject and grade required' }, { status: 400 });
    }
    const description = (body.description ?? '').slice(0, 500);

    const text = await callClaude(PROMPT(body.subject, body.grade, description));
    const parsed = extractJSON(text);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    const units = arr
      .map(sanitizeDraft)
      .filter((u): u is StarterUnitDraft => u !== null)
      .slice(0, 3);

    if (!units.length) {
      return NextResponse.json(
        { error: 'Model returned no usable drafts', raw: text.slice(0, 500) },
        { status: 502 },
      );
    }
    return NextResponse.json({ units });
  } catch (err) {
    console.error('[starter-units/draft]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
