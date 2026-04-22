import type { GeneratedGame } from '@/store/studio-store';
import { getGameHtml } from '@/lib/game-engine/bundler';
import type { BundleOptions } from '@/lib/game-engine/bundler';

// Pure helpers for the Save / Share flow in the studio. Kept separate from
// TopMenuBar so the same logic can be reused from a future keyboard-shortcut
// handler or the My Games panel (duplicate on write).
//
// Every helper takes an explicit userId so callers thread the authenticated
// id from useAuthStore in. The server ignores body.userId when a real
// Supabase session is attached, but passing it still matters for anonymous
// dev flows that reuse 'local-user'.

interface SaveResponse {
  id: string;
  playUrl: string | null;
  warning?: string;
  error?: string;
}

interface PublishResponse {
  game?: { id: string; is_published: boolean; visibility: string };
  error?: string;
}

/** Render whichever representation the active game has into a single HTML
 *  string suitable for inlining into a row in `games.html_content`. */
export function renderGameHtml(
  game: Pick<GeneratedGame, 'html' | 'files'>,
  quality?: BundleOptions['quality']
): string {
  if (game.files && Object.keys(game.files).length > 0) {
    return getGameHtml({ files: game.files }, { quality });
  }
  return game.html;
}

/** Write the active game to the server. Uses upsert semantics — calling twice
 *  with the same id updates the existing row. */
export async function saveGame(
  game: GeneratedGame,
  html: string,
  userId: string
): Promise<SaveResponse> {
  const res = await fetch('/api/games/save', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: game.id,
      userId,
      name: game.name,
      prompt: game.prompt || '(no prompt)',
      html,
    }),
  });
  return (await res.json()) as SaveResponse;
}

/** Flip a saved game to is_published=true + visibility=public so its
 *  /play/<id> link works for anyone. Sprint 1 auto-sends moderation_status
 *  stays 'pending' — the marketplace (Sprint 2) filters on approval, but
 *  direct links stay open so kids can share with friends immediately. */
export async function publishGame(gameId: string): Promise<PublishResponse> {
  const res = await fetch(`/api/games/${gameId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ isPublished: true, visibility: 'public' }),
  });
  return (await res.json()) as PublishResponse;
}

/** End-to-end Share: save, publish, build a copy-ready /play/<id> URL. */
export async function saveAndPublish(
  game: GeneratedGame,
  html: string,
  userId: string
): Promise<{ id: string; playUrl: string } | { error: string }> {
  const saved = await saveGame(game, html, userId);
  if (saved.error) return { error: saved.error };
  if (!saved.id) return { error: 'Save returned no game id' };

  const published = await publishGame(saved.id);
  if (published.error) return { error: published.error };

  const playUrl = saved.playUrl ?? `${window.location.origin}/play/${saved.id}`;
  return { id: saved.id, playUrl };
}
