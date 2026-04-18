/**
 * Prompt-level learning signal for Part Studio.
 *
 * We can't train Claude, and we explicitly don't want to learn from the
 * generated code (the code is never "good" or "bad" on its own — the
 * render is what the user rates). Instead we mine the user's *prompt*
 * for recurring phrases and track which phrases correlate with high
 * ratings. Those phrases get injected as inspiration hints on future
 * generations in the same category.
 *
 * This is:
 *   - Cheap: just SQL-ish aggregation over a small map.
 *   - Explainable: you can see exactly which phrases are winning.
 *   - Per-category: "knight-like" phrasing shouldn't leak into vegetation.
 */

/** Words we never extract — punctuation-light and semantically empty. */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'with', 'to', 'in', 'on',
  'at', 'is', 'it', 'that', 'this', 'these', 'those', 'my', 'your',
  'me', 'i', 'we', 'us', 'be', 'are', 'was', 'were', 'has', 'have',
  'make', 'create', 'generate', 'build', 'give', 'show',
  'please', 'like', 'very', 'really', 'kind', 'sort', 'some', 'any',
]);

export interface PhraseStat {
  /** Sum of (rating - 3) per observation. 0 = neutral. */
  sum: number;
  /** Total times this phrase was observed across rated prompts. */
  count: number;
}

export type PhraseStats = Record<string, PhraseStat>;

/**
 * Tokenize a prompt into a set of learning-worthy phrases:
 *   - lowercase
 *   - strip punctuation
 *   - drop stopwords and tokens shorter than 3 chars
 *   - emit unigrams AND adjacent bigrams (so "red cape" beats just "red")
 */
export function extractPhrases(prompt: string): string[] {
  const tokens = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));

  const phrases = new Set<string>(tokens);
  for (let i = 0; i < tokens.length - 1; i++) {
    phrases.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return [...phrases];
}

/**
 * Apply a rating (1–5) to every phrase extracted from the prompt. The
 * signal is centered on 3 (neutral): 5 → +2, 1 → −2. Stored as sum +
 * count so averages are always just sum / count.
 *
 * Pure — returns a new stats object so zustand's equality check fires.
 */
export function applyRatingToPhrases(
  stats: PhraseStats,
  prompt: string,
  rating: number,
): PhraseStats {
  const delta = rating - 3;
  const next: PhraseStats = { ...stats };
  for (const phrase of extractPhrases(prompt)) {
    const cur = next[phrase] ?? { sum: 0, count: 0 };
    next[phrase] = { sum: cur.sum + delta, count: cur.count + 1 };
  }
  return next;
}

/**
 * When a user re-rates the same generation, we want the stored stats to
 * reflect the NEW rating, not the sum of both. Callers that track the
 * previous rating can subtract it first using this inverse helper.
 */
export function unapplyRatingFromPhrases(
  stats: PhraseStats,
  prompt: string,
  previousRating: number,
): PhraseStats {
  const delta = -(previousRating - 3);
  const next: PhraseStats = { ...stats };
  for (const phrase of extractPhrases(prompt)) {
    const cur = next[phrase];
    if (!cur) continue;
    const sum = cur.sum + delta;
    const count = Math.max(0, cur.count - 1);
    if (count === 0) {
      delete next[phrase];
    } else {
      next[phrase] = { sum, count };
    }
  }
  return next;
}

export interface RankedPhrase {
  phrase: string;
  avg: number;
  count: number;
}

/**
 * Top phrases by average rating. Requires ≥ minCount observations so one
 * lucky 5-star rating can't dominate the suggestions.
 */
export function topPhrases(
  stats: PhraseStats,
  opts: { limit?: number; minCount?: number; minAvg?: number } = {},
): RankedPhrase[] {
  const { limit = 6, minCount = 2, minAvg = 0.5 } = opts;
  const ranked: RankedPhrase[] = [];
  for (const [phrase, s] of Object.entries(stats)) {
    if (s.count < minCount) continue;
    const avg = s.sum / s.count;
    if (avg < minAvg) continue;
    ranked.push({ phrase, avg, count: s.count });
  }
  ranked.sort((a, b) => b.avg - a.avg || b.count - a.count);
  return ranked.slice(0, limit);
}
