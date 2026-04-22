import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTeacherSession, isPlatformAdmin } from '@/lib/teacher-auth';
import { TeachersList } from './TeachersList';

export const metadata = {
  title: 'Teachers — Admin',
  description: 'Grant or revoke the admin role on platform staff.',
};

export default async function TeachersAdminPage() {
  const session = await getTeacherSession();
  if (!session?.user) {
    redirect('/classroom/auth?callbackUrl=/admin/teachers');
  }
  if (!(await isPlatformAdmin())) {
    return (
      <main style={pageStyleCentered}>
        <div style={forbiddenCard}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Admins only</h1>
          <p style={{ fontSize: 14, color: 'var(--pb-ink-muted, #6a6458)', margin: '0 0 12px' }}>
            Signed in as {session.user?.email ?? 'unknown'}. This page is for
            Problocks platform staff.
          </p>
          <Link href="/teacher" style={{ color: 'inherit', fontWeight: 700, fontSize: 13 }}>
            ← Teacher home
          </Link>
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
              Teachers
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--pb-ink-muted, #6a6458)', marginTop: 4 }}>
              Promote or demote platform staff. Admin role unlocks
              <code> /admin/*</code> surfaces.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/data-requests" style={navLinkStyle}>Data requests</Link>
            <Link href="/teacher" style={navLinkStyle}>Teacher home</Link>
          </div>
        </header>
        <TeachersList />
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

const pageStyleCentered: React.CSSProperties = {
  ...pageStyle,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const forbiddenCard: React.CSSProperties = {
  maxWidth: 420, padding: 28, borderRadius: 16,
  background: 'var(--pb-paper, #fff)',
  border: '1.5px solid var(--pb-line-2, #e5dfd2)',
  textAlign: 'center',
};

const navLinkStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)',
  textDecoration: 'none', padding: '8px 14px',
  borderRadius: 10, background: 'var(--pb-paper)',
  border: '1.5px solid var(--pb-line-2)',
};
