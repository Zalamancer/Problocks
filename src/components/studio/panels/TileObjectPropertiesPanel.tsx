'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, ChevronDown, Check, Scissors } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { useTile, type ObjectAsset, type ObjectStyle } from '@/store/tile-store';
import { TransformControls2D } from './TransformControls2D';

/**
 * Right-panel Properties view for a selected free-positioned tile object.
 * Replaces the in-canvas floating popup that used to live in TileView so
 * the canvas stays uncluttered and the controls match the rest of the
 * studio's right panel (collapsible sections, panel-controls, sticky
 * footer for the destructive action).
 */
export function TileObjectPropertiesPanel({ headless }: { headless?: boolean } = {}) {
  const selectedObjectId = useTile((s) => s.selectedObjectId);
  const obj = useTile((s) =>
    s.selectedObjectId ? s.objects.find((o) => o.id === s.selectedObjectId) ?? null : null,
  );
  const asset = useTile((s) => (obj ? s.objectAssets[obj.assetId] ?? null : null));
  const updateObject = useTile((s) => s.updateObject);
  const removeObject = useTile((s) => s.removeObject);
  const setObjectStyle = useTile((s) => s.setObjectStyle);
  const setStyleDataUrl = useTile((s) => s.setStyleDataUrl);

  // Background-removal state — local to the panel so re-mounting a fresh
  // selection clears any stale error/in-flight indicator.
  const [removingBg, setRemovingBg] = useState(false);
  const [bgError, setBgError] = useState<string | null>(null);
  // Reset per-selection so the error toast doesn't bleed onto the next
  // object. Watching obj.id (not selectedObjectId) so style swaps within
  // the same object also leave the error dismissed.
  useEffect(() => {
    setBgError(null);
  }, [obj?.id, obj?.styleId]);

  async function onRemoveBackground() {
    if (!obj || !asset) return;
    const style = asset.styles.find((st) => st.id === obj.styleId);
    if (!style) return;
    setRemovingBg(true);
    setBgError(null);
    try {
      const resp = await fetch('/api/recraft/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: style.dataUrl }),
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json?.dataUrl) {
        const detail = json?.detail || json?.error || `HTTP ${resp.status}`;
        throw new Error(detail);
      }
      // Probe natural dims so the panel keeps the new image's true ratio
      // even if Recraft cropped to the foreground bbox. Skip on probe
      // failure — the existing width/height are a safe fallback.
      const probe = new Image();
      const dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
        probe.onload = () => resolve({ w: probe.naturalWidth || 0, h: probe.naturalHeight || 0 });
        probe.onerror = () => resolve(null);
        probe.src = json.dataUrl;
      });
      setStyleDataUrl(asset.id, style.id, {
        dataUrl: json.dataUrl,
        width: dims?.w || undefined,
        height: dims?.h || undefined,
      });
    } catch (err) {
      setBgError(err instanceof Error ? err.message : String(err));
    } finally {
      setRemovingBg(false);
    }
  }

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

  if (!selectedObjectId || !obj) return null;

  return (
    <Shell>
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
          {obj.name}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
          OBJECT
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <PanelSection title="Transform" collapsible defaultOpen>
          <TransformControls2D
            position={{ x: Math.round(obj.x), y: Math.round(obj.y) }}
            rotation={Math.round(obj.rotation)}
            size={{ x: Math.round(obj.width), y: Math.round(obj.height) }}
            onPositionChange={(v) => updateObject(obj.id, { x: v.x, y: v.y })}
            onRotationChange={(v) => updateObject(obj.id, { rotation: v })}
            onSizeChange={(v) =>
              updateObject(obj.id, {
                width: Math.max(1, v.x),
                height: Math.max(1, v.y),
              })
            }
          />
        </PanelSection>

        <PanelSection title="Flip" collapsible defaultOpen>
          <PanelToggle
            label="Flip horizontal"
            checked={obj.flipX}
            onChange={(b) => updateObject(obj.id, { flipX: b })}
          />
          <PanelToggle
            label="Flip vertical"
            checked={obj.flipY}
            onChange={(b) => updateObject(obj.id, { flipY: b })}
          />
        </PanelSection>

        <PanelSection title="Color" collapsible defaultOpen>
          <PanelSlider
            label="Hue"
            value={obj.hue}
            onChange={(v) => updateObject(obj.id, { hue: v })}
            min={0}
            max={360}
            step={1}
            suffix="°"
          />
          <button
            type="button"
            onClick={() => updateObject(obj.id, { hue: 0 })}
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
            Reset hue
          </button>
        </PanelSection>

        {asset && asset.styles.length > 1 && (
          <PanelSection title="Style" collapsible defaultOpen>
            <StylePreviewDropdown
              asset={asset}
              currentStyleId={obj.styleId}
              onPick={(styleId) => setObjectStyle(obj.id, styleId)}
            />
          </PanelSection>
        )}

        <PanelSection title="Effects" collapsible defaultOpen>
          <PanelActionButton
            icon={Scissors}
            fullWidth
            loading={removingBg}
            disabled={!asset}
            onClick={onRemoveBackground}
          >
            {removingBg ? 'Removing background…' : 'Remove background'}
          </PanelActionButton>
          {bgError && (
            <div
              role="alert"
              style={{
                marginTop: 6,
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
              {bgError}
            </div>
          )}
        </PanelSection>
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
          onClick={() => removeObject(obj.id)}
        >
          Delete object
        </PanelActionButton>
      </footer>
    </Shell>
  );
}

/**
 * Style picker shaped like the left-panel asset list: the trigger button
 * shows the current style's thumb + label, and clicking opens a portal-
 * positioned popover with one row per style (thumb + label, current row
 * checked). Mirrors the row layout from `AssetCard`'s expanded styles
 * list in TileAssetsView so the two surfaces feel like the same widget.
 */
function StylePreviewDropdown({
  asset, currentStyleId, onPick,
}: {
  asset: ObjectAsset;
  currentStyleId: string;
  onPick: (styleId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popStyle, setPopStyle] = useState<React.CSSProperties>({});

  const current: ObjectStyle =
    asset.styles.find((s) => s.id === currentStyleId) ?? asset.styles[0];

  // Position the portal popover under the trigger; flip up when there's
  // more space above (mirrors PanelSelect's behaviour). Keeps the panel
  // from spilling off-screen in narrow right-panel layouts.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const dropUp = spaceBelow < 280 && r.top > spaceBelow;
    setPopStyle({
      position: 'fixed',
      left: r.left,
      width: r.width,
      ...(dropUp
        ? { bottom: window.innerHeight - r.top + 4 }
        : { top: r.bottom + 4 }),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2"
        style={{
          padding: '4px 8px 4px 4px',
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        <StyleThumb style={current} size={28} />
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
            textAlign: 'left',
          }}
        >
          {current.label || 'Style 1'}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)' }}>
          {asset.styles.length}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.4}
          style={{
            color: 'var(--pb-ink-muted)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 120ms',
          }}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              ...popStyle,
              zIndex: 999,
              maxHeight: 280,
              overflowY: 'auto',
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-line-2)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              padding: 4,
            }}
          >
            {asset.styles.map((st, i) => {
              const isCurrent = st.id === currentStyleId;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    onPick(st.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2"
                  style={{
                    padding: '4px 6px 4px 4px',
                    background: isCurrent ? 'var(--pb-butter)' : 'transparent',
                    border: `1.5px solid ${isCurrent ? 'var(--pb-butter-ink)' : 'transparent'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginBottom: i === asset.styles.length - 1 ? 0 : 2,
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'var(--pb-cream-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <StyleThumb style={st} size={32} />
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
                      textAlign: 'left',
                    }}
                  >
                    {st.label || `Style ${i + 1}`}
                  </span>
                  {isCurrent && (
                    <Check size={12} strokeWidth={2.6} style={{ color: 'var(--pb-butter-ink)' }} />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

function StyleThumb({ style, size }: { style: ObjectStyle; size: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background: 'rgba(0,0,0,0.06)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 5,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={style.dataUrl}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
        }}
        draggable={false}
      />
    </span>
  );
}
