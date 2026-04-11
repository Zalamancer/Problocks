'use client';
import { useState, useMemo } from 'react';
import {
  X,
  Clock,
  User,
  Lightbulb,
  BookOpen,
  Package,
  Wrench,
  FileText,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectBoard } from '@/store/project-board-store';
import { PanelSection, PanelActionButton, PanelButtonGroup } from '@/components/ui/panel-controls';
import { PanelErrorBoundary } from '@/components/PanelErrorBoundary';
import { DropdownSectionHeader, type SectionDef } from './DropdownSectionHeader';
import type { Template, ProjectBoard, TaskStatus, AITool } from '@/lib/templates/types';

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

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'Active' },
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
  onClose: () => void;
}

// ─── Section: Details ────────────────────────────────────────────────────────

function DetailsSection({
  description,
  deliverable,
  role,
  estimatedHours,
  status,
  canAdvance,
  onStatusChange,
  onAdvance,
}: {
  description: string;
  deliverable: string;
  role: string;
  estimatedHours: number;
  status: TaskStatus;
  canAdvance: boolean;
  onStatusChange: (s: TaskStatus) => void;
  onAdvance: () => void;
}) {
  const isBlocked = status === 'blocked';

  return (
    <div className="px-3 pt-3">
      <PanelSection title="Status">
        {isBlocked ? (
          <div className="text-[11px] text-zinc-500 bg-zinc-800/60 rounded-lg px-2.5 py-2">
            This task is blocked by unfinished dependencies.
          </div>
        ) : (
          <>
            <PanelButtonGroup
              options={STATUS_OPTIONS}
              value={status}
              onChange={(v) => onStatusChange(v as TaskStatus)}
            />
            {canAdvance && status !== 'done' && (
              <div className="mt-2">
                <PanelActionButton
                  variant="accent"
                  fullWidth
                  size="sm"
                  onClick={onAdvance}
                >
                  Mark {STATUS_LABEL[nextStatus(status)]}
                </PanelActionButton>
              </div>
            )}
          </>
        )}
      </PanelSection>

      <PanelSection title="Description">
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </PanelSection>

      <PanelSection title="Deliverable" icon={Package}>
        <p className="text-xs text-zinc-300 leading-relaxed">{deliverable}</p>
      </PanelSection>

      <PanelSection title="Assignment" noBorder>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <User size={11} className="text-zinc-600" />
            <span className="text-xs text-zinc-400 capitalize">{role}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-zinc-600" />
            <span className="text-xs text-zinc-400">~{estimatedHours}h</span>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

// ─── Section: AI Tools ───────────────────────────────────────────────────────

function ToolsSection({ tools }: { tools: AITool[] }) {
  if (tools.length === 0) {
    return (
      <div className="px-3 pt-3">
        <PanelSection title="AI Tools" noBorder>
          <p className="text-xs text-zinc-500 italic">No AI tools required for this task.</p>
        </PanelSection>
      </div>
    );
  }

  return (
    <div className="px-3 pt-3">
      <PanelSection title="AI Tools" badge={tools.length} noBorder>
        <div className="space-y-1.5">
          {tools.map((tool) => {
            const info = AI_TOOL_INFO[tool];
            return (
              <div
                key={tool}
                className={cn('flex items-center gap-2.5 px-2.5 py-2 rounded-lg', info.bgColor)}
              >
                <span className={cn('text-xs font-semibold w-20 shrink-0', info.iconColor)}>
                  {info.name}
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">{info.desc}</span>
              </div>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
}

// ─── Section: Context ────────────────────────────────────────────────────────

function ContextSection({
  tip,
  exampleFromIndustry,
  blockedByTitles,
}: {
  tip: string;
  exampleFromIndustry?: string;
  blockedByTitles: string[];
}) {
  return (
    <div className="px-3 pt-3">
      <PanelSection title="What is this?" icon={Lightbulb}>
        <p className="text-xs text-zinc-400 leading-relaxed">{tip}</p>
      </PanelSection>

      {exampleFromIndustry && (
        <PanelSection title="Real studio example" icon={BookOpen}>
          <p className="text-xs text-zinc-500 leading-relaxed italic">{exampleFromIndustry}</p>
        </PanelSection>
      )}

      {blockedByTitles.length > 0 && (
        <PanelSection title="Requires" badge={blockedByTitles.length} noBorder>
          <div className="space-y-1">
            {blockedByTitles.map((title) => (
              <div key={title} className="text-[11px] text-zinc-500 flex items-center gap-1.5">
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

export function TaskDetailPanel({ templateTaskId, template, board, onClose }: TaskDetailPanelProps) {
  const { updateTaskStatus } = useProjectBoard();
  const [activeSection, setActiveSection] = useState<TaskSectionId>('details');

  // Find template task
  const templateTask = template.milestones.flatMap((m) => m.tasks).find((t) => t.id === templateTaskId);
  const milestone = template.milestones.find((m) => m.tasks.some((t) => t.id === templateTaskId));

  // Find live instance
  const taskInstance = board.milestones.flatMap((m) => m.tasks).find((t) => t.templateTaskId === templateTaskId);
  const milestoneInstance = board.milestones.find((m) => m.id === taskInstance?.milestoneInstanceId);
  const isActive = milestoneInstance?.id === board.activeMilestoneId;

  // Resolve blockedBy titles before early return so hook order stays stable
  const blockedByTitles = useMemo(() => {
    if (!templateTask) return [];
    return templateTask.blockedBy
      .map((depId) => template.milestones.flatMap((m) => m.tasks).find((t) => t.id === depId)?.title)
      .filter((v): v is string => typeof v === 'string');
  }, [templateTask, template]);

  if (!templateTask || !milestone) return null;

  const status = taskInstance?.status ?? 'blocked';
  const isBlocked = status === 'blocked';
  const canAdvance = isActive && !isBlocked;

  const activeIndex = TASK_SECTIONS.findIndex((s) => s.id === activeSection);

  const handleStatusChange = (s: TaskStatus) => {
    if (taskInstance) updateTaskStatus(taskInstance.id, s);
  };

  const handleAdvance = () => {
    if (taskInstance) updateTaskStatus(taskInstance.id, nextStatus(status));
  };

  return (
    <aside className="w-full md:w-[280px] flex-shrink-0 h-full flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Context row — milestone + task title + close */}
      <div className="shrink-0 flex items-start gap-2 px-3 py-2 border-b border-white/5">
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] font-medium uppercase tracking-wider mb-0.5"
            style={{ color: milestone.color }}
          >
            {milestone.name}
          </div>
          <h3 className="text-[13px] font-semibold text-zinc-100 leading-snug truncate">
            {templateTask.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
          aria-label="Close task details"
        >
          <X size={14} />
        </button>
      </div>

      {/* Dropdown section header — mirrors AutoAnimation DropdownSectionHeader */}
      <div className="shrink-0 border-b border-white/5">
        <DropdownSectionHeader
          sections={TASK_SECTIONS}
          activeIndex={activeIndex}
          onSelect={(i) => setActiveSection(TASK_SECTIONS[i].id as TaskSectionId)}
        />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <PanelErrorBoundary key={activeSection} panelName={`Task ${activeSection}`}>
          {activeSection === 'details' && (
            <DetailsSection
              description={templateTask.description}
              deliverable={templateTask.deliverable}
              role={templateTask.role}
              estimatedHours={templateTask.estimatedHours}
              status={status}
              canAdvance={canAdvance}
              onStatusChange={handleStatusChange}
              onAdvance={handleAdvance}
            />
          )}
          {activeSection === 'tools' && <ToolsSection tools={templateTask.aiTools} />}
          {activeSection === 'context' && (
            <ContextSection
              tip={templateTask.tip}
              exampleFromIndustry={templateTask.exampleFromIndustry}
              blockedByTitles={blockedByTitles}
            />
          )}
        </PanelErrorBoundary>
      </div>
    </aside>
  );
}
