import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTeacherSession, isPlatformAdmin } from '@/lib/teacher-auth';
import { DataRequestsQueue } from './DataRequestsQueue';

export const metadata = {
  title: 'Data requests — Admin',
  description: 'Review and resolve COPPA / FERPA data-subject requests.',
};

export default async function DataRequestsAdminPage() {
  const session = await getTeacherSession();
  if (!session?.user) {
    redirect('/classroom/auth?callbackUrl=/admin/data-requests');
  }
  if (!(await isPlatformAdmin())) {
    return (
      <main style={forbiddenStyle}>
        <div style={forbiddenCard}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Admins only</h1>
          <p style={{ fontSize: 14, color: 'var(--pb-ink-muted, #6a6458)', margin: '0 0 16px' }}>
            This dashboard is for Problocks platform staff. Your teacher
            account can still manage your own classes from{' '}
            <Link href="/teacher" style={{ color: 'inherit', fontWeight: 700 }}>/teacher</Link>.
          </p>
          <p style={{ fontSize: 12, color: 'var(--pb-ink-muted, #6a6458)', margin: 0 }}>
            Signed in as {session.user?.email ?? 'unknown'}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              Data requests
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--pb-ink-muted, #6a6458)', marginTop: 4 }}>
              COPPA / FERPA deletion, export, opt-out, and correction requests
              filed via <code>/privacy/data-request</code>.
            </p>
          </div>
          <Link
            href="/teacher"
            style={{
              fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)',
              textDecoration: 'none', padding: '8px 14px',
              borderRadius: 10, background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-line-2)',
            }}
          >
            ← Teacher home
          </Link>
        </header>
        <DataRequestsQueue />
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '28px 20px 40px',
  background: 'var(--pb-cream, #fff7e6)',
  color: 'var(--pb-ink, #1d1a14)',
  fontFamily: 'inherit',
};

const forbiddenStyle: React.CSSProperties = {
  ...pageStyle,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const forbiddenCard: React.CSSProperties = {
  maxWidth: 420,
  padding: 28,
  borderRadius: 16,
  background: 'var(--pb-paper, #fff)',
  border: '1.5px solid var(--pb-line-2, #e5dfd2)',
  textAlign: 'center',
};
