'use client';
import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload, User, Film } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
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
 * Mirrors `TileObjectPropertiesPanel` so the two surfaces feel like the
 * same widget — same shell padding, same `PanelSection collapsible`
 * sub-sections, same sticky-footer destructive action.
 *
 * Adds a `PanelIconTabs` toggle at the top with two sub-tabs:
 *   • Character — animated 3×3 preview that cycles through the 8 compass
 *     directions (one frame at a time), plus a clickable list of all 8
 *     directions. Clicking a direction freezes the preview on it AND
 *     auto-switches to the Animations tab so the user can drop a 4×4
 *     action sheet for that direction.
 *   • Animations — per-direction 4×4 sprite-sheet upload. Each direction
 *     has its own slot; once uploaded, the slot shows a thumbnail and a
 *     clear button. Empty slots show a drop-zone placeholder.
 *
 * The 3×3 source sheet uploaded in the Characters left-panel section
 * already encodes the 8 compass-direction frames (cell 4 = idle, cell 8
 * discarded). This panel exposes them as the rotation preview list.
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

  const [tab, setTab] = useState<'character' | 'animations'>('character');
  const [pinnedDir, setPinnedDir] = useState<CharacterDir8 | null>(null);

  // Reset tab + pinned direction when the selection changes so each
  // character starts with the rotating preview.
  useEffect(() => {
    setTab('character');
    setPinnedDir(null);
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
      <IconOnlyTabs
        tabs={[
          { id: 'character', label: 'Character', icon: User },
          { id: 'animations', label: 'Animations', icon: Film },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {tab === 'character' ? (
          <CharacterTab
            character={character}
            pinnedDir={pinnedDir}
            onPickDir={(dir) => {
              setPinnedDir(dir);
              setTab('animations');
            }}
            onUpdateCharacter={(patch) => updateTileCharacter(character.id, patch)}
          />
        ) : (
          <AnimationsTab
            character={character}
            initialDir={pinnedDir}
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

/**
 * Icon-only segmented tab bar. Same outer dimensions and border as
 * `PanelIconTabs` (px-3 py-2 + bottom border) so this row sits at the
 * exact same vertical position as the left panel's [Objects | Groups |
 * Characters] tab row — no expanding label, no context header above it.
 */
function IconOnlyTabs({
  tabs, activeTab, onChange,
}: {
  tabs: { id: string; label: string; icon: LucideIcon }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="shrink-0 flex items-center gap-1 px-3 py-2"
      style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            title={tab.label}
            style={{
              flex: 1,
              background: isActive ? 'var(--pb-butter)' : 'transparent',
              color: isActive ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
              border: isActive ? '1.5px solid var(--pb-butter-ink)' : '1.5px solid transparent',
              boxShadow: isActive ? '0 2px 0 var(--pb-butter-ink)' : 'none',
              transition: 'background-color 200ms, color 200ms, box-shadow 200ms, border-color 200ms',
            }}
            className="relative h-8 rounded-lg flex items-center justify-center hover:bg-[var(--pb-cream-2)] hover:text-[var(--pb-ink)]"
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
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

/** Cell index inside the 3×3 source sheet for a given direction. Same
 *  layout used by the play-mode renderer in TileView (NW=0, N=1, NE=2,
 *  W=3, idle=4, E=5, SW=6, S=7, SE→fallback to S since cell 8 is the
 *  discarded slot). */
const DIR_CELL: Record<CharacterDir8, number> = {
  nw: 0, n: 1, ne: 2,
  w: 3, e: 5,
  sw: 6, s: 7, se: 7,
};

function CharacterTab({
  character, pinnedDir, onPickDir, onUpdateCharacter,
}: {
  character: TileCharacter;
  pinnedDir: CharacterDir8 | null;
  onPickDir: (dir: CharacterDir8) => void;
  onUpdateCharacter: (patch: Partial<TileCharacter>) => void;
}) {
  // Rotation cycles through the 8 directions in canonical order. Pause
  // when the user has clicked a direction (pin) so they can study a
  // single pose before swapping to Animations. Default rotation period
  // mirrors the play-loop walk cycle (~140 ms per frame at 8 fps).
  const [rotationIndex, setRotationIndex] = useState(0);
  useEffect(() => {
    if (pinnedDir) return;
    const handle = window.setInterval(() => {
      setRotationIndex((i) => (i + 1) % CHARACTER_DIRS.length);
    }, 140);
    return () => window.clearInterval(handle);
  }, [pinnedDir]);

  const previewDir: CharacterDir8 =
    pinnedDir ?? CHARACTER_DIRS[rotationIndex];

  return (
    <>
      <PanelSection title="Preview" collapsible defaultOpen>
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <CellThumb
            src={character.src}
            cols={character.cols}
            rows={character.rows}
            cell={DIR_CELL[previewDir]}
            size={'80%'}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.6,
              color: 'var(--pb-ink-muted)',
              textTransform: 'uppercase',
            }}
          >
            {DIR_LABEL[previewDir]}
          </span>
        </div>
        {pinnedDir && (
          <button
            type="button"
            onClick={() => onPickDir(pinnedDir)}
            style={{
              alignSelf: 'flex-start',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--pb-ink-muted)',
              background: 'transparent',
              border: 0,
              padding: '4px 0',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Open animation slot →
          </button>
        )}
      </PanelSection>

      <PanelSection title="Rotation" collapsible defaultOpen>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 4,
          }}
        >
          {CHARACTER_DIRS.map((dir) => {
            const hasAnim = !!character.animations?.[dir];
            const isCurrent = previewDir === dir;
            return (
              <button
                key={dir}
                type="button"
                onClick={() => onPickDir(dir)}
                className="flex items-center gap-2"
                style={{
                  padding: '6px 6px 6px 6px',
                  background: isCurrent ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
                  border: `1.5px solid ${isCurrent ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <CellThumb
                  src={character.src}
                  cols={character.cols}
                  rows={character.rows}
                  cell={DIR_CELL[dir]}
                  size={28}
                />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: 'var(--pb-ink)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {DIR_LABEL[dir]}
                </span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: hasAnim ? 'var(--pb-butter-ink)' : 'transparent',
                    border: hasAnim ? 'none' : '1.5px solid var(--pb-line-2)',
                  }}
                  title={hasAnim ? 'Has 4×4 animation' : 'No animation yet'}
                />
              </button>
            );
          })}
        </div>
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
    </>
  );
}

function AnimationsTab({
  character, initialDir,
}: {
  character: TileCharacter;
  initialDir: CharacterDir8 | null;
}) {
  // The slot the user is actively editing. Clicking another row swaps it.
  // initialDir comes from the Character tab — clicking a direction there
  // jumps the user straight into that direction's slot.
  const [activeDir, setActiveDir] = useState<CharacterDir8>(initialDir ?? 'n');
  useEffect(() => {
    if (initialDir) setActiveDir(initialDir);
  }, [initialDir]);

  return (
    <>
      <PanelSection title="Direction" collapsible defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHARACTER_DIRS.map((dir) => {
            const isCurrent = dir === activeDir;
            const hasAnim = !!character.animations?.[dir];
            return (
              <button
                key={dir}
                type="button"
                onClick={() => setActiveDir(dir)}
                className="flex items-center gap-2"
                style={{
                  padding: '6px 8px 6px 6px',
                  background: isCurrent ? 'var(--pb-butter)' : 'transparent',
                  border: `1.5px solid ${isCurrent ? 'var(--pb-butter-ink)' : 'transparent'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <CellThumb
                  src={character.src}
                  cols={character.cols}
                  rows={character.rows}
                  cell={DIR_CELL[dir]}
                  size={28}
                />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--pb-ink)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {DIR_LABEL[dir]}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    color: hasAnim ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {hasAnim ? '4×4' : 'Empty'}
                </span>
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title={`Sprite sheet — ${DIR_LABEL[activeDir]}`} collapsible defaultOpen>
        <AnimationSlot characterId={character.id} direction={activeDir} />
      </PanelSection>
    </>
  );
}

/**
 * Drop / click area for one direction's 4×4 action sheet. When empty,
 * shows a dashed upload prompt; when populated, shows a 4×4 grid preview
 * of the uploaded sheet plus a "Replace" / "Clear" pair.
 *
 * Subscribes to the store so an upload + clear round-trip refreshes the
 * thumbnail immediately without lifting state up to the panel.
 */
function AnimationSlot({
  characterId, direction,
}: {
  characterId: string;
  direction: CharacterDir8;
}) {
  const animation = useTile((s) =>
    s.tileCharacters[characterId]?.animations?.[direction] ?? null,
  );
  const setCharacterAnimation = useTile((s) => s.setCharacterAnimation);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clear any stale error when the user moves to a different slot or
  // swaps direction so the message doesn't bleed across slots.
  useEffect(() => {
    setError(null);
  }, [direction, characterId]);

  async function ingestFiles(files: File[]) {
    if (files.length === 0) return;
    const file = files[0];
    setUploading(true);
    setError(null);
    try {
      const img = await fileToImage(file);
      const cols = 4;
      const rows = 4;
      if (img.naturalWidth % cols !== 0 || img.naturalHeight % rows !== 0) {
        throw new Error(
          `Sheet must divide cleanly into a ${cols}×${rows} grid ` +
            `(got ${img.naturalWidth}×${img.naturalHeight}). ` +
            `Pad or trim so width is a multiple of ${cols} and height is a multiple of ${rows}.`,
        );
      }
      const dataUrl = imageToDataUrl(img);
      const frameW = Math.floor(img.naturalWidth / cols);
      const frameH = Math.floor(img.naturalHeight / rows);
      const next: CharacterAnimation = {
        src: dataUrl,
        cols,
        rows,
        frameW,
        frameH,
        addedAt: Date.now(),
      };
      setCharacterAnimation(characterId, direction, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    );
    void ingestFiles(files);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg"
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          void ingestFiles(files);
        }}
      />

      {animation ? (
        <>
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              background: 'var(--pb-cream-2)',
              border: '1.5px solid var(--pb-line-2)',
              borderRadius: 8,
              padding: 4,
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
          <div style={{ display: 'flex', gap: 6 }}>
            <PanelActionButton
              icon={Upload}
              fullWidth
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'Uploading…' : 'Replace'}
            </PanelActionButton>
            <PanelActionButton
              variant="destructive"
              icon={Trash2}
              onClick={() => setCharacterAnimation(characterId, direction, null)}
            >
              Clear
            </PanelActionButton>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={uploading}
          style={{
            width: '100%',
            padding: 16,
            background: dragging ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
            border: `1.5px dashed ${dragging ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
            borderRadius: 8,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.55 : 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
            color: 'var(--pb-ink)',
          }}
        >
          <Upload size={18} strokeWidth={2.4} style={{ color: 'var(--pb-ink-muted)' }} />
          <span style={{ fontSize: 11, fontWeight: 800 }}>
            {uploading ? 'Uploading…' : 'Upload 4×4 sheet'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--pb-ink-muted)', textAlign: 'center', lineHeight: 1.4 }}>
            16 frames laid out left-to-right, top-to-bottom for {DIR_LABEL[direction]}.
          </span>
        </button>
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
    </div>
  );
}

/**
 * Render a single cell of a sprite sheet using a `background-image`
 * trick: `background-size: cols×100% rows×100%` zooms the sheet so each
 * cell fills the box, and `background-position` shifts the sheet so the
 * requested `(col,row)` lands at (0,0).
 *
 * This is more reliable than the absolute-positioned `<img>` percentages
 * I tried first — those don't always isolate a single cell when the
 * outer box itself uses a percentage width (e.g. `size = "80%"` inside a
 * flex parent), which is what was making the Character preview look
 * like the whole 3×3 sheet instead of one direction.
 *
 * `size` accepts both pixel numbers (list rows) and CSS strings
 * (`'80%'`, `'100%'`) so the same component works for the large preview
 * tile, the small list rows, and the per-cell tiles inside the 4×4
 * Animations grid.
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
  // Multi-cell sheets need cols/rows > 1 to make `cols / (cols-1)` etc
  // resolve cleanly. With cols=1 or rows=1 the math collapses, but we
  // never get those here — the panel only renders 3×3 source sheets and
  // 4×4 animation sheets.
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
