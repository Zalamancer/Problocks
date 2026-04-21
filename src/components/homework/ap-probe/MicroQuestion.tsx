// Micro-question panel with tap-answer options or numeric input.
// Ported from the design's micro.jsx.

'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { Answer, ChoiceOption, Micro } from './types';

type MicroQuestionProps = {
  micro: Micro;
  answered: boolean;
  selected?: Answer;
  onAnswer: (answer: Answer) => void;
};

export function MicroQuestion({ micro, answered, selected, onAnswer }: MicroQuestionProps) {
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
