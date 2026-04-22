import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTeacherSession, isPlatformAdmin } from '@/lib/teacher-auth';
import { StatusView } from './StatusView';

export const metadata = {
  title: 'Status — Admin',
  description: 'Service health, queue depths, and retention signals.',
};

export default async function StatusPage() {
  const session = await getTeacherSession();
  if (!session?.user) {
    redirect('/classroom/auth?callbackUrl=/admin/status');
  }
  if (!(await isPlatformAdmin())) {
    return (
      <main style={pageCentered}>
        <div style={forbiddenCard}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Admins only</h1>
          <p style={{ fontSize: 14, color: 'var(--pb-ink-muted, #6a6458)', margin: 0 }}>
            Signed in as {session.user?.email ?? 'unknown'}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>Status</h1>
            <p style={{ fontSize: 13.5, color: 'var(--pb-ink-muted, #6a6458)', marginTop: 4 }}>
              Service health, queue depths, and retention signals.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/teachers" style={navLink}>Teachers</Link>
            <Link href="/admin/data-requests" style={navLink}>Data requests</Link>
            <Link href="/admin/audit-log" style={navLink}>Audit log</Link>
          </div>
        </header>
        <StatusView />
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  padding: '28px 20px 40px',
  background: 'var(--pb-cream, #fff7e6)',
  color: 'var(--pb-ink, #1d1a14)',
  fontFamily: 'inherit',
};
const pageCentered: React.CSSProperties = { ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const forbiddenCard: React.CSSProperties = {
  maxWidth: 420, padding: 28, borderRadius: 16,
  background: 'var(--pb-paper, #fff)',
  border: '1.5px solid var(--pb-line-2, #e5dfd2)',
  textAlign: 'center',
};
const navLink: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)',
  textDecoration: 'none', padding: '8px 14px',
  borderRadius: 10, background: 'var(--pb-paper)',
  border: '1.5px solid var(--pb-line-2)',
};
