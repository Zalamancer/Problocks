'use client';
import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio } from '@/store/studio-store';
import type { Template, ProjectBoard, TaskStatus, AITool } from '@/lib/templates/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskNodeData {
  title: string
  status: TaskStatus
  role: string
  aiTools: AITool[]
  milestoneColor: string
  milestoneName: string
  taskInstanceId: string
  isActiveColumn: boolean
  [key: string]: unknown
}

type TaskNode = Node<TaskNodeData, 'task'>

const AI_TOOL_DOT: Record<AITool, string> = {
  claude:     'bg-purple-400',
  pixellab:   'bg-pink-400',
  suno:       'bg-green-400',
  elevenlabs: 'bg-blue-400',
  freepik:    'bg-yellow-400',
  meshy:      'bg-orange-400',
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  blocked:     'text-zinc-600',
  todo:        'text-zinc-400',
  in_progress: 'text-blue-400',
  review:      'text-amber-400',
  done:        'text-green-400',
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  blocked:     'Blocked',
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
}

// ─── Custom Task Node ─────────────────────────────────────────────────────────

function TaskNodeComponent({ data }: NodeProps) {
  const d = data as TaskNodeData
  const isBlocked = d.status === 'blocked'
  const isDone = d.status === 'done'

  return (
    <div
      className={cn(
        'w-44 bg-zinc-900 border rounded-xl overflow-hidden shadow-xl transition-all duration-150',
        isBlocked ? 'border-white/[0.04] opacity-50' : 'border-white/[0.10]',
        isDone && 'opacity-60',
        d.isActiveColumn && !isBlocked && 'cursor-pointer hover:border-white/20',
      )}
    >
      {/* Milestone color bar */}
      <div className="h-[3px]" style={{ backgroundColor: d.milestoneColor }} />

      {/* Milestone label */}
      <div className="px-3 pt-2 pb-0">
        <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: d.milestoneColor }}>
          {d.milestoneName}
        </span>
      </div>

      {/* Title */}
      <div className="px-3 pt-1 pb-2">
        <div className="flex items-start gap-1.5">
          {isBlocked && <Lock size={10} className="flex-shrink-0 text-zinc-600 mt-0.5" />}
          {isDone && <Check size={10} className="flex-shrink-0 text-green-500 mt-0.5" />}
          <span className={cn(
            'text-[11px] font-medium text-zinc-200 leading-snug',
            isDone && 'line-through text-zinc-500',
          )}>
            {d.title}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-2.5 flex items-center gap-1.5">
        <span className={cn('text-[9px] font-medium', STATUS_COLOR[d.status])}>
          {STATUS_LABEL[d.status]}
        </span>
        {d.aiTools.length > 0 && (
          <div className="flex gap-1 ml-auto">
            {(d.aiTools as AITool[]).map((tool) => (
              <span key={tool} title={tool} className={cn('w-1.5 h-1.5 rounded-full', AI_TOOL_DOT[tool])} />
            ))}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-zinc-700 !border-zinc-500 !-left-1" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-zinc-700 !border-zinc-500 !-right-1" />
    </div>
  )
}

const NODE_TYPES = { task: TaskNodeComponent }

// ─── Layout with dagre ────────────────────────────────────────────────────────

const NODE_W = 176
const NODE_H = 110

function applyDagreLayout(nodes: TaskNode[], edges: Edge[]): TaskNode[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 })

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }))
  edges.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    return { ...n, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } }
  })
}

// ─── Adapter: template + board → nodes + edges ────────────────────────────────

function buildFlowGraph(template: Template, board: ProjectBoard): { nodes: TaskNode[]; edges: Edge[] } {
  const nodes: TaskNode[] = []
  const edges: Edge[] = []

  const activeMilestoneInstance = board.milestones.find((m) => m.id === board.activeMilestoneId)

  for (const mt of template.milestones) {
    const instance = board.milestones.find((m) => m.templateMilestoneId === mt.id)
    const isActive = instance?.id === board.activeMilestoneId

    for (const tt of mt.tasks) {
      const taskInstance = instance?.tasks.find((t) => t.templateTaskId === tt.id)
      const status: TaskStatus = taskInstance?.status ?? 'blocked'

      nodes.push({
        id: tt.id,
        type: 'task',
        position: { x: 0, y: 0 },
        data: {
          title: tt.title,
          status,
          role: tt.role,
          aiTools: tt.aiTools,
          milestoneColor: mt.color,
          milestoneName: mt.name,
          taskInstanceId: taskInstance?.id ?? '',
          isActiveColumn: isActive,
        },
      })

      // Dependency edges: blockedBy → this task
      for (const depId of tt.blockedBy) {
        const isActiveDep = status === 'blocked'
        edges.push({
          id: `${depId}->${tt.id}`,
          source: depId,
          target: tt.id,
          style: {
            stroke: isActiveDep ? '#52525b' : '#22c55e',
            strokeWidth: 1.5,
            opacity: isActiveDep ? 0.4 : 0.7,
          },
          animated: status === 'in_progress',
        })
      }
    }
  }

  return { nodes: applyDagreLayout(nodes, edges), edges }
}

// ─── FlowchartView ────────────────────────────────────────────────────────────

interface FlowchartViewProps {
  template: Template
  board: ProjectBoard
  onTaskClick: (templateTaskId: string) => void
}

export function FlowchartView({ template, board, onTaskClick }: FlowchartViewProps) {
  const theme = useStudio((s) => s.theme)
  const isLight = theme === 'light'

  const graph = useMemo(
    () => buildFlowGraph(template, board),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template.id, board.activeMilestoneId, JSON.stringify(board.milestones.map((m) => m.tasks.map((t) => t.status)))],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes)
  const [edges, , onEdgesChange] = useEdgesState(graph.edges)

  // Re-layout when board topology changes
  useEffect(() => { setNodes(graph.nodes) }, [graph.nodes, setNodes])

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onTaskClick(node.id)
  }, [onTaskClick])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode={theme}
        nodesConnectable={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color={isLight ? '#c4c4c4' : '#3f3f46'}
        />
        <Controls style={{
          background: isLight ? '#ffffff' : '#18181b',
          border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
        }} />
      </ReactFlow>
    </div>
  )
}
