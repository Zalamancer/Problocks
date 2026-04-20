// Floating pill that flips the global mock ↔ real data toggle. Rendered once
// from the root layout so it shows on every page.
//
// "Mock" = sample-data.ts seeds (the demo arrays we ship in the repo).
// "Real" = fetch from Supabase. Pages without a real backend schema yet
// (student/teacher/marketplace) render empty states in real mode.
'use client';

import React, { useEffect, useState } from 'react';
import { useDataSourceStore } from '@/store/data-source-store';
import { isSupabaseConfigured } from '@/lib/supabase';

export const DataSourceToggle = () => {
  const useRealData = useDataSourceStore((s) => s.useRealData);
  const toggle = useDataSourceStore((s) => s.toggle);

  // Avoid SSR/CSR mismatch — persisted store hydrates on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const supabaseOk = isSupabaseConfigured();
  const mode = useRealData ? 'real' : 'mock';
  const label = useRealData ? 'Real · Supabase' : 'Mock · Demo';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px 8px 12px',
        borderRadius: 999,
        background: 'rgba(24,24,27,0.92)',
        color: '#f4f4f5',
        fontFamily: 'var(--font-dm-mono), ui-monospace, monospace',
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontWeight: 600,
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), 0 2px 0 rgba(255,255,255,0.04) inset',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
      }}
      title={
        useRealData && !supabaseOk
          ? 'Real mode selected but Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY missing).'
          : 'Toggle between hard-coded demo data and live Supabase data.'
      }
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: useRealData
            ? supabaseOk
              ? '#34d399'
              : '#f59e0b'
            : '#a78bfa',
          boxShadow: useRealData
            ? supabaseOk
              ? '0 0 8px #34d39988'
              : '0 0 8px #f59e0b88'
            : '0 0 8px #a78bfa88',
        }}
      />
      <span>Data:&nbsp;{label}</span>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch to ${useRealData ? 'mock' : 'real'} data`}
        style={{
          marginLeft: 4,
          padding: '4px 10px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(255,255,255,0.06)',
          color: 'inherit',
          fontFamily: 'inherit',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {useRealData ? '→ Mock' : '→ Real'}
      </button>
      <span className="sr-only">Current mode: {mode}</span>
    </div>
  );
};
