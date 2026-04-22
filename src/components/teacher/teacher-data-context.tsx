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
import type {
  ClassroomCourseWork,
  ClassroomAnnouncement,
  ListCourseWorkResponse,
  ListAnnouncementsResponse,
} from '@/lib/classroom-api';

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
  // Google Classroom content, when this class is linked to a Classroom course
  // (classes.classroom_course_id). These come straight from the Classroom API
  // on every dashboard load, so they stay in sync with what the teacher sees
  // in Classroom itself (no copy stored in Supabase).
  classroomCourseId: string | null;
  classroomAssignments: ClassroomCourseWork[];
  classroomAnnouncements: ClassroomAnnouncement[];
  classroomLoading: boolean;
  classroomError: string | null;
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
  const [classroomCourseId, setClassroomCourseId] = useState<string | null>(null);
  const [classroomAssignments, setClassroomAssignments] = useState<ClassroomCourseWork[]>([]);
  const [classroomAnnouncements, setClassroomAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);
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
        setClassroomCourseId(classData.classroom_course_id ?? null);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Fetch failed'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [classId, tick]);

  // When the class is linked to a Google Classroom course, pull the current
  // coursework + announcements on every dashboard load. We go through our
  // /api/classroom/* proxies so the access token stays server-side. Filtered
  // to PUBLISHED only — drafts and deleted entries shouldn't leak into the
  // teacher dashboard and confuse the assignment counts.
  useEffect(() => {
    if (!classroomCourseId) {
      setClassroomAssignments([]);
      setClassroomAnnouncements([]);
      setClassroomError(null);
      return;
    }
    let cancelled = false;
    setClassroomLoading(true);
    setClassroomError(null);

    const coursework = fetch(
      `/api/classroom/courses/${classroomCourseId}/coursework?courseWorkStates=PUBLISHED&pageSize=100&orderBy=updateTime desc`,
    ).then((r) => r.json().then((j: ListCourseWorkResponse & { error?: string }) => ({ ok: r.ok, j })));
    const announcements = fetch(
      `/api/classroom/courses/${classroomCourseId}/announcements?announcementStates=PUBLISHED&pageSize=50`,
    ).then((r) => r.json().then((j: ListAnnouncementsResponse & { error?: string }) => ({ ok: r.ok, j })));

    Promise.all([coursework, announcements])
      .then(([cw, an]) => {
        if (cancelled) return;
        if (!cw.ok) {
          setClassroomError(cw.j?.error ?? 'Failed to load Classroom content');
          return;
        }
        setClassroomAssignments(cw.j.courseWork ?? []);
        setClassroomAnnouncements(an.ok ? (an.j.announcements ?? []) : []);
      })
      .catch((e) => {
        if (!cancelled) setClassroomError(e instanceof Error ? e.message : 'Classroom fetch failed');
      })
      .finally(() => { if (!cancelled) setClassroomLoading(false); });

    return () => { cancelled = true; };
  }, [classroomCourseId, tick]);

  const value = useMemo<TeacherData>(() => {
    if (classId && realClass) {
      return {
        classRecord: realClass,
        classes: [realClass],
        students: realStudents,
        assignments: [],   // no Playdemy-native assignments schema yet — classroomAssignments below carries the imported Google Classroom items
        isReal: true,
        classId,
        loading,
        error,
        refresh,
        classroomCourseId,
        classroomAssignments,
        classroomAnnouncements,
        classroomLoading,
        classroomError,
      };
    }
    // Demo mode — whole mock pack. Classroom fields stay empty so demo users
    // don't see a spurious "From Google Classroom" card backed by real API
    // calls they never authorised.
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
      classroomCourseId: null,
      classroomAssignments: [],
      classroomAnnouncements: [],
      classroomLoading: false,
      classroomError: null,
    };
  }, [
    classId, realClass, realStudents, loading, error, refresh,
    classroomCourseId, classroomAssignments, classroomAnnouncements,
    classroomLoading, classroomError,
  ]);

  return <TeacherDataCtx.Provider value={value}>{children}</TeacherDataCtx.Provider>;
};
