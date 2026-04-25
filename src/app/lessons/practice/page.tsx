'use client';

import { Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getKhanQuestionsByHref,
  getOpenStaxBank,
  type PracticeQuestion,
} from '@/lib/templates/data/curriculum-deep';
import { Icon } from '@/components/landing/pb-site/primitives';

import '@/components/landing/pb-site/styles.css';

type Tone = 'butter' | 'mint' | 'pink';

const PALETTE_VARS: CSSProperties = {
  '--pbs-cream': '#fdf6e6',
  '--pbs-paper': '#fffaf0',
  '--pbs-cream-2': '#f7edd4',
  '--pbs-line': '#e8dcbc',
  '--pbs-line-2': '#d6c896',
  '--pbs-ink': '#1d1a14',
  '--pbs-ink-soft': '#57524a',
  '--pbs-ink-muted': '#8a8478',
} as CSSProperties;

function resolveQuestions(key: string): { questions: PracticeQuestion[]; title: string; tone: Tone; backHref: string; sourceUrl?: string } {
  if (key.startsWith('khan:')) {
    const href = key.slice('khan:'.length);
    return {
      questions: getKhanQuestionsByHref(href),
      title: 'Khan Academy practice',
      tone: 'butter',
      backHref: '/lessons',
      sourceUrl: href.startsWith('/') ? `https://www.khanacademy.org${href}` : href,
    };
  }
  if (key.startsWith('openstax:')) {
    const slug = key.slice('openstax:'.length);
    const [subjectId, gradeKey] = slug.split('|');
    return {
      questions: getOpenStaxBank(subjectId, gradeKey),
      title: 'OpenStax practice bank',
      tone: subjectId === 'science' ? 'mint' : 'butter',
      backHref: '/lessons',
    };
  }
  return { questions: [], title: 'Practice', tone: 'butter', backHref: '/lessons' };
}

function parsePrompt(prompt: string): { text: string; options: string[]; isMultiSelect: boolean } {
  // Khan format: "<question>?Choose 1 answer:\n\nOptions: A foo | B bar | C baz | D qux"
  // or "<question>?Choose 2 answers:\n\nOptions: ..."
  const optMatch = prompt.match(/Options:\s*(.+)$/s);
  if (!optMatch) return { text: prompt.trim(), options: [], isMultiSelect: false };
  const head = prompt.slice(0, prompt.indexOf('Options:')).trim();
  const optsRaw = optMatch[1].trim();
  const options = optsRaw.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean);
  const isMultiSelect = /Choose\s+\d+\s+answers/i.test(head) && !/Choose\s+1\s+answer/i.test(head);
  return { text: head, options, isMultiSelect };
}

function stripLeadingLetter(option: string): { letter: string; body: string } {
  const m = option.match(/^([A-Z])\b\s*[\.:)]?\s*(.*)$/s);
  if (!m) return { letter: '', body: option };
  return { letter: m[1], body: m[2].trim() };
}

function isAnswerLetter(answer: string, letter: string): boolean {
  return new RegExp(`(^|[^A-Z])${letter}([^A-Z]|$)`).test(answer);
}

