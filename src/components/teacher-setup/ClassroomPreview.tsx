// Right-rail live preview — a classroom "block" that assembles as you
// progress through the steps. Ported from pb_classroom_setup/preview.jsx.
'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import type { SetupData, GradeKey, DayKey } from './types';

type JoinedStudent = {
  id: string;
  full_name: string;
  picture_url: string | null;
};

// Poll the students endpoint for the reserved class while the teacher
// is still on the "share a join code" step. 3s cadence is quick enough
// that new joiners pop in during the demo without hammering the API.
function useJoinedStudents(classId: string | undefined, active: boolean) {
  const [students, setStudents] = useState<JoinedStudent[]>([]);
  useEffect(() => {
    if (!active || !classId) { setStudents([]); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/classes/${classId}/students`, { cache: 'no-store' });
        if (!res.ok) return;
        const j = await res.json();
        if (!cancelled && Array.isArray(j.students)) setStudents(j.students);
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [classId, active]);
  return students;
}

function gradeLabel(g: GradeKey): string {
  const map: Record<GradeKey, string> = {
    k2: 'K–2', '3': '3rd', '4': '4th', '5': '5th', '6': '6th',
    '7': '7th', '8': '8th', '9': '9th', '10': '10th', '11': '11th',
    '12': '12th', hs: 'HS', mix: 'mixed',
  };
  return map[g] ?? g;
}

function initialsOf(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export const ClassroomPreview = ({
  data, step,
}: {
  data: SetupData;
  step: number;
}) => {
  const tone = data.color;
  const liveOn = step === 2 && data.rosterMethod === 'code';

  // Fall back to resolving the class by join_code if the reserve POST
  // hasn't populated reservedClassId yet (e.g. teacher isn't signed in
  // with Google, so /api/classes 401'd). Keeps the right-rail poll in
  // sync with the live join code whatever the auth state.
  const [resolvedId, setResolvedId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!liveOn || data.reservedClassId) { setResolvedId(undefined); return; }
    if (!data.joinCode) return;
    let cancelled = false;
    fetch(`/api/classes/lookup?code=${encodeURIComponent(data.joinCode)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!cancelled && j?.classId) setResolvedId(j.classId); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [liveOn, data.reservedClassId, data.joinCode]);

  const pollClassId = data.reservedClassId ?? resolvedId;
  const joined = useJoinedStudents(pollClassId, liveOn);
  const rosterCount: number | string = data.pastedNames && data.rosterMethod === 'paste'
    ? data.pastedNames.split(/\n|,/).map((s) => s.trim()).filter(Boolean).length
    : data.rosterMethod === 'code'  ? '?'
    : data.rosterMethod === 'later' ? 0
    : '~28';
  const tones = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink', 'butter'] as const;
  const unit = data.unit;

  const showCore = step >= 1;
  const showRoster = step >= 2;
  const showUnit = step >= 3;
  const showDoor = step >= 4;

  return (
    <div style={{
      position: 'sticky', top: 100,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 4px' }}>
        Live preview · the room
      </div>

      <div key={tone} className="pb-pop-in" style={{
        background: `var(--pbs-${tone})`,
        border: `1.5px solid var(--pbs-${tone}-ink)`,
        borderRadius: 20,
        padding: 18,
        boxShadow: `0 4px 0 var(--pbs-${tone}-ink), 0 20px 40px -22px rgba(60,40,0,0.3)`,
        color: `var(--pbs-${tone}-ink)`,
        position: 'relative',
      }}>
        {/* header with "door" blocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: `var(--pbs-${tone}-ink)`, opacity: 0.5 }}/>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: `var(--pbs-${tone}-ink)`, opacity: 0.3 }}/>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: `var(--pbs-${tone}-ink)`, opacity: 0.2 }}/>
          </div>
          <div className="pbs-mono" style={{ marginLeft: 'auto', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.75 }}>
            {showDoor ? 'Ready to open' : 'Drafting'}
          </div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 12, lineHeight: 1.15 }}>
          {data.className || <span style={{ opacity: 0.55 }}>Your classroom name…</span>}
        </div>
        <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
          {(data.classSubject || 'subject')} · {gradeLabel(data.grade)}
        </div>

        {/* roster avatars */}
        <div style={{
          marginTop: 14, padding: 12,
          background: 'var(--pbs-paper)', color: 'var(--pbs-ink)',
          border: `1.5px solid var(--pbs-${tone}-ink)`,
          borderRadius: 12,
          opacity: showRoster ? 1 : 0.5,
          transition: 'opacity 200ms',
        }}>
          <div className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Roster · {rosterCount === 0 ? 'empty' : rosterCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(
              <>
                {tones.slice(0, showRoster ? 7 : 0).map((t, i) => (
                  <div key={i} style={{
                    width: 26, height: 26, borderRadius: 999,
                    background: `var(--pbs-${t})`, border: `1.5px solid var(--pbs-${t}-ink)`,
                    color: `var(--pbs-${t}-ink)`,
                    marginLeft: i === 0 ? 0 : -8,
                    fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10 - i,
                  }}>{String.fromCharCode(65 + i)}</div>
                ))}
                {showRoster && !liveOn && (
                  <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginLeft: 10 }}>
                    {typeof rosterCount === 'number' && rosterCount > 7 ? `+${rosterCount - 7} more` : ''}
                  </span>
                )}
                {!showRoster && (
                  <span style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>Add students in step 03</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* unit card */}
        <div style={{
          marginTop: 10, padding: '10px 12px',
          background: 'var(--pbs-paper)', color: 'var(--pbs-ink)',
          border: `1.5px solid var(--pbs-${tone}-ink)`,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          opacity: showUnit && unit ? 1 : 0.5,
          transition: 'opacity 200ms',
        }}>
          {showUnit && unit ? (
            <>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `var(--pbs-${unit.tone})`, color: `var(--pbs-${unit.tone}-ink)`,
                border: `1.5px solid var(--pbs-${unit.tone}-ink)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={unit.icon} size={14} stroke={2.2}/>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{unit.title}</div>
                <div className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-ink-muted)' }}>{unit.weeks}</div>
              </div>
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>Pick a starter unit in step 04</span>
          )}
        </div>

        {/* schedule chips */}
        {showCore && data.days.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
            {DAY_ORDER.map((d) => {
              const on = data.days.includes(d);
              return (
                <span key={d} className="pbs-mono" style={{
                  padding: '3px 8px', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                  borderRadius: 6,
                  background: on ? `var(--pbs-${tone}-ink)` : 'transparent',
                  color: on ? `var(--pbs-${tone})` : `var(--pbs-${tone}-ink)`,
                  border: `1px solid var(--pbs-${tone}-ink)`,
                  opacity: on ? 1 : 0.4,
                }}>{d}</span>
              );
            })}
            <span className="pbs-mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4, alignSelf: 'center' }}>
              {data.startTime}
            </span>
          </div>
        )}
      </div>

      {/* "join code receipt" sidecar when on step 3 + code method */}
      {step === 2 && data.rosterMethod === 'code' && (
        <div style={{
          background: 'var(--pbs-paper)',
          border: '1.5px dashed var(--pbs-line-2)',
          borderRadius: 14, padding: 14,
          transform: 'rotate(1deg)',
          textAlign: 'center',
        }}>
          <div className="pbs-mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)' }}>
            Join code
          </div>
          <div className="pbs-serif" style={{ fontSize: 28, lineHeight: 1.1, fontStyle: 'italic', marginTop: 4 }}>
            {data.joinCode}
          </div>
        </div>
      )}

      {data.teacherName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 12,
          background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
          borderRadius: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: `var(--pbs-${tone})`, color: `var(--pbs-${tone}-ink)`,
            border: `1.5px solid var(--pbs-${tone}-ink)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800,
          }}>{initialsOf(data.teacherName)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.teacherName}</div>
            <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>
              @{data.teacherHandle || 'you'} · teacher
            </div>
          </div>
        </div>
      )}

      {/* Live joined-students list — only while the teacher is still on the
          "share a join code" step. Rendered outside the yellow card so the
          preview stays a clean "drafting" mock, while joiners stream in
          below the teacher chip as they authenticate via /join/<id>. */}
      {liveOn && joined.length > 0 && (
        <div style={{
          padding: 12,
          background: 'var(--pbs-paper)',
          border: '1.5px solid var(--pbs-line-2)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div className="pbs-mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)' }}>
            Joined · {joined.length}
          </div>
          {joined.map((s, i) => {
            const t = tones[i % tones.length];
            const initials = s.full_name.trim().split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: s.picture_url ? `url(${s.picture_url}) center/cover` : `var(--pbs-${t})`,
                  border: `1.5px solid var(--pbs-${t}-ink)`,
                  color: `var(--pbs-${t}-ink)`,
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                }}>{s.picture_url ? '' : initials}</div>
                <div style={{ minWidth: 0, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.full_name}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
