'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { TopMenuBar } from './TopMenuBar';
import { LeftPanel, LeftPanelToggle } from './LeftPanel';
import { OnboardingWizard } from './modals/OnboardingWizard';
import { TimelineBar } from './views/TimelineBar';
import { KanbanView } from './views/KanbanView';
import { FlowchartView } from './views/FlowchartView';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import { useProjectBoard } from '@/store/project-board-store';
import { getTemplate } from '@/lib/templates';
import { TaskDetailPanel } from './panels/TaskDetailPanel';
import type { TemplateId } from '@/lib/templates/types';

type ViewMode = 'canvas' | 'kanban';

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Sparkles size={24} className="text-accent" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Start a new game project</h2>
        <p className="text-sm text-zinc-500 max-w-xs">
          Pick a workflow template and we'll set up your milestones, tasks, and AI tools automatically.
        </p>
      </div>
      <button
        onClick={onStart}
        className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Choose a template
      </button>
    </div>
  );
}

export function StudioLayout() {
  useThemeEffect();
  const { board } = useProjectBoard();
  const [wizardOpen, setWizardOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const template = board ? getTemplate(board.templateId) : null;

  function handleWizardComplete(_templateId: TemplateId) {
    setWizardOpen(false);
    setViewMode('kanban');
  }

  // Clicking the same task again deselects it — matches AutoAnimation's
  // implicit-selection pattern (no close button; you "close" by clicking
  // elsewhere or re-clicking the selected item).
  function handleTaskClick(templateTaskId: string) {
    setSelectedTaskId((prev) => (prev === templateTaskId ? null : templateTaskId));
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 overflow-hidden text-zinc-100 font-sans p-1.5 gap-1.5">
      <TopMenuBar />

      <div className="flex-1 relative min-h-0">
        <div className="h-full flex overflow-hidden gap-1.5">
          <LeftPanel />

          {/* Center — relative container so the task panel can overlay */}
          <div className="flex-1 relative flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden min-w-0">

            {/* View toggle — only when board exists */}
            {board && (
              <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.05] shrink-0">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'kanban' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => setViewMode('canvas')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'canvas' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Graph
                </button>
                <span className="ml-auto text-xs text-zinc-600">{template?.name}</span>
              </div>
            )}

            {/* Main view */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {!board ? (
                <EmptyState onStart={() => setWizardOpen(true)} />
              ) : viewMode === 'canvas' ? (
                <FlowchartView template={template!} board={board} onTaskClick={handleTaskClick} />
              ) : (
                <KanbanView template={template!} board={board} onTaskClick={handleTaskClick} />
              )}
            </div>

            {/* Timeline bar */}
            {board && template && (
              <TimelineBar
                template={template}
                board={board}
                activeMilestoneId={board.activeMilestoneId}
                onMilestoneClick={setActiveMilestoneId}
              />
            )}

          </div>

          {/* Right panel — task detail, same glass shell as left panel */}
          {board && template && selectedTaskId && (
            <TaskDetailPanel
              templateTaskId={selectedTaskId}
              template={template}
              board={board}
            />
          )}
        </div>

        <LeftPanelToggle />
      </div>

      <OnboardingWizard
        open={wizardOpen && !board}
        onComplete={handleWizardComplete}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
