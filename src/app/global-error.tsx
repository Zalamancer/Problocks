'use client';

// Last-resort error boundary. Catches errors thrown during the root
// layout render (so error.tsx can't help — the tree it lives in isn't
// up yet). Must supply its own <html>/<body> because it replaces the
// layout entirely.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 14,
            background: '#fff7e6',
            color: '#1d1a14',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 56 }}>⚠️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
            Problocks hit a problem
          </h1>
          <p style={{ fontSize: 14, color: '#6a6458', maxWidth: 460, margin: 0, lineHeight: 1.55 }}>
            We&apos;ll be back shortly. If this persists, email{' '}
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
                background: '#1d1a14', color: '#fff',
                border: '1.5px solid #1d1a14',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: '10px 18px', borderRadius: 999,
                background: '#fff', color: '#1d1a14',
                border: '1.5px solid #e5dfd2',
                fontSize: 13, fontWeight: 700, textDecoration: 'none',
              }}
            >
              Back home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
