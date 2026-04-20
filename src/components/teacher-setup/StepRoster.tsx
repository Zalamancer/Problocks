// Step 3: add students via paste / Google / Clever / Teams / join code / later.
// Ported from Claude Design bundle (pb_classroom_setup/step_roster.jsx).
'use client';

import React, { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Icon, Chunky } from '@/components/landing/pb-site/primitives';
import { Field, StepCard, StepHeader } from './form';
import type { SetupData, RosterMethod } from './types';
import { classroomFetch } from '@/lib/classroom-api';
import type {
  ListCoursesResponse,
  ListStudentsResponse,
  ClassroomCourse,
} from '@/lib/classroom-api';

export const ROSTER_METHODS: Array<{
  id: RosterMethod;
  icon: React.ComponentProps<typeof Icon>['name'];
  tone: 'butter' | 'mint' | 'sky' | 'grape' | 'coral' | 'pink';
  label: string;
  sub: string;
}> = [
  { id: 'paste',  icon: 'users',   tone: 'butter', label: 'Paste a list',        sub: 'CSV or one name per line.' },
  { id: 'google', icon: 'book',    tone: 'mint',   label: 'Google Classroom',    sub: 'Sync & stay in sync.' },
  { id: 'clever', icon: 'bolt',    tone: 'sky',    label: 'Clever',              sub: "Your district's roster." },
  { id: 'teams',  icon: 'cube',    tone: 'grape',  label: 'Microsoft Teams',     sub: 'EDU tenant required.' },
  { id: 'code',   icon: 'sparkle', tone: 'coral',  label: 'Share a join code',   sub: 'Kids type it on any device.' },
  { id: 'later',  icon: 'compass', tone: 'pink',   label: "I'll do this later",  sub: 'Open an empty room.' },
];

export function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s.slice(0, 3) + '-' + s.slice(3);
}

