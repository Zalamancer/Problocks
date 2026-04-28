'use client';
import { useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ImageIcon, AlertTriangle } from 'lucide-react';
import {
  PanelSection,
  PanelInput,
  PanelTextarea,
  PanelSelect,
  PanelSlider,
  PanelToggle,
  PanelDropZone,
  PanelActionButton,
} from '@/components/ui/panel-controls';
import {
  defaultsFor,
  type Field,
  type ToolSchema,
} from '@/lib/pixellab-tools';

type FormState = Record<string, unknown>;

interface PixelLabToolFormProps {
  tool: ToolSchema;
  onBack: () => void;
}

function isFieldVisible(field: Field, state: FormState): boolean {
  if (!field.showWhen) return true;
  const current = state[field.showWhen.key];
  const equals = field.showWhen.equals;
  if (Array.isArray(equals)) return equals.includes(current as never);
  return current === equals;
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const helpRow = field.help ? (
    <p className="text-[11px] text-gray-500 mt-1 mb-3 -mt-2">{field.help}</p>
  ) : null;
  const requiredMark = field.required ? <span className="text-pink-400 ml-1">*</span> : null;

  switch (field.kind) {
    case 'textarea':
      return (
        <div>
          <span className="text-gray-400 text-sm mb-1 block">
            {field.label}{requiredMark}
          </span>
          <PanelTextarea
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={field.placeholder}
            rows={field.rows ?? 3}
          />
          {helpRow}
        </div>
      );

    case 'text':
      return (
        <div>
          <span className="text-gray-400 text-sm mb-1 block">
            {field.label}{requiredMark}
          </span>
          <PanelInput
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            placeholder={field.placeholder}
            fullWidth
          />
          {helpRow}
        </div>
      );

    case 'select':
      return (
        <div>
          <span className="text-gray-400 text-sm mb-1 block">
            {field.label}{requiredMark}
          </span>
          <PanelSelect
            value={(value as string) ?? ''}
            onChange={(v) => onChange(v)}
            options={field.options}
            fullWidth
          />
          {helpRow}
        </div>
      );

    case 'slider':
      return (
        <div>
          <PanelSlider
            label={field.label}
            value={(value as number) ?? field.default}
            onChange={(v) => onChange(v)}
            min={field.min}
            max={field.max}
            step={field.step}
            precision={field.precision ?? 0}
            suffix={field.suffix}
          />
          {helpRow}
        </div>
      );

    case 'boolean':
      return (
        <div>
          <PanelToggle
            label={field.label}
            checked={Boolean(value)}
            onChange={(v) => onChange(v)}
            description={field.help}
          />
        </div>
      );

    case 'image': {
      const file = value as File | null;
      return (
        <div>
          <span className="text-gray-400 text-sm mb-1 block">
            {field.label}{requiredMark}
          </span>
          <ImageInput value={file} onChange={(f) => onChange(f)} />
          {field.note && <p className="text-[11px] text-gray-500 mt-2">{field.note}</p>}
          {helpRow}
        </div>
      );
    }

    case 'images': {
      const files = (value as File[] | null) ?? [];
      return (
        <div>
          <span className="text-gray-400 text-sm mb-1 block">
            {field.label}{requiredMark}{' '}
            <span className="text-gray-600 text-[11px]">({files.length}/{field.max})</span>
          </span>
          <ImagesInput
            values={files}
            max={field.max}
            onChange={(arr) => onChange(arr)}
          />
          {field.note && <p className="text-[11px] text-gray-500 mt-2">{field.note}</p>}
          {helpRow}
        </div>
      );
    }
  }
}

function ImageInput({ value, onChange }: { value: File | null; onChange: (f: File | null) => void }) {
  const [dragging, setDragging] = useState(false);
  const onPick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/gif,image/webp';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) onChange(f);
    };
    input.click();
  }, [onChange]);

  if (value) {
    const url = URL.createObjectURL(value);
    return (
      <div
        className="relative rounded-lg border border-panel-border overflow-hidden"
        style={{ background: 'var(--pb-paper)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={value.name} className="w-full h-auto" style={{ imageRendering: 'pixelated' }} />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded bg-black/60 text-white hover:bg-black/80"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <PanelDropZone
      icon={ImageIcon}
      label="Click to upload or drag and drop"
      sublabel="PNG, JPG, GIF, WebP"
      isDragging={dragging}
      onClick={onPick}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onChange(f);
      }}
    />
  );
}

