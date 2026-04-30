'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Trash2, Upload, User, Film, Pencil, Sparkles } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelSelect } from '@/components/ui/panel-controls/PanelSelect';
import { PanelIconTabs } from '@/components/ui/panel-controls/PanelIconTabs';
import { PanelInput } from '@/components/ui/panel-controls/PanelInput';
import { fileToImage, imageToDataUrl } from '@/lib/tile-slicer';
import { useToastStore } from '@/store/toast-store';
import {
  useTile,
  CHARACTER_DIRS,
  type TileCharacter,
  type CharacterDir8,
  type CharacterAnimation,
} from '@/store/tile-store';

/**
 * Right-panel Properties view for a selected playable character.
 *
 * Mirrors the asset panel's chrome stack: edge-to-edge image preview at
 * the top, then PanelSection-wrapped controls in `px-4 py-4` padding,
 * and a sticky-footer destructive action.
 *
 * Two sub-tabs (animated PanelIconTabs, label expands on the active tab
 * to match the left panel's [Objects | Groups | Characters] row):
 *   • Character — preview of the rotating 3×3 sheet with a Replace
 *     button that swaps the whole sheet (and clears every direction's
 *     animation list, since the new poses no longer match), plus a
 *     Rotation list of the 8 directions and a Movement section.
 *   • Animations — for one currently-picked direction, list every
 *     uploaded 4×4 action sheet (rename / drag-reorder / hover delete,
 *     identical chrome to the asset panel's StylesList) plus an Add
 *     animation button.
 */
export function TileCharacterPropertiesPanel({ headless }: { headless?: boolean } = {}) {
  const selectedCharacterId = useTile((s) => s.selectedCharacterId);
  const character = useTile((s) =>
    s.selectedCharacterId
      ? s.tileCharacters[s.selectedCharacterId] ?? null
      : null,
  );
  const removeTileCharacter = useTile((s) => s.removeTileCharacter);
  const updateTileCharacter = useTile((s) => s.updateTileCharacter);
  const replaceCharacterSheet = useTile((s) => s.replaceCharacterSheet);

  const [tab, setTab] = useState<'character' | 'animations'>('character');
  // Drill-down: when the user clicks a direction on the Character tab,
  // the tab swaps to the per-direction Animations editor (with a Back
  // button). `null` means we're showing the directions list view.
  const [drilldownDir, setDrilldownDir] = useState<CharacterDir8 | null>(null);
  // Generation flow on the Animations tab — the footer button kicks off
  // the run, the body of GenerateAnimationsTab does the actual work via
  // a callback registered into this ref.
  const [generating, setGenerating] = useState(false);
  const generateTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setTab('character');
    setDrilldownDir(null);
  }, [character?.id]);

  if (!selectedCharacterId || !character) return null;

  // Inline shell — defining a Shell component variable inside the body
  // creates a NEW component identity on every render, which causes React
  // to unmount/remount the entire subtree (and wipe local state like
  // `pendingNameId` on the per-direction view). Compose it as plain JSX
  // so the children stay mounted across re-renders.
  const body = (
    <>
      <PanelIconTabs
        tabs={[
          { id: 'character', label: 'Character', icon: User },
          { id: 'animations', label: 'Animations', icon: Film },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {tab === 'character' ? (
          drilldownDir ? (
            <DirectionAnimationsView
              character={character}
              dir={drilldownDir}
              onBack={() => setDrilldownDir(null)}
            />
          ) : (
            <CharacterTab
              character={character}
              onPickDir={(dir) => setDrilldownDir(dir)}
              onUpdateCharacter={(patch) => updateTileCharacter(character.id, patch)}
              onReplaceSheet={(input) => replaceCharacterSheet(character.id, input)}
            />
          )
        ) : (
          <GenerateAnimationsTab
            character={character}
            generating={generating}
            setGenerating={setGenerating}
            registerSubmit={(fn) => { generateTriggerRef.current = fn; }}
          />
        )}
      </div>

      <footer
        className="shrink-0"
        style={{
          padding: 12,
          borderTop: '1.5px solid var(--pb-line-2)',
          background: 'var(--pb-paper)',
        }}
      >
        {tab === 'character' ? (
          <PanelActionButton
            variant="destructive"
            icon={Trash2}
            fullWidth
            onClick={() => removeTileCharacter(character.id)}
          >
            Delete character
          </PanelActionButton>
        ) : (
          <PanelActionButton
            variant="primary"
            icon={Sparkles}
            fullWidth
            loading={generating}
            onClick={() => generateTriggerRef.current?.()}
          >
            {generating ? 'Generating…' : 'Generate animation'}
          </PanelActionButton>
        )}
      </footer>
    </>
  );

  if (headless) return body;
  return (
    <aside
      className="w-full md:w-[260px] flex flex-col rounded-xl overflow-hidden shrink-0"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
      }}
    >
      {body}
    </aside>
  );
}

const DIR_LABEL: Record<CharacterDir8, string> = {
  n: 'North',
  ne: 'North-East',
  e: 'East',
  se: 'South-East',
  s: 'South',
  sw: 'South-West',
  w: 'West',
  nw: 'North-West',
};

