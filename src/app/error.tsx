'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Route-level error boundary. Catches render errors in the Next App
// Router tree, including async Server Component errors. `reset` clears
// the error and re-renders the route — useful for transient network
// failures. `digest` is Next's opaque server error id we can quote to
// support.

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[route-error]', error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 14,
        background: 'var(--pb-cream, #fff7e6)',
        color: 'var(--pb-ink, #1d1a14)',
        fontFamily: 'inherit',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 56 }}>⚠️</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
        Something went sideways
      </h1>
      <p style={{ fontSize: 14, color: 'var(--pb-ink-muted, #6a6458)', maxWidth: 460, margin: 0, lineHeight: 1.55 }}>
        We hit an unexpected error loading this page. Try again in a moment.
        If it keeps happening, tell your teacher or email{' '}
        <a href="mailto:tryproblocks@gmail.com" style={{ color: 'inherit', fontWeight: 700 }}>
          tryproblocks@gmail.com
        </a>
        {error.digest && ` and quote reference ${error.digest.slice(0, 10)}`}.
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '10px 18px', borderRadius: 999,
            background: 'var(--pb-ink, #1d1a14)',
            color: 'var(--pb-paper, #fff)',
            border: '1.5px solid var(--pb-ink, #1d1a14)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: '10px 18px', borderRadius: 999,
            background: 'var(--pb-paper, #fff)',
            color: 'var(--pb-ink, #1d1a14)',
            border: '1.5px solid var(--pb-line-2, #e5dfd2)',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
