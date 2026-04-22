import Link from 'next/link';

export default function PlayNotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 24,
        color: 'var(--pb-ink, #eee)',
        background: 'var(--pb-bg, #0b0b0c)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 48 }}>🎮</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Game not found</h1>
      <p style={{ maxWidth: 420, color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
        This game is private, was deleted, or the link is wrong. Ask the
        creator for a fresh link.
      </p>
      <Link
        href="/marketplace"
        style={{
          marginTop: 6,
          padding: '10px 18px',
          borderRadius: 999,
          background: 'var(--pb-paper, #fff)',
          color: 'var(--pb-ink, #111)',
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Browse public games
      </Link>
    </div>
  );
}
