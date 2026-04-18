'use client';
import { useState } from 'react';
import { CirclePlay, FileText, Link2, File, StickyNote, X } from 'lucide-react';
import {
  PanelSection,
  PanelSelect,
  PanelInput,
  PanelTextarea,
  PanelActionButton,
} from '@/components/ui/panel-controls';
import type { ResourceAttachment, ResourceType } from '@/lib/templates/types';

const TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'article', label: 'Article / Link' },
  { value: 'note',    label: 'Note' },
  { value: 'pdf',     label: 'PDF' },
  { value: 'file',    label: 'File' },
];

const TYPE_ICON: Record<ResourceType, typeof CirclePlay> = {
  youtube: CirclePlay,
  article: Link2,
  note:    StickyNote,
  pdf:     FileText,
  file:    File,
};

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

interface AttachmentsSectionProps {
  attachments: ResourceAttachment[];
  currentUserId: string;
  onAddAttachment: (attachment: ResourceAttachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

export function AttachmentsSection({
  attachments,
  currentUserId,
  onAddAttachment,
  onRemoveAttachment,
}: AttachmentsSectionProps) {
  const [type, setType] = useState<ResourceType>('article');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const needsUrl = type !== 'note';

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    if (needsUrl && !url.trim()) return;

    onAddAttachment({
      id: crypto.randomUUID().slice(0, 12),
      type,
      url: url.trim(),
      title: trimmedTitle,
      description: desc.trim() || undefined,
      addedAt: new Date().toISOString(),
      addedBy: currentUserId,
    });
    setUrl('');
    setTitle('');
    setDesc('');
  };

  return (
    <>
      <PanelSection title="Add Resource" collapsible defaultOpen={false}>
        <div className="flex flex-col gap-2">
          <PanelSelect
            value={type}
            onChange={(v) => setType(v as ResourceType)}
            options={TYPE_OPTIONS}
            fullWidth
          />
          {needsUrl && (
            <PanelInput
              value={url}
              onChange={setUrl}
              placeholder="URL"
              fullWidth
            />
          )}
          <PanelInput
            value={title}
            onChange={setTitle}
            placeholder="Title"
            fullWidth
          />
          <PanelTextarea
            value={desc}
            onChange={setDesc}
            placeholder="Description (optional)"
            rows={2}
          />
          <PanelActionButton
            variant="secondary"
            size="sm"
            onClick={handleAdd}
            disabled={!title.trim() || (needsUrl && !url.trim())}
            fullWidth
          >
            Attach
          </PanelActionButton>
        </div>
      </PanelSection>

      <PanelSection title="Resources" collapsible badge={attachments.length} noBorder>
        {attachments.length === 0 ? (
          <p
            className="italic"
            style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}
          >
            No resources attached.
          </p>
        ) : (
          <div className="space-y-2">
            {attachments.map((a) => {
              const Icon = TYPE_ICON[a.type];
              const ytId = a.type === 'youtube' ? extractYouTubeId(a.url) : null;
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-2"
                  style={{
                    background: 'var(--pb-paper)',
                    border: '1.5px solid var(--pb-line-2)',
                    borderRadius: 10,
                    padding: '9px 10px',
                  }}
                >
                  <Icon
                    size={14}
                    strokeWidth={2.2}
                    className="shrink-0 mt-0.5"
                    style={{ color: 'var(--pb-grape-ink)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate"
                      style={{ fontSize: 12, fontWeight: 600, color: 'var(--pb-ink)' }}
                    >
                      {a.title}
                    </p>
                    {a.url && (
                      <p
                        className="truncate"
                        style={{
                          fontSize: 10,
                          fontFamily: 'DM Mono, monospace',
                          color: 'var(--pb-ink-muted)',
                        }}
                      >
                        {a.url}
                      </p>
                    )}
                    {ytId && (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt=""
                        className="mt-1.5 w-full aspect-video object-cover"
                        style={{ borderRadius: 6, border: '1.5px solid var(--pb-line-2)' }}
                      />
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveAttachment(a.id)}
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: 'var(--pb-paper)',
                      border: '1.5px solid var(--pb-line-2)',
                      color: 'var(--pb-ink-soft)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--pb-coral-ink)';
                      e.currentTarget.style.color = 'var(--pb-coral-ink)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--pb-line-2)';
                      e.currentTarget.style.color = 'var(--pb-ink-soft)';
                    }}
                    aria-label="Remove"
                  >
                    <X size={11} strokeWidth={2.4} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </PanelSection>
    </>
  );
}
