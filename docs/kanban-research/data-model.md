# Kanban Data Model — TypeScript Interfaces & Zustand Store

---

## 1. Core Entity Types

### 1.1 Card

The most complex entity. Fields are designed to cover everything a production task card needs.

```typescript
// Priority levels — numeric for easy comparison/sorting
export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

// Card status mirrors the column's status key
export type CardStatus = string; // e.g. 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'

export interface CardLabel {
  id: string;
  name: string;
  color: string; // hex or tailwind color token
}

export interface CardAssignee {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string; // ISO 8601
}

export interface CardComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  body: string;       // markdown text
  createdAt: string;  // ISO 8601
  updatedAt?: string;
}

export interface CardAttachment {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByUserId: string;
}

// A dependency edge: "this card blocks another card"
// Stored on both cards as blockedBy / blocks for O(1) lookup
export interface CardDependency {
  cardId: string;       // the other card
  type: 'blocks' | 'blocked-by' | 'relates-to' | 'duplicates';
}

export interface KanbanCard {
  // Identity
  id: string;
  title: string;
  description: string;    // markdown

  // Workflow
  status: CardStatus;     // mirrors columnId's status key
  columnId: string;       // which column this card is in
  boardId: string;
  swimlaneId?: string;    // optional swimlane grouping
  order: number;          // fractional indexing or integer position within column

  // Metadata
  priority: Priority;
  labels: CardLabel[];
  assignees: CardAssignee[];
  estimatePoints?: number;  // story points
  progress?: number;        // 0–100, computed from subtasks or manual

  // Dates
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;

  // Content
  subtasks: Subtask[];
  comments: CardComment[];
  attachments: CardAttachment[];

  // Dependencies — dual-linked for fast lookup
  blockedBy: string[];   // array of card IDs this card is waiting on
  blocks: string[];      // array of card IDs that are waiting on this card

  // For Problocks: link to AI tool connector nodes
  linkedNodeIds?: string[];  // IDs of nodes on the studio canvas

  // UI state (not persisted, derived)
  // isBlocked and isReady are computed properties, not stored
}
```

**Computed derived state** (compute in selectors, not stored):

```typescript
export function isCardBlocked(card: KanbanCard, cardsById: Record<string, KanbanCard>): boolean {
  return card.blockedBy.some(depId => {
    const dep = cardsById[depId];
    return dep && dep.status !== 'done';
  });
}

export function isCardReady(card: KanbanCard, cardsById: Record<string, KanbanCard>): boolean {
  return card.blockedBy.every(depId => {
    const dep = cardsById[depId];
    return !dep || dep.status === 'done';
  });
}

export function isCardOverdue(card: KanbanCard): boolean {
  if (!card.dueDate || card.status === 'done') return false;
  return new Date(card.dueDate) < new Date();
}

export function getSubtaskProgress(card: KanbanCard): number {
  if (card.subtasks.length === 0) return 0;
  const done = card.subtasks.filter(s => s.completed).length;
  return Math.round((done / card.subtasks.length) * 100);
}
```

---

### 1.2 Column

```typescript
export interface KanbanColumn {
  id: string;
  boardId: string;
  title: string;
  status: string;         // maps to CardStatus — cards in this column have this status
  color?: string;         // accent color for column header
  order: number;          // display order left-to-right
  cardIds: string[];      // ordered list of card IDs in this column
  wipLimit?: number;      // max cards allowed; null = unlimited
  isCollapsed?: boolean;  // column can be collapsed to an icon strip
}
```

---

### 1.3 Swimlane

```typescript
export interface KanbanSwimlane {
  id: string;
  boardId: string;
  title: string;
  order: number;
  color?: string;
  isCollapsed?: boolean;
}
```

---

### 1.4 Board

```typescript
export interface KanbanBoard {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  memberIds: string[];

  // Ordered references — actual entities live in normalized slices
  columnIds: string[];    // ordered column IDs
  swimlaneIds: string[];  // ordered swimlane IDs; empty array = no swimlanes

  // Display config
  backgroundImage?: string;
  backgroundColor?: string;

  // Feature flags per board
  features: {
    swimlanes: boolean;
    wipLimits: boolean;
    priorities: boolean;
    estimates: boolean;
    dependencies: boolean;
  };

  createdAt: string;
  updatedAt: string;
}
```

---

### 1.5 User (minimal — for assignees)

```typescript
export interface BoardUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}
```

---

## 2. Normalized State Shape

Use the **byId / allIds** pattern from Redux best practices. This is the correct approach for Zustand as well: it prevents duplication, enables O(1) lookups, and minimizes re-renders (updating a single card only touches `cardsById[id]`, not the entire board tree).

