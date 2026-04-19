'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/components/studio/modals/OnboardingWizard';
import type { TemplateId } from '@/lib/templates/types';

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
        <Nav onMakeGame={openWizard} />
        <Hero onMakeGame={openWizard} />
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
