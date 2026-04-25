import { NextRequest, NextResponse } from 'next/server';

// POST /api/tutor-help — multi-turn tutor chat with optional vision.
// Body:
//   {
//     image?: string,        // PNG data URL of the page-overlay scribbles
//     assignmentTitle?: string,
//     partLabel?: string,
//     partText?: string,
//     microPrompts?: string[],
//     message?: string,      // student's latest input ("" when triggered by Help me)
//     history?: Array<{ role: 'student' | 'tutor'; text: string }>,
//   }
//
// Returns { text } — a short, conversational tutor reply that
// (a) references the student's drawing if anything is visible,
// (b) refuses to give the answer outright,
// (c) ends with a clarifying question when the student seems stuck.

interface Body {
  image?: unknown;
  assignmentTitle?: unknown;
  partLabel?: unknown;
  partText?: unknown;
  microPrompts?: unknown;
  message?: unknown;
  history?: unknown;
}

const SYSTEM = `You are a friendly physics tutor helping a student
through a free-response question. The student may have written notes,
equations, or diagrams on a page-wide overlay; you can see those as
an image. They may also be currently focused on a specific part of
the assignment.

Style:
- Conversational and warm. 1–3 short sentences per reply.
- Don't give the answer outright. Ask one clarifying question that
  nudges them toward the next step.
- If the image shows their work, reference what you see ("I see you
  wrote 'mg sin θ' — what direction does that point?").
- If the image is blank or doesn't exist, ask what step they're stuck
  on instead.
- Match the student's level: they are working through AP Physics 1
  free-response, but encourage them gently rather than lecturing.`;

// Gemini 3.1 Flash Lite (preview) — same low-latency tier as 2.5
// Flash Lite but with a smarter base model. Override via
// GEMINI_MODEL in .env.local for testing other variants.
const DEFAULT_MODEL = 'gemini-3.1-flash-lite-preview';

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

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

  const image = typeof body.image === 'string' ? body.image : null;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const partLabel = typeof body.partLabel === 'string' ? body.partLabel : '';
  const partText = typeof body.partText === 'string' ? body.partText : '';
  const assignmentTitle =
    typeof body.assignmentTitle === 'string' ? body.assignmentTitle : '';
  const microPrompts = Array.isArray(body.microPrompts)
    ? body.microPrompts.filter((m): m is string => typeof m === 'string')
    : [];
  const history = Array.isArray(body.history)
    ? body.history.filter(
        (h): h is { role: 'student' | 'tutor'; text: string } =>
          h !== null &&
          typeof h === 'object' &&
          (h as { role?: string }).role !== undefined &&
          ((h as { role: string }).role === 'student' ||
            (h as { role: string }).role === 'tutor') &&
          typeof (h as { text?: unknown }).text === 'string',
      )
    : [];

  // Build Gemini contents array. Gemini wants alternating user/model
  // roles; map our 'tutor' to 'model' and 'student' to 'user'.
  type Part =
    | { text: string }
    | { inline_data: { mime_type: string; data: string } };
  const contents: Array<{ role: 'user' | 'model'; parts: Part[] }> = [];

  for (const h of history) {
    contents.push({
      role: h.role === 'tutor' ? 'model' : 'user',
      parts: [{ text: h.text }],
    });
  }

  // Final user turn: image (if any) + a context + question header.
  const finalParts: Part[] = [];
  if (image) {
    const m = image.match(/^data:([^;]+);base64,(.+)$/);
    if (m) {
      finalParts.push({
        inline_data: { mime_type: m[1], data: m[2] },
      });
    }
  }
  const contextLines = [
    assignmentTitle ? `Assignment: ${assignmentTitle}` : null,
    partLabel ? `Currently on: ${partLabel}` : null,
    partText ? `Question text:\n${partText}` : null,
    microPrompts.length > 0
      ? `Sub-steps shown:\n- ${microPrompts.join('\n- ')}`
      : null,
    image
      ? "The image above is the student's overlay annotations on the page."
      : 'The student has not drawn anything on the page yet.',
  ]
    .filter(Boolean)
    .join('\n\n');

  const studentText =
    message ||
    "Help me with this question. I'm not sure what to do next.";
  finalParts.push({ text: `${contextLines}\n\nStudent says: ${studentText}` });
  contents.push({ role: 'user', parts: finalParts });

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  // streamGenerateContent emits incremental SSE chunks; we relay the
  // text deltas to the client as a plain text/event-stream so the
  // tutor bubble fills in as Gemini types instead of waiting for the
  // whole response.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:streamGenerateContent?alt=sse`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: {
          maxOutputTokens: 180,
          temperature: 0.5,
        },
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errBody = await upstream.text();
      return NextResponse.json(
        { error: `Gemini ${upstream.status}: ${errBody.slice(0, 400)}` },
        { status: 502 },
      );
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buf = '';
        let emitted = 0;
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            // SSE events end at a blank line. Tolerate \r\n line
            // endings the Gemini gateway sometimes uses.
            const norm = buf.replace(/\r\n/g, '\n');
            let nl = norm.indexOf('\n\n');
            if (nl >= 0) buf = norm;
            while (nl >= 0) {
              const evt = buf.slice(0, nl);
              buf = buf.slice(nl + 2);
              for (const rawLine of evt.split('\n')) {
                if (!rawLine.startsWith('data:')) continue;
                const json = rawLine.replace(/^data:\s*/, '').trim();
                if (!json || json === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(json) as {
                    candidates?: Array<{
                      content?: { parts?: Array<{ text?: string }> };
                    }>;
                    promptFeedback?: { blockReason?: string };
                  };
                  if (parsed.promptFeedback?.blockReason) {
                    controller.enqueue(
                      encoder.encode(
                        `\n[blocked: ${parsed.promptFeedback.blockReason}]`,
                      ),
                    );
                    emitted += 1;
                    continue;
                  }
                  const chunk =
                    parsed.candidates
                      ?.flatMap((c) => c.content?.parts ?? [])
                      .map((p) => p.text ?? '')
                      .join('') ?? '';
                  if (chunk) {
                    controller.enqueue(encoder.encode(chunk));
                    emitted += 1;
                  }
                } catch {
                  /* ignore malformed event */
                }
              }
              nl = buf.indexOf('\n\n');
            }
          }
          if (emitted === 0) {
            controller.enqueue(
              encoder.encode('Hmm, the model returned nothing.'),
            );
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        // Disable buffering on Vercel/Cloudflare so chunks ship as
        // soon as they arrive.
        'cache-control': 'no-cache, no-transform',
        'x-accel-buffering': 'no',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
