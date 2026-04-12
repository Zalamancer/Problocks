'use client';
import { useState, useMemo } from 'react';
import {
  Lightbulb,
  BookOpen,
  Package,
  Wrench,
  FileText,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectBoard } from '@/store/project-board-store';
import {
  PanelSection,
  PanelActionButton,
  PanelSelect,
  PanelInput,
  PanelTextarea,
  PanelSlider,
  PanelMultiSelect,
} from '@/components/ui/panel-controls';
import { PanelErrorBoundary } from '@/components/PanelErrorBoundary';
import { DropdownSectionHeader, type SectionDef } from './DropdownSectionHeader';
import {
  resolveEffectiveTask,
  type Template,
  type ProjectBoard,
  type TaskStatus,
  type TeamRole,
  type AITool,
  type TaskOverrides,
  type EffectiveTask,
} from '@/lib/templates/types';

// ─── Task detail sections (mirrors AutoAnimation TEXT_SECTIONS shape) ────────

const TASK_SECTIONS: readonly SectionDef[] = [
  { id: 'details', icon: FileText, label: 'Details' },
  { id: 'tools',   icon: Wrench,   label: 'AI Tools' },
  { id: 'context', icon: Info,     label: 'Context' },
] as const;

type TaskSectionId = (typeof TASK_SECTIONS)[number]['id'];

// ─── AI tool display info ─────────────────────────────────────────────────────