function ImagesInput({ values, max, onChange }: { values: File[]; max: number; onChange: (arr: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const remaining = max - values.length;
  const onPick = useCallback(() => {
    if (remaining <= 0) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/png,image/jpeg,image/gif,image/webp';
    input.onchange = () => {
      const fs = Array.from(input.files ?? []).slice(0, remaining);
      onChange([...values, ...fs]);
    };
    input.click();
  }, [onChange, remaining, values]);

  return (
    <div className="flex flex-col gap-2">
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {values.map((f, i) => {
            const url = URL.createObjectURL(f);
            return (
              <div
                key={`${f.name}-${i}`}
                className="relative rounded border border-panel-border overflow-hidden"
                style={{ background: 'var(--pb-paper)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={f.name} className="w-full h-16 object-cover" style={{ imageRendering: 'pixelated' }} />
                <button
                  type="button"
                  onClick={() => onChange(values.filter((_, j) => j !== i))}
                  className="absolute top-0.5 right-0.5 w-4 h-4 leading-none rounded-full bg-black/70 text-white text-[10px] hover:bg-black"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
      {remaining > 0 && (
        <PanelDropZone
          icon={ImageIcon}
          label="Click to upload or drag and drop"
          sublabel={`${remaining} more allowed`}
          isDragging={dragging}
          onClick={onPick}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const fs = Array.from(e.dataTransfer.files ?? []).slice(0, remaining);
            if (fs.length) onChange([...values, ...fs]);
          }}
        />
      )}
    </div>
  );
}

interface ToolResult {
  text: string;
  images: string[];
}

export function PixelLabToolForm({ tool, onBack }: PixelLabToolFormProps) {
  const [state, setState] = useState<FormState>(() => defaultsFor(tool));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);

  const groupedFields = useMemo(() => {
    const groups: Record<string, Field[]> = {};
    for (const section of tool.sections) groups[section.id] = [];
    for (const f of tool.fields) {
      const sectionId = f.group ?? tool.sections[0]?.id ?? 'main';
      if (!groups[sectionId]) groups[sectionId] = [];
      groups[sectionId].push(f);
    }
    return groups;
  }, [tool]);

  const setField = useCallback((key: string, v: unknown) => {
    setState((prev) => ({ ...prev, [key]: v }));
  }, []);

  const missingRequired = useMemo(() => {
    return tool.fields.filter((f) => {
      if (!f.required) return false;
      if (!isFieldVisible(f, state)) return false;
      const v = state[f.key];
      if (f.kind === 'images') return !Array.isArray(v) || v.length === 0;
      if (f.kind === 'image')  return !v;
      if (typeof v === 'string') return v.trim().length === 0;
      return v == null;
    });
  }, [tool, state]);

  const handleSubmit = useCallback(async () => {
    if (missingRequired.length > 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      // Build FormData: __args is JSON for non-file fields; image fields are
      // appended as binary (single = `<key>`, multiple = `<key>[]`).
      const args: Record<string, unknown> = {};
      const fd = new FormData();
      for (const f of tool.fields) {
        if (!isFieldVisible(f, state)) continue;
        const v = state[f.key];
        if (f.kind === 'image') {
          if (v instanceof File) fd.append(f.key, v, v.name);
          continue;
        }
        if (f.kind === 'images') {
          const arr = (v as File[] | null) ?? [];
          for (const file of arr) fd.append(`${f.key}[]`, file, file.name);
          continue;
        }
        if (v === '' || v == null) continue;
        // Numeric coercion for selects whose MCP type is integer.
        if (f.kind === 'select' && f.key === 'n_directions') args[f.key] = Number(v);
        else args[f.key] = v;
      }
      fd.append('__args', JSON.stringify(args));

      const resp = await fetch(`/api/pixellab/run/${encodeURIComponent(tool.id)}`, {
        method: 'POST',
        body: fd,
      });
      const json = (await resp.json()) as {
        ok: boolean;
        text?: string;
        images?: string[];
        error?: string;
        detail?: string;
      };
      if (!json.ok) {
        setError(json.error ?? `Request failed (HTTP ${resp.status})`);
      } else {
        setResult({ text: json.text ?? '', images: json.images ?? [] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }, [missingRequired, submitting, state, tool]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tool header */}
      <div
        className="shrink-0"
        style={{ padding: '10px 12px', borderBottom: '1.5px solid var(--pb-line-2)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] font-semibold mb-2"
          style={{ color: 'var(--pb-mint-ink, #0f5e44)' }}
        >
          <ChevronLeft size={12} />
          Change
        </button>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: 'var(--pb-ink)' }}>{tool.title}</h3>
              {tool.badge && (
                <span
                  className="text-[9px] font-bold px-1.5 py-[2px] rounded"
                  style={
                    tool.badge === 'NEW'
                      ? { background: 'var(--pb-mint-2, #c8f3df)', color: 'var(--pb-mint-ink, #0f5e44)' }
                      : tool.badge === 'PRO'
                        ? { background: 'rgba(155,120,220,0.18)', color: '#7a5cc4' }
                        : { background: 'rgba(220,170,90,0.18)', color: '#a06f1f' }
                  }
                >
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-[11px]" style={{ color: 'var(--pb-ink-muted)' }}>{tool.desc}</p>
            {tool.costInfo && (
              <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#a06f1f' }}>
                <AlertTriangle size={11} /> This tool costs {tool.costInfo}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '8px 12px 12px' }}>
        {tool.sections.map((section) => {
          const fields = (groupedFields[section.id] ?? []).filter((f) => isFieldVisible(f, state));
          if (fields.length === 0) return null;
          return (
            <PanelSection
              key={section.id}
              title={section.title}
              collapsible
              defaultOpen={section.defaultOpen ?? true}
            >
              <div className="flex flex-col gap-3">
                {fields.map((f) => (
                  <FieldRenderer
                    key={f.key}
                    field={f}
                    value={state[f.key]}
                    onChange={(v) => setField(f.key, v)}
                  />
                ))}
              </div>
            </PanelSection>
          );
        })}
      </div>

      {/* Result / error block (above footer, inside scroll region for tall outputs) */}
      {(error || result) && (
        <div
          className="shrink-0 overflow-y-auto"
          style={{
            padding: '10px 12px',
            borderTop: '1.5px solid var(--pb-line-2)',
            maxHeight: '40%',
          }}
        >
          {error && (
            <div
              className="text-[12px] rounded p-2"
              style={{ background: 'rgba(220,90,90,0.12)', color: '#b04040', border: '1px solid rgba(220,90,90,0.3)' }}
            >
              {error}
            </div>
          )}
          {result && (
            <div className="flex flex-col gap-2">
              {result.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {result.images.map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={i}
                      src={src}
                      alt={`result ${i + 1}`}
                      className="w-full h-auto rounded border border-panel-border"
                      style={{ imageRendering: 'pixelated', background: 'var(--pb-paper)' }}
                    />
                  ))}
                </div>
              )}
              {result.text && (
                <pre
                  className="text-[11px] whitespace-pre-wrap p-2 rounded"
                  style={{ background: 'var(--pb-paper)', border: '1px solid var(--pb-line-2)', color: 'var(--pb-ink)' }}
                >
                  {result.text}
                </pre>
              )}
              {result.images.length === 0 && !result.text && (
                <p className="text-[11px]" style={{ color: 'var(--pb-ink-muted)' }}>
                  Job queued. The tool returned no inline content — check PixelLab&apos;s dashboard or
                  call <code>get_*</code> with the returned ID once the job completes.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sticky footer */}
      <div
        className="shrink-0"
        style={{ padding: '10px 12px', borderTop: '1.5px solid var(--pb-line-2)' }}
      >
        <PanelActionButton
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={missingRequired.length > 0}
          loading={submitting}
        >
          {submitting ? 'Generating…' : 'Generate'}
        </PanelActionButton>
        {missingRequired.length > 0 && (
          <p className="text-[11px] mt-2" style={{ color: '#a06f1f' }}>
            Missing: {missingRequired.map((f) => f.label).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
