# Flowchart Integration — Displaying Kanban Data as a React Flow DAG

---

## 1. Core Concept

The same task data that powers the kanban board can be rendered as a directed acyclic graph (DAG) flowchart. Each card becomes a node; each `blocks`/`blockedBy` dependency becomes a directed edge.

```
Kanban View:                        Flowchart View:
                                    
 Backlog    To Do    In Progress         ┌────────────┐
 ───────    ─────    ───────────         │ Design UI  │
 │ A   │   │ B  │   │ C       │         │ (done) ✓   │
 │ D   │   │ E  │   │         │         └─────┬──────┘
                                               │ blocks
                                         ┌─────▼──────┐   ┌────────┐
                                         │ Build DnD  │──►│ Tests  │
                                         │ (in prog.) │   │ (todo) │
                                         └────────────┘   └────────┘
```

Both views share the **same Zustand store**. Switching views is a `ui.viewMode` toggle — no data duplication, no synchronization problem.

---

## 2. The Adapter: Cards → React Flow Nodes and Edges

The key insight: never store React Flow node positions in your domain model. Derive nodes and edges from the kanban store at render time. Positions are managed by React Flow's layout algorithm (dagre) and cached in local component state.

### 2.1 Adapter Types

```typescript
import type { Node, Edge } from '@xyflow/react';

// The shape of data attached to each node
export interface TaskNodeData {
  card: KanbanCard;
  columnTitle: string;
  isBlocked: boolean;
  isReady: boolean;
  isOverdue: boolean;
}

// Node and Edge types registered with React Flow
export type TaskNode = Node<TaskNodeData, 'task'>;
export type TaskEdge = Edge<{ dependencyType: CardDependency['type'] }>;
```

### 2.2 Adapter Function

```typescript
import type { KanbanStore } from '@/store/kanban-store';
import type { TaskNode, TaskEdge } from './flowchart-types';

export function buildFlowGraph(
  state: KanbanStore,
  boardId: string
): { nodes: TaskNode[]; edges: TaskEdge[] } {
  const board = state.boards.byId[boardId];
  if (!board) return { nodes: [], edges: [] };

  const nodes: TaskNode[] = [];
  const edges: TaskEdge[] = [];
  const edgeSet = new Set<string>(); // prevent duplicate edges

  for (const cardId of state.cards.allIds) {
    const card = state.cards.byId[cardId];
    if (card.boardId !== boardId) continue;

    const column = state.columns.byId[card.columnId];
    const blocked = isCardBlocked(card, state.cards.byId);
    const ready = isCardReady(card, state.cards.byId);
    const overdue = isCardOverdue(card);

    nodes.push({
      id: cardId,
      type: 'task',
      // Positions start at (0,0) — dagre will recompute them
      position: { x: 0, y: 0 },
      data: {
        card,
        columnTitle: column?.title ?? 'Unknown',
        isBlocked: blocked,
        isReady: ready,
        isOverdue: overdue,
      },
    });

    // Create edges for "blocks" relationships
    for (const targetId of card.blocks) {
      const edgeId = `${cardId}-blocks-${targetId}`;
      if (edgeSet.has(edgeId)) continue;
      edgeSet.add(edgeId);

      const targetCard = state.cards.byId[targetId];
      const isBlockedEdge = targetCard?.status !== 'done';

      edges.push({
        id: edgeId,
        source: cardId,
        target: targetId,
        type: 'dependency',
        data: { dependencyType: 'blocks' },
        // Visual: red animated edge if target is currently blocked
        animated: isBlockedEdge,
        style: {
          stroke: isBlockedEdge ? '#f59e0b' : '#6b7280',
          strokeWidth: isBlockedEdge ? 2 : 1,
        },
        label: isBlockedEdge ? 'blocks' : '',
        markerEnd: { type: 'arrowclosed', color: isBlockedEdge ? '#f59e0b' : '#6b7280' },
      });
    }
  }

  return { nodes, edges };
}
```

---

## 3. Dagre Auto-Layout

Positions need to be computed after nodes are built. Use `dagre` for rank-based automatic layout.

### 3.1 Install

```bash
npm install dagre
npm install -D @types/dagre
```

### 3.2 Layout Function

```typescript
import dagre from 'dagre';
import type { TaskNode, TaskEdge } from './flowchart-types';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

export function applyDagreLayout(
  nodes: TaskNode[],
  edges: TaskEdge[],
  direction: 'TB' | 'LR' = 'TB'
): TaskNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 40,    // horizontal spacing between nodes
    ranksep: 80,    // vertical spacing between ranks
    marginx: 20,
    marginy: 20,
  });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map(node => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        // Dagre centers nodes; React Flow uses top-left — adjust
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      // Handles should point in rank direction
      sourcePosition: direction === 'LR' ? 'right' : 'bottom',
      targetPosition: direction === 'LR' ? 'left' : 'top',
    };
  });
}
```