const AI_TOOL_INFO: Record<AITool, { name: string; desc: string; iconColor: string; bgColor: string }> = {
  claude:     { name: 'Claude',     desc: 'AI code, logic & narrative', iconColor: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  pixellab:   { name: 'PixelLab',   desc: 'Pixel art & sprites',        iconColor: 'text-pink-400',   bgColor: 'bg-pink-500/10'   },
  meshy:      { name: 'Meshy',      desc: '3D model generation',        iconColor: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  suno:       { name: 'Suno',       desc: 'Background music',           iconColor: 'text-green-400',  bgColor: 'bg-green-500/10'  },
  elevenlabs: { name: 'ElevenLabs', desc: 'Voice & sound effects',      iconColor: 'text-blue-400',   bgColor: 'bg-blue-500/10'   },
  freepik:    { name: 'Freepik',    desc: 'Stock art & textures',       iconColor: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
};

const AI_TOOL_OPTIONS: { value: AITool; label: string }[] = [
  { value: 'claude',     label: 'Claude — AI code, logic & narrative' },
  { value: 'pixellab',   label: 'PixelLab — Pixel art & sprites' },
  { value: 'meshy',      label: 'Meshy — 3D model generation' },
  { value: 'suno',       label: 'Suno — Background music' },
  { value: 'elevenlabs', label: 'ElevenLabs — Voice & sound effects' },
  { value: 'freepik',    label: 'Freepik — Stock art & textures' },
];

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: 'designer',   label: 'Designer' },
  { value: 'artist',     label: 'Artist' },
  { value: 'programmer', label: 'Programmer' },
  { value: 'audio',      label: 'Audio' },
  { value: 'producer',   label: 'Producer' },
  { value: 'any',        label: 'Any' },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review',      label: 'Review' },
  { value: 'done',        label: 'Done' },
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  blocked:     'Blocked',
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
};

const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

function nextStatus(s: TaskStatus): TaskStatus {
  if (s === 'blocked') return s;
  const idx = STATUS_CYCLE.indexOf(s);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskDetailPanelProps {
  templateTaskId: string;
  template: Template;
  board: ProjectBoard;
}

// ─── Section: Details — title, status, description, deliverable, role, hours ─

function DetailsSection({
  effective,
  status,
  onStatusChange,
  onFieldChange,
}: {
  effective: EffectiveTask;
  status: TaskStatus;
  onStatusChange: (s: TaskStatus) => void;
  onFieldChange: <K extends keyof TaskOverrides>(field: K, value: TaskOverrides[K]) => void;
}) {
  const isBlocked = status === 'blocked';

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <PanelSection title="Title" collapsible>
        <PanelInput
          value={effective.title}
          onChange={(v) => onFieldChange('title', v)}
          placeholder="Task title"
          fullWidth
        />
      </PanelSection>

      <PanelSection title="Status" collapsible>
        {isBlocked ? (
          <div className="text-[11px] text-zinc-500 bg-zinc-800/60 rounded-lg px-3 py-2.5">
            This task is blocked by unfinished dependencies.
          </div>
        ) : (
          <PanelSelect
            value={status}
            onChange={(v) => onStatusChange(v as TaskStatus)}
            options={STATUS_OPTIONS}
            fullWidth
          />
        )}
      </PanelSection>

      <PanelSection title="Description" collapsible>
        <PanelTextarea
          value={effective.description}
          onChange={(v) => onFieldChange('description', v)}
          placeholder="What is this task about?"
          rows={4}
          showCount
        />
      </PanelSection>

      <PanelSection title="Deliverable" icon={Package} collapsible>
        <PanelTextarea
          value={effective.deliverable}
          onChange={(v) => onFieldChange('deliverable', v)}
          placeholder="What must exist when this task is done?"
          rows={3}
        />
      </PanelSection>

      <PanelSection title="Role" collapsible>
        <PanelSelect
          value={effective.role}
          onChange={(v) => onFieldChange('role', v as TeamRole)}
          options={ROLE_OPTIONS}
          fullWidth
        />
      </PanelSection>

      <PanelSection title="Estimated hours" collapsible noBorder>
        <PanelSlider
          label="Hours"
          value={effective.estimatedHours}
          onChange={(v) => onFieldChange('estimatedHours', v)}
          min={1}
          max={100}
          step={1}
          suffix="h"
        />
      </PanelSection>
    </div>
  );
}

// ─── Section: AI Tools — multi-select picker + color-coded preview list ──────

function ToolsSection({
  tools,
  onToolsChange,
}: {
  tools: AITool[];
  onToolsChange: (next: AITool[]) => void;
}) {
  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <PanelSection title="AI Tools" badge={tools.length} collapsible>
        <PanelMultiSelect
          options={AI_TOOL_OPTIONS}
          value={tools}
          onChange={(ids) => onToolsChange(ids as AITool[])}
          placeholder="No tools selected"
          emptyMessage="No tools available"
        />
      </PanelSection>

      {tools.length > 0 && (
        <PanelSection title="Preview" collapsible noBorder>
          <div className="space-y-2">
            {tools.map((tool) => {
              const info = AI_TOOL_INFO[tool];
              return (
                <div
                  key={tool}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg', info.bgColor)}
                >
                  <span className={cn('text-xs font-semibold w-20 shrink-0', info.iconColor)}>
                    {info.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 leading-tight">{info.desc}</span>
                </div>
              );
            })}
          </div>
        </PanelSection>
      )}
    </div>
  );
}

// ─── Section: Context — tip, industry example, dependencies ─────────────────

function ContextSection({
  effective,
  blockedByTitles,
  onFieldChange,
}: {
  effective: EffectiveTask;
  blockedByTitles: string[];
  onFieldChange: <K extends keyof TaskOverrides>(field: K, value: TaskOverrides[K]) => void;
}) {
  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <PanelSection title="What is this?" icon={Lightbulb} collapsible>
        <PanelTextarea
          value={effective.tip}
          onChange={(v) => onFieldChange('tip', v)}
          placeholder="Teaching note or explanation"
          rows={4}
          showCount
        />
      </PanelSection>

      <PanelSection title="Real studio example" icon={BookOpen} collapsible>
        <PanelTextarea
          value={effective.exampleFromIndustry ?? ''}
          onChange={(v) => onFieldChange('exampleFromIndustry', v || undefined)}
          placeholder="How a real studio would approach this"
          rows={3}
        />
      </PanelSection>

      {blockedByTitles.length > 0 && (
        <PanelSection
          title="Requires"
          badge={blockedByTitles.length}
          collapsible
          noBorder
        >
          <div className="space-y-1.5">
            {blockedByTitles.map((title) => (
              <div key={title} className="text-[11px] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                {title}
              </div>
            ))}
          </div>
        </PanelSection>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskDetailPanel({ templateTaskId, template, board }: TaskDetailPanelProps) {
  const updateTaskStatus = useProjectBoard((s) => s.updateTaskStatus);
  const setTaskOverride  = useProjectBoard((s) => s.setTaskOverride);
  const [activeSection, setActiveSection] = useState<TaskSectionId>('details');

  // Find template task
  const templateTask = template.milestones
    .flatMap((m) => m.tasks)
    .find((t) => t.id === templateTaskId);

  // Find live instance
  const taskInstance = board.milestones
    .flatMap((m) => m.tasks)
    .find((t) => t.templateTaskId === templateTaskId);
  const milestoneInstance = board.milestones.find((m) => m.id === taskInstance?.milestoneInstanceId);
  const isActive = milestoneInstance?.id === board.activeMilestoneId;

  // Merged template + overrides view — always use this for display fields
  const effective = useMemo(
    () => (templateTask ? resolveEffectiveTask(templateTask, taskInstance?.overrides) : null),
    [templateTask, taskInstance?.overrides],
  );

  // Resolve blockedBy titles before early return so hook order stays stable.
  // Also use each dependency's effective title so overrides flow through.
  const blockedByTitles = useMemo(() => {
    if (!templateTask) return [];
    return templateTask.blockedBy
      .map((depId) => {
        const dep = template.milestones.flatMap((m) => m.tasks).find((t) => t.id === depId);
        if (!dep) return null;
        const depInstance = board.milestones
          .flatMap((m) => m.tasks)
          .find((t) => t.templateTaskId === dep.id);
        return resolveEffectiveTask(dep, depInstance?.overrides).title;
      })
      .filter((v): v is string => typeof v === 'string');
  }, [templateTask, template, board]);

  if (!templateTask || !effective) return null;

  const status = taskInstance?.status ?? 'blocked';
  const isBlocked = status === 'blocked';
  const canAdvance = isActive && !isBlocked && status !== 'done';

  const activeIndex = TASK_SECTIONS.findIndex((s) => s.id === activeSection);

  const handleStatusChange = (s: TaskStatus) => {
    if (taskInstance) updateTaskStatus(taskInstance.id, s);
  };

  const handleAdvance = () => {
    if (taskInstance) updateTaskStatus(taskInstance.id, nextStatus(status));
  };

  const handleFieldChange = <K extends keyof TaskOverrides>(
    field: K,
    value: TaskOverrides[K],
  ) => {
    if (taskInstance) {
      setTaskOverride(taskInstance.id, { [field]: value } as Partial<TaskOverrides>);
    }
  };

  const handleToolsChange = (next: AITool[]) => {
    if (taskInstance) setTaskOverride(taskInstance.id, { aiTools: next });
  };

  return (
    <aside className="w-full md:w-[280px] flex-shrink-0 h-full flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Header — DropdownSectionHeader only. No close button; re-click the
          kanban card to deselect (matches AutoAnimation's implicit-selection
          pattern — the right panel never has its own close affordance). */}
      <div className="shrink-0 border-b border-white/5">
        <DropdownSectionHeader
          sections={TASK_SECTIONS}
          activeIndex={activeIndex}
          onSelect={(i) => setActiveSection(TASK_SECTIONS[i].id as TaskSectionId)}
        />
      </div>

      {/* Content area — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <PanelErrorBoundary key={activeSection} panelName={`Task ${activeSection}`}>
          {activeSection === 'details' && (
            <DetailsSection
              effective={effective}
              status={status}
              onStatusChange={handleStatusChange}
              onFieldChange={handleFieldChange}
            />
          )}
          {activeSection === 'tools' && (
            <ToolsSection tools={effective.aiTools} onToolsChange={handleToolsChange} />
          )}
          {activeSection === 'context' && (
            <ContextSection
              effective={effective}
              blockedByTitles={blockedByTitles}
              onFieldChange={handleFieldChange}
            />
          )}
        </PanelErrorBoundary>
      </div>

      {/* Sticky footer — primary action pinned to bottom */}
      <div className="shrink-0 px-4 py-3 border-t border-white/5">
        <PanelActionButton
          variant="accent"
          fullWidth
          onClick={handleAdvance}
          disabled={!canAdvance}
        >
          {isBlocked
            ? 'Blocked'
            : status === 'done'
              ? 'Completed'
              : `Mark ${STATUS_LABEL[nextStatus(status)]}`}
        </PanelActionButton>
      </div>
    </aside>
  );
}
