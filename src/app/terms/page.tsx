// Terms of service — drafted for OAuth consent-screen branding + basic
// user agreement. Not legal advice; have counsel review before scaling.

import Link from 'next/link';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'ProBlocks — Terms of Service',
  description: 'The rules for using ProBlocks as a teacher, student, or creator.',
};

const UPDATED = 'April 20, 2026';

export default function TermsPage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 120px', lineHeight: 1.6 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--pbs-ink-muted)' }}>← Back to ProBlocks</Link>

          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 20 }}>
            Terms of <span className="pbs-serif" style={{ fontStyle: 'italic' }}>Service</span>
          </h1>
          <p className="pbs-mono" style={{ fontSize: 12, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Last updated · {UPDATED}
          </p>

          <Section title="Acceptance">
            <p>
              By signing in to ProBlocks you agree to these Terms and our{' '}
              <Link href="/privacy">Privacy Policy</Link>. If you&rsquo;re using ProBlocks on behalf
              of a school or district, you represent that you&rsquo;re authorised to do so.
            </p>
          </Section>

          <Section title="Who can use ProBlocks">
            <ul>
              <li>Teachers, administrators, and students whose teacher has set up a class.</li>
              <li>Independent creators publishing games to the marketplace.</li>
              <li>Users under 13 must be invited by a teacher operating under COPPA&rsquo;s school-authorised provisions.</li>
            </ul>
          </Section>

          <Section title="Your account">
            <p>
              You&rsquo;re responsible for keeping your Google account secure and for
              activity that happens under your account. Don&rsquo;t share credentials or
              let other people use your account.
            </p>
          </Section>

          <Section title="Student content & classroom use">
            <p>
              Games, quizzes, and other content you create belong to you. You grant
              ProBlocks a limited licence to host, display, and distribute that content
              on the platform so other users in your class or the marketplace can play
              it. You can remove your content at any time.
            </p>
            <p>
              Teachers control what content students can see in their class. ProBlocks
              moderates marketplace uploads for safety and educational fit.
            </p>
          </Section>

          <Section title="Acceptable use">
            <ul>
              <li>No harassment, hate speech, sexual content, or content that targets a specific student.</li>
              <li>No attempts to reverse-engineer the service, abuse rate limits, or bypass authentication.</li>
              <li>No scraping rosters or exporting student data outside legitimate classroom use.</li>
              <li>Follow your school&rsquo;s AUP in addition to these Terms.</li>
            </ul>
          </Section>

          <Section title="AI outputs">
            <p>
              ProBlocks uses AI models to help you generate games, assets, and lessons.
              AI output may be inaccurate, offensive, or derivative — review before
              sharing with students. You&rsquo;re responsible for how AI-generated content
              is used in your classroom.
            </p>
          </Section>

          <Section title="Payment & marketplace">
            <p>
              Free tiers may be subject to reasonable usage limits. Paid plans and
              marketplace payouts are governed by their respective order forms and
              Stripe&rsquo;s Connected Account Agreement. Fees and payout schedules are
              disclosed at checkout.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              You may delete your account any time. We may suspend or terminate accounts
              that violate these Terms or that pose a safety or security risk. On
              termination, we delete account data per our{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </Section>

          <Section title="Disclaimers">
            <p>
              ProBlocks is provided &ldquo;as is&rdquo; without warranties. We don&rsquo;t promise the
              service will be error-free or meet every educational requirement. To the
              maximum extent permitted by law, our liability is limited to the fees
              paid in the 12 months before a claim arose.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We may update these Terms. If we do, we&rsquo;ll post the new version here and
              update the &ldquo;Last updated&rdquo; date. Continued use after changes means you
              accept them.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              ProBlocks · <a href="mailto:tryproblocks@gmail.com">tryproblocks@gmail.com</a>
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 10 }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, color: 'var(--pbs-ink-soft)' }}>{children}</div>
    </section>
  );
}
