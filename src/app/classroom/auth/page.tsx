'use client';
import { signIn } from 'next-auth/react';
import { GraduationCap } from 'lucide-react';
import { PanelActionButton } from '@/components/ui';

export default function ClassroomAuthPage() {
  return (
    <main className="h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <GraduationCap size={28} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-zinc-100 text-2xl font-bold">Sign in to Classroom</h1>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            Connect your Google account to access your courses, assignments, and class resources in Problocks.
          </p>
        </div>
        <PanelActionButton
          onClick={() => signIn('google', { callbackUrl: '/classroom' })}
          variant="accent"
          icon={GraduationCap}
        >
          Continue with Google
        </PanelActionButton>
      </div>
    </main>
  );
}
