'use client';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui';

const BlockNoteEditor = lazy(() => import('./BlockNoteEditor'));

interface LazyBlockNoteEditorProps {
  initialBlocks?: unknown[];
  onChange: (blocks: unknown[]) => void;
  placeholder?: string;
  editable?: boolean;
}

export function LazyBlockNoteEditor(props: LazyBlockNoteEditorProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BlockNoteEditor {...props} />
    </Suspense>
  );
}
