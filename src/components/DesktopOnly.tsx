// Pure CSS viewport gate — blocks rendering the children on phone-sized
// screens. Used to wall off the studio + tile builder, which are desktop
// editors that don't fit a 375px viewport. No JS breakpoint detection,
// so no hydration flash: mobile sees only the notice, desktop sees only
// the app.

import Link from 'next/link';
import { Laptop } from 'lucide-react';

export function DesktopOnly({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <>
      {/* Mobile notice (<768px) */}
      <div className="md:hidden min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="max-w-sm w-full flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Laptop size={26} className="text-zinc-300" />
          </div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>

      {/* Desktop app (>=768px) */}
      <div className="hidden md:block">{children}</div>
    </>
  );
}