/** Cell index inside the 3×3 source sheet for a given direction.
 *  Sheet layout (sequential reading order, top-to-bottom, left-to-right):
 *      S(0)  SE(1) E(2)
 *      NE(3) N(4)  NW(5)
 *      W(6)  SW(7) [discarded(8)]
 *  All 8 directions have unique cells; cell 8 is the discarded slot. */
const DIR_CELL: Record<CharacterDir8, number> = {
  s: 0, se: 1, e: 2,
  ne: 3, n: 4, nw: 5,
  w: 6, sw: 7,
};

// ─────────────────────────────────────────────────────────────────────
// Character tab
// ─────────────────────────────────────────────────────────────────────

function CharacterTab({
  character, onPickDir, onUpdateCharacter, onReplaceSheet,
}: {
  character: TileCharacter;
  /** Drill into a direction's per-direction animations view. */
  onPickDir: (dir: CharacterDir8) => void;
  onUpdateCharacter: (patch: Partial<TileCharacter>) => void;
  onReplaceSheet: (input: { src: string; cols: number; rows: number; frameW: number; frameH: number }) => void;
}) {
  // Rotation cycles through the 8 directions in canonical order. Runs
  // unconditionally — clicks in the rotation list pick a slot to edit
  // but DO NOT pause the preview.
  const [rotationIndex, setRotationIndex] = useState(0);
  useEffect(() => {
    const handle = window.setInterval(() => {
      setRotationIndex((i) => (i + 1) % CHARACTER_DIRS.length);
    }, 140);
    return () => window.clearInterval(handle);
  }, []);

  const previewDir: CharacterDir8 = CHARACTER_DIRS[rotationIndex];
  const cell = DIR_CELL[previewDir];
  const col = cell % character.cols;
  const row = Math.floor(cell / character.cols);
  const bgPosX = character.cols > 1 ? (col / (character.cols - 1)) * 100 : 0;
  const bgPosY = character.rows > 1 ? (row / (character.rows - 1)) * 100 : 0;

  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);

  async function handleReplace(file: File) {
    setReplacing(true);
    setReplaceError(null);
    try {
      const img = await fileToImage(file);
      const cols = 3;
      const rows = 3;
      if (img.naturalWidth % cols !== 0 || img.naturalHeight % rows !== 0) {
        throw new Error(
          `Sheet must divide cleanly into a ${cols}×${rows} grid ` +
            `(got ${img.naturalWidth}×${img.naturalHeight}).`,
        );
      }
      const dataUrl = imageToDataUrl(img);
      onReplaceSheet({
        src: dataUrl,
        cols,
        rows,
        frameW: Math.floor(img.naturalWidth / cols),
        frameH: Math.floor(img.naturalHeight / rows),
      });
    } catch (err) {
      setReplaceError(err instanceof Error ? err.message : String(err));
    } finally {
      setReplacing(false);
    }
  }

  return (
    <>
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void handleReplace(file);
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.06)',
          borderBottom: '1.5px solid var(--pb-line-2)',
          overflow: 'hidden',
          padding: 12,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 12,
            backgroundImage: `url(${character.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${character.cols * 100}% ${character.rows * 100}%`,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            imageRendering: 'pixelated',
          }}
        />
        <button
          type="button"
          onClick={() => replaceInputRef.current?.click()}
          disabled={replacing}
          title={replacing ? 'Uploading…' : 'Replace 3×3 sheet (resets all rotations + animations)'}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 8,
            cursor: replacing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pb-ink)',
            opacity: replacing ? 0.55 : 1,
            boxShadow: '0 2px 0 var(--pb-line-2)',
          }}
        >
          <Upload size={14} strokeWidth={2.4} />
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {replaceError && (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.35,
              color: 'var(--pb-coral-ink)',
              background: 'var(--pb-coral)',
              border: '1.5px solid var(--pb-coral-ink)',
              borderRadius: 8,
              wordBreak: 'break-word',
            }}
          >
            {replaceError}
          </p>
        )}

        <PanelSection title="Rotation" collapsible defaultOpen>
          <DirectionList
            character={character}
            activeDir={null}
            onPick={onPickDir}
            markStyle="dot"
          />
        </PanelSection>

        <PanelSection title="Movement" collapsible defaultOpen={false}>
          <PanelSlider
            label="Walk speed"
            value={character.speed}
            onChange={(v) => onUpdateCharacter({ speed: v })}
            min={20}
            max={600}
            step={10}
            suffix=" u/s"
          />
          <PanelSlider
            label="Animation FPS"
            value={character.fps}
            onChange={(v) => onUpdateCharacter({ fps: v })}
            min={1}
            max={24}
            step={1}
          />
        </PanelSection>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Direction animations view — rendered inside the Character tab when
// the user drills into a single direction. The 4×4 action sheet upload
// flow used to live in its own "Animations" tab; it's now reachable
// from a Back button at the top.
// ─────────────────────────────────────────────────────────────────────

