'use client';
import { ChevronLeft } from 'lucide-react';
import { useClassroomStore } from '@/store/classroom-store';
import type { ClassroomTab } from '@/store/classroom-store';
import { CourseStream } from './CourseStream';
import { ClassworkPanel } from './ClassworkPanel';
import { PeoplePanel } from './PeoplePanel';

const TABS: { id: ClassroomTab; label: string }[] = [
  { id: 'stream', label: 'Stream' },
  { id: 'classwork', label: 'Classwork' },
  { id: 'people', label: 'People' },
];

// Deterministic header gradient (same logic as CourseCard)
const CARD_COLORS = [
  'from-purple-600 to-purple-800',
  'from-blue-600 to-blue-800',
  'from-green-600 to-green-800',
  'from-orange-600 to-orange-800',
  'from-pink-600 to-pink-800',
  'from-teal-600 to-teal-800',
  'from-red-600 to-red-800',
  'from-indigo-600 to-indigo-800',
];
function courseColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

export function CourseView() {
  const { courses, selectedCourseId, selectCourse, activeTab, setActiveTab } = useClassroomStore();
  const course = courses.find((c) => c.id === selectedCourseId);

  if (!course || !selectedCourseId) return null;

  const color = courseColor(course.id);

  return (
    <div className="flex flex-col h-full">
      {/* Course header banner */}
      <div className={`relative shrink-0 bg-gradient-to-br ${color} px-6 pt-12 pb-5`}>
        <button
          onClick={() => selectCourse(null)}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} />
          All classes
        </button>
        <h1 className="text-white text-2xl font-bold leading-tight">{course.name}</h1>
        {course.section && <p className="text-white/70 text-sm mt-1">{course.section}</p>}
        {course.descriptionHeading && (
          <p className="text-white/60 text-sm mt-0.5">{course.descriptionHeading}</p>
        )}
        {course.room && <p className="text-white/50 text-xs mt-1">Room {course.room}</p>}
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-b border-white/[0.06] bg-zinc-900/60 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'stream' && <CourseStream courseId={selectedCourseId} />}
        {activeTab === 'classwork' && <ClassworkPanel courseId={selectedCourseId} />}
        {activeTab === 'people' && <PeoplePanel courseId={selectedCourseId} />}
      </div>
    </div>
  );
}
