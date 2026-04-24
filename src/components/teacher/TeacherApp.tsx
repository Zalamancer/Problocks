// Teacher app shell: top bar with logo + class picker + tabs + user chip,
// then route-switches between Overview / Assignments (list+detail) /
// Students (list+detail) / Student view (self).
// Ported from problocks/project/pb_teacher/app.jsx.
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { AssignmentDetail, AssignmentsList } from './Assignments';
import { Messages } from './Messages';
import { NewAssignment } from './NewAssignment';
import { Overview } from './Overview';
import { StudentDetail } from './StudentDetail';
import { StudentSelf } from './StudentSelf';
import { StudentsList } from './StudentsList';
import { type Assignment, type ClassRecord, type Student } from './sample-data';
import { teacherWrap } from './shared';
import { useDataSourceStore } from '@/store/data-source-store';
import { useTeacherData } from './teacher-data-context';
import { OwnerSwitchButton } from '@/components/owner-switch-button';

type View = 'overview' | 'assignments' | 'assignment' | 'new-assignment' | 'students' | 'student' | 'self' | 'messages';

// "Student view" intentionally is NOT a top-level tab. It's reached from a
// "View as student" button on a specific StudentDetail — teachers don't
// browse the abstract idea of "the student experience", they ask "what
// does this kid see right now?". Keeping it as a tab pinned it to a single
// hard-coded student (STUDENTS[0]) which read like a placeholder page.
const TABS: { k: View; l: string }[] = [
  { k: 'overview',    l: 'Overview' },
  { k: 'assignments', l: 'Assignments' },
  { k: 'students',    l: 'Students' },
  { k: 'messages',    l: 'Messages' },
];

