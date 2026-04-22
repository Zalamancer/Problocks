'use client';

import { useEffect, useState, useCallback } from 'react';
import { Flag } from 'lucide-react';

// Small flag button in the /play header that opens a modal for filing a
// report. Kept intentionally discreet (icon + tiny label on desktop) so it
// doesn't invite pranks, but visible enough that a kid who's genuinely
// uncomfortable can find it.

type Reason = 'inappropriate' | 'scary' | 'broken' | 'copy' | 'other';

const REASON_LABELS: { id: Reason; label: string; description: string }[] = [
  { id: 'inappropriate', label: 'Mean or rude',     description: 'Name-calling, bullying, hate, unsafe language.' },
  { id: 'scary',         label: 'Too scary',         description: 'Violence, gore, or content meant to frighten younger players.' },
  { id: 'broken',        label: "Doesn't work",      description: "Game is broken, crashes, or doesn't load." },
  { id: 'copy',          label: 'Copy of something', description: 'Copied from another game or site without permission.' },
  { id: 'other',         label: 'Something else',    description: 'Tell us what feels off.' },
];

export function ReportButton({ gameId }: { gameId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const reset = useCallback(() => {
    setOpen(false);
    // Let the closing animation finish before clearing form state so users
    // don't see a flash.
    setTimeout(() => {
      setReason(null);
      setDetails('');
      setSubmitted(false);
      setError(null);
      setSubmitting(false);
    }, 160);
  }, []);

  const submit = useCallback(async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/${gameId}/report`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason, details: details.trim() || undefined }),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? 'Could not file the report. Try again in a minute.');
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError((err as Error).message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  }, [gameId, reason, details, submitting]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report this game"
        title="Report this game"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 8,
          background: 'transparent',
          color: 'rgba(255,255,255,0.65)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Flag size={12} strokeWidth={2.2} />
        <span className="hidden sm:inline">Report</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 460,
              padding: 20,
              borderRadius: 18,
              background: 'var(--pb-paper, #fff)',
              color: 'var(--pb-ink, #111)',
              border: '1.5px solid var(--pb-ink, #111)',
              boxShadow: '0 8px 0 var(--pb-ink, #111), 0 18px 38px rgba(0,0,0,0.35)',
              fontFamily: 'inherit',
            }}
          >
            {submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 36 }}>🙏</div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Thanks for telling us</h2>
                <p style={{ fontSize: 13, color: 'var(--pb-ink-muted, #666)', margin: 0, maxWidth: 320 }}>
                  A teacher will review this game. You don&apos;t have to play it anymore.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    marginTop: 8,
                    padding: '10px 18px', borderRadius: 999,
                    background: 'var(--pb-ink, #111)',
                    color: 'var(--pb-paper, #fff)',
                    border: '1.5px solid var(--pb-ink, #111)',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 id="report-title" style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Report this game</h2>
                <p style={{ fontSize: 12.5, color: 'var(--pb-ink-muted, #666)', margin: '0 0 14px' }}>
                  Your teacher will see this. Pick the closest fit.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {REASON_LABELS.map((r) => {
                    const active = reason === r.id;
                    return (
                      <label
                        key={r.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '10px 12px', borderRadius: 12,
                          background: active ? 'var(--pb-cream-2, #fff5df)' : 'var(--pb-paper, #fff)',
                          border: `1.5px solid ${active ? 'var(--pb-ink, #111)' : 'var(--pb-line-2, #e5dfd2)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.id}
                          checked={active}
                          onChange={() => setReason(r.id)}
                          style={{ marginTop: 2 }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--pb-ink-muted, #666)', marginTop: 2 }}>{r.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--pb-ink-muted, #666)', marginBottom: 4 }}>
                  Anything else? (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
                  rows={3}
                  placeholder="You can leave this blank."
                  style={{
                    width: '100%', resize: 'vertical',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1.5px solid var(--pb-line-2, #e5dfd2)',
                    background: 'var(--pb-paper, #fff)',
                    color: 'var(--pb-ink, #111)',
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />

                {error && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--pb-coral-ink, #a03a2e)' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={reset}
                    disabled={submitting}
                    style={{
                      padding: '10px 16px', borderRadius: 12,
                      background: 'var(--pb-paper, #fff)',
                      color: 'var(--pb-ink, #111)',
                      border: '1.5px solid var(--pb-line-2, #e5dfd2)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!reason || submitting}
                    style={{
                      padding: '10px 16px', borderRadius: 12,
                      background: reason ? 'var(--pb-ink, #111)' : 'var(--pb-ink-muted, #888)',
                      color: 'var(--pb-paper, #fff)',
                      border: `1.5px solid ${reason ? 'var(--pb-ink, #111)' : 'var(--pb-ink-muted, #888)'}`,
                      fontSize: 13, fontWeight: 700,
                      cursor: !reason || submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {submitting ? 'Sending…' : 'Send report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
