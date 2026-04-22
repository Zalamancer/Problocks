import { ModerationQueue } from './ModerationQueue';

export const metadata = {
  title: 'Moderation queue',
  description: 'Review pending games and flagged content.',
};

export default function ModerationPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '28px 20px 40px',
        background: 'var(--pb-cream, #fff7e6)',
        color: 'var(--pb-ink, #1d1a14)',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              Moderation queue
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--pb-ink-muted, #6a6458)', marginTop: 4 }}>
              Approve student games before they appear in the marketplace, and review flagged content.
            </p>
          </div>
          <a
            href="/teacher"
            style={{
              fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)',
              textDecoration: 'none', padding: '8px 14px',
              borderRadius: 10, background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-line-2)',
            }}
          >
            ← Back to teacher
          </a>
        </header>

        <ModerationQueue />
      </div>
    </main>
  );
}
