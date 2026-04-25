'use client';
import { useState } from 'react';
import { ImageIcon, RotateCcw } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSelect } from '@/components/ui/panel-controls/PanelSelect';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PanelColorSwatches } from '@/components/ui/panel-controls/PanelColorSwatches';
import { PanelDropZone } from '@/components/ui/panel-controls/PanelDropZone';
import { PBButton } from '@/components/ui';
import { useFreeform, type FreeformBackground } from '@/store/freeform-store';

/**
 * Right-panel Properties view for the 2D Freeform mode. Shown when no
 * image / character / collision is currently selected — gives the user
 * a place to author the canvas-wide settings (background fill, grid
 * overlay) without taking screen real-estate from the toolbar.
 *
 * Hard rule from CLAUDE.md: every sub-section is collapsible, primary
 * action sits in a sticky footer.
 */
export function Freeform2DPropertiesPanel({ headless }: { headless?: boolean } = {}) {
  const background = useFreeform((s) => s.background);
  const showGrid = useFreeform((s) => s.showGrid);
  const setBackground = useFreeform((s) => s.setBackground);
  const setShowGrid = useFreeform((s) => s.setShowGrid);
  const resetBackground = useFreeform((s) => s.resetBackground);

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

  // Per-kind staging — kept locally so switching tabs doesn't blow away
  // the user's previous color/gradient choice mid-edit.
  const solidColor = background.kind === 'solid' ? background.color : '#fdf6e3';
  const gradFrom = background.kind === 'gradient' ? background.from : '#fef08a';
  const gradTo = background.kind === 'gradient' ? background.to : '#f472b6';
  const gradAngle = background.kind === 'gradient' ? background.angle : 135;
  const gradRadial = background.kind === 'gradient' ? background.radial : false;
  const imgSrc = background.kind === 'image' ? background.src : '';
  const imgFit = background.kind === 'image' ? background.fit : 'cover';
  const tileSrc = background.kind === 'tile' ? background.src : '';
  const tileSize = background.kind === 'tile' ? background.tileSize : 64;

  const [imgDrag, setImgDrag] = useState(false);
  const [tileDrag, setTileDrag] = useState(false);

  return (
    <Shell>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <PanelSection title="Canvas" collapsible defaultOpen>
          <PanelToggle
            label="Show grid"
            checked={showGrid}
            onChange={setShowGrid}
          />
        </PanelSection>

        <PanelSection title="Background" collapsible defaultOpen>
          <PanelSelect
            label="Type"
            value={background.kind}
            onChange={(v) => {
              const kind = v as FreeformBackground['kind'];
              setBackground(makeDefaultForKind(kind, background));
            }}
            options={[
              { value: 'solid',    label: 'Solid color' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'image',    label: 'Image (cover)' },
              { value: 'tile',     label: 'Tiled texture' },
            ]}
          />

          {background.kind === 'solid' && (
            <PanelColorSwatches
              label="Color"
              value={solidColor}
              onChange={(color) => setBackground({ kind: 'solid', color })}
            />
          )}

          {background.kind === 'gradient' && (
            <>
              <PanelColorSwatches
                label="From"
                value={gradFrom}
                onChange={(c) =>
                  setBackground({ kind: 'gradient', from: c, to: gradTo, angle: gradAngle, radial: gradRadial })
                }
              />
              <PanelColorSwatches
                label="To"
                value={gradTo}
                onChange={(c) =>
                  setBackground({ kind: 'gradient', from: gradFrom, to: c, angle: gradAngle, radial: gradRadial })
                }
              />
              <PanelToggle
                label="Radial"
                checked={gradRadial}
                onChange={(b) =>
                  setBackground({ kind: 'gradient', from: gradFrom, to: gradTo, angle: gradAngle, radial: b })
                }
              />
              {!gradRadial && (
                <PanelSlider
                  label="Angle"
                  value={gradAngle}
                  onChange={(v) =>
                    setBackground({ kind: 'gradient', from: gradFrom, to: gradTo, angle: v, radial: false })
                  }
                  min={0}
                  max={360}
                  step={1}
                  suffix="°"
                />
              )}
            </>
          )}

          {background.kind === 'image' && (
            <>
              <PanelDropZone
                icon={ImageIcon}
                label={imgSrc ? 'Replace image' : 'Drop image / SVG'}
                sublabel="PNG, JPG, SVG, or paste SVG markup"
                isDragging={imgDrag}
                onDragOver={(e) => {
                  e.preventDefault();
                  setImgDrag(true);
                }}
                onDragLeave={() => setImgDrag(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setImgDrag(false);
                  const src = await readDroppedAsDataUrl(e);
                  if (src) setBackground({ kind: 'image', src, fit: imgFit });
                }}
                onClick={() => pickImageFile().then((src) => {
                  if (src) setBackground({ kind: 'image', src, fit: imgFit });
                })}
              />
              {imgSrc && (
                <PanelSelect
                  label="Fit"
                  value={imgFit}
                  onChange={(v) =>
                    setBackground({ kind: 'image', src: imgSrc, fit: v as 'cover' | 'contain' })
                  }
                  options={[
                    { value: 'cover',   label: 'Cover (fill, may crop)' },
                    { value: 'contain', label: 'Contain (fit, may letterbox)' },
                  ]}
                />
              )}
            </>
          )}

          {background.kind === 'tile' && (
            <>
              <PanelDropZone
                icon={ImageIcon}
                label={tileSrc ? 'Replace texture' : 'Drop texture / SVG'}
                sublabel="Repeats edge-to-edge"
                isDragging={tileDrag}
                onDragOver={(e) => {
                  e.preventDefault();
                  setTileDrag(true);
                }}
                onDragLeave={() => setTileDrag(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setTileDrag(false);
                  const src = await readDroppedAsDataUrl(e);
                  if (src) setBackground({ kind: 'tile', src, tileSize });
                }}
                onClick={() => pickImageFile().then((src) => {
                  if (src) setBackground({ kind: 'tile', src, tileSize });
                })}
              />
              {tileSrc && (
                <PanelSlider
                  label="Tile size"
                  value={tileSize}
                  onChange={(v) => setBackground({ kind: 'tile', src: tileSrc, tileSize: v })}
                  min={8}
                  max={512}
                  step={1}
                  suffix="px"
                />
              )}
            </>
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
        <PBButton onClick={resetBackground} variant="secondary" icon={RotateCcw} fullWidth>
          Reset background
        </PBButton>
      </footer>
    </Shell>
  );
}

function makeDefaultForKind(
  kind: FreeformBackground['kind'],
  prev: FreeformBackground,
): FreeformBackground {
  switch (kind) {
    case 'solid':
      return { kind: 'solid', color: prev.kind === 'solid' ? prev.color : '#fdf6e3' };
    case 'gradient':
      return prev.kind === 'gradient'
        ? prev
        : { kind: 'gradient', from: '#fef08a', to: '#f472b6', angle: 135, radial: false };
    case 'image':
      return prev.kind === 'image' ? prev : { kind: 'image', src: '', fit: 'cover' };
    case 'tile':
      return prev.kind === 'tile' ? prev : { kind: 'tile', src: '', tileSize: 64 };
  }
}

/** Read the first image-like file or pasted SVG markup off a drag event. */
async function readDroppedAsDataUrl(e: React.DragEvent): Promise<string | null> {
  const dt = e.dataTransfer;
  if (!dt) return null;
  for (const f of Array.from(dt.files)) {
    if (f.type.startsWith('image/') || /\.svg$/i.test(f.name)) {
      return await fileToDataUrl(f);
    }
  }
  // Text fallback for SVG markup pasted into the drop zone.
  const text = dt.getData('text/plain') || dt.getData('text/html') || '';
  if (looksLikeSvgMarkup(text)) return svgMarkupToDataUrl(text);
  return null;
}

/** Open a hidden file input and resolve with the picked file as a data URL. */
function pickImageFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,image/svg+xml,.svg';
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return resolve(null);
      resolve(await fileToDataUrl(f));
    };
    input.click();
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ''));
    r.onerror = () => reject(r.error ?? new Error('read failed'));
    r.readAsDataURL(file);
  });
}

function looksLikeSvgMarkup(text: string): boolean {
  const t = text.trim();
  return /^<\?xml[^>]*\?>\s*<svg[\s>]/i.test(t) || /^<svg[\s>]/i.test(t);
}

function svgMarkupToDataUrl(markup: string): string {
  const bytes = new TextEncoder().encode(markup);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return 'data:image/svg+xml;base64,' + btoa(bin);
}