```typescript
export interface NormalizedEntities<T> {
  byId: Record<string, T>;
  allIds: string[];
}

export interface KanbanState {
  // Normalized entity tables
  boards: NormalizedEntities<KanbanBoard>;
  columns: NormalizedEntities<KanbanColumn>;
  cards: NormalizedEntities<KanbanCard>;
  swimlanes: NormalizedEntities<KanbanSwimlane>;
  users: NormalizedEntities<BoardUser>;

  // UI state (not persisted to backend)
  ui: {
    activeBoardId: string | null;
    selectedCardId: string | null;        // card detail modal open
    dragActiveCardId: string | null;      // card being dragged
    dragActiveColumnId: string | null;    // column being dragged
    filterState: CardFilterState;
    sortState: CardSortState;
    viewMode: 'kanban' | 'flowchart' | 'list' | 'calendar';
    isLoading: boolean;
    error: string | null;
  };
}

export interface CardFilterState {
  search: string;
  assigneeIds: string[];
  labelIds: string[];
  priorities: Priority[];
  showBlockedOnly: boolean;
  dueDateRange?: { from: string; to: string };
}

export interface CardSortState {
  field: 'order' | 'priority' | 'dueDate' | 'createdAt' | 'title';
  direction: 'asc' | 'desc';
}
```

---

## 3. Zustand Store

### 3.1 Store Definition

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import type { KanbanState, KanbanCard, KanbanColumn } from './types';

// Split actions from state for organization
interface KanbanActions {
  // Board actions
  setActiveBoard: (boardId: string) => void;

  // Card CRUD
  addCard: (card: KanbanCard) => void;
  updateCard: (cardId: string, patch: Partial<KanbanCard>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex: number) => void;

  // Column CRUD
  addColumn: (column: KanbanColumn) => void;
  updateColumn: (columnId: string, patch: Partial<KanbanColumn>) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (columnId: string, toIndex: number) => void;

  // Dependency management
  addDependency: (fromCardId: string, toCardId: string, type: CardDependency['type']) => void;
  removeDependency: (fromCardId: string, toCardId: string) => void;

  // UI state
  selectCard: (cardId: string | null) => void;
  setViewMode: (mode: KanbanState['ui']['viewMode']) => void;
  setFilter: (filter: Partial<CardFilterState>) => void;
  setDragActive: (cardId: string | null, columnId: string | null) => void;
}

