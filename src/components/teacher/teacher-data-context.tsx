// Teacher-dashboard data provider. Single source of truth for which roster +
// class the dashboard renders, so any component can stop importing the mock
// STUDENTS / ASSIGNMENTS / CLASSES arrays directly.
//
// Modes:
//   • Demo mode (`isReal === false`): everything comes from sample-data.ts.
//   • Real mode (`isReal === true`): class + students come from /api/classes;
//     assignments are empty (no schema yet). Metric fields on students (avg,
//     risk, mastery…) use safe defaults so the rest of the dashboard doesn't
//     NaN-out — charts label themselves as demo via the helpers below.
'use client';

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ASSIGNMENTS, CLASSES, STUDENTS,
  type Assignment, type ClassRecord, type Mastery, type Student, type TeacherTone,
} from './sample-data';
import type { AvatarOutfit } from '@/components/student/RobloxAvatar';

const DEFAULT_TONES: TeacherTone[] = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'];
const DEFAULT_EMOJIS = ['🐰','🦊','🦋','🐝','🦝','🦉','🐢','🐱','🐙','🐸','🐵','🦄'];

// A neutral avatar so real students render in the cardboard-head views before
// they've customised their own. Outfit style mirrors the existing RobloxAvatar
// defaults so it doesn't look broken.
const NEUTRAL_AVATAR: AvatarOutfit = {
  gender: 'boy',
  hair: 'short',
  hairColor: '#3a2a1a',
  shirt: '#5fa0d4',
  pants: '#2c4a6a',
  face: 'smile',
};

type RealStudentRow = {
  id: string;
  google_sub: string;
  email: string | null;
  full_name: string;
  given_name: string | null;
  family_name: string | null;
  picture_url: string | null;
  joined_at: string;
};

function realToStudent(row: RealStudentRow, i: number): Student {
  const zeroMastery: Mastery = { alg: 0, geo: 0, num: 0, prob: 0 };
  return {
    id: row.id,
    name: row.full_name,
    grade: '—',
    avg: 0,
    streak: 0,
    trend: 'flat',
    risk: 'none',
    lastActive: row.joined_at ? 'Joined' : '—',
    submitted: 0,
    mastery: zeroMastery,
    emoji: DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length],
    tone: DEFAULT_TONES[i % DEFAULT_TONES.length],
    avatar: NEUTRAL_AVATAR,
  };
}

export type TeacherData = {
  classRecord: ClassRecord;
  classes: ClassRecord[];
  students: Student[];
  assignments: Assignment[];
  isReal: boolean;
  classId: string | null;        // the real class's UUID (null in demo mode)
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const TeacherDataCtx = createContext<TeacherData | null>(null);

export const useTeacherData = (): TeacherData => {
  const v = useContext(TeacherDataCtx);
  if (!v) throw new Error('useTeacherData must be used inside <TeacherDataProvider>');
  return v;
};

export const TeacherDataProvider = ({ children }: { children: React.ReactNode }) => {
  const search = useSearchParams();
  const classId = search.get('classId');

  const [realClass, setRealClass] = useState<ClassRecord | null>(null);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!classId) {
      setRealClass(null);
      setRealStudents([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadClass = fetch(`/api/classes/${classId}`).then((r) => r.json().then((j) => ({ ok: r.ok, j })));
    const loadStudents = fetch(`/api/classes/${classId}/students`).then((r) => r.json().then((j) => ({ ok: r.ok, j })));

    Promise.all([loadClass, loadStudents])
      .then(([c, s]) => {
        if (cancelled) return;
        if (!c.ok) { setError(c.j?.error ?? 'Failed to load class'); return; }
        const classData = c.j.class;
        const tone: TeacherTone = (DEFAULT_TONES.includes(classData.color as TeacherTone)
          ? classData.color
          : 'butter') as TeacherTone;
        const studentRows: RealStudentRow[] = (s.ok && Array.isArray(s.j.students)) ? s.j.students : [];
        setRealClass({
          id: classData.id,
          name: classData.name,
          members: studentRows.length,
          avg: 0,
          tone,
          emoji: '🏷',
          period: '—',
        });
        setRealStudents(studentRows.map(realToStudent));
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Fetch failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [classId, tick]);

  const value = useMemo<TeacherData>(() => {
    if (classId && realClass) {
      return {
        classRecord: realClass,
        classes: [realClass],
        students: realStudents,
        assignments: [],   // no assignments schema yet
        isReal: true,
        classId,
        loading,
        error,
        refresh,
      };
    }
    // Demo mode — whole mock pack.
    return {
      classRecord: CLASSES[0],
      classes: CLASSES,
      students: STUDENTS,
      assignments: ASSIGNMENTS,
      isReal: false,
      classId: null,
      loading,
      error,
      refresh,
    };
  }, [classId, realClass, realStudents, loading, error, refresh]);

  return <TeacherDataCtx.Provider value={value}>{children}</TeacherDataCtx.Provider>;
};
