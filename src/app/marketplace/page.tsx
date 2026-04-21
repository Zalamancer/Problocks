import Link from 'next/link';
import { ArrowLeft, Play, Gamepad2 } from 'lucide-react';

interface MarketplaceGame {
  id: string;
  title: string;
  tagline: string;
  author: string;
  plays: number;
  href: string;
  accent: string;
  badge: string;
}

// Tile Builder is now a built-in studio tool for placing map geometry —
// not a standalone game. Marketplace will populate from published
// student games once publishing is wired up.
const GAMES: MarketplaceGame[] = [
  {
    id: 'lego-game',
    title: 'Brick Builder',
    tagline: 'Place, stack, and snap LEGO-style bricks on an open baseplate.',
    author: 'ihsan',
    plays: 0,
    href: '/games/lego-game/index.html',
    accent: 'from-sky-400 via-amber-200 to-pink-300',
    badge: 'NEW',
  },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-semibold tracking-tight">Marketplace</h1>
          <span className="text-[11px] text-zinc-500">{GAMES.length} game{GAMES.length === 1 ? '' : 's'}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Play games from the community</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Every game here was built in Problocks Studio. Pick one and play instantly — no install.
          </p>
        </div>

        {GAMES.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <Gamepad2 size={22} className="text-zinc-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">No games published yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Build a game in Studio and publish it here so classmates can play.
            </p>
            <Link
              href="/studio"
              className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              <Play size={12} />
              Open Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GAMES.map((g) => (
              <Link
                key={g.id}
                href={g.href}
                className="group flex flex-col rounded-2xl bg-zinc-900/80 border border-white/[0.06] overflow-hidden hover:border-white/15 transition-colors"
              >
                <div
                  className={`aspect-[16/10] relative bg-gradient-to-br ${g.accent} flex items-center justify-center`}
                >
                  <Gamepad2 size={48} className="text-white/70" />
                  {g.badge && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500 text-white">
                      {g.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100 leading-tight">{g.title}</h3>
                    <span className="text-[10px] text-zinc-500 shrink-0 mt-0.5">
                      {g.plays.toLocaleString()} plays
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug line-clamp-2">{g.tagline}</p>
                  <p className="text-[11px] text-zinc-600 mt-1">by {g.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