type KanbanStore = KanbanState & KanbanActions;

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      boards: { byId: {}, allIds: [] },
      columns: { byId: {}, allIds: [] },
      cards: { byId: {}, allIds: [] },
      swimlanes: { byId: {}, allIds: [] },
      users: { byId: {}, allIds: [] },
      ui: {
        activeBoardId: null,
        selectedCardId: null,
        dragActiveCardId: null,
        dragActiveColumnId: null,
        filterState: { search: '', assigneeIds: [], labelIds: [], priorities: [], showBlockedOnly: false },
        sortState: { field: 'order', direction: 'asc' },
        viewMode: 'kanban',
        isLoading: false,
        error: null,
      },

      // ── Card actions ──────────────────────────────────────────────

      addCard: (card) => set(state => {
        state.cards.byId[card.id] = card;
        state.cards.allIds.push(card.id);
        // Add to column's cardIds at the end
        state.columns.byId[card.columnId]?.cardIds.push(card.id);
      }),

      updateCard: (cardId, patch) => set(state => {
        if (state.cards.byId[cardId]) {
          Object.assign(state.cards.byId[cardId], patch);
          state.cards.byId[cardId].updatedAt = new Date().toISOString();
        }
      }),

      deleteCard: (cardId) => set(state => {
        const card = state.cards.byId[cardId];
        if (!card) return;

        // Remove from column
        const col = state.columns.byId[card.columnId];
        if (col) col.cardIds = col.cardIds.filter(id => id !== cardId);

        // Clean up dependencies on other cards
        card.blockedBy.forEach(depId => {
          const dep = state.cards.byId[depId];
          if (dep) dep.blocks = dep.blocks.filter(id => id !== cardId);
        });
        card.blocks.forEach(depId => {
          const dep = state.cards.byId[depId];
          if (dep) dep.blockedBy = dep.blockedBy.filter(id => id !== cardId);
        });

        delete state.cards.byId[cardId];
        state.cards.allIds = state.cards.allIds.filter(id => id !== cardId);
      }),

      moveCard: (cardId, toColumnId, toIndex) => set(state => {
        const card = state.cards.byId[cardId];
        if (!card) return;

        const fromCol = state.columns.byId[card.columnId];
        const toCol = state.columns.byId[toColumnId];
        if (!fromCol || !toCol) return;

        // Remove from source column
        fromCol.cardIds = fromCol.cardIds.filter(id => id !== cardId);

        // Insert into target column at toIndex
        toCol.cardIds.splice(toIndex, 0, cardId);

        // Update card's columnId and status
        card.columnId = toColumnId;
        card.status = toCol.status;
        card.updatedAt = new Date().toISOString();
      }),

      // ── Column actions ────────────────────────────────────────────

      addColumn: (column) => set(state => {
        state.columns.byId[column.id] = column;
        state.columns.allIds.push(column.id);
        const board = state.boards.byId[column.boardId];
        if (board) board.columnIds.push(column.id);
      }),

      updateColumn: (columnId, patch) => set(state => {
        if (state.columns.byId[columnId]) {
          Object.assign(state.columns.byId[columnId], patch);
        }
      }),

      deleteColumn: (columnId) => set(state => {
        const col = state.columns.byId[columnId];
        if (!col) return;

        // Move all cards to first available column or delete them
        // (caller decides — this implementation deletes the cards)
        col.cardIds.forEach(cardId => {
          delete state.cards.byId[cardId];
          state.cards.allIds = state.cards.allIds.filter(id => id !== cardId);
        });

        const board = state.boards.byId[col.boardId];
        if (board) board.columnIds = board.columnIds.filter(id => id !== columnId);

        delete state.columns.byId[columnId];
        state.columns.allIds = state.columns.allIds.filter(id => id !== columnId);
      }),

      moveColumn: (columnId, toIndex) => set(state => {
        const col = state.columns.byId[columnId];
        if (!col) return;
        const board = state.boards.byId[col.boardId];
        if (!board) return;
        const fromIndex = board.columnIds.indexOf(columnId);
        if (fromIndex === -1) return;
        board.columnIds.splice(fromIndex, 1);
        board.columnIds.splice(toIndex, 0, columnId);
      }),

      // ── Dependency actions ────────────────────────────────────────

      addDependency: (fromCardId, toCardId, type) => set(state => {
        const from = state.cards.byId[fromCardId];
        const to = state.cards.byId[toCardId];
        if (!from || !to) return;

        if (type === 'blocked-by') {
          if (!from.blockedBy.includes(toCardId)) from.blockedBy.push(toCardId);
          if (!to.blocks.includes(fromCardId)) to.blocks.push(fromCardId);
        } else if (type === 'blocks') {
          if (!from.blocks.includes(toCardId)) from.blocks.push(toCardId);
          if (!to.blockedBy.includes(fromCardId)) to.blockedBy.push(fromCardId);
        }
        // 'relates-to' and 'duplicates' are symmetric
      }),

      removeDependency: (fromCardId, toCardId) => set(state => {
        const from = state.cards.byId[fromCardId];
        const to = state.cards.byId[toCardId];
        if (from) {
          from.blockedBy = from.blockedBy.filter(id => id !== toCardId);
          from.blocks = from.blocks.filter(id => id !== toCardId);
        }
        if (to) {
          to.blockedBy = to.blockedBy.filter(id => id !== fromCardId);
          to.blocks = to.blocks.filter(id => id !== fromCardId);
        }
      }),

      // ── UI actions ────────────────────────────────────────────────

      setActiveBoard: (boardId) => set(state => { state.ui.activeBoardId = boardId; }),
      selectCard: (cardId) => set(state => { state.ui.selectedCardId = cardId; }),
      setViewMode: (mode) => set(state => { state.ui.viewMode = mode; }),
      setDragActive: (cardId, columnId) => set(state => {
        state.ui.dragActiveCardId = cardId;
        state.ui.dragActiveColumnId = columnId;
      }),
      setFilter: (filter) => set(state => {
        Object.assign(state.ui.filterState, filter);
      }),
    })),
    { name: 'kanban-store' }
  )
);
```

---

### 3.2 Selectors

Define selectors outside the store. They take the store state and compute derived data. Use these in components rather than accessing `byId` maps directly — this keeps component code clean and makes memoization easier.

```typescript
// Get all columns for the active board in display order
export function selectActiveColumns(state: KanbanStore): KanbanColumn[] {
  const boardId = state.ui.activeBoardId;
  if (!boardId) return [];
  const board = state.boards.byId[boardId];
  if (!board) return [];
  return board.columnIds
    .map(id => state.columns.byId[id])
    .filter(Boolean);
}

