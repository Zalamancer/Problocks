'use client';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

interface BlockNoteEditorProps {
  initialBlocks?: unknown[];
  onChange: (blocks: unknown[]) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function BlockNoteEditor({
  initialBlocks,
  onChange,
  placeholder,
  editable = true,
}: BlockNoteEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useCreateBlockNote({
    initialContent: initialBlocks?.length
      ? (initialBlocks as Parameters<typeof useCreateBlockNote>[0] extends { initialContent?: infer T } ? T : never)
      : undefined,
    ...(placeholder ? { placeholders: { default: placeholder } } : {}),
  });

  // Debounced onChange — 300ms to avoid hammering the store on every keystroke
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChangeRef.current(editor.document as unknown[]);
    }, 300);
  }, [editor]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="blocknote-wrapper" data-theming="dark">
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme="dark"
      />
    </div>
  );
}
