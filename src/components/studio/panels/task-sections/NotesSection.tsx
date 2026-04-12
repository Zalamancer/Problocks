'use client';
import { PanelSection } from '@/components/ui/panel-controls';
import { LazyBlockNoteEditor } from './LazyBlockNoteEditor';

interface NotesSectionProps {
  noteBlocks?: unknown[];
  onNoteBlocksChange: (blocks: unknown[]) => void;
}

export function NotesSection({ noteBlocks, onNoteBlocksChange }: NotesSectionProps) {
  return (
    <PanelSection title="Notes" collapsible noBorder>
      <LazyBlockNoteEditor
        initialBlocks={noteBlocks}
        onChange={onNoteBlocksChange}
        placeholder="Write notes for this task..."
      />
    </PanelSection>
  );
}
