'use client';
import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload, User, Film, Pencil } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelSelect } from '@/components/ui/panel-controls/PanelSelect';
import { PanelIconTabs } from '@/components/ui/panel-controls/PanelIconTabs';
import { fileToImage, imageToDataUrl } from '@/lib/tile-slicer';
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
  // The direction the user has clicked from the rotation list. The
  // preview keeps cycling regardless — this only marks "what's selected
  // for animation editing" (green dot in Character tab, current
  // direction shown in Animations tab).
  const [selectedDir, setSelectedDir] = useState<CharacterDir8 | null>(null);

  useEffect(() => {
    setTab('character');
    setSelectedDir(null);
  }, [character?.id]);

  const Shell = headless
    ? (({ children }: { children: React.ReactNode }) => <>{children}</>)
    : (({ children }: { children: React.ReactNode }) => (
        <aside
          className="w-full md:w-[260px] flex flex-col rounded-xl overflow-hidden shrink-0"
          style={{
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
          }}
        >
          {children}
        </aside>
      ));

  if (!selectedCharacterId || !character) return null;

  return (
    <Shell>
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
          <CharacterTab
            character={character}
            selectedDir={selectedDir}
            onPickDir={(dir) => {
              setSelectedDir(dir);
              setTab('animations');
            }}
            onUpdateCharacter={(patch) => updateTileCharacter(character.id, patch)}
            onReplaceSheet={(input) => replaceCharacterSheet(character.id, input)}
          />
        ) : (
          <AnimationsTab
            character={character}
            initialDir={selectedDir}
            onChangeDir={setSelectedDir}
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
        <PanelActionButton
          variant="destructive"
          icon={Trash2}
          fullWidth
          onClick={() => removeTileCharacter(character.id)}
        >
          Delete character
        </PanelActionButton>
      </footer>
    </Shell>
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
  character, selectedDir, onPickDir, onUpdateCharacter, onReplaceSheet,
}: {
  character: TileCharacter;
  selectedDir: CharacterDir8 | null;
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
            activeDir={selectedDir}
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
// Animations tab — list of 4×4 action sheets for one direction
// ─────────────────────────────────────────────────────────────────────

function AnimationsTab({
  character, initialDir, onChangeDir,
}: {
  character: TileCharacter;
  initialDir: CharacterDir8 | null;
  onChangeDir: (dir: CharacterDir8) => void;
}) {
  const [activeDir, setActiveDir] = useState<CharacterDir8>(initialDir ?? 'n');
  useEffect(() => {
    if (initialDir) setActiveDir(initialDir);
  }, [initialDir]);
  // Surface activeDir back to the parent on first mount so the rotation
  // dot in CharacterTab stays in sync — the picker UI used to do this on
  // every change but was removed; this keeps the contract intact.
  useEffect(() => {
    onChangeDir(activeDir);
  }, [activeDir, onChangeDir]);

  // Single-slot UI per direction — preview shows the first animation, and
  // upload either adds (when empty) or replaces (when populated). The
  // underlying multi-animation data model is untouched so older characters
  // with multiple slots aren't lost; we just don't expose the list here.
  const animations = character.animations?.[activeDir] ?? [];
  const animation = animations[0] ?? null;

  // Set immediately after a fresh upload so the name input grabs focus +
  // selects its current text — the user starts typing the animation name
  // without an extra click. Cleared on commit / blur / direction change.
  const [pendingNameId, setPendingNameId] = useState<string | null>(null);
  useEffect(() => {
    setPendingNameId(null);
  }, [activeDir]);

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

      <AnimationPreview
        animation={animation}
        onReplace={() => replaceInputRef.current?.click()}
        onClear={
          animation
            ? () => removeCharacterAnimation(character.id, activeDir, animation.id)
            : undefined
        }
        onUpload={() => addInputRef.current?.click()}
        directionLabel={DIR_LABEL[activeDir]}
        uploading={uploading}
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
              renameCharacterAnimation(character.id, activeDir, animation.id, label);
              setPendingNameId(null);
            }}
          />
        )}
      </div>
    </>
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

  function commit() {
    const next = draft.trim();
    if (next.length === 0) {
      setDraft(value);
      return;
    }
    if (next !== value) onCommit(next);
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
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          } else if (e.key === 'Escape') {
            setDraft(value);
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
 * selected, paints the full 4×4 grid (one cell per frame) so the user
 * sees every frame of the action at a glance, with floating Replace /
 * Delete buttons in the corner. When no animation is uploaded yet for
 * the active direction, paints a dashed upload prompt.
 */
function AnimationPreview({
  animation, directionLabel, uploading,
  onReplace, onClear, onUpload,
}: {
  animation: CharacterAnimation | null;
  directionLabel: string;
  uploading: boolean;
  onReplace: () => void;
  onClear?: () => void;
  onUpload: () => void;
}) {
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
          display: 'grid',
          gridTemplateColumns: `repeat(${animation.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${animation.rows}, minmax(0, 1fr))`,
          gap: 2,
        }}
      >
        {Array.from({ length: animation.cols * animation.rows }, (_, i) => (
          <CellThumb
            key={i}
            src={animation.src}
            cols={animation.cols}
            rows={animation.rows}
            cell={i}
            size={'100%'}
            bare
          />
        ))}
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
