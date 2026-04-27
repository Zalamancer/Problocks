'use client';
import { Trash2 } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { useTile } from '@/store/tile-store';
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
            <div className="flex flex-wrap gap-1">
              {asset.styles.map((st, i) => {
                const isCurrent = st.id === obj.styleId;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setObjectStyle(obj.id, st.id)}
                    title={st.label || `Style ${i + 1}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 6px 3px 3px',
                      background: isCurrent ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
                      border: `1.5px solid ${isCurrent ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
                      borderRadius: 999,
                      cursor: 'pointer',
                      boxShadow: isCurrent ? '0 1.5px 0 var(--pb-butter-ink)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={st.dataUrl}
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
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: 'var(--pb-ink)',
                        maxWidth: 90,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.label || `Style ${i + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </PanelSection>
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
          onClick={() => removeObject(obj.id)}
        >
          Delete object
        </PanelActionButton>
      </footer>
    </Shell>
  );
}

