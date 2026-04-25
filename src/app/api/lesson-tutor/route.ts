import { spawn } from 'child_process';
import { homedir } from 'os';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const USE_CLI = !process.env.ANTHROPIC_API_KEY;

type Ctx = {
  prompt?: string;
  answer?: string;
  explanation?: string;
  source?: string;
  subject?: string;
  grade?: string;
};

type ChatMsg = { role: 'user' | 'assistant'; content: string };

function systemPrompt(ctx: Ctx): string {
  return [
    'You are a warm, concise tutor inside Playdemy, a K-12 learning app.',
    'A student is working on a practice question. Answer their question in 1-3 short sentences.',
    'Never reveal the final answer unless they explicitly ask for it. Guide them to think, not solve for them.',
    'Match the tone to the grade level. For K-5 use simple words. For high school be precise.',
    '',
    'Current question context:',
    ctx.subject && ctx.grade ? `  Subject/Grade: ${ctx.subject} · ${ctx.grade}` : '',
    ctx.prompt ? `  Question: ${ctx.prompt}` : '',
    ctx.answer ? `  Correct answer (you know; student doesn't): ${ctx.answer}` : '',
    ctx.explanation ? `  Reference explanation: ${ctx.explanation}` : '',
    ctx.source ? `  Source: ${ctx.source}` : '',
  ].filter(Boolean).join('\n');
}

async function handleWithAPI(sys: string, messages: ChatMsg[]): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: sys,
    messages,
  });
  const block = res.content.find((b) => b.type === 'text');
  return block && block.type === 'text' ? block.text : '';
}

function handleWithCLI(sys: string, messages: ChatMsg[]): Promise<string> {
  const convo = messages
    .map((m) => (m.role === 'user' ? `Student: ${m.content}` : `Tutor: ${m.content}`))
    .join('\n\n');
  const prompt = `${sys}\n\n---\n\n${convo}\n\nTutor:`;

  return new Promise<string>((resolve, reject) => {
    const child = spawn(
      'claude',
      ['-p', prompt, '--output-format', 'text', '--dangerously-skip-permissions'],
      {
        env: {
          ...process.env,
          HOME: process.env.HOME || homedir(),
          PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
          USER: process.env.USER || '',
          SHELL: process.env.SHELL || '/bin/zsh',
          TERM: 'xterm-256color',
        },
      },
    );
    let out = '';
    let err = '';
    child.stdout.on('data', (c: Buffer) => { out += c.toString(); });
    child.stderr.on('data', (c: Buffer) => { err += c.toString(); });
    child.on('close', () => {
      const text = out.trim();
      if (text) resolve(text);
      else reject(new Error(err.trim() || 'Claude CLI returned no output'));
    });
    child.on('error', reject);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ctx: Ctx = body?.context ?? {};
    const messages: ChatMsg[] = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'messages must end with a user turn' }, { status: 400 });
    }
    const sys = systemPrompt(ctx);
    const text = USE_CLI
      ? await handleWithCLI(sys, messages)
      : await handleWithAPI(sys, messages);
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
