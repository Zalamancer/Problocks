'use client';
import { useEffect } from 'react';
import { useQualityStore } from '@/store/quality-store';

/**
 * Mirrors `useQualityStore.tier` onto the <html> element as a class
 * (`quality-low`, `quality-medium`, `quality-high`). That class is the
 * hook that globals.css uses to strip backdrop-filter and other expensive
 * UI effects on low-end hardware without touching individual components.
 *
 * Render once at the top of the app tree (RootLayout).
 */
export function QualityProvider() {
  const tier = useQualityStore((s) => s.tier);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('quality-low', 'quality-medium', 'quality-high');
    root.classList.add(`quality-${tier}`);
  }, [tier]);

  return null;
}
