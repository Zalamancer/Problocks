// Micro-question panel with tap-answer options or numeric input.
// Ported from the design's micro.jsx.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import {
  WhiteboardCanvas,
  type WhiteboardHandle,
} from '@/components/quiz/WhiteboardCanvas';
import type { Answer, ChoiceOption, Micro } from './types';

type MicroQuestionProps = {
  micro: Micro;
  // Surrounding part's full text, so the whiteboard reviewer can pass
  // it to the tutor model as additional context. Optional — falls back
  // to the micro prompt alone when missing.
  partText?: string;
  answered: boolean;
  selected?: Answer;
  onAnswer: (answer: Answer) => void;
};

export function MicroQuestion({ micro, partText, answered, selected, onAnswer }: MicroQuestionProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 12.5,
          color: 'var(--pb-ink)',
          fontWeight: 700,
          lineHeight: 1.4,
        }}
      >
        {micro.prompt}
      </div>

      {micro.kind === 'choice' && (
        <ChoiceGrid
          micro={micro}
          answered={answered}
          selected={selected as ChoiceOption | undefined}
          onAnswer={onAnswer}
        />
      )}

      {micro.kind === 'number' && (
        <NumberAnswer
          micro={micro}
          answered={answered}
          selected={selected as { id: 'num'; value: number; correct: boolean } | undefined}
          onAnswer={onAnswer}
        />
      )}

      {micro.kind === 'whiteboard' && (
        <WhiteboardAnswer
          micro={micro}
          partText={partText}
          answered={answered}
          selected={selected as { id: 'wb'; dataUrl: string; correct: boolean } | undefined}
          onAnswer={onAnswer}
        />
      )}
    </div>
  );
}

function WhiteboardAnswer({
  micro,
  partText,
  answered,
  selected,
  onAnswer,
}: {
  micro: Extract<Micro, { kind: 'whiteboard' }>;
  partText?: string;
  answered: boolean;
  selected?: { id: 'wb'; dataUrl: string; correct: boolean };
  onAnswer: (answer: Answer) => void;
}) {
  const ref = useRef<WhiteboardHandle | null>(null);
  const submitBtnRef = useRef<HTMLButtonElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  // The homework page is fixed-height with internal scroll columns,
  // and the canvas is tall enough that the Submit button can fall
  // below the fold the moment the part is expanded. Scroll the
  // button into view on mount so the user never misses it.
  useEffect(() => {
    if (selected?.dataUrl) return; // already submitted
    const t = setTimeout(() => {
      submitBtnRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 80);
    return () => clearTimeout(t);
  }, [selected?.dataUrl]);

  const requestTutorReview = useCallback(
    async (dataUrl: string) => {
      // Tell the tutor chat we're working on a review so the user
      // sees something happen the moment they hit Submit.
      window.dispatchEvent(
        new CustomEvent('tutor:push', {
          detail: { text: 'Looking at your drawing now…' },
        }),
      );
      try {
        const res = await fetch('/api/tutor-review', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            image: dataUrl,
            microPrompt: micro.prompt,
            partText: partText ?? '',
            hint: micro.hint ?? '',
          }),
        });
        const data = (await res.json()) as { text?: string; error?: string };
        const text =
          (res.ok && data.text) ||
          `I couldn't review your drawing (${data.error ?? 'unknown error'}).`;
        window.dispatchEvent(
          new CustomEvent('tutor:push', { detail: { text } }),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        window.dispatchEvent(
          new CustomEvent('tutor:push', {
            detail: { text: `Review failed: ${msg}` },
          }),
        );
      }
    },
    [micro.prompt, micro.hint, partText],
  );

  const submit = useCallback(async () => {
    if (!ref.current) return;
    if (!ref.current.hasContent()) {
      setWarn('Draw something before submitting.');
      return;
    }
    setBusy(true);
    setWarn(null);
    try {
      const blob = await ref.current.getPngBlob();
      if (!blob) {
        setWarn('Could not snapshot the canvas.');
        return;
      }
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result ?? ''));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });
      onAnswer({ id: 'wb', dataUrl, correct: true });
      // Fire-and-forget so the UI doesn't block on the API call.
      void requestTutorReview(dataUrl);
    } finally {
      setBusy(false);
    }
  }, [onAnswer, requestTutorReview]);

  if (selected?.dataUrl) {
    // Once a drawing has been captured, swap the live canvas for the
    // saved PNG. We do this whether or not the homework has been
    // graded — the student should not be able to keep editing strokes
    // after they hit Submit (the dataUrl is the answer of record).
    const accent = answered
      ? selected.correct
        ? 'var(--pb-mint-ink)'
        : 'var(--pb-coral-ink)'
      : 'var(--pb-line-2)';
    return (
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            border: `1.5px solid ${accent}`,
            boxShadow: `0 2px 0 ${accent}`,
            alignSelf: 'flex-start',
            maxWidth: 320,
          }}
        >
          <img
            src={selected.dataUrl}
            alt="Your drawing"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
          {answered
            ? 'Submitted — graded for participation.'
            : 'Drawing locked in. Hit "Grade with rubric" when you\'re done with the rest.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {micro.hint && (
        <div style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)', lineHeight: 1.5 }}>
          {micro.hint}
        </div>
      )}
      <WhiteboardCanvas ref={ref} width={320} height={220} disabled={busy} theme="light" />
      {warn && (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            background: 'var(--pb-coral)',
            border: '1.5px solid var(--pb-coral-ink)',
            color: 'var(--pb-coral-ink)',
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          {warn}
        </div>
      )}
      <button
        ref={submitBtnRef}
        type="button"
        onClick={submit}
        disabled={busy}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 14px',
          borderRadius: 10,
          background: 'var(--pb-butter)',
          color: 'var(--pb-butter-ink)',
          border: '1.5px solid var(--pb-butter-ink)',
          boxShadow: '0 2px 0 var(--pb-butter-ink)',
          fontSize: 12,
          fontWeight: 800,
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Saving…' : 'Submit drawing'}
      </button>
    </div>
  );
}