**Alternative: ELK.js** for more sophisticated layouts (handles large graphs better, supports layered/force-directed):

```bash
npm install elkjs web-worker
```

ELK is async, which means you trigger layout in a `useEffect` and set state when it completes — better for large boards.

---

## 4. Custom Task Node Component

The custom node renders a card as a flowchart box. It receives the `data` field populated by the adapter.

```typescript
// Register the node type
const nodeTypes = {
  task: TaskNodeComponent,
};
```

```tsx
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { TaskNodeData } from './flowchart-types';

export function TaskNodeComponent({ data, selected }: NodeProps<TaskNodeData>) {
  const { card, columnTitle, isBlocked, isReady, isOverdue } = data;

  const statusColor = {
    done: 'border-green-500/50 bg-green-500/5',
    'in-progress': 'border-blue-500/50 bg-blue-500/5',
    'blocked': 'border-amber-500/50 bg-amber-500/5',
    default: 'border-white/[0.08] bg-zinc-800',
  };

  const borderClass = card.status === 'done'
    ? statusColor.done
    : isBlocked
      ? statusColor.blocked
      : card.status === 'in-progress'
        ? statusColor['in-progress']
        : statusColor.default;

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-400',
    medium: 'bg-yellow-400',
    low: 'bg-blue-400',
    none: 'bg-transparent',
  };

  return (
    <>
      {/* Target handle (dependencies come in from top) */}
      <Handle type="target" position={Position.Top} className="!border-zinc-600 !bg-zinc-900" />

      <div
        className={`
          w-[200px] rounded-lg border px-3 py-2.5 cursor-pointer
          transition-all duration-100
          ${borderClass}
          ${selected ? 'ring-2 ring-accent/50 ring-offset-1 ring-offset-zinc-950' : ''}
        `}
      >
        {/* Status column label */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            {columnTitle}
          </span>
          {card.status === 'done' && (
            <CheckCircle2Icon size={10} className="text-green-500" />
          )}
          {isBlocked && (
            <ZapIcon size={10} className="text-amber-400" />
          )}
          {isOverdue && (
            <ClockIcon size={10} className="text-red-400" />
          )}
        </div>

        {/* Priority dot + Title */}
        <div className="flex items-start gap-1.5">
          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[card.priority]}`} />
          <p className="text-xs font-medium text-zinc-200 line-clamp-2 leading-snug">
            {card.title}
          </p>
        </div>

        {/* Assignee avatars */}
        {card.assignees.length > 0 && (
          <div className="flex -space-x-1 mt-1.5">
            {card.assignees.slice(0, 3).map(a => (
              <AssigneeAvatar key={a.id} assignee={a} size="xs" />
            ))}
          </div>
        )}

        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {card.labels.slice(0, 2).map(l => (
              <span
                key={l.id}
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${l.color}25`, color: l.color }}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Source handle (blocks arrows go out from bottom) */}
      <Handle type="source" position={Position.Bottom} className="!border-zinc-600 !bg-zinc-900" />
    </>
  );
}
```

---

## 5. Custom Dependency Edge

```tsx
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  useReactFlow,
} from '@xyflow/react';

interface DependencyEdgeData {
  dependencyType: 'blocks' | 'blocked-by' | 'relates-to';
}

export function DependencyEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
  style,
  markerEnd,
}: EdgeProps<DependencyEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const isBlocking = style?.stroke === '#f59e0b'; // amber = active block

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      {isBlocking && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="bg-amber-500/20 border border-amber-500/30 text-amber-400
                       text-[10px] font-medium px-1.5 py-0.5 rounded-full nodrag nopan"
          >
            blocks
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// Register:
const edgeTypes = {
  dependency: DependencyEdge,
};
```

---

## 6. The Flowchart View Component

```tsx
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo } from 'react';
import { useKanbanStore } from '@/store/kanban-store';
import { buildFlowGraph } from './adapter';
import { applyDagreLayout } from './layout';
import { TaskNodeComponent } from './TaskNode';
import { DependencyEdge } from './DependencyEdge';

const nodeTypes = { task: TaskNodeComponent };
const edgeTypes = { dependency: DependencyEdge };

function FlowchartInner({ boardId }: { boardId: string }) {
  const storeState = useKanbanStore();
  const selectCard = useKanbanStore(s => s.selectCard);

  // Derive graph from store state
  const { nodes: rawNodes, edges: rawEdges } = useMemo(
    () => buildFlowGraph(storeState, boardId),
    // Re-derive when any card or column changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeState.cards.byId, storeState.columns.byId, boardId]
  );

  // Apply layout
  const layoutedNodes = useMemo(
    () => applyDagreLayout(rawNodes, rawEdges, 'TB'),
    [rawNodes, rawEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawEdges);

  // Sync when store changes
  useEffect(() => {
    setNodes(layoutedNodes);
  }, [layoutedNodes]);

  useEffect(() => {
    setEdges(rawEdges);
  }, [rawEdges]);

  function onNodeClick(_: React.MouseEvent, node: TaskNode) {
    selectCard(node.id);
  }

  return (
    <div className="flex-1 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{ type: 'dependency' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls className="!bg-zinc-900 !border-white/[0.06]" />
        <MiniMap
          nodeColor={node => {
            const d = node.data as TaskNodeData;
            if (d.card.status === 'done') return '#22c55e';
            if (d.isBlocked) return '#f59e0b';
            if (d.card.status === 'in-progress') return '#3b82f6';
            return '#52525b';
          }}
          className="!bg-zinc-900 !border-white/[0.06]"
        />
      </ReactFlow>
    </div>
  );
}

export function FlowchartView({ boardId }: { boardId: string }) {
  return (
    // ReactFlowProvider must wrap components that call useReactFlow()
    <ReactFlowProvider>
      <FlowchartInner boardId={boardId} />
    </ReactFlowProvider>
  );
}
```

---

## 7. Toolbar Controls for the Flowchart View

```tsx
function FlowchartToolbar({
  direction,
  onDirectionChange,
}: {
  direction: 'TB' | 'LR';
  onDirectionChange: (d: 'TB' | 'LR') => void;
}) {
  const { fitView } = useReactFlow();

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
      {/* Layout direction toggle */}
      <div className="flex items-center gap-0.5 bg-zinc-900/90 backdrop-blur rounded-lg p-0.5
                      border border-white/[0.06]">
        <button
          onClick={() => onDirectionChange('TB')}
          className={`px-2 py-1 rounded text-xs ${direction === 'TB' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'}`}
        >
          Top→Bottom
        </button>
        <button
          onClick={() => onDirectionChange('LR')}
          className={`px-2 py-1 rounded text-xs ${direction === 'LR' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'}`}
        >
          Left→Right
        </button>
      </div>

      {/* Fit view */}
      <button
        onClick={() => fitView({ padding: 0.15, duration: 300 })}
        className="bg-zinc-900/90 backdrop-blur border border-white/[0.06] rounded-lg
                   px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
      >
        Fit view
      </button>

      {/* Filter: show only blocked subgraph */}
      <BlockedSubgraphToggle />
    </div>
  );
}
```

---

## 8. Filtering: Show Only Blocked Subgraph

A powerful view: show only the cards that are blocked and their blockers, revealing the critical path.

```typescript
export function buildBlockedSubgraph(
  state: KanbanStore,
  boardId: string
): { nodes: TaskNode[]; edges: TaskEdge[] } {
  const full = buildFlowGraph(state, boardId);

  // Find all cards that are currently blocked
  const blockedCardIds = new Set(
    Object.values(state.cards.byId)
      .filter(c => c.boardId === boardId && isCardBlocked(c, state.cards.byId))
      .map(c => c.id)
  );

  // Walk backwards — include all ancestors of blocked cards (their blockers' blockers etc)
  const includedIds = new Set<string>(blockedCardIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of full.edges) {
      if (includedIds.has(edge.target) && !includedIds.has(edge.source)) {
        includedIds.add(edge.source);
        changed = true;
      }
    }
  }

  return {
    nodes: full.nodes.filter(n => includedIds.has(n.id)),
    edges: full.edges.filter(e => includedIds.has(e.source) && includedIds.has(e.target)),
  };
}
```

---

## 9. Shared Data Flow Summary

```
┌──────────────────────────────────────────────────────────────┐
│                     Zustand Store                            │
│  cards.byId, columns.byId, boards.byId                       │
│  ui.viewMode = 'kanban' | 'flowchart'                        │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────────┐
│   Kanban Board View  │            │    Flowchart View        │
│                      │            │                          │
│  columns × cards     │            │  buildFlowGraph()        │
│  dnd-kit DnD         │  ──same──► │    → TaskNode[]          │
│  moveCard() action   │    store   │    → TaskEdge[]          │
│                      │            │  applyDagreLayout()      │
│  selectCard() opens  │            │  @xyflow/react           │
│  CardDetailSidebar   │            │  onNodeClick → selectCard│
└─────────────────────┘            └─────────────────────────┘
           │                                  │
           └──────────┬───────────────────────┘
                      ▼
           ┌──────────────────────┐
           │  CardDetailSidebar   │
           │  (shared component)  │
           │  Opens on selectCard │
           │  in both views       │
           └──────────────────────┘
```

**Key points:**
1. `buildFlowGraph` is a pure function — it reads from the store and returns RF nodes/edges. No side effects.
2. `applyDagreLayout` is also pure — it takes nodes/edges and returns repositioned nodes.
3. Mutations (editing a card title, moving between columns) only happen through store actions.
4. From the flowchart view, users cannot drag cards between columns — the flowchart is read-only except for clicking to open card detail. Column changes only happen via the kanban view.
5. The card detail sidebar is mounted at the root level and shared between both views.

---

## 10. Dependency Graph Validation

Before adding a dependency edge (either from card detail sidebar or by connecting nodes in the flowchart), validate:

```typescript
// Call this before store.addDependency()
function validateNewDependency(
  fromCardId: string,
  toCardId: string,
  type: CardDependency['type'],
  cardsById: Record<string, KanbanCard>
): { valid: boolean; reason?: string } {
  if (fromCardId === toCardId) {
    return { valid: false, reason: 'A card cannot depend on itself.' };
  }

  if (type === 'blocks' || type === 'blocked-by') {
    // Check for cycle
    if (wouldCreateCycle(fromCardId, toCardId, cardsById)) {
      return { valid: false, reason: 'This dependency would create a circular blocking relationship.' };
    }

    // Check for existing inverse dependency
    const from = cardsById[fromCardId];
    if (from?.blocks.includes(toCardId) || from?.blockedBy.includes(toCardId)) {
      return { valid: false, reason: 'A dependency between these cards already exists.' };
    }
  }

  return { valid: true };
}
```

---

## 11. Making the Flowchart Editable (Optional)

If you want users to create dependencies by dragging edges in the flowchart:

```tsx
import { addEdge, Connection } from '@xyflow/react';

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target) return;

  const validation = validateNewDependency(
    connection.source,
    connection.target,
    'blocks',
    storeState.cards.byId
  );

  if (!validation.valid) {
    toast.error(validation.reason);
    return;
  }

  store.addDependency(connection.source, connection.target, 'blocks');
  // The edge will appear automatically on next render via buildFlowGraph()
}

