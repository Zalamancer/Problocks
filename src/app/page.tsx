'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/components/studio/modals/OnboardingWizard';
import type { TemplateId } from '@/lib/templates/types';

// Palettes ported from the Claude Design bundle (pb_learn/tweaks.jsx).
// One is picked at random on every landing-page mount.
const PALETTES = {
  cream: { bg: '#fdf6e6', paper: '#fffaf0', cream2: '#f7edd4', line: '#e8dcbc', line2: '#d6c896', ink: '#1d1a14', inkSoft: '#57524a', inkMuted: '#8a8478' },
  mint:  { bg: '#eef7f1', paper: '#f9fdfb', cream2: '#d9eee1', line: '#cfe4d6', line2: '#b2d4be', ink: '#10241b', inkSoft: '#3a564b', inkMuted: '#6f887e' },
  rose:  { bg: '#fdeef2', paper: '#fff6f8', cream2: '#f7d9e1', line: '#ebccd3', line2: '#d8a7b2', ink: '#26141a', inkSoft: '#5a3c44', inkMuted: '#896b73' },
  sky:   { bg: '#eaf2fb', paper: '#f6fafe', cream2: '#d5e7f7', line: '#c4dcf0', line2: '#a4c3db', ink: '#102134', inkSoft: '#3e5569', inkMuted: '#6c849a' },
} as const;
type PaletteKey = keyof typeof PALETTES;
const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

function paletteVars(key: PaletteKey): CSSProperties {
  const p = PALETTES[key];
  return {
    '--pbs-cream':     p.bg,
    '--pbs-paper':     p.paper,
    '--pbs-cream-2':   p.cream2,
    '--pbs-line':      p.line,
    '--pbs-line-2':    p.line2,
    '--pbs-ink':       p.ink,
    '--pbs-ink-soft':  p.inkSoft,
    '--pbs-ink-muted': p.inkMuted,
  } as CSSProperties;
}

import { Nav } from '@/components/landing/pb-learn/Nav';
import { Hero } from '@/components/landing/pb-learn/Hero';
import { Marquee } from '@/components/landing/pb-learn/Marquee';
import { Learn } from '@/components/landing/pb-learn/Learn';
import { Messaging } from '@/components/landing/pb-learn/Messaging';
import { ForStudents } from '@/components/landing/pb-learn/ForStudents';
import { ForTeachers } from '@/components/landing/pb-learn/ForTeachers';
import { Subjects } from '@/components/landing/pb-learn/Subjects';
import { Stories } from '@/components/landing/pb-learn/Stories';
import { FAQ } from '@/components/landing/pb-learn/FAQ';
import { Footer } from '@/components/landing/pb-learn/Footer';

import '@/components/landing/pb-site/styles.css';

export default function Home() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const router = useRouter();

  // Start with cream (matches the stylesheet defaults, so SSR and first client
  // render agree) and swap to a random palette after mount.
  const [paletteStyle, setPaletteStyle] = useState<CSSProperties>(() => paletteVars('cream'));
  useEffect(() => {
    const pick = PALETTE_KEYS[Math.floor(Math.random() * PALETTE_KEYS.length)];
    setPaletteStyle(paletteVars(pick));
  }, []);

  function handleWizardComplete(_templateId: TemplateId) {
    setWizardOpen(false);
    router.push('/studio');
  }

  const openWizard = () => setWizardOpen(true);
  const startPlaying = () => router.push('/student');

  return (
    <div className="pbs-root" style={paletteStyle}>
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />

      <div className="pbs-content">
        <Nav onMakeGame={openWizard} />
        <Hero onMakeGame={openWizard} onStartPlaying={startPlaying} />
        <Marquee />
        <Learn />
        <Messaging />
        <ForStudents />
        <ForTeachers />
        <Subjects />
        <Stories />
        <FAQ />
        <Footer onMakeGame={openWizard} />
      </div>

      <OnboardingWizard
        open={wizardOpen}
        onComplete={handleWizardComplete}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
