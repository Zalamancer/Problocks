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

// AI tool → design-bundle tone (NODE_TONES in atoms.jsx). Each tool gets its
// own pastel header so the canvas reads the same as the design screenshot.
const TOOL_TONE: Record<AITool, { bg: string; ink: string; label: string }> = {
  claude:     { bg: 'var(--pb-grape)',  ink: 'var(--pb-grape-ink)',  label: 'CLAUDE'     },
  pixellab:   { bg: 'var(--pb-pink)',   ink: 'var(--pb-pink-ink)',   label: 'PIXELLAB'   },
  suno:       { bg: 'var(--pb-mint)',   ink: 'var(--pb-mint-ink)',   label: 'SUNO'       },
  elevenlabs: { bg: 'var(--pb-butter)', ink: 'var(--pb-butter-ink)', label: 'ELEVENLABS' },
  freepik:    { bg: 'var(--pb-coral)',  ink: 'var(--pb-coral-ink)',  label: 'FREEPIK'    },
  meshy:      { bg: 'var(--pb-sky)',    ink: 'var(--pb-sky-ink)',    label: 'MESHY'      },
}

// Fallback tone for tasks without an AI tool: coral = prompt/design step.
const PROMPT_TONE = { bg: 'var(--pb-coral)', ink: 'var(--pb-coral-ink)', label: 'DESIGN' }

const STATUS_LABEL: Record<TaskStatus, string> = {
  blocked:     'Blocked',
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
}

// Status → mint/butter/coral status pill color.
const STATUS_TONE: Record<TaskStatus, { bg: string; ink: string }> = {
  blocked:     { bg: 'var(--pb-paper)',  ink: 'var(--pb-ink-muted)'  },
  todo:        { bg: 'var(--pb-paper)',  ink: 'var(--pb-ink-soft)'   },
  in_progress: { bg: 'var(--pb-butter)', ink: 'var(--pb-butter-ink)' },
  review:      { bg: 'var(--pb-sky)',    ink: 'var(--pb-sky-ink)'    },
  done:        { bg: 'var(--pb-mint)',   ink: 'var(--pb-mint-ink)'   },
}

// ─── Custom Task Node ─────────────────────────────────────────────────────────
// Ported from /tmp/design_bundle/problocks/project/studio/canvas.jsx → NodeCard:
// colored pastel header with 1.5px ink border-bottom + uppercase label, paper
// body, chunky stacked drop shadow (0 2px 0 <ink>). Selected state thickens
// the shadow (0 4px 0 ink) and adds a 24px soft drop for lift.

function TaskNodeComponent({ data, selected }: NodeProps) {
  const d = data as TaskNodeData
  const isBlocked = d.status === 'blocked'
  const isDone = d.status === 'done'
  const primaryTool = d.aiTools[0]
  const tone = primaryTool ? TOOL_TONE[primaryTool] : PROMPT_TONE
  const statusTone = STATUS_TONE[d.status]

  return (
    <div
      style={{
        width: 200,
        background: 'var(--pb-paper)',
        color: 'var(--pb-ink)',
        border: `1.5px solid ${selected ? tone.ink : 'var(--pb-line-2)'}`,
        borderRadius: 14,
        boxShadow: selected
          ? `0 4px 0 ${tone.ink}, 0 8px 24px rgba(29,26,20,0.14)`
          : `0 2px 0 var(--pb-line-2)`,
        overflow: 'hidden',
        opacity: isBlocked ? 0.55 : 1,
        cursor: d.isActiveColumn && !isBlocked ? 'pointer' : 'default',
        transition: 'box-shadow 120ms ease, border-color 120ms ease',
      }}
    >
      {/* Colored header: pastel bg, ink text, uppercase label, 1.5px ink border-bottom */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 10px',
          background: tone.bg,
          color: tone.ink,
          borderBottom: `1.5px solid ${tone.ink}`,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {tone.label}
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            opacity: 0.65,
          }}
          title={d.milestoneName}
        >
          {d.milestoneName}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '9px 11px 10px' }}>
        <div className="flex items-start gap-1.5">
          {isBlocked && <Lock size={10} style={{ flexShrink: 0, color: 'var(--pb-ink-muted)', marginTop: 2 }} />}
          {isDone && <Check size={10} style={{ flexShrink: 0, color: 'var(--pb-mint-ink)', marginTop: 2 }} />}
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--pb-ink)',
              lineHeight: 1.3,
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          >
            {d.title}
          </div>
        </div>

        {/* Status + secondary AI tool dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 7px',
              borderRadius: 999,
              background: statusTone.bg,
              color: statusTone.ink,
              border: `1px solid ${statusTone.ink}`,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {STATUS_LABEL[d.status]}
          </span>
          {d.aiTools.length > 1 && (
            <div style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
              {(d.aiTools as AITool[]).slice(1).map((tool) => (
                <span
                  key={tool}
                  title={tool}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: TOOL_TONE[tool].bg,
                    border: `1px solid ${TOOL_TONE[tool].ink}`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Handles — styled as chunky ink-bordered dots to match design's connector dots */}
      <Handle
        type="target"
        position={d.flowDirection === 'TB' ? Position.Top : Position.Left}
        className={cn(
          d.flowDirection === 'TB' ? '!-top-1.5' : '!-left-1.5',
        )}
        style={{
          width: 12,
          height: 12,
          background: 'var(--pb-paper)',
          border: `2px solid ${tone.ink}`,
        }}
      />
      <Handle
        type="source"
        position={d.flowDirection === 'TB' ? Position.Bottom : Position.Right}
        className={cn(
          d.flowDirection === 'TB' ? '!-bottom-1.5' : '!-right-1.5',
        )}
        style={{
          width: 12,
          height: 12,
          background: 'var(--pb-paper)',
          border: `2px solid ${tone.ink}`,
        }}
      />
    </div>
  )
}

const NODE_TYPES = { task: TaskNodeComponent }

// ─── Layout with dagre ────────────────────────────────────────────────────────

const NODE_W = 200
const NODE_H = 118

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
        colorMode={theme === 'cream' ? 'light' : theme}
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
          {([
            { icon: ZoomOut,  label: 'Zoom out' },
            { icon: Grid3x3,  label: 'Grid'     },
            { icon: ZoomIn,   label: 'Zoom in'  },
          ] as const).map(({ icon: I, label }) => (
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

      {/* Pipeline legend — ported from canvas.jsx legend strip. Shows the six
          AI-tool tones as pastel pills in the bottom-left of the canvas. */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 3,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          maxWidth: 420,
          pointerEvents: 'none',
        }}
      >
        {([
          { tone: 'grape',  label: 'Claude'     },
          { tone: 'pink',   label: 'PixelLab'   },
          { tone: 'sky',    label: 'Meshy'      },
          { tone: 'mint',   label: 'Suno'       },
          { tone: 'butter', label: 'ElevenLabs' },
          { tone: 'ink',    label: 'Game'       },
        ] as const).map((p) => (
          <Pill key={p.label} tone={p.tone} style={{ pointerEvents: 'auto' }}>
            {p.label}
          </Pill>
        ))}
      </div>
    </div>
  )
}