function PracticeRunner({ keyParam }: { keyParam: string }) {
  const router = useRouter();
  const { questions, title, tone, backHref, sourceUrl } = useMemo(() => resolveQuestions(keyParam), [keyParam]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const current = questions[index];
  const total = questions.length;

  useEffect(() => {
    setRevealed(false);
    setSelected([]);
  }, [index]);

  if (total === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>No questions found</h2>
        <p style={{ color: 'var(--pbs-ink-soft)' }}>This practice set is empty.</p>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="pbs-chunky pbs-chunky-ink"
          style={{ marginTop: 24, padding: '10px 18px' }}
        >
          Back to lessons
        </button>
      </div>
    );
  }

  if (index >= total) {
    return (
      <div style={{ padding: 60, textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
        <div style={{
          fontSize: 64, marginBottom: 8,
          color: `var(--pbs-${tone}-ink)`,
        }}>★</div>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          You finished!
        </h2>
        <p style={{ color: 'var(--pbs-ink-soft)', fontSize: 16, marginBottom: 24 }}>
          {total} questions complete.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => { setIndex(0); }}
            className="pbs-chunky pbs-chunky-butter"
            style={{ padding: '10px 18px' }}
          >
            Practice again
          </button>
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="pbs-chunky pbs-chunky-ink"
            style={{ padding: '10px 18px' }}
          >
            Back to lessons
          </button>
        </div>
      </div>
    );
  }

  const parsed = parsePrompt(current.prompt);
  const hasOptions = parsed.options.length > 0;

  const onSelect = (letter: string) => {
    if (revealed) return;
    if (parsed.isMultiSelect) {
      setSelected((prev) => prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]);
    } else {
      setSelected([letter]);
    }
  };

  return (
    <div style={{
      maxWidth: 760, margin: '0 auto', padding: '32px 24px',
      display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100vh',
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, paddingBottom: 12, borderBottom: '1.5px solid var(--pbs-line)',
      }}>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: 'transparent', color: 'var(--pbs-ink-soft)',
            border: '1.5px solid var(--pbs-line-2)',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}
        >
          ← Exit
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)' }}>
            {title}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{
                width: i === index ? 22 : 8, height: 8, borderRadius: 4,
                background: i < index
                  ? `var(--pbs-${tone}-ink)`
                  : i === index
                    ? `var(--pbs-${tone})`
                    : 'var(--pbs-line-2)',
                border: i === index ? `1.5px solid var(--pbs-${tone}-ink)` : '1.5px solid var(--pbs-line-2)',
                transition: 'width 200ms',
              }}/>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--pbs-ink-soft)' }}>
            Question {index + 1} of {total}
          </div>
        </div>
        <div style={{ width: 70 }}/>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 12 }}>
        <div style={{
          padding: '24px 28px', borderRadius: 16,
          background: 'var(--pbs-paper)',
          border: '1.5px solid var(--pbs-line-2)',
          boxShadow: '0 3px 0 var(--pbs-line-2), 0 14px 30px -18px rgba(60,40,0,0.18)',
        }}>
          <div style={{
            fontSize: 'clamp(18px, 2.4vw, 22px)',
            fontWeight: 600, lineHeight: 1.45, color: 'var(--pbs-ink)',
            whiteSpace: 'pre-wrap',
          }}>
            {parsed.text || current.prompt}
          </div>
          {parsed.isMultiSelect && (
            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: `var(--pbs-${tone}-ink)` }}>
              Choose all that apply
            </div>
          )}
          {current.source && (
            <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)' }}>
              Source · {current.source}
            </div>
          )}
        </div>

        {hasOptions && (
          <div style={{ display: 'grid', gap: 12 }}>
            {parsed.options.map((opt, i) => {
              const { letter, body } = stripLeadingLetter(opt);
              const realLetter = letter || String.fromCharCode(65 + i);
              const isSelected = selected.includes(realLetter);
              const isCorrect = revealed && isAnswerLetter(current.answer, realLetter);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelect(realLetter)}
                  disabled={revealed && !isSelected && !isCorrect}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 18px', textAlign: 'left',
                    borderRadius: 14,
                    background: revealed
                      ? (isCorrect ? `var(--pbs-mint)` : (isSelected ? '#fde2e2' : 'var(--pbs-paper)'))
                      : (isSelected ? `var(--pbs-${tone})` : 'var(--pbs-paper)'),
                    color: 'var(--pbs-ink)',
                    border: `1.5px solid ${revealed
                      ? (isCorrect ? '#0f5b2e' : (isSelected ? '#7a2a18' : 'var(--pbs-line-2)'))
                      : (isSelected ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line-2)')}`,
                    boxShadow: isSelected || isCorrect ? '0 2px 0 var(--pbs-line-2)' : 'none',
                    cursor: revealed ? 'default' : 'pointer',
                    fontSize: 15, fontWeight: 500, lineHeight: 1.45,
                  }}
                >
                  <span style={{
                    flex: '0 0 32px', height: 32, borderRadius: 10,
                    background: revealed && isCorrect ? '#0f5b2e' : 'var(--pbs-cream-2)',
                    color: revealed && isCorrect ? '#fff' : 'var(--pbs-ink)',
                    border: `1.5px solid ${revealed && isCorrect ? '#0f5b2e' : 'var(--pbs-line-2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                  }}>{realLetter}</span>
                  <span style={{ flex: 1 }}>{body}</span>
                </button>
              );
            })}
          </div>
        )}

        {revealed && (
          <div style={{
            padding: '16px 20px', borderRadius: 14,
            background: 'var(--pbs-cream-2)',
            border: '1.5px solid var(--pbs-line-2)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: `var(--pbs-${tone}-ink)`, marginBottom: 6 }}>
              Answer
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--pbs-ink)', lineHeight: 1.5 }}>
              {current.answer}
            </div>
            {current.explanation && (
              <div style={{ marginTop: 10, fontSize: 13.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {current.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, paddingTop: 16, borderTop: '1.5px solid var(--pbs-line)',
      }}>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 12, fontWeight: 600, color: 'var(--pbs-ink-muted)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              textDecoration: 'none',
            }}
          >
            Open on Khan <Icon name="arrow-up-right" size={11} stroke={2.2} />
          </a>
        ) : <div/>}
        <div style={{ display: 'flex', gap: 10 }}>
          {!revealed && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="pbs-chunky pbs-chunky-butter"
              style={{ padding: '10px 18px' }}
            >
              Show answer
            </button>
          )}
          {revealed && index < total - 1 && (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="pbs-chunky pbs-chunky-ink"
              style={{ padding: '10px 18px' }}
            >
              Next →
            </button>
          )}
          {revealed && index >= total - 1 && (
            <button
              type="button"
              onClick={() => setIndex(total)}
              className="pbs-chunky pbs-chunky-ink"
              style={{ padding: '10px 18px' }}
            >
              Finish
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function PracticeShell() {
  const params = useSearchParams();
  const key = params.get('key') ?? '';
  return (
    <div className="pbs-root" style={{ ...PALETTE_VARS, minHeight: '100vh' }}>
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <PracticeRunner keyParam={key} />
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: 'center' }}>Loading…</div>}>
      <PracticeShell />
    </Suspense>
  );
}
