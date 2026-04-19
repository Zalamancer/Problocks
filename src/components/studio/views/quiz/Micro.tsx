'use client';

import { Check, X, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Micro } from '@/lib/quiz/frq-content';

export interface AnswerPayload {
  id: string;
  value?: number;
  text?: string;
  correct: boolean;
}

// Visual state of an option button after the student answers.
type OptionState = 'idle' | 'right' | 'wrong' | 'dim';

const OPTION_PALETTE: Record<OptionState, { bg: string; bd: string; fg: string; shadow: string }> = {
  idle:  { bg: 'var(--pb-paper)', bd: 'var(--pb-line-2)',   fg: 'var(--pb-ink)',        shadow: '0 2px 0 var(--pb-line-2)' },
  right: { bg: 'var(--pb-mint)',  bd: 'var(--pb-mint-ink)', fg: 'var(--pb-mint-ink)',   shadow: '0 2px 0 var(--pb-mint-ink)' },
  wrong: { bg: 'var(--pb-coral)', bd: 'var(--pb-coral-ink)', fg: 'var(--pb-coral-ink)', shadow: '0 2px 0 var(--pb-coral-ink)' },
  dim:   { bg: 'var(--pb-paper)', bd: 'var(--pb-line-2)',   fg: 'var(--pb-ink-muted)',  shadow: 'none' },
};

export function MicroQuestion({
  micro,
  answered,
  selected,
  onAnswer,
}: {
  micro: Micro;
  answered: boolean;
  selected: AnswerPayload | null;
  onAnswer: (a: AnswerPayload) => void;
}) {
  const [numInput, setNumInput] = useState('');
  // Clear the numeric field when the micro changes — otherwise the old
  // value lingers into the next question.
  useEffect(() => {
    setNumInput('');
  }, [micro.id]);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {micro.options.map((o) => {
            const isSelected = selected?.id === o.id;
            const state: OptionState = !answered
              ? 'idle'
              : o.correct
              ? 'right'
              : isSelected
              ? 'wrong'
              : 'dim';
            const p = OPTION_PALETTE[state];
            return (
              <button
                key={o.id}
                type="button"
                disabled={answered}
                onClick={() =>
                  onAnswer({ id: o.id, text: o.text, correct: o.correct })
                }
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 11,
                  background: p.bg,
                  border: `1.5px solid ${p.bd}`,
                  boxShadow: p.shadow,
                  color: p.fg,
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
                      state === 'right' || state === 'wrong'
                        ? 'var(--pb-paper)'
                        : 'var(--pb-ink-soft)',
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
                    <Check size={12} strokeWidth={3} />
                  ) : state === 'wrong' ? (
                    <X size={11} strokeWidth={3} />
                  ) : (
                    o.id
                  )}
                </span>
                <span style={{ flex: 1 }}>{o.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {micro.kind === 'number' && (
        <NumberAnswer
          micro={micro}
          answered={answered}
          selected={selected}
          value={numInput}
          onChange={setNumInput}
          onSubmit={(val) =>
            onAnswer({
              id: 'num',
              value: val,
              correct: Math.abs(val - micro.answer) <= micro.tol,
            })
          }
        />
      )}
    </div>
  );
}

function NumberAnswer({
  micro,
  answered,
  selected,
  value,
  onChange,
  onSubmit,
}: {
  micro: Extract<Micro, { kind: 'number' }>;
  answered: boolean;
  selected: AnswerPayload | null;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: number) => void;
}) {
  const parsed = parseFloat(value);
  const valid = !isNaN(parsed);
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
          border: `1.5px solid ${
            answered
              ? selected?.correct
                ? 'var(--pb-mint-ink)'
                : 'var(--pb-coral-ink)'
              : 'var(--pb-ink)'
          }`,
          boxShadow: answered
            ? `0 2px 0 ${selected?.correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)'}`
            : '0 2px 0 var(--pb-ink)',
        }}
      >
        <input
          type="text"
          inputMode="decimal"
          autoFocus
          disabled={answered}
          value={answered ? String(selected?.value ?? value) : value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) onSubmit(parsed);
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
            fontFamily: 'DM Mono, ui-monospace, monospace',
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
          onClick={() => onSubmit(parsed)}
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

export function FeedbackCard({
  correct,
  explain,
  onNext,
  countdown,
}: {
  correct: boolean;
  explain: string;
  onNext: () => void;
  countdown: number | null;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        background: correct ? 'var(--pb-mint)' : 'var(--pb-coral)',
        border: `1.5px solid ${correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)'}`,
        boxShadow: `0 3px 0 ${correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)'}`,
        color: correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          flexShrink: 0,
          background: correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)',
          color: correct ? 'var(--pb-mint)' : 'var(--pb-coral)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {correct ? <Check size={14} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {correct ? "Nice — that's right" : 'Not quite'}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 3, lineHeight: 1.4 }}>
          {explain}
        </div>
      </div>
      <button
        type="button"
        onClick={onNext}
        style={{
          alignSelf: 'center',
          padding: '6px 10px',
          borderRadius: 8,
          background: correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)',
          color: correct ? 'var(--pb-mint)' : 'var(--pb-coral)',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
        }}
      >
        Next{countdown != null ? ` ${countdown}` : ''}
        <ArrowRight size={11} strokeWidth={3} />
      </button>
    </div>
  );
}
