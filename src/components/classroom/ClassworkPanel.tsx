'use client';
import { useEffect } from 'react';
import { Loader2, Tag } from 'lucide-react';
import { useClassroomStore } from '@/store/classroom-store';
import { classroomFetch } from '@/lib/classroom-api';
import type { ListCourseWorkResponse, ListTopicsResponse } from '@/lib/classroom-api';
import { AssignmentCard } from './AssignmentCard';

interface Props { courseId: string }

export function ClassworkPanel({ courseId }: Props) {
  const { getCourseData, setCourseData, setCourseDataLoading, courseDataLoading } = useClassroomStore();
  const data = getCourseData(courseId);
  const loading = courseDataLoading[courseId] ?? false;

  useEffect(() => {
    if (data?.coursework?.length > 0 || data?.topics?.length > 0) return;
    const load = async () => {
      setCourseDataLoading(courseId, true);
      try {
        const [cwRes, topicsRes] = await Promise.all([
          classroomFetch<ListCourseWorkResponse>(`/courses/${courseId}/coursework?orderBy=dueDate+asc`),
          classroomFetch<ListTopicsResponse>(`/courses/${courseId}/topics`),
        ]);
        setCourseData(courseId, {
          coursework: cwRes.courseWork ?? [],
          topics: topicsRes.topic ?? [],
        });
      } catch (e) {
        console.error('Classwork load error:', e);
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

  const topicMap = Object.fromEntries(
    (data.topics ?? []).map((t) => [t.topicId, t.name])
  );

  // Group coursework by topicId
  const grouped: Record<string, typeof data.coursework> = {};
  const noTopic: typeof data.coursework = [];

  for (const work of data.coursework ?? []) {
    if (work.topicId) {
      grouped[work.topicId] ??= [];
      grouped[work.topicId].push(work);
    } else {
      noTopic.push(work);
    }
  }

  const topicOrder = (data.topics ?? []).map((t) => t.topicId);

  if (data.coursework?.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600 text-sm">
        No assignments in this course yet.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Uncategorized */}
      {noTopic.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-zinc-500 text-xs uppercase tracking-wider">No Topic</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="space-y-2">
            {noTopic.map((w) => <AssignmentCard key={w.id} work={w} />)}
          </div>
        </div>
      )}

      {/* Topics in order */}
      {topicOrder.map((topicId) => {
        const works = grouped[topicId];
        if (!works?.length) return null;
        return (
          <div key={topicId}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Tag size={12} className="text-accent shrink-0" />
              <span className="text-accent text-sm font-medium">{topicMap[topicId] ?? 'Topic'}</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              {works.map((w) => <AssignmentCard key={w.id} work={w} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
