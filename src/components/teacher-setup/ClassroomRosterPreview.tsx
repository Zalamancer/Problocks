// Right-rail live roster preview shown on the Roster step when a Google
// Classroom course has been picked. Fetches the course roster through our
// `/api/classroom/courses/:id/people` proxy (teachers + students) and shows
// a sticky card with avatars, names, and emails — the same shape the
// ClassroomPreview "room" sits in, so both cards align in the rail.
'use client';

import React, { useEffect, useState } from 'react';
import { classroomFetch } from '@/lib/classroom-api';
import type { ClassroomStudent, ClassroomTeacher } from '@/lib/classroom-api';

type PeopleResponse = {
  teachers: ClassroomTeacher[];
  students: ClassroomStudent[];
};

function initialsOf(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

// Classroom returns protocol-relative URLs for photos in some cases
// ("//lh3.googleusercontent.com/..."). Normalise so <img> doesn't break.
function normalisePhoto(url?: string): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `https:${url}`;
}

const TONES = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'] as const;

export const ClassroomRosterPreview = ({
  courseId, courseName,
}: {
  courseId: string;
  courseName?: string;
}) => {
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    classroomFetch<PeopleResponse>(`/courses/${courseId}/people?pageSize=50`)
      .then((res) => {
        if (cancelled) return;
        setStudents(res.students ?? []);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load roster');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [courseId]);

  return (
    <div style={{
      position: 'sticky', top: 100,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 4px' }}>
        Live preview · Classroom roster
      </div>

      <div className="pb-pop-in" style={{
        background: 'var(--pbs-paper)',
        border: '1.5px solid var(--pbs-mint-ink)',
        borderRadius: 20,
        padding: 18,
        boxShadow: '0 4px 0 var(--pbs-mint-ink), 0 20px 40px -22px rgba(60,40,0,0.3)',
        color: 'var(--pbs-ink)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 999,
            background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
            border: '1.5px solid var(--pbs-mint-ink)',
          }}>Live</span>
          <div className="pbs-mono" style={{ marginLeft: 'auto', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)' }}>
            From Classroom
          </div>
        </div>

        {courseName && (
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 10, lineHeight: 1.2 }}>
            {courseName}
          </div>
        )}
        <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {loading ? 'Loading roster…' : `${students.length} student${students.length === 1 ? '' : 's'}`}
        </div>

        {error && (
          <div style={{
            marginTop: 12, padding: 10, borderRadius: 10,
            background: 'var(--pbs-coral)', color: 'var(--pbs-coral-ink)',
            border: '1.5px solid var(--pbs-coral-ink)',
            fontSize: 12, lineHeight: 1.45,
          }}>{error}</div>
        )}

        {!loading && !error && students.length === 0 && (
          <div style={{
            marginTop: 12, padding: 12, borderRadius: 12,
            background: 'var(--pbs-cream-2)', border: '1.5px dashed var(--pbs-line-2)',
            fontSize: 12, color: 'var(--pbs-ink-soft)', lineHeight: 1.5,
          }}>
            No students on this course yet. Invite them in Classroom and they&apos;ll
            show up here automatically.
          </div>
        )}

        {!loading && students.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {students.slice(0, 8).map((s, i) => {
              const tone = TONES[i % TONES.length];
              const photo = normalisePhoto(s.profile.photoUrl);
              const full =
                s.profile.name.fullName?.trim() ||
                [s.profile.name.givenName, s.profile.name.familyName].filter(Boolean).join(' ') ||
                s.profile.emailAddress ||
                'Student';
              return (
                <div key={s.userId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 8px',
                  background: 'var(--pbs-cream-2)',
                  border: '1.5px solid var(--pbs-line-2)',
                  borderRadius: 12,
                  minWidth: 0,
                }}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt=""
                      width={28}
                      height={28}
                      style={{
                        width: 28, height: 28, borderRadius: 999,
                        objectFit: 'cover',
                        border: `1.5px solid var(--pbs-${tone}-ink)`,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: `var(--pbs-${tone})`, color: `var(--pbs-${tone}-ink)`,
                      border: `1.5px solid var(--pbs-${tone}-ink)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, flexShrink: 0,
                    }}>{initialsOf(full)}</div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {full}
                    </div>
                    {s.profile.emailAddress && (
                      <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.profile.emailAddress}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {students.length > 8 && (
              <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', padding: '4px 8px' }}>
                +{students.length - 8} more will import on open
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