// In ReactFlow:
<ReactFlow
  onConnect={onConnect}
  connectionMode={ConnectionMode.Loose}
  // ...
/>
```

---

## 12. Performance Notes

- **memoize buildFlowGraph** — use `useMemo` with `cards.byId` and `columns.byId` as dependencies. With 200 cards this is trivially fast.
- **dagre layout is synchronous** — fine for up to ~500 nodes. Above that, switch to ELK.js (async).
- **React Flow virtualization** — React Flow renders only visible nodes. Works well for large graphs.
- **Avoid re-running layout on every render** — only re-run when the graph topology changes (card added/removed, dependency added/removed). Card field edits (title, description) should NOT trigger layout.

```typescript
// Fine-grained memo dependency — only topology matters, not card content
const topologyHash = useMemo(() => {
  const cards = Object.values(storeState.cards.byId)
    .filter(c => c.boardId === boardId)
    .map(c => `${c.id}:${c.columnId}:${c.blockedBy.join(',')}:${c.blocks.join(',')}`)
    .sort()
    .join('|');
  return cards;
}, [storeState.cards.byId, boardId]);

const { nodes: rawNodes, edges: rawEdges } = useMemo(
  () => buildFlowGraph(storeState, boardId),
  [topologyHash]
);
```

---

## Sources

- [React Flow Custom Nodes](https://reactflow.dev/learn/customization/custom-nodes)
- [React Flow Custom Edges](https://reactflow.dev/learn/customization/custom-edges)
- [React Flow Edge Labels](https://reactflow.dev/learn/customization/edge-labels)
- [React Flow Dagre Layout Example](https://reactflow.dev/examples/layout/dagre)
- [Nicholas Coughlin: React Flow + Dagre + Custom Nodes](https://ncoughlin.com/posts/react-flow-dagre-custom-nodes)
- [Task Graph & Dependencies (ClaudeWorld)](https://claude-world.com/tutorials/s07-task-graph-and-dependencies/)
- [Kubeflow: Modernizing Pipelines UI with xyflow](https://blog.kubeflow.org/modernizing-kubeflow-pipelines-ui/)
- [dagre npm](https://www.npmjs.com/package/dagre)
- [@xyflow/react npm](https://www.npmjs.com/package/@xyflow/react)
