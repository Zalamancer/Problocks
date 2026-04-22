// Step 5: review summary + big "open the classroom" CTA card.
// Ported from Claude Design bundle (pb_classroom_setup/steps_late.jsx).
'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { StepCard, StepHeader } from './form';
import type { SetupData } from './types';
import { classroomFetch } from '@/lib/classroom-api';
import type {
  ClassroomCourseWork,
  ClassroomAnnouncement,
  ListCourseWorkResponse,
  ListAnnouncementsResponse,
} from '@/lib/classroom-api';

const Row = ({
  label, value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 14,
    padding: '12px 0', borderBottom: '1px dashed var(--pbs-line-2)',
  }}>
    <div className="pbs-mono" style={{
      width: 120, flexShrink: 0,
      fontSize: 11, color: 'var(--pbs-ink-muted)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      paddingTop: 2,
    }}>{label}</div>
    <div style={{ flex: 1, fontSize: 14.5, color: 'var(--pbs-ink)', lineHeight: 1.45 }}>{value}</div>
  </div>
);

export const StepReview = ({ data }: { data: SetupData }) => {
  const unit = data.unit;
  const rosterCount = data.pastedNames
    ? data.pastedNames.split(/\n|,/).map((s) => s.trim()).filter(Boolean).length
    : 0;

  const rosterValue: React.ReactNode =
    data.rosterMethod === 'paste'  ? `${rosterCount} students pasted` :
    data.rosterMethod === 'google' ? 'Will connect Google Classroom' :
    data.rosterMethod === 'clever' ? 'Will connect Clever' :
    data.rosterMethod === 'teams'  ? 'Will connect Microsoft Teams' :
    data.rosterMethod === 'code'   ? (
      <>Share code <span className="pbs-mono" style={{ background: 'var(--pbs-cream-2)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--pbs-line-2)' }}>{data.joinCode}</span></>
    ) :
    'Open empty — roster later';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <StepHeader
        index={4}
        total={5}
        step={{
          title: <>One last look before <span className="pbs-serif">the doors open.</span></>,
          sub: "Double-check the room — anything here is still editable once you're inside the Teacher app.",
        }}
      />

      <StepCard>
        <Row label="Teacher" value={<>{data.teacherName || '—'} · <span className="pbs-mono" style={{ color: 'var(--pbs-ink-muted)' }}>@{data.teacherHandle || 'you'}</span></>}/>
        <Row label="School" value={data.school || '—'}/>
        <Row label="Classroom" value={<><strong>{data.className || 'Untitled classroom'}</strong> · {data.classSubject} · {data.grade}</>}/>
        <Row label="Schedule" value={<>{data.days.length ? data.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(' / ') : '—'} · {data.startTime} – {data.endTime}</>}/>
        <Row label="Roster" value={rosterValue}/>
        <Row label="Starter" value={unit ? <><strong>{unit.title}</strong> · {unit.weeks}</> : 'None'}/>
        <Row label="Standards" value={data.standards}/>
      </StepCard>

      {data.classroomCourseId && (
        <ClassroomPreviewCard courseId={data.classroomCourseId} courseName={data.classroomCourseName}/>
      )}

      <StepCard style={{ background: 'var(--pbs-ink)', color: 'var(--pbs-cream)', borderColor: 'var(--pbs-ink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
            border: '1.5px solid var(--pbs-butter-ink)',
            boxShadow: '0 3px 0 var(--pbs-butter-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name="sparkle" size={22} stroke={2.2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>You&apos;re two clicks from teaching.</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 3 }}>
              Opening the room creates the classroom page, seeds the first week&apos;s lessons, and emails any connected roster.
            </div>
          </div>
        </div>
      </StepCard>
    </div>
  );
};

// Previews assignments + announcements from the linked Google Classroom
// course so the teacher can see exactly what will carry over before they
// click "Open the classroom". Same endpoints the teacher dashboard uses —
// filtered to PUBLISHED so drafts/deleted items don't leak in.
function ClassroomPreviewCard({
  courseId, courseName,
}: {
  courseId: string;
  courseName?: string;
}) {
  const [coursework, setCoursework] = useState<ClassroomCourseWork[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      classroomFetch<ListCourseWorkResponse>(
        `/courses/${courseId}/coursework?courseWorkStates=PUBLISHED&pageSize=100&orderBy=updateTime desc`,
      ),
      classroomFetch<ListAnnouncementsResponse>(
        `/courses/${courseId}/announcements?announcementStates=PUBLISHED&pageSize=50`,
      ),
    ])
      .then(([cw, an]) => {
        if (cancelled) return;
        setCoursework(cw.courseWork ?? []);
        setAnnouncements(an.announcements ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load Classroom preview');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [courseId]);

  return (
    <StepCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
          border: '1.5px solid var(--pbs-mint-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="book" size={14} stroke={2.2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Imports from Google Classroom
          </div>
          <div className="pbs-mono" style={{
            fontSize: 11.5, color: 'var(--pbs-ink-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {courseName ?? courseId}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ fontSize: 13, color: 'var(--pbs-ink-muted)' }}>
          Checking the course…
        </div>
      )}

      {error && (
        <div style={{
          padding: 10, borderRadius: 10,
          background: 'var(--pbs-coral)', color: 'var(--pbs-coral-ink)',
          border: '1.5px solid var(--pbs-coral-ink)',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {!loading && !error && coursework.length === 0 && announcements.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--pbs-ink-muted)' }}>
          No published assignments or announcements found in this course — we&apos;ll just carry over the link.
        </div>
      )}

      {!loading && !error && (coursework.length > 0 || announcements.length > 0) && (
        <>
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            padding: '8px 10px', marginBottom: 10,
            borderRadius: 10,
            background: 'var(--pbs-cream-2)',
            border: '1.5px solid var(--pbs-line-2)',
            fontSize: 12.5, color: 'var(--pbs-ink-soft)',
          }}>
            <span><strong style={{ color: 'var(--pbs-ink)' }}>{coursework.length}</strong> assignment{coursework.length === 1 ? '' : 's'}</span>
            <span>·</span>
            <span><strong style={{ color: 'var(--pbs-ink)' }}>{announcements.length}</strong> announcement{announcements.length === 1 ? '' : 's'}</span>
            <span style={{ marginLeft: 'auto' }}>will appear in your teacher dashboard</span>
          </div>

          {coursework.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {coursework.slice(0, 5).map((cw) => (
                <div
                  key={cw.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: 'var(--pbs-paper)',
                    border: '1px solid var(--pbs-line-2)',
                  }}
                >
                  <Icon name="bolt" size={12} stroke={2.4}/>
                  <div style={{
                    flex: 1, fontSize: 13,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {cw.title}
                  </div>
                </div>
              ))}
              {coursework.length > 5 && (
                <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>
                  + {coursework.length - 5} more
                </div>
              )}
            </div>
          )}
        </>
      )}
    </StepCard>
  );
}
