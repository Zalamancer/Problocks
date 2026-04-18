'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Zap,
  FolderKanban,
  Gauge,
  Sun,
  Monitor,
  Sparkles,
  Plug,
  SlidersHorizontal,
  Code2,
  Palette,
  RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  PanelToggle,
  PanelActionButton,
  PanelSelect,
  PanelSlider,
  PanelSection,
} from '@/components/ui';
import { useQualityStore, type QualityTier } from '@/store/quality-store';
import {
  useEditorSettings,
  EDITOR_THEME_PRESETS,
  resolveThemeColors,
  type EditorThemePreset,
  type AutoIndentRule,
  type CameraSpeedAdjustBinding,
  type EditorThemeColors,
} from '@/store/editor-settings-store';

const PRESET_OPTIONS: { value: Exclude<QualityTier, 'custom'>; label: string }[] = [
  { value: 'low',    label: 'Low — Chromebooks / old laptops' },
  { value: 'medium', label: 'Medium — integrated GPUs' },
  { value: 'high',   label: 'High — gaming laptops / desktops' },
];

const SHADOW_TYPE_OPTIONS = [
  { value: 'off',      label: 'Off' },
  { value: 'basic',    label: 'Hard shadows (cheap)' },
  { value: 'pcf-soft', label: 'Soft shadows (expensive)' },
];

const SHADOW_RES_OPTIONS = [
  { value: '512',  label: '512 — fastest' },
  { value: '1024', label: '1024 — balanced' },
  { value: '2048', label: '2048 — sharp' },
];

const PIXEL_RATIO_OPTIONS = [
  { value: '1',   label: '1× — fastest' },
  { value: '1.5', label: '1.5× — balanced' },
  { value: '2',   label: '2× — retina' },
];

const BLUR_OPTIONS = [
  { value: 'none', label: 'Off — opaque panels' },
  { value: 'md',   label: 'Medium blur (12px)' },
  { value: 'xl',   label: 'Heavy blur (24px)' },
];

type SectionId =
  | 'project'
  | 'studio'
  | 'script-editor'
  | 'editor-theme'
  | 'performance'
  | 'shadows'
  | 'rendering'
  | 'interface'
  | 'integrations';

interface SectionDef {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'project',       label: 'Project',       icon: FolderKanban,      description: 'Game, credits, classroom' },
  { id: 'studio',        label: 'Studio',        icon: SlidersHorizontal, description: 'Auto-save, camera, diagnostics' },
  { id: 'script-editor', label: 'Script Editor', icon: Code2,             description: 'Font, tabs, whitespace, indent' },
  { id: 'editor-theme',  label: 'Editor Theme',  icon: Palette,           description: 'Preset + syntax colors' },
  { id: 'performance',   label: 'Performance',   icon: Gauge,             description: 'Quality preset' },
  { id: 'shadows',       label: 'Shadows',       icon: Sun,               description: 'Casting, resolution, softness' },
  { id: 'rendering',     label: 'Rendering',     icon: Monitor,           description: 'AA, pixel ratio, materials' },
  { id: 'interface',     label: 'Interface',     icon: Sparkles,          description: 'Blur, transitions' },
  { id: 'integrations',  label: 'Integrations',  icon: Plug,              description: 'Classroom, credits' },
];

const CAMERA_BINDING_OPTIONS: { value: CameraSpeedAdjustBinding; label: string }[] = [
  { value: 'shift', label: 'Shift' },
  { value: 'ctrl',  label: 'Ctrl / ⌘' },
  { value: 'off',   label: 'Off' },
];

const AUTO_INDENT_OPTIONS: { value: AutoIndentRule; label: string }[] = [
  { value: 'none',     label: 'None' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'relative', label: 'Relative (match previous line)' },
];

const THEME_PRESET_OPTIONS: { value: EditorThemePreset; label: string }[] = (
  Object.entries(EDITOR_THEME_PRESETS) as [EditorThemePreset, (typeof EDITOR_THEME_PRESETS)[EditorThemePreset]][]
).map(([value, def]) => ({ value, label: def.label }));

