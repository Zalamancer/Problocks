// Renders imported Google Classroom content (coursework + announcements) for
// classes linked to a Classroom course. Pulled live from the Classroom API
// via teacher-data-context on every dashboard load.
//
// Intentionally read-only for now: we show what the teacher already has in
// Classroom so they can see "my class DID carry over" during onboarding. Edit
// / create actions for these items will come when we sync in the other
// direction (Playdemy → Classroom) — tracked separately.
'use client';

import React from 'react';
import { Block, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { useTeacherData } from './teacher-data-context';
import type { ClassroomCourseWork, ClassroomAnnouncement } from '@/lib/classroom-api';

function formatDue(cw: ClassroomCourseWork): string {
  if (!cw.dueDate) return 'No due date';
  const { year, month, day } = cw.dueDate;
  try {
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return `${year}-${month}-${day}`;
  }
}

function formatUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

function workTypeLabel(t: ClassroomCourseWork['workType']): string {
  switch (t) {
    case 'ASSIGNMENT': return 'Assignment';
    case 'SHORT_ANSWER_QUESTION': return 'Short-answer';
    case 'MULTIPLE_CHOICE_QUESTION': return 'Multi-choice';
    default: return 'Assignment';
  }
}

export const ClassroomImported = () => {
  const {
    classroomCourseId,
    classroomAssignments,
    classroomAnnouncements,
    classroomLoading,
    classroomError,
  } = useTeacherData();

  // Only render for real classes that are actually linked. Demo-mode and
  // unlinked real classes should look exactly like they did before.
  if (!classroomCourseId) return null;

  const hasContent = classroomAssignments.length > 0 || classroomAnnouncements.length > 0;

  return (
    <Block tone="paper" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
          border: '1.5px solid var(--pbs-mint-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="book" size={14} stroke={2.2}/>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
          From Google Classroom
        </div>
        <Pill tone="paper">Live</Pill>
      </div>

      {classroomLoading && (
        <div style={{ fontSize: 13, color: 'var(--pbs-ink-muted)' }}>
          Loading your Classroom content…
        </div>
      )}

      {classroomError && (
        <div style={{
          padding: 10, borderRadius: 10,
          background: 'var(--pbs-coral)', color: 'var(--pbs-coral-ink)',
          border: '1.5px solid var(--pbs-coral-ink)',
          fontSize: 13,
        }}>
          Couldn&apos;t load Classroom content: {classroomError}
        </div>
      )}

      {!classroomLoading && !classroomError && !hasContent && (
        <div style={{ fontSize: 13, color: 'var(--pbs-ink-muted)' }}>
          No published assignments or announcements found in the linked Classroom course.
        </div>
      )}

      {classroomAssignments.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div className="pbs-mono" style={{
            fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--pbs-ink-muted)', marginBottom: 6,
          }}>
            Assignments · {classroomAssignments.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {classroomAssignments.slice(0, 6).map((cw) => (
              <a
                key={cw.id}
                href={cw.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--pbs-cream-2)',
                  border: '1.5px solid var(--pbs-line-2)',
                  textDecoration: 'none', color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13.5, fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {cw.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>
                    {workTypeLabel(cw.workType)} · Due {formatDue(cw)}
                    {cw.maxPoints ? ` · ${cw.maxPoints} pts` : ''}
                  </div>
                </div>
                <Icon name="arrow-up-right" size={12} stroke={2.4}/>
              </a>
            ))}
            {classroomAssignments.length > 6 && (
              <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>
                + {classroomAssignments.length - 6} more in Google Classroom
              </div>
            )}
          </div>
        </div>
      )}

      {classroomAnnouncements.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="pbs-mono" style={{
            fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--pbs-ink-muted)', marginBottom: 6,
          }}>
            Announcements · {classroomAnnouncements.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {classroomAnnouncements.slice(0, 4).map((a: ClassroomAnnouncement) => (
              <a
                key={a.id}
                href={a.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--pbs-cream-2)',
                  border: '1.5px solid var(--pbs-line-2)',
                  textDecoration: 'none', color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  fontSize: 13,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.45,
                }}>
                  {a.text}
                </div>
                <div style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 4 }}>
                  {formatUpdated(a.updateTime)}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </Block>
  );
};
