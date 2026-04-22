// Minimal transactional email helper backed by Resend's REST API.
// Deliberately avoids the resend-node SDK so we don't add another
// dependency for a handful of fetch calls.
//
// Env: RESEND_API_KEY (from https://resend.com → API Keys)
//      EMAIL_FROM     (e.g. "Playdemy <noreply@playdemy.app>")
//
// When either env var is missing the helper silently logs and returns a
// "skipped" result so dev flows don't blow up. Production MUST set both.

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(`[email] skipped — RESEND_API_KEY or EMAIL_FROM not set (subject: "${input.subject}")`);
    return { ok: true, skipped: true };
  }

  const body = {
    from,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    text: input.text,
    html: input.html,
    reply_to: input.replyTo,
  };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[email] Resend ${res.status}:`, errText.slice(0, 400));
      return { ok: false, error: `Resend returned ${res.status}` };
    }

    const json = await res.json() as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    console.error('[email] network error:', err);
    return { ok: false, error: (err as Error).message };
  }
}

/** Compose the auto-ack email for a data_request transition. Pass
 *  `downloadUrl` when the fulfilled export is ready so the parent can
 *  retrieve it without a second email. URL is expected to expire within
 *  a few days; we mention that in the body. */
export function dataRequestEmail(
  request: {
    id: string;
    kind: 'delete' | 'export' | 'opt-out' | 'correction';
    requester_email: string;
    requester_name: string | null;
    student_name: string | null;
  },
  status: 'in_progress' | 'fulfilled' | 'denied',
  downloadUrl?: string
): SendEmailInput {
  const who = request.requester_name ? `Hi ${request.requester_name},` : 'Hello,';
  const studentPart = request.student_name ? ` for ${request.student_name}` : '';
  const kindLabel =
    request.kind === 'delete' ? 'deletion'
    : request.kind === 'export' ? 'data export'
    : request.kind === 'opt-out' ? 'opt-out'
    : 'correction';

  const statusLine =
    status === 'in_progress'
      ? `We've started working on your ${kindLabel} request${studentPart}. We'll email again when it's done (within 10 business days).`
      : status === 'fulfilled'
        ? `Your ${kindLabel} request${studentPart} has been completed.`
        : `We're unable to act on your ${kindLabel} request${studentPart} as filed. Please reply to this email with more details and we'll take another look.`;

  // For fulfilled export requests we embed a signed download URL in the
  // email body. The link expires in 7 days — mention that so the
  // recipient doesn't sit on it.
  const followup =
    request.kind === 'export' && status === 'fulfilled' && downloadUrl
      ? `\n\nDownload your data here (link expires in 7 days):\n${downloadUrl}`
      : request.kind === 'export' && status === 'fulfilled'
        ? `\n\nWe'll send the export data in a separate email shortly.`
        : '';

  const text = `${who}

${statusLine}${followup}

If you didn't file this request, please reply immediately so we can investigate.

Reference: ${request.id}

— The Playdemy team`;

  return {
    to: request.requester_email,
    subject: `Your Playdemy ${kindLabel} request — ${status.replace('_', ' ')}`,
    text,
    replyTo: process.env.EMAIL_REPLY_TO,
  };
}