const THEME_SWATCH_KEYS: { key: keyof EditorThemeColors; label: string }[] = [
  { key: 'background',                label: 'Background' },
  { key: 'textColor',                 label: 'Text' },
  { key: 'keywordColor',              label: 'Keyword' },
  { key: 'stringColor',               label: 'String' },
  { key: 'numberColor',               label: 'Number' },
  { key: 'commentColor',              label: 'Comment' },
  { key: 'operatorColor',             label: 'Operator' },
  { key: 'functionNameColor',         label: 'Function name' },
  { key: 'currentLineHighlightColor', label: 'Current-line highlight' },
  { key: 'selectionBackgroundColor',  label: 'Selection' },
  { key: 'errorColor',                label: 'Error' },
  { key: 'warningColor',              label: 'Warning' },
];

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState<SectionId>('project');

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      {/* Left column — section list */}
      <aside
        className="w-[240px] shrink-0 overflow-y-auto"
        style={{
          background: 'var(--pb-cream-2)',
          borderRight: '1.5px solid var(--pb-line-2)',
        }}
      >
        <div className="px-3 py-4">
          <div className="px-2 pb-2">
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--pb-ink)' }}>
              Settings
            </h2>
            <p
              className="mt-0.5"
              style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 500 }}
            >
              Manage studio preferences
            </p>
          </div>
          <nav className="flex flex-col gap-1 mt-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const active = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-start gap-2.5 text-left transition-colors"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: active ? 'var(--pb-paper)' : 'transparent',
                    border: `1.5px solid ${active ? 'var(--pb-ink)' : 'transparent'}`,
                    boxShadow: active ? '0 2px 0 var(--pb-ink)' : 'none',
                    color: 'var(--pb-ink)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={2.2}
                    className="shrink-0 mt-0.5"
                    style={{ color: active ? 'var(--pb-ink)' : 'var(--pb-ink-muted)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="leading-tight"
                      style={{ fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)' }}
                    >
                      {section.label}
                    </div>
                    <div
                      className="mt-0.5 truncate"
                      style={{
                        fontSize: 11,
                        color: 'var(--pb-ink-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Right column — selected section's content */}
      <section
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ background: 'var(--pb-paper)' }}
      >
        <SectionContent id={activeSection} />
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header
      className="px-6 pt-6 pb-4"
      style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--pb-ink)' }}>
        {title}
      </h3>
      {subtitle && (
        <p
          className="mt-1"
          style={{ fontSize: 12, color: 'var(--pb-ink-muted)', fontWeight: 500 }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

function SectionContent({ id }: { id: SectionId }) {
  switch (id) {
    case 'project':       return <ProjectSection />;
    case 'studio':        return <StudioSection />;
    case 'script-editor': return <ScriptEditorSection />;
    case 'editor-theme':  return <EditorThemeSection />;
    case 'performance':   return <PerformanceSection />;
    case 'shadows':       return <ShadowsSection />;
    case 'rendering':     return <RenderingSection />;
    case 'interface':     return <InterfaceSection />;
    case 'integrations':  return <IntegrationsSection />;
  }
}

function StudioSection() {
  const studio = useEditorSettings((s) => s.studio);
  const setStudio = useEditorSettings((s) => s.setStudio);

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Studio"
        subtitle="General editor preferences — mirrors Roblox Studio → Studio Settings."
      />
      <div className="px-6 py-5 max-w-xl flex flex-col gap-4">
        <PanelSection collapsible title="Saving & recovery">
          <div className="flex flex-col gap-2 px-4 py-4">
            <PanelToggle
              label="Always save script changes"
              checked={studio.alwaysSaveScriptChanges}
              onChange={(v) => setStudio('alwaysSaveScriptChanges', v)}
              description="Auto-save when the place is saved"
            />
            <PanelToggle
              label="Auto-recovery"
              checked={studio.autoRecoveryEnabled}
              onChange={(v) => setStudio('autoRecoveryEnabled', v)}
              description="Write a background snapshot periodically"
            />
            <PanelSlider
              label="Auto-recovery interval"
              value={studio.autoRecoveryIntervalMinutes}
              onChange={(v) => setStudio('autoRecoveryIntervalMinutes', v)}
              min={1}
              max={30}
              step={1}
              suffix=" min"
            />
          </div>
        </PanelSection>

        <PanelSection collapsible title="Camera">
          <div className="flex flex-col gap-2 px-4 py-4">
            <PanelSlider
              label="Camera speed"
              value={studio.cameraSpeed}
              onChange={(v) => setStudio('cameraSpeed', v)}
              min={0.1}
              max={5}
              step={0.1}
              precision={1}
              suffix="×"
            />
            <PanelSlider
              label="Shift multiplier"
              value={studio.cameraShiftSpeed}
              onChange={(v) => setStudio('cameraShiftSpeed', v)}
              min={1}
              max={10}
              step={0.1}
              precision={1}
              suffix="×"
            />
            <PanelSelect
              label="Speed adjust binding"
              value={studio.cameraSpeedAdjustBinding}
              onChange={(v) => setStudio('cameraSpeedAdjustBinding', v as CameraSpeedAdjustBinding)}
              options={CAMERA_BINDING_OPTIONS}
              fullWidth
            />
            <PanelToggle
              label="Zoom to mouse position"
              checked={studio.cameraZoomToMousePosition}
              onChange={(v) => setStudio('cameraZoomToMousePosition', v)}
              description="Wheel zooms toward the cursor instead of the viewport center"
            />
          </div>
        </PanelSection>

        <PanelSection collapsible title="Diagnostics">
          <div className="flex flex-col gap-2 px-4 py-4">
            <PanelToggle
              label="Show diagnostics bar"
              checked={studio.showDiagnosticsBar}
              onChange={(v) => setStudio('showDiagnosticsBar', v)}
              description="Bottom-of-viewport FPS / frame-time HUD"
            />
          </div>
        </PanelSection>
      </div>
    </div>
  );
}

function ScriptEditorSection() {
  const editor = useEditorSettings((s) => s.scriptEditor);
  const setEditor = useEditorSettings((s) => s.setScriptEditor);

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Script Editor"
        subtitle="Font, indentation, and editor behavior."
      />
      <div className="px-6 py-5 max-w-xl flex flex-col gap-4">
        <PanelSection collapsible title="Typography">
          <div className="flex flex-col gap-2 px-4 py-4">
            <PanelSlider
              label="Font size"
              value={editor.fontSize}
              onChange={(v) => setEditor('fontSize', v)}
              min={10}
              max={24}
              step={1}
              suffix="px"
            />
            <PanelSlider
              label="Tab width"
              value={editor.tabWidth}
              onChange={(v) => setEditor('tabWidth', v)}
              min={1}
              max={8}
              step={1}
              suffix=" cols"
            />
            <PanelToggle
              label="Indent using spaces"
              checked={editor.indentUsingSpaces}
              onChange={(v) => setEditor('indentUsingSpaces', v)}
              description="Insert spaces instead of tab characters"
            />
            <PanelToggle
              label="Text wrapping"
              checked={editor.textWrapping}
              onChange={(v) => setEditor('textWrapping', v)}
              description="Soft-wrap long lines"
            />
          </div>
        </PanelSection>

        <PanelSection collapsible title="Display">
          <div className="flex flex-col gap-2 px-4 py-4">
            <PanelToggle
              label="Show whitespace"
              checked={editor.showWhitespace}
              onChange={(v) => setEditor('showWhitespace', v)}
              description="Render space / tab / newline glyphs"
            />
            <PanelToggle
              label="Highlight current line"
              checked={editor.highlightCurrentLine}
              onChange={(v) => setEditor('highlightCurrentLine', v)}
            />
            <PanelToggle
              label="Indentation rulers"
              checked={editor.enableIndentationRulers}
              onChange={(v) => setEditor('enableIndentationRulers', v)}
              description="Vertical guides at each indent level"
            />
            <PanelToggle
              label="Scroll past last line"
              checked={editor.scrollPastLastLine}
              onChange={(v) => setEditor('scrollPastLastLine', v)}
              description="Allow scrolling past the end of the file"
            />
          </div>
        </PanelSection>

        <PanelSection collapsible title="Editing">
          <div className="flex flex-col gap-2 px-4 py-4">
            <PanelToggle
              label="Autocomplete"
              checked={editor.enableAutocomplete}
              onChange={(v) => setEditor('enableAutocomplete', v)}
            />
            <PanelToggle
              label="Auto-close brackets"
              checked={editor.autoClosingBrackets}
              onChange={(v) => setEditor('autoClosingBrackets', v)}
            />
            <PanelToggle
              label="Auto-close quotes"
              checked={editor.autoClosingQuotes}
              onChange={(v) => setEditor('autoClosingQuotes', v)}
            />
            <PanelToggle
              label="Format on paste"
              checked={editor.formatOnPaste}
              onChange={(v) => setEditor('formatOnPaste', v)}
            />
            <PanelSelect
              label="Auto indent rule"
              value={editor.autoIndentRule}
              onChange={(v) => setEditor('autoIndentRule', v as AutoIndentRule)}
              options={AUTO_INDENT_OPTIONS}
              fullWidth
            />
          </div>
        </PanelSection>
      </div>
    </div>
  );
}

function EditorThemeSection() {
  const theme = useEditorSettings((s) => s.theme);
  const setThemePreset = useEditorSettings((s) => s.setThemePreset);
  const setThemeColor = useEditorSettings((s) => s.setThemeColor);
  const resetThemeOverrides = useEditorSettings((s) => s.resetThemeOverrides);
  const colors = resolveThemeColors(theme);
  const hasOverrides = Object.keys(theme.overrides).length > 0;

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Editor Theme"
        subtitle="Script editor color preset + per-token overrides."
      />
      <div className="px-6 py-5 max-w-xl flex flex-col gap-4">
        <PanelSection collapsible title="Preset">
          <div className="flex flex-col gap-2 px-4 py-4">
            <PanelSelect
              label="Script editor color preset"
              value={theme.preset}
              onChange={(v) => setThemePreset(v as EditorThemePreset)}
              options={THEME_PRESET_OPTIONS}
              fullWidth
            />
            <div className="flex items-center justify-between pt-1">
              <span
                style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 500 }}
              >
                {hasOverrides ? `${Object.keys(theme.overrides).length} token${Object.keys(theme.overrides).length === 1 ? '' : 's'} customized` : 'Using preset defaults'}
              </span>
              {hasOverrides && (
                <button
                  type="button"
                  onClick={resetThemeOverrides}
                  className="flex items-center gap-1 transition-colors"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--pb-grape-ink)',
                    background: 'transparent',
                    border: 0,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  <RotateCcw size={11} strokeWidth={2.2} />
                  Reset overrides
                </button>
              )}
            </div>
          </div>
        </PanelSection>

        <PanelSection collapsible title="Syntax colors">
          <div className="flex flex-col gap-2 px-4 py-4">
            {THEME_SWATCH_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label
                  className="flex-1 min-w-0 truncate"
                  style={{ fontSize: 12, color: 'var(--pb-ink)', fontWeight: 600 }}
                >
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => setThemeColor(key, e.target.value)}
                    className="cursor-pointer"
                    style={{
                      height: 24,
                      width: 40,
                      borderRadius: 6,
                      background: 'transparent',
                      border: '1.5px solid var(--pb-line-2)',
                    }}
                    aria-label={label}
                  />
                  <code
                    className="w-[60px] text-right tabular-nums"
                    style={{
                      fontSize: 10,
                      fontFamily: 'DM Mono, monospace',
                      color: 'var(--pb-ink-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {colors[key]}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </PanelSection>

        <PanelSection collapsible title="Preview">
          <div className="px-4 py-4">
            <ThemePreview colors={colors} />
          </div>
        </PanelSection>
      </div>
    </div>
  );
}

