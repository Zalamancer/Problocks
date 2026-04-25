import { NextRequest, NextResponse } from 'next/server';

// POST /api/tutor-review — vision-grading hook for the homework
// whiteboard, backed by Google Gemini (cheap multimodal). Body:
//   {
//     image: data URL (image/png),
//     microPrompt: string,         // the question they were answering
//     partText?: string,           // the parent part's full text
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

// Flash Lite for speed; vision quality on Lite is enough for the
// short "did they label this correctly?" review we ask for here.
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

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

  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY ?? '';
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'GEMINI_API_KEY not set. Add it to .env.local (https://aistudio.google.com/apikey) and restart npm run dev.',
      },
      { status: 503 },
    );
  }

  // Pull base64 + media type out of the data URL the client sends.
  const m = image.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) {
    return NextResponse.json(
      { error: 'image must be a data:image/png;base64,... URL' },
      { status: 400 },
    );
  }
  const mediaType = m[1];
  const data = m[2];
  if (
    mediaType !== 'image/png' &&
    mediaType !== 'image/jpeg' &&
    mediaType !== 'image/webp'
  ) {
    return NextResponse.json(
      { error: `unsupported image media type ${mediaType}` },
      { status: 400 },
    );
  }

  const userText = [
    partText ? `Part of the assignment:\n${partText}` : null,
    `Question being answered:\n${microPrompt}`,
    hint ? `Hint shown to the student:\n${hint}` : null,
    "Review the student's drawing in the image above.",
  ]
    .filter(Boolean)
    .join('\n\n');

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Header auth keeps the key out of URL logs.
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        // Gemini's `systemInstruction` keeps the role prompt out of the
        // turn body so we can vary the user content without rewriting
        // the persona every call.
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: mediaType, data } },
              { text: userText },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 220,
          // Slight creativity, not 0 — tutor responses sound stiff at 0.
          temperature: 0.4,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json(
        { error: `Gemini ${res.status}: ${errBody.slice(0, 400)}` },
        { status: 502 },
      );
    }

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
      promptFeedback?: { blockReason?: string };
    };

    if (json.promptFeedback?.blockReason) {
      return NextResponse.json(
        {
          text: `Gemini declined to review: ${json.promptFeedback.blockReason}.`,
        },
      );
    }

    const text =
      json.candidates
        ?.flatMap((c) => c.content?.parts ?? [])
        .map((p) => p.text ?? '')
        .join('')
        .trim() || '';

    if (!text) {
      return NextResponse.json(
        { error: 'Gemini returned no text', detail: json },
        { status: 502 },
      );
    }
    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
