'use client';

import { Trash2 } from 'lucide-react';
import {
  PanelSection,
  PanelSlider,
  PanelActionButton,
  PanelColorSwatches,
  PanelSelect,
  PanelToggle,
} from '@/components/ui';
import { useFreeform3D } from '@/store/freeform3d-store';
import { getPrefabDef, PALETTE } from '@/lib/kid-style-3d';
import type { Vec3 as SceneVec3 } from '@/lib/kid-style-3d/scene-schema';
import { TransformControls, type Vec3 as ObjVec3 } from './TransformControls';

/** Convert [x,y,z] tuple → {x,y,z} object for the shared TransformControls. */
const toObj = (t: SceneVec3): ObjVec3 => ({ x: t[0], y: t[1], z: t[2] });
/** Reverse: {x,y,z} object → [x,y,z] tuple for the store. */
const toTup = (v: ObjVec3): SceneVec3 => [v.x, v.y, v.z];
/** Radians tuple → degrees object (for rotation display). */
const radToDegObj = (t: SceneVec3): ObjVec3 => ({
  x: (t[0] * 180) / Math.PI,
  y: (t[1] * 180) / Math.PI,
  z: (t[2] * 180) / Math.PI,
});
const degObjToRad = (v: ObjVec3): SceneVec3 => [
  (v.x * Math.PI) / 180,
  (v.y * Math.PI) / 180,
  (v.z * Math.PI) / 180,
];

/**
 * Right-panel Properties content for the 3D Freeform studio. Reads the
 * currently-selected SceneObject from useFreeform3D and exposes its
 * transform + per-instance color as editable controls. Mutations go
 * through the store's updateObject, which triggers applySceneToRoot in
 * the viewport — pure one-way flow.
 *
 * Sections (all collapsible, per the studio's right-panel rules):
 *   - Transform: position XYZ, rotation XYZ (degrees), scale XYZ + uniform
 *   - Appearance: color swatches with the kid-style palette
 *   - Info: prefab kind label (read-only)
 *
 * Delete lives in a sticky footer, matching the Problocks right-panel
 * "primary action pinned to the bottom" rule.
 */

const KID_PALETTE_COLORS: string[] = [
  PALETTE.flowerPink,    // Adopt-Me hero pink
  PALETTE.roof,          // iconic bright red
  PALETTE.butter,        // warm yellow
  PALETTE.flowerPeach,   // peach
  PALETTE.mint,          // bright green
  PALETTE.grass,
  PALETTE.sky,
  PALETTE.windowGlass,   // soft cyan
  PALETTE.ivory,
  PALETTE.wallTrim,      // warm cream
  PALETTE.pants,         // dusty blue
  PALETTE.woodDark,      // rich brown
  PALETTE.woodLight,
  PALETTE.charcoal,
  '#ffffff',
];

interface Props {
  headless?: boolean;
}

