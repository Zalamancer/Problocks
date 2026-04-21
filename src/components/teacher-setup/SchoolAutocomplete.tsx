// Typeahead school search — calls /api/schools/search which prefers NCES
// (US public schools directory via Urban Institute) and falls back to OSM
// Nominatim for other regions or when NCES returns nothing. Shows a rich
// detail line per row so teachers can disambiguate same-named schools.
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import type { RegionKey } from './types';

type Suggestion = {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  district: string;
  country: string;
  source: 'nces' | 'osm';
};

function detailLine(s: Suggestion): string {
  // Show city/state/zip as the primary locator; include county/country only
  // when locality is missing. District ids from the NCES feed are numeric-only
  // and not useful to humans, so we skip them.
  const locality = [s.city, s.state].filter(Boolean).join(', ');
  const tail = [locality, s.zip].filter(Boolean).join(' ').trim();
  return tail || s.county || s.country || '';
}

export const SchoolAutocomplete = ({
  value, onChange, region, placeholder,
}: {
  value: string;
  onChange: (name: string) => void;
  region: RegionKey;
  placeholder?: string;
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const searchRegion = useMemo(() => region, [region]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const url = new URL('/api/schools/search', window.location.origin);
        url.searchParams.set('q', q);
        url.searchParams.set('region', searchRegion);
        const res = await fetch(url.toString(), {
          signal: ctrl.signal,
          headers: { Accept: 'application/json' },
        });
        const json = (await res.json()) as { results: Suggestion[] };
        setResults(json.results || []);
        setActiveIdx(-1);
      } catch (err) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [query, searchRegion]);

  const pick = (s: Suggestion) => {
    onChange(s.name);
    setQuery(s.name);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0) {
        e.preventDefault();
        pick(results[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className="pbs-input-wrap" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        background: 'var(--pbs-paper)',
        border: '1.5px solid var(--pbs-line-2)',
        borderRadius: 12,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      }}>
        <Icon name="book" size={15} stroke={2} style={{ color: 'var(--pbs-ink-muted)' }}/>
        <input
          className="pbs-input-el"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => { if (results.length > 0 || query.trim().length >= 2) setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={placeholder || 'Start typing your school name…'}
          style={{
            flex: 1, minWidth: 0,
            border: 0, background: 'transparent',
            fontSize: 14.5, color: 'var(--pbs-ink)', fontFamily: 'inherit',
          }}
        />
        {loading && (
          <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>…</span>
        )}
      </div>

      {open && (results.length > 0 || (!loading && query.trim().length >= 2)) && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0, right: 0,
            zIndex: 50,
            background: 'var(--pbs-paper)',
            border: '1.5px solid var(--pbs-line-2)',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 3px 0 var(--pbs-line-2)',
            overflow: 'hidden',
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--pbs-ink-muted)' }}>
              No matches — keep typing or press <kbd style={{ fontFamily: 'inherit' }}>Tab</kbd> to use “{query}”.
            </div>
          ) : (
            results.map((s, i) => {
              const active = i === activeIdx;
              const detail = detailLine(s);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                  onMouseEnter={() => setActiveIdx(i)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                    gap: 2,
                    width: '100%', textAlign: 'left',
                    padding: '10px 14px',
                    border: 0,
                    background: active ? 'var(--pbs-cream-2)' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderBottom: i < results.length - 1 ? '1px solid var(--pbs-line)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--pbs-ink)' }}>{s.name}</span>
                    <span
                      className="pbs-mono"
                      style={{
                        fontSize: 9.5,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 999,
                        background: s.source === 'nces' ? 'var(--pbs-mint)' : 'var(--pbs-cream-2)',
                        color: s.source === 'nces' ? 'var(--pbs-mint-ink)' : 'var(--pbs-ink-muted)',
                        border: `1px solid ${s.source === 'nces' ? 'var(--pbs-mint-ink)' : 'var(--pbs-line-2)'}`,
                        flexShrink: 0,
                      }}
                    >
                      {s.source === 'nces' ? 'NCES' : 'OSM'}
                    </span>
                  </div>
                  {detail && (
                    <span style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>{detail}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
