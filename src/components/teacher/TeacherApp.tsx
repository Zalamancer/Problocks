// Teacher app shell: top bar with logo + class picker + tabs + user chip,
// then route-switches between Overview / Assignments (list+detail) /
// Students (list+detail) / Student view (self).
// Ported from problocks/project/pb_teacher/app.jsx.
'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { AssignmentDetail, AssignmentsList } from './Assignments';
import { Overview } from './Overview';
import { StudentDetail } from './StudentDetail';
import { StudentSelf } from './StudentSelf';
import { StudentsList } from './StudentsList';
import { CLASSES, type Assignment, type ClassRecord, type Student } from './sample-data';
import { teacherWrap } from './shared';

type View = 'overview' | 'assignments' | 'assignment' | 'students' | 'student' | 'self';

const TABS: { k: View; l: string }[] = [
  { k: 'overview',    l: 'Overview' },
  { k: 'assignments', l: 'Assignments' },
  { k: 'students',    l: 'Students' },
  { k: 'self',        l: 'Student view' },
];

const ClassPicker = ({
  cls, setCls,
}: {
  cls: ClassRecord;
  setCls: (c: ClassRecord) => void;
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
          {CLASSES.map((c) => (
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
  if (k === 'assignments' && view === 'assignment') return true;
  if (k === 'students'    && view === 'student')    return true;
  return false;
};

export const TeacherApp = () => {
  const [view, setView] = useState<View>('overview');
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [cls, setCls] = useState<ClassRecord>(CLASSES[0]);

  const goAssignment = (a: Assignment) => { setDetailAssignment(a); setView('assignment'); };
  const goStudent    = (s: Student)    => { setDetailStudent(s);    setView('student'); };

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
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>ProBlocks</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              padding: '3px 7px', borderRadius: 6,
              background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
              marginLeft: 6,
            }}>TEACHER</span>
          </div>

          <ClassPicker cls={cls} setCls={setCls}/>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1.5px solid var(--pbs-line-2)' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--pbs-grape)',
              border: '1.5px solid var(--pbs-grape-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>👩🏽‍🏫</div>
            <div style={{ fontSize: 12, lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700 }}>Ms. Rivera</div>
              <div style={{ color: 'var(--pbs-ink-muted)', fontSize: 10.5 }}>rivera@ridgewood.k12</div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ ...teacherWrap, padding: '28px 28px 80px' }}>
        {view === 'overview'    && <Overview cls={cls} onStudent={goStudent} onAssignment={goAssignment}/>}
        {view === 'assignments' && <AssignmentsList onAssignment={goAssignment}/>}
        {view === 'assignment'  && detailAssignment && (
          <AssignmentDetail a={detailAssignment} onBack={() => setView('assignments')} onStudent={goStudent}/>
        )}
        {view === 'students'    && <StudentsList onStudent={goStudent}/>}
        {view === 'student'     && detailStudent && (
          <StudentDetail s={detailStudent} onBack={() => setView('overview')}/>
        )}
        {view === 'self'        && <StudentSelf onBack={() => setView('overview')}/>}
      </main>
    </div>
  );
};
