import Link from 'next/link';
import { DataRequestForm } from './DataRequestForm';

export const metadata = {
  title: 'Data request',
  description: 'Request deletion, export, or correction of a child\'s Playdemy data.',
};

export default function DataRequestPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px 20px 80px',
        background: 'var(--pb-cream, #fff7e6)',
        color: 'var(--pb-ink, #1d1a14)',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link
          href="/privacy"
          style={{
            fontSize: 12.5, fontWeight: 700,
            color: 'var(--pb-ink-muted, #6a6458)',
            textDecoration: 'none',
          }}
        >
          ← Privacy overview
        </Link>

        <h1 style={{ fontSize: 30, fontWeight: 800, margin: '14px 0 6px', lineHeight: 1.15 }}>
          Request your child&apos;s data
        </h1>
        <p style={{ fontSize: 14, color: 'var(--pb-ink-muted, #6a6458)', margin: '0 0 20px', lineHeight: 1.5 }}>
          Parents, guardians, school administrators, or the student themselves
          can ask us to delete, export, opt-out, or correct a student&apos;s
          data. We&apos;ll reply within 10 business days (often much sooner).
          Required by COPPA and FERPA.
        </p>

        <DataRequestForm />

        <p style={{
          fontSize: 12, color: 'var(--pb-ink-muted, #6a6458)',
          lineHeight: 1.6, marginTop: 24,
          padding: 16, borderRadius: 12,
          background: 'var(--pb-paper, #fff)',
          border: '1.5px solid var(--pb-line-2, #e5dfd2)',
        }}>
          <strong style={{ color: 'var(--pb-ink, #1d1a14)' }}>Why we ask for an email:</strong>{' '}
          We may need to verify that you&apos;re the student, their parent, or
          their school before we can act on a deletion or export request.
          If you&apos;d rather email us directly, write to{' '}
          <a href="mailto:tryproblocks@gmail.com" style={{ color: 'var(--pb-ink, #1d1a14)', fontWeight: 700 }}>
            tryproblocks@gmail.com
          </a>.
        </p>
      </div>
    </main>
  );
}
