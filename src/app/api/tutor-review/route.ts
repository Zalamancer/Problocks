import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// POST /api/tutor-review — vision-grading hook for the homework
// whiteboard. Body:
//   {
//     image: data URL (image/png),
//     microPrompt: string,         // the question they were answering
//     partText?: string,           // the parent part's full text (extra context)
//     hint?: string,               // any hint shown beneath the prompt
//   }
//
// Returns { text } — a short tutor-style review (≤3 sentences) the
// caller drops into the right-rail tutor chat.

interface Body {
  image?: unknown;
  microPrompt?: unknown;
  partText?: unknown;
  hint?: unknown;
}

const SYSTEM = `You are a friendly physics tutor reviewing a student's
hand-drawn answer. Read what they drew (arrows, labels, diagrams,
handwriting). Decide whether it answers the question. Give brief,
specific feedback in 1–3 sentences:
- Praise what they got right.
- Gently flag what is missing, mislabeled, or pointing the wrong way.
- No lecturing. No re-stating the question.
End with one short next-step suggestion only if something is wrong.`;

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const image = typeof body.image === 'string' ? body.image : null;
  const microPrompt =
    typeof body.microPrompt === 'string' ? body.microPrompt : null;
  if (!image || !microPrompt) {
    return NextResponse.json(
      { error: 'image and microPrompt required' },
      { status: 400 },
    );
  }
  const partText = typeof body.partText === 'string' ? body.partText : '';
  const hint = typeof body.hint === 'string' ? body.hint : '';

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'ANTHROPIC_API_KEY not set. Add it to .env.local and restart npm run dev.',
      },
      { status: 503 },
    );
  }

  // Pull the base64 + media type out of the data URL the client sends.
  const m = image.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) {
    return NextResponse.json(
      { error: 'image must be a data:image/png;base64,... URL' },
      { status: 400 },
    );
  }
  const mediaType = m[1];
  const data = m[2];
  if (mediaType !== 'image/png' && mediaType !== 'image/jpeg' && mediaType !== 'image/webp') {
    return NextResponse.json(
      { error: `unsupported image media type ${mediaType}` },
      { status: 400 },
    );
  }

  const anthropic = new Anthropic({ apiKey });
  try {
    const resp = await anthropic.messages.create({
      // Sonnet 4.5 is the cheapest current Sonnet that supports vision
      // well enough for handwriting + diagrams. Bump if quality slips.
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/png' | 'image/jpeg' | 'image/webp',
                data,
              },
            },
            {
              type: 'text',
              text: [
                partText ? `Part of the assignment:\n${partText}` : null,
                `Question being answered:\n${microPrompt}`,
                hint ? `Hint shown to the student:\n${hint}` : null,
                'Review the student\'s drawing in the image above.',
              ]
                .filter(Boolean)
                .join('\n\n'),
            },
          ],
        },
      ],
    });

    const text = resp.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