// Get cards for a column, in order, with filters applied
export function selectColumnCards(
  state: KanbanStore,
  columnId: string
): KanbanCard[] {
  const col = state.columns.byId[columnId];
  if (!col) return [];
  const { filterState, sortState } = state.ui;

  let cards = col.cardIds
    .map(id => state.cards.byId[id])
    .filter(Boolean);

  // Text search
  if (filterState.search) {
    const q = filterState.search.toLowerCase();
    cards = cards.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }

  // Priority filter
  if (filterState.priorities.length > 0) {
    cards = cards.filter(c => filterState.priorities.includes(c.priority));
  }

  // Assignee filter
  if (filterState.assigneeIds.length > 0) {
    cards = cards.filter(c =>
      c.assignees.some(a => filterState.assigneeIds.includes(a.id))
    );
  }

  // Blocked only
  if (filterState.showBlockedOnly) {
    cards = cards.filter(c =>
      isCardBlocked(c, state.cards.byId)
    );
  }

  // Sort (if not using drag order)
  if (sortState.field !== 'order') {
    cards = [...cards].sort((a, b) => {
      const dir = sortState.direction === 'asc' ? 1 : -1;
      if (sortState.field === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * dir;
      }
      if (sortState.field === 'dueDate') {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return (aDate - bDate) * dir;
      }
      if (sortState.field === 'title') {
        return a.title.localeCompare(b.title) * dir;
      }
      return 0;
    });
  }

  return cards;
}

// Get the selected card (for detail modal)
export function selectSelectedCard(state: KanbanStore): KanbanCard | null {
  return state.ui.selectedCardId
    ? state.cards.byId[state.ui.selectedCardId] ?? null
    : null;
}

// Get dependency info for a card (for blocked badge / flowchart)
export function selectCardDependencies(
  state: KanbanStore,
  cardId: string
): { blockers: KanbanCard[]; blocking: KanbanCard[] } {
  const card = state.cards.byId[cardId];
  if (!card) return { blockers: [], blocking: [] };
  return {
    blockers: card.blockedBy.map(id => state.cards.byId[id]).filter(Boolean),
    blocking: card.blocks.map(id => state.cards.byId[id]).filter(Boolean),
  };
}