export function Freeform3DPropertiesPanel({ headless }: Props) {
  const selectedId = useFreeform3D((s) => s.selectedId);
  const object = useFreeform3D((s) =>
    selectedId ? s.scene.objects.find((o) => o.id === selectedId) : null,
  );
  const updateObject = useFreeform3D((s) => s.updateObject);
  const removeObject = useFreeform3D((s) => s.removeObject);

  // Sections and controls are hooks — render a neutral empty state if no selection.
  const def = object ? getPrefabDef(object.kind) : null;

  const setColor = (color: string) => {
    if (!object) return;
    updateObject(object.id, { color });
  };

  const setPropValue = (key: string, value: string | number) => {
    if (!object) return;
    updateObject(object.id, { props: { ...(object.props ?? {}), [key]: value } });
  };

  const delBtn = (
    <PanelActionButton
      variant="destructive"
      icon={Trash2}
      fullWidth
      onClick={() => object && removeObject(object.id)}
      disabled={!object}
    >
      Delete object
    </PanelActionButton>
  );

  const body = (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!object ? (
          <div
            className="h-full flex items-center justify-center text-center px-6"
            style={{ color: 'var(--pb-ink-muted)', fontSize: 12.5, fontWeight: 500 }}
          >
            Click any object in the scene to edit its properties.
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-3 py-3">
            <PanelSection title="Info" collapsible defaultOpen>
              <div className="flex items-center justify-between px-1 py-1 text-xs">
                <span style={{ color: 'var(--pb-ink-muted)', fontWeight: 600 }}>Kind</span>
                <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>
                  {def?.label ?? object.kind}
                </span>
              </div>
              <div className="flex items-center justify-between px-1 py-1 text-xs">
                <span style={{ color: 'var(--pb-ink-muted)', fontWeight: 600 }}>ID</span>
                <span
                  style={{
                    color: 'var(--pb-ink-muted)',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 11,
                  }}
                >
                  {object.id}
                </span>
              </div>
            </PanelSection>

            <PanelSection title="Transform" collapsible defaultOpen>
              <div className="flex flex-col gap-2.5">
                <TransformControls
                  position={toObj(object.position)}
                  rotation={radToDegObj(object.rotation)}
                  scale={toObj(object.scale)}
                  onPositionChange={(v) => updateObject(object.id, { position: toTup(v) })}
                  onRotationChange={(v) => updateObject(object.id, { rotation: degObjToRad(v) })}
                  onScaleChange={(v) => updateObject(object.id, { scale: toTup(v) })}
                />
                <PanelSlider
                  label="Uniform scale"
                  value={object.scale[0]}
                  onChange={(v) => updateObject(object.id, { scale: [v, v, v] })}
                  min={0.1}
                  max={10}
                  step={0.05}
                  precision={2}
                  suffix="×"
                />
              </div>
            </PanelSection>

            <PanelSection title="Appearance" collapsible defaultOpen>
              <PanelColorSwatches
                label="Color"
                value={object.color ?? def?.defaultColor ?? PALETTE.ivory}
                onChange={setColor}
                colors={KID_PALETTE_COLORS}
              />
            </PanelSection>

            <PanelSection title="Physics" collapsible defaultOpen>
              <PanelToggle
                label="Anchored"
                checked={object.anchored !== false}
                onChange={(v) => updateObject(object.id, { anchored: v })}
              />
              <PanelToggle
                label="Can collide"
                checked={object.canCollide !== false}
                onChange={(v) => updateObject(object.id, { canCollide: v })}
              />
            </PanelSection>

            {def?.props && def.props.length > 0 && (
              <PanelSection title={`${def.label} details`} collapsible defaultOpen>
                <div className="flex flex-col gap-3">
                  {def.props.map((spec) => {
                    const current =
                      (object.props?.[spec.key] as string | number | undefined) ??
                      spec.defaultValue;
                    if (spec.kind === 'color') {
                      return (
                        <PanelColorSwatches
                          key={spec.key}
                          label={spec.label}
                          value={String(current)}
                          onChange={(v) => setPropValue(spec.key, v)}
                          colors={KID_PALETTE_COLORS}
                        />
                      );
                    }
                    if (spec.kind === 'number') {
                      return (
                        <PanelSlider
                          key={spec.key}
                          label={spec.label}
                          value={Number(current)}
                          onChange={(v) => setPropValue(spec.key, v)}
                          min={spec.min}
                          max={spec.max}
                          step={spec.step}
                          precision={spec.step < 1 ? 2 : 0}
                          suffix={spec.suffix}
                        />
                      );
                    }
                    if (spec.kind === 'select') {
                      return (
                        <PanelSelect
                          key={spec.key}
                          label={spec.label}
                          value={String(current)}
                          onChange={(v) => setPropValue(spec.key, v)}
                          options={spec.options}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </PanelSection>
            )}
          </div>
        )}
      </div>
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: '1.5px solid var(--pb-line-2)', background: 'var(--pb-paper)' }}
      >
        {delBtn}
      </div>
    </>
  );

  if (headless) return <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{body}</div>;

  return (
    <aside
      className="w-[300px] h-full flex flex-col rounded-xl overflow-hidden"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
      }}
    >
      {body}
    </aside>
  );
}