function ThemePreview({ colors }: { colors: EditorThemeColors }) {
  return (
    <div
      className="p-3 font-mono text-[12px] leading-5"
      style={{
        background: colors.background,
        color: colors.textColor,
        borderRadius: 10,
        border: '1.5px solid var(--pb-line-2)',
      }}
    >
      <div>
        <span style={{ color: colors.commentColor }}>{'-- greets the player'}</span>
      </div>
      <div>
        <span style={{ color: colors.keywordColor }}>local</span>{' '}
        <span style={{ color: colors.functionNameColor }}>greet</span>{' '}
        <span style={{ color: colors.operatorColor }}>=</span>{' '}
        <span style={{ color: colors.keywordColor }}>function</span>
        <span style={{ color: colors.operatorColor }}>(</span>
        name
        <span style={{ color: colors.operatorColor }}>)</span>
      </div>
      <div
        className="px-1 -mx-1 rounded"
        style={{ background: colors.currentLineHighlightColor }}
      >
        &nbsp;&nbsp;<span style={{ color: colors.keywordColor }}>return</span>{' '}
        <span style={{ color: colors.stringColor }}>&quot;Hello, &quot;</span>{' '}
        <span style={{ color: colors.operatorColor }}>..</span> name{' '}
        <span style={{ color: colors.operatorColor }}>..</span>{' '}
        <span style={{ color: colors.stringColor }}>&quot;!&quot;</span>
      </div>
      <div>
        <span style={{ color: colors.keywordColor }}>end</span>
      </div>
      <div>
        <span style={{ color: colors.functionNameColor }}>print</span>
        <span style={{ color: colors.operatorColor }}>(</span>
        <span style={{ color: colors.functionNameColor }}>greet</span>
        <span style={{ color: colors.operatorColor }}>(</span>
        <span style={{ color: colors.stringColor }}>&quot;world&quot;</span>
        <span style={{ color: colors.operatorColor }}>))</span>{' '}
        <span style={{ color: colors.numberColor }}>42</span>
      </div>
      <div>
        <span
          style={{
            background: colors.selectionBackgroundColor,
            color: colors.textColor,
          }}
        >
          {'-- selected text sample'}
        </span>
      </div>
      <div className="pt-1 flex gap-3">
        <span style={{ color: colors.errorColor }}>■ error</span>
        <span style={{ color: colors.warningColor }}>■ warning</span>
      </div>
    </div>
  );
}