const ClassPicker = ({
  cls, setCls, classes,
}: {
  cls: ClassRecord;
  setCls: (c: ClassRecord) => void;
  classes: ClassRecord[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 12px 7px 7px', borderRadius: 999,
          background: 'var(--pbs-paper)',
          border: '1.5px solid var(--pbs-line-2)',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', color: 'inherit', fontFamily: 'inherit',
        }}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: `var(--pbs-${cls.tone})`,
          border: `1.5px solid var(--pbs-${cls.tone}-ink)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{cls.emoji}</span>
        <span>{cls.name}</span>
        <span style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>· {cls.members} students</span>
        <Icon name="chevron" size={13} stroke={2.4} style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}/>
      </button>
      {open && (
        <div
          className="pbs-pop-in"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 40,
            minWidth: 300,
            background: 'var(--pbs-paper)',
            border: '1.5px solid var(--pbs-line-2)',
            borderRadius: 12, padding: 6,
            boxShadow: '0 6px 0 var(--pbs-line-2), 0 20px 40px -12px rgba(0,0,0,0.2)',
          }}
        >
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setCls(c); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: 10, borderRadius: 10,
                background: c.id === cls.id ? 'var(--pbs-cream-2)' : 'transparent',
                textAlign: 'left',
                border: 0, cursor: 'pointer', color: 'inherit', fontFamily: 'inherit',
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 8,
                background: `var(--pbs-${c.tone})`,
                border: `1.5px solid var(--pbs-${c.tone}-ink)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>{c.period} · avg {c.avg}%</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const isTabActive = (view: View, k: View): boolean => {
  if (view === k) return true;
  if (k === 'assignments' && (view === 'assignment' || view === 'new-assignment')) return true;
  // `student` and `self` are both entered from the Students roster, so
  // keep the Students tab highlighted when the teacher is in either view.
  if (k === 'students'    && (view === 'student' || view === 'self')) return true;
  return false;
};

export const TeacherApp = () => {
  const useRealData = useDataSourceStore((s) => s.useRealData);
  const { classRecord, classes, isReal } = useTeacherData();
  const { data: session } = useSession();
  // Prefer the signed-in Google account when available; fall back to a
  // neutral literal ("Teacher") when there's no session so the header chip
  // never leaks the "Ms. Rivera" demo persona into real classrooms.
  const teacherName  = session?.user?.name  ?? 'Teacher';
  const teacherEmail = session?.user?.email ?? '';
  const teacherImage = session?.user?.image ?? null;
  const [view, setView] = useState<View>('overview');
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [cls, setCls] = useState<ClassRecord>(classRecord);
  // Composer output — drafts AND published both get prepended to the
  // Assignments list; drafts are distinguished by a "Draft" pill.
  const [drafts, setDrafts] = useState<Assignment[]>([]);

  // When the context swaps between demo/real (or real data loads async from
  // /api/classes), bring the picker selection along instead of leaving it
  // pinned to the stale initial CLASSES[0].
  useEffect(() => {
    setCls(classRecord);
  }, [classRecord]);

  // Legacy "Real data" pill in the bottom-right: only show the "no schema"
  // empty state when the pill is toggled AND we aren't in URL-driven real
  // mode (?classId=... already loads real data via the context).
  if (useRealData && !isReal) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{
          maxWidth: 560, padding: 28, borderRadius: 16,
          background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
          boxShadow: '0 4px 0 var(--pbs-line-2)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pbs-ink-muted)' }}>
            REAL DATA · SUPABASE
          </div>
          <h1 style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 700 }}>
            No teacher data yet.
          </h1>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--pbs-ink-soft)' }}>
            The teacher dashboard reads classes, students, and assignments from Supabase
            in real mode. Those tables haven&apos;t been provisioned yet, so there&apos;s
            nothing to show.
          </p>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--pbs-ink-soft)' }}>
            Flip the <strong>Data</strong> pill in the bottom-right back to{' '}
            <strong>Mock · Demo</strong> to explore the seeded dashboard.
          </p>
        </div>
      </div>
    );
  }

  const goAssignment = (a: Assignment) => { setDetailAssignment(a); setView('assignment'); };
  const goStudent    = (s: Student)    => { setDetailStudent(s);    setView('student'); };
  // "View as student" from inside a student's detail page. Reuses the same
  // detailStudent so StudentSelf renders THIS student, not a hard-coded one.
  const goSelf       = (s: Student)    => { setDetailStudent(s);    setView('self'); };
  const goNew        = ()              => { setView('new-assignment'); };
  const handleCreated = (a: Assignment, _asDraft: boolean) => {
    setDrafts((prev) => [a, ...prev]);
    setView('assignments');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(253,246,230,0.88)', backdropFilter: 'blur(10px)',
        borderBottom: '1.5px solid var(--pbs-line)',
      }}>
        <div style={{ ...teacherWrap, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 28px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="logo-block" size={26}/>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>Playdemy</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              padding: '3px 7px', borderRadius: 6,
              background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
              marginLeft: 6,
            }}>TEACHER</span>
          </div>

          <ClassPicker cls={cls} setCls={setCls} classes={classes}/>

          <nav style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            {TABS.map(({ k, l }) => {
              const active = isTabActive(view, k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setView(k)}
                  style={{
                    padding: '8px 14px', borderRadius: 999,
                    background: active ? 'var(--pbs-ink)' : 'transparent',
                    color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
                    fontSize: 13, fontWeight: 600,
                    border: 0, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{l}</button>
              );
            })}
          </nav>

          <OwnerSwitchButton email={teacherEmail} to="student" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1.5px solid var(--pbs-line-2)' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--pbs-grape)',
              border: '1.5px solid var(--pbs-grape-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, overflow: 'hidden',
            }}>
              {teacherImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teacherImage}
                  alt={teacherName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : '👩🏽‍🏫'}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700 }}>{teacherName}</div>
              <div style={{ color: 'var(--pbs-ink-muted)', fontSize: 10.5 }}>{teacherEmail}</div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ ...teacherWrap, padding: '28px 28px 80px' }}>
        {view === 'overview'    && <Overview cls={cls} onStudent={goStudent} onAssignment={goAssignment}/>}
        {view === 'assignments' && (
          <AssignmentsList onAssignment={goAssignment} onNew={goNew} drafts={drafts}/>
        )}
        {view === 'assignment'  && detailAssignment && (
          <AssignmentDetail a={detailAssignment} onBack={() => setView('assignments')} onStudent={goStudent}/>
        )}
        {view === 'new-assignment' && (
          <NewAssignment cls={cls} onBack={() => setView('assignments')} onCreated={handleCreated}/>
        )}
        {view === 'students'    && <StudentsList onStudent={goStudent}/>}
        {view === 'messages'    && <Messages cls={cls} onCls={setCls} onStudent={goStudent}/>}
        {view === 'student'     && detailStudent && (
          <StudentDetail
            s={detailStudent}
            isReal={isReal}
            onBack={() => setView('students')}
            onViewAsStudent={goSelf}
          />
        )}
        {view === 'self'        && detailStudent && (
          <StudentSelf s={detailStudent} isReal={isReal} onBack={() => setView('student')}/>
        )}
      </main>
    </div>
  );
};
