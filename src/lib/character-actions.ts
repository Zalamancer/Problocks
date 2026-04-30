/**
 * Canonical character action catalog.
 *
 * Animations uploaded or AI-generated for a character can be tagged with
 * a `CharacterActionId` so the runtime (TileView play loop, AI agents,
 * future scripting bindings) can look up "the run animation for this
 * direction" without grepping a free-text label. Custom (untagged)
 * animations still work — they just won't be picked up by the canonical
 * lookup.
 *
 * Presets are intentionally ordered "core platformer/RPG verbs first"
 * so the chip row in the Generate panel reads naturally.
 */
import type { CharacterAnimation, CharacterDir8, TileCharacter } from '@/store/tile-store';

export type CharacterActionId =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'attack'
  | 'defend'
  | 'hurt'
  | 'die'
  | 'swim'
  | 'cast';

export interface CharacterActionPreset {
  id: CharacterActionId;
  /** Human-facing chip label. */
  label: string;
  /** Default PixelLab prompt — verb-noun phrasing tends to produce the
   *  cleanest 16-frame loops. The user can edit before generating. */
  prompt: string;
  /** One-line description for tooltips / the runtime help. */
  hint: string;
}

export const CHARACTER_ACTION_PRESETS: CharacterActionPreset[] = [
  { id: 'idle',   label: 'Idle',   prompt: 'idle breathing',           hint: 'Default resting pose' },
  { id: 'walk',   label: 'Walk',   prompt: 'walking',                  hint: 'Slow movement cycle' },
  { id: 'run',    label: 'Run',    prompt: 'running',                  hint: 'Fast movement cycle' },
  { id: 'jump',   label: 'Jump',   prompt: 'jumping',                  hint: 'Vertical leap' },
  { id: 'attack', label: 'Attack', prompt: 'attacking with weapon',    hint: 'Primary attack' },
  { id: 'defend', label: 'Defend', prompt: 'blocking with shield',     hint: 'Block / parry' },
  { id: 'hurt',   label: 'Hurt',   prompt: 'taking damage',            hint: 'Hit reaction' },
  { id: 'die',    label: 'Die',    prompt: 'dying and falling down',   hint: 'Death sequence' },
  { id: 'swim',   label: 'Swim',   prompt: 'swimming',                 hint: 'In-water locomotion' },
  { id: 'cast',   label: 'Cast',   prompt: 'casting a spell',          hint: 'Magic / projectile' },
];

const PRESET_BY_ID: Record<CharacterActionId, CharacterActionPreset> = Object.fromEntries(
  CHARACTER_ACTION_PRESETS.map((p) => [p.id, p]),
) as Record<CharacterActionId, CharacterActionPreset>;

export function getCharacterActionPreset(id: CharacterActionId): CharacterActionPreset {
  return PRESET_BY_ID[id];
}

export function isCharacterActionId(value: unknown): value is CharacterActionId {
  return typeof value === 'string' && value in PRESET_BY_ID;
}

/**
 * Return the first animation for `(character, dir, actionId)` whose
 * `actionId` exactly matches. Falls back to a label-based match
 * (case-insensitive, label === preset.label or label === preset.id) so
 * legacy uploads named "run" / "Run" still resolve. Returns `null`
 * when nothing matches — callers should handle the absent case (e.g.
 * fall back to the rotation cell from the 3×3 sheet).
 */
export function findCharacterAnimation(
  character: TileCharacter,
  dir: CharacterDir8,
  actionId: CharacterActionId,
): CharacterAnimation | null {
  const list = character.animations?.[dir] ?? [];
  if (list.length === 0) return null;
  const tagged = list.find((a) => a.actionId === actionId);
  if (tagged) return tagged;
  const preset = PRESET_BY_ID[actionId];
  const want = new Set([actionId.toLowerCase(), preset.label.toLowerCase()]);
  return list.find((a) => want.has(a.label.trim().toLowerCase())) ?? null;
}

/**
 * Bulk variant: returns the first animation per direction matching
 * `actionId`. Missing directions are left undefined so the runtime can
 * detect partial coverage without looping itself.
 */
export function findCharacterAnimationByDirection(
  character: TileCharacter,
  actionId: CharacterActionId,
): Partial<Record<CharacterDir8, CharacterAnimation>> {
  const out: Partial<Record<CharacterDir8, CharacterAnimation>> = {};
  for (const dir of Object.keys(character.animations ?? {}) as CharacterDir8[]) {
    const hit = findCharacterAnimation(character, dir, actionId);
    if (hit) out[dir] = hit;
  }
  return out;
}