function ProjectSection() {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Project" subtitle="Overview and editor defaults" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <div
          className="flex items-center justify-between"
          style={{
            padding: '10px 14px',
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 10,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--pb-ink)', fontWeight: 600 }}>
            Credits remaining
          </span>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              background: 'var(--pb-butter)',
              color: 'var(--pb-butter-ink)',
              border: '1.5px solid var(--pb-butter-ink)',
            }}
          >
            2,450
          </span>
        </div>
        <div
          className="flex items-center justify-between"
          style={{
            padding: '10px 14px',
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 10,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--pb-ink)', fontWeight: 600 }}>
            Classroom
          </span>
          <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 500 }}>
            Not connected
          </span>
        </div>
        <div className="pt-2 space-y-3">
          <PanelToggle label="Auto-save" checked={true} onChange={() => {}} />
          <PanelToggle label="Show grid" checked={false} onChange={() => {}} description="on canvas" />
        </div>
      </div>
    </div>
  );
}

function PerformanceSection() {
  const tier = useQualityStore((s) => s.tier);
  const userPicked = useQualityStore((s) => s.userPicked);
  const setTier = useQualityStore((s) => s.setTier);
  const resetToAutoDetected = useQualityStore((s) => s.resetToAutoDetected);

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Performance"
        subtitle="Pick a quality preset, or tune individual controls in the sections below."
      />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <PanelSelect
          label="Quality"
          value={tier === 'custom' ? '' : tier}
          onChange={(v) => setTier(v as Exclude<QualityTier, 'custom'>)}
          options={PRESET_OPTIONS}
          placeholder={tier === 'custom' ? 'Custom' : 'Select preset…'}
          fullWidth
        />
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 500 }}>
            {tier === 'custom' ? 'Custom settings' : userPicked ? 'Set by you' : 'Auto-detected'}
          </span>
          {(userPicked || tier === 'custom') && (
            <button
              type="button"
              onClick={resetToAutoDetected}
              className="transition-colors"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--pb-grape-ink)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              Reset to auto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ShadowsSection() {
  const settings = useQualityStore((s) => s.settings);
  const setSetting = useQualityStore((s) => s.setSetting);

  return (
    <div className="flex flex-col">
      <SectionHeader title="Shadows" subtitle="Biggest perf cost — turn off on Chromebooks" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <PanelToggle
          label="Shadows"
          checked={settings.shadows}
          onChange={(v) => {
            setSetting('shadows', v);
            if (!v) setSetting('shadowType', 'off');
            else if (settings.shadowType === 'off') setSetting('shadowType', 'basic');
          }}
          description="Master on/off switch"
        />
        <PanelSelect
          label="Shadow type"
          value={settings.shadowType}
          onChange={(v) => {
            setSetting('shadowType', v as 'off' | 'basic' | 'pcf-soft');
            setSetting('shadows', v !== 'off');
          }}
          options={SHADOW_TYPE_OPTIONS}
          fullWidth
        />
        <PanelSelect
          label="Shadow resolution"
          value={String(settings.shadowMapSize)}
          onChange={(v) => setSetting('shadowMapSize', Number(v))}
          options={SHADOW_RES_OPTIONS}
          fullWidth
        />
      </div>
    </div>
  );
}

function RenderingSection() {
  const settings = useQualityStore((s) => s.settings);
  const setSetting = useQualityStore((s) => s.setSetting);

  return (
    <div className="flex flex-col">
      <SectionHeader title="Rendering" subtitle="Pixel ratio, anti-aliasing, materials" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <PanelToggle
          label="Anti-aliasing"
          checked={settings.antialias}
          onChange={(v) => setSetting('antialias', v)}
          description="Smooths jagged edges (MSAA)"
        />
        <PanelSelect
          label="Resolution scale"
          value={String(settings.maxPixelRatio)}
          onChange={(v) => setSetting('maxPixelRatio', Number(v))}
          options={PIXEL_RATIO_OPTIONS}
          fullWidth
        />
        <PanelToggle
          label="PBR materials"
          checked={settings.pbrMaterials}
          onChange={(v) => setSetting('pbrMaterials', v)}
          description="Realistic roughness/metalness — off uses Lambert"
        />
        <PanelToggle
          label="Low-poly primitives"
          checked={settings.lowPolyPrimitives}
          onChange={(v) => setSetting('lowPolyPrimitives', v)}
          description="Fewer triangles per sphere/cylinder"
        />
      </div>
    </div>
  );
}

function InterfaceSection() {
  const settings = useQualityStore((s) => s.settings);
  const setSetting = useQualityStore((s) => s.setSetting);

  return (
    <div className="flex flex-col">
      <SectionHeader title="Interface" subtitle="Visual polish for the studio shell" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <PanelSelect
          label="Panel blur"
          value={settings.backdropBlur}
          onChange={(v) => setSetting('backdropBlur', v as 'none' | 'md' | 'xl')}
          options={BLUR_OPTIONS}
          fullWidth
        />
        <PanelToggle
          label="UI transitions"
          checked={settings.uiTransitions}
          onChange={(v) => setSetting('uiTransitions', v)}
          description="Hover animations on nodes and lists"
        />
      </div>
    </div>
  );
}

function IntegrationsSection() {
  const router = useRouter();
  return (
    <div className="flex flex-col">
      <SectionHeader title="Integrations" subtitle="External services and billing" />
      <div className="px-6 py-5 space-y-3 max-w-xl">
        <PanelActionButton
          onClick={() => router.push('/classroom')}
          variant="secondary"
          icon={GraduationCap}
          fullWidth
        >
          Open Google Classroom
        </PanelActionButton>
        <PanelActionButton
          onClick={() => {}}
          variant="accent"
          icon={Zap}
          fullWidth
        >
          Buy More Credits
        </PanelActionButton>
      </div>
    </div>
  );
}
