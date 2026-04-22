import Link from 'next/link';

export default function NotFound() {
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
      <div style={{ fontSize: 56 }}>🧭</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
        Lost your way?
      </h1>
      <p style={{ fontSize: 14, color: 'var(--pb-ink-muted, #6a6458)', maxWidth: 420, margin: 0, lineHeight: 1.55 }}>
        We can&apos;t find that page. The link may be wrong, the page might be
        for someone else, or it might have moved.
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            padding: '10px 18px', borderRadius: 999,
            background: 'var(--pb-ink, #1d1a14)',
            color: 'var(--pb-paper, #fff)',
            border: '1.5px solid var(--pb-ink, #1d1a14)',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          Back home
        </Link>
        <Link
          href="/marketplace"
          style={{
            padding: '10px 18px', borderRadius: 999,
            background: 'var(--pb-paper, #fff)',
            color: 'var(--pb-ink, #1d1a14)',
            border: '1.5px solid var(--pb-line-2, #e5dfd2)',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          Browse games
        </Link>
      </div>
    </main>
  );
}
