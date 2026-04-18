/**
 * Model catalog for Part Studio.
 *
 * Aliases (`opus` / `sonnet` / `haiku`) match Claude CLI's `--model`
 * flag. Pricing is API list pricing per 1M tokens — the CLI reports
 * total_cost_usd directly for each call, but we keep pricing here so
 * the UI can estimate cost *before* firing when the user toggles models.
 */
import type { ClaudeModelId } from './types';

export interface ModelInfo {
  id: ClaudeModelId;
  label: string;
  /** Canonical full id surfaced in Anthropic docs. */
  fullId: string;
  /** One-line positioning so the user knows when to reach for it. */
  tagline: string;
  /** USD per 1M input tokens (standard, non-cached). */
  inputPer1M: number;
  /** USD per 1M output tokens. */
  outputPer1M: number;
  /** USD per 1M cache-read input tokens (~10% of input for Anthropic). */
  cacheReadPer1M: number;
  /** USD per 1M cache-write input tokens (125% of input for Anthropic). */
  cacheWritePer1M: number;
}

export const MODEL_CATALOG: Record<ClaudeModelId, ModelInfo> = {
  opus: {
    id: 'opus',
    label: 'Opus 4.7 · Max',
    fullId: 'claude-opus-4-7',
    tagline: 'Highest quality. Best silhouettes, richest color palettes. ~50× Haiku cost.',
    inputPer1M: 15,
    outputPer1M: 75,
    cacheReadPer1M: 1.5,
    cacheWritePer1M: 18.75,
  },
  sonnet: {
    id: 'sonnet',
    label: 'Sonnet 4.6',
    fullId: 'claude-sonnet-4-6',
    tagline: 'Best default. Solid primitive placement, ~10× Haiku cost.',
    inputPer1M: 3,
    outputPer1M: 15,
    cacheReadPer1M: 0.3,
    cacheWritePer1M: 3.75,
  },
  haiku: {
    id: 'haiku',
    label: 'Haiku 4.5',
    fullId: 'claude-haiku-4-5',
    tagline: 'Fast and nearly free. Great for iterating on simple assets.',
    inputPer1M: 1,
    outputPer1M: 5,
    cacheReadPer1M: 0.1,
    cacheWritePer1M: 1.25,
  },
};

export const MODEL_ORDER: ClaudeModelId[] = ['opus', 'sonnet', 'haiku'];

export const DEFAULT_MODEL: ClaudeModelId = 'haiku';

/**
 * Format a USD cost for UI display. Tiny costs get ¢; generation-scale
 * costs get $ with enough precision to distinguish a Haiku call from
 * an Opus call without showing scientific notation.
 */
export function formatUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return '$0';
  if (usd < 0.001) return `${(usd * 1000).toFixed(2)}m¢`; // millicents
  if (usd < 0.01)  return `${(usd * 100).toFixed(2)}¢`;
  if (usd < 1)     return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}
