'use client';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { PanelInput } from '@/components/ui/panel-controls';
import { LazyBlockNoteEditor } from './LazyBlockNoteEditor';

export type ExpandableField = 'title' | 'description';

interface ExpandedFieldEditorProps {
  field: ExpandableField;
  title: string;
  descriptionBlocks?: unknown[];
  onTitleChange: (v: string) => void;
  onDescriptionBlocksChange: (blocks: unknown[]) => void;
  onClose: () => void;
}

export function ExpandedFieldEditor({
  field,
  title,
  descriptionBlocks,
  onTitleChange,
  onDescriptionBlocksChange,
  onClose,
}: ExpandedFieldEditorProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-zinc-900/95 backdrop-blur-xl rounded-xl overflow-hidden border border-white/[0.06]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-medium text-zinc-200">
          {field === 'title' ? 'Edit Title' : 'Edit Description'}
        </span>
        <IconButton
          icon={X}
          variant="ghost"
          size="sm"
          onClick={onClose}
          tooltip="Close"
          aria-label="Close editor"
        />
      </div>

      {/* Editor area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {field === 'title' ? (
          <div className="max-w-2xl mx-auto pt-8">
            <label className="text-xs text-zinc-500 mb-2 block">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full bg-transparent text-2xl font-semibold text-zinc-100 border-none outline-none placeholder:text-zinc-700"
              placeholder="Task title..."
              autoFocus
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto h-full">
            <LazyBlockNoteEditor
              initialBlocks={descriptionBlocks}
              onChange={onDescriptionBlocksChange}
              placeholder="Write a detailed description..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
