'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/components/studio/modals/OnboardingWizard';
import type { TemplateId } from '@/lib/templates/types';

import { Nav } from '@/components/landing/pb-site/Nav';
import { Hero } from '@/components/landing/pb-site/Hero';
import { Marquee } from '@/components/landing/pb-site/Marquee';
import { How } from '@/components/landing/pb-site/How';
import { Playground } from '@/components/landing/pb-site/Playground';
import { Features } from '@/components/landing/pb-site/Features';
import { Classroom } from '@/components/landing/pb-site/Classroom';
import { Marketplace } from '@/components/landing/pb-site/Marketplace';
import { Pricing } from '@/components/landing/pb-site/Pricing';
import { FAQ } from '@/components/landing/pb-site/FAQ';
import { Footer } from '@/components/landing/pb-site/Footer';

import '@/components/landing/pb-site/styles.css';

export default function Home() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const router = useRouter();

  function handleWizardComplete(_templateId: TemplateId) {
    setWizardOpen(false);
    router.push('/studio');
  }

  const openWizard = () => setWizardOpen(true);

  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />

      <div className="pbs-content">
        <Nav onStart={openWizard} />
        <Hero onStart={openWizard} />
        <Marquee />
        <How />
        <Playground />
        <Features />
        <Classroom />
        <Marketplace />
        <Pricing onStart={openWizard} />
        <FAQ />
        <Footer onStart={openWizard} />
      </div>

      <OnboardingWizard
        open={wizardOpen}
        onComplete={handleWizardComplete}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
