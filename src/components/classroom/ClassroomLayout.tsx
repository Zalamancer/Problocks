'use client';
import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { GraduationCap, Loader2, LogIn } from 'lucide-react';
import { useClassroomStore } from '@/store/classroom-store';
import { classroomFetch } from '@/lib/classroom-api';
import type { ListCoursesResponse } from '@/lib/classroom-api';
import { CourseCard } from './CourseCard';
import { CourseView } from './CourseView';
import { PanelActionButton } from '@/components/ui';

export function ClassroomLayout() {
  const { data: session, status } = useSession();
  const {
    courses,
    setCourses,
    setCoursesLoading,
    setCoursesError,
    coursesLoading,
    coursesError,
    selectedCourseId,
    selectCourse,
  } = useClassroomStore();

  // Load courses when authenticated
  useEffect(() => {
    if (status !== 'authenticated') return;
    const load = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        const res = await classroomFetch<ListCoursesResponse>('/courses');
        setCourses(res.courses ?? []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load courses';
        setCoursesError(message);
      } finally {
        setCoursesLoading(false);
      }
    };
    load();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
        <div className="flex flex-col items-center gap-3 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <GraduationCap size={28} className="text-green-400" />
          </div>
          <h2 className="text-zinc-100 text-xl font-semibold">Connect Google Classroom</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sign in with Google to browse your courses, assignments, and classmates.
          </p>
        </div>
        <PanelActionButton
          onClick={() => signIn('google')}
          variant="accent"
          icon={LogIn}
        >
          Sign in with Google
        </PanelActionButton>
      </div>
    );
  }

  // ── Loading session ────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={20} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  // ── Token expired ──────────────────────────────────────────────────────────
  if (session?.error === 'AccessTokenExpired') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-zinc-400 text-sm">Your session has expired.</p>
        <PanelActionButton onClick={() => signIn('google')} variant="accent" icon={LogIn}>
          Re-authenticate
        </PanelActionButton>
      </div>
    );
  }

  // ── Course detail view ─────────────────────────────────────────────────────
  if (selectedCourseId) {
    return (
      <div className="h-full bg-zinc-950 overflow-hidden">
        <CourseView />
      </div>
    );
  }

  // ── Course grid ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-zinc-100 text-2xl font-bold">My Classes</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {session?.user?.email ?? ''}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
        {coursesLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-zinc-500" />
          </div>
        )}

        {coursesError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
            {coursesError}
          </div>
        )}

        {!coursesLoading && !coursesError && courses.length === 0 && (
          <div className="text-center py-20 text-zinc-600 text-sm">
            No courses found. Make sure you have courses in Google Classroom.
          </div>
        )}

        {courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => selectCourse(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