export const StepRoster = ({
  data, set,
}: {
  data: SetupData;
  set: <K extends keyof SetupData>(k: K, v: SetupData[K]) => void;
}) => {
  const method = data.rosterMethod;
  const names = data.pastedNames
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  const selectedMethod = ROSTER_METHODS.find((m) => m.id === method)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <StepHeader
        index={2}
        total={5}
        step={{
          title: <>Invite the <span className="pbs-serif">class.</span></>,
          sub: 'Roster the room now, or share a code and fill in as students arrive. Sync options keep the list fresh as kids are added or dropped.',
        }}
      />

      <StepCard>
        <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          Pick a way
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {ROSTER_METHODS.map((m) => {
            const sel = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => set('rosterMethod', m.id)}
                style={{
                  textAlign: 'left',
                  padding: 14,
                  background: sel ? `var(--pbs-${m.tone})` : 'var(--pbs-cream-2)',
                  color: sel ? `var(--pbs-${m.tone}-ink)` : 'var(--pbs-ink)',
                  border: `1.5px solid ${sel ? `var(--pbs-${m.tone}-ink)` : 'var(--pbs-line-2)'}`,
                  boxShadow: sel ? `0 3px 0 var(--pbs-${m.tone}-ink)` : 'none',
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'all 120ms',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  minHeight: 96,
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: sel ? 'rgba(255,255,255,0.4)' : `var(--pbs-${m.tone})`,
                  color: `var(--pbs-${m.tone}-ink)`,
                  border: `1.5px solid var(--pbs-${m.tone}-ink)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={m.icon} size={16} stroke={2.2}/>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{m.label}</div>
                <div style={{ fontSize: 12, color: sel ? 'inherit' : 'var(--pbs-ink-muted)', opacity: sel ? 0.85 : 1, lineHeight: 1.4 }}>{m.sub}</div>
              </button>
            );
          })}
        </div>
      </StepCard>

      {method === 'paste' && (
        <StepCard>
          <Field
            label="Paste names"
            hint={"One student per line — or comma-separated. We'll auto-generate handles."}
          >
            <textarea
              value={data.pastedNames}
              onChange={(e) => set('pastedNames', e.target.value)}
              placeholder={'Ava Patel\nKai Tanaka\nMira L.\nDev Shah\n…'}
              rows={7}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontFamily: 'DM Mono, ui-monospace, monospace',
                fontSize: 13, lineHeight: 1.55,
                color: 'var(--pbs-ink)',
                background: 'var(--pbs-paper)',
                border: '1.5px solid var(--pbs-line-2)',
                borderRadius: 12, resize: 'vertical', outline: 'none',
              }}
            />
          </Field>

          {names.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Preview · {names.length} student{names.length === 1 ? '' : 's'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {names.slice(0, 28).map((n, i) => {
                  const tones = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'] as const;
                  const t = tones[i % tones.length];
                  return (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px 4px 4px',
                      background: 'var(--pbs-paper)',
                      border: '1.5px solid var(--pbs-line-2)',
                      borderRadius: 999, fontSize: 12.5,
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 999,
                        background: `var(--pbs-${t})`, color: `var(--pbs-${t}-ink)`,
                        border: `1px solid var(--pbs-${t}-ink)`,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                      }}>{n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}</span>
                      {n}
                    </span>
                  );
                })}
                {names.length > 28 && (
                  <span className="pbs-mono" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--pbs-ink-muted)' }}>
                    +{names.length - 28} more
                  </span>
                )}
              </div>
            </div>
          )}
        </StepCard>
      )}

      {method === 'google' && (
        <GoogleClassroomConnect data={data} set={set} selectedMethod={selectedMethod}/>
      )}

      {(method === 'clever' || method === 'teams') && (
        <StepCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `var(--pbs-${selectedMethod.tone})`,
              border: `1.5px solid var(--pbs-${selectedMethod.tone}-ink)`,
              color: `var(--pbs-${selectedMethod.tone}-ink)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name={selectedMethod.icon} size={24} stroke={2}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
                Connect {selectedMethod.label}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.5, maxWidth: 440 }}>
                We&apos;ll open a pop-up to authorise. Your roster auto-syncs every morning, so add/drops are handled.
              </p>
            </div>
            <Chunky tone="ink" trailing="arrow-up-right">Connect</Chunky>
          </div>
        </StepCard>
      )}

      {method === 'code' && (
        <StepCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'center' }}>
            <div>
              <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Classroom join code
              </div>
              <div className="pbs-serif" style={{
                fontSize: 72, lineHeight: 1, letterSpacing: '0.02em',
                margin: '8px 0 10px', fontStyle: 'italic',
              }}>
                {data.joinCode}
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.5, maxWidth: 380 }}>
                Kids go to <span className="pbs-mono" style={{ color: 'var(--pbs-ink)', fontWeight: 600 }}>problocks.app/join</span> and type this code.
                Rotates at the end of each term.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Chunky tone="butter" icon="sparkle">Copy join link</Chunky>
                <button
                  type="button"
                  onClick={() => set('joinCode', randomCode())}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--pbs-paper)', color: 'var(--pbs-ink)',
                    border: '1.5px solid var(--pbs-line-2)', borderRadius: 12,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >Regenerate</button>
              </div>
            </div>

            {/* Poster mock — tilted paper for wall-display vibes */}
            <div style={{
              background: 'var(--pbs-cream-2)',
              border: '1.5px dashed var(--pbs-line-2)',
              borderRadius: 16, padding: 18,
              textAlign: 'center',
              transform: 'rotate(-1.5deg)',
            }}>
              <div className="pbs-mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)' }}>
                Tape me to the wall
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, margin: '8px 0 2px' }}>{data.className || 'Your classroom'}</div>
              <div className="pbs-serif" style={{ fontSize: 40, lineHeight: 1, fontStyle: 'italic', margin: '10px 0' }}>
                {data.joinCode}
              </div>
              <div style={{
                width: 100, height: 100, margin: '8px auto 0',
                background: 'var(--pbs-paper)',
                border: '1.5px solid var(--pbs-line-2)', borderRadius: 8,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 8,
                  backgroundImage: 'radial-gradient(var(--pbs-ink) 45%, transparent 46%)',
                  backgroundSize: '9px 9px',
                }}/>
                <div style={{ position: 'absolute', top: 8, left: 8, width: 24, height: 24, border: '4px solid var(--pbs-ink)', background: 'var(--pbs-paper)' }}/>
                <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, border: '4px solid var(--pbs-ink)', background: 'var(--pbs-paper)' }}/>
                <div style={{ position: 'absolute', bottom: 8, left: 8, width: 24, height: 24, border: '4px solid var(--pbs-ink)', background: 'var(--pbs-paper)' }}/>
              </div>
              <div className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-ink-muted)', marginTop: 8 }}>
                problocks.app/join
              </div>
            </div>
          </div>
        </StepCard>
      )}

      {/* method === 'later' */}
      {method === 'later' && (
        <StepCard style={{ textAlign: 'center', padding: 32 }}>
          <div style={{
            margin: '0 auto 10px',
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--pbs-pink)', color: 'var(--pbs-pink-ink)',
            border: '1.5px solid var(--pbs-pink-ink)',
            boxShadow: '0 3px 0 var(--pbs-pink-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="smile" size={22} stroke={2.2}/>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>That&apos;s fine — set it and forget it.</div>
          <p style={{ margin: '6px auto 0', fontSize: 13.5, color: 'var(--pbs-ink-soft)', maxWidth: 420, lineHeight: 1.5 }}>
            We&apos;ll open an empty classroom. You can roster later from the Teacher app under <span className="pbs-mono" style={{ color: 'var(--pbs-ink)' }}>Settings → Roster</span>.
          </p>
        </StepCard>
      )}
    </div>
  );
};

// ── Google Classroom live connect ────────────────────────────────────────────
// Uses next-auth (Google provider, Classroom scopes) to sign the teacher in,
// then lists their Classroom courses and lets them import a roster in one tap.

