// Post-setup share screen — renders after a class is persisted.
// Reads ?classId=… from the URL, fetches the class via /api/classes/:classId,
// and shows a copy-able /join/:classId URL + Classroom announcement template.
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chunky, Icon } from '@/components/landing/pb-site/primitives';
import { SetupNav } from './SetupNav';

type PublicClass = {
  id: string;
  name: string;
  subject?: string | null;
  grade?: string | null;
};

export const ShareScreen = () => {
  const search = useSearchParams();
  const classId = search.get('classId') ?? '';
  // Roster import result is passed through from openRoom() as query params so
  // we can show "N students pre-loaded from Classroom" without needing a
  // second API round-trip. Gracefully handles the non-Classroom flow by just
  // being falsy.
  const importedRaw = search.get('imported');
  const importedStudents = importedRaw ? Number.parseInt(importedRaw, 10) : null;
  const importError = search.get('importError');
  const [cls, setCls] = useState<PublicClass | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'link' | 'announcement' | null>(null);

  useEffect(() => {
    if (!classId) {
      setError('Missing classId');
      return;
    }
    let cancelled = false;
    fetch(`/api/classes/${classId}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (cancelled) return;
        if (!ok) {
          setError(j?.error ?? 'Could not load class');
          return;
        }
        setCls(j.class);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Fetch failed');
      });
    return () => { cancelled = true; };
  }, [classId]);

  // Build the join URL relative to the current origin so it works on localhost
  // dev and playdemy.app alike.
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const joinUrl = classId ? `${origin}/join/${classId}` : '';

  const announcement = cls
    ? `Hi class! 👋 We're using Playdemy for ${cls.name}.\n\nTap this link and sign in with your school Google account to join:\n${joinUrl}\n\nOnce you're in, all our assignments and grades will sync back here.`
    : '';

  const copy = async (text: string, key: 'link' | 'announcement') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Swallow — browsers without clipboard perms will just see nothing happen.
    }
  };

  return (
    <>
      <SetupNav/>
      <main className="pbs-wrap" style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 80px', marginTop: 24 }}>
        {/* Success banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '20px 22px',
          background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
          border: '1.5px solid var(--pbs-ink)', borderRadius: 20,
          boxShadow: '0 4px 0 #000, 0 20px 40px -22px rgba(0,0,0,0.45)',
          marginBottom: 28,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
            border: '1.5px solid var(--pbs-mint-ink)',
            boxShadow: '0 3px 0 var(--pbs-mint-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="sparkle" size={22} stroke={2.2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {cls ? <>&ldquo;{cls.name}&rdquo; is ready.</> : error ? 'Hmm — something went wrong' : 'Creating your room…'}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 3 }}>
              {cls
                ? 'Share the link below so students can sign in themselves. Their Google profile + email will auto-populate your roster.'
                : error ?? 'One sec…'}
            </div>
          </div>
        </div>

        {error && !cls && (
          <div style={{
            padding: 16, borderRadius: 14,
            background: 'var(--pbs-coral)',
            border: '1.5px solid var(--pbs-coral-ink)',
            color: 'var(--pbs-coral-ink)', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Roster-import status. Only renders when the class was linked to a
            Google Classroom course during setup (openRoom passes through
            `imported` and/or `importError` as query params). Shown above
            the join-link card so the teacher sees it as the first result
            after "Open the classroom". */}
        {cls && importedStudents !== null && importedStudents > 0 && (
          <section style={{
            padding: '16px 18px',
            background: 'var(--pbs-mint)',
            border: '1.5px solid var(--pbs-mint-ink)',
            boxShadow: '0 3px 0 var(--pbs-mint-ink)',
            borderRadius: 18, marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 14,
            color: 'var(--pbs-mint-ink)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--pbs-paper)', color: 'var(--pbs-mint-ink)',
              border: '1.5px solid var(--pbs-mint-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="users" size={16} stroke={2.4}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em' }}>
                {importedStudents} student{importedStudents === 1 ? '' : 's'} pre-loaded from Google Classroom.
              </div>
              <div style={{ fontSize: 12.5, marginTop: 2, opacity: 0.85 }}>
                They&apos;ll still sign in once with their school Google to claim their seat — their name &amp; photo are already waiting.
              </div>
            </div>
          </section>
        )}
        {cls && importError && (
          <section style={{
            padding: '14px 16px',
            background: 'var(--pbs-coral)',
            border: '1.5px solid var(--pbs-coral-ink)',
            borderRadius: 16, marginBottom: 20,
            color: 'var(--pbs-coral-ink)', fontSize: 13, lineHeight: 1.5,
          }}>
            <strong>Couldn&apos;t import the Classroom roster:</strong> {importError}
            <br/>
            Students can still join through the link below — this just means they weren&apos;t pre-loaded.
          </section>
        )}

        {cls && (
          <>
            {/* Join link card */}
            <section style={{
              padding: '24px 24px',
              background: 'var(--pbs-butter)',
              border: '1.5px solid var(--pbs-butter-ink)',
              boxShadow: '0 4px 0 var(--pbs-butter-ink)',
              borderRadius: 20, marginBottom: 20,
            }}>
              <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-butter-ink)', opacity: 0.72, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Student join link
              </div>
              <div className="pbs-mono" style={{
                marginTop: 10, padding: '14px 16px',
                background: 'var(--pbs-paper)', color: 'var(--pbs-ink)',
                border: '1.5px solid var(--pbs-line-2)', borderRadius: 12,
                fontSize: 15, letterSpacing: '0.01em',
                wordBreak: 'break-all',
              }}>
                {joinUrl}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <Chunky
                  tone="ink"
                  icon={copied === 'link' ? 'check' : undefined}
                  onClick={() => copy(joinUrl, 'link')}
                >
                  {copied === 'link' ? 'Copied!' : 'Copy link'}
                </Chunky>
                <Chunky tone="ghost" icon="arrow-up-right" as="a" href={joinUrl}>
                  Preview join page
                </Chunky>
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--pbs-butter-ink)', opacity: 0.82, lineHeight: 1.5 }}>
                Each student signs in with their school Google account the first time. We only
                read their name, email, and profile photo — <strong>your school&apos;s roster
                is never touched</strong>.
              </p>
            </section>

            {/* Classroom announcement template */}
            <section style={{
              padding: '22px 22px',
              background: 'var(--pbs-paper)',
              border: '1.5px solid var(--pbs-line-2)',
              borderRadius: 20, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
                  border: '1.5px solid var(--pbs-mint-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="book" size={16} stroke={2.2}/>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Post to Google Classroom
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--pbs-ink-muted)' }}>
                    Paste this as an announcement in your class stream.
                  </div>
                </div>
              </div>

              <pre
                style={{
                  margin: 0, padding: '14px 16px',
                  background: 'var(--pbs-cream-2)',
                  border: '1.5px solid var(--pbs-line-2)',
                  borderRadius: 12,
                  fontSize: 13.5, lineHeight: 1.55,
                  color: 'var(--pbs-ink)',
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
{announcement}
              </pre>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <Chunky
                  tone="ink"
                  icon={copied === 'announcement' ? 'check' : undefined}
                  onClick={() => copy(announcement, 'announcement')}
                >
                  {copied === 'announcement' ? 'Copied!' : 'Copy announcement'}
                </Chunky>
              </div>
            </section>

            {/* Next step */}
            <section style={{
              padding: '22px 22px',
              background: 'var(--pbs-cream-2)',
              border: '1.5px dashed var(--pbs-line-2)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: 240, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  Head to your dashboard
                </div>
                <div style={{ fontSize: 13, color: 'var(--pbs-ink-soft)', marginTop: 2, lineHeight: 1.5 }}>
                  You&apos;ll see students appear here as they click the link and sign in.
                </div>
              </div>
              <Chunky tone="butter" trailing="arrow-right" as="a" href={`/teacher?classId=${cls.id}`}>
                Open teacher dashboard
              </Chunky>
            </section>
          </>
        )}
      </main>
    </>
  );
};
