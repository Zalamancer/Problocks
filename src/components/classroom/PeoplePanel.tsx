'use client';
import { useEffect } from 'react';
import { Loader2, UserCircle2 } from 'lucide-react';
import { useClassroomStore } from '@/store/classroom-store';
import { classroomFetch } from '@/lib/classroom-api';
import type { ClassroomStudent, ClassroomTeacher } from '@/lib/classroom-api';

interface PeopleResponse {
  teachers: ClassroomTeacher[];
  students: ClassroomStudent[];
}

interface Props { courseId: string }

function Avatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl.startsWith('//') ? `https:${photoUrl}` : photoUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
      <UserCircle2 size={18} />
    </div>
  );
}

export function PeoplePanel({ courseId }: Props) {
  const { getCourseData, setCourseData, setCourseDataLoading, courseDataLoading } = useClassroomStore();
  const data = getCourseData(courseId);
  const loading = courseDataLoading[courseId] ?? false;

  useEffect(() => {
    if ((data?.teachers?.length ?? 0) > 0 || (data?.students?.length ?? 0) > 0) return;
    const load = async () => {
      setCourseDataLoading(courseId, true);
      try {
        const res = await classroomFetch<PeopleResponse>(`/courses/${courseId}/people`);
        setCourseData(courseId, {
          teachers: res.teachers ?? [],
          students: res.students ?? [],
        });
      } catch (e) {
        console.error('People load error:', e);
      } finally {
        setCourseDataLoading(courseId, false);
      }
    };
    load();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 space-y-6">
      {/* Teachers */}
      {data.teachers?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-zinc-400 text-sm font-medium">
              Teachers ({data.teachers.length})
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="space-y-2">
            {data.teachers.map((t) => (
              <div key={t.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03]">
                <Avatar photoUrl={t.profile.photoUrl} name={t.profile.name.fullName} />
                <div>
                  <p className="text-zinc-200 text-sm">{t.profile.name.fullName}</p>
                  {t.profile.emailAddress && (
                    <p className="text-zinc-500 text-xs">{t.profile.emailAddress}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students */}
      {data.students?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-zinc-400 text-sm font-medium">
              Students ({data.students.length})
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="space-y-1">
            {data.students.map((s) => (
              <div key={s.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03]">
                <Avatar photoUrl={s.profile.photoUrl} name={s.profile.name.fullName} />
                <div>
                  <p className="text-zinc-200 text-sm">{s.profile.name.fullName}</p>
                  {s.profile.emailAddress && (
                    <p className="text-zinc-500 text-xs">{s.profile.emailAddress}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.teachers?.length === 0 && data.students?.length === 0 && (
        <div className="text-center py-20 text-zinc-600 text-sm">No people data available.</div>
      )}
    </div>
  );
}
