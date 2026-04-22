import { notFound } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PlayLogger } from './PlayLogger';
import Link from 'next/link';

// Public play page. Anyone with the link can load + play a game whose row has
// `is_published = true`. Sprint 1 doesn't require `moderation_status = approved`
// here (direct-link sharing is allowed pre-moderation); Sprint 2 will gate
// marketplace *listings* on approval but keep direct links usable.
//
// The HTML is stored inline in `games.html_content` and rendered into an
// iframe via `srcDoc` with a restrictive sandbox so a misbehaving game can't
// touch Problocks cookies / localStorage / parent DOM.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PlayableGame {
  id: string;
  name: string;
  user_id: string;
  html_content: string | null;
  is_published: boolean;
  plays_count: number;
  updated_at: string;
}

export const dynamic = 'force-dynamic';

export default async function PlayGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  if (!UUID_RE.test(gameId)) notFound();
  if (!isSupabaseConfigured() || !supabase) notFound();

  const { data, error } = await supabase
    .from('games')
    .select('id, name, user_id, html_content, is_published, plays_count, updated_at')
    .eq('id', gameId)
    .single<PlayableGame>();

  if (error || !data) notFound();
  if (!data.is_published) notFound();
  if (!data.html_content) notFound();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--pb-bg, #0b0b0c)',
        color: 'var(--pb-ink, #eee)',
      }}
    >
      <PlayLogger gameId={gameId} />
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
          gap: 12,
        }}
      >
        <Link
          href="/"
          style={{ color: 'inherit', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}
        >
          ← Problocks
        </Link>
        <div style={{ fontSize: 14, fontWeight: 700, flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data.name}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', display: 'flex', gap: 10 }}>
          <span>{data.plays_count.toLocaleString()} plays</span>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <iframe
          title={data.name}
          srcDoc={data.html_content}
          sandbox="allow-scripts allow-pointer-lock allow-popups"
          style={{
            flex: 1,
            width: '100%',
            border: 0,
            background: '#000',
            display: 'block',
          }}
        />
      </main>
    </div>
  );
}