function DirectionAnimationsView({
  character, dir, onBack,
}: {
  character: TileCharacter;
  dir: CharacterDir8;
  onBack: () => void;
}) {
  const activeDir = dir;
  // Assembly-line UI: preview only shows the animation that was JUST
  // uploaded and is awaiting a name. Once the user commits the name (or
  // dismisses the field) the slot clears and the preview reverts to its
  // empty upload prompt — ready for the next sheet. Saved animations
  // accumulate in the data model for the runtime; this view never
  // re-surfaces them.
  const animations = character.animations?.[activeDir] ?? [];
  const [pendingNameId, setPendingNameId] = useState<string | null>(null);
  // Direction switch (different drilldown) wipes the pending slot — the
  // new direction's tile should start empty regardless of the previous
  // one's in-flight state.
  useEffect(() => {
    setPendingNameId(null);
  }, [activeDir]);
  const animation = pendingNameId
    ? animations.find((a) => a.id === pendingNameId) ?? null
    : null;

  const addCharacterAnimation = useTile((s) => s.addCharacterAnimation);
  const removeCharacterAnimation = useTile((s) => s.removeCharacterAnimation);
  const renameCharacterAnimation = useTile((s) => s.renameCharacterAnimation);
  const setCharacterAnimationSrc = useTile((s) => s.setCharacterAnimationSrc);

  const addInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ingestNewAnimation(files: File[]) {
    if (files.length === 0) return;
    const file = files[0];
    setUploading(true);
    setError(null);
    try {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const img = await fileToImage(file);
      const cols = 4;
      const rows = 4;
      if (img.naturalWidth % cols !== 0 || img.naturalHeight % rows !== 0) {
        throw new Error(
          `"${baseName}" must divide cleanly into a ${cols}×${rows} grid ` +
            `(got ${img.naturalWidth}×${img.naturalHeight}).`,
        );
      }
      const dataUrl = imageToDataUrl(img);
      const newId = addCharacterAnimation(character.id, activeDir, {
        label: baseName,
        src: dataUrl,
        cols,
        rows,
        frameW: Math.floor(img.naturalWidth / cols),
        frameH: Math.floor(img.naturalHeight / rows),
      });
      setPendingNameId(newId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function ingestReplaceAnimation(file: File) {
    if (!animation) return;
    setUploading(true);
    setError(null);
    try {
      const img = await fileToImage(file);
      const cols = 4;
      const rows = 4;
      if (img.naturalWidth % cols !== 0 || img.naturalHeight % rows !== 0) {
        throw new Error(
          `Sheet must divide cleanly into a ${cols}×${rows} grid ` +
            `(got ${img.naturalWidth}×${img.naturalHeight}).`,
        );
      }
      setCharacterAnimationSrc(character.id, activeDir, animation.id, {
        src: imageToDataUrl(img),
        cols,
        rows,
        frameW: Math.floor(img.naturalWidth / cols),
        frameH: Math.floor(img.naturalHeight / rows),
      });
      setPendingNameId(animation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={addInputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg"
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          void ingestNewAnimation(files);
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void ingestReplaceAnimation(file);
        }}
      />

      <BackHeader label={`${DIR_LABEL[activeDir]} animations`} onBack={onBack} />

      <AnimationPreview
        animation={animation}
        onReplace={() => replaceInputRef.current?.click()}
        onClear={
          animation
            ? () => {
                removeCharacterAnimation(character.id, activeDir, animation.id);
                setPendingNameId(null);
              }
            : undefined
        }
        onUpload={() => addInputRef.current?.click()}
        directionLabel={DIR_LABEL[activeDir]}
        uploading={uploading}
        fps={character.fps}
      />

      <div className="px-4 py-4 flex flex-col gap-3">
        {error && (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.35,
              color: 'var(--pb-coral-ink)',
              background: 'var(--pb-coral)',
              border: '1.5px solid var(--pb-coral-ink)',
              borderRadius: 8,
              wordBreak: 'break-word',
            }}
          >
            {error}
          </p>
        )}

        {animation && (
          <AnimationNameField
            value={animation.label}
            autoFocus={pendingNameId === animation.id}
            onCommit={(label) => {
              if (label !== animation.label) {
                renameCharacterAnimation(character.id, activeDir, animation.id, label);
              }
              // Always clear the pending slot so the preview reverts to its
              // empty upload prompt — the user can drop the next sheet
              // without first deleting this one.
              setPendingNameId(null);
            }}
          />
        )}

        <SavedAnimationsList
          animations={animations}
          excludeId={pendingNameId}
          onRemove={(animId) => removeCharacterAnimation(character.id, activeDir, animId)}
          onRename={(animId, label) =>
            renameCharacterAnimation(character.id, activeDir, animId, label)
          }
        />
      </div>
    </>
  );
}

/**
 * Compact list of every saved animation for the active direction. Hidden
 * when empty so the panel still feels minimal on a brand-new direction.
 * The currently-being-named animation (`excludeId`) is omitted because
 * it's already on display in the preview tile above. Each row shows a
 * single-frame thumbnail (top-left cell of the sheet), the user-given
 * name as a click-to-rename input, and a delete button.
 */
function SavedAnimationsList({
  animations, excludeId, onRemove, onRename,
}: {
  animations: CharacterAnimation[];
  excludeId: string | null;
  onRemove: (animationId: string) => void;
  onRename: (animationId: string, label: string) => void;
}) {
  const visible = animations.filter((a) => a.id !== excludeId);
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
        SAVED ({visible.length})
      </span>
      {visible.map((anim) => (
        <SavedAnimationRow
          key={anim.id}
          animation={anim}
          onRemove={() => onRemove(anim.id)}
          onRename={(label) => onRename(anim.id, label)}
        />
      ))}
    </div>
  );
}

function SavedAnimationRow({
  animation, onRemove, onRename,
}: {
  animation: CharacterAnimation;
  onRemove: () => void;
  onRename: (label: string) => void;
}) {
  const [draft, setDraft] = useState(animation.label);
  useEffect(() => { setDraft(animation.label); }, [animation.label]);

  function commit() {
    const next = draft.trim();
    if (next.length === 0) {
      setDraft(animation.label);
      return;
    }
    if (next !== animation.label) onRename(next);
  }

  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: 'var(--pb-cream-2)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 7,
        padding: '5px 6px',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: 5,
          border: '1.5px solid var(--pb-line-2)',
          background: 'rgba(0,0,0,0.05)',
          backgroundImage: `url(${animation.src})`,
          backgroundSize: `${animation.cols * 100}% ${animation.rows * 100}%`,
          backgroundPosition: '0% 0%',
          imageRendering: 'pixelated',
        }}
      />
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setDraft(animation.label);
            e.currentTarget.blur();
          }
        }}
        style={{
          flex: 1,
          minWidth: 0,
          padding: '4px 6px',
          background: 'transparent',
          border: 0,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--pb-ink)',
          outline: 'none',
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        title="Delete animation"
        style={{
          background: 'transparent',
          border: 0,
          padding: 4,
          cursor: 'pointer',
          color: 'var(--pb-coral-ink)',
          display: 'flex',
        }}
      >
        <Trash2 size={12} strokeWidth={2.4} />
      </button>
    </div>
  );
}

