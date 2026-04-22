import Link from 'next/link';
import { ArrowLeft, Play, Gamepad2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Marketplace now fetches live from Supabase: games where is_published=true
// AND moderation_status='approved'. Reports against a game automatically flip
// moderation_status back to 'pending' (see migration 007 trigger), which
// drops it from this listing until a teacher reviews.

export const dynamic = 'force-dynamic';

interface MarketplaceGame {
  id: string;
  name: string;
  prompt: string;
  user_id: string;
  cover_url: string | null;
  plays_count: number;
  created_at: string;
}

const ACCENTS = [
  'from-sky-400 via-amber-200 to-pink-300',
  'from-emerald-400 via-lime-200 to-sky-300',
  'from-fuchsia-400 via-rose-200 to-orange-300',
  'from-indigo-400 via-violet-200 to-pink-300',
  'from-amber-400 via-rose-200 to-sky-300',
];

function accentFor(id: string): string {
  // Deterministic colour so the same game keeps the same tile across reloads.
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

async function fetchGames(): Promise<MarketplaceGame[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data, error } = await supabase
    .from('games')
    .select('id, name, prompt, user_id, cover_url, plays_count, created_at')
    .eq('is_published', true)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) {
    console.error('Marketplace fetch error:', error);
    return [];
  }
  return (data ?? []) as MarketplaceGame[];
}

export default async function MarketplacePage() {
  const games = await fetchGames();

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
          <span className="text-[11px] text-zinc-500">{games.length} game{games.length === 1 ? '' : 's'}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Play games from the community</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Every game here was built in Playdemy Studio and approved by a teacher.
          </p>
        </div>

        {games.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 p-12 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <Gamepad2 size={22} className="text-zinc-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">No games published yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Build a game in Studio, click Share, and your teacher will approve it here.
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
            {games.map((g) => (
              <Link
                key={g.id}
                href={`/play/${g.id}`}
                className="group flex flex-col rounded-2xl bg-zinc-900/80 border border-white/[0.06] overflow-hidden hover:border-white/15 transition-colors"
              >
                <div
                  className={`aspect-[16/10] relative bg-gradient-to-br ${accentFor(g.id)} flex items-center justify-center`}
                >
                  {g.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Gamepad2 size={48} className="text-white/70" />
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100 leading-tight line-clamp-1">{g.name}</h3>
                    <span className="text-[10px] text-zinc-500 shrink-0 mt-0.5">
                      {g.plays_count.toLocaleString()} play{g.plays_count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug line-clamp-2">{g.prompt || 'No description.'}</p>
                  <p className="text-[11px] text-zinc-600 mt-1">by {g.user_id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
