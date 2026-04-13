/**
 * Freesound API client — searches freesound.org for game sound effects
 * and returns them as embeddable base64 data URLs.
 *
 * Requires FREESOUND_API_KEY (free at https://freesound.org/apiv2/apply).
 */

const BASE = 'https://freesound.org/apiv2';

function getKey(): string {
  const key = process.env.FREESOUND_API_KEY;
  if (!key) throw new Error('FREESOUND_API_KEY not configured');
  return key;
}

export function isAvailable(): boolean {
  return !!process.env.FREESOUND_API_KEY;
}

/**
 * Search Freesound for a game sound effect and return it as a data URL.
 * Uses LQ MP3 previews (small file size, perfect for embedding in HTML games).
 */
export async function findSound(
  description: string,
  maxDuration = 4,
): Promise<{ url: string; name: string; license: string } | null> {
  const key = getKey();

  // Optimize query for game sounds
  const query = buildQuery(description);

  const url = new URL(`${BASE}/search/text/`);
  url.searchParams.set('query', query);
  url.searchParams.set('filter', `duration:[0 TO ${maxDuration}]`);
  url.searchParams.set('fields', 'id,name,previews,license');
  url.searchParams.set('page_size', '3');
  url.searchParams.set('sort', 'rating_desc');
  url.searchParams.set('token', key);

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Freesound search failed: ${resp.status}`);
  }

  const data = (await resp.json()) as {
    results?: {
      name: string;
      license: string;
      previews?: Record<string, string>;
    }[];
  };

  if (!data.results?.length) return null;

  // Try each result until we get a working preview
  for (const result of data.results) {
    const previewUrl =
      result.previews?.['preview-lq-mp3'] ||
      result.previews?.['preview-hq-mp3'];

    if (!previewUrl) continue;

    try {
      const audioResp = await fetch(previewUrl);
      if (!audioResp.ok) continue;

      const buffer = Buffer.from(await audioResp.arrayBuffer());
      // Skip if too large (> 200KB) — would bloat the HTML
      if (buffer.length > 200_000) continue;

      return {
        url: `data:audio/mpeg;base64,${buffer.toString('base64')}`,
        name: result.name,
        license: result.license,
      };
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Build a search query optimized for game sound effects.
 */
function buildQuery(description: string): string {
  const d = description.toLowerCase();

  // Map common game sound descriptions to good Freesound queries
  const mappings: [RegExp, string][] = [
    [/jump|hop|bounce/, 'jump game 8bit'],
    [/coin|collect|pickup|gem/, 'coin collect game chiptune'],
    [/explo|boom|blast/, 'explosion game retro'],
    [/shoot|fire|laser|pew|zap/, 'laser shoot game 8bit'],
    [/hit|hurt|damage|ouch/, 'hit damage game 8bit'],
    [/power.?up|boost|upgrade|shield/, 'powerup game chiptune'],
    [/click|button|menu|select|ui/, 'menu click game ui'],
    [/death|die|game.?over|lose/, 'game over retro 8bit'],
    [/win|victory|success|level|complete/, 'victory jingle game'],
    [/whoosh|swipe|swing|slash/, 'whoosh swipe game'],
    [/footstep|walk|run|step/, 'footstep game'],
    [/door|open|close/, 'door open game'],
    [/splash|water/, 'splash water game'],
    [/beep|alert|warning/, 'alert beep game 8bit'],
    [/music|bgm|background|theme/, 'chiptune game loop'],
  ];

  for (const [pattern, query] of mappings) {
    if (d.match(pattern)) return query;
  }

  // Default: add "game" to the description
  return `${description} game sound effect`;
}
