'use client';
import { BookOpen, ExternalLink } from 'lucide-react';
import type { ClassroomCourse } from '@/lib/classroom-api';

// Deterministic color from course ID
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

interface Props {
  course: ClassroomCourse;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: Props) {
  const color = courseColor(course.id);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl overflow-hidden bg-zinc-900/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-accent/50"
    >
      {/* Color header */}
      <div className={`relative h-24 bg-gradient-to-br ${color} p-4`}>
        <p className="font-semibold text-white text-base leading-tight line-clamp-2">
          {course.name}
        </p>
        {course.section && (
          <p className="text-white/70 text-xs mt-1">{course.section}</p>
        )}
        {/* Decorative circle */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <BookOpen size={18} className="text-white/80" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          {course.descriptionHeading && (
            <p className="text-zinc-400 text-xs line-clamp-1">{course.descriptionHeading}</p>
          )}
          {course.room && (
            <p className="text-zinc-600 text-xs mt-0.5">Room {course.room}</p>
          )}
          {course.courseState === 'ARCHIVED' && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded mt-1 inline-block">
              Archived
            </span>
          )}
        </div>
        <a
          href={course.alternateLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
          title="Open in Google Classroom"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </button>
  );
}
