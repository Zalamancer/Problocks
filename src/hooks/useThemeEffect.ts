'use client';
import { useEffect } from 'react';
import { useStudio } from '@/store/studio-store';

export function useThemeEffect() {
  const theme = useStudio((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'cream');
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'cream') {
      // Cream reuses the .light Tailwind overrides for baseline contrast,
      // then layers cream palette + playful fonts on top via .cream.
      root.classList.add('light', 'cream');
    }
  }, [theme]);
}
