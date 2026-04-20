// Main classroom setup flow: top banner + stepper rail + active step + live preview.
// Ported from Claude Design bundle (pb_classroom_setup/app.jsx).
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Chunky } from '@/components/landing/pb-site/primitives';
import { SetupNav } from './SetupNav';
import { Stepper, STEPS } from './Stepper';
import { StepAboutYou } from './StepAboutYou';
import { StepClassBasics } from './StepClassBasics';
import { StepRoster } from './StepRoster';
import { StepUnit } from './StepUnit';
import { StepReview } from './StepReview';
import { ClassroomPreview } from './ClassroomPreview';
import { INITIAL_DATA, type SetupData } from './types';
import './setup.css';

const ProgressBar = ({ step, total }: { step: number; total: number }) => {
  const pct = ((step + 1) / total) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="pbs-mono" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>
        {Math.round(pct)}%
      </div>
      <div style={{
        width: 120, height: 8,
        background: 'rgba(253, 246, 230, 0.15)',
        borderRadius: 999, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'var(--pbs-butter)',
          borderRadius: 999,
          transition: 'width 400ms cubic-bezier(.2,.8,.2,1)',
        }}/>
      </div>
    </div>
  );
};

const HelpCard = () => (
  <div style={{
    padding: 16,
    background: 'var(--pbs-paper)',
    border: '1.5px dashed var(--pbs-line-2)',
    borderRadius: 14,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
        border: '1.5px solid var(--pbs-mint-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="smile" size={14} stroke={2.2}/>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>Stuck?</div>
    </div>
    <p style={{ margin: 0, fontSize: 12.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.5 }}>
      Most teachers are done in under 4 minutes. You can always edit everything later from{' '}
      <span className="pbs-mono" style={{ color: 'var(--pbs-ink)' }}>Settings</span>.
    </p>
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <a href="#demo" style={{ fontSize: 12, fontWeight: 600, color: 'var(--pbs-ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Watch a 90-sec demo</a>
    </div>
  </div>
);

export const ClassroomSetupApp = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [data, setData] = useState<SetupData>(INITIAL_DATA);

  const set = <K extends keyof SetupData>(k: K, v: SetupData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const scrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goNext = () => {
    setCompleted((c) => c.includes(step) ? c : [...c, step]);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollTop();
  };
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    scrollTop();
  };
  const jump = (i: number) => {
    if (i <= Math.max(...completed, step)) {
      setStep(i);
      scrollTop();
    }
  };

  const openRoom = () => {
    // Demo: just route to the real Teacher app.
    router.push('/teacher');
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepAboutYou data={data} set={set}/>;
      case 1: return <StepClassBasics data={data} set={set}/>;
      case 2: return <StepRoster data={data} set={set}/>;
      case 3: return <StepUnit data={data} set={set}/>;
      case 4: return <StepReview data={data}/>;
      default: return null;
    }
  };

  return (
    <>
      <SetupNav/>

      <main className="pbs-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 28px 80px', marginTop: 24 }}>
        {/* top banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '18px 20px',
          background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
          border: '1.5px solid var(--pbs-ink)', borderRadius: 20,
          boxShadow: '0 4px 0 #000, 0 20px 40px -22px rgba(0,0,0,0.45)',
          marginBottom: 28,
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="pb-setup-dots" style={{ position: 'absolute', inset: 0, opacity: 0.08 }}/>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
            border: '1.5px solid var(--pbs-butter-ink)',
            boxShadow: '0 3px 0 var(--pbs-butter-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            zIndex: 1,
          }}>
            <Icon name="book" size={22} stroke={2.2}/>
          </div>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Set up your classroom
            </div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 3 }}>
              ~4 minutes · progress saves automatically · FERPA &amp; COPPA compliant
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
            <ProgressBar step={step} total={STEPS.length}/>
          </div>
        </div>

        <div className="pb-setup-grid">
          <aside>
            <Stepper current={step} completed={completed} onJump={jump}/>
            <div style={{ height: 20 }}/>
            <HelpCard/>
          </aside>

          <section style={{ minWidth: 0 }}>
            {renderStep()}

            <div style={{
              marginTop: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '16px 18px',
              background: 'var(--pbs-cream-2)',
              border: '1.5px solid var(--pbs-line-2)',
              borderRadius: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={goBack}
                  disabled={step === 0}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--pbs-paper)',
                    color: step === 0 ? 'var(--pbs-ink-muted)' : 'var(--pbs-ink)',
                    border: '1.5px solid var(--pbs-line-2)',
                    borderRadius: 12, fontSize: 13.5, fontWeight: 600,
                    cursor: step === 0 ? 'not-allowed' : 'pointer',
                    opacity: step === 0 ? 0.6 : 1,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: 'inherit',
                  }}
                >
                  <Icon name="chevron" size={12} stroke={2.4} style={{ transform: 'rotate(180deg)' }}/>
                  Back
                </button>
                <span className="pbs-mono" style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Step {String(step + 1).padStart(2, '0')} of {String(STEPS.length).padStart(2, '0')}
                </span>
              </div>

              {step < STEPS.length - 1 ? (
                <Chunky tone="butter" trailing="arrow-right" onClick={goNext}>
                  {step === STEPS.length - 2 ? 'Review room' : 'Continue'}
                </Chunky>
              ) : (
                <Chunky tone="ink" trailing="sparkle" onClick={openRoom}>
                  Open the classroom
                </Chunky>
              )}
            </div>
          </section>

          <aside className="pb-setup-preview-rail">
            <ClassroomPreview data={data} step={step}/>
          </aside>
        </div>
      </main>
    </>
  );
};
