'use client';

import { Paintbrush, RotateCcw, Trash2 } from 'lucide-react';
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
import { THEMES, THEME_ORDER } from '@/lib/kid-style-3d/themes';
import type { Vec3 as SceneVec3 } from '@/lib/kid-style-3d/scene-schema';
import { TransformControls, type Vec3 as ObjVec3 } from './TransformControls';

/** Convert [x,y,z] tuple → {x,y,z} object for the shared TransformControls.
    Defensive against undefined fields — an AI-generated object might land
    here with partial transforms; default to 0 rather than crash the panel. */
const toObj = (t: SceneVec3 | undefined): ObjVec3 => ({
  x: t?.[0] ?? 0,
  y: t?.[1] ?? 0,
  z: t?.[2] ?? 0,
});
/** toObj + default scale of 1 instead of 0. */
const toObjScale = (t: SceneVec3 | undefined): ObjVec3 => ({
  x: t?.[0] ?? 1,
  y: t?.[1] ?? 1,
  z: t?.[2] ?? 1,
});
/** Reverse: {x,y,z} object → [x,y,z] tuple for the store. */
const toTup = (v: ObjVec3): SceneVec3 => [v.x, v.y, v.z];
/** Radians tuple → degrees object (for rotation display). */
const radToDegObj = (t: SceneVec3 | undefined): ObjVec3 => ({
  x: ((t?.[0] ?? 0) * 180) / Math.PI,
  y: ((t?.[1] ?? 0) * 180) / Math.PI,
  z: ((t?.[2] ?? 0) * 180) / Math.PI,
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

const SKY_COLORS: string[] = [
  '#a8dcff',  // default day
  '#7ec9ff',  // crisper blue
  '#fdd6a8',  // warm sunset
  '#ffa8c0',  // pink dawn
  '#c9a0ff',  // purple dusk
  '#1a2140',  // night
  '#2a3a50',  // overcast dusk
  '#c0e0c0',  // pastel mint
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
  const world = useFreeform3D((s) => s.world);
  const setWorldField = useFreeform3D((s) => s.setWorldField);
  const resetWorld = useFreeform3D((s) => s.resetWorld);
  const brush = useFreeform3D((s) => s.brush);
  const setBrushField = useFreeform3D((s) => s.setBrushField);
  const resetBrush = useFreeform3D((s) => s.resetBrush);

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

  // Sticky footer action picks the most relevant button for whichever
  // mode the right panel is currently showing. Brush takes priority
  // over selection/world because the user intentionally flipped it on.
  const footerBtn = brush.enabled ? (
    <PanelActionButton
      variant="secondary"
      icon={RotateCcw}
      fullWidth
      onClick={resetBrush}
    >
      Reset brush
    </PanelActionButton>
  ) : object ? (
    <PanelActionButton
      variant="destructive"
      icon={Trash2}
      fullWidth
      onClick={() => removeObject(object.id)}
    >
      Delete object
    </PanelActionButton>
  ) : (
    <PanelActionButton
      variant="secondary"
      icon={RotateCcw}
      fullWidth
      onClick={resetWorld}
    >
      Reset world
    </PanelActionButton>
  );

  const brushBody = (
    <div className="flex flex-col gap-3 px-3 py-3">
      <div
        className="px-1 text-[11px] uppercase tracking-wider flex items-center gap-1.5"
        style={{ color: 'var(--pb-ink-muted)', fontWeight: 700 }}
      >
        <Paintbrush size={12} strokeWidth={2.4} />
        Brush mode — click or drag in the viewport
      </div>

      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          color: 'var(--pb-ink)',
        }}
      >
        {brush.kind ? (
          <>Painting: <span style={{ fontWeight: 700 }}>{brush.kind}</span></>
        ) : (
          <span style={{ color: 'var(--pb-ink-muted)' }}>
            Tap a tile in the Assets panel to pick what to paint.
          </span>
        )}
      </div>

      <PanelSection title="Mode" collapsible defaultOpen>
        <PanelSelect
          label="Brush mode"
          value={brush.mode}
          onChange={(v) => {
            setBrushField('mode', v as typeof brush.mode);
            // Leaving spline mode finalises the active path so the next
            // spline session starts fresh.
            if (v !== 'spline') setBrushField('activePathId', null);
          }}
          options={[
            { value: 'scatter', label: 'Scatter (radial spread)' },
            { value: 'path',    label: 'Stroke (drag a trail)' },
            { value: 'spline',  label: 'Spline (click to extend)' },
          ]}
        />
        <div
          className="px-1 text-[11px] leading-snug"
          style={{ color: 'var(--pb-ink-muted)' }}
        >
          {brush.mode === 'spline'
            ? 'Click on the ground to drop a waypoint. Keep clicking to extend the path — it curves automatically through your points. Right-click to finish.'
            : brush.mode === 'path'
              ? 'Hold left mouse and drag across the ground. Tiles spread perpendicular to your drag direction.'
              : 'Click or drag to scatter tiles in a circle around the cursor.'}
        </div>
      </PanelSection>

      {brush.mode === 'spline' && (
        <PanelSection title="Path" collapsible defaultOpen>
          <PanelSlider
            label="Width"
            value={brush.pathWidth}
            onChange={(v) => setBrushField('pathWidth', v)}
            min={0.5} max={8} step={0.1}
            precision={1}
            suffix="u"
          />
          <PanelSlider
            label="Thickness"
            value={brush.pathThickness}
            onChange={(v) => setBrushField('pathThickness', v)}
            min={0.02} max={1.0} step={0.02}
            precision={2}
            suffix="u"
          />
          <div
            className="px-1 text-[11px] leading-snug"
            style={{ color: 'var(--pb-ink-muted)' }}
          >
            {brush.activePathId
              ? 'Drawing — click to add a waypoint, right-click to finish.'
              : 'Click the ground to start a new path.'}
          </div>
          {brush.activePathId && (
            <PanelActionButton
              variant="secondary"
              onClick={() => setBrushField('activePathId', null)}
            >
              Finish path
            </PanelActionButton>
          )}
        </PanelSection>
      )}

      <PanelSection title="Coverage" collapsible defaultOpen>
        <PanelSlider
          label={brush.mode === 'path' ? 'Tiles across' : 'Density'}
          value={brush.density}
          onChange={(v) => setBrushField('density', v)}
          min={1} max={20} step={1}
        />
        <PanelSlider
          label={brush.mode === 'path' ? 'Path half-width' : 'Radius'}
          value={brush.radius}
          onChange={(v) => setBrushField('radius', v)}
          min={0} max={6} step={0.1}
          precision={1}
          suffix="u"
        />
        <PanelSlider
          label={brush.mode === 'path' ? 'Along-track step' : 'Min spacing'}
          value={brush.minSpacing}
          onChange={(v) => setBrushField('minSpacing', v)}
          min={0} max={2} step={0.05}
          precision={2}
          suffix="u"
        />
      </PanelSection>

      <PanelSection title="Scale" collapsible defaultOpen>
        <PanelSlider
          label="Min"
          value={brush.scaleMin}
          onChange={(v) => {
            setBrushField('scaleMin', v);
            if (v > brush.scaleMax) setBrushField('scaleMax', v);
          }}
          min={0.2} max={3} step={0.05}
          precision={2}
        />
        <PanelSlider
          label="Max"
          value={brush.scaleMax}
          onChange={(v) => {
            setBrushField('scaleMax', v);
            if (v < brush.scaleMin) setBrushField('scaleMin', v);
          }}
          min={0.2} max={3} step={0.05}
          precision={2}
        />
        <PanelToggle
          label="Uniform scale"
          description="(one factor for all axes)"
          checked={brush.uniformScale}
          onChange={(v) => setBrushField('uniformScale', v)}
        />
        <PanelToggle
          label="Random flip (mirror X)"
          checked={brush.randomFlip}
          onChange={(v) => setBrushField('randomFlip', v)}
        />
      </PanelSection>

      <PanelSection title="Rotation" collapsible defaultOpen>
        <PanelToggle
          label="Random Y rotation"
          description="(0..360°)"
          checked={brush.randomRotY}
          onChange={(v) => setBrushField('randomRotY', v)}
        />
        <PanelToggle
          label="Random X tilt"
          checked={brush.randomRotX}
          onChange={(v) => setBrushField('randomRotX', v)}
        />
        <PanelToggle
          label="Random Z tilt"
          checked={brush.randomRotZ}
          onChange={(v) => setBrushField('randomRotZ', v)}
        />
        {(brush.randomRotX || brush.randomRotZ) && (
          <PanelSlider
            label="Tilt range"
            value={Math.round((brush.rotationTilt * 180) / Math.PI)}
            onChange={(v) => setBrushField('rotationTilt', (v * Math.PI) / 180)}
            min={0} max={45} step={1}
            suffix="°"
          />
        )}
      </PanelSection>

      <PanelActionButton
        variant="secondary"
        onClick={() => setBrushField('enabled', false)}
      >
        Exit brush mode
      </PanelActionButton>
    </div>
  );

  const worldBody = (
    <div className="flex flex-col gap-3 px-3 py-3">
      <div
        className="px-1 text-[11px] uppercase tracking-wider"
        style={{ color: 'var(--pb-ink-muted)', fontWeight: 700 }}
      >
        No object selected — editing World
      </div>

      <PanelSection title="Ambience" collapsible defaultOpen>
        <PanelSlider
          label="Brightness"
          value={world.brightness}
          onChange={(v) => setWorldField('brightness', v)}
          min={0} max={4} step={0.05} precision={2}
          suffix="×"
        />
        <PanelSlider
          label="Ambient"
          value={world.ambient}
          onChange={(v) => setWorldField('ambient', v)}
          min={0} max={2} step={0.05} precision={2}
          suffix="×"
        />
        <PanelSlider
          label="Time of day"
          value={world.timeOfDay}
          onChange={(v) => setWorldField('timeOfDay', v)}
          min={0} max={24} step={0.1} precision={1}
          suffix="h"
        />
        <PanelSlider
          label="Fog density"
          value={world.fogDensity}
          onChange={(v) => setWorldField('fogDensity', v)}
          min={0} max={1} step={0.01} precision={2}
        />
      </PanelSection>

      <PanelSection title="Theme" collapsible defaultOpen>
        <PanelSelect
          label="Palette"
          value={world.theme}
          onChange={(v) => setWorldField('theme', v as typeof world.theme)}
          options={THEME_ORDER.map((id) => ({
            value: id,
            label: THEMES[id].label,
          }))}
        />
        <div
          className="px-1 text-[11px] leading-snug"
          style={{ color: 'var(--pb-ink-muted)' }}
        >
          {THEMES[world.theme]?.desc}
        </div>
      </PanelSection>

      <PanelSection title="Sky (custom)" collapsible defaultOpen={false}>
        <PanelColorSwatches
          label="Sky color"
          value={world.skyColor}
          onChange={(v) => setWorldField('skyColor', v)}
          colors={SKY_COLORS}
        />
        <div
          className="px-1 text-[11px] leading-snug"
          style={{ color: 'var(--pb-ink-muted)' }}
        >
          Legacy free-form sky picker. The active Theme owns the gradient
          now, so this only affects exported scenes.
        </div>
      </PanelSection>

      <PanelSection title="Diagnostics" collapsible defaultOpen>
        <PanelToggle
          label="Wireframe"
          checked={world.wireframe}
          onChange={(v) => setWorldField('wireframe', v)}
        />
        <PanelToggle
          label="Show vertices"
          checked={world.showVertices}
          onChange={(v) => setWorldField('showVertices', v)}
        />
        <PanelToggle
          label="Show stats (verts / tris)"
          checked={world.showStats}
          onChange={(v) => setWorldField('showStats', v)}
        />
      </PanelSection>
    </div>
  );

  const body = (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {brush.enabled ? (
          brushBody
        ) : !object ? (
          worldBody
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
                  scale={toObjScale(object.scale)}
                  onPositionChange={(v) => updateObject(object.id, { position: toTup(v) })}
                  onRotationChange={(v) => updateObject(object.id, { rotation: degObjToRad(v) })}
                  onScaleChange={(v) => updateObject(object.id, { scale: toTup(v) })}
                />
                <PanelSlider
                  label="Uniform scale"
                  value={object.scale?.[0] ?? 1}
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
        {footerBtn}
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


