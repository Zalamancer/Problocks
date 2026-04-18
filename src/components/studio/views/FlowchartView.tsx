'use client';
import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  PanOnScrollMode,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { Lock, Check, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio, type FlowDirection } from '@/store/studio-store';
import { Pill } from '@/components/ui';
import {
  resolveEffectiveTask,
  type Template,
  type ProjectBoard,
  type TaskStatus,
  type AITool,
} from '@/lib/templates/types';

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
  flowDirection: FlowDirection
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

      <Handle
        type="target"
        position={d.flowDirection === 'TB' ? Position.Top : Position.Left}
        className={cn(
          '!w-2 !h-2 !bg-zinc-700 !border-zinc-500',
          d.flowDirection === 'TB' ? '!-top-1' : '!-left-1',
        )}
      />
      <Handle
        type="source"
        position={d.flowDirection === 'TB' ? Position.Bottom : Position.Right}
        className={cn(
          '!w-2 !h-2 !bg-zinc-700 !border-zinc-500',
          d.flowDirection === 'TB' ? '!-bottom-1' : '!-right-1',
        )}
      />
    </div>
  )
}

const NODE_TYPES = { task: TaskNodeComponent }

// ─── Layout with dagre ────────────────────────────────────────────────────────

const NODE_W = 176
const NODE_H = 110

function applyDagreLayout(nodes: TaskNode[], edges: Edge[], direction: FlowDirection): TaskNode[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 40, ranksep: 80 })

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }))
  edges.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    return { ...n, position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } }
  })
}

// ─── Adapter: template + board → nodes + edges ────────────────────────────────

function buildFlowGraph(template: Template, board: ProjectBoard, direction: FlowDirection): { nodes: TaskNode[]; edges: Edge[] } {
  const nodes: TaskNode[] = []
  const edges: Edge[] = []

  const activeMilestoneInstance = board.milestones.find((m) => m.id === board.activeMilestoneId)

  for (const mt of template.milestones) {
    const instance = board.milestones.find((m) => m.templateMilestoneId === mt.id)
    const isActive = instance?.id === board.activeMilestoneId

    for (const tt of mt.tasks) {
      const taskInstance = instance?.tasks.find((t) => t.templateTaskId === tt.id)
      const status: TaskStatus = taskInstance?.status ?? 'blocked'

      // Merge template defaults with per-instance overrides so edits in the
      // right panel flow into the flowchart nodes.
      const eff = resolveEffectiveTask(tt, taskInstance?.overrides)

      nodes.push({
        id: tt.id,
        type: 'task',
        position: { x: 0, y: 0 },
        data: {
          title: eff.title,
          status,
          role: eff.role,
          aiTools: eff.aiTools,
          milestoneColor: mt.color,
          milestoneName: mt.name,
          taskInstanceId: taskInstance?.id ?? '',
          isActiveColumn: isActive,
          flowDirection: direction,
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

  return { nodes: applyDagreLayout(nodes, edges, direction), edges }
}

// ─── FlowchartView ────────────────────────────────────────────────────────────

interface FlowchartViewProps {
  template: Template
  board: ProjectBoard
  onTaskClick: (templateTaskId: string) => void
}

export function FlowchartView({ template, board, onTaskClick }: FlowchartViewProps) {
  const theme = useStudio((s) => s.theme)
  const flowDirection = useStudio((s) => s.flowDirection)
  const isLight = theme === 'light'

  const graph = useMemo(
    () => buildFlowGraph(template, board, flowDirection),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template.id, board.activeMilestoneId, flowDirection, JSON.stringify(board.milestones.map((m) => m.tasks.map((t) => t.status)))],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes)
  const [edges, , onEdgesChange] = useEdgesState(graph.edges)

  // Re-layout when board topology changes
  useEffect(() => { setNodes(graph.nodes) }, [graph.nodes, setNodes])

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onTaskClick(node.id)
  }, [onTaskClick])

  const nodeCount = nodes.length
  const edgeCount = edges.length
  const allResolved = nodes.every((n) => {
    const s = (n.data as TaskNodeData).status
    return s !== 'blocked'
  })

  return (
    <div className="w-full h-full relative">
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
        zoomOnScroll={false}
        panOnScroll
        panOnScrollMode={flowDirection === 'TB' ? PanOnScrollMode.Vertical : PanOnScrollMode.Horizontal}
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

      {/* Canvas chrome — ported from /tmp/design_bundle/problocks/project/studio/canvas.jsx
          Graph-status pill (left) + zoom/grid cluster (right). Sits on top of the
          React Flow surface with pointer-events none on the wrapper so scroll/pan
          still works, but each chip re-enables pointer-events for its clickable area. */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          zIndex: 5,
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
            padding: '6px 8px',
            borderRadius: 10,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            boxShadow: '0 1px 0 var(--pb-line-2)',
            pointerEvents: 'auto',
          }}
        >
          <Pill tone={allResolved ? 'mint' : 'butter'} icon={Check}>
            {allResolved ? 'Graph valid' : 'In progress'}
          </Pill>
          <span style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>
            {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'} · {edgeCount} {edgeCount === 1 ? 'wire' : 'wires'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            padding: 4,
            borderRadius: 10,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            pointerEvents: 'auto',
          }}
        >
          {[
            { icon: ZoomOut,  label: 'Zoom out' },
            { icon: Grid3x3,  label: 'Grid'     },
            { icon: ZoomIn,   label: 'Zoom in'  },
          ].map(({ icon: I, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--pb-ink-soft)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pb-cream-2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <I size={14} strokeWidth={2.2} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
