// Typeahead school search — hits OpenStreetMap Nominatim (free, no API key)
// and biases results by the teacher's region. Shows a dropdown as the teacher
// types so they can pick their school without typing the full name.
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import type { RegionKey } from './types';

type Suggestion = {
  id: string;
  name: string;
  detail: string;
};

type NominatimItem = {
  place_id: number;
  display_name: string;
  type?: string;
  class?: string;
  name?: string;
  namedetails?: { name?: string } | null;
  address?: {
    amenity?: string;
    school?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    state?: string;
    county?: string;
    country?: string;
    postcode?: string;
  };
};

const REGION_TO_COUNTRY: Record<RegionKey, string | undefined> = {
  us: 'us',
  uk: 'gb',
  ca: 'ca',
  au: 'au',
  nz: 'nz',
  other: undefined,
};

function toSuggestion(item: NominatimItem): Suggestion | null {
  const a = item.address || {};
  const name =
    a.school ||
    a.amenity ||
    item.namedetails?.name ||
    item.name ||
    item.display_name.split(',')[0];
  if (!name) return null;
  const locality = a.city || a.town || a.village || a.suburb || a.county || '';
  const region = a.state || a.country || '';
  const detail = [locality, region].filter(Boolean).join(', ');
  return { id: String(item.place_id), name: name.trim(), detail };
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

  // keep local query in sync when parent resets (e.g., navigating back to step)
  useEffect(() => { setQuery(value); }, [value]);

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const countryCode = useMemo(() => REGION_TO_COUNTRY[region], [region]);

  // debounced fetch
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
        const url = new URL('https://nominatim.openstreetmap.org/search');
        // Append the word "school" to bias results unless the user already typed it.
        const biased = /school|academy|college|high|elementary|primary|secondary/i.test(q)
          ? q
          : `${q} school`;
        url.searchParams.set('q', biased);
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('namedetails', '1');
        url.searchParams.set('limit', '8');
        if (countryCode) url.searchParams.set('countrycodes', countryCode);

        const res = await fetch(url.toString(), {
          signal: ctrl.signal,
          headers: { Accept: 'application/json' },
        });
        const json: NominatimItem[] = await res.json();
        const mapped = json
          .map(toSuggestion)
          .filter((x): x is Suggestion => !!x);
        // de-dupe by name + detail
        const seen = new Set<string>();
        const deduped = mapped.filter((s) => {
          const k = `${s.name}|${s.detail}`.toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setResults(deduped);
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
  }, [query, countryCode]);

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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        background: 'var(--pbs-paper)',
        border: '1.5px solid var(--pbs-line-2)',
        borderRadius: 12,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        transition: 'border-color 120ms, box-shadow 120ms',
      }}>
        <Icon name="book" size={15} stroke={2} style={{ color: 'var(--pbs-ink-muted)' }}/>
        <input
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
            border: 0, background: 'transparent', outline: 'none',
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
            maxHeight: 320,
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
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                  onMouseEnter={() => setActiveIdx(i)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
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
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--pbs-ink)' }}>{s.name}</span>
                  {s.detail && (
                    <span style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>{s.detail}</span>
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
