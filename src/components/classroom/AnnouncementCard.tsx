'use client';
import { Megaphone, ExternalLink } from 'lucide-react';
import type { ClassroomAnnouncement } from '@/lib/classroom-api';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface Props {
  announcement: ClassroomAnnouncement;
}

export function AnnouncementCard({ announcement }: Props) {
  return (
    <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-4 flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
        <Megaphone size={14} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
            {announcement.text}
          </p>
          <a
            href={announcement.alternateLink}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded"
            title="Open in Google Classroom"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Attached materials */}
        {announcement.materials && announcement.materials.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {announcement.materials.map((m, i) => {
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
                  className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg transition-colors"
                >
                  {label}
                </a>
              );
            })}
          </div>
        )}

        <p className="text-zinc-600 text-xs mt-2">{formatDate(announcement.creationTime)}</p>
      </div>
    </div>
  );
}
