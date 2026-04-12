'use client';
import { ClipboardList, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import type { ClassroomCourseWork } from '@/lib/classroom-api';

function formatDueDate(dueDate?: ClassroomCourseWork['dueDate'], dueTime?: ClassroomCourseWork['dueTime']): string | null {
  if (!dueDate) return null;
  const d = new Date(dueDate.year, dueDate.month - 1, dueDate.day,
    dueTime?.hours ?? 23, dueTime?.minutes ?? 59);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return `Due ${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 7) return `Due in ${diffDays} days`;
  return `Due ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function dueDateColor(dueDate?: ClassroomCourseWork['dueDate']): string {
  if (!dueDate) return 'text-zinc-500';
  const d = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
  const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return 'text-red-400';
  if (diffDays <= 1) return 'text-orange-400';
  if (diffDays <= 3) return 'text-yellow-400';
  return 'text-zinc-500';
}

const WORK_TYPE_ICON: Record<string, React.ReactNode> = {
  ASSIGNMENT: <ClipboardList size={14} />,
  SHORT_ANSWER_QUESTION: <ClipboardList size={14} />,
  MULTIPLE_CHOICE_QUESTION: <ClipboardList size={14} />,
};

interface Props {
  work: ClassroomCourseWork;
}

export function AssignmentCard({ work }: Props) {
  const dueLabel = formatDueDate(work.dueDate, work.dueTime);
  const dueColor = dueDateColor(work.dueDate);
  const isPastDue = work.dueDate
    ? new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day) < new Date()
    : false;

  return (
    <div className="group bg-zinc-900/60 border border-white/[0.06] hover:border-white/[0.1] rounded-xl p-4 flex gap-3 transition-all">
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
        isPastDue ? 'bg-red-500/20 text-red-400' : 'bg-accent/20 text-accent'
      }`}>
        {isPastDue ? <CheckCircle2 size={14} /> : (WORK_TYPE_ICON[work.workType] ?? <ClipboardList size={14} />)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-zinc-200 text-sm font-medium leading-snug">{work.title}</p>
          <a
            href={work.alternateLink}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        {work.description && (
          <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{work.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {dueLabel && (
            <span className={`flex items-center gap-1 text-xs ${dueColor}`}>
              <Clock size={11} />
              {dueLabel}
            </span>
          )}
          {work.maxPoints != null && (
            <span className="text-xs text-zinc-600">{work.maxPoints} pts</span>
          )}
          <span className="text-xs text-zinc-600 capitalize">
            {work.workType.toLowerCase().replace(/_/g, ' ')}
          </span>
        </div>

        {/* Materials */}
        {work.materials && work.materials.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {work.materials.map((m, i) => {
              const label =
                m.driveFile?.driveFile.title ??
                m.youtubeVideo?.title ??
                m.link?.title ??
                m.form?.title ??
                'Attachment';
              const href =
                m.driveFile?.driveFile.alternateLink ??
                m.youtubeVideo?.alternateLink ??
                m.link?.url ??
                m.form?.formUrl ??
                '#';
              return (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md transition-colors"
                >
                  {label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
