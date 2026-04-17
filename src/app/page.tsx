'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Wand2, Gamepad2, Store, ArrowRight } from 'lucide-react';
import { OnboardingWizard } from '@/components/studio/modals/OnboardingWizard';
import { LandingBackground } from '@/components/landing/LandingBackground';
import type { TemplateId } from '@/lib/templates/types';

export default function Home() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const router = useRouter();

  function handleWizardComplete(_templateId: TemplateId) {
    setWizardOpen(false);
    router.push('/studio');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfbf9] via-[#f6f7fb] to-[#eef2f7] text-zinc-900">
      {/* Keyframes injected once for the floating shapes in the background. */}
      <style>{`
        @keyframes landing-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-14px) rotate(2deg); }
        }
      `}</style>

      <Nav />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <LandingBackground />

        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-28 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur">
            <Sparkles size={12} className="text-emerald-500" />
            AI-powered game creation
          </span>

          <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-tight text-zinc-900">
            Describe it.<br />
            <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 bg-clip-text text-transparent">
              Claude builds the game.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-zinc-600">
            A playful studio for classrooms. Tell it what you want, Problocks turns it
            into code, art and sound, and your students publish it.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)] transition hover:bg-zinc-800"
            >
              <Wand2 size={16} />
              Create a new game
            </button>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 px-6 py-3 text-sm font-semibold text-zinc-800 backdrop-blur transition hover:bg-white"
            >
              <Store size={16} />
              Marketplace
            </Link>
          </div>
        </div>
      </section>

      <HowItWorks />
      <FeatureStrip />
      <BigCTA onStart={() => setWizardOpen(true)} />
      <Footer />

      <OnboardingWizard
        open={wizardOpen}
        onComplete={handleWizardComplete}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-20 w-full border-b border-zinc-200/60 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-inner" />
          <span className="text-sm font-semibold tracking-tight text-zinc-900">Problocks</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/marketplace"
            className="rounded-full px-3 py-1.5 text-zinc-600 transition hover:text-zinc-900"
          >
            Marketplace
          </Link>
          <Link
            href="/studio"
            className="rounded-full px-3 py-1.5 text-zinc-600 transition hover:text-zinc-900"
          >
            Studio
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Describe it',
      body: 'Pick a genre and sketch the idea. No coding needed upfront.',
    },
    {
      n: '02',
      title: 'Generate',
      body: 'Claude spins up art, code and sound. Edit anything, anytime.',
    },
    {
      n: '03',
      title: 'Play & publish',
      body: 'Playtest in-browser, then list it on the marketplace.',
    },
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-900">
        How it works
      </h2>
      <p className="mt-2 text-center text-sm text-zinc-500">Three steps from idea to playable.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 backdrop-blur-sm transition hover:border-zinc-300 hover:bg-white"
          >
            <div className="text-xs font-semibold tracking-widest text-emerald-600">{s.n}</div>
            <div className="mt-2 text-base font-semibold text-zinc-900">{s.title}</div>
            <div className="mt-1.5 text-sm text-zinc-600">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureStrip() {
  const features = [
    {
      icon: Sparkles,
      color: 'from-emerald-400 to-emerald-600',
      title: 'AI generation',
      body: 'Claude orchestrates PixelLab, Meshy, Suno and ElevenLabs — all from a chat prompt.',
    },
    {
      icon: Gamepad2,
      color: 'from-sky-400 to-sky-600',
      title: 'Real code output',
      body: 'Clean modular JavaScript — scenes, physics, entities. Students can read, tweak and learn.',
    },
    {
      icon: Store,
      color: 'from-violet-400 to-violet-600',
      title: 'Publish & earn',
      body: 'Share games to the marketplace. Every play rewards the class behind the game.',
    },
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-sm"
          >
            <div
              className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-sm`}
            >
              <f.icon size={18} />
            </div>
            <div className="text-base font-semibold text-zinc-900">{f.title}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BigCTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24 pt-8">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-10 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.15)]">
        {/* Subtle glow bloom. */}
        <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-[60%] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <h3 className="relative text-2xl font-semibold tracking-tight text-zinc-900">
          Ready to build your first game?
        </h3>
        <p className="relative mx-auto mt-2 max-w-md text-sm text-zinc-600">
          Pick a genre, set a deadline, and Problocks scaffolds the whole project for you.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Create a new game
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/60 py-6 text-center text-xs text-zinc-500 backdrop-blur">
      Problocks · AI-powered game creation for classrooms
    </footer>
  );
}