// WIP limit check
export function selectColumnWipStatus(
  state: KanbanStore,
  columnId: string
): { count: number; limit: number | null; isOver: boolean } {
  const col = state.columns.byId[columnId];
  if (!col) return { count: 0, limit: null, isOver: false };
  const count = col.cardIds.length;
  const limit = col.wipLimit ?? null;
  return { count, limit, isOver: limit !== null && count > limit };
}
```

---

### 3.3 Store Initialization (Loading from API)

When loading from a backend, normalize the nested response first, then bulk-set it into the store.

```typescript
// Assuming API returns nested structure: { board, columns: [...], cards: [...] }
export async function loadBoard(boardId: string, store: KanbanStore) {
  store.ui.isLoading = true;

  const response = await fetch(`/api/boards/${boardId}`);
  const data = await response.json();

  // Build normalized shape manually (or use normalizr)
  const cardsById: Record<string, KanbanCard> = {};
  const columnsById: Record<string, KanbanColumn> = {};

  for (const col of data.columns) {
    columnsById[col.id] = { ...col, cardIds: [] };
  }

  for (const card of data.cards) {
    cardsById[card.id] = card;
    columnsById[card.columnId]?.cardIds.push(card.id);
  }

  // Sort cardIds by card.order
  for (const col of Object.values(columnsById)) {
    col.cardIds.sort((a, b) =>
      (cardsById[a]?.order ?? 0) - (cardsById[b]?.order ?? 0)
    );
  }

  useKanbanStore.setState(state => {
    state.boards.byId[data.board.id] = data.board;
    if (!state.boards.allIds.includes(data.board.id)) {
      state.boards.allIds.push(data.board.id);
    }
    Object.assign(state.columns.byId, columnsById);
    state.columns.allIds = Object.keys(columnsById);
    Object.assign(state.cards.byId, cardsById);
    state.cards.allIds = Object.keys(cardsById);
    state.ui.activeBoardId = data.board.id;
    state.ui.isLoading = false;
  });
}
```

---

### 3.4 Optimistic Updates Pattern

For drag operations, update state immediately and sync to backend async. Roll back on failure.

```typescript
export async function moveCardOptimistic(
  store: ReturnType<typeof useKanbanStore.getState>,
  cardId: string,
  toColumnId: string,
  toIndex: number
) {
  // Snapshot for rollback
  const prevColumnId = store.cards.byId[cardId]?.columnId;
  const prevCardIds = [...(store.columns.byId[prevColumnId ?? '']?.cardIds ?? [])];
  const prevToCardIds = [...(store.columns.byId[toColumnId]?.cardIds ?? [])];

  // Optimistic update
  useKanbanStore.getState().moveCard(cardId, toColumnId, toIndex);

  try {
    await fetch(`/api/cards/${cardId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId: toColumnId, order: toIndex }),
    });
  } catch {
    // Rollback
    useKanbanStore.setState(state => {
      if (prevColumnId) {
        state.columns.byId[prevColumnId].cardIds = prevCardIds;
        state.columns.byId[toColumnId].cardIds = prevToCardIds;
        state.cards.byId[cardId].columnId = prevColumnId;
        state.cards.byId[cardId].status = state.columns.byId[prevColumnId].status;
      }
    });
  }
}
```

---

## 4. Dependency Data Model Deep Dive

The dependency relationship is a directed edge: `A blocks B` means B is waiting on A.

```
A ──blocks──► B
B ◄──blockedBy── A
```

Store it as dual arrays for O(1) lookup:
- `A.blocks = ['B']`
- `B.blockedBy = ['A']`

**Why not store edges separately?** For a kanban board, the total number of dependencies per card is small (typically 1–5). Storing them on the card avoids a join query when loading card detail. The flowchart view (React Flow) derives its edges from this data at render time.

**Detecting blocked state efficiently:**

```typescript
// Called when computing card badge. O(k) where k = blockedBy.length
function isBlocked(card: KanbanCard, cardsById: Record<string, KanbanCard>): boolean {
  return card.blockedBy.some(id => cardsById[id]?.status !== 'done');
}
```

**Preventing circular dependencies:**

```typescript
function wouldCreateCycle(
  fromId: string,
  toId: string,
  cardsById: Record<string, KanbanCard>
): boolean {
  // BFS from toId following .blocks edges — if we reach fromId, it's a cycle
  const visited = new Set<string>();
  const queue = [toId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === fromId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const card = cardsById[current];
    if (card) card.blocks.forEach(id => queue.push(id));
  }
  return false;
}
```

---

## 5. Example Seed Data

```typescript
const seedData: { board: KanbanBoard; columns: KanbanColumn[]; cards: KanbanCard[] } = {
  board: {
    id: 'board-1',
    title: 'Game Development Sprint',
    ownerId: 'user-1',
    memberIds: ['user-1'],
    columnIds: ['col-backlog', 'col-todo', 'col-inprogress', 'col-done'],
    swimlaneIds: [],
    features: { swimlanes: false, wipLimits: true, priorities: true, estimates: false, dependencies: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  columns: [
    { id: 'col-backlog', boardId: 'board-1', title: 'Backlog', status: 'backlog', order: 0, cardIds: [], wipLimit: null },
    { id: 'col-todo', boardId: 'board-1', title: 'To Do', status: 'todo', order: 1, cardIds: [], wipLimit: 5 },
    { id: 'col-inprogress', boardId: 'board-1', title: 'In Progress', status: 'in-progress', order: 2, cardIds: [], wipLimit: 3 },
    { id: 'col-done', boardId: 'board-1', title: 'Done', status: 'done', order: 3, cardIds: [], wipLimit: null },
  ],
  cards: [
    {
      id: 'card-1', title: 'Design tilemap editor UI', description: 'Wire up tile palette + viewport',
      status: 'in-progress', columnId: 'col-inprogress', boardId: 'board-1', order: 0,
      priority: 'high', labels: [], assignees: [], subtasks: [], comments: [], attachments: [],
      blockedBy: [], blocks: ['card-2'],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: 'card-2', title: 'Implement wang-tile generator', description: 'Use simplex noise for terrain blending',
      status: 'todo', columnId: 'col-todo', boardId: 'board-1', order: 0,
      priority: 'medium', labels: [], assignees: [], subtasks: [], comments: [], attachments: [],
      blockedBy: ['card-1'], blocks: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
  ],
};
```

---

## Sources

- [Redux: Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Entity Adapter pattern (DEV Community)](https://dev.to/michaeljota/zustand-entityadapter-an-entityadapter-example-for-zustand-cd2)
- [DHTMLX Kanban card config](https://docs.dhtmlx.com/kanban/api/config/js_kanban_cards_config/)
- [Kanban card anatomy (Wrike)](https://www.wrike.com/kanban-guide/kanban-cards/)
- [Task Graph & Dependencies (ClaudeWorld)](https://claude-world.com/tutorials/s07-task-graph-and-dependencies/)