/**
 * Inline name input that pops below the preview after a fresh upload.
 * Auto-focuses + selects the auto-derived basename so the user can type
 * over it immediately. Commits on Enter / blur; Esc reverts and bails.
 */
function AnimationNameField({
  value, autoFocus, onCommit,
}: {
  value: string;
  autoFocus: boolean;
  onCommit: (label: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Sync external label changes (e.g. user uploads a new sheet whose
  // basename becomes the new label) into the local draft.
  useEffect(() => {
    setDraft(value);
  }, [value]);
  // Grab focus + select on the upload tick so the user starts typing
  // straight away. Runs once per pendingNameId set by the parent.
  useEffect(() => {
    if (!autoFocus) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [autoFocus]);

  // Ref so Esc/blur paths can hand the parent the original `value`
  // without first re-rendering through `setDraft`. Avoids racing the
  // parent's `setPendingNameId(null)` against our local state.
  function commit(label: string) {
    const next = label.trim();
    onCommit(next.length === 0 ? value : next);
  }

  return (
    <label
      className="flex flex-col gap-1.5"
      style={{ fontSize: 10, fontWeight: 800, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}
    >
      ANIMATION NAME
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          } else if (e.key === 'Escape') {
            // Commit the original value so the parent still clears the
            // pending slot — Escape means "stop editing", not "stay open".
            commit(value);
            e.currentTarget.blur();
          }
        }}
        placeholder="e.g. walk, idle, attack…"
        style={{
          padding: '7px 9px',
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--pb-ink)',
        }}
      />
    </label>
  );
}

/**
 * Edge-to-edge top tile for the Animations tab. When an animation is
 * selected, autoplays the sheet — one frame at a time, cycling through
 * the cols×rows cells at the character's `fps` (default 8) so the user
 * sees the motion the way it'll render in-game. Floating Replace /
 * Delete buttons sit on top. When no animation is uploaded yet for the
 * active direction, paints a dashed upload prompt instead.
 */
function AnimationPreview({
  animation, directionLabel, uploading, fps,
  onReplace, onClear, onUpload,
}: {
  animation: CharacterAnimation | null;
  directionLabel: string;
  uploading: boolean;
  /** Frame rate for autoplay. Defaults to 8 so brand-new characters
   *  without a fps yet still preview at a sensible cadence. */
  fps?: number;
  onReplace: () => void;
  onClear?: () => void;
  onUpload: () => void;
}) {
  const [frame, setFrame] = useState(0);
  // Reset frame on src change so swapping/replacing the sheet doesn't
  // briefly show a frame index past the new sheet's last cell.
  useEffect(() => {
    setFrame(0);
  }, [animation?.src, animation?.cols, animation?.rows]);
  // Autoplay loop. Stops cleanly when there's no animation OR the cell
  // count is 0; otherwise ticks at 1/fps and wraps back to 0.
  useEffect(() => {
    if (!animation) return;
    const total = animation.cols * animation.rows;
    if (total <= 1) return;
    const interval = 1000 / Math.max(1, fps ?? 8);
    const handle = window.setInterval(() => {
      setFrame((f) => (f + 1) % total);
    }, interval);
    return () => window.clearInterval(handle);
  }, [animation, fps]);

  if (!animation) {
    return (
      <button
        type="button"
        onClick={onUpload}
        disabled={uploading}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.06)',
          borderBottom: '1.5px solid var(--pb-line-2)',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.55 : 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: 'inherit',
          color: 'var(--pb-ink)',
        }}
      >
        <Upload size={20} strokeWidth={2.4} style={{ color: 'var(--pb-ink-muted)' }} />
        <span style={{ fontSize: 12, fontWeight: 800 }}>
          {uploading ? 'Uploading…' : 'Upload first 4×4 sheet'}
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)', textAlign: 'center', lineHeight: 1.4, padding: '0 24px' }}>
          16 frames left-to-right, top-to-bottom for {directionLabel}.
        </span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        flexShrink: 0,
        background: 'rgba(0,0,0,0.06)',
        borderBottom: '1.5px solid var(--pb-line-2)',
        overflow: 'hidden',
        padding: 12,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CellThumb
          src={animation.src}
          cols={animation.cols}
          rows={animation.rows}
          cell={frame}
          size={'100%'}
          bare
        />
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onReplace(); }}
        title={uploading ? 'Uploading…' : 'Replace this animation'}
        disabled={uploading}
        style={{
          position: 'absolute',
          top: 8,
          right: onClear ? 44 : 8,
          width: 30,
          height: 30,
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 8,
          cursor: uploading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--pb-ink)',
          opacity: uploading ? 0.55 : 1,
        }}
      >
        <Upload size={14} strokeWidth={2.4} />
      </button>
      {onClear && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          title="Delete this animation"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 30,
            height: 30,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pb-coral-ink)',
          }}
        >
          <Trash2 size={14} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

