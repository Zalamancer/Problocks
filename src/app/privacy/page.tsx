// Privacy policy — drafted to satisfy Google OAuth consent-screen branding
// requirements and basic FERPA/COPPA expectations for an ed-tech product.
// Not legal advice — review and customise with counsel before scaling.

import Link from 'next/link';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'Playdemy — Privacy Policy',
  description: 'How Playdemy collects, uses, and protects the data of teachers and students.',
};

const UPDATED = 'April 20, 2026';

export default function PrivacyPage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 120px', lineHeight: 1.6 }}>
          <Link href="/" style={{ fontSize: 13, color: 'var(--pbs-ink-muted)' }}>← Back to Playdemy</Link>

          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 20 }}>
            Privacy <span className="pbs-serif" style={{ fontStyle: 'italic' }}>Policy</span>
          </h1>
          <p className="pbs-mono" style={{ fontSize: 12, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Last updated · {UPDATED}
          </p>

          <Section title="Who we are">
            <p>
              Playdemy (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an AI-powered game-creation platform
              for classrooms. This policy describes what we collect, why we collect it,
              and what rights you have. Questions go to{' '}
              <a href="mailto:tryproblocks@gmail.com">tryproblocks@gmail.com</a>.
            </p>
          </Section>

          <Section title="What we collect">
            <ul>
              <li><strong>Account info:</strong> name, email address, profile photo, and a stable Google user ID (<code>sub</code>) when you sign in with Google.</li>
              <li><strong>Classroom data:</strong> when a teacher connects Google Classroom, we read course names, assignments, announcements, topics, and student submissions / grades that the teacher already has access to. We do <em>not</em> request the Classroom roster scope; students enrol into Playdemy by signing in themselves.</li>
              <li><strong>Student-generated content:</strong> games, quizzes, and prompts students create on the platform, plus play history.</li>
              <li><strong>Basic analytics:</strong> page views and performance metrics; no advertising or third-party ad trackers.</li>
            </ul>
          </Section>

          <Section title="How we use it">
            <ul>
              <li>Run the service (render classes, save games, sync grades).</li>
              <li>Authenticate you via Google OAuth — we never see your Google password.</li>
              <li>Associate Classroom submissions with the student who created them, using the Google <code>sub</code> / <code>userId</code> match.</li>
              <li>Improve the product (error logs, aggregate usage counts).</li>
            </ul>
            <p>We <strong>do not</strong> sell personal data, show third-party ads, or use student data to train third-party AI models.</p>
          </Section>

          <Section title="Google API data — limited use">
            <p>
              Playdemy&rsquo; use and transfer of information received from Google APIs adheres
              to the{' '}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
                Google API Services User Data Policy
              </a>, including the Limited Use requirements. Specifically:
            </p>
            <ul>
              <li>We only use Google user data to provide user-facing features of Playdemy.</li>
              <li>We do not transfer data except as needed to operate the service, comply with law, or if the user expressly authorises it.</li>
              <li>We do not use the data for advertising.</li>
              <li>We do not allow humans to read the data, except (a) with the user&rsquo;s consent, (b) for security or abuse investigation, or (c) to comply with applicable law.</li>
            </ul>
          </Section>

          <Section title="Children & students (FERPA / COPPA)">
            <p>
              Playdemy is designed for classroom use. When a teacher invites a class,
              the teacher (or school) acts as the educational agent and consents to
              the collection of student data on behalf of parents, consistent with
              FERPA&rsquo;s &ldquo;school official&rdquo; exception and COPPA&rsquo;s school-authorised
              service provisions. We do not use student personal information to create
              user profiles for advertising or to sell to third parties.
            </p>
            <p>
              Parents and eligible students may request access to, correction of, or
              deletion of student records by emailing{' '}
              <a href="mailto:tryproblocks@gmail.com">tryproblocks@gmail.com</a>.
            </p>
          </Section>

          <Section title="Where data is stored">
            <p>
              Data lives in Supabase (US regions, Postgres + Storage) and is served via
              Vercel. Backups rotate every 7 days. Transport is TLS; authentication uses
              NextAuth + Google OAuth.
            </p>
          </Section>

          <Section title="Retention & deletion">
            <p>
              We retain account data while your account is active. You can delete your
              account at any time from Settings, which removes your name, email, and
              profile photo from our database within 30 days. Anonymised usage metrics
              may be retained longer.
            </p>
          </Section>

          <Section title="Your rights">
            <ul>
              <li>Revoke Google access at{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">myaccount.google.com/permissions</a>.
              </li>
              <li>Request a copy or deletion of your data via email.</li>
              <li>Opt out of non-essential analytics from Settings.</li>
            </ul>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We&rsquo;ll post any material changes here and update the &ldquo;Last updated&rdquo; date.
              For major changes we&rsquo;ll also email the teacher contact on record.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Playdemy · <a href="mailto:tryproblocks@gmail.com">tryproblocks@gmail.com</a>
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