type State = 'idle' | 'right' | 'wrong' | 'dim';

function ChoiceGrid({
  micro,
  answered,
  selected,
  onAnswer,
}: {
  micro: Extract<Micro, { kind: 'choice' }>;
  answered: boolean;
  selected?: ChoiceOption;
  onAnswer: (answer: Answer) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
      {micro.options.map((o) => {
        const isSelected = selected?.id === o.id;
        const state: State = !answered ? 'idle' : o.correct ? 'right' : isSelected ? 'wrong' : 'dim';
        const palette = PALETTE[state];
        return (
          <button
            key={o.id}
            type="button"
            disabled={answered}
            onClick={() => onAnswer(o)}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 11,
              background: palette.bg,
              border: `1.5px solid ${palette.bd}`,
              boxShadow: palette.shadow,
              color: palette.fg,
              fontSize: 13,
              fontWeight: 600,
              opacity: state === 'dim' ? 0.55 : 1,
              transition: 'all 0.2s',
              cursor: answered ? 'default' : 'pointer',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 7,
                flexShrink: 0,
                background:
                  state === 'right'
                    ? 'var(--pb-mint-ink)'
                    : state === 'wrong'
                    ? 'var(--pb-coral-ink)'
                    : 'var(--pb-cream-2)',
                color:
                  state === 'right' || state === 'wrong' ? 'var(--pb-paper)' : 'var(--pb-ink-soft)',
                border: `1.5px solid ${
                  state === 'right'
                    ? 'var(--pb-mint-ink)'
                    : state === 'wrong'
                    ? 'var(--pb-coral-ink)'
                    : 'var(--pb-line-2)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {state === 'right' ? (
                <Icon name="check" size={12} stroke={3} />
              ) : state === 'wrong' ? (
                <Icon name="x" size={11} stroke={3} />
              ) : (
                o.id
              )}
            </span>
            <span style={{ flex: 1 }}>{o.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function NumberAnswer({
  micro,
  answered,
  selected,
  onAnswer,
}: {
  micro: Extract<Micro, { kind: 'number' }>;
  answered: boolean;
  selected?: { id: 'num'; value: number; correct: boolean };
  onAnswer: (answer: Answer) => void;
}) {
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue('');
  }, [micro.id]);

  const parsed = parseFloat(value);
  const valid = !Number.isNaN(parsed);
  const submit = (val: number) => {
    onAnswer({ id: 'num', value: val, correct: Math.abs(val - micro.answer) <= micro.tol });
  };
  const displayed = answered && selected ? selected.value : value;

  const accentBorder = answered
    ? selected?.correct
      ? 'var(--pb-mint-ink)'
      : 'var(--pb-coral-ink)'
    : 'var(--pb-ink)';

  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 8,
          padding: 4,
          borderRadius: 12,
          background: 'var(--pb-paper)',
          border: `1.5px solid ${accentBorder}`,
          boxShadow: `0 2px 0 ${accentBorder}`,
        }}
      >
        <input
          type="text"
          inputMode="decimal"
          disabled={answered}
          value={displayed}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) submit(parsed);
          }}
          placeholder="Type your answer…"
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            outline: 'none',
            background: 'transparent',
            color: 'var(--pb-ink)',
            fontSize: 18,
            fontWeight: 700,
            padding: '8px 10px',
            fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
          }}
        />
        {micro.unit && (
          <span
            style={{
              alignSelf: 'center',
              padding: '0 6px',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--pb-ink-muted)',
            }}
          >
            {micro.unit}
          </span>
        )}
        <button
          type="button"
          disabled={!valid || answered}
          onClick={() => submit(parsed)}
          style={{
            padding: '0 14px',
            borderRadius: 9,
            background: 'var(--pb-butter)',
            color: 'var(--pb-butter-ink)',
            border: '1.5px solid var(--pb-butter-ink)',
            boxShadow: '0 2px 0 var(--pb-butter-ink)',
            fontSize: 12,
            fontWeight: 800,
            opacity: valid && !answered ? 1 : 0.45,
            cursor: valid && !answered ? 'pointer' : 'default',
          }}
        >
          Check
        </button>
      </div>
      {answered && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--pb-ink-muted)' }}>
          Accepted: {micro.answer} ± {micro.tol}
        </div>
      )}
    </div>
  );
}

const PALETTE: Record<State, { bg: string; bd: string; fg: string; shadow: string }> = {
  idle: {
    bg: 'var(--pb-paper)',
    bd: 'var(--pb-line-2)',
    fg: 'var(--pb-ink)',
    shadow: '0 2px 0 var(--pb-line-2)',
  },
  right: {
    bg: 'var(--pb-mint)',
    bd: 'var(--pb-mint-ink)',
    fg: 'var(--pb-mint-ink)',
    shadow: '0 2px 0 var(--pb-mint-ink)',
  },
  wrong: {
    bg: 'var(--pb-coral)',
    bd: 'var(--pb-coral-ink)',
    fg: 'var(--pb-coral-ink)',
    shadow: '0 2px 0 var(--pb-coral-ink)',
  },
  dim: {
    bg: 'var(--pb-paper)',
    bd: 'var(--pb-line-2)',
    fg: 'var(--pb-ink-muted)',
    shadow: 'none',
  },
};