/**
 * Verbatim port of `StylesList` from `TileAssetPropertiesPanel.tsx` —
 * View dropdown, list/grid layout, hover-revealed Pencil + Trash actions,
 * drag-reorder, double-click-to-rename. Re-skinned for character action
 * animations (one entry per uploaded 4×4 sheet for the active direction).
 *
 * The thumbnail is the FIRST frame of the 4×4 sheet (cell 0) — same
 * convention pixellab uses to identify a sheet at a glance, mirrors the
 * cell-clipped thumbnails in the rotation list above.
 */
function AnimationsList({
  characterId, direction, animations, selectedAnimationId,
  onPick, onRemove, onRename, onReorder,
}: {
  characterId: string;
  direction: CharacterDir8;
  animations: CharacterAnimation[];
  selectedAnimationId: string | null;
  onPick: (animationId: string) => void;
  onRemove: (animationId: string) => void;
  onRename: (animationId: string, label: string) => void;
  onReorder: (orderedAnimationIds: string[]) => void;
}) {
  // Reset the row-edit + hover state when the user switches direction
  // so the prior direction's editing affordance doesn't bleed across.
  void characterId;
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  useEffect(() => {
    setEditingId(null);
    setHoveredId(null);
  }, [direction]);

  function reorderViaDrop(targetId: string) {
    const fromId = dragIdRef.current;
    dragIdRef.current = null;
    if (!fromId || fromId === targetId) return;
    const order = animations.map((a) => a.id);
    const fromIdx = order.indexOf(fromId);
    const toIdx = order.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = order.slice();
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, fromId);
    onReorder(next);
  }

  if (animations.length === 0) {
    return (
      <p style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 600, margin: 0 }}>
        No animations yet for {DIR_LABEL[direction]}. Upload a 4×4 sheet to add one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <PanelSelect
        label="View"
        value={viewMode}
        onChange={(v) => setViewMode(v as typeof viewMode)}
        options={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
        ]}
      />
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-1' : 'flex flex-col gap-px'}>
        {animations.map((animation, i) => {
          const isCurrent = animation.id === selectedAnimationId;
          const isEditing = editingId === animation.id;
          const isHovered = hoveredId === animation.id;
          const showActions = isHovered || isCurrent || isEditing;
          const bg = isCurrent
            ? 'var(--pb-butter)'
            : isHovered
              ? 'rgba(0,0,0,0.04)'
              : 'transparent';
          const labelText = animation.label || `Animation ${i + 1}`;
          const containerStyle: React.CSSProperties = {
            background: bg,
            borderRadius: 6,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          };
          const editButton = (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingId(animation.id); }}
              title="Rename animation"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid var(--pb-line-2)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--pb-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4,
              }}
            >
              <Pencil size={12} strokeWidth={2.4} />
            </button>
          );
          const deleteButton = (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(animation.id); }}
              title="Delete animation"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid var(--pb-line-2)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--pb-coral-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4,
              }}
            >
              <Trash2 size={12} strokeWidth={2.4} />
            </button>
          );
          const commonHandlers = {
            draggable: !isEditing,
            onMouseEnter: () => setHoveredId(animation.id),
            onMouseLeave: () => setHoveredId((h) => (h === animation.id ? null : h)),
            onDragStart: (e: React.DragEvent) => {
              dragIdRef.current = animation.id;
              e.dataTransfer.effectAllowed = 'move';
              try { e.dataTransfer.setData('text/plain', animation.id); } catch { /* ignore */ }
            },
            onDragOver: (e: React.DragEvent) => {
              if (!dragIdRef.current || dragIdRef.current === animation.id) return;
              e.preventDefault();
            },
            onDrop: (e: React.DragEvent) => { e.preventDefault(); reorderViaDrop(animation.id); },
            onClick: (e: React.MouseEvent) => {
              const t = e.target as HTMLElement;
              if (t.closest('button, input')) return;
              onPick(animation.id);
            },
          };

          if (viewMode === 'grid') {
            return (
              <div key={animation.id} {...commonHandlers} style={containerStyle}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCurrent ? 'transparent' : 'rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  <CellThumb
                    src={animation.src}
                    cols={animation.cols}
                    rows={animation.rows}
                    cell={0}
                    size={'100%'}
                    bare
                  />
                </div>
                {isEditing ? (
                  <input
                    autoFocus
                    defaultValue={animation.label}
                    onBlur={(e) => { onRename(animation.id, e.target.value); setEditingId(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      background: 'var(--pb-paper)',
                      border: '1.5px solid var(--pb-line-2)',
                      borderRadius: 5,
                      padding: '3px 6px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--pb-ink)',
                    }}
                  />
                ) : (
                  <div
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingId(animation.id); }}
                    title={labelText}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--pb-ink)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      padding: '4px 4px 6px',
                      textAlign: 'center',
                    }}
                  >
                    {labelText}
                  </div>
                )}
                {showActions && !isEditing && (
                  <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
                    {editButton}
                    {deleteButton}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={animation.id} {...commonHandlers} style={containerStyle}>
              <div className="flex items-center gap-2" style={{ padding: '4px 6px' }}>
                <div
                  style={{
                    width: 56, height: 56, flexShrink: 0,
                    background: isCurrent ? 'transparent' : 'rgba(0,0,0,0.03)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <CellThumb
                    src={animation.src}
                    cols={animation.cols}
                    rows={animation.rows}
                    cell={0}
                    size={'100%'}
                    bare
                  />
                </div>
                {isEditing ? (
                  <input
                    autoFocus
                    defaultValue={animation.label}
                    onBlur={(e) => { onRename(animation.id, e.target.value); setEditingId(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'var(--pb-paper)',
                      border: '1.5px solid var(--pb-line-2)',
                      borderRadius: 5,
                      padding: '5px 8px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--pb-ink)',
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingId(animation.id); }}
                    title="Double-click to rename"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--pb-ink)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      cursor: 'text',
                    }}
                  >
                    {labelText}
                  </span>
                )}
                {showActions && !isEditing && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {editButton}
                    {deleteButton}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Rotation list — fixed 8 directions, no actions, optional green dot
// for the clicked one.
// ─────────────────────────────────────────────────────────────────────

function DirectionList({
  character, activeDir, onPick, markStyle = 'highlight',
}: {
  character: TileCharacter;
  /** Direction the user has clicked. With `markStyle: 'highlight'` this
   *  row gets a butter wash; with `markStyle: 'dot'` it shows a small
   *  green dot in the corner. `null` = nothing's been clicked yet. */
  activeDir: CharacterDir8 | null;
  onPick: (dir: CharacterDir8) => void;
  markStyle?: 'highlight' | 'dot';
}) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [hoveredDir, setHoveredDir] = useState<CharacterDir8 | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <PanelSelect
        label="View"
        value={viewMode}
        onChange={(v) => setViewMode(v as typeof viewMode)}
        options={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
        ]}
      />
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-1' : 'flex flex-col gap-px'}>
        {CHARACTER_DIRS.map((dir) => {
          const isCurrent = dir === activeDir;
          const isHovered = hoveredDir === dir;
          const animsForDir = character.animations?.[dir]?.length ?? 0;
          const useHighlight = markStyle === 'highlight';
          const bg = isCurrent && useHighlight
            ? 'var(--pb-butter)'
            : isHovered
              ? 'rgba(0,0,0,0.04)'
              : 'transparent';
          const greenDot = isCurrent && !useHighlight ? (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: '#22c55e',
                boxShadow: '0 0 0 1.5px var(--pb-paper)',
              }}
              title="Selected for animation editing"
            />
          ) : null;
          const labelText = DIR_LABEL[dir];
          const containerStyle: React.CSSProperties = {
            background: bg,
            borderRadius: 6,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          };
          const countBadge = (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 0.4,
                color: animsForDir > 0 ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
                textTransform: 'uppercase',
              }}
              title={animsForDir > 0
                ? `${animsForDir} animation${animsForDir === 1 ? '' : 's'} uploaded`
                : 'No animations yet'}
            >
              {animsForDir > 0 ? `${animsForDir}× 4×4` : 'Empty'}
            </span>
          );
          const commonHandlers = {
            onMouseEnter: () => setHoveredDir(dir),
            onMouseLeave: () => setHoveredDir((d) => (d === dir ? null : d)),
            onClick: (e: React.MouseEvent) => {
              const t = e.target as HTMLElement;
              if (t.closest('button, input')) return;
              onPick(dir);
            },
          };

          if (viewMode === 'grid') {
            return (
              <div key={dir} {...commonHandlers} style={containerStyle}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCurrent ? 'transparent' : 'rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  <CellThumb
                    src={character.src}
                    cols={character.cols}
                    rows={character.rows}
                    cell={DIR_CELL[dir]}
                    size={'100%'}
                    bare
                  />
                </div>
                <div
                  title={labelText}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--pb-ink)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    padding: '4px 4px 6px',
                    textAlign: 'center',
                  }}
                >
                  {labelText}
                </div>
                <div style={{ position: 'absolute', top: 4, right: 4 }}>
                  {greenDot}
                </div>
              </div>
            );
          }

          return (
            <div key={dir} {...commonHandlers} style={containerStyle}>
              <div className="flex items-center gap-2" style={{ padding: '4px 6px' }}>
                <div
                  style={{
                    width: 56, height: 56, flexShrink: 0,
                    background: isCurrent ? 'transparent' : 'rgba(0,0,0,0.03)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <CellThumb
                    src={character.src}
                    cols={character.cols}
                    rows={character.rows}
                    cell={DIR_CELL[dir]}
                    size={'100%'}
                    bare
                  />
                  {greenDot && (
                    <div style={{ position: 'absolute', top: 3, right: 3 }}>
                      {greenDot}
                    </div>
                  )}
                </div>
                <span
                  title={labelText}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--pb-ink)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {labelText}
                </span>
                {countBadge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render a single cell of a sprite sheet using a `background-image`
 * trick: `background-size: cols×100% rows×100%` zooms the sheet so each
 * cell fills the box, and `background-position` shifts the sheet so the
 * requested `(col,row)` lands at (0,0).
 */
function CellThumb({
  src, cols, rows, cell, size, bare,
}: {
  src: string;
  cols: number;
  rows: number;
  cell: number;
  size: number | string;
  bare?: boolean;
}) {
  const col = cell % cols;
  const row = Math.floor(cell / cols);
  const sizeCss = typeof size === 'number' ? `${size}px` : size;
  const bgPosX = cols > 1 ? `${(col / (cols - 1)) * 100}%` : '0%';
  const bgPosY = rows > 1 ? `${(row / (rows - 1)) * 100}%` : '0%';
  return (
    <div
      style={{
        width: sizeCss,
        height: sizeCss,
        background: bare ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.03)',
        borderRadius: bare ? 2 : 4,
        flexShrink: 0,
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${bgPosX} ${bgPosY}`,
        imageRendering: 'pixelated',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Back-button header for the per-direction drilldown view.
// ─────────────────────────────────────────────────────────────────────

function BackHeader({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div
      className="flex items-center gap-2 shrink-0"
      style={{
        padding: '8px 12px',
        borderBottom: '1.5px solid var(--pb-line-2)',
        background: 'var(--pb-paper)',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        title="Back to directions"
        style={{
          width: 28,
          height: 28,
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 7,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--pb-ink)',
          flexShrink: 0,
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.4} />
      </button>
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'var(--pb-ink)',
          letterSpacing: 0.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Animations tab — single prompt → PixelLab AI generates an action
// animation across all 8 directions, saved as one CharacterAnimation
// per direction. The actual click handler for the sticky-footer button
// lives in this component (registered with the parent via a ref) so
// the body keeps full control of the prompt + error state.
// ─────────────────────────────────────────────────────────────────────

function GenerateAnimationsTab({
  character, generating, setGenerating, registerSubmit,
}: {
  character: TileCharacter;
  generating: boolean;
  setGenerating: (v: boolean) => void;
  registerSubmit: (fn: () => void) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const addCharacterAnimation = useTile((s) => s.addCharacterAnimation);
  const addToast = useToastStore((s) => s.addToast);

  // Slug-friendly action name derived from the prompt — used as the
  // saved animation's label so users can find it in the per-direction
  // SAVED list later.
  const submit = useCallback(async () => {
    const action = prompt.trim();
    if (!action) {
      setError('Enter a prompt first (e.g. "running", "attacking", "casting").');
      return;
    }
    if (generating) return;
    setError(null);
    setProgress('Slicing 3×3 reference frames…');
    setGenerating(true);
    try {
      const references = await sliceCharacterCells(character);
      setProgress('Calling PixelLab for 8 directions (this can take a minute)…');
      const resp = await fetch('/api/pixellab-character-animation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          references,
          action,
          frameW: character.frameW,
          frameH: character.frameH,
        }),
      });
      const data = (await resp.json()) as {
        ok: boolean;
        error?: string;
        results?: { dir: CharacterDir8; frames: string[] }[];
        errors?: { dir: CharacterDir8; error: string }[];
      };
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || `Generation failed (HTTP ${resp.status})`);
      }
      setProgress('Composing 4×4 sheets and saving…');
      const results = data.results ?? [];
      for (const { dir, frames } of results) {
        if (frames.length === 0) continue;
        const sheet = await composeFramesIntoSheet(frames);
        addCharacterAnimation(character.id, dir, {
          label: action,
          src: sheet.dataUrl,
          cols: sheet.cols,
          rows: sheet.rows,
          frameW: sheet.frameW,
          frameH: sheet.frameH,
        });
      }
      const errs = data.errors ?? [];
      if (errs.length > 0) {
        addToast(
          'warning',
          `Generated ${results.length}/8 directions. Failed: ${errs.map((e) => e.dir).join(', ')}`,
        );
      } else {
        addToast('success', `Generated "${action}" across all 8 directions`);
      }
      setPrompt('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      addToast('error', `Generation failed: ${msg}`);
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  }, [prompt, generating, character, addCharacterAnimation, addToast, setGenerating]);

  // Re-register on every render so the parent's ref always points at
  // the latest closure (and therefore the latest `prompt`/`generating`).
  useEffect(() => {
    registerSubmit(submit);
  }, [submit, registerSubmit]);

  // Roll across the 8 reference cells so the user can confirm their
  // character's poses look right before kicking off a paid generation.
  const totalSavedAnimations = (Object.values(character.animations ?? {}) as CharacterAnimation[][])
    .reduce((sum, list) => sum + (list?.length ?? 0), 0);

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.5,
          color: 'var(--pb-ink-muted)',
        }}
      >
        Write one prompt and PixelLab AI will generate the action across all 8
        directions. Each direction's pose from the 3×3 sheet is fed into the
        model with your prompt; the result is saved as a 4×4 animation per
        direction.
      </p>

      <PanelSection title="Prompt" collapsible defaultOpen>
        <PanelInput
          label="Action"
          value={prompt}
          onChange={setPrompt}
          placeholder="e.g. running, attacking, casting a spell"
          disabled={generating}
        />
        <span
          style={{
            display: 'block',
            marginTop: 6,
            fontSize: 10.5,
            fontWeight: 600,
            color: 'var(--pb-ink-muted)',
            lineHeight: 1.4,
          }}
        >
          Tip: short verb phrases work best. The animation will be saved under
          this name on every direction.
        </span>
      </PanelSection>

      {progress && !error && (
        <p
          role="status"
          style={{
            margin: 0,
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.4,
            color: 'var(--pb-ink)',
            background: 'var(--pb-butter)',
            border: '1.5px solid var(--pb-butter-ink)',
            borderRadius: 8,
          }}
        >
          {progress}
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.35,
            color: 'var(--pb-coral-ink)',
            background: 'var(--pb-coral)',
            border: '1.5px solid var(--pb-coral-ink)',
            borderRadius: 8,
            wordBreak: 'break-word',
          }}
        >
          {error}
        </p>
      )}

      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.4,
          color: 'var(--pb-ink-muted)',
        }}
      >
        SAVED ANIMATIONS: {totalSavedAnimations} across {countDirsWithAnimations(character)}/8 directions
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Image helpers — slice the 3×3 character into per-direction reference
// data URLs and re-pack the AI's frames into a single 4×4 sheet.
// ─────────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err instanceof Error ? err : new Error('Image load failed'));
    img.src = src;
  });
}

/**
 * Cut the character's 3×3 sheet into 8 per-direction reference data
 * URLs (cell 8 — the discarded slot — is skipped). Output keys are the
 * canonical CharacterDir8 strings; values are PNG data URLs sized at
 * the source frame dimensions.
 */
async function sliceCharacterCells(
  character: TileCharacter,
): Promise<Partial<Record<CharacterDir8, string>>> {
  const img = await loadImage(character.src);
  const cellW = Math.floor(img.naturalWidth / character.cols);
  const cellH = Math.floor(img.naturalHeight / character.rows);
  const out: Partial<Record<CharacterDir8, string>> = {};
  for (const dir of CHARACTER_DIRS) {
    const cellIdx = DIR_CELL[dir];
    const col = cellIdx % character.cols;
    const row = Math.floor(cellIdx / character.cols);
    const canvas = document.createElement('canvas');
    canvas.width = cellW;
    canvas.height = cellH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D canvas context');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
    out[dir] = canvas.toDataURL('image/png');
  }
  return out;
}

/**
 * Pack up to 16 PNG frames into a single 4×4 sheet at the frames'
 * native resolution. Falls back to padding the right/bottom with the
 * first frame if PixelLab returns fewer than 16 frames so the runtime
 * never blows up on a stray empty cell.
 */
async function composeFramesIntoSheet(
  frames: string[],
): Promise<{ dataUrl: string; cols: number; rows: number; frameW: number; frameH: number }> {
  if (frames.length === 0) throw new Error('No frames to compose');
  const imgs = await Promise.all(frames.map(loadImage));
  const fw = imgs[0].naturalWidth;
  const fh = imgs[0].naturalHeight;
  const cols = 4;
  const rows = 4;
  const total = cols * rows;
  const canvas = document.createElement('canvas');
  canvas.width = cols * fw;
  canvas.height = rows * fh;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < total; i++) {
    const img = imgs[i] ?? imgs[imgs.length - 1];
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, col * fw, row * fh, fw, fh);
  }
  return {
    dataUrl: canvas.toDataURL('image/png'),
    cols, rows, frameW: fw, frameH: fh,
  };
}

function countDirsWithAnimations(character: TileCharacter): number {
  let n = 0;
  for (const dir of CHARACTER_DIRS) {
    if ((character.animations?.[dir]?.length ?? 0) > 0) n++;
  }
  return n;
}
