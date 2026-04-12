'use client';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useClassroomStore } from '@/store/classroom-store';
import { classroomFetch } from '@/lib/classroom-api';
import type { ListAnnouncementsResponse, ListCourseWorkResponse } from '@/lib/classroom-api';
import { AnnouncementCard } from './AnnouncementCard';
import { AssignmentCard } from './AssignmentCard';

interface Props { courseId: string }

export function CourseStream({ courseId }: Props) {
  const { getCourseData, setCourseData, setCourseDataLoading, courseDataLoading } = useClassroomStore();
  const data = getCourseData(courseId);
  const loading = courseDataLoading[courseId] ?? false;

  useEffect(() => {
    if (data?.loadedAt && data.loadedAt > 0) return; // already loaded
    const load = async () => {
      setCourseDataLoading(courseId, true);
      try {
        const [annRes, cwRes] = await Promise.all([
          classroomFetch<ListAnnouncementsResponse>(`/courses/${courseId}/announcements`),
          classroomFetch<ListCourseWorkResponse>(`/courses/${courseId}/coursework`),
        ]);
        setCourseData(courseId, {
          announcements: annRes.announcements ?? [],
          coursework: cwRes.courseWork ?? [],
        });
      } catch (e) {
        console.error('Stream load error:', e);
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

  // Merge and sort announcements + coursework by creationTime descending
  type StreamItem =
    | { type: 'announcement'; item: typeof data.announcements[0]; time: number }
    | { type: 'coursework'; item: typeof data.coursework[0]; time: number };

  const items: StreamItem[] = [
    ...data.announcements.map((a) => ({
      type: 'announcement' as const,
      item: a,
      time: new Date(a.creationTime).getTime(),
    })),
    ...data.coursework.map((w) => ({
      type: 'coursework' as const,
      item: w,
      time: new Date(w.creationTime).getTime(),
    })),
  ].sort((a, b) => b.time - a.time);

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600 text-sm">
        No activity yet in this course.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {items.map((entry) =>
        entry.type === 'announcement' ? (
          <AnnouncementCard key={`ann-${entry.item.id}`} announcement={entry.item} />
        ) : (
          <AssignmentCard key={`cw-${entry.item.id}`} work={entry.item} />
        )
      )}
    </div>
  );
}