function GoogleClassroomConnect({
  data, set, selectedMethod,
}: {
  data: SetupData;
  set: <K extends keyof SetupData>(k: K, v: SetupData[K]) => void;
  selectedMethod: typeof ROSTER_METHODS[number];
}) {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedCourseId, setImportedCourseId] = useState<string | null>(null);

  // Fetch courses once authenticated.
  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await classroomFetch<ListCoursesResponse>('/courses');
        if (cancelled) return;
        setCourses(res.courses ?? []);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load courses');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [status]);

  const importRoster = async (course: ClassroomCourse) => {
    setImportingId(course.id);
    setError(null);
    try {
      const res = await classroomFetch<ListStudentsResponse>(`/courses/${course.id}/people`);
      const names = (res.students ?? [])
        .map((s) => s.profile?.name?.fullName)
        .filter((n): n is string => Boolean(n));
      set('pastedNames', names.join('\n'));
      if (course.name) set('className', course.name);
      setImportedCourseId(course.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to import roster');
    } finally {
      setImportingId(null);
    }
  };

  // ── Not signed in: the original marketing card with a real Connect CTA ───
  if (status !== 'authenticated') {
    const isLoading = status === 'loading';
    return (
      <StepCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `var(--pbs-${selectedMethod.tone})`,
            border: `1.5px solid var(--pbs-${selectedMethod.tone}-ink)`,
            color: `var(--pbs-${selectedMethod.tone}-ink)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name={selectedMethod.icon} size={24} stroke={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Connect {selectedMethod.label}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.5, maxWidth: 440 }}>
              We&apos;ll open a pop-up to authorise. Your roster auto-syncs every morning, so add/drops are handled.
            </p>
          </div>
          <Chunky
            tone="ink"
            trailing="arrow-up-right"
            onClick={() => signIn('google', { callbackUrl: '/teacher/setup' })}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : 'Connect'}
          </Chunky>
        </div>
      </StepCard>
    );
  }

  // ── Token expired ───────────────────────────────────────────────────────
  if (session?.error === 'AccessTokenExpired') {
    return (
      <StepCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Your Google session expired</div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--pbs-ink-soft)' }}>
              Re-authorise to refresh your Classroom roster.
            </p>
          </div>
          <Chunky tone="ink" trailing="arrow-up-right" onClick={() => signIn('google', { callbackUrl: '/teacher/setup' })}>
            Re-authorise
          </Chunky>
        </div>
      </StepCard>
    );
  }

  // ── Signed in ───────────────────────────────────────────────────────────
  return (
    <StepCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `var(--pbs-${selectedMethod.tone})`,
          border: `1.5px solid var(--pbs-${selectedMethod.tone}-ink)`,
          color: `var(--pbs-${selectedMethod.tone}-ink)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="book" size={18} stroke={2.2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Connected to Google Classroom
          </div>
          <div className="pbs-mono" style={{ fontSize: 12, color: 'var(--pbs-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session?.user?.email ?? ''}
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: 999,
          background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
          border: '1.5px solid var(--pbs-mint-ink)',
        }}>Live</span>
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--pbs-ink-muted)' }}>
          Loading your courses…
        </div>
      )}

      {error && (
        <div style={{
          padding: 12, borderRadius: 12,
          background: 'var(--pbs-coral)', color: 'var(--pbs-coral-ink)',
          border: '1.5px solid var(--pbs-coral-ink)',
          fontSize: 13,
        }}>{error}</div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div style={{
          padding: 16, borderRadius: 12,
          background: 'var(--pbs-paper)', border: '1.5px dashed var(--pbs-line-2)',
          fontSize: 13, color: 'var(--pbs-ink-soft)',
        }}>
          No Google Classroom courses found on this account. Create one in Classroom, then come back and refresh.
        </div>
      )}

      {courses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Pick a course to import
          </div>
          {courses.map((c) => {
            const done = importedCourseId === c.id;
            const busy = importingId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => importRoster(c)}
                disabled={busy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', textAlign: 'left',
                  background: done ? 'var(--pbs-mint)' : 'var(--pbs-paper)',
                  color: done ? 'var(--pbs-mint-ink)' : 'var(--pbs-ink)',
                  border: `1.5px solid ${done ? 'var(--pbs-mint-ink)' : 'var(--pbs-line-2)'}`,
                  borderRadius: 12,
                  cursor: busy ? 'progress' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 120ms',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                  {(c.section || c.room) && (
                    <div style={{ fontSize: 12, color: done ? 'inherit' : 'var(--pbs-ink-muted)', opacity: done ? 0.85 : 1 }}>
                      {[c.section, c.room].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <span className="pbs-mono" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {busy ? 'Importing…' : done ? 'Imported ✓' : 'Import →'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {data.pastedNames && importedCourseId && (
        <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--pbs-ink-soft)' }}>
          Imported <strong style={{ color: 'var(--pbs-ink)' }}>{data.pastedNames.split(/\n/).filter(Boolean).length}</strong> students. You can tweak the list in <em>Paste a list</em> if needed.
        </div>
      )}
    </StepCard>
  );
}
